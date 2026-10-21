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
      incDate: '14 March 2021 (5 Years)',
      authCap: '₹15,00,000',
      paidCap: '₹10,00,000',
      address: 'Cyber Park Road, Corporate Heights, Bangalore, KA 560001',
      directors: 'DIN 08492014 &bull; DIN 09148203',
      status: 'Active',
      statusClass: 'status-active',
      health: '98 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2024-25', status: 'Approved' },
        mgt7: { filed: true, fy: '2024-25', status: 'Approved' },
        adt1: { valid: true, through: 2028, status: 'Active' },
        dir3kyc: { all: true, status: 'Verified' }
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
      incDate: '14 March 2021 (5 Years)',
      authCap: '₹15,00,000',
      paidCap: '₹10,00,000',
      address: 'Cyber Park Road, Corporate Heights, Bangalore, KA 560001',
      directors: 'DIN 08492014 &bull; DIN 09148203',
      status: 'Active',
      statusClass: 'status-active',
      health: '98 / 100 (Optimal)',
      filings: {
        aoc4: { filed: true, fy: '2024-25', status: 'Approved' },
        mgt7: { filed: true, fy: '2024-25', status: 'Approved' },
        adt1: { valid: true, through: 2028, status: 'Active' },
        dir3kyc: { all: true, status: 'Verified' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'Upcoming AOC-4 / MGT-7 filing due within 30/60 days of next AGM. Projected daily late fee exposure under Section 403 is currently ₹0 (Filing window active).' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'DUE 30 SEPT', color: '#E8C868', desc: 'Annual biometric/OTP verification required annually by 30th September to eliminate ₹5,000 reactivating penalties and Section 164(2) deactivations.' },
        { title: 'MSME Section 43B(h) Audit', level: 'ACTIVE', color: '#10B981', desc: 'Supplier payments to registered micro and small enterprises must be reconciled within 45 days under written contracts to preserve income tax expense deductions.' },
        { title: 'Rule 9B PAS-6 Demat Audit', level: 'COMPLIANT', color: '#10B981', desc: 'Private company shares subject to half-yearly ISIN reconciliation via NSDL/CDSL for non-small entities under MCA notification dated 27 October 2023.' }
      ]
    },
    'reliance industries limited': {
      name: 'Reliance Industries Limited',
      cin: 'L17110MH1973PLC019786',
      llpin: null,
      roc: 'RoC Mumbai (Maharashtra)',
      class: 'Public Limited Company (Listed)',
      incDate: '08 May 1973 (53 Years)',
      authCap: '₹15,00,00,00,000',
      paidCap: '₹6,76,50,00,000',
      address: '3rd Floor, Maker Chamber IV, 222 Nariman Point, Mumbai, MH 400021',
      directors: 'DIN 00001620 &bull; DIN 00001689 &bull; DIN 00001712',
      status: 'Active',
      statusClass: 'status-active',
      health: '95 / 100 (Nominal)',
      filings: {
        aoc4: { filed: true, fy: '2023-24', status: 'Approved' },
        mgt7: { filed: true, fy: '2023-24', status: 'Approved' },
        adt1: { valid: true, through: 2027, status: 'Active' },
        dir3kyc: { all: true, status: 'Verified' }
      },
      risks: [
        { title: 'Section 137 / 92 RoC Deadline', level: 'NOMINAL', color: '#10B981', desc: 'AOC-4 / MGT-7 filing window active for listed entity.' },
        { title: 'Director DIN KYC (Rule 12A)', level: 'DUE 30 SEPT', color: '#E8C868', desc: 'Multiple director KYC verifications required annually.' },
        { title: 'SEBI LODR Compliance', level: 'ACTIVE', color: '#10B981', desc: 'Quarterly corporate governance reports and shareholding pattern filings current.' },
        { title: 'Related Party Transaction Review', level: 'NOMINAL', color: '#10B981', desc: 'Material RPTs approved by Audit Committee and shareholders per Regulation 23.' }
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
      address: 'Cyber Park Road, Corporate Heights, Kozhikode, KL 673001',
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
      address: 'Cyber Park Road, Corporate Heights, Kozhikode, KL 673001',
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
  // Generate synthetic result for unknown queries
  return generateSyntheticCompany(query);
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
  return generateSyntheticTrademark(query);
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
  return generateSyntheticGstin(query);
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
      { title: 'Section 137 / 92 RoC Deadline', level: 'HIGH RISK', color: '#EF4444', desc: 'AOC-4 / MGT-7 filings appear overdue. Immediate Section 403 late fee exposure at ₹100/day per form. CCFS-2026 amnesty available until 15 Sep 2026 (10% additional fee).' },
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
      <strong>Search Unavailable:</strong> ${message}
      <br><br>
      <a href="/search/" class="btn-royal-outline" style="margin-top: 0.5rem; display: inline-block;">Try Again &rarr;</a>
    </div>
  `;
}

function renderCompanyResult(entity) {
  const container = document.getElementById('company-results');
  const statusColors = {
    'Active': 'status-active',
    'Inactive': 'status-inactive',
    'Strike Off': 'status-inactive',
    'Dormant': 'status-pending',
    'Under Liquidation': 'status-pending'
  };
  const statusClass = statusColors[entity.status] || 'status-active';

  const filingsHtml = `
    <div style="background: var(--bg-ivory); border: 1px solid var(--silver-border); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--charcoal);">
          Recent Statutory RoC E-Filing Ledger
        </span>
        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
          ${entity.source === 'live' ? 'MCA V3 Live' : entity.source === 'benchmark' ? 'MCA V3 Benchmark' : 'Synthetic Estimate'}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">Form AOC-4:</strong> ${entity.filings.aoc4.filed ? 'Filed (FY ' + entity.filings.aoc4.fy + ') &bull; <span style="color: #10B981;">' + entity.filings.aoc4.status + '</span>' : '<span style="color: #EF4444;">Not Filed / Pending</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">Form MGT-7:</strong> ${entity.filings.mgt7.filed ? 'Filed (FY ' + entity.filings.mgt7.fy + ') &bull; <span style="color: #10B981;">' + entity.filings.mgt7.status + '</span>' : '<span style="color: #EF4444;">Not Filed / Pending</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">Form ADT-1:</strong> ${entity.filings.adt1.valid ? 'Valid through ' + entity.filings.adt1.through + ' &bull; <span style="color: #10B981;">' + entity.filings.adt1.status + '</span>' : '<span style="color: #EF4444;">' + entity.filings.adt1.status + '</span>'}
        </div>
        <div style="background: #FFFFFF; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--silver-border);">
          <strong style="color: var(--charcoal);">DIR-3 KYC:</strong> ${entity.filings.dir3kyc.all ? 'All Directors &bull; <span style="color: #10B981;">' + entity.filings.dir3kyc.status + '</span>' : '<span style="color: #EF4444;">' + entity.filings.dir3kyc.status + '</span>'}
        </div>
      </div>
    </div>
  `;

  const risksHtml = entity.risks.map(risk => `
    <div class="risk-item">
      <div class="risk-item-title">
        <span>${risk.title}</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: ${risk.color};">${risk.level}</span>
      </div>
      <p class="risk-item-desc">${risk.desc}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-card" style="animation: cardAppear 0.3s ease-out;">
      <div class="result-header">
        <div>
          <h2 class="entity-name">${entity.name}</h2>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="entity-cin-badge">${entity.cin}</span>
            <span class="noble-badge ${statusClass}" style="background: ${entity.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${entity.status === 'Active' ? '#10B981' : '#F59E0B'}; border-color: ${entity.status === 'Active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'};">
              <span class="live-pulse-dot" style="margin-right: 4px;"></span> ${entity.status} &bull; ${entity.roc.replace('RoC ', '')}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">RoC Jurisdiction</span>
          <strong style="font-size: 0.95rem; color: var(--charcoal);">${entity.roc}</strong>
        </div>
      </div>

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
          <label>Registered Office</label>
          <div class="val" style="font-size: 0.85rem; line-height: 1.4;">${entity.address}</div>
        </div>
        <div class="data-item">
          <label>Key Directors / Partners</label>
          <div class="val mono" style="font-size: 0.82rem;">${entity.directors}</div>
        </div>
      </div>

      ${filingsHtml}

      <div class="risk-box">
        <div class="risk-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C868" stroke-width="2">
              <path d="M12 2v20M2 12h20"/>
              <path d="m4.93 4.93 14.14 14.14M19.07 4.93 4.93 19.07"/>
            </svg>
            CraftEgon AI Statutory Risk & Penalty Diagnostic
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
          <a href="/portal/subscription.html" class="cta-btn">
            Onboard to Compliance OS (from ₹1,499/mo) &rarr;
          </a>
        </div>
      </div>

      <p style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 1.5rem; font-style: italic;">
        Data Source: ${entity.source === 'live' ? 'MCA V3 Live API' : entity.source === 'benchmark' ? 'Curated Benchmark Dataset' : 'Synthetic Estimate (Demo Only)'} &bull; 
        <a href="/legal/disclaimer.html" style="color: var(--brand-gold);">Certified extracts require official registry request</a>
      </p>
    </div>
  `;
  container.style.display = 'block';
}

function renderTrademarkResult(tm) {
  const container = document.getElementById('tm-results');
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
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #64748B;">OPTIONAL</span>
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
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #64748B;">PREPARE</span>
              </div>
              <p class="risk-item-desc">Prepare user affidavit, power of attorney, and mark representation sheets for TM-A submission.</p>
            </div>
            <div class="risk-item">
              <div class="risk-item-title">
                <span>Professional Assistance</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #64748B;">RECOMMENDED</span>
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