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
      const parsed = JSON.parse(rawV1);
      if (parsed && typeof parsed === 'object') return parsed;
    }
    const raw = sessionStorage.getItem('ccs_attribution');
    return raw ? JSON.parse(raw) : {};
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

// Module 1: Tab 1 Mode Switcher (Formation vs Annual Late Fees)
function setTab1Mode(mode) {
  currentTab1Mode = mode === 'annual' ? 'annual' : 'formation';

  const btnFormation = document.getElementById('btn-mode-formation');
  const btnAnnual = document.getElementById('btn-mode-annual');
  if (btnFormation && btnAnnual) {
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
      noteEl.innerHTML = '<strong>STATUTORY TRANSPARENCY:</strong> MCA Government filing fee is ₹0 under Rule 38 for companies with nominal capital up to ₹15 Lakhs. State stamp duty varies slightly by registered office location. All filings supervised directly by practicing CS & CA.';
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
    if (lateFeeRow) lateFeeRow.style.display = 'flex';
    if (ccfsRow) ccfsRow.style.display = 'flex';

    if (cardTitle) cardTitle.textContent = 'RoC Statutory Late Fee & Retainer Estimate';
    if (cardSubtitle) cardSubtitle.textContent = 'Indicative estimate for overdue annual returns (AOC-4, MGT-7, DIR-3 KYC). CCFS-2026 closed on 15 September 2026.';
    if (cardBadge) {
      cardBadge.textContent = 'Section 403: ₹100/Day';
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
      noteEl.innerHTML = '<strong>ESTIMATE LIMITATION:</strong> This illustrative model uses a per-day input and does not reproduce the complete MCA form-wise fee schedule or determine a filing\'s eligibility. CCFS-2026 relief is closed and is not included. Confirm current fees in the MCA portal.';
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
      baseProf = 4999;
      baseGovt = 0; // MCA fee exempt up to 15L capital
      if (tier === 'tier-3') { baseProf = 5499; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 5999; baseGovt = 1000; stampDuty += 1500; }
    } else if (entityType === 'llp') {
      baseProf = 4499;
      baseGovt = 500; // FiLLiP statutory fee
      stampDuty = 500; // LLP Agreement stamp duty baseline
      if (tier === 'tier-3') { baseProf = 4999; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 5499; baseGovt = 1000; stampDuty += 1000; }
    } else if (entityType === 'opc') {
      baseProf = 4499;
      baseGovt = 0;
      if (tier === 'tier-3') { baseProf = 4999; stampDuty += 500; }
      else if (tier === 'tier-4') { baseProf = 5499; baseGovt = 1000; stampDuty += 1000; }
    } else if (entityType === 'section-8') {
      baseProf = 14999;
      baseGovt = 2000; // INC-12 license fee
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

    let overdueFormsCount = 0;
    if (document.getElementById('form-aoc4')?.checked) overdueFormsCount++;
    if (document.getElementById('form-mgt7')?.checked) overdueFormsCount++;

    rocLateFee = overdueFormsCount * delayDays * 100;
    if (document.getElementById('form-dir3kyc')?.checked && delayDays > 0) rocLateFee += 5000;
    if (document.getElementById('form-pas6')?.checked && delayDays > 0) rocLateFee += 1000;

    if (ccfsMode && rocLateFee > 0) {
      ccfsFee = Math.round(rocLateFee * 0.9);
      rocLateFee = Math.round(rocLateFee * 0.1);
    }

    total = baseProf + baseGovt + rocLateFee + addonTotal;

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
    const parsed = raw ? JSON.parse(raw) : [];
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

  let overdueCount = 0, dueSoonCount = 0, compliantCount = 0, notApplicableCount = 0;
  const rows = vendors.map(v => {
    const accepted = v.acceptanceDate || today;
    const { daysAllowed, date: deadline } = getMsmPaymentDeadline({ ...v, acceptanceDate: accepted });
    const daysToDeadline = getDaysBetween(today, deadline);
    const inScope = Boolean(v.isMsm);
    const isOverdue = daysToDeadline < 0;
    const isDueSoon = daysToDeadline >= 0 && daysToDeadline <= 7;

    if (!inScope) notApplicableCount++;
    else if (isOverdue) overdueCount++;
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
  status.innerHTML = 'Difference: <strong id="gst-2b-difference">0</strong> · <span id="gst-2b-status" data-state="matched">Matched</span>';
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
});

// Export for window
window.CraftegonCalculator = {
  get currentTab1Mode() { return currentTab1Mode; },
  setTab1Mode,
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
