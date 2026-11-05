/**
 * CraftEgon CCS - Task 004F-03Z: Critical Security and Local Workflow Remediation
 * Automated Verification Suite (20 Assertions)
 *
 * Verifies remediation of DEF-001 through DEF-006:
 * - DEF-001: Registration privilege escalation & staff provisioning boundary
 * - DEF-002: Admin console authFetch & case list loading
 * - DEF-003: Administrative credentials configuration & bootstrap fail-closed
 * - DEF-004: Customer case-request portal modal & API submission
 * - DEF-005: Role-aware admin access (compliance_operator vs managing_partner)
 * - DEF-006: Inactive operator assignment check & roster filtering
 * - DEF-007: PostgreSQL adapter acknowledgment (zero database writes)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createServer, seedInitialAdmin } = require('../src/backend/server');
const { accountRepository, InMemoryAccountStorage } = require('../src/backend/storage/account-repository');
const { memoryStore } = require('../src/backend/storage/memory-store');
const { clearSessionTokens } = require('../src/backend/middleware/auth-guard');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ PASS [Assert ${testsPassed + testsFailed}]: ${message}`);
  } else {
    testsFailed++;
    console.error(`  ❌ FAIL [Assert ${testsPassed + testsFailed}]: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
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

async function runRemediationSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Task 004F-03Z Remediation Verification Suite');
  console.log('======================================================================\n');

  const testPort = 3290;
  memoryStore.cases.clear();
  clearSessionTokens();

  const testServer = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    BOOTSTRAP_ADMIN_EMAIL: 'managing_partner@craftegon.com',
    BOOTSTRAP_ADMIN_PASSWORD: 'ManagingPartnerPass2026!'
  });

  await testServer.start();

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: DEF-001 Public Registration Privilege Escalation Gates
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: DEF-001 Public Registration Privilege Escalation Gates ---');

    // 1. Public registration with account_role: managing_partner -> forces client
    const regMp = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'attacker_mp@test.com',
      password: 'AttackerPassword2026!',
      account_role: 'managing_partner'
    });
    const accMp = await accountRepository.findByEmail('attacker_mp@test.com');
    assert(
      regMp.statusCode === 201 &&
      regMp.body.account.account_role === 'client' &&
      accMp && accMp.account_role === 'client',
      'Public registration with account_role: managing_partner is forced to client'
    );

    // 2. Public registration with account_role: compliance_operator -> forces client
    const regOp = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'attacker_op@test.com',
      password: 'AttackerPassword2026!',
      account_role: 'compliance_operator'
    });
    const accOp = await accountRepository.findByEmail('attacker_op@test.com');
    assert(
      regOp.statusCode === 201 &&
      regOp.body.account.account_role === 'client' &&
      accOp && accOp.account_role === 'client',
      'Public registration with account_role: compliance_operator is forced to client'
    );

    // 3. Public registration with isAdmin: true / forged permissions -> forces client
    const regAdmin = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'attacker_admin@test.com',
      password: 'AttackerPassword2026!',
      isAdmin: true,
      role: 'admin',
      permissions: ['*']
    });
    const accAdmin = await accountRepository.findByEmail('attacker_admin@test.com');
    assert(
      regAdmin.statusCode === 201 &&
      accAdmin && accAdmin.account_role === 'client' &&
      accAdmin.isAdmin === undefined,
      'Public registration with isAdmin: true and forged permissions is forced to client'
    );

    // 4. Normal client registration succeeds
    const regClient = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'legit_client@enterprise.com',
      password: 'EnterprisePassword2026!',
      legal_entity_name: 'Enterprise Alpha Ltd'
    });
    assert(
      regClient.statusCode === 201 &&
      regClient.body.account.account_role === 'client',
      'Normal client registration succeeds with account_role client'
    );

    // ------------------------------------------------------------------------
    // SECTION 2: DEF-001 Staff Provisioning Access Control
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: DEF-001 Staff Provisioning Access Control ---');

    // 5. Unauthorized staff provisioning (unauthenticated -> HTTP 401)
    const provUnauth = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/staff/provision', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'new_staff@craftegon.com',
      password: 'StaffPass2026!',
      account_role: 'compliance_operator'
    });
    assert(
      provUnauth.statusCode === 401,
      'Unauthorized staff provisioning without credentials returns HTTP 401'
    );

    // Login client to get client token
    const clientLogin = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'legit_client@enterprise.com',
      password: 'EnterprisePassword2026!'
    });
    const clientToken = clientLogin.body.token;

    // 6. Client attempting staff provisioning -> HTTP 403
    const provClient = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/staff/provision', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      }
    }, {
      primary_email: 'new_staff@craftegon.com',
      password: 'StaffPass2026!',
      account_role: 'compliance_operator'
    });
    assert(
      provClient.statusCode === 403,
      'Client role attempting staff provisioning is rejected with HTTP 403'
    );

    // Ensure managing partner is in account repository
    const existingMp = await accountRepository.findByEmail('managing_partner@craftegon.com');
    if (!existingMp) {
      await accountRepository.createAccount({
        primary_email: 'managing_partner@craftegon.com',
        legal_entity_name: 'CraftEgon Executive Leadership',
        account_role: 'managing_partner',
        password: 'ManagingPartnerPass2026!'
      }, { isInternalBootstrap: true });
    }

    const mpLogin = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'managing_partner@craftegon.com',
      password: 'ManagingPartnerPass2026!'
    });
    const mpToken = mpLogin.body.token;

    // Provision an operator using MP token
    const provOpByMp = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/staff/provision', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`
      }
    }, {
      primary_email: 'operator_alpha@craftegon.com',
      password: 'OperatorPass2026!',
      account_role: 'compliance_operator',
      legal_entity_name: 'CraftEgon Compliance Directorate'
    });

    const opLogin = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'operator_alpha@craftegon.com',
      password: 'OperatorPass2026!'
    });
    const opToken = opLogin.body.token;

    // 7. Operator attempting staff provisioning -> HTTP 403
    const provByOp = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/staff/provision', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opToken}`
      }
    }, {
      primary_email: 'sub_operator@craftegon.com',
      password: 'SubPass2026!',
      account_role: 'compliance_operator'
    });
    assert(
      provByOp.statusCode === 403,
      'Compliance Operator attempting staff provisioning is rejected with HTTP 403'
    );

    // 8. Managing Partner staff provisioning -> HTTP 201 with sanitized account
    assert(
      provOpByMp.statusCode === 201 &&
      provOpByMp.body.account.account_role === 'compliance_operator' &&
      provOpByMp.body.account.password === undefined &&
      provOpByMp.body.account.password_hash === undefined &&
      provOpByMp.body.account.password_salt === undefined,
      'Managing Partner successfully provisions staff with HTTP 201 and sanitized account response'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: DEF-003 Administrative Bootstrap & Credential Hygiene
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: DEF-003 Administrative Bootstrap & Credential Hygiene ---');

    // 9. Bootstrap with missing configuration -> 0 accounts seeded (fails closed)
    const emptyStorage = new InMemoryAccountStorage();
    await seedInitialAdmin({
      isProd: false,
      bootstrapAdminEmail: null,
      bootstrapAdminPassword: null
    }, emptyStorage);
    assert(
      emptyStorage.accounts.size === 0,
      'Bootstrap with missing configuration seeds 0 accounts (fails closed)'
    );

    // 10. Bootstrap with valid explicit local configuration -> seeds Managing Partner
    const testBootstrapStorage = new InMemoryAccountStorage();
    await seedInitialAdmin({
      isProd: false,
      bootstrapAdminEmail: 'seeded_partner@craftegon.com',
      bootstrapAdminPassword: 'SeededPassword2026!'
    }, testBootstrapStorage);
    const seededAcc = await testBootstrapStorage.findByEmail('seeded_partner@craftegon.com');
    assert(
      testBootstrapStorage.accounts.size === 1 &&
      seededAcc && seededAcc.account_role === 'managing_partner',
      'Bootstrap with explicit local configuration seeds Managing Partner account'
    );

    // 11. Repeated bootstrap without password reset -> idempotent, preserves password
    const initialHash = testBootstrapStorage.credentials.get('seeded_partner@craftegon.com').passwordHash;
    await seedInitialAdmin({
      isProd: false,
      bootstrapAdminEmail: 'seeded_partner@craftegon.com',
      bootstrapAdminPassword: 'DifferentPassword2026!'
    }, testBootstrapStorage);
    const currentHash = testBootstrapStorage.credentials.get('seeded_partner@craftegon.com').passwordHash;
    assert(
      initialHash === currentHash,
      'Repeated bootstrap execution is idempotent and preserves established password hash'
    );

    // 12. No hardcoded fallback administrative credentials in source code
    const serverSrc = fs.readFileSync(path.join(__dirname, '../src/backend/server.js'), 'utf8');
    const configSrc = fs.readFileSync(path.join(__dirname, '../src/backend/config.js'), 'utf8');
    const hasHardcodedPwd =
      serverSrc.includes('CraftEgonAdmin2026!') ||
      configSrc.includes('CraftEgonAdmin2026!') ||
      serverSrc.includes('admin@craftegon.com');
    assert(
      !hasHardcodedPwd,
      'Zero hardcoded administrative credentials exist in server.js or config.js source code'
    );

    // ------------------------------------------------------------------------
    // SECTION 4: DEF-002 & DEF-005 Admin Case List, Roster & Role-Aware Access
    // ------------------------------------------------------------------------
    console.log('\n--- Section 4: DEF-002 & DEF-005 Admin Console & Role-Aware Access ---');

    // Create a customer case for testing admin listing
    const case1 = memoryStore.createCase({
      client_id: regClient.body.account.id,
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      title: 'Enterprise Alpha SPICe+ Incorporation'
    }, { role: 'compliance_operator' });

    // 13. Admin case-list loading via authFetch / API -> succeeds
    const adminCasesRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/portal/cases', method: 'GET',
      headers: { 'Authorization': `Bearer ${opToken}` }
    });
    assert(
      adminCasesRes.statusCode === 200 &&
      adminCasesRes.body.total >= 1 &&
      adminCasesRes.body.cases.some(c => c.case_reference === case1.case_reference),
      'Operator successfully loads administrative case list via API'
    );

    // Provision an inactive operator for DEF-006 testing
    const inactiveOpRes = await accountRepository.createAccount({
      primary_email: 'inactive_op@craftegon.com',
      legal_entity_name: 'CraftEgon Former Staff',
      account_role: 'compliance_operator',
      password: 'InactivePass2026!',
      is_active: false
    }, { isInternalBootstrap: true });

    // 14. Operator-roster loading via authFetch / API -> succeeds and excludes inactive operators
    const rosterRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/operators', method: 'GET',
      headers: { 'Authorization': `Bearer ${opToken}` }
    });
    const rosterEmails = (rosterRes.body.operators || []).map(o => o.primary_email || o.email);
    assert(
      rosterRes.statusCode === 200 &&
      rosterEmails.includes('operator_alpha@craftegon.com') &&
      !rosterEmails.includes('inactive_op@craftegon.com'),
      'Operator roster successfully loads active operators and excludes inactive operators'
    );

    // 15. Case assignment and status updates through admin interface
    const activeOpAcc = await accountRepository.findByEmail('operator_alpha@craftegon.com');
    const updateCaseRes = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/portal/cases/${case1.case_reference}`, method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opToken}`
      }
    }, {
      assigned_to: activeOpAcc.id,
      status: 'AWAITING_CUSTOMER_ACTION'
    });
    assert(
      updateCaseRes.statusCode === 200 &&
      updateCaseRes.body.case.assigned_officer_id === activeOpAcc.id &&
      updateCaseRes.body.case.status === 'AWAITING_CUSTOMER_ACTION',
      'Authorized operator successfully assigns case to active staff and updates status'
    );

    // ------------------------------------------------------------------------
    // SECTION 5: DEF-004 Customer Case Request Submission & Boundaries
    // ------------------------------------------------------------------------
    console.log('\n--- Section 5: DEF-004 Customer Case Request Submission & Boundaries ---');

    // 16. Customer case submission through portal interface / API
    const newCaseRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/portal/cases', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      }
    }, {
      service_id: 'V02-SVC-004',
      title: 'Annual AOC-4 Filing for FY 2025-26',
      priority: 'PRIORITY',
      notes: 'Please stage early'
    });
    assert(
      newCaseRes.statusCode === 201 &&
      newCaseRes.body.case &&
      newCaseRes.body.case.service_id === 'V02-SVC-004' &&
      newCaseRes.body.case.status === 'IN_PROGRESS',
      'Customer successfully submits self-serve case request via portal API'
    );

    // 17. Referral-only service rejection (HTTP 422 with Advocates Act notice)
    const referralCaseRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/portal/cases', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      }
    }, {
      service_id: 'nclt-insolvency',
      title: 'NCLT CIRP Defense Petition'
    });
    assert(
      referralCaseRes.statusCode === 422 &&
      (referralCaseRes.body.message || '').includes('Advocates Act 1961'),
      'Referral-only service is rejected with HTTP 422 citing Advocates Act 1961'
    );

    // ------------------------------------------------------------------------
    // SECTION 6: DEF-006 Inactive Operator Assignment & Privileged Action Gates
    // ------------------------------------------------------------------------
    console.log('\n--- Section 6: DEF-006 Inactive Operator & Privileged Role Gates ---');

    // 18. Inactive staff assignment rejection (HTTP 400)
    const inactiveAssignRes = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/portal/cases/${case1.case_reference}`, method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opToken}`
      }
    }, {
      assigned_to: inactiveOpRes.id
    });
    assert(
      inactiveAssignRes.statusCode === 400 &&
      (inactiveAssignRes.body.message || '').includes('active'),
      'Assignment of case to inactive operator is rejected with HTTP 400'
    );

    // 19. Operator denial of Managing Partner-only functions (POST /api/v1/admin/publish -> HTTP 403)
    const opPublishRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/publish', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opToken}`
      }
    }, {});
    const mpPublishRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/admin/publish', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`
      }
    }, {});
    assert(
      opPublishRes.statusCode === 403 &&
      mpPublishRes.statusCode === 200,
      'Operator is denied publishing actions (HTTP 403) while Managing Partner succeeds (HTTP 200)'
    );

    // ------------------------------------------------------------------------
    // SECTION 7: Session, Tenant-Isolation & Logout Regressions
    // ------------------------------------------------------------------------
    console.log('\n--- Section 7: Session, Tenant-Isolation & Logout Regressions ---');

    // Register Customer B
    const regClientB = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      primary_email: 'client_b@external.com',
      password: 'ExternalPassword2026!',
      legal_entity_name: 'External Beta Ltd'
    });
    const loginB = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'client_b@external.com',
      password: 'ExternalPassword2026!'
    });
    const tokenB = loginB.body.token;

    // Cross-tenant fetch: Customer B attempts to fetch Case 1 owned by Customer A
    const crossTenantRes = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/portal/cases/${case1.case_reference}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const ownCasesB = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/portal/cases', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    // Logout Customer A
    const logoutRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/logout', method: 'POST',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const postLogoutAccess = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/auth/me', method: 'GET',
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });

    // 20. Existing session, tenant-isolation, and logout regression verification
    assert(
      crossTenantRes.statusCode === 404 &&
      ownCasesB.body.total === 0 &&
      logoutRes.statusCode === 200 &&
      postLogoutAccess.statusCode === 401,
      'Cross-tenant isolation (HTTP 404) and session logout revocation (HTTP 401) operate securely'
    );

  } finally {
    await testServer.stop();
  }

  console.log('\n======================================================================');
  console.log(`TASK 004F-03Z REMEDIATION SUMMARY: ${testsPassed} passed, ${testsFailed} failed (${testsPassed + testsFailed} total assertions)`);
  console.log('======================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runRemediationSuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runRemediationSuite };
