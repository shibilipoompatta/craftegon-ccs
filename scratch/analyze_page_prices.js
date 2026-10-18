const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const servicesDir = path.join(__dirname, '..', 'services');
const serviceRegistryPath = path.join(__dirname, '..', 'data', 'service-registry.json');
const registry = JSON.parse(fs.readFileSync(serviceRegistryPath, 'utf8'));

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.html'));

const detailedResults = [];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const doc = dom.window.document;
  const canonical_route = `/services/${file}`;

  const regEntry = registry.find(r => r.canonical_route === canonical_route);

  // Look for pricing cards or containers
  const cards = [];
  const cardElements = doc.querySelectorAll('.pricing-card, .price-card, [class*="pricing"], [class*="tier"], .card, .package');
  
  // Specific searches for price patterns in text nodes
  const priceMatches = [];
  const walker = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */, null, false);
  let node;
  while ((node = walker.nextNode())) {
    const val = node.nodeValue.trim();
    if (val.includes('₹')) {
      const parent = node.parentElement;
      const context = parent ? parent.textContent.trim().replace(/\s+/g, ' ') : val;
      priceMatches.push({
        text: val,
        context: context.substring(0, 150),
        tagName: parent ? parent.tagName : 'TEXT',
        className: parent ? parent.className : ''
      });
    }
  }

  detailedResults.push({
    file,
    canonical_route,
    service_id: regEntry ? regEntry.service_id : null,
    service_name: regEntry ? regEntry.service_name : null,
    record_status: regEntry ? regEntry.record_status : 'UNKNOWN',
    primary_vertical_id: regEntry ? regEntry.primary_vertical_id : null,
    priceMatches
  });
});

fs.writeFileSync(path.join(__dirname, 'detailed_scanned_prices.json'), JSON.stringify(detailedResults, null, 2));

console.log('=== DETAILED PRICE SCAN ===\n');
detailedResults.forEach(r => {
  console.log(`[${r.record_status}] ${r.service_id || 'REFERRAL'} | ${r.canonical_route} | ${r.service_name}`);
  if (r.priceMatches.length === 0) {
    console.log('   ⚠️ NO PRICE DISPLAYED ON PAGE');
  } else {
    r.priceMatches.forEach(p => {
      console.log(`   💰 Found: "${p.text}" in <${p.tagName} class="${p.className}"> -> "${p.context}"`);
    });
  }
});
