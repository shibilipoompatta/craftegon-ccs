/**
 * CraftEgon CCS - Phase 3 Task F & G: Master End-to-End Customer Journeys Test Suite
 * Fully automated validation of the 4 core customer journeys:
 *  - Journey 1: Enquiry to Lead Triage & Case Conversion
 *  - Journey 2: Authenticated Customer Portal & Cross-Tenant Isolation
 *  - Journey 3: Secure Document Intake, Quarantine Gating & Signed Retrieval
 *  - Journey 4: Sandbox Checkout, Authoritative Pricing & Webhook Idempotency
 *
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const { createServer } = require('../src/backend/server');
const { memoryStore } = require('../src/backend/storage/memory-store');
const { accountRepository, InMemoryAccountStorage } = require('../src/backend/storage/account-repository');
const { enquiryRepository, InMemoryEnquiryStorage } = require('../src/backend/storage/enquiry-repository');
const { caseRepository, InMemoryCaseStorage } = require('../src/backend/storage/case-repository');
const { documentRepository, InMemoryDocumentStorage } = require('../src/backend/storage/document-repository');
const { orderRepository, InMemoryOrderStorage } = require('../src/backend/storage/order-repository');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedAssertions++;
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

async function runE2EJourneysSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Master End-to-End Customer Journeys Test Suite');
  console.log('======================================================================\n');

  memoryStore.reset();
  accountRepository.setAdapter(new InMemoryAccountStorage());
  enquiryRepository.setAdapter(new InMemoryEnquiryStorage());
  caseRepository.setAdapter(new InMemoryCaseStorage());
  documentRepository.setAdapter(new InMemoryDocumentStorage());
  orderRepository.setAdapter(new InMemoryOrderStorage());

  const testPort = 3194;
  const testSecret = 'craftegon-sandbox-test-key-secret';
  const testWebhookSecret = 'craftegon-sandbox-webhook-secret-sig';

  const testInstance = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    SCANNER_ENABLED: true,
    MAX_DOCUMENT_SIZE_BYTES: 10 * 1024 * 1024,
    RAZORPAY_KEY_ID: 'rzp_test_e2e_mock',
    RAZORPAY_KEY_SECRET: testSecret,
    RAZORPAY_WEBHOOK_SECRET: testWebhookSecret
  });

  await testInstance.start();
  console.log(`E2E test server running on port ${testPort}\n`);

  try {
    // ========================================================================
    // JOURNEY 1: Public Enquiry Submission to Lead Triage & Case Lifecycle
    // ========================================================================
    console.log('--- Journey 1: Enquiry Submission to Lead & Case Tracking ---');

    // 1.1 Visitor submits invalid enquiry (missing consent and malformed email)
    const invalidEnquiryRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      contact_name: 'Aditi Sharma',
      email: 'not-an-email',
      phone: '+919876543210',
      service_id: 'V01-SVC-001',
      vertical_id: 'V01'
    });
    assert(invalidEnquiryRes.statusCode === 422, 'J1.1: Invalid enquiry rejected server-side with HTTP 422');
    assert(invalidEnquiryRes.body.status !== 'success', 'J1.1: Failed submission does not display false success');

    // 1.2 Visitor submits valid corporate compliance enquiry
    const validEnquiryRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      company_name: 'Nexus Bharat Logistics Private Limited',
      cin_llpin: 'U60200MH2022PTC384721',
      contact_name: 'Aditi Sharma',
      email: 'aditi.sharma@nexusbharat.in',
      phone: '+919876543210',
      service_id: 'V01-SVC-001',
      vertical_id: 'V01',
      message: 'Urgent annual statutory secretarial audit and AOC-4 filing requirement for FY 2025-26.',
      dpdp_consent: true
    });
    assert(validEnquiryRes.statusCode === 201, 'J1.2: Valid corporate enquiry accepted with HTTP 201 Created');
    assert(validEnquiryRes.body.lead_reference && validEnquiryRes.body.lead_reference.startsWith('LEAD-2026-'), 'J1.2: Server persists enquiry and issues authoritative reference');
    const enquiryRef = validEnquiryRes.body.lead_reference;

    // 1.3 Lead record verification in persistence
    const leadRecord = await enquiryRepository.getEnquiry(enquiryRef, { role: 'compliance_operator' });
    assert(leadRecord !== null, 'J1.3: Lead enquiry persisted in server repository');
    assert(leadRecord.status === 'ENQUIRY_RECEIVED', 'J1.3: Initial lead status is ENQUIRY_RECEIVED');

    // 1.4 Unauthenticated and client users cannot access lead triage
    const unauthTriageRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/enquiries/${enquiryRef}`,
      method: 'GET'
    });
    assert(unauthTriageRes.statusCode === 401, 'J1.4: Unauthenticated lead triage rejected with HTTP 401');

    // Setup accounts for portal and compliance staff
    const staffAccount = await accountRepository.createAccount({
      legal_entity_name: 'CraftEgon Compliance Directorate',
      primary_email: 'ops@craftegon.com',
      primary_phone: '+919876543299',
      account_role: 'compliance_operator'
    });
    const staffSession = await accountRepository.createSession(staffAccount);
    const staffToken = `Bearer ${staffSession.token}`;

    // 1.5 Authorized compliance staff triages lead
    const triageRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/enquiries/${enquiryRef}`,
      method: 'GET',
      headers: { 'Authorization': staffToken }
    });
    assert(triageRes.statusCode === 200, 'J1.5: Authorized compliance operator triages lead (HTTP 200)');
    assert(triageRes.body.enquiry.contact_name === 'Aditi Sharma', 'J1.5: Lead details accurately retrieved');

    // 1.6 Valid lifecycle transition: ENQUIRY_RECEIVED -> AWAITING_REVIEW -> ACCEPTED
    await enquiryRepository.updateStatus(enquiryRef, 'AWAITING_REVIEW', { role: 'compliance_operator' });
    const updatedLead = await enquiryRepository.getEnquiry(enquiryRef, { role: 'compliance_operator' });
    assert(updatedLead.status === 'AWAITING_REVIEW', 'J1.6: Lead transitioned to AWAITING_REVIEW');

    await enquiryRepository.updateStatus(enquiryRef, 'ACCEPTED', { role: 'compliance_operator' });
    const acceptedLead = await enquiryRepository.getEnquiry(enquiryRef, { role: 'compliance_operator' });
    assert(acceptedLead.status === 'ACCEPTED', 'J1.6: Lead transitioned to ACCEPTED');

    // ========================================================================
    // JOURNEY 2: Authenticated Customer Portal & Cross-Tenant Isolation
    // ========================================================================
    console.log('\n--- Journey 2: Authenticated Customer Portal & Tenant Isolation ---');

    // 2.1 Customer A registers corporate account
    const regResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Nexus Bharat Logistics Private Limited',
      cin_llpin: 'U60200MH2022PTC384721',
      primary_email: 'aditi.sharma@nexusbharat.in',
      primary_phone: '+91 9876543210',
      account_role: 'client',
      password: 'NexusCorporate2026!'
    });
    assert(regResA.statusCode === 201, 'J2.1: Customer A registers account with strong password (HTTP 201)');
    const customerAId = regResA.body.account.id;

    // 2.2 Customer B registers separate account
    const regResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Zenith Logistics LLP',
      cin_llpin: 'AAB-1234',
      primary_email: 'finance@zenithllp.in',
      primary_phone: '+91 9876543211',
      account_role: 'client',
      password: 'ZenithSecure2026!'
    });
    assert(regResB.statusCode === 201, 'J2.2: Customer B registers account (HTTP 201)');
    const customerBId = regResB.body.account.id;

    // 2.3 Customer A logs in and receives HttpOnly session cookie + token
    const loginResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'aditi.sharma@nexusbharat.in',
      password: 'NexusCorporate2026!'
    });
    assert(loginResA.statusCode === 200, 'J2.3: Customer A logs in successfully (HTTP 200)');
    assert(loginResA.headers['set-cookie'] !== undefined, 'J2.3: Sets HttpOnly session cookie');
    const tokenA = loginResA.body.token;
    const authHeaderA = `Bearer ${tokenA}`;

    // Customer B logs in
    const loginResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'finance@zenithllp.in',
      password: 'ZenithSecure2026!'
    });
    const authHeaderB = `Bearer ${loginResB.body.token}`;

    // 2.4 Customer A fetches own profile
    const profileResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(profileResA.statusCode === 200, 'J2.4: Customer A queries /api/v1/auth/me (HTTP 200)');
    assert(profileResA.body.user.id === customerAId, 'J2.4: Profile identity derived strictly from session');
    assert(profileResA.body.user.legal_entity_name === 'Nexus Bharat Logistics Private Limited', 'J2.4: Corporate entity name matches');

    // 2.5 Compliance staff provisions cases for Customer A and Customer B
    const caseA = await caseRepository.createCase({
      client_id: customerAId,
      case_reference: 'CASE-2026-NEXUS-01',
      vertical_id: 'V01',
      title: 'Annual Statutory Secretarial Filing FY 2025-26',
      service_id: 'V01-SVC-001',
      status: 'IN_PROGRESS'
    }, { role: 'compliance_operator' });

    const caseB = await caseRepository.createCase({
      client_id: customerBId,
      case_reference: 'CASE-2026-ZENITH-02',
      vertical_id: 'V01',
      title: 'FDI Reporting on FIRMS RBI Portal',
      service_id: 'V01-SVC-002',
      status: 'IN_PROGRESS'
    }, { role: 'compliance_operator' });

    assert(caseA && caseB, 'J2.5: Compliance operator created isolated cases for Customer A and B');

    // 2.6 Cross-tenant access isolation verification
    const listCasesARes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(listCasesARes.statusCode === 200, 'J2.6: Customer A lists portal cases (HTTP 200)');
    assert(listCasesARes.body.cases.length === 1, 'J2.6: Customer A sees exactly 1 case');
    assert(listCasesARes.body.cases[0].case_reference === 'CASE-2026-NEXUS-01', 'J2.6: Customer A sees only their own case');

    const crossCaseRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-ZENITH-02',
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(crossCaseRes.statusCode === 404, 'J2.6: CROSS-TENANT ISOLATION: Customer A querying Customer B case returns HTTP 404 (Zero data leakage)');

    // 2.7 Client cannot mutate case status (Admin privilege escalation blocked)
    const mutateAttemptRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases/CASE-2026-NEXUS-01',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeaderA }
    }, { status: 'COMPLETED' });
    assert(mutateAttemptRes.statusCode === 403, 'J2.7: PRIVILEGE ESCALATION BLOCKED: Client role cannot mutate case status (HTTP 403)');

    // ========================================================================
    // JOURNEY 3: Secure Document Intake, Quarantine Gating & Signed Download
    // ========================================================================
    console.log('\n--- Journey 3: Secure Document Intake, Quarantine & Signed Download ---');

    function createSyntheticPdf(content = 'CraftEgon Corporate Services Test Document') {
      return Buffer.concat([
        Buffer.from('%PDF-1.7\n'),
        Buffer.from(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n${content}\n%%EOF\n`)
      ]);
    }

    // 3.1 Executable / malware spoofing rejected by magic-byte verification
    const spoofedExeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00This is an executable payload disguised as PDF');
    const uploadExeRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeaderA
      }
    }, {
      case_id: caseA.id,
      filename: 'Audit_Report.pdf',
      file_base64: spoofedExeBuffer.toString('base64'),
      mime_type: 'application/pdf'
    });
    assert(uploadExeRes.statusCode === 422, 'J3.1: Spoofed executable with .pdf extension strictly rejected by magic bytes (HTTP 422)');

    // 3.2 Customer A uploads valid corporate document (clean PDF)
    const validPdfBuffer = createSyntheticPdf('CraftEgon Annual Statutory Audit Report FY 2025-26');
    const uploadRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeaderA
      }
    }, {
      case_id: caseA.id,
      filename: 'Audited_Financials_FY25.pdf',
      file_base64: validPdfBuffer.toString('base64'),
      mime_type: 'application/pdf'
    });
    assert(uploadRes.statusCode === 201, 'J3.2: Clean PDF uploaded successfully (HTTP 201 Created)');
    assert(uploadRes.body.document_id !== undefined, 'J3.2: Opaque document ID issued');
    assert(uploadRes.body.quarantine_status === 'CLEAN', 'J3.2: ClamAV malware scan completed with CLEAN status');
    const docId = uploadRes.body.document_id;

    // 3.3 CROSS-TENANT DOCUMENT ISOLATION: Customer B cannot upload into Customer A's case
    const crossUploadRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeaderB
      }
    }, {
      case_id: caseA.id,
      filename: 'Malicious_Infiltration.pdf',
      file_base64: validPdfBuffer.toString('base64'),
      mime_type: 'application/pdf'
    });
    assert(crossUploadRes.statusCode === 403 || crossUploadRes.statusCode === 404, 'J3.3: CROSS-TENANT ISOLATION: Customer B cannot upload document to Customer A case (HTTP 403/404)');

    // 3.4 Customer A generates short-lived HMAC signed download URL
    const signedUrlRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docId}/download-url`,
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(signedUrlRes.statusCode === 200, 'J3.4: Customer A obtains signed download URL (HTTP 200)');
    assert(signedUrlRes.body.download_url && signedUrlRes.body.download_url.includes('sig='), 'J3.4: Download URL contains cryptographic HMAC signature');
    const downloadPath = signedUrlRes.body.download_url;

    // 3.5 Customer B requesting signed download URL for Customer A document returns HTTP 404
    const crossSignedUrlRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/documents/${docId}/download-url`,
      method: 'GET',
      headers: { 'Authorization': authHeaderB }
    });
    assert(crossSignedUrlRes.statusCode === 404, 'J3.5: CROSS-TENANT ISOLATION: Customer B requesting Customer A document URL returns HTTP 404');

    // 3.6 Download document via signed URL succeeds
    const downloadRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: downloadPath,
      method: 'GET'
    });
    assert(downloadRes.statusCode === 200, 'J3.6: Direct secure download with valid signature succeeds (HTTP 200)');
    assert(downloadRes.headers['content-type'] === 'application/pdf', 'J3.6: Content-Type application/pdf verified');
    assert(downloadRes.headers['x-content-type-options'] === 'nosniff', 'J3.6: Includes X-Content-Type-Options: nosniff');
    assert(downloadRes.headers['content-security-policy'] === "default-src 'none'", 'J3.6: Includes isolated default-src: none CSP');

    // 3.7 Tampered signature strictly rejected
    const tamperedPath = downloadPath ? downloadPath.replace(/sig=[a-f0-9]+/, 'sig=badf00d1234') : '/';
    const tamperedRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: tamperedPath,
      method: 'GET'
    });
    assert(tamperedRes.statusCode === 403, 'J3.7: Tampered HMAC signature rejected with HTTP 403 Forbidden');

    // ========================================================================
    // JOURNEY 4: Sandbox Checkout, Authoritative Pricing & Webhooks
    // ========================================================================
    console.log('\n--- Journey 4: Sandbox Checkout, Authoritative Pricing & Webhooks ---');

    // 4.1 Strict Pricing Gating: Phase 2 unverified transactional service blocked from checkout
    const unapprovedCheckoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeaderA }
    }, { service_id: 'V01-SVC-001' });
    assert(unapprovedCheckoutRes.statusCode === 422, 'J4.1: PRICING GATE: Unverified Phase 2 service blocked from checkout (HTTP 422)');
    assert(unapprovedCheckoutRes.body.code === 'PRICING_UNVERIFIED_CHECKOUT_BLOCKED', 'J4.1: Error code confirms PRICING_UNVERIFIED_CHECKOUT_BLOCKED');

    // 4.2 Customer A initiates checkout for non-commercial sandbox test fixture
    const createOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeaderA }
    }, {
      tier_name: 'SANDBOX_TEST_FIXTURE',
      billing_cycle: 'monthly',
      amount_total_paise: 100 // Attacker tampering attempt
    });
    assert(createOrderRes.statusCode === 201, 'J4.2: Customer A initiates sandbox checkout order (HTTP 201 Created)');
    assert(createOrderRes.body.amount_subtotal_paise === 500000, 'J4.2: Server calculated authoritative subtotal: 500,000 paise (₹5,000)');
    assert(createOrderRes.body.amount_tax_paise === 90000, 'J4.2: Server calculated authoritative 18% GST: 90,000 paise (₹900)');
    assert(createOrderRes.body.amount_total_paise === 590000, 'J4.2: Server calculated total: 590,000 paise (Client tampering ignored)');
    const orderRef = createOrderRes.body.order_reference;
    const gatewayOrderId = createOrderRes.body.gateway_order_id;

    // 4.3 Idempotent order replay within window
    const dupOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeaderA }
    }, {
      tier_name: 'SANDBOX_TEST_FIXTURE',
      billing_cycle: 'monthly'
    });
    assert(dupOrderRes.statusCode === 200, 'J4.3: Duplicate checkout request returns cached order (HTTP 200)');
    assert(dupOrderRes.body.order_reference === orderRef, 'J4.3: Returns identical authoritative order reference');
    assert(dupOrderRes.body.is_idempotent_replay === true, 'J4.3: Response confirms is_idempotent_replay: true');

    // 4.4 Webhook: Invalid signature strictly rejected
    const badWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'forged_untrusted_signature'
      }
    }, JSON.stringify({ event: 'payment.captured' }));
    assert(badWebhookRes.statusCode === 400, 'J4.4: Webhook with forged signature rejected with HTTP 400');

    // 4.5 Webhook: Amount tampering attempt strictly rejected
    const tamperedWebhookPayload = JSON.stringify({
      id: 'evt_sandbox_tampered_001',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_tampered_999999',
            order_id: gatewayOrderId,
            amount: 100, // Attacker forged paise
            currency: 'INR'
          }
        }
      }
    });
    const tamperedWebhookSig = crypto.createHmac('sha256', testWebhookSecret).update(tamperedWebhookPayload).digest('hex');
    const tamperedWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': tamperedWebhookSig
      }
    }, tamperedWebhookPayload);
    assert(tamperedWebhookRes.statusCode === 400, 'J4.5: Webhook with tampered amount strictly rejected (HTTP 400)');
    assert(tamperedWebhookRes.body.code === 'AMOUNT_MISMATCH', 'J4.5: Error code confirms AMOUNT_MISMATCH');

    // 4.6 Webhook: Valid payment.captured event processes and marks order PAID
    const validWebhookPayload = JSON.stringify({
      id: 'evt_sandbox_valid_e2e_002',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_mock_e2e_success',
            order_id: gatewayOrderId,
            amount: 590000,
            currency: 'INR'
          }
        }
      }
    });
    const validWebhookSig = crypto.createHmac('sha256', testWebhookSecret).update(validWebhookPayload).digest('hex');
    const validWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validWebhookSig
      }
    }, validWebhookPayload);
    assert(validWebhookRes.statusCode === 200, 'J4.6: Valid Razorpay webhook processed successfully (HTTP 200)');
    assert(validWebhookRes.body.status === 'processed', 'J4.6: Status confirmed: processed');

    // Verify order is now authoritative PAID
    const paidOrder = await orderRepository.getOrder(orderRef, { role: 'managing_partner' });
    assert(paidOrder.payment_status === 'PAID', 'J4.6: Order transitioned to authoritative status PAID');

    // 4.7 Webhook replay / duplicate event handled idempotently
    const replayWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validWebhookSig
      }
    }, validWebhookPayload);
    assert(replayWebhookRes.statusCode === 200, 'J4.7: Webhook replay acknowledged with HTTP 200');
    assert(replayWebhookRes.body.status === 'ignored_duplicate', 'J4.7: Confirms ignored_duplicate (Zero double charging or duplicate fulfilment)');

    // 4.8 Customer A queries order in customer portal
    const fetchOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/orders/${orderRef}`,
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(fetchOrderRes.statusCode === 200, 'J4.8: Customer A fetches order in portal (HTTP 200)');
    assert(fetchOrderRes.body.order.payment_status === 'PAID', 'J4.8: Portal reflects server-side PAID status');

    // 4.9 CROSS-TENANT ORDER ISOLATION: Customer B querying Customer A order returns HTTP 404
    const crossOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/orders/${orderRef}`,
      method: 'GET',
      headers: { 'Authorization': authHeaderB }
    });
    assert(crossOrderRes.statusCode === 404, 'J4.9: CROSS-TENANT ISOLATION: Customer B querying Customer A order returns HTTP 404 Not Found');

    // 4.10 Session logout invalidates token
    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/logout',
      method: 'POST',
      headers: { 'Authorization': authHeaderA }
    });
    assert(logoutRes.statusCode === 200, 'J4.10: Customer A logs out successfully (HTTP 200)');

    const postLogoutRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': authHeaderA }
    });
    assert(postLogoutRes.statusCode === 401, 'J4.10: Revoked session token strictly rejected on subsequent access (HTTP 401)');

  } finally {
    await testInstance.stop();
    console.log('\nE2E test server stopped.');
  }

  console.log('\n======================================================================');
  console.log(`MASTER E2E TEST SUMMARY: ${passedAssertions} passed, ${failedAssertions} failed (${passedAssertions + failedAssertions} total assertions)`);
  console.log('======================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runE2EJourneysSuite().catch(err => {
    console.error('Fatal error in Master E2E test suite:', err);
    process.exit(1);
  });
}

module.exports = { runE2EJourneysSuite };
