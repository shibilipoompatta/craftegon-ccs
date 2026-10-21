const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/search-engine.js'), 'utf8');
const dom = new JSDOM(`
  <div id="company-results"></div>
  <div id="tm-results"></div>
  <div id="gstin-results"></div>
`, { runScripts: 'outside-only', url: 'https://ccs.craftegon.com/search/' });

dom.window.eval(source);

const payload = '<img src=x onerror=alert(1)>';
const cases = [
  {
    id: 'company-results',
    result: dom.window.generateSyntheticCompany('Example'),
    render: dom.window.renderCompanyResult
  },
  {
    id: 'tm-results',
    result: dom.window.generateSyntheticTrademark('Example'),
    render: dom.window.renderTrademarkResult
  },
  {
    id: 'gstin-results',
    result: dom.window.generateSyntheticGstin('29AAACA1234A1Z5'),
    render: dom.window.renderGstinResult
  }
];

for (const testCase of cases) {
  testCase.result.name = payload;
  testCase.result.legalName = payload;
  testCase.result.source = 'synthetic';
  if (testCase.result.risks) {
    testCase.result.risks[0].title = payload;
    testCase.result.risks[0].color = 'red; background-image: url(javascript:alert(1))';
  }

  testCase.render(testCase.result);

  const result = dom.window.document.getElementById(testCase.id);
  assert.strictEqual(result.querySelectorAll('img, script, iframe').length, 0, `${testCase.id} must not create executable markup`);
  assert(result.textContent.includes(payload), `${testCase.id} should display untrusted markup as text`);
  assert(result.textContent.includes('Demo/Benchmark Preview'), `${testCase.id} should label non-live data`);
  assert(!Array.from(result.querySelectorAll('[style]')).some(element => element.getAttribute('style').includes('javascript:')),
    `${testCase.id} must reject unsafe inline colors`);
}

const liveCompany = dom.window.generateSyntheticCompany('Example');
liveCompany.source = 'live';
dom.window.renderCompanyResult(liveCompany);
assert(!dom.window.document.getElementById('company-results').textContent.includes('Demo/Benchmark Preview'),
  'live data should not be labeled as a preview');

console.log('Search result escaping and preview-label tests passed for company, trademark, GSTIN, and live data.');