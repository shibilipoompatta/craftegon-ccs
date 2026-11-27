const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const run = spawnSync(process.execPath, [path.join(__dirname, 'generate-phase-2-commercial-review.js')], {
  cwd: root, encoding: 'utf8'
});
assert.strictEqual(run.status, 0, run.stderr || run.stdout);
const out = path.join(root, 'review-output', 'phase-2-commercial-review');
const csvPath = path.join(out, 'phase-2-commercial-pricing-approval-register.csv');
assert.ok(fs.existsSync(csvPath), 'pricing approval CSV generated');
const lines = fs.readFileSync(csvPath, 'utf8').trimEnd().split(/\r?\n/);
assert.strictEqual(lines.length, 55, 'header plus 54 pricing rows');
assert.ok(lines[0].includes('Owner Decision'));
assert.ok(lines[0].includes('Approved Amount (INR)'));
assert.ok(lines.slice(1).every(line => line.includes('OWNER_APPROVED') && line.includes('EXCLUSIVE_OF_GST')), 'all 54 pricing records reflect owner commercial approval and GST exclusivity');
assert.ok(fs.readFileSync(path.join(out, 'README.md'), 'utf8').includes('Commercially approved: **54**'));
console.log('PASS: Phase 2 pricing review register — 54 owner-approved records synced with GST exclusion.');
