const fs = require('fs');
const r = require('../docs/comprehensive-fault-audit-1000.json');
const meds = r.filter(f => f.severity === 'Medium');

console.log('Total Medium faults:', meds.length);

const subCats = {};
meds.forEach(f => {
  subCats[f.subcategory] = (subCats[f.subcategory] || 0) + 1;
});
console.log('Subcategories:', subCats);

console.log('\n--- Unhandled JSON Parsing Exception (13) ---');
meds.filter(f => f.subcategory === 'Unhandled JSON Parsing Exception').forEach(f => {
  console.log(`  ${f.file}:${f.line} -> ${f.fault}`);
});

console.log('\n--- Accessibility / SEO / CSP Medium Faults ---');
meds.filter(f => !['Inline Scripting Event Handler', 'Unhandled JSON Parsing Exception'].includes(f.subcategory)).forEach(f => {
  console.log(`  [${f.subcategory}] ${f.file}:${f.line} -> ${f.fault}`);
});

console.log('\n--- Inline Scripting Event Handler (192) - Top files ---');
const inlineFiles = {};
meds.filter(f => f.subcategory === 'Inline Scripting Event Handler').forEach(f => {
  inlineFiles[f.file] = (inlineFiles[f.file] || 0) + 1;
});
Object.entries(inlineFiles).sort((a,b)=>b[1]-a[1]).slice(0, 15).forEach(([f,c]) => {
  console.log(`  ${f}: ${c}`);
});
