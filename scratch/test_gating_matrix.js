function isApprovedForClientFacing(record) {
  if (!record || typeof record !== 'object') return false;
  if (record.verification_status !== 'VERIFIED') return false;
  if (!record.last_verified_at || typeof record.last_verified_at !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.last_verified_at)) return false;
  if (!record.source_id || typeof record.source_id !== 'string') return false;
  
  // Pricing specific checks
  if (record.pricing_id) {
    if (record.commercial_approval_state !== 'COMMERCIALLY_APPROVED') return false;
    if (record.amount === null || typeof record.amount !== 'number' || record.amount <= 0) return false;
  }
  
  // Regulatory claim specific checks
  if (record.claim_id) {
    if (record.professional_review_outcome !== 'APPROVED') return false;
    if (record.disposition === 'CORRECTED' || record.disposition === 'FALSE_POSITIVE' || record.disposition === 'NEEDS_EXTERNAL_VERIFICATION') return false;
  }
  
  return true;
}

const unapprovedStatuses = [
  'UNVERIFIED',
  'UNREVIEWED',
  'SOURCE_NEEDED',
  'SOURCE_IDENTIFIED',
  'PENDING_PROFESSIONAL_REVIEW',
  'PENDING_REVIEW',
  'REJECTED_OR_OUTDATED',
  'REJECTED',
  'UNKNOWN_STATUS',
  null,
  undefined
];

let allUnapprovedPass = true;
for (const st of unapprovedStatuses) {
  const mock = {
    verification_status: st,
    last_verified_at: '2026-10-17',
    source_id: 'SRC-TEST-001',
    commercial_approval_state: 'COMMERCIALLY_APPROVED',
    amount: 5000,
    professional_review_outcome: 'APPROVED',
    disposition: 'ACCEPTABLE_WITH_EVIDENCE'
  };
  if (isApprovedForClientFacing(mock) !== false) {
    console.error(`FAILED: status '${st}' should evaluate to false`);
    allUnapprovedPass = false;
  }
}

console.log('All unapproved statuses evaluated to false?', allUnapprovedPass);

// Sub-cases for VERIFIED:
const verifiedTestCases = [
  { name: 'Missing last_verified_at (null)', record: { verification_status: 'VERIFIED', last_verified_at: null, source_id: 'SRC-001' }, expected: false },
  { name: 'Malformed last_verified_at', record: { verification_status: 'VERIFIED', last_verified_at: 'invalid-date', source_id: 'SRC-001' }, expected: false },
  { name: 'Missing source_id (null)', record: { verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: null }, expected: false },
  { name: 'Pricing with PENDING_APPROVAL', record: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'PENDING_APPROVAL', amount: 5000 }, expected: false },
  { name: 'Pricing with null amount', record: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: null }, expected: false },
  { name: 'Pricing with zero amount', record: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: 0 }, expected: false },
  { name: 'Pricing fully approved', record: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: 5000 }, expected: true },
  { name: 'Claim with PENDING review outcome', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'PENDING', disposition: 'ACCEPTABLE_WITH_EVIDENCE' }, expected: false },
  { name: 'Claim with REJECTED review outcome', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'REJECTED', disposition: 'ACCEPTABLE_WITH_EVIDENCE' }, expected: false },
  { name: 'Claim with CORRECTED disposition', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'CORRECTED' }, expected: false },
  { name: 'Claim with FALSE_POSITIVE disposition', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'FALSE_POSITIVE' }, expected: false },
  { name: 'Claim with NEEDS_EXTERNAL_VERIFICATION', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'NEEDS_EXTERNAL_VERIFICATION' }, expected: false },
  { name: 'Claim fully approved', record: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'ACCEPTABLE_WITH_EVIDENCE' }, expected: true },
  { name: 'Eligibility fully approved', record: { eligibility_id: 'ELG-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001' }, expected: true },
  { name: 'Variation fully approved', record: { variation_id: 'VAR-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001' }, expected: true }
];

let allVerifiedCasesPass = true;
for (const tc of verifiedTestCases) {
  const actual = isApprovedForClientFacing(tc.record);
  if (actual !== tc.expected) {
    console.error(`FAILED: ${tc.name} expected ${tc.expected} but got ${actual}`);
    allVerifiedCasesPass = false;
  }
}
console.log('All verified test cases evaluated as expected?', allVerifiedCasesPass);
