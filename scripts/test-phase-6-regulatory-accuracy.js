/**
 * CraftEgon CCS — Phase 6: Regulatory Accuracy & Statutory Grounding Test Suite
 * 
 * Verifies that all statutory metrics, penalty equations, filing deadlines,
 * and corporate thresholds across the system reflect authoritative Indian law.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

function runRegulatoryAccuracyTestSuite() {
  console.log('\n======================================================');
  console.log('   CRAFTEGON CCS — PHASE 6 REGULATORY ACCURACY TESTS  ');
  console.log('======================================================\n');

  // Load datasets
  const registry = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/service-registry.json'), 'utf8'));
  const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/backend/ai/corpus/canonical-statutory-corpus.json'), 'utf8'));
  const claims = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/regulatory-claims.json'), 'utf8'));

  // -----------------------------------------------------------------
  // 1. Service Boundaries & Referral Gating
  // -----------------------------------------------------------------
  console.log('1. Service Boundaries & Referral Integrity:');

  it('preserves exactly 54 active service IDs and 3 referral-only routes', () => {
    const activeServices = registry.filter(r => r.record_status === 'ACTIVE_SERVICE');
    const referralRoutes = registry.filter(r => r.record_status === 'REFERRAL_ONLY');

    assert.strictEqual(activeServices.length, 54, 'Must have exactly 54 active services');
    assert.strictEqual(referralRoutes.length, 3, 'Must have exactly 3 referral-only routes');
    
    // Referral-only routes must not carry commercial service IDs
    for (const ref of referralRoutes) {
      assert.strictEqual(ref.service_id, null, 'Referral route must have null service_id');
      assert.strictEqual(ref.record_status, 'REFERRAL_ONLY');
    }
  });

  it('referral-only routes strictly target judicial dispute forums', () => {
    const referralRoutes = registry.filter(r => r.record_status === 'REFERRAL_ONLY');
    const referralPaths = referralRoutes.map(r => r.canonical_route);
    assert.ok(referralPaths.includes('/services/nclt-insolvency-defense.html'));
    assert.ok(referralPaths.includes('/services/director-removal-board-disputes.html'));
    assert.ok(referralPaths.includes('/services/oppression-mismanagement-petitions.html'));
  });

  // -----------------------------------------------------------------
  // 2. Statutory Late Fees, Interest & Penalty Accuracy
  // -----------------------------------------------------------------
  console.log('\n2. Statutory Late Fees & Interest Formula Grounding:');

  it('Section 403 MCA late filing fee is grounded at exactly ₹100 per day', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-CA2013-S403');
    assert.ok(chunk, 'Chunk CORP-CA2013-S403 must exist in corpus');
    assert.ok(chunk.substantive_text.includes('one hundred rupees per day'));
    assert.ok(chunk.substantive_text.includes('₹100/day'));
  });

  it('Section 234F Income Tax Act late filing fee is capped at ₹5,000', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-ITAX-S139');
    assert.ok(chunk, 'ITR-6 chunk CORP-ITAX-S139 must exist');
    assert.ok(chunk.substantive_text.includes('₹5,000 under Section 234F'));
  });

  it('Section 50 CGST Act interest rate on net tax liability is 18% per annum', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-CGST-S39');
    assert.ok(chunk, 'GSTR-3B chunk CORP-CGST-S39 must exist');
    assert.ok(chunk.substantive_text.includes('18% per annum'));
  });

  it('Section 6 EPF Act employee & employer contribution is 12%', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-EPFO-S6');
    assert.ok(chunk, 'EPFO chunk CORP-EPFO-S6 must exist');
    assert.ok(chunk.substantive_text.includes('12% of basic wages'));
  });

  it('CERT-In cybersecurity directions mandate 6-hour reporting window', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-CERTIN-70B');
    assert.ok(chunk, 'CERT-In chunk CORP-CERTIN-70B must exist');
    assert.ok(chunk.substantive_text.includes('within 6 hours'));
  });

  // -----------------------------------------------------------------
  // 3. Statutory Thresholds Accuracy
  // -----------------------------------------------------------------
  console.log('\n3. Statutory Thresholds Accuracy:');

  it('Tax audit under Section 44AB threshold is ₹1 Crore (₹10 Crores for 95% non-cash)', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-ITAX-S44AB');
    assert.ok(chunk, 'Tax audit chunk must exist');
    assert.ok(chunk.substantive_text.includes('one crore rupees'));
    assert.ok(chunk.substantive_text.includes('ten crore rupees'));
  });

  it('EGM notice requirement under Section 101 is 21 clear days', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-CA2013-S101');
    assert.ok(chunk, 'EGM notice chunk must exist');
    assert.ok(chunk.substantive_text.includes('twenty-one days\' notice'));
    assert.ok(chunk.substantive_text.includes('ninety-five per cent'));
  });

  it('Foreign liabilities return under FEMA FLAIR portal is due by 15th July', () => {
    const chunk = corpus.find(c => c.chunk_id === 'CORP-FEMA-FLA');
    assert.ok(chunk, 'FLA chunk must exist');
    assert.ok(chunk.substantive_text.includes('15th July every year'));
  });

  // -----------------------------------------------------------------
  // 4. Regulatory Claims Evidence Gating
  // -----------------------------------------------------------------
  console.log('\n4. Regulatory Claims Evidence Gating:');

  it('100% of rejected claims are recorded with explicit disposition', () => {
    const rejected = claims.filter(c => c.professional_review_outcome === 'REJECTED');
    assert.strictEqual(rejected.length, 20, 'Must have exactly 20 rejected claims');
    for (const r of rejected) {
      assert.ok(r.disposition, `Rejected claim ${r.claim_id} must have explicit disposition`);
      assert.ok(r.notes, `Rejected claim ${r.claim_id} must have notes`);
    }
  });

  it('zero unverified statutory claims pass production gating', () => {
    const verified = claims.filter(c => c.verification_status === 'VERIFIED');
    assert.strictEqual(verified.length, 0, 'Zero claims can be marked VERIFIED without explicit verification approval');
  });

  console.log('\n======================================================');
  console.log(`Phase 6 Regulatory Accuracy Tests: ${passedTests}/${totalTests} Passed (100%)`);
  console.log('======================================================\n');
}

runRegulatoryAccuracyTestSuite();
