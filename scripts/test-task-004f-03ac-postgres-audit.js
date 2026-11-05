/**
 * CraftEgon CCS — Task 004F-03AC: PostgreSQL Account-State Verification & Privilege Audit
 * Focused automated test suite verifying PostgresAccountStorage against simulated PostgreSQL engine.
 * Asserts SQL statements, parameters, column joining, session invalidation, and role boundaries.
 * Pure Node.js built-ins. Zero external dependencies. Zero live database connections.
 */

const assert = require('node:assert');
const crypto = require('node:crypto');
const { PostgresAccountStorage } = require('../src/backend/storage/account-repository');
const { hashToken, hashPassword } = require('../src/backend/models/account.model');

// ==============================================================================
// Realistic Mock PostgreSQL Database Engine with SQL Inspection
// ==============================================================================
class MockPostgresDatabase {
  constructor() {
    this.clientAccounts = new Map(); // id -> row
    this.authCredentials = new Map(); // id -> row
    this.authSessions = new Map(); // session_token_hash -> row
    this.queryLog = [];
  }

  reset() {
    this.clientAccounts.clear();
    this.authCredentials.clear();
    this.authSessions.clear();
    this.queryLog = [];
  }

  query(sql) {
    this.queryLog.push(sql);

    // Extract the inner statement inside `WITH q AS (...) SELECT ...`
    const match = sql.match(/WITH q AS \(([\s\S]+)\) SELECT/i);
    const innerSql = match ? match[1].trim() : sql.trim();

    // 1. SELECT from client_accounts (findByEmail or findById)
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
      // Parse VALUES ('id', 'auth_user_id', 'legal_name', cin, 'email', 'phone', 'role', is_active)
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
    if (/FROM\s+auth_sessions\s+s\s+LEFT\s+JOIN\s+client_accounts\s+ca/i.test(innerSql) ||
        /FROM\s+auth_sessions\s+s\s+JOIN\s+client_accounts\s+ca/i.test(innerSql)) {
      const hashMatch = innerSql.match(/s\.session_token_hash\s*=\s*'([^']+)'/i);
      const tokenHash = hashMatch ? hashMatch[1] : '';
      const session = this.authSessions.get(tokenHash);

      if (!session) return '[]';

      // Check revoked_at IS NULL condition
      if (innerSql.includes('s.revoked_at IS NULL') && session.revoked_at !== null) {
        return '[]';
      }

      // Check expires_at > CURRENT_TIMESTAMP
      if (innerSql.includes('s.expires_at > CURRENT_TIMESTAMP') && new Date(session.expires_at) <= new Date()) {
        return '[]';
      }

      // Perform LEFT JOIN with clientAccounts
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
// Task 004F-03AC Test Runner
// ==============================================================================
async function runTask03ACTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Task 004F-03AC: PostgreSQL Account & Privilege Audit');
  console.log('======================================================================\n');

  let passedAssertions = 0;
  function pass(msg) {
    passedAssertions++;
    console.log(`  ✅ PASS [Assert ${passedAssertions}]: ${msg}`);
  }

  const db = new MockPostgresDatabase();
  const pgStorage = new PostgresAccountStorage(db);

  // --------------------------------------------------------------------------
  // Scenario 1: Active account with valid, unexpired session is accepted
  // --------------------------------------------------------------------------
  console.log('--- Scenario 1: Active Account Valid Session Verification ---');
  const clientAcc = await pgStorage.createAccount({
    legal_entity_name: 'Acme Corporation Ltd',
    primary_email: 'acme@corporation.com',
    primary_phone: '+91 9876500001',
    password: 'ValidPassword2026!'
  });
  assert.strictEqual(clientAcc.account_role, 'client');
  assert.strictEqual(clientAcc.is_active, true);

  const { token: clientToken } = await pgStorage.createSession(clientAcc, {}, 3600);
  assert.ok(clientToken.startsWith('cct_'));

  const verifiedSession1 = await pgStorage.verifySession(clientToken);
  assert.ok(verifiedSession1 !== null, 'Session must be verified');
  assert.strictEqual(verifiedSession1.user_id, clientAcc.id);
  assert.strictEqual(verifiedSession1.email, 'acme@corporation.com');
  pass('Active account with valid, unexpired session is accepted');

  // --------------------------------------------------------------------------
  // Scenario 7: Account status obtained from actual joined client_accounts table
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 7: SQL Query Structure & Account Status Join ---');
  const verifyQuery = db.queryLog[db.queryLog.length - 1];
  assert.ok(verifyQuery.includes('FROM auth_sessions s LEFT JOIN client_accounts ca ON ca.id = s.account_id'),
    'Query must explicitly join client_accounts to retrieve owning account record');
  assert.ok(verifyQuery.includes('ca.is_active AS account_is_active'),
    'Query must select owning account active status explicitly (ca.is_active)');
  assert.ok(!verifyQuery.includes('s.is_active'),
    'Query must NOT assume or select a non-existent s.is_active column from auth_sessions');
  assert.ok(verifyQuery.includes('s.revoked_at IS NULL'),
    'Query must enforce session revocation boundary');
  assert.ok(verifyQuery.includes('s.expires_at > CURRENT_TIMESTAMP'),
    'Query must enforce session expiration boundary');
  pass('Account status is obtained from joined client_accounts table (ca.is_active), not an assumed session property');

  // --------------------------------------------------------------------------
  // Scenario 2: Inactive account with otherwise valid session is rejected
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Inactive Account Session Rejection ---');
  // Mutate account to inactive directly in storage (simulating external or DB deactivation)
  const storedAcc = db.clientAccounts.get(clientAcc.id);
  storedAcc.is_active = false;

  const inactiveVerified = await pgStorage.verifySession(clientToken);
  assert.strictEqual(inactiveVerified, null, 'verifySession must return null for inactive account');

  // Verify that an UPDATE auth_sessions SET revoked_at was executed
  const revokeQuery = db.queryLog[db.queryLog.length - 1];
  assert.ok(/UPDATE\s+auth_sessions\s+SET\s+revoked_at\s*=\s*CURRENT_TIMESTAMP\s+WHERE\s+account_id\s*=/i.test(revokeQuery),
    'verifySession must revoke all sessions when inactive account is detected');
  pass('Inactive account with otherwise valid session is rejected and its sessions are revoked');

  // --------------------------------------------------------------------------
  // Scenario 4: Reactivation does not revive the old session
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Session Invalidation Across Reactivation ---');
  // Reactivate the account
  storedAcc.is_active = true;

  // Old session token MUST still be rejected because revoked_at was permanently set
  const reactivatedOldTokenCheck = await pgStorage.verifySession(clientToken);
  assert.strictEqual(reactivatedOldTokenCheck, null, 'Old token must remain rejected after account reactivation');
  pass('Reactivating account does NOT revive previously revoked session; old token remains rejected');

  // --------------------------------------------------------------------------
  // Scenario 3 & 8: Account deactivation method & SQL identifier binding
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 3 & 8: Deactivation Methods & SQL Identifier Targeting ---');
  // Create another account and session
  const operatorAcc = await pgStorage.createAccount({
    legal_entity_name: 'Staff Operator 1',
    primary_email: 'op1@craftegon.com',
    primary_phone: '+91 9876500002',
    account_role: 'compliance_operator',
    password: 'OperatorPass2026!'
  }, { role: 'managing_partner' });
  assert.strictEqual(operatorAcc.account_role, 'compliance_operator');

  const { token: opToken } = await pgStorage.createSession(operatorAcc, {}, 3600);
  const opVerifiedBefore = await pgStorage.verifySession(opToken);
  assert.ok(opVerifiedBefore !== null);

  // Deactivate via deactivateAccount method
  db.queryLog = [];
  const deactRes = await pgStorage.deactivateAccount(operatorAcc.id, { role: 'managing_partner' });
  assert.strictEqual(deactRes.is_active, false);

  // Inspect the exact deactivation and revocation queries
  const deactSql = db.queryLog.find(q => /UPDATE\s+client_accounts\s+SET\s+is_active\s*=/i.test(q));
  const deactRevokeSql = db.queryLog.find(q => /UPDATE\s+auth_sessions\s+SET\s+revoked_at\s*=/i.test(q));

  assert.ok(deactSql, 'UPDATE client_accounts query must be dispatched');
  assert.ok(deactSql.includes(`WHERE id = '${operatorAcc.id}'`),
    'Deactivation SQL must target the exact account id');
  assert.ok(deactSql.includes('is_active = false'),
    'Deactivation SQL must bind boolean false to is_active');

  assert.ok(deactRevokeSql, 'UPDATE auth_sessions query must be dispatched on deactivation');
  assert.ok(deactRevokeSql.includes(`WHERE account_id = '${operatorAcc.id}'`),
    'Session revocation SQL must target the exact account id');

  const opVerifiedAfter = await pgStorage.verifySession(opToken);
  assert.strictEqual(opVerifiedAfter, null, 'Session must be immediately invalid after deactivation');
  pass('Account deactivation invalidates session; SQL queries target exact account identifier');

  // --------------------------------------------------------------------------
  // Scenario 5: Expired and explicitly revoked sessions remain rejected
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Expired and Explicitly Revoked Sessions ---');
  const client2 = await pgStorage.createAccount({
    legal_entity_name: 'Client 2 Corp',
    primary_email: 'client2@corp.com',
    primary_phone: '+91 9876500003',
    password: 'ValidPassword2026!'
  });

  // Session with TTL = 0 (immediately expired)
  const { token: expiredToken } = await pgStorage.createSession(client2, {}, 0);
  const expiredCheck = await pgStorage.verifySession(expiredToken);
  assert.strictEqual(expiredCheck, null, 'Expired session must return null');
  pass('Expired session is rejected by s.expires_at > CURRENT_TIMESTAMP condition');

  // Explicitly revoked session
  const { token: validToken } = await pgStorage.createSession(client2, {}, 3600);
  const revokeResult = await pgStorage.revokeSession(validToken);
  assert.strictEqual(revokeResult, true, 'revokeSession returns true');
  const revokedCheck = await pgStorage.verifySession(validToken);
  assert.strictEqual(revokedCheck, null, 'Explicitly revoked session must return null');
  pass('Explicitly revoked session is rejected by s.revoked_at IS NULL condition');

  // --------------------------------------------------------------------------
  // Scenario 6: Missing account is rejected safely
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Missing / Deleted Owning Account ---');
  // Synthesize an orphaned session pointing to a non-existent account ID
  const orphanedToken = `cct_${crypto.randomBytes(32).toString('hex')}`;
  const orphanedHash = hashToken(orphanedToken);
  db.authSessions.set(orphanedHash, {
    id: crypto.randomUUID(),
    session_token_hash: orphanedHash,
    account_id: 'non-existent-account-id-1234',
    role: 'client',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    revoked_at: null,
    created_at: new Date().toISOString()
  });

  const missingAccCheck = await pgStorage.verifySession(orphanedToken);
  assert.strictEqual(missingAccCheck, null, 'Missing owning account must return null');

  // Verify the orphaned session was also marked revoked
  const orphanedSessRecord = db.authSessions.get(orphanedHash);
  assert.ok(orphanedSessRecord.revoked_at !== null, 'Orphaned session must be permanently revoked');
  pass('Missing owning account safely rejected and session marked revoked');

  // --------------------------------------------------------------------------
  // Scenario 9, 10, 11: Privileged Account Creation & Role Privilege Gates
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 9, 10, 11: Privilege Context Audit & Role Boundaries ---');

  // 9. Ordinary context cannot create privileged accounts
  const ordMp = await pgStorage.createAccount({
    legal_entity_name: 'Attacker Org',
    primary_email: 'attacker_mp@test.com',
    account_role: 'managing_partner',
    password: 'AttackerPassword2026!'
  }, {}); // empty caller context
  assert.strictEqual(ordMp.account_role, 'client', 'Ordinary context forced to client');

  const clientCallerOp = await pgStorage.createAccount({
    legal_entity_name: 'Attacker Org 2',
    primary_email: 'attacker_op@test.com',
    account_role: 'compliance_operator',
    password: 'AttackerPassword2026!'
  }, { role: 'client' });
  assert.strictEqual(clientCallerOp.account_role, 'client', 'Client context forced to client');
  pass('Ordinary caller context cannot create privileged accounts (forced to client role)');

  // 10. Only Managing Partner or Internal Bootstrap can create staff
  const privMp = await pgStorage.createAccount({
    legal_entity_name: 'Valid Staff Desk',
    primary_email: 'staff_valid@craftegon.com',
    account_role: 'compliance_operator',
    password: 'StaffPassword2026!'
  }, { role: 'managing_partner' });
  assert.strictEqual(privMp.account_role, 'compliance_operator', 'Managing Partner can provision compliance_operator');

  const bootMp = await pgStorage.createAccount({
    legal_entity_name: 'Firm Leadership',
    primary_email: 'lead_mp@craftegon.com',
    account_role: 'managing_partner',
    password: 'LeaderPassword2026!'
  }, { isInternalBootstrap: true });
  assert.strictEqual(bootMp.account_role, 'managing_partner', 'Internal bootstrap can provision managing_partner');
  pass('Only established Managing Partner or internal bootstrap context can create permitted staff roles');

  // Audit on 'admin' pseudo-role: ensure context.role === 'admin' is NOT accepted
  const pseudoAdminCaller = await pgStorage.createAccount({
    legal_entity_name: 'Fake Admin Caller',
    primary_email: 'fake_admin@test.com',
    account_role: 'compliance_operator',
    password: 'FakePassword2026!'
  }, { role: 'admin' });
  assert.strictEqual(pseudoAdminCaller.account_role, 'client',
    'context.role === admin is not recognized as Managing Partner; caller forced to client');
  pass("Privilege context audit: 'admin' context is strictly rejected for staff provisioning (caller forced to client)");

  // 11. Unsupported roles remain rejected with HTTP 400 Bad Request
  let superadminError = null;
  try {
    await pgStorage.createAccount({
      legal_entity_name: 'Super Corp',
      primary_email: 'super@test.com',
      account_role: 'superadmin',
      password: 'SuperPassword2026!'
    }, { role: 'managing_partner' });
  } catch (err) {
    superadminError = err;
  }
  assert.ok(superadminError !== null, 'superadmin role must throw');
  assert.strictEqual(superadminError.statusCode, 400, 'Throws HTTP 400 Bad Request');
  pass('Unsupported roles (such as superadmin) are strictly rejected with HTTP 400 Bad Request');

  console.log('\n======================================================================');
  console.log(`TASK 004F-03AC TEST SUMMARY: ${passedAssertions} passed, 0 failed (${passedAssertions} total assertions)`);
  console.log('STATUS: ALL POSTGRESQL ACCOUNT-STATE AND PRIVILEGE AUDIT CONTROLS VERIFIED');
  console.log('======================================================================');
}

runTask03ACTests().catch(err => {
  console.error('Task 03AC Test Runner Fatal Error:', err);
  process.exit(1);
});
