const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist-public', 'review-output', '.vault'].includes(file)) {
        results = results.concat(getHtmlFiles(full));
      }
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  });
  return results;
}

const allFiles = getHtmlFiles('.');
const formsSummary = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<form')) return;

  const formRegex = /<form([\s\S]*?)<\/form>/gi;
  let formMatch;
  let formIndex = 0;
  while ((formMatch = formRegex.exec(content)) !== null) {
    formIndex++;
    const formHtml = formMatch[1];
    
    // Extract form id, action, method
    const idMatch = formHtml.match(/id=["']([^"']+)["']/i);
    const formId = idMatch ? idMatch[1] : 'unnamed-form-' + formIndex;
    
    // Extract input/select/textarea names
    const names = [];
    const nameRegex = /name=["']([^"']+)["']/gi;
    let nameMatch;
    while ((nameMatch = nameRegex.exec(formHtml)) !== null) {
      if (!names.includes(nameMatch[1])) names.push(nameMatch[1]);
    }
    
    // Skip navbar search forms
    if (names.length === 1 && (names[0] === 'q' || names[0] === 'query' || names[0] === 'search')) continue;
    
    formsSummary.push({
      file: file.replace(/\\/g, '/'),
      formId,
      fields: names
    });
  }
});

console.log('Total business intake forms found: ' + formsSummary.length);
formsSummary.forEach(f => {
  console.log(`\n[${f.file}] Form: #${f.formId}`);
  console.log(`  Fields (${f.fields.length}): ${f.fields.join(', ')}`);
});
