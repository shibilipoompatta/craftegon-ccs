/**
 * CraftEgon CCS - Authentication Controller
 * Real server-side authentication, scrypt password verification, session issuance, and account recovery
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const { authenticate, requireAuth, revokeSessionToken } = require('../middleware/auth-guard');
const { accountRepository } = require('../storage/account-repository');
const crypto = require('node:crypto');

function hashIp(ip, salt) {
  return crypto.createHash('sha256').update(`${salt}:${ip || '127.0.0.1'}`).digest('hex');
}

async function handleLogin(req, res, config, body) {
  // CRITICAL SECURITY GUARD: Synthetic authentication is strictly disabled in production.
  if ((config.isProd || config.env === 'production') && (!body || !body.password)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Synthetic authentication is strictly disabled in production. Authenticate via managed provider (Supabase GoTrue).'
    }));
  }

  if (!body || !body.email) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Email address is required'
    }));
  }

  const email = String(body.email).trim().toLowerCase();
  const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const ipHash = hashIp(ip, config.ipHashSalt || 'craftegon-local-salt');

  try {
    let account = null;

    if (body.password) {
      // 1. Explicit Password Authentication Flow
      const authResult = await accountRepository.authenticate(email, String(body.password), ipHash);
      if (!authResult.authenticated) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        }));
      }
      account = authResult.account;
    } else {
      // 2. Local/Test Synthetic Account Provisioning Flow (Non-Production Only)
      account = await accountRepository.findByEmail(email);
      if (!account) {
        account = await accountRepository.createAccount({
          primary_email: email,
          legal_entity_name: body.legal_entity_name || 'Acme Compliance Client Pvt Ltd',
          cin_llpin: body.cin_llpin || 'U72900KA2024PTC123456',
          primary_phone: body.phone || '+91 9876543210',
          account_role: body.role || 'client',
          password: 'SyntheticTestPass123!'
        });
      }
    }

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
  if (!body || !body.email) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Email address is required'
    }));
  }

  const email = String(body.email).trim().toLowerCase();
  const result = await accountRepository.createPasswordResetToken(email);

  const responsePayload = {
    success: true,
    message: 'If an account matches that email address, password recovery instructions have been dispatched.'
  };

  // In test environment, expose the reset token securely in response for automated verification
  if (config.isTest && result.token) {
    responsePayload._test_reset_token = result.token;
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

  try {
    const account = await accountRepository.createAccount(body);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      account: {
        id: account.id,
        email: account.primary_email,
        role: account.account_role,
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

module.exports = {
  handleLogin,
  handleLogout,
  handleMe,
  handleForgotPassword,
  handleResetPassword,
  handleRegister
};
