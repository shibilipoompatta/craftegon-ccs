/**
 * ==========================================================================
 * CRAFTEGON CCS - TRADEMARK SEARCH DOM-XSS & CLAIM SAFETY TEST SUITE
 * ==========================================================================
 * Executes against conversion/trademark-search.html inside JSDOM to verify:
 * 1. Zero DOM-XSS: Untrusted user input NEVER parses into executable DOM sinks.
 * 2. Payload safety: Script, image, and SVG onerror/onload payloads remain literal text.
 * 3. Zero false claims: No fabricated claims of querying IP India or false availability.
 * 4. Transparent disclaimers: Explicitly states no official registry search occurred.
 * 5. Input boundary handling: Handles empty input, ordinary brand, and special characters.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const filePath = path.resolve(__dirname, '..', 'conversion', 'trademark-search.html');
const htmlSource = fs.readFileSync(filePath, 'utf8');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n=== RUNNING TRADEMARK SEARCH DOM-XSS & CLAIM SAFETY TEST SUITE ===\n');

// Helper to create a fresh JSDOM instance with the actual page HTML
function createDomInstance() {
  const dom = new JSDOM(htmlSource, {
    runScripts: 'dangerously',
    url: 'https://ccs.craftegon.com/conversion/trademark-search.html'
  });
  return dom;
}

// --------------------------------------------------------------------------
// TEST SUITE 1: DOM-XSS Attack Payloads
// --------------------------------------------------------------------------
console.log('--- Test Suite 1: DOM-XSS Attack Payloads ---');

const xssPayloads = [
  '<script>window.xssExecuted=true</script>',
  '<img src="x" onerror="window.xssExecuted=true">',
  '<svg onload="window.xssExecuted=true">',
  '"><script>window.xssExecuted=true</script>',
  '"><img src=x onerror=window.xssExecuted=true>',
  '\'"><iframe src="javascript:alert(1)"></iframe>',
  '<body onload=alert(1)>',
  'javascript:alert(1)'
];

xssPayloads.forEach((payload, index) => {
  const dom = createDomInstance();
  const { window } = dom;
  const { document } = window;

  const brandInput = document.getElementById('brand-query');
  brandInput.value = payload;

  // Execute the search function from the page
  window.simulateSearch();

  const resultsDiv = document.getElementById('search-results');
  const resultText = document.getElementById('result-text');

  assert(resultsDiv.style.display !== 'none', `Payload ${index + 1}: Results box is visible after search`);
  assert(!window.xssExecuted, `Payload ${index + 1}: No script execution occurred`);
  assert(resultText.querySelectorAll('script, img, svg, iframe, body').length === 0, `Payload ${index + 1}: No executable elements created in result DOM`);
  assert(resultText.textContent.includes(payload), `Payload ${index + 1}: Payload rendered strictly as literal textContent`);
});

// --------------------------------------------------------------------------
// TEST SUITE 2: False Claims & Deceptive Availability Verification
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 2: False Claims & Registry Query Audit ---');

{
  const dom = createDomInstance();
  const { window } = dom;
  const { document } = window;

  const brandInput = document.getElementById('brand-query');
  brandInput.value = 'CraftEgon Enterprise';

  window.simulateSearch();

  const renderedContent = document.getElementById('result-text').textContent;

  assert(
    !renderedContent.includes('No identical prior registrations found'),
    'Contains NO false assertion of "No identical prior registrations found"'
  );
  assert(
    !renderedContent.includes('High availability probability'),
    'Contains NO false assertion of "High availability probability"'
  );
  assert(
    !renderedContent.includes('Scanning IP India public records'),
    'Contains NO false claim of "Scanning IP India public records"'
  );
  assert(
    !renderedContent.includes('Proceed with Form TM-A filing'),
    'Contains NO premature filing-readiness directive'
  );
  assert(
    renderedContent.toLowerCase().includes('no official trademark registry search was performed') ||
    renderedContent.toLowerCase().includes('no official registry search was performed'),
    'Displays prominent disclaimer that NO official registry search was performed'
  );

  const officialLink = document.getElementById('result-text').querySelector('a[href*="ipindiaservices.gov.in"]');
  assert(
    officialLink !== null && officialLink.getAttribute('target') === '_blank' && officialLink.getAttribute('rel')?.includes('noopener'),
    'Provides outbound link to official IP India portal with rel="noopener noreferrer"'
  );
}

// --------------------------------------------------------------------------
// TEST SUITE 3: Input Edge Cases (Empty Input & Normal Query)
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 3: Input Edge Cases ---');

{
  const dom = createDomInstance();
  const { window } = dom;
  const { document } = window;

  let alertFired = false;
  window.alert = () => { alertFired = true; };

  const brandInput = document.getElementById('brand-query');
  brandInput.value = '   '; // whitespace only

  window.simulateSearch();

  const resultsDiv = document.getElementById('search-results');
  assert(alertFired, 'Empty/whitespace query triggers validation alert');
  assert(resultsDiv.style.display === 'none' || !resultsDiv.textContent.trim(), 'Empty query does not render result box');
}

// Summary
console.log(`\n==================================================`);
console.log(`TRADEMARK SEARCH TEST RESULTS: ${passedTests} / ${totalTests} checks passed.`);
if (passedTests === totalTests) {
  console.log(`STATUS: PASS (DOM-XSS mitigated & claim integrity verified)`);
} else {
  console.log(`STATUS: FAIL`);
}
console.log(`==================================================\n`);
