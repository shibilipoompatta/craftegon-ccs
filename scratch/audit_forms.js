const fs = require('fs');
const path = require('path');

const sensitiveRegex = /name=["'](pan|aadhaar|aadhar|gstin|cin|din|bank_account|passport|account_number|ifsc)["']/i;

function search(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '.git'].includes(e.name)) {
      search(full);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      const c = fs.readFileSync(full, 'utf8');
      const lines = c.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (sensitiveRegex.test(lines[i])) {
          console.log(path.relative('.', full) + ':' + (i + 1) + ': ' + lines[i].trim());
        }
      }
    }
  }
}

search('.');
