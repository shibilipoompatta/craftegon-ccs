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
const dir3Pricing = pricing.find(p => p.service_id === 'V02-SVC-002');
const forms = read('assets/js/forms.js');
const config = read('assets/js/config.js');
const dir3 = read('services/dir3-kyc.html');
const calculator = read('assets/js/calculator.js');
const calculatorHtml = read('conversion/calculator.html');
const home = read('index.html');
const contact = read('contact.html');
const knowledge = read('knowledge/roc-annual-compliance-india-guide.html');
const terms = read('legal/terms.html');
const privacy = read('legal/privacy.html');
const about = read('about.html');

check(build.includes("'data/pricing.json'"), 'Internal pricing register source is excluded from public build');
check(build.includes('sanitizePublicCommercialPricing') && build.includes('COMMERCIALLY_APPROVED'), 'Public build enforces commercial approval gating');
check(verify.includes('Zero unapproved commercial price amounts') && verify.includes('Zero unapproved Offer/price metadata'), 'Public build verifier enforces unapproved pricing leakage checks');
check(!/item\.verification_status\s*=\s*['"]VERIFIED['"]/.test(build), 'Build does not rewrite verification status');
check(!/item\.commercial_approval_state\s*=\s*['"]COMMERCIALLY_APPROVED['"]/.test(build), 'Build does not invent commercial approval');
check(verify.includes("'data/pricing.json'"), 'Public build verifier explicitly forbids internal pricing register file');
check(pricing.length === 54 && pricing.every(p => p.verification_status !== 'UNVERIFIED' && p.verification_status !== 'VERIFIED'), 'Pricing source reflects observed commercial baseline without claiming external audit verification');
check(pricing.every(p => p.commercial_approval_state === 'COMMERCIALLY_APPROVED' && p.tax_inclusion_status === 'EXPLICITLY_EXCLUDED'), 'All 54 pricing records carry owner commercial approval with explicit GST exclusion');
check(dir3Pricing && Array.isArray(dir3Pricing.statutory_penalties) && dir3Pricing.statutory_penalties.length === 0, 'DIR-3 KYC pricing record contains no obsolete fixed ₹5,000 penalty');
check(!/Verified for statutory compliance|Verified under Indian Corporate Law/i.test(pricingText), 'Pricing notes contain no unsupported verification statement');
check(/name=\"dpdp_consent\"/.test(forms) && /!consentControl\.checked/.test(forms), 'Lead forms require affirmative privacy consent');
check(!/mode\s*:\s*['"]no-cors['"]|googleWorkspace\.webhookUrl/.test(forms), 'Lead form code contains no opaque webhook transmission');
check(/result\.success\s*===\s*true/.test(forms) && /lead_reference/.test(forms), 'Lead success requires a confirmed reference');
check(/advertising:\s*\{\s*enabled:\s*false/.test(config), 'Advertising pixels remain disabled pending consent and ID verification');
check(!/4\.9\/5 Verified Rating|100% On-Time SLA|Zero Hidden MCA Surcharges/.test(home), 'Homepage contains no unsupported rating or performance guarantees');
check(!/30th September|September 30|Sept 30|1st October|mandatory annual verification|annual KYC must be filed|₹5,000|₹1,099/i.test(dir3), 'DIR-3 KYC page contains no obsolete deadline, fixed penalty or unapproved fee');
check(/30 June/i.test(dir3) && /third consecutive financial year/i.test(dir3) && /30[- ]days?/i.test(dir3), 'DIR-3 KYC page reflects triennial cycle and 30-day change reporting');
check(!/form-dir3kyc|form-pas6/.test(calculator), 'Section 403 calculator logic excludes DIR-3 KYC and PAS-6');
check(!home.includes('AOC-4, MGT-7, and DIR-3 KYC filings') && !home.includes('DIR-3 KYC</strong> for all board directors by September 30'), 'Homepage does not apply Section 403 or the old annual deadline to DIR-3 KYC');
check(!/content=[\"'][^\"']*[\"']>>/.test(contact) && !/content=[\"'][^\"']*[\"']>>/.test(calculatorHtml) && !/content=[\"'][^\"']*[\"']>>/.test(dir3) && !/content=[\"'][^\"']*[\"']>>/.test(knowledge), 'Key page meta descriptions contain no malformed trailing angle bracket');
check(/Annual ROC Compliance in India: Private Limited Companies &amp; LLPs/.test(knowledge), 'Annual ROC guide social metadata matches its page topic');
check(config.includes('legalEntity: "CraftEgon LLP"') && privacy.includes('CraftEgon LLP, operating through its CraftEgon Corporate Services'), 'Legal entity and CCS business vertical are distinguished in public disclosures');
check(terms.includes('does not currently offer an online SaaS subscription') && !/Starter at ₹1,499|Growth at ₹4,999|Subscriptions auto-renew/i.test(terms), 'Terms do not promise unverified SaaS subscriptions or auto-renewals');
check(!about.includes('Outcome:</strong>') && about.includes('not client testimonials or independently verified case outcomes'), 'About page does not present unsupported case outcomes as track record');
check(!/id=\"form-dir3kyc\"|id=\"form-pas6\"/.test(calculatorHtml), 'Section 403 calculator UI excludes DIR-3 KYC and PAS-6');

if (process.argv.includes('--built')) {
  const distPricing = path.join(root, 'dist-public', 'data', 'pricing.json');
  check(!fs.existsSync(distPricing), 'Public release artifact does not expose internal pricing source');
}

console.log('Foundation guardrails: ' + passed + '/' + (passed + failed) + ' passed');
if (failed) process.exit(1);
