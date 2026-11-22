const assert = require('assert');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'internal', 'phase-2-five-service-package-pilot.json');
const pilot = JSON.parse(fs.readFileSync(file, 'utf8'));
const expected = ['V01-SVC-001', 'V01-SVC-002', 'V01-SVC-003', 'V01-SVC-007', 'V06-SVC-003'];
assert.strictEqual(pilot.classification, 'INTERNAL / DRAFT / NOT APPROVED FOR PUBLICATION');
assert.deepStrictEqual(pilot.services.map(s => s.service_id).sort(), expected.slice().sort());
assert.ok(pilot.services.every(s => s.commercial_approval_state === 'PENDING_COMMERCIAL_APPROVAL'));
assert.ok(pilot.services.every(s => s.gst_treatment === 'UNCONFIRMED'));
assert.ok(pilot.services.every(s => s.turnaround_sla === 'NOT_APPROVED'));
assert.ok(pilot.services.every(s => s.professional_review === 'REQUIRED_BEFORE_APPROVAL'));
assert.ok(pilot.services.every(s => s.approval.owner === null && s.approval.date === null));
assert.ok(pilot.services.every(s => s.eligibility_verification_status === 'SOURCE_IDENTIFIED'));
assert.ok(!JSON.stringify(pilot).includes('₹'), 'pilot must not include historical prices');
assert.ok(!pilot.services.some(s => Object.prototype.hasOwnProperty.call(s, 'amount')), 'pilot must not include price amounts');
assert.ok(pilot.global_guardrails.some(s => s.includes('No public website')));
console.log('PASS: Five-service package pilot — 5 internal drafts, no prices or approvals inferred.');
