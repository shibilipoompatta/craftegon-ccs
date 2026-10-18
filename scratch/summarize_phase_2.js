const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const datasets = [
  'verticals',
  'sources',
  'service-registry',
  'pricing',
  'eligibility',
  'jurisdiction-variations',
  'regulatory-claims'
];

console.log('=== DATASET INVENTORY SUMMARY ===');
const summary = {};

datasets.forEach(d => {
  const filePath = path.join(dataDir, `${d}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  summary[d] = {
    count: content.length,
    statuses: {}
  };
  content.forEach(item => {
    const st = item.verification_status || item.record_status || 'N/A';
    summary[d].statuses[st] = (summary[d].statuses[st] || 0) + 1;
  });
});

console.log(JSON.stringify(summary, null, 2));

// Check service registry specifics
const services = JSON.parse(fs.readFileSync(path.join(dataDir, 'service-registry.json'), 'utf8'));
const verticals = JSON.parse(fs.readFileSync(path.join(dataDir, 'verticals.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(dataDir, 'sources.json'), 'utf8'));
const pricing = JSON.parse(fs.readFileSync(path.join(dataDir, 'pricing.json'), 'utf8'));
const eligibility = JSON.parse(fs.readFileSync(path.join(dataDir, 'eligibility.json'), 'utf8'));
const variations = JSON.parse(fs.readFileSync(path.join(dataDir, 'jurisdiction-variations.json'), 'utf8'));
const claims = JSON.parse(fs.readFileSync(path.join(dataDir, 'regulatory-claims.json'), 'utf8'));

console.log('\n=== RECONCILIATION STATS ===');
console.log('Verticals count:', verticals.length);
console.log('Sources count:', sources.length);
console.log('Total routes in services:', services.length);
const activeServices = services.filter(s => s.record_status === 'ACTIVE_SERVICE');
const referralRoutes = services.filter(s => s.record_status === 'REFERRAL_ONLY');
console.log('Active services count:', activeServices.length);
console.log('Referral-only routes count:', referralRoutes.length);
console.log('Unique active service IDs:', new Set(activeServices.map(s => s.service_id)).size);

// Check primary vertical assignment
const verticalSet = new Set(verticals.map(v => v.vertical_id));
const invalidVerticals = activeServices.filter(s => !verticalSet.has(s.primary_vertical_id));
console.log('Active services with invalid primary vertical:', invalidVerticals.length);

// Referral routes with service ID or vertical
const dirtyReferral = referralRoutes.filter(s => s.service_id !== null || s.primary_vertical_id !== null);
console.log('Referral routes with service ID or vertical:', dirtyReferral.length);

// Pricing coverage
const pricingServiceIds = new Set(pricing.map(p => p.service_id));
const activeWithoutPricing = activeServices.filter(s => !pricingServiceIds.has(s.service_id));
console.log('Active services without pricing:', activeWithoutPricing.length);
console.log('Pricing records verified:', pricing.filter(p => p.verification_status === 'VERIFIED').length);

// Eligibility coverage
const eligibilityServiceIds = new Set(eligibility.map(e => e.service_id));
const activeWithoutEligibility = activeServices.filter(s => !eligibilityServiceIds.has(s.service_id));
console.log('Active services without eligibility:', activeWithoutEligibility.length);
console.log('Eligibility records verified:', eligibility.filter(e => e.verification_status === 'VERIFIED').length);

// Variations verified
console.log('Variations records verified:', variations.filter(v => v.verification_status === 'VERIFIED').length);

// Claims verified
console.log('Claims records verified:', claims.filter(c => c.verification_status === 'VERIFIED').length);
console.log('Claims review outcomes:', claims.reduce((acc, c) => {
  acc[c.professional_review_outcome] = (acc[c.professional_review_outcome] || 0) + 1;
  return acc;
}, {}));
