const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'scratch' && f !== 'review-output') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

const forms = [];

walkDir('.', (filePath) => {
  if (!filePath.endsWith('.html') && !filePath.endsWith('.js')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // match forms in HTML
  if (filePath.endsWith('.html')) {
    const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
    let match;
    while ((match = formRegex.exec(content)) !== null) {
      const attrs = match[1];
      const body = match[2];
      
      const idMatch = attrs.match(/id="([^"]+)"/i);
      const classMatch = attrs.match(/class="([^"]+)"/i);
      const actionMatch = attrs.match(/action="([^"]+)"/i);
      const methodMatch = attrs.match(/method="([^"]+)"/i);
      const endpointMatch = attrs.match(/data-endpoint="([^"]+)"/i);
      
      const inputMatches = body.match(/<input\b[^>]*name="([^"]+)"/gi) || [];
      const inputs = inputMatches.map(m => {
        const n = m.match(/name="([^"]+)"/i);
        return n ? n[1] : '';
      });
      
      forms.push({
        file: filePath.replace(/\\/g, '/'),
        id: idMatch ? idMatch[1] : 'N/A',
        class: classMatch ? classMatch[1] : 'N/A',
        action: actionMatch ? actionMatch[1] : 'N/A',
        method: methodMatch ? methodMatch[1] : 'N/A',
        endpoint: endpointMatch ? endpointMatch[1] : 'NONE',
        inputs: inputs
      });
    }
  }
  
  // Check js files for inline form generation
  if (filePath.endsWith('chat-widget.js')) {
    if (content.includes('cchat-form')) {
      forms.push({
        file: filePath.replace(/\\/g, '/'),
        id: 'cchat-form',
        class: 'cchat-form',
        action: 'N/A',
        method: 'N/A',
        endpoint: 'NONE',
        inputs: ['cchat-input']
      });
    }
  }
});

console.log('Total forms discovered:', forms.length);
console.log(JSON.stringify(forms, null, 2));
