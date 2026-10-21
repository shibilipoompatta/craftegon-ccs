/**
 * Craftegon Corporate Services (CCS) - Shared Calculator Logic
 * Powers conversion/calculator.html and portal dashboard widgets
 * Pure ES6, zero dependencies
 */

// Module 1: Corporate Retainer & RoC Late Fee Calculations
const CCFS_2026_DEADLINE = new Date('2026-09-15T23:59:59+05:30');

function calculateCost() {
  const service = document.getElementById('service-type')?.value || 'roc-retainer';
  const tier = document.getElementById('capital-tier')?.value || 'tier-1';
  const delayDays = parseInt(document.getElementById('roc-delay-days')?.value) || 0;
  const ccfsMode = Boolean(document.getElementById('ccfs-mode')?.checked) && Date.now() <= CCFS_2026_DEADLINE.getTime();

  let baseProf = 14999;
  let baseGovt = 1200;

  if (service === 'pvt-ltd') { baseProf = 7499; baseGovt = 3500; }
  else if (service === 'llp') { baseProf = 5999; baseGovt = 2500; }
  else if (service === 'roc-retainer') { baseProf = 14999; baseGovt = 1200; }
  else if (service === 'gst-annual') { baseProf = 12999; baseGovt = 0; }
  else if (service === 'trademark') { baseProf = 4499; baseGovt = 4500; }

  // Tier multiplier
  if (tier === 'tier-2') baseGovt = Math.round(baseGovt * 1.5);
  if (tier === 'tier-3') baseGovt = Math.round(baseGovt * 2.5);

  // Addons
  let addonTotal = 0;
  const msmeCheck = document.getElementById('addon-msme');
  const shaCheck = document.getElementById('addon-sha');
  const acCheck = document.getElementById('addon-current-ac');
  if (msmeCheck && msmeCheck.checked) addonTotal += 999;
  if (shaCheck && shaCheck.checked) addonTotal += 4999;
  if (acCheck && acCheck.checked) addonTotal += 1499;

  // Late fee logic: Section 403 ₹100 per day per form for AOC-4 & MGT-7
  let overdueFormsCount = 0;
  if (document.getElementById('form-aoc4')?.checked) overdueFormsCount++;
  if (document.getElementById('form-mgt7')?.checked) overdueFormsCount++;

  let rocLateFee = overdueFormsCount * delayDays * 100;

  // DIR-3 KYC: flat ₹5,000 late filing penalty under Rule 12A
  if (document.getElementById('form-dir3kyc')?.checked && delayDays > 0) {
    rocLateFee += 5000;
  }

  // PAS-6: ₹1,000 flat late fee
  if (document.getElementById('form-pas6')?.checked && delayDays > 0) {
    rocLateFee += 1000;
  }

  // CCFS-2026 Amnesty: 10% of additional fee
  let ccfsFee = 0;
  if (ccfsMode && rocLateFee > 0) {
    ccfsFee = Math.round(rocLateFee * 0.9); // Savings = 90% of late fee
    rocLateFee = Math.round(rocLateFee * 0.1); // Pay only 10%
  }

  const total = baseProf + baseGovt + rocLateFee + addonTotal;

  const profEl = document.getElementById('prof-fee');
  const govtEl = document.getElementById('govt-fee');
  const lateEl = document.getElementById('roc-late-fee');
  const ccfsEl = document.getElementById('ccfs-fee');
  const addonEl = document.getElementById('addon-fee');
  const totalEl = document.getElementById('total-fee');

  if (profEl) profEl.innerText = '₹' + baseProf.toLocaleString('en-IN');
  if (govtEl) govtEl.innerText = '₹' + baseGovt.toLocaleString('en-IN');
  if (lateEl) lateEl.innerText = '₹' + rocLateFee.toLocaleString('en-IN');
  if (ccfsEl) {
    const closed = Date.now() > CCFS_2026_DEADLINE.getTime();
    ccfsEl.textContent = ccfsMode ? '₹' + ccfsFee.toLocaleString('en-IN') + ' saved' : (closed ? 'Closed 15 Sep 2026' : 'Not applied');
    ccfsEl.style.color = ccfsMode ? '#059669' : '#64748B';
  }
  if (addonEl) addonEl.innerText = '₹' + addonTotal.toLocaleString('en-IN');
  if (totalEl) totalEl.innerText = '₹' + Math.round(total).toLocaleString('en-IN');
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

  if (turnoverEl) turnoverEl.innerText = '₹' + turnover.toLocaleString('en-IN');
  if (procEl) procEl.innerText = '₹' + procurement.toLocaleString('en-IN');
  if (blockedEl) blockedEl.innerText = (blockedPct * 100).toFixed(0) + '% Disallowed';

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

  if (outEl) outEl.innerText = '₹' + Math.round(outputTax).toLocaleString('en-IN');
  if (itcEl) itcEl.innerText = '₹' + Math.round(totalItc).toLocaleString('en-IN');
  if (blkEl) blkEl.innerText = '-₹' + Math.round(blockedTax).toLocaleString('en-IN');
  if (eligEl) eligEl.innerText = '₹' + Math.round(eligibleItc).toLocaleString('en-IN');
  if (netEl) netEl.innerText = '₹' + Math.round(netPayable).toLocaleString('en-IN');
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
  if (grossEl) grossEl.innerText = '₹' + grossIncome.toLocaleString('en-IN');
  if (dedEl) dedEl.innerText = '₹' + deductions.toLocaleString('en-IN');

  let deemedProfit = grossIncome;
  if (bizType === '44ada') deemedProfit = grossIncome * 0.50;
  else if (bizType === '44ad-digital') deemedProfit = grossIncome * 0.06;
  else if (bizType === '44ad-cash') deemedProfit = grossIncome * 0.08;
  else deemedProfit = grossIncome * 0.35;

  const baseEl = document.getElementById('tax-deemed-base');
  if (baseEl) baseEl.innerText = '₹' + Math.round(deemedProfit).toLocaleString('en-IN');

  // Old Regime Tax
  const oldNet = Math.max(0, deemedProfit - deductions);
  let oldTax = 0;
  if (oldNet <= 250000) oldTax = 0;
  else if (oldNet <= 500000) oldTax = (oldNet - 250000) * 0.05;
  else if (oldNet <= 1000000) oldTax = 12500 + (oldNet - 500000) * 0.20;
  else oldTax = 112500 + (oldNet - 1000000) * 0.30;
  if (oldNet <= 500000) oldTax = 0;
  oldTax *= 1.04;

  // New Regime (115BAC)
  let newTax = 0;
  if (deemedProfit <= 300000) newTax = 0;
  else if (deemedProfit <= 700000) newTax = (deemedProfit - 300000) * 0.05;
  else if (deemedProfit <= 1000000) newTax = 20000 + (deemedProfit - 700000) * 0.10;
  else if (deemedProfit <= 1200000) newTax = 50000 + (deemedProfit - 1000000) * 0.15;
  else if (deemedProfit <= 1500000) newTax = 80000 + (deemedProfit - 1200000) * 0.20;
  else newTax = 140000 + (deemedProfit - 1500000) * 0.30;
  if (deemedProfit <= 700000) newTax = 0;
  newTax *= 1.04;

  const savings = Math.abs(oldTax - newTax);
  const optimal = newTax <= oldTax ? 'New Regime (115BAC)' : 'Old Tax Regime';

  const oldEl = document.getElementById('tax-old-liability');
  const newEl = document.getElementById('tax-new-liability');
  const optEl = document.getElementById('tax-optimal-choice');
  const savEl = document.getElementById('tax-net-savings');

  if (oldEl) oldEl.innerText = '₹' + Math.round(oldTax).toLocaleString('en-IN');
  if (newEl) newEl.innerText = '₹' + Math.round(newTax).toLocaleString('en-IN');
  if (optEl) optEl.innerText = optimal;
  if (savEl) savEl.innerText = '₹' + Math.round(savings).toLocaleString('en-IN');
}

// MSME 43B(h) Vendor Payment Tracker
const MSME_VENDORS_KEY = 'ccs_msme_vendors';

function loadMsmVendors() {
  try {
    const data = localStorage.getItem(MSME_VENDORS_KEY);
    const vendors = data ? JSON.parse(data) : [];
    return Array.isArray(vendors) ? vendors.filter(vendor => vendor && typeof vendor.name === 'string' && Number.isFinite(Number(vendor.amount))) : [];
  } catch { return []; }
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

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'if-btn-secondary';
  submit.textContent = 'Add supplier to tracker';
  form.appendChild(submit);
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
    if (summaryEl) summaryEl.innerText = 'Add vendors to track payment deadlines';
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
    details.textContent = `₹${Number(v.amount).toLocaleString('en-IN')} · Accepted ${accepted} · Due ${deadline} (${daysAllowed} days)`;
    info.append(name, details);
    const actions = document.createElement('div');
    actions.className = 'msme-vendor-actions';
    const status = document.createElement('span');
    status.className = `tracker-status ${statusBadgeClass}`;
    status.textContent = statusText;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'msme-remove-vendor';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => removeMsmVendor(v.id));
    actions.append(status, remove);
    row.append(info, actions);
    return row;
  });
  container.replaceChildren(...rows);

  if (summaryEl) {
    const total = document.createElement('p');
    total.textContent = `${vendors.length} suppliers tracked · ${overdueCount} overdue · ${dueSoonCount} due in 7 days · ${compliantCount} within period · ${notApplicableCount} not marked MSME`;
    summaryEl.replaceChildren(total);
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

  if (preEl) preEl.innerText = '₹' + (preMoney / 10000000).toFixed(2) + ' Crores';
  if (raiseEl) raiseEl.innerText = '₹' + (raise / 10000000).toFixed(2) + ' Crores';
  if (esopEl) esopEl.innerText = esopTarget.toFixed(1) + '% Post-Round';
  if (treasuryEl) treasuryEl.innerText = '₹' + (treasuryCash / 10000000).toFixed(2) + ' Crores';

  const postMoney = preMoney + raise;
  const investorPct = (raise / postMoney) * 100;
  const founderPct = Math.max(0, 100 - investorPct - esopTarget);
  const treasuryRate = (Number(document.getElementById('treasury-rate')?.value) || 0) / 100;
  const treasuryYield = treasuryCash * treasuryRate;

  const pmEl = document.getElementById('cap-post-money');
  const invEl = document.getElementById('cap-investor-pct');
  const esopPctEl = document.getElementById('cap-esop-pct');
  const fndEl = document.getElementById('cap-founder-pct');
  const tyEl = document.getElementById('treasury-annual-yield');
  const treasuryRateLabel = document.querySelector('#calc-tab-4 .total-banner > div:first-child');

  if (pmEl) pmEl.innerText = '₹' + (postMoney / 10000000).toFixed(2) + ' Cr';
  if (invEl) invEl.innerText = investorPct.toFixed(2) + '%';
  if (esopPctEl) esopPctEl.innerText = esopTarget.toFixed(2) + '%';
  if (fndEl) fndEl.innerText = founderPct.toFixed(2) + '%';
  if (tyEl) tyEl.innerText = '₹' + Math.round(treasuryYield).toLocaleString('en-IN');
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
  const note = document.querySelector('#calc-tab-1 .ai-optimization-note');
  if (note && closed) {
    note.textContent = 'CCFS-2026 closed on 15 September 2026. This estimator does not apply the historical fee concession. Government fees vary by filing and current rules; verify the current MCA fee schedule before filing.';
  }
}

// Initialize calculators on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  disableExpiredCcfsControl();
  mountGst2bReconciliation();
  mountStartupForecastControls();
  buildMsmVendorForm();
  calculateCost();
  calculateGst();
  calculateTaxRegime();
  calculateCapTable();
  renderMsmVendors();
});

// Export for use in other pages
window.CraftegonCalculator = {
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
  renderMsmVendors
};