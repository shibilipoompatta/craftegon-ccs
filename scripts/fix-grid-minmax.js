const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.vault', 'dist', 'dist-public', 'scratch'].includes(file)) {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(ROOT);
let totalReplacements = 0;
let modifiedFiles = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace minmax(300px/320px/340px/350px, 1fr) with minmax(min(100%, 280px), 1fr)
  content = content.replace(/minmax\(\s*(300|320|340|350)px\s*,\s*1fr\s*\)/g, (match) => {
    totalReplacements++;
    return 'minmax(min(100%, 280px), 1fr)';
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${path.relative(ROOT, file)}`);
  }
});

console.log(`\nSuccessfully replaced ${totalReplacements} rigid minmax occurrences across ${modifiedFiles} HTML files.`);
