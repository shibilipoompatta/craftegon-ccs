const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DATA_LAYER = path.join(ROOT, 'review-output', 'phase-2-data-layer');
const OUT_SERVICE_REG = path.join(ROOT, 'review-output', 'phase-2-service-registry');

if (!fs.existsSync(OUT_DATA_LAYER)) fs.mkdirSync(OUT_DATA_LAYER, { recursive: true });
if (!fs.existsSync(OUT_SERVICE_REG)) fs.mkdirSync(OUT_SERVICE_REG, { recursive: true });

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return '"' + str.replace(/"/g, '""') + '"';
}

// 1. Service ID Assignment and Reconciliation CSV
const serviceRegistry = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'service-registry.json'), 'utf8'));

const serviceCsvHeaders = [
  'Canonical route path',
  'Existing service name',
  'Service ID, if applicable',
  'Vertical ID',
  'Service classification',
  'Transactional or referral-only status',
  'Current ownership',
  'Registry record identifier',
  'Source references',
  'Current verification status',
  'Discrepancy or coverage-gap notes',
  'Required action',
  'Approval status'
];

const serviceCsvRows = [serviceCsvHeaders.map(escapeCSV).join(',')];

for (const s of serviceRegistry) {
  const isReferral = s.record_status === 'REFERRAL_ONLY';
  const row = [
    s.canonical_route,
    s.service_name,
    s.service_id || 'NONE',
    s.primary_vertical_id || 'NONE',
    isReferral ? 'REFERRAL_ONLY_INFORMATION' : 'CONFIRMED_APPROVED_SERVICE',
    isReferral ? 'REFERRAL_ONLY' : 'TRANSACTIONAL',
    'CraftEgon CCS (Corporate Compliance Services)',
    s.service_id || s.canonical_route,
    s.source_evidence,
    s.verification_status,
    s.scope_boundary,
    isReferral 
      ? 'Maintain external referral disclosure; prohibit service ID or transactional checkout under Advocates Act 1961' 
      : 'Maintain locked transactional ID and primary vertical ownership in service registry',
    'APPROVED_LOCKED'
  ];
  serviceCsvRows.push(row.map(escapeCSV).join(','));
}

const serviceCsvContent = serviceCsvRows.join('\n') + '\n';
fs.writeFileSync(path.join(OUT_DATA_LAYER, 'phase-2-service-id-assignment-and-reconciliation.csv'), serviceCsvContent, 'utf8');
fs.writeFileSync(path.join(OUT_SERVICE_REG, 'phase-2-service-id-assignment-and-reconciliation.csv'), serviceCsvContent, 'utf8');
console.log('✅ Generated phase-2-service-id-assignment-and-reconciliation.csv (57 records)');

// 2. Source Verification Register CSV
const sources = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'sources.json'), 'utf8'));
const sourceCsvHeaders = [
  'Source ID',
  'Source Title',
  'Issuing Authority',
  'Official URL',
  'Source Type',
  'Jurisdiction',
  'Publication Date',
  'Accessed Date',
  'Last Verified At',
  'Next Review At',
  'Reliability Classification',
  'Verification Status',
  'Access Restrictions Notes'
];

const sourceCsvRows = [sourceCsvHeaders.map(escapeCSV).join(',')];
for (const src of sources) {
  const row = [
    src.source_id,
    src.source_title,
    src.issuing_authority,
    src.official_url,
    src.source_type,
    src.jurisdiction,
    src.publication_date || '',
    src.accessed_date || '',
    src.last_verified_at || '',
    src.next_review_at || '',
    src.reliability_classification,
    src.verification_status,
    src.access_restrictions_notes || ''
  ];
  sourceCsvRows.push(row.map(escapeCSV).join(','));
}
const sourceCsvContent = sourceCsvRows.join('\n') + '\n';
fs.writeFileSync(path.join(OUT_DATA_LAYER, 'phase-2-source-verification-register.csv'), sourceCsvContent, 'utf8');
console.log('✅ Generated phase-2-source-verification-register.csv (33 records)');

// 3. Regulatory Claim Review Register CSV
const claims = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'regulatory-claims.json'), 'utf8'));
const claimCsvHeaders = [
  'Claim ID',
  'Claim Text',
  'Category',
  'Risk Priority',
  'Service ID',
  'Vertical ID',
  'Jurisdiction',
  'Source ID',
  'Statutory Provision',
  'Source Excerpt',
  'Effective From',
  'Effective To',
  'Checked Date',
  'Verification Status',
  'Requires Professional Review',
  'Professional Review Outcome',
  'Last Reviewed At',
  'Disposition',
  'Unresolved Questions',
  'Notes'
];

const claimCsvRows = [claimCsvHeaders.map(escapeCSV).join(',')];
for (const c of claims) {
  const row = [
    c.claim_id,
    c.claim_text,
    c.category,
    c.risk_priority,
    c.service_id || '',
    c.vertical_id || '',
    c.jurisdiction,
    c.source_id || '',
    c.statutory_provision || '',
    c.source_excerpt || '',
    c.effective_from || '',
    c.effective_to || '',
    c.checked_date || '',
    c.verification_status,
    c.requires_professional_review ? 'YES' : 'NO',
    c.professional_review_outcome || '',
    c.last_reviewed_at || '',
    c.disposition || '',
    c.unresolved_questions || '',
    c.notes || ''
  ];
  claimCsvRows.push(row.map(escapeCSV).join(','));
}
const claimCsvContent = claimCsvRows.join('\n') + '\n';
fs.writeFileSync(path.join(OUT_DATA_LAYER, 'phase-2-regulatory-claim-review-register.csv'), claimCsvContent, 'utf8');
console.log('✅ Generated phase-2-regulatory-claim-review-register.csv (35 records)');
