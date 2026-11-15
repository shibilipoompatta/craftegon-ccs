const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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

const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  '.vault',
  '.vscode',
  '.system_generated',
  'node_modules',
  'portal',
  'admin',
  'src',
  'docs',
  'scripts',
  'scratch',
  'review-output',
  'dist-public',
  'components'
]);

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (EXCLUDED_DIRS.has(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getHtmlFiles(ROOT);
console.log(`Discovered ${files.length} public HTML files to process.`);

let updatedCount = 0;
let skippedCount = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace empty navbar container
  if (/<div\s+id=["'](?:global-navbar|global-header)["']\s*>\s*<\/div>/i.test(content)) {
    content = content.replace(/<div\s+id=["'](?:global-navbar|global-header)["']\s*>\s*<\/div>/gi, () => {
      return `<div id="global-navbar">\n${ssgNavbar}\n</div>`;
    });
    modified = true;
  }

  // Replace empty footer container
  if (/<div\s+id=["']global-footer["']\s*>\s*<\/div>/i.test(content)) {
    content = content.replace(/<div\s+id=["']global-footer["']\s*>\s*<\/div>/gi, () => {
      return `<div id="global-footer">\n${ssgFooter}\n</div>`;
    });
    modified = true;
  }

  // Ensure <main> has id="main-content" for a11y skip-link
  if (!content.includes('id="main-content"') && !content.includes("id='main-content'")) {
    if (/<main(\b[^>]*)>/i.test(content)) {
      content = content.replace(/<main(\b[^>]*)>/i, (m, attrs) => `<main id="main-content"${attrs}>`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`Pre-rendering complete:`);
console.log(`  Updated: ${updatedCount} pages`);
console.log(`  Already pre-rendered: ${skippedCount} pages`);
