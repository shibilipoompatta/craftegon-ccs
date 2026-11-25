/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - PHASE 2 CHROME & HOMEPAGE REMODELER
 * ============================================================================
 * 1. Remodels index.html around Kerala "Launch-to-Operate + Year-1 Governance"
 *    bundles while preserving all existing calculators, entity wizard, search,
 *    and guardrail anchors.
 * 2. Synchronizes updated components/navbar.html & components/footer.html across
 *    all public HTML pages using balanced <div> matching.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const bundlesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kerala-bundles.json'), 'utf8'));
const rawNavbar = fs.readFileSync(path.join(ROOT, 'components', 'navbar.html'), 'utf8');
const rawFooter = fs.readFileSync(path.join(ROOT, 'components', 'footer.html'), 'utf8');

function cleanPortalLinks(raw) {
  return raw
    .replace(/<a\s+href="\/portal\/dashboard\.html"\s+class="if-btn-secondary\s+portal-nav-link".*?>[\s\S]*?<\/a>/gi,
      '<a href="/services/" class="if-btn-secondary" title="Universal Services Directory">Services</a>')
    .replace(/href=["']\/portal\/entity-search\.html["']/g, 'href="/search/index.html"')
    .replace(/href=["']\/portal\/dashboard\.html["']/g, 'href="/services/roc-annual-compliance.html"')
    .replace(/href=["']\/portal\/subscription\.html["']/g, 'href="/conversion/retainer-desk.html"')
    .replace(/href=["']\/portal\/?["']/g, 'href="/services/"')
    .replace(/href=["']\/admin\/?.*?["']/g, 'href="/404.html"');
}

const ssgNavbar = cleanPortalLinks(rawNavbar);
const ssgFooter = cleanPortalLinks(rawFooter);

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Replaces a <div id="targetId">...</div> block safely by counting nested <div> tags.
 */
function replaceBalancedDivById(html, targetId, replacementHtml) {
  const openRegex = new RegExp(`<div\\s+id=["']${targetId}["'][^>]*>`, 'i');
  const match = openRegex.exec(html);
  if (!match) return { html, replaced: false };

  const startIdx = match.index;
  let idx = startIdx + match[0].length;
  let depth = 1;

  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = idx;
  let tMatch;
  while ((tMatch = tagRegex.exec(html)) !== null) {
    if (tMatch[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        const endIdx = tMatch.index + tMatch[0].length;
        const nextHtml = html.slice(0, startIdx) + replacementHtml + html.slice(endIdx);
        return { html: nextHtml, replaced: true };
      }
    } else {
      depth++;
    }
  }
  return { html, replaced: false };
}

// ---------------------------------------------------------------------------
// 1. Remodel index.html
// ---------------------------------------------------------------------------
let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 1a. Head title, meta & CSS
indexHtml = indexHtml.replace(
  /<title>[\s\S]*?<\/title>/i,
  '<title>CraftEgon Corporate Services (CCS) | Kerala Launch-to-Operate &amp; Year-1 Governance</title>'
);
indexHtml = indexHtml.replace(
  /<meta name="description" content="[^"]*">/i,
  '<meta name="description" content="Kerala\'s specialized Launch-to-Operate + Year-1 Governance business infrastructure partner under CraftEgon LLP (Markaz Knowledge City, Kozhikode &amp; Malappuram). Entity setup, K-SWIFT &amp; KSPCB routing, commercial contracts, and annual governance.">'
);
indexHtml = indexHtml.replace(
  /<meta property="og:title" content="[^"]*">/i,
  '<meta property="og:title" content="CraftEgon Corporate Services (CCS) | Kerala Launch-to-Operate &amp; Year-1 Governance">'
);
indexHtml = indexHtml.replace(
  /<meta property="og:description" content="[^"]*">/i,
  '<meta property="og:description" content="Kerala\'s specialized Launch-to-Operate + Year-1 Governance partner under CraftEgon LLP &amp; NIEG alignment. Kozhikode &amp; Malappuram corporate infrastructure.">'
);
if (!indexHtml.includes('/assets/css/bundles.css')) {
  indexHtml = indexHtml.replace(
    /<link rel="stylesheet" href="\/assets\/css\/home-unique\.css[^"]*">/i,
    '<link rel="stylesheet" href="/assets/css/home-unique.css?v=2.2">\n  <link rel="stylesheet" href="/assets/css/bundles.css?v=1.0">'
  );
}
indexHtml = indexHtml.replace(
  /<link rel="stylesheet" href="\/assets\/css\/tokens\.css[^"]*">/i,
  '<link rel="stylesheet" href="/assets/css/tokens.css?v=2.3">'
);

// 1b. Update Organization JSON-LD description
indexHtml = indexHtml.replace(
  '"description": "Building Business Infrastructure. Coordinated corporate secretarial, tax, compliance, and corporate structuring services.",',
  '"description": "Kerala\'s Launch-to-Operate + Year-1 Governance business infrastructure partner under CraftEgon LLP (Markaz Knowledge City, Kozhikode & Malappuram), aligned with NIEG ethical governance.",'
);

// 1c. Remodel Hero Showcase (#hero) + Insert Scannable #kerala-bundles Showcase directly below
const bundleAudienceMap = {
  'KL-BND-CLINIC': 'Multi-specialty clinics, dental/skin centers, diagnostic labs & NRI-backed care/research units',
  'KL-BND-EXIM': 'Spice/agro/seafood exporters, Kochi/Beypore/air-cargo shippers & GCC cold-chain operators',
  'KL-BND-FOOD': 'Spice mills, food/nutraceutical plants, KINFRA processors & private-label D2C food brands',
  'KL-BND-HOSPITALITY': 'Boutique stays, eco/wellness resorts, serviced villas & NRI hospitality SPVs',
  'KL-BND-EDTECH': 'Coaching academies, healthcare-licensing institutes, EdTech startups & LMS platforms'
};

const bundleCardsMarkup = bundlesData.bundles.map((b, idx) => `
          <article class="kl-bundle-card ${idx < 2 ? 'kl-bundle-card-featured' : ''}">
            <div>
              <div class="kl-bundle-meta-row">
                <span class="kl-bundle-code">${esc(b.id)}</span>
                <span class="kl-bundle-pack-pill">${esc(b.bundleName)}</span>
              </div>
              <h3 class="kl-bundle-title">${esc(b.title)}</h3>
              <div class="kl-bundle-who">
                <strong>Who This Is For</strong>
                ${esc(bundleAudienceMap[b.id] || b.targetAudience[0])}
              </div>
              <ul class="kl-bundle-phases-mini">
                <li><span class="kl-phase-dot">01</span><span><strong>Setup:</strong> ${esc(b.entityAndPreLaunchStack.keralaAndCentralRegistrations.slice(0, 2).map(r => r.title).join(' • '))}</span></li>
                <li><span class="kl-phase-dot">02</span><span><strong>Contracts + NIEG:</strong> ${esc(b.commercialAndRiskShield.coreContracts.slice(0, 2).map(c => c.title).join(' • '))}</span></li>
                <li><span class="kl-phase-dot">03</span><span><strong>Year-1 Retainer:</strong> Connected-banking ledger, tax &amp; renewal tracking</span></li>
              </ul>
            </div>
            <div class="kl-bundle-card-actions">
              <a href="/conversion/calculator.html?bundle=${encodeURIComponent(b.id)}#readiness" class="kl-bundle-cta-primary">
                <span>Start Scope Check</span>
                <span>&rarr;</span>
              </a>
              <a href="/bundles/${esc(b.slug)}.html" class="kl-bundle-cta-ghost">
                <span>Roadmap</span>
              </a>
            </div>
          </article>`).join('\n');

const newHeroAndBundlesSection = `<section class="hero-3d-section" id="hero" aria-labelledby="hero-title" style="background: linear-gradient(135deg, #FFFFFF 0%, #F4FAF7 65%, #F3F9FD 100%); padding-bottom: 3rem;">
      <div class="home-container">
        <!-- Hero Centered Core Showcase (Decluttered Above-the-Fold Rhythm) -->
        <div class="hero-center-showcase">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.38rem 0.95rem; border-radius:9999px; background:rgba(0,166,81,0.08); border:1px solid rgba(0,166,81,0.28); font-family:var(--font-mono,monospace); font-size:0.74rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--growth-green-accessible,#008742); margin-bottom:1.05rem;">
            Markaz Knowledge City, Kozhikode &amp; Malappuram &bull; CraftEgon LLP &bull; NIEG Aligned
          </div>

          <h1 id="hero-title" class="hero-headline" style="color: var(--charcoal-ink, #1A1A1A);">
            Kerala's Launch-to-Operate &amp; <span class="hero-headline-accent" style="background: linear-gradient(135deg, #008742 0%, #10262E 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Year-1 Governance Partner.</span>
          </h1>

          <p class="hero-lead">
            Incorporation is only Day 1. We guide Kerala founders from SPICe+/LLP formation through K-SWIFT, LSGD, KSPCB &amp; Clinical Establishments readiness, CraftEgon LLP commercial contracts, and connected-banking Year-1 retainers.
          </p>

          <!-- Integrated Search Preserving Full 57-Service Engine -->
          <div class="hero-unified-search-wrap">
            <form class="hero-unified-search-form" action="/services.html" method="GET" role="search" aria-label="Search Corporate Services">
              <span class="unified-search-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                id="home-front-search-input"
                name="q"
                class="unified-search-input"
                placeholder="Search Kerala bundles, K-SWIFT, SPICe+, AOC-4, TM-A..."
                autocomplete="off"
                spellcheck="false"
                aria-label="Search corporate services from homepage"
              >
              <button type="submit" class="unified-search-btn" style="background: var(--growth-green-accessible, #008742);">
                <span>Search</span> &rarr;
              </button>
            </form>

            <!-- Live Autocomplete Results Container -->
            <div class="home-front-search-dropdown" id="home-front-search-dropdown" role="region" aria-label="Search Suggestions">
              <div id="home-front-search-results"></div>
            </div>

            <!-- Kerala Industry Shortcuts -->
            <div class="hero-search-shortcuts">
              <span class="shortcuts-label">Quick Sector Links:</span>
              <a href="/bundles/clinics-diagnostics-kerala.html" class="search-pill">Clinics &amp; Diagnostics</a>
              <a href="/bundles/exim-cold-chain-kerala.html" class="search-pill">EXIM &amp; Cold-Chain</a>
              <a href="/bundles/food-spice-processing-kerala.html" class="search-pill">Food &amp; Spice Units</a>
              <a href="/bundles/hospitality-resorts-kerala.html" class="search-pill">Hospitality &amp; Resorts</a>
              <a href="/bundles/edtech-academies-kerala.html" class="search-pill">EdTech &amp; Academies</a>
            </div>
          </div>

          <!-- Dual Direct Action Buttons -->
          <div class="hero-actions-group">
            <a href="#kerala-bundles" class="btn-hero-primary" style="background: var(--growth-green-accessible, #008742); border-color: var(--growth-green-accessible, #008742);" aria-label="Explore Kerala Industry Bundles">
              <span>Explore Kerala Industry Bundles</span> &rarr;
            </a>
            <a href="/conversion/calculator.html#readiness" class="btn-hero-secondary" style="border-color: var(--charcoal-ink, #1A1A1A); color: var(--charcoal-ink, #1A1A1A) !important;" aria-label="Run Kerala Readiness and Scope Estimator">
              <span>Start Scope &amp; Readiness Check</span>
            </a>
          </div>

          <!-- Factual Governance Commitments -->
          <div class="hero-trust-strip">
            <span class="trust-item">Advisory fees separated from govt challans</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">CraftEgon LLP commercial drafting</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">NIEG ethical governance alignment</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">57-service RoC, Tax &amp; FEMA engine</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================================
         KERALA LAUNCH-TO-OPERATE + YEAR-1 GOVERNANCE BUNDLES (PRIMARY FUNNEL)
         ==================================================================== -->
    <section class="kl-bundles-showcase" id="kerala-bundles" aria-labelledby="kerala-bundles-heading">
      <div class="home-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">5 Kerala Industry Infrastructure Suites</span>
          <h2 id="kerala-bundles-heading" class="kl-h2">Launch-to-Operate + Year-1 Governance for High-Complexity Sectors</h2>
          <p class="kl-lead">
            Scan who each suite serves and what gets handled across Entity &amp; Kerala Licensing, CraftEgon LLP Contracts, and Year-1 Retainers—or run a 60-second Scope Check.
          </p>
        </div>

        <div class="kl-bundle-grid">
${bundleCardsMarkup}
        </div>

        <div style="max-width:1240px; margin:2rem auto 0; padding:1.25rem 1.5rem; background:var(--surface-canvas,#F4FAF7); border:1px solid var(--border-color,#DCE8E5); border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <strong style="color:var(--charcoal-ink,#1A1A1A); font-size:0.95rem; display:block;">Looking for an individual filing, calculator, or registry check?</strong>
            <span style="color:var(--text-secondary,#52717A); font-size:0.86rem;">Access our 57-service catalog, Stamp Duty &amp; Section 403 calculators, Partner Desk, or CIN/Trademark lookup.</span>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
            <a href="/conversion/calculator.html#readiness" class="kl-btn-primary" style="padding:0.6rem 1rem; font-size:0.84rem;">Readiness Estimator</a>
            <a href="/services.html" class="kl-btn-secondary" style="padding:0.6rem 1rem; font-size:0.84rem;">57-Service Catalog</a>
            <a href="/search/" class="kl-btn-secondary" style="padding:0.6rem 1rem; font-size:0.84rem;">Corporate &amp; IP Lookup</a>
          </div>
        </div>
      </div>
    </section>`;

const heroStart = indexHtml.indexOf('<section class="hero-3d-section"');
const howItWorksIdx = indexHtml.indexOf('<section class="home-section process-section" id="how-it-works"');
const wizardIdx = indexHtml.indexOf('<section class="home-section entity-wizard-section"');
const lowerAnchor = [howItWorksIdx, wizardIdx].filter(i => i !== -1).sort((a, b) => a - b)[0];
if (heroStart === -1 || lowerAnchor === undefined) {
  throw new Error('Could not locate hero or lower section boundary in index.html');
}
indexHtml = indexHtml.slice(0, heroStart) + newHeroAndBundlesSection + '\n\n    ' + indexHtml.slice(lowerAnchor);

// Reorder lower discovery flow once: #how-it-works -> #fee-estimator -> #entity-selector -> #popular-services -> #practice-areas -> #founder-faqs
const curWizIdx = indexHtml.indexOf('<section class="home-section entity-wizard-section"');
const curPopIdx = indexHtml.indexOf('<section class="popular-services-section" id="popular-services"');
const curPracIdx = indexHtml.indexOf('<section class="home-section stages-section" id="practice-areas"');
const curToolsIdx = indexHtml.indexOf('<section class="home-section tools-section" id="fee-estimator"');
const curProcIdx = indexHtml.indexOf('<section class="home-section process-section" id="how-it-works"');
const curFaqIdx = indexHtml.indexOf('<section class="home-section faq-section" id="founder-faqs"');

if (curWizIdx !== -1 && curProcIdx !== -1 && curWizIdx < curProcIdx && curPopIdx !== -1 && curPracIdx !== -1 && curToolsIdx !== -1 && curFaqIdx !== -1) {
  const wizardBlock = indexHtml.slice(curWizIdx, curPopIdx);
  const popularBlock = indexHtml.slice(curPopIdx, curPracIdx);
  const practiceBlock = indexHtml.slice(curPracIdx, curToolsIdx);
  const toolsBlock = indexHtml.slice(curToolsIdx, curProcIdx);
  const processBlock = indexHtml.slice(curProcIdx, curFaqIdx);
  indexHtml = indexHtml.slice(0, curWizIdx) +
    processBlock +
    toolsBlock +
    wizardBlock +
    popularBlock +
    practiceBlock +
    indexHtml.slice(curFaqIdx);
}

// Highlight Phase 3 Kerala Readiness Estimator in #fee-estimator tools grid (idempotent)
if (!indexHtml.includes('Kerala Vertical Readiness &amp; Bundle Estimator')) {
  indexHtml = indexHtml.replace(
    '<div class="tools-suite-grid">',
    `<div class="tools-suite-grid">
          <!-- Tool 0: Kerala Vertical Readiness & Bundle Scope Estimator (Phase 3) -->
          <a href="/conversion/calculator.html#readiness" class="diagnostic-tool-compact-card" style="border-color: var(--growth-green-border, rgba(0,166,81,0.35)); background: linear-gradient(135deg, #FFFFFF 0%, #F4FAF7 100%);" aria-label="Launch Kerala Vertical Readiness and Bundle Scope Estimator">
            <div class="tool-card-icon-box" style="background: rgba(0,166,81,0.12); color: var(--growth-green-accessible, #008742);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div class="tool-card-body">
              <span class="tool-card-tag" style="color: var(--growth-green-accessible, #008742);">Phase 3 Kerala Scope Tool</span>
              <h3 class="tool-card-title">Kerala Vertical Readiness &amp; Bundle Estimator</h3>
              <p class="tool-card-desc">Select your Kerala industry vertical, entity stage &amp; licensing scope to generate a tailored Launch-to-Operate + Year-1 Governance brief.</p>
              <span class="tool-card-link" style="color: var(--growth-green-accessible, #008742);">Start Scope Check &rarr;</span>
            </div>
          </a>`
  );
}

// 1d. Clean unapproved low-ticket rupee tags on #popular-services cards (keep scope high-trust & PENDING_OWNER_REVIEW compliant)
const pricePairs = [
  ['<span class="flagship-price">&#8377;7,499</span>\r\n              <span class="flagship-price-sub">+ Govt Fees &amp; State Stamp Duty</span>', '<span class="flagship-price" style="font-size:1.15rem;">Scoped Quote</span>\n              <span class="flagship-price-sub">Advisory separated from Govt Fees &amp; Stamp Duty</span>'],
  ['<span class="flagship-price">&#8377;5,999</span>\r\n              <span class="flagship-price-sub">+ Govt Fees &amp; State Stamp Duty</span>', '<span class="flagship-price" style="font-size:1.15rem;">Scoped Quote</span>\n              <span class="flagship-price-sub">Advisory separated from Govt Fees &amp; Stamp Duty</span>'],
  ['<span class="flagship-price">&#8377;9,999</span>\r\n              <span class="flagship-price-sub">/ institutional package</span>', '<span class="flagship-price" style="font-size:1.15rem;">Institutional Scope</span>\n              <span class="flagship-price-sub">Tailored to team size &amp; DPDP footprint</span>'],
  ['<span class="flagship-price">&#8377;14,999</span>\r\n              <span class="flagship-price-sub">/ year (Fixed Retainer)</span>', '<span class="flagship-price" style="font-size:1.15rem;">Annual Retainer</span>\n              <span class="flagship-price-sub">Bracketed by entity turnover &amp; filings</span>'],
  ['<span class="flagship-price">&#8377;4,999</span>\r\n              <span class="flagship-price-sub">+ Official Govt Fees</span>', '<span class="flagship-price" style="font-size:1.15rem;">Scoped Filing</span>\n              <span class="flagship-price-sub">+ Official CGPDTM Govt Fees at actuals</span>'],
  ['<span class="flagship-price">&#8377;1,499</span>\r\n              <span class="flagship-price-sub">/ filing (Monthly/Quarterly)</span>', '<span class="flagship-price" style="font-size:1.15rem;">Retainer Bracket</span>\n              <span class="flagship-price-sub">Connected-banking GST &amp; ITC reconciliation</span>']
];
pricePairs.forEach(([target, rep]) => {
  const altTarget = target.replace(/\r\n/g, '\n');
  if (indexHtml.includes(target)) indexHtml = indexHtml.replace(target, rep);
  else if (indexHtml.includes(altTarget)) indexHtml = indexHtml.replace(altTarget, rep);
});

// 1e. Update #founder-faqs to lead with Kerala Launch-to-Operate clarity while keeping guardrail-verified DIR-3 KYC & Section 403 FAQs
if (!indexHtml.includes('Why does CraftEgon focus on Kerala Launch-to-Operate bundles')) {
  indexHtml = indexHtml.replace(
    '<div class="faq-accordion-group">',
    `<div class="faq-accordion-group">
          <details class="faq-item">
            <summary class="faq-summary">
              <span class="faq-question">Why does CraftEgon focus on Kerala Launch-to-Operate bundles instead of standalone registrations?</span>
              <span class="faq-chevron" aria-hidden="true">+</span>
            </summary>
            <div class="faq-answer">
              <p>In Kerala, incorporation is only Day 1. Clinics, EXIM warehouses, food plants, boutique resorts, and coaching academies frequently stall after incorporation while navigating <strong>K-SWIFT</strong>, LSGD Panchayat/Municipal licenses, <strong>KSPCB</strong> consents, <strong>Kerala Clinical Establishments</strong> registration, and vendor or specialist contracts. Our bundles unify pre-launch dossiers, CraftEgon LLP contracts, and Year-1 governance under one operational desk.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-summary">
              <span class="faq-question">How do CraftEgon Corporate Services (CCS), CraftEgon LLP, and NIEG work together?</span>
              <span class="faq-chevron" aria-hidden="true">+</span>
            </summary>
            <div class="faq-answer">
              <p><strong>CraftEgon LLP</strong> is our operating entity providing commercial contract drafting and corporate structuring, while <strong>CraftEgon Corporate Services (CCS)</strong> executes regulatory filings, licensing coordination, and connected-banking-led Year-1 retainers out of Markaz Knowledge City, Kozhikode &amp; Malappuram. <strong>NIEG (Nus'ha Institute for Ethical Governance)</strong> provides ethical billing, transparency, and institutional governance benchmarks across our sector playbooks.</p>
            </div>
          </details>`
  );
}

// 1f. Update #consultation-cta geography and requirement options
indexHtml = indexHtml.replace(
  'Schedule a consultation with our corporate compliance advisory team. Transparent fixed quotes, dedicated desk support in Alappuzha, Kerala, and strict confidentiality under non-disclosure standards.',
  'Operating out of Markaz Knowledge City, Kozhikode &amp; Chettipadi, Tirurangadi (Malappuram), Kerala alongside our Alappuzha desk—request a scoped Launch-to-Operate or Year-1 Governance proposal with full separation of advisory and statutory fees.'
);
indexHtml = indexHtml.replace(
  '<div class="trust-point-item"><span class="trust-check">&check;</span> Operational Desk: Alappuzha, Kerala</div>',
  '<div class="trust-point-item"><span class="trust-check">&check;</span> Kerala Hub: Markaz Knowledge City, Kozhikode &amp; Malappuram</div>'
);
if (!indexHtml.includes('value="kl_bnd_clinic"')) {
  indexHtml = indexHtml.replace(
    '<option value="pvt_ltd">Private Limited Incorporation (SPICe+)</option>',
    `<option value="kl_bnd_clinic">Kerala Bundle: Clinics, Diagnostics &amp; Care Centers</option>
                      <option value="kl_bnd_exim">Kerala Bundle: EXIM, Freight &amp; Cold-Chain Logistics</option>
                      <option value="kl_bnd_food">Kerala Bundle: Food, Spice &amp; Nutraceutical Units</option>
                      <option value="kl_bnd_hospitality">Kerala Bundle: Hospitality, Stays &amp; Eco Resorts</option>
                      <option value="kl_bnd_edtech">Kerala Bundle: EdTech &amp; Coaching Academies</option>
                      <option value="pvt_ltd">Private Limited Incorporation (SPICe+)</option>`
  );
}

fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf8');
console.log('Updated index.html with Kerala Launch-to-Operate front door and #kerala-bundles section.');

// ---------------------------------------------------------------------------
// 2. Sync components/navbar.html & components/footer.html across ALL public HTML files
// ---------------------------------------------------------------------------
const EXCLUDED_DIRS = new Set([
  '.git', '.github', '.vault', '.vscode', '.system_generated',
  'node_modules', 'portal', 'admin', 'src', 'docs', 'scripts',
  'scratch', 'review-output', 'dist-public', 'components'
]);

function walkHtml(dir) {
  const results = [];
  for (const item of fs.readdirSync(dir)) {
    if (EXCLUDED_DIRS.has(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results.push(...walkHtml(full));
    } else if (item.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const allPublicHtml = walkHtml(ROOT);
let navUpdated = 0;
let footerUpdated = 0;

for (const filePath of allPublicHtml) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const navRes = replaceBalancedDivById(content, 'global-navbar', `<div id="global-navbar">\n${ssgNavbar}\n</div>`);
  if (navRes.replaced) {
    content = navRes.html;
    changed = true;
    navUpdated++;
  } else {
    const hdrRes = replaceBalancedDivById(content, 'global-header', `<div id="global-navbar">\n${ssgNavbar}\n</div>`);
    if (hdrRes.replaced) {
      content = hdrRes.html;
      changed = true;
      navUpdated++;
    }
  }

  const ftrRes = replaceBalancedDivById(content, 'global-footer', `<div id="global-footer">\n${ssgFooter}\n</div>`);
  if (ftrRes.replaced) {
    content = ftrRes.html;
    changed = true;
    footerUpdated++;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`Chrome sync complete across ${allPublicHtml.length} public HTML files: navbar updated on ${navUpdated}, footer updated on ${footerUpdated}.`);
