/**
 * ==========================================================================
 * CRAFTEGON CCS - ORPHAN & UNLINKED CONTENT DETECTION SUITE
 * ==========================================================================
 * Route-aware orphan page detector.
 * Extracts explicit href attributes, normalizes relative/absolute URLs,
 * accounts for query strings/fragments, and uses exact route matching.
 * Directory index documents (e.g., services/index.html) require exact directory
 * or configured _redirects rewrite links, preventing sibling-page false positives.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

/**
 * Extracts raw href values from HTML content.
 * Only matches actual href attribute values (single- or double-quoted).
 * Arbitrary text, comments, and JavaScript variables are not extracted as links.
 */
function extractHrefs(htmlContent) {
  const hrefs = [];
  const regex = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    const val = (match[1] !== undefined ? match[1] : match[2]) || '';
    hrefs.push(val.trim());
  }
  return hrefs;
}

/**
 * Normalizes an internal href into a canonical relative route target.
 * Strips query strings (?...) and hash fragments (#...).
 * Normalizes relative paths against the source file's directory.
 * Ignores external schemes (http:, https:, mailto:, tel:, javascript:, #).
 */
function normalizeHref(href, sourceFileRel) {
  if (!href) return null;

  // External or non-navigational protocols
  if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) {
    // Strip site origin if absolute internal link
    if (href.startsWith('https://ccs.craftegon.com') || href.startsWith('http://ccs.craftegon.com')) {
      href = href.replace(/^https?:\/\/ccs\.craftegon\.com/i, '');
      if (!href) href = '/';
    } else {
      return null;
    }
  }

  // Strip query parameters and hash fragments
  const cleanHref = href.split(/[?#]/)[0].trim();
  if (!cleanHref) return null;

  // Absolute internal URL (/services, /services/, /services.html)
  if (cleanHref.startsWith('/')) {
    return cleanHref.replace(/^\/+/, '');
  }

  // Relative internal URL (e.g., ../services, ./pvt-ltd-registration.html)
  const sourceDir = path.posix.dirname(sourceFileRel);
  const resolved = path.posix.normalize(path.posix.join(sourceDir === '.' ? '' : sourceDir, cleanHref));
  return resolved.replace(/^\/+/, '');
}

/**
 * Loads route rewrite mappings from _redirects (Status 200).
 * Configured route mappings allow clean URLs (e.g., /services or /services.html)
 * to resolve to their destination index files (e.g., services/index.html).
 */
function loadRedirectRewrites(redirectsPath) {
  const rewrites = new Map();
  if (!fs.existsSync(redirectsPath)) return rewrites;

  const content = fs.readFileSync(redirectsPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3 && parts[2] === '200') {
      const fromPath = parts[0].replace(/^\/+/, '');
      const toPath = parts[1].replace(/^\/+/, '');
      rewrites.set(fromPath, toPath);
      if (fromPath.endsWith('/')) {
        rewrites.set(fromPath.slice(0, -1), toPath);
      }
    }
  }
  return rewrites;
}

/**
 * Finds orphan HTML files given a file map and redirect rewrites.
 * filesMap: Map<relPath, htmlContent>
 */
function findOrphans(filesMap, redirectRewrites = new Map()) {
  const linkedTargets = new Set();

  for (const [rel, content] of filesMap.entries()) {
    const hrefs = extractHrefs(content);
    for (const h of hrefs) {
      const norm = normalizeHref(h, rel);
      if (norm) {
        linkedTargets.add(norm);

        // Configured route mapping from _redirects
        if (redirectRewrites.has(norm)) {
          linkedTargets.add(redirectRewrites.get(norm));
        }
        if (norm.endsWith('/')) {
          const withoutSlash = norm.slice(0, -1);
          if (redirectRewrites.has(withoutSlash)) {
            linkedTargets.add(redirectRewrites.get(withoutSlash));
          }
        }
      }
    }
  }

  const orphans = [];
  for (const rel of filesMap.keys()) {
    if (rel === 'index.html' || rel.startsWith('components/')) continue;

    let isLinked = false;

    // 1. Direct file link
    if (linkedTargets.has(rel)) {
      isLinked = true;
    }
    // 2. Directory index documents (e.g., services/index.html)
    else if (rel.endsWith('/index.html')) {
      const dir = rel.slice(0, -('/index.html'.length));
      // Reachable ONLY if an href targets the exact directory (with or without slash)
      // or the explicit index.html path
      if (linkedTargets.has(dir) || linkedTargets.has(dir + '/') || linkedTargets.has(rel)) {
        isLinked = true;
      }
    }

    if (!isLinked) {
      orphans.push(rel);
    }
  }

  return orphans.sort();
}

function checkRepositoryOrphans(repoRoot = root) {
  const htmlFiles = [];
  function findHtml(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        if (item !== 'node_modules' && item !== '.git') findHtml(full);
      } else if (item.endsWith('.html')) {
        htmlFiles.push(full);
      }
    }
  }
  findHtml(repoRoot);

  const filesMap = new Map();
  for (const f of htmlFiles) {
    const rel = path.relative(repoRoot, f).replace(/\\/g, '/');
    filesMap.set(rel, fs.readFileSync(f, 'utf8'));
  }

  const rewrites = loadRedirectRewrites(path.join(repoRoot, '_redirects'));
  const orphans = findOrphans(filesMap, rewrites);

  console.log(`\n=== ORPHAN PAGE REPORT ===`);
  console.log(`Total checked files: ${filesMap.size}`);
  console.log(`Orphan pages detected: ${orphans.length}`);

  if (orphans.length > 0) {
    console.error(`Orphan list:`, orphans);
    return { success: false, orphans, total: filesMap.size };
  } else {
    console.log(`STATUS: PASS (0 orphan pages detected)\n`);
    return { success: true, orphans: [], total: filesMap.size };
  }
}

if (require.main === module) {
  const result = checkRepositoryOrphans();
  if (!result.success) {
    process.exit(1);
  }
}

module.exports = {
  extractHrefs,
  normalizeHref,
  loadRedirectRewrites,
  findOrphans,
  checkRepositoryOrphans
};
