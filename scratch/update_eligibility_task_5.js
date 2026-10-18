const fs = require('fs');
const path = require('path');

// 1. Load services to verify primary vertical mapping
const services = JSON.parse(fs.readFileSync('data/service-registry.json', 'utf8'));
const svcVerticalMap = {};
services.filter(s => s.record_status === 'ACTIVE_SERVICE').forEach(s => {
  svcVerticalMap[s.service_id] = s.primary_vertical_id;
});

// 2. Load current eligibility
const eligibility = JSON.parse(fs.readFileSync('data/eligibility.json', 'utf8'));

// Detailed statutory provisions mapping
const statutoryProvisions = {
  'V01-SVC-001': 'DPIIT Notification No. G.S.R. 127(E) dated 19 Feb 2019 read with Section 56(2)(viib) of Income Tax Act, 1961',
  'V01-SVC-002': 'Sections 11 & 12 of Limited Liability Partnership Act, 2008 read with Rule 8 & 11 of LLP Rules, 2009 (FiLLiP Form)',
  'V01-SVC-003': 'Sections 7 & 8 of Micro, Small and Medium Enterprises Development Act, 2006 read with Ministry of MSME Notification S.O. 2119(E) dated 26 June 2020',
  'V01-SVC-004': 'Section 2(62) and Section 3(1)(c) of Companies Act, 2013 read with Rule 3 of Companies (Incorporation) Rules, 2014',
  'V01-SVC-005': 'Section 58 of Indian Partnership Act, 1932 read with respective State Partnership Rules and State Stamp Acts',
  'V01-SVC-006': 'Common law sole proprietorship recognized under MSMED Act, 2006, CGST Act, 2017, and respective State Shops & Establishments Acts',
  'V01-SVC-007': 'Sections 3, 7, 12, 152, 153 of Companies Act, 2013 read with Rule 38 of Companies (Incorporation) Rules, 2014 (SPICe+ Form INC-32)',
  'V01-SVC-008': 'Section 8 of Companies Act, 2013 read with Rule 19 & 20 of Companies (Incorporation) Rules, 2014 (Form INC-12 license)',
  'V01-SVC-009': 'Sections 1 & 2 of Societies Registration Act, 1860 (Act XXI of 1860) as applicable per respective State amendments',
  'V01-SVC-010': 'Sections 4, 5 & 6 of Indian Trusts Act, 1882 read with respective State Public Trusts Acts where applicable',
  'V02-SVC-001': 'Section 137 of Companies Act, 2013 read with Rule 3 of Companies (Filing of Documents and Forms in Extensible Business Reporting Language) Rules, 2015',
  'V02-SVC-002': 'Rule 12A of Companies (Appointment and Qualification of Directors) Rules, 2014 read with Section 157 of Companies Act, 2013',
  'V02-SVC-003': 'Section 139(1) of Companies Act, 2013 read with Rule 4(2) of Companies (Audit and Auditors) Rules, 2014',
  'V02-SVC-004': 'Section 137 of Companies Act, 2013 read with Rule 12(1) of Companies (Accounts) Rules, 2014',
  'V02-SVC-005': 'Section 90 of Companies Act, 2013 read with Rule 4 & 7 of Companies (Significant Beneficial Owners) Rules, 2018',
  'V02-SVC-006': 'Sections 73 & 76 of Companies Act, 2013 read with Rule 16 of Companies (Acceptance of Deposits) Rules, 2014',
  'V02-SVC-007': 'Section 117 of Companies Act, 2013 read with Section 179(3) and Rule 24 of Companies (Management and Administration) Rules, 2014',
  'V02-SVC-008': 'Section 92 of Companies Act, 2013 read with Rule 11 of Companies (Management and Administration) Rules, 2014',
  'V02-SVC-009': 'Sections 196 & 197 read with Schedule V of Companies Act, 2013 and Rule 7 of Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014',
  'V02-SVC-010': 'Section 405(4) of Companies Act, 2013 read with Specified Companies (Furnishing of information about payment to micro and small enterprise suppliers) Order, 2019',
  'V02-SVC-011': 'Section 455 of Companies Act, 2013 read with Rule 3 of Companies (Miscellaneous) Rules, 2014',
  'V02-SVC-012': 'Rule 9A(8) of Companies (Prospectus and Allotment of Securities) Rules, 2014 (mandating half-yearly demat reconciliation)',
  'V02-SVC-013': 'Section 248(2) of Companies Act, 2013 read with Rule 4 of Companies (Removal of Names of Companies from the Register of Companies) Rules, 2016',
  'V02-SVC-014': 'Sections 34(4) and 35(1) of Limited Liability Partnership Act, 2008 read with Rule 24 & 25 of LLP Rules, 2009',
  'V02-SVC-015': 'Rule 37(1)(b) of Limited Liability Partnership Rules, 2009 read with Section 75 of LLP Act, 2008',
  'V02-SVC-016': 'Section 184(1) and Section 164(2) of Companies Act, 2013 read with Rule 14(1) of Companies (Appointment and Qualification of Directors) Rules, 2014',
  'V02-SVC-017': 'Sections 92, 137, 139, 173 of Companies Act, 2013 read with relevant MCA management rules',
  'V02-SVC-018': 'Sections 60, 61, 62 & 63 of Indian Partnership Act, 1932',
  'V03-SVC-001': 'Section 12A(1)(b) and Section 10(23C) of Income Tax Act, 1961 read with Rule 16CC & Rule 17B of Income Tax Rules, 1962',
  'V03-SVC-002': 'Section 92E of Income Tax Act, 1961 read with Rule 10E of Income Tax Rules, 1962',
  'V03-SVC-003': 'Section 44 of Central Goods and Services Tax Act, 2017 read with Rule 80(1) and Rule 80(3) of CGST Rules, 2017',
  'V03-SVC-004': 'Sections 139(4A), 139(4B), 139(4C), 139(4D) of Income Tax Act, 1961',
  'V03-SVC-005': 'Section 139(1) of Income Tax Act, 1961 read with Section 44AD / 44ADA presumptive taxation schemes',
  'V04-SVC-001': 'Sections 1(3) & 5 of Employees Provident Funds and Miscellaneous Provisions Act, 1952 and Sections 1(4) & 2A of Employees State Insurance Act, 1948',
  'V05-SVC-001': 'Sections 10, 23 & 27 of Indian Contract Act, 1872 read with Section 58(2) of Companies Act, 2013',
  'V05-SVC-002': 'Sections 10, 73 & 74 of Indian Contract Act, 1872',
  'V06-SVC-001': 'Section 29 & Section 134 of Trade Marks Act, 1999 and Section 51 & 55 of Copyright Act, 1957',
  'V06-SVC-002': 'Section 2(o) & Section 13 of Copyright Act, 1957 and Section 3(k) guidelines of Patents Act, 1970',
  'V06-SVC-003': 'Section 18 of Trade Marks Act, 1999 read with Rule 23 of Trade Marks Rules, 2017',
  'V07-SVC-001': 'Industrial Employment (Standing Orders) Act, 1946 read with relevant State model standing orders and upcoming Labour Codes',
  'V07-SVC-002': 'Sections 4, 19 & 21 of Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
  'V09-SVC-001': 'Section 233 of Companies Act, 2013 read with Rule 25 of Companies (Compromises, Arrangements and Amalgamations) Rules, 2016',
  'V09-SVC-002': 'Section 50B and Section 2(42C) of Income Tax Act, 1961 read with Section 180(1)(a) of Companies Act, 2013',
  'V09-SVC-003': 'Sections 230 to 232 of Companies Act, 2013 read with Companies (CAA) Rules, 2016 and National Company Law Tribunal Rules, 2016',
  'V11-SVC-001': 'Section 205 of Companies Act, 2013 read with ICSI Secretarial Standards on Board Meetings (SS-1) and General Meetings (SS-2)',
  'V11-SVC-002': 'Sections 118, 88, 170, 186 & 189 of Companies Act, 2013 read with ICSI Secretarial Standard-1 (SS-1)',
  'V11-SVC-003': 'Section 135 of Companies Act, 2013 read with Rule 12(1B) of Companies (Accounts) Rules, 2014 and CSR Rules, 2014',
  'V11-SVC-004': 'Section 204 of Companies Act, 2013 read with Rule 9 of Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014',
  'V12-SVC-001': 'Section 70B(6) of Information Technology Act, 2000 read with CERT-In Cyber Security Directions dated 28 April 2022',
  'V12-SVC-002': 'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) Sections 4, 6, 8, 9, 10 & 16',
  'V12-SVC-003': 'Sections 10A, 43A & 72A of Information Technology Act, 2000 read with Reasonable Security Practices Rules, 2011',
  'V13-SVC-001': 'Foreign Exchange Management Act, 1999 (FEMA) read with Foreign Exchange Management (Current Account Transactions) Rules, 2000',
  'V13-SVC-002': 'Sections 380 & 381 of Companies Act, 2013 read with Companies (Registration of Foreign Companies) Rules, 2014 and RBI Master Direction on Foreign Branch Offices',
  'V13-SVC-003': 'Foreign Exchange Management (Transfer or Issue of Any Foreign Security) Regulations read with RBI Circular A.P. (DIR Series) No. 22'
};

// Operational recommendations
const operationalRecommendations = {
  'V01-SVC-001': ['Maintain contemporaneous digital pitch decks and investor pitch documentation', 'Re-verify DPIIT entity turnover cap quarterly'],
  'V01-SVC-002': ['Draft detailed LLP profit-sharing and capital withdrawal schedules prior to FiLLiP filing', 'Verify partner DSC token validity 30 days prior'],
  'V01-SVC-003': ['Ensure Udyam registration matches primary GST return HSN/NIC activity descriptions', 'Review enterprise investment valuation annually'],
  'V01-SVC-004': ['Nominate an alternate nominee director in internal governance charter', 'Prepare conversion readiness checklist for future growth'],
  'V01-SVC-005': ['Maintain stamped physical copy of partnership deed at registered business location', 'Re-execute deed upon admission of any incoming partner'],
  'V01-SVC-006': ['Separate personal and commercial bank accounts strictly', 'Obtain trade license and MSME Udyam registration simultaneously'],
  'V01-SVC-007': ['Pre-check proposed company name on MCA public index and TM Class database', 'Obtain signed director declarations (Form DIR-2) before filing'],
  'V01-SVC-008': ['Ensure draft MoA contains explicit non-distribution of profit covenants', 'Prepare 3-year projected financial roadmap for INC-12 application'],
  'V01-SVC-009': ['Maintain annual governing body attendance register', 'File list of managing committee members annually with district registrar'],
  'V01-SVC-010': ['Ensure trust deed contains clear irrevocable dissolution clause', 'Apply for 12AB and 80G provisional registration within 3 months of deed execution'],
  'V02-SVC-001': ['Validate XBRL taxonomy schema against current MCA master taxonomy', 'Review PDF vs XBRL computational rendering prior to final upload'],
  'V02-SVC-002': ['Verify registered mobile number and email address with UIDAI records before OTP generation', 'Conduct annual director KYC audit by 31 August'],
  'V02-SVC-003': ['Obtain written consent and eligibility certificate under Section 141 from incoming auditor prior to AGM notice'],
  'V02-SVC-004': ['Ensure statutory auditor and two directors sign balance sheet before board approval date'],
  'V02-SVC-005': ['Issue Form BEN-4 inquiry notice to non-individual shareholders holding > 10% shares'],
  'V02-SVC-006': ['Obtain statutory auditor certificate for DPT-3 loan disclosures before 30 June'],
  'V02-SVC-007': ['File within 30 days of board/shareholder resolution to avoid mandatory compounding'],
  'V02-SVC-008': ['Obtain PCS certification in Form MGT-8 for companies meeting statutory thresholds'],
  'V02-SVC-009': ['Ensure nomination and remuneration committee approval precedes board resolution'],
  'V02-SVC-010': ['Cross-verify accounts payable ledger against Udyam portal supplier registrations quarterly'],
  'V02-SVC-011': ['Ensure entity has no outstanding statutory inspection or tax recovery proceedings before MSC-1'],
  'V02-SVC-012': ['Reconcile total issued shares against NSDL and CDSL depository ISIN balances fortnightly'],
  'V02-SVC-013': ['Close commercial bank accounts and surrender GST registration prior to indemnity execution'],
  'V02-SVC-014': ['Reconcile statement of assets and liabilities with audited partner capital accounts'],
  'V02-SVC-015': ['Obtain written consent of all creditors before executing Form 24 affidavit'],
  'V02-SVC-016': ['Circulate MBP-1 disclosure at the first board meeting of every financial year'],
  'V02-SVC-017': ['Maintain master statutory compliance tracker updated on rolling quarterly basis'],
  'V02-SVC-018': ['Submit change notice within 90 days of partnership modification to RoF'],
  'V03-SVC-001': ['Reconcile electronic cash donations against Section 80G receipts'],
  'V03-SVC-002': ['Maintain transfer pricing contemporaneous documentation and benchmarking study'],
  'V03-SVC-003': ['Perform monthly electronic credit ledger vs GSTR-2B automated reconciliation'],
  'V03-SVC-004': ['File return before statutory due date to preserve tax exemption eligibility'],
  'V03-SVC-005': ['Calculate advance tax installments quarterly to minimize Section 234B/C interest'],
  'V04-SVC-001': ['Generate electronic challan-cum-return (ECR) 5 days before statutory 15th due date'],
  'V05-SVC-001': ['Include structured deadlock resolution and drag-along/tag-along mechanics'],
  'V05-SVC-002': ['Define clear service levels (SLA), intellectual property ownership, and indemnification caps'],
  'V06-SVC-001': ['Send notice via speed post with acknowledgment due and electronic email simultaneously'],
  'V06-SVC-002': ['Archive git commit hashes and cryptographic timestamps for copyright proof'],
  'V06-SVC-003': ['Conduct comprehensive multi-class phonetic and visual conflict search before filing'],
  'V07-SVC-001': ['Review handbook provisions against state-specific shop acts every 12 months'],
  'V07-SVC-002': ['Ensure external member is independent of management and familiar with POSH jurisprudence'],
  'V09-SVC-001': ['Hold separate creditor meetings or secure 90% value written affidavits'],
  'V09-SVC-002': ['Commission independent registered valuer report for business undertaking valuation'],
  'V09-SVC-003': ['Engage designated counsel for NCLT court filings well in advance of regional hearings'],
  'V11-SVC-001': ['Perform mock secretarial audit 60 days before annual financial statements closure'],
  'V11-SVC-002': ['Circulate draft board minutes within 15 days of meeting per ICSI SS-1'],
  'V11-SVC-003': ['Publish comprehensive CSR annual action plan on corporate website'],
  'V11-SVC-004': ['Provide PCS unhindered access to physical register vault and MCA V3 filings archive'],
  'V12-SVC-001': ['Deploy automated SIEM alerting configured to flag Sev-1 breaches within 1 hour'],
  'V12-SVC-002': ['Conduct data mapping and processing inventory across all internal databases'],
  'V12-SVC-003': ['Review user clickwrap consent flows for unambiguous, informed affirmative consent'],
  'V13-SVC-001': ['Obtain Chartered Accountant certificate in Form 15CA/15CB prior to forex remittance'],
  'V13-SVC-002': ['Submit annual activity certificate (AAC) certified by chartered accountant to DGIT and RBI'],
  'V13-SVC-003': ['Reconcile FLA foreign liabilities against audited balance sheet foreign investment notes']
};

// Explicit unresolved questions
const unresolvedQuestions = {
  'V05-SVC-001': ['Enforceability of post-termination non-compete covenants under Section 27 of Indian Contract Act requires ongoing legal assessment.'],
  'V09-SVC-003': ['Advocates Act / Bar Council of India representation boundaries for corporate consultancy firms in NCLT tribunal advocacy require qualified counsel engagement.'],
  'V12-SVC-001': ['Interpretation of CERT-In 6-hour reporting window for cloud-hosted environments and foreign entities without Indian nexus requires legal opinion.'],
  'V12-SVC-002': ['DPDP Act 2023 Central Rules, Data Protection Board guidelines, and registration requirements remain pending gazette notification by MeitY.'],
  'V13-SVC-001': ['Withholding tax (Section 195) vs double tax avoidance agreement (DTAA) royalty rate applicability requires cross-border tax opinion.']
};

// Downgraded records requiring professional review
const pendingReviewSet = new Set(['V05-SVC-001', 'V09-SVC-003', 'V12-SVC-001', 'V12-SVC-002', 'V13-SVC-001']);

// Update eligibility records
for (const e of eligibility) {
  e.primary_vertical_id = svcVerticalMap[e.service_id] || e.service_id.split('-')[0];
  e.statutory_provision = statutoryProvisions[e.service_id] || 'Relevant provisions of applicable central statute';
  e.operational_recommendations = operationalRecommendations[e.service_id] || ['Maintain contemporaneous physical and electronic records for statutory verification'];
  e.unresolved_questions = unresolvedQuestions[e.service_id] || [];
  e.checked_date = '2026-10-17';
  
  if (pendingReviewSet.has(e.service_id)) {
    e.verification_status = 'PENDING_PROFESSIONAL_REVIEW';
    e.notes = `Statutory source identified under ${e.source_id}. Record is marked PENDING_PROFESSIONAL_REVIEW due to complex or evolving regulatory framework. Qualified legal review is required. Zero client-facing legal verification claimed.`;
  } else {
    e.verification_status = 'SOURCE_IDENTIFIED';
    e.notes = `Statutory source identified under ${e.source_id} (${e.statutory_provision}). Preserved strictly as SOURCE_IDENTIFIED; not legally verified. Qualified legal review is required before publication.`;
  }
}

fs.writeFileSync('data/eligibility.json', JSON.stringify(eligibility, null, 2) + '\n');
console.log('Successfully updated data/eligibility.json with statutory provisions, operational recommendations, and audit metadata');
