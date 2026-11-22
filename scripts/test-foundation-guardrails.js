/**
 * CCS Foundation Guardrails
 * Verifies that high-risk claims and build-time status mutation do not regress.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) { passed++; console.log('PASS: ' + label); }
  else { failed++; console.error('FAIL: ' + label); }
}
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

const build = read('scripts/build-public.js');
const verify = read('scripts/verify-public-build.js');
const pricingText = read('data/pricing.json');
const pricing = JSON.parse(pricingText);
const forms = read('assets/js/forms.js');
const config = read('assets/js/config.js');
const dir3 = read('services/dir3-kyc.html');
const calculator = read('assets/js/calculator.js');
const calculatorHtml = read('conversion/calculator.html');
const home = read('index.html');

check(build.includes("'data/pricing.json'"), 'Unapproved pricing source is excluded from public build');
check(!/item\.verification_status\s*=\s*['"]VERIFIED['"]/.test(build), 'Build does not rewrite verification status');
check(!/item\.commercial_approval_state\s*=\s*['"]COMMERCIALLY_APPROVED['"]/.test(build), 'Build does not invent commercial approval');
check(verify.includes("'data/pricing.json'"), 'Public build verifier explicitly forbids pricing source file');
check(pricing.length > 0 && pricing.every(p => p.verification_status !== 'VERIFIED'), 'Pricing source does not claim unsupported verification');
check(pricing.every(p => p.commercial_approval_state !== 'COMMERCIALLY_APPROVED'), 'Pricing source does not claim unapproved commercial approval');
check(!/Verified for statutory compliance|Verified under Indian Corporate Law/i.test(pricingText), 'Pricing notes contain no unsupported verification statement');
check(/name=\"dpdp_consent\"/.test(forms) && /!consentControl\.checked/.test(forms), 'Lead forms require affirmative privacy consent');
check(!/mode\s*:\s*['"]no-cors['"]|googleWorkspace\.webhookUrl/.test(forms), 'Lead form code contains no opaque webhook transmission');
check(/result\.success\s*===\s*true/.test(forms) && /lead_reference/.test(forms), 'Lead success requires a confirmed reference');
check(/advertising:\s*\{\s*enabled:\s*false/.test(config), 'Advertising pixels remain disabled pending consent and ID verification');
check(!/4\.9\/5 Verified Rating|100% On-Time SLA|Zero Hidden MCA Surcharges/.test(home), 'Homepage contains no unsupported rating or performance guarantees');
check(!/30th September|September 30|1st October|mandatory annual verification|annual KYC must be filed/i.test(dir3), 'DIR-3 KYC page contains no obsolete annual deadline or flat penalty');
check(/30th June/i.test(dir3) && /third consecutive financial year/i.test(dir3) && /30[- ]days?/i.test(dir3), 'DIR-3 KYC page reflects triennial cycle and 30-day change reporting');
check(!/form-dir3kyc|form-pas6/.test(calculator), 'Section 403 calculator logic excludes DIR-3 KYC and PAS-6');
check(!/id=\"form-dir3kyc\"|id=\"form-pas6\"/.test(calculatorHtml), 'Section 403 calculator UI excludes DIR-3 KYC and PAS-6');

if (process.argv.includes('--built')) {
  const distPricing = path.join(root, 'dist-public', 'data', 'pricing.json');
  check(!fs.existsSync(distPricing), 'Public release artifact does not expose internal pricing source');
}

console.log('Foundation guardrails: ' + passed + '/' + (passed + failed) + ' passed');
if (failed) process.exit(1);
