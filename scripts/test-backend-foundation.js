/**
 * CraftEgon CCS - Phase 3 Task B: Backend Foundation Automated Test Suite
 * Tests server baseline, SQL migration integrity, RLS tenant isolation,
 * rate limiting, idempotency, anti-abuse, and error shielding.
 * Pure Node.js built-ins.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createServer, configureStorageAdapters } = require('../src/backend/server');
const { loadConfig } = require('../src/backend/config');
const { clearRateLimitStore } = require('../src/backend/middleware/rate-limiter');
const { clearIdempotencyStore } = require('../src/backend/middleware/idempotency');
const { clearSessionTokens } = require('../src/backend/middleware/auth-guard');
const { clearAuditLogs, getAuditLogs } = require('../src/backend/middleware/audit-logger');
const { memoryStore } = require('../src/backend/storage/memory-store');
const { accountRepository, InMemoryAccountStorage, PostgresAccountStorage } = require('../src/backend/storage/account-repository');
const { enquiryRepository, InMemoryEnquiryStorage } = require('../src/backend/storage/enquiry-repository');
const { canTransition, LEAD_STATES, CASE_STATES, DOCUMENT_STATES, PAYMENT_STATES } = require('../src/backend/models/state-machines');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`  ❌ FAIL: ${message}`);
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

async function runSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Task B: Backend Foundation Test Suite');
  console.log('======================================================================\n');

  // Ensure deterministic in-memory storage for unit suite
  enquiryRepository.setAdapter(new InMemoryEnquiryStorage());

  // Start test server on dynamic test port
  const testPort = 3199;
  const testInstance = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    RATE_LIMIT_WINDOW_MS: 5000,
    RATE_LIMIT_MAX_REQUESTS: 3,
    TRUSTED_PROXIES: '10.0.0.1, 127.0.0.1'
  });

  await testInstance.start();
  console.log(`Test server running on port ${testPort}\n`);

  try {
    // ------------------------------------------------------------------------
    // Test Suite 1: Configuration & Environment Validation
    // ------------------------------------------------------------------------
    console.log('--- Test Suite 1: Configuration & Environment Validation ---');
    const cfg = loadConfig({ PORT: 4000, HOST: '0.0.0.0' });
    assert(cfg.port === 4000, 'Parses custom PORT override correctly');
    assert(cfg.host === '0.0.0.0', 'Parses custom HOST override correctly');
    assert(cfg.maxPayloadSizeBytes === 32768, 'Enforces default 32 KB maximum payload size');
    assert(Array.isArray(cfg.trustedProxies), 'Configures trusted proxy array safely');
    assert(!JSON.stringify(cfg).includes('password'), 'Zero passwords in exported configuration');

    // ------------------------------------------------------------------------
    // Test Suite 2: HTTP Server Baseline, Security Headers & Routing
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 2: HTTP Server Baseline, Security Headers & Routing ---');
    
    // Health Check
    const healthRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200, 'GET /api/v1/health returns HTTP 200');
    assert(healthRes.body.status === 'ok', 'Health endpoint reports status: ok');
    assert(Object.keys(healthRes.body).length === 1, 'PHASE1-HEALTH-1: Health endpoint returns exactly {"status":"ok"} with no extra fields');
    assert(healthRes.body.environment === undefined, 'PHASE1-HEALTH-2: Health endpoint exposes no environment details');
    assert(healthRes.body.database_provider === undefined, 'PHASE1-HEALTH-3: Health endpoint exposes no database provider details');
    assert(healthRes.body.data_residency === undefined, 'PHASE1-HEALTH-4: Health endpoint exposes no data residency information');
    assert(healthRes.body.version === undefined, 'PHASE1-HEALTH-5: Health endpoint exposes no version details');
    assert(healthRes.body.timestamp === undefined, 'PHASE1-HEALTH-6: Health endpoint exposes no timestamp');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'Includes X-Content-Type-Options: nosniff header');
    assert(healthRes.headers['x-frame-options'] === 'DENY', 'Includes X-Frame-Options: DENY header');
    assert(healthRes.headers['content-security-policy'] === "default-src 'self'", 'Includes Content-Security-Policy header');

    // 404 Route Not Found
    const notFoundRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/non-existent-route',
      method: 'GET'
    });
    assert(notFoundRes.statusCode === 404, 'Unknown endpoint returns HTTP 404 Not Found');

    // 405 Method Not Allowed
    const methodNotAllowedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/health',
      method: 'POST'
    });
    assert(methodNotAllowedRes.statusCode === 405, 'POST on GET-only endpoint returns HTTP 405 Method Not Allowed');

    // ------------------------------------------------------------------------
    // Test Suite 3: Payload Stream Bounding & Error Shielding
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 3: Payload Stream Bounding & Error Shielding ---');

    // Malformed JSON
    const malformedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{ invalid json ');
    assert(malformedRes.statusCode === 400, 'Malformed JSON returns HTTP 400 Bad Request');
    assert(!malformedRes.rawBody.includes('SyntaxError') && !malformedRes.rawBody.includes('at '), 'Malformed JSON shields error without leaking stack traces');

    // Oversized Payload (>32 KB)
    const oversizedBody = JSON.stringify({ large: 'X'.repeat(35000) });
    const oversizedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, oversizedBody);
    assert(oversizedRes.statusCode === 413, 'Payload exceeding 32 KB returns HTTP 413 Payload Too Large');

    // ------------------------------------------------------------------------
    // Test Suite 4: SQL Migration Files & Schema Integrity
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 4: SQL Migration Files & Schema Integrity ---');
    const migDir = path.resolve(__dirname, '../src/backend/migrations');
    const mig001 = fs.readFileSync(path.join(migDir, '001_initial_schema.sql'), 'utf8');
    const mig002 = fs.readFileSync(path.join(migDir, '002_row_level_security.sql'), 'utf8');
    const mig003 = fs.readFileSync(path.join(migDir, '003_indexes_and_constraints.sql'), 'utf8');

    assert(mig001.includes('CREATE TABLE IF NOT EXISTS client_accounts'), 'Migration 001 defines client_accounts table');
    assert(mig001.includes('CREATE TABLE IF NOT EXISTS lead_enquiries'), 'Migration 001 defines lead_enquiries table');
    assert(mig001.includes('CREATE TABLE IF NOT EXISTS cases'), 'Migration 001 defines cases table');
    assert(mig001.includes('CREATE TABLE IF NOT EXISTS case_documents'), 'Migration 001 defines case_documents table');
    assert(mig001.includes('CREATE TABLE IF NOT EXISTS subscription_orders'), 'Migration 001 defines subscription_orders table');
    assert(mig001.includes('CREATE TABLE IF NOT EXISTS audit_logs'), 'Migration 001 defines audit_logs table');

    assert(mig002.includes('ALTER TABLE cases ENABLE ROW LEVEL SECURITY;'), 'Migration 002 enables RLS on cases');
    assert(mig002.includes('ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;'), 'Migration 002 enables RLS on case_documents');
    assert(mig002.includes('ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;'), 'Migration 002 enables RLS on subscription_orders');
    assert(mig002.includes('CREATE POLICY cases_select_policy ON cases'), 'Migration 002 creates cases select tenant policy');
    assert(mig002.includes("quarantine_status = 'CLEAN'"), 'Migration 002 enforces clean quarantine status for client document access');

    assert(mig003.includes('CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);'), 'Migration 003 indexes cases foreign key');
    assert(mig003.includes('CREATE INDEX IF NOT EXISTS idx_subscription_orders_idempotency'), 'Migration 003 creates idempotency index on subscription orders');

    // ------------------------------------------------------------------------
    // Test Suite 5: Rate Limiting & Proxy IP Resolution
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 5: Rate Limiting & Proxy IP Resolution ---');
    clearRateLimitStore();

    const validPayload = {
      contact_name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9876543210',
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      dpdp_consent: true
    };

    // Submissions 1, 2, 3 should succeed
    const req1 = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, validPayload);
    assert(req1.statusCode === 201, 'Request 1/3 accepted within rate limit');

    validPayload.email = 'priya.2@example.com';
    const req2 = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, validPayload);
    assert(req2.statusCode === 201, 'Request 2/3 accepted within rate limit');

    validPayload.email = 'priya.3@example.com';
    const req3 = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, validPayload);
    assert(req3.statusCode === 201, 'Request 3/3 accepted within rate limit');

    // Request 4 should be rate limited (429)
    validPayload.email = 'priya.4@example.com';
    const req4 = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, validPayload);
    assert(req4.statusCode === 429, 'Request 4 exceeds max 3 requests and returns HTTP 429 Too Many Requests');
    assert(Boolean(req4.headers['retry-after']), 'Rate limited response includes Retry-After header');

    // ------------------------------------------------------------------------
    // Test Suite 6: Idempotency & Bot Mitigation
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 6: Idempotency & Bot Mitigation ---');
    clearRateLimitStore();
    clearIdempotencyStore();

    // Honeypot trap
    const botPayload = {
      ...validPayload,
      email: 'bot@spammer.com',
      _hp_website: 'https://spam-link.ru'
    };
    const botRes = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, botPayload);
    assert(botRes.statusCode === 201 && botRes.body.lead_reference.includes('000000'), 'Honeypot trap catches bot and returns dummy response silently');

    // Duplicate submission idempotency
    const idemPayload = {
      contact_name: 'Ananya Roy',
      email: 'ananya.roy@corporatetech.com',
      phone: '+91 9123456789',
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      dpdp_consent: true
    };
    const firstSubmit = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, idemPayload);
    assert(firstSubmit.statusCode === 201, 'First enquiry submission returns HTTP 201 Created');

    const duplicateSubmit = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' } }, idemPayload);
    assert(duplicateSubmit.statusCode === 200 && duplicateSubmit.body.idempotent_replay === true, 'Duplicate submission returns cached idempotent replay without re-inserting');
    assert(duplicateSubmit.body.lead_reference === firstSubmit.body.lead_reference, 'Idempotent replay returns identical lead reference');

    // ------------------------------------------------------------------------
    // Test Suite 7: Server-Side Authorization & RLS Tenant Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 7: Server-Side Authorization & RLS Tenant Isolation ---');
    memoryStore.reset();
    clearSessionTokens();

    // 1. Unauthenticated request to cases
    const unauthRes = await request({ hostname: '127.0.0.1', port: testPort, path: '/api/v1/portal/cases', method: 'GET' });
    assert(unauthRes.statusCode === 401, 'Unauthenticated request to portal cases returns HTTP 401 Unauthorized');

    // 1b. Passwordless Login Strict Rejection (Development & Production)
    const noPassDevRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'hacker@adversary.com' });
    assert(noPassDevRes.statusCode === 400 && noPassDevRes.body.message === 'Password is required', 'DEV BOUNDARY: Passwordless login rejected with HTTP 400 Bad Request');

    const prodServer = createServer({ PORT: 3198, NODE_ENV: 'production', DATABASE_PROVIDER: 'local_in_memory' });
    await prodServer.start();
    try {
      const prodLoginRes = await request({
        hostname: '127.0.0.1',
        port: 3198,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'hacker@adversary.com', role: 'managing_partner' });
      assert(prodLoginRes.statusCode === 400 && prodLoginRes.body.message === 'Password is required', 'PRODUCTION BOUNDARY: Passwordless login rejected with HTTP 400 in production environment');
    } finally {
      await prodServer.stop();
      configureStorageAdapters(testInstance.config);
    }

    // 2. Setup verified Customer A with explicit strong password
    await accountRepository.createAccount({
      primary_email: 'client_a@acme.com',
      legal_entity_name: 'Acme Alpha Pvt Ltd',
      account_role: 'client',
      password: 'CorporatePassword2026!'
    });
    const loginA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: 'CorporatePassword2026!' });
    const tokenA = loginA.body.token;
    const userA = loginA.body.user;
    assert(Boolean(tokenA) && userA.role === 'client', 'Customer A logs in successfully with valid credentials');

    // 3. Setup verified Customer B with explicit strong password
    await accountRepository.createAccount({
      primary_email: 'client_b@beta.com',
      legal_entity_name: 'Beta Biotech LLP',
      account_role: 'client',
      password: 'CorporatePassword2026!'
    });
    const loginB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_b@beta.com', password: 'CorporatePassword2026!' });
    const tokenB = loginB.body.token;
    const userB = loginB.body.user;
    assert(Boolean(tokenB) && userB.role === 'client', 'Customer B logs in successfully with valid credentials');

    // 4. Staff logs in with explicit strong password (authorized context)
    await accountRepository.createAccount({
      primary_email: 'officer@craftegon.com',
      legal_entity_name: 'CraftEgon Compliance Directorate',
      account_role: 'compliance_operator',
      password: 'StaffCorporatePassword2026!'
    }, { role: 'managing_partner' });
    const loginStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'officer@craftegon.com', password: 'StaffCorporatePassword2026!' });
    const tokenStaff = loginStaff.body.token;

    const caseA = memoryStore.createCase({
      case_reference: 'CASE-2026-ALPHA1',
      client_id: userA.id,
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      title: 'Private Limited Company Incorporation'
    }, { role: 'compliance_operator' });

    // 5. Customer A fetches their case
    const caseFetchA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(caseFetchA.statusCode === 200, 'Customer A can successfully fetch their own case');
    assert(caseFetchA.body.case.case_reference === 'CASE-2026-ALPHA1', 'Customer A receives expected case payload');

    // 6. Cross-Tenant Denial: Customer B attempts to fetch Customer A's case
    const caseFetchB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ALPHA1',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(caseFetchB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B attempting to view Customer A case is denied (HTTP 404/RLS)');

    // 7. Customer B lists cases -> must be empty
    const listCasesB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(listCasesB.body.total === 0, 'CROSS-TENANT ISOLATION: Customer B case list returns 0 items (Customer A case hidden)');

    // 8. Staff lists cases -> sees Customer A case
    const listCasesStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(listCasesStaff.body.total >= 1, 'Compliance staff can view cases across tenants');

    // ------------------------------------------------------------------------
    // Test Suite 7b: Core Authentication & Disabled-Credential Regression (Task 004E)
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 7b: Core Authentication & Disabled-Credential Regression (Task 004E) ---');

    // 1. Passwordless login to an existing account returns rejection
    const pwLessExisting = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com' });
    assert(pwLessExisting.statusCode === 400 && pwLessExisting.body.message === 'Password is required', 'REG-1: Passwordless login to an existing account rejected with HTTP 400');

    // 2. Passwordless login cannot create a new account
    const pwLessNew = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'never_existed@acme.com', legal_entity_name: 'Ghost Corp' });
    assert(pwLessNew.statusCode === 400 && pwLessNew.body.message === 'Password is required', 'REG-2a: Passwordless login attempt rejected with HTTP 400');
    const ghostAcc = await accountRepository.findByEmail('never_existed@acme.com');
    assert(ghostAcc === null, 'REG-2b: Passwordless login does NOT create a new account in storage');

    // 3. Empty password is rejected
    const emptyPwRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: '' });
    assert(emptyPwRes.statusCode === 400 && emptyPwRes.body.message === 'Password is required', 'REG-3: Empty string password rejected with HTTP 400');

    // 4. Non-string password is rejected
    const nonStrPwRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: 12345678 });
    assert(nonStrPwRes1.statusCode === 400 && nonStrPwRes1.body.message === 'Password is required', 'REG-4a: Integer password rejected with HTTP 400');

    const nonStrPwRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: null });
    assert(nonStrPwRes2.statusCode === 400 && nonStrPwRes2.body.message === 'Password is required', 'REG-4b: Null password rejected with HTTP 400');

    // 4c. Whitespace-only passwords are rejected with HTTP 400
    const whitespacePwRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: '   ' });
    assert(whitespacePwRes1.statusCode === 400 && whitespacePwRes1.body.message === 'Password is required', 'REG-4c: Whitespace-only password (spaces) rejected with HTTP 400');

    const whitespacePwRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: '\t \n \r ' });
    assert(whitespacePwRes2.statusCode === 400 && whitespacePwRes2.body.message === 'Password is required', 'REG-4d: Whitespace-only password (tabs/newlines) rejected with HTTP 400');

    // 5. Normal valid login still succeeds
    const validLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: 'CorporatePassword2026!' });
    assert(validLoginRes.statusCode === 200 && Boolean(validLoginRes.body.token), 'REG-5: Normal valid login succeeds with session token');

    // 6. Invalid password still fails
    const invalidPwRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', password: 'WrongPassword999!' });
    assert(invalidPwRes.statusCode === 401 && invalidPwRes.body.message === 'Invalid email or password', 'REG-6: Invalid password returns HTTP 401 with generic safe message');

    // 6b. Non-empty password with leading/trailing whitespace is verified untrimmed
    await accountRepository.createAccount({
      primary_email: 'spaced_pass@acme.com',
      legal_entity_name: 'Spaced Password Corp',
      password: '  SecretPass2026!  '
    });
    const exactSpacedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'spaced_pass@acme.com', password: '  SecretPass2026!  ' });
    assert(exactSpacedRes.statusCode === 200 && Boolean(exactSpacedRes.body.token), 'REG-6b: Exact password with leading/trailing spaces authenticates untrimmed');

    const trimmedAttemptRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'spaced_pass@acme.com', password: 'SecretPass2026!' });
    assert(trimmedAttemptRes.statusCode === 401, 'REG-6c: Trimmed password attempt fails (passwords are preserved untrimmed before auth)');

    // 7. Account creation without a password produces disabled local authentication
    const disabledAcc = await accountRepository.createAccount({
      primary_email: 'disabled_client@acme.com',
      legal_entity_name: 'Disabled Corp LLC'
    });
    const disabledCred = accountRepository.adapter.credentials.get('disabled_client@acme.com');
    assert(disabledCred.password_hash === '!DISABLED:NO_LOCAL_PASSWORD', 'REG-7a: Account without password stores !DISABLED:NO_LOCAL_PASSWORD');
    assert(disabledCred.password_salt === 'disabled', 'REG-7b: Account without password stores disabled salt');

    // 8. TempPass123! cannot authenticate an account with disabled local authentication
    const tempPassAttempt = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'disabled_client@acme.com', password: 'TempPass123!' });
    assert(tempPassAttempt.statusCode === 401 && tempPassAttempt.body.message === 'Invalid email or password', 'REG-8: TempPass123! rejected with HTTP 401 on disabled account');

    // 9. SyntheticTestPass123! cannot authenticate an account with disabled local authentication
    const synthPassAttempt = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'disabled_client@acme.com', password: 'SyntheticTestPass123!' });
    assert(synthPassAttempt.statusCode === 401 && synthPassAttempt.body.message === 'Invalid email or password', 'REG-9: SyntheticTestPass123! rejected with HTTP 401 on disabled account');

    // 10. Malformed credential records fail safely
    accountRepository.adapter.credentials.set('malformed@acme.com', {
      account_id: 'dummy-id-1234',
      password_hash: 'not_a_valid_scrypt_hash_or_disabled_tag',
      password_salt: 'dummy',
      failed_attempts: 0,
      locked_until: null
    });
    const malformedAttempt = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'malformed@acme.com', password: 'AnyPassword2026!' });
    assert(malformedAttempt.statusCode === 401, 'REG-10: Malformed credential record fails safely with HTTP 401');

    // 11. Existing lockout behavior still works
    const lockoutEmail = 'lockout_test@acme.com';
    await accountRepository.createAccount({
      primary_email: lockoutEmail,
      legal_entity_name: 'Lockout Target Ltd',
      password: 'TargetPassword2026!'
    });
    for (let i = 0; i < 5; i++) {
      await request({
        hostname: '127.0.0.1',
        port: testPort,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: lockoutEmail, password: 'WrongPassword!' });
    }
    const lockedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: lockoutEmail, password: 'TargetPassword2026!' });
    assert(lockedRes.statusCode === 429, 'REG-11: 5 failed attempts trigger account lockout (HTTP 429 Too Many Requests)');

    // 12. Existing password-reset behavior still works
    const resetEmail = 'reset_user@acme.com';
    await accountRepository.createAccount({
      primary_email: resetEmail,
      legal_entity_name: 'Reset Testing Corp',
      password: 'InitialPassword2026!'
    });
    const resetTokenRes = await accountRepository.createPasswordResetToken(resetEmail);
    assert(Boolean(resetTokenRes.token), 'REG-12a: Password reset token generated');
    const pwResetResult = await accountRepository.resetPassword(resetTokenRes.token, 'UpdatedPassword2026!');
    assert(pwResetResult.success, 'REG-12b: Password reset succeeds with valid token');

    // 13. Password-reset activation changes disabled credentials to valid scrypt credentials
    const actEmail = 'activate_me@acme.com';
    await accountRepository.createAccount({
      primary_email: actEmail,
      legal_entity_name: 'Activation Pending Inc'
    });
    const preActCred = accountRepository.adapter.credentials.get(actEmail);
    assert(preActCred.password_hash === '!DISABLED:NO_LOCAL_PASSWORD', 'REG-13a: Initial state is disabled');
    const actTokenRes = await accountRepository.createPasswordResetToken(actEmail);
    await accountRepository.resetPassword(actTokenRes.token, 'ActivatedCorporatePass2026!');
    const postActCred = accountRepository.adapter.credentials.get(actEmail);
    assert(postActCred.password_hash.startsWith('scrypt:'), 'REG-13b: Password reset transitions disabled hash to valid scrypt hash');
    const actLoginRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: actEmail, password: 'ActivatedCorporatePass2026!' });
    assert(actLoginRes.statusCode === 200 && Boolean(actLoginRes.body.token), 'REG-13c: Newly activated account logs in successfully via public login API');

    // 14. Existing internal fixtures using direct session creation still work
    const fixtureAcc = await accountRepository.createAccount({
      primary_email: 'fixture_internal@acme.com',
      legal_entity_name: 'Internal Fixture Entity'
    });
    const fixtureSession = await accountRepository.createSession(fixtureAcc);
    assert(Boolean(fixtureSession.token), 'REG-14a: Direct session creation succeeds for passwordless fixture');
    const verifiedSession = await accountRepository.verifySession(fixtureSession.token);
    assert(verifiedSession && verifiedSession.account_id === fixtureAcc.id, 'REG-14b: Directly issued fixture session verifies successfully');

    // 15. Public Forgot-Password Endpoint Hardening (Phase 1)
    const fpTestEmail = 'forgot_client@acme.com';
    await accountRepository.createAccount({
      primary_email: fpTestEmail,
      legal_entity_name: 'Forgot Client Corp',
      password: 'InitialPassword2026!'
    });
    const preCred = accountRepository.adapter.credentials.get(fpTestEmail);
    const preRecoveryHash = preCred.recovery_token_hash;

    // 15a. Forgot-password request for existing user
    const fpExistingRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: fpTestEmail });
    assert(fpExistingRes.statusCode === 200, 'PHASE1-1: POST /api/v1/auth/forgot-password returns HTTP 200');
    assert(fpExistingRes.body._test_reset_token === undefined, 'PHASE1-2: Forgot-password endpoint never returns _test_reset_token in HTTP response');
    assert(!JSON.stringify(fpExistingRes.body).includes('rst_'), 'PHASE1-3: Response body contains zero reset tokens');
    assert(fpExistingRes.body.message === 'If an account matches that email address, recovery options will be provided when available.', 'PHASE1-4: Response uses truthful message without claiming dispatch');
    assert(!fpExistingRes.body.message.includes('dispatched'), 'PHASE1-5: Response does not claim instructions were dispatched');

    // 15b. Verify NO reset token was generated in storage for this account
    const postCred = accountRepository.adapter.credentials.get(fpTestEmail);
    assert(postCred.recovery_token_hash === preRecoveryHash, 'PHASE1-6: Forgot-password endpoint does not generate or persist a reset token');

    // 15c. Forgot-password request for non-existent user receives identical generic response
    const fpNonExistentRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'ghost_nonexistent@acme.com' });
    assert(fpNonExistentRes.statusCode === 200, 'PHASE1-7: Non-existent email returns HTTP 200');
    assert(fpNonExistentRes.body.message === fpExistingRes.body.message, 'PHASE1-8: Existing and non-existent email addresses receive identical generic response (zero enumeration)');
    assert(fpNonExistentRes.body._test_reset_token === undefined, 'PHASE1-9: Non-existent email response contains no _test_reset_token');

    // 15d. Empty or whitespace-only email validation
    const fpEmptyRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: '   ' });
    assert(fpEmptyRes.statusCode === 400 && fpEmptyRes.body.message === 'Email address is required', 'PHASE1-10: Empty/whitespace email rejected with HTTP 400');

    // ------------------------------------------------------------------------
    // Test Suite 7c: Phase 2 Repository Credential & Reset-Token Lifecycle Hardening
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 7c: Phase 2 Repository Credential & Lifecycle Hardening ---');

    // 1. Storage adapter has no persistent raw reset-token property
    assert(accountRepository.adapter.lastResetToken === undefined, 'PHASE2-1: Storage adapter exports no lastResetToken property');
    assert(accountRepository.lastResetToken === undefined, 'PHASE2-2: AccountRepository exports no lastResetToken property');

    // 2. Hash-only storage: verify storage persists only the SHA-256 hash, not raw token
    const hashAuditEmail = 'hash_audit@acme.com';
    await accountRepository.createAccount({
      primary_email: hashAuditEmail,
      legal_entity_name: 'Hash Audit Corp',
      password: 'InitialPassword2026!'
    });
    const tokenResult = await accountRepository.createPasswordResetToken(hashAuditEmail);
    assert(Boolean(tokenResult.token), 'PHASE2-3: createPasswordResetToken returns raw token in-memory to caller');
    assert(Boolean(tokenResult.tokenHash), 'PHASE2-4: createPasswordResetToken returns tokenHash in-memory to caller');
    assert(accountRepository.adapter.lastResetToken === undefined, 'PHASE2-5: Storage adapter does not retain raw token after generation');

    const storedCred = accountRepository.adapter.credentials.get(hashAuditEmail);
    assert(storedCred.recovery_token_hash === tokenResult.tokenHash, 'PHASE2-6: Stored recovery_token_hash matches SHA-256 hash');
    assert(!JSON.stringify(storedCred).includes(tokenResult.token), 'PHASE2-7: Stored credential record contains zero plaintext token bytes');

    // 3. Exact-token invalidation (concurrency safety)
    const tokenAObj = await accountRepository.createPasswordResetToken(hashAuditEmail);
    const tokenBObj = await accountRepository.createPasswordResetToken(hashAuditEmail);
    assert(tokenAObj.tokenHash !== tokenBObj.tokenHash, 'PHASE2-8: Successive reset requests produce distinct token hashes');

    // Attempting to invalidate Token A (which is no longer the active token) must NOT invalidate Token B
    const staleInvalidateRes = await accountRepository.invalidatePasswordResetTokenByHash(hashAuditEmail, tokenAObj.tokenHash);
    assert(staleInvalidateRes.invalidated === false, 'PHASE2-9: Invalidation with stale token hash affects 0 records');
    const stillActiveCred = accountRepository.adapter.credentials.get(hashAuditEmail);
    assert(stillActiveCred.recovery_token_hash === tokenBObj.tokenHash, 'PHASE2-10: Token B remains active and untouched after stale invalidation');

    // Invalidation with matching Token B hash succeeds
    const validInvalidateRes = await accountRepository.invalidatePasswordResetTokenByHash(hashAuditEmail, tokenBObj.tokenHash);
    assert(validInvalidateRes.invalidated === true, 'PHASE2-11: Invalidation with matching token hash succeeds');
    const clearedCred = accountRepository.adapter.credentials.get(hashAuditEmail);
    assert(clearedCred.recovery_token_hash === null && clearedCred.recovery_token_expires_at === null, 'PHASE2-12: Recovery token hash and expiry cleared from storage');

    // 4. rotatePassword contract
    const rotAccount = await accountRepository.createAccount({
      primary_email: 'rotate_me@acme.com',
      legal_entity_name: 'Rotation Corp',
      password: 'PreRotationPassword2026!'
    });
    // Create an active session
    const rotSession = await accountRepository.createSession(rotAccount);
    const preRotVerify = await accountRepository.verifySession(rotSession.token);
    assert(Boolean(preRotVerify), 'PHASE2-13: Active session verified before rotation');

    // Execute rotatePassword
    const rotRes = await accountRepository.rotatePassword(rotAccount.id, 'PostRotationPassword2026!');
    assert(rotRes.success === true, 'PHASE2-14: rotatePassword succeeds with valid new password');

    // Old password fails
    const oldRotAuth = await accountRepository.authenticate('rotate_me@acme.com', 'PreRotationPassword2026!');
    assert(oldRotAuth.authenticated === false, 'PHASE2-15: Old password rejected after rotation');

    // New password succeeds
    const newRotAuth = await accountRepository.authenticate('rotate_me@acme.com', 'PostRotationPassword2026!');
    assert(newRotAuth.authenticated === true, 'PHASE2-16: New password authenticates successfully after rotation');

    // Prior session revoked
    const postRotVerify = await accountRepository.verifySession(rotSession.token);
    assert(postRotVerify === null, 'PHASE2-17: Prior session revoked upon password rotation');

    // rotatePassword validation: weak password rejected
    let weakRotFailed = false;
    try {
      await accountRepository.rotatePassword(rotAccount.id, 'short');
    } catch (err) {
      weakRotFailed = (err.statusCode === 400);
    }
    assert(weakRotFailed, 'PHASE2-18: rotatePassword rejects weak password with HTTP 400');

    // 5. Parity check on in-memory and PostgreSQL method interfaces
    const inMemMethods = ['rotatePassword', 'invalidatePasswordResetTokenByHash', 'resetPassword', 'revokeAllUserSessions'];
    for (const m of inMemMethods) {
      assert(typeof accountRepository.adapter[m] === 'function', `PHASE2-19: InMemoryAccountStorage implements ${m}`);
      assert(typeof PostgresAccountStorage.prototype[m] === 'function', `PHASE2-20: PostgresAccountStorage implements ${m}`);
      assert(typeof accountRepository[m] === 'function', `PHASE2-21: AccountRepository implements ${m}`);
    }

    // ------------------------------------------------------------------------
    // Test Suite 7d: Task 004F-02B Atomic Reset-Token Redemption & Concurrency
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 7d: Task 004F-02B Atomic Reset-Token Redemption & Concurrency ---');

    // 1. Valid token redemption succeeds
    const atomicEmail = 'atomic_user@acme.com';
    const atomicAcc = await accountRepository.createAccount({
      primary_email: atomicEmail,
      legal_entity_name: 'Atomic Redemption Corp',
      password: 'PreResetPass2026!'
    });
    const atomicSession = await accountRepository.createSession(atomicAcc);
    const preResetVerify = await accountRepository.verifySession(atomicSession.token);
    assert(Boolean(preResetVerify), 'TASK004F-02B-1: Active session verified before reset');

    const validTokenObj = await accountRepository.createPasswordResetToken(atomicEmail);
    const resetResult = await accountRepository.resetPassword(validTokenObj.token, 'PostResetPass2026!');
    assert(resetResult.success === true, 'TASK004F-02B-2: Valid token reset succeeds');

    const oldAuthCheck = await accountRepository.authenticate(atomicEmail, 'PreResetPass2026!');
    assert(oldAuthCheck.authenticated === false, 'TASK004F-02B-3: Old password rejected after reset');

    const newAuthCheck = await accountRepository.authenticate(atomicEmail, 'PostResetPass2026!');
    assert(newAuthCheck.authenticated === true, 'TASK004F-02B-4: New password authenticates successfully after reset');

    const postResetVerify = await accountRepository.verifySession(atomicSession.token);
    assert(postResetVerify === null, 'TASK004F-02B-5: Prior active session revoked upon password reset');

    const atomicCredRecord = accountRepository.adapter.credentials.get(atomicEmail);
    assert(atomicCredRecord.recovery_token_hash === null && atomicCredRecord.recovery_token_expires_at === null, 'TASK004F-02B-6: Reset-token hash and expiry cleared from storage after success');

    // 2. Invalid token fails safely
    let invalidTokenFailed = false;
    try {
      await accountRepository.resetPassword('completely_bogus_token_xyz', 'PostResetPass2026!');
    } catch (err) {
      invalidTokenFailed = (err.statusCode === 400 && err.message.includes('Invalid or expired'));
    }
    assert(invalidTokenFailed, 'TASK004F-02B-7: Invalid token fails with HTTP 400');

    // 3. Expired token fails safely
    const expiredTokenObj = await accountRepository.createPasswordResetToken(atomicEmail);
    const expiredCred = accountRepository.adapter.credentials.get(atomicEmail);
    expiredCred.recovery_token_expires_at = new Date(Date.now() - 60000).toISOString(); // 1 minute in past
    let expiredTokenFailed = false;
    try {
      await accountRepository.resetPassword(expiredTokenObj.token, 'PostResetPass2026!');
    } catch (err) {
      expiredTokenFailed = (err.statusCode === 400);
    }
    assert(expiredTokenFailed, 'TASK004F-02B-8: Expired token fails with HTTP 400');

    // 4. Replayed token fails (single-use guarantee)
    const replayTokenObj = await accountRepository.createPasswordResetToken(atomicEmail);
    await accountRepository.resetPassword(replayTokenObj.token, 'ReplayFirstPass2026!');
    let replayFailed = false;
    try {
      await accountRepository.resetPassword(replayTokenObj.token, 'ReplaySecondPass2026!');
    } catch (err) {
      replayFailed = (err.statusCode === 400);
    }
    assert(replayFailed, 'TASK004F-02B-9: Replay of consumed token is strictly rejected');

    const replayAuthFirst = await accountRepository.authenticate(atomicEmail, 'ReplayFirstPass2026!');
    assert(replayAuthFirst.authenticated === true, 'TASK004F-02B-10: First redemption password remains active');
    const replayAuthSecond = await accountRepository.authenticate(atomicEmail, 'ReplaySecondPass2026!');
    assert(replayAuthSecond.authenticated === false, 'TASK004F-02B-11: Replayed attempt did not overwrite established password');

    // 5. Two concurrent redemption attempts result in exactly one success
    const concurrentEmail = 'concurrent_mem@acme.com';
    const concurrentAcc = await accountRepository.createAccount({
      primary_email: concurrentEmail,
      legal_entity_name: 'Concurrent Test Corp',
      password: 'InitialConcurrentPass2026!'
    });
    const concurrentSession = await accountRepository.createSession(concurrentAcc);
    const concurrentTokenObj = await accountRepository.createPasswordResetToken(concurrentEmail);

    const [memRes1, memRes2] = await Promise.allSettled([
      accountRepository.resetPassword(concurrentTokenObj.token, 'ConcurrentPassAlpha1!'),
      accountRepository.resetPassword(concurrentTokenObj.token, 'ConcurrentPassBeta2!')
    ]);

    const memSuccesses = [memRes1, memRes2].filter(r => r.status === 'fulfilled');
    const memFailures = [memRes1, memRes2].filter(r => r.status === 'rejected');
    assert(memSuccesses.length === 1, 'TASK004F-02B-12: Exactly one concurrent redemption succeeds');
    assert(memFailures.length === 1, 'TASK004F-02B-13: Exactly one concurrent redemption fails');
    assert(memFailures[0].reason.statusCode === 400, 'TASK004F-02B-14: Failed concurrent attempt receives HTTP 400');

    // Confirm which password won and that the loser password was not applied
    const alphaAuth = await accountRepository.authenticate(concurrentEmail, 'ConcurrentPassAlpha1!');
    const betaAuth = await accountRepository.authenticate(concurrentEmail, 'ConcurrentPassBeta2!');
    assert(alphaAuth.authenticated !== betaAuth.authenticated, 'TASK004F-02B-15: Password changes only once to the winning attempt');
    const sessionPostConcurrent = await accountRepository.verifySession(concurrentSession.token);
    assert(sessionPostConcurrent === null, 'TASK004F-02B-16: Prior session revoked upon concurrent password reset');

    // 6. PostgreSQL adapter single-statement atomic CTE verification
    let executedPgSql = '';
    const mockPgClient = {
      query: (sql) => {
        executedPgSql = sql;
        return JSON.stringify([{ account_id: 'mock-account-uuid' }]);
      }
    };
    const mockPgStorage = new PostgresAccountStorage(mockPgClient);
    const pgResetRes = await mockPgStorage.resetPassword('sample_raw_token_123', 'PgNewPassword2026!');
    assert(pgResetRes.success === true, 'TASK004F-02B-17: PostgresAccountStorage.resetPassword succeeds when CTE returns account_id');

    // Verify CTE structure in generated SQL
    assert(executedPgSql.includes('WITH updated_cred AS ('), 'TASK004F-02B-18: Postgres resetPassword uses data-modifying CTE');
    assert(executedPgSql.includes('UPDATE auth_credentials'), 'TASK004F-02B-19: CTE updates auth_credentials');
    assert(executedPgSql.includes('recovery_token_hash = \'') && executedPgSql.includes('WHERE recovery_token_hash ='), 'TASK004F-02B-20: CTE conditionally matches recovery_token_hash');
    assert(executedPgSql.includes('recovery_token_expires_at > CURRENT_TIMESTAMP'), 'TASK004F-02B-21: CTE enforces strictly non-expired token');
    assert(executedPgSql.includes('recovery_token_hash = NULL'), 'TASK004F-02B-22: CTE clears recovery_token_hash upon redemption');
    assert(executedPgSql.includes('recovery_token_expires_at = NULL'), 'TASK004F-02B-23: CTE clears recovery_token_expires_at upon redemption');
    assert(executedPgSql.includes('revoked_sessions AS ('), 'TASK004F-02B-24: CTE binds session revocation to successful credential update');
    assert(executedPgSql.includes('SELECT account_id FROM updated_cred'), 'TASK004F-02B-25: CTE selects account_id from updated_cred');

    // 7. PostgreSQL adapter: 0 rows returned triggers HTTP 400 safely
    const emptyPgClient = {
      query: () => JSON.stringify([])
    };
    const emptyPgStorage = new PostgresAccountStorage(emptyPgClient);
    let emptyPgFailed = false;
    try {
      await emptyPgStorage.resetPassword('unmatched_token_xyz', 'PgNewPassword2026!');
    } catch (err) {
      emptyPgFailed = (err.statusCode === 400 && err.message === 'Invalid or expired password reset token');
    }
    assert(emptyPgFailed, 'TASK004F-02B-26: PostgresAccountStorage rejects when 0 rows updated (invalid/expired/consumed token)');

    // 8. PostgreSQL adapter concurrent redemption simulation (row lock / single-use)
    let pgCallCount = 0;
    const concurrentPgClient = {
      query: () => {
        pgCallCount++;
        // Request 1 matches row; Request 2 matches 0 rows (already consumed)
        if (pgCallCount === 1) {
          return JSON.stringify([{ account_id: 'mock-account-uuid' }]);
        }
        return JSON.stringify([]);
      }
    };
    const concurrentPgStorage = new PostgresAccountStorage(concurrentPgClient);
    const [pgRes1, pgRes2] = await Promise.allSettled([
      concurrentPgStorage.resetPassword('simulated_concurrent_token', 'PgPassAlpha1!'),
      concurrentPgStorage.resetPassword('simulated_concurrent_token', 'PgPassBeta2!')
    ]);
    const pgSuccesses = [pgRes1, pgRes2].filter(r => r.status === 'fulfilled');
    const pgFailures = [pgRes1, pgRes2].filter(r => r.status === 'rejected');
    assert(pgSuccesses.length === 1, 'TASK004F-02B-27: PostgreSQL concurrent simulation results in exactly one success');
    assert(pgFailures.length === 1, 'TASK004F-02B-28: PostgreSQL concurrent simulation results in exactly one failure');
    assert(pgFailures[0].reason.statusCode === 400, 'TASK004F-02B-29: PostgreSQL loser receives HTTP 400');
    assert(pgCallCount === 2, 'TASK004F-02B-30: Exactly two atomic single-statement queries executed across both concurrent requests');

    // ------------------------------------------------------------------------
    // Test Suite 8: Document Intake Quarantine Gating
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 8: Document Intake Quarantine Gating ---');

    // Upload endpoint explicitly returns 503 Service Unavailable
    const uploadRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST'
    });
    assert(uploadRes.statusCode === 503, 'Document upload returns HTTP 503 Service Unavailable');
    assert(uploadRes.body.status === 'UNAVAILABLE_PENDING_SCANNER', 'Upload response states UNAVAILABLE_PENDING_SCANNER');

    // Add a quarantined document to Case A
    const quarantinedDoc = memoryStore.createCaseDocument({
      case_id: caseA.id,
      uploaded_by: userA.id,
      original_filename: 'director_kyc.pdf',
      file_signature: 'abc123hash',
      file_size_bytes: 1048576,
      mime_type: 'application/pdf',
      quarantine_status: 'QUARANTINE'
    }, { userId: userA.id, role: 'client' });

    // Customer A attempts to get download URL for quarantined document
    const docDownloadQuarantined = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${quarantinedDoc.id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(docDownloadQuarantined.statusCode === 404, 'QUARANTINE PROTECTION: Customer cannot access document while in QUARANTINE status');

    // Mark document as CLEAN (post-scan)
    memoryStore.updateDocumentQuarantine(quarantinedDoc.id, 'CLEAN', { threats_found: 0 }, { role: 'compliance_operator' });

    // Customer A can now fetch download URL
    const docDownloadClean = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${quarantinedDoc.id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(docDownloadClean.statusCode === 200, 'Customer A can fetch download URL once document is CLEAN');
    assert(docDownloadClean.body.download_url.includes('sig='), 'Download URL is signed with HMAC token');

    // Cross-tenant document check: Customer B attempts to download Customer A's clean document
    const docDownloadB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${quarantinedDoc.id}/download-url`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(docDownloadB.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B cannot download Customer A document');

    // ------------------------------------------------------------------------
    // Test Suite 9: Lifecycle State Machine Transitions
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 9: Lifecycle State Machine Transitions ---');
    assert(canTransition('lead', LEAD_STATES.ENQUIRY_RECEIVED, LEAD_STATES.AWAITING_REVIEW) === true, 'Lead transition ENQUIRY_RECEIVED -> AWAITING_REVIEW is valid');
    assert(canTransition('lead', LEAD_STATES.AWAITING_REVIEW, LEAD_STATES.ACCEPTED) === true, 'Lead transition AWAITING_REVIEW -> ACCEPTED is valid');
    assert(canTransition('lead', LEAD_STATES.ACCEPTED, LEAD_STATES.CONVERTED_TO_CASE) === true, 'Lead transition ACCEPTED -> CONVERTED_TO_CASE is valid');
    assert(canTransition('lead', LEAD_STATES.ENQUIRY_RECEIVED, LEAD_STATES.CONVERTED_TO_CASE) === false, 'Lead transition ENQUIRY_RECEIVED -> CONVERTED_TO_CASE is invalid');
    assert(canTransition('case', CASE_STATES.IN_PROGRESS, CASE_STATES.COMPLETED) === true, 'Case transition IN_PROGRESS -> COMPLETED is valid');
    assert(canTransition('case', CASE_STATES.IN_PROGRESS, CASE_STATES.CLOSED) === false, 'Case transition IN_PROGRESS -> CLOSED directly is invalid');

    // ------------------------------------------------------------------------
    // Test Suite 10: Referral-Only Boundary Enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 10: Referral-Only Boundary Enforcement ---');
    clearRateLimitStore();

    const referralPayload1 = {
      contact_name: 'Vikram Mehta',
      email: 'vikram@mehtacorp.in',
      phone: '+91 9811122233',
      source_url: '/services/nclt-insolvency-defense.html',
      dpdp_consent: true
    };
    const refRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, referralPayload1);
    assert(refRes1.statusCode === 422, 'Referral-only route (NCLT Defense) returns HTTP 422 Unprocessable Entity');
    assert(JSON.stringify(refRes1.body).includes('Advocates Act 1961'), 'Referral rejection cites Advocates Act 1961 boundary');

    const referralPayload2 = {
      contact_name: 'Vikram Mehta',
      email: 'vikram.opp@mehtacorp.in',
      phone: '+91 9811122234',
      source_url: '/services/oppression-mismanagement-petitions.html',
      dpdp_consent: true
    };
    const refRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, referralPayload2);
    assert(refRes2.statusCode === 422, 'Referral-only route (Oppression & Mismanagement) returns HTTP 422 Unprocessable Entity');

    const referralPayload3 = {
      contact_name: 'Vikram Mehta',
      email: 'vikram.dir@mehtacorp.in',
      phone: '+91 9811122235',
      source_url: '/services/director-removal-board-disputes.html',
      dpdp_consent: true
    };
    const refRes3 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, referralPayload3);
    assert(refRes3.statusCode === 422, 'Referral-only route (Director Removal) returns HTTP 422 Unprocessable Entity');

    // Active transactional strike-off is accepted
    clearRateLimitStore();
    const strikeOffPayload = {
      contact_name: 'Rajesh Nair',
      email: 'rajesh@nairlogistics.com',
      phone: '+91 9988776655',
      service_id: 'V02-SVC-013', // Form STK-2 Company Strike-Off
      vertical_id: 'V02',
      dpdp_consent: true
    };
    const strikeOffRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, strikeOffPayload);
    assert(strikeOffRes.statusCode === 201, 'Active transactional strike-off service (V02-SVC-013) is accepted');

    // ------------------------------------------------------------------------
    // Test Suite 11: Task C Ingestion Validation, Persistence & Lead Triage
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 11: Task C Ingestion Validation, Persistence & Lead Triage ---');
    clearRateLimitStore();

    // 1. Missing contact_name
    const invalidNameRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'test@acme.com', phone: '+91 9876543210', dpdp_consent: true });
    assert(invalidNameRes.statusCode === 422, 'Rejects enquiry with missing contact_name (HTTP 422)');

    // 2. Invalid email format
    const invalidEmailRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'invalid-email-string', phone: '+91 9876543210', dpdp_consent: true });
    assert(invalidEmailRes.statusCode === 422, 'Rejects enquiry with invalid email format (HTTP 422)');

    // 3. Invalid phone format
    const invalidPhoneRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid@acme.com', phone: '12345', dpdp_consent: true });
    assert(invalidPhoneRes.statusCode === 422, 'Rejects enquiry with invalid phone number (HTTP 422)');

    // 4. Missing DPDP consent
    clearRateLimitStore();
    const missingConsentRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid@acme.com', phone: '+91 9876543210', dpdp_consent: false });
    assert(missingConsentRes.statusCode === 422, 'Rejects enquiry without explicit DPDP consent (HTTP 422)');

    // 5. Unsupported service_id
    clearRateLimitStore();
    const unknownServiceRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid@acme.com', phone: '+91 9876543210', dpdp_consent: true, service_id: 'V99-SVC-999' });
    assert(unknownServiceRes.statusCode === 422, 'Rejects unknown service_id not in canonical registry (HTTP 422)');

    // 6. Unsupported vertical_id
    clearRateLimitStore();
    const unknownVerticalRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid@acme.com', phone: '+91 9876543210', dpdp_consent: true, vertical_id: 'V99' });
    assert(unknownVerticalRes.statusCode === 422, 'Rejects unknown vertical_id not in canonical taxonomy (HTTP 422)');

    // 7. Service / vertical mismatch
    clearRateLimitStore();
    const mismatchRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid@acme.com', phone: '+91 9876543210', dpdp_consent: true, service_id: 'V01-SVC-007', vertical_id: 'V08' });
    assert(mismatchRes.statusCode === 422, 'Rejects mismatched service_id and vertical_id combination (HTTP 422)');

    // 8. Persistence Failure Error Boundary (Simulated Storage Engine Write Exception)
    clearRateLimitStore();
    enquiryRepository.adapter.setSimulateFailure(true);
    const failRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Test Client', email: 'valid.persist@acme.com', phone: '+91 9876543210', dpdp_consent: true, service_id: 'V01-SVC-007', vertical_id: 'V01' });
    assert(failRes.statusCode === 500, 'Persistence failure returns HTTP 500 Internal Server Error');
    assert(failRes.body.error === 'Internal Server Error' && !JSON.stringify(failRes.body).includes('at '), 'Persistence error is shielded without leaking stack traces');
    enquiryRepository.adapter.setSimulateFailure(false);

    // 9. Successful Ingestion & Reference Verification
    clearRateLimitStore();
    const validEnquiryRes = await request({
      hostname: '127.0.0.1', port: testPort, path: '/api/v1/enquiries', method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { contact_name: 'Pooja Hegde', email: 'pooja@hegdecorp.in', phone: '+91 9876543210', dpdp_consent: true, service_id: 'V01-SVC-007', vertical_id: 'V01' });
    assert(validEnquiryRes.statusCode === 201, 'Valid enquiry accepted and persisted with HTTP 201');
    const createdRef = validEnquiryRes.body.lead_reference;
    assert(createdRef && createdRef.startsWith('LEAD-'), 'Generates valid opaque lead reference');

    // 10. Unauthorized Lead Triage Access (Unauthenticated)
    const unauthTriage = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/enquiries/${createdRef}`, method: 'GET'
    });
    assert(unauthTriage.statusCode === 401, 'Unauthenticated triage access to lead enquiry returns HTTP 401 Unauthorized');

    // 11. Unauthorized Lead Triage Access (Client Role Forbidden)
    const clientTriage = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/enquiries/${createdRef}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(clientTriage.statusCode === 403, 'Client role triage access to lead enquiry returns HTTP 403 Forbidden');

    // 12. Authorized Lead Triage Access (Staff Role Permitted)
    const staffTriage = await request({
      hostname: '127.0.0.1', port: testPort, path: `/api/v1/enquiries/${createdRef}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(staffTriage.statusCode === 200, 'Authorized compliance staff can triage and inspect lead enquiry (HTTP 200)');
    assert(staffTriage.body.enquiry.lead_reference === createdRef, 'Triage response returns correct lead reference');

    // 13. All 17 Interactive Intake Forms Route Mapping Validation
    clearRateLimitStore();
    const ROUTE_SERVICE_MAP = {
      "/services/pvt-ltd-registration.html": { service_id: "V01-SVC-007", vertical_id: "V01" },
      "/conversion/contract-intake.html": { service_id: "V05-SVC-002", vertical_id: "V05" },
      "/conversion/cross-border-retainer.html": { service_id: "V13-SVC-001", vertical_id: "V13" },
      "/conversion/csr-audit-form.html": { service_id: "V11-SVC-003", vertical_id: "V11" },
      "/conversion/dispute-consultation.html": { service_id: "V09-SVC-003", vertical_id: "V09" },
      "/conversion/dpdp-audit-request.html": { service_id: "V12-SVC-002", vertical_id: "V12" },
      "/conversion/fema-consultation.html": { service_id: "V13-SVC-001", vertical_id: "V13" },
      "/conversion/hr-audit.html": { service_id: "V07-SVC-001", vertical_id: "V07" },
      "/conversion/license-qualification.html": { service_id: "V04-SVC-001", vertical_id: "V04" },
      "/conversion/ma-advisory-enquiry.html": { service_id: "V09-SVC-001", vertical_id: "V09" },
      "/conversion/post-incorporation-checkout.html": { service_id: "V01-SVC-001", vertical_id: "V01" },
      "/conversion/retainer-desk.html": { service_id: "V02-SVC-017", vertical_id: "V02" },
      "/conversion/secretarial-audit-scope.html": { service_id: "V11-SVC-004", vertical_id: "V11" },
      "/conversion/strike-off-checker.html": { service_id: "V02-SVC-013", vertical_id: "V02" },
      "/conversion/tax-intake.html": { service_id: "V03-SVC-003", vertical_id: "V03" },
      "/conversion/trademark-search.html": { service_id: "V06-SVC-003", vertical_id: "V06" },
      "/conversion/venture-deal-booking.html": { service_id: "V05-SVC-001", vertical_id: "V05" }
    };
    const { validateEnquiryPayload } = require('../src/backend/models/enquiry.model');
    let all17Valid = true;
    for (const [route, item] of Object.entries(ROUTE_SERVICE_MAP)) {
      const v = validateEnquiryPayload({
        contact_name: 'Synthetic Test Client',
        email: 'test@craftegon-test.com',
        phone: '9876543210',
        service_id: item.service_id,
        vertical_id: item.vertical_id,
        dpdp_consent: true,
        source_url: route
      });
      if (!v.valid) all17Valid = false;
    }
    assert(all17Valid, 'All 17 interactive enquiry forms map to canonical Phase 2 services and validate');

  } finally {
    await testInstance.stop();
    console.log('\nTest server stopped.');
  }

  console.log('\n======================================================================');
  console.log(`TASK C TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed (${testsPassed + testsFailed} total assertions)`);
  console.log('======================================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
