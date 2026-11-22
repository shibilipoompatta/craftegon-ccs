const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const wizardJs = fs.readFileSync('assets/js/entity-wizard.js', 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://ccs.craftegon.com/'
});

const { window } = dom;
const { document } = window;

// Execute wizard script in the JSDOM window context
const scriptEl = document.createElement('script');
scriptEl.textContent = wizardJs;
document.body.appendChild(scriptEl);

console.log('Testing Entity Selector Wizard in DOM...');

function getRecState() {
  return {
    title: document.getElementById('rec-title').textContent.trim(),
    badge: document.getElementById('rec-badge').textContent.trim(),
    tag: document.getElementById('rec-tag').textContent.trim(),
    price: document.getElementById('rec-price').textContent.trim(),
    cta: document.getElementById('rec-cta').href
  };
}

// 1. Initial State Check
const initial = getRecState();
console.log('Initial State:', initial.title);
if (!initial.title.includes('Private Limited Company')) {
  console.error('FAIL: Initial state is not Private Limited Company!');
  process.exit(1);
}

// Test Case 1: User Screenshot 1 (Non-profit + Solo + Lightweight)
console.log('\n--- Test Case 1: Non-Profit Selection ---');
const nonprofitRadio = document.querySelector('input[name="w-goal"][value="nonprofit"]');
const soloTeamRadio = document.querySelector('input[name="w-team"][value="solo"]');
const lightAuditRadio = document.querySelector('input[name="w-audit"][value="lightweight"]');

nonprofitRadio.checked = true;
nonprofitRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

const state1 = getRecState();
console.log('After selecting Non-Profit:', state1.title);
if (!state1.title.includes('Section 8 Non-Profit Company')) {
  console.error('FAIL: Expected Section 8 Non-Profit Company, got:', state1.title);
  process.exit(1);
}
console.log('PASS: Section 8 correctly recommended!');

// Test Case 2: User Screenshot 2 (Bootstrapped + Solo + Lightweight)
console.log('\n--- Test Case 2: Solo Bootstrapped Lightweight Selection ---');
const bootRadio = document.querySelector('input[name="w-goal"][value="bootstrapped"]');
bootRadio.checked = true;
bootRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

soloTeamRadio.checked = true;
soloTeamRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

lightAuditRadio.checked = true;
lightAuditRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

const state2 = getRecState();
console.log('After selecting Bootstrapped + Solo + Lightweight:', state2.title);
if (!state2.title.includes('Sole Proprietorship')) {
  console.error('FAIL: Expected Sole Proprietorship for solo lightweight founder, got:', state2.title);
  process.exit(1);
}
console.log('PASS: Sole Proprietorship correctly recommended for solo lightweight!');

// Test Case 3: Multiple Founders Bootstrapped (LLP)
console.log('\n--- Test Case 3: Multiple Founders Bootstrapped Selection (LLP) ---');
const multiTeamRadio = document.querySelector('input[name="w-team"][value="multiple"]');
multiTeamRadio.checked = true;
multiTeamRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

const state3 = getRecState();
console.log('After selecting Multiple + Bootstrapped:', state3.title);
if (!state3.title.includes('Limited Liability Partnership (LLP)')) {
  console.error('FAIL: Expected LLP, got:', state3.title);
  process.exit(1);
}
console.log('PASS: LLP correctly recommended!');

// Test Case 4: Solo Founder Institutional (OPC)
console.log('\n--- Test Case 4: Solo Founder Institutional Selection (OPC) ---');
soloTeamRadio.checked = true;
soloTeamRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

const instAuditRadio = document.querySelector('input[name="w-audit"][value="institutional"]');
instAuditRadio.checked = true;
instAuditRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

const state4 = getRecState();
console.log('After selecting Solo + Institutional:', state4.title);
if (!state4.title.includes('One Person Company (OPC)')) {
  console.error('FAIL: Expected OPC, got:', state4.title);
  process.exit(1);
}
console.log('PASS: OPC correctly recommended!');

// Test Case 5: Direct Nested Text Span Clicks
console.log('\n--- Test Case 5: Nested Span Clicks (.chip-title and .chip-desc) ---');
const npChip = document.querySelector('input[name="w-goal"][value="nonprofit"]').closest('.wizard-chip');
const npTitle = npChip.querySelector('.chip-title');
npTitle.click();

let state5 = getRecState();
console.log('After clicking .chip-title of Non-Profit:', state5.title);
if (!state5.title.includes('Section 8')) {
  console.error('FAIL on chip-title click!');
  process.exit(1);
}

const vcChip = document.querySelector('input[name="w-goal"][value="vc"]').closest('.wizard-chip');
vcChip.click();

let state6 = getRecState();
console.log('After clicking VC chip:', state6.title);
if (!state6.title.includes('Private Limited Company')) {
  console.error('FAIL on VC chip click!');
  process.exit(1);
}

console.log('\n========================================');
console.log('ALL ENTITY SELECTOR WIZARD TESTS PASSED!');
console.log('========================================');
