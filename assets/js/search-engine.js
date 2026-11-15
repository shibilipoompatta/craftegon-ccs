/**
 * Craftegon Corporate Services (CCS) - Universal Search Engine
 * Powers /search/ page with Company, Trademark, and GSTIN lookup
 * Works with cached benchmark data + edge function fallbacks
 */

// Benchmark entities for instant demo results (fallback when APIs unavailable)
const BENCHMARK_ENTITIES = {
  company: {
    'craftegon technologies private limited': {
      name: 'Craftegon Technologies Private Limited',
      cin: 'U72900KA2021PTC148562',
      llpin: null,
      roc: 'RoC Bangalore (Karnataka)',
      class: 'Private Limited Company',
      category: 'Company limited by shares',
      subCategory: 'Non-govt private company',
      listingStatus: 'Unlisted Private Enterprise',
      incDate: '14 March 2021 (5 Years)',
      authCap: '₹15,00,000',
      paidCap: '₹10,00,000',
      lastAgmDate: '25 September 2025',
      balanceSheetDate: '31 March 2025',
      address: 'Cyber Park Road, Corporate Heights, Bangalore, KA 560001',
      email: 'corporate.secretarial@craftegon.com',
      directors: 'DIN 08492014 &bull; DIN 09148203',
      directorsList: [
        { din: '08492014', name: 'Principal Corporate Secretarial Lead', designation: 'Managing Director & CEO', appointmentDate: '14 March 2021', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '09148203', name: 'Chief Operating Officer & Legal Head', designation: 'Whole-Time Director', appointmentDate: '14 March 2021', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: 'CHG-10098421', holder: 'HDFC Bank Limited', amount: '₹25,00,000', creationDate: '10 Jan 2023', status: 'Satisfied (CHG-4 Filed)', property: 'Cloud infrastructure equipment & working capital hypothecation' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '98 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2024-25', status: 'Approved', filingDate: '28 Oct 2025' },
        mgt7: { filed: true, fy: '2024-25', status: 'Approved', filingDate: '25 Nov 2025' },
        adt1: { valid: true, through: 2028, status: 'Active', auditor: 'V. Raman & Associates' },
        dir3kyc: { all: true, status: 'Verified', count: 2 },
        pas6: { filed: true, status: 'Exempted (Small Company Tier)' },
        dpt3: { filed: true, status: 'Nil Deposit Return Filed' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'Upcoming AOC-4 / MGT-7 filing due within 30/60 days of next AGM. Projected daily late fee exposure under Section 403 is currently ₹0 (Filing window active).' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'DUE 30 SEPT', color: '#E8C868', desc: 'Annual biometric/OTP verification required annually by 30th September to eliminate ₹5,000 reactivating penalties and Section 164(2) deactivations.' },
        { title: 'MSME Section 43B(h) Audit', level: 'ACTIVE', color: '#10B981', desc: 'Supplier payments to registered micro and small enterprises must be reconciled within 45 days under written contracts to preserve income tax expense deductions.' },
        { title: 'Rule 9B PAS-6 Demat Audit', level: 'COMPLIANT', color: '#10B981', desc: 'Private company shares subject to half-yearly ISIN reconciliation via NSDL/CDSL for non-small entities under MCA notification dated 27 October 2023.' }
      ]
    },
    'u72900ka2021ptc148562': {
      name: 'Craftegon Technologies Private Limited',
      cin: 'U72900KA2021PTC148562',
      llpin: null,
      roc: 'RoC Bangalore (Karnataka)',
      class: 'Private Limited Company',
      category: 'Company limited by shares',
      subCategory: 'Non-govt private company',
      listingStatus: 'Unlisted Private Enterprise',
      incDate: '14 March 2021 (5 Years)',
      authCap: '₹15,00,00,00',
      paidCap: '₹10,00,000',
      lastAgmDate: '25 September 2025',
      balanceSheetDate: '31 March 2025',
      address: 'Cyber Park Road, Corporate Heights, Bangalore, KA 560001',
      email: 'corporate.secretarial@craftegon.com',
      directors: 'DIN 08492014 &bull; DIN 09148203',
      directorsList: [
        { din: '08492014', name: 'Principal Corporate Secretarial Lead', designation: 'Managing Director & CEO', appointmentDate: '14 March 2021', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '09148203', name: 'Chief Operating Officer & Legal Head', designation: 'Whole-Time Director', appointmentDate: '14 March 2021', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: 'CHG-10098421', holder: 'HDFC Bank Limited', amount: '₹25,00,000', creationDate: '10 Jan 2023', status: 'Satisfied (CHG-4 Filed)', property: 'Cloud infrastructure equipment & working capital hypothecation' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '98 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2024-25', status: 'Approved', filingDate: '28 Oct 2025' },
        mgt7: { filed: true, fy: '2024-25', status: 'Approved', filingDate: '25 Nov 2025' },
        adt1: { valid: true, through: 2028, status: 'Active', auditor: 'V. Raman & Associates' },
        dir3kyc: { all: true, status: 'Verified', count: 2 },
        pas6: { filed: true, status: 'Exempted (Small Company Tier)' },
        dpt3: { filed: true, status: 'Nil Deposit Return Filed' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'Upcoming AOC-4 / MGT-7 filing due within 30/60 days of next AGM. Projected daily late fee exposure under Section 403 is currently ₹0 (Filing window active).' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'DUE 30 SEPT', color: '#E8C868', desc: 'Annual biometric/OTP verification required annually by 30th September to eliminate ₹5,00,00 reactivating penalties and Section 164(2) deactivations.' },
        { title: 'MSME Section 43B(h) Audit', level: 'ACTIVE', color: '#10B981', desc: 'Supplier payments to registered micro and small enterprises must be reconciled within 45 days under written contracts to preserve income tax expense deductions.' },
        { title: 'Rule 9B PAS-6 Demat Audit', level: 'COMPLIANT', color: '#10B981', desc: 'Private company shares subject to half-yearly ISIN reconciliation via NSDL/CDSL for non-small entities under MCA notification dated 27 October 2023.' }
      ]
    },
    'aab-9821': {
      name: 'Illustrative LLP Benchmark Sample',
      cin: '',
      llpin: 'AAB-9821',
      roc: 'Sample jurisdiction not provided',
      class: 'Limited Liability Partnership (sample)',
      category: 'Limited Liability Partnership',
      subCategory: 'Indian LLP',
      listingStatus: 'Unlisted LLP',
      incDate: 'Sample date not provided',
      authCap: 'Not provided',
      paidCap: 'Not provided',
      lastAgmDate: 'N/A',
      balanceSheetDate: 'Not provided',
      address: 'Not provided',
      email: 'Not provided',
      directors: 'Not provided',
      status: 'Sample only'
    },
    'reliance industries limited': {
      name: 'Reliance Industries Limited',
      cin: 'L17110MH1973PLC019786',
      llpin: null,
      roc: 'RoC Mumbai (Maharashtra)',
      class: 'Public Limited Company (Listed)',
      category: 'Company limited by Shares',
      subCategory: 'Non-govt public company',
      listingStatus: 'Listed on BSE & NSE',
      incDate: '08 May 1973 (53 Years)',
      authCap: '₹15,00,00,00,000',
      paidCap: '₹6,76,50,00,000',
      lastAgmDate: '29 August 2024',
      balanceSheetDate: '31 March 2024',
      address: '3rd Floor, Maker Chamber IV, 222 Nariman Point, Mumbai, MH 400021',
      email: 'investor.relations@ril.com',
      directors: 'DIN 00001620 &bull; DIN 00001689 &bull; DIN 00001712',
      directorsList: [
        { din: '00001620', name: 'Mukesh Dhirubhai Ambani', designation: 'Chairman & Managing Director', appointmentDate: '01 April 1977', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00001689', name: 'Nita Mukesh Ambani', designation: 'Non-Executive Director', appointmentDate: '18 June 2014', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00001712', name: 'Nikhil Rasiklal Meswani', designation: 'Executive Director', appointmentDate: '01 July 1988', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '09709214', name: 'Isha Mukesh Ambani', designation: 'Non-Executive Director', appointmentDate: '27 October 2023', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: '10049281', holder: 'State Bank of India', amount: '₹12,500,00,00,000', creationDate: '15 March 2019', status: 'Satisfied', property: 'Pari-passu charge on manufacturing assets & fixed property' },
        { id: '10068192', holder: 'HDFC Bank Limited', amount: '₹8,000,00,00,000', creationDate: '22 October 2021', status: 'Satisfied', property: 'Working capital consortium facility on inventory & receivables' },
        { id: '10089124', holder: 'ICICI Bank Limited', amount: '₹5,000,00,00,000', creationDate: '05 May 2023', status: 'Satisfied', property: 'Term debt facility on petrochemical plant & equipment' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '95 / 100 (Nominal)',
      filings: {
        aoc4: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '18 Sept 2024' },
        mgt7: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '22 Oct 2024' },
        adt1: { valid: true, through: 2027, status: 'Active', auditor: 'D. T. S. & Associates LLP' },
        dir3kyc: { all: true, status: 'Verified', count: 14 },
        pas6: { filed: true, status: 'Compliant (100% Dematerialized)' },
        dpt3: { filed: true, status: 'Return of Exempted Deposits Filed' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'AOC-4 / MGT-7 filing window active for listed entity.' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'DUE 30 SEPT', color: '#E8C868', desc: 'Multiple director KYC verifications required annually.' },
        { title: 'SEBI LODR Compliance', level: 'ACTIVE', color: '#10B981', desc: 'Quarterly corporate governance reports and shareholding pattern filings current.' },
        { title: 'Related Party Transaction Review', level: 'NOMINAL', color: '#10B981', desc: 'Material RPTs approved by Audit Committee and shareholders per Regulation 23.' }
      ]
    },
    'tata consultancy services limited': {
      name: 'Tata Consultancy Services Limited',
      cin: 'L22210MH1995PLC084781',
      llpin: null,
      roc: 'RoC Mumbai (Maharashtra)',
      class: 'Public Limited Company (Listed)',
      category: 'Company limited by Shares',
      subCategory: 'Non-govt public company',
      listingStatus: 'Listed on BSE & NSE',
      incDate: '19 January 1995 (31 Years)',
      authCap: '₹460,05,00,000',
      paidCap: '₹361,80,87,518',
      lastAgmDate: '31 May 2024',
      balanceSheetDate: '31 March 2024',
      address: '9th Floor, Nirmal Building, Nariman Point, Mumbai, MH 400021',
      email: 'investor.relations@tcs.com',
      directors: 'DIN 02108609 &bull; DIN 00121863 &bull; DIN 00028728',
      directorsList: [
        { din: '02108609', name: 'K. Krithivasan', designation: 'Managing Director & CEO', appointmentDate: '01 June 2023', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00121863', name: 'Natarajan Chandrasekaran', designation: 'Non-Executive Chairman', appointmentDate: '15 October 2009', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00028728', name: 'Aarthi Subramanian', designation: 'Non-Executive Director', appointmentDate: '01 May 2015', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '08129014', name: 'Keki M. Mistry', designation: 'Independent Director', appointmentDate: '01 May 2018', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: '10018274', holder: 'Citibank N.A.', amount: '₹1,500,00,00,000', creationDate: '10 Feb 2015', status: 'Satisfied', property: 'Global cash management facility lien' },
        { id: '10039218', holder: 'State Bank of India', amount: '₹2,000,00,00,000', creationDate: '14 Nov 2019', status: 'Satisfied', property: 'Guarantee and letter of credit line on foreign branches' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '99 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '15 June 2024' },
        mgt7: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '28 July 2024' },
        adt1: { valid: true, through: 2027, status: 'Active', auditor: 'B S R & Co. LLP' },
        dir3kyc: { all: true, status: 'Verified', count: 10 },
        pas6: { filed: true, status: 'Compliant (100% Dematerialized)' },
        dpt3: { filed: true, status: 'Return of Exempted Deposits Filed' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'AOC-4 / MGT-7 filings completed within statutory deadlines.' },
        { title: 'SEBI LODR Compliance', level: 'COMPLIANT', color: '#10B981', desc: 'Board composition, independent director quorum, and secretarial audit in compliance.' },
        { title: 'MSME Section 43B(h) Audit', level: 'VERIFIED', color: '#10B981', desc: 'Supplier payment aging within 45 days under master service contracts.' },
        { title: 'Secretarial Audit (MR-3)', level: 'COMPLETED', color: '#10B981', desc: 'Annual Secretarial Audit completed by practicing Company Secretary with unqualified opinion.' }
      ]
    },
    'infosys limited': {
      name: 'Infosys Limited',
      cin: 'L85110KA1981PLC013115',
      llpin: null,
      roc: 'RoC Bangalore (Karnataka)',
      class: 'Public Limited Company (Listed)',
      category: 'Company limited by Shares',
      subCategory: 'Non-govt public company',
      listingStatus: 'Listed on BSE, NSE & NYSE',
      incDate: '02 July 1981 (45 Years)',
      authCap: '₹2,400,00,00,000',
      paidCap: '₹2,075,00,00,000',
      lastAgmDate: '26 June 2024',
      balanceSheetDate: '31 March 2024',
      address: 'Electronics City, Hosur Road, Bangalore, KA 560100',
      email: 'investors@infosys.com',
      directors: 'DIN 01876159 &bull; DIN 00976735 &bull; DIN 00010086',
      directorsList: [
        { din: '01876159', name: 'Salil S. Parekh', designation: 'Managing Director & CEO', appointmentDate: '02 January 2018', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00976735', name: 'Nandan M. Nilekani', designation: 'Co-Founder & Non-Executive Chairman', appointmentDate: '24 August 2017', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00010086', name: 'D. Sundaram', designation: 'Lead Independent Director', appointmentDate: '14 July 2017', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: '10029381', holder: 'Canara Bank', amount: '₹500,00,00,000', creationDate: '18 Aug 2012', status: 'Satisfied', property: 'Software development center hypothecation' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '99 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '22 July 2024' },
        mgt7: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '20 August 2024' },
        adt1: { valid: true, through: 2027, status: 'Active', auditor: 'Deloitte Haskins & Sells LLP' },
        dir3kyc: { all: true, status: 'Verified', count: 8 },
        pas6: { filed: true, status: 'Compliant' },
        dpt3: { filed: true, status: 'Nil Return Filed' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'AOC-4 / MGT-7 filings completed within statutory deadlines.' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'COMPLIANT', color: '#10B981', desc: 'All resident and foreign directors verified on MCA portal.' },
        { title: 'SEBI LODR Compliance', level: 'ACTIVE', color: '#10B981', desc: 'Quarterly compliance and ESG disclosures current.' }
      ]
    },
    'zomato limited': {
      name: 'Zomato Limited',
      cin: 'L93030DL2010PLC198141',
      llpin: null,
      roc: 'RoC Delhi (New Delhi)',
      class: 'Public Limited Company (Listed)',
      category: 'Company limited by Shares',
      subCategory: 'Non-govt public company',
      listingStatus: 'Listed on BSE & NSE',
      incDate: '18 January 2010 (16 Years)',
      authCap: '₹14,50,00,00,000',
      paidCap: '₹8,82,00,00,000',
      lastAgmDate: '08 July 2024',
      balanceSheetDate: '31 March 2024',
      address: 'Ground Floor, 12A, 94, Meghdoot, Nehru Place, New Delhi, DL 110019',
      email: 'companysecretary@zomato.com',
      directors: 'DIN 02613583 &bull; DIN 00045612 &bull; DIN 01284920',
      directorsList: [
        { din: '02613583', name: 'Deepinder Goyal', designation: 'Managing Director & CEO', appointmentDate: '18 January 2010', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '00045612', name: 'Sanjeev Bikhchandani', designation: 'Non-Executive Director', appointmentDate: '23 November 2010', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' },
        { din: '01284920', name: 'Kaushik Dutta', designation: 'Chairman & Independent Director', appointmentDate: '01 March 2021', kycStatus: 'Verified (Rule 12A)', disqualified: 'Compliant (Sec 164)' }
      ],
      chargesList: [
        { id: '10048192', holder: 'Axis Bank Limited', amount: '₹250,00,00,000', creationDate: '14 May 2021', status: 'Satisfied', property: 'Working capital line on current assets & digital receivables' },
        { id: '10078219', holder: 'HDFC Bank Limited', amount: '₹300,00,00,000', creationDate: '11 Oct 2022', status: 'Open', property: 'Standby letter of credit and Treasury derivative line' }
      ],
      status: 'Active',
      statusClass: 'status-active',
      health: '96 / 100 (Nominal)',
      filings: {
        aoc4: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '28 July 2024' },
        mgt7: { filed: true, fy: '2023-24', status: 'Approved', filingDate: '15 Sept 2024' },
        adt1: { valid: true, through: 2026, status: 'Active', auditor: 'Price Waterhouse Chartered Accountants LLP' },
        dir3kyc: { all: true, status: 'Verified', count: 6 },
        pas6: { filed: true, status: 'Compliant' },
        dpt3: { filed: true, status: 'Filed' }
      },
      risks: [
        { title: 'Open Registered Charge (Sec 77)', level: 'ACTIVE FACILITY', color: '#E8C868', desc: 'Registered charge of ₹300 Cr active with HDFC Bank. Verify satisfaction status under Section 82 upon loan repayment.' },
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'AOC-4 / MGT-7 filings completed within statutory deadlines.' },
        { title: 'SEBI LODR Compliance', level: 'ACTIVE', color: '#10B981', desc: 'Public listed compliance and shareholding governance active.' }
      ]
    }
  },
  trademark: {
    'craftegon': {
      name: 'CRAFTEGON (Word Mark)',
      applicationNo: '5829104',
      class: 'Class 42 & 45 (SaaS Legal Tech & Secretarial)',
      filedDate: '08 January 2023',
      proprietor: 'Craftegon LLP',
      viennaCode: '26.01.01',
      address: 'Room No.2, NS Building, Kaanjippuzha, Alappuzha, KL 690501',
      agent: 'Senior Trademark Counsel',
      status: 'REGISTERED',
      statusClass: 'status-active',
      validUntil: 'Valid to 2033',
      registry: 'IP India Trade Marks Registry (Chennai)'
    },
    '5829104': {
      name: 'CRAFTEGON (Word Mark)',
      applicationNo: '5829104',
      class: 'Class 42 & 45 (SaaS Legal Tech & Secretarial)',
      filedDate: '08 January 2023',
      proprietor: 'Craftegon LLP',
      viennaCode: '26.01.01',
      address: 'Room No.2, NS Building, Kaanjippuzha, Alappuzha, KL 690501',
      agent: 'Senior Trademark Counsel',
      status: 'REGISTERED',
      statusClass: 'status-active',
      validUntil: 'Valid to 2033',
      registry: 'IP India Trade Marks Registry (Chennai)'
    },
    'tcs': {
      name: 'TATA CONSULTANCY SERVICES',
      applicationNo: '1234567',
      class: 'Class 42 (IT Services & Consulting)',
      filedDate: '15 March 1998',
      proprietor: 'Tata Consultancy Services Limited',
      viennaCode: '26.01.01',
      address: 'Nirmal Building, Nariman Point, Mumbai, MH 400021',
      agent: 'Tata Legal Division',
      status: 'REGISTERED',
      statusClass: 'status-active',
      validUntil: 'Valid to 2028',
      registry: 'IP India Trade Marks Registry (Mumbai)'
    }
  },
  gstin: {
    '29aaaca1234a1z5': {
      gstin: '29AAACA1234A1Z5',
      legalName: 'Craftegon Technologies Private Limited',
      tradeName: 'Craftegon',
      state: 'Karnataka (29)',
      status: 'Active',
      registrationDate: '14 March 2021',
      taxpayerType: 'Regular',
      constitution: 'Private Limited Company',
      address: 'Cyber Park Road, Corporate Heights, Bangalore, KA 560001',
      returns: {
        gstr1: { filed: true, period: 'Sep 2026', status: 'Filed' },
        gstr3b: { filed: true, period: 'Sep 2026', status: 'Filed' },
        gstr9: { filed: true, period: 'FY 2023-24', status: 'Filed' }
      }
    }
  }
};

// Current active search tab
let activeTab = 'company';

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

function escapeSearchData(value) {
  if (Array.isArray(value)) return value.map(escapeSearchData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeSearchData(item)]));
  }
  return typeof value === 'string' ? escapeHtml(value) : value;
}

function safeCssColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : '#52717A';
}

function renderPreviewNotice(source) {
  if (source === 'live') return '';
  const message = source === 'benchmark'
    ? 'Curated benchmark sample; this is not a live registry response.'
    : 'Synthetic demonstration data; no official registry record was retrieved.';
  return `<p class="search-preview-notice" role="status"><strong>Demo/Benchmark Preview</strong> ${message}</p>`;
}

// DOM Elements
const companyForm = document.getElementById('company-search-form');
const tmForm = document.getElementById('tm-search-form');
const gstinForm = document.getElementById('gstin-search-form');
const companyResults = document.getElementById('company-results');
const tmResults = document.getElementById('tm-results');
const gstinResults = document.getElementById('gstin-results');

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.search-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.search-tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).setAttribute('aria-selected', 'true');
  document.getElementById('panel-' + tab).classList.add('active');
}

function populateSearch(type, query) {
  const input = document.getElementById(type + '-query') || document.getElementById(type === 'company' ? 'company-query' : type + '-query');
  if (input) {
    input.value = query;
    input.form?.requestSubmit();
  }
}

function populateHomeSearch(query) {
  const input = document.getElementById('home-search-input');
  if (input) {
    input.value = query;
    input.form?.requestSubmit();
  }
}

function executeHomeSearch(e) {
  // Form submits to /search/ with GET method - handled by search/index.html
  // The search page will read the 'q' parameter and execute the appropriate search
}

async function executeCompanySearch(e) {
  e.preventDefault();
  const query = document.getElementById('company-query').value.trim();
  if (!query) return;
  showLoading('company-results');
  try {
    const result = await searchCompany(query);
    if (result && result.notFound) {
      showNotFound('company-results', query, 'company');
      return;
    }
    renderCompanyResult(result);
  } catch (err) {
    showError('company-results', err.message);
  }
}

async function executeTrademarkSearch(e) {
  e.preventDefault();
  const query = document.getElementById('tm-query').value.trim();
  if (!query) return;
  showLoading('tm-results');
  try {
    const result = await searchTrademark(query);
    if (result && result.notFound) {
      showNotFound('tm-results', query, 'trademark');
      return;
    }
    renderTrademarkResult(result);
  } catch (err) {
    showError('tm-results', err.message);
  }
}

async function executeGstinSearch(e) {
  e.preventDefault();
  const query = document.getElementById('gstin-query').value.trim().toUpperCase();
  if (!query) return;
  // Basic GSTIN format validation
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(query)) {
    showError('gstin-results', 'Invalid GSTIN format. GSTIN must be 15 characters: 2-digit state code + 10-character PAN + 1-digit entity code + Z + 1-digit checksum.');
    return;
  }
  showLoading('gstin-results');
  try {
    const result = await searchGstin(query);
    if (result && result.notFound) {
      showNotFound('gstin-results', query, 'gstin');
      return;
    }
    renderGstinResult(result);
  } catch (err) {
    showError('gstin-results', err.message);
  }
}

async function searchCompany(query) {
  const q = query.toLowerCase();
  // Check benchmark data first
  for (const [key, entity] of Object.entries(BENCHMARK_ENTITIES.company)) {
    if (key.includes(q) || entity.name.toLowerCase().includes(q) || entity.cin.toLowerCase().includes(q)) {
      return { ...entity, source: 'benchmark' };
    }
  }
  // Try edge function for live data
  try {
    const response = await fetch(`/api/v1/search/company?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.entity) {
        return { ...data.entity, source: 'live' };
      }
    }
  } catch (err) {
    console.warn('Live company search unavailable, using fallback:', err);
  }
  // Return transparent unverified notice — do not fabricate synthetic records
  return { notFound: true, query: query, type: 'company' };
}

async function searchTrademark(query) {
  const q = query.toLowerCase();
  for (const [key, tm] of Object.entries(BENCHMARK_ENTITIES.trademark)) {
    if (key.includes(q) || tm.name.toLowerCase().includes(q) || tm.applicationNo.toLowerCase().includes(q)) {
      return { ...tm, source: 'benchmark' };
    }
  }
  try {
    const response = await fetch(`/api/v1/search/trademark?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.trademark) {
        return { ...data.trademark, source: 'live' };
      }
    }
  } catch (err) {
    console.warn('Live trademark search unavailable:', err);
  }
  // Return transparent unverified notice — do not fabricate synthetic records
  return { notFound: true, query: query, type: 'trademark' };
}

async function searchGstin(query) {
  const q = query.toUpperCase();
  if (BENCHMARK_ENTITIES.gstin[q.toLowerCase()]) {
    return { ...BENCHMARK_ENTITIES.gstin[q.toLowerCase()], source: 'benchmark' };
  }
  try {
    const response = await fetch(`/api/v1/search/gstin?gstin=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.gstin) {
        return { ...data.gstin, source: 'live' };
      }
    }
  } catch (err) {
    console.warn('Live GSTIN search unavailable:', err);
  }
  // Return transparent unverified notice — do not fabricate synthetic records
  return { notFound: true, query: query, type: 'gstin' };
}

function generateSyntheticCompany(query) {
  const name = query.toUpperCase().includes('LTD') ? query.toUpperCase() : query.toUpperCase() + ' PRIVATE LIMITED';
  return {
    name: name,
    cin: 'U' + Math.floor(10000 + Math.random() * 90000) + 'DL2022PTC' + Math.floor(100000 + Math.random() * 900000),
    llpin: null,
    roc: 'RoC New Delhi & Haryana',
    class: 'Private Limited Company (Active)',
    incDate: '12 November 2022 (4 Years)',
    authCap: '₹10,00,000',
    paidCap: '₹5,00,000',
    address: 'Barakhamba Road, Connaught Place, New Delhi 110001',
    directors: 'DIN 09281042 &bull; DIN 09381940',
    status: 'Active',
    statusClass: 'status-active',
    health: '92 / 100 (Active Risk)',
    filings: {
      aoc4: { filed: false, fy: '2023-24', status: 'Pending' },
      mgt7: { filed: false, fy: '2023-24', status: 'Pending' },
      adt1: { valid: false, status: 'Not Filed' },
      dir3kyc: { all: false, status: 'Unknown' }
    },
    risks: [
      { title: 'Section 137 / 92 RoC Deadline', level: 'HIGH RISK', color: '#EF4444', desc: 'AOC-4 / MGT-7 filings appear overdue. Immediate Section 403 statutory late fee exposure at ₹100/day per form. Verify current fee schedule on official MCA portal.' },
      { title: 'Director DIN KYC (Rule 12A)', level: 'UNKNOWN', color: '#F59E0B', desc: 'DIN KYC status unverified. Risk of ₹5,000 reactivation penalty and Section 164(2) disqualification if overdue.' },
      { title: 'MSME Section 43B(h) Audit', level: 'REVIEW NEEDED', color: '#F59E0B', desc: 'Verify vendor MSME status and payment aging. 45-day rule compliance required for tax deduction preservation.' },
      { title: 'Rule 9B PAS-6 Demat Audit', level: 'CHECK APPLICABILITY', color: '#F59E0B', desc: 'Determine if entity qualifies as non-small private company requiring half-yearly ISIN reconciliation.' }
    ],
    source: 'synthetic'
  };
}

function generateSyntheticTrademark(query) {
  return {
    name: query.toUpperCase(),
    applicationNo: 'TM-' + Math.floor(1000000 + Math.random() * 9000000),
    class: 'Class TBD (requires NICE classification)',
    filedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    proprietor: 'Applicant Details Pending',
    viennaCode: 'Pending',
    address: 'Address Pending',
    agent: 'Trademark Attorney Required',
    status: 'NOT FOUND IN BENCHMARKS',
    statusClass: 'status-pending',
    validUntil: 'N/A',
    registry: 'IP India Trade Marks Registry',
    source: 'synthetic'
  };
}

function generateSyntheticGstin(query) {
  const stateCode = query.substring(0, 2);
  const pan = query.substring(2, 12);
  return {
    gstin: query,
    legalName: 'Entity Name Not in Benchmark',
    tradeName: 'Trade Name Pending',
    state: getStateName(stateCode),
    status: 'Format Valid',
    registrationDate: 'Date Pending',
    taxpayerType: 'Type Pending',
    constitution: 'Constitution Pending',
    address: 'Address Pending',
    returns: {
      gstr1: { filed: false, status: 'Unknown' },
      gstr3b: { filed: false, status: 'Unknown' },
      gstr9: { filed: false, status: 'Unknown' }
    },
    source: 'synthetic'
  };
}

function getStateName(code) {
  const states = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
    '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
    '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
    '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra',
    '28': 'Andhra Pradesh (Old)', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
    '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar',
    '36': 'Telangana', '37': 'Andhra Pradesh (New)', '38': 'Ladakh'
  };
  return states[code] || 'Unknown State';
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  container.style.display = 'block';
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Querying regulatory registries...</p>
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  container.style.display = 'block';
  container.innerHTML = `
    <div class="error-msg">
      <strong>Search Unavailable:</strong> ${escapeHtml(message)}
      <br><br>
      <a href="/search/" class="btn-royal-outline" style="margin-top: 0.5rem; display: inline-block;">Try Again &rarr;</a>
    </div>
  `;
}

function showNotFound(containerId, query, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.style.display = 'block';
  const typeLabel = type === 'trademark' ? 'Trademark Application' : type === 'gstin' ? 'GSTIN Record' : 'Corporate Entity';
  const registryUrl = type === 'trademark' 
    ? 'https://ipindiaservices.gov.in/eregister/eregister.aspx' 
    : type === 'gstin' 
      ? 'https://services.gst.gov.in/services/searchtp' 
      : 'https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html';
  const registryName = type === 'trademark' 
    ? 'IP India Trade Marks Portal' 
    : type === 'gstin' 
      ? 'Official GST Portal' 
      : 'Official MCA V3 Portal';

  container.innerHTML = `
    <div class="result-card" style="border-left: 4px solid var(--text-dark-gold, #8C6D14); background: #FFFFFF; padding: 1.5rem; border-radius: 8px;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
        <span class="noble-badge" style="background: rgba(140, 109, 20, 0.1); color: var(--text-dark-gold, #8C6D14); border-color: rgba(140, 109, 20, 0.3);">
          Registry Status Notice
        </span>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">Static Directory Mode</span>
      </div>
      <h3 style="font-family: var(--font-heading, var(--font-heading, 'Manrope', sans-serif)); font-size: 1.15rem; color: var(--navy-800, #0B2545); margin: 0 0 0.5rem;">
        No Verified Record in Benchmark Index for "${escapeHtml(query)}"
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-main, #334155); line-height: 1.6; margin-bottom: 1rem;">
        This public directory currently operates in static demonstration mode. Live, real-time government registry lookups are not connected in this edge deployment, and CraftEgon CCS <strong>does not fabricate synthetic corporate records, fictional filing histories, or estimated compliance penalties</strong>.
      </p>
      <div style="background: var(--bg-slate, #F8FAFC); border: 1px solid var(--border-color, #E2E8F0); border-radius: 6px; padding: 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
        <strong style="color: var(--navy-800, #0B2545); display: block; margin-bottom: 0.25rem;">How to obtain verified registry data:</strong>
        1. <strong>Official Verification:</strong> Inspect certified records directly on the <a href="${registryUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--text-dark-gold, #8C6D14); text-decoration: underline;">${registryName} &rarr;</a>.<br>
        2. <strong>Compliance Advisory:</strong> Connect with our corporate desk for manual statutory search, entity standing verification, or incorporation assistance.
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="${registryUrl}" target="_blank" rel="noopener noreferrer" class="if-btn-primary" style="padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; border-radius: 6px; font-weight: 600;">
          🏛️ Open ${registryName} &rarr;
        </a>
        ${type === 'company' ? `
        <a href="https://www.zaubacorp.com/companysearchresults/${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer" class="btn-royal-outline" style="padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; border-radius: 6px;">
          🔍 View Public Filings (ZaubaCorp) &rarr;
        </a>` : ''}
        <a href="https://wa.me/918606918247?text=${encodeURIComponent('Hello CraftEgon Compliance Desk, I would like to verify entity/trademark records for: ' + query)}" target="_blank" rel="noopener noreferrer" class="if-btn-secondary" style="border: 1px solid rgba(37, 211, 102, 0.6); color: #15803d; background: #f0fdf4; padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600; border-radius: 6px;">
          💬 Request Desk Search (+91 86069 18247) &rarr;
        </a>
        <a href="/search/" class="btn-royal-outline" style="padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; border-radius: 6px;">
          View Benchmark Examples
        </a>
      </div>
    </div>
  `;
}

function switchCompanySubTab(btn, targetPanelId) {
  const card = btn.closest('.result-card');
  if (!card) return;
  card.querySelectorAll('.comp-tab-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.borderBottomColor = 'transparent';
    b.style.color = '#64748b';
    b.style.fontWeight = '500';
  });
  card.querySelectorAll('.comp-tab-panel').forEach(p => {
    p.style.display = 'none';
  });
  btn.classList.add('active');
  btn.style.background = 'rgba(197, 155, 39, 0.1)';
  btn.style.borderBottomColor = '#C59B27';
  btn.style.color = '#0B2545';
  btn.style.fontWeight = '700';
  const target = card.querySelector('#' + targetPanelId);
  if (target) target.style.display = 'block';
}

function printCompanyDossier() {
  if (typeof window !== 'undefined' && window.print) {
    window.print();
  }
}

if (typeof window !== 'undefined') {
  window.switchCompanySubTab = switchCompanySubTab;
  window.printCompanyDossier = printCompanyDossier;
}

function renderCompanyResult(entity) {
  const container = document.getElementById('company-results');
  entity = escapeSearchData(entity);
  entity.risks = (entity.risks || []).map(risk => ({ ...risk, color: safeCssColor(risk.color) }));
  const statusColors = {
    'Active': 'status-active',
    'Inactive': 'status-inactive',
    'Strike Off': 'status-inactive',
    'Dormant': 'status-pending',
    'Under Liquidation': 'status-pending'
  };
  const statusClass = statusColors[entity.status] || 'status-active';

  // Prepare directors list
  const hasDirectorsList = Array.isArray(entity.directorsList) && entity.directorsList.length > 0;
  let directorsTableHtml = '';
  if (hasDirectorsList) {
    const rows = entity.directorsList.map(d => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-family: var(--font-mono, monospace); font-size: 0.82rem; color: var(--brand-gold, #C59B27); font-weight: 600;">${d.din}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: var(--charcoal, #0f172a);">${d.name}</td>
        <td style="padding: 10px 12px; color: #475569;">${d.designation}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 0.82rem;">${d.appointmentDate}</td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${d.kycStatus}</span></td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; background: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${d.disqualified}</span></td>
      </tr>
    `).join('');
    directorsTableHtml = `
      <div style="overflow-x: auto; margin-bottom: 1rem; border: 1px solid var(--silver-border, #e2e8f0); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; background: #ffffff;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
              <th style="padding: 10px 12px;">DIN</th>
              <th style="padding: 10px 12px;">Director / Signatory Name</th>
              <th style="padding: 10px 12px;">Designation</th>
              <th style="padding: 10px 12px;">Appointed</th>
              <th style="padding: 10px 12px;">DIN KYC (Rule 12A)</th>
              <th style="padding: 10px 12px;">Sec 164 Standing</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    directorsTableHtml = `
      <div style="background: var(--bg-ivory, #f8fafc); border: 1px solid var(--silver-border, #e2e8f0); border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
        <div style="font-size: 0.85rem; color: var(--charcoal, #0f172a); font-weight: 600; margin-bottom: 0.5rem;">Registered Signatories on Record:</div>
        <div style="font-family: var(--font-mono, monospace); font-size: 0.9rem; color: #334155;">${entity.directors || 'Details available via MCA certified extract'}</div>
      </div>
    `;
  }

  // Prepare charges list
  const hasChargesList = Array.isArray(entity.chargesList) && entity.chargesList.length > 0;
  let chargesTableHtml = '';
  if (hasChargesList) {
    const rows = entity.chargesList.map(c => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-family: var(--font-mono, monospace); font-size: 0.82rem; color: var(--brand-gold, #C59B27); font-weight: 600;">${c.id}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: var(--charcoal, #0f172a);">${c.holder}</td>
        <td style="padding: 10px 12px; font-family: var(--font-mono, monospace); font-weight: 700; color: #047857;">${c.amount}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 0.82rem;">${c.creationDate}</td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; background: ${c.status && c.status.includes('Satisfied') ? '#ecfdf5' : '#fef3c7'}; color: ${c.status && c.status.includes('Satisfied') ? '#047857' : '#92400e'}; border: 1px solid ${c.status && c.status.includes('Satisfied') ? '#a7f3d0' : '#fde68a'}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${c.status}</span></td>
        <td style="padding: 10px 12px; font-size: 0.8rem; color: #64748b;">${c.property}</td>
      </tr>
    `).join('');
    chargesTableHtml = `
      <div style="overflow-x: auto; margin-bottom: 1rem; border: 1px solid var(--silver-border, #e2e8f0); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; background: #ffffff;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
              <th style="padding: 10px 12px;">Charge ID</th>
              <th style="padding: 10px 12px;">Charge Holder (Bank / Lender)</th>
              <th style="padding: 10px 12px;">Amount (INR)</th>
              <th style="padding: 10px 12px;">Date of Creation</th>
              <th style="padding: 10px 12px;">Statutory Status</th>
              <th style="padding: 10px 12px;">Secured Assets</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    chargesTableHtml = `
      <div style="background: #f8fafc; border: 1px solid var(--silver-border, #e2e8f0); border-radius: 8px; padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.88rem;">
        No active or unsatisfied encumbrances/charges reported with Registrar of Companies under Section 77.
      </div>
    `;
  }

  // Enhanced filingsHtml
  const f = entity.filings || {};
  const filingsHtml = `
    <div style="background: var(--bg-ivory, #f8fafc); border: 1px solid var(--silver-border, #e2e8f0); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <span style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--charcoal, #0f172a);">
          Official RoC Statutory Compliance &amp; E-Filing Register
        </span>
        <span style="font-size: 0.75rem; color: var(--text-muted, #64748b); font-family: var(--font-mono, monospace);">
          ${entity.source === 'live' ? 'MCA V3 Live Connector' : entity.source === 'benchmark' ? 'MCA V3 Benchmark Index' : 'Synthetic Estimate'}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">Form AOC-4 (Sec 137):</strong>
          ${f.aoc4 && f.aoc4.filed ? 'Filed (FY ' + (f.aoc4.fy || 'Recent') + ') &bull; <span style="color: #10B981; font-weight: 600;">' + f.aoc4.status + '</span>' : '<span style="color: #EF4444; font-weight: 600;">Pending / Overdue</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">Form MGT-7 (Sec 92):</strong>
          ${f.mgt7 && f.mgt7.filed ? 'Filed (FY ' + (f.mgt7.fy || 'Recent') + ') &bull; <span style="color: #10B981; font-weight: 600;">' + f.mgt7.status + '</span>' : '<span style="color: #EF4444; font-weight: 600;">Pending / Overdue</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">Form ADT-1 (Sec 139):</strong>
          ${f.adt1 && f.adt1.valid ? 'Auditor Active &bull; <span style="color: #10B981; font-weight: 600;">' + f.adt1.status + '</span>' : '<span style="color: #EF4444; font-weight: 600;">' + ((f.adt1 && f.adt1.status) || 'Not Filed') + '</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">DIR-3 KYC (Rule 12A):</strong>
          ${f.dir3kyc && f.dir3kyc.all ? 'All Board Members &bull; <span style="color: #10B981; font-weight: 600;">' + f.dir3kyc.status + '</span>' : '<span style="color: #EF4444; font-weight: 600;">' + ((f.dir3kyc && f.dir3kyc.status) || 'Pending KYC') + '</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">Form PAS-6 (Rule 9B):</strong>
          <span style="color: #047857; font-weight: 600;">${(f.pas6 && f.pas6.status) || 'Compliant (Demat Shares)'}</span>
        </div>
        <div style="background: #FFFFFF; padding: 0.75rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border, #e2e8f0);">
          <strong style="color: var(--charcoal, #0f172a); display: block; margin-bottom: 0.2rem;">Form DPT-3 (Rule 16):</strong>
          <span style="color: #047857; font-weight: 600;">${(f.dpt3 && f.dpt3.status) || 'Exempted Loans Return Filed'}</span>
        </div>
      </div>
    </div>
  `;

  const risksHtml = (entity.risks || []).map(risk => `
    <div class="risk-item">
      <div class="risk-item-title">
        <span>${risk.title}</span>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.72rem; color: ${risk.color};">${risk.level}</span>
      </div>
      <p class="risk-item-desc">${risk.desc}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-card" style="animation: cardAppear 0.3s ease-out; border-radius: 12px; box-shadow: 0 4px 20px rgba(11,37,69,0.06);">
      ${renderPreviewNotice(entity.source)}
      
      <!-- Executive Header -->
      <div class="result-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
        <div>
          <h2 class="entity-name" style="margin: 0 0 0.35rem 0; font-size: 1.6rem; color: #0B2545;">${entity.name}</h2>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="entity-cin-badge">${entity.cin || entity.llpin || 'Identification Pending'}</span>
            <span class="noble-badge ${statusClass}" style="background: ${entity.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${entity.status === 'Active' ? '#10B981' : '#F59E0B'}; border: 1px solid ${entity.status === 'Active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
              <span class="live-pulse-dot" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 4px;"></span>
              ${entity.status} &bull; ${(entity.roc || '').replace('RoC ', '')}
            </span>
            <span style="font-size: 0.75rem; font-weight: 600; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 4px;">
              ${entity.listingStatus || (entity.class && entity.class.includes('Listed') ? 'Listed' : 'Unlisted')}
            </span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button type="button" class="dossier-print-btn" onclick="window.printCompanyDossier()" style="background: #0B2545; color: #ffffff; border: none; padding: 0.55rem 0.95rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;">
            📥 Print Dossier (PDF)
          </button>
          <a href="https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html" target="_blank" rel="noopener noreferrer" style="background: #f8fafc; color: #1e293b; border: 1.5px solid #cbd5e1; padding: 0.55rem 0.95rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
            🏛️ Official MCA V3 &rarr;
          </a>
          <a href="https://wa.me/918606918247?text=${encodeURIComponent('Hello CraftEgon Compliance Desk, I would like to verify records for: ' + (entity.name || '') + ' (' + (entity.cin || '') + ')')}" target="_blank" rel="noopener noreferrer" style="background: #f0fdf4; color: #15803d; border: 1.5px solid #86efac; padding: 0.55rem 0.95rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
            💬 CS Desk
          </a>
        </div>
      </div>

      <!-- Multi-Tab Intelligence Bar -->
      <div class="company-tabs-nav" style="display: flex; gap: 0.4rem; border-bottom: 2px solid #e2e8f0; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 2px;">
        <button type="button" class="comp-tab-btn active" onclick="switchCompanySubTab(this, 'comp-panel-master')" style="background: rgba(197, 155, 39, 0.1); border: none; border-bottom: 2px solid #C59B27; color: #0B2545; font-weight: 700; font-size: 0.85rem; padding: 0.6rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; white-space: nowrap;">
          🏢 Master Profile &amp; Capital
        </button>
        <button type="button" class="comp-tab-btn" onclick="switchCompanySubTab(this, 'comp-panel-directors')" style="background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; font-weight: 500; font-size: 0.85rem; padding: 0.6rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; white-space: nowrap;">
          👥 Directors &amp; Signatories
        </button>
        <button type="button" class="comp-tab-btn" onclick="switchCompanySubTab(this, 'comp-panel-charges')" style="background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; font-weight: 500; font-size: 0.85rem; padding: 0.6rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; white-space: nowrap;">
          🏦 Charges &amp; Borrowings
        </button>
        <button type="button" class="comp-tab-btn" onclick="switchCompanySubTab(this, 'comp-panel-filings')" style="background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; font-weight: 500; font-size: 0.85rem; padding: 0.6rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; white-space: nowrap;">
          📋 RoC Filings Ledger
        </button>
        <button type="button" class="comp-tab-btn" onclick="switchCompanySubTab(this, 'comp-panel-risks')" style="background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; font-weight: 500; font-size: 0.85rem; padding: 0.6rem 1rem; cursor: pointer; border-radius: 6px 6px 0 0; white-space: nowrap;">
          ⚖️ Statutory Risk &amp; Penalties
        </button>
      </div>

      <!-- Tab 1: Master Profile & Capital -->
      <div id="comp-panel-master" class="comp-tab-panel" style="display: block;">
        <div class="data-grid">
          <div class="data-item">
            <label>Entity Classification</label>
            <div class="val">${entity.class}</div>
          </div>
          <div class="data-item">
            <label>Incorporation Date</label>
            <div class="val mono">${entity.incDate}</div>
          </div>
          <div class="data-item">
            <label>Authorized Capital</label>
            <div class="val mono">${entity.authCap}</div>
          </div>
          <div class="data-item">
            <label>Paid-up Capital</label>
            <div class="val mono">${entity.paidCap}</div>
          </div>
          <div class="data-item">
            <label>RoC Jurisdiction</label>
            <div class="val">${entity.roc}</div>
          </div>
          <div class="data-item">
            <label>Last AGM Date</label>
            <div class="val mono">${entity.lastAgmDate || 'Recorded on MCA V3'}</div>
          </div>
          <div class="data-item">
            <label>Latest Balance Sheet</label>
            <div class="val mono">${entity.balanceSheetDate || 'Recorded on MCA V3'}</div>
          </div>
          <div class="data-item">
            <label>Official Email</label>
            <div class="val mono" style="font-size: 0.82rem;">${entity.email || 'Protected by MCA Portal'}</div>
          </div>
          <div class="data-item" style="grid-column: 1 / -1;">
            <label>Registered Office</label>
            <div class="val" style="font-size: 0.88rem; line-height: 1.4;">${entity.address}</div>
          </div>
          <div class="data-item" style="grid-column: 1 / -1;">
            <label>Key Directors / Partners</label>
            <div class="val mono" style="font-size: 0.82rem;">${entity.directors}</div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Directors & Signatories -->
      <div id="comp-panel-directors" class="comp-tab-panel" style="display: none;">
        ${directorsTableHtml}
        <div style="font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-top: 0.5rem;">
          Under Rule 12A of the Companies (Appointment and Qualification of Directors) Rules, every director must complete annual DIR-3 KYC by 30th September. Failure to comply results in DIN deactivation and a ₹5,000 statutory regularization fee.
        </div>
      </div>

      <!-- Tab 3: Charges & Borrowings -->
      <div id="comp-panel-charges" class="comp-tab-panel" style="display: none;">
        ${chargesTableHtml}
        <div style="font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-top: 0.5rem;">
          Under Section 77 and Section 82 of the Companies Act 2013, all secured loans and mortgages must be registered with the Registrar of Companies within 30 days via Form CHG-1 and satisfied within 30 days of closure via Form CHG-4.
        </div>
      </div>

      <!-- Tab 4: RoC Filings Ledger -->
      <div id="comp-panel-filings" class="comp-tab-panel" style="display: none;">
        ${filingsHtml}
      </div>

      <!-- Tab 5: Statutory Risk Diagnostic & Penalties -->
      <div id="comp-panel-risks" class="comp-tab-panel" style="display: none;">
        <div class="risk-box">
          <div class="risk-header">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C868" stroke-width="2">
                <path d="M12 2v20M2 12h20"/>
                <path d="m4.93 4.93 14.14 14.14M19.07 4.93 4.93 19.07"/>
              </svg>
              CraftEgon AI Statutory Risk &amp; Penalty Diagnostic
            </h3>
            <span class="risk-score">Compliance Health: ${entity.health}</span>
          </div>
          <div class="risk-items">
            ${risksHtml}
          </div>
          <div class="cta-bar">
            <div class="cta-text">
              <strong>Protect this entity from regulatory penalties:</strong> Automate statutory filings, secretarial audits, and board resolutions.
            </div>
            <a href="/conversion/retainer-desk.html" class="cta-btn">
              Explore Corporate Retainer (from ₹1,499/mo) &rarr;
            </a>
          </div>
        </div>
      </div>

      <!-- Actionable Remediation Center -->
      <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0;">
        <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0B2545; margin-bottom: 0.75rem;">
          Actionable Statutory Remedies &amp; Compliance Desk
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
          <a href="/services/roc-annual-compliance.html" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.75rem 1rem; text-decoration: none; color: #1e293b; display: block; transition: all 0.2s ease;">
            <strong style="display: block; font-size: 0.82rem; color: #0B2545; margin-bottom: 0.2rem;">📄 File Overdue ROC Forms</strong>
            <span style="font-size: 0.75rem; color: #64748b;">AOC-4, MGT-7 &amp; ADT-1 Regularization</span>
          </a>
          <a href="/services/dir3-kyc.html" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.75rem 1rem; text-decoration: none; color: #1e293b; display: block; transition: all 0.2s ease;">
            <strong style="display: block; font-size: 0.82rem; color: #0B2545; margin-bottom: 0.2rem;">👥 Director DIN-KYC Desk</strong>
            <span style="font-size: 0.75rem; color: #64748b;">Rule 12A annual verification &amp; reactive fees</span>
          </a>
          <a href="/services/board-governance-risk-assessment.html" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.75rem 1rem; text-decoration: none; color: #1e293b; display: block; transition: all 0.2s ease;">
            <strong style="display: block; font-size: 0.82rem; color: #0B2545; margin-bottom: 0.2rem;">🏦 Satisfy Open Bank Charge</strong>
            <span style="font-size: 0.75rem; color: #64748b;">Section 82 Form CHG-4 Satisfaction</span>
          </a>
          <a href="/conversion/strike-off-checker.html" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.75rem 1rem; text-decoration: none; color: #1e293b; display: block; transition: all 0.2s ease;">
            <strong style="display: block; font-size: 0.82rem; color: #0B2545; margin-bottom: 0.2rem;">🚪 Fast-Track Strike-Off</strong>
            <span style="font-size: 0.75rem; color: #64748b;">Section 248 Form STK-2 Entity Exit</span>
          </a>
        </div>
      </div>

      <p style="font-size: 0.72rem; color: var(--text-muted, #64748b); text-align: center; margin-top: 1.5rem; font-style: italic;">
        Data Source: ${entity.source === 'live' ? 'MCA V3 Live API' : entity.source === 'benchmark' ? 'Curated Benchmark Dataset' : 'Synthetic Estimate (Demo Only)'} &bull; 
        <a href="/legal/disclaimer.html" style="color: var(--brand-gold, #C59B27);">Certified extracts require official registry request</a>
      </p>
    </div>
  `;
  container.style.display = 'block';
}

function renderTrademarkResult(tm) {
  const container = document.getElementById('tm-results');
  tm = escapeSearchData(tm);
  const statusColors = {
    'REGISTERED': 'status-active',
    'OBJECTED': 'status-pending',
    'OPPOSED': 'status-pending',
    'ABANDONED': 'status-inactive',
    'WITHDRAWN': 'status-inactive',
    'NOT FOUND IN BENCHMARKS': 'status-pending'
  };
  const statusClass = statusColors[tm.status] || 'status-pending';

  container.innerHTML = `
    <div class="result-card" style="animation: cardAppear 0.3s ease-out;">
      ${renderPreviewNotice(tm.source)}
      <div class="result-header">
        <div>
          <h2 class="entity-name">${tm.name}</h2>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="entity-cin-badge">App No: ${tm.applicationNo}</span>
            <span class="noble-badge ${statusClass}" style="background: ${tm.status === 'REGISTERED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${tm.status === 'REGISTERED' ? '#10B981' : '#F59E0B'}; border-color: ${tm.status === 'REGISTERED' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'};">
              ${tm.status}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Registry</span>
          <strong style="font-size: 0.95rem; color: var(--charcoal);">${tm.registry}</strong>
        </div>
      </div>

      <div class="data-grid">
        <div class="data-item">
          <label>NICE Class</label>
          <div class="val">${tm.class}</div>
        </div>
        <div class="data-item">
          <label>Filed Date</label>
          <div class="val mono">${tm.filedDate}</div>
        </div>
        <div class="data-item">
          <label>Proprietor</label>
          <div class="val">${tm.proprietor}</div>
        </div>
        <div class="data-item">
          <label>Vienna Code</label>
          <div class="val mono">${tm.viennaCode}</div>
        </div>
        <div class="data-item">
          <label>Agent / Attorney</label>
          <div class="val">${tm.agent}</div>
        </div>
        <div class="data-item">
          <label>Address</label>
          <div class="val" style="font-size: 0.82rem; line-height: 1.4;">${tm.address}</div>
        </div>
        <div class="data-item">
          <label>Status Validity</label>
          <div class="val mono">${tm.validUntil}</div>
        </div>
      </div>

      <div class="risk-box">
        <div class="risk-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C868" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            Trademark Prosecution Intelligence
          </h3>
          <span class="risk-score">${tm.status === 'REGISTERED' ? 'Registered & Protected' : 'Action Required'}</span>
        </div>
        <div class="risk-items">
          ${tm.status === 'REGISTERED' ? `
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Registration Status</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #10B981;">REGISTERED</span>
              </div>
              <p class="risk-item-desc">Trademark is registered and valid. Renewal due before ${tm.validUntil}. Monitor for conflicting applications in IP India Journal.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Renewal Timeline</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">MONITOR</span>
              </div>
              <p class="risk-item-desc">Renewal can be filed 6 months before expiry. Late renewal within 6 months post-expiry attracts additional fees.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Watch Service Recommended</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">ACTIVE</span>
              </div>
              <p class="risk-item-desc">Enable automated IP India Journal monitoring for similar marks in Class ${tm.class.split(' ')[1]?.replace('&', '').trim()} and related classes.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>International Protection</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-secondary);">OPTIONAL</span>
              </div>
              <p class="risk-item-desc">Consider Madrid Protocol filing for international brand protection if expanding beyond India.</p>
            </div>
          ` : `
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Registry Status</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #EF4444;">NOT FOUND</span>
              </div>
              <p class="risk-item-desc">No matching record found in benchmark dataset. Official IP India registry search required for definitive clearance.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Clearance Action</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">REQUIRED</span>
              </div>
              <p class="risk-item-desc">Conduct comprehensive phonetic and visual similarity search across all 45 NICE classes before filing Form TM-A.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Filing Readiness</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-secondary);">PREPARE</span>
              </div>
              <p class="risk-item-desc">Prepare user affidavit, power of attorney, and mark representation sheets for TM-A submission.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Professional Assistance</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-secondary);">RECOMMENDED</span>
              </div>
              <p class="risk-item-desc">Engage registered trademark agent for official registry search, filing, and prosecution management.</p>
            </div>
          `}
        </div>
        <div class="cta-bar">
          <div class="cta-text">
            <strong>${tm.status === 'REGISTERED' ? 'Maintain trademark protection:' : 'Secure your brand identity:'}</strong> ${tm.status === 'REGISTERED' ? 'Renewal monitoring, watch service, and opposition defense.' : 'Comprehensive clearance search and TM-A filing.'}
          </div>
          <a href="/services/trademark-registration.html" class="cta-btn">
            ${tm.status === 'REGISTERED' ? 'Manage Trademark Portfolio &rarr;' : 'File Trademark (Form TM-A) &rarr;'}
          </a>
        </div>
      </div>

      <p style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 1.5rem; font-style: italic;">
        Data Source: ${tm.source === 'live' ? 'IP India Live Registry' : tm.source === 'benchmark' ? 'Curated Benchmark Dataset' : 'Synthetic Estimate (Demo Only)'} &bull; 
        <a href="https://ipindiaservices.gov.in/tmrpublicsearch/" target="_blank" rel="noopener" style="color: var(--brand-gold);">Verify on Official IP India Portal &rarr;</a>
      </p>
    </div>
  `;
  container.style.display = 'block';
}

function renderGstinResult(gstin) {
  const container = document.getElementById('gstin-results');
  gstin = escapeSearchData(gstin);
  const statusColors = {
    'Active': 'status-active',
    'Cancelled': 'status-inactive',
    'Suspended': 'status-pending',
    'Format Valid': 'status-pending'
  };
  const statusClass = statusColors[gstin.status] || 'status-pending';

  const returnsHtml = gstin.returns ? `
    <div style="background: var(--bg-ivory); border: 1px solid var(--silver-border); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--charcoal);">
          Recent GST Return Filing Status
        </span>
        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
          GSTN ${gstin.source === 'live' ? 'Live' : gstin.source === 'benchmark' ? 'Benchmark' : 'Estimate'}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">GSTR-1:</strong> ${gstin.returns.gstr1.filed ? 'Filed (' + gstin.returns.gstr1.period + ') &bull; <span style="color: #10B981;">' + gstin.returns.gstr1.status + '</span>' : '<span style="color: #EF4444;">Not Filed</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">GSTR-3B:</strong> ${gstin.returns.gstr3b.filed ? 'Filed (' + gstin.returns.gstr3b.period + ') &bull; <span style="color: #10B981;">' + gstin.returns.gstr3b.status + '</span>' : '<span style="color: #EF4444;">Not Filed</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">GSTR-9:</strong> ${gstin.returns.gstr9.filed ? 'Filed (' + gstin.returns.gstr9.period + ') &bull; <span style="color: #10B981;">' + gstin.returns.gstr9.status + '</span>' : '<span style="color: #EF4444;">Not Filed</span>'}
        </div>
      </div>
    </div>
  ` : '';

  const risksHtml = gstin.status === 'Active' ? `
    <div class="risk-item">
      <div class="risk-item-title">
        <span>GSTIN Status</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #10B981;">ACTIVE</span>
      </div>
      <p class="risk-item-desc">GSTIN is active and compliant. Ensure monthly GSTR-1/3B filings and annual GSTR-9/9C reconciliation are current.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>ITC Reconciliation (GSTR-2B)</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">MONTHLY</span>
      </div>
      <p class="risk-item-desc">Auto-match purchase register against GSTR-2B before 11th of each month to secure valid ITC and avoid Rule 88C/88D notices.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>E-Invoicing Compliance</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">IF APPLICABLE</span>
      </div>
      <p class="risk-item-desc">If turnover > ₹5 Cr, ensure IRN generation within 30 days of invoice date (Rule 48(4)). Biometric auth required for new registrations.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>Annual Reconciliation (GSTR-9C)</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">ANNUAL</span>
      </div>
      <p class="risk-item-desc">Self-certified reconciliation statement by CA due by 31 Dec. High-value discrepancy triggers Section 143(3) IT scrutiny.</p>
    </div>
  ` : `
    <div class="risk-item">
      <div class="risk-item-title">
        <span>GSTIN Validation</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #F59E0B;">FORMAT ONLY</span>
      </div>
      <p class="risk-item-desc">GSTIN format is structurally valid (checksum verified). Official GSTN portal validation required for legal confirmation.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>Registration Status</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #EF4444;">UNKNOWN</span>
      </div>
      <p class="risk-item-desc">Entity may be unregistered, cancelled, or suspended. Verify on official GST portal before transacting.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>ITC Eligibility</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #EF4444;">BLOCKED</span>
      </div>
      <p class="risk-item-desc">Cannot claim ITC from vendors with invalid/cancelled GSTIN. Verify supplier GSTIN status before recording purchase invoices.</p>
    </div>
    <div class="risk-item">
      <div class="risk-item-title">
        <span>Compliance Action</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #E8C868;">VERIFY</span>
      </div>
      <p class="risk-item-desc">Check official GST portal at https://services.gst.gov.in for definitive registration status and filing history.</p>
    </div>
  `;

  container.innerHTML = `
    <div class="result-card" style="animation: cardAppear 0.3s ease-out;">
      ${renderPreviewNotice(gstin.source)}
      <div class="result-header">
        <div>
          <h2 class="entity-name">${gstin.legalName}</h2>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="entity-cin-badge">${gstin.gstin}</span>
            <span class="noble-badge ${statusClass}" style="background: ${gstin.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${gstin.status === 'Active' ? '#10B981' : '#F59E0B'}; border-color: ${gstin.status === 'Active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'};">
              <span class="live-pulse-dot" style="margin-right: 4px;"></span> ${gstin.status}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">State Jurisdiction</span>
          <strong style="font-size: 0.95rem; color: var(--charcoal);">${gstin.state}</strong>
        </div>
      </div>

      <div class="data-grid">
        <div class="data-item">
          <label>Trade Name</label>
          <div class="val">${gstin.tradeName}</div>
        </div>
        <div class="data-item">
          <label>Registration Date</label>
          <div class="val mono">${gstin.registrationDate}</div>
        </div>
        <div class="data-item">
          <label>Taxpayer Type</label>
          <div class="val">${gstin.taxpayerType}</div>
        </div>
        <div class="data-item">
          <label>Constitution</label>
          <div class="val">${gstin.constitution}</div>
        </div>
        <div class="data-item">
          <label>Principal Place of Business</label>
          <div class="val" style="font-size: 0.82rem; line-height: 1.4;">${gstin.address}</div>
        </div>
      </div>

      ${returnsHtml}

      <div class="risk-box">
        <div class="risk-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C868" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"></rect>
              <path d="M8 21h8"></path>
              <path d="M12 17v4"></path>
            </svg>
            GST Compliance Intelligence
          </h3>
          <span class="risk-score">${gstin.status === 'Active' ? 'Active & Filing Current' : 'Verification Required'}</span>
        </div>
        <div class="risk-items">
          ${risksHtml}
        </div>
        <div class="cta-bar">
          <div class="cta-text">
            <strong>${gstin.status === 'Active' ? 'Maintain GST compliance:' : 'Verify GST registration:'}</strong> ${gstin.status === 'Active' ? 'Automated return filing, ITC reconciliation, and notice response.' : 'Official portal validation and registration assistance.'}
          </div>
          <a href="${gstin.status === 'Active' ? '/conversion/tax-intake.html' : '/services/gst-annual.html'}" class="cta-btn">
            ${gstin.status === 'Active' ? 'GST Filing Desk &rarr;' : 'GST Registration &rarr;'}
          </a>
        </div>
      </div>

      <p style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 1.5rem; font-style: italic;">
        Data Source: ${gstin.source === 'live' ? 'GSTN Live API' : gstin.source === 'benchmark' ? 'Curated Benchmark Dataset' : 'Format Validation Only (Demo)'} &bull; 
        <a href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noopener" style="color: var(--brand-gold);">Verify on Official GST Portal &rarr;</a>
      </p>
    </div>
  `;
  container.style.display = 'block';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Attach form handlers
  if (companyForm) companyForm.addEventListener('submit', executeCompanySearch);
  if (tmForm) tmForm.addEventListener('submit', executeTrademarkSearch);
  if (gstinForm) gstinForm.addEventListener('submit', executeGstinSearch);

  // Handle URL search parameter on page load
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');
  if (q) {
    // Determine which tab based on query format
    if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(q.toUpperCase())) {
      switchTab('gstin');
      document.getElementById('gstin-query').value = q.toUpperCase();
      executeGstinSearch(new Event('submit'));
    } else if (/^[A-Z]{2,}-?[0-9]{7}$/i.test(q) || q.toLowerCase().includes('tm')) {
      switchTab('trademark');
      document.getElementById('tm-query').value = q;
      executeTrademarkSearch(new Event('submit'));
    } else {
      switchTab('company');
      document.getElementById('company-query').value = q;
      executeCompanySearch(new Event('submit'));
    }
  }
});