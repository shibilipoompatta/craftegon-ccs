const fs = require('fs');
const file = 'C:\\Users\\shibi\\OneDrive\\Desktop\\craftegon-ccs\\assets\\js\\chat-widget.js';
let content = fs.readFileSync(file, 'utf8');
// Fix the HTML entity in the escapeHtml function - replace ' with \'
content = content.replace(/"'":'''/g, '"\'":\'');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed HTML entity in escapeHtml');