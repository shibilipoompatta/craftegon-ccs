const fs = require('fs');
const path = require('path');
const inventory = require('./pricing_card_inventory.json');

console.log(`Total entries: ${inventory.length}`);

// Group by service_id / canonical_route
const byService = {};
inventory.forEach(item => {
  const key = item.service_id || item.canonical_route;
  if (!byService[key]) byService[key] = [];
  byService[key].push(item);
});

console.log(`Unique services/routes: ${Object.keys(byService).length}`);

// Inspect multi-card services
console.log('\n--- Multi-Card Services ---');
Object.entries(byService).forEach(([key, cards]) => {
  if (cards.length > 1) {
    console.log(`Service: ${key} (${cards[0].canonical_route}) has ${cards.length} cards:`);
    cards.forEach((c, idx) => {
      console.log(`  Tier ${idx + 1}: Title="${c.packageTitle}", Price="${c.priceText}", Features=${c.features.length}`);
      console.log(`     Features: ${c.features.join(' | ')}`);
    });
  }
});

// Inspect services with no price or custom quote
console.log('\n--- Services with No Numeric Price or Custom Quote ---');
Object.entries(byService).forEach(([key, cards]) => {
  cards.forEach(c => {
    if (c.priceText === 'NONE' || !c.priceText.includes('₹')) {
      console.log(`Service: ${key} (${c.canonical_route}): Title="${c.packageTitle}", Price="${c.priceText}"`);
    }
  });
});
