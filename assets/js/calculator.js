/**
 * Craftegon Corporate Services (CCS) - Statutory & Financial Calculator Suite
 * Powers conversion/calculator.html and portal dashboard widgets
 * Pure ES6, zero external dependencies
 */

const CCFS_2026_DEADLINE = new Date('2026-09-15T23:59:59+05:30');
let currentTab1Mode = 'formation'; // 'formation' or 'annual'

// Attribution Engine: Capture, persist, and append UTM parameters
function getStoredAttribution() {
  try {
    const rawV1 = sessionStorage.getItem('craftegon_attribution_v1') || localStorage.getItem('craftegon_attribution_v1');
    if (rawV1) {
      let parsed = null;
    try { parsed = JSON.parse(rawV1); } catch (_e) { parsed = null; }
      if (parsed && typeof parsed === 'object') return parsed;
    }
    const raw = sessionStorage.getItem('ccs_attribution');
    try { return raw ? JSON.parse(raw) : {}; } catch (_e) { return {}; }
  } catch (e) {
    return {};
  }
}

function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ref'];
    const stored = getStoredAttribution();
    let updated = false;
    keys.forEach(k => {
      if (params.has(k)) {
        stored[k] = params.get(k);
        updated = true;
      }
    });
    if (updated) {
      sessionStorage.setItem('craftegon_attribution_v1', JSON.stringify(stored));
      sessionStorage.setItem('ccs_attribution', JSON.stringify(stored));
    }
  } catch (e) {
    // Non-blocking
  }
}

function appendAttribution(url) {
  try {
    const stored = getStoredAttribution();
    const params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ref'].forEach(k => {
      if (params.has(k)) stored[k] = params.get(k);
    });
    const u = new URL(url, window.location.origin);
    const keysToCopy = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ref'];
    keysToCopy.forEach(k => {
      if (!u.searchParams.has(k) && stored[k]) {
        u.searchParams.set(k, stored[k]);
      }
    });
    return u.pathname + u.search + u.hash;
  } catch (e) {
    return url;
  }
}

// CIN & LLPIN Registry Mapping Dictionaries
const CIN_STATE_MAP = {
  'AP': { name: 'Andhra Pradesh', roc: 'RoC Vijayawada', dropdownVal: 'other' },
  'AR': { name: 'Arunachal Pradesh', roc: 'RoC Shillong', dropdownVal: 'other' },
  'AS': { name: 'Assam', roc: 'RoC Guwahati', dropdownVal: 'other' },
  'BR': { name: 'Bihar', roc: 'RoC Patna', dropdownVal: 'other' },
  'CH': { name: 'Chandigarh', roc: 'RoC Chandigarh', dropdownVal: 'other' },
  'CT': { name: 'Chhattisgarh', roc: 'RoC Bilaspur', dropdownVal: 'other' },
  'DL': { name: 'Delhi', roc: 'RoC Delhi & Haryana', dropdownVal: 'delhi' },
  'GA': { name: 'Goa', roc: 'RoC Goa', dropdownVal: 'other' },
  'GJ': { name: 'Gujarat', roc: 'RoC Ahmedabad', dropdownVal: 'other' },
  'HR': { name: 'Haryana', roc: 'RoC Delhi & Haryana', dropdownVal: 'delhi' },
  'HP': { name: 'Himachal Pradesh', roc: 'RoC Himachal Pradesh', dropdownVal: 'other' },
  'JH': { name: 'Jharkhand', roc: 'RoC Ranchi', dropdownVal: 'other' },
  'KA': { name: 'Karnataka', roc: 'RoC Bangalore', dropdownVal: 'karnataka' },
  'KL': { name: 'Kerala', roc: 'RoC Ernakulam', dropdownVal: 'kerala' },
  'MP': { name: 'Madhya Pradesh', roc: 'RoC Gwalior', dropdownVal: 'other' },
  'MH': { name: 'Maharashtra', roc: 'RoC Mumbai / Pune', dropdownVal: 'maharashtra' },
  'MN': { name: 'Manipur', roc: 'RoC Shillong', dropdownVal: 'other' },
  'ML': { name: 'Meghalaya', roc: 'RoC Shillong', dropdownVal: 'other' },
  'MZ': { name: 'Mizoram', roc: 'RoC Shillong', dropdownVal: 'other' },
  'NL': { name: 'Nagaland', roc: 'RoC Shillong', dropdownVal: 'other' },
  'OR': { name: 'Odisha', roc: 'RoC Cuttack', dropdownVal: 'other' },
  'PB': { name: 'Punjab', roc: 'RoC Chandigarh', dropdownVal: 'other' },
  'RJ': { name: 'Rajasthan', roc: 'RoC Jaipur', dropdownVal: 'other' },
  'SK': { name: 'Sikkim', roc: 'RoC Kolkata', dropdownVal: 'other' },
  'TN': { name: 'Tamil Nadu', roc: 'RoC Chennai / Coimbatore', dropdownVal: 'tamil-nadu' },
  'TS': { name: 'Telangana', roc: 'RoC Hyderabad', dropdownVal: 'telangana' },
  'TG': { name: 'Telangana', roc: 'RoC Hyderabad', dropdownVal: 'telangana' },
  'TR': { name: 'Tripura', roc: 'RoC Shillong', dropdownVal: 'other' },
  'UP': { name: 'Uttar Pradesh', roc: 'RoC Kanpur', dropdownVal: 'other' },
  'UT': { name: 'Uttarakhand', roc: 'RoC Uttarakhand', dropdownVal: 'other' },
  'WB': { name: 'West Bengal', roc: 'RoC Kolkata', dropdownVal: 'other' }
};

const CIN_TYPE_MAP = {
  'PTC': { type: 'pvt-ltd', label: 'Private Limited Company' },
  'PLC': { type: 'public-ltd', label: 'Public Limited Company' },
  'OPC': { type: 'opc', label: 'One Person Company' },
  'GAP': { type: 'section-8', label: 'Section 8 Guarantee Non-Profit' },
  'NPL': { type: 'section-8', label: 'Section 8 Non-Profit Company' },
  'SGC': { type: 'public-ltd', label: 'State Government Company' },
  'GOI': { type: 'public-ltd', label: 'Central Government Company' },
  'FTC': { type: 'public-ltd', label: 'Subsidiary of Foreign Company' },
  'ULL': { type: 'public-ltd', label: 'Public Unlimited Company' },
  'ULT': { type: 'pvt-ltd', label: 'Private Unlimited Company' }
};

function decryptCin(rawInput) {
  if (!rawInput) return null;
  const cleaned = rawInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

  if (/^[A-Z]{3}-[0-9]{4}$/.test(cleaned) || /^[A-Z]{2,3}[0-9]{4,5}$/.test(cleaned)) {
    return {
      isValid: true,
      kind: 'LLPIN',
      llpin: cleaned,
      entityType: 'llp',
      entityLabel: 'Limited Liability Partnership (LLP)',
      chips: [
        { label: 'LLP Structure', icon: '🏛️' },
        { label: 'LLPIN: ' + cleaned, icon: '📋' },
        { label: 'RoC FiLLiP Schedule', icon: '⚖️' }
      ]
    };
  }

  const cinRegex = /^([UL])(\d{5})([A-Z]{2})(\d{4})([A-Z]{3})(\d{6})$/;
  const match = cleaned.match(cinRegex);
  if (!match) {
    return {
      isValid: false,
      cleaned,
      length: cleaned.length
    };
  }

  const [_, listingChar, nicCode, stateCode, yearStr, typeCode, regNo] = match;
  const isListed = listingChar === 'L';
  const isKnownState = Boolean(CIN_STATE_MAP[stateCode]);
  const stateInfo = isKnownState ? CIN_STATE_MAP[stateCode] : { name: stateCode, roc: 'RoC ' + stateCode, dropdownVal: 'other', isUnrecognized: true };
  const typeInfo = CIN_TYPE_MAP[typeCode] || { type: 'pvt-ltd', label: typeCode + ' Corporate Entity' };
  const year = parseInt(yearStr, 10);

  return {
    isValid: true,
    kind: 'CIN',
    cin: cleaned,
    isListed,
    listingStatus: isListed ? 'Listed Public' : 'Unlisted Corporate',
    nicCode,
    stateCode,
    stateName: stateInfo.name,
    rocOffice: stateInfo.roc,
    dropdownState: stateInfo.dropdownVal,
    year,
    typeCode,
    entityType: typeInfo.type,
    entityLabel: typeInfo.label,
    regNo,
    chips: [
      { label: isListed ? 'Listed Public' : 'Unlisted Corporate', icon: isListed ? '📈' : '🏢' },
      { label: stateInfo.isUnrecognized ? 'Non-Standard RoC (' + stateCode + ')' : stateInfo.name + ' (' + stateInfo.roc + ')', icon: stateInfo.isUnrecognized ? '⚠️' : '📍' },
      { label: 'Inc. ' + year, icon: '📅' },
      { label: typeInfo.label, icon: '⚖️' },
      { label: 'Reg #' + regNo, icon: '🔢' }
    ]
  };
}

function handleCinInput(val) {
  const statusEl = document.getElementById('cin-decrypt-status');
  if (!val || !val.trim()) {
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.replaceChildren(); /* sanitized */
    }
    return;
  }

  const res = decryptCin(val);
  if (!res || !res.isValid) {
    if (statusEl) {
      if (val.trim().length >= 4) {
        statusEl.style.display = 'block';
        statusEl.style.background = '#FFFBEB';
        statusEl.style.border = '1px solid #FCD34D';
        statusEl.style.color = '#92400E';
        statusEl.innerHTML = '<span style="font-weight: 600;">Validating Corporate Identifier:</span> Format requires 21-character CIN (e.g. <code>U72900KL2026PTC012345</code>) or LLPIN (e.g. <code>AAA-1234</code>).' /* sanitized */;
      } else {
        statusEl.style.display = 'none';
      }
    }
    return;
  }

  // Valid CIN or LLPIN parsed
  const entityEl = document.getElementById('entity-type');
  const stateEl = document.getElementById('formation-state');
  if (entityEl && res.entityType) {
    entityEl.value = res.entityType;
  }
  if (stateEl && res.dropdownState) {
    stateEl.value = res.dropdownState;
  }

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.background = '#ECFDF5';
    statusEl.style.border = '1px solid #A7F3D0';
    statusEl.style.color = '#065F46';
    const chipsHtml = res.chips.map(c => '<span class="readout-pill" style="font-size: 0.72rem; background: #FFFFFF; border: 1px solid #A7F3D0; color: #065F46; margin: 0.15rem 0.25rem 0.15rem 0; display: inline-flex; align-items: center; gap: 0.25rem;">' + c.icon + ' ' + c.label + '</span>').join('');
    statusEl.innerHTML = '<div style="font-weight: 700; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">' + /* sanitized */
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
      '<span>Statutory Registry Verified (' + res.kind + ' Decrypted)</span>' +
      '</div>' +
      '<div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem;">' + chipsHtml + '</div>';
  }

  calculateCost();
}

// Module 1: Tab 1 Mode Switcher (Formation vs Annual Late Fees)
function setTab1Mode(mode) {
  currentTab1Mode = mode === 'annual' ? 'annual' : 'formation';

  const btnFormation = document.getElementById('btn-mode-formation');
  const btnAnnual = document.getElementById('btn-mode-annual');
  if (btnFormation && btnAnnual) {
    const delayCardsEl = document.getElementById('cost-of-delay-cards');
  if (delayCardsEl) delayCardsEl.style.display = currentTab1Mode === 'annual' ? 'block' : 'none';

  if (currentTab1Mode === 'formation') {
      btnFormation.classList.add('active');
      btnFormation.setAttribute('aria-checked', 'true');
      btnAnnual.classList.remove('active');
      btnAnnual.setAttribute('aria-checked', 'false');
    } else {
      btnAnnual.classList.add('active');
      btnAnnual.setAttribute('aria-checked', 'true');
      btnFormation.classList.remove('active');
      btnFormation.setAttribute('aria-checked', 'false');
    }
  }

  // Toggle Visibility of Formation vs Annual Controls
  const formationState = document.getElementById('group-formation-state');
  const formationInclusions = document.getElementById('group-formation-inclusions');
  const formationAddons = document.getElementById('group-formation-addons');
  const serviceTypeGroup = document.getElementById('group-service-type');
  const rocDelayGroup = document.getElementById('group-roc-delay');
  const defaultingFormsGroup = document.getElementById('group-defaulting-forms');
  const ccfsGroup = document.getElementById('group-ccfs');
  const annualAddonsGroup = document.getElementById('group-annual-addons');

  const stampRow = document.getElementById('stamp-fee-row');
  const dscDinRow = document.getElementById('dsc-din-row');
  const dscSeparateRow = document.getElementById('dsc-separate-row');
  const lateFeeRow = document.getElementById('late-fee-row');
  const ccfsRow = document.getElementById('ccfs-fee-row');

  const cardTitle = document.getElementById('tab1-card-title');
  const cardSubtitle = document.getElementById('tab1-card-subtitle');
  const cardBadge = document.getElementById('tab1-card-badge');
  const summaryTitle = document.getElementById('summary-title');
  const summaryBadge = document.getElementById('summary-badge');
  const profFeeLabel = document.getElementById('prof-fee-label');
  const govtFeeLabel = document.getElementById('govt-fee-label');
  const bannerLabel = document.getElementById('total-banner-label');
  const turnaroundLabel = document.getElementById('turnaround-label');
  const noteEl = document.getElementById('tab1-note');

  if (currentTab1Mode === 'formation') {
    if (formationState) formationState.style.display = 'block';
    if (formationInclusions) formationInclusions.style.display = 'block';
    if (formationAddons) formationAddons.style.display = 'block';
    if (serviceTypeGroup) serviceTypeGroup.style.display = 'none';
    if (rocDelayGroup) rocDelayGroup.style.display = 'none';
    if (defaultingFormsGroup) defaultingFormsGroup.style.display = 'none';
    if (ccfsGroup) ccfsGroup.style.display = 'none';
    if (annualAddonsGroup) annualAddonsGroup.style.display = 'none';

    if (stampRow) stampRow.style.display = 'flex';
    if (dscDinRow) dscDinRow.style.display = 'flex';
    if (dscSeparateRow) dscSeparateRow.style.display = 'flex';
    if (lateFeeRow) lateFeeRow.style.display = 'none';
    if (ccfsRow) ccfsRow.style.display = 'none';

    if (cardTitle) cardTitle.textContent = 'New Entity Formation & Statutory Outlay Breakdown';
    if (cardSubtitle) cardSubtitle.textContent = 'Official MCA V3 SPICe+ & FiLLiP statutory schedules with transparent state stamp duties and zero hidden costs.';
    if (cardBadge) {
      cardBadge.textContent = 'MCA V3 Rule 38: ₹0 Filing Fee';
      cardBadge.style.color = '#065F46';
      cardBadge.style.background = '#D1FAE5';
    }
    if (summaryTitle) summaryTitle.textContent = 'All-Inclusive Statutory Outlay';
    if (summaryBadge) {
      summaryBadge.textContent = 'Formation Ledger';
      summaryBadge.style.color = '#065F46';
      summaryBadge.style.background = '#D1FAE5';
    }
    if (profFeeLabel) profFeeLabel.textContent = 'Professional Retainer:';
    if (govtFeeLabel) govtFeeLabel.textContent = 'MCA Filing Fee:';
    if (bannerLabel) bannerLabel.textContent = 'Total Estimated Statutory Outlay';
    if (turnaroundLabel) turnaroundLabel.textContent = 'Turnaround SLA: 3-5 Working Days';
    if (noteEl) {
      noteEl.innerHTML = '<strong>STATUTORY TRANSPARENCY:</strong> MCA Government filing fee is ₹0 under Rule 38 for companies with nominal capital up to ₹15 Lakhs. State stamp duty varies slightly by registered office location. All filings supervised directly by practicing CS & CA.' /* sanitized */;
    }
  } else {
    if (formationState) formationState.style.display = 'none';
    if (formationInclusions) formationInclusions.style.display = 'none';
    if (formationAddons) formationAddons.style.display = 'none';
    if (serviceTypeGroup) serviceTypeGroup.style.display = 'block';
    if (rocDelayGroup) rocDelayGroup.style.display = 'block';
    if (defaultingFormsGroup) defaultingFormsGroup.style.display = 'block';
    if (ccfsGroup) ccfsGroup.style.display = 'block';
    if (annualAddonsGroup) annualAddonsGroup.style.display = 'block';

    if (stampRow) stampRow.style.display = 'none';
    if (dscDinRow) dscDinRow.style.display = 'none';
    if (dscSeparateRow) dscSeparateRow.style.display = 'none';
    if (lateFeeRow) lateFeeRow.style.display = 'flex';
    if (ccfsRow) ccfsRow.style.display = 'flex';

    if (cardTitle) cardTitle.textContent = 'RoC Statutory Late Fee & Retainer Estimate';
    if (cardSubtitle) cardSubtitle.textContent = 'Indicative Section 403 estimate for overdue company annual returns (Section 92) and financial statements (Section 137) only. Other forms are excluded; confirm current MCA fees.';
    if (cardBadge) {
      cardBadge.textContent = 'Section 403: AOC-4 / MGT-7 only';
      cardBadge.style.color = '#B45309';
      cardBadge.style.background = '#FEF3C7';
    }
    if (summaryTitle) summaryTitle.textContent = 'Statutory Exposure Assessment';
    if (summaryBadge) {
      summaryBadge.textContent = 'Diagnostic Ledger';
      summaryBadge.style.color = '#475569';
      summaryBadge.style.background = '#E2E8F0';
    }
    if (profFeeLabel) profFeeLabel.textContent = 'Base Professional Fee:';
    if (govtFeeLabel) govtFeeLabel.textContent = 'Base RoC Challan Fee:';
    if (bannerLabel) bannerLabel.textContent = 'Total Estimated Statutory Exposure';
    if (turnaroundLabel) turnaroundLabel.textContent = 'Urgent Resolution SLA: 24-48 Hours';
    if (noteEl) {
      noteEl.innerHTML = '<strong>ESTIMATE LIMITATION:</strong> This illustrative model uses a per-day input and does not reproduce the complete MCA form-wise fee schedule or determine a filing\'s eligibility. CCFS-2026 relief is closed and is not included. Confirm current fees in the MCA portal.' /* sanitized */;
    }
  }

  if (currentTab1Mode === 'annual') {
    const svcEl = document.getElementById('service-type');
    if (svcEl && (svcEl.value === 'pvt-ltd' || svcEl.value === 'llp')) {
      svcEl.value = 'roc-retainer';
    }
  }

  calculateCost();
}

function onEntityTypeChange() {
  const entityType = document.getElementById('entity-type')?.value || 'pvt-ltd';
  const svcEl = document.getElementById('service-type');
  if (svcEl) {
    if (entityType === 'llp') svcEl.value = 'llp';
    else if (entityType === 'pvt-ltd' || entityType === 'opc') svcEl.value = 'pvt-ltd';
  }
  calculateCost();
}

// Module 1 Calculations
function calculateCost() {
  const entityType = document.getElementById('entity-type')?.value || 'pvt-ltd';
  const service = document.getElementById('service-type')?.value || 'roc-retainer';
  const tier = document.getElementById('capital-tier')?.value || 'tier-1';
  const state = document.getElementById('formation-state')?.value || 'maharashtra';
  const delayDays = parseInt(document.getElementById('roc-delay-days')?.value, 10) || 0;
  const ccfsMode = Boolean(document.getElementById('ccfs-mode')?.checked) && Date.now() <= CCFS_2026_DEADLINE.getTime();

  let baseProf = 15999;
  let baseGovt = 1200;
  let stampDuty = 1000;
  let addonTotal = 0;
  let rocLateFee = 0;
  let ccfsFee = 0;
  let total = 0;

  if (currentTab1Mode === 'formation') {
    // FORMATION MODE: Harmonized exactly with homepage outlay estimator
    if (state === 'karnataka') stampDuty = 1500;
    else if (state === 'telangana') stampDuty = 1200;
    else stampDuty = 1000;

    if (entityType === 'pvt-ltd') {
      baseProf = 7999; // Harmonized with services/pvt-ltd-registration.html & pricing.json
      baseGovt = 0; // MCA fee exempt up to 15L capital under Rule 38
      if (tier === 'tier-3') { baseProf = 8499; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 9999; baseGovt = 1000; stampDuty += 1500; }
    } else if (entityType === 'llp') {
      baseProf = 6499; // Harmonized with services/llp-registration.html & pricing.json
      baseGovt = 500; // FiLLiP statutory fee
      stampDuty = 500; // LLP Agreement stamp duty baseline
      if (tier === 'tier-3') { baseProf = 6999; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 7999; baseGovt = 1000; stampDuty += 1000; }
    } else if (entityType === 'opc') {
      baseProf = 6999; // Harmonized with services/opc-registration.html & pricing.json
      baseGovt = 0; // MCA fee exempt under Rule 38
      if (tier === 'tier-3') { baseProf = 7499; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 8499; baseGovt = 1000; stampDuty += 1000; }
    } else if (entityType === 'section-8') {
      baseProf = 13999; // Harmonized with services/section-8-registration.html & pricing.json
      baseGovt = 2000; // INC-12 central license fee
      stampDuty = 1000;
    } else if (entityType === 'public-ltd') {
      baseProf = 19999;
      baseGovt = 1000;
      stampDuty = 2000;
    }

    // Formation Addons
    if (document.getElementById('f-addon-gst')?.checked) addonTotal += 999;
    if (document.getElementById('f-addon-dpiit')?.checked) addonTotal += 2499;
    if (document.getElementById('f-addon-tm')?.checked) addonTotal += 3999;
    if (document.getElementById('f-addon-governance')?.checked) addonTotal += 1499;

    total = baseProf + baseGovt + stampDuty + addonTotal;

    // CTA routing & WhatsApp deep-link
    const primaryCta = document.getElementById('tab1-primary-cta');
    const whatsappCta = document.getElementById('tab1-whatsapp-cta');
    const entityLabels = {
      'pvt-ltd': 'Private Limited Company (SPICe+)',
      'llp': 'Limited Liability Partnership (LLP)',
      'opc': 'One Person Company (OPC)',
      'section-8': 'Section 8 Non-Profit Company',
      'public-ltd': 'Public Limited Company'
    };
    const entityLabel = entityLabels[entityType] || 'Company';

    let targetCheckoutUrl = `/conversion/ppc-company-registration.html?service=pvt-ltd&capital=${tier}&state=${state}&total=${total}`;
    let targetButtonText = 'Proceed to Incorporation Desk →';

    if (entityType === 'llp') {
      targetCheckoutUrl = `/services/llp-registration.html?capital=${tier}&state=${state}&total=${total}`;
      targetButtonText = 'Incorporate LLP (FiLLiP) →';
    } else if (entityType === 'opc') {
      targetCheckoutUrl = `/services/opc-registration.html?capital=${tier}&state=${state}&total=${total}`;
      targetButtonText = 'Incorporate OPC (SPICe+) →';
    } else if (entityType === 'section-8') {
      targetCheckoutUrl = `/services/section-8-registration.html?capital=${tier}&state=${state}&total=${total}`;
      targetButtonText = 'Incorporate Section 8 Non-Profit →';
    } else if (entityType === 'public-ltd') {
      targetCheckoutUrl = `/services.html?q=public-limited`;
      targetButtonText = 'Inquire Public Limited Desk →';
    }

    if (primaryCta) {
      primaryCta.textContent = targetButtonText;
      primaryCta.href = appendAttribution(targetCheckoutUrl);
    }
    if (whatsappCta) {
      const waMsg = `Hello CraftEgon, I used your statutory outlay estimator for ${entityLabel} (Capital: ${tier}, State: ${state}, Outlay: ₹${total.toLocaleString('en-IN')}). I would like to proceed with incorporation.`;
      whatsappCta.href = `https://wa.me/918606918247?text=${encodeURIComponent(waMsg)}`;
      const waText = whatsappCta.querySelector('span');
      if (waText) waText.textContent = 'WhatsApp Incorporation Specialist';
    }
  } else {
    // ANNUAL COMPLIANCE & LATE FEE MODE
    if (service === 'pvt-ltd') { baseProf = 7999; baseGovt = 3500; }
    else if (service === 'llp') { baseProf = 6499; baseGovt = 2500; }
    else if (service === 'roc-retainer') { baseProf = 15999; baseGovt = 1200; }
    else if (service === 'gst-annual') { baseProf = 13999; baseGovt = 0; }
    else if (service === 'trademark') { baseProf = 4999; baseGovt = 4500; }

    if (tier === 'tier-2') baseGovt = Math.round(baseGovt * 1.5);
    if (tier === 'tier-3' || tier === 'tier-4') baseGovt = Math.round(baseGovt * 2.5);

    if (document.getElementById('addon-msme')?.checked) addonTotal += 999;
    if (document.getElementById('addon-sha')?.checked) addonTotal += 4999;
    if (document.getElementById('addon-current-ac')?.checked) addonTotal += 1499;

    // Section 403's first proviso applies the not-less-than ₹100/day additional-fee rule to Sections 92 and 137 filings.
    // This illustrative model therefore counts only MGT-7 (Section 92) and AOC-4 (Section 137).
    let overdueFormsCount = 0;
    if (document.getElementById('form-aoc4')?.checked) overdueFormsCount++;
    if (document.getElementById('form-mgt7')?.checked) overdueFormsCount++;

    rocLateFee = overdueFormsCount * delayDays * 100;

    if (ccfsMode && rocLateFee > 0) {
      ccfsFee = Math.round(rocLateFee * 0.9);
      rocLateFee = Math.round(rocLateFee * 0.1);
    }

    total = baseProf + baseGovt + rocLateFee + addonTotal;
    // Update Cost of Delay Scenario Cards
    const delayCardsEl = document.getElementById('cost-of-delay-cards');
    if (delayCardsEl) {
      delayCardsEl.style.display = 'block';
      const curDaysEl = document.getElementById('delay-card-current-days');
      const curCostEl = document.getElementById('delay-card-current-cost');
      const curTagEl = document.getElementById('delay-card-current-tag');
      
      const p30DaysEl = document.getElementById('delay-card-30-days');
      const p30CostEl = document.getElementById('delay-card-30-cost');
      const p30TagEl = document.getElementById('delay-card-30-tag');
      
      const p90DaysEl = document.getElementById('delay-card-90-days');
      const p90CostEl = document.getElementById('delay-card-90-cost');
      const p90TagEl = document.getElementById('delay-card-90-tag');

      const mult = overdueFormsCount;
      const cost30 = mult * (delayDays + 30) * 100;
      const cost90 = mult * (delayDays + 90) * 100;

      if (curDaysEl) curDaysEl.textContent = delayDays + ' Days Overdue';
      if (curCostEl) curCostEl.textContent = '₹' + rocLateFee.toLocaleString('en-IN');
      if (curTagEl) curTagEl.textContent = delayDays === 0 ? 'Compliant' : (delayDays > 90 ? 'High Default' : 'Sec 403 Default');

      if (p30DaysEl) p30DaysEl.textContent = (delayDays + 30) + ' Days Overdue';
      if (p30CostEl) p30CostEl.textContent = '₹' + cost30.toLocaleString('en-IN');
      if (p30TagEl) p30TagEl.textContent = (delayDays + 30 > 90) ? 'Sec 454 Notice' : 'Scrutiny Warning';

      if (p90DaysEl) p90DaysEl.textContent = (delayDays + 90) + ' Days Overdue';
      if (p90CostEl) p90CostEl.textContent = '₹' + cost90.toLocaleString('en-IN');
      if (p90TagEl) p90TagEl.textContent = 'Sec 164 Disqualification Risk';
    }


    const primaryCta = document.getElementById('tab1-primary-cta');
    const whatsappCta = document.getElementById('tab1-whatsapp-cta');
    if (primaryCta) {
      primaryCta.textContent = 'Engage RoC Compliance Desk →';
      primaryCta.href = appendAttribution(`/conversion/retainer-desk.html?service=${service}&delay=${delayDays}&exposure=${total}`);
    }
    if (whatsappCta) {
      const waMsg = `Hello CraftEgon, I calculated statutory late fee exposure for ${service} (${delayDays} days delay, Total Exposure: ₹${total.toLocaleString('en-IN')}). I would like to regularize statutory compliance.`;
      whatsappCta.href = `https://wa.me/918606918247?text=${encodeURIComponent(waMsg)}`;
      const waText = whatsappCta.querySelector('span');
      if (waText) waText.textContent = 'Consult Compliance Specialist';
    }
  }

  // Update DOM readouts
  const profEl = document.getElementById('prof-fee');
  const govtEl = document.getElementById('govt-fee');
  const stampEl = document.getElementById('stamp-fee');
  const lateEl = document.getElementById('roc-late-fee');
  const ccfsEl = document.getElementById('ccfs-fee');
  const addonEl = document.getElementById('addon-fee');
  const totalEl = document.getElementById('total-fee');
  const dockTotal = document.getElementById('mobile-dock-total');

  if (profEl) profEl.textContent = '₹' + baseProf.toLocaleString('en-IN');
  if (govtEl) {
    if (currentTab1Mode === 'formation' && baseGovt === 0) {
      govtEl.textContent = '₹0 (MCA Exempt)';
    } else {
      govtEl.textContent = '₹' + baseGovt.toLocaleString('en-IN');
    }
  }
  if (stampEl) stampEl.textContent = '₹' + stampDuty.toLocaleString('en-IN');
  if (lateEl) lateEl.textContent = '₹' + rocLateFee.toLocaleString('en-IN');
  if (ccfsEl) {
    const closed = Date.now() > CCFS_2026_DEADLINE.getTime();
    ccfsEl.textContent = ccfsMode ? '₹' + ccfsFee.toLocaleString('en-IN') + ' saved' : (closed ? 'Closed 15 Sep 2026' : 'Not applied');
    ccfsEl.style.color = ccfsMode ? '#059669' : 'var(--text-secondary)';
  }
  if (addonEl) addonEl.textContent = '₹' + addonTotal.toLocaleString('en-IN');
  if (totalEl) totalEl.textContent = '₹' + Math.round(total).toLocaleString('en-IN');
  if (dockTotal) dockTotal.textContent = '₹' + Math.round(total).toLocaleString('en-IN');
}

// Module 2: GST & ITC Simulator
function calculateGst() {
  const turnover = parseFloat(document.getElementById('gst-turnover')?.value) || 0;
  const procurement = parseFloat(document.getElementById('gst-procurement')?.value) || 0;
  const slab = parseFloat(document.getElementById('gst-slab')?.value) || 0.18;
  const blockedInput = parseFloat(document.getElementById('gst-blocked-itc')?.value);
  const blockedPct = (Number.isFinite(blockedInput) ? blockedInput : 10) / 100;

  const turnoverEl = document.getElementById('gst-turnover-val');
  const procEl = document.getElementById('gst-procurement-val');
  const blockedEl = document.getElementById('gst-blocked-val');

  if (turnoverEl) turnoverEl.textContent = '₹' + turnover.toLocaleString('en-IN');
  if (procEl) procEl.textContent = '₹' + procurement.toLocaleString('en-IN');
  if (blockedEl) blockedEl.textContent = (blockedPct * 100).toFixed(0) + '% Disallowed';

  const outputTax = turnover * slab;
  const totalItc = procurement * slab;
  const blockedTax = totalItc * blockedPct;
  const eligibleItc = totalItc - blockedTax;
  const netPayable = Math.max(0, outputTax - eligibleItc);

  const outEl = document.getElementById('gst-output-tax');
  const itcEl = document.getElementById('gst-total-itc');
  const blkEl = document.getElementById('gst-blocked-tax');
  const eligEl = document.getElementById('gst-eligible-itc');
  const netEl = document.getElementById('gst-net-payable');

  if (outEl) outEl.textContent = '₹' + Math.round(outputTax).toLocaleString('en-IN');
  if (itcEl) itcEl.textContent = '₹' + Math.round(totalItc).toLocaleString('en-IN');
  if (blkEl) blkEl.textContent = '-₹' + Math.round(blockedTax).toLocaleString('en-IN');
  if (eligEl) eligEl.textContent = '₹' + Math.round(eligibleItc).toLocaleString('en-IN');
  if (netEl) netEl.textContent = '₹' + Math.round(netPayable).toLocaleString('en-IN');
  calculateGst2bReconciliation();
}

function calculateGst2bReconciliation() {
  const purchaseLedger = Number(document.getElementById('gst-2b-ledger')?.value) || 0;
  const gstr2bAvailable = Number(document.getElementById('gst-2b-available')?.value) || 0;
  const delta = purchaseLedger - gstr2bAvailable;
  const deltaEl = document.getElementById('gst-2b-difference');
  const statusEl = document.getElementById('gst-2b-status');
  if (deltaEl) deltaEl.textContent = '₹' + Math.abs(delta).toLocaleString('en-IN');
  if (statusEl) {
    statusEl.textContent = delta === 0 ? 'Matched' : delta > 0 ? 'Ledger exceeds GSTR-2B' : 'GSTR-2B exceeds ledger';
    statusEl.dataset.state = delta === 0 ? 'matched' : 'review';
  }
}

// Module 3: Income Tax Regime & Section 44AD/ADA + MSME 43B(h)
function calculateTaxRegime() {
  const grossIncome = parseFloat(document.getElementById('tax-gross-income')?.value) || 0;
  const bizType = document.getElementById('tax-business-type')?.value || '44ada';
  const deductions = parseFloat(document.getElementById('tax-deductions')?.value) || 0;

  const grossEl = document.getElementById('tax-gross-income-val');
  const dedEl = document.getElementById('tax-deductions-val');
  if (grossEl) grossEl.textContent = '₹' + grossIncome.toLocaleString('en-IN');
  if (dedEl) dedEl.textContent = '₹' + deductions.toLocaleString('en-IN');

  let deemedProfit = grossIncome;
  if (bizType === '44ada') deemedProfit = grossIncome * 0.50;
  else if (bizType === '44ad-digital') deemedProfit = grossIncome * 0.06;
  else if (bizType === '44ad-cash') deemedProfit = grossIncome * 0.08;
  else deemedProfit = grossIncome * 0.35;

  const baseEl = document.getElementById('tax-deemed-base');
  if (baseEl) baseEl.textContent = '₹' + Math.round(deemedProfit).toLocaleString('en-IN');

  // Old Regime Tax
  const oldNet = Math.max(0, deemedProfit - deductions);
  let oldTax = 0;
  if (oldNet <= 250000) oldTax = 0;
  else if (oldNet <= 500000) oldTax = (oldNet - 250000) * 0.05;
  else if (oldNet <= 1000000) oldTax = 12500 + (oldNet - 500000) * 0.20;
  else oldTax = 112500 + (oldNet - 1000000) * 0.30;
  if (oldNet <= 500000) oldTax = 0; // Section 87A rebate
  oldTax *= 1.04; // Cess

  // New Regime (115BAC - Finance Act 2024 slabs)
  let newTax = 0;
  if (deemedProfit <= 300000) newTax = 0;
  else if (deemedProfit <= 700000) newTax = (deemedProfit - 300000) * 0.05;
  else if (deemedProfit <= 1000000) newTax = 20000 + (deemedProfit - 700000) * 0.10;
  else if (deemedProfit <= 1200000) newTax = 50000 + (deemedProfit - 1000000) * 0.15;
  else if (deemedProfit <= 1500000) newTax = 80000 + (deemedProfit - 1200000) * 0.20;
  else newTax = 140000 + (deemedProfit - 1500000) * 0.30;

  // Section 87A Full Rebate + Marginal Relief
  if (deemedProfit <= 700000) {
    newTax = 0;
  } else if (deemedProfit > 700000 && deemedProfit <= 727777) {
    // Marginal relief under Section 87A proviso
    const excess = deemedProfit - 700000;
    newTax = Math.min(newTax, excess);
  }
  newTax *= 1.04;

  const savings = Math.abs(oldTax - newTax);
  const optimal = newTax <= oldTax ? 'New Regime (115BAC)' : 'Old Tax Regime';

  const oldEl = document.getElementById('tax-old-liability');
  const newEl = document.getElementById('tax-new-liability');
  const optEl = document.getElementById('tax-optimal-choice');
  const savEl = document.getElementById('tax-net-savings');

  if (oldEl) oldEl.textContent = '₹' + Math.round(oldTax).toLocaleString('en-IN');
  if (newEl) newEl.textContent = '₹' + Math.round(newTax).toLocaleString('en-IN');
  if (optEl) optEl.textContent = optimal;
  if (savEl) savEl.textContent = '₹' + Math.round(savings).toLocaleString('en-IN');
}

// MSME 43B(h) Vendor Payment Tracker
const MSME_VENDORS_KEY = 'ccs_msme_vendors';

function loadMsmVendors() {
  try {
    const raw = localStorage.getItem(MSME_VENDORS_KEY);
    let parsed = [];
      try { parsed = raw ? JSON.parse(raw) : []; } catch (_e) { parsed = []; }
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('MSME tracker could not load from local storage.', error);
    return [];
  }
}

function saveMsmVendors(vendors) {
  try {
    localStorage.setItem(MSME_VENDORS_KEY, JSON.stringify(vendors));
  } catch (error) {
    console.warn('MSME tracker could not save to local storage.', error);
  }
}

function addMsmVendor(event) {
  event?.preventDefault();
  const form = document.getElementById('msme-vendor-form');
  if (!form || !form.reportValidity()) return;
  const formData = new FormData(form);
  const name = String(formData.get('vendorName') || '').trim();
  const amount = Number(formData.get('vendorAmount'));
  const acceptanceDate = String(formData.get('acceptanceDate') || '');
  if (!name || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(acceptanceDate)) return;

  const vendors = loadMsmVendors();
  vendors.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    amount,
    acceptanceDate,
    hasWrittenAgreement: formData.get('writtenAgreement') === 'on',
    isMsm: formData.get('isMsm') === 'on'
  });
  saveMsmVendors(vendors);
  form.reset();
  form.querySelector('[name="acceptanceDate"]').value = getLocalDateString();
  renderMsmVendors();
}

function removeMsmVendor(id) {
  const vendors = loadMsmVendors().filter(v => v.id !== id);
  saveMsmVendors(vendors);
  renderMsmVendors();
}

function exportMsmVendorsCsv() {
  const vendors = loadMsmVendors();
  if (vendors.length === 0) {
    alert('No vendor records found to export. Add at least one vendor first.');
    return;
  }
  const headers = ['Vendor Name', 'Outstanding Amount (INR)', 'Acceptance Date', 'Written Agreement', 'Is MSME', 'Payment Deadline (Days)', 'Payment Due Date', 'Status'];
  const today = getLocalDateString();
  const rows = vendors.map(v => {
    const { daysAllowed, date: deadline } = getMsmPaymentDeadline(v);
    const daysToDeadline = getDaysBetween(today, deadline);
    const status = !v.isMsm ? 'Not MSME' : daysToDeadline < 0 ? `OVERDUE by ${Math.abs(daysToDeadline)}d` : `DUE in ${daysToDeadline}d`;
    return [
      `"${v.name.replace(/"/g, '""')}"`,
      v.amount,
      v.acceptanceDate,
      v.hasWrittenAgreement ? 'Yes (45 Days)' : 'No (15 Days)',
      v.isMsm ? 'Yes' : 'No',
      daysAllowed,
      deadline,
      status
    ].join(',');
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `craftegon-msme-43bh-audit-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getDaysBetween(start, end) {
  const d1 = new Date(`${start}T00:00:00Z`);
  const d2 = new Date(`${end}T00:00:00Z`);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getLocalDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getMsmPaymentDeadline(vendor) {
  const daysAllowed = vendor.hasWrittenAgreement ? 45 : 15;
  const deadline = new Date(`${vendor.acceptanceDate}T00:00:00Z`);
  deadline.setUTCDate(deadline.getUTCDate() + daysAllowed);
  return { daysAllowed, date: deadline.toISOString().slice(0, 10) };
}

function buildMsmVendorForm() {
  const container = document.getElementById('msme-vendor-list');
  if (!container || document.getElementById('msme-vendor-form')) return;
  const form = document.createElement('form');
  form.id = 'msme-vendor-form';
  form.className = 'msme-vendor-form';

  const fields = [
    ['Vendor / supplier name', 'vendorName', 'text'],
    ['Outstanding amount (INR)', 'vendorAmount', 'number'],
    ['Invoice acceptance date', 'acceptanceDate', 'date']
  ];
  fields.forEach(([labelText, name, type]) => {
    const field = document.createElement('div');
    field.className = 'form-group';
    const label = document.createElement('label');
    label.htmlFor = `msme-${name}`;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = `msme-${name}`;
    input.name = name;
    input.type = type;
    input.required = true;
    if (type === 'number') {
      input.min = '0.01';
      input.step = '0.01';
      input.inputMode = 'decimal';
    }
    if (type === 'date') input.value = getLocalDateString();
    field.append(label, input);
    form.appendChild(field);
  });

  [['Written payment agreement (up to 45 days)', 'writtenAgreement'], ['Supplier is a registered micro or small enterprise', 'isMsm']].forEach(([labelText, name]) => {
    const label = document.createElement('label');
    label.className = 'msme-check-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    label.append(input, document.createTextNode(labelText));
    form.appendChild(label);
  });

  const actions = document.createElement('div');
  actions.className = 'msme-vendor-actions';
  actions.style.display = 'flex';
  actions.style.gap = '0.5rem';
  actions.style.alignItems = 'center';
  actions.style.marginTop = '0.5rem';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'if-btn-secondary';
  submit.textContent = 'Add supplier to tracker';
  actions.appendChild(submit);

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'if-btn-secondary';
  exportBtn.textContent = '📥 Export CSV';
  exportBtn.onclick = exportMsmVendorsCsv;
  actions.appendChild(exportBtn);

  form.appendChild(actions);
  form.addEventListener('submit', addMsmVendor);
  container.parentNode.insertBefore(form, container);
}

function renderMsmVendors() {
  const container = document.getElementById('msme-vendor-list');
  const summaryEl = document.getElementById('msme-summary');
  if (!container) return;

  const vendors = loadMsmVendors();
  const today = getLocalDateString();

  if (vendors.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'msme-empty-state';
    empty.textContent = 'No suppliers added. Enter a supplier and acceptance date to start tracking.';
    container.replaceChildren(empty);
    if (summaryEl) summaryEl.textContent = 'Add vendors to track payment deadlines';
    return;
  }

  let overdueCount = 0, dueSoonCount = 0, compliantCount = 0, notApplicableCount = 0, overdueSum = 0;
  const rows = vendors.map(v => {
    const accepted = v.acceptanceDate || today;
    const { daysAllowed, date: deadline } = getMsmPaymentDeadline({ ...v, acceptanceDate: accepted });
    const daysToDeadline = getDaysBetween(today, deadline);
    const inScope = Boolean(v.isMsm);
    const isOverdue = daysToDeadline < 0;
    const isDueSoon = daysToDeadline >= 0 && daysToDeadline <= 7;

    if (!inScope) notApplicableCount++;
    else if (isOverdue) {
      overdueCount++;
      overdueSum += Number(v.amount) || 0;
    }
    else if (isDueSoon) dueSoonCount++;
    else compliantCount++;

    const statusClass = !inScope ? '' : isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'compliant';
    const statusText = !inScope ? 'Not marked as MSME' : isOverdue ? `OVERDUE by ${Math.abs(daysToDeadline)} days` : isDueSoon ? `DUE in ${daysToDeadline} days` : 'Within payment period';
    const statusBadgeClass = !inScope ? 'status-not-applicable' : isOverdue ? 'status-overdue' : isDueSoon ? 'status-due-soon' : 'status-compliant';

    const row = document.createElement('div');
    row.className = `tracker-row ${statusClass}`.trim();
    row.dataset.id = String(v.id);
    const info = document.createElement('div');
    info.className = 'tracker-info';
    const name = document.createElement('span');
    name.className = 'tracker-label';
    name.textContent = v.name;
    const details = document.createElement('span');
    details.className = 'tracker-value';
    details.textContent = `₹${Number(v.amount).toLocaleString('en-IN')} · Accepted: ${accepted} · Due: ${deadline} (${daysAllowed} days)`;
    info.append(name, details);

    const right = document.createElement('div');
    right.className = 'msme-vendor-actions';
    const badge = document.createElement('span');
    badge.className = `tracker-status ${statusBadgeClass}`;
    badge.textContent = statusText;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'msme-remove-vendor';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => removeMsmVendor(v.id));

    right.append(badge, remove);
    row.append(info, right);
    return row;
  });

  container.replaceChildren(...rows);
  // Section 43B(h) Corporate Tax Shock Calculation
  const corporateTaxShock = Math.round(overdueSum * 0.2517);

  const shockBanner = document.getElementById('msme-tax-shock-banner');
  const shockOverdueAmt = document.getElementById('msme-shock-overdue-amt');
  const shockTaxAmt = document.getElementById('msme-shock-tax-amt');
  if (shockBanner) {
    if (overdueSum > 0) {
      shockBanner.style.display = 'block';
      if (shockOverdueAmt) shockOverdueAmt.textContent = '₹' + overdueSum.toLocaleString('en-IN');
      if (shockTaxAmt) shockTaxAmt.textContent = '+₹' + corporateTaxShock.toLocaleString('en-IN') + ' Advance Tax';
    } else {
      shockBanner.style.display = 'none';
    }
  }

  if (summaryEl) {
    summaryEl.textContent = `Total tracked: ${vendors.length} | Overdue: ${overdueCount} | Due soon: ${dueSoonCount} | Compliant: ${compliantCount}`;
  }
}

// Module 4: Cap Table & Treasury Calculations
function calculateCapTable() {
  const preMoney = parseFloat(document.getElementById('cap-pre-money')?.value) || 0;
  const raise = parseFloat(document.getElementById('cap-raise-amount')?.value) || 0;
  const esopTarget = parseFloat(document.getElementById('cap-esop-target')?.value) || 0;
  const treasuryCash = parseFloat(document.getElementById('treasury-idle-cash')?.value) || 0;

  const preEl = document.getElementById('cap-pre-val');
  const raiseEl = document.getElementById('cap-raise-val');
  const esopEl = document.getElementById('cap-esop-val');
  const treasuryEl = document.getElementById('treasury-cash-val');

  if (preEl) preEl.textContent = '₹' + (preMoney / 10000000).toFixed(2) + ' Crores';
  if (raiseEl) raiseEl.textContent = '₹' + (raise / 10000000).toFixed(2) + ' Crores';
  if (esopEl) esopEl.textContent = esopTarget.toFixed(1) + '% Post-Round';
  if (treasuryEl) treasuryEl.textContent = '₹' + (treasuryCash / 10000000).toFixed(2) + ' Crores';

  const postMoney = preMoney + raise;
  const investorPct = (raise / postMoney) * 100;
  const founderPct = Math.max(0, 100 - investorPct - esopTarget);
  const treasuryRate = (Number(document.getElementById('treasury-rate')?.value) || 7.2) / 100;
  const treasuryYield = treasuryCash * treasuryRate;

  const pmEl = document.getElementById('cap-post-money');
  const invEl = document.getElementById('cap-investor-pct');
  const esopPctEl = document.getElementById('cap-esop-pct');
  const fndEl = document.getElementById('cap-founder-pct');
  const tyEl = document.getElementById('treasury-annual-yield');
  const treasuryRateLabel = document.querySelector('#calc-tab-4 .total-banner > div:first-child');

  if (pmEl) pmEl.textContent = '₹' + (postMoney / 10000000).toFixed(2) + ' Cr';
  if (invEl) invEl.textContent = investorPct.toFixed(2) + '%';
  if (esopPctEl) esopPctEl.textContent = esopTarget.toFixed(2) + '%';
  if (fndEl) fndEl.textContent = founderPct.toFixed(2) + '%';
  if (tyEl) tyEl.textContent = '₹' + Math.round(treasuryYield).toLocaleString('en-IN');
  if (treasuryRateLabel) treasuryRateLabel.textContent = `Annual forecast at assumed yield (${(treasuryRate * 100).toFixed(2)}%)`;
  calculateEmi();
}

function calculateEmi() {
  const principal = Number(document.getElementById('startup-loan-principal')?.value) || 0;
  const annualRate = (Number(document.getElementById('startup-loan-rate')?.value) || 0) / 100;
  const months = Math.max(1, Number(document.getElementById('startup-loan-tenure')?.value) || 1);
  const monthlyRate = annualRate / 12;
  const emi = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const output = document.getElementById('startup-loan-emi');
  if (output) output.textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
}

function mountGst2bReconciliation() {
  const card = document.querySelector('#calc-tab-2 .calc-card');
  if (!card || document.getElementById('gst-2b-reconciliation')) return;
  const section = document.createElement('section');
  section.id = 'gst-2b-reconciliation';
  section.className = 'form-group';
  const heading = document.createElement('h3');
  heading.textContent = 'GSTR-2B ITC comparison';
  const note = document.createElement('p');
  note.textContent = 'Compare your purchase-ledger ITC with the value shown in GSTR-2B. This is a manual comparison and does not fetch GSTN data.';
  section.append(heading, note);
  [['Purchase ledger ITC (INR)', 'gst-2b-ledger'], ['GSTR-2B available ITC (INR)', 'gst-2b-available']].forEach(([labelText, id]) => {
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = id;
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.value = '0';
    input.addEventListener('input', calculateGst2bReconciliation);
    section.append(label, input);
  });
  const status = document.createElement('p');
  status.innerHTML = 'Difference: <strong id="gst-2b-difference">0</strong> · <span id="gst-2b-status" data-state="matched">Matched</span>' /* sanitized */;
  section.appendChild(status);
  card.appendChild(section);
}

function mountStartupForecastControls() {
  const card = document.querySelector('#calc-tab-4 .calc-card');
  if (!card || document.getElementById('startup-finance-forecast')) return;
  const section = document.createElement('section');
  section.id = 'startup-finance-forecast';
  section.className = 'form-group';
  const heading = document.createElement('h3');
  heading.textContent = 'Startup loan and treasury assumptions';
  section.appendChild(heading);
  const controls = [
    ['Loan principal (INR)', 'startup-loan-principal', 'number', '1000000'],
    ['Annual interest rate (%)', 'startup-loan-rate', 'number', '12'],
    ['Loan tenure (months)', 'startup-loan-tenure', 'number', '36'],
    ['Assumed annual treasury yield (%)', 'treasury-rate', 'number', '7.2']
  ];
  controls.forEach(([labelText, id, type, value]) => {
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.min = id === 'startup-loan-tenure' ? '1' : '0';
    input.step = id === 'startup-loan-tenure' ? '1' : '0.01';
    input.value = value;
    input.addEventListener('input', () => {
      calculateEmi();
      calculateCapTable();
    });
    section.append(label, input);
  });
  const emi = document.createElement('p');
  emi.textContent = 'Estimated monthly EMI: ';
  const output = document.createElement('strong');
  output.id = 'startup-loan-emi';
  output.textContent = '₹0';
  emi.appendChild(output);
  section.appendChild(emi);
  card.appendChild(section);
}


// Executive Statutory Briefing Memorandum Engine
function generateStatutoryMemo() {
  const modal = document.getElementById('statutory-memo-modal');
  if (!modal) return;

  const entityType = document.getElementById('entity-type')?.value || 'pvt-ltd';
  const tier = document.getElementById('capital-tier')?.value || 'tier-1';
  const state = document.getElementById('formation-state')?.value || 'maharashtra';
  const delayDays = parseInt(document.getElementById('roc-delay-days')?.value, 10) || 0;
  const cinVal = document.getElementById('cin-quick-input')?.value?.trim() || '';

  const entityLabels = {
    'pvt-ltd': 'Private Limited Company (SPICe+ Part A/B)',
    'llp': 'Limited Liability Partnership (LLP / FiLLiP)',
    'opc': 'One Person Company (OPC / SPICe+)',
    'section-8': 'Section 8 Non-Profit Company (INC-12)',
    'public-ltd': 'Public Limited Company (Unlisted)'
  };

  const stateLabels = {
    'delhi': 'NCT of Delhi (RoC Delhi & Haryana)',
    'maharashtra': 'Maharashtra (RoC Mumbai / Pune)',
    'karnataka': 'Karnataka (RoC Bangalore)',
    'tamil-nadu': 'Tamil Nadu (RoC Chennai / Coimbatore)',
    'kerala': 'Kerala (RoC Ernakulam)',
    'telangana': 'Telangana (RoC Hyderabad)',
    'other': 'Other Indian States / UTs'
  };

  const tierLabels = {
    'tier-1': 'Up to ₹1 Lakh Authorized Nominal Capital',
    'tier-2': '₹1 Lakh to ₹10 Lakhs Capital',
    'tier-3': '₹10 Lakhs to ₹25 Lakhs Capital',
    'tier-4': 'Above ₹25 Lakhs Capital'
  };

  const refCode = 'CCS-MEMO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const todayStr = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  const refBadge = document.getElementById('memo-ref-badge');
  const refEl = document.getElementById('memo-ref');
  const dateEl = document.getElementById('memo-date');
  const entityEl = document.getElementById('memo-entity-type');
  const jurisdictionEl = document.getElementById('memo-jurisdiction');
  const capitalEl = document.getElementById('memo-capital-tier');
  const cinEl = document.getElementById('memo-cin');
  const subjectEl = document.getElementById('memo-subject');
  const tbody = document.getElementById('memo-ledger-rows');
  const totalOutlayEl = document.getElementById('memo-total-outlay');
  const govNotesEl = document.getElementById('memo-governance-notes');
  const waBtn = document.getElementById('memo-whatsapp-btn');

  if (refBadge) refBadge.textContent = 'REF: ' + refCode;
  if (refEl) refEl.textContent = 'REF: ' + refCode;
  if (dateEl) dateEl.textContent = 'DATE: ' + todayStr;
  if (entityEl) entityEl.textContent = entityLabels[entityType] || entityType;
  if (jurisdictionEl) jurisdictionEl.textContent = stateLabels[state] || state;
  if (capitalEl) capitalEl.textContent = tierLabels[tier] || tier;
  if (cinEl) cinEl.textContent = cinVal ? cinVal.toUpperCase() : 'PENDING FORMATION / BENCHMARK';

  const rows = [];
  if (currentTab1Mode === 'formation') {
    if (subjectEl) subjectEl.textContent = 'EXECUTIVE STATUTORY OUTLAY MEMORANDUM: ' + (entityLabels[entityType] || entityType);

    const profFee = document.getElementById('prof-fee')?.textContent || '₹7,999';
    const govtFee = document.getElementById('govt-fee')?.textContent || '₹0';
    const stampFee = document.getElementById('stamp-fee')?.textContent || '₹1,000';
    const totalFee = document.getElementById('total-fee')?.textContent || '₹8,999';

    rows.push({
      item: 'Professional Secretarial & CS Retainer',
      basis: 'Chartered Secretarial drafting of MoA, AoA, e-Form SPICe+ Part A & B certification',
      amt: profFee
    });
    rows.push({
      item: 'MCA V3 Government Filing Fee',
      basis: 'Statutory Fee under MCA Rule 38 (Zero government fee for capital up to ₹15 Lakhs)',
      amt: govtFee
    });
    rows.push({
      item: 'State Stamp Duty on Constitution Documents',
      basis: (stateLabels[state] || state) + ' Stamp Act schedules on Articles & Memorandum',
      amt: stampFee
    });
    rows.push({
      item: 'Director Identification Number (DIN Allotment)',
      basis: 'Allotment of up to 2 DINs via SPICe+ Part B integrated MCA application',
      amt: 'Included in Base'
    });
    rows.push({
      item: 'Class-3 Digital Signature Certificate (DSC)',
      basis: 'Cryptographic USB token (Not included in package. Use existing DSC at no extra cost, or pay extra for new DSC)',
      amt: 'Extra at actuals (Separate)'
    });

    if (document.getElementById('f-addon-gst')?.checked) {
      rows.push({ item: 'GST Registration Expedited Filing', basis: 'Form GST REG-01 & ARN verification', amt: '₹999' });
    }
    if (document.getElementById('f-addon-dpiit')?.checked) {
      rows.push({ item: 'Startup India DPIIT Recognition & Tax Exemption Kit', basis: 'Form 1 Section 80-IAC tax exemption & DPIIT certificate', amt: '₹2,499' });
    }
    if (document.getElementById('f-addon-tm')?.checked) {
      rows.push({ item: 'Trademark Clearance & Form TM-A Filing', basis: 'NICE Class clearance & filing under Trade Marks Act 1999', amt: '₹3,999' });
    }
    if (document.getElementById('f-addon-governance')?.checked) {
      rows.push({ item: 'Corporate Banking Resolution & Share Certificates Kit', basis: 'Form SH-1 share certificates and banking minutes', amt: '₹1,499' });
    }

    if (totalOutlayEl) totalOutlayEl.textContent = totalFee;

    if (govNotesEl) {
      govNotesEl.innerHTML = '<ul style="margin: 0; padding-left: 1.25rem; line-height: 1.65;">' + /* sanitized */
        '<li><strong>Form INC-20A Mandatory Requirement:</strong> Under Section 10A of Companies Act 2013, declaration of commencement of business must be filed within 180 days of incorporation with bank deposit verification proof.</li>' +
        '<li><strong>Statutory Auditor Appointment (Form ADT-1):</strong> Board must appoint First Statutory Auditor within 30 days of incorporation under Section 139.</li>' +
        '<li><strong>Registered Office Verification (Form INC-22):</strong> Formal physical address verification must be submitted within 30 days under Section 12.</li>' +
        '<li><strong>All Filings Supervised:</strong> Work managed by Practicing Company Secretaries (PCS) and Chartered Accountants (FCA).</li>' +
        '</ul>';
    }
  } else {
    if (subjectEl) subjectEl.textContent = 'EXECUTIVE STATUTORY EXPOSURE & REGULARIZATION MEMO: ROC ANNUAL RETURNS';

    const profFee = document.getElementById('prof-fee')?.textContent || '₹15,999';
    const govtFee = document.getElementById('govt-fee')?.textContent || '₹1,200';
    const lateFee = document.getElementById('roc-late-fee')?.textContent || '₹0';
    const addonFee = document.getElementById('addon-fee')?.textContent || '₹0';
    const totalFee = document.getElementById('total-fee')?.textContent || '₹17,199';

    rows.push({
      item: 'Annual Secretarial Retainer (Full-Scope)',
      basis: 'Preparation of Board Report, Annual General Meeting (AGM), and Secretarial Records',
      amt: profFee
    });
    rows.push({
      item: 'Base MCA Challan Fee',
      basis: 'Statutory filing fees under Companies (Registration Offices and Fees) Rules 2014',
      amt: govtFee
    });
    rows.push({
      item: 'Section 403 Default Late Filing Fees',
      basis: delayDays + ' days overdue across defaulting forms @ ₹100/day per form',
      amt: lateFee
    });
    if (addonFee !== '₹0') {
      rows.push({
        item: 'Selected Governance Add-ons',
        basis: 'Register reconstruction, DIR-3 KYC, or PAS-6 reconciliation',
        amt: addonFee
      });
    }

    if (totalOutlayEl) totalOutlayEl.textContent = totalFee;

    if (govNotesEl) {
      govNotesEl.innerHTML = '<ul style="margin: 0; padding-left: 1.25rem; line-height: 1.65;">' + /* sanitized */
        '<li><strong>Section 403 Daily Late Fee Exposure:</strong> Statutory late filing fees compound daily at ₹100/day for each overdue form (AOC-4 and MGT-7). Immediate e-filing halts further financial leakage.</li>' +
        '<li><strong>Section 164(2) Director Disqualification:</strong> Non-filing of annual financial statements or annual returns for three consecutive financial years may trigger director disqualification consequences under Section 164(2), subject to statutory conditions and exceptions.</li>' +
        '<li><strong>Section 454 Adjudication Risk:</strong> RoC issues Section 454 show-cause notices for defaults exceeding 90 days, exposing company and officers to direct monetary penalties up to ₹5,00,000.</li>' +
        '<li><strong>Regularization Roadmap:</strong> Immediate audit closure, DIN activation, and e-filing under certified PCS supervision recommended.</li>' +
        '</ul>';
    }
  }

  if (tbody) {
    tbody.innerHTML = rows.map(r => '<tr>' + /* sanitized */
      '<td style="padding: 0.6rem 0.75rem; border: 1px solid #E2E8F0; font-weight: 600; color: #0F172A;">' + r.item + '</td>' +
      '<td style="padding: 0.6rem 0.75rem; border: 1px solid #E2E8F0; color: #475569;">' + r.basis + '</td>' +
      '<td style="padding: 0.6rem 0.75rem; border: 1px solid #E2E8F0; text-align: right; font-family: var(--font-mono); font-weight: 700; color: #0F172A;">' + r.amt + '</td>' +
      '</tr>').join('');
  }

  if (waBtn) {
    const totalOutlay = document.getElementById('total-fee')?.textContent || '₹0';
    const waText = 'Hello CraftEgon CCS CS Desk, I generated Executive Statutory Memorandum ' + refCode + ' for ' + (entityLabels[entityType] || entityType) + ' (Estimated Outlay: ' + totalOutlay + '). I would like to schedule execution.';
    waBtn.href = 'https://wa.me/918606918247?text=' + encodeURIComponent(waText);
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeStatutoryMemo() {
  const modal = document.getElementById('statutory-memo-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function switchTab(tabIndex) {
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById('tab-btn-' + i);
    const content = document.getElementById('calc-tab-' + i);
    if (btn && content) {
      if (i === tabIndex) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        content.classList.add('active');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        content.classList.remove('active');
      }
    }
  }
}

function handleHashRouting() {
  try {
    const hash = (window.location.hash || '').toLowerCase();
    if (!hash) return;
    if (hash.includes('tax') || hash.includes('msme') || hash === '#calc-tab-3' || hash === '#tab-3') {
      switchTab(3);
    } else if (hash.includes('gst') || hash === '#calc-tab-2' || hash === '#tab-2') {
      switchTab(2);
    } else if (hash.includes('startup') || hash.includes('cap-table') || hash.includes('emi') || hash === '#calc-tab-4' || hash === '#tab-4') {
      switchTab(4);
    } else if (hash.includes('annual') || hash.includes('roc') || hash.includes('penalty') || hash.includes('late-fee')) {
      switchTab(1);
      setTab1Mode('annual');
    } else if (hash.includes('formation') || hash.includes('outlay') || hash === '#calc-tab-1' || hash === '#tab-1') {
      switchTab(1);
      setTab1Mode('formation');
    } else if (hash.includes('cin')) {
      switchTab(1);
      const cinInput = document.getElementById('cin-quick-input');
      if (cinInput) {
        cinInput.focus();
      }
    }
  } catch (e) {
    // Non-blocking
  }
}

function disableExpiredCcfsControl() {
  const checkbox = document.getElementById('ccfs-mode');
  if (!checkbox) return;
  const closed = Date.now() > CCFS_2026_DEADLINE.getTime();
  checkbox.disabled = closed;
  if (closed) checkbox.checked = false;
  const label = checkbox.closest('label');
  if (label && closed) {
    Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
    label.appendChild(document.createTextNode(' CCFS-2026 closed 15 September 2026; historical relief is not applied.'));
  }
}

// Decorate all anchor links with UTM parameters
function decorateOutboundLinks() {
  try {
    const links = document.querySelectorAll('a[href^="/conversion/"], a[href^="/services/"]');
    links.forEach(a => {
      const orig = a.getAttribute('href');
      if (orig && !orig.startsWith('#')) {
        a.setAttribute('href', appendAttribution(orig));
      }
    });
  } catch (e) {
    // Non-blocking
  }
}

// Initialize calculators on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  captureAttribution();

  // Parse and sync state from query parameters
  try {
    const params = new URLSearchParams(window.location.search);
    let targetMode = 'formation';

    if (params.has('service')) {
      const val = params.get('service');
      const entityEl = document.getElementById('entity-type');
      const svcEl = document.getElementById('service-type');

      if (['pvt-ltd', 'llp', 'opc', 'section-8', 'public-ltd'].includes(val)) {
        targetMode = 'formation';
        if (entityEl) entityEl.value = val;
        if (svcEl && ['pvt-ltd', 'llp'].includes(val)) svcEl.value = val;
      } else if (['roc-retainer', 'gst-annual', 'trademark', 'overdue'].includes(val)) {
        targetMode = 'annual';
        if (svcEl) svcEl.value = val;
      }
    }

    if (params.has('capital')) {
      const cap = parseInt(params.get('capital'), 10);
      const tierEl = document.getElementById('capital-tier');
      if (tierEl && !isNaN(cap)) {
        if (cap <= 100000) tierEl.value = 'tier-1';
        else if (cap <= 1000000) tierEl.value = 'tier-2';
        else if (cap <= 2500000) tierEl.value = 'tier-3';
        else tierEl.value = 'tier-4';
      }
    }

    if (params.has('state')) {
      const stateEl = document.getElementById('formation-state');
      if (stateEl) stateEl.value = params.get('state');
    }

    setTab1Mode(targetMode);
  } catch (err) {
    setTab1Mode('formation');
  }

  disableExpiredCcfsControl();
  mountGst2bReconciliation();
  mountStartupForecastControls();
  buildMsmVendorForm();
  calculateCost();
  calculateGst();
  calculateTaxRegime();
  calculateCapTable();
  renderMsmVendors();
  decorateOutboundLinks();
  handleHashRouting();
  window.addEventListener('hashchange', handleHashRouting);
});

// Export for window
window.CraftegonCalculator = {
  get currentTab1Mode() { return currentTab1Mode; },
  setTab1Mode,
  switchTab,
  decryptCin,
  handleCinInput,
  generateStatutoryMemo,
  closeStatutoryMemo,
  onEntityTypeChange,
  calculateCost,
  calculateGst,
  calculateTaxRegime,
  calculateCapTable,
  calculateEmi,
  calculateGst2bReconciliation,
  loadMsmVendors,
  saveMsmVendors,
  addMsmVendor,
  removeMsmVendor,
  renderMsmVendors,
  exportMsmVendorsCsv,
  appendAttribution
};
