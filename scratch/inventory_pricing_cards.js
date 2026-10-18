const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const servicesDir = path.join(__dirname, '..', 'services');
const serviceRegistryPath = path.join(__dirname, '..', 'data', 'service-registry.json');
const registry = JSON.parse(fs.readFileSync(serviceRegistryPath, 'utf8'));

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.html'));

const pricingInventory = [];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const canonical_route = `/services/${file}`;
  const regEntry = registry.find(r => r.canonical_route === canonical_route);

  // Find pricing cards or pricing sections
  // On CraftEgon CCS, pricing sections usually have class "if-pricing-card" or similar
  const pricingCards = doc.querySelectorAll('.if-pricing-card, .pricing-card');
  
  if (pricingCards.length > 0) {
    pricingCards.forEach((card, idx) => {
      const titleEl = card.querySelector('.if-pricing-title, .pricing-title, h3, h4');
      const priceEl = card.querySelector('.if-pricing-price, .pricing-price');
      const descEl = card.querySelector('.if-pricing-desc, .pricing-desc');
      const features = Array.from(card.querySelectorAll('ul li, .if-pricing-features li')).map(li => li.textContent.trim());

      const priceText = priceEl ? priceEl.textContent.trim().replace(/\s+/g, ' ') : '';
      const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
      const desc = descEl ? descEl.textContent.trim().replace(/\s+/g, ' ') : '';

      pricingInventory.push({
        file,
        canonical_route,
        service_id: regEntry ? regEntry.service_id : null,
        service_name: regEntry ? regEntry.service_name : null,
        record_status: regEntry ? regEntry.record_status : 'UNKNOWN',
        primary_vertical_id: regEntry ? regEntry.primary_vertical_id : null,
        cardIndex: idx,
        packageTitle: title,
        priceText: priceText,
        description: desc,
        features: features
      });
    });
  } else {
    // Check if there is any other pricing section
    pricingInventory.push({
      file,
      canonical_route,
      service_id: regEntry ? regEntry.service_id : null,
      service_name: regEntry ? regEntry.service_name : null,
      record_status: regEntry ? regEntry.record_status : 'UNKNOWN',
      primary_vertical_id: regEntry ? regEntry.primary_vertical_id : null,
      cardIndex: 0,
      packageTitle: 'NONE',
      priceText: 'NONE',
      description: 'No pricing card found on page',
      features: []
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'pricing_card_inventory.json'), JSON.stringify(pricingInventory, null, 2));

console.log(`Total pricing cards found: ${pricingInventory.filter(p => p.priceText !== 'NONE').length}`);
console.log(`Total pages with no pricing card: ${pricingInventory.filter(p => p.priceText === 'NONE').length}`);
