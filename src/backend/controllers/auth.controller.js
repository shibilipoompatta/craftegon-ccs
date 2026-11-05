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
        message: 'Invalid email or password'
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

  // NOTE: Automated password recovery is intentionally disabled at this public endpoint
  // until an approved outbound email delivery provider and secure recovery workflow
  // are implemented. To prevent orphaned token generation and false delivery claims,
  // no reset token is generated or persisted here.
  const responsePayload = {
    success: true,
    message: 'If an account matches that email address, recovery options will be provided when available.'
  };

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
    account_role: 'client'
  };

  try {
    const account = await accountRepository.createAccount(clientData, { isPublicRegistration: true });
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

module.exports = {
  handleLogin,
  handleLogout,
  handleMe,
  handleForgotPassword,
  handleResetPassword,
  handleRegister,
  handleProvisionStaff
};
