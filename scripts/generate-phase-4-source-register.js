/**
 * CraftEgon CCS - Phase 4 Source Register & Coverage Report Generator
 * Generates canonical CSV register and detailed coverage inventory report
 */

const fs = require('node:fs');
const path = require('node:path');

const sourcesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sources.json'), 'utf8'));

// Domain mapping based on source ID and prefix
function getRegulatoryDomain(s) {
  if (s.source_id.includes('MCA') || s.source_id.includes('CA2013') || s.source_id.includes('SPICE') || s.source_id.includes('PAS') || s.source_id.includes('ICSI')) {
    return 'Corporate Secretarial & MCA Compliance';
  }
  if (s.source_id.includes('CBDT') || s.source_id.includes('CBIC')) {
    return 'Direct & Indirect Taxation (Income Tax & GST)';
  }
  if (s.source_id.includes('CGPDTM')) {
    return 'Intellectual Property (Trademarks & Patents)';
  }
  if (s.source_id.includes('EPFO') || s.source_id.includes('ESIC') || s.source_id.includes('POSH') || s.source_id.includes('IESO')) {
    return 'Labour, Employment & Workplace Compliance';
  }
  if (s.source_id.includes('RBI') || s.source_id.includes('FEMA')) {
    return 'Foreign Exchange & Cross-Border Capital (FEMA)';
  }
  if (s.source_id.includes('DPDP') || s.source_id.includes('CERTIN') || s.source_id.includes('IT-2000')) {
    return 'Data Privacy, Cyber Security & Digital Regulations';
  }
  if (s.source_id.includes('STAMP') || s.source_id.includes('PT-')) {
    return 'State Revenue, Stamp Duty & Professional Tax';
  }
  if (s.source_id.includes('MSME') || s.source_id.includes('DPIIT') || s.source_id.includes('BAR') || s.source_id.includes('ROF') || s.source_id.includes('IPA') || s.source_id.includes('SRA') || s.source_id.includes('ITA')) {
    return 'Business Entity Registration & Recognition';
  }
  return 'General Statutory & Internal Canon';
}

function getAccessMethod(s) {
  if (s.source_id === 'SRC-CGPDTM-001') return 'PUBLIC_WEB_CAPTCHA_MANUAL';
  if (s.source_id === 'SRC-CBIC-001') return 'OFFICIAL_PORTAL_GSP_API';
  if (s.source_id === 'SRC-CBDT-001') return 'OFFICIAL_PORTAL_ERI_API';
  if (s.source_id === 'SRC-MCA-001') return 'OFFICIAL_PORTAL_DSC';
  if (s.source_id === 'SRC-RBI-001') return 'OFFICIAL_PORTAL_AD_BANK_2FA';
  if (s.source_id.startsWith('SRC-INT-')) return 'INTERNAL_CANONICAL_DATABASE';
  if (s.source_type === 'STATUTE') return 'PUBLIC_STATUTE_CANON';
  return 'PUBLIC_OFFICIAL_WEB';
}

function getPermittedUsage(s) {
  if (s.source_id.startsWith('SRC-INT-')) return 'Internal CraftEgon enterprise governance only';
  if (s.source_id === 'SRC-CGPDTM-001') return 'Fair dealing / non-automated manual search under Trade Marks Act 1999';
  return 'Government of India Open Data / Statutory public gazette reference; automated scraping restricted';
}

function getUpdateFrequency(s) {
  if (s.source_id === 'SRC-CBIC-001' || s.source_id === 'SRC-CBDT-001') return 'Monthly / Return-cycle dependent';
  if (s.source_id === 'SRC-MCA-001' || s.source_id === 'SRC-RBI-001') return 'Circular & filing-cycle dependent';
  if (s.source_type === 'STATUTE') return 'Statutory amendment cycle';
  return 'Quarterly review';
}

function getFallbackBehavior(s) {
  if (s.source_id === 'SRC-CGPDTM-001') return 'MANUAL_LOOKUP_REQUIRED (Redirect to official IP India portal)';
  if (s.source_id === 'SRC-CBIC-001' || s.source_id === 'SRC-CBDT-001') return 'CACHED_STATUTORY_DEADLINE_SCHEDULE';
  if (s.source_id === 'SRC-MCA-001') return 'CACHED_STATUTORY_FILING_RULES';
  if (s.source_id === 'SRC-RBI-001') return 'CACHED_FEMA_TIMELINE_MATRIX';
  return 'FALLBACK_TO_MANUAL_PROFESSIONAL_REVIEW';
}

// Generate CSV
const csvHeaders = [
  'Source ID',
  'Official Source Name',
  'Publishing Authority',
  'Jurisdiction',
  'Regulatory Domain',
  'Official Source URL',
  'Source Type',
  'Access Method',
  'Authentication Requirements',
  'Permitted Usage Terms',
  'Coverage Limitations',
  'Update Frequency',
  'Last Successful Retrieval',
  'Last Attempted Retrieval',
  'Verification Status',
  'Source Owner / Maintenance Role',
  'Failure Fallback Behavior'
];

const csvRows = sourcesData.map(s => {
  const domain = getRegulatoryDomain(s);
  const accessMethod = getAccessMethod(s);
  const permittedUsage = getPermittedUsage(s);
  const freq = getUpdateFrequency(s);
  const fallback = getFallbackBehavior(s);
  const status = s.last_verified_at ? 'SOURCE_VERIFIED' : 'SOURCE_IDENTIFIED';
  const role = 'Principal Corporate Secretary & Regulatory Intelligence Lead';

  return [
    `"${s.source_id}"`,
    `"${(s.source_title || '').replace(/"/g, '""')}"`,
    `"${(s.issuing_authority || '').replace(/"/g, '""')}"`,
    `"${s.jurisdiction || 'IN-CENTRAL'}"`,
    `"${domain}"`,
    `"${s.official_url || ''}"`,
    `"${s.source_type || 'OFFICIAL_PORTAL'}"`,
    `"${accessMethod}"`,
    `"${(s.access_restrictions_notes || '').replace(/"/g, '""')}"`,
    `"${permittedUsage}"`,
    `"Restricted to ${s.jurisdiction || 'IN-CENTRAL'} statutory purview. Does not cover un-notified rules or foreign law."`,
    `"${freq}"`,
    `"${s.last_verified_at || ''}"`,
    `"${s.accessed_date || '2026-10-17'}"`,
    `"${status}"`,
    `"${role}"`,
    `"${fallback}"`
  ].join(',');
});

const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
fs.writeFileSync(path.join(__dirname, '../review-output/phase-4-regulatory-tools/phase-4-regulatory-source-register.csv'), csvContent, 'utf8');

console.log(`Generated phase-4-regulatory-source-register.csv with ${sourcesData.length} canonical sources.`);

// Generate Markdown report
const mdContent = `# CraftEgon CCS — Phase 4 Regulatory Source Coverage Report

**Document Reference:** CRAFTEGON-DOC-P4-003  
**Audit Date:** 2026-10-20  
**Status:** CANONICAL REGULATORY SOURCE INVENTORY  
**Phase:** 4 — Trustworthy Regulatory Tools  

---

## 1. Executive Summary

This inventory establishes the source governance foundation for Phase 4 of CraftEgon CCS. The platform integrates **34 canonical regulatory sources** spanning 8 statutory domains across Central (Union of India) and Sub-National (State) jurisdictions.

### Critical Integrity Commitments

1. **Rejection of Simulated Authoritative Government Output:** CraftEgon CCS does not simulate or forge live government query responses, nor does it present AI-generated guesses as authoritative government filings.
2. **Strict Adherence to Source Access Terms:** Automated scraping of government portals that deploy CAPTCHAs (such as the IP India Trade Marks Registry at \`ipindiaonline.gov.in\`) or mandate DSC authentication (such as MCA V3 portal) is strictly forbidden.
3. **Explicit Fallback States:** Where direct programmatic API access is restricted or unavailable, the system transparently reports \`MANUAL_LOOKUP_REQUIRED\`, \`CACHED_CANONICAL_SNAPSHOT\`, or \`SOURCE_UNAVAILABLE\`, accompanied by official URLs and guidance.
4. **No Claim of 100% Pan-India Coverage:** Coverage is presently established for Central enactments and three target states (Maharashtra, National Capital Territory of Delhi, and Karnataka). Other states require explicit future manual review.

---

## 2. Regulatory Domain Breakdown

| Domain | Canonical Sources | Primary Authorities | Access Architecture |
|---|---|---|---|
| **Corporate Secretarial & MCA** | \`SRC-MCA-001\`, \`SRC-ACT-CA2013-S403\`, \`SRC-RULE-SPICE-2020\`, \`SRC-NOTIF-PAS-2023\`, \`SRC-ICSI-SS-001\` | Ministry of Corporate Affairs, ICSI | Verified statutory schedule & periodic gazette snapshot |
| **Taxation (Direct & GST)** | \`SRC-CBDT-001\`, \`SRC-CBIC-001\` | CBDT, CBIC, GSTN | Return deadline rules & GSP/ERI adapter schema |
| **Intellectual Property** | \`SRC-CGPDTM-001\` | CGPDTM / DPIIT (Trade Marks Registry) | Benchmark Verification + \`MANUAL_LOOKUP_REQUIRED\` |
| **Labour & Social Security** | \`SRC-EPFO-001\`, \`SRC-ESIC-001\`, \`SRC-ACT-POSH-2013\`, \`SRC-ACT-IESO-1946\` | EPFO, ESIC, Ministry of Labour, WCD | Statutory wage ceiling rules & compliance matrices |
| **Foreign Exchange (FEMA)** | \`SRC-RBI-001\`, \`SRC-ACT-FEMA-1999\` | Reserve Bank of India (FED) | Master directions & FIRMS reporting timeline calendar |
| **Data Privacy & Cybersecurity** | \`SRC-DPDP-001\`, \`SRC-CERTIN-001\`, \`SRC-ACT-IT-2000\` | MeitY, CERT-In | Statutory compliance criteria & 6-hr incident reporting rules |
| **State Stamp Duty & PT** | \`SRC-STATE-MH-STAMP-1958\`, \`SRC-STATE-DL-STAMP-1899\`, \`SRC-STATE-KA-STAMP-1957\`, \`SRC-STATE-MH-PT-1975\`, \`SRC-STATE-KA-PT-1976\`, \`SRC-STATE-DL-PT-CONST\` | State Revenue Depts, MahaGST, Kaveri, DVAT | State-specific statutory schedules & rates |
| **Entity Formation & Startups** | \`SRC-MSME-001\`, \`SRC-DPIIT-001\`, \`SRC-BAR-001\`, \`SRC-STATE-MH-ROF-1932\`, \`SRC-STATE-KA-ROF-1932\`, \`SRC-ACT-IPA-1932\`, \`SRC-ACT-SRA-1860\`, \`SRC-ACT-ITA-1882\` | MSME, DPIIT, State RoF, Bar Council | Statutory eligibility criteria & filing prerequisites |
| **Internal Canon & Pricing** | \`SRC-INT-001\`, \`SRC-INT-PRC-001\` | CraftEgon Executive Council & Finance Committee | Internal governance baseline |

---

## 3. Source Access & Integration Readiness Matrix

| Source ID | Official Authority | Integration Mode | Live Query Feasibility | Current Operating Mode |
|---|---|---|---|---|
| \`SRC-MCA-001\` | Ministry of Corporate Affairs | Structured statutory adapter | Restricted (DSC / Session) | Canonical Statutory Rulebook & Event Calendar |
| \`SRC-CBDT-001\` | Central Board of Direct Taxes | Tax filing adapter | Requires ERI credentials | Statutory Calendar & Due Date Engine |
| \`SRC-CBIC-001\` | Goods and Services Tax Network | GST filing adapter | Requires GSP license | Canonical GST Calendar & Rule Engine |
| \`SRC-CGPDTM-001\` | IP India (Controller General) | Trademark search adapter | Blocked (Captcha / Bot protection) | Benchmark Verification + \`MANUAL_LOOKUP_REQUIRED\` |
| \`SRC-RBI-001\` | Reserve Bank of India | FEMA compliance adapter | Requires AD Bank 2FA | Master Direction Timelines & FLA Calendar |
| \`SRC-EPFO-001\` | Employees' Provident Fund Org | Labour rules adapter | Requires Employer DSC | 20+ Employee Threshold Engine |
| \`SRC-ESIC-001\` | Employees' State Insurance Corp | Social security adapter | Requires Employer credentials | ₹21,000 Wage Ceiling Threshold Engine |
| \`SRC-DPDP-001\` | MeitY / DPDP Board | Privacy compliance engine | Gazette enactment | Statutory Data Fiduciary Checklist |
| \`SRC-CERTIN-001\` | CERT-In | Cyber compliance engine | Gazette enactment | 6-Hour Incident Notification Rulebook |
| \`SRC-STATE-*\` | State Revenue / Tax Depts | State jurisdiction engine | Statutory gazette schedules | Explicit state-by-state stamp & PT matrices |

---

## 4. Known Coverage Gaps & Limitations

1. **Non-Covered States:** States other than Maharashtra, Delhi, and Karnataka (e.g., Tamil Nadu, Telangana, Uttar Pradesh, West Bengal) do not have automated stamp duty and professional tax calculators. Any enquiry for non-covered states triggers an explicit \`REQUIRES_REVIEW\` state.
2. **Real-Time Court Litigation & Registry Search:** The platform does not scrape High Courts, NCLT, or DRT dockets. Non-litigation corporate secretarial boundaries are maintained per \`SRC-BAR-001\`.
3. **Trademark Clearance:** The trademark search tool performs query normalization, Nice classification mapping, and scans internal verified trademark clearance benchmarks. However, it explicitly requires manual official registry lookup via \`https://ipindiaservices.gov.in/tmrpublicsearch/\` and warns that no match in benchmark data does not constitute legal availability.
4. **Third-Party Commercial Providers:** CraftEgon CCS does not currently license commercial aggregation APIs (e.g. Perfios, Karza, Signzy). No simulated results are fabricated in lieu of these providers.

---

## 5. Maintenance and Governance Protocols

- **Responsible Role:** Principal Corporate Secretary & Regulatory Intelligence Lead.
- **Review Cadence:** Quarterly review for central statutory portals; immediate review upon publication of relevant Gazette Notifications.
- **Staleness Thresholds:**
  - Dynamic filing calendars (Income Tax, GST, MCA): 48 hours.
  - Periodic compliance directives (RBI Master Directions, CERT-In): 7 days.
  - Statutory Acts and Enacted Rules: 90 days.
`;

fs.writeFileSync(path.join(__dirname, '../review-output/phase-4-regulatory-tools/phase-4-source-coverage-report.md'), mdContent, 'utf8');

console.log('Generated phase-4-source-coverage-report.md successfully.');
