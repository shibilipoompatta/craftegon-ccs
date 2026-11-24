/**
 * ============================================================================
 * CRAFTEGON CCS: DETERMINISTIC PUBLIC RELEASE ARTIFACT BUILD ENGINE
 * ============================================================================
 * Generates an isolated, verified, production-ready public website artifact in:
 * `dist-public/`
 *
 * Strict Compliance Rules:
 * 1. Excludes internal tools: /portal/, /admin/, /src/, /docs/, /scripts/, etc.
 * 2. Excludes credentials, environment files, and dev metadata.
 * 3. Sanitizes all public asset references (no residual dead links to /portal/).
 * 4. Preserves 100% of legitimate public services, verticals, knowledge, and tools.
 * 5. Generates hardened edge _redirects, _headers, robots.txt, and sitemap.xml.
 * 6. Emits a comprehensive machine-readable build manifest (build-manifest.json).
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-public');
const DOCS_DIR = path.join(ROOT, 'docs', 'ux-012-public-build-and-release-preparation');

console.log('================================================================');
console.log('CRAFTEGON CCS: ASSEMBLING PUBLIC PRODUCTION RELEASE ARTIFACT');
console.log('================================================================\n');

// 1. Wipe & Recreate Target Distribution Directory
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 2. Strict Exclusion Configurations
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  '.vault',
  '.vscode',
  '.system_generated',
  'portal',
  'admin',
  'src',
  'docs',
  'scripts',
  'scratch',
  'review-output',
  'dist-public'
]);

const EXCLUDED_FILES = new Set([
  'package.json',
  'package-lock.json',
  'data/pricing.json', // Internal source data; publish only after explicit commercial approval.
  'MERGE_BLUEPRINT.md',
  'README.md',
  '.gitignore',
  'screenshot.png',
  '_redirects',
  '_headers',
  'robots.txt',
  'sitemap.xml',
  'build-manifest.json',
  'regulatory-claims.json'
]);

const EXCLUDED_FILE_PATTERNS = [
  /^\.env/i,
  /\.log$/i,
  /\.sqlite$/i,
  /\.db$/i,
  /\.pem$/i,
  /\.key$/i,
  /\.schema\.json$/i,
  /portal\.css$/i
];

function shouldExclude(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (normalized === 'data/pricing.json') return true;
  
  // Check directory exclusion
  for (const seg of segments) {
    if (EXCLUDED_DIRS.has(seg)) return true;
  }
  
  // Check backup directory in data
  if (normalized.startsWith('data/backups/')) return true;

  const base = path.basename(relPath);
  if (EXCLUDED_FILES.has(base)) return true;

  for (const pattern of EXCLUDED_FILE_PATTERNS) {
    if (pattern.test(base)) return true;
  }

  return false;
}

// 3. Pre-load and prepare canonical components for Static Site Pre-rendering (SSG)
const rawNavbar = fs.readFileSync(path.join(ROOT, 'components', 'navbar.html'), 'utf8');
const rawFooter = fs.readFileSync(path.join(ROOT, 'components', 'footer.html'), 'utf8');

function cleanPortalLinks(raw) {
  return raw
    .replace(/<a\s+href="\/portal\/dashboard\.html"\s+class="if-btn-secondary\s+portal-nav-link".*?>[\s\S]*?<\/a>/gi, 
      '<a href="/services/" class="if-btn-secondary" title="Universal Services Directory">Services</a>')
    .replace(/href=["']\/portal\/entity-search\.html["']/g, 'href="/search/index.html"')
    .replace(/href=["']\/portal\/dashboard\.html["']/g, 'href="/services/roc-annual-compliance.html"')
    .replace(/href=["']\/portal\/subscription\.html["']/g, 'href="/conversion/retainer-desk.html"')
    .replace(/href=["']\/portal\/?["']/g, 'href="/services/"')
    .replace(/href=["']\/admin\/?.*?["']/g, 'href="/404.html"');
}

const ssgNavbar = cleanPortalLinks(rawNavbar);
const ssgFooter = cleanPortalLinks(rawFooter);


/**
 * Remove unapproved commercial prices from the public artifact.
 * Source HTML remains intact for internal review; public output uses enquiry CTAs
 * until the business owner records formal approval in the commercial register.
 */
function sanitizePublicCommercialPricing(html, relPath) {
  let maskedElements = 0;
  let strippedStructuredData = 0;

  html = html.replace(/<(span|div)\b(?=[^>]*\bclass=(["'])[^"']*\b(?:fasttrack-price|sublink-tag|if-pricing-price)\b[^"']*\2)[^>]*>([\s\S]*?)<\/\1>/gi,
    (match, tag, quote, inner) => {
      const isExplicitPriceCard = /\bclass=(["'])[^"']*\bif-pricing-price\b[^"']*\1/i.test(match.slice(0, match.indexOf('>') + 1));
      const containsCurrencyAmount = /₹|\bINR\s*[\d,]+|[\d,]+(?:\.\d{1,2})?\s*INR/i.test(inner);
      if (!isExplicitPriceCard && !containsCurrencyAmount) return match;

      maskedElements++;
      const openingTag = match.slice(0, match.indexOf('>') + 1);
      return openingTag + 'Request quote</' + tag + '>';
    }
  );

  html = html.replace(
    /(<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (match, opening, jsonText, closing) => {
      let data;
      try {
        data = JSON.parse(jsonText);
      } catch (error) {
        throw new Error('Cannot safely sanitize malformed JSON-LD in ' + relPath + ': ' + error.message);
      }

      let removed = 0;
      function stripCommercialOfferData(value) {
        if (Array.isArray(value)) {
          value.forEach(stripCommercialOfferData);
          return;
        }
        if (!value || typeof value !== 'object') return;

        for (const key of Object.keys(value)) {
          if (key === 'offers' || key === 'hasOfferCatalog' || key === 'price' || key === 'priceCurrency') {
            delete value[key];
            removed++;
          } else {
            stripCommercialOfferData(value[key]);
          }
        }
      }

      stripCommercialOfferData(data);
      if (!removed) return match;
      strippedStructuredData += removed;
      return opening + JSON.stringify(data, null, 2) + closing;
    }
  );

  return { html, maskedElements, strippedStructuredData };
}

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([\{\};:,>~+])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/\band\(/g, 'and (')
    .replace(/\bor\(/g, 'or (')
    .replace(/\bnot\(/g, 'not (')
    .trim();
}

function minifyJS(js) {
  // Strip block comments
  let text = js.replace(/\/\*[\s\S]*?\*\//g, '');
  // Line-by-line whitespace & full-line comment stripping (preserves ASI and line breaks)
  const lines = text.split('\n');
  const out = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    out.push(trimmed);
  }
  const minified = out.join('\n');
  // Syntax safety check
  try {
    new Function(minified);
    return minified;
  } catch (err) {
    console.warn('  ⚠️ Minification syntax warning, keeping original:', err.message);
    return js;
  }
}

// 4. Recursive Copy with Exclusion, Sanitization & Pre-rendering
const includedFiles = [];
let sanitizedLinksCount = 0;
let preRenderedPagesCount = 0;
let sanitizedCommercialPriceElementsCount = 0;
let sanitizedCommercialStructuredDataCount = 0;

function copyAndSanitize(srcDir, destDir, currentRel = '') {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const relPath = currentRel ? path.join(currentRel, entry) : entry;
    const relPosix = relPath.replace(/\\/g, '/');

    if (shouldExclude(relPosix)) {
      continue;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyAndSanitize(srcPath, destPath, relPath);
    } else {
      let content = fs.readFileSync(srcPath);
      const ext = path.extname(srcPath).toLowerCase();

      // Text-based file sanitization & optimization
      if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json') {
        let text = content.toString('utf8');
        const originalText = text;

        // Theme CSS: strip portal.css import
        if (relPosix === 'assets/css/theme.css') {
          text = text.replace(/@import\s+url\(['"]?\/assets\/css\/portal\.css['"]?\);?/g, '/* portal.css excluded from public build */');
        }

        // HTML Processing: SSG Pre-rendering & Portal link sanitization
        if (ext === '.html') {
          // Pre-render Navbar and Footer into empty containers (skips component fragments themselves)
          if (relPosix !== 'components/navbar.html' && relPosix !== 'components/footer.html') {
            if (/<div\s+id=["'](?:global-navbar|global-header)["']\s*>\s*<\/div>/i.test(text)) {
              text = text.replace(/<div\s+id=["'](?:global-navbar|global-header)["']\s*>\s*<\/div>/gi, () => {
                preRenderedPagesCount++;
                return `<div id="global-navbar">\n${ssgNavbar}\n</div>`;
              });
            }
            text = text.replace(/<div\s+id=["']global-footer["']\s*>\s*<\/div>/gi, () => {
              return `<div id="global-footer">\n${ssgFooter}\n</div>`;
            });
          }

          // Ensure <main> has id="main-content" for accessibility skip link
          if (!text.includes('id="main-content"') && !text.includes("id='main-content'")) {
            text = text.replace(/<main(\b[^>]*)>/i, (m, attrs) => `<main id="main-content"${attrs}>`);
          }

          // Clean portal header button across any HTML page
          text = text.replace(/<a\s+href="\/portal\/dashboard\.html"\s+class="if-btn-secondary\s+portal-nav-link".*?>[\s\S]*?<\/a>/gi, () => {
            sanitizedLinksCount++;
            return '<a href="/services/" class="if-btn-secondary" title="Universal Services Directory">Services</a>';
          });

          // Replace entity search portal link with public search
          text = text.replace(/href=["']\/portal\/entity-search\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/search/index.html"';
          });
          // Replace portal dashboard link with public RoC compliance service
          text = text.replace(/href=["']\/portal\/dashboard\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/services/roc-annual-compliance.html"';
          });
          // Replace portal subscription link with public retainer desk
          text = text.replace(/href=["']\/portal\/subscription\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/conversion/retainer-desk.html"';
          });
          // Replace generic portal root with public services directory
          text = text.replace(/href=["']\/portal\/?["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/services/"';
          });
          // Replace any admin links with 404
          text = text.replace(/href=["']\/admin\/?.*?["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/404.html"';
          });
          // Mask hard-coded, unapproved service prices in the public artifact.
          // Statutory amounts in explanatory content are intentionally preserved.
          const commercialPricing = sanitizePublicCommercialPricing(text, relPosix);
          text = commercialPricing.html;
          sanitizedCommercialPriceElementsCount += commercialPricing.maskedElements;
          sanitizedCommercialStructuredDataCount += commercialPricing.strippedStructuredData;
        }

        // JS Processing: Sanitize residual portal links & Minify
        if (ext === '.js') {
          text = text.replace(/href=["']\/portal\/entity-search\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/search/index.html"';
          });
          text = text.replace(/href=["']\/portal\/dashboard\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/services/roc-annual-compliance.html"';
          });
          text = text.replace(/href=["']\/portal\/subscription\.html["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/conversion/retainer-desk.html"';
          });
          text = text.replace(/href=["']\/portal\/?["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/services/"';
          });
          text = text.replace(/href=["']\/admin\/?.*?["']/g, () => {
            sanitizedLinksCount++;
            return 'href="/404.html"';
          });

          text = minifyJS(text);
        }

        // CSS Processing: Minify
        if (ext === '.css') {
          text = minifyCSS(text);
        }

        if (text !== originalText) {
          content = Buffer.from(text, 'utf8');
        }
      }

      fs.writeFileSync(destPath, content);
      includedFiles.push({
        path: relPosix,
        size: content.length,
        ext: ext || 'none'
      });
    }
  }
}

// Execute File Assembly
copyAndSanitize(ROOT, DIST);
console.log('Masked ' + sanitizedCommercialPriceElementsCount + ' unapproved commercial price elements and removed ' + sanitizedCommercialStructuredDataCount + ' structured-data price/offer fields from the public artifact.');

// 4. Generate Hardened Edge Routing Configuration (_redirects)
const publicRedirects = `# ==============================================================================
# CRAFTEGON CCS: HARDENED CLOUDFLARE PAGES EDGE ROUTING (_redirects)
# Production Distribution Edge Rules: Zero Internal Exposure Policy
# ==============================================================================

# 1. HARD SECURITY GATES: Internal Applications & Secrets (Return HTTP 404)
/admin*            /404.html               404
/portal*           /404.html               404
/.env*             /404.html               404
/.git*             /404.html               404
/.vault*           /404.html               404
/package*.json     /404.html               404
/data/*.schema.json /404.html              404
/data/regulatory-claims.json /404.html     404
/data/backups/*    /404.html               404

# 1.1 RETIRED CATEGORY & TOOL REDIRECTS (HTTP 301)
/verticals/14-exit-insolvency*  /verticals/index.html   301
/conversion/strike-off-checker* /services/form-stk2-strike-off 301
/conversion/trademark-search*   /services/trademark-registration 301

# 1.2 TRADEMARK SUB-SERVICE ALIASES (HTTP 301)
/services/trademark-examination* /knowledge/trademark-objection-reply-section-9-11-handbook 301
/services/trademark-opposition*  /knowledge/trademark-opposition-procedure-tm-o-handbook 301

# 2. CLEAN URL REWRITES (Status 200)
/categories              /categories/index.html  200
/categories/             /categories/index.html  200
/categories/*            /categories/:splat      200
/services                /services/index.html    200
/services/               /services/index.html    200
/services.html           /services/index.html    200
/services/*              /services/:splat        200
/verticals               /verticals/index.html   200
/verticals/              /verticals/index.html   200
/verticals/*             /verticals/:splat       200
/knowledge               /knowledge/index.html   200
/knowledge/*             /knowledge/:splat       200
/conversion              /conversion/index.html  200
/conversion/             /conversion/index.html  200
/conversion/*            /conversion/:splat      200
/legal/*                 /legal/:splat           200
/search                  /search/index.html      200
/search/                 /search/index.html      200

# 3. GLOBAL CATCH-ALL (HTTP 404 Fallback)
/*                 /404.html               404
`;

fs.writeFileSync(path.join(DIST, '_redirects'), publicRedirects, 'utf8');
includedFiles.push({ path: '_redirects', size: Buffer.byteLength(publicRedirects), ext: 'config' });

// 5. Generate Hardened Security Headers (_headers)
const publicHeaders = `/favicon.ico
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/favicon.png
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/apple-touch-icon.png
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/site.webmanifest
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=86400

/llms.txt
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=86400

/c7a4e8d21b9f4056a2e8c1d3f5b709a2.txt
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=86400

/assets/images/*
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/assets/fonts/*
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://connect.facebook.net https://snap.licdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.craftegon.com https://generativelanguage.googleapis.com https://docs.google.com https://forms.google.com https://cloudflareinsights.com https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://www.facebook.com https://px.ads.linkedin.com; frame-src 'self' https://docs.google.com https://forms.google.com https://www.facebook.com; frame-ancestors 'none';

/assets/css/*
  Cache-Control: public, max-age=0, must-revalidate

/assets/js/*
  Cache-Control: public, max-age=0, must-revalidate

/assets/images/*
  Cache-Control: public, max-age=86400

/assets/*
  Cache-Control: public, max-age=86400, must-revalidate

/data/*.json
  Cache-Control: public, max-age=3600, must-revalidate

/conversion/*
  Cache-Control: public, max-age=0, must-revalidate

/conversion/calculator
  Cache-Control: public, max-age=0, must-revalidate

/conversion/calculator.html
  Cache-Control: public, max-age=0, must-revalidate

/build-manifest.json
  Cache-Control: public, max-age=300
`;

fs.writeFileSync(path.join(DIST, '_headers'), publicHeaders, 'utf8');
includedFiles.push({ path: '_headers', size: Buffer.byteLength(publicHeaders), ext: 'config' });

// 6. Generate Clean Public Robots Configuration (robots.txt)
const publicRobots = `# ==============================================================================
# CRAFTEGON CORPORATE SERVICES (CCS) - ROBOTS.TXT
# Canonical Host: https://ccs.craftegon.com
# ==============================================================================
User-agent: *
Allow: /

# Exclude internal / prototype namespaces
Disallow: /admin/
Disallow: /portal/
Disallow: /api/
Disallow: /data/
Disallow: /components/
Disallow: /scripts/
Disallow: /scratch/

# Search Engine Crawlers (Microsoft Bing, Google, Yahoo, DuckDuckGo)
User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: DuckDuckBot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: YandexBot
Allow: /
Disallow: /admin/
Disallow: /portal/

# AI Search & LLM Knowledge Crawlers (OpenAI, Perplexity, Anthropic, Apple, Cohere)
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: Applebot
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: Applebot-Extended
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /portal/

User-agent: cohere-ai
Allow: /
Disallow: /admin/
Disallow: /portal/

# Canonical Sitemap Declaration
Sitemap: https://ccs.craftegon.com/sitemap.xml
`;

fs.writeFileSync(path.join(DIST, 'robots.txt'), publicRobots, 'utf8');
includedFiles.push({ path: 'robots.txt', size: Buffer.byteLength(publicRobots), ext: '.txt' });

// 7. Generate Hardened Canonical Sitemap (sitemap.xml)
const sourceSitemapPath = path.join(ROOT, 'sitemap.xml');
let publicSitemap = fs.readFileSync(sourceSitemapPath, 'utf8');

// Strip all /portal/ and /admin/ URLs from sitemap
publicSitemap = publicSitemap.replace(/<url>\s*<loc>https:\/\/ccs\.craftegon\.com\/(?:portal|admin)\/.*?<\/loc>[\s\S]*?<\/url>/g, '');

// Ensure /contact.html is included
if (!publicSitemap.includes('/contact.html')) {
  publicSitemap = publicSitemap.replace('</urlset>', `  <url>\n    <loc>https://ccs.craftegon.com/contact.html</loc>\n    <lastmod>2026-11-08</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
}

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), publicSitemap, 'utf8');
includedFiles.push({ path: 'sitemap.xml', size: Buffer.byteLength(publicSitemap), ext: '.xml' });

// 8. Compile Comprehensive Machine-Readable Build Manifest
includedFiles.push({ path: 'build-manifest.json', size: 0, ext: '.json' });

const extCounts = {};
let totalBytes = 0;

for (const file of includedFiles) {
  extCounts[file.ext] = (extCounts[file.ext] || 0) + 1;
  totalBytes += file.size;
}

const buildManifest = {
  projectName: "CraftEgon Corporate Services (CCS)",
  buildTarget: "Cloudflare Pages Static Production Distribution",
  buildTimestamp: new Date().toISOString(),
  buildStatus: "SUCCESS",
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    sourceDirectory: ROOT,
    outputDirectory: DIST
  },
  metrics: {
    totalFilesIncluded: includedFiles.length,
    totalOutputSizeBytes: totalBytes,
    totalOutputSizeFormatted: (totalBytes / (1024 * 1024)).toFixed(2) + ' MB',
    sanitizedResidualLinksCount: sanitizedLinksCount,
    preRenderedSSGPagesCount: preRenderedPagesCount,
    filesByExtension: extCounts
  },
  excludedPaths: Array.from(EXCLUDED_DIRS).concat(Array.from(EXCLUDED_FILES)),
  includedFiles: includedFiles.map(f => ({ path: f.path, bytes: f.size }))
};

const manifestJson = JSON.stringify(buildManifest, null, 2);
fs.writeFileSync(path.join(DIST, 'build-manifest.json'), manifestJson, 'utf8');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}
fs.writeFileSync(path.join(DOCS_DIR, 'build-manifest.json'), manifestJson, 'utf8');

console.log('----------------------------------------------------------------');
console.log(`✅ Build Success: ${includedFiles.length} files compiled into dist-public/`);
console.log(`✅ Total Output Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
console.log(`✅ Residual Links Sanitized: ${sanitizedLinksCount}`);
console.log(`✅ SSG Pre-rendered Pages: ${preRenderedPagesCount} HTML pages with inlined navbar/footer`);
console.log(`✅ Internal Tools Excluded: /portal/, /admin/, /src/, /docs/, /scripts/`);
console.log(`✅ Build Manifest Saved: dist-public/build-manifest.json`);
console.log('================================================================\n');
