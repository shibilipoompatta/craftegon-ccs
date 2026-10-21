const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const searchEngine = fs.readFileSync(path.join(root, 'assets/js/search-engine.js'), 'utf8');
const entityController = fs.readFileSync(path.join(root, 'assets/js/entity-intelligence.js'), 'utf8');
const calculatorScript = fs.readFileSync(path.join(root, 'assets/js/calculator.js'), 'utf8');

function loadDom(relativePath, url) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  return new JSDOM(html, { runScripts: 'outside-only', url });
}

function dispatchReady(dom) {
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
}

async function submitLookup(dom, query, kind) {
  const form = dom.window.document.querySelector('[data-entity-lookup]');
  form.querySelector('[data-lookup-query]').value = query;
  const kindControl = form.querySelector('[data-lookup-kind]');
  if (kindControl && kind) kindControl.value = kind;
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
}

async function testLookup() {
  const dom = loadDom('portal/entity-search.html', 'https://ccs.craftegon.com/portal/entity-search.html');
  dom.window.fetch = async () => { throw new Error('offline'); };
  dom.window.eval(searchEngine);
  dom.window.eval(entityController);
  dispatchReady(dom);

  await submitLookup(dom, 'U72900KA2021PTC148562');
  const masterCard = dom.window.document.getElementById('master-card');
  assert.strictEqual(masterCard.style.display, 'block', 'Known company benchmark should render a result card');
  assert(masterCard.textContent.includes('Demo/Benchmark Preview'), 'Benchmark results must show a preview label');
  assert(masterCard.textContent.includes('Craftegon Technologies Private Limited'), 'Known CIN should resolve to its benchmark entity');
  await submitLookup(dom, 'AAB-9821');
  assert(masterCard.textContent.includes('Illustrative LLP Benchmark Sample'), 'LLPIN sample should resolve only to an explicitly illustrative record');

  const malicious = '<img src=x onerror=alert(1)>';
  dom.window.searchCompany = async () => ({
    name: malicious,
    cin: malicious,
    roc: malicious,
    class: malicious,
    source: 'live'
  });
  await submitLookup(dom, 'U12345');
  assert.strictEqual(masterCard.querySelectorAll('img,script,iframe').length, 0, 'API-derived fields must not create active markup');
  assert(masterCard.textContent.includes(malicious), 'API-derived markup should display as literal text');

  dom.window.searchCompany = async () => ({ name: 'Made Up Co', cin: 'FAKE', source: 'synthetic' });
  await submitLookup(dom, 'unknown entity');
  assert(masterCard.hidden, 'Synthetic fallback data must not render as a master-data record');
  assert(dom.window.document.getElementById('lookup-feedback').textContent.includes('No verified or benchmark record'), 'Synthetic fallback must report no verified record');
  dom.window.close();

  const trademarkDom = loadDom('conversion/trademark-search.html', 'https://ccs.craftegon.com/conversion/trademark-search.html');
  trademarkDom.window.fetch = async () => { throw new Error('offline'); };
  trademarkDom.window.eval(searchEngine);
  trademarkDom.window.eval(entityController);
  dispatchReady(trademarkDom);
  await submitLookup(trademarkDom, '5829104', 'trademark');
  const trademarkOutput = trademarkDom.window.document.getElementById('trademark-intelligence-results');
  assert(!trademarkOutput.hidden && trademarkOutput.textContent.includes('Demo/Benchmark Preview'), 'Trademark benchmark lookup should render with a preview label');
  assert(trademarkDom.window.document.getElementById('trademark-intelligence-feedback').textContent.includes('Demo/Benchmark Preview'), 'Trademark lookup should update its own status region');
  trademarkDom.window.close();
}

function testCalculator() {
  const dom = loadDom('conversion/calculator.html', 'https://ccs.craftegon.com/conversion/calculator.html');
  dom.window.eval(calculatorScript);
  dispatchReady(dom);
  const { document } = dom.window;

  assert(document.getElementById('ccfs-mode').disabled, 'Expired CCFS-2026 relief must be disabled');
  assert(document.getElementById('ccfs-fee').textContent.includes('Closed'), 'Expired CCFS-2026 must not be applied');
  document.getElementById('gst-2b-ledger').value = '100000';
  document.getElementById('gst-2b-available').value = '85000';
  dom.window.CraftegonCalculator.calculateGst2bReconciliation();
  assert.strictEqual(document.getElementById('gst-2b-difference').textContent, '₹15,000', 'Manual GSTR-2B comparison should show the input difference');
  assert.strictEqual(document.getElementById('gst-2b-status').dataset.state, 'review', 'Mismatched ITC values should require review');

  document.getElementById('startup-loan-principal').value = '1000000';
  document.getElementById('startup-loan-rate').value = '12';
  document.getElementById('startup-loan-tenure').value = '36';
  dom.window.CraftegonCalculator.calculateEmi();
  assert(document.getElementById('startup-loan-emi').textContent.includes('33,214'), 'EMI should respond to principal, rate, and tenure');

  const malicious = '<img src=x onerror=alert(1)>';
  dom.window.localStorage.setItem('ccs_msme_vendors', JSON.stringify([{
    id: 'xss', name: malicious, amount: 1000, acceptanceDate: '2026-10-01', hasWrittenAgreement: true, isMsm: true
  }]));
  dom.window.CraftegonCalculator.renderMsmVendors();
  assert.strictEqual(document.getElementById('msme-vendor-list').querySelectorAll('img,script,iframe').length, 0, 'Stored vendor data must not create active markup');
  assert(document.getElementById('msme-vendor-list').textContent.includes(malicious), 'Stored vendor names should render as literal text');
  assert(document.getElementById('msme-vendor-list').textContent.includes('2026-11-15'), 'Written-term deadline should be 45 days after acceptance');
  dom.window.localStorage.setItem('ccs_msme_vendors', JSON.stringify([{
    id: 'default-term', name: 'Supplier without written terms', amount: 500, acceptanceDate: '2026-10-01', hasWrittenAgreement: false, isMsm: true
  }]));
  dom.window.CraftegonCalculator.renderMsmVendors();
  assert(document.getElementById('msme-vendor-list').textContent.includes('2026-10-16 (15 days)'), 'No written agreement should use the 15-day default period');
  dom.window.close();
}

function testPartnerDesk() {
  const dom = loadDom('conversion/partner-ecosystems.html', 'https://ccs.craftegon.com/conversion/partner-ecosystems.html');
  const { document, window } = dom.window;
  const scripts = Array.from(document.querySelectorAll('script:not([src])'))
    .filter(script => script.type !== 'application/ld+json');
  scripts.forEach(script => window.eval(script.textContent));

  window.openBankOnboarding('hdfc');
  assert.strictEqual(document.getElementById('panel-resolutions').classList.contains('active'), true, 'Bank onboarding should open the local draft workflow');
  assert.strictEqual(document.getElementById('bank-name').value, 'HDFC Bank', 'Bank choice should prefill the selected provider');
  assert(!document.documentElement.innerHTML.includes('/conversion/bank-onboarding.html'), 'Partner actions must not link to a missing bank route');

  window.openMarketplaceOnboarding('amazon');
  assert.strictEqual(document.getElementById('resolution-type').value, 'marketplace-amazon', 'Marketplace choice should prefill the corresponding draft type');
  document.getElementById('company-name').value = 'Example Private Limited';
  document.getElementById('cin').value = 'U12345MH2020PTC000001';
  document.getElementById('meeting-date').value = '2026-10-21';
  document.getElementById('authorized-persons').value = 'Director One';
  document.getElementById('bank-name').value = 'HDFC Bank';
  document.getElementById('account-purpose').value = 'Current account';
  document.getElementById('generated-resolution').scrollIntoView = () => {};
  window.generateResolution(new window.Event('submit', { cancelable: true }));
  assert(document.getElementById('generated-resolution').textContent.startsWith('DRAFT TEMPLATE — REVIEW REQUIRED'), 'Generated resolution must be labeled as a review-required draft');
  dom.window.close();
}

(async () => {
  await testLookup();
  testCalculator();
  testPartnerDesk();
  console.log('Round 3 lookup, calculator, MSME tracker, and partner desk checks passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});