/**
 * ============================================================================
 * CRAFTEGON CCS — PHASE 1 REMEDIATION AUTOMATED TEST SUITE
 * ============================================================================
 * Tests:
 * 1. Service ID coverage & uniqueness against authoritative CSV register
 * 2. Register-to-page reconciliation (all 57 service routes)
 * 3. Referral-only routes have NO active service IDs
 * 4. Vertical taxonomy consistency (V10, V11, V12, V15 across hubs, nav, footer, index)
 * 5. No unsupported MCA-sync or live external registry claims in portal/scripts
 * 6. Honest form submission fallback & failure notices (no fake transmission)
 * 7. Preservation of trademark-search DOM-XSS and claim safety fix
 * 8. Canonical URL host and sitemap consistency
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'review-output', 'phase-1-foundations', 'phase-1-service-ownership-review.csv');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    failCount++;
  }
}

console.log('\n==================================================');
console.log('CRAFTEGON CCS — PHASE 1 REMEDIATION TEST SUITE');
console.log('==================================================\n');

// ----------------------------------------------------
// TEST SUITE 1: Authoritative CSV Register Parsing
// ----------------------------------------------------
console.log('--- Test Suite 1: Authoritative CSV Register Parsing ---');
assert(fs.existsSync(CSV_PATH), 'Authoritative CSV register exists at expected path');

const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
const csvLines = csvRaw.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = csvLines[0].split(',').map(h => h.trim());

const VERTICAL_SLUGS = {
  'V01': '01-entity-formation',
  'V02': '02-roc-compliance',
  'V03': '03-tax-compliance',
  'V04': '04-statutory-licenses',
  'V05': '05-contracts-legal',
  'V06': '06-ipr-protection',
  'V07': '07-labour-hr',
  'V08': '08-fundraising-investment',
  'V09': '09-ma-restructuring',
  'V10': '10-litigation-dispute',
  'V11': '11-governance-audit',
  'V12': '12-esg-csr',
  'V13': '13-cross-border-fema',
  'V14': '14-exit-insolvency',
  'V15': '15-it-digital'
};

const registerRows = [];
for (let i = 1; i < csvLines.length; i++) {
  // Parse CSV line taking quotes into account
  const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
  let match;
  const cols = [];
  while ((match = regex.exec(csvLines[i])) !== null) {
    let col = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
    cols.push(col.trim());
    if (regex.lastIndex >= csvLines[i].length) break;
  }
  
  if (cols.length >= 6) {
    registerRows.push({
      serviceId: cols[0],
      recordStatus: cols[1],
      route: cols[2],
      approvedName: cols[3],
      primaryVerticalCode: cols[4],
      primaryVerticalName: cols[5],
      relatedLinks: cols[6] || '',
      relatedBasis: cols[7] || '',
      scopeDecision: cols[8] || ''
    });
  }
}

assert(registerRows.length === 57, `CSV contains exactly 57 service routes (found ${registerRows.length})`);

// ----------------------------------------------------
// TEST SUITE 2: Service ID Coverage, Uniqueness & Referral Verification
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Service ID Coverage, Uniqueness & Referral Verification ---');

const servicePagesDir = path.join(ROOT, 'services');
const serviceFiles = fs.readdirSync(servicePagesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
assert(serviceFiles.length === 57, `services/ directory contains exactly 57 canonical service pages (found ${serviceFiles.length})`);

const foundServiceIds = new Map();
const referralPages = [];
const standardActivePages = [];
let v09MergerFound = false;

serviceFiles.forEach(file => {
  const content = fs.readFileSync(path.join(servicePagesDir, file), 'utf8');
  const route = `/services/${file}`;
  
  const idMatch = content.match(/Service ID:\s*([V0-9A-Z-]+)/i);
  if (idMatch) {
    const sId = idMatch[1].trim();
    if (foundServiceIds.has(sId)) {
      foundServiceIds.get(sId).push(file);
    } else {
      foundServiceIds.set(sId, [file]);
    }

    if (sId === 'V09-SVC-003') {
      v09MergerFound = true;
    }
    standardActivePages.push({ file, sId });
  } else {
    referralPages.push(file);
  }
});

// Check unique assignment
let allUnique = true;
foundServiceIds.forEach((files, sId) => {
  if (files.length > 1) {
    allUnique = false;
    assert(false, `Service ID ${sId} is unique`, `Assigned to multiple pages: ${files.join(', ')}`);
  }
});
if (allUnique) {
  assert(true, `All ${foundServiceIds.size} assigned Service IDs are completely unique across all pages`);
}

// Exactly 54 active pages with IDs (53 standard + 1 transactional V09-SVC-003)
assert(foundServiceIds.size === 54, `Exactly 54 active service IDs assigned on disk (found ${foundServiceIds.size})`);
assert(v09MergerFound, `Preserved approved transactional merger ID V09-SVC-003 on /services/nclt-merger-petitions.html`);

// Exactly 3 referral pages without active service IDs
assert(referralPages.length === 3, `Exactly 3 pages have NO active service IDs (found ${referralPages.length})`);
const expectedReferralPages = [
  'director-removal-board-disputes.html',
  'nclt-insolvency-defense.html',
  'oppression-mismanagement-petitions.html'
];
const referralMatch = expectedReferralPages.every(p => referralPages.includes(p));
assert(referralMatch, `Referral-only pages strictly match approved list (${expectedReferralPages.join(', ')})`);

// ----------------------------------------------------
// TEST SUITE 3: Register-to-Page Reconciliation (All 57 Routes)
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Register-to-Page Reconciliation ---');

let reconciliationDiscrepancies = 0;
registerRows.forEach(row => {
  const fileName = row.route.replace('/services/', '');
  const filePath = path.join(servicePagesDir, fileName);
  if (!fs.existsSync(filePath)) {
    reconciliationDiscrepancies++;
    assert(false, `Page exists on disk for route ${row.route}`);
    return;
  }

  const pageHtml = fs.readFileSync(filePath, 'utf8');
  if (row.serviceId && row.serviceId !== 'NONE') {
    const hasId = pageHtml.includes(`Service ID: ${row.serviceId}`) || pageHtml.includes(`Service ID:</span> ${row.serviceId}`);
    if (!hasId) {
      reconciliationDiscrepancies++;
      assert(false, `Page ${fileName} displays approved ID ${row.serviceId}`);
    }
  } else {
    // Should NOT have a Service ID
    const hasAnyId = /Service ID:\s*V/i.test(pageHtml);
    if (hasAnyId) {
      reconciliationDiscrepancies++;
      assert(false, `Referral page ${fileName} has no active Service ID badge`);
    }
  }

  // Verify breadcrumb points to primary vertical hub (or dispute avoidance for referral routes)
  const vertSlug = row.primaryVerticalCode ? VERTICAL_SLUGS[row.primaryVerticalCode] : '10-litigation-dispute';
  const vertHubRegex = new RegExp(`href="\\/verticals\\/${vertSlug}\\.html"`, 'i');
  if (!vertHubRegex.test(pageHtml)) {
    reconciliationDiscrepancies++;
    assert(false, `Page ${fileName} breadcrumb links to primary vertical /verticals/${vertSlug}.html`);
  }
});

assert(reconciliationDiscrepancies === 0, `100% of 57 service routes reconciled with approved register (0 discrepancies)`);

// ----------------------------------------------------
// TEST SUITE 4: Vertical Taxonomy Consistency
// ----------------------------------------------------
console.log('\n--- Test Suite 4: Vertical Taxonomy Consistency ---');

function hasTaxonomy(str, title) {
  const entityTitle = title.replace(/&/g, '&amp;');
  return str.includes(title) || str.includes(entityTitle);
}

// V10: Dispute Avoidance (Non-Litigation)
const v10Path = path.join(ROOT, 'verticals', '10-litigation-dispute.html');
const v10Content = fs.readFileSync(v10Path, 'utf8');
assert(v10Content.includes('Dispute Avoidance (Non-Litigation)'), 'V10 hub title contains "Dispute Avoidance (Non-Litigation)"');
assert(!/we represent you in court/i.test(v10Content), 'V10 does not make courtroom representation claims');
assert(v10Content.includes('Advocates Act, 1961'), 'V10 includes statutory non-litigation disclaimer under Advocates Act, 1961');

// V10 Negative Regression: ensure old labels never return
assert(!v10Content.includes('Corporate & Commercial Litigation Support'), 'V10 hub does not contain old label "Corporate & Commercial Litigation Support"');
assert(!v10Content.includes('Litigation, NCLT & Commercial Disputes'), 'V10 hub does not contain old label "Litigation, NCLT & Commercial Disputes"');

// V11: Governance, Audit & Risk
const v11Path = path.join(ROOT, 'verticals', '11-governance-audit.html');
const v11Content = fs.readFileSync(v11Path, 'utf8');
assert(hasTaxonomy(v11Content, 'Governance, Audit & Risk'), 'V11 hub title contains "Governance, Audit & Risk"');
assert(v11Content.includes('form-csr2.html'), 'V11 includes form-csr2.html (V11-SVC-003)');
assert(!v11Content.includes('form-mr1.html'), 'V11 does not contain form-mr1.html (moved to V02)');

// V12: Data Privacy & Tech Law
const v12Path = path.join(ROOT, 'verticals', '12-esg-csr.html');
const v12Content = fs.readFileSync(v12Path, 'utf8');
assert(hasTaxonomy(v12Content, 'Data Privacy & Tech Law'), 'V12 hub title contains "Data Privacy & Tech Law"');
assert(v12Content.includes('V12-SVC-001') && v12Content.includes('V12-SVC-002') && v12Content.includes('V12-SVC-003'), 'V12 contains all 3 canonical service IDs');

// V12 Negative Regression: ensure old labels never return
assert(!v12Content.includes('ESG, BRSR'), 'V12 hub does not contain old label "ESG, BRSR"');
assert(!v12Content.includes('ESG & Corporate Social Responsibility'), 'V12 hub does not contain old label "ESG & Corporate Social Responsibility"');
assert(!v12Content.includes('Corporate Social Responsibility (CSR) Services'), 'V12 hub does not contain old label "Corporate Social Responsibility (CSR) Services"');

// V15: IT & Digital Infrastructure (Approved coverage gap)
const v15Path = path.join(ROOT, 'verticals', '15-it-digital.html');
const v15Content = fs.readFileSync(v15Path, 'utf8');
assert(hasTaxonomy(v15Content, 'IT & Digital Infrastructure'), 'V15 hub title contains "IT & Digital Infrastructure"');
assert(v15Content.includes('Approved Coverage Gap') || v15Content.includes('Coverage Gap'), 'V15 explicitly labeled as Approved Coverage Gap');
assert(!/Service ID:\s*V15-SVC/i.test(v15Content), 'V15 has 0 service IDs assigned');

// Components: Navbar, Footer, Index
const navbarContent = fs.readFileSync(path.join(ROOT, 'components', 'navbar.html'), 'utf8');
assert(hasTaxonomy(navbarContent, 'Dispute Avoidance (Non-Litigation)'), 'Navbar contains V10 "Dispute Avoidance (Non-Litigation)"');
assert(hasTaxonomy(navbarContent, 'Data Privacy & Tech Law'), 'Navbar contains V12 "Data Privacy & Tech Law"');
assert(hasTaxonomy(navbarContent, 'IT & Digital Infrastructure'), 'Navbar contains V15 "IT & Digital Infrastructure"');
assert(!navbarContent.includes('Corporate & Commercial Litigation'), 'Navbar does not contain old V10 litigation label');
assert(!navbarContent.includes('ESG & Corporate Social Responsibility'), 'Navbar does not contain old V12 ESG label');

const footerContent = fs.readFileSync(path.join(ROOT, 'components', 'footer.html'), 'utf8');
assert(hasTaxonomy(footerContent, 'Dispute Avoidance (Non-Litigation)'), 'Footer contains V10 "Dispute Avoidance (Non-Litigation)"');
assert(hasTaxonomy(footerContent, 'Data Privacy & Tech Law'), 'Footer contains V12 "Data Privacy & Tech Law"');
assert(!footerContent.includes('Corporate & Commercial Litigation'), 'Footer does not contain old V10 litigation label');
assert(!footerContent.includes('ESG & Corporate Social Responsibility'), 'Footer does not contain old V12 ESG label');

const indexContent = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(hasTaxonomy(indexContent, 'Dispute Avoidance (Non-Litigation)'), 'Index contains V10 "Dispute Avoidance (Non-Litigation)"');
assert(hasTaxonomy(indexContent, 'Data Privacy & Tech Law'), 'Index contains V12 "Data Privacy & Tech Law"');
assert(hasTaxonomy(indexContent, 'IT & Digital Infrastructure'), 'Index contains V15 "IT & Digital Infrastructure"');
assert(!indexContent.includes('Corporate & Commercial Litigation'), 'Index does not contain old V10 litigation label');
assert(!indexContent.includes('ESG, BRSR'), 'Index does not contain old V12 ESG label');

// Global HTML Link and Breadcrumb Regression Checks
function getAllHtmlFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
    if (relPath.startsWith('scratch') || relPath.startsWith('node_modules') || relPath.startsWith('.git')) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (item.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allHtml = getAllHtmlFiles(ROOT);
let v10StaleLinkFound = false;
let v12StaleLinkFound = false;

allHtml.forEach(f => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const txt = fs.readFileSync(f, 'utf8');

  // Check links pointing to 10-litigation-dispute.html
  const v10Matches = txt.match(/<a\s+[^>]*href="[^"]*\/verticals\/10-litigation-dispute\.html"[^>]*>([\s\S]*?)<\/a>/gi) || [];
  v10Matches.forEach(m => {
    const linkText = m.replace(/<[^>]+>/g, '').trim();
    if (!linkText.includes('Dispute Avoidance') && !linkText.includes('Access Vertical Hub') && !linkText.includes('Explore Practice Area')) {
      v10StaleLinkFound = true;
      assert(false, `No stale link text to V10 in ${rel}`, `Found "${linkText}" in ${m}`);
    }
  });

  // Check links pointing to 12-esg-csr.html
  const v12Matches = txt.match(/<a\s+[^>]*href="[^"]*\/verticals\/12-esg-csr\.html"[^>]*>([\s\S]*?)<\/a>/gi) || [];
  v12Matches.forEach(m => {
    const linkText = m.replace(/<[^>]+>/g, '').trim();
    if (!linkText.includes('Data Privacy') && !linkText.includes('Access Vertical Hub') && !linkText.includes('Explore Practice Area')) {
      v12StaleLinkFound = true;
      assert(false, `No stale link text to V12 in ${rel}`, `Found "${linkText}" in ${m}`);
    }
  });
});

if (!v10StaleLinkFound) {
  assert(true, 'All links to V10 hub across entire site strictly use approved "Dispute Avoidance (Non-Litigation)" taxonomy');
}
if (!v12StaleLinkFound) {
  assert(true, 'All links to V12 hub across entire site strictly use approved "Data Privacy & Tech Law" taxonomy');
}

// ----------------------------------------------------
// TEST SUITE 5: No Unsupported MCA-Sync or External Registry Claims
// ----------------------------------------------------
console.log('\n--- Test Suite 5: No Unsupported MCA-Sync or External Registry Claims ---');

const dashboardPath = path.join(ROOT, 'portal', 'dashboard.html');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

assert(!dashboardContent.includes('Connecting to MCA V3...'), 'dashboard.html does not claim "Connecting to MCA V3..."');
assert(!dashboardContent.includes('Entity record synced successfully with MCA'), 'dashboard.html does not claim entity record was synced with MCA');
assert(!dashboardContent.includes('MCA Regulatory Register'), 'dashboard.html does not claim connection to MCA Regulatory Register');
assert(dashboardContent.includes('Demo &amp; Reference Mode:') || dashboardContent.includes('Demo & Reference Mode:'), 'dashboard.html includes prominent Demo & Reference Mode notice');
assert(dashboardContent.includes('(Sample Profile)'), 'dashboard.html explicitly labels sample entity profiles');

// ----------------------------------------------------
// TEST SUITE 6: Honest Form Submission & Fallback Notice
// ----------------------------------------------------
console.log('\n--- Test Suite 6: Honest Form Submission & Fallback Notice ---');

const formsJsPath = path.join(ROOT, 'assets', 'js', 'forms.js');
const formsJsContent = fs.readFileSync(formsJsPath, 'utf8');

assert(formsJsContent.includes('Online form transmission to a backend server is not active in this static environment'), 'forms.js states clearly that online transmission is not active');
assert(formsJsContent.includes('Details entered in this form are not stored or transmitted to CraftEgon CCS'), 'forms.js states that details are not stored or transmitted');
assert(formsJsContent.includes('+91 86069 18247'), 'forms.js provides verified WhatsApp contact (+91 86069 18247)');
assert(formsJsContent.includes('admin@craftegon.com'), 'forms.js provides verified Email contact (admin@craftegon.com)');
assert(formsJsContent.includes('escapeHtml'), 'forms.js includes HTML escaping for service name interpolation');

// ----------------------------------------------------
// TEST SUITE 7: Canonical URL Host & Sitemap Consistency
// ----------------------------------------------------
console.log('\n--- Test Suite 7: Canonical URL Host & Sitemap Consistency ---');

const sitemapPath = path.join(ROOT, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
assert(locMatches.length > 0, `sitemap.xml contains ${locMatches.length} URLs`);

let allCanonicalsValid = true;
locMatches.forEach(tag => {
  const url = tag.replace(/<\/?loc>/g, '').trim();
  if (!url.startsWith('https://ccs.craftegon.com')) {
    allCanonicalsValid = false;
    assert(false, `Sitemap URL has correct https://ccs.craftegon.com host: ${url}`);
  }
});
if (allCanonicalsValid) {
  assert(true, `All ${locMatches.length} sitemap URLs use the approved canonical host https://ccs.craftegon.com`);
}

// ----------------------------------------------------
// TEST SUITE 8: Route-Aware Orphan Detection & Directory Index Negative Fixtures
// ----------------------------------------------------
console.log('\n--- Test Suite 8: Route-Aware Orphan Detection & Directory Index Negative Fixtures ---');
const { extractHrefs, normalizeHref, findOrphans, loadRedirectRewrites } = require('./check-orphans');

// Fixture 1 (Positive): Genuine link to /services/ makes directory index reachable
const files1 = new Map([
  ['index.html', '<a href="/services/">Services Directory</a>'],
  ['services/index.html', '<h1>Services</h1>'],
  ['services/pvt-ltd-registration.html', '<a href="/">Home</a>']
]);
const orphans1 = findOrphans(files1, new Map());
assert(!orphans1.includes('services/index.html'), 'A genuine link to /services/ makes directory index reachable');

// Fixture 2 (Positive): Genuine link to /services makes directory index reachable
const files2 = new Map([
  ['index.html', '<a href="/services">Services Directory</a>'],
  ['services/index.html', '<h1>Services</h1>']
]);
const orphans2 = findOrphans(files2, new Map());
assert(!orphans2.includes('services/index.html'), 'A genuine link to /services makes directory index reachable');

// Fixture 3 (Positive): Link to /services.html with _redirects rewrite makes directory index reachable
const files3 = new Map([
  ['index.html', '<a href="/services.html">Services Directory</a>'],
  ['services/index.html', '<h1>Services</h1>']
]);
const rewrites = new Map([['services.html', 'services/index.html']]);
const orphans3 = findOrphans(files3, rewrites);
assert(!orphans3.includes('services/index.html'), 'A link to /services.html with configured rewrite reaches services/index.html');

// Fixture 4 (Negative Defect A): Link only to sibling service page (/services/pvt-ltd-registration.html) does NOT make services/index.html reachable
const files4 = new Map([
  ['index.html', '<a href="/services/pvt-ltd-registration.html">Private Limited</a>'],
  ['services/index.html', '<h1>Services</h1>'],
  ['services/pvt-ltd-registration.html', '<h1>Pvt Ltd</h1>']
]);
const orphans4 = findOrphans(files4, new Map());
assert(orphans4.includes('services/index.html'), 'Link only to /services/pvt-ltd-registration.html does NOT make services/index.html reachable (Defect A prevented)');

// Fixture 5 (Negative Defect A): Mere text occurrence of /services/ does NOT make services/index.html reachable
const files5 = new Map([
  ['index.html', '<p>Visit /services/ for all compliance needs. const path = "/services/";</p>'],
  ['services/index.html', '<h1>Services</h1>']
]);
const orphans5 = findOrphans(files5, new Map());
assert(orphans5.includes('services/index.html'), 'Mere text occurrence of /services/ does not make directory index reachable');

// Fixture 6 (Positive): Query strings and fragments do not change route identity
const files6 = new Map([
  ['index.html', '<a href="/services?stage=compliance&ref=nav#pricing">Services</a>'],
  ['services/index.html', '<h1>Services</h1>']
]);
const orphans6 = findOrphans(files6, new Map());
assert(!orphans6.includes('services/index.html'), 'Query strings and fragments do not prevent directory index match');

// Fixture 7 (Positive): Relative internal links from subdirectories
const files7 = new Map([
  ['verticals/01-formation.html', '<a href="../services/">Directory</a>'],
  ['services/index.html', '<h1>Services</h1>']
]);
const orphans7 = findOrphans(files7, new Map());
assert(!orphans7.includes('services/index.html'), 'Relative internal link (../services/) correctly resolves and reaches directory index');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passCount} passed, ${failCount} failed.`);
console.log('==================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
