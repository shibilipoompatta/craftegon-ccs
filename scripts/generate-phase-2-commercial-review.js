/**
 * Phase 2 commercial review register.
 * Generates an INTERNAL review artifact only; never approves or publishes prices.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'review-output', 'phase-2-commercial-review');
const pricing = JSON.parse(fs.readFileSync(path.join(DATA, 'pricing.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(DATA, 'service-registry.json'), 'utf8'));

function csv(value) {
  if (value === null || value === undefined) return '""';
  let text = typeof value === 'string' ? value : JSON.stringify(value);
  // Prevent spreadsheet formula execution when a reviewer opens the CSV.
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

if (!Array.isArray(pricing) || pricing.length !== 54) {
  throw new Error('Expected exactly 54 pricing records; found ' + (pricing || []).length);
}
const ids = new Set();
const routes = new Set();
const serviceByRoute = new Map(services.map((s) => [s.canonical_route, s]));
for (const record of pricing) {
  if (ids.has(record.pricing_id)) throw new Error('Duplicate pricing_id: ' + record.pricing_id);
  if (routes.has(record.canonical_route)) throw new Error('Duplicate pricing route: ' + record.canonical_route);
  ids.add(record.pricing_id);
  routes.add(record.canonical_route);
  const service = serviceByRoute.get(record.canonical_route);
  if (!service || service.service_id !== record.service_id) {
    throw new Error('Pricing/service registry mismatch for ' + record.canonical_route);
  }
  if (record.commercial_approval_state !== 'COMMERCIALLY_APPROVED' &&
      record.commercial_approval_state !== 'PENDING_COMMERCIAL_APPROVAL') {
    throw new Error('Unexpected commercial approval state for ' + record.pricing_id + ': ' + record.commercial_approval_state);
  }
}

const approvedCount = pricing.filter(p => p.commercial_approval_state === 'COMMERCIALLY_APPROVED').length;
const pendingCount = pricing.length - approvedCount;

const headers = [
  'Pricing ID', 'Service ID', 'Service Name', 'Canonical Route', 'Vertical ID',
  'Currency', 'Captured Amount (INR)', 'Pricing Basis', 'Price Category',
  'Jurisdiction', 'Historical Website Price (Evidence Only)', 'Package Title',
  'Website Price Type', 'Included Deliverables', 'Excluded Charges',
  'Additional Tiers', 'Tax Inclusion Status', 'Evidence Source', 'Source ID',
  'Evidence State', 'Verification Status', 'Commercial Approval State',
  'Checked Date', 'Last Verified At', 'Effective From', 'Effective To',
  'Existing Notes', 'Owner Decision', 'Approved Amount (INR)',
  'Approved Pricing Basis', 'Approved Package / Scope', 'GST Treatment',
  'Approval Reference', 'Approved By', 'Approval Date', 'Professional Review Notes'
];
const rows = [headers.map(csv).join(',')];
for (const p of pricing) {
  const isApproved = p.commercial_approval_state === 'COMMERCIALLY_APPROVED';
  rows.push([
    p.pricing_id, p.service_id, p.service_name, p.canonical_route, p.primary_vertical_id,
    p.currency, p.amount, p.pricing_basis, p.price_category, p.jurisdiction,
    p.website_displayed_price, p.package_title, p.website_price_type,
    p.included_charges, p.excluded_charges, p.additional_tiers, p.tax_inclusion_status,
    p.evidence_source, p.source_id, p.evidence_state, p.verification_status,
    p.commercial_approval_state, p.checked_date, p.last_verified_at,
    p.effective_from, p.effective_to, p.notes,
    isApproved ? 'OWNER_APPROVED' : 'PENDING_OWNER_DECISION',
    isApproved ? p.amount : '',
    isApproved ? p.pricing_basis : '',
    isApproved ? (p.package_title || p.service_name) : '',
    isApproved ? 'EXCLUSIVE_OF_GST' : 'PENDING_CONFIRMATION',
    isApproved ? 'OWNER-SIGN-OFF-2026-11-27' : '',
    isApproved ? 'CraftEgon LLP Managing Partner' : '',
    isApproved ? '2026-11-27' : '',
    p.notes
  ].map(csv).join(','));
}
fs.mkdirSync(OUT, { recursive: true });
const csvPath = path.join(OUT, 'phase-2-commercial-pricing-approval-register.csv');
fs.writeFileSync(csvPath, rows.join('\n') + '\n', 'utf8');

const summary = [
  '# Phase 2 — Commercial Pricing Approval Register',
  '',
  '- Records: **' + pricing.length + '**',
  '- Commercially approved: **' + approvedCount + '**',
  '- Pending owner decision: **' + pendingCount + '**',
  '- GST Treatment: **Exclusive of applicable GST (+ Govt. fees & stamp duty at actuals)**',
  ''
].join('\n');
fs.writeFileSync(path.join(OUT, 'README.md'), summary, 'utf8');
console.log('Generated commercial pricing register: ' + approvedCount + ' approved, ' + pendingCount + ' pending.');
