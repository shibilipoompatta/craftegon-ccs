const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const run = spawnSync(process.execPath, [path.join(__dirname, 'generate-phase-2-service-packages.js')], {
  cwd: root, encoding: 'utf8'
});
assert.strictEqual(run.status, 0, run.stderr || run.stdout);
const out = path.join(root, 'review-output', 'phase-2-service-packages');
const csvPath = path.join(out, 'phase-2-service-package-standardisation.csv');
assert.ok(fs.existsSync(csvPath), 'service package review CSV generated');
const lines = fs.readFileSync(csvPath, 'utf8').trimEnd().split(/\r?\n/);
assert.strictEqual(lines.length, 55, 'header plus 54 active services');
assert.ok(lines[0].includes('Approved Deliverables'));
assert.ok(lines[0].includes('Government / Statutory Disbursements'));
assert.ok(lines[0].includes('GST Treatment'));
assert.ok(lines[0].includes('Professional Review Required'));
assert.ok(lines.slice(1).every(line => line.includes('PENDING_OWNER_REVIEW')), 'all package decisions remain pending');
const readme = fs.readFileSync(path.join(out, 'README.md'), 'utf8');
assert.ok(readme.includes('Package decisions approved by this register: **0**'));
assert.ok(readme.includes('Historical amounts are not current quotations'));
assert.ok(readme.includes('reserved professional functions'));
console.log('PASS: Phase 2 service package register — 54 mapped services; no package or price approval inferred.');
