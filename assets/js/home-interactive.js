/**
 * ==========================================================================
 * CRAFTEGON CCS — UNIQUE HOME INTERACTIVE LOGIC
 * Features:
 * 1. Command Bar (⌘K Universal Search across all 54 Services)
 * 2. 6 Executive Governance Pillar Tab Switcher
 * 3. Reactive MCA Section 403 Late Filing Fee Computor
 * 4. Interactive Nice Trademark Classification Screener (Classes 1-45)
 * 5. Interactive FAQ Accordion
 * 6. Dynamic Statutory Due-Date Days Remaining
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initCommandSearch();
  initPillarTabs();
  initLateFeeCalculator();
  initTrademarkScreener();
  initFaqAccordion();
  initStatutoryDeadlines();
});

// --------------------------------------------------------------------------
// 1. Universal Command Bar (⌘K) Search
// --------------------------------------------------------------------------
const SERVICES_DATA = [
  { name: 'Private Limited Company Registration (SPICe+)', code: 'SPICe+ Part A/B', url: '/services/pvt-ltd-registration.html', tags: 'incorporation pvt ltd company formation start' },
  { name: 'Limited Liability Partnership (LLP) Registration', code: 'FiLLiP Form', url: '/services/llp-registration.html', tags: 'llp partnership formation' },
  { name: 'One Person Company (OPC) Registration', code: 'SPICe+ OPC', url: '/services/opc-registration.html', tags: 'opc single founder startup' },
  { name: 'Section 8 Company / NGO Registration', code: 'Section 8', url: '/services/section-8-registration.html', tags: 'non-profit ngo section 8 trust' },
  { name: 'Charitable Trust Registration', code: 'Trust Deed 12A/80G', url: '/services/trust-registration.html', tags: 'trust charity non profit' },
  { name: 'Society Registration', code: 'Societies Act', url: '/services/society-registration.html', tags: 'society association' },
  { name: 'Partnership Firm Registration', code: 'Form A RoF', url: '/services/partnership-registration.html', tags: 'partnership deed firm' },
  { name: 'Sole Proprietorship Registration', code: 'SME / GST', url: '/services/proprietorship-registration.html', tags: 'proprietorship individual firm' },
  { name: 'MSME / Udyam Registration Online', code: 'Udyam Portal', url: '/services/msme-udyam.html', tags: 'udyam msme small business priority' },
  { name: 'DPIIT Startup India Recognition', code: 'DPIIT & 56(2)(viib)', url: '/services/dpiit-startup-india.html', tags: 'startup india angel tax exemption dpiit' },

  { name: 'Form AOC-4 Financial Statements Filing', code: 'Section 137', url: '/services/form-aoc4.html', tags: 'aoc4 balance sheet financials roc annual' },
  { name: 'Form MGT-7 Annual Return Filing', code: 'Section 92', url: '/services/form-mgt7.html', tags: 'mgt7 annual return shareholders roc' },
  { name: 'AOC-4 XBRL Financial Tagging & Filing', code: 'XBRL Taxonomy', url: '/services/aoc4-xbrl.html', tags: 'xbrl aoc-4 taxonomy listed' },
  { name: 'DIR-3 KYC Annual Director Verification', code: 'Rule 12A', url: '/services/dir3-kyc.html', tags: 'dir-3 kyc din director' },
  { name: 'Form ADT-1 Statutory Auditor Appointment', code: 'Section 139', url: '/services/form-adt1.html', tags: 'adt1 auditor appointment 5 years' },
  { name: 'Form BEN-2 Significant Beneficial Ownership', code: 'Section 90 SBO', url: '/services/form-ben2.html', tags: 'ben2 sbo beneficial ownership shares' },
  { name: 'Form DPT-3 Return of Deposits & Loans', code: 'Rule 16', url: '/services/form-dpt3.html', tags: 'dpt3 deposits loans exempt' },
  { name: 'Form PAS-6 Demat Share Capital Reconciliation', code: 'Rule 9B', url: '/services/form-pas6.html', tags: 'pas6 demat isin nsdl cdsl audit' },
  { name: 'Form MGT-14 Special Resolutions Filing', code: 'Section 117', url: '/services/form-mgt14.html', tags: 'mgt14 special resolution board' },
  { name: 'Form MSME-1 Half-Yearly Return', code: 'MSME Delayed Pay', url: '/services/form-msme1.html', tags: 'msme1 45 days payments' },
  { name: 'Form STK-2 Fast-Track Strike-Off', code: 'Section 248(2)', url: '/services/form-stk2-strike-off.html', tags: 'stk2 closure winding up strike off' },
  { name: 'RoC Annual Compliance & Retainer', code: 'Retainer Desk', url: '/services/roc-annual-compliance.html', tags: 'roc annual retainer secretarial audit' },
  { name: 'LLP Annual Filings (Form 11 & Form 8)', code: 'LLP Act 2008', url: '/services/llp-compliance-forms.html', tags: 'llp form 11 form 8 statement annual' },
  { name: 'LLP Form 24 Strike-Off & Dissolution', code: 'Rule 37', url: '/services/llp-form24-strike-off.html', tags: 'llp closure form 24 strike off' },

  { name: 'Corporate Tax & GST Annual Return (GSTR-9/9C)', code: 'Section 44 GST', url: '/services/gst-annual.html', tags: 'gst gstr9 gstr9c annual return reconciliation' },
  { name: 'Form 3CEB Transfer Pricing Report', code: 'Section 92E', url: '/services/form-3ceb.html', tags: 'transfer pricing 3ceb arm length cross border' },
  { name: 'Form 10B / 10BB Trust Audit Report', code: 'Section 12A', url: '/services/form-10b.html', tags: '10b 10bb trust audit income tax' },
  { name: 'ITR-7 Return for Companies & Trusts', code: 'ITR-7', url: '/services/itr7.html', tags: 'itr7 tax return trust non profit' },
  { name: 'Proprietorship & SME Income Tax Returns', code: 'ITR-3/4', url: '/services/proprietorship-tax.html', tags: 'proprietorship itr business tax' },

  { name: 'Brand Name & Logo Trademark Registration', code: 'Form TM-A', url: '/services/trademark-registration.html', tags: 'trademark tm-a logo brand name nice classes' },
  { name: 'Software Copyright & Patent Filings', code: 'Copyright Act', url: '/services/software-copyright-patents.html', tags: 'software copyright source code patent ip' },
  { name: 'IP Enforcement & Cease & Desist Notices', code: 'IP Defense', url: '/services/ip-enforcement-cease-desist.html', tags: 'cease desist infringement notice opposition' },

  { name: 'PF & ESIC Registration and Monthly ECR', code: 'EPFO & ESIC', url: '/services/pf-esic-compliance.html', tags: 'pf esic provident fund employee state insurance payroll' },
  { name: 'Mandatory POSH Act Compliance & ICC Setup', code: 'POSH Act 2013', url: '/services/posh-compliance.html', tags: 'posh internal committee annual report' },
  { name: 'Labour Code Compliance & Handbooks', code: '4 Labour Codes', url: '/services/labour-code-handbooks.html', tags: 'labour codes employee handbook wage policy' },

  { name: 'RBI Foreign Liabilities and Assets (FLA) Return', code: 'FLAIR Portal', url: '/services/rbi-fla-return.html', tags: 'rbi fla flair return fdi odi july 15' },
  { name: 'Form FC-3 / FC-4 Foreign Branch & Liaison Offices', code: 'FEMA BO/LO', url: '/services/form-fc3-fc4.html', tags: 'fc3 fc4 foreign company liaison branch office' },
  { name: 'Cross-Border Tech Licensing Agreements', code: 'Cross-Border', url: '/services/cross-border-tech-transfer.html', tags: 'technology transfer fema cross border ip' },

  { name: 'DPDP Act 2023 Readiness & Consent Audit', code: 'DPDP Act 2023', url: '/services/dpdp-compliance-audit.html', tags: 'dpdp privacy data fiduciary consent privacy policy' },
  { name: 'Cyber Incident Reporting (CERT-In 6-Hour)', code: 'CERT-In Mandate', url: '/services/cyber-incident-reporting.html', tags: 'cert-in cybersecurity 6 hour incident report' },
  { name: 'SaaS Terms of Service & Privacy Architecture', code: 'SaaS Legal Desk', url: '/services/saas-terms-privacy-architecture.html', tags: 'saas terms eula privacy policy gdpr' },

  { name: 'Founder Pacts & Shareholder Agreements (SHA)', code: 'SHA / SPA', url: '/services/founder-shareholder-agreements.html', tags: 'sha spa founder pact vesting term sheet' },
  { name: 'Master Service Agreements (MSA) & SOWs', code: 'Commercial MSA', url: '/services/master-service-agreements.html', tags: 'msa sow vendor contract agreement' },
  { name: 'Section 233 Fast-Track Company Mergers', code: 'Section 233', url: '/services/fast-track-mergers.html', tags: 'fast track merger parent subsidiary rd' },
  { name: 'Slump Sale & Business Asset Purchase', code: 'BTA Agreement', url: '/services/slump-sale-asset-purchase.html', tags: 'slump sale bta business transfer 50b' },
  { name: 'Form MR-3 Secretarial Audit Services', code: 'Section 204', url: '/services/form-mr3-secretarial-audit.html', tags: 'mr3 secretarial audit pcs company secretary' },
  { name: 'Board Minutes & Statutory Registers Maintenance', code: 'Section 88 & 118', url: '/services/board-minutes.html', tags: 'board minutes registers sh1 sh2 mgt1' },
  { name: 'Form CSR-2 Annual CSR Report', code: 'Section 135', url: '/services/form-csr2.html', tags: 'csr2 corporate social responsibility' },

  { name: 'AI Legal Document Drafter Online', code: 'Flagship AI Tool', url: '/conversion/ai-document-generator.html', tags: 'ai drafter board resolution agreement generate' },
  { name: 'MCA Late Fee & Retainer Computor', code: 'Interactive Tool', url: '/conversion/calculator.html', tags: 'calculator late fee mca penalty retainer' },
  { name: 'NICE Trademark Class Screener', code: 'IP Search Tool', url: '/conversion/trademark-search.html', tags: 'trademark search class 1 to 45' },
  { name: 'STK-2 Fast-Track Strike-Off Checker', code: 'Diagnostic Tool', url: '/conversion/strike-off-checker.html', tags: 'strike off checker dissolution 248' }
];

function initCommandSearch() {
  const searchInput = document.getElementById('gov-cmd-input');
  const resultsContainer = document.getElementById('gov-cmd-results');
  if (!searchInput || !resultsContainer) return;

  function renderResults(query) {
    const q = query.trim();
    if (!q) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
      return;
    }

    let items = [];
    if (window.CraftEgonSearch && window.CraftEgonSearch.engine) {
      const searchResults = window.CraftEgonSearch.engine.search(q);
      items = searchResults.slice(0, 8).map(r => ({
        name: r.item.name,
        code: r.item.id,
        url: r.item.route,
        vertical: r.item.vertical_name,
        isReferral: r.item.is_referral
      }));
    } else {
      const qLower = q.toLowerCase();
      items = SERVICES_DATA.filter(item => 
        item.name.toLowerCase().includes(qLower) || 
        item.code.toLowerCase().includes(qLower) || 
        item.tags.toLowerCase().includes(qLower)
      ).slice(0, 8).map(item => ({
        name: item.name,
        code: item.code,
        url: item.url,
        vertical: 'Corporate Practice',
        isReferral: false
      }));
    }

    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 1.25rem; color: #94A3B8; font-size: 0.88rem; text-align: center;">
          <p style="margin: 0 0 0.5rem; color: #E2E8F0;">Zero matches found for "${String(q).replace(/[&<>"']/g, '')}".</p>
          <a href="/services.html" style="color: var(--brand-gold, #C59B27); font-weight: 700; text-decoration: none;">Browse Complete 57-Service Directory &rarr;</a>
        </div>
      `;
    } else {
      let html = items.map(m => `
        <a href="${m.url}" class="gov-search-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem; border-bottom: 1px solid rgba(226, 232, 240, 0.08); text-decoration: none; color: inherit;">
          <div>
            <div class="item-title" style="font-weight: 600; font-size: 0.88rem; color: #F8FAFC;">${m.name}</div>
            <div style="font-size: 0.74rem; color: #94A3B8; margin-top: 2px;">
              <span>${m.vertical}</span>
              ${m.isReferral ? ' &bull; <span style="color: #F59E0B; font-weight: 600;">Referral Service</span>' : ' &bull; <span style="color: #10B981; font-weight: 600;">Direct Regulatory</span>'}
            </div>
          </div>
          <span class="item-code" style="font-family: var(--font-mono, monospace); font-size: 0.72rem; color: var(--brand-gold, #C59B27); background: rgba(197, 155, 39, 0.1); padding: 2px 6px; border-radius: 4px; white-space: nowrap;">${m.code}</span>
        </a>
      `).join('');

      html += `
        <div style="padding: 0.6rem 1rem; background: rgba(15, 23, 42, 0.85); text-align: center; border-top: 1px solid rgba(226, 232, 240, 0.1);">
          <a href="/services.html?q=${encodeURIComponent(q)}" style="color: var(--brand-gold, #C59B27); font-size: 0.8rem; font-weight: 700; text-decoration: none;">
            View all results in 57-Service Directory &rarr;
          </a>
        </div>
      `;
      resultsContainer.innerHTML = html;
    }
    resultsContainer.style.display = 'block';
  }

  searchInput.addEventListener('input', (e) => renderResults(e.target.value));

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = 'none';
    }
  });

  // Global ⌘K or Ctrl+K shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

// --------------------------------------------------------------------------
// 2. 6 Executive Governance Pillar Tab Switcher
// --------------------------------------------------------------------------
function initPillarTabs() {
  const buttons = document.querySelectorAll('.gov-pillar-btn');
  const panes = document.querySelectorAll('.gov-pillar-pane');
  if (!buttons.length || !panes.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pillar');

      buttons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// --------------------------------------------------------------------------
// 3. Reactive MCA Section 403 Late Filing Fee Computor
// --------------------------------------------------------------------------
function initLateFeeCalculator() {
  const entitySelect = document.getElementById('calc-entity-type');
  const daysSlider = document.getElementById('calc-days-slider');
  const daysNumber = document.getElementById('calc-days-input');
  const totalDisplay = document.getElementById('calc-total-amount');
  const normalFeeDisplay = document.getElementById('calc-normal-fee');
  const sec403FeeDisplay = document.getElementById('calc-sec403-fee');
  const directorRiskDisplay = document.getElementById('calc-director-risk');

  if (!daysSlider || !totalDisplay) return;

  function calculate() {
    const days = parseInt(daysSlider.value, 10) || 0;
    const entityType = entitySelect ? entitySelect.value : 'pvt_ltd';

    // Normal statutory ROC filing fee based on small / regular company
    let normalFee = 400;
    if (entityType === 'small_company') normalFee = 300;
    else if (entityType === 'opc') normalFee = 300;
    else if (entityType === 'public_ltd') normalFee = 600;

    // Section 403 Companies Act 2013: exactly ₹100 per day with zero cap
    const sec403LateFee = days * 100;
    const totalExposure = normalFee + sec403LateFee;

    // Substantive fine risk under Section 137(3) & 92(5)
    let substantiveRisk = '₹0 (Nominal)';
    if (days > 0 && days <= 30) {
      substantiveRisk = '₹10,000 + ₹100/day';
    } else if (days > 30 && days <= 180) {
      substantiveRisk = '₹50,000 to ₹2,00,000';
    } else if (days > 180) {
      substantiveRisk = '₹5,00,000 + Prosecution Risk';
    }

    if (normalFeeDisplay) normalFeeDisplay.textContent = `₹${normalFee.toLocaleString('en-IN')}`;
    if (sec403FeeDisplay) sec403FeeDisplay.textContent = `₹${sec403LateFee.toLocaleString('en-IN')}`;
    if (totalDisplay) {
      totalDisplay.textContent = '';
      const sym = document.createElement('span');
      sym.textContent = '₹';
      totalDisplay.appendChild(sym);
      totalDisplay.appendChild(document.createTextNode(totalExposure.toLocaleString('en-IN')));
    }
    if (directorRiskDisplay) directorRiskDisplay.textContent = substantiveRisk;
  }

  daysSlider.addEventListener('input', (e) => {
    if (daysNumber) daysNumber.value = e.target.value;
    calculate();
  });

  if (daysNumber) {
    daysNumber.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10) || 0;
      if (val < 0) val = 0;
      if (val > 365) val = 365;
      daysSlider.value = val;
      calculate();
    });
  }

  if (entitySelect) {
    entitySelect.addEventListener('change', calculate);
  }

  // Initial calculation
  calculate();
}

// --------------------------------------------------------------------------
// 4. Interactive Nice Trademark Classification Screener (Classes 1-45)
// --------------------------------------------------------------------------
const TM_CLASSES = [
  { num: 1, type: 'Goods', name: 'Chemicals, resins, adhesives, fertilizers, agricultural chemicals' },
  { num: 2, type: 'Goods', name: 'Paints, varnishes, lacquers, rust preventives, colorants' },
  { num: 3, type: 'Goods', name: 'Cosmetics, skincare, perfumes, soaps, essential oils, cleaning items' },
  { num: 4, type: 'Goods', name: 'Industrial oils, greases, fuels, illuminants, candles, lubricants' },
  { num: 5, type: 'Goods', name: 'Pharmaceuticals, medical preparations, veterinary items, dietary supplements' },
  { num: 6, type: 'Goods', name: 'Common metals, hardware, metal pipes, safes, locks, metal containers' },
  { num: 7, type: 'Goods', name: 'Machines, machine tools, motors, generators, agricultural machinery' },
  { num: 8, type: 'Goods', name: 'Hand tools, cutlery, razors, side arms, manual implements' },
  { num: 9, type: 'Goods', name: 'Computer software, mobile apps, electronics, AI hardware, semiconductors' },
  { num: 10, type: 'Goods', name: 'Medical devices, surgical equipment, diagnostic apparatus, dental' },
  { num: 11, type: 'Goods', name: 'Lighting, heating, cooking, refrigeration, air conditioning equipment' },
  { num: 12, type: 'Goods', name: 'Vehicles, automobiles, electric vehicles, drones, bicycles' },
  { num: 13, type: 'Goods', name: 'Firearms, ammunition, explosives, fireworks' },
  { num: 14, type: 'Goods', name: 'Precious metals, jewellery, gems, watches, horological instruments' },
  { num: 15, type: 'Goods', name: 'Musical instruments and accessories' },
  { num: 16, type: 'Goods', name: 'Paper, cardboard, stationery, printed publications, packaging' },
  { num: 17, type: 'Goods', name: 'Rubber, plastic films, packing, insulating materials' },
  { num: 18, type: 'Goods', name: 'Leather goods, luggage, handbags, wallets, saddlery' },
  { num: 19, type: 'Goods', name: 'Non-metallic building materials, cement, concrete, stone' },
  { num: 20, type: 'Goods', name: 'Furniture, mirrors, picture frames, non-metallic containers' },
  { num: 21, type: 'Goods', name: 'Household utensils, glassware, ceramics, cookware, brushes' },
  { num: 22, type: 'Goods', name: 'Ropes, string, nets, tents, sails, tarpaulins' },
  { num: 23, type: 'Goods', name: 'Yarns and threads for textile use' },
  { num: 24, type: 'Goods', name: 'Textiles, fabric, bed sheets, tablecloths, curtains' },
  { num: 25, type: 'Goods', name: 'Clothing, footwear, headwear, apparel, fashion garments' },
  { num: 26, type: 'Goods', name: 'Lace, embroidery, ribbons, buttons, artificial flowers' },
  { num: 27, type: 'Goods', name: 'Carpets, rugs, mats, linoleum, wall hangings' },
  { num: 28, type: 'Goods', name: 'Games, toys, video game apparatus, sporting articles' },
  { num: 29, type: 'Goods', name: 'Meat, fish, poultry, preserved fruits & vegetables, milk, edible oils' },
  { num: 30, type: 'Goods', name: 'Coffee, tea, cocoa, rice, flour, bread, spices, confectionery' },
  { num: 31, type: 'Goods', name: 'Raw agricultural crops, fresh fruits & vegetables, live animals, seeds' },
  { num: 32, type: 'Goods', name: 'Beers, mineral waters, fruit juices, non-alcoholic beverages' },
  { num: 33, type: 'Goods', name: 'Alcoholic beverages (except beer), wines, spirits' },
  { num: 34, type: 'Goods', name: 'Tobacco, cigars, matches, smokers articles' },

  { num: 35, type: 'Services', name: 'Advertising, business management, marketing, e-commerce retail, HR' },
  { num: 36, type: 'Services', name: 'Financial services, banking, insurance, fintech, real estate affairs' },
  { num: 37, type: 'Services', name: 'Building construction, equipment repair, installation, maintenance' },
  { num: 38, type: 'Services', name: 'Telecommunications, internet access, data transmission, broadcasting' },
  { num: 39, type: 'Services', name: 'Transport, packaging & storage of goods, logistics, travel travel' },
  { num: 40, type: 'Services', name: 'Treatment of materials, custom manufacturing, recycling, printing' },
  { num: 41, type: 'Services', name: 'Education, training, entertainment, sporting & cultural activities' },
  { num: 42, type: 'Services', name: 'SaaS, software development, cloud computing, AI, technology research' },
  { num: 43, type: 'Services', name: 'Restaurants, catering, hospitality, temporary accommodation, hotels' },
  { num: 44, type: 'Services', name: 'Medical services, hospitals, veterinary, hygiene, beauty care' },
  { num: 45, type: 'Services', name: 'Legal services, IP management, corporate secretarial, security, privacy' }
];

function initTrademarkScreener() {
  const input = document.getElementById('tm-search-query');
  const container = document.getElementById('tm-results-container');
  if (!input || !container) return;

  function renderClasses(query) {
    const q = query.trim().toLowerCase();
    const filtered = TM_CLASSES.filter(c => 
      !q || 
      c.num.toString() === q || 
      c.type.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #64748B;">
          No matching Nice classes found. Check spelling or consult our <a href="/conversion/trademark-search.html" style="color: var(--brand-gold);">Comprehensive IP Screener</a>.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => `
      <div class="tm-class-pill">
        <div class="tm-class-head">
          <span class="tm-class-num">Class ${c.num}</span>
          <span class="tm-class-type">${c.type}</span>
        </div>
        <p class="tm-class-desc">${c.name}</p>
        <div style="margin-top: 0.75rem; text-align: right;">
          <a href="/services/trademark-registration.html" style="font-size: 0.75rem; font-weight: 600; color: var(--brand-gold); text-decoration: none;">
            File TM-A &rarr;
          </a>
        </div>
      </div>
    `).join('');
  }

  input.addEventListener('input', (e) => renderClasses(e.target.value));

  // Initial render (shows popular classes)
  renderClasses('');
}

// --------------------------------------------------------------------------
// 5. Interactive FAQ Accordion
// --------------------------------------------------------------------------
function initFaqAccordion() {
  const items = document.querySelectorAll('.gov-faq-item');
  items.forEach(item => {
    const header = item.querySelector('.gov-faq-header');
    if (header) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

// --------------------------------------------------------------------------
// 6. Dynamic Statutory Deadlines Radar Updates
// --------------------------------------------------------------------------
function initStatutoryDeadlines() {
  const now = new Date();

  // GSTR-3B: 20th of every month
  const gstrElem = document.getElementById('radar-gstr-date');
  if (gstrElem) {
    const next20th = new Date(now.getFullYear(), now.getMonth(), 20);
    if (now.getDate() > 20) {
      next20th.setMonth(next20th.getMonth() + 1);
    }
    const diffDays = Math.ceil((next20th - now) / (1000 * 60 * 60 * 24));
    gstrElem.textContent = `${diffDays} Days Remaining (${next20th.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`;
  }

  // DIR-3 KYC: Sept 30th
  const dir3Elem = document.getElementById('radar-dir3-date');
  if (dir3Elem) {
    let sept30 = new Date(now.getFullYear(), 8, 30);
    if (now > sept30) {
      sept30 = new Date(now.getFullYear() + 1, 8, 30);
    }
    const diffDays = Math.ceil((sept30 - now) / (1000 * 60 * 60 * 24));
    dir3Elem.textContent = `${diffDays} Days (30 Sept Statutory)`;
  }

  // RBI FLA Return: July 15th
  const rbiElem = document.getElementById('radar-rbi-date');
  if (rbiElem) {
    let july15 = new Date(now.getFullYear(), 6, 15);
    if (now > july15) {
      july15 = new Date(now.getFullYear() + 1, 6, 15);
    }
    const diffDays = Math.ceil((july15 - now) / (1000 * 60 * 60 * 24));
    rbiElem.textContent = `${diffDays} Days (15 July Statutory)`;
  }
}
