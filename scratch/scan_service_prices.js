const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const servicesDir = path.join(__dirname, '..', 'services');
const serviceRegistryPath = path.join(__dirname, '..', 'data', 'service-registry.json');
const registry = JSON.parse(fs.readFileSync(serviceRegistryPath, 'utf8'));

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.html'));

console.log(`Found ${files.length} html files in services/`);

const results = [];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const doc = dom.window.document;
  const route = `/services/${file}`;

  const regEntry = registry.find(r => r.route === route);

  // Search for currency symbols / numbers in text
  const text = doc.body ? doc.body.textContent : content;
  
  // Find specific price elements or sections (pricing card, hero price, fee tags, etc.)
  const priceMatches = [];
  
  // Look for elements with class/id containing price, fee, cost
  const priceElements = doc.querySelectorAll('[class*="price"], [class*="fee"], [class*="cost"], [id*="price"], [id*="fee"]');
  priceElements.forEach(el => {
    const t = el.textContent.trim().replace(/\s+/g, ' ');
    if (t && (t.includes('₹') || t.includes('Rs') || /\b\d{1,3}(,\d{3})+/.test(t) || /\b\d{3,6}\b/.test(t))) {
      priceMatches.push({ type: 'element', selector: el.tagName + (el.className ? '.' + el.className : ''), text: t });
    }
  });

  // Regex scan in entire document for ₹...
  const rupeeRegex = /₹\s*[\d,]+(?:\s*(?:Lakhs?|Crores?|Cr|L|\/-|\/month|\/yr|\/year|\+))?/gi;
  let match;
  const rawMatches = [];
  while ((match = rupeeRegex.exec(content)) !== null) {
    // get surrounding snippet
    const start = Math.max(0, match.index - 50);
    const end = Math.min(content.length, match.index + match[0].length + 50);
    const snippet = content.substring(start, end).replace(/\s+/g, ' ').trim();
    rawMatches.push({ match: match[0], snippet });
  }

  results.push({
    file,
    route,
    service_id: regEntry ? regEntry.service_id : null,
    service_name: regEntry ? regEntry.service_name : null,
    status: regEntry ? regEntry.status : 'UNREGISTERED',
    elementMatches: priceMatches,
    rawMatches: rawMatches
  });
});

fs.writeFileSync(path.join(__dirname, 'scanned_prices.json'), JSON.stringify(results, null, 2));
console.log('Saved scan to scratch/scanned_prices.json');

// Summarize
let withRupee = 0;
let withoutRupee = 0;
results.forEach(r => {
  if (r.rawMatches.length > 0) {
    withRupee++;
    console.log(`[PRICE FOUND] ${r.service_id || 'NO-ID'} (${r.route}): ${r.rawMatches.map(m => m.match).join(', ')}`);
  } else {
    withoutRupee++;
  }
});
console.log(`\nSummary: ${withRupee} files with ₹, ${withoutRupee} files without ₹.`);
