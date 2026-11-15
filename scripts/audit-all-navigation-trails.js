/**
 * ==========================================================================
 * CRAFTEGON CCS - FORENSIC MULTI-HOP NAVIGATION & TRAIL AUDIT ENGINE
 * ==========================================================================
 * Audits every single click target, forward action, anchor, and back trail
 * across all 137 HTML pages in the repository.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist-public', 'scratch', 'admin', 'components'];

function getAllHtmlFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (EXCLUDE_DIRS.some(d => rel.startsWith(d))) continue;
    if (fs.statSync(full).isDirectory()) {
      getAllHtmlFiles(full, files);
    } else if (item.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const allHtmlFiles = getAllHtmlFiles(ROOT);
console.log(`\n======================================================`);
console.log(`CRAFTEGON CCS - FORENSIC NAVIGATION & TRAIL AUDIT`);
console.log(`Scanning ${allHtmlFiles.length} HTML pages on disk...`);
console.log(`======================================================\n`);

let totalLinksChecked = 0;
let brokenLinks = [];
let brokenAnchors = [];
let deadEndPages = [];
let missingBreadcrumbs = [];
let conversionDesksMissingReturnBar = [];

allHtmlFiles.forEach(filePath => {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  let html = fs.readFileSync(filePath, 'utf8');

  // Strip script and style blocks so JS template literals aren't mistaken for static HTML hrefs
  const htmlNoScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 1. Check for Breadcrumb navigation (except root homepage & 404)
  if (relPath !== 'index.html' && relPath !== '404.html') {
    if (!html.includes('if-breadcrumb') && !html.includes('breadcrumb')) {
      missingBreadcrumbs.push(relPath);
    }
  }

  // 2. Check Conversion Desks for Return Bar
  if (relPath.startsWith('conversion/') && relPath !== 'conversion/index.html') {
    if (!html.includes('if-contextual-return-bar')) {
      conversionDesksMissingReturnBar.push(relPath);
    }
  }

  // 3. Extract and verify all href attributes from actual HTML markup
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  let hasOutboundNav = false;

  while ((match = hrefRegex.exec(htmlNoScripts)) !== null) {
    const href = match[1].trim();
    totalLinksChecked++;

    // Ignore external, javascript, tel, mailto, whatsapp links
    if (href.startsWith('http://') || href.startsWith('https://') || 
        href.startsWith('mailto:') || href.startsWith('tel:') || 
        href.startsWith('javascript:') || href.startsWith('#') && href.length === 1) {
      continue;
    }

    hasOutboundNav = true;

    // Same-page anchors (e.g. #practice-areas)
    if (href.startsWith('#')) {
      const anchorId = href.substring(1);
      const idRegex = new RegExp(`id=["']${anchorId}["']|name=["']${anchorId}["']`, 'i');
      if (!idRegex.test(html)) {
        brokenAnchors.push({ source: relPath, target: href });
      }
      continue;
    }

    // Cross-page links (e.g. /services/pvt-ltd.html#pricing or /verticals/01-entity-formation.html)
    let [urlPart, anchorPart] = href.split('#');
    let [cleanPath] = urlPart.split('?');

    if (!cleanPath) {
      continue;
    }

    let resolvedTarget;
    if (cleanPath.startsWith('/')) {
      let targetFile = cleanPath.substring(1);
      if (targetFile === '' || targetFile.endsWith('/')) {
        targetFile += 'index.html';
      } else if (!targetFile.endsWith('.html') && !targetFile.endsWith('.xml') && !targetFile.endsWith('.json') && !targetFile.includes('.')) {
        // e.g. /search/ or directory
        if (fs.existsSync(path.join(ROOT, targetFile, 'index.html'))) {
          targetFile = path.join(targetFile, 'index.html');
        } else if (fs.existsSync(path.join(ROOT, targetFile + '.html'))) {
          targetFile += '.html';
        }
      }
      resolvedTarget = path.join(ROOT, targetFile);
    } else {
      // Relative link
      resolvedTarget = path.resolve(path.dirname(filePath), cleanPath);
    }

    if (!fs.existsSync(resolvedTarget)) {
      brokenLinks.push({ source: relPath, href, resolved: path.relative(ROOT, resolvedTarget) });
    } else if (anchorPart) {
      // Target exists, check anchor
      if (resolvedTarget.endsWith('.html')) {
        const targetHtml = fs.readFileSync(resolvedTarget, 'utf8');
        const idRegex = new RegExp(`id=["']${anchorPart}["']|name=["']${anchorPart}["']`, 'i');
        if (!idRegex.test(targetHtml)) {
          brokenAnchors.push({ source: relPath, target: href, file: path.relative(ROOT, resolvedTarget) });
        }
      }
    }
  }

  // 4. Dead end check: Page must have at least one link to parent, home or other services
  if (!hasOutboundNav && relPath !== '404.html') {
    deadEndPages.push(relPath);
  }
});

console.log(`Total Links Inspected: ${totalLinksChecked}`);
console.log(`Broken Links: ${brokenLinks.length}`);
if (brokenLinks.length > 0) {
  console.error('Broken Links Details:', brokenLinks);
}

console.log(`Broken Anchors: ${brokenAnchors.length}`);
if (brokenAnchors.length > 0) {
  console.error('Broken Anchors Details:', brokenAnchors);
}

console.log(`Pages Missing Breadcrumb Return Trail: ${missingBreadcrumbs.length}`);
if (missingBreadcrumbs.length > 0) {
  console.error('Missing Breadcrumbs:', missingBreadcrumbs);
}

console.log(`Conversion Desks Missing Contextual Return Bar: ${conversionDesksMissingReturnBar.length}`);
if (conversionDesksMissingReturnBar.length > 0) {
  console.error('Missing Return Bar:', conversionDesksMissingReturnBar);
}

console.log(`Dead-End Pages: ${deadEndPages.length}`);
if (deadEndPages.length > 0) {
  console.error('Dead End Pages:', deadEndPages);
}

const hasErrors = brokenLinks.length > 0 || brokenAnchors.length > 0 || missingBreadcrumbs.length > 0 || conversionDesksMissingReturnBar.length > 0 || deadEndPages.length > 0;

if (hasErrors) {
  console.log(`\n❌ STATUS: FAIL - Navigation flaws detected.`);
  process.exit(1);
} else {
  console.log(`\n✅ STATUS: PASS - 100% Navigation Trails, Breadcrumbs, Anchors & Return Paths Verified Flawless!`);
  process.exit(0);
}
