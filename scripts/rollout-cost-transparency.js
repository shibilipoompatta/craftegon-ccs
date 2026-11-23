const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/service-registry.json'), 'utf8'));
const pricing = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/pricing.json'), 'utf8'));
const eligibility = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/eligibility.json'), 'utf8'));

// Build pricing map by canonical route
const pricingMap = {};
Object.values(pricing).forEach(p => {
  pricingMap[p.canonical_route] = p;
});

// Build eligibility map by service_id
const elgMap = {};
Object.values(eligibility).forEach(e => {
  elgMap[e.service_id] = e;
});

const serviceFiles = fs.readdirSync(path.join(rootDir, 'services')).filter(f => f.endsWith('.html') && f !== 'index.html');

const alreadyDone = [
  'pvt-ltd-registration.html',
  'llp-registration.html',
  'msme-udyam.html',
  'dir3-kyc.html',
  'trademark-registration.html',
  'gst-annual.html',
  'nclt-merger-petitions.html',
  'opc-registration.html',
  'section-8-registration.html'
];

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function generateCostTransparencyHtml(filename) {
  const route = '/services/' + filename;
  const priceItem = pricingMap[route];
  const elgItem = priceItem ? elgMap[priceItem.service_id] : null;

  let inclusions = [];
  let exclusions = [];
  let extras = [];

  const isReferral = [
    'director-removal-board-disputes.html',
    'nclt-insolvency-defense.html',
    'oppression-mismanagement-petitions.html'
  ].includes(filename);

  if (isReferral) {
    inclusions = [
      'Comprehensive factual timeline compilation and secretarial chronology docket assembly',
      'Certified true copies of board meeting notices, agendas, attendances, and signed minutes',
      'Certified extracts of company registers (Form MBP-2, SH-4, Register of Members / Directors)',
      'MCA Master Data, index of charges, and past regulatory filings verification',
      'Assistance in briefing documentation and dossier assembly for retained independent counsel'
    ];
    exclusions = [
      'Courtroom appearance, bench filings, and oral advocacy (exclusively handled by independent advocates under separate Vakalatnama per Advocates Act 1961)',
      'Official NCLT / High Court filing fees and registry stamp duties (payable directly at statutory actuals)',
      'Independent registered valuer reports or forensic audit fees (contracted directly with IBBI valuer or audit firm)',
      'Statutory newspaper publication expenses for admission notices or hearings'
    ];
    extras = [
      'Appellate pleadings documentation for NCLAT or High Court proceedings',
      'Subsequent interlocutory applications (IA) or urgent interim relief dossiers',
      'Certified true order copies extraction from NCLT / Court registry',
      'Post-order MCA statutory filing execution (Form INC-28 on MCA V3 portal)'
    ];
  } else {
    // Direct Services
    if (priceItem && priceItem.included_charges && priceItem.included_charges.length > 0) {
      inclusions = priceItem.included_charges.map(c => escapeHtml(c));
    }
    // Add standard statutory quality assurances if fewer than 4 items
    if (inclusions.length < 4) {
      inclusions.push('Practicing Company Secretary (PCS) / Chartered Accountant pre-scrutiny and verification');
      inclusions.push('Preparation, XML/webform drafting, and secure submission on statutory government portal');
      inclusions.push('Tracking of portal filing, tracking reference / SRN receipt delivery, and defect clearance support');
    }

    if (priceItem && priceItem.excluded_charges && priceItem.excluded_charges.length > 0) {
      exclusions = priceItem.excluded_charges.map(c => escapeHtml(c));
    }
    // Default exclusions & pure agent terms
    exclusions.push('Statutory government portal fees, ROC challans, and MCA filing fees (paid at actuals to Government treasury)');
    exclusions.push('State stamp duty on corporate instruments, affidavits, and resolutions (governed by respective State Stamp Act)');
    exclusions.push('Pure Agent fiduciary accounting: All statutory disbursements held in client escrow under Rule 33 of CGST Rules 2017 with 100% receipt pass-through');

    // Extras
    extras = [
      'Class-3 Digital Signature Certificate (DSC) hardware token (not included; existing valid token accepted at ₹0 extra fee; new token chargeable if needed)',
      'Subsequent post-filing compliances or amendments triggered by operational or structural changes',
      'Rectification of pre-existing non-compliances, overdue annual returns, or statutory condonation of delay (Form CG-1 / RD)',
      'Expedited same-day docket review or urgent weekend statutory filing support'
    ];

    // Tailor specific extras based on domain
    if (filename.includes('pvt-ltd') || filename.includes('opc') || filename.includes('llp') || filename.includes('registration')) {
      extras.unshift('Form INC-20A Commencement of Business declaration within 180 days (mandatory for companies)');
    } else if (filename.includes('trademark') || filename.includes('copyright')) {
      extras.unshift('Hearing attendance before Trade Marks Registrar or High Court IPD in contentious opposition proceedings');
    } else if (filename.includes('gst') || filename.includes('tax') || filename.includes('10b') || filename.includes('3ceb')) {
      extras.unshift('Departmental scrutiny representation or response to statutory show-cause notices (Form DRC-01)');
    }
  }

  const inclusionsList = inclusions.map(item => `<li style="margin-bottom: 0.5rem;">${item}</li>`).join('\n            ');
  const exclusionsList = exclusions.map(item => `<li style="margin-bottom: 0.5rem;">${item}</li>`).join('\n            ');
  const extrasList = extras.map(item => `<li style="margin-bottom: 0.5rem;">${item}</li>`).join('\n            ');

  return `
    <!-- Standardized Statutory Cost Transparency: Inclusions, Exclusions & What Costs Extra -->
    <section class="statutory-cost-transparency-section" style="margin: 2.5rem 0; padding: 1.75rem; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px;">
      <div style="margin-bottom: 1.25rem;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--navy-800, #0B2545); text-transform: uppercase; letter-spacing: 0.06em; background: #E2E8F0; padding: 3px 8px; border-radius: 4px;">Cost Transparency Framework</span>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0.5rem 0 0.25rem;">
          Statutory Cost Transparency: What You Get, What Is Excluded &amp; What Costs Extra
        </h2>
        <p style="font-size: 0.88rem; color: var(--text-muted, #64748B); margin: 0;">
          Strict itemisation separating professional secretarial fees from pure agent government disbursements and optional subsequent mandates.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
        <!-- Box 1: Included in Professional Scope -->
        <div style="background: #FFFFFF; border: 1.5px solid #10B981; border-radius: 10px; padding: 1.4rem; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #065F46; text-transform: uppercase; letter-spacing: 0.05em; background: #D1FAE5; padding: 2px 7px; border-radius: 4px;">Included in Fee</span>
            <span style="font-size: 0.8rem; color: #10B981; font-weight: 700;">✓ Professional Scope</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0 0 0.75rem;">
            Statutory Inclusions:
          </h3>
          <ul style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main, #334155); margin: 0; padding-left: 1.2rem; flex: 1;">
            ${inclusionsList}
          </ul>
        </div>

        <!-- Box 2: Pure Agent Disbursements (Govt Fees at Actuals) -->
        <div style="background: #FFFFFF; border: 1.5px solid #F59E0B; border-radius: 10px; padding: 1.4rem; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 0.05em; background: #FEF3C7; padding: 2px 7px; border-radius: 4px;">Disbursements</span>
            <span style="font-size: 0.8rem; color: #D97706; font-weight: 700;">⚠ Pure Agent (At Actuals)</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0 0 0.75rem;">
            Statutory Govt Outlays:
          </h3>
          <ul style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main, #334155); margin: 0; padding-left: 1.2rem; flex: 1;">
            ${exclusionsList}
          </ul>
        </div>

        <!-- Box 3: What Costs Extra (Optional & Subsequent Obligations) -->
        <div style="background: #FFFFFF; border: 1.5px solid #64748B; border-radius: 10px; padding: 1.4rem; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #1E293B; text-transform: uppercase; letter-spacing: 0.05em; background: #E2E8F0; padding: 2px 7px; border-radius: 4px;">Out-of-Scope</span>
            <span style="font-size: 0.8rem; color: #64748B; font-weight: 700;">+ What Costs Extra</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0 0 0.75rem;">
            Subsequent Obligations:
          </h3>
          <ul style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main, #334155); margin: 0; padding-left: 1.2rem; flex: 1;">
            ${extrasList}
          </ul>
        </div>
      </div>
    </section>
`;
}

let modifiedCount = 0;

serviceFiles.forEach(f => {
  if (alreadyDone.includes(f)) {
    return;
  }

  const filePath = path.join(rootDir, 'services', f);
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already contains cost transparency
  if (html.includes('statutory-cost-transparency-section') || html.includes('Statutory Cost Transparency')) {
    return;
  }

  const moduleHtml = generateCostTransparencyHtml(f);

  // Injection strategy:
  // 1. Before FAQ section (<section ...> containing Frequently Asked Questions or id="faq")
  // 2. Before <section class="conversion-cta ..."> or <div class="conversion-cta">
  // 3. Before </main>
  let injected = false;

  const faqMatch = html.match(/(<section[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?Frequently Asked Questions[\s\S]*?<\/h2>)/i);
  if (faqMatch) {
    const idx = html.indexOf(faqMatch[0]);
    html = html.slice(0, idx) + moduleHtml + '\n' + html.slice(idx);
    injected = true;
  } else {
    const ctaMatch = html.match(/(<section[^>]*class="[^"]*cta[^"]*"[^>]*>|<div[^>]*class="[^"]*cta[^"]*"[^>]*>)/i);
    if (ctaMatch) {
      const idx = html.indexOf(ctaMatch[0]);
      html = html.slice(0, idx) + moduleHtml + '\n' + html.slice(idx);
      injected = true;
    } else {
      const mainCloseIdx = html.lastIndexOf('</main>');
      if (mainCloseIdx !== -1) {
        html = html.slice(0, mainCloseIdx) + moduleHtml + '\n  ' + html.slice(mainCloseIdx);
        injected = true;
      }
    }
  }

  if (injected) {
    fs.writeFileSync(filePath, html, 'utf8');
    modifiedCount++;
    console.log(`[UPDATED] ${f}`);
  } else {
    console.warn(`[FAILED TO INJECT] ${f}`);
  }
});

console.log(`\nSuccessfully rolled out cost transparency module across ${modifiedCount} service pages.`);
