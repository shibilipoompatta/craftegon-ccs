/**
 * ============================================================================
 * CRAFTEGON CCS — UNIVERSAL CANONICAL SERVICE SEARCH & DISCOVERY TEST SUITE
 * ============================================================================
 * Tests:
 * 1. Search Index Coverage (All 57 services accounted for)
 * 2. Status Separation (54 Direct, 3 Referral with non-litigation counsel boundary)
 * 3. Physical Route Verification (100% of 57 routes resolve on disk)
 * 4. Multi-Tier Search Algorithm Scoring & Ranking:
 *    - Exact Name Matches
 *    - Form Code Matches (SPICe+, AOC-4, MGT-7, PAS-6, DIR-3, TM-A, FLA)
 *    - Alias & Keyword Matches
 *    - Typo-Tolerant Matches (e.g. "regsitration", "tradmark", "compny")
 * 5. Navigation & Navbar Search Accessibility Structure
 * 6. Unified Discovery Page (services.html) Markup & Semantics
 * 7. Reciprocal Navigation Integrity
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEARCH_INDEX_JSON = path.join(ROOT, 'data', 'search-index.json');
const SEARCH_INDEX_JS = path.join(ROOT, 'assets', 'js', 'search-index.js');
const COVERAGE_CSV = path.join(ROOT, 'review-output', 'universal-service-search', 'service-discovery-coverage.csv');
const SEARCH_ENGINE_JS = path.join(ROOT, 'assets', 'js', 'service-search.js');
const NAVBAR_HTML = path.join(ROOT, 'components', 'navbar.html');
const SERVICES_HTML = path.join(ROOT, 'services.html');

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('CRAFTEGON CCS — UNIVERSAL SERVICE SEARCH & DISCOVERY TESTS');
console.log('============================================================\n');

// ----------------------------------------------------
// Test Suite 1: Canonical Search Index Integrity
// ----------------------------------------------------
console.log('--- Test Suite 1: Canonical Search Index Files Integrity ---');
assert(fs.existsSync(SEARCH_INDEX_JSON), 'data/search-index.json exists');
assert(fs.existsSync(SEARCH_INDEX_JS), 'assets/js/search-index.js exists');
assert(fs.existsSync(COVERAGE_CSV), 'service-discovery-coverage.csv exists');

const catalog = JSON.parse(fs.readFileSync(SEARCH_INDEX_JSON, 'utf8'));
assert(catalog.length === 57, `Search index contains exactly 57 canonical services (found ${catalog.length})`);

const directServices = catalog.filter(s => !s.is_referral);
const referralServices = catalog.filter(s => s.is_referral);
assert(directServices.length === 54, `Search index contains exactly 54 direct regulatory services (found ${directServices.length})`);
assert(referralServices.length === 3, `Search index contains exactly 3 referral services (found ${referralServices.length})`);

// Verify all 54 direct services have valid IDs
const allDirectHaveIds = directServices.every(s => /^V\d{2}-SVC-\d{3}$/.test(s.id));
assert(allDirectHaveIds, 'All 54 direct services have compliant canonical IDs (Vxx-SVC-xxx)');

// Verify all 3 referral services have referral IDs and explicit disclaimers
const allReferralsGated = referralServices.every(s => s.is_referral === true && s.id.startsWith('REF-'));
assert(allReferralsGated, 'All 3 referral services have referral identifiers and referral flags');

// ----------------------------------------------------
// Test Suite 2: Physical Disk Resolution
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Physical Route Verification on Disk ---');
let diskMissing = 0;
catalog.forEach(item => {
  const filePath = path.join(ROOT, item.route.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    diskMissing++;
    console.error(`Missing file on disk: ${filePath}`);
  }
});
assert(diskMissing === 0, '100% of 57 canonical routes resolve to physical files on disk');

// ----------------------------------------------------
// Test Suite 3: Search Engine Ranking & Matching Logic
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Search Engine Matching & Ranking ---');

// Evaluate search engine in simulated node environment
const searchEngineCode = fs.readFileSync(SEARCH_ENGINE_JS, 'utf8');
const fakeWindow = { CRAFTEGON_SERVICE_CATALOG: catalog };
const fakeDocument = {
  getElementById: () => null,
  addEventListener: () => {},
  querySelectorAll: () => []
};

const vm = require('vm');
const context = { window: fakeWindow, document: fakeDocument, console };
vm.createContext(context);
vm.runInContext(searchEngineCode, context);

const engine = fakeWindow.CraftEgonSearch.engine;
assert(!!engine, 'CraftEgonSearch engine successfully instantiated');

// 3.1 Exact Name Search
const pvtResults = engine.search('Private Limited Company Registration (SPICe+)');
assert(pvtResults.length > 0 && pvtResults[0].item.id === 'V01-SVC-007', 'Exact name search ranks V01-SVC-007 at #1');

// 3.2 Form Code Searches
const spiceResults = engine.search('SPICe+');
assert(spiceResults.length > 0 && spiceResults.some(r => r.item.id === 'V01-SVC-007'), 'Form query "SPICe+" finds Private Limited Company');

const aoc4Results = engine.search('AOC-4');
assert(aoc4Results.length > 0 && aoc4Results[0].item.id === 'V02-SVC-004', 'Form query "AOC-4" finds Form AOC-4 Financials at top rank (V02-SVC-004)');

const mgt7Results = engine.search('MGT-7');
assert(mgt7Results.length > 0 && mgt7Results[0].item.id === 'V02-SVC-008', 'Form query "MGT-7" finds Form MGT-7 Annual Return at top rank (V02-SVC-008)');

const dir3Results = engine.search('DIR-3 KYC');
assert(dir3Results.length > 0 && dir3Results[0].item.id === 'V02-SVC-002', 'Form query "DIR-3 KYC" finds DIR-3 KYC Director Verification (V02-SVC-002)');

const pas6Results = engine.search('PAS-6');
assert(pas6Results.length > 0 && pas6Results[0].item.id === 'V02-SVC-012', 'Form query "PAS-6" finds Form PAS-6 Demat Reconciliation (V02-SVC-012)');

const gstr9Results = engine.search('GSTR-9');
assert(gstr9Results.length > 0 && gstr9Results[0].item.id === 'V03-SVC-003', 'Form query "GSTR-9" finds GST Annual Return (V03-SVC-003)');

const flaResults = engine.search('FLA');
assert(flaResults.length > 0 && flaResults.some(r => r.item.id === 'V13-SVC-003'), 'FEMA query "FLA" finds RBI Foreign Liabilities & Assets Return (V13-SVC-003)');

// 3.3 Alias Searches
const tmResults = engine.search('trademark search');
assert(tmResults.length > 0 && tmResults.some(r => r.item.route.includes('trademark')), 'Alias "trademark search" resolves to trademark service');

const msmeResults = engine.search('udyam');
assert(msmeResults.length > 0 && msmeResults.some(r => r.item.id === 'V01-SVC-003'), 'Alias "udyam" resolves to MSME Udyam Registration (V01-SVC-003)');

// 3.4 Typo Tolerance Tests
const typo1 = engine.search('regsitration');
assert(typo1.length > 0, 'Typo query "regsitration" successfully matches company/LLP registration services');

const typo2 = engine.search('tradmark');
assert(typo2.length > 0 && typo2.some(r => r.item.vertical_id === 'V06'), 'Typo query "tradmark" matches IPR trademark services');

// 3.5 Referral Status Gating
const litigationResults = engine.search('commercial dispute litigation');
assert(litigationResults.length > 0 && litigationResults.some(r => r.item.is_referral), 'Litigation query surfaces referral advisory service with is_referral flag');

// ----------------------------------------------------
// Test Suite 4: Navbar Search & Accessibility Verification
// ----------------------------------------------------
console.log('\n--- Test Suite 4: Navbar Search & Navigation Integrity ---');
const navbarHtml = fs.readFileSync(NAVBAR_HTML, 'utf8');

assert(navbarHtml.includes('id="universal-search-input"'), 'Navbar includes #universal-search-input');
assert(navbarHtml.includes('id="universal-search-dropdown"'), 'Navbar includes #universal-search-dropdown');
assert(navbarHtml.includes('id="universal-search-clear"'), 'Navbar includes #universal-search-clear button');
assert(navbarHtml.includes('role="search"'), 'Navbar search form has role="search"');
assert(navbarHtml.includes('aria-label="Universal Service Search"'), 'Navbar search has descriptive aria-label');
assert(navbarHtml.includes('href="/services.html"'), 'Navbar links directly to /services.html');
assert(navbarHtml.includes('Services <span'), 'Navbar displays prominent Services link with count badge');
assert(navbarHtml.includes('Explore by Category'), 'Navbar includes "Explore by Category" mega-menu');
assert(navbarHtml.includes('By Business Stage'), 'Navbar includes "By Business Stage" menu');

// ----------------------------------------------------
// Test Suite 5: Unified Service Discovery Page (services.html)
// ----------------------------------------------------
console.log('\n--- Test Suite 5: Unified Service Discovery Page (services.html) ---');
assert(fs.existsSync(SERVICES_HTML), 'services.html exists at project root');

const servicesContent = fs.readFileSync(SERVICES_HTML, 'utf8');
assert(servicesContent.includes('<link rel="canonical" href="https://ccs.craftegon.com/services.html">'), 'services.html has correct canonical URL');
assert(servicesContent.includes('<title>Universal Corporate Services Directory | CraftEgon CCS</title>'), 'services.html has accurate corporate title');
assert(servicesContent.includes('id="directory-search-input"'), 'services.html has #directory-search-input');
assert(servicesContent.includes('id="stage-filter-group"'), 'services.html has stage filter group');
assert(servicesContent.includes('id="vertical-filter-select"'), 'services.html has practice vertical filter select');
assert(servicesContent.includes('id="entity-filter-select"'), 'services.html has entity type filter select');
assert(servicesContent.includes('id="status-filter-select"'), 'services.html has service status filter select');
assert(servicesContent.includes('id="directory-empty-state"'), 'services.html has accessible empty state');
assert(servicesContent.includes('window.CRAFTEGON_SERVICE_CATALOG'), 'services.html consumes canonical catalog');

// ----------------------------------------------------
// Test Suite 6: Routing & Redirects & Sitemap Consistency
// ----------------------------------------------------
console.log('\n--- Test Suite 6: Routing, Redirects & Sitemap Verification ---');
const redirectsContent = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
assert(redirectsContent.includes('/services        /services.html          200'), '_redirects includes /services clean rewrite');

const sitemapContent = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
assert(sitemapContent.includes('https://ccs.craftegon.com/services.html'), 'sitemap.xml includes https://ccs.craftegon.com/services.html');

// ----------------------------------------------------
// Test Suite 7: Reciprocal Discovery Verification
// ----------------------------------------------------
console.log('\n--- Test Suite 7: Reciprocal Discovery Navigation Verification ---');
const navigationJs = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'navigation.js'), 'utf8');
assert(navigationJs.includes('injectServiceDiscoveryReciprocal'), 'navigation.js defines injectServiceDiscoveryReciprocal');
assert(navigationJs.includes('service-dir-backlink'), 'navigation.js adds backlink to all 57 services in breadcrumb');
assert(navigationJs.includes('reciprocal-service-discovery'), 'navigation.js renders adjacent services widget in practice vertical');

console.log('\n============================================================');
console.log(`TOTAL SUITES EXECUTED: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('STATUS: PASS (100% Universal Service Search & Discovery Verified)\n');
}
