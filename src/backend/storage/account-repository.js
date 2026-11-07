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
  generateVerificationToken,
  hashToken
} = require('../models/account.model');

class InMemoryAccountStorage {
  constructor() {
    this.accounts = new Map();     // id -> account
    this.credentials = new Map();  // email -> { account_id, password_hash, password_salt, failed_attempts, locked_until, recovery_token_hash, recovery_token_expires_at }
    this.sessions = new Map();     // token_hash -> session
    this.verificationTokens = new Map(); // token_hash -> verification
  }

  reset() {
    this.accounts.clear();
    this.credentials.clear();
    this.sessions.clear();
    if (this.verificationTokens) this.verificationTokens.clear();
  }

  async createAccount(data, context = {}) {
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

    if (data.password !== undefined && data.password !== null) {
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
      // Explicitly mark local password authentication disabled.
      // Never assigns a usable default password.
      passwordHash = '!DISABLED:NO_LOCAL_PASSWORD';
      passwordSalt = 'disabled';
    }

    // DEF-001 / DEF-008: Strict role privilege gate in repository
    let assignedRole = 'client';
    const isManagingPartner = context && context.role === 'managing_partner';
    const isInternalBootstrap = context && context.isInternalBootstrap === true;

    if (data.account_role && data.account_role !== 'client') {
      if (!isManagingPartner && !isInternalBootstrap) {
        assignedRole = 'client';
      } else {
        if (['compliance_operator', 'managing_partner'].includes(data.account_role)) {
          assignedRole = data.account_role;
        } else {
          const err = new Error(`Unsupported or invalid staff role: ${data.account_role}`);
          err.statusCode = 400;
          throw err;
        }
      }
    }

    const id = data.id || crypto.randomUUID();
    const account = {
      id,
      auth_user_id: data.auth_user_id || id,
      legal_entity_name: data.legal_entity_name || 'Individual Client',
      cin_llpin: data.cin_llpin || null,
      primary_email: email,
      primary_phone: data.primary_phone || '+91 9876543210',
      account_role: assignedRole,
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

  async listStaff(context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only staff can list operational staff');
      err.statusCode = 403;
      throw err;
    }
    const staff = [];
    for (const acc of this.accounts.values()) {
      if (['compliance_operator', 'managing_partner'].includes(acc.account_role) && acc.is_active !== false) {
        staff.push({
          id: acc.id,
          legal_entity_name: acc.legal_entity_name,
          primary_email: acc.primary_email,
          account_role: acc.account_role
        });
      }
    }
    return staff;
  }

  async authenticate(email, password, ipHash = null) {
    if (!email || !password || typeof password !== 'string' || password.length === 0) {
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

    // Reject disabled local-auth credentials or malformed hash format safely
    if (!cred.password_hash || typeof cred.password_hash !== 'string' || !cred.password_hash.startsWith('scrypt:')) {
      return { authenticated: false, reason: 'LOCAL_AUTH_DISABLED' };
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
    // DEF-007: Account deactivation enforcement at login
    if (!account || account.is_active === false) {
      if (account) {
        await this.revokeAllUserSessions(account.id);
      }
      return { authenticated: false, reason: 'ACCOUNT_INACTIVE' };
    }

    return { authenticated: true, account };
  }

  async createPasswordResetToken(email) {
    if (!email || typeof email !== 'string') return { success: true };
    const cleanEmail = email.trim().toLowerCase();
    const cred = this.credentials.get(cleanEmail);
    if (!cred) {
      return { success: true }; // Do not disclose whether email exists
    }

    const { rawToken, tokenHash } = generateRecoveryToken();
    cred.recovery_token_hash = tokenHash;
    cred.recovery_token_expires_at = new Date(Date.now() + (60 * 60 * 1000)).toISOString(); // 1 hour

    return { success: true, token: rawToken, tokenHash: tokenHash };
  }

  async invalidatePasswordResetTokenByHash(email, tokenHash) {
    if (!email || !tokenHash || typeof email !== 'string' || typeof tokenHash !== 'string') {
      return { success: true, invalidated: false };
    }
    const cleanEmail = email.trim().toLowerCase();
    const cred = this.credentials.get(cleanEmail);
    if (cred && cred.recovery_token_hash === tokenHash) {
      cred.recovery_token_hash = null;
      cred.recovery_token_expires_at = null;
      return { success: true, invalidated: true };
    }
    return { success: true, invalidated: false };
  }

  async rotatePassword(accountId, newPassword) {
    if (!accountId || !newPassword) {
      const err = new Error('Account ID and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const pVal = validatePassword(newPassword);
    if (!pVal.valid) {
      const err = new Error(pVal.message);
      err.statusCode = 400;
      throw err;
    }

    let targetCred = null;
    for (const cred of this.credentials.values()) {
      if (cred.account_id === accountId) {
        targetCred = cred;
        break;
      }
    }

    if (!targetCred) {
      const err = new Error('Account credential record not found');
      err.statusCode = 404;
      throw err;
    }

    const hashed = hashPassword(newPassword);
    targetCred.password_hash = hashed.hash;
    targetCred.password_salt = hashed.salt;
    targetCred.recovery_token_hash = null;
    targetCred.recovery_token_expires_at = null;
    targetCred.failed_attempts = 0;
    targetCred.locked_until = null;

    await this.revokeAllUserSessions(accountId);

    return { success: true, message: 'Password rotated successfully' };
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
    if (!account || account.is_active === false) {
      const err = new Error('Cannot issue session to inactive or non-existent account');
      err.statusCode = 403;
      throw err;
    }

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

    // DEF-007: Server-side account status check on every authenticated request
    const account = this.accounts.get(session.account_id);
    if (!account || account.is_active === false) {
      session.revoked_at = new Date().toISOString();
      await this.revokeAllUserSessions(session.account_id);
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
      if (session.account_id === accountId && session.user_agent !== 'VERIFICATION_TOKEN' && !session.revoked_at) {
        session.revoked_at = new Date().toISOString();
        count++;
      }
    }
    return count;
  }


  async createVerificationToken(accountId, ttlSeconds = 86400) {
    if (!accountId) {
      const err = new Error('Account ID is required to generate verification token');
      err.statusCode = 400;
      throw err;
    }
    const account = this.accounts.get(accountId);
    if (!account) {
      const err = new Error('Account not found');
      err.statusCode = 404;
      throw err;
    }

    const { rawToken, tokenHash } = generateVerificationToken();
    const expiresAt = new Date(Date.now() + (ttlSeconds * 1000)).toISOString();

    // Invalidate any prior active verification tokens for this account
    for (const record of this.verificationTokens.values()) {
      if (record.account_id === accountId && !record.revoked_at) {
        record.revoked_at = new Date().toISOString();
      }
    }

    this.verificationTokens.set(tokenHash, {
      id: crypto.randomUUID(),
      account_id: accountId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked_at: null,
      created_at: new Date().toISOString()
    });

    return { rawToken, tokenHash, expiresAt };
  }

  async verifyEmailToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      const err = new Error('Verification token is required');
      err.statusCode = 400;
      throw err;
    }

    const tokenHash = hashToken(rawToken);
    const record = this.verificationTokens.get(tokenHash);

    if (!record) {
      const err = new Error('Invalid or expired verification token');
      err.statusCode = 400;
      throw err;
    }

    if (record.revoked_at) {
      const err = new Error('Verification token has already been used or is invalid');
      err.statusCode = 400;
      throw err;
    }

    if (new Date() > new Date(record.expires_at)) {
      const err = new Error('Verification token has expired. Please request a new verification email.');
      err.statusCode = 400;
      throw err;
    }

    // Single-use: atomically consume token
    record.revoked_at = new Date().toISOString();

    // Activate account
    const account = this.accounts.get(record.account_id);
    if (!account) {
      const err = new Error('Associated account not found');
      err.statusCode = 404;
      throw err;
    }

    account.is_active = true;
    account.updated_at = new Date().toISOString();

    return {
      success: true,
      accountId: account.id,
      email: account.primary_email,
      message: 'Account verified and activated successfully'
    };
  }

  async resendVerificationToken(email, ttlSeconds = 86400) {
    if (!email || typeof email !== 'string') {
      return { success: true };
    }
    const cleanEmail = email.trim().toLowerCase();
    const account = await this.findByEmail(cleanEmail);
    if (!account || account.is_active) {
      return { success: true }; // Zero account enumeration
    }

    const tokenRes = await this.createVerificationToken(account.id, ttlSeconds);
    return {
      success: true,
      account,
      token: tokenRes.rawToken,
      tokenHash: tokenRes.tokenHash,
      expiresAt: tokenRes.expiresAt
    };
  }

  async setAccountActiveStatus(accountId, isActive, context) {
    if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
      const err = new Error('Account ID is required');
      err.statusCode = 400;
      throw err;
    }

    if (typeof isActive !== 'boolean') {
      const err = new Error('Invalid status value: isActive must be a boolean (true or false)');
      err.statusCode = 400;
      throw err;
    }

    const ctx = (context && typeof context === 'object') ? context : {};
    const isManagingPartner = ctx.role === 'managing_partner';
    const isInternalBootstrap = ctx.isInternalBootstrap === true;

    if (!isManagingPartner && !isInternalBootstrap) {
      const err = new Error('FORBIDDEN: Only Managing Partner or genuine internal bootstrap can modify account active status');
      err.statusCode = 403;
      throw err;
    }

    const account = this.accounts.get(accountId);
    if (!account) {
      const err = new Error('Account not found');
      err.statusCode = 404;
      throw err;
    }

    account.is_active = isActive;
    account.updated_at = new Date().toISOString();

    try {
      const { memoryStore } = require('./memory-store');
      if (memoryStore.accounts && memoryStore.accounts.has(accountId)) {
        memoryStore.accounts.get(accountId).is_active = isActive;
        memoryStore.accounts.get(accountId).updated_at = account.updated_at;
      }
    } catch (e) {}

    // DEF-007 Requirement 4: Invalidate all existing sessions when deactivating
    if (account.is_active === false) {
      await this.revokeAllUserSessions(accountId);
    }

    return {
      id: account.id,
      primary_email: account.primary_email,
      account_role: account.account_role,
      is_active: account.is_active,
      updated_at: account.updated_at
    };
  }

  async deactivateAccount(accountId, context) {
    return this.setAccountActiveStatus(accountId, false, context);
  }
}

class PostgresAccountStorage {
  constructor(pgClient, options = {}) {
    this.client = pgClient;
    this.authClient = options.authPool || options.authClient || pgClient;
    this.govClient = options.govPool || options.govClient || pgClient;
  }

  async executeAuthQuery(text, params = [], context = {}) {
    const client = this.authClient || this.client;
    if (client.isPool || typeof client.queryAsync === 'function' || client.constructor?.name === 'Pool' || client.constructor?.name === 'BoundPool' || client.constructor?.name === 'PostgresPool') {
      const result = await client.query(text, params, context);
      return Array.isArray(result) ? result : (result.rows || []);
    }
    return this.executeQuery(text, params, context);
  }

  async executeGovQuery(text, params = [], context = {}) {
    const client = this.govClient || this.client;
    if (client.isPool || typeof client.queryAsync === 'function' || client.constructor?.name === 'Pool' || client.constructor?.name === 'BoundPool' || client.constructor?.name === 'PostgresPool') {
      const result = await client.query(text, params, context);
      return Array.isArray(result) ? result : (result.rows || []);
    }
    return this.executeQuery(text, params, context);
  }
  async executeQuery(text, params = [], context = {}) {
    if (!this.client) {
      throw new Error('POSTGRES_CLIENT_UNAVAILABLE: Cannot query PostgreSQL without active client');
    }

    // 1. Native asynchronous connection pool (PostgresPool or pg.Pool)
    if (this.client.isPool || typeof this.client.queryAsync === 'function' || this.client.constructor?.name === 'Pool' || this.client.constructor?.name === 'BoundPool' || this.client.constructor?.name === 'PostgresPool') {
      const result = await this.client.query(text, params, context);
      return Array.isArray(result) ? result : (result.rows || []);
    }

    // 2. Fallback for test fixtures and legacy synchronous mock runners
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
      const placeholder = new RegExp('\\$' + (idx + 1) + '(?![0-9])', 'g');
      formattedSql = formattedSql.replace(placeholder, sqlVal);
    });

    formattedSql = formattedSql.replace(/;\s*$/, '');
    const isMutation = /^\s*(INSERT|UPDATE|DELETE|WITH)\b/i.test(formattedSql);
    const hasReturning = /\bRETURNING\b/i.test(formattedSql);
    if (isMutation && !hasReturning && !/^\s*WITH\b/i.test(formattedSql)) {
      formattedSql += ' RETURNING *';
    }

    const jsonSql = `WITH q AS (${formattedSql}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q;`;
    const raw = await this.client.query(jsonSql);
    if (typeof raw === 'object' && raw !== null && Array.isArray(raw.rows)) {
      return raw.rows;
    }
    if (Array.isArray(raw)) {
      return raw;
    }
    try {
      const str = String(raw);
      const start = str.indexOf('[');
      const end = str.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end >= start) {
        return JSON.parse(str.slice(start, end + 1));
      }
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  }

  async createAccount(data, context = {}) {
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

    if (data.password !== undefined && data.password !== null) {
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
      // Explicitly mark local password authentication disabled.
      // Satisfies database NOT NULL constraints without assigning any usable credential.
      passwordHash = '!DISABLED:NO_LOCAL_PASSWORD';
      passwordSalt = 'disabled';
    }

    // DEF-008: Strict role privilege gate in PostgreSQL repository adapter
    let assignedRole = 'client';
    const isManagingPartner = context && context.role === 'managing_partner';
    const isInternalBootstrap = context && context.isInternalBootstrap === true;

    if (data.account_role && data.account_role !== 'client') {
      if (!isManagingPartner && !isInternalBootstrap) {
        // Ordinary or unprivileged context forces client
        assignedRole = 'client';
      } else {
        if (['compliance_operator', 'managing_partner'].includes(data.account_role)) {
          assignedRole = data.account_role;
        } else {
          const err = new Error('Unsupported or invalid staff role: ' + data.account_role);
          err.statusCode = 400;
          throw err;
        }
      }
    }

    const accountId = data.id || crypto.randomUUID();
    const authUserId = data.auth_user_id || accountId;

    const contextForInsert = Object.assign({}, context, {
      userId: accountId,
      role: assignedRole
    });

    // 1. Insert Account (Gov pool for staff provisioning, App pool for client registration)
    // For client registration, is_active is omitted from column list; trigger unconditionally enforces is_active = false.
    let accQuery;
    let accParams;
    if (assignedRole === 'client') {
      accQuery = 'INSERT INTO client_accounts (id, auth_user_id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;';
      accParams = [
        accountId,
        authUserId,
        data.legal_entity_name || 'Individual Client',
        data.cin_llpin || null,
        email,
        data.primary_phone || '+91 9876543210',
        'client'
      ];
    } else {
      accQuery = 'INSERT INTO client_accounts (id, auth_user_id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';
      accParams = [
        accountId,
        authUserId,
        data.legal_entity_name || 'Individual Client',
        data.cin_llpin || null,
        email,
        data.primary_phone || '+91 9876543210',
        assignedRole,
        data.is_active !== false
      ];
    }
    const accFn = assignedRole === 'client' ? this.executeQuery.bind(this) : this.executeGovQuery.bind(this);
    const accRows = await accFn(accQuery, accParams, contextForInsert);

    const createdAccount = accRows[0];

    // 2. Insert Auth Credentials (ALWAYS via authPool running as craftegon_auth_user)
    const credQuery = 'INSERT INTO auth_credentials (account_id, email, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id;';
    try {
      await this.executeAuthQuery(credQuery, [
        accountId,
        email,
        passwordHash,
        passwordSalt
      ], contextForInsert);
    } catch (credErr) {
      // Inactive account remains dormant (is_active = false) for audit and data integrity.
      // Reconciled strictly via two-person governance protocol after the 1-hour policy threshold.
      // Zero silent exception swallowing; failure is logged with context and rethrown.
      console.error(`[AccountStorage] Failed to create credentials for account ${accountId}: ${credErr.message}`);
      throw credErr;
    }

    // Sanitize returned object: do not expose password hashes, salts or internal credentials
    return {
      id: createdAccount.id,
      auth_user_id: createdAccount.auth_user_id,
      legal_entity_name: createdAccount.legal_entity_name,
      cin_llpin: createdAccount.cin_llpin,
      primary_email: createdAccount.primary_email,
      primary_phone: createdAccount.primary_phone,
      account_role: createdAccount.account_role,
      is_active: createdAccount.is_active,
      created_at: createdAccount.created_at,
      updated_at: createdAccount.updated_at
    };
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
    if (!email || !password || typeof password !== 'string' || password.length === 0) {
      return { authenticated: false, reason: 'MISSING_CREDENTIALS' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const query = `
      SELECT ac.*, ca.legal_entity_name, ca.cin_llpin, ca.account_role, ca.is_active AS account_is_active, ca.id AS client_account_id
      FROM auth_credentials ac
      JOIN client_accounts ca ON ca.id = ac.account_id
      WHERE LOWER(ac.email) = $1
      LIMIT 1;
    `;
    const rows = await this.executeAuthQuery(query, [cleanEmail]);
    const cred = rows[0];

    if (!cred) {
      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    if (cred.locked_until && new Date() < new Date(cred.locked_until)) {
      const err = new Error('Account is temporarily locked due to multiple failed login attempts. Please reset your password or try again later.');
      err.statusCode = 429;
      throw err;
    }

    // Reject disabled local-auth credentials or malformed hash format safely
    if (!cred.password_hash || typeof cred.password_hash !== 'string' || !cred.password_hash.startsWith('scrypt:')) {
      return { authenticated: false, reason: 'LOCAL_AUTH_DISABLED' };
    }

    const valid = verifyPassword(password, cred.password_hash, cred.password_salt);
    if (!valid) {
      const newAttempts = (cred.failed_attempts || 0) + 1;
      let lockClause = '';
      if (newAttempts >= 5) {
        lockClause = `, locked_until = CURRENT_TIMESTAMP + INTERVAL '15 minutes'`;
      }
      await this.executeAuthQuery(`
        UPDATE auth_credentials
        SET failed_attempts = $1 ${lockClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [newAttempts, cred.id]);

      return { authenticated: false, reason: 'INVALID_CREDENTIALS' };
    }

    // Reset failed attempts on success
    await this.executeAuthQuery(`
      UPDATE auth_credentials
      SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [cred.id]);

    // DEF-007: Account deactivation enforcement at login
    if (cred.account_is_active === false) {
      await this.revokeAllUserSessions(cred.client_account_id);
      return { authenticated: false, reason: 'ACCOUNT_INACTIVE' };
    }

    const account = {
      id: cred.client_account_id,
      auth_user_id: cred.client_account_id,
      legal_entity_name: cred.legal_entity_name,
      cin_llpin: cred.cin_llpin,
      primary_email: cred.email,
      account_role: cred.account_role,
      is_active: cred.account_is_active
    };

    return { authenticated: true, account };
  }

  async createPasswordResetToken(email) {
    if (!email || typeof email !== 'string') return { success: true };
    const cleanEmail = email.trim().toLowerCase();
    const rows = await this.executeAuthQuery(`SELECT id FROM auth_credentials WHERE LOWER(email) = $1;`, [cleanEmail]);
    if (!rows[0]) {
      return { success: true };
    }

    const { rawToken, tokenHash } = generateRecoveryToken();
    await this.executeAuthQuery(`
      UPDATE auth_credentials
      SET recovery_token_hash = $1,
          recovery_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `, [tokenHash, rows[0].id]);

    return { success: true, token: rawToken, tokenHash: tokenHash };
  }

  async invalidatePasswordResetTokenByHash(email, tokenHash) {
    if (!email || !tokenHash || typeof email !== 'string' || typeof tokenHash !== 'string') {
      return { success: true, invalidated: false };
    }
    const cleanEmail = email.trim().toLowerCase();
    const query = `
      UPDATE auth_credentials
      SET recovery_token_hash = NULL,
          recovery_token_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = $1 AND recovery_token_hash = $2
      RETURNING id;
    `;
    const rows = await this.executeAuthQuery(query, [cleanEmail, tokenHash]);
    return { success: true, invalidated: rows.length > 0 };
  }

  async rotatePassword(accountId, newPassword) {
    if (!accountId || !newPassword) {
      const err = new Error('Account ID and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const pVal = validatePassword(newPassword);
    if (!pVal.valid) {
      const err = new Error(pVal.message);
      err.statusCode = 400;
      throw err;
    }

    const hashed = hashPassword(newPassword);
    const query = `
      WITH updated_cred AS (
        UPDATE auth_credentials
        SET password_hash = $1,
            password_salt = $2,
            recovery_token_hash = NULL,
            recovery_token_expires_at = NULL,
            failed_attempts = 0,
            locked_until = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE account_id = $3
        RETURNING account_id
      ),
      revoked_sessions AS (
        UPDATE auth_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE account_id IN (SELECT account_id FROM updated_cred) AND revoked_at IS NULL
        RETURNING id
      )
      SELECT account_id FROM updated_cred;
    `;
    const rows = await this.executeAuthQuery(query, [hashed.hash, hashed.salt, accountId]);
    if (!rows || rows.length === 0) {
      const err = new Error('Account credential record not found');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, message: 'Password rotated successfully' };
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
    const hashed = hashPassword(newPassword);

    const query = `
      WITH updated_cred AS (
        UPDATE auth_credentials
        SET password_hash = $1,
            password_salt = $2,
            recovery_token_hash = NULL,
            recovery_token_expires_at = NULL,
            failed_attempts = 0,
            locked_until = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE recovery_token_hash = $3
          AND recovery_token_expires_at IS NOT NULL
          AND recovery_token_expires_at > CURRENT_TIMESTAMP
        RETURNING account_id
      ),
      revoked_sessions AS (
        UPDATE auth_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE account_id IN (SELECT account_id FROM updated_cred)
          AND revoked_at IS NULL
        RETURNING id
      )
      SELECT account_id FROM updated_cred;
    `;

    const rows = await this.executeAuthQuery(query, [hashed.hash, hashed.salt, tokenHash]);
    if (!rows || rows.length === 0) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      throw err;
    }

    return { success: true, message: 'Password updated successfully' };
  }

  async createSession(account, meta = {}, ttlSeconds = 86400) {
    if (!account || account.is_active === false) {
      const err = new Error('Cannot issue session to inactive or non-existent account');
      err.statusCode = 403;
      throw err;
    }
    const { rawToken, tokenHash } = generateSessionToken();
    const query = `
      INSERT INTO auth_sessions (
        session_token_hash, account_id, role, ip_hash, user_agent, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, CURRENT_TIMESTAMP + ($6 || ' seconds')::interval
      ) RETURNING *;
    `;
    const rows = await this.executeAuthQuery(query, [
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
    const query = 'SELECT s.id AS session_id, s.account_id, s.role, s.expires_at, s.revoked_at, ca.id AS client_account_id, ca.legal_entity_name, ca.cin_llpin, ca.primary_email, ca.is_active AS account_is_active FROM auth_sessions s LEFT JOIN client_accounts ca ON ca.id = s.account_id WHERE s.session_token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP LIMIT 1;';
    const rows = await this.executeAuthQuery(query, [tokenHash]);
    const record = rows[0];
    if (!record) return null;

    // Check 1: Missing or deleted owning account in client_accounts
    if (!record.client_account_id) {
      await this.revokeSession(rawToken);
      return null;
    }

    // Check 2: Owning account active status (obtained directly from client_accounts.is_active)
    if (record.account_is_active === false) {
      await this.revokeAllUserSessions(record.account_id);
      return null;
    }

    return {
      user_id: record.account_id,
      account_id: record.account_id,
      role: record.role,
      legal_entity_name: record.legal_entity_name,
      cin_llpin: record.cin_llpin,
      email: record.primary_email,
      expires_at: record.expires_at
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
    const rows = await this.executeAuthQuery(query, [tokenHash]);
    return rows.length > 0;
  }

  async revokeAllUserSessions(accountId) {
    if (!accountId) return 0;
    const query = `
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE account_id = $1 
        AND (user_agent IS DISTINCT FROM 'VERIFICATION_TOKEN')
        AND revoked_at IS NULL
      RETURNING id;
    `;
    const rows = await this.executeAuthQuery(query, [accountId]);
    return rows.length;
  }


  async createVerificationToken(accountId, ttlSeconds = 86400) {
    if (!accountId) {
      const err = new Error('Account ID is required to generate verification token');
      err.statusCode = 400;
      throw err;
    }

    // Invalidate existing active verification tokens for this account
    await this.executeAuthQuery(`
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE account_id = $1 AND user_agent = 'VERIFICATION_TOKEN' AND revoked_at IS NULL;
    `, [accountId]);

    const { rawToken, tokenHash } = generateVerificationToken();
    const expiresAt = new Date(Date.now() + (ttlSeconds * 1000)).toISOString();

    await this.executeAuthQuery(`
      INSERT INTO auth_sessions (
        session_token_hash, account_id, role, user_agent, expires_at
      ) VALUES (
        $1, $2, 'client', 'VERIFICATION_TOKEN', CURRENT_TIMESTAMP + ($3 || ' seconds')::interval
      );
    `, [tokenHash, accountId, String(ttlSeconds)]);

    return { rawToken, tokenHash, expiresAt };
  }

  async verifyEmailToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      const err = new Error('Verification token is required');
      err.statusCode = 400;
      throw err;
    }

    const tokenHash = hashToken(rawToken);

    // Call dedicated atomic stored procedure (GAP-08)
    const procQuery = 'SELECT account_id, primary_email FROM public.sp_consume_email_verification_token($1);';
    const rows = await this.executeQuery(procQuery, [tokenHash]);

    if (!rows || rows.length === 0) {
      // Check why it failed for detailed security status using auth pool
      const existing = await this.executeAuthQuery(`
        SELECT revoked_at, expires_at FROM auth_sessions
        WHERE session_token_hash = $1 AND user_agent = 'VERIFICATION_TOKEN';
      `, [tokenHash]);

      if (existing && existing.length > 0) {
        if (existing[0].revoked_at) {
          const err = new Error('Verification token has already been used or is invalid');
          err.statusCode = 400;
          throw err;
        }
        if (new Date() > new Date(existing[0].expires_at)) {
          const err = new Error('Verification token has expired. Please request a new verification email.');
          err.statusCode = 400;
          throw err;
        }
      }

      const err = new Error('Invalid or expired verification token');
      err.statusCode = 400;
      throw err;
    }

    return {
      success: true,
      accountId: rows[0].account_id,
      email: rows[0].primary_email,
      message: 'Account verified and activated successfully'
    };
  }

  async resendVerificationToken(email, ttlSeconds = 86400) {
    if (!email || typeof email !== 'string') {
      return { success: true };
    }
    const cleanEmail = email.trim().toLowerCase();
    const rows = await this.executeQuery(`
      SELECT id, is_active, primary_email, legal_entity_name 
      FROM client_accounts 
      WHERE LOWER(primary_email) = $1 LIMIT 1;
    `, [cleanEmail], { role: 'managing_partner' });

    if (!rows || rows.length === 0 || rows[0].is_active) {
      return { success: true }; // Zero account enumeration
    }

    const tokenRes = await this.createVerificationToken(rows[0].id, ttlSeconds);
    return {
      success: true,
      account: rows[0],
      token: tokenRes.rawToken,
      tokenHash: tokenRes.tokenHash,
      expiresAt: tokenRes.expiresAt
    };
  }

  async setAccountActiveStatus(accountId, isActive, context) {
    if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
      const err = new Error('Account ID is required');
      err.statusCode = 400;
      throw err;
    }

    if (typeof isActive !== 'boolean') {
      const err = new Error('Invalid status value: isActive must be a boolean (true or false)');
      err.statusCode = 400;
      throw err;
    }

    const ctx = (context && typeof context === 'object') ? context : {};
    const isManagingPartner = ctx.role === 'managing_partner';
    const isInternalBootstrap = ctx.isInternalBootstrap === true;

    if (!isManagingPartner && !isInternalBootstrap) {
      const err = new Error('FORBIDDEN: Only Managing Partner or genuine internal bootstrap can modify account active status');
      err.statusCode = 403;
      throw err;
    }

    // Single atomic data-modifying CTE (Section E):
    // Simultaneously updates client_accounts and revokes active auth_sessions in one statement
    const query = `
      WITH updated_acc AS (
        UPDATE client_accounts
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, primary_email, account_role, is_active, updated_at
      ),
      revoked_sess AS (
        UPDATE auth_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE account_id = $2
          AND revoked_at IS NULL
          AND $1 = false
        RETURNING id
      )
      SELECT id, primary_email, account_role, is_active, updated_at FROM updated_acc;
    `;

    const rows = await this.executeGovQuery(query, [isActive, accountId]);
    if (!rows || rows.length === 0) {
      const err = new Error('Account not found');
      err.statusCode = 404;
      throw err;
    }

    return rows[0];
  }

  async listStaff(context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only staff can list operational staff');
      err.statusCode = 403;
      throw err;
    }

    const query = `
      SELECT id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role, is_active, created_at
      FROM client_accounts
      WHERE account_role IN ('compliance_operator', 'managing_partner')
        AND is_active = true
      ORDER BY legal_entity_name ASC;
    `;

    const rows = await this.executeQuery(query, [], context);
    return rows.map(acc => ({
      id: acc.id,
      legal_entity_name: acc.legal_entity_name,
      cin_llpin: acc.cin_llpin || null,
      primary_email: acc.primary_email,
      primary_phone: acc.primary_phone,
      account_role: acc.account_role,
      role: acc.account_role,
      is_active: acc.is_active,
      created_at: acc.created_at
    }));
  }

  async deactivateAccount(accountId, context) {
    return this.setAccountActiveStatus(accountId, false, context);
  }
}

class AccountRepository {
  constructor(storageAdapter = null) {
    this.adapter = storageAdapter || new InMemoryAccountStorage();
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  createAccount(data, context = {}) {
    return this.adapter.createAccount(data, context);
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

  listStaff(context) {
    if (this.adapter.listStaff) {
      return this.adapter.listStaff(context);
    }
    return [];
  }

  rotatePassword(accountId, newPassword) {
    return this.adapter.rotatePassword(accountId, newPassword);
  }

  invalidatePasswordResetTokenByHash(email, tokenHash) {
    return this.adapter.invalidatePasswordResetTokenByHash(email, tokenHash);
  }


  createVerificationToken(accountId, ttlSeconds) {
    if (this.adapter && typeof this.adapter.createVerificationToken === 'function') {
      return this.adapter.createVerificationToken(accountId, ttlSeconds);
    }
    throw new Error('NOT_IMPLEMENTED: Current storage adapter does not support createVerificationToken');
  }

  verifyEmailToken(rawToken) {
    if (this.adapter && typeof this.adapter.verifyEmailToken === 'function') {
      return this.adapter.verifyEmailToken(rawToken);
    }
    throw new Error('NOT_IMPLEMENTED: Current storage adapter does not support verifyEmailToken');
  }

  resendVerificationToken(email, ttlSeconds) {
    if (this.adapter && typeof this.adapter.resendVerificationToken === 'function') {
      return this.adapter.resendVerificationToken(email, ttlSeconds);
    }
    throw new Error('NOT_IMPLEMENTED: Current storage adapter does not support resendVerificationToken');
  }

  setAccountActiveStatus(accountId, isActive, context) {
    if (this.adapter && typeof this.adapter.setAccountActiveStatus === 'function') {
      return this.adapter.setAccountActiveStatus(accountId, isActive, context);
    }
    throw new Error('NOT_IMPLEMENTED: Current storage adapter does not support setAccountActiveStatus');
  }

  deactivateAccount(accountId, context) {
    if (this.adapter && typeof this.adapter.deactivateAccount === 'function') {
      return this.adapter.deactivateAccount(accountId, context);
    }
    throw new Error('NOT_IMPLEMENTED: Current storage adapter does not support deactivateAccount');
  }
}

const accountRepository = new AccountRepository();

module.exports = {
  AccountRepository,
  accountRepository,
  InMemoryAccountStorage,
  PostgresAccountStorage
};
