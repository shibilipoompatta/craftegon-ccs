/**
 * CraftEgon CCS - Account & Authentication Model
 * Password hashing via scrypt, token generation, and account validation
 * Pure Node.js built-ins. Zero external dependencies.
 */

const crypto = require('node:crypto');

const VALID_ROLES = ['client', 'compliance_operator', 'managing_partner'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-]{10,15}$/;

/**
 * Validates password complexity
 * Requires at least 8 characters, with letters and numbers
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters in length' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter and one number' };
  }
  return { valid: true };
}

/**
 * Generates a secure scrypt password hash with a unique cryptographic salt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const hashHex = derivedKey.toString('hex');
  return {
    salt,
    hash: `scrypt:${salt}:${hashHex}`
  };
}

/**
 * Verifies a password against a stored scrypt hash using constant-time comparison
 */
function verifyPassword(password, storedHash, storedSalt) {
  if (!password || !storedHash) return false;

  try {
    const parts = storedHash.split(':');
    let salt = storedSalt;
    let expectedHashHex = storedHash;

    if (parts.length === 3 && parts[0] === 'scrypt') {
      salt = parts[1];
      expectedHashHex = parts[2];
    }

    if (!salt) return false;

    const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const expectedBuffer = Buffer.from(expectedHashHex, 'hex');
    if (derivedKey.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Validates account registration/creation data
 */
function validateAccountData(data) {
  const errors = [];

  if (!data.primary_email || !EMAIL_REGEX.test(String(data.primary_email).trim())) {
    errors.push({ field: 'primary_email', issue: 'Valid email address is required' });
  }

  if (data.primary_phone && !PHONE_REGEX.test(String(data.primary_phone).trim())) {
    errors.push({ field: 'primary_phone', issue: 'Valid phone number is required' });
  }

  if (data.account_role && !VALID_ROLES.includes(data.account_role)) {
    errors.push({ field: 'account_role', issue: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }

  if (data.legal_entity_name && String(data.legal_entity_name).trim().length < 2) {
    errors.push({ field: 'legal_entity_name', issue: 'Legal entity name must be at least 2 characters' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates an unpredictable session token and its SHA-256 hash
 */
function generateSessionToken() {
  const rawToken = `cct_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Generates an unpredictable single-use password recovery token and its SHA-256 hash
 */
function generateRecoveryToken() {
  const rawToken = `rst_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Hashes a token using SHA-256 for secure storage (never store raw tokens in DB)
 */
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = {
  VALID_ROLES,
  validatePassword,
  hashPassword,
  verifyPassword,
  validateAccountData,
  generateSessionToken,
  generateRecoveryToken,
  hashToken
};
