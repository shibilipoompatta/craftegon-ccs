/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - MASTER CHROME & HOMEPAGE TRANSFORMER
 * ============================================================================
 * 1. Transforms index.html around the 5 Kerala industry solutions, the
 *    customer-friendly 3-phase lifecycle ("Start Right", "Put the Essentials
 *    in Place", "Stay on Track"), Readiness Estimator, Entity Selector,
 *    services engine, and natural customer copywriting.
 * 2. Applies Deep Emerald (#176B4A) / Charcoal Green (#17251F) tokens cleanly.
 * 3. Synchronizes updated components/navbar.html & components/footer.html across
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
// 1. Transform index.html
// ---------------------------------------------------------------------------
let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

indexHtml = indexHtml.replace(
  /<title>[\s\S]*?<\/title>/i,
  '<title>CraftEgon Corporate Services (CCS) | Business Setup, Approvals &amp; Compliance in Kerala</title>'
);
indexHtml = indexHtml.replace(
  /<meta name="description" content="[^"]*">/i,
  '<meta name="description" content="Build your business on a stronger foundation with CraftEgon Corporate Services (CCS) under CraftEgon LLP (LLPIN: ACO-0239). Entity setup, Kerala approvals, commercial agreements, and ongoing compliance.">'
);
indexHtml = indexHtml.replace(
  /<meta property="og:title" content="[^"]*">/i,
  '<meta property="og:title" content="CraftEgon Corporate Services (CCS) | Build Your Business on a Stronger Foundation">'
);
indexHtml = indexHtml.replace(
  /<meta property="og:description" content="[^"]*">/i,
  '<meta property="og:description" content="From getting started to managing what comes next, we help Kerala businesses navigate registrations, essential approvals, commercial documentation, and ongoing compliance.">'
);

// Update stylesheet cache versions
indexHtml = indexHtml
  .replace(/\/assets\/css\/tokens\.css[^"']*/gi, '/assets/css/tokens.css?v=3.0')
  .replace(/\/assets\/css\/theme\.css[^"']*/gi, '/assets/css/theme.css?v=3.0')
  .replace(/\/assets\/css\/navbar\.css[^"']*/gi, '/assets/css/navbar.css?v=3.0')
  .replace(/\/assets\/css\/home-unique\.css[^"']*/gi, '/assets/css/home-unique.css?v=3.0')
  .replace(/\/assets\/css\/bundles\.css[^"']*/gi, '/assets/css/bundles.css?v=2.0')
  .replace(/\/assets\/css\/chat-widget\.css[^"']*/gi, '/assets/css/chat-widget.css?v=3.0');

const bundleAudienceMap = {
  'KL-BND-CLINIC': 'Multi-specialty clinics, dental and skin centres, diagnostic labs, and care facilities.',
  'KL-BND-EXIM': 'Spice, agro, and seafood exporters, freight operators, warehouses, and cold-chain fleets.',
  'KL-BND-FOOD': 'Spice mills, food and nutraceutical units, agri processors, and private-label brands.',
  'KL-BND-HOSPITALITY': 'Boutique stays, eco and wellness resorts, homestays, and NRI hospitality ventures.',
  'KL-BND-EDTECH': 'Coaching academies, skill institutes, EdTech startups, and online learning platforms.'
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
                <strong>Who This Serves</strong>
                ${esc(bundleAudienceMap[b.id] || b.targetAudience[0])}
              </div>
              <ul class="kl-bundle-phases-mini">
                <li><span class="kl-phase-dot">01</span><span><strong>Start Right:</strong> ${esc(b.entityAndPreLaunchStack.keralaAndCentralRegistrations.slice(0, 2).map(r => r.title).join(' • '))}</span></li>
                <li><span class="kl-phase-dot">02</span><span><strong>Put Essentials in Place:</strong> ${esc(b.commercialAndRiskShield.coreContracts.slice(0, 2).map(c => c.title).join(' • '))}</span></li>
                <li><span class="kl-phase-dot">03</span><span><strong>Stay on Track:</strong> Accounting alignment, GST/TDS coordination &amp; renewal tracking</span></li>
              </ul>
            </div>
            <div class="kl-bundle-card-actions">
              <a href="/conversion/calculator.html?bundle=${encodeURIComponent(b.id)}#readiness" class="kl-bundle-cta-primary">
                <span>Check Readiness</span>
                <span>&rarr;</span>
              </a>
              <a href="/bundles/${esc(b.slug)}.html" class="kl-bundle-cta-ghost">
                <span>Explore Suite</span>
              </a>
            </div>
          </article>`).join('\n');

const newHeroAndBundlesSection = `<section class="hero-3d-section" id="hero" aria-labelledby="hero-title" style="background: linear-gradient(155deg, #FFFFFF 0%, #F5F8F5 60%, #E8F2EC 100%); padding-bottom: 3.25rem;">
      <div class="home-container">
        <div class="hero-center-showcase">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.38rem 0.95rem; border-radius:9999px; background:var(--brand-soft-mint, #E8F2EC); border:1px solid var(--border-color, #D8E3DC); font-family:var(--font-mono,monospace); font-size:0.74rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--brand-emerald, #176B4A); margin-bottom:1.1rem;">
            CraftEgon LLP (LLPIN: ACO-0239) &bull; Alappuzha Commercial Desk &bull; Malappuram Regd. Office
          </div>

          <h1 id="hero-title" class="hero-headline" style="color: var(--brand-charcoal-green, #17251F);">
            Build Your Business on a <span class="hero-headline-accent" style="color: var(--brand-emerald, #176B4A); -webkit-text-fill-color: var(--brand-emerald, #176B4A);">Stronger Foundation.</span>
          </h1>

          <p class="hero-lead" style="color: var(--text-main, #22342C);">
            From getting started to managing what comes next, we help businesses navigate registrations, essential approvals, commercial documentation and ongoing compliance.
          </p>

          <!-- Unified Catalog Search -->
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
                placeholder="Search industry suites, SPICe+, K-SWIFT, AOC-4, TM-A..."
                autocomplete="off"
                spellcheck="false"
                aria-label="Search corporate services from homepage"
              >
              <button type="submit" class="unified-search-btn" style="background: var(--brand-emerald, #176B4A);">
                <span>Search</span> &rarr;
              </button>
            </form>

            <div class="home-front-search-dropdown" id="home-front-search-dropdown" role="region" aria-label="Search Suggestions">
              <div id="home-front-search-results"></div>
            </div>

            <div class="hero-search-shortcuts">
              <span class="shortcuts-label">Industries:</span>
              <a href="/bundles/clinics-diagnostics-kerala.html" class="search-pill">Clinics &amp; Care</a>
              <a href="/bundles/exim-cold-chain-kerala.html" class="search-pill">EXIM &amp; Logistics</a>
              <a href="/bundles/food-spice-processing-kerala.html" class="search-pill">Food &amp; Spice Units</a>
              <a href="/bundles/hospitality-resorts-kerala.html" class="search-pill">Hospitality &amp; Resorts</a>
              <a href="/bundles/edtech-academies-kerala.html" class="search-pill">EdTech &amp; Institutes</a>
            </div>
          </div>

          <!-- Primary & Secondary Customer CTAs -->
          <div class="hero-actions-group">
            <a href="#kerala-bundles" class="btn-hero-primary" style="background: var(--brand-emerald, #176B4A); border-color: var(--brand-emerald, #176B4A);" aria-label="Explore Industry Solutions">
              <span>Explore Industry Solutions</span> &rarr;
            </a>
            <a href="/conversion/calculator.html#readiness" class="btn-hero-secondary" style="border-color: var(--brand-charcoal-green, #17251F); color: var(--brand-charcoal-green, #17251F) !important;" aria-label="Check Your Business Readiness">
              <span>Check Your Business Readiness</span>
            </a>
          </div>

          <div class="hero-trust-strip">
            <span class="trust-item">Government fees itemized at actuals</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">Non-contentious commercial drafting</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">Scoped before commitment</span>
            <span class="trust-divider" aria-hidden="true">&bull;</span>
            <span class="trust-item">57-route underlying service catalogue</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Five Kerala Industry Solutions (Primary Commercial Front Door) -->
    <section class="kl-bundles-showcase" id="kerala-bundles" aria-labelledby="kerala-bundles-heading">
      <div class="home-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Industry Solutions Across Kerala</span>
          <h2 id="kerala-bundles-heading" class="kl-h2">Focused Support for Five Core Industries</h2>
          <p class="kl-lead">
            Incorporation is only the beginning. Select your sector to see typical registration pathways, commercial agreements, and ongoing compliance tasks.
          </p>
        </div>

        <div class="kl-bundle-grid">
${bundleCardsMarkup}
        </div>
      </div>
    </section>

    <!-- Customer-Friendly Three-Phase Model -->
    <section class="kl-bundles-showcase kl-bundles-showcase-alt" id="three-phase-approach" aria-labelledby="three-phase-heading">
      <div class="home-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">How We Structure Work</span>
          <h2 id="three-phase-heading" class="kl-h2">Three Clear Phases as Your Business Grows</h2>
          <p class="kl-lead">
            Scope is agreed in writing after reviewing your business model, premises, staffing, and applicable statutory rules.
          </p>
        </div>

        <div class="ccs-lifecycle-stepper">
          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 1</span>
              <span class="ccs-phase-step-tag">Foundation</span>
            </div>
            <h3 class="ccs-phase-step-title">Start Right</h3>
            <p class="ccs-phase-step-desc">Assess the right legal structure, prepare incorporation documents, check premises readiness, and organize applicable pre-launch registrations.</p>
            <ul class="ccs-phase-step-list">
              <li>Pvt Ltd, LLP, OPC, Section 8, or Partnership setup</li>
              <li>LSGD occupancy, K-SWIFT, KSPCB, FSSAI, or IEC scoping</li>
              <li>Clean separation of professional and government charges</li>
            </ul>
          </article>

          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 2</span>
              <span class="ccs-phase-step-tag">Protection</span>
            </div>
            <h3 class="ccs-phase-step-title">Put the Essentials in Place</h3>
            <p class="ccs-phase-step-desc">Organize the contracts, brand filings, internal policies, and privacy documentation that protect commercial relationships and operations.</p>
            <ul class="ccs-phase-step-list">
              <li>Founder pacts, doctor/faculty contracts, vendor &amp; CHA SLAs</li>
              <li>Trademark (TM-A), copyright, and IP assignment documentation</li>
              <li>Workforce handbooks, POSH setup &amp; DPDP privacy notices</li>
            </ul>
          </article>

          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 3</span>
              <span class="ccs-phase-step-tag">Continuity</span>
            </div>
            <h3 class="ccs-phase-step-title">Stay on Track</h3>
            <p class="ccs-phase-step-desc">Maintain clean accounting coordination, recurring corporate and tax filings, and timely licence renewal tracking with zero guesswork.</p>
            <ul class="ccs-phase-step-list">
              <li>RoC &amp; LLP annual compliance (AOC-4, MGT-7, Form 8/11)</li>
              <li>GST, TDS, EPF/ESIC &amp; ledger reconciliation support</li>
              <li>Licence renewal calendar &amp; periodic governance checks</li>
            </ul>
          </article>
        </div>

        <div style="max-width:1240px; margin:2rem auto 0; padding:1.25rem 1.5rem; background:#FFFFFF; border:1px solid var(--border-color,#D8E3DC); border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <strong style="color:var(--brand-charcoal-green,#17251F); font-size:0.95rem; display:block;">Know the exact individual service or calculator you need?</strong>
            <span style="color:var(--text-secondary,#64746B); font-size:0.86rem;">Every sector suite is backed by our 57-route corporate, tax, contracts, IP, and governance directory.</span>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
            <a href="/conversion/calculator.html#readiness" class="kl-btn-primary" style="padding:0.6rem 1rem; font-size:0.84rem;">Find What Your Business Needs</a>
            <a href="/services.html" class="kl-btn-secondary" style="padding:0.6rem 1rem; font-size:0.84rem;">Explore Our Services (57)</a>
            <a href="/search/" class="kl-btn-secondary" style="padding:0.6rem 1rem; font-size:0.84rem;">Registry Lookups</a>
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

// Clean up any leftover FAQ jargon / bank-tie-up lines in index.html
indexHtml = indexHtml
  .replace(/<span class="faq-question">Why does CraftEgon focus on Kerala Launch-to-Operate bundles instead of standalone registrations\?<\/span>/g,
    '<span class="faq-question">Why does CraftEgon organize services around Kerala industry solutions instead of isolated filings?</span>')
  .replace(/In Kerala, incorporation is only Day 1\.[\s\S]*?<\/p>/,
    'Setting up a company or LLP is only the first step. In Kerala, healthcare clinics, export logistics hubs, food processing plants, boutique resorts, and training academies often run into delays when <strong>K-SWIFT</strong>, local body (LSGD) rules, <strong>KSPCB</strong> consents, <strong>Kerala Clinical Establishments</strong> registration, and vendor contracts are handled by disconnected vendors. Our three-phase model organizes entity setup, commercial documentation, and ongoing compliance under one desk.</p>')
  .replace(/<span class="faq-question">How fast can my Private Limited company be incorporated in India\?<\/span>/g,
    '<span class="faq-question">How does Private Limited company incorporation work under MCA V3?</span>')
  .replace(/Under the MCA V3 portal and the unified SPICe\+ \(INC-32\) filing mechanism,[\s\S]*?bank account setup\.<\/p>/,
    'Under the MCA V3 portal and unified SPICe+ (INC-32) mechanism, incorporation includes Name Reservation (Part A), SPICe+ Part B, up to 2 Director DINs, Certificate of Incorporation (CoI), PAN, TAN, and statutory EPFO/ESIC codes, plus board resolution documentation so you can open an account independently with whichever bank you choose. Actual timelines depend on KYC verification, DSC readiness, and Central Registration Centre (CRC) scrutiny.</p>')
  .replace(/Within 2 Hours Mandate Scoping/g, 'Written Scope Following Review')
  .replace(/<form id="home-enquiry-form" class="if-lead-form home-intake-form" method="POST" action="#" data-static-fallback="true">/g,
    '<form id="home-enquiry-form" class="if-lead-form home-intake-form" method="POST" action="/api/v1/enquiries">')
  .replace(/Launch-to-Operate \+ Year-1 Governance/g, 'Three-Phase Business Infrastructure &amp; Ongoing Compliance')
  .replace(/Start Scope Check/g, 'Check Business Readiness')
  .replace(
    /"description": "[^"]*Commercial Desk: Alappuzha[^"]*"/,
    '"description": "CraftEgon Corporate Services (CCS) under CraftEgon LLP (LLPIN: ACO-0239) helps businesses navigate registrations, pre-launch approvals, commercial agreements, and ongoing compliance. Commercial Desk: Alappuzha 690501; MCA Registered Office: Chettipadi, Malappuram 676319."'
  );

fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf8');
console.log('Updated index.html with business-aligned messaging, emerald system, and 3-phase flow.');

// ---------------------------------------------------------------------------
// 2. Sync components/navbar.html & components/footer.html across ALL public HTML
// ---------------------------------------------------------------------------
const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'dist-public', 'scratch', 'components', 'admin', 'review-output', 'docs', 'portal'
]);

const htmlFiles = [];
function collectHtml(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) {
      if (!EXCLUDED_DIRS.has(item.name)) {
        collectHtml(path.join(dir, item.name));
      }
    } else if (item.isFile() && item.name.endsWith('.html')) {
      htmlFiles.push(path.join(dir, item.name));
    }
  }
}
collectHtml(ROOT);

let navUpdated = 0;
let footerUpdated = 0;
let cssUpdated = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const navRes = replaceBalancedDivById(content, 'global-navbar', `<div id="global-navbar">\n${ssgNavbar}\n</div>`);
  if (navRes.replaced) {
    content = navRes.html;
    navUpdated++;
    changed = true;
  }

  const footerRes = replaceBalancedDivById(content, 'global-footer', `<div id="global-footer">\n${ssgFooter}\n</div>`);
  if (footerRes.replaced) {
    content = footerRes.html;
    footerUpdated++;
    changed = true;
  }

  // Upgrade CSS cache versions sitewide so updated Emerald palette loads cleanly everywhere
  const prevCss = content;
  content = content
    .replace(/\/assets\/css\/tokens\.css[^"']*/gi, '/assets/css/tokens.css?v=3.0')
    .replace(/\/assets\/css\/theme\.css[^"']*/gi, '/assets/css/theme.css?v=3.0')
    .replace(/\/assets\/css\/navbar\.css[^"']*/gi, '/assets/css/navbar.css?v=3.0')
    .replace(/\/assets\/css\/bundles\.css[^"']*/gi, '/assets/css/bundles.css?v=2.0');
  if (content !== prevCss) {
    cssUpdated++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`Chrome sync complete across ${htmlFiles.length} HTML files: navbar on ${navUpdated}, footer on ${footerUpdated}, CSS version bump on ${cssUpdated}.`);
