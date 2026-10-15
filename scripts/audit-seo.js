/**
 * ==========================================================================
 * CRAFTEGON CCS - TECHNICAL SEO & STRUCTURED METADATA AUDIT SUITE
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getFiles(dir, exts = ['.html']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === '.git' || file === 'node_modules') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const htmlFiles = getFiles(rootDir, ['.html']);
const canonicals = {};
let missingCanonicals = [];
let missingTitles = [];
let missingDescriptions = [];
let missingSchemas = [];
let ogTags = { missingTitle: 0, missingDesc: 0, missingImage: 0 };

htmlFiles.forEach(f => {
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  if (rel.startsWith('components/')) return;

  const content = fs.readFileSync(f, 'utf8');

  // Canonical
  const cm = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (cm) {
    try {
      const u = new URL(cm[1]);
      canonicals[u.origin] = (canonicals[u.origin] || 0) + 1;
    } catch(e) {
      canonicals[cm[1]] = (canonicals[cm[1]] || 0) + 1;
    }
  } else {
    missingCanonicals.push(rel);
  }

  // Title
  const tm = content.match(/<title>([^<]*)<\/title>/i);
  if (!tm || !tm[1].trim()) missingTitles.push(rel);

  // Description
  const dm = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (!dm || !dm[1].trim()) missingDescriptions.push(rel);

  // Schema
  if (!content.includes('application/ld+json')) missingSchemas.push(rel);

  // OG
  if (!content.match(/<meta\s+property=["']og:title["']/i)) ogTags.missingTitle++;
  if (!content.match(/<meta\s+property=["']og:description["']/i)) ogTags.missingDesc++;
  if (!content.match(/<meta\s+property=["']og:image["']/i)) ogTags.missingImage++;
});

console.log(`\n=== TECHNICAL SEO AUDIT REPORT ===`);
console.log(`Total content HTML files evaluated: ${htmlFiles.length - 2}`);
console.log(`Canonical Origins:`, canonicals);
console.log(`Missing Canonicals: ${missingCanonicals.length}`);
console.log(`Missing Titles: ${missingTitles.length}`);
console.log(`Missing Descriptions: ${missingDescriptions.length}`);
console.log(`Missing JSON-LD Schemas: ${missingSchemas.length}`);
console.log(`OG Tag Gaps:`, ogTags);

const totalErrors = missingCanonicals.length + missingTitles.length + missingDescriptions.length + missingSchemas.length + ogTags.missingTitle + ogTags.missingDesc + ogTags.missingImage;

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log(`STATUS: PASS (100% technical SEO compliance)\n`);
}
