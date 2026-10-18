const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const datasetNames = [
  'verticals',
  'sources',
  'service-registry',
  'pricing',
  'eligibility',
  'jurisdiction-variations',
  'regulatory-claims'
];

const loadedData = {};
datasetNames.forEach(dName => {
  loadedData[dName] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${dName}.json`), 'utf8'));
});

const dataLayerMap = {
  verticals: loadedData['verticals'],
  sources: loadedData['sources'],
  services: loadedData['service-registry'],
  pricing: loadedData['pricing'],
  eligibility: loadedData['eligibility'],
  variations: loadedData['jurisdiction-variations'],
  claims: loadedData['regulatory-claims']
};

console.log('Testing eligibility service mapping:');
const serviceMap = new Map();
dataLayerMap.services.forEach(s => {
  if (s.record_status === 'ACTIVE_SERVICE' && s.service_id) {
    serviceMap.set(s.service_id, s);
  }
});

let missingEligibility = 0;
serviceMap.forEach((svc, svcId) => {
  if (!dataLayerMap.eligibility.some(e => e.service_id === svcId)) {
    console.log(`Missing eligibility for ${svcId}`);
    missingEligibility++;
  }
});
console.log(`Total missing eligibility records: ${missingEligibility}`);

console.log('Checking duplicate vertical IDs:');
const vIds = new Set();
let dupV = 0;
dataLayerMap.verticals.forEach(v => {
  if (vIds.has(v.vertical_id)) dupV++;
  vIds.add(v.vertical_id);
});
console.log(`Duplicate verticals: ${dupV}`);

console.log('Checking duplicate source IDs:');
const sIds = new Set();
let dupS = 0;
dataLayerMap.sources.forEach(s => {
  if (sIds.has(s.source_id)) dupS++;
  sIds.add(s.source_id);
});
console.log(`Duplicate sources: ${dupS}`);
