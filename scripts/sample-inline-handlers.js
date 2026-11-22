const fs = require('fs');

const sampleFiles = [
  'conversion/calculator.html',
  'portal/dashboard.html',
  'search/index.html',
  'services/trademark-registration.html',
  'index.html'
];

sampleFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  console.log(`\n=== ${f} ===`);
  let count = 0;
  lines.forEach((line, idx) => {
    const match = line.match(/\b(onclick|onload|onerror|onmouseover|onchange|onsubmit)=["'][^"']*["']/i);
    if (match && count < 5) {
      count++;
      console.log(`  Line ${idx + 1}: ${match[0]} -> ${line.trim().substring(0, 80)}`);
    }
  });
});
