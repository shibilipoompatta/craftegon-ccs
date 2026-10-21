/**
 * Craftegon Corporate Services (CCS) - Shared Calculator Logic
 * Powers conversion/calculator.html and portal dashboard widgets
 * Pure ES6, zero dependencies
 */

// Module 1: Corporate Retainer & RoC Late Fee Calculations
function calculateCost() {
  const service = document.getElementById('service-type')?.value || 'roc-retainer';
  const tier = document.getElementById('capital-tier')?.value || 'tier-1';
  const delayDays = parseInt(document.getElementById('roc-delay-days')?.value) || 0;
  const ccfsMode = document.getElementById('ccfs-mode')?.checked || false;

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
    ccfsEl.innerText = ccfsMode ? '₹' + ccfsFee.toLocaleString('en-IN') + ' saved' : '₹0';
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
  const blockedPct = (parseFloat(document.getElementById('gst-blocked-itc')?.value) || 10) / 100;

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
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveMsmVendors(vendors) {
  localStorage.setItem(MSME_VENDORS_KEY, JSON.stringify(vendors));
}

function addMsmVendor() {
  const name = prompt('Vendor Name:');
  if (!name) return;
  const amount = parseFloat(prompt('Outstanding Amount (₹):') || '0');
  const invoiceDate = prompt('Invoice Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  const contractDate = prompt('Contract Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  const isMsm = confirm('Is this vendor registered on Udyam/MSME portal?');

  const vendors = loadMsmVendors();
  vendors.push({
    id: Date.now(),
    name,
    amount,
    invoiceDate,
    contractDate,
    isMsm
  });
  saveMsmVendors(vendors);
  renderMsmVendors();
}

function removeMsmVendor(id) {
  const vendors = loadMsmVendors().filter(v => v.id !== id);
  saveMsmVendors(vendors);
  renderMsmVendors();
}

function getDaysBetween(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function renderMsmVendors() {
  const container = document.getElementById('msme-vendor-list');
  const summaryEl = document.getElementById('msme-summary');
  if (!container) return;

  const vendors = loadMsmVendors();
  const today = new Date().toISOString().split('T')[0];

  if (vendors.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No vendors added. Click "Add MSME Vendor" to start tracking.</p>';
    if (summaryEl) summaryEl.innerText = 'Add vendors to track payment deadlines';
    return;
  }

  let overdueCount = 0, dueSoonCount = 0, compliantCount = 0;

  container.innerHTML = vendors.map(v => {
    const invoiceDate = v.invoiceDate || today;
    const contractDate = v.contractDate || today;
    const daysSinceInvoice = getDaysBetween(invoiceDate, today);
    const daysSinceContract = getDaysBetween(contractDate, today);

    // 45-day rule from contract date for MSME vendors
    const deadline = new Date(contractDate);
    deadline.setDate(deadline.getDate() + 45);
    const daysToDeadline = getDaysBetween(today, deadline.toISOString().split('T')[0]);
    const isOverdue = daysToDeadline < 0;
    const isDueSoon = daysToDeadline >= 0 && daysToDeadline <= 7;

    if (isOverdue) overdueCount++;
    else if (isDueSoon) dueSoonCount++;
    else compliantCount++;

    const statusClass = isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'compliant';
    const statusText = isOverdue ? `OVERDUE by ${Math.abs(daysToDeadline)} days` : isDueSoon ? `DUE in ${daysToDeadline} days` : 'COMPLIANT';
    const statusBadgeClass = isOverdue ? 'status-overdue' : isDueSoon ? 'status-due-soon' : 'status-compliant';

    return `
      <div class="tracker-row ${statusClass}" data-id="${v.id}">
        <div class="tracker-info">
          <span class="tracker-label">${v.name}</span>
          <span class="tracker-value">${v.isMsm ? '<span class="vendor-chip msme">MSME</span> ' : ''}₹${v.amount.toLocaleString('en-IN')} &bull; Invoice: ${invoiceDate} &bull; Contract: ${contractDate}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="tracker-status ${statusBadgeClass}">${statusText}</span>
          <button type="button" onclick="removeMsmVendor(${v.id})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 0.25rem;" title="Remove vendor">×</button>
        </div>
      </div>
    `;
  }).join('');

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <span class="tracker-status status-overdue">${overdueCount} Overdue</span>
        <span class="tracker-status status-due-soon">${dueSoonCount} Due Soon</span>
        <span class="tracker-status status-compliant">${compliantCount} Compliant</span>
      </div>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">Total Vendors: ${vendors.length} &bull; Section 43B(h): 45-day payment window from written contract date</p>
    `;
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
  const treasuryYield = treasuryCash * 0.072;

  const pmEl = document.getElementById('cap-post-money');
  const invEl = document.getElementById('cap-investor-pct');
  const esopPctEl = document.getElementById('cap-esop-pct');
  const fndEl = document.getElementById('cap-founder-pct');
  const tyEl = document.getElementById('treasury-annual-yield');

  if (pmEl) pmEl.innerText = '₹' + (postMoney / 10000000).toFixed(2) + ' Cr';
  if (invEl) invEl.innerText = investorPct.toFixed(2) + '%';
  if (esopPctEl) esopPctEl.innerText = esopTarget.toFixed(2) + '%';
  if (fndEl) fndEl.innerText = founderPct.toFixed(2) + '%';
  if (tyEl) tyEl.innerText = '₹' + Math.round(treasuryYield).toLocaleString('en-IN');
}

// Initialize calculators on DOM ready
document.addEventListener('DOMContentLoaded', () => {
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
  loadMsmVendors,
  saveMsmVendors,
  addMsmVendor,
  removeMsmVendor,
  renderMsmVendors
};