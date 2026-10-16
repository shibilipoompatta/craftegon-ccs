const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getFiles(dir, exts = ['.html', '.xml', '.txt']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === '.git' || file === 'node_modules' || file === 'scratch' || file === 'review-output') return;
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

const files = getFiles(rootDir);
let count = 0;
let filesUpdated = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('https://craftegon.com')) {
    count++;
    // Replace https://craftegon.com with https://ccs.craftegon.com
    const updated = content.replace(/https:\/\/craftegon\.com/g, 'https://ccs.craftegon.com');
    fs.writeFileSync(file, updated, 'utf8');
    filesUpdated.push(path.relative(rootDir, file));
  }
});

console.log(`Reconciled canonical host in ${count} files.`);
