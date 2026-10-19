/**
 * CraftEgon CCS - Account & Authentication Repository
 * Provides server-backed account management, password authentication, and session handling
 * Supports both PostgresAccountStorage and InMemoryAccountStorage
 */

const crypto = require('node:crypto');
const {
  validatePassword,
  hashPassword,
  verifyPassword,
  validateAccountData,
  generateSessionToken,
  generateRecoveryToken,
  hashToken
} = require('../models/account.model');

class InMemoryAccountStorage {
  constructor() {
    this.accounts = new Map();     // id -> account
    this.credentials = new Map();  // email -> { account_id, password_hash, password_salt, failed_attempts, locked_until, recovery_token_hash, recovery_token_expires_at }
    this.sessions = new Map();     // token_hash -> session
    this.lastResetToken = null;    // For automated test verification hook
  }

  reset() {
    this.accounts.clear();
    this.credentials.clear();
    this.sessions.clear();
    this.lastResetToken = null;
  }

  async createAccount(data) {
    const val = validateAccountData(data);
    if (!val.valid) {
      const err = new Error(val.errors[0].issue);
      err.statusCode = 400;
      err.errors = val.errors;
      throw err;
    }

    const email = data.primary_email.trim().toLowerCase();
    if (this.credentials.has(email)) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    let passwordHash = null;
    let passwordSalt = null;

    if (data.password) {
      const pVal = validatePassword(data.password);
      if (!pVal.valid) {
        const err = new Error(pVal.message);
        err.statusCode = 400;
        throw err;
      }
      const hashed = hashPassword(data.password);
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    } else {
      // Default initial synthetic password for accounts created without explicit password
      const hashed = hashPassword('TempPass123!');
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    }

    const id = data.id || crypto.randomUUID();
    const account = {
      id,
      auth_user_id: data.auth_user_id || id,
      legal_entity_name: data.legal_entity_name || 'Individual Client',
      cin_llpin: data.cin_llpin || null,
      primary_email: email,
      primary_phone: data.primary_phone || '+91 9876543210',
      account_role: data.account_role || 'client',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.accounts.set(id, account);
    try {
      const { memoryStore } = require('./memory-store');
      memoryStore.accounts.set(id, account);
    } catch (e) {}
    this.credentials.set(email, {
      account_id: id,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      failed_attempts: 0,
      locked_until: null,
      recovery_token_hash: null,
      recovery_token_expires_at: null
    });

    return account;
  }

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    for (const acc of this.accounts.values()) {
      if (acc.primary_email.toLowerCase() === cleanEmail) {
        return acc;
      }
    }
    return null;
  }

  async findById(id, context = {}) {
    if (!id) return null;
    const account = this.accounts.get(id);
    if (!account) return null;

    // RLS: Client can only view their own account; staff can view all
    if (context.userId && context.role) {
      const isOwner = context.userId === account.id || context.userId === account.auth_user_id;
      const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
      if (!isOwner && !isStaff) return null;
    }

    return account;
  }

  async authenticate(email, password, ipHash = null) {
    if (!email || !password) {
      return { authenticated: false, reason: 'MISSING_CREDENTIALS' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cred = this.credentials.get(cleanEmail);
    if (!cred) {
      // Safe generic failure
      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    // Check account lockout
    if (cred.locked_until && new Date() < new Date(cred.locked_until)) {
      const err = new Error('Account is temporarily locked due to multiple failed login attempts. Please reset your password or try again later.');
      err.statusCode = 429;
      throw err;
    }

    const valid = verifyPassword(password, cred.password_hash, cred.password_salt);
    if (!valid) {
      cred.failed_attempts = (cred.failed_attempts || 0) + 1;
      if (cred.failed_attempts >= 5) {
        cred.locked_until = new Date(Date.now() + (15 * 60 * 1000)).toISOString(); // 15 mins lock
      }
      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    // Reset failed attempts on success
    cred.failed_attempts = 0;
    cred.locked_until = null;

    const account = this.accounts.get(cred.account_id);
    return { authenticated: true, account };
  }

  async createPasswordResetToken(email) {
    if (!email) return { success: true };
    const cleanEmail = email.trim().toLowerCase();
    const cred = this.credentials.get(cleanEmail);
    if (!cred) {
      return { success: true }; // Do not disclose whether email exists
    }

    const { rawToken, tokenHash } = generateRecoveryToken();
    cred.recovery_token_hash = tokenHash;
    cred.recovery_token_expires_at = new Date(Date.now() + (60 * 60 * 1000)).toISOString(); // 1 hour
    this.lastResetToken = rawToken;

    return { success: true, token: rawToken };
  }

  async resetPassword(rawToken, newPassword) {
    if (!rawToken || !newPassword) {
      const err = new Error('Token and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const pVal = validatePassword(newPassword);
    if (!pVal.valid) {
      const err = new Error(pVal.message);
      err.statusCode = 400;
      throw err;
    }

    const tokenHash = hashToken(rawToken);
    let targetCred = null;

    for (const cred of this.credentials.values()) {
      if (cred.recovery_token_hash === tokenHash) {
        targetCred = cred;
        break;
      }
    }

    if (!targetCred) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      throw err;
    }

    if (new Date() > new Date(targetCred.recovery_token_expires_at)) {
      targetCred.recovery_token_hash = null;
      targetCred.recovery_token_expires_at = null;
      const err = new Error('Password reset token has expired. Please request a new one.');
      err.statusCode = 400;
      throw err;
    }

    const hashed = hashPassword(newPassword);
    targetCred.password_hash = hashed.hash;
    targetCred.password_salt = hashed.salt;
    targetCred.recovery_token_hash = null;
    targetCred.recovery_token_expires_at = null;
    targetCred.failed_attempts = 0;
    targetCred.locked_until = null;

    // Invalidate all active sessions for this account
    await this.revokeAllUserSessions(targetCred.account_id);

    return { success: true, message: 'Password updated successfully' };
  }

  async createSession(account, meta = {}, ttlSeconds = 86400) {
    const { rawToken, tokenHash } = generateSessionToken();
    const expiresAt = new Date(Date.now() + (ttlSeconds * 1000)).toISOString();

    const session = {
      id: crypto.randomUUID(),
      account_id: account.id,
      role: account.account_role || 'client',
      legal_entity_name: account.legal_entity_name || 'Individual Client',
      cin_llpin: account.cin_llpin || null,
      email: account.primary_email,
      ip_hash: meta.ipHash || null,
      user_agent: meta.userAgent || null,
      expires_at: expiresAt,
      revoked_at: null,
      created_at: new Date().toISOString()
    };

    this.sessions.set(tokenHash, session);
    return { token: rawToken, session };
  }

  async verifySession(rawToken) {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);
    const session = this.sessions.get(tokenHash);
    if (!session) return null;

    if (session.revoked_at) {
      return null;
    }

    if (new Date() > new Date(session.expires_at)) {
      this.sessions.delete(tokenHash);
      return null;
    }

    return {
      user_id: session.account_id,
      account_id: session.account_id,
      role: session.role,
      legal_entity_name: session.legal_entity_name,
      cin_llpin: session.cin_llpin,
      email: session.email,
      expires_at: session.expires_at
    };
  }

  async revokeSession(rawToken) {
    if (!rawToken) return false;
    const tokenHash = hashToken(rawToken);
    const session = this.sessions.get(tokenHash);
    if (session) {
      session.revoked_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  async revokeAllUserSessions(accountId) {
    if (!accountId) return 0;
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.account_id === accountId && !session.revoked_at) {
        session.revoked_at = new Date().toISOString();
        count++;
      }
    }
    return count;
  }
}

class PostgresAccountStorage {
  constructor(pgClient) {
    this.client = pgClient;
    this.lastResetToken = null;
  }

  async executeQuery(text, params = []) {
    if (!this.client) {
      throw new Error('POSTGRES_CLIENT_UNAVAILABLE: Cannot query PostgreSQL without active client');
    }

    let formattedSql = text;
    params.forEach((val, idx) => {
      let sqlVal = 'NULL';
      if (val !== null && val !== undefined) {
        if (typeof val === 'boolean') {
          sqlVal = val ? 'true' : 'false';
        } else if (typeof val === 'number') {
          sqlVal = String(val);
        } else {
          sqlVal = `'${String(val).replace(/'/g, "''")}'`;
        }
      }
      const placeholder = new RegExp(`\\$${idx + 1}(?![0-9])`, 'g');
      formattedSql = formattedSql.replace(placeholder, sqlVal);
    });

    formattedSql = formattedSql.replace(/;\s*$/, '');
    const isMutation = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(formattedSql);
    const hasReturning = /\bRETURNING\b/i.test(formattedSql);
    if (isMutation && !hasReturning) {
      formattedSql += ' RETURNING *';
    }

    const jsonSql = `WITH q AS (${formattedSql}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q;`;
    const raw = this.client.query(jsonSql);
    try {
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end >= start) {
        return JSON.parse(raw.slice(start, end + 1));
      }
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  async createAccount(data) {
    const val = validateAccountData(data);
    if (!val.valid) {
      const err = new Error(val.errors[0].issue);
      err.statusCode = 400;
      err.errors = val.errors;
      throw err;
    }

    const email = data.primary_email.trim().toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    let passwordHash = null;
    let passwordSalt = null;

    if (data.password) {
      const pVal = validatePassword(data.password);
      if (!pVal.valid) {
        const err = new Error(pVal.message);
        err.statusCode = 400;
        throw err;
      }
      const hashed = hashPassword(data.password);
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    } else {
      const hashed = hashPassword('TempPass123!');
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    }

    const accountId = data.id || crypto.randomUUID();
    const authUserId = data.auth_user_id || accountId;

    // 1. Insert Client Account
    const accQuery = `
      INSERT INTO client_accounts (
        id, auth_user_id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *;
    `;
    const accRows = await this.executeQuery(accQuery, [
      accountId,
      authUserId,
      data.legal_entity_name || 'Individual Client',
      data.cin_llpin || null,
      email,
      data.primary_phone || '+91 9876543210',
      data.account_role || 'client',
      data.is_active !== false
    ]);

    const createdAccount = accRows[0];

    // 2. Insert Auth Credentials
    const credQuery = `
      INSERT INTO auth_credentials (
        account_id, email, password_hash, password_salt
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id;
    `;
    await this.executeQuery(credQuery, [
      accountId,
      email,
      passwordHash,
      passwordSalt
    ]);

    return createdAccount;
  }

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const query = `SELECT * FROM client_accounts WHERE LOWER(primary_email) = $1 LIMIT 1;`;
    const rows = await this.executeQuery(query, [cleanEmail]);
    return rows[0] || null;
  }

  async findById(id, context = {}) {
    if (!id) return null;
    let query = `SELECT * FROM client_accounts WHERE id = $1 LIMIT 1;`;
    const rows = await this.executeQuery(query, [id]);
    const account = rows[0] || null;
    if (!account) return null;

    if (context.userId && context.role) {
      const isOwner = context.userId === account.id || context.userId === account.auth_user_id;
      const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
      if (!isOwner && !isStaff) return null;
    }

    return account;
  }

  async authenticate(email, password, ipHash = null) {
    if (!email || !password) {
      return { authenticated: false, reason: 'MISSING_CREDENTIALS' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const query = `
      SELECT ac.*, ca.legal_entity_name, ca.cin_llpin, ca.account_role, ca.is_active, ca.id AS client_account_id
      FROM auth_credentials ac
      JOIN client_accounts ca ON ca.id = ac.account_id
      WHERE LOWER(ac.email) = $1
      LIMIT 1;
    `;
    const rows = await this.executeQuery(query, [cleanEmail]);
    const cred = rows[0];

    if (!cred) {
      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    if (cred.locked_until && new Date() < new Date(cred.locked_until)) {
      const err = new Error('Account is temporarily locked due to multiple failed login attempts. Please reset your password or try again later.');
      err.statusCode = 429;
      throw err;
    }

    const valid = verifyPassword(password, cred.password_hash, cred.password_salt);
    if (!valid) {
      const newAttempts = (cred.failed_attempts || 0) + 1;
      let lockClause = '';
      if (newAttempts >= 5) {
        lockClause = `, locked_until = CURRENT_TIMESTAMP + INTERVAL '15 minutes'`;
      }
      await this.executeQuery(`
        UPDATE auth_credentials
        SET failed_attempts = $1 ${lockClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [newAttempts, cred.id]);

      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    // Reset failed attempts on success
    await this.executeQuery(`
      UPDATE auth_credentials
      SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [cred.id]);

    const account = {
      id: cred.client_account_id,
      auth_user_id: cred.client_account_id,
      legal_entity_name: cred.legal_entity_name,
      cin_llpin: cred.cin_llpin,
      primary_email: cred.email,
      account_role: cred.account_role,
      is_active: cred.is_active
    };

    return { authenticated: true, account };
  }

  async createPasswordResetToken(email) {
    if (!email) return { success: true };
    const cleanEmail = email.trim().toLowerCase();
    const rows = await this.executeQuery(`SELECT id FROM auth_credentials WHERE LOWER(email) = $1;`, [cleanEmail]);
    if (!rows[0]) {
      return { success: true };
    }

    const { rawToken, tokenHash } = generateRecoveryToken();
    await this.executeQuery(`
      UPDATE auth_credentials
      SET recovery_token_hash = $1,
          recovery_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `, [tokenHash, rows[0].id]);

    this.lastResetToken = rawToken;
    return { success: true, token: rawToken };
  }

  async resetPassword(rawToken, newPassword) {
    if (!rawToken || !newPassword) {
      const err = new Error('Token and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const pVal = validatePassword(newPassword);
    if (!pVal.valid) {
      const err = new Error(pVal.message);
      err.statusCode = 400;
      throw err;
    }

    const tokenHash = hashToken(rawToken);
    const query = `
      SELECT id, account_id, recovery_token_expires_at
      FROM auth_credentials
      WHERE recovery_token_hash = $1
      LIMIT 1;
    `;
    const rows = await this.executeQuery(query, [tokenHash]);
    const cred = rows[0];

    if (!cred) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      throw err;
    }

    if (new Date() > new Date(cred.recovery_token_expires_at)) {
      await this.executeQuery(`
        UPDATE auth_credentials
        SET recovery_token_hash = NULL, recovery_token_expires_at = NULL
        WHERE id = $1;
      `, [cred.id]);
      const err = new Error('Password reset token has expired. Please request a new one.');
      err.statusCode = 400;
      throw err;
    }

    const hashed = hashPassword(newPassword);
    await this.executeQuery(`
      UPDATE auth_credentials
      SET password_hash = $1,
          password_salt = $2,
          recovery_token_hash = NULL,
          recovery_token_expires_at = NULL,
          failed_attempts = 0,
          locked_until = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3;
    `, [hashed.hash, hashed.salt, cred.id]);

    // Invalidate sessions
    await this.revokeAllUserSessions(cred.account_id);

    return { success: true, message: 'Password updated successfully' };
  }

  async createSession(account, meta = {}, ttlSeconds = 86400) {
    const { rawToken, tokenHash } = generateSessionToken();
    const query = `
      INSERT INTO auth_sessions (
        session_token_hash, account_id, role, ip_hash, user_agent, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, CURRENT_TIMESTAMP + ($6 || ' seconds')::interval
      ) RETURNING *;
    `;
    const rows = await this.executeQuery(query, [
      tokenHash,
      account.id,
      account.account_role || 'client',
      meta.ipHash || null,
      meta.userAgent || null,
      String(ttlSeconds)
    ]);

    const session = rows[0];
    return {
      token: rawToken,
      session: {
        id: session.id,
        account_id: account.id,
        role: session.role,
        legal_entity_name: account.legal_entity_name,
        cin_llpin: account.cin_llpin,
        email: account.primary_email,
        expires_at: session.expires_at
      }
    };
  }

  async verifySession(rawToken) {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);
    const query = `
      SELECT s.id AS session_id, s.account_id, s.role, s.expires_at, s.revoked_at,
             ca.legal_entity_name, ca.cin_llpin, ca.primary_email, ca.is_active
      FROM auth_sessions s
      JOIN client_accounts ca ON ca.id = s.account_id
      WHERE s.session_token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;
    const rows = await this.executeQuery(query, [tokenHash]);
    const session = rows[0];
    if (!session) return null;

    return {
      user_id: session.account_id,
      account_id: session.account_id,
      role: session.role,
      legal_entity_name: session.legal_entity_name,
      cin_llpin: session.cin_llpin,
      email: session.primary_email,
      expires_at: session.expires_at
    };
  }

  async revokeSession(rawToken) {
    if (!rawToken) return false;
    const tokenHash = hashToken(rawToken);
    const query = `
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE session_token_hash = $1 AND revoked_at IS NULL
      RETURNING id;
    `;
    const rows = await this.executeQuery(query, [tokenHash]);
    return rows.length > 0;
  }

  async revokeAllUserSessions(accountId) {
    if (!accountId) return 0;
    const query = `
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE account_id = $1 AND revoked_at IS NULL
      RETURNING id;
    `;
    const rows = await this.executeQuery(query, [accountId]);
    return rows.length;
  }
}

class AccountRepository {
  constructor(storageAdapter = null) {
    this.adapter = storageAdapter || new InMemoryAccountStorage();
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  createAccount(data) {
    return this.adapter.createAccount(data);
  }

  findByEmail(email) {
    return this.adapter.findByEmail(email);
  }

  findById(id, context) {
    return this.adapter.findById(id, context);
  }

  authenticate(email, password, ipHash) {
    return this.adapter.authenticate(email, password, ipHash);
  }

  createPasswordResetToken(email) {
    return this.adapter.createPasswordResetToken(email);
  }

  resetPassword(rawToken, newPassword) {
    return this.adapter.resetPassword(rawToken, newPassword);
  }

  createSession(account, meta, ttlSeconds) {
    return this.adapter.createSession(account, meta, ttlSeconds);
  }

  verifySession(rawToken) {
    return this.adapter.verifySession(rawToken);
  }

  revokeSession(rawToken) {
    return this.adapter.revokeSession(rawToken);
  }

  revokeAllUserSessions(accountId) {
    return this.adapter.revokeAllUserSessions(accountId);
  }
}

const accountRepository = new AccountRepository();

module.exports = {
  AccountRepository,
  accountRepository,
  InMemoryAccountStorage,
  PostgresAccountStorage
};
