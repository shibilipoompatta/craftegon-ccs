const cards = require('./pricing_card_inventory.json').filter(c => c.priceText !== 'NONE');
cards.forEach((c, i) => {
  console.log(`${i+1}. [${c.service_id}] ${c.canonical_route} | Title: '${c.packageTitle}' | Price: '${c.priceText}'`);
});
