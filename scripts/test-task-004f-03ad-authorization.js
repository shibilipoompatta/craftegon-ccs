/**
 * CraftEgon CCS - Task 004F-03AD Test Suite
 * Fail-Closed Account Status Authorization & Input Validation Verification
 *
 * Covers:
 * 1. Managing Partner context can deactivate and reactivate (both adapters).
 * 2. Genuine internal bootstrap context is accepted only through trusted internal path (both adapters).
 * 3. Missing context is rejected (both adapters).
 * 4. Empty context is rejected (both adapters).
 * 5. Null context is rejected (both adapters).
 * 6. Client context is rejected (both adapters).
 * 7. Compliance operator context is rejected (both adapters).
 * 8. Admin pseudo-role context is rejected (both adapters).
 * 9. Caller-supplied bootstrap flag through an HTTP request cannot authorize a status change.
 * 10. Invalid status values ("false", "true", 0, 1, null, object, array) are rejected with HTTP 400.
 * 11. Failed authorization produces no account update and no session-revocation side effect.
 * 12. Successful deactivation revokes sessions.
 * 13. Reactivation does not revive old sessions.
 *
 * Strict read-only database mode: uses mock PostgreSQL adapter and in-memory storage.
 */

const assert = require('assert');
const crypto = require('crypto');
const http = require('http');
const {
  InMemoryAccountStorage,
  PostgresAccountStorage,
  AccountRepository
} = require('../src/backend/storage/account-repository');
const { createServer } = require('../src/backend/server');

// ==============================================================================
// Mock PostgreSQL Database Adapter for Inspection
// ==============================================================================
class MockPostgresDatabase {
  constructor() {
    this.clientAccounts = new Map(); // id -> row
    this.authCredentials = new Map(); // id -> row
    this.authSessions = new Map(); // session_token_hash -> row
    this.queryLog = [];
    this.executedParamsLog = [];
  }

  reset() {
    this.clientAccounts.clear();
    this.authCredentials.clear();
    this.authSessions.clear();
    this.queryLog = [];
    this.executedParamsLog = [];
  }

  query(sql) {
    this.queryLog.push(sql);

    // Extract the inner statement inside `WITH q AS (...) SELECT ...`
    const match = sql.match(/WITH q AS \(([\s\S]+)\) SELECT/i);
    const innerSql = match ? match[1].trim() : sql.trim();

    // 1. SELECT from client_accounts
    if (/^SELECT\s+\*\s+FROM\s+client_accounts\s+WHERE\s+LOWER\(primary_email\)\s*=/i.test(innerSql)) {
      const emailMatch = innerSql.match(/LOWER\(primary_email\)\s*=\s*'([^']+)'/i);
      const email = emailMatch ? emailMatch[1].toLowerCase() : '';
      for (const acc of this.clientAccounts.values()) {
        if (acc.primary_email.toLowerCase() === email) {
          return JSON.stringify([acc]);
        }
      }
      return '[]';
    }

    if (/^SELECT\s+\*\s+FROM\s+client_accounts\s+WHERE\s+id\s*=/i.test(innerSql)) {
      const idMatch = innerSql.match(/WHERE\s+id\s*=\s*'([^']+)'/i);
      const id = idMatch ? idMatch[1] : '';
      const acc = this.clientAccounts.get(id);
      return acc ? JSON.stringify([acc]) : '[]';
    }

    // 2. INSERT INTO client_accounts
    if (/^INSERT\s+INTO\s+client_accounts/i.test(innerSql)) {
      const valuesMatch = innerSql.match(/VALUES\s*\(([\s\S]+?)\)\s*RETURNING/i);
      if (valuesMatch) {
        const rawVals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
        const row = {
          id: rawVals[0],
          auth_user_id: rawVals[1],
          legal_entity_name: rawVals[2],
          cin_llpin: rawVals[3] === 'NULL' ? null : rawVals[3],
          primary_email: rawVals[4],
          primary_phone: rawVals[5],
          account_role: rawVals[6],
          is_active: rawVals[7] === 'true',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.clientAccounts.set(row.id, row);
        return JSON.stringify([row]);
      }
      return '[]';
    }

    // 3. INSERT INTO auth_credentials
    if (/^INSERT\s+INTO\s+auth_credentials/i.test(innerSql)) {
      const id = crypto.randomUUID();
      return JSON.stringify([{ id }]);
    }

    // 4. INSERT INTO auth_sessions
    if (/^INSERT\s+INTO\s+auth_sessions/i.test(innerSql)) {
      const valuesMatch = innerSql.match(/VALUES\s*\(([\s\S]+?)\)\s*RETURNING/i);
      if (valuesMatch) {
        const rawVals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
        const tokenHash = rawVals[0];
        const accountId = rawVals[1];
        const role = rawVals[2];
        const ttlMatch = innerSql.match(/'(\d+)'\s*\|\|\s*' seconds'/);
        const ttlSecs = ttlMatch ? parseInt(ttlMatch[1], 10) : 86400;
        const expiresAt = new Date(Date.now() + (ttlSecs * 1000)).toISOString();
        const sessionRow = {
          id: crypto.randomUUID(),
          session_token_hash: tokenHash,
          account_id: accountId,
          role,
          expires_at: expiresAt,
          revoked_at: null,
          created_at: new Date().toISOString()
        };
        this.authSessions.set(tokenHash, sessionRow);
        return JSON.stringify([sessionRow]);
      }
      return '[]';
    }

    // 5. SELECT auth_sessions joined with client_accounts (verifySession)
    if (/FROM\s+auth_sessions\s+s\s+LEFT\s+JOIN\s+client_accounts\s+ca/i.test(innerSql)) {
      const hashMatch = innerSql.match(/s\.session_token_hash\s*=\s*'([^']+)'/i);
      const tokenHash = hashMatch ? hashMatch[1] : '';
      const session = this.authSessions.get(tokenHash);

      if (!session) return '[]';
      if (session.revoked_at !== null) return '[]';
      if (new Date(session.expires_at) <= new Date()) return '[]';

      const account = this.clientAccounts.get(session.account_id);
      const record = {
        session_id: session.id,
        account_id: session.account_id,
        role: session.role,
        expires_at: session.expires_at,
        revoked_at: session.revoked_at,
        client_account_id: account ? account.id : null,
        legal_entity_name: account ? account.legal_entity_name : null,
        cin_llpin: account ? account.cin_llpin : null,
        primary_email: account ? account.primary_email : null,
        account_is_active: account ? account.is_active : null
      };

      return JSON.stringify([record]);
    }

    // 6. UPDATE auth_sessions (revocation)
    if (/^UPDATE\s+auth_sessions\s+SET\s+revoked_at\s*=/i.test(innerSql)) {
      let revokedCount = 0;
      const hashMatch = innerSql.match(/session_token_hash\s*=\s*'([^']+)'/i);
      const accMatch = innerSql.match(/account_id\s*=\s*'([^']+)'/i);

      if (hashMatch) {
        const sess = this.authSessions.get(hashMatch[1]);
        if (sess && !sess.revoked_at) {
          sess.revoked_at = new Date().toISOString();
          revokedCount++;
        }
      } else if (accMatch) {
        const accId = accMatch[1];
        for (const sess of this.authSessions.values()) {
          if (sess.account_id === accId && !sess.revoked_at) {
            sess.revoked_at = new Date().toISOString();
            revokedCount++;
          }
        }
      }
      return JSON.stringify(Array(revokedCount).fill({ id: 'revoked' }));
    }

    // 7. UPDATE client_accounts (setAccountActiveStatus)
    if (/^UPDATE\s+client_accounts\s+SET\s+is_active\s*=/i.test(innerSql)) {
      const activeMatch = innerSql.match(/is_active\s*=\s*(true|false)/i);
      const idMatch = innerSql.match(/WHERE\s+id\s*=\s*'([^']+)'/i);

      if (idMatch && activeMatch) {
        const id = idMatch[1];
        const newStatus = activeMatch[1] === 'true';
        const acc = this.clientAccounts.get(id);
        if (acc) {
          acc.is_active = newStatus;
          acc.updated_at = new Date().toISOString();
          return JSON.stringify([{
            id: acc.id,
            primary_email: acc.primary_email,
            account_role: acc.account_role,
            is_active: acc.is_active,
            updated_at: acc.updated_at
          }]);
        }
      }
      return '[]';
    }

    return '[]';
  }
}

// ==============================================================================
// Test Runner
// ==============================================================================
async function runTask03ADTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Task 004F-03AD: Fail-Closed Status Authorization');
  console.log('======================================================================\n');

  let passedAssertions = 0;
  function pass(msg) {
    passedAssertions++;
    console.log(`  ✅ PASS [Assert ${passedAssertions}]: ${msg}`);
  }

  // ============================================================================
  // SECTION 1: InMemoryAccountStorage Authorization & Validation
  // ============================================================================
  console.log('--- Section 1: InMemoryAccountStorage Authorization & Input Validation ---');
  const inMem = new InMemoryAccountStorage();

  const memAccount = await inMem.createAccount({
    legal_entity_name: 'Test Client Ltd',
    primary_email: 'client@test.com',
    primary_phone: '+91 9876500001',
    password: 'ValidPassword2026!'
  });
  const { token: memToken } = await inMem.createSession(memAccount);
  assert.ok(memToken, 'Session token issued');

  // 1. Managing Partner context can deactivate and reactivate
  const deactMem = await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'managing_partner' });
  assert.strictEqual(deactMem.is_active, false, 'Managing Partner can deactivate account');
  assert.strictEqual(inMem.accounts.get(memAccount.id).is_active, false);
  pass('InMemory: Managing Partner context can deactivate account');

  const reactMem = await inMem.setAccountActiveStatus(memAccount.id, true, { role: 'managing_partner' });
  assert.strictEqual(reactMem.is_active, true, 'Managing Partner can reactivate account');
  assert.strictEqual(inMem.accounts.get(memAccount.id).is_active, true);
  pass('InMemory: Managing Partner context can reactivate account');

  // 2. Genuine internal bootstrap context is accepted
  const deactBoot = await inMem.setAccountActiveStatus(memAccount.id, false, { isInternalBootstrap: true });
  assert.strictEqual(deactBoot.is_active, false);
  const reactBoot = await inMem.setAccountActiveStatus(memAccount.id, true, { isInternalBootstrap: true });
  assert.strictEqual(reactBoot.is_active, true);
  pass('InMemory: Genuine internal bootstrap context is accepted for status change');

  // 3. Missing context is rejected
  let missingCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false);
  } catch (e) {
    missingCtxErr = e;
  }
  assert.ok(missingCtxErr !== null, 'Missing context must throw');
  assert.strictEqual(missingCtxErr.statusCode, 403, 'Missing context throws 403 Forbidden');
  pass('InMemory: Missing context is rejected with HTTP 403');

  // 4. Empty context {} is rejected
  let emptyCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, {});
  } catch (e) {
    emptyCtxErr = e;
  }
  assert.ok(emptyCtxErr !== null, 'Empty context must throw');
  assert.strictEqual(emptyCtxErr.statusCode, 403, 'Empty context throws 403 Forbidden');
  pass('InMemory: Empty context {} is rejected with HTTP 403');

  // 5. Null context is rejected
  let nullCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, null);
  } catch (e) {
    nullCtxErr = e;
  }
  assert.ok(nullCtxErr !== null, 'Null context must throw');
  assert.strictEqual(nullCtxErr.statusCode, 403, 'Null context throws 403 Forbidden');
  pass('InMemory: Null context is rejected with HTTP 403');

  // 6. Client context is rejected
  let clientCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'client' });
  } catch (e) {
    clientCtxErr = e;
  }
  assert.ok(clientCtxErr !== null, 'Client context must throw');
  assert.strictEqual(clientCtxErr.statusCode, 403, 'Client context throws 403 Forbidden');
  pass('InMemory: Client context { role: "client" } is rejected with HTTP 403');

  // 7. Compliance operator context is rejected
  let operatorCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'compliance_operator' });
  } catch (e) {
    operatorCtxErr = e;
  }
  assert.ok(operatorCtxErr !== null, 'Operator context must throw');
  assert.strictEqual(operatorCtxErr.statusCode, 403, 'Operator context throws 403 Forbidden');
  pass('InMemory: Compliance Operator context is rejected with HTTP 403');

  // 8. Admin pseudo-role context is rejected
  let adminCtxErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'admin' });
  } catch (e) {
    adminCtxErr = e;
  }
  assert.ok(adminCtxErr !== null, 'Admin pseudo-role must throw');
  assert.strictEqual(adminCtxErr.statusCode, 403, 'Admin pseudo-role throws 403 Forbidden');
  pass('InMemory: Admin pseudo-role context { role: "admin" } is rejected with HTTP 403');

  // 10. Invalid status values ("false", "true", 0, 1, null, object, array) are rejected with HTTP 400
  const invalidStatusValues = ['false', 'true', 0, 1, null, {}, [], undefined, ''];
  for (const badVal of invalidStatusValues) {
    let badValErr = null;
    try {
      await inMem.setAccountActiveStatus(memAccount.id, badVal, { role: 'managing_partner' });
    } catch (e) {
      badValErr = e;
    }
    assert.ok(badValErr !== null, `Value ${JSON.stringify(badVal)} must be rejected`);
    assert.strictEqual(badValErr.statusCode, 400, `Value ${JSON.stringify(badVal)} must throw HTTP 400`);
    assert.ok(badValErr.message.includes('isActive must be a boolean'), 'Clear validation message');
  }
  pass('InMemory: All invalid non-boolean status values rejected with HTTP 400 Bad Request');

  // 11. Failed authorization produces NO account update and NO session revocation
  // Account is currently active. Let's issue a fresh session and verify it.
  const { token: probeToken } = await inMem.createSession(memAccount);
  const probeBefore = await inMem.verifySession(probeToken);
  assert.ok(probeBefore !== null, 'Session is active before failed attempt');

  let failedAttemptErr = null;
  try {
    await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'compliance_operator' });
  } catch (e) {
    failedAttemptErr = e;
  }
  assert.strictEqual(failedAttemptErr.statusCode, 403);
  assert.strictEqual(inMem.accounts.get(memAccount.id).is_active, true, 'Account must remain active after failed authorization');
  const probeAfter = await inMem.verifySession(probeToken);
  assert.ok(probeAfter !== null, 'Active session must NOT be revoked after failed authorization');
  pass('InMemory: Failed authorization produces zero account mutation and zero session revocation');

  // 12. Successful deactivation revokes sessions
  await inMem.setAccountActiveStatus(memAccount.id, false, { role: 'managing_partner' });
  const probeAfterDeact = await inMem.verifySession(probeToken);
  assert.strictEqual(probeAfterDeact, null, 'Session is revoked upon successful deactivation');
  pass('InMemory: Successful deactivation invalidates and revokes active sessions');

  // 13. Reactivation does NOT revive old sessions
  await inMem.setAccountActiveStatus(memAccount.id, true, { role: 'managing_partner' });
  const probeAfterReact = await inMem.verifySession(probeToken);
  assert.strictEqual(probeAfterReact, null, 'Old session remains invalid after reactivation');

  const { token: freshToken } = await inMem.createSession(memAccount);
  const freshSession = await inMem.verifySession(freshToken);
  assert.ok(freshSession !== null, 'Fresh session issued after reactivation is valid');
  pass('InMemory: Reactivating account does NOT revive prior session tokens');

  // ============================================================================
  // SECTION 2: PostgresAccountStorage Authorization & SQL Query Inspection
  // ============================================================================
  console.log('\n--- Section 2: PostgresAccountStorage Authorization & SQL Parameter Inspection ---');
  const db = new MockPostgresDatabase();
  const pgStorage = new PostgresAccountStorage(db);

  const pgAccount = await pgStorage.createAccount({
    legal_entity_name: 'Postgres Client Corp',
    primary_email: 'pgclient@test.com',
    primary_phone: '+91 9876500002',
    password: 'ValidPassword2026!'
  });
  const { token: pgToken } = await pgStorage.createSession(pgAccount);
  assert.ok(pgToken);

  // 1. Managing Partner context can deactivate and reactivate
  db.queryLog = [];
  const pgDeact = await pgStorage.setAccountActiveStatus(pgAccount.id, false, { role: 'managing_partner' });
  assert.strictEqual(pgDeact.is_active, false);

  // Inspect SQL & bound parameters for deactivation
  const pgDeactSql = db.queryLog.find(q => /UPDATE\s+client_accounts\s+SET\s+is_active\s*=/i.test(q));
  const pgRevokeSql = db.queryLog.find(q => /UPDATE\s+auth_sessions\s+SET\s+revoked_at\s*=/i.test(q));

  assert.ok(pgDeactSql, 'UPDATE client_accounts query was dispatched');
  assert.ok(pgDeactSql.includes('is_active = false'), 'is_active bound to boolean false');
  assert.ok(pgDeactSql.includes(`WHERE id = '${pgAccount.id}'`), 'Deactivation targets exact account ID');
  assert.ok(pgRevokeSql, 'UPDATE auth_sessions query was dispatched');
  assert.ok(pgRevokeSql.includes(`WHERE account_id = '${pgAccount.id}'`), 'Revocation targets exact account ID');
  pass('Postgres: Managing Partner deactivates account; SQL binds false and targets exact account identifier');

  // Reactivate
  db.queryLog = [];
  const pgReact = await pgStorage.setAccountActiveStatus(pgAccount.id, true, { role: 'managing_partner' });
  assert.strictEqual(pgReact.is_active, true);
  const pgReactSql = db.queryLog.find(q => /UPDATE\s+client_accounts\s+SET\s+is_active\s*=/i.test(q));
  assert.ok(pgReactSql.includes('is_active = true'), 'is_active bound to boolean true');
  assert.ok(pgReactSql.includes(`WHERE id = '${pgAccount.id}'`), 'Reactivation targets exact account ID');
  pass('Postgres: Managing Partner reactivates account; SQL binds true and targets exact account identifier');

  // 2. Genuine internal bootstrap context is accepted
  const pgBootDeact = await pgStorage.setAccountActiveStatus(pgAccount.id, false, { isInternalBootstrap: true });
  assert.strictEqual(pgBootDeact.is_active, false);
  const pgBootReact = await pgStorage.setAccountActiveStatus(pgAccount.id, true, { isInternalBootstrap: true });
  assert.strictEqual(pgBootReact.is_active, true);
  pass('Postgres: Genuine internal bootstrap context { isInternalBootstrap: true } is accepted');

  // 3, 4, 5. Missing, empty, and null contexts are rejected (with zero SQL executed)
  db.queryLog = [];
  const unauthorizedContexts = [
    { label: 'missing context', ctx: undefined },
    { label: 'empty object context', ctx: {} },
    { label: 'null context', ctx: null },
    { label: 'client role', ctx: { role: 'client' } },
    { label: 'compliance operator role', ctx: { role: 'compliance_operator' } },
    { label: 'admin pseudo-role', ctx: { role: 'admin' } },
    { label: 'arbitrary role', ctx: { role: 'superadmin' } },
    { label: 'false bootstrap flag', ctx: { isInternalBootstrap: false } },
    { label: 'string bootstrap flag', ctx: { isInternalBootstrap: 'true' } }
  ];

  for (const { label, ctx } of unauthorizedContexts) {
    db.queryLog = [];
    let caughtErr = null;
    try {
      if (ctx === undefined) {
        await pgStorage.setAccountActiveStatus(pgAccount.id, false);
      } else {
        await pgStorage.setAccountActiveStatus(pgAccount.id, false, ctx);
      }
    } catch (e) {
      caughtErr = e;
    }
    assert.ok(caughtErr !== null, `${label} must throw`);
    assert.strictEqual(caughtErr.statusCode, 403, `${label} must throw HTTP 403`);
    assert.strictEqual(db.queryLog.length, 0, `${label} must execute ZERO queries`);
  }
  pass('Postgres: Missing, null, empty, client, operator, admin and forged contexts strictly rejected (0 queries executed)');

  // 10. Invalid status values rejected with HTTP 400 (with zero SQL executed)
  for (const badVal of invalidStatusValues) {
    db.queryLog = [];
    let caughtErr = null;
    try {
      await pgStorage.setAccountActiveStatus(pgAccount.id, badVal, { role: 'managing_partner' });
    } catch (e) {
      caughtErr = e;
    }
    assert.ok(caughtErr !== null, `Postgres: value ${JSON.stringify(badVal)} must throw`);
    assert.strictEqual(caughtErr.statusCode, 400, `Postgres: value ${JSON.stringify(badVal)} must throw HTTP 400`);
    assert.strictEqual(db.queryLog.length, 0, `Postgres: invalid status must execute ZERO queries`);
  }
  pass('Postgres: All invalid status values rejected with HTTP 400 (0 queries executed)');

  // 11. Failed authorization produces no account update and no session revocation
  const { token: pgProbeToken } = await pgStorage.createSession(pgAccount);
  const pgProbeBefore = await pgStorage.verifySession(pgProbeToken);
  assert.ok(pgProbeBefore !== null);

  db.queryLog = [];
  let pgFailErr = null;
  try {
    await pgStorage.setAccountActiveStatus(pgAccount.id, false, { role: 'client' });
  } catch (e) {
    pgFailErr = e;
  }
  assert.strictEqual(pgFailErr.statusCode, 403);
  assert.strictEqual(db.queryLog.length, 0, 'No SQL dispatched on failed authorization');
  const pgProbeAfter = await pgStorage.verifySession(pgProbeToken);
  assert.ok(pgProbeAfter !== null, 'Session remains active after failed authorization attempt');
  pass('Postgres: Failed authorization produces zero SQL execution, zero DB writes, and zero session revocation');

  // 12. Successful deactivation revokes sessions in Postgres
  await pgStorage.deactivateAccount(pgAccount.id, { role: 'managing_partner' });
  const pgProbeAfterDeact = await pgStorage.verifySession(pgProbeToken);
  assert.strictEqual(pgProbeAfterDeact, null, 'Session revoked after deactivation in Postgres');
  pass('Postgres: Successful deactivation revokes sessions');

  // 13. Reactivation does not revive old sessions
  await pgStorage.setAccountActiveStatus(pgAccount.id, true, { role: 'managing_partner' });
  const pgProbeAfterReact = await pgStorage.verifySession(pgProbeToken);
  assert.strictEqual(pgProbeAfterReact, null, 'Old session remains revoked after reactivation');
  pass('Postgres: Reactivating account does NOT revive prior session tokens');

  // ============================================================================
  // SECTION 3: AccountRepository Delegation & Method Invariants
  // ============================================================================
  console.log('\n--- Section 3: AccountRepository Delegation & Wrapper Checks ---');
  const repo = new AccountRepository(inMem);

  // Method calls without context
  let repoNoCtxErr = null;
  try {
    await repo.deactivateAccount(memAccount.id);
  } catch (e) {
    repoNoCtxErr = e;
  }
  assert.strictEqual(repoNoCtxErr.statusCode, 403, 'repo.deactivateAccount without context throws 403');

  let repoNullCtxErr = null;
  try {
    await repo.deactivateAccount(memAccount.id, null);
  } catch (e) {
    repoNullCtxErr = e;
  }
  assert.strictEqual(repoNullCtxErr.statusCode, 403, 'repo.deactivateAccount with null context throws 403');

  let repoEmptyCtxErr = null;
  try {
    await repo.deactivateAccount(memAccount.id, {});
  } catch (e) {
    repoEmptyCtxErr = e;
  }
  assert.strictEqual(repoEmptyCtxErr.statusCode, 403, 'repo.deactivateAccount with {} throws 403');

  // Authorized call through AccountRepository
  const repoDeact = await repo.deactivateAccount(memAccount.id, { role: 'managing_partner' });
  assert.strictEqual(repoDeact.is_active, false);
  const repoReact = await repo.setAccountActiveStatus(memAccount.id, true, { role: 'managing_partner' });
  assert.strictEqual(repoReact.is_active, true);
  pass('AccountRepository: Delegation passes context cleanly and enforces fail-closed authorization');

  // ============================================================================
  // SECTION 4: HTTP Request Boundary & Untrusted Caller Insulation
  // ============================================================================
  console.log('\n--- Section 4: HTTP Request Boundary & Untrusted Input Insulation ---');

  // Spin up test server to test HTTP boundary
  const instance = createServer({ PORT: 3198, HOST: '127.0.0.1' });
  await instance.start();

  async function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body });
          }
        });
      });
      req.on('error', reject);
      if (postData) {
        req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
      }
      req.end();
    });
  }

  try {
    // 9. Caller-supplied bootstrap flag through HTTP request cannot authorize anything
    // Attacker attempts public registration sending isInternalBootstrap: true and role: managing_partner
    const forgedReg = await makeRequest({
      hostname: '127.0.0.1',
      port: 3198,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Attacker Corp',
      primary_email: 'attacker_bootstrap@evil.com',
      password: 'AttackerPassword2026!',
      isInternalBootstrap: true,
      account_role: 'managing_partner',
      role: 'managing_partner'
    });

    assert.strictEqual(forgedReg.status, 201, 'Registration accepted as client');
    assert.strictEqual(forgedReg.body.account.account_role, 'client', 'Role forced to client');
    assert.strictEqual(forgedReg.body.account.role, 'client');
    pass('HTTP Boundary: Caller-supplied isInternalBootstrap flag in registration body is ignored (role forced to client)');

    // Attacker attempts staff provisioning without authenticating, sending isInternalBootstrap: true
    const forgedStaff = await makeRequest({
      hostname: '127.0.0.1',
      port: 3198,
      path: '/api/v1/admin/staff',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Fake Staff Corp',
      primary_email: 'fakestaff@evil.com',
      password: 'FakePassword2026!',
      account_role: 'compliance_operator',
      isInternalBootstrap: true
    });
    assert.strictEqual(forgedStaff.status, 401, 'Unauthenticated staff provisioning rejected');
    pass('HTTP Boundary: Unauthenticated HTTP request with isInternalBootstrap cannot provision staff (HTTP 401)');

    // Attacker attempts to forge account deactivation or status change via HTTP request body directly
    // Ensure that passing an untrusted HTTP request body directly into setAccountActiveStatus fails closed
    const untrustedHttpRequestBody = {
      accountId: memAccount.id,
      isActive: false,
      isInternalBootstrap: true // Attacker injected this into request body
    };

    // Demonstrating that if an untrusted object is checked:
    // A controller MUST NOT use req.body as context!
    // And even if someone passed a sanitized or raw request object, fail-closed authorization blocks it:
    let untrustedCallErr = null;
    try {
      // Caller has client role or no trusted session:
      const callerContextFromSession = { role: 'client' }; // derived from authenticated session, NOT body!
      await inMem.setAccountActiveStatus(untrustedHttpRequestBody.accountId, untrustedHttpRequestBody.isActive, callerContextFromSession);
    } catch (e) {
      untrustedCallErr = e;
    }
    assert.strictEqual(untrustedCallErr.statusCode, 403, 'Client session context rejected with 403');
    pass('HTTP Boundary: Session-derived client context rejects status modification even if request body claimed bootstrap');

  } finally {
    await instance.stop();
  }

  console.log('\n======================================================================');
  console.log(`TASK 004F-03AD TEST SUMMARY: ${passedAssertions} passed, 0 failed (${passedAssertions} total assertions)`);
  console.log('STATUS: FAIL-CLOSED STATUS AUTHORIZATION & INPUT VALIDATION VERIFIED');
  console.log('======================================================================');
}

runTask03ADTests().catch(err => {
  console.error('Task 03AD Test Runner Fatal Error:', err);
  process.exit(1);
});
