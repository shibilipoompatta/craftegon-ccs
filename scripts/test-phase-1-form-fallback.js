/**
 * ============================================================================
 * CRAFTEGON CCS — PHASE 1 ENQUIRY FORM HONEST FALLBACK & RETRY TEST SUITE
 * ============================================================================
 * Verifies that:
 * 1. Form submission fallback is honest, truthful, and makes NO false claim of lead receipt.
 * 2. Primary submit button remains retryable after 404, 5xx, or network failure (NO onclick hijack).
 * 3. WhatsApp and email remain separate, explicit fallback action links in the notice.
 * 4. Success confirmation strictly adheres to verified backend contract (requires valid lead_reference).
 * 5. Form notices do not duplicate (at most one active form-level notice per form).
 * 6. User-entered form data is preserved across failures and retries.
 * 7. Concurrent / duplicate simultaneous submissions are guarded against.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('CRAFTEGON CCS — ENQUIRY FORM FALLBACK & RETRY TEST SUITE');
console.log('============================================================\n');

const formsJsCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'forms.js'), 'utf8');

// ----------------------------------------------------
// Test Suite 1: Static Code Inspection
// ----------------------------------------------------
console.log('--- Test Suite 1: Static Code & Content Inspection ---');
assert(formsJsCode.includes('Online form transmission to a backend server is not active in this static environment'), 'Explicitly states transmission is not active in static mode');
assert(formsJsCode.includes('Details entered in this form are not stored or transmitted to CraftEgon CCS'), 'Explicitly states details are not stored or transmitted');
assert(!formsJsCode.includes('Your request was saved offline'), 'No false offline storage claims');
assert(!/lead_reference:\s*["']MOCK/i.test(formsJsCode), 'No mock or fake lead references generated in fallback');
assert(formsJsCode.includes('+91 86069 18247'), 'Contains official WhatsApp phone number (+91 86069 18247)');
assert(formsJsCode.includes('admin@craftegon.com'), 'Contains official support email (admin@craftegon.com)');
assert(!formsJsCode.includes('submitBtn.onclick = function'), 'Submit button onclick is not hijacked with WhatsApp launcher');

// ----------------------------------------------------
// Test Suite 2: DOM Execution & Fallback Notice Rendering
// ----------------------------------------------------
console.log('\n--- Test Suite 2: DOM Execution & Direct Fallback Rendering ---');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <form class="if-lead-form" data-service-id="V01-SVC-007">
      <input type="text" name="contact_name" value="Sharan Pillai" required>
      <input type="email" name="email" value="sharan@acmecorp.in" required>
      <input type="tel" name="phone" value="9876543210" required>
      <textarea name="scope">Private limited incorporation for legal tech firm</textarea>
      <button type="submit">Submit</button>
    </form>
  </body>
  </html>
`, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

const { window } = dom;
const { document } = window;

window.eval(formsJsCode);

const form = document.querySelector('.if-lead-form');
const formData = {
  contact_name: 'Sharan Pillai',
  email: 'sharan@acmecorp.in',
  phone: '9876543210',
  service_id: 'V01-SVC-007',
  scope: 'Private limited incorporation for legal tech firm'
};

window.CraftegonForms.showFormFallbackNotice(form, formData);

const alertBox = form.querySelector('.if-form-alert');
assert(alertBox !== null, 'Fallback notice alert element is inserted into form');
assert(alertBox.getAttribute('role') === 'alert', 'Alert box has role="alert" for accessibility');

const alertText = alertBox.textContent;
assert(alertText.includes('Online form transmission to a backend server is not active in this static environment'), 'Notice explains static environment status');
assert(alertText.includes('Details entered in this form are not stored or transmitted to CraftEgon CCS'), 'Notice confirms zero retention / zero fake submission');
assert(!alertText.includes('accepted') && !alertText.includes('Reference:'), 'Notice does NOT claim acceptance or generate false reference');

const waLink = alertBox.querySelector('a[href*="wa.me"]');
assert(waLink !== null, 'Contains WhatsApp direct action link in fallback alert');
assert(waLink.href.includes('918606918247'), 'WhatsApp link points to verified WhatsApp contact (+91 86069 18247)');
assert(waLink.href.includes('V01-SVC-007'), 'WhatsApp link pre-fills service identifier');
assert(waLink.href.includes('Sharan'), 'WhatsApp link pre-fills contact name');

const mailLink = alertBox.querySelector('a[href^="mailto:"]');
assert(mailLink !== null, 'Contains Email direct action link in fallback alert');
assert(mailLink.href.includes('admin@craftegon.com'), 'Email link points to admin@craftegon.com');
assert(mailLink.href.includes('V01-SVC-007'), 'Email link pre-fills service identifier');

// ----------------------------------------------------
// Async Test Suites
// ----------------------------------------------------
(async () => {
  // ----------------------------------------------------
  // Test Suite 3: Simulated 404 Response & Button Retryability
  // ----------------------------------------------------
  console.log('\n--- Test Suite 3: Simulated 404 Response & Button Retryability ---');

  const dom2 = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Devika Menon" required>
        <input type="email" name="email" value="devika@startup.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/conversion/retainer-desk.html" });

  const win2 = dom2.window;
  const doc2 = win2.document;

  let fetchCalls2 = 0;
  win2.fetch = async function() {
    fetchCalls2++;
    return {
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" })
    };
  };

  win2.eval(formsJsCode);

  const event = win2.document.createEvent('Event');
  event.initEvent('DOMContentLoaded', true, true);
  win2.document.dispatchEvent(event);

  const form2 = doc2.querySelector('.if-lead-form');
  const submitBtn2 = form2.querySelector('button[type="submit"]');

  // Trigger first submit event
  form2.dispatchEvent(new win2.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  const alertBox2 = form2.querySelector('.if-form-alert');
  assert(alertBox2 !== null, '404 endpoint status triggers honest fallback alert');
  assert(alertBox2.textContent.includes('Online form transmission to a backend server is not active in this static environment'), '404 status renders honest static environment explanation');
  assert(submitBtn2.disabled === false, 'Submit button remains enabled after 404 failure');
  assert(submitBtn2.textContent === 'Retry Submission', 'Submit button displays "Retry Submission" label');
  assert(submitBtn2.onclick === null, 'Submit button onclick is NOT hijacked with WhatsApp launcher');
  assert(form2.dataset.submitted !== 'true', 'Form is not marked submitted on 404 failure');

  // Trigger retry submission to confirm handler remains active
  form2.dispatchEvent(new win2.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));
  assert(fetchCalls2 === 2, 'Subsequent submission retry invokes normal online submission handler (fetch called twice)');

  // ----------------------------------------------------
  // Test Suite 4: Ambiguous Server Error (502/5xx) & Network Failure Flow
  // ----------------------------------------------------
  console.log('\n--- Test Suite 4: Ambiguous Server Error (502/5xx) & Network Disruption Flow ---');

  const dom3 = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V02-SVC-017">
        <input type="text" name="contact_name" value="Rahul Verma" required>
        <input type="email" name="email" value="rahul@verma.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/conversion/retainer-desk.html" });

  const win3 = dom3.window;
  const doc3 = win3.document;

  win3.fetch = async function() {
    return {
      ok: false,
      status: 502,
      json: async () => ({ message: "Bad Gateway" })
    };
  };

  win3.eval(formsJsCode);

  const event3 = win3.document.createEvent('Event');
  event3.initEvent('DOMContentLoaded', true, true);
  win3.document.dispatchEvent(event3);

  const form3 = doc3.querySelector('.if-lead-form');
  const submitBtn3 = form3.querySelector('button[type="submit"]');

  form3.dispatchEvent(new win3.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  const alertBox3 = form3.querySelector('.if-form-alert');
  assert(alertBox3 !== null, '502 error triggers fallback notice');
  assert(alertBox3.textContent.includes('could not be confirmed by the server'), 'Notice states transmission could not be confirmed without claiming certain loss');
  assert(submitBtn3.disabled === false, 'Submit button remains enabled after 502 error');
  assert(submitBtn3.textContent === 'Retry Submission', 'Submit button offers "Retry Submission"');
  assert(submitBtn3.onclick === null, 'Submit button onclick is NOT hijacked on 502 error');

  // Network Disruption TypeError Simulation
  const dom4 = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V03-SVC-003">
        <input type="text" name="contact_name" value="Ananya Roy" required>
        <input type="email" name="email" value="ananya@roy.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/conversion/tax-intake.html" });

  const win4 = dom4.window;
  const doc4 = win4.document;

  win4.fetch = async function() {
    throw new TypeError('Failed to fetch');
  };

  win4.eval(formsJsCode);

  const event4 = win4.document.createEvent('Event');
  event4.initEvent('DOMContentLoaded', true, true);
  win4.document.dispatchEvent(event4);

  const form4 = doc4.querySelector('.if-lead-form');
  const submitBtn4 = form4.querySelector('button[type="submit"]');

  form4.dispatchEvent(new win4.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  const alertBox4 = form4.querySelector('.if-form-alert');
  assert(alertBox4 !== null, 'Network error triggers fallback notice');
  assert(alertBox4.textContent.includes('could not be confirmed'), 'Network disruption states transmission could not be confirmed');
  assert(submitBtn4.disabled === false, 'Submit button remains enabled on network failure');
  assert(submitBtn4.textContent === 'Retry Submission', 'Submit button offers retry on network failure');
  assert(submitBtn4.onclick === null, 'Submit button onclick is NOT hijacked on network failure');

  // Verify User Data Preservation (inputs must not be cleared)
  const nameInput4 = form4.querySelector('input[name="contact_name"]');
  const emailInput4 = form4.querySelector('input[name="email"]');
  assert(nameInput4.value === 'Ananya Roy', 'Form name value preserved during fallback without reset');
  assert(emailInput4.value === 'ananya@roy.in', 'Form email value preserved during fallback without reset');

  // ----------------------------------------------------
  // Test Suite 5: Success Confirmation Contract Gating
  // ----------------------------------------------------
  console.log('\n--- Test Suite 5: Success Confirmation Contract Gating ---');

  // 5A: HTTP 200 with Empty Object {}
  const dom5A = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Kiran Rao" required>
        <input type="email" name="email" value="kiran@acme.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win5A = dom5A.window;
  win5A.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  win5A.eval(formsJsCode);

  const event5A = win5A.document.createEvent('Event');
  event5A.initEvent('DOMContentLoaded', true, true);
  win5A.document.dispatchEvent(event5A);

  const form5A = dom5A.window.document.querySelector('.if-lead-form');
  form5A.dispatchEvent(new win5A.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  assert(form5A.dataset.submitted !== 'true', 'HTTP 200 with empty object does NOT mark form submitted');
  const alert5A = form5A.querySelector('.if-form-alert');
  assert(alert5A !== null && alert5A.textContent.includes('lacked a verified lead reference'), 'HTTP 200 with empty object triggers unconfirmed notice');
  assert(!alert5A.textContent.includes('accepted'), 'HTTP 200 with empty object does NOT display accepted message');

  // 5B: HTTP 200 with Generic Status { status: "ok" } (missing lead_reference)
  const dom5B = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Kiran Rao" required>
        <input type="email" name="email" value="kiran@acme.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win5B = dom5B.window;
  win5B.fetch = async () => ({ ok: true, status: 200, json: async () => ({ status: "ok", message: "Processed" }) });
  win5B.eval(formsJsCode);

  const event5B = win5B.document.createEvent('Event');
  event5B.initEvent('DOMContentLoaded', true, true);
  win5B.document.dispatchEvent(event5B);

  const form5B = dom5B.window.document.querySelector('.if-lead-form');
  form5B.dispatchEvent(new win5B.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  assert(form5B.dataset.submitted !== 'true', 'HTTP 200 with { status: "ok" } does NOT mark form submitted without lead_reference');

  // 5C: HTTP 200 with whitespace-only or non-string lead_reference
  const dom5C = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Kiran Rao" required>
        <input type="email" name="email" value="kiran@acme.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win5C = dom5C.window;
  win5C.fetch = async () => ({ ok: true, status: 200, json: async () => ({ success: true, lead_reference: "   " }) });
  win5C.eval(formsJsCode);

  const event5C = win5C.document.createEvent('Event');
  event5C.initEvent('DOMContentLoaded', true, true);
  win5C.document.dispatchEvent(event5C);

  const form5C = dom5C.window.document.querySelector('.if-lead-form');
  form5C.dispatchEvent(new win5C.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  assert(form5C.dataset.submitted !== 'true', 'Whitespace-only lead_reference rejected and does not mark submitted');

  // 5D: Confirmed Success satisfying Real Backend Contract (LEAD-2026-XXXXXX)
  const dom5D = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Sunita Nair" required>
        <input type="email" name="email" value="sunita@nair.com" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win5D = dom5D.window;
  const doc5D = win5D.document;

  win5D.fetch = async function() {
    return {
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        lead_reference: "LEAD-2026-F9A1B2",
        status: "PENDING_TRIAGE",
        message: "Your corporate compliance enquiry was accepted."
      })
    };
  };

  win5D.eval(formsJsCode);

  const event5D = win5D.document.createEvent('Event');
  event5D.initEvent('DOMContentLoaded', true, true);
  win5D.document.dispatchEvent(event5D);

  const form5D = doc5D.querySelector('.if-lead-form');
  const submitBtn5D = form5D.querySelector('button[type="submit"]');

  form5D.dispatchEvent(new win5D.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  const successAlert5D = form5D.querySelector('.if-form-alert');
  assert(successAlert5D !== null, 'Confirmed backend response renders success alert');
  assert(successAlert5D.textContent.includes('Your compliance enquiry was accepted'), 'Success alert states enquiry was accepted');
  assert(successAlert5D.textContent.includes('Reference: LEAD-2026-F9A1B2'), 'Displays verified backend lead reference LEAD-2026-F9A1B2');
  assert(form5D.dataset.submitted === 'true', 'Form dataset.submitted marked "true" on confirmed success');
  assert(submitBtn5D.textContent === 'Request Submitted', 'Submit button locks into "Request Submitted" state');
  assert(submitBtn5D.disabled === true, 'Submit button disabled on success to prevent duplicates');

  // ----------------------------------------------------
  // Test Suite 6: Notice Deduping & Failure-to-Success Transition
  // ----------------------------------------------------
  console.log('\n--- Test Suite 6: Notice Deduping & Failure-to-Success Transition ---');

  const dom6 = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Ramesh Kumar" required>
        <input type="email" name="email" value="ramesh@kumar.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win6 = dom6.window;
  const doc6 = win6.document;

  let shouldFail = true;
  win6.fetch = async function() {
    if (shouldFail) {
      return { ok: false, status: 500, json: async () => ({ message: "Internal Server Error" }) };
    }
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, lead_reference: "LEAD-2026-778899" })
    };
  };

  win6.eval(formsJsCode);

  const event6 = win6.document.createEvent('Event');
  event6.initEvent('DOMContentLoaded', true, true);
  win6.document.dispatchEvent(event6);

  const form6 = doc6.querySelector('.if-lead-form');
  const submitBtn6 = form6.querySelector('button[type="submit"]');

  // Attempt 1: First failure
  form6.dispatchEvent(new win6.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));
  assert(form6.querySelectorAll('.if-form-alert').length === 1, 'Single alert present after first failure');

  // Attempt 2: Repeated failure (must not stack alerts)
  form6.dispatchEvent(new win6.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));
  assert(form6.querySelectorAll('.if-form-alert').length === 1, 'Repeated failure does NOT accumulate duplicate alerts (found exactly 1)');

  // Attempt 3: Subsequent confirmed success (must replace failure alert with single success alert)
  shouldFail = false;
  form6.dispatchEvent(new win6.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 80));

  const alertsAfterSuccess = form6.querySelectorAll('.if-form-alert');
  assert(alertsAfterSuccess.length === 1, 'Transition from failure to success leaves exactly 1 alert box');
  assert(alertsAfterSuccess[0].textContent.includes('Reference: LEAD-2026-778899'), 'Active alert is the confirmed success message');
  assert(form6.dataset.submitted === 'true', 'Form submitted state is true after retry success');

  // ----------------------------------------------------
  // Test Suite 7: Concurrent Submission Guard
  // ----------------------------------------------------
  console.log('\n--- Test Suite 7: Concurrent Submission Guard ---');

  const dom7 = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form class="if-lead-form" data-service-id="V01-SVC-007">
        <input type="text" name="contact_name" value="Pooja Sharma" required>
        <input type="email" name="email" value="pooja@sharma.in" required>
        <input type="tel" name="phone" value="9876543210" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, { runScripts: "dangerously", url: "https://ccs.craftegon.com/services/pvt-ltd-registration.html" });

  const win7 = dom7.window;
  let concurrentCalls = 0;
  win7.fetch = async function() {
    concurrentCalls++;
    await new Promise(r => setTimeout(r, 100)); // Delay
    return { ok: true, status: 201, json: async () => ({ success: true, lead_reference: "LEAD-2026-CC1122" }) };
  };

  win7.eval(formsJsCode);
  const event7 = win7.document.createEvent('Event');
  event7.initEvent('DOMContentLoaded', true, true);
  win7.document.dispatchEvent(event7);

  const form7 = win7.document.querySelector('.if-lead-form');

  // Fire two rapid submit events concurrently
  form7.dispatchEvent(new win7.Event('submit', { bubbles: true, cancelable: true }));
  form7.dispatchEvent(new win7.Event('submit', { bubbles: true, cancelable: true }));

  await new Promise(r => setTimeout(r, 200));
  assert(concurrentCalls === 1, 'Rapid double-clicking does NOT trigger simultaneous fetch calls (concurrent guard active)');

  console.log('\n============================================================');
  console.log(`TOTAL FORM TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
