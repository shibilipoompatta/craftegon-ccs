/**
 * CraftEgon CCS - Task 004F-03X: Automated Acceptance Test Suite
 * End-to-End Customer-to-Admin Dynamic Case Workflow Verification
 * 
 * Storage: Local In-Memory Adapters (local_in_memory)
 * Pure Node.js built-ins. Zero external dependencies.
 */

const http = require('node:http');
const { createServer } = require('../src/backend/server');
const { accountRepository } = require('../src/backend/storage/account-repository');
const { caseRepository } = require('../src/backend/storage/case-repository');

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

async function runTask004F03XTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Task 004F-03X: Local Dynamic Case Workflow Test Suite');
  console.log('======================================================================\n');

  const testPort = 3205;
  const testInstance = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    SESSION_DURATION_SECONDS: 3600
  });

  await testInstance.start();
  console.log(`Test server running on port ${testPort} (local_in_memory adapter)\n`);

  try {
    // ------------------------------------------------------------------------
    // Step 1: Customer A & B and Staff Registration
    // ------------------------------------------------------------------------
    console.log('--- Step 1: Registration of Actors (Customer A, Customer B, Staff Operators) ---');

    // Customer A Registration
    const regResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Nexus Ventures Private Limited',
      cin_llpin: 'U72200MH2024PTC123456',
      primary_email: 'compliance@nexusventures.in',
      primary_phone: '+91 9820123456',
      account_role: 'client',
      password: 'SecurePassword2026!'
    });
    assert(regResA.statusCode === 201, '1. Customer A registers successfully (HTTP 201)');
    const customerA = regResA.body.account;
    assert(Boolean(customerA && customerA.id), 'Customer A account object has valid ID');
    assert(customerA.role === 'client', 'Customer A role is client');

    // Customer B Registration
    const regResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Horizon Logistics LLP',
      cin_llpin: 'AAB-9988',
      primary_email: 'accounts@horizonllp.in',
      primary_phone: '+91 9820654321',
      account_role: 'client',
      password: 'HorizonPass2026!'
    });
    assert(regResB.statusCode === 201, 'Customer B registers successfully (HTTP 201)');
    const customerB = regResB.body.account;

    // Staff Operator Registration
    const regResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'CraftEgon Compliance Operations',
      primary_email: 'operator1@craftegon.com',
      primary_phone: '+91 8606918247',
      account_role: 'compliance_operator',
      password: 'OperatorPass2026!'
    });
    assert(regResStaff.statusCode === 201, 'Staff Operator registers successfully (HTTP 201)');
    const staffOperator = regResStaff.body.account;

    // Managing Partner Registration
    const regResPartner = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'CraftEgon Executive Governance',
      primary_email: 'partner@craftegon.com',
      primary_phone: '+91 8606918248',
      account_role: 'managing_partner',
      password: 'PartnerPass2026!'
    });
    assert(regResPartner.statusCode === 201, 'Managing Partner registers successfully (HTTP 201)');
    const managingPartner = regResPartner.body.account;

    // ------------------------------------------------------------------------
    // Step 2: Authentication / Login
    // ------------------------------------------------------------------------
    console.log('\n--- Step 2: Authentication & Session Token Issuance ---');

    // Customer A Login
    const loginResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'compliance@nexusventures.in',
      password: 'SecurePassword2026!'
    });
    assert(loginResA.statusCode === 200, '2. Customer A logs in successfully (HTTP 200)');
    const tokenA = loginResA.body.token;
    assert(Boolean(tokenA && tokenA.startsWith('cct_')), 'Customer A receives opaque session token');

    // Customer B Login
    const loginResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'accounts@horizonllp.in',
      password: 'HorizonPass2026!'
    });
    assert(loginResB.statusCode === 200, 'Customer B logs in successfully (HTTP 200)');
    const tokenB = loginResB.body.token;

    // Staff Operator Login
    const loginResStaff = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'operator1@craftegon.com',
      password: 'OperatorPass2026!'
    });
    assert(loginResStaff.statusCode === 200, 'Staff Operator logs in successfully (HTTP 200)');
    const tokenStaff = loginResStaff.body.token;

    // ------------------------------------------------------------------------
    // Step 3: Customer Submits Direct Service Request (Case Creation)
    // ------------------------------------------------------------------------
    console.log('\n--- Step 3: Customer Service Request Submission & Case Creation ---');

    // Customer A creates valid case
    const createCaseResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      service_id: 'V01-SVC-007',
      title: 'Private Limited Company Incorporation - Primary Enterprise Unit',
      filing_priority: 'STANDARD',
      notes: 'Initial seed capital incorporation under SPICe+ (INC-32)'
    });

    assert(createCaseResA.statusCode === 201, '3. Customer A submits valid service request (HTTP 201)');
    const createdCaseA = createCaseResA.body.case;
    assert(Boolean(createdCaseA && createdCaseA.case_reference), 'Case reference generated');
    const caseRefA = createdCaseA.case_reference;
    assert(createdCaseA.client_id === customerA.id, 'Case client_id correctly derived from Customer A session');
    assert(createdCaseA.service_id === 'V01-SVC-007', 'Service ID matches canonical registry');
    assert(createdCaseA.vertical_id === 'V01', 'Practice vertical correctly mapped from registry (V01)');
    assert(createdCaseA.status === 'IN_PROGRESS', 'Initial case status is IN_PROGRESS');

    // ------------------------------------------------------------------------
    // Step 4: Backend Persistence in In-Memory Repository
    // ------------------------------------------------------------------------
    console.log('\n--- Step 4: Storage Verification in In-Memory Repository ---');

    const storedCase = await caseRepository.getCase(caseRefA, { role: 'compliance_operator' });
    assert(Boolean(storedCase), '4. Case is persisted in in-memory case repository');
    assert(storedCase.case_reference === caseRefA, 'Stored case reference matches');
    assert(storedCase.client_id === customerA.id, 'Stored client_id matches Customer A');
    assert(storedCase.title === 'Private Limited Company Incorporation - Primary Enterprise Unit', 'Stored title matches payload');

    // ------------------------------------------------------------------------
    // Step 5: Multi-Tenant Isolation & Cross-Tenant Denial
    // ------------------------------------------------------------------------
    console.log('\n--- Step 5: Multi-Tenant Data Isolation ---');

    // Customer B attempts to read Customer A's case
    const crossGetResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(crossGetResB.statusCode === 404, '5. Customer B reading Customer A case returns HTTP 404 Not Found (Zero leakage)');

    // Customer A reads their own case
    const ownGetResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(ownGetResA.statusCode === 200, 'Customer A reads own case successfully (HTTP 200)');
    assert(ownGetResA.body.case.case_reference === caseRefA, 'Case payload returned to owner');

    // ------------------------------------------------------------------------
    // Step 6: Identity Forgery Protection
    // ------------------------------------------------------------------------
    console.log('\n--- Step 6: Identity Forgery & Client ID Spoofing Prevention ---');

    const spoofRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      client_id: customerB.id, // Forgery attempt: Customer A trying to create case under Customer B
      service_id: 'V01-SVC-007',
      title: 'Malicious Forged Case'
    });
    assert(spoofRes.statusCode === 403, '6. Customer A spoofing Customer B account ID is strictly rejected with HTTP 403 Forbidden');

    // ------------------------------------------------------------------------
    // Step 7: Case List Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- Step 7: Customer Case Listing Scoping ---');

    const listResA = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(listResA.statusCode === 200, 'Customer A lists cases successfully');
    assert(listResA.body.total === 1, 'Customer A sees exactly 1 case');
    assert(listResA.body.cases[0].case_reference === caseRefA, 'Customer A sees only their own case');

    const listResB = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(listResB.statusCode === 200, 'Customer B lists cases successfully');
    assert(listResB.body.total === 0, '7. Customer B sees 0 cases (cannot access Customer A cases)');

    // ------------------------------------------------------------------------
    // Step 8: Unauthenticated & Unauthorized Endpoint Gating
    // ------------------------------------------------------------------------
    console.log('\n--- Step 8: Unauthenticated & Role-Based Access Controls ---');

    const unauthStaffGet = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/admin/staff',
      method: 'GET'
    });
    assert(unauthStaffGet.statusCode === 401, '8a. Unauthenticated GET /api/v1/admin/staff returns HTTP 401');

    const clientStaffGet = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/admin/staff',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(clientStaffGet.statusCode === 403, '8b. Client GET /api/v1/admin/staff returns HTTP 403 Forbidden');

    const clientCaseUpdate = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, { status: 'COMPLETED' });
    assert(clientCaseUpdate.statusCode === 403, '8c. Client attempting case status/operator update returns HTTP 403 Forbidden');

    const unauthEnquiryGet = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'GET'
    });
    assert(unauthEnquiryGet.statusCode === 401, '8d. Unauthenticated GET /api/v1/enquiries returns HTTP 401');

    const clientEnquiryGet = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(clientEnquiryGet.statusCode === 403, '8e. Client GET /api/v1/enquiries returns HTTP 403 Forbidden');

    // ------------------------------------------------------------------------
    // Step 9: Staff Views Incoming Cases Across All Tenants
    // ------------------------------------------------------------------------
    console.log('\n--- Step 9: Administrator Views Incoming Cases ---');

    const staffListRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(staffListRes.statusCode === 200, '9. Authorised staff views incoming cases (HTTP 200)');
    assert(staffListRes.body.total >= 1, 'Staff sees incoming cases across tenants');
    const staffViewA = staffListRes.body.cases.find(c => c.case_reference === caseRefA);
    assert(Boolean(staffViewA), 'Staff sees Customer A case');
    assert(staffViewA.client_id === customerA.id, 'Staff sees associated client identity');

    // ------------------------------------------------------------------------
    // Step 10 & 11: Staff Lists Staff Operators & Operator Assignment
    // ------------------------------------------------------------------------
    console.log('\n--- Step 10 & 11: Staff Operator Listing & Operator Assignment ---');

    // Staff lists authorized staff operators
    const staffListStaffRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/admin/staff',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(staffListStaffRes.statusCode === 200, 'Staff retrieves operator roster (HTTP 200)');
    assert(Array.isArray(staffListStaffRes.body.staff), 'Staff response contains staff array');
    assert(staffListStaffRes.body.staff.some(s => s.id === staffOperator.id), 'Roster includes compliance operator');
    assert(!staffListStaffRes.body.staff.some(s => s.role === 'client'), 'Roster excludes client accounts');

    // Invalid Operator Assignment: non-existent ID
    const badOpRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStaff}`
      }
    }, { assigned_officer_id: 'usr_nonexistent_99999' });
    assert(badOpRes1.statusCode === 400, '11a. Assignment to non-existent operator rejected with HTTP 400 Bad Request');

    // Invalid Operator Assignment: client ID passed as operator
    const badOpRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStaff}`
      }
    }, { assigned_officer_id: customerB.id });
    assert(badOpRes2.statusCode === 400, '11b. Assignment of client user as operator rejected with HTTP 400 Bad Request');

    // Valid Operator Assignment
    const assignOpRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStaff}`
      }
    }, { assigned_officer_id: staffOperator.id });
    assert(assignOpRes.statusCode === 200, '10. Authorised staff assigns case to operator (HTTP 200)');
    assert(assignOpRes.body.case.assigned_officer_id === staffOperator.id, 'Case reflects newly assigned operator ID');

    // ------------------------------------------------------------------------
    // Step 12 & 13: Case Status Transitions & State Machine Enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- Step 12 & 13: State Machine Status Transitions ---');

    // Invalid Status Transition: IN_PROGRESS -> CLOSED is disallowed
    const badTransitionRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStaff}`
      }
    }, { status: 'CLOSED' });
    assert(badTransitionRes.statusCode === 422, '13. Invalid state transition IN_PROGRESS -> CLOSED rejected with HTTP 422');

    // Valid Status Transition: IN_PROGRESS -> AWAITING_CUSTOMER_ACTION
    const validTransitionRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/cases/${caseRefA}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStaff}`
      }
    }, { status: 'AWAITING_CUSTOMER_ACTION' });
    assert(validTransitionRes1.statusCode === 200, '12. Valid transition IN_PROGRESS -> AWAITING_CUSTOMER_ACTION succeeds (HTTP 200)');
    assert(validTransitionRes1.body.case.status === 'AWAITING_CUSTOMER_ACTION', 'Case status updated to AWAITING_CUSTOMER_ACTION');

    // ------------------------------------------------------------------------
    // Step 14: Customer Refreshes Dashboard and Views Updated Status
    // ------------------------------------------------------------------------
    console.log('\n--- Step 14: Customer Views Updated Status in Dashboard ---');

    const customerCheckRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(customerCheckRes.statusCode === 200, '14a. Customer A refreshes dashboard (HTTP 200)');
    const customerUpdatedCase = customerCheckRes.body.cases.find(c => c.case_reference === caseRefA);
    assert(Boolean(customerUpdatedCase), 'Customer A retrieves case');
    assert(customerUpdatedCase.status === 'AWAITING_CUSTOMER_ACTION', '14b. Customer A sees updated status AWAITING_CUSTOMER_ACTION');
    assert(customerUpdatedCase.assigned_officer_id === staffOperator.id, '14c. Customer A sees assigned compliance operator');

    // ------------------------------------------------------------------------
    // Step 15: Referral-Only Statutory Boundary Enforcement (Advocates Act 1961)
    // ------------------------------------------------------------------------
    console.log('\n--- Step 15: Statutory Referral-Only Litigation Boundary Check ---');

    // Referral litigation 1: NCLT Insolvency Defense
    const referralRes1 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      service_id: 'nclt-insolvency',
      title: 'NCLT Section 7 Defense Petition'
    });
    assert(referralRes1.statusCode === 422, '15a. Referral service (nclt-insolvency) rejected with HTTP 422');
    assert(referralRes1.body.message.includes('Advocates Act 1961'), '15b. HTTP 422 message cites Advocates Act 1961 referral boundary');

    // Referral litigation 2: Director Removal & Board Disputes
    const referralRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      service_id: 'director-removal',
      title: 'Board Dispute and Injunction'
    });
    assert(referralRes2.statusCode === 422, '15c. Referral service (director-removal) rejected with HTTP 422');

    // Referral litigation 3: Oppression & Mismanagement
    const referralRes3 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      service_id: 'oppression-mismanagement',
      title: 'Section 241 Petition'
    });
    assert(referralRes3.statusCode === 422, '15d. Referral service (oppression-mismanagement) rejected with HTTP 422');

    // Missing service_id
    const missingServiceRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      title: 'Case with no service'
    });
    assert(missingServiceRes.statusCode === 400, 'Missing service_id rejected with HTTP 400');

    // Unknown service_id
    const unknownServiceRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      }
    }, {
      service_id: 'V99-SVC-999',
      title: 'Fictional Service'
    });
    assert(unknownServiceRes.statusCode === 422, 'Unknown service_id rejected with HTTP 422');

    // ------------------------------------------------------------------------
    // Step 16: Staff Enquiry Listing & Triage
    // ------------------------------------------------------------------------
    console.log('\n--- Step 16: Staff Lead Enquiry Listing & Triage ---');

    // Submit public lead enquiry
    const publicLeadRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      contact_name: 'Priya Sharma',
      email: 'priya@techstartup.in',
      phone: '+91 9811223344',
      message: 'Looking to incorporate our AI startup in Bengaluru',
      dpdp_consent: true
    });
    assert(publicLeadRes.statusCode === 201, 'Public lead enquiry submitted successfully (HTTP 201)');
    const leadRef = publicLeadRes.body.lead_reference;
    assert(Boolean(leadRef), 'Lead reference issued');

    // Staff retrieves leads
    const staffLeadsRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/enquiries',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenStaff}` }
    });
    assert(staffLeadsRes.statusCode === 200, '16. Staff lists incoming lead enquiries (HTTP 200)');
    assert(Array.isArray(staffLeadsRes.body.enquiries), 'Staff response contains enquiries array');
    const foundLead = staffLeadsRes.body.enquiries.find(e => e.lead_reference === leadRef);
    assert(Boolean(foundLead), 'Staff sees newly submitted lead enquiry');
    assert(foundLead.contact_name === 'Priya Sharma', 'Enquiry contact name matches');

  } finally {
    await testInstance.stop();
    console.log('\nAcceptance test server stopped.');
  }

  console.log('\n======================================================================');
  console.log(`TASK 004F-03X TEST SUMMARY: ${passedCount} passed, ${failedCount} failed (${passedCount + failedCount} total assertions)`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTask004F03XTests().catch(err => {
    console.error('Fatal error in Task 004F-03X test suite:', err);
    process.exit(1);
  });
}

module.exports = { runTask004F03XTests };
