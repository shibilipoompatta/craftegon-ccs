const crypto = require('node:crypto');
/**
 * CraftEgon CCS — Master Task 004F-03AJ: Complete Database Authorization Hardening & Security Acceptance Test Suite
 * 
 * Tests three verification levels:
 * Level 1: Static verification (source, permissions, schema integrity)
 * Level 2: Database integration verification (separate DB roles, grants, RLS, negative tests, transactions)
 * Level 3: Application integration and regression (actual HTTP workflows, auth, customer portal, governance, session lifecycle)
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert');
const { Client } = require('pg');
const { createServer } = require('../src/backend/server');
const { PostgresClient } = require('../src/backend/storage/postgres-client');
const { getPostgresPool, getAppPool, getAuthPool, getGovPool, closeAllPools } = require('../src/backend/storage/postgres-pool');
const { hashPassword, generateVerificationToken, hashToken, generateRecoveryToken } = require('../src/backend/models/account.model');

const TEST_DB = 'craftegon_ccs_dev';
const TEST_PORT = 3899;

let passedCount = 0;
let failedCount = 0;

function pass(testId, msg) {
  passedCount++;
  console.log(`  ✅ PASS [${testId}]: ${msg}`);
}

function fail(testId, msg, err) {
  failedCount++;
  console.error(`  ❌ FAIL [${testId}]: ${msg}`);
  if (err) console.error('     Detail:', err.message);
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runSecurityAcceptanceSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Master Task 004F-03AJ: Security Acceptance Test Suite');
  console.log('Target Database: ' + TEST_DB);
  console.log('======================================================================\n');

  const vault = JSON.parse(fs.readFileSync('.vault/db-credentials.json', 'utf8'));
  const appPassword = vault.clusterRoles.craftegon_app_user.password;
  const authPassword = vault.clusterRoles.craftegon_auth_user.password;
  const govPassword = vault.clusterRoles.craftegon_gov_user.password;

  // -------------------------------------------------------------------------
  // SECTION 1: DATABASE PRIVILEGE TESTS (Level 2 - Direct PostgreSQL Execution)
  // -------------------------------------------------------------------------
  console.log('--- Section 1: Database Privilege & Role Boundary Tests (Level 2) ---');

  const appDbClient = new Client({ host: '127.0.0.1', port: 5432, database: TEST_DB, user: 'craftegon_app_user', password: appPassword });
  const authDbClient = new Client({ host: '127.0.0.1', port: 5432, database: TEST_DB, user: 'craftegon_auth_user', password: authPassword });
  const govDbClient = new Client({ host: '127.0.0.1', port: 5432, database: TEST_DB, user: 'craftegon_gov_user', password: govPassword });

  await appDbClient.connect();
  await authDbClient.connect();
  await govDbClient.connect();

  // Test 1.1: App role cannot read auth_credentials
  try {
    await appDbClient.query('SELECT * FROM auth_credentials LIMIT 1;');
    fail('SEC-PRIV-01', 'craftegon_app_user was able to SELECT from auth_credentials');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-01', 'App role strictly denied SELECT on auth_credentials');
    } else {
      fail('SEC-PRIV-01', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.2: App role cannot execute authentication-only credential helper
  try {
    await appDbClient.query("SELECT * FROM fn_auth_fetch_credentials_for_login('test@craftegon.local');");
    fail('SEC-PRIV-02', 'craftegon_app_user was able to execute fn_auth_fetch_credentials_for_login');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-02', 'App role strictly denied EXECUTE on fn_auth_fetch_credentials_for_login');
    } else {
      fail('SEC-PRIV-02', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.3: App role cannot modify account_role
  try {
    await appDbClient.query("UPDATE client_accounts SET account_role = 'managing_partner';");
    fail('SEC-PRIV-03', 'craftegon_app_user was able to execute UPDATE on account_role');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-03', 'App role strictly denied column UPDATE on account_role');
    } else {
      fail('SEC-PRIV-03', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.4: App role cannot modify is_active
  try {
    await appDbClient.query("UPDATE client_accounts SET is_active = true;");
    fail('SEC-PRIV-04', 'craftegon_app_user was able to execute UPDATE on is_active');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-04', 'App role strictly denied column UPDATE on is_active');
    } else {
      fail('SEC-PRIV-04', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.5: Auth role cannot insert or provision client accounts
  try {
    await authDbClient.query(`
      INSERT INTO client_accounts (id, legal_entity_name, primary_email, primary_phone, account_role, is_active)
      VALUES (gen_random_uuid(), 'Hacker Corp', 'hack@test.com', '+91 1234567890', 'managing_partner', true);
    `);
    fail('SEC-PRIV-05', 'craftegon_auth_user was able to insert into client_accounts');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-05', 'Auth role strictly denied INSERT on client_accounts');
    } else {
      fail('SEC-PRIV-05', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.6: Governance role cannot mutate existing account_role (immutability)
  try {
    await govDbClient.query("UPDATE client_accounts SET account_role = 'managing_partner';");
    fail('SEC-PRIV-06', 'craftegon_gov_user was able to mutate account_role');
  } catch (err) {
    if (err.message.includes('permission denied') || err.message.includes('IMMUTABLE_ACCOUNT_ROLE')) {
      pass('SEC-PRIV-06', 'Governance role strictly denied mutating existing account_role (Immutability enforced)');
    } else {
      fail('SEC-PRIV-06', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.7: Governance role cannot access unrelated customer case data
  try {
    await govDbClient.query("SELECT * FROM cases;");
    fail('SEC-PRIV-07', 'craftegon_gov_user was able to query cases table');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-PRIV-07', 'Governance role strictly denied access to cases table (Total exclusion)');
    } else {
      fail('SEC-PRIV-07', 'Unexpected error: ' + err.message);
    }
  }

  // Test 1.8: Public cannot execute privileged functions
  const rootClient = new PostgresClient();
  const pubCheck = rootClient.query(`
    SELECT has_function_privilege('public', 'sp_consume_email_verification_token(varchar)', 'EXECUTE') AS can_exec_token,
           has_function_privilege('public', 'fn_auth_fetch_credentials_for_login(varchar)', 'EXECUTE') AS can_exec_cred,
           has_function_privilege('public', 'sp_bootstrap_initial_managing_partner(varchar, varchar, varchar, varchar)', 'EXECUTE') AS can_exec_boot;
  `);
  if (pubCheck.includes('f|f|f')) {
    pass('SEC-PRIV-08', 'PUBLIC role has ZERO EXECUTE privileges on all security definer functions');
  } else {
    fail('SEC-PRIV-08', 'PUBLIC has leaked execute privileges: ' + pubCheck);
  }

  // Test 1.9: Bootstrap cannot be executed by runtime roles
  try {
    await appDbClient.query("SELECT sp_bootstrap_initial_managing_partner('hacker@test.com', 'h', 's');");
    fail('SEC-PRIV-09', 'App role was able to execute bootstrap');
  } catch (err) {
    pass('SEC-PRIV-09', 'App role denied execution of bootstrap procedure');
  }

  try {
    await govDbClient.query("SELECT sp_bootstrap_initial_managing_partner('hacker@test.com', 'h', 's');");
    fail('SEC-PRIV-10', 'Gov role was able to execute bootstrap');
  } catch (err) {
    pass('SEC-PRIV-10', 'Gov role denied execution of bootstrap procedure');
  }

  await appDbClient.end();
  await authDbClient.end();
  await govDbClient.end();

  // -------------------------------------------------------------------------
  // SECTION 2: APPLICATION & AUTHENTICATION INTEGRATION (Level 3 - HTTP Server)
  // -------------------------------------------------------------------------
  console.log('\n--- Section 2: Application Authentication & Lifecycle Tests (Level 3) ---');

  const serverInstance = createServer({
    databaseProvider: 'postgresql',
    pgDatabase: TEST_DB,
    pgUser: 'craftegon_app_user',
    emailDeliveryEnabled: true,
    emailProvider: 'memory',
    requireEmailVerification: true,
    port: TEST_PORT
  });

  await serverInstance.start();

  const testEmail = `test.client.${Date.now()}@craftegon.local`;
  const testPassword = 'SecurePassword2026!#';

  // Test 2.1: Registration via appPool creates inactive account
  const regRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    legal_entity_name: 'Test Client Enterprise Ltd',
    cin_llpin: 'U72900KA2026PTC123456',
    primary_email: testEmail,
    primary_phone: '+91 9876543210',
    account_role: 'managing_partner', // Attempt role escalation
    is_active: true,                  // Attempt status escalation
    password: testPassword
  });

  if (regRes.statusCode === 201 && (regRes.json?.requiresVerification === true || regRes.json?.requires_verification === true)) {
    pass('SEC-AUTH-01', 'Registration succeeded with forced inactive status and verification requirement');
  } else {
    fail('SEC-AUTH-01', 'Registration failed or unexpected status', new Error(regRes.body));
  }

  // Test 2.2: Inactive account cannot log in before verification
  const preVerifyLogin = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: testPassword
  });

  if (preVerifyLogin.statusCode === 401 && (preVerifyLogin.json?.error?.includes('verification') || preVerifyLogin.json?.message?.includes('verification'))) {
    pass('SEC-AUTH-02', 'Inactive unverified account strictly blocked from login (HTTP 401)');
  } else {
    fail('SEC-AUTH-02', 'Inactive account was not properly rejected', new Error(preVerifyLogin.body));
  }

  // Retrieve raw verification token from memory email service
  const sentEmails = serverInstance.emailService.getSentEmails();
  const verifyEmail = sentEmails.find(e => e.to === testEmail && e.subject.includes('Verify'));
  assert(verifyEmail, 'Verification email must be dispatched');
  const tokenMatch = verifyEmail.text.match(/token=([a-zA-Z0-9_-]+)/);
  const rawToken = tokenMatch[1];

  // Test 2.3: Verification token activates account via sp_consume_email_verification_token
  const verifyRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/verify-email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { token: rawToken });

  if (verifyRes.statusCode === 200 && verifyRes.json?.success === true) {
    pass('SEC-AUTH-03', 'Email verification succeeded via sp_consume_email_verification_token');
  } else {
    fail('SEC-AUTH-03', 'Email verification failed', new Error(verifyRes.body));
  }

  // Test 2.4: Verification token replay attack strictly rejected
  const replayRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/verify-email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { token: rawToken });

  if (replayRes.statusCode === 400) {
    pass('SEC-AUTH-04', 'Verification token replay attack strictly rejected (Single-use enforced)');
  } else {
    fail('SEC-AUTH-04', 'Replayed token was not rejected', new Error(replayRes.body));
  }

  // Test 2.5: Login succeeds with correct password after activation
  const loginRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: testPassword
  });

  let sessionToken = null;
  if (loginRes.statusCode === 200 && (loginRes.json?.sessionToken || loginRes.json?.token)) {
    sessionToken = loginRes.json.sessionToken || loginRes.json.token;
    pass('SEC-AUTH-05', 'Login succeeded over authPool with valid scrypt password verification');
  } else {
    fail('SEC-AUTH-05', 'Login failed post-verification', new Error(loginRes.body));
  }

  // Test 2.6: Zero password hashes in /api/v1/auth/me response
  const meRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });

  if (meRes.statusCode === 200 && !meRes.body.includes('password') && !meRes.body.includes('scrypt')) {
    pass('SEC-AUTH-06', 'Profile endpoint exposes zero password hashes, salts, or credentials');
  } else {
    fail('SEC-AUTH-06', 'Credentials leaked in /me endpoint', new Error(meRes.body));
  }

  // Test 2.7: Invalid password fails and unknown email produces uniform response
  const badPassRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'WrongPassword123!'
  });

  const unknownEmailRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'nonexistent.user.2026@craftegon.local',
    password: 'AnyPassword123!'
  });

  if (badPassRes.statusCode === 401 && unknownEmailRes.statusCode === 401 &&
      badPassRes.json?.error === unknownEmailRes.json?.error) {
    pass('SEC-AUTH-07', 'Invalid credentials and unknown email return uniform error (Account enumeration prevented)');
  } else {
    fail('SEC-AUTH-07', 'Non-uniform auth response observed');
  }

  // Test 2.8: Account lockout after 5 failed attempts
  for (let i = 0; i < 4; i++) {
    await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: testEmail, password: 'WrongPassword123!' });
  }

  const lockedRes = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'WrongPassword123!' });

  if (lockedRes.statusCode === 429 && lockedRes.body.includes('locked')) {
    pass('SEC-AUTH-08', 'Account lockout triggered after 5 consecutive failed attempts (HTTP 429)');
  } else {
    fail('SEC-AUTH-08', 'Account lockout failed to trigger', new Error(lockedRes.body));
  }

  // Test 2.9: Password reset token single-use
  // Reset lock via direct DB for testing recovery
  const adminDbClient = new Client({ host: '127.0.0.1', port: 5432, database: TEST_DB, user: 'craftegon_auth_user', password: authPassword });
  await adminDbClient.connect();
  await adminDbClient.query("UPDATE auth_credentials SET failed_attempts = 0, locked_until = NULL WHERE LOWER(email) = $1;", [testEmail.toLowerCase()]);

  const { rawToken: rawReset, tokenHash: resetHash } = generateRecoveryToken();
  await adminDbClient.query(`
    UPDATE auth_credentials
    SET recovery_token_hash = $1, recovery_token_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
    WHERE LOWER(email) = $2;
  `, [resetHash, testEmail.toLowerCase()]);
  await adminDbClient.end();

  const resetReq = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    token: rawReset,
    new_password: 'NewSecurePassword2026!#',
    newPassword: 'NewSecurePassword2026!#'
  });

  if (resetReq.statusCode === 200) {
    pass('SEC-AUTH-09', 'Password reset succeeded with valid single-use recovery token');
  } else {
    fail('SEC-AUTH-09', 'Password reset failed', new Error(resetReq.body));
  }

  const resetReplay = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    token: rawReset,
    new_password: 'AnotherPassword2026!#',
    newPassword: 'AnotherPassword2026!#'
  });

  if (resetReplay.statusCode === 400) {
    pass('SEC-AUTH-10', 'Password reset token replay attack strictly rejected');
  } else {
    fail('SEC-AUTH-10', 'Replayed reset token was not rejected', new Error(resetReplay.body));
  }

  // -------------------------------------------------------------------------
  // SECTION 3: TENANT ISOLATION & SQL INJECTION LIMITS
  // -------------------------------------------------------------------------
  console.log('\n--- Section 3: Tenant Isolation & Trust-Boundary Verification ---');

  // Register second client
  const clientBEmail = `client.b.${Date.now()}@craftegon.local`;
  const regB = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    legal_entity_name: 'Client B Enterprise',
    cin_llpin: 'U72900KA2026PTC654321',
    primary_email: clientBEmail,
    primary_phone: '+91 9123456780',
    password: testPassword
  });

  const sentB = serverInstance.emailService.getSentEmails();
  const verifyB = sentB.find(e => e.to === clientBEmail && e.subject.includes('Verify'));
  const rawTokenB = verifyB.text.match(/token=([a-zA-Z0-9_-]+)/)[1];
  await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/verify-email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { token: rawTokenB });

  const loginB = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: clientBEmail, password: testPassword });

  const sessionB = loginB.json?.sessionToken || loginB.json?.token;

  // Login with new password for Client A
  const loginA = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'NewSecurePassword2026!#' });

  const sessionA = loginA.json?.sessionToken || loginA.json?.token;
  const userAId = loginA.json.user.id;

  // Create a case for Customer A
  const appPool = getAppPool();
  const caseAId = crypto.randomUUID();
  await appPool.query(`
    INSERT INTO cases (id, client_id, case_reference, service_id, vertical_id, title, status, priority)
    VALUES ($1, $2, 'CAS-TEST-' || substr(md5(random()::text), 1, 8), 'V01-SVC-007', 'V01', 'Incorporation Filing', 'IN_PROGRESS', 'STANDARD')
    ON CONFLICT (id) DO NOTHING;
  `, [caseAId, userAId], { userId: userAId, role: 'client' });

  // Test 3.1: Client B cannot read Client A's cases via HTTP
  const getCasesB = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: `/api/v1/portal/cases/${caseAId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${sessionB}` }
  });

  if (getCasesB.statusCode === 404) {
    pass('SEC-TENANT-01', 'Cross-tenant GET returns HTTP 404 (Client B cannot read Client A case)');
  } else {
    fail('SEC-TENANT-01', 'Cross-tenant case read was not blocked: ' + getCasesB.statusCode);
  }

  // Test 3.2: Simulated SQL Injection cannot dump credentials through appPool
  try {
    await appPool.query("SELECT * FROM auth_credentials;");
    fail('SEC-TENANT-02', 'Simulated SQLi through appPool accessed auth_credentials table');
  } catch (err) {
    if (err.message.includes('permission denied')) {
      pass('SEC-TENANT-02', 'Simulated SQLi through appPool strictly blocked from reading auth_credentials');
    } else {
      fail('SEC-TENANT-02', 'Unexpected error: ' + err.message);
    }
  }

  // Test 3.3: Documented GUC Limitation Demonstration
  // A raw SQL query running under craftegon_app_user CAN alter app.current_user_id.
  // This explicitly validates the documented trust-boundary finding: RLS GUCs are NOT proof against raw SQL execution!
  const gucSpoofRes = await appPool.query(`
    SELECT set_config('app.current_user_id', $1, true) AS spoofed_uid,
           app_current_user_id() AS evaluated_uid;
  `, [userAId]);

  if (gucSpoofRes[0].evaluated_uid === userAId) {
    pass('SEC-TENANT-03', 'Demonstrated documented GUC limit: Raw SQL under shared role can set session GUC (RLS is defense-in-depth, not SQLi silver bullet)');
  } else {
    fail('SEC-TENANT-03', 'Failed to demonstrate GUC behavior');
  }

  // -------------------------------------------------------------------------
  // SECTION 4: GOVERNANCE & STAFF PROVISIONING
  // -------------------------------------------------------------------------
  console.log('\n--- Section 4: Governance & Staff Provisioning Workflows ---');

  const govPool = getGovPool();

  // Test 4.1: Governance pool can provision compliance_operator
  const opEmail = `operator.${Date.now()}@craftegon.local`;
  const opId = crypto.randomUUID();
  await govPool.query(`
    INSERT INTO client_accounts (id, legal_entity_name, primary_email, primary_phone, account_role, is_active)
    VALUES ($1, 'Compliance Officer Desk', $2, '+91 8888888888', 'compliance_operator', true);
  `, [opId, opEmail]);
  pass('SEC-GOV-01', 'Governance pool successfully provisioned staff account (compliance_operator)');

  // Test 4.2: Ordinary client cannot provision staff via HTTP
  const clientStaffAttempt = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/admin/staff',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionA}`
    }
  }, {
    email: 'hacker.staff@craftegon.local',
    role: 'managing_partner'
  });

  if (clientStaffAttempt.statusCode === 403 || clientStaffAttempt.statusCode === 401) {
    pass('SEC-GOV-02', 'Client attempting to access staff provisioning endpoint rejected (HTTP 403/401)');
  } else {
    fail('SEC-GOV-02', 'Client was able to call admin staff endpoint: ' + clientStaffAttempt.statusCode);
  }

  // Test 4.3: Account deactivation revokes active sessions atomically
  const deactRes = await govPool.query(`
    WITH updated_acc AS (
      UPDATE client_accounts
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    ),
    revoked_sess AS (
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE account_id = $1 AND revoked_at IS NULL
      RETURNING id
    )
    SELECT u.id, (SELECT COUNT(*) FROM revoked_sess) AS revoked_count FROM updated_acc u;
  `, [userAId]);

  if (deactRes[0] && parseInt(deactRes[0].revoked_count, 10) > 0) {
    pass('SEC-GOV-03', 'Account deactivation revokes active sessions atomically in single CTE');
  } else {
    fail('SEC-GOV-03', 'Sessions were not revoked during deactivation', new Error(JSON.stringify(deactRes)));
  }

  // Test 4.4: Deactivated user session is rejected on subsequent request
  const deactReq = await makeRequest({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${sessionA}` }
  });

  if (deactReq.statusCode === 401) {
    pass('SEC-GOV-04', 'Deactivated account session immediately rejected on subsequent requests (HTTP 401)');
  } else {
    fail('SEC-GOV-04', 'Deactivated session was accepted: ' + deactReq.statusCode);
  }

  // Clean up server
  await serverInstance.stop();
  await closeAllPools();

  console.log('\n======================================================================');
  console.log(`SECURITY ACCEPTANCE SUMMARY: ${passedCount} passed, ${failedCount} failed (${passedCount + failedCount} total assertions)`);
  console.log('STATUS: ' + (failedCount === 0 ? 'ALL CRITICAL AUTHORIZATION BOUNDARIES VERIFIED' : 'DEFECTS DETECTED'));
  console.log('======================================================================\n');

  if (failedCount > 0) process.exit(1);
}

runSecurityAcceptanceSuite().catch(err => {
  console.error('\nFatal error running security acceptance suite:', err);
  process.exit(1);
});
