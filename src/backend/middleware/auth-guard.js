/**
 * CraftEgon CCS - Authentication Guard & Role Enforcer
 * Validates session tokens and enforces role-based permissions
 * Pure Node.js built-ins. Zero external dependencies.
 */

const { accountRepository } = require('../storage/account-repository');

function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // Check Cookie header
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const match = cookieHeader.match(/craftegon_session=([^;]+)/);
    if (match) return match[1].trim();
  }

  return null;
}

async function issueSessionToken(account, ttlSeconds = 86400, meta = {}) {
  return await accountRepository.createSession(account, meta, ttlSeconds);
}

async function revokeSessionToken(token) {
  if (!token) return false;
  return await accountRepository.revokeSession(token);
}

async function verifySessionToken(token) {
  if (!token) return null;
  return await accountRepository.verifySession(token);
}

async function authenticate(req) {
  const token = extractToken(req);
  if (!token) {
    return { authenticated: false, user: null };
  }

  const session = await accountRepository.verifySession(token);
  if (!session) {
    return { authenticated: false, user: null, reason: 'INVALID_OR_EXPIRED_TOKEN' };
  }

  return { authenticated: true, user: session, token };
}

async function requireAuth(req, res, allowedRoles = []) {
  const auth = await authenticate(req);
  if (!auth.authenticated) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Unauthorized',
      message: 'Valid authentication session required to access this endpoint'
    }));
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Forbidden',
      message: `Role '${auth.user.role}' is not authorized to perform this operation`,
      required_roles: allowedRoles
    }));
    return null;
  }

  return auth.user;
}

function clearSessionTokens() {
  if (accountRepository.adapter && typeof accountRepository.adapter.reset === 'function') {
    accountRepository.adapter.reset();
  }
}

module.exports = {
  extractToken,
  issueSessionToken,
  revokeSessionToken,
  verifySessionToken,
  authenticate,
  requireAuth,
  clearSessionTokens
};
