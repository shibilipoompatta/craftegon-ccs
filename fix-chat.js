const fs = require('fs');
const file = 'C:\\Users\\shibi\\OneDrive\\Desktop\\craftegon-ccs\\assets\\js\\chat-widget.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\u2019/g, "'");
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed U+2019 characters');