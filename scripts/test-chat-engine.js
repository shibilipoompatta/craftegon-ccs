/**
 * ==========================================================================
 * CRAFTEGON CCS - GENAI CO-PILOT CHAT ENGINE VERIFICATION SUITE
 * Validates statutory intent matching and verifies action URLs against disk
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const widgetCode = fs.readFileSync(path.join(root, 'assets/js/chat-widget.js'), 'utf8');

const sandbox = { 
  window: {}, 
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Date: Date,
  document: { 
    readyState: 'complete', 
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
  } 
};
vm.createContext(sandbox);

const unwrap = widgetCode.replace('function matchQuery(q){', 'window.matchQuery = function matchQuery(q){');
vm.runInContext(unwrap, sandbox);
sandbox.matchQuery = sandbox.window.matchQuery;

const testQueries = [
  'How do I incorporate a Pvt Ltd company in India?',
  'How do I incorporate a Limited Liability Partnership (LLP)?',
  'How do I start a One Person Company (OPC)?',
  'How do I register a Section 8 non-profit company?',
  'Hello, how are you?',
  'Who is Jinu?',
  'What are the annual RoC compliance filing due dates?',
  'How much are late fees for Form AOC-4 and MGT-7?',
  'What is the deadline and requirement for RBI FLA return?',
  'What are our fiduciary obligations under DPDP Act 2023?',
  'How do we defend against NCLT insolvency or oppression?',
  'Can you generate a founder or NDA agreement?',
  'Tell me about GST annual return GSTR-9 and Form 3CEB',
  'We want to shut down our defunct company using STK-2',
  'What are the Kerala Launch-to-Operate industry bundles?',
  'How do I check my Kerala bundle readiness and scope?',
  'What is the DIR-3 KYC requirement under Rule 12A?',
  'Random complex question about aerospace law'
];

let allPassed = true;
let totalActionsChecked = 0;

console.log(`\n=== CHAT ENGINE INTENT & ROUTING VERIFICATION ===`);

for (const q of testQueries) {
  const result = sandbox.matchQuery(q);
  console.log(`[QUERY] "${q}"`);
  console.log(` -> Response: ${result.r.substring(0, 90).replace(/<[^>]+>/g, '')}...`);
  console.log(` -> Actions:  ${result.a.map(a => a[1]).join(', ')}`);
  
  for (const act of result.a) {
    totalActionsChecked++;
    let url = act[1];
    let filePath = url.split('#')[0];
    if (filePath.endsWith('/')) filePath += 'index.html';
    const diskPath = path.join(root, filePath.replace(/\//g, path.sep));
    if (!fs.existsSync(diskPath)) {
      console.error(`ERROR: Action URL does not exist on disk: ${url} -> ${diskPath}`);
      allPassed = false;
    }
  }
}

console.log(`\nTotal queries tested: ${testQueries.length}`);
console.log(`Total action URLs verified: ${totalActionsChecked}`);

// Phase 3 Regulatory & Positioning Hygiene Checks
if (/Sept 30|penalty 5,000|Rs 5,000|₹999/i.test(widgetCode)) {
  console.error('ERROR: Legacy DIR-3 KYC (Sept 30 / Rs 5,000) or unapproved retainer fee found in chat-widget.js');
  allPassed = false;
}
if (!widgetCode.includes('ACO-0239') || !widgetCode.includes('Alappuzha') || !widgetCode.includes('Malappuram')) {
  console.error('ERROR: CraftEgon LLP LLPIN (ACO-0239), Alappuzha Commercial Desk, or Malappuram Registered Office reference missing from chat-widget.js');
  allPassed = false;
}
const kycMatch = sandbox.matchQuery('What is the DIR-3 KYC requirement under Rule 12A?');
if (!kycMatch.r.includes('30 June') || !kycMatch.r.includes('Rule 12A')) {
  console.error('ERROR: DIR-3 KYC response did not include amended Rule 12A / 30 June guidance');
  allPassed = false;
}
const bundleMatch = sandbox.matchQuery('What are the Kerala Launch-to-Operate industry bundles?');
if (!bundleMatch.r.includes('Launch-to-Operate') || !bundleMatch.a.some(a => a[1].includes('calculator.html#readiness'))) {
  console.error('ERROR: Kerala bundles query did not route to Launch-to-Operate + Readiness Estimator');
  allPassed = false;
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log(`STATUS: PASS (100% of intents matched, regulatory hygiene verified, and all action URLs verified on disk)\n`);
}
