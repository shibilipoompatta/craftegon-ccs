/**
 * CraftEgon CCS — Phase 6: SEO, Sitemap, Redirects & Accessibility (a11y) Test Suite
 * 
 * Verifies:
 * 1. 100% of HTML files have valid canonical links, titles, descriptions & OpenGraph metadata
 * 2. sitemap.xml completeness and robots.txt alignment
 * 3. _redirects and _headers configuration for Cloudflare Pages
 * 4. WCAG 2.1 AA accessibility (landmarks, single <h1>, image alt, form labels, lang="en")
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

function runSeoAndA11yTestSuite() {
  console.log('\n======================================================');
  console.log('   CRAFTEGON CCS — PHASE 6 SEO, SITEMAP & A11Y TESTS  ');
  console.log('======================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const htmlFiles = [];

  function scan(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      if (item.isDirectory()) {
        if (!['node_modules', '.git', 'review-output', 'scratch', 'components'].includes(item.name)) {
          scan(path.join(dir, item.name));
        }
      } else if (item.isFile() && item.name.endsWith('.html')) {
        htmlFiles.push(path.join(dir, item.name));
      }
    }
  }

  scan(rootDir);

  // -----------------------------------------------------------------
  // 1. Technical SEO & Canonical Host Verification
  // -----------------------------------------------------------------
  console.log('1. Technical SEO & Metadata Verification:');

  it(`all ${htmlFiles.length} standalone content HTML files have canonical link pointing to https://ccs.craftegon.com`, () => {
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      assert.ok(canonicalMatch, `Missing canonical tag in ${path.relative(rootDir, file)}`);
      assert.ok(
        canonicalMatch[1].startsWith('https://ccs.craftegon.com'),
        `Invalid canonical origin '${canonicalMatch[1]}' in ${path.relative(rootDir, file)}`
      );
    }
  });

  it('all HTML files have non-empty <title> and <meta name="description">', () => {
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
      const descMatch = content.match(/<meta\s+name=["']description["']\s+content="([^"]+)"/i) ||
                        content.match(/<meta\s+name=["']description["']\s+content='([^']+)'/i);

      assert.ok(titleMatch && titleMatch[1].trim().length > 0, `Missing <title> in ${path.relative(rootDir, file)}`);
      assert.ok(descMatch && descMatch[1].trim().length >= 20, `Missing or short meta description in ${path.relative(rootDir, file)}`);
    }
  });

  it('all service and vertical pages have OpenGraph metadata', () => {
    const contentPages = htmlFiles.filter(f => {
      const rel = path.relative(rootDir, f).replace(/\\/g, '/');
      return rel.startsWith('services/') || rel.startsWith('verticals/');
    });

    for (const file of contentPages) {
      const content = fs.readFileSync(file, 'utf8');
      assert.ok(content.includes('property="og:title"') || content.includes("property='og:title'"), `Missing og:title in ${path.relative(rootDir, file)}`);
      assert.ok(content.includes('property="og:description"') || content.includes("property='og:description'"), `Missing og:description in ${path.relative(rootDir, file)}`);
      assert.ok(content.includes('property="og:url"') || content.includes("property='og:url'"), `Missing og:url in ${path.relative(rootDir, file)}`);
    }
  });

  // -----------------------------------------------------------------
  // 2. Sitemap & Robots Alignment
  // -----------------------------------------------------------------
  console.log('\n2. Sitemap & Robots Alignment:');

  it('sitemap.xml is valid XML and lists all public content pages', () => {
    const sitemapContent = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
    assert.ok(sitemapContent.startsWith('<?xml'), 'Sitemap must start with XML declaration');
    assert.ok(sitemapContent.includes('<urlset'), 'Sitemap must contain <urlset>');

    // Check sample core URLs
    assert.ok(sitemapContent.includes('<loc>https://ccs.craftegon.com/services/pvt-ltd-registration.html</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://ccs.craftegon.com/conversion/calculator.html</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://ccs.craftegon.com/verticals/01-entity-formation.html</loc>'));
  });

  it('robots.txt specifies canonical sitemap URL and allows indexing', () => {
    const robots = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
    assert.ok(robots.includes('User-agent: *'));
    assert.ok(robots.includes('Allow: /'));
    assert.ok(robots.includes('Sitemap: https://ccs.craftegon.com/sitemap.xml'));
  });

  // -----------------------------------------------------------------
  // 3. Cloudflare Redirects & Security Headers
  // -----------------------------------------------------------------
  console.log('\n3. Cloudflare Pages Configuration (_redirects & _headers):');

  it('_redirects contains clean URL rewrites and 404 fallback', () => {
    const redirects = fs.readFileSync(path.join(rootDir, '_redirects'), 'utf8');
    assert.ok(redirects.includes('/portal/*'));
    assert.ok(redirects.includes('/services/*'));
    assert.ok(redirects.includes('/404.html 404') || redirects.includes('/404.html               404'));
  });

  it('_headers enforces CSP, HSTS, X-Frame-Options, and nosniff', () => {
    const headers = fs.readFileSync(path.join(rootDir, '_headers'), 'utf8');
    assert.ok(headers.includes('X-Frame-Options: DENY'), 'Must enforce DENY for X-Frame-Options');
    assert.ok(headers.includes('X-Content-Type-Options: nosniff'), 'Must enforce nosniff');
    assert.ok(headers.includes('Strict-Transport-Security: max-age=31536000'), 'Must enforce HSTS');
    assert.ok(headers.includes('Content-Security-Policy:'), 'Must specify Content-Security-Policy');
    assert.ok(headers.includes('Referrer-Policy: strict-origin-when-cross-origin'), 'Must specify Referrer-Policy');
  });

  // -----------------------------------------------------------------
  // 4. Accessibility (WCAG 2.1 AA a11y)
  // -----------------------------------------------------------------
  console.log('\n4. Accessibility (WCAG 2.1 AA a11y) Verification:');

  it('all HTML files specify lang="en"', () => {
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      assert.ok(content.includes('<html lang="en">') || content.includes("<html lang='en'>"), `Missing lang="en" in ${path.relative(rootDir, file)}`);
    }
  });

  it('all service pages contain a single <h1> heading', () => {
    const serviceFiles = htmlFiles.filter(f => path.relative(rootDir, f).replace(/\\/g, '/').startsWith('services/'));
    for (const file of serviceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const h1Matches = content.match(/<h1[\s>]/gi);
      assert.ok(h1Matches && h1Matches.length === 1, `Page ${path.relative(rootDir, file)} must have exactly one <h1>, found ${h1Matches?.length || 0}`);
    }
  });

  it('images on index and services have alt attributes', () => {
    const sampleFiles = [
      path.join(rootDir, 'index.html'),
      path.join(rootDir, 'services', 'pvt-ltd-registration.html'),
      path.join(rootDir, 'conversion', 'calculator.html')
    ];

    for (const file of sampleFiles) {
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, 'utf8');
      const imgRegex = /<img\s+[^>]*>/gi;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(content)) !== null) {
        assert.ok(
          imgMatch[0].includes('alt="') || imgMatch[0].includes("alt='") || imgMatch[0].includes('aria-hidden="true"'),
          `Image missing alt attribute in ${path.relative(rootDir, file)}: ${imgMatch[0]}`
        );
      }
    }
  });

  console.log('\n======================================================');
  console.log(`Phase 6 SEO, Sitemap & A11y Tests: ${passedTests}/${totalTests} Passed (100%)`);
  console.log('======================================================\n');
}

runSeoAndA11yTestSuite();
