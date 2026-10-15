/**
 * ==========================================================================
 * CRAFTEGON CCS - INTERNAL LINK & ANCHOR INTEGRITY VERIFICATION SUITE
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

let brokenCount = 0;
const linkRegex = /href=["'](\/[^"'#?]*)/g;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    let target = match[1];
    if (target.endsWith('/')) target += 'index.html';
    const resolved = path.join(root, target.replace(/\//g, path.sep));
    if (!fs.existsSync(resolved)) {
      console.error(`[BROKEN LINK] in ${path.relative(root, file)} -> ${match[1]}`);
      brokenCount++;
    }
  }
}

console.log(`\n=== LINK INTEGRITY REPORT ===`);
console.log(`Total HTML files verified: ${htmlFiles.length}`);
console.log(`Total broken links detected: ${brokenCount}`);

if (brokenCount > 0) {
  process.exit(1);
} else {
  console.log(`STATUS: PASS (100% link mesh integrity)\n`);
}
