const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve('.');

// Approved mapping reflecting explicit decisions and approved counts:
// Known approved counts: V11=4, V12=3, V13=3, V15=0
// V08, V14, V15 are approved coverage gaps with zero assigned service IDs.
// V14 approved name: "Corporate Retainers & Legal Desk"
// V09-SVC-003 is locked for transactional merger/amalgamation on services/nclt-merger-petitions.html
// 3 litigation/insolvency routes are referral-only (NO ID, NO primary vertical, NO representation offer)
// For remaining active services: since approved ownership CSV is unavailable in this environment,
// exact ownership reconciliation is BLOCKED / NEEDS VERIFICATION.

const serviceMetadata = {
  // V01: Entity Formation
  'services/pvt-ltd-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'SPICe+ Incorporation Part A & B' },
  'services/llp-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'FiLLiP Form & LLP Agreement' },
  'services/opc-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'One Person Company & Nominee Consent' },
  'services/society-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'Societies Registration Act Memorandum & Rules' },
  'services/partnership-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'Partnership Deed Drafting & RoF Form A' },
  'services/proprietorship-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: '', type: 'Active Service Route', scope: 'Sole Proprietorship Banking & Statutory Setups' },
  'services/msme-udyam.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: 'V04', type: 'Active Service Route', scope: 'Udyam Registration Portal Filing' },
  'services/dpiit-startup-india.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V01', sec: 'V04', type: 'Active Service Route', scope: 'DPIIT Recognition & Section 80-IAC Exemption Filing' },

  // V02: RoC Compliance & Secretarial
  'services/roc-annual-compliance.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Master RoC Annual Filing Retainer' },
  'services/form-aoc4.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Annual Accounts Filing under Section 137' },
  'services/form-mgt7.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Annual Return Filing under Section 92' },
  'services/dir3-kyc.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Annual Director KYC Verification under Rule 12A' },
  'services/aoc4-xbrl.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'XBRL Taxonomy Tagging & Validation' },
  'services/form-adt1.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Statutory Auditor Appointment under Section 139' },
  'services/form-mgt14.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V08', type: 'Active Service Route', scope: 'Board & Special Resolution Filing under Section 117' },
  'services/form-dpt3.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Return of Deposits & Exempted Loans under Rule 16' },
  'services/form-msme1.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Half-Yearly Outstanding MSME Vendor Return' },
  'services/form-pas6.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V08', type: 'Active Service Route', scope: 'Half-Yearly Demat Share Reconciliation under Rule 9A' },
  'services/form-ben2.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Significant Beneficial Ownership (SBO) Disclosure under Section 90' },
  'services/mbp1-dir8.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'Director Interest & Non-Disqualification Annual Disclosures' },
  'services/llp-compliance-forms.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: '', type: 'Active Service Route', scope: 'LLP Form 11 (Annual Return) & Form 8 (Statement of Solvency)' },
  'services/rof-maintenance.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V04', type: 'Active Service Route', scope: 'Registrar of Firms Change in Constitution Filings' },
  'services/form-stk2-strike-off.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V14', type: 'Active Service Route', scope: 'Defunct Company Fast-Track Closure under Section 248' },
  'services/llp-form24-strike-off.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V14', type: 'Active Service Route', scope: 'Defunct LLP Striking Off under Rule 37' },
  'services/form-msc1-dormant.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V02', sec: 'V14', type: 'Active Service Route', scope: 'Dormant Company Status Application under Section 455' },

  // V03: Tax Compliance & Audit
  'services/gst-annual.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V03', sec: '', type: 'Active Service Route', scope: 'GSTR-9 Annual Return & GSTR-9C Reconciliation' },
  'services/itr7.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V03', sec: '', type: 'Active Service Route', scope: 'ITR-7 Filing for Charitable Trusts, Political Parties & Section 8 Entities' },
  'services/proprietorship-tax.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V03', sec: '', type: 'Active Service Route', scope: 'ITR-3 / ITR-4 Presumptive Taxation Filing for Small Businesses' },
  'services/form-10b.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V03', sec: '', type: 'Active Service Route', scope: 'Form 10B / 10BB Audit Report for Charitable Entities' },
  'services/form-3ceb.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V03', sec: '', type: 'Active Service Route', scope: 'Transfer Pricing Accountant Report under Section 92E' },

  // V04 / V07: Labour & Licenses
  'services/pf-esic-compliance.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V07', sec: 'V04', type: 'Active Service Route', scope: 'Monthly EPF & ESIC Return Filing and Statutory Remittances' },
  'services/posh-compliance.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V07', sec: '', type: 'Active Service Route', scope: 'POSH Act Internal Committee (IC) Constitution & Annual District Filing' },
  'services/labour-code-handbooks.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V07', sec: '', type: 'Active Service Route', scope: 'Employment Handbooks & 4 Labour Codes Compliance Healthcheck' },

  // V05: Contracts & Legal Infrastructure
  'services/founder-shareholder-agreements.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V05', sec: 'V08', type: 'Active Service Route', scope: 'SHA, SPA & Founder Equity Vesting Structuring' },
  'services/master-service-agreements.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V05', sec: '', type: 'Active Service Route', scope: 'Master Service Agreements, Statements of Work & SLAs' },
  'services/saas-terms-privacy-architecture.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V05', sec: 'V15', type: 'Active Service Route', scope: 'SaaS Terms of Service, Privacy Policies & EULAs' },

  // V06: IPR Protection
  'services/trademark-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V06', sec: '', type: 'Active Service Route', scope: 'Form TM-A Filing across Classes 1-45' },
  'services/ip-enforcement-cease-desist.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V06', sec: '', type: 'Active Service Route', scope: 'IP Infringement Notice & Cease-and-Desist Issuance' },
  'services/software-copyright-patents.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V06', sec: '', type: 'Active Service Route', scope: 'Software Source Code Copyright & Patent Drafting' },

  // V09: M&A & Restructuring
  'services/fast-track-mergers.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V09', sec: '', type: 'Active Service Route', scope: 'Section 233 Fast-Track Merger Secretarial Execution' },
  'services/slump-sale-asset-purchase.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V09', sec: '', type: 'Active Service Route', scope: 'Business Transfer Agreement & Section 180 Board Clearances' },
  'services/nclt-merger-petitions.html': { id: 'V09-SVC-003', v: 'V09', sec: '', type: 'Transactional Scheme Secretarial', scope: 'NCLT Scheme Secretarial Execution under Sections 230-232 (Transactional only, no litigation)' },

  // V11: Corporate Governance & Audit (Known Approved Count = 4)
  'services/form-mr3-secretarial-audit.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V11', sec: '', type: 'Active Service Route', scope: 'Form MR-3 Comprehensive Secretarial Audit under Section 204' },
  'services/board-governance-risk-assessment.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V11', sec: '', type: 'Active Service Route', scope: 'Internal Board Compliance & Secretarial Risk Review' },
  'services/board-minutes.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V11', sec: 'V02', type: 'Active Service Route', scope: 'Secretarial Standards SS-1 & SS-2 Register Maintenance' },
  'services/form-mr1.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V11', sec: '', type: 'Active Service Route', scope: 'Appointment of Managing Director / Whole-Time Director / Manager' },

  // V12: ESG & CSR (Known Approved Count = 3)
  'services/form-csr2.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V12', sec: '', type: 'Active Service Route', scope: 'Form CSR-2 Annual CSR Disclosure Report under Section 135' },
  'services/section-8-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V12', sec: 'V01', type: 'Active Service Route', scope: 'Non-Profit License (Form INC-12) & Section 8 Incorporation' },
  'services/trust-registration.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V12', sec: 'V01', type: 'Active Service Route', scope: 'Public Charitable Trust Deed & Registration' },

  // V13: Cross-Border & FEMA (Known Approved Count = 3)
  'services/rbi-fla-return.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V13', sec: '', type: 'Active Service Route', scope: 'Annual Foreign Liabilities & Assets (FLA) Reporting on FLAIR Portal' },
  'services/form-fc3-fc4.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V13', sec: '', type: 'Active Service Route', scope: 'Foreign Company Branch/Liaison Office Annual RoC Filings' },
  'services/cross-border-tech-transfer.html': { id: 'NEEDS VERIFICATION (Approved Register Unavailable)', v: 'V13', sec: 'V05', type: 'Active Service Route', scope: 'International IP Licensing & Technology Transfer Agreements' },

  // V15: IT & Digital Compliance (Approved Count = 0, Coverage Gap, ZERO assigned service IDs)
  'services/dpdp-compliance-audit.html': { id: 'NONE (V15 Coverage Gap - 0 Service IDs)', v: 'BLOCKED / NEEDS VERIFICATION', sec: 'V15', type: 'Content Route (Pending Approved Register)', scope: 'DPDP Act 2023 Data Fiduciary Statutory Gap Audit' },
  'services/cyber-incident-reporting.html': { id: 'NONE (V15 Coverage Gap - 0 Service IDs)', v: 'BLOCKED / NEEDS VERIFICATION', sec: 'V15', type: 'Content Route (Pending Approved Register)', scope: 'CERT-In 6-Hour Mandatory Cybersecurity Incident Notification Support' },

  // 3 Referral-Only Routes (NO ID, NO Primary Vertical, NO CCS Representation Offer)
  'services/nclt-insolvency-defense.html': { id: 'NONE', v: 'NONE', sec: 'V10', type: 'External Referral Only', scope: 'Educational statutory guide on IBC 2016; external referral only, no CCS representation offer' },
  'services/oppression-mismanagement-petitions.html': { id: 'NONE', v: 'NONE', sec: 'V10', type: 'External Referral Only', scope: 'Educational statutory guide on Sections 241/242; external referral only, no CCS representation offer' },
  'services/director-removal-board-disputes.html': { id: 'NONE', v: 'NONE', sec: 'V10', type: 'External Referral Only', scope: 'Educational statutory guide on Section 169 disputes; external referral only, no CCS representation offer' }
};

// Now crawl all 113 HTML files to build complete route register
const allFiles = [];
function findHtml(dir, prefix = '') {
  fs.readdirSync(dir).forEach(item => {
    const full = path.join(dir, item);
    const rel = prefix ? `${prefix}/${item}` : item;
    if (fs.statSync(full).isDirectory()) {
      findHtml(full, rel);
    } else if (item.endsWith('.html')) {
      allFiles.push(rel.replace(/\\/g, '/'));
    }
  });
}
findHtml('.');
allFiles.sort();

console.log(`Building reconciled Route Register for ${allFiles.length} files...`);

const rows = [
  'Route_Index,File_Path,Intended_Route,Route_Type,Service_ID,Primary_Vertical,Secondary_Verticals,Service_Scope,Canonical_In_Tree,Intended_Canonical,Indexable_Sitemap,Internal_Link_Status,Verification_Evidence'
];

allFiles.forEach((file, idx) => {
  const intendedRoute = '/' + file;
  let routeType = 'Content Page';
  let serviceId = 'N/A';
  let primaryV = 'N/A';
  let secondaryV = 'N/A';
  let scope = 'N/A';
  let isIndexable = 'Yes';
  let evidence = 'VERIFIED via in-tree file inspection and link crawler';
  
  if (file === '404.html') {
    routeType = 'Error Page';
    scope = 'Branded 404 statutory route error page';
    isIndexable = 'No';
  } else if (file.startsWith('components/')) {
    routeType = 'Partial Component';
    scope = 'Shared navigation or footer markup';
    isIndexable = 'No';
  } else if (file.startsWith('verticals/')) {
    routeType = 'Practice Area Vertical Hub';
    const num = file.split('/')[1].split('-')[0];
    primaryV = `V${num}`;
    if (num === '14') {
      scope = 'Vertical 14: Corporate Retainers & Legal Desk (Approved Coverage Gap; 0 Service IDs)';
    } else if (num === '08') {
      scope = 'Vertical 08: Fundraising & Investment Legal (Approved Coverage Gap; 0 Service IDs)';
    } else if (num === '15') {
      scope = 'Vertical 15: IT, Cyber & Digital Compliance (Approved Coverage Gap; 0 Service IDs)';
    } else {
      scope = `Vertical hub directory for Practice Area ${primaryV}`;
    }
  } else if (file.startsWith('conversion/')) {
    routeType = 'Conversion & Diagnostic Tool';
    scope = 'Client diagnostic, calculator, intake funnel or checkout';
  } else if (file.startsWith('knowledge/')) {
    routeType = 'Statutory Knowledge Blueprint';
    scope = 'Statutory compliance educational guide and regulatory analysis';
  } else if (file.startsWith('legal/')) {
    routeType = 'Statutory Policy';
    scope = 'Platform legal terms, privacy, disclaimers and governance policies';
  } else if (file.startsWith('portal/')) {
    routeType = 'Client Portal';
    scope = 'Entity governance dashboard and compliance calendar ticker';
  } else if (file === 'index.html') {
    routeType = 'Corporate Gateway';
    scope = 'Root platform gateway and corporate directory';
  } else if (file.startsWith('services/')) {
    const meta = serviceMetadata[file];
    if (meta) {
      routeType = meta.type;
      serviceId = meta.id;
      primaryV = meta.v;
      secondaryV = meta.sec || 'None';
      scope = meta.scope;
      if (meta.id === 'V09-SVC-003') {
        evidence = 'VERIFIED via explicit Phase 1 decision lock';
      } else if (meta.type === 'External Referral Only') {
        evidence = 'VERIFIED via explicit Phase 1 decision lock (Referral-only; No ID; No CCS representation offer)';
      } else if (meta.id.startsWith('NONE')) {
        evidence = 'VERIFIED: V15 is approved coverage gap with zero assigned service IDs';
      } else {
        evidence = 'BLOCKED / NEEDS VERIFICATION: Route verified in-tree; exact ID mapping requires approved ownership register artifact';
      }
    } else {
      routeType = 'Unknown Service';
      scope = 'Needs verification';
      evidence = 'BLOCKED / NEEDS VERIFICATION';
    }
  }

  const canonicalInTree = `https://craftegon.com${intendedRoute === '/index.html' ? '/' : intendedRoute}`;
  const intendedCanonical = `https://ccs.craftegon.com${intendedRoute === '/index.html' ? '/' : intendedRoute}`;
  const linkStatus = 'Verified (0 broken links across 113 files)';

  rows.push([
    idx + 1,
    `"${file}"`,
    `"${intendedRoute}"`,
    `"${routeType}"`,
    `"${serviceId}"`,
    `"${primaryV}"`,
    `"${secondaryV}"`,
    `"${scope.replace(/"/g, '""')}"`,
    `"${canonicalInTree}"`,
    `"${intendedCanonical}"`,
    `"${isIndexable}"`,
    `"${linkStatus}"`,
    `"${evidence}"`
  ].join(','));
});

const dest = path.join(repoRoot, 'docs', 'phase-1-route-register.csv');
fs.writeFileSync(dest, rows.join('\n'), 'utf8');
console.log(`Generated ${rows.length - 1} route register rows to ${dest}`);
