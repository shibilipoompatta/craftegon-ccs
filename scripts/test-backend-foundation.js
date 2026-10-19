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

    // 1b. Synthetic Login Guard: blocked in production
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
      assert(prodLoginRes.statusCode === 403, 'PRODUCTION AUTH BOUNDARY: Synthetic login is strictly blocked with HTTP 403 in production environment');
    } finally {
      await prodServer.stop();
      configureStorageAdapters(testInstance.config);
    }

    // 2. Setup synthetic Customer A
    const loginA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_a@acme.com', legal_entity_name: 'Acme Alpha Pvt Ltd', role: 'client' });
    const tokenA = loginA.body.token;
    const userA = loginA.body.user;
    assert(Boolean(tokenA) && userA.role === 'client', 'Synthetic Customer A logs in successfully');

    // 3. Setup synthetic Customer B
    const loginB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'client_b@beta.com', legal_entity_name: 'Beta Biotech LLP', role: 'client' });
    const tokenB = loginB.body.token;
    const userB = loginB.body.user;
    assert(Boolean(tokenB) && userB.role === 'client', 'Synthetic Customer B logs in successfully');

    // 4. Staff logs in and creates a case for Customer A
    const loginStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'officer@craftegon.com', role: 'compliance_operator' });
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
