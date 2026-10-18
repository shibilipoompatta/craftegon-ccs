const fs = require('fs');
const path = require('path');

const pricing = require('../data/pricing.json');
const registry = require('../data/service-registry.json');
const sources = require('../data/sources.json');

console.log('Total pricing records:', pricing.length);

// Count by pricing category
const byCategory = {};
pricing.forEach(p => {
  byCategory[p.price_category] = (byCategory[p.price_category] || 0) + 1;
});
console.log('By Category:', byCategory);

// Count by verification status
const byStatus = {};
pricing.forEach(p => {
  byStatus[p.verification_status] = (byStatus[p.verification_status] || 0) + 1;
});
console.log('By Verification Status:', byStatus);

// Count by pricing basis
const byBasis = {};
pricing.forEach(p => {
  byBasis[p.pricing_basis] = (byBasis[p.pricing_basis] || 0) + 1;
});
console.log('By Pricing Basis:', byBasis);

// Multi-tier services
const multiTier = pricing.filter(p => p.additional_tiers && p.additional_tiers.length > 0);
console.log(`Multi-tier services: ${multiTier.length}`);

// Custom quote services
const customQuote = pricing.filter(p => p.amount === null);
console.log(`Custom quote services: ${customQuote.length}`);

// Total website prices
let totalWebsitePrices = 0;
pricing.forEach(p => {
  if (p.amount !== null) totalWebsitePrices++;
  if (p.additional_tiers) {
    p.additional_tiers.forEach(t => {
      if (t.amount !== null) totalWebsitePrices++;
    });
  }
});
console.log(`Total website numeric prices counted: ${totalWebsitePrices}`);

// Generate markdown table for all 54 services
let mdRows = [];
pricing.forEach((p, idx) => {
  const tiersCount = (p.additional_tiers ? p.additional_tiers.length : 0) + (p.amount !== null ? 1 : 0);
  const tiersDesc = p.additional_tiers && p.additional_tiers.length > 0 
    ? `Primary: ₹${p.amount.toLocaleString('en-IN')}; Tier 2: ₹${p.additional_tiers[0].amount.toLocaleString('en-IN')} (${p.additional_tiers[0].package_title})`
    : (p.amount !== null ? `₹${p.amount.toLocaleString('en-IN')}` : 'None (Custom Quote)');
  
  const thresholds = (p.statutory_thresholds || []).map(t => `${t.monetary_expression} (${t.threshold_type})`).join('; ') || 'None';
  const penalties = (p.statutory_penalties || []).map(pen => `${pen.monetary_expression} (${pen.penalty_type})`).join('; ') || 'None';

  mdRows.push(`| ${idx + 1} | \`${p.service_id}\` | [${p.service_name}](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs${p.canonical_route}) | \`${p.primary_vertical_id}\` | ${p.website_displayed_price} | ${tiersDesc} | \`${p.pricing_basis}\` | ${thresholds !== 'None' ? thresholds : (penalties !== 'None' ? penalties : '—')} | \`${p.verification_status}\` | \`${p.commercial_approval_state}\` |`);
});

fs.writeFileSync(path.join(__dirname, 'pricing_table_rows.txt'), mdRows.join('\n'));
console.log('Saved table rows to scratch/pricing_table_rows.txt');
