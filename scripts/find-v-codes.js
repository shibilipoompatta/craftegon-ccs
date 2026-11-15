const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    if (['.git', 'node_modules', 'dist-public', 'admin', 'portal', 'scratch', 'docs'].includes(f)) return;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(getFiles(p));
    else if (f.endsWith('.html')) res.push(p);
  });
  return res;
}

const files = getFiles('.');
const matches = [];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  // Look for text nodes or badges containing V01, V02, V1, V2, Vertical
  const m = c.match(/\bV\d{1,2}(?:-SVC)?\b/gi) || c.match(/vertical\s*\d+/gi);
  if (m) {
    // filter out things like 'view' or valid words
    const unique = [...new Set(m)].slice(0, 5);
    matches.push({ file: f, matches: unique });
  }
});
console.log(`Total files with 'V1/V01/Vertical': ${matches.length}`);
matches.forEach(m => console.log(m.file, m.matches));
