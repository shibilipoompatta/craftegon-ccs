const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const registry = require('../data/service-registry.json');
const verticals = require('../data/verticals.json');

const verticalMap = {};
verticals.forEach(v => {
  verticalMap[v.vertical_id] = v;
});

const referralSet = new Set([
  '/services/director-removal-board-disputes.html',
  '/services/nclt-insolvency-defense.html',
  '/services/oppression-mismanagement-petitions.html'
]);

// Curated canonical aliases and statutory tags for comprehensive natural-language matching
const ENRICHMENTS = {
  '/services/pvt-ltd-registration.html': {
    aliases: [
      'Register a private limited company',
      'Pvt Ltd Registration',
      'Private Limited Company Incorporation',
      'Company Registration',
      'SPICe+ Incorporation',
      'Start a company',
      'New company formation'
    ],
    forms: ['SPICe+', 'INC-32', 'INC-33', 'INC-34', 'AGILE-PRO-S'],
    entity_types: ['Private Limited Company'],
    business_stage: 'Formation & Startup',
    keywords: ['incorporation', 'formation', 'roc', 'mca', 'spice', 'director', 'din', 'pan', 'tan', 'name approval', 'run']
  },
  '/services/llp-registration.html': {
    aliases: [
      'LLP Registration',
      'Limited Liability Partnership Formation',
      'FiLLiP Incorporation',
      'Register an LLP',
      'Partnership with limited liability'
    ],
    forms: ['FiLLiP', 'Form 1', 'Form 2', 'Form 3'],
    entity_types: ['Limited Liability Partnership (LLP)'],
    business_stage: 'Formation & Startup',
    keywords: ['llp', 'fillip', 'partnership', 'partners', 'dpin', 'agreement', 'roc', 'mca']
  },
  '/services/opc-registration.html': {
    aliases: [
      'One Person Company Registration',
      'OPC Registration',
      'Single founder company',
      'Solo entrepreneur company'
    ],
    forms: ['SPICe+', 'INC-3'],
    entity_types: ['One Person Company (OPC)'],
    business_stage: 'Formation & Startup',
    keywords: ['opc', 'single member', 'nominee', 'solo', 'incorporation', 'mca']
  },
  '/services/partnership-registration.html': {
    aliases: [
      'Partnership Firm Registration',
      'Register a Partnership',
      'Traditional Partnership Deed',
      'RoF Firm Registration'
    ],
    forms: ['Form A', 'Partnership Deed'],
    entity_types: ['Partnership Firm'],
    business_stage: 'Formation & Startup',
    keywords: ['partnership', 'deed', 'rof', 'firm', 'unincorporated', 'partners']
  },
  '/services/proprietorship-registration.html': {
    aliases: [
      'Sole Proprietorship Registration',
      'Register a Proprietorship',
      'Individual business registration',
      'Shop and establishment proprietorship'
    ],
    forms: ['Udyam', 'GST-REG-01'],
    entity_types: ['Sole Proprietorship'],
    business_stage: 'Formation & Startup',
    keywords: ['proprietor', 'sole proprietorship', 'individual', 'trade license', 'udyam']
  },
  '/services/section-8-registration.html': {
    aliases: [
      'Section 8 Company Registration',
      'Non-Profit Company',
      'NGO Registration',
      'Charitable company incorporation'
    ],
    forms: ['INC-12', 'SPICe+'],
    entity_types: ['Section 8 Company', 'Non-Profit'],
    business_stage: 'Formation & Startup',
    keywords: ['ngo', 'non-profit', 'charity', 'section 8', 'license', 'donation', '12a', '80g']
  },
  '/services/society-registration.html': {
    aliases: [
      'Society Registration',
      'Register a Society',
      'Societies Registration Act',
      'Welfare society'
    ],
    forms: ['Memorandum of Association', 'Society Rules'],
    entity_types: ['Society'],
    business_stage: 'Formation & Startup',
    keywords: ['society', 'ngo', 'bylaws', 'governing body', 'registrar of societies']
  },
  '/services/trust-registration.html': {
    aliases: [
      'Trust Registration',
      'Public Charitable Trust',
      'Private Trust Deed',
      'Register a Trust'
    ],
    forms: ['Trust Deed', 'Sub-Registrar Filing'],
    entity_types: ['Trust'],
    business_stage: 'Formation & Startup',
    keywords: ['trust', 'trustee', 'settlor', 'deed', 'charitable', 'sub-registrar']
  },
  '/services/msme-udyam.html': {
    aliases: [
      'MSME Registration',
      'Udyam Registration',
      'Udyam Certificate',
      'Small business registration',
      'MSME Certificate Online'
    ],
    forms: ['Udyam Portal e-Filing'],
    entity_types: ['Micro', 'Small', 'Medium Enterprises'],
    business_stage: 'Formation & Startup',
    keywords: ['msme', 'udyam', 'priority lending', 'collateral free', 'subsidies', 'nic code']
  },
  '/services/dpiit-startup-india.html': {
    aliases: [
      'DPIIT Startup India Recognition',
      'Startup India Certificate',
      'Section 56(2)(viib) Angel Tax Exemption',
      'Section 80-IAC Tax Holiday',
      'Find a service for my startup',
      'Startup Recognition'
    ],
    forms: ['Form 1', 'Form 2 (Angel Tax)', 'DPIIT Portal'],
    entity_types: ['Private Limited', 'LLP'],
    business_stage: 'Formation & Startup',
    keywords: ['startup', 'dpiit', 'angel tax', '80-iac', 'innovation', 'tax holiday', 'seed fund']
  },
  '/services/roc-annual-compliance.html': {
    aliases: [
      'RoC Annual Compliance',
      'Annual Compliance Package',
      'Company Annual Filing',
      'Yearly RoC Filings'
    ],
    forms: ['AOC-4', 'MGT-7', 'ADT-1'],
    entity_types: ['Private Limited', 'Public Limited', 'OPC'],
    business_stage: 'Annual Governance',
    keywords: ['annual filing', 'compliance calendar', 'financial statements', 'board report', 'agm', 'roc']
  },
  '/services/form-aoc4.html': {
    aliases: [
      'Form AOC-4 Filing',
      'Financial Statement Filing',
      'AOC-4 RoC E-Filing',
      'Balance Sheet Filing'
    ],
    forms: ['AOC-4', 'AOC-4 CFS'],
    entity_types: ['Private Limited', 'Public Limited'],
    business_stage: 'Annual Governance',
    keywords: ['aoc4', 'financials', 'balance sheet', 'p&l', 'auditor report', 'section 137']
  },
  '/services/aoc4-xbrl.html': {
    aliases: [
      'AOC-4 XBRL Filing',
      'Extensible Business Reporting Language Filing',
      'XBRL Balance Sheet'
    ],
    forms: ['AOC-4 XBRL'],
    entity_types: ['Listed Companies', 'Public Limited', 'High Capital Pvt Ltd'],
    business_stage: 'Annual Governance',
    keywords: ['xbrl', 'taxonomy', 'aoc4', 'mandate', 'paid up capital', 'turnover']
  },
  '/services/form-mgt7.html': {
    aliases: [
      'Form MGT-7 Filing',
      'MGT-7A Small Company Annual Return',
      'Annual Return Filing RoC'
    ],
    forms: ['MGT-7', 'MGT-7A'],
    entity_types: ['Private Limited', 'Small Company', 'Public Limited'],
    business_stage: 'Annual Governance',
    keywords: ['mgt7', 'mgt7a', 'annual return', 'shareholders', 'directors', 'section 92']
  },
  '/services/form-adt1.html': {
    aliases: [
      'Form ADT-1 Filing',
      'Auditor Appointment Filing',
      'Statutory Auditor Intimation'
    ],
    forms: ['ADT-1'],
    entity_types: ['Private Limited', 'Public Limited', 'Section 8'],
    business_stage: 'Annual Governance',
    keywords: ['adt1', 'auditor', 'chartered accountant', 'tenure', 'agm', 'section 139']
  },
  '/services/dir3-kyc.html': {
    aliases: [
      'DIR-3 KYC Filing',
      'Director KYC Online',
      'DIR-3 KYC Web',
      'Director Identification Number KYC'
    ],
    forms: ['DIR-3 KYC', 'DIR-3 KYC Web'],
    entity_types: ['DIN Holders', 'Directors', 'Designated Partners'],
    business_stage: 'Annual Governance',
    keywords: ['dir3', 'kyc', 'din', 'director', 'otp verification', 'deactivation', 'penalty']
  },
  '/services/form-msc1-dormant.html': {
    aliases: [
      'Form MSC-1 Dormant Status',
      'Apply for Dormant Company Status',
      'Inactive Company Status'
    ],
    forms: ['MSC-1'],
    entity_types: ['Private Limited', 'Public Limited'],
    business_stage: 'Annual Governance',
    keywords: ['dormant', 'msc1', 'inactive', 'asset holding', 'reduced compliance', 'section 455']
  },
  '/services/form-stk2-strike-off.html': {
    aliases: [
      'Form STK-2 Strike Off',
      'Fast-Track Company Closure',
      'Close a Private Limited Company',
      'Defunct Company Strike Off',
      'Shut down company'
    ],
    forms: ['STK-2', 'STK-3', 'STK-4'],
    entity_types: ['Private Limited', 'OPC', 'Public Limited'],
    business_stage: 'Restructuring & Exit',
    keywords: ['strike off', 'closure', 'stk2', 'defunct', 'dissolution', 'section 248', 'indemnity']
  },
  '/services/llp-form24-strike-off.html': {
    aliases: [
      'LLP Form 24 Strike Off',
      'Close an LLP',
      'LLP Closure Online',
      'Defunct LLP Strike Off'
    ],
    forms: ['Form 24'],
    entity_types: ['Limited Liability Partnership'],
    business_stage: 'Restructuring & Exit',
    keywords: ['llp closure', 'form 24', 'strike off', 'defunct llp', 'affidavit']
  },
  '/services/llp-compliance-forms.html': {
    aliases: [
      'LLP Annual Compliance Forms',
      'LLP Form 8 & Form 11',
      'LLP Annual Filing'
    ],
    forms: ['Form 8', 'Form 11'],
    entity_types: ['Limited Liability Partnership'],
    business_stage: 'Annual Governance',
    keywords: ['form 8', 'form 11', 'statement of solvency', 'llp annual return', 'late fee']
  },
  '/services/form-pas6.html': {
    aliases: [
      'Form PAS-6 Demat Reconciliation',
      'PAS-6 Half-Yearly Audit',
      'Unlisted Public Demat Compliance',
      'Rule 9B Private Company Demat'
    ],
    forms: ['PAS-6'],
    entity_types: ['Unlisted Public Company', 'Private Limited'],
    business_stage: 'Annual Governance',
    keywords: ['pas6', 'demat', 'nsdl', 'cdsl', 'reconciliation of share capital', 'isin']
  },
  '/services/form-ben2.html': {
    aliases: [
      'Form BEN-2 SBO Return',
      'Significant Beneficial Ownership Declaration',
      'SBO Filing RoC'
    ],
    forms: ['BEN-2', 'BEN-1'],
    entity_types: ['Companies with Corporate Shareholders'],
    business_stage: 'Annual Governance',
    keywords: ['ben2', 'sbo', 'beneficial ownership', 'section 90', 'natural person', 'holding']
  },
  '/services/form-dpt3.html': {
    aliases: [
      'Form DPT-3 Return of Deposits',
      'Return of Outstanding Loans & Deposits',
      'DPT-3 RoC Filing'
    ],
    forms: ['DPT-3'],
    entity_types: ['Private Limited', 'Public Limited'],
    business_stage: 'Annual Governance',
    keywords: ['dpt3', 'deposits', 'unsecured loans', 'director loans', 'section 73', 'june 30']
  },
  '/services/form-msme1.html': {
    aliases: [
      'Form MSME-1 Half-Yearly Return',
      'MSME Outstanding Payments Return',
      'Section 43B(h) Reporting'
    ],
    forms: ['MSME-1'],
    entity_types: ['Companies dealing with MSME vendors'],
    business_stage: 'Annual Governance',
    keywords: ['msme1', 'delayed payments', '45 days rule', '43b(h)', 'vendor dues']
  },
  '/services/form-mgt14.html': {
    aliases: [
      'Form MGT-14 Resolutions Filing',
      'Board Resolution Filing RoC',
      'Special Resolution MGT-14',
      'Business address change',
      'Object clause change'
    ],
    forms: ['MGT-14'],
    entity_types: ['Private Limited', 'Public Limited'],
    business_stage: 'Corporate Compliance',
    keywords: ['mgt14', 'special resolution', 'board resolution', 'section 117', 'address change', 'capital increase']
  },
  '/services/form-mr1.html': {
    aliases: [
      'Form MR-1 KMP Appointment',
      'Managing Director & KMP Return',
      'Key Managerial Personnel Intimation'
    ],
    forms: ['MR-1'],
    entity_types: ['Public Limited', 'Large Pvt Ltd'],
    business_stage: 'Corporate Compliance',
    keywords: ['mr1', 'kmp', 'managing director', 'manager', 'whole time director', 'section 196']
  },
  '/services/mbp1-dir8.html': {
    aliases: [
      'Form MBP-1 & DIR-8 Disclosures',
      'Director Interest Disclosure',
      'Non-Disqualification DIR-8'
    ],
    forms: ['MBP-1', 'DIR-8'],
    entity_types: ['All Directors & Companies'],
    business_stage: 'Annual Governance',
    keywords: ['mbp1', 'dir8', 'interest disclosure', 'first board meeting', 'disqualification', '184(1)', '164(2)']
  },
  '/services/rof-maintenance.html': {
    aliases: [
      'Statutory Registers Maintenance (RoF)',
      'Register of Members & Directors',
      'Section 88 Statutory Registers'
    ],
    forms: ['MGT-1', 'MGT-2', 'MBP-2', 'MBP-4'],
    entity_types: ['Private Limited', 'Public Limited'],
    business_stage: 'Annual Governance',
    keywords: ['registers', 'register of members', 'rof', 'secretarial records', 'section 88']
  },
  '/services/gst-annual.html': {
    aliases: [
      'GST Annual Return',
      'GSTR-9 Filing',
      'GSTR-9C Reconciliation Statement',
      'GST compliance',
      'GST registration'
    ],
    forms: ['GSTR-9', 'GSTR-9C'],
    entity_types: ['Regular GST Registered Taxpayers'],
    business_stage: 'Tax & Regulatory',
    keywords: ['gst', 'gstr9', 'gstr9c', 'annual return', 'itc reconciliation', 'turnover', 'cgst']
  },
  '/services/form-3ceb.html': {
    aliases: [
      'Form 3CEB Transfer Pricing Report',
      'Transfer Pricing Audit',
      'Section 92E Accountant Report',
      'International Transactions Transfer Pricing'
    ],
    forms: ['Form 3CEB'],
    entity_types: ['Entities with Cross-Border Associated Enterprise Deals'],
    business_stage: 'Tax & Regulatory',
    keywords: ['transfer pricing', '3ceb', 'arm length price', 'international transactions', 'associated enterprise']
  },
  '/services/form-10b.html': {
    aliases: [
      'Form 10B & 10BB Audit Report',
      'Charitable Trust Tax Audit',
      'Section 12A / 10(23C) Audit'
    ],
    forms: ['Form 10B', 'Form 10BB'],
    entity_types: ['Charitable Trusts', 'Institutions'],
    business_stage: 'Tax & Regulatory',
    keywords: ['10b', '10bb', 'charitable audit', 'trust tax', 'exempt income', 'income tax']
  },
  '/services/proprietorship-tax.html': {
    aliases: [
      'Proprietorship Tax Return',
      'ITR-3 & ITR-4 Presumptive Filing',
      'Income tax filing for business',
      'Individual business tax return'
    ],
    forms: ['ITR-3', 'ITR-4 (Sugam)', 'Form 10-IEA'],
    entity_types: ['Sole Proprietor', 'Freelancers', 'Professionals'],
    business_stage: 'Tax & Regulatory',
    keywords: ['itr3', 'itr4', 'presumptive tax', '44ad', '44ada', 'income tax return']
  },
  '/services/itr7.html': {
    aliases: [
      'ITR-7 Return Filing',
      'Trust & Section 8 Tax Return',
      'Political Party & Non-Profit Tax'
    ],
    forms: ['ITR-7'],
    entity_types: ['Section 8', 'Trusts', 'Societies', 'NGOs'],
    business_stage: 'Tax & Regulatory',
    keywords: ['itr7', 'ngo tax', 'trust return', 'charitable return', 'income tax']
  },
  '/services/pf-esic-compliance.html': {
    aliases: [
      'PF & ESIC Compliance',
      'Labour registration',
      'EPFO Monthly ECR Filing',
      'ESIC Monthly Contribution Return',
      'Provident Fund Registration'
    ],
    forms: ['ECR Portal Return', 'Form 5', 'Form 10'],
    entity_types: ['Establishments with 10/20+ Employees'],
    business_stage: 'Labour & Workforce',
    keywords: ['pf', 'epf', 'esic', 'labour', 'social security', 'ecr', 'provident fund', 'employees']
  },
  '/services/master-service-agreements.html': {
    aliases: [
      'Master Service Agreements (MSA)',
      'SOW Contract Drafting',
      'Commercial Service Contracts',
      'B2B Client Contracts'
    ],
    forms: ['MSA Framework', 'Statement of Work'],
    entity_types: ['SaaS', 'IT Companies', 'Service Providers'],
    business_stage: 'Contracts & Legal Architecture',
    keywords: ['msa', 'sow', 'contract', 'indemnity', 'ip assignment', 'commercial agreement']
  },
  '/services/founder-shareholder-agreements.html': {
    aliases: [
      'Founder & Shareholders Agreements',
      'SHA Drafting',
      'Founder Vesting Agreement',
      'Share Subscription Agreement (SSA)',
      'Co-founder agreement'
    ],
    forms: ['SHA', 'SSA', 'Reverse Vesting Agreement'],
    entity_types: ['Startups', 'Venture Funded Entities'],
    business_stage: 'Contracts & Legal Architecture',
    keywords: ['sha', 'ssa', 'vesting', 'equity', 'co-founder', 'tag-along', 'drag-along', 'pre-emption']
  },
  '/services/trademark-registration.html': {
    aliases: [
      'Trademark Registration',
      'Trademark search',
      'TM Application Filing (TM-A)',
      'Brand Name Protection',
      'Logo Registration'
    ],
    forms: ['Form TM-A'],
    entity_types: ['Startups', 'Enterprises', 'Individuals'],
    business_stage: 'IPR Protection',
    keywords: ['trademark', 'brand', 'logo', 'tm-a', 'nice classification', 'ip india', 'trademark search']
  },
  '/services/software-copyright-patents.html': {
    aliases: [
      'Software Copyright & Patent Advisory',
      'Source Code Copyright Registration',
      'Tech IP Filing'
    ],
    forms: ['Form XIV (Copyright)', 'Form 1 (Patent)'],
    entity_types: ['Tech Startups', 'Software Companies'],
    business_stage: 'IPR Protection',
    keywords: ['copyright', 'patent', 'software code', 'provisional patent', 'cr act', 'invention']
  },
  '/services/ip-enforcement-cease-desist.html': {
    aliases: [
      'IP Enforcement & Cease & Desist',
      'Legal Notice for Trademark Infringement',
      'Brand Protection Notice'
    ],
    forms: ['Statutory Cease & Desist Notice'],
    entity_types: ['Brand Owners', 'Enterprises'],
    business_stage: 'IPR Protection',
    keywords: ['cease and desist', 'infringement', 'passing off', 'brand protection', 'notice', 'ip dispute']
  },
  '/services/labour-code-handbooks.html': {
    aliases: [
      'Labour Code Compliant HR Handbooks',
      'Employee Handbook Drafting',
      'Employment Policy Formulation',
      'Labour registration compliance'
    ],
    forms: ['Employment Policy Manual'],
    entity_types: ['Startups', 'Growing Enterprises', 'Corporates'],
    business_stage: 'Labour & Workforce',
    keywords: ['labour codes', 'hr handbook', 'employment agreement', 'wages code', 'leave policy']
  },
  '/services/posh-compliance.html': {
    aliases: [
      'POSH Compliance & IC Constitution',
      'Internal Complaints Committee Constitution',
      'POSH Annual Return Filing',
      'Prevention of Sexual Harassment'
    ],
    forms: ['IC Constitution Order', 'POSH Annual Report'],
    entity_types: ['Establishments with 10+ Employees'],
    business_stage: 'Labour & Workforce',
    keywords: ['posh', 'sexual harassment', 'internal committee', 'external member', 'district officer']
  },
  '/services/fast-track-mergers.html': {
    aliases: [
      'Fast-Track Mergers (Section 233)',
      'Holding-Subsidiary Merger',
      'Small Company Merger',
      'M&A Restructuring'
    ],
    forms: ['CAA-9', 'CAA-10', 'CAA-11', 'CAA-12'],
    entity_types: ['Holding-Subsidiary', 'Small Companies'],
    business_stage: 'Corporate Transactions & M&A',
    keywords: ['fast track merger', 'section 233', 'caa9', 'scheme of arrangement', 'regional director']
  },
  '/services/slump-sale-asset-purchase.html': {
    aliases: [
      'Slump Sale & Business Transfer (BTA)',
      'Asset Purchase Agreement (APA)',
      'Section 2(42C) Slump Sale Advisory',
      'Business Undertaking Sale'
    ],
    forms: ['Business Transfer Agreement (BTA)'],
    entity_types: ['Corporate Enterprises'],
    business_stage: 'Corporate Transactions & M&A',
    keywords: ['slump sale', 'bta', 'asset purchase', 'going concern', 'lump sum consideration', 'undertaking']
  },
  '/services/nclt-merger-petitions.html': {
    aliases: [
      'NCLT Merger Petitions (Sections 230-232)',
      'Tribunal Sanctioned Schemes of Arrangement',
      'Corporate Amalgamation Petition'
    ],
    forms: ['Form NCLT-1', 'Company Application'],
    entity_types: ['Public & Large Private Companies'],
    business_stage: 'Corporate Transactions & M&A',
    keywords: ['nclt merger', 'section 230', 'section 232', 'scheme of amalgamation', 'tribunal petition']
  },
  '/services/director-removal-board-disputes.html': {
    aliases: [
      'Director Removal & Board Disputes Advisory',
      'Special Notice under Section 169',
      'Removal of Director Guidance',
      'Board deadlock resolution'
    ],
    forms: ['Section 169 Special Notice', 'Board Resolution'],
    entity_types: ['Shareholders', 'Board of Directors'],
    business_stage: 'Dispute Avoidance (Non-Litigation)',
    keywords: ['director removal', 'section 169', 'board dispute', 'deadlock', 'referral', 'tribunal']
  },
  '/services/nclt-insolvency-defense.html': {
    aliases: [
      'NCLT Insolvency Defense Advisory',
      'Section 7 & Section 9 IBC Defense',
      'Insolvency & Bankruptcy Advisory',
      'Corporate Debtor Defense'
    ],
    forms: ['Form 5 Demand Notice Reply', 'NCLT Objections'],
    entity_types: ['Corporate Debtors', 'Operational Creditors'],
    business_stage: 'Dispute Avoidance (Non-Litigation)',
    keywords: ['ibc', 'nclt insolvency', 'section 7', 'section 9', 'operational debt', 'referral']
  },
  '/services/oppression-mismanagement-petitions.html': {
    aliases: [
      'Oppression & Mismanagement Advisory',
      'Section 241-242 Companies Act Advisory',
      'Minority Shareholder Rights Advisory',
      'Shareholder Dispute Advisory'
    ],
    forms: ['Section 241 Petition Guidance'],
    entity_types: ['Minority Shareholders', 'Promoters'],
    business_stage: 'Dispute Avoidance (Non-Litigation)',
    keywords: ['oppression', 'mismanagement', 'section 241', 'minority shareholder', 'referral', 'tribunal']
  },
  '/services/board-governance-risk-assessment.html': {
    aliases: [
      'Board Governance & Risk Assessment',
      'Corporate Governance Framework',
      'Board Performance Evaluation'
    ],
    forms: ['Governance Charter', 'Board Audit Report'],
    entity_types: ['Listed & Large Unlisted Companies'],
    business_stage: 'Governance, Audit & Risk',
    keywords: ['board governance', 'risk assessment', 'independent directors', 'committees', 'internal controls']
  },
  '/services/board-minutes.html': {
    aliases: [
      'Board Minutes & Secretarial Standards SS-1/SS-2',
      'Drafting Board Meeting Minutes',
      'General Meeting Minutes SS-2'
    ],
    forms: ['SS-1 Minutes Binder', 'SS-2 AGM Minutes'],
    entity_types: ['All Companies'],
    business_stage: 'Governance, Audit & Risk',
    keywords: ['board minutes', 'ss1', 'ss2', 'secretarial standards', 'notice', 'quorum']
  },
  '/services/form-csr2.html': {
    aliases: [
      'Form CSR-2 Corporate Social Responsibility',
      'CSR Report e-Filing RoC',
      'Section 135 CSR Compliance'
    ],
    forms: ['CSR-2'],
    entity_types: ['Companies meeting CSR thresholds'],
    business_stage: 'Governance, Audit & Risk',
    keywords: ['csr2', 'corporate social responsibility', '2 percent spend', 'schedule vii', 'csr committee']
  },
  '/services/form-mr3-secretarial-audit.html': {
    aliases: [
      'Form MR-3 Secretarial Audit',
      'Section 204 Secretarial Audit Report',
      'PCS Compliance Audit'
    ],
    forms: ['MR-3'],
    entity_types: ['Public Companies', 'Large Private Companies'],
    business_stage: 'Governance, Audit & Risk',
    keywords: ['mr3', 'secretarial audit', 'practicing company secretary', 'section 204', 'compliance review']
  },
  '/services/cyber-incident-reporting.html': {
    aliases: [
      'CERT-In Cyber Incident Reporting',
      '6-Hour Incident Notification Compliance',
      'Cybersecurity Regulatory Reporting'
    ],
    forms: ['CERT-In Incident Report'],
    entity_types: ['All Corporate & Tech Entities'],
    business_stage: 'Data Privacy & Tech Law',
    keywords: ['cert-in', 'cyber incident', 'ransomware', 'data breach', '6 hours', 'it act']
  },
  '/services/dpdp-compliance-audit.html': {
    aliases: [
      'DPDP Compliance Audit',
      'Digital Personal Data Protection Act 2023',
      'Data Protection Officer (DPO) Advisory',
      'Data Privacy Audit'
    ],
    forms: ['Data Fiduciary Audit Checklist'],
    entity_types: ['Data Fiduciaries', 'Tech Platforms'],
    business_stage: 'Data Privacy & Tech Law',
    keywords: ['dpdp', 'data protection', 'data fiduciary', 'consent manager', 'privacy policy', 'penalty']
  },
  '/services/saas-terms-privacy-architecture.html': {
    aliases: [
      'SaaS Terms of Service & Privacy Policy',
      'SaaS Legal Architecture',
      'B2B SaaS Subscription Terms',
      'Platform Privacy Policy'
    ],
    forms: ['Terms of Service', 'Privacy Policy', 'SLA'],
    entity_types: ['SaaS Companies', 'Digital Platforms'],
    business_stage: 'Data Privacy & Tech Law',
    keywords: ['saas terms', 'terms of service', 'privacy policy', 'sla', 'cloud software', 'ip license']
  },
  '/services/cross-border-tech-transfer.html': {
    aliases: [
      'Cross-Border Tech Transfer & IP Licensing',
      'FEMA Technology Transfer Advisory',
      'International Software Licensing'
    ],
    forms: ['Tech Transfer Agreement', 'Form FC-GPR/FLA'],
    entity_types: ['Multinationals', 'Cross-Border Tech Entities'],
    business_stage: 'International Business & FEMA',
    keywords: ['tech transfer', 'cross border', 'fema', 'royalty', 'ip licensing', 'withholding tax']
  },
  '/services/form-fc3-fc4.html': {
    aliases: [
      'Form FC-3 & FC-4 Foreign Company Returns',
      'Liaison Office & Branch Office Annual Filing',
      'Project Office RoC Compliance'
    ],
    forms: ['FC-3', 'FC-4'],
    entity_types: ['Foreign Companies with Place of Business in India'],
    business_stage: 'International Business & FEMA',
    keywords: ['fc3', 'fc4', 'foreign company', 'branch office', 'liaison office', 'rbi approval']
  },
  '/services/rbi-fla-return.html': {
    aliases: [
      'RBI FLA Return',
      'Foreign Liabilities & Assets Annual Return',
      'FLAIR Portal Return',
      'Annual FEMA Reporting'
    ],
    forms: ['FLA Return (FLAIRS)'],
    entity_types: ['Indian Companies with FDI or ODI'],
    business_stage: 'International Business & FEMA',
    keywords: ['fla', 'flair', 'rbi', 'fdi', 'odi', 'foreign liabilities', 'july 15']
  }
};

const searchRecords = [];
const coverageCsvRows = [
  ['Service ID', 'Route', 'Canonical Service Name', 'Primary Vertical', 'Status', 'Search Aliases', 'Statutory Forms', 'Route Verified']
];

registry.filter(entry => entry.record_status !== 'UTILITY_ROUTE').forEach(entry => {
  const filePath = path.join(ROOT, entry.canonical_route);
  const exists = fs.existsSync(filePath);

  const isReferral = referralSet.has(entry.canonical_route);
  const vId = entry.primary_vertical_id || (isReferral ? 'V10' : 'GENERAL');
  const vObj = verticalMap[vId];
  const vName = vObj ? vObj.vertical_name : (isReferral ? 'Dispute Avoidance (Non-Litigation)' : 'Corporate Services');

  let docTitle = '';
  let metaDesc = '';
  let heroP = '';
  let h1 = '';

  if (exists) {
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    docTitle = doc.querySelector('title')?.textContent?.trim() || '';
    metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    heroP = doc.querySelector('.if-service-hero p')?.textContent?.trim() || '';
    h1 = doc.querySelector('h1')?.textContent?.trim() || '';
  }

  const enrich = ENRICHMENTS[entry.canonical_route] || {
    aliases: [],
    forms: [],
    entity_types: ['Corporate Entities'],
    business_stage: 'Corporate Compliance',
    keywords: []
  };

  const statusLabel = isReferral ? 'REFERRAL_ONLY' : 'DIRECT_SERVICE';
  const displayStatus = isReferral ? 'Referral Service (Independent Counsel)' : 'Direct Regulatory Service';

  const record = {
    id: entry.service_id || (isReferral ? `REF-${path.basename(entry.canonical_route, '.html')}` : 'SVC-UNASSIGNED'),
    name: entry.service_name,
    route: entry.canonical_route,
    h1: h1 || entry.service_name,
    vertical_id: vId,
    vertical_name: vName,
    status: statusLabel,
    display_status: displayStatus,
    is_referral: isReferral,
    business_stage: enrich.business_stage,
    entity_types: enrich.entity_types,
    forms: enrich.forms,
    aliases: enrich.aliases,
    keywords: enrich.keywords,
    description: heroP || metaDesc || 'Official regulatory service by CraftEgon CCS.',
    search_tokens: [
      entry.service_name,
      entry.service_id || '',
      vName,
      enrich.business_stage,
      ...enrich.aliases,
      ...enrich.forms,
      ...enrich.keywords,
      ...enrich.entity_types
    ].join(' ').toLowerCase()
  };

  searchRecords.push(record);

  coverageCsvRows.push([
    record.id,
    record.route,
    `"${record.name.replace(/"/g, '""')}"`,
    `"${record.vertical_name.replace(/"/g, '""')}"`,
    record.status,
    `"${record.aliases.join('; ').replace(/"/g, '""')}"`,
    `"${record.forms.join(', ').replace(/"/g, '""')}"`,
    exists ? 'YES' : 'NO'
  ]);
});

searchRecords.push({
  id: 'TOOL-SEARCH',
  name: 'Corporate & IP Search Directory',
  route: '/search/',
  h1: 'Business Search Directory',
  vertical_id: 'TOOLS',
  vertical_name: 'Search Tools',
  status: 'DISCOVERY_TOOL',
  display_status: 'Business Search Tool',
  is_referral: false,
  is_directory: true,
  business_stage: 'Research & Lookup',
  entity_types: [],
  forms: [],
  aliases: ['Company search', 'LLP search', 'Trademark lookup', 'GSTIN validation'],
  keywords: ['company lookup', 'corporate search', 'business search', 'trademark', 'gstin'],
  description: 'Search company and LLP master data, trademarks, and GSTIN records.',
  search_tokens: 'corporate ip business search directory company lookup llp trademark gstin validation'
});

// Write canonical JSON index
fs.writeFileSync(path.join(ROOT, 'data', 'search-index.json'), JSON.stringify(searchRecords, null, 2), 'utf8');
console.log(`✅ Generated data/search-index.json with ${searchRecords.length} records.`);

// Write client-side JS bundle
const jsContent = `/**
 * CRAFTEGON CCS - UNIVERSAL CANONICAL SERVICE SEARCH INDEX
 * Auto-generated from canonical service registry and disk routes.
 * Total indexed services: ${searchRecords.length}
 */
window.CRAFTEGON_SERVICE_CATALOG = ${JSON.stringify(searchRecords)};
`;
fs.writeFileSync(path.join(ROOT, 'assets', 'js', 'search-index.js'), jsContent, 'utf8');
console.log(`✅ Generated assets/js/search-index.js`);

// Write Deliverable CSV
const reviewDir = path.join(ROOT, 'review-output', 'universal-service-search');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir, { recursive: true });
}
const csvContent = coverageCsvRows.map(row => row.join(',')).join('\n');
fs.writeFileSync(path.join(reviewDir, 'service-discovery-coverage.csv'), csvContent, 'utf8');
console.log(`✅ Generated review-output/universal-service-search/service-discovery-coverage.csv with ${coverageCsvRows.length - 1} rows.`);
