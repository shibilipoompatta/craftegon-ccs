const fs = require('fs');

const variations = JSON.parse(fs.readFileSync('data/jurisdiction-variations.json', 'utf8'));

const variationDetails = {
  'VAR-001': {
    statutory_provision: 'Schedule 1A Article 39 (e-MoA: ₹200) and Article 10 (e-AoA: tiered from ₹1,000 for capital up to ₹1,00,000, scaled upwards per statutory slabs) of Indian Stamp Act, 1899 as applicable to Delhi.',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'MCA V3 portal automatically computes and collects Delhi stamp duty during SPICe+ submission via electronic integration with Stock Holding Corporation of India Ltd (SHCIL).',
    unresolved_questions: ['Qualified legal review required to confirm whether recent state revenue notifications modified the e-AoA slab thresholds for authorized capital above ₹10 Lakhs.'],
    notes: 'Statutory source identified under SRC-STATE-DL-STAMP-1899. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-002': {
    statutory_provision: 'Maharashtra Stamp Act, 1958, Schedule I Article 39(a) (₹200 on e-MoA) and Article 10 (0.2% on nominal share capital for e-AoA, capped at ₹50,00,000 per Maharashtra Act XX of 2015).',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Integrated with MCA V3 portal via Government Receipt Accounting System (GRAS) for electronic challan generation.',
    unresolved_questions: ['Qualified legal review required to confirm whether subsequent Maharashtra finance acts amended the statutory ₹50,00,000 ceiling cap.'],
    notes: 'Statutory source identified under SRC-STATE-MH-STAMP-1958. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-003': {
    statutory_provision: 'Karnataka Stamp Act, 1957, Schedule Article 33 (₹1,000 on e-MoA) and Article 10 (₹1,000 per ₹10,00,000 or part thereof on e-AoA per Karnataka Act 19 of 2014).',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Integrated with MCA V3 portal for electronic stamp duty remittance.',
    unresolved_questions: ['Qualified legal review required to verify local infrastructure cess or municipal surcharge applicability on Karnataka stamp certificates.'],
    notes: 'Statutory source identified under SRC-STATE-KA-STAMP-1957. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-004': {
    statutory_provision: null,
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Practitioners widely execute Delhi LLP agreements on ₹100 non-judicial e-stamp paper under general residual Article 5(c) (Agreement or memorandum of agreement not otherwise provided for). This is an uncodified administrative convenience, not an express statutory provision for LLPs.',
    unresolved_questions: [
      'Whether Delhi revenue authorities or MCA adjudicating officers may treat an LLP agreement as a partnership deed under Article 46 or require ad valorem stamping based on partner contribution.',
      'Judicial or professional clarification is required before advising clients on stamping risks.'
    ],
    notes: 'Preserved strictly as UNREVIEWED with source_id: null. Uncodified administrative practice requiring formal legal review.'
  },
  'VAR-005': {
    statutory_provision: 'Maharashtra Stamp Act, 1958, Schedule I Article 47 Explanation (explicitly governs LLP agreements; prescribed duty scaled from ₹500 for contribution up to ₹50,000, up to ₹5,000 for contribution exceeding ₹10,00,000).',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Unlike Delhi, Maharashtra has codified an express statutory entry for LLP agreements under Article 47.',
    unresolved_questions: ['Qualified legal review required to verify treatment of subsequent capital contribution increases after initial incorporation.'],
    notes: 'Statutory source identified under SRC-STATE-MH-STAMP-1958. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-006': {
    statutory_provision: 'Indian Partnership Act, 1932 Section 58 read with Maharashtra Partnership Rules, 1989 and Maharashtra Stamp Act, 1958 Schedule I Article 47.',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Submission of digital Form A via rof.mahaonline.gov.in portal. Requires scanned notarized deed on ₹500 non-judicial stamp paper.',
    unresolved_questions: ['Certain district RoF offices in Maharashtra occasionally request physical presentation of the notarized deed despite digital portal submission.'],
    notes: 'Statutory source identified under SRC-STATE-MH-ROF-1932. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-007': {
    statutory_provision: 'Indian Partnership Act, 1932 Section 58 read with Karnataka Partnership (Registration of Firms) Rules, 1954.',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Online application initiated via Kaveri portal, followed by mandatory in-person physical presentation of original partnership deed before the District Registrar of Firms.',
    unresolved_questions: ['Operational turnaround times and physical appointment scheduling vary significantly between Bangalore Urban and district jurisdictions.'],
    notes: 'Statutory source identified under SRC-STATE-KA-ROF-1932. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-008': {
    statutory_provision: 'Section 5 of Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975 read with Schedule I.',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Dual registration administered online via mahagst.gov.in: PTRC (employer tax deduction, monthly/annual return) and PTEC (entity annual tax of ₹2,500).',
    unresolved_questions: ['Exemption applicability for women employees earning up to ₹25,000 per month under 2023 budget amendments requires operational tracking.'],
    notes: 'Statutory source identified under SRC-STATE-MH-PT-1975. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-009': {
    statutory_provision: 'Section 5 of Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976 read with Schedule.',
    checked_date: '2026-10-17',
    administrative_practice_notes: 'Administered via e-Prerana portal of Karnataka Commercial Taxes Department. Mandatory registration within 30 days of hiring employees.',
    unresolved_questions: ['Threshold revision for salaried employees under Karnataka Act 14 of 2023 (salary up to ₹25,000 exempt from PT) requires operational verification.'],
    notes: 'Statutory source identified under SRC-STATE-KA-PT-1976. Preserved strictly as SOURCE_IDENTIFIED; not legally verified.'
  },
  'VAR-010': {
    statutory_provision: null,
    checked_date: '2026-10-17',
    administrative_practice_notes: 'No Professional Tax portal or division is operated by the Delhi Department of Trade and Taxes.',
    unresolved_questions: [
      'A definitive statutory exemption CANNOT be inferred solely from legislative silence.',
      'Applicability of municipal trade licensing fees under Section 417 of the Delhi Municipal Corporation Act, 1957 requires qualified municipal law review.',
      'Whether historical local levies apply to specific notified professions or trades.'
    ],
    notes: 'Preserved strictly as PENDING_PROFESSIONAL_REVIEW with source_id: null. Qualified legal review required; definitive exemption must not be asserted to clients.'
  }
};

for (const v of variations) {
  const d = variationDetails[v.variation_id];
  if (d) {
    v.statutory_provision = d.statutory_provision;
    v.checked_date = d.checked_date;
    v.administrative_practice_notes = d.administrative_practice_notes;
    v.unresolved_questions = d.unresolved_questions;
    v.notes = d.notes;
  }
}

fs.writeFileSync('data/jurisdiction-variations.json', JSON.stringify(variations, null, 2) + '\n');
console.log('Successfully updated data/jurisdiction-variations.json with statutory provisions and audit metadata');
