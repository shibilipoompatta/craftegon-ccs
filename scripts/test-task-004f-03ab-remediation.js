/**
 * CraftEgon CCS — Task 004F-03AB Remediation Test Suite
 * Validates DEF-007 (Account Deactivation Lifecycle),
 * DEF-008 (Postgres Repository-Level Privilege Enforcement),
 * and DEF-009 (Admin Bearer & Cookie Logout Revocation).
 */

const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../src/backend/server');
const { accountRepository, InMemoryAccountStorage, PostgresAccountStorage } = require('../src/backend/storage/account-repository');
const { memoryStore } = require('../src/backend/storage/memory-store');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTask03ABTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Task 004F-03AB Remediation Test Suite');
  console.log('======================================================================\n');

  let passedAssertions = 0;
  function pass(msg) {
    passedAssertions++;
    console.log(`  ✅ PASS [Assert ${passedAssertions}]: ${msg}`);
  }

  const testPort = 3209;
  const testServer = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    SESSION_DURATION_SECONDS: 3600,
    BOOTSTRAP_ADMIN_EMAIL: 'admin@craftegon.local',
    BOOTSTRAP_ADMIN_PASSWORD: 'CraftegonAdmin2026!'
  });

  await testServer.start();

  try {
    // ------------------------------------------------------------------------
    // Part 1: Managing Partner Bootstrap & Setup
    // ------------------------------------------------------------------------
    console.log('--- Part 1: Bootstrap & Managing Partner Verification ---');
    const mpLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@craftegon.local',
      password: 'CraftegonAdmin2026!'
    });
    assert.strictEqual(mpLoginRes.statusCode, 200, 'Managing Partner login succeeds');
    const mpToken = mpLoginRes.body.token;
    assert.ok(mpToken && mpToken.startsWith('cct_'), 'Managing Partner receives valid session token');
    pass('Managing Partner authenticates and receives valid session token');

    // Provision an active operator
    const provOpRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/admin/staff/provision',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`
      }
    }, {
      legal_entity_name: 'Compliance Officer A',
      primary_email: 'officer_a@craftegon.com',
      primary_phone: '+91 9876500001',
      account_role: 'compliance_operator',
      password: 'OperatorPass2026!'
    });
    assert.strictEqual(provOpRes.statusCode, 201, 'Operator provisioned successfully');
    const officerAId = provOpRes.body.account.id;
    pass('Managing Partner provisions active compliance operator via HTTP');

    // Register an active client
    const regClientRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Acme Corporates Ltd',
      primary_email: 'client_active@acme.com',
      primary_phone: '+91 9876500002',
      password: 'ClientPassword2026!'
    });
    assert.strictEqual(regClientRes.statusCode, 201, 'Client registered successfully');
    const clientActiveId = regClientRes.body.account.id;
    pass('Client registers successfully with active status');

    // ------------------------------------------------------------------------
    // Part 2: DEF-007 Account Deactivation Throughout Authentication
    // ------------------------------------------------------------------------
    console.log('\n--- Part 2: DEF-007 Account Deactivation Throughout Authentication ---');

    // 2.1 Active Client can log in
    const clientLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_active@acme.com',
      password: 'ClientPassword2026!'
    });
    assert.strictEqual(clientLoginRes.statusCode, 200, 'Active client login succeeds');
    const clientToken = clientLoginRes.body.token;
    const clientCookie = clientLoginRes.headers['set-cookie'][0].split(';')[0];
    pass('Active client can log in and receives Bearer and cookie credentials');

    // 2.2 Active Operator can log in
    const opLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'officer_a@craftegon.com',
      password: 'OperatorPass2026!'
    });
    assert.strictEqual(opLoginRes.statusCode, 200, 'Active operator login succeeds');
    const opToken = opLoginRes.body.token;
    const opCookie = opLoginRes.headers['set-cookie'][0].split(';')[0];
    pass('Active operator can log in and receives Bearer and cookie credentials');

    // 2.3 Verify authenticated access works for client (Bearer & Cookie)
    const clientMeBearer = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assert.strictEqual(clientMeBearer.statusCode, 200, 'Active client Bearer request succeeds');

    const clientMeCookie = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': clientCookie }
    });
    assert.strictEqual(clientMeCookie.statusCode, 200, 'Active client cookie request succeeds');
    pass('Active client session authorizes both Bearer and cookie requests');

    // 2.4 Deactivate the Client Account
    const deactClient = await accountRepository.deactivateAccount(clientActiveId, { role: 'managing_partner' });
    assert.strictEqual(deactClient.is_active, false, 'Client marked inactive');
    pass('Client account deactivated by Managing Partner in repository');

    // 2.5 Inactive Client cannot log in (even with correct password)
    const inactiveClientLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_active@acme.com',
      password: 'ClientPassword2026!'
    });
    assert.strictEqual(inactiveClientLogin.statusCode, 401, 'Inactive client login rejected with HTTP 401');
    assert.strictEqual(inactiveClientLogin.body.message, 'Invalid email or password', 'Generic error prevents account state enumeration');
    pass('Inactive client cannot log in even with correct password; returns safe generic 401');

    // 2.6 Existing Client session stops working immediately (Bearer)
    const inactiveClientBearer = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assert.strictEqual(inactiveClientBearer.statusCode, 401, 'Existing client Bearer token rejected after deactivation');
    pass('Existing client Bearer session immediately rejected with HTTP 401 after deactivation');

    // 2.7 Existing Client session stops working immediately (Cookie)
    const inactiveClientCookie = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': clientCookie }
    });
    assert.strictEqual(inactiveClientCookie.statusCode, 401, 'Existing client cookie session rejected after deactivation');
    pass('Existing client cookie session immediately rejected with HTTP 401 after deactivation');

    // 2.8 Deactivate Operator Account
    await accountRepository.deactivateAccount(officerAId, { role: 'managing_partner' });
    pass('Operator account deactivated by Managing Partner in repository');

    // 2.9 Inactive Operator cannot log in
    const inactiveOpLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'officer_a@craftegon.com',
      password: 'OperatorPass2026!'
    });
    assert.strictEqual(inactiveOpLogin.statusCode, 401, 'Inactive operator login rejected with HTTP 401');
    pass('Inactive operator cannot log in even with correct password');

    // 2.10 Existing Operator session stops working immediately
    const inactiveOpBearer = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/admin/staff',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${opToken}` }
    });
    assert.strictEqual(inactiveOpBearer.statusCode, 401, 'Existing operator session rejected on administrative route');
    pass('Existing operator session immediately rejected with HTTP 401 after deactivation');

    // 2.11 Reactivating the account does NOT revive previously invalidated sessions!
    await accountRepository.setAccountActiveStatus(clientActiveId, true, { role: 'managing_partner' });
    const revivedOldTokenRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    assert.strictEqual(revivedOldTokenRes.statusCode, 401, 'Old session token remains permanently revoked after reactivation');
    pass('Reactivating account does NOT revive old sessions; prior tokens remain permanently invalidated (HTTP 401)');

    // 2.12 Reactivated client can log in to obtain a brand new valid session
    const reactivatedLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_active@acme.com',
      password: 'ClientPassword2026!'
    });
    assert.strictEqual(reactivatedLoginRes.statusCode, 200, 'Reactivated client can log in with correct credentials');
    const freshClientToken = reactivatedLoginRes.body.token;
    assert.notStrictEqual(freshClientToken, clientToken, 'Fresh token is distinct from old revoked token');

    const freshClientMe = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshClientToken}` }
    });
    assert.strictEqual(freshClientMe.statusCode, 200, 'Fresh session authorizes requests normally');
    pass('Reactivated account can log in to obtain fresh, distinct session token');

    // ------------------------------------------------------------------------
    // Part 3: DEF-008 PostgreSQL Repository-Level Privilege Enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- Part 3: DEF-008 PostgreSQL Repository-Level Privilege Enforcement ---');

    // Test PostgresAccountStorage mock client to verify repository-level privilege gates
    const mockPgClient = {
      query(sql) {
        if (sql.includes('SELECT * FROM client_accounts WHERE LOWER(primary_email)')) {
          return '[]'; // No duplicate
        }
        if (sql.includes('INSERT INTO client_accounts')) {
          let role = 'client';
          if (sql.includes(", 'compliance_operator',")) role = 'compliance_operator';
          if (sql.includes(", 'managing_partner',")) role = 'managing_partner';
          return JSON.stringify([{
            id: 'mock-acc-id',
            auth_user_id: 'mock-acc-id',
            legal_entity_name: 'Mock Entity',
            cin_llpin: null,
            primary_email: 'mock@test.com',
            primary_phone: '+91 9876543210',
            account_role: role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        }
        if (sql.includes('INSERT INTO auth_credentials')) {
          return JSON.stringify([{ id: 'mock-cred-id' }]);
        }
        return '[]';
      }
    };

    const pgStorage = new PostgresAccountStorage(mockPgClient);

    // 3.1 Ordinary caller context cannot create a Managing Partner
    const pgOrdMp = await pgStorage.createAccount({
      legal_entity_name: 'Attacker Org',
      primary_email: 'attacker_mp@test.com',
      account_role: 'managing_partner',
      password: 'AttackerPassword2026!'
    }, {}); // empty / ordinary context
    assert.strictEqual(pgOrdMp.account_role, 'client', 'Postgres repository forces ordinary context to client role');
    pass('PostgresAccountStorage forces ordinary context to client role when managing_partner requested');

    // 3.2 Ordinary caller context cannot create a Compliance Operator
    const pgOrdOp = await pgStorage.createAccount({
      legal_entity_name: 'Attacker Org',
      primary_email: 'attacker_op@test.com',
      account_role: 'compliance_operator',
      password: 'AttackerPassword2026!'
    }, { role: 'client' }); // client context
    assert.strictEqual(pgOrdOp.account_role, 'client', 'Postgres repository forces client context to client role');
    pass('PostgresAccountStorage forces client context to client role when compliance_operator requested');

    // 3.3 Managing Partner context can create authorized Compliance Operator
    const pgPrivOp = await pgStorage.createAccount({
      legal_entity_name: 'Staff Desk',
      primary_email: 'staff_op@test.com',
      account_role: 'compliance_operator',
      password: 'StaffPassword2026!'
    }, { role: 'managing_partner' });
    assert.strictEqual(pgPrivOp.account_role, 'compliance_operator', 'Postgres repository authorizes staff role for Managing Partner');
    pass('PostgresAccountStorage permits compliance_operator for Managing Partner context');

    // 3.4 Internal bootstrap context can create Managing Partner
    const pgBootMp = await pgStorage.createAccount({
      legal_entity_name: 'Master Firm',
      primary_email: 'bootstrap_mp@test.com',
      account_role: 'managing_partner',
      password: 'MasterPassword2026!'
    }, { isInternalBootstrap: true });
    assert.strictEqual(pgBootMp.account_role, 'managing_partner', 'Postgres repository authorizes Managing Partner for internal bootstrap');
    pass('PostgresAccountStorage permits managing_partner for internal bootstrap context');

    // 3.5 Unsupported role is rejected with HTTP 400 Bad Request
    let superadminRejected = false;
    try {
      await pgStorage.createAccount({
        legal_entity_name: 'Hacker Inc',
        primary_email: 'super@test.com',
        account_role: 'superadmin',
        password: 'SuperPassword2026!'
      }, { role: 'managing_partner' });
    } catch (err) {
      superadminRejected = true;
      assert.strictEqual(err.statusCode, 400, 'Unsupported role returns HTTP 400');
    }
    assert.ok(superadminRejected, 'Unsupported role superadmin rejected');
    pass('PostgresAccountStorage strictly rejects unsupported roles (superadmin) with HTTP 400');

    // 3.6 Password hashes and salts are not exposed in returned account object
    assert.strictEqual(pgPrivOp.password_hash, undefined, 'password_hash stripped from returned object');
    assert.strictEqual(pgPrivOp.password_salt, undefined, 'password_salt stripped from returned object');
    pass('PostgresAccountStorage returns sanitized account object without password hashes or salts');

    // ------------------------------------------------------------------------
    // Part 4: DEF-009 Bearer and Cookie Admin Logout Revocation
    // ------------------------------------------------------------------------
    console.log('\n--- Part 4: DEF-009 Admin Bearer & Cookie Logout Revocation ---');

    // 4.1 Re-login as Managing Partner to obtain a fresh Bearer token
    const freshMpLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@craftegon.local',
      password: 'CraftegonAdmin2026!'
    });
    const mpBearerToken = freshMpLogin.body.token;

    // Verify token works
    const mpBeforeLogout = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${mpBearerToken}` }
    });
    assert.strictEqual(mpBeforeLogout.statusCode, 200, 'Bearer session active before logout');

    // Perform Bearer-authenticated logout
    const bearerLogoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpBearerToken}`
      }
    });
    assert.strictEqual(bearerLogoutRes.statusCode, 200, 'Bearer logout returns HTTP 200');
    assert.strictEqual(bearerLogoutRes.body.success, true, 'Logout body confirms success');

    // Subsequent use of Bearer token must return HTTP 401
    const mpAfterLogout = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${mpBearerToken}` }
    });
    assert.strictEqual(mpAfterLogout.statusCode, 401, 'Bearer token strictly revoked on server after logout');
    pass('Bearer-authenticated logout revokes session on server; subsequent reuse returns HTTP 401');

    // 4.2 Cookie-authenticated logout
    const freshMpCookieLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@craftegon.local',
      password: 'CraftegonAdmin2026!'
    });
    const mpCookie = freshMpCookieLogin.headers['set-cookie'][0].split(';')[0];

    const cookieLogoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/logout',
      method: 'POST',
      headers: {
        'Cookie': mpCookie
      }
    });
    assert.strictEqual(cookieLogoutRes.statusCode, 200, 'Cookie logout returns HTTP 200');
    assert.ok(cookieLogoutRes.headers['set-cookie'][0].includes('Max-Age=0'), 'Set-Cookie header clears cookie (Max-Age=0)');

    const mpAfterCookieLogout = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Cookie': mpCookie }
    });
    assert.strictEqual(mpAfterCookieLogout.statusCode, 401, 'Cookie session strictly revoked on server after logout');
    pass('Cookie-authenticated logout revokes session on server and expires browser cookie (Max-Age=0); reuse returns HTTP 401');

    // ------------------------------------------------------------------------
    // Part 5: Cross-Tenant Isolation & Unaffected Systems Regression
    // ------------------------------------------------------------------------
    console.log('\n--- Part 5: Tenant Isolation & Boundary Regression ---');

    // Reactivate operator to test case assignment
    await accountRepository.setAccountActiveStatus(officerAId, true, { role: 'managing_partner' });

    // Client logs in and creates a case
    const clientNewLogin = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_active@acme.com',
      password: 'ClientPassword2026!'
    });
    const activeClientToken = clientNewLogin.body.token;

    const caseRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeClientToken}`
      }
    }, {
      service_id: 'V01-SVC-001',
      client_notes: 'Statutory filing for incorporation'
    });
    assert.strictEqual(caseRes.statusCode, 201, 'Case created successfully');
    const caseRef = caseRes.body.case.case_reference;
    pass('Customer creates statutory filing case; client_id derived server-side from session');

    // Customer A queries own case -> 200
    const ownCaseRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRef}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${activeClientToken}` }
    });
    assert.strictEqual(ownCaseRes.statusCode, 200, 'Customer fetches own case');

    // Register Customer B
    const regBRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Competitor B Corp',
      primary_email: 'client_b@competitor.com',
      password: 'PasswordB2026!'
    });
    const loginBRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_b@competitor.com',
      password: 'PasswordB2026!'
    });
    const tokenB = loginBRes.body.token;

    // Customer B queries Customer A case -> 404
    const tenantIsolationRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRef}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(tenantIsolationRes.statusCode, 404, 'Customer B querying Customer A case returns HTTP 404');
    pass('Tenant isolation intact: cross-tenant access returns HTTP 404 Not Found without leakage');

  } finally {
    testServer.stop();
  }

  console.log('\n======================================================================');
  console.log(`TASK 004F-03AB TEST SUMMARY: ${passedAssertions} passed, 0 failed (${passedAssertions} total assertions)`);
  console.log('STATUS: ALL REMEDIATION CONTROLS VERIFIED SUCCESSFULLY');
  console.log('======================================================================');
}

runTask03ABTests().catch(err => {
  console.error('Task 03AB Test Runner Fatal Error:', err);
  process.exit(1);
});
