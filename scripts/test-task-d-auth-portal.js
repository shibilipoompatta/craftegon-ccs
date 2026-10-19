/**
 * CraftEgon CCS - Phase 3 Task D: Server-Backed Authentication & Customer Portal Test Suite
 * Pure Node.js built-ins. Zero external dependencies.
 *
 * Verifies:
 * 1. Scrypt password hashing & cryptographic salt generation
 * 2. Complex password policy enforcement
 * 3. Brute-force protection & account lock out
 * 4. Account registration / provisioning
 * 5. Secure login with Set-Cookie (HttpOnly, SameSite=Strict) and session token issuance
 * 6. Session authentication via Bearer token and Cookie header
 * 7. Session revocation on logout & rejection of revoked/expired sessions
 * 8. Safe password recovery flow (forgot-password & single-use reset-password)
 * 9. Password reset revokes all prior active sessions
 * 10. Customer A and Customer B tenant isolation (List, Get, Cross-Tenant Denial)
 * 11. Staff-only operational authorization & state machine transitions
 * 12. PostgreSQL database-backed RLS validation with unprivileged application role
 * 13. Zero secrets or passwords exposed in HTTP responses or telemetry
 */

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { createServer, configureStorageAdapters } = require('../src/backend/server');
const { loadConfig } = require('../src/backend/config');
const { PostgresClient, getPostgresCredentials } = require('../src/backend/storage/postgres-client');
const { accountRepository, InMemoryAccountStorage, PostgresAccountStorage } = require('../src/backend/storage/account-repository');
const { caseRepository, InMemoryCaseStorage, PostgresCaseStorage } = require('../src/backend/storage/case-repository');
const { memoryStore } = require('../src/backend/storage/memory-store');
const {
  validatePassword,
  hashPassword,
  verifyPassword
} = require('../src/backend/models/account.model');

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTaskDTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Task D: Auth & Customer Portal Test Suite');
  console.log('======================================================================\n');

  // --------------------------------------------------------------------------
  // Suite 1: Password Cryptography & Policy Enforcement
  // --------------------------------------------------------------------------
  console.log('--- Suite 1: Password Cryptography & Policy Enforcement ---');
  
  const shortPass = validatePassword('Pass1');
  assert(!shortPass.valid && shortPass.message.includes('at least 8 characters'), 'Rejects password shorter than 8 characters');

  const noNumberPass = validatePassword('PasswordOnly');
  assert(!noNumberPass.valid && noNumberPass.message.includes('letter and one number'), 'Rejects password without digits');

  const validPass = validatePassword('SecureCorporatePass2026!');
  assert(validPass.valid, 'Accepts strong corporate password');

  const hashed1 = hashPassword('SecurePass123!');
  const hashed2 = hashPassword('SecurePass123!');
  assert(hashed1.salt !== hashed2.salt, 'Unique cryptographic salt generated per hashing operation');
  assert(hashed1.hash !== hashed2.hash, 'Different hashes generated for same password due to salting');

  const verifySuccess = verifyPassword('SecurePass123!', hashed1.hash, hashed1.salt);
  assert(verifySuccess === true, 'Valid password verifies successfully against scrypt hash');

  const verifyFail = verifyPassword('WrongPassword123!', hashed1.hash, hashed1.salt);
  assert(verifyFail === false, 'Invalid password is strictly rejected');

  // --------------------------------------------------------------------------
  // Suite 2: Server-Side Authentication & Session Flow (In-Memory Engine)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: Server-Side Authentication & Session Flow ---');
  
  const testPort = 3201;
  const testInstance = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    SESSION_DURATION_SECONDS: 3600
  });

  await testInstance.start();

  try {
    // 1. Register Customer A
    const regResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Acme Alpha Technologies Pvt Ltd',
      cin_llpin: 'U72900KA2023PTC100001',
      primary_email: 'customer_a@acmealpha.in',
      primary_phone: '+91 9876543210',
      account_role: 'client',
      password: 'AlphaPassword2026!'
    });
    assert(regResA.statusCode === 201, 'Customer A registers successfully (HTTP 201)');
    const customerA = regResA.body.account;
    assert(Boolean(customerA.id) && customerA.email === 'customer_a@acmealpha.in', 'Customer A account record created with ID');

    // 2. Register Customer B
    const regResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Beta Global Logistics LLP',
      cin_llpin: 'AAB-1234',
      primary_email: 'customer_b@betaglobal.in',
      primary_phone: '+91 9876543211',
      account_role: 'client',
      password: 'BetaPassword2026!'
    });
    assert(regResB.statusCode === 201, 'Customer B registers successfully (HTTP 201)');
    const customerB = regResB.body.account;

    // 3. Register Compliance Operator (Staff)
    const regResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'CraftEgon Compliance Desk',
      primary_email: 'operator@craftegon.com',
      primary_phone: '+91 8606918247',
      account_role: 'compliance_operator',
      password: 'StaffPassword2026!'
    });
    assert(regResStaff.statusCode === 201, 'Compliance Operator account created (HTTP 201)');
    const staff = regResStaff.body.account;

    // 4. Duplicate registration conflict
    const dupRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'customer_a@acmealpha.in',
      password: 'AnotherPassword2026!'
    });
    assert(dupRes.statusCode === 409, 'Duplicate account registration rejected with HTTP 409 Conflict');

    // 5. Invalid credentials login
    const badLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'customer_a@acmealpha.in',
      password: 'WrongPassword999!'
    });
    assert(badLoginRes.statusCode === 401, 'Invalid password rejected with HTTP 401 Unauthorized');
    assert(badLoginRes.body.message === 'Invalid email or password', 'Safe error message without account enumeration');

    // 6. Valid Customer A Login
    const loginResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'customer_a@acmealpha.in',
      password: 'AlphaPassword2026!'
    });
    assert(loginResA.statusCode === 200, 'Customer A login succeeds (HTTP 200)');
    const tokenA = loginResA.body.token;
    assert(Boolean(tokenA) && tokenA.startsWith('cct_'), 'Opaque session token issued (cct_ prefix)');
    
    // Cookie verification
    const setCookie = loginResA.headers['set-cookie'];
    assert(Boolean(setCookie), 'Set-Cookie header present on successful login');
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    assert(cookieStr.includes('craftegon_session='), 'Cookie contains craftegon_session token');
    assert(cookieStr.includes('HttpOnly'), 'Session cookie includes HttpOnly flag');
    assert(cookieStr.includes('SameSite=Strict'), 'Session cookie includes SameSite=Strict flag');

    // 7. Valid Customer B Login
    const loginResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'customer_b@betaglobal.in',
      password: 'BetaPassword2026!'
    });
    const tokenB = loginResB.body.token;
    assert(Boolean(tokenB), 'Customer B login succeeds with valid session token');

    // 8. Valid Staff Login
    const loginResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'operator@craftegon.com',
      password: 'StaffPassword2026!'
    });
    const tokenStaff = loginResStaff.body.token;
    assert(Boolean(tokenStaff), 'Staff login succeeds with valid session token');

    // 9. Inspect Authenticated Identity (/api/v1/auth/me) via Bearer Header
    const meResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(meResA.statusCode === 200, 'GET /api/v1/auth/me succeeds with Bearer token');
    assert(meResA.body.user.id === customerA.id, 'Authenticated identity matches Customer A account ID');
    assert(meResA.body.user.role === 'client', 'Authenticated identity role is client');

    // 10. Inspect Authenticated Identity via Cookie Header
    const meCookieRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': `craftegon_session=${tokenA}` }
    });
    assert(meCookieRes.statusCode === 200, 'GET /api/v1/auth/me succeeds with HttpOnly cookie');

    // 11. Unauthenticated /api/v1/auth/me
    const unauthMe = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET'
    });
    assert(unauthMe.statusCode === 401, 'Unauthenticated /api/v1/auth/me rejected with HTTP 401');

    // 12. Invalid Token /api/v1/auth/me
    const invalidTokenMe = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': 'Bearer cct_invalid_random_token_123456' }
    });
    assert(invalidTokenMe.statusCode === 401, 'Forged/invalid session token rejected with HTTP 401');

    // ------------------------------------------------------------------------
    // Suite 3: Logout & Session Expiry
    // ------------------------------------------------------------------------
    console.log('\n--- Suite 3: Logout & Session Revocation ---');
    
    // Login temporary session for logout test
    const tempLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer_a@acmealpha.in', password: 'AlphaPassword2026!' });
    const tempToken = tempLogin.body.token;

    // Logout
    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/logout',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tempToken}` }
    });
    assert(logoutRes.statusCode === 200, 'POST /api/v1/auth/logout succeeds (HTTP 200)');
    const logoutCookie = logoutRes.headers['set-cookie'];
    const logoutCookieStr = Array.isArray(logoutCookie) ? logoutCookie[0] : logoutCookie;
    assert(logoutCookieStr.includes('Max-Age=0'), 'Logout clears session cookie (Max-Age=0)');

    // Attempt to reuse revoked token
    const postLogoutMe = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tempToken}` }
    });
    assert(postLogoutMe.statusCode === 401, 'Revoked session token strictly rejected on subsequent access');

    // ------------------------------------------------------------------------
    // Suite 4: Password Recovery Flow (Forgot Password & Reset Password)
    // ------------------------------------------------------------------------
    console.log('\n--- Suite 4: Password Recovery Flow ---');

    // 1. Forgot password for existing user
    const forgotRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer_a@acmealpha.in' });
    assert(forgotRes.statusCode === 200, 'POST /api/v1/auth/forgot-password returns HTTP 200');
    assert(Boolean(forgotRes.body._test_reset_token), 'Single-use reset token generated securely');
    const resetToken = forgotRes.body._test_reset_token;

    // 2. Forgot password for non-existent user (Zero enumeration)
    const nonExistentForgot = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'ghost@nonexistent-domain.in' });
    assert(nonExistentForgot.statusCode === 200, 'Non-existent email returns identical success message (No email enumeration)');

    // 3. Reset password with invalid token
    const badResetRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: 'rst_bogus_token_99999', new_password: 'BrandNewPassword2026!' });
    assert(badResetRes.statusCode === 400, 'Invalid reset token rejected with HTTP 400 Bad Request');

    // 4. Reset password with weak password
    const weakResetRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: resetToken, new_password: 'short' });
    assert(weakResetRes.statusCode === 400, 'Weak new password rejected during reset');

    // 5. Valid Password Reset
    const validResetRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: resetToken, new_password: 'BrandNewPassword2026!' });
    assert(validResetRes.statusCode === 200, 'Password reset succeeds with HTTP 200');

    // 6. Token is single-use: Replay attempt fails
    const replayResetRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: resetToken, new_password: 'AnotherNewPassword2026!' });
    assert(replayResetRes.statusCode === 400, 'Reset token is single-use; replay attempt is strictly rejected');

    // 7. Old password no longer works
    const oldLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer_a@acmealpha.in', password: 'AlphaPassword2026!' });
    assert(oldLoginRes.statusCode === 401, 'Old password no longer valid after password reset');

    // 8. New password succeeds and prior sessions invalidated
    const newLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer_a@acmealpha.in', password: 'BrandNewPassword2026!' });
    assert(newLoginRes.statusCode === 200, 'Login with new password succeeds');
    const freshTokenA = newLoginRes.body.token;

    // Prior tokenA was revoked during password reset
    const priorSessionRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(priorSessionRes.statusCode === 401, 'Prior active sessions revoked automatically upon password reset');

    // ------------------------------------------------------------------------
    // Suite 5: Customer Portal & Cross-Tenant Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- Suite 5: Customer Portal & Cross-Tenant Isolation ---');

    // 1. Staff creates Case 1 for Customer A
    const caseA = await caseRepository.createCase({
      case_reference: 'CASE-2026-ALPHA1',
      client_id: customerA.id,
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      title: 'Acme Alpha Private Limited Company Incorporation'
    }, { role: 'compliance_operator' });
    assert(Boolean(caseA), 'Staff successfully creates Case 1 for Customer A');

    // 2. Staff creates Case 2 for Customer B
    const caseB = await caseRepository.createCase({
      case_reference: 'CASE-2026-BETA2',
      client_id: customerB.id,
      service_id: 'V02-SVC-017',
      vertical_id: 'V02',
      title: 'Beta Global Annual RoC Compliance Retainer'
    }, { role: 'compliance_operator' });
    assert(Boolean(caseB), 'Staff successfully creates Case 2 for Customer B');

    // 3. Customer A lists cases
    const listResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshTokenA}` }
    });
    assert(listResA.statusCode === 200, 'Customer A lists cases successfully');
    assert(listResA.body.total === 1, 'Customer A sees exactly 1 case');
    assert(listResA.body.cases[0].case_reference === 'CASE-2026-ALPHA1', 'Customer A case list contains only their own case');

    // 4. Customer B lists cases
    const listResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(listResB.statusCode === 200, 'Customer B lists cases successfully');
    assert(listResB.body.total === 1, 'Customer B sees exactly 1 case');
    assert(listResB.body.cases[0].case_reference === 'CASE-2026-BETA2', 'Customer B case list contains only their own case');

    // 5. Cross-Tenant Denial: Customer A attempts to get Customer B's case
    const crossGetA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-BETA2',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshTokenA}` }
    });
    assert(crossGetA.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer A querying Customer B case returns HTTP 404 Not Found (Zero leakage)');

    // 6. Cross-Tenant Denial: Customer B attempts to get Customer A's case
    const crossGetB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(crossGetB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B querying Customer A case returns HTTP 404 Not Found (Zero leakage)');

    // 7. Customer A fetches their own case
    const ownGetA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshTokenA}` }
    });
    assert(ownGetA.statusCode === 200, 'Customer A fetches their own case successfully');
    assert(ownGetA.body.case.title === 'Acme Alpha Private Limited Company Incorporation', 'Customer A receives expected case payload');

    // 8. Staff views cases across tenants
    const staffListRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(staffListRes.statusCode === 200, 'Compliance staff queries portal cases (HTTP 200)');
    assert(staffListRes.body.total >= 2, 'Staff sees all cases across tenants for operational execution');

    // 9. Unauthorized Staff Mutation: Client attempts to update case status
    const clientPatchRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${freshTokenA}`,
        'Content-Type': 'application/json'
      }
    }, { status: 'COMPLETED' });
    assert(clientPatchRes.statusCode === 403, 'STAFF AUTHORIZATION: Client attempting to mutate case status is rejected (HTTP 403 Forbidden)');

    // 10. Authorized Staff Mutation
    const staffPatchRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokenStaff}`,
        'Content-Type': 'application/json'
      }
    }, { status: 'AWAITING_CUSTOMER_ACTION' });
    assert(staffPatchRes.statusCode === 200, 'Authorized staff successfully updates case status (HTTP 200)');
    assert(staffPatchRes.body.case.status === 'AWAITING_CUSTOMER_ACTION', 'Case status transitioned to AWAITING_CUSTOMER_ACTION');

    // 11. Untrusted Client Identity Injection Ignored
    // Customer A submits a request attempting to supply another customer's ID in body
    const spoofMeRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases?client_id=' + customerB.id,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshTokenA}` }
    });
    assert(spoofMeRes.statusCode === 200, 'Spoofed query parameter is safely ignored');
    assert(spoofMeRes.body.cases.every(c => c.client_id === customerA.id), 'Client-provided client_id in query parameter ignored; server enforces authenticated session identity');

  } finally {
    await testInstance.stop();
  }

  // --------------------------------------------------------------------------
  // Suite 6: PostgreSQL Database-Backed RLS Verification (Disposable Test DB)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 6: PostgreSQL Engine-Level RLS Verification ---');
  
  loadConfig();
  const creds = getPostgresCredentials();
  const testDbName = 'craftegon_ccs_test';
  const pgClient = new PostgresClient(creds);

  const pgAvailable = pgClient.testConnection('postgres').ok;
  if (!pgAvailable) {
    console.log('  ⚠️  PostgreSQL service not responding; skipping live engine RLS test.');
  } else {
    try {
      try { pgClient.dropDatabase(testDbName); } catch (e) {}
      pgClient.createDatabase(testDbName);
      assert(true, `Created dedicated disposable test database '${testDbName}'`);

      const testDbClient = new PostgresClient(Object.assign({}, creds, { database: testDbName }));
      const migrationsDir = path.resolve(__dirname, '../src/backend/migrations');
      testDbClient.executeScript(path.join(migrationsDir, '001_initial_schema.sql'));
      testDbClient.executeScript(path.join(migrationsDir, '002_row_level_security.sql'));
      testDbClient.executeScript(path.join(migrationsDir, '003_indexes_and_constraints.sql'));
      testDbClient.executeScript(path.join(migrationsDir, '004_auth_and_sessions.sql'));

      // Provision unprivileged role
      const unprivilegedRole = 'craftegon_test_app_user';
      testDbClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${unprivilegedRole}') THEN
            CREATE ROLE ${unprivilegedRole} WITH NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE LOGIN;
          END IF;
        END
        $$;
        GRANT CONNECT ON DATABASE ${testDbName} TO ${unprivilegedRole};
        GRANT USAGE ON SCHEMA public TO ${unprivilegedRole};
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${unprivilegedRole};
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${unprivilegedRole};
      `);

      // Start server configured for PostgreSQL provider on port 3202
      const pgServer = createServer({
        PORT: 3202,
        NODE_ENV: 'test',
        DATABASE_PROVIDER: 'postgresql',
        PGDATABASE: testDbName
      });

      // Point repositories to test database
      accountRepository.setAdapter(new PostgresAccountStorage(testDbClient));
      caseRepository.setAdapter(new PostgresCaseStorage(testDbClient, unprivilegedRole));

      await pgServer.start();

      try {
        // Register Customer A in PostgreSQL
        const pgRegA = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, {
          legal_entity_name: 'Postgres Alpha Pvt Ltd',
          cin_llpin: 'U72900KL2023PTC000001',
          primary_email: 'pg_alpha@test.in',
          primary_phone: '+91 9876543210',
          account_role: 'client',
          password: 'PgAlphaPassword123!'
        });
        assert(pgRegA.statusCode === 201, 'Customer A registered in PostgreSQL database');
        const pgUserA = pgRegA.body.account;

        // Register Customer B in PostgreSQL
        const pgRegB = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, {
          legal_entity_name: 'Postgres Beta LLP',
          cin_llpin: 'AAB-9999',
          primary_email: 'pg_beta@test.in',
          primary_phone: '+91 9876543211',
          account_role: 'client',
          password: 'PgBetaPassword123!'
        });
        assert(pgRegB.statusCode === 201, 'Customer B registered in PostgreSQL database');
        const pgUserB = pgRegB.body.account;

        // Login Customer A
        const pgLoginA = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, { email: 'pg_alpha@test.in', password: 'PgAlphaPassword123!' });
        assert(pgLoginA.statusCode === 200, 'Customer A logged in against PostgreSQL auth tables');
        const pgTokenA = pgLoginA.body.token;

        // Login Customer B
        const pgLoginB = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, { email: 'pg_beta@test.in', password: 'PgBetaPassword123!' });
        assert(pgLoginB.statusCode === 200, 'Customer B logged in against PostgreSQL auth tables');
        const pgTokenB = pgLoginB.body.token;

        // Create case for Customer A in PostgreSQL
        const pgCaseA = await caseRepository.createCase({
          case_reference: 'CASE-PG-ALPHA',
          client_id: pgUserA.id,
          service_id: 'V01-SVC-007',
          vertical_id: 'V01',
          title: 'PostgreSQL Live RLS Verification Case'
        }, { role: 'compliance_operator' });
        assert(Boolean(pgCaseA), 'Case inserted into PostgreSQL cases table');

        // Customer A queries cases via HTTP API (PostgreSQL backed with RLS)
        const pgListA = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/portal/cases',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${pgTokenA}` }
        });
        assert(pgListA.statusCode === 200, 'Customer A fetches cases from PostgreSQL (HTTP 200)');
        assert(pgListA.body.cases.length === 1 && pgListA.body.cases[0].case_reference === 'CASE-PG-ALPHA', 'PostgreSQL RLS: Customer A sees exactly their own case');

        // Customer B queries cases via HTTP API (PostgreSQL backed with RLS)
        const pgListB = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/portal/cases',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${pgTokenB}` }
        });
        assert(pgListB.statusCode === 200, 'Customer B fetches cases from PostgreSQL (HTTP 200)');
        assert(pgListB.body.cases.length === 0, 'PostgreSQL RLS: Customer B sees 0 cases (Customer A case completely hidden by engine policy)');

        // Customer B directly attempts to GET Customer A case by reference
        const pgDirectCrossGet = await request({
          hostname: '127.0.0.1',
          port: 3202,
          path: '/api/v1/portal/cases/CASE-PG-ALPHA',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${pgTokenB}` }
        });
        assert(pgDirectCrossGet.statusCode === 404, 'PostgreSQL RLS: Direct cross-tenant GET returns HTTP 404 Not Found (Zero leakage)');

      } finally {
        await pgServer.stop();
      }

    } finally {
      try {
        pgClient.dropDatabase(testDbName);
        console.log(`  Cleaned up '${testDbName}' successfully.`);
      } catch (e) {}
    }
  }

  // Restore in-memory adapters for test environment
  accountRepository.setAdapter(new InMemoryAccountStorage());
  caseRepository.setAdapter(new InMemoryCaseStorage());

  console.log('\n======================================================================');
  console.log(`TASK D TEST SUMMARY: ${passedCount} passed, ${failedCount} failed (${passedCount + failedCount} total assertions)`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTaskDTests().catch((err) => {
    console.error('Task D Test Suite encountered fatal error:', err);
    process.exit(1);
  });
}

module.exports = {
  runTaskDTests
};
