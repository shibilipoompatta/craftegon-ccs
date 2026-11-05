/**
 * CraftEgon CCS - Authentication Controller
 * Real server-side authentication, scrypt password verification, session issuance, and account recovery
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const { authenticate, requireAuth, revokeSessionToken } = require('../middleware/auth-guard');
const { accountRepository } = require('../storage/account-repository');
const { emailService } = require('../email/email-service');
const crypto = require('node:crypto');

function hashIp(ip, salt) {
  return crypto.createHash('sha256').update(`${salt}:${ip || '127.0.0.1'}`).digest('hex');
}

async function handleLogin(req, res, config, body) {
  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Request body must be a valid JSON object'
    }));
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Email address is required'
    }));
  }

  if (typeof body.password !== 'string' || body.password.trim().length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Password is required'
    }));
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password);
  const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const ipHash = hashIp(ip, config.ipHashSalt || 'craftegon-local-salt');

  try {
    const authResult = await accountRepository.authenticate(email, password, ipHash);
    if (!authResult.authenticated) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Unauthorized',
        message: authResult.reason === 'ACCOUNT_INACTIVE' ? 'Account is pending email verification or has been deactivated. Please verify your email or contact support.' : 'Invalid email or password'
      }));
    }

    const account = authResult.account;
    const { token, session } = await accountRepository.createSession(
      account,
      { ipHash, userAgent: req.headers['user-agent'] },
      config.sessionDurationSeconds || 86400
    );

    const secureFlag = config.isProd ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `craftegon_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${config.sessionDurationSeconds || 86400}${secureFlag}`
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      token,
      user: {
        id: account.id,
        email: account.primary_email,
        role: account.account_role,
        legal_entity_name: account.legal_entity_name,
        cin_llpin: account.cin_llpin || null
      }
    }));
  } catch (err) {
    const status = err.statusCode || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: status === 429 ? 'Too Many Requests' : 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleLogout(req, res) {
  const auth = await authenticate(req);
  if (auth.authenticated && auth.token) {
    await revokeSessionToken(auth.token);
  }

  res.setHeader('Set-Cookie', 'craftegon_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Session terminated' }));
}

async function handleMe(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const account = await accountRepository.findById(user.user_id, { userId: user.user_id, role: user.role });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    user: {
      id: user.user_id,
      email: user.email,
      role: user.role,
      legal_entity_name: user.legal_entity_name,
      cin_llpin: user.cin_llpin || null,
      account_details: account
    }
  }));
}

async function handleForgotPassword(req, res, config, body) {
  if (!body || !body.email || typeof body.email !== 'string' || !body.email.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Email address is required'
    }));
  }

  const cleanEmail = String(body.email).trim().toLowerCase();
  const responsePayload = {
    success: true,
    message: 'If an account matches that email address, recovery options will be provided when available.'
  };

  // Only dispatch email if delivery is configured / enabled in environment
  if (emailService.isDeliveryConfigured()) {
    try {
      const resetResult = await accountRepository.createPasswordResetToken(cleanEmail);
      if (resetResult && resetResult.token) {
        const account = await accountRepository.findByEmail(cleanEmail);
        await emailService.sendPasswordRecovery({
          to: cleanEmail,
          name: account ? account.legal_entity_name : 'Client',
          token: resetResult.token,
          expiresAt: resetResult.expiresAt || new Date(Date.now() + 3600000).toISOString()
        });
      }
    } catch (err) {
      // Safe catch: zero enumeration, no internal leak
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responsePayload));
}

async function handleResetPassword(req, res, config, body) {
  if (!body || !body.token || !body.new_password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Both reset token and new password are required'
    }));
  }

  try {
    const result = await accountRepository.resetPassword(body.token, body.new_password);
    res.setHeader('Set-Cookie', 'craftegon_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Password has been successfully updated. Please log in with your new password.'
    }));
  } catch (err) {
    const status = err.statusCode || 400;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: status === 400 ? 'Bad Request' : 'Internal Server Error',
      message: err.message
    }));
  }
}

async function handleRegister(req, res, config, body) {
  if (config.isProd) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Direct registration is restricted in production. Contact CraftEgon compliance desk for account onboarding.'
    }));
  }

  if (!body || !body.primary_email || !body.password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Both primary_email and password are required'
    }));
  }

  // DEF-001: Public registration must ALWAYS create an account with account_role: 'client'.
  // Caller-supplied account_role, role, isAdmin, permissions are strictly ignored.
  const requiresVerification = Boolean(config.requireEmailVerification);
  const clientData = {
    legal_entity_name: typeof body.legal_entity_name === 'string' && body.legal_entity_name.trim()
      ? body.legal_entity_name.trim()
      : 'Individual Client',
    cin_llpin: typeof body.cin_llpin === 'string' && body.cin_llpin.trim()
      ? body.cin_llpin.trim()
      : null,
    primary_email: String(body.primary_email).trim().toLowerCase(),
    primary_phone: typeof body.primary_phone === 'string' && body.primary_phone.trim()
      ? body.primary_phone.trim()
      : '+91 9876543210',
    password: String(body.password),
    account_role: 'client',
    is_active: !requiresVerification
  };

  try {
    const account = await accountRepository.createAccount(clientData, { isPublicRegistration: true });

    if (requiresVerification) {
      const { rawToken, expiresAt } = await accountRepository.createVerificationToken(
        account.id,
        config.verificationTokenTtlSeconds || 86400
      );

      if (emailService.isDeliveryConfigured()) {
        try {
          await emailService.sendRegistrationVerification({
            to: account.primary_email,
            name: account.legal_entity_name,
            token: rawToken,
            expiresAt
          });
        } catch (emailErr) {
          // Safe catch: account created in inactive state, verification can be resent
        }
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Account registered successfully. Please verify your email address to activate your account.',
        requires_verification: true,
        account: {
          id: account.id,
          email: account.primary_email,
          role: account.account_role,
          account_role: account.account_role,
          legal_entity_name: account.legal_entity_name,
          cin_llpin: account.cin_llpin || null,
          is_active: false
        }
      }));
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      account: {
        id: account.id,
        email: account.primary_email,
        role: account.account_role,
        account_role: account.account_role,
        legal_entity_name: account.legal_entity_name,
        cin_llpin: account.cin_llpin || null
      }
    }));
  } catch (err) {
    const status = err.statusCode || 400;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: status === 409 ? 'Conflict' : 'Bad Request',
      message: err.message
    }));
  }
}

/**
 * Dedicated Authenticated Staff Provisioning Endpoint
 * Restricted strictly to authenticated managing_partner
 */
async function handleProvisionStaff(req, res, config, body) {
  const user = await requireAuth(req, res, ['managing_partner']);
  if (!user) return; // requireAuth handled 401/403 response

  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Request body must be a valid JSON object' }));
  }

  const email = body.primary_email ? String(body.primary_email).trim().toLowerCase() : '';
  const password = body.password ? String(body.password) : '';
  const role = body.account_role ? String(body.account_role).trim() : '';

  if (!email || !password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Both primary_email and password are required' }));
  }

  // Permit only explicitly supported staff roles
  if (!['compliance_operator', 'managing_partner'].includes(role)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: "account_role must be either 'compliance_operator' or 'managing_partner'"
    }));
  }

  const staffData = {
    legal_entity_name: typeof body.legal_entity_name === 'string' && body.legal_entity_name.trim()
      ? body.legal_entity_name.trim()
      : 'CraftEgon Compliance Operations Desk',
    cin_llpin: null,
    primary_email: email,
    primary_phone: typeof body.primary_phone === 'string' && body.primary_phone.trim()
      ? body.primary_phone.trim()
      : '+91 86069 18247',
    account_role: role,
    password
  };

  try {
    const staffAccount = await accountRepository.createAccount(staffData, { role: 'managing_partner' });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Staff account provisioned successfully',
      staff: {
        id: staffAccount.id,
        email: staffAccount.primary_email,
        role: staffAccount.account_role,
        account_role: staffAccount.account_role,
        legal_entity_name: staffAccount.legal_entity_name,
        is_active: staffAccount.is_active,
        created_at: staffAccount.created_at
      },
      account: {
        id: staffAccount.id,
        email: staffAccount.primary_email,
        role: staffAccount.account_role,
        account_role: staffAccount.account_role,
        legal_entity_name: staffAccount.legal_entity_name,
        is_active: staffAccount.is_active,
        created_at: staffAccount.created_at
      }
    }));
  } catch (err) {
    const status = err.statusCode || 400;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: status === 409 ? 'Conflict' : 'Bad Request',
      message: err.message
    }));
  }
}


async function handleVerifyEmail(req, res, config, token) {
  if (!token || typeof token !== 'string' || !token.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Verification token is required'
    }));
  }

  try {
    const result = await accountRepository.verifyEmailToken(token.trim());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Email address verified successfully. Your account is now active. You may now log in.'
    }));
  } catch (err) {
    const status = err.statusCode || 400;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Request',
      message: err.message
    }));
  }
}

async function handleResendVerification(req, res, config, body) {
  if (!body || !body.email || typeof body.email !== 'string' || !body.email.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Email address is required'
    }));
  }

  const email = String(body.email).trim().toLowerCase();
  const responsePayload = {
    success: true,
    message: 'If an unverified account matches that email address, a new verification link has been sent.'
  };

  if (emailService.isDeliveryConfigured()) {
    try {
      const resendResult = await accountRepository.resendVerificationToken(
        email,
        config.verificationTokenTtlSeconds || 86400
      );
      if (resendResult && resendResult.token) {
        await emailService.sendRegistrationVerification({
          to: email,
          name: resendResult.account?.legal_entity_name || 'Client',
          token: resendResult.token,
          expiresAt: resendResult.expiresAt
        });
      }
    } catch (e) {
      // Safe catch: zero enumeration
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responsePayload));
}

module.exports = {
  handleLogin,
  handleLogout,
  handleMe,
  handleForgotPassword,
  handleResetPassword,
  handleRegister,
  handleProvisionStaff,
  handleVerifyEmail,
  handleResendVerification
};
