const fs = require('fs');
const path = require('path');

const claimsPath = path.join(__dirname, '..', 'data', 'regulatory-claims.json');
const schemaPath = path.join(__dirname, '..', 'data', 'schemas', 'regulatory-claims.schema.json');

const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));

// Update checked_date:
// Exactly 13 statutory claims inspected on 2026-10-17 keep "2026-10-17".
// The other 22 internal/rejected/unreviewed claims are set to null.
const inspectedClaimIds = new Set([
  'CLM-013', 'CLM-014', 'CLM-015',
  'CLM-026', 'CLM-027', 'CLM-028', 'CLM-029', 'CLM-030',
  'CLM-031', 'CLM-032', 'CLM-033', 'CLM-034', 'CLM-035'
]);

for (const c of claims) {
  if (inspectedClaimIds.has(c.claim_id)) {
    c.checked_date = '2026-10-17';
  } else {
    c.checked_date = null;
  }
}

// Specific record updates for CLM-026 through CLM-035 to correct overbroad interpretations:

// CLM-026: CERT-In 6-Hour Reporting
const clm026 = claims.find(c => c.claim_id === 'CLM-026');
if (clm026) {
  clm026.statutory_provision = 'Information Technology Act, 2000 Section 70B(6) read with CERT-In Direction No. 20(3)/2022-CERT-In paragraph 5(i) and Annexure-I';
  clm026.source_excerpt = 'Any service provider, intermediary, data centres, body corporate and Government organisations shall mandatorily report cyber incidents specified in Annexure-I to CERT-In within 6 (six) hours of noticing such incidents or being brought to notice about such incidents.';
  clm026.unresolved_questions = "Scope of 'body corporate' applicability across non-IT commercial entities; statutory interpretation of 'noticing' (automated SIEM/cloud alerting vs confirmed incident classification); interaction with DPDP Act s. 8(6) breach notifications; extraterritorial reach to foreign service providers; criminal penalty exposure under s. 70B(7) (imprisonment up to 1 year or fine up to ₹1,00,000 or both).";
  clm026.notes = 'Primary statutory direction verified under Section 70B(6). Scope applies strictly to entities and incident types specified in Annexure-I; do not claim universal application to all corporate clients without qualified tech-law legal counsel review. Retained as PENDING_PROFESSIONAL_REVIEW with zero client-facing legal warranty.';
}

// CLM-027: DPDP Act Personal Data Breach Notification
const clm027 = claims.find(c => c.claim_id === 'CLM-027');
if (clm027) {
  clm027.statutory_provision = 'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) Section 8(6) read with Section 33 and Schedule (Penalties)';
  clm027.source_excerpt = 'In the event of a personal data breach, the Data Fiduciary shall give the Board and each affected Data Principal, intimation of such breach in such form and manner as may be prescribed.';
  clm027.unresolved_questions = 'Central Government rules prescribing form, manner, and timeline under Section 8(6) have not yet been notified; Data Protection Board of India not yet fully operationalized; penalty under Schedule reaches up to ₹200 Crores for breach intimation failure.';
  clm027.notes = 'Primary statutory enactment enacted on 11 August 2023, but procedural implementation rules remain pending notification by MeitY. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-028: Form DIR-3 KYC
const clm028 = claims.find(c => c.claim_id === 'CLM-028');
if (clm028) {
  clm028.statutory_provision = 'Companies (Appointment and Qualification of Directors) Rules, 2014 Rule 12A read with Rule 12B and Companies (Registration Offices and Fees) Rules, 2014';
  clm028.source_excerpt = "Every individual who holds a Director Identification Number (DIN) as on 31st March of a financial year shall submit e-form DIR-3-KYC to the Central Government on or before 30th September of immediate next financial year. Where an individual fails to file before 30th September, the DIN shall be marked 'Deactivated due to non-filing of DIR-3 KYC' and can be reactivated only upon filing with late fee of ₹5,000.";
  clm028.unresolved_questions = 'Web-based KYC (DIR-3 KYC WEB) with OTP authentication applies where director contact credentials have not changed; full e-form with practicing professional certification (DSC) required where details have changed or for initial filings.';
  clm028.notes = 'Statutory deadline of 30 September and ₹5,000 reactivation fee codified in MCA rules. Retained as PENDING_PROFESSIONAL_REVIEW pending formal CS sign-off.';
}

// CLM-029: Form AOC-4
const clm029 = claims.find(c => c.claim_id === 'CLM-029');
if (clm029) {
  clm029.statutory_provision = 'Companies Act, 2013 Section 137(1) read with Companies (Accounts) Rules, 2014 Rule 12 and Section 403';
  clm029.source_excerpt = 'A copy of the financial statements, including consolidated financial statement, if any, along with all the documents which are required to be attached to such financial statements, duly adopted at the annual general meeting of the company, shall be filed with the Registrar within thirty days of the date of annual general meeting in Form AOC-4.';
  clm029.unresolved_questions = 'Statutory requirement to file unadopted statements within 30 days of the due date of AGM where AGM is not held; XBRL applicability thresholds (listed companies, paid-up capital ≥ ₹5 Cr, turnover ≥ ₹100 Cr under XBRL Rules 2015).';
  clm029.notes = 'Section 137(1) mandates 30-day filing post-AGM. Daily late fee under Section 403 (₹100/day) applies upon delay. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-030: Form MGT-7
const clm030 = claims.find(c => c.claim_id === 'CLM-030');
if (clm030) {
  clm030.statutory_provision = 'Companies Act, 2013 Section 92(4) read with Companies (Management and Administration) Rules, 2014 Rule 11';
  clm030.source_excerpt = 'Every company shall file with the Registrar a copy of the annual return, within sixty days from the date on which the annual general meeting is held or where no annual general meeting is held in any year within sixty days from the date on which the annual general meeting should have been held.';
  clm030.unresolved_questions = 'Abridged Form MGT-7A eligibility for small companies and One Person Companies under Rule 11(1) proviso; Section 92(2) professional CS certification thresholds (listed companies, paid-up capital ≥ ₹10 Cr, or turnover ≥ ₹50 Cr).';
  clm030.notes = 'Section 92(4) mandates 60-day filing post-AGM. Form MGT-7A applies for small companies. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-031: GSTR-9C
const clm031 = claims.find(c => c.claim_id === 'CLM-031');
if (clm031) {
  clm031.statutory_provision = 'Central Goods and Services Tax Act, 2017 Section 44 read with Central Goods and Services Tax Rules, 2017 Rule 80(3)';
  clm031.source_excerpt = 'Every registered person, other than an Input Service Distributor, a person paying tax under section 51 or section 52, a casual taxable person and a non-resident taxable person, whose aggregate turnover during a financial year exceeds five crore rupees, shall also furnish a self-certified reconciliation statement as specified under section 44 in FORM GSTR-9C along with the annual return.';
  clm031.unresolved_questions = 'Self-certification regime introduced by Finance Act 2021 replacing CA/CMA audit certification; computation of aggregate turnover across multi-state GSTINs linked to common PAN; specific statutory exemptions (ISDs, government departments audited by C&AG).';
  clm031.notes = 'Statutory turnover threshold of ₹5 Crores for self-certified GSTR-9C under Section 44 cleanly separated from commercial pricing. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-032: Secretarial Audit
const clm032 = claims.find(c => c.claim_id === 'CLM-032');
if (clm032) {
  clm032.statutory_provision = 'Companies Act, 2013 Section 204(1) read with Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014 Rule 9';
  clm032.source_excerpt = "Every public company having a paid-up share capital of fifty crore rupees or more, or every public company having a turnover of two hundred fifty crore rupees or more, or every company having outstanding loans or borrowings from banks or public financial institutions of one hundred crore rupees or more shall annex with its Board's report a secretarial audit report, given by a company secretary in practice, in Form MR-3.";
  clm032.unresolved_questions = 'Statutory threshold distinction: paid-up capital (≥ ₹50 Cr) and turnover (≥ ₹250 Cr) apply exclusively to public companies, whereas outstanding borrowing threshold (≥ ₹100 Cr) applies to every company (including private companies); status of private companies that are subsidiaries of public companies under Section 2(71).';
  clm032.notes = 'Codified statutory threshold for Form MR-3 secretarial audit. Requires practicing CS certification. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-033: RBI FLA Return
const clm033 = claims.find(c => c.claim_id === 'CLM-033');
if (clm033) {
  clm033.statutory_provision = 'Foreign Exchange Management (Transfer or Issue of Any Foreign Security) Regulations read with RBI A.P. (DIR Series) Circular No. 22 and FLAIR Reporting Directions';
  clm033.source_excerpt = 'All Indian companies and LLPs which have received FDI or made ODI in any of the previous years, including the current year, shall submit the FLA Return on or before July 15 of every year to the Reserve Bank of India on the FLAIR web portal based on audited or unaudited financial statements.';
  clm033.unresolved_questions = 'Filing based on unaudited provisional accounts when statutory audit is incomplete by 15 July, followed by revised filing post-audit (by 30 September); compounding procedure under FEMA Section 15 for late submission.';
  clm033.notes = 'Mandatory annual cross-border reporting milestone on FLAIR portal. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

// CLM-034: Director Disqualification
const clm034 = claims.find(c => c.claim_id === 'CLM-034');
if (clm034) {
  clm034.statutory_provision = 'Companies Act, 2013 Section 164(2)(a) read with Section 167(1)(a)';
  clm034.source_excerpt = 'No person who is or has been a director of a company which has not filed financial statements or annual returns for any continuous period of three financial years shall be eligible to be re-appointed as a director of that company or appointed in other company for a period of five years from the date on which the said company fails to do so.';
  clm034.unresolved_questions = 'Section 167(1)(a) proviso: office of director is vacated in all other companies except the defaulting company; High Court judicial rulings (Delhi, Madras, Gujarat) regarding prospective application, natural justice, and DIN deactivation procedure.';
  clm034.notes = 'Severe statutory disability under Section 164(2)(a). Retained as PENDING_PROFESSIONAL_REVIEW pending qualified legal counsel review.';
}

// CLM-035: Fast-Track Mergers
const clm035 = claims.find(c => c.claim_id === 'CLM-035');
if (clm035) {
  clm035.statutory_provision = 'Companies Act, 2013 Section 233 read with Companies (Compromises, Arrangements and Amalgamations) Rules, 2016 Rule 25';
  clm035.source_excerpt = 'A scheme of merger or amalgamation may be entered into between two or more small companies, or between a holding company and its wholly-owned subsidiary company, or between two or more start-up companies; or between one or more start-up company with one or more small company.';
  clm035.unresolved_questions = 'Administrative approval through Regional Director without NCLT; statutory risk of Regional Director or Official Liquidator objections resulting in referral to NCLT under Section 233(5) if considered contrary to public or creditor interests; 90% creditor/member approval requirement.';
  clm035.notes = 'Strict statutory eligibility boundaries for non-tribunal administrative mergers under Section 233. Retained as PENDING_PROFESSIONAL_REVIEW.';
}

fs.writeFileSync(claimsPath, JSON.stringify(claims, null, 2) + '\n', 'utf8');
console.log('Successfully updated regulatory-claims.json');
console.log(`Total claims: ${claims.length}`);
console.log(`Claims with checked_date != null: ${claims.filter(c => c.checked_date !== null).length}`);
console.log(`Claims with checked_date == null: ${claims.filter(c => c.checked_date === null).length}`);
console.log(`Claims with last_verified_at == null: ${claims.filter(c => c.last_verified_at === null).length}`);
