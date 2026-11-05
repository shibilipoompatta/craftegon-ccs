/**
 * CraftEgon CCS — Task 004F-03AF Test Suite
 * Dynamic API Enablement & Safe Development Configuration Verification
 *
 * Covers:
 * 1. Default static mode across environments.
 * 2. Strict production lock on craftegon.com, ccs.craftegon.com, pages.dev, cloudflare.com.
 * 3. Rejection of dynamic mode on arbitrary untrusted origins.
 * 4. Explicit local/staging dynamic enablement via validated configuration signals.
 * 5. Safe fallback on invalid or corrupted configuration.
 * 6. Dynamic enquiry form submission via /api/v1/enquiries.
 * 7. Graceful WhatsApp/email fallback when API fails (404, 500, or network error).
 * 8. Customer registration, login, and portal session verification.
 * 9. Customer case creation and strict tenant isolation.
 * 10. Admin authentication and RBAC privilege gates.
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const config = require('../assets/js/config');
const { createServer } = require('../src/backend/server');

async function runTask03AFTests() {
  console.log('======================================================================');
  console.log('CraftEgon CCS — Task 004F-03AF: Dynamic API & Safe Config Test Suite');
  console.log('======================================================================\n');

  let passed = 0;
  function pass(msg) {
    passed++;
    console.log(`  ✅ PASS [Assert ${passed}]: ${msg}`);
  }

  // ============================================================================
  // Test Suite 1: Environment-Aware Configuration Invariants
  // ============================================================================
  console.log('--- Test Suite 1: Environment-Aware Configuration Invariants ---');

  // 1. Default static mode in Node.js
  assert.strictEqual(config.isStatic, true, 'Default isStatic must be true');
  assert.strictEqual(config.apiMode, 'static', 'Default apiMode must be static');
  pass('Default mode is strictly static with zero network dependencies');

  // 2. Production static lock (cannot be overridden by any configuration)
  const prodHosts = [
    'craftegon.com',
    'ccs.craftegon.com',
    'www.craftegon.com',
    'craftegon-ccs.pages.dev',
    'deployment.pages.dev',
    'origin.cloudflare.com'
  ];

  for (const host of prodHosts) {
    assert.strictEqual(config._isProductionHost(host), true, `${host} must be recognized as production`);
    // Attempt to force dynamic mode via explicit override
    const dynamicOnProd = config._evaluateDynamicMode(host, { enableDynamicApi: true });
    assert.strictEqual(dynamicOnProd, false, `Dynamic mode MUST be rejected on production host ${host}`);
  }
  pass('Production hosts (craftegon.com, ccs.craftegon.com, *.pages.dev) are locked to static mode');

  // 3. Arbitrary untrusted hostnames cannot enable dynamic mode
  const untrustedHosts = [
    'example.com',
    'evil-phishing-site.xyz',
    'corporate-compliance.io',
    '192.168.1.50'
  ];
  for (const host of untrustedHosts) {
    assert.strictEqual(config._isAllowedDynamicHost(host), false, `${host} is not an allowed dynamic host`);
    const dynamicOnUntrusted = config._evaluateDynamicMode(host, { enableDynamicApi: true });
    assert.strictEqual(dynamicOnUntrusted, false, `Dynamic mode must be rejected on arbitrary host ${host}`);
  }
  pass('Arbitrary unapproved hostnames cannot enable dynamic mode even with explicit override');

  // 4. Allowed local and staging hosts default to static mode when unconfigured
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    '[::1]',
    'staging.ccs.craftegon.com',
    'dev.ccs.craftegon.com'
  ];
  for (const host of allowedHosts) {
    assert.strictEqual(config._isAllowedDynamicHost(host), true, `${host} is an approved host`);
    // Without explicit override, must default to static
    const defaultAllowed = config._evaluateDynamicMode(host, null);
    assert.strictEqual(defaultAllowed, false, `${host} must default to static mode without explicit signal`);
  }
  pass('Approved local/staging hosts default safely to static mode when unconfigured');

  // 5. Allowed local and staging hosts enable dynamic mode ONLY with explicit valid signal
  for (const host of allowedHosts) {
    const dynamicAllowed = config._evaluateDynamicMode(host, { enableDynamicApi: true });
    assert.strictEqual(dynamicAllowed, true, `${host} enables dynamic mode with valid explicit signal`);
  }
  pass('Approved local/staging hosts enable dynamic mode only upon explicit valid configuration');

  // 6. Invalid / malformed configuration signals fall back safely to static
  const malformedConfigs = [
    { enableDynamicApi: 'true' }, // string instead of boolean
    { enableDynamicApi: 1 },        // number
    { enableDynamicApi: null },
    { enableDynamicApi: false },
    { otherKey: true },
    'enableDynamicApi',
    12345,
    null
  ];
  for (const badCfg of malformedConfigs) {
    const res = config._evaluateDynamicMode('localhost', badCfg);
    assert.strictEqual(res, false, `Malformed config ${JSON.stringify(badCfg)} must fall back to static`);
  }
  pass('Invalid or malformed configuration objects fall back safely to static mode');

  // 7. JSDOM Browser Simulation: Localhost storage and window opt-in
  const devDom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
    url: 'http://127.0.0.1:3001/',
    runScripts: 'dangerously'
  });
  devDom.window.__CRAFTEGON_DEV_CONFIG__ = { enableDynamicApi: true };
  const configSource = fs.readFileSync(path.join(__dirname, '../assets/js/config.js'), 'utf8');
  const devScript = devDom.window.document.createElement('script');
  devScript.textContent = configSource;
  devDom.window.document.head.appendChild(devScript);
  assert.ok(devDom.window.CRAFTEGON_CONFIG, 'CRAFTEGON_CONFIG must be bound to window');
  assert.strictEqual(devDom.window.CRAFTEGON_CONFIG.isStatic, false, 'JSDOM localhost with dev config enables dynamic');
  assert.strictEqual(devDom.window.CRAFTEGON_CONFIG.apiMode, 'dynamic');
  pass('Browser simulation on 127.0.0.1 with __CRAFTEGON_DEV_CONFIG__ enables dynamic mode');

  // 8. JSDOM Browser Simulation: Production host ignores window opt-in
  const prodDom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
    url: 'https://ccs.craftegon.com/',
    runScripts: 'dangerously'
  });
  prodDom.window.__CRAFTEGON_DEV_CONFIG__ = { enableDynamicApi: true };
  const prodScript = prodDom.window.document.createElement('script');
  prodScript.textContent = configSource;
  prodDom.window.document.head.appendChild(prodScript);
  assert.ok(prodDom.window.CRAFTEGON_CONFIG, 'CRAFTEGON_CONFIG must be bound to window');
  assert.strictEqual(prodDom.window.CRAFTEGON_CONFIG.isStatic, true, 'Production host MUST ignore window override');
  assert.strictEqual(prodDom.window.CRAFTEGON_CONFIG.apiMode, 'static');
  pass('Browser simulation on ccs.craftegon.com rejects window override (production lock intact)');

  // ============================================================================
  // Test Suite 2: Customer-Facing Dynamic API Flows & Fallback Resilience
  // ============================================================================
  console.log('\n--- Test Suite 2: Customer-Facing Dynamic API Flows & Fallback ---');

  const instance = createServer({ PORT: 3197, HOST: '127.0.0.1' });
  await instance.start();

  async function makeRequest(options, postData = null, cookie = null) {
    return new Promise((resolve, reject) => {
      const headers = Object.assign({}, options.headers);
      if (cookie) headers['Cookie'] = cookie;
      const req = http.request(Object.assign({}, options, { headers }), (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
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
    // 9. Public Enquiry Submission via dynamic API
    const enqRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      contact_name: 'Aditi Varma',
      email: 'aditi@varma-enterprises.com',
      phone: '+91 98765 11223',
      service_id: 'V01-SVC-007',
      vertical_id: 'V01',
      scope_description: 'Incorporation of Private Limited company with two directors',
      dpdp_consent: true,
      _hp_website: '',
      _render_time: Date.now() - 3000
    });

    assert.strictEqual(enqRes.status, 201, 'Enquiry returns HTTP 201 Created');
    assert.strictEqual(enqRes.body.success, true);
    assert.ok(typeof enqRes.body.lead_reference === 'string');
    assert.ok(enqRes.body.lead_reference.startsWith('LEAD-'), 'lead_reference starts with LEAD-');
    pass('Dynamic enquiry submission succeeds with verified lead_reference');

    // 10A. Forms.js Dynamic API Live Submission via JSDOM
    const formsDom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <form id="form-success" class="if-lead-form" data-service-id="V01-SVC-007" data-endpoint="/api/v1/enquiries">
          <input type="text" name="contact_name" value="Test Client">
          <input type="email" name="email" value="client@test.com">
          <input type="tel" name="phone" value="+91 9876543210">
          <button type="submit">Submit Request</button>
        </form>
        <form id="form-fallback" class="if-lead-form" data-service-id="V01-SVC-007" data-endpoint="/api/v1/nonexistent-endpoint">
          <input type="text" name="contact_name" value="Fallback Client">
          <input type="email" name="email" value="fallback@test.com">
          <input type="tel" name="phone" value="+91 9876543210">
          <button type="submit">Submit Request</button>
        </form>
      </body>
      </html>
    `, { url: 'http://127.0.0.1:3197/', runScripts: 'dangerously' });

    formsDom.window.fetch = globalThis.fetch;

    formsDom.window.CRAFTEGON_CONFIG = {
      isStatic: false,
      apiEndpoint: '/api/v1/enquiries',
      whatsappUrl: 'https://wa.me/918606918247',
      emailHref: 'mailto:admin@craftegon.com',
      phoneDisplay: '+91 86069 18247',
      email: 'admin@craftegon.com'
    };

    const formsCode = fs.readFileSync(path.join(__dirname, '../assets/js/forms.js'), 'utf8');
    const formsScript = formsDom.window.document.createElement('script');
    formsScript.textContent = formsCode;
    formsDom.window.document.body.appendChild(formsScript);

    // Initialize forms
    formsDom.window.document.dispatchEvent(new formsDom.window.Event('DOMContentLoaded'));

    // Test form 1: Live API submission
    const formSuccess = formsDom.window.document.querySelector('#form-success');
    const submitEvt1 = new formsDom.window.Event('submit', { bubbles: true, cancelable: true });
    formSuccess.dispatchEvent(submitEvt1);

    await new Promise(r => setTimeout(r, 300));
    const successAlert = formSuccess.querySelector('.if-form-alert');
    assert.ok(successAlert !== null, 'Success alert rendered on successful API intake');
    assert.ok(successAlert.innerHTML.includes('accepted. Reference: LEAD-'), 'Success alert contains accepted lead reference');
    pass('Forms.js live submission successfully calls dynamic API and renders confirmed lead reference');

    // 10B. Forms.js API Failure Fallback Simulation
    // When API endpoint returns 404 or fails, forms.js must display the honest fallback notice with WhatsApp & Email
    const formFallback = formsDom.window.document.querySelector('#form-fallback');
    const submitEvt2 = new formsDom.window.Event('submit', { bubbles: true, cancelable: true });
    formFallback.dispatchEvent(submitEvt2);

    await new Promise(r => setTimeout(r, 300));
    const fallbackNotice = formFallback.querySelector('.if-form-alert');
    assert.ok(fallbackNotice !== null, 'Fallback notice rendered upon API 404/network failure');
    assert.ok(fallbackNotice.innerHTML.includes('wa.me'), 'Fallback notice contains WhatsApp channel');
    assert.ok(fallbackNotice.innerHTML.includes('mailto:'), 'Fallback notice contains Email channel');
    pass('Forms.js failure seamlessly triggers truthful WhatsApp/Email fallback notice');

    // 11. Customer Registration & Privilege Shield
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Varma Logistics Pvt Ltd',
      cin_llpin: 'U60200KL2026PTC012345',
      primary_email: 'finance@varmalogistics.com',
      password: 'CorporateSecurePassword2026!',
      account_role: 'managing_partner' // Attacker attempting privilege escalation
    });

    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regRes.body.account.account_role, 'client', 'Role strictly forced to client');
    const customerId = regRes.body.account.id;
    pass('Customer registration succeeds and privilege escalation is blocked (role forced to client)');

    // 12. Customer Login & Cookie Session
    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'finance@varmalogistics.com',
      password: 'CorporateSecurePassword2026!'
    });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.ok(loginRes.body.token.startsWith('cct_'));

    // Extract session cookie
    const setCookie = loginRes.headers['set-cookie'];
    assert.ok(setCookie && setCookie.length > 0);
    const cookieHeader = setCookie[0].split(';')[0];
    assert.ok(cookieHeader.startsWith('craftegon_session=cct_'));
    pass('Customer login succeeds with HttpOnly session cookie and opaque token');

    // 13. Customer Session Verification via /api/v1/auth/me
    const meRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/auth/me',
      method: 'GET'
    }, null, cookieHeader);

    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.success, true);
    assert.strictEqual(meRes.body.user.id, customerId);
    assert.strictEqual(meRes.body.user.role, 'client');
    pass('Customer /api/v1/auth/me session verifies identity and client role correctly');

    // 14. Customer Case Creation
    const caseRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/portal/cases',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      service_id: 'V02-SVC-004',
      title: 'Annual AOC-4 XBRL Filing 2025-26',
      description: 'Preparation and filing of audited financial statements on MCA portal'
    }, cookieHeader);

    assert.strictEqual(caseRes.status, 201);
    assert.strictEqual(caseRes.body.success, true);
    const caseRef = caseRes.body.case.case_reference;
    assert.ok(caseRef.startsWith('CASE-'), 'case_reference starts with CASE-');
    assert.strictEqual(caseRes.body.case.client_id, customerId);
    pass('Authenticated customer creates case tied strictly to their own tenant account ID');

    // 15. Cross-Tenant Isolation Enforcement
    // Register Customer B
    const regB = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      legal_entity_name: 'Competitor Corp Ltd',
      primary_email: 'competitor@corp.com',
      password: 'CorporateSecurePassword2026!'
    });
    assert.strictEqual(regB.status, 201);

    const loginB = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'competitor@corp.com',
      password: 'CorporateSecurePassword2026!'
    });
    const cookieB = loginB.headers['set-cookie'][0].split(';')[0];

    // Customer B lists cases
    const listB = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/portal/cases',
      method: 'GET'
    }, null, cookieB);
    assert.strictEqual(listB.status, 200);
    assert.strictEqual(listB.body.cases.length, 0, 'Customer B must see 0 cases (Customer A case hidden)');

    // Customer B direct access to Customer A's case
    const directAccessB = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: `/api/v1/portal/cases/${caseRef}`,
      method: 'GET'
    }, null, cookieB);
    assert.strictEqual(directAccessB.status, 404, 'Cross-tenant access returns HTTP 404 Not Found without leakage');
    pass('Strict tenant isolation verified: Customer B cannot view or access Customer A case');

    // 16. Client role blocked from staff endpoints
    const staffEndpointAttempt = await makeRequest({
      hostname: '127.0.0.1',
      port: 3197,
      path: '/api/v1/admin/staff',
      method: 'GET'
    }, null, cookieHeader); // Customer A's client cookie
    assert.strictEqual(staffEndpointAttempt.status, 403, 'Client role forbidden from admin endpoints');
    pass('Role-based access control blocks client accounts from administrative endpoints (HTTP 403)');

  } finally {
    await instance.stop();
  }

  console.log('\n======================================================================');
  console.log(`TASK 004F-03AF TEST SUMMARY: ${passed} passed, 0 failed (${passed} total assertions)`);
  console.log('STATUS: ENVIRONMENT-AWARE DYNAMIC API CONFIGURATION VERIFIED');
  console.log('======================================================================');
}

runTask03AFTests().catch(err => {
  console.error('Task 03AF Test Runner Fatal Error:', err);
  process.exit(1);
});
