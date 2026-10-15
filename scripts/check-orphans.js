/**
 * ==========================================================================
 * CRAFTEGON CCS - ORPHAN & UNLINKED CONTENT DETECTION SUITE
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
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

findHtml(root);

const allContent = htmlFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const orphans = [];
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (rel === 'index.html' || rel.startsWith('components/')) continue;
  
  const target1 = '/' + rel;
  const target2 = rel;

  if (!allContent.includes(target1) && !allContent.includes(target2)) {
    orphans.push(rel);
  }
}

console.log(`\n=== ORPHAN PAGE REPORT ===`);
console.log(`Total checked files: ${htmlFiles.length}`);
console.log(`Orphan pages detected: ${orphans.length}`);

if (orphans.length > 0) {
  console.error(`Orphan list:`, orphans);
  process.exit(1);
} else {
  console.log(`STATUS: PASS (0 orphan pages detected)\n`);
}
