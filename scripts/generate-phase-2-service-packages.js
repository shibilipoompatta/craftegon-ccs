/**
 * Phase 2 service package standardisation register.
 * Internal review artifact only. Existing website copy is evidence, not an approved promise.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'review-output', 'phase-2-service-packages');
const services = JSON.parse(fs.readFileSync(path.join(DATA, 'service-registry.json'), 'utf8'));
const pricing = JSON.parse(fs.readFileSync(path.join(DATA, 'pricing.json'), 'utf8'));

function csv(value) {
  if (value === null || value === undefined) return '""';
  let text = typeof value === 'string' ? value : JSON.stringify(value);
  // Prevent spreadsheet formula execution when the register is opened.
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

const active = services.filter((s) => s.record_status === 'ACTIVE_SERVICE');
if (active.length !== 54) {
  throw new Error('Expected 54 active services; found ' + active.length);
}
if (pricing.length !== 54) {
  throw new Error('Expected 54 pricing evidence records; found ' + pricing.length);
}
const pricingByService = new Map();
for (const p of pricing) {
  if (pricingByService.has(p.service_id)) throw new Error('Duplicate pricing service_id: ' + p.service_id);
  pricingByService.set(p.service_id, p);
}
const seen = new Set();
for (const s of active) {
  if (!s.service_id || seen.has(s.service_id)) throw new Error('Missing or duplicate active service_id: ' + s.service_id);
  seen.add(s.service_id);
  const p = pricingByService.get(s.service_id);
  if (!p || p.canonical_route !== s.canonical_route) {
    throw new Error('Pricing/service registry mismatch for ' + s.service_id);
  }
  if (p.commercial_approval_state !== 'PENDING_COMMERCIAL_APPROVAL' ||
      p.verification_status !== 'UNVERIFIED') {
    throw new Error('Unexpected pricing approval state for ' + s.service_id);
  }
}
if (pricingByService.size !== active.length) throw new Error('Pricing records do not map one-to-one to active services');

const headers = [
  'Service ID', 'Canonical Service Name', 'Pricing Record Service Name (Evidence Only)', 'Canonical Route', 'Vertical ID',
  'Existing Package Label (Evidence Only)', 'Historical Website Deliverables (Evidence Only)',
  'Historical Website Exclusions (Evidence Only)', 'Historical Pricing Basis (Evidence Only)',
  'Historical Fee Amount (INR; Not Approved)', 'Historical Website Price Wording (Evidence Only)',
  'Current Tax Inclusion Status (Unconfirmed Unless Explicit)', 'Existing Scope Notes',
  'Owner Package Decision', 'Approved Package Name', 'Approved Service Outcome',
  'Approved Deliverables', 'Deliverable Format / Evidence', 'Eligibility Criteria',
  'Client Inputs / Documents Required', 'Assumptions / Dependencies',
  'Express Exclusions', 'Government / Statutory Disbursements',
  'Professional Fee Basis', 'GST Treatment', 'Turnaround / SLA',
  'Revision / Rework Limits', 'Post-Filing / Ongoing Support',
  'Escalation / Exception Handling', 'Professional Review Required',
  'Approving Owner', 'Approval Reference', 'Approval Date', 'Review Notes'
];
const rows = [headers.map(csv).join(',')];
for (const s of active) {
  const p = pricingByService.get(s.service_id);
  rows.push([
    s.service_id, s.service_name, p.service_name, s.canonical_route, s.primary_vertical_id,
    p.package_title, p.included_charges, p.excluded_charges, p.pricing_basis,
    p.amount, p.website_displayed_price, p.tax_inclusion_status, s.scope_boundary,
    'PENDING_OWNER_REVIEW', '', '', '', '', '', '', '', '', '',
    'PENDING_COMMERCIAL_APPROVAL', 'PENDING_CONFIRMATION', '', '', '',
    '', 'PENDING_PROFESSIONAL_REVIEW', '', '', '', ''
  ].map(csv).join(','));
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'phase-2-service-package-standardisation.csv'), rows.join('\n') + '\n', 'utf8');

const readme = [
  '# Phase 2 — Service Package Standardisation Register',
  '',
  '- Active services in scope: **' + active.length + '**',
  '- Pricing evidence records mapped: **' + pricingByService.size + '**',
  '- Package decisions approved by this register: **0**',
  '- Default package review state: **PENDING_OWNER_REVIEW**',
  '- Pricing approval state remains: **PENDING_COMMERCIAL_APPROVAL** for every mapped record.',
  '',
  '## Purpose',
  'This is an INTERNAL owner-review worksheet. It standardises the information required to define a service package; it does not approve or publish any package, price, legal deliverable, tax position, or service-level commitment.',
  '',
  '## Evidence handling',
  '- Existing package labels, website wording, included/excluded items and amounts are copied as historical evidence only.',
  '- Historical amounts are not current quotations, approved fees, or permission to charge.',
  '- Blank approval fields are intentionally blank. Do not infer approval from website copy or from inclusion in this register.',
  '- Do not populate statutory filing fees, stamp duty, penalties, GST, or third-party charges without current authoritative evidence and owner approval.',
  '',
  '## Required owner decisions for each service',
  '1. Define the customer outcome and exact deliverable(s), including the final document, filing acknowledgement, certificate, report, or advisory output where applicable.',
  '2. Define eligibility, entity/jurisdiction boundaries, client inputs, assumptions, dependencies and the point at which work may start.',
  '3. Separate professional services from government fees, stamp duty, statutory penalties, taxes and third-party disbursements.',
  '4. Confirm professional fee basis and GST treatment independently; never assume that “all inclusive” resolves the tax question without verification.',
  '5. Set realistic turnaround, revision limits, post-filing support, exclusions and exception/escalation handling.',
  '6. Obtain qualified professional review for regulated, legal, tax, audit, certification, representation or statutory sign-off activities. Do not imply that CCS itself performs reserved professional functions unless the responsible qualified professional and delivery model are confirmed.',
  '7. Record named owner, approval reference and date before any package is marked approved or exposed publicly.',
  '',
  '## Status vocabulary',
  '- PENDING_OWNER_REVIEW: commercial owner has not approved the package definition.',
  '- PENDING_PROFESSIONAL_REVIEW: regulated/professional scope needs review by the appropriately qualified professional.',
  '- APPROVED_INTERNAL: owner and required professional approvals are recorded; this is not by itself approval to publish a price.',
  '- APPROVED_FOR_PUBLICATION: separate explicit approval for public-facing wording and any price is recorded.',
  '',
  '## Public website rule',
  'No public page, quote, checkout, advertisement or structured data should rely on this worksheet until the relevant service package and any price have passed their separate approval gates.',
  ''
].join('\n');
fs.writeFileSync(path.join(OUT, 'README.md'), readme, 'utf8');
console.log('Generated internal service package review register: ' + active.length + ' services; all package decisions remain pending.');
