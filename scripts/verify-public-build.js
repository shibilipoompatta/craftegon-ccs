/**
 * ============================================================================
 * CRAFTEGON CCS — PUBLIC RELEASE ARTIFACT VERIFICATION SUITE
 * ============================================================================
 * Independent verification of dist-public/ directory:
 * 1. Portal & Admin complete exclusion verification
 * 2. Internal code & secrets exclusion verification
 * 3. HTML page count & service catalog coverage
 * 4. Internal link mesh integrity on public build
 * 5. Edge configuration (_redirects, _headers, robots.txt, sitemap.xml)
 * 6. Build manifest consistency
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-public');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

console.log('================================================================');
console.log('CRAFTEGON CCS — VERIFYING PUBLIC RELEASE ARTIFACT (dist-public/)');
console.log('================================================================\n');

// 1. Directory Existence & Manifest
console.log('--- Test Suite 1: Directory Existence & Build Manifest ---');
assert(fs.existsSync(DIST), 'dist-public/ directory exists');
const manifestPath = path.join(DIST, 'build-manifest.json');
assert(fs.existsSync(manifestPath), 'dist-public/build-manifest.json exists');

let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.buildStatus === 'SUCCESS', 'Build status is recorded as SUCCESS');
  assert(manifest.metrics.totalFilesIncluded > 100, `Total files included (${manifest.metrics.totalFilesIncluded}) exceeds minimum public threshold`);
}

// 2. Strict Internal Exclusions
console.log('\n--- Test Suite 2: Internal Tools & Secrets Exclusion ---');
const forbiddenPaths = [
  'portal',
  'admin',
  'src',
  'docs',
  'scripts',
  'scratch',
  'review-output',
  '.vault',
  '.git',
  '.github',
  '.vscode',
  'node_modules',
  'package.json',
  'package-lock.json',
  '.gitignore',
  'README.md',
  'MERGE_BLUEPRINT.md',
  'assets/css/portal.css'
];

for (const p of forbiddenPaths) {
  const full = path.join(DIST, p.replace(/\//g, path.sep));
  assert(!fs.existsSync(full), `Forbidden path is strictly absent: ${p}`);
}

// 3. Public HTML Page Count & Catalog Coverage
console.log('\n--- Test Suite 3: Public HTML Pages & Service Inventory ---');
const htmlFiles = [];
function findHtml(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      findHtml(full);
    } else if (item.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}
findHtml(DIST);

assert(htmlFiles.length >= 118, `HTML page count (${htmlFiles.length}) meets expected public volume (>=118)`);

// Check critical core pages
const corePages = [
  'index.html',
  'services.html',
  'services/index.html',
  'contact.html',
  'about.html',
  '404.html',
  'search/index.html',
  'conversion/calculator.html',
  'conversion/retainer-desk.html',
  'services/pvt-ltd-registration.html',
  'verticals/01-entity-formation.html',
  'knowledge/mca-v3-filing-guide.html'
];

for (const cp of corePages) {
  assert(fs.existsSync(path.join(DIST, cp.replace(/\//g, path.sep))), `Core page present in public build: ${cp}`);
}

// 4. Edge Routing & Header Configuration
console.log('\n--- Test Suite 4: Edge Routing & Configuration Verification ---');
const redirectsPath = path.join(DIST, '_redirects');
assert(fs.existsSync(redirectsPath), '_redirects exists in public build');
const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');

assert(redirectsContent.includes('/portal*           /404.html               404'), '_redirects blocks /portal* with HTTP 404');
assert(redirectsContent.includes('/admin*            /404.html               404'), '_redirects blocks /admin* with HTTP 404');
assert(redirectsContent.includes('/services          /services/index.html    200'), '_redirects maintains clean /services rewrite');

const headersPath = path.join(DIST, '_headers');
assert(fs.existsSync(headersPath), '_headers exists in public build');
const headersContent = fs.readFileSync(headersPath, 'utf8');
assert(headersContent.includes('X-Frame-Options: DENY'), '_headers specifies X-Frame-Options');
assert(headersContent.includes('Content-Security-Policy'), '_headers enforces Content-Security-Policy');

const sitemapPath = path.join(DIST, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists in public build');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(!sitemapContent.includes('/portal/'), 'Public sitemap contains ZERO /portal/ URLs');
assert(!sitemapContent.includes('/admin/'), 'Public sitemap contains ZERO /admin/ URLs');
assert(sitemapContent.includes('/contact.html'), 'Public sitemap includes /contact.html');

const robotsPath = path.join(DIST, 'robots.txt');
assert(fs.existsSync(robotsPath), 'robots.txt exists in public build');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Disallow: /portal/'), 'robots.txt disallows /portal/');
assert(robotsContent.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');

// 5. Internal Link Mesh & Zero Residual Portal Links Check
console.log('\n--- Test Suite 5: Link Integrity & Zero Portal Links in Public Build ---');
let residualPortalLinks = 0;
let residualAdminLinks = 0;
let brokenLinksCount = 0;

const linkRegex = /href=["'](\/[^"'#?]*)/g;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file).replace(/\\/g, '/');

  // Check for residual portal / admin links
  if (/href=["']\/(?:portal|admin)[\/"']/i.test(content)) {
    console.error(`  ❌ Residual portal/admin link in: ${rel}`);
    residualPortalLinks++;
  }

  // Link existence check
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    let target = match[1];
    // Ignore external or root
    if (target === '/') continue;

    // Check rewrite target if clean URL
    if (target === '/services' || target === '/services/') target = '/services/index.html';
    else if (target === '/knowledge' || target === '/knowledge/') target = '/knowledge/index.html';
    else if (target === '/conversion' || target === '/conversion/') target = '/conversion/index.html';
    else if (target === '/contact') target = '/contact.html';
    else if (target === '/about') target = '/about.html';
    else if (target === '/search' || target === '/search/') target = '/search/index.html';
    else if (target.endsWith('/')) target += 'index.html';

    const resolved = path.join(DIST, target.replace(/\//g, path.sep));
    if (!fs.existsSync(resolved)) {
      brokenLinksCount++;
      console.error(`  ❌ Broken link in ${rel}: ${match[1]} -> ${resolved}`);
    }
  }
}

assert(residualPortalLinks === 0, 'Zero residual portal links across all public HTML pages');
assert(brokenLinksCount === 0, 'Zero broken internal links across public distribution build');

console.log('\n================================================================');
console.log(`TOTAL PUBLIC BUILD TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('STATUS: PASS (100% Public Release Artifact Integrity Verified)\n');
  process.exit(0);
}
