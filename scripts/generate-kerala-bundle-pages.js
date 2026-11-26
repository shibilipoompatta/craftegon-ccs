/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - KERALA VERTICAL BUNDLE PAGE GENERATOR
 * ============================================================================
 * Generates the 5 standalone Kerala Launch-to-Operate + Year-1 Governance
 * vertical landing pages under /bundles/*.html strictly from:
 * - data/kerala-bundles.json
 * - data/service-registry.json
 * - components/navbar.html & components/footer.html
 *
 * Ensures zero unapproved commercial pricing leakage, full JSON-LD Service +
 * FAQPage + BreadcrumbList compliance, and WCAG 2.2 AA accessibility.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUNDLES_DIR = path.join(ROOT, 'bundles');

const bundlesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kerala-bundles.json'), 'utf8'));
const serviceRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'service-registry.json'), 'utf8'));

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

const serviceMap = new Map();
serviceRegistry.forEach(s => {
  if (s.service_id) serviceMap.set(s.service_id, s);
});

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function billingLabel(model) {
  if (model === 'ONE_TIME_SETUP') return 'Phase 1 Launch Scope';
  if (model === 'SETUP_PLUS_CONTRACTS') return 'Full Launch + Contracts & Risk Shield';
  return 'Year-1 Recurring Governance';
}

function buildBundleFaqs(bundle) {
  return [
    {
      q: `Why does ${bundle.title} need a Launch-to-Operate bundle instead of just entity incorporation?`,
      a: `${bundle.supplyGapThesis} Our bundled roadmap coordinates entity formation alongside Kerala pre-launch licensing dossiers, sector-specific CraftEgon LLP contracts, and Year-1 statutory cadence.`
    },
    {
      q: `Are government fees, stamp duty, and statutory board charges included in CCS advisory fees?`,
      a: `${bundle.regulatoryHygiene.governmentFeeSeparationClause} You receive an itemised scope separation before work begins.`
    },
    {
      q: `Does CraftEgon guarantee statutory approval timelines from K-SWIFT, LSGD, or regulatory boards?`,
      a: `${bundle.regulatoryHygiene.noGuaranteedTimelineClause}`
    },
    {
      q: `How do CraftEgon LLP and CCS split execution across this vertical?`,
      a: `CraftEgon Corporate Services (CCS) coordinates regulatory filings and Year-1 statutory compliance under CraftEgon LLP (which powers bespoke commercial contracts and SLAs). For billing transparency and governance checklists, our playbooks also include a non-affiliated reference benchmark (${bundle.commercialAndRiskShield.niegTouchpoint.standardName}: ${bundle.commercialAndRiskShield.niegTouchpoint.applicationScope}). ${bundle.regulatoryHygiene.advocatesActBoundary}`
    }
  ];
}

function renderBundlePage(bundle) {
  const canonicalUrl = `https://ccs.craftegon.com/bundles/${bundle.slug}.html`;
  const pageTitle = `${bundle.bundleName} — ${bundle.title} (Kerala) | CraftEgon Corporate Services (CCS)`;
  const metaDesc = `${bundle.shortTagline} Coordinated by CraftEgon LLP (LLPIN: ACO-0239) — Commercial Desk in Alappuzha (690501) & Regd. Office in Malappuram (676319), Kerala.`;
  const faqs = buildBundleFaqs(bundle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ccs.craftegon.com/" },
          { "@type": "ListItem", "position": 2, "name": "Kerala Bundles", "item": "https://ccs.craftegon.com/index.html#kerala-bundles" },
          { "@type": "ListItem", "position": 3, "name": bundle.bundleName, "item": canonicalUrl }
        ]
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        "name": `${bundle.bundleName} (${bundle.title})`,
        "serviceType": "Kerala Launch-to-Operate & Year-1 Corporate Governance",
        "description": metaDesc,
        "url": canonicalUrl,
        "areaServed": {
          "@type": "State",
          "name": "Kerala, India"
        },
        "provider": {
          "@type": "Organization",
          "@id": "https://ccs.craftegon.com/#organization",
          "name": "CraftEgon Corporate Services (CCS)",
          "url": "https://ccs.craftegon.com/"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  const entityCardsHtml = bundle.entityAndPreLaunchStack.entityOptions.map(opt => {
    const svc = serviceMap.get(opt.serviceId);
    const route = svc ? svc.canonical_route : '/services.html';
    return `
      <div class="kl-check-item">
        <div class="kl-check-top">
          <span class="kl-check-code">${esc(opt.serviceId)}</span>
          <span class="kl-cond-badge">Entity Vehicle</span>
        </div>
        <h4>${esc(opt.entityType)}</h4>
        <p>${esc(opt.fitRationale)}</p>
        <div style="margin-top:0.75rem;">
          <a href="${esc(route)}" class="kl-service-chip">View Entity Filing Scope &rarr;</a>
        </div>
      </div>
    `;
  }).join('');

  const regCardsHtml = bundle.entityAndPreLaunchStack.keralaAndCentralRegistrations.map(reg => `
    <div class="kl-check-item">
      <div class="kl-check-top">
        <span class="kl-check-code">${esc(reg.code)}</span>
        <span class="kl-cond-badge">${reg.isConditional ? 'Scope-Dependent' : 'Core Licensing Stack'}</span>
      </div>
      <h4>${esc(reg.title)}</h4>
      <div class="kl-check-auth">${esc(reg.authority)}</div>
      <p>${esc(reg.scopeNote)}</p>
    </div>
  `).join('');

  const contractsHtml = bundle.commercialAndRiskShield.coreContracts.map(c => `
    <div class="kl-check-item">
      <div class="kl-check-top">
        <span class="kl-check-code">${esc(c.code)}</span>
        <span class="kl-cond-badge">${esc(c.draftingOwner)}</span>
      </div>
      <h4>${esc(c.title)}</h4>
      <p>${esc(c.riskMitigated)}</p>
    </div>
  `).join('');

  const sopsHtml = bundle.commercialAndRiskShield.governanceAndSops.map(s => `<li>${esc(s)}</li>`).join('');

  const retainerCadenceHtml = bundle.recurringAnnualRetainer.statutoryCadence.map(s => `<li>${esc(s)}</li>`).join('');
  const renewalTrackingHtml = bundle.recurringAnnualRetainer.renewalTracking.map(s => `<li>${esc(s)}</li>`).join('');

  const milestoneBadgesHtml = bundle.catalogCrossReferences.dashboardMilestoneRules.map(m => `
    <span class="kl-bundle-code">${esc(m)}</span>
  `).join('');

  const tiersHtml = bundle.pricingTiers.map((tier, idx) => `
    <article class="kl-tier-card ${idx === 1 ? 'kl-tier-card-highlight' : ''}">
      <div>
        <div class="kl-tier-model">${esc(billingLabel(tier.billingModel))}</div>
        <h3>${esc(tier.tierName)}</h3>
        <div class="kl-tier-quote-pill">${esc(tier.publicQuoteMode)} &bull; Request Scoped Proposal</div>

        <div class="kl-tier-list-label">CCS / Legal / Governance Scope Included</div>
        <ul class="kl-tier-list">
          ${tier.ccsScopeIncluded.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>

        <div class="kl-tier-list-label">Statutory Disbursements (Separate at Actuals)</div>
        <ul class="kl-tier-list">
          ${tier.statutoryDisbursementsExcluded.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>

        <div class="kl-tier-list-label">Third-Party &amp; Inspection Exclusions</div>
        <ul class="kl-tier-list">
          ${tier.thirdPartyExclusions.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-top:1.5rem;">
        <a href="#bundle-consultation" class="kl-bundle-cta">
          <span>Request ${esc(tier.tierName)} Quote</span>
          <span>&rarr;</span>
        </a>
      </div>
    </article>
  `).join('');

  const calcCardsHtml = bundle.catalogCrossReferences.calculatorTabs.map(tab => `
    <a href="/conversion/calculator.html#${esc(tab.tabId)}" class="kl-tool-link-card">
      <strong>${esc(tab.label)} &rarr;</strong>
      <span>Open interactive calculator (${esc(tab.mode)})</span>
    </a>
  `).join('');

  const diagCardsHtml = bundle.catalogCrossReferences.relatedDiagnosticRoutes
    .filter(r => !r.includes('calculator.html'))
    .map(route => {
      const labelMap = {
        '/conversion/dpdp-audit-request.html': ['DPDP Act 2023 Readiness Diagnostic', 'Check student, patient, or guest privacy gaps'],
        '/conversion/retainer-desk.html': ['Annual Governance Retainer Desk', 'Compare recurring statutory compliance coverage'],
        '/services/trademark-registration.html': ['Brand Trademark Filing (Form TM-A)', 'Protect your brand name and logo across classes'],
        '/conversion/fema-consultation.html': ['NRI & FEMA Inbound Structuring Desk', 'Coordinate FC-GPR, FLA, and RBI capital inflows'],
        '/conversion/cross-border-retainer.html': ['Cross-Border & EXIM Retainer Intake', 'Track EDPMS, Transfer Pricing & Branch filings'],
        '/conversion/tax-intake.html': ['Corporate Tax & GST Assessment', 'Segregate HSN rates, LUTs & Sec 43B(h) exposures'],
        '/conversion/license-qualification.html': ['Statutory Licence Qualification', 'Scope K-SWIFT, FSSAI, Udyam & factory clearances'],
        '/services/msme-udyam.html': ['MSME / Udyam Priority Shield', 'Verify 45-day buyer payment protection eligibility'],
        '/locations/malappuram-nri-business-desk.html': ['Malappuram & Tirurangadi NRI Desk', 'Dedicated support for GCC-return founders'],
        '/locations/kozhikode-corporate-services.html': ['Kozhikode & Malabar Coverage Desk', 'Pan-Kerala compliance & startup corridor support'],
        '/conversion/trademark-search.html': ['Trademark Classification & Intake', 'Map NICE classes before Form TM-A filing'],
        '/services/dpiit-startup-india.html': ['DPIIT Startup India Assessment', 'Check G.S.R. 108(E) & KSUM eligibility criteria']
      };
      const [t, s] = labelMap[route] || ['Diagnostic & Filing Desk', 'Open linked CCS tool or service'];
      return `
        <a href="${esc(route)}" class="kl-tool-link-card">
          <strong>${esc(t)} &rarr;</strong>
          <span>${esc(s)}</span>
        </a>
      `;
    }).join('');

  const linkedServicesHtml = bundle.catalogCrossReferences.linkedServiceIds.map(id => {
    const svc = serviceMap.get(id);
    if (!svc) return '';
    return `<a href="${esc(svc.canonical_route)}" class="kl-service-chip">${esc(id)}: ${esc(svc.service_name)} &rarr;</a>`;
  }).join('');

  const faqsHtml = faqs.map(f => `
    <details class="faq-item">
      <summary class="faq-summary">
        <span class="faq-question">${esc(f.q)}</span>
        <span class="faq-chevron" aria-hidden="true">+</span>
      </summary>
      <div class="faq-answer">
        <p>${esc(f.a)}</p>
      </div>
    </details>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${esc(canonicalUrl)}">

  <!-- Favicon Architecture -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/images/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/images/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon-192x192.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CraftEgon Corporate Services (CCS)">
  <meta property="og:url" content="${esc(canonicalUrl)}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="https://ccs.craftegon.com/assets/images/craftegon-logo.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@craftegon">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(metaDesc)}">
  <meta name="twitter:image" content="https://ccs.craftegon.com/assets/images/craftegon-logo.jpg">

  <!-- Fonts & Design System -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/theme.css">
  <link rel="stylesheet" href="/assets/css/navbar.css">
  <link rel="stylesheet" href="/assets/css/home-unique.css">
  <link rel="stylesheet" href="/assets/css/service-page.css">
  <link rel="stylesheet" href="/assets/css/bundles.css">

  <script id="craftegon-config-script" src="/assets/js/config.js"></script>
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <div id="global-navbar">
${ssgNavbar}
  </div>
  <div class="if-header-spacer" style="height:76px;"></div>

  <main id="main-content">
    <!-- Hero & Breadcrumb -->
    <section class="kl-page-hero" aria-labelledby="bundle-hero-title">
      <div class="kl-container">
        <nav class="if-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: 1.25rem;">
          <a href="/index.html">Home</a> / <a href="/index.html#kerala-bundles">Kerala Industry Bundles</a> / <span aria-current="page">${esc(bundle.bundleName)}</span>
        </nav>

        <div class="kl-hero-grid">
          <div>
            <span class="kl-eyebrow">${esc(bundle.id)} &bull; Kerala Launch-to-Operate</span>
            <h1 id="bundle-hero-title" class="kl-h1">${esc(bundle.bundleName)}</h1>
            <p class="kl-lead" style="margin: 0 0 1.25rem; text-align: left;">
              <strong>${esc(bundle.title)}:</strong> ${esc(bundle.shortTagline)}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom: 1.25rem;">
              ${bundle.targetAudience.map(aud => `<span class="kl-bundle-code">${esc(aud)}</span>`).join('')}
            </div>
            <div class="kl-hero-actions">
              <a href="/conversion/calculator.html?bundle=${encodeURIComponent(bundle.id)}#readiness" class="kl-btn-primary">Start Readiness &amp; Scope Check &rarr;</a>
              <a href="#roadmap-phases" class="kl-btn-secondary">3-Phase Roadmap</a>
              <a href="#bundle-consultation" class="kl-btn-secondary">Request Proposal</a>
            </div>
          </div>

          <aside class="kl-hero-summary-card" aria-label="Bundle Governance Summary">
            <h2>Launch-to-Operate Architecture</h2>
            <ul class="kl-hero-summary-list">
              <li>
                <strong>Verified Offices (LLPIN: ACO-0239)</strong>
                Commercial Desk: Alappuzha (PIN 690501) &bull; MCA Regd. Office: Chettipadi, Malappuram (PIN 676319)
              </li>
              <li>
                <strong>Legal &amp; Operating Entity</strong>
                CraftEgon Corporate Services (CCS) under CraftEgon LLP
              </li>
              <li>
                <strong>Fee Separation Mandate</strong>
                CCS advisory &amp; contract drafting separated cleanly from statutory govt fees &amp; stamp duty
              </li>
              <li>
                <strong>Year-1 Milestone Rules Mapped</strong>
                ${milestoneBadgesHtml}
              </li>
            </ul>
            <a href="#package-tiers" style="display:inline-block; color:#75CDA9; font-weight:700; font-size:0.86rem; text-decoration:underline;">Compare 3 Package Tiers &darr;</a>
          </aside>
        </div>
      </div>
    </section>

    <!-- Step 1: Kerala Bottleneck & Why Fragmented Vendors Fail -->
    <section class="kl-section kl-section-white" id="kerala-bottleneck" aria-labelledby="bottleneck-heading">
      <div class="kl-container">
        <div class="kl-section-head" style="text-align:left; margin: 0 0 2rem;">
          <span class="kl-eyebrow">Step 1 &bull; Kerala Market Reality</span>
          <h2 id="bottleneck-heading" class="kl-h2">Why Standard Registration Fails After Day 1 in Kerala</h2>
        </div>
        <div class="kl-bottleneck-grid">
          <div class="kl-thesis-card kl-thesis-card-demand">
            <span class="kl-thesis-tag">Kerala Demand Dynamics</span>
            <h3>High-Intent Capital &amp; Sector Expansion</h3>
            <p>${esc(bundle.keralaDemandThesis)}</p>
          </div>
          <div class="kl-thesis-card kl-thesis-card-gap">
            <span class="kl-thesis-tag">Where Fragmented Vendors Fail</span>
            <h3>The Post-Registration Operational Stall</h3>
            <p>${esc(bundle.supplyGapThesis)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 2: 3-Phase Launch-to-Operate + Year-1 Governance Roadmap -->
    <section class="kl-section kl-section-canvas" id="roadmap-phases" aria-labelledby="roadmap-heading">
      <div class="kl-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Step 2 &bull; Structured Execution Roadmap</span>
          <h2 id="roadmap-heading" class="kl-h2">Three Phases From Incorporation to Year-1 Governance</h2>
          <p class="kl-lead">Every registration dossier, sector contract, and recurring tax/RoC calendar aligned before capital is locked in.</p>
        </div>

        <!-- Phase 1 -->
        <div class="kl-phase-block">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 01</span>
            <h3 class="kl-phase-title">${esc(bundle.entityAndPreLaunchStack.phaseTitle)}</h3>
          </div>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin:0 0 1.1rem;"><strong>Recommended Corporate Vehicles:</strong> Select the entity structure matching your investor, liability, and licensing profile.</p>
          <div class="kl-checklist-grid" style="margin-bottom: 1.5rem;">
            ${entityCardsHtml}
          </div>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin:0 0 1.1rem;"><strong>Kerala &amp; Central Pre-Launch Licensing Stack:</strong> Structured filing guidance and execution coordination (approvals rest with respective statutory authorities).</p>
          <div class="kl-checklist-grid">
            ${regCardsHtml}
          </div>
        </div>

        <!-- Phase 2 -->
        <div class="kl-phase-block">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 02</span>
            <h3 class="kl-phase-title">${esc(bundle.commercialAndRiskShield.phaseTitle)}</h3>
          </div>
          <div class="kl-checklist-grid" style="margin-bottom: 1.35rem;">
            ${contractsHtml}
          </div>
          <div style="background:var(--surface-canvas); border:1px solid var(--border-color); border-radius:8px; padding:1.15rem 1.35rem;">
            <strong style="display:block; font-size:0.86rem; color:var(--charcoal-ink); margin-bottom:0.5rem;">Standard Operating Policies &amp; Workforce Governance</strong>
            <ul class="kl-tier-list">
              ${sopsHtml}
            </ul>
          </div>
          <div class="kl-nieg-callout">
            <strong>Governance Reference &bull; ${esc(bundle.commercialAndRiskShield.niegTouchpoint.standardName)}</strong>
            <p>${esc(bundle.commercialAndRiskShield.niegTouchpoint.applicationScope)}</p>
          </div>
        </div>

        <!-- Phase 3 -->
        <div class="kl-phase-block" style="margin-bottom:0;">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 03</span>
            <h3 class="kl-phase-title">${esc(bundle.recurringAnnualRetainer.phaseTitle)}</h3>
          </div>
          <p style="font-size:0.94rem; color:var(--text-main); line-height:1.6; margin:0 0 1.25rem;">
            <strong>Bookkeeping &amp; Tax Ledger Governance:</strong> ${esc(bundle.recurringAnnualRetainer.connectedBankingScope)}
          </p>
          <div class="kl-bottleneck-grid">
            <div class="kl-check-item">
              <h4>Statutory Tax, Payroll &amp; RoC Cadence</h4>
              <ul class="kl-tier-list" style="margin-top:0.5rem;">
                ${retainerCadenceHtml}
              </ul>
            </div>
            <div class="kl-check-item">
              <h4>Kerala License &amp; Contract Renewal Calendar</h4>
              <ul class="kl-tier-list" style="margin-top:0.5rem;">
                ${renewalTrackingHtml}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3-Tier Package Scope & Fee Separation -->
    <section class="kl-section kl-section-white" id="package-tiers" aria-labelledby="tiers-heading">
      <div class="kl-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Transparent Scope Separation</span>
          <h2 id="tiers-heading" class="kl-h2">3-Tier Engagement Architecture</h2>
          <p class="kl-lead">Commercial quotes are scoped after assessing facility footprint, headcount, and cross-border complexity—with statutory disbursements itemized strictly at actuals.</p>
        </div>

        <div class="kl-tiers-grid">
          ${tiersHtml}
        </div>

        <div class="kl-fee-separation-banner">
          <strong style="display:block; margin-bottom:0.35rem; color:var(--charcoal-ink);">Regulatory &amp; Fee Transparency Disclosure</strong>
          <p style="margin:0 0 0.45rem;">&bull; <strong>No Guaranteed Timelines:</strong> ${esc(bundle.regulatoryHygiene.noGuaranteedTimelineClause)}</p>
          <p style="margin:0 0 0.45rem;">&bull; <strong>Advocates Act 1961 Boundary:</strong> ${esc(bundle.regulatoryHygiene.advocatesActBoundary)}</p>
          <p style="margin:0;">&bull; <strong>Pure Agent Fee Separation:</strong> ${esc(bundle.regulatoryHygiene.governmentFeeSeparationClause)}</p>
        </div>
      </div>
    </section>

    <!-- Step 3: Self-Qualification Diagnostics, Lookups & Underlying Catalog Links -->
    <section class="kl-section kl-section-canvas" id="self-qualification" aria-labelledby="tools-heading">
      <div class="kl-container">
        <div class="kl-section-head" style="text-align:left; margin: 0 0 1.75rem;">
          <span class="kl-eyebrow">Step 3 &bull; Self-Qualification &amp; Underlying Catalog</span>
          <h2 id="tools-heading" class="kl-h2">Calculators, Registry Lookups &amp; Linked Core Services</h2>
        </div>

        <div class="kl-tools-grid">
          ${calcCardsHtml}
          ${diagCardsHtml}
          <a href="/search/" class="kl-tool-link-card">
            <strong>Corporate &amp; IP Master Search &rarr;</strong>
            <span>Check company naming, CIN/LLPIN patterns &amp; trademark formats</span>
          </a>
        </div>

        <div style="margin-top:2rem;">
          <h3 style="font-family:var(--font-heading); font-size:1rem; color:var(--charcoal-ink); margin:0 0 0.5rem;">Underlying Services Orchestrated in This Bundle</h3>
          <div class="kl-service-chips">
            ${linkedServicesHtml}
          </div>
        </div>
      </div>
    </section>

    <!-- Vertical FAQs -->
    <section class="kl-section kl-section-white" id="bundle-faqs" aria-labelledby="faq-heading">
      <div class="home-container-narrow">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Sector Guidance</span>
          <h2 id="faq-heading" class="kl-h2">Frequently Asked Questions</h2>
        </div>
        <div class="faq-accordion-group">
          ${faqsHtml}
        </div>
      </div>
    </section>

    <!-- Step 4: Scoped Consultation / Retainer Path -->
    <section class="final-cta-section" id="bundle-consultation" aria-labelledby="cta-heading">
      <div class="home-container">
        <div class="final-cta-card">
          <div class="final-cta-split-grid">
            <div class="final-cta-info-col">
              <span class="final-cta-badge">${esc(bundle.bundleName)} &bull; Kerala Desk</span>
              <h2 id="cta-heading" class="final-cta-title">Request Scoped Proposal for ${esc(bundle.title)}</h2>
              <p class="final-cta-lead">
                CraftEgon LLP (LLPIN: ACO-0239) operates our Commercial Desk at Alappuzha (PIN 690501) with MCA Registered Office at Chettipadi, Malappuram (PIN 676319)—scoping your entity, Kerala clearances, contracts, and Year-1 retainer cleanly before billing.
              </p>
              <div class="final-cta-direct-actions">
                <a href="https://wa.me/918606918247?text=${encodeURIComponent(`Hello CraftEgon CCS, I want to scope the ${bundle.bundleName} (${bundle.id}) in Kerala.`)}" class="btn-whatsapp-direct" target="_blank" rel="noopener noreferrer">
                  <span>WhatsApp Kerala Desk (+91 86069 18247)</span>
                </a>
                <a href="tel:+918606918247" class="btn-call-direct">
                  <span>Call Direct: +91 86069 18247</span>
                </a>
              </div>
              <div class="final-cta-trust-points">
                <div class="trust-point-item"><span class="trust-check">&check;</span> CraftEgon LLP Contract Drafting &amp; CCS Secretarial Execution</div>
                <div class="trust-point-item"><span class="trust-check">&check;</span> Ethical Billing &amp; Governance Benchmark References</div>
                <div class="trust-point-item"><span class="trust-check">&check;</span> Clear Separation of Advisory &amp; Statutory Govt Fees</div>
              </div>
            </div>

            <div class="final-cta-form-col">
              <form id="bundle-enquiry-form" class="if-lead-form home-intake-form" method="POST" action="/api/v1/enquiries" data-bundle-id="${esc(bundle.id)}">
                <div class="intake-form-header">
                  <h3 class="intake-form-title">Scope Your Launch-to-Operate Stack</h3>
                  <p class="intake-form-sub">Receives a structured preliminary format audit &amp; proposal call.</p>
                </div>
                <input type="hidden" name="bundle_id" value="${esc(bundle.id)}">
                <div class="intake-field-row">
                  <div class="intake-field">
                    <label for="bundle-lead-name">Full Name <span class="required-star">*</span></label>
                    <input type="text" id="bundle-lead-name" name="name" required placeholder="Founder or Director Name" autocomplete="name">
                  </div>
                  <div class="intake-field">
                    <label for="bundle-lead-phone">Phone / WhatsApp <span class="required-star">*</span></label>
                    <input type="tel" id="bundle-lead-phone" name="phone" required placeholder="10-digit mobile number" data-validate="phone" autocomplete="tel">
                  </div>
                </div>
                <div class="intake-field-row">
                  <div class="intake-field">
                    <label for="bundle-lead-email">Email Address <span class="required-star">*</span></label>
                    <input type="email" id="bundle-lead-email" name="email" required placeholder="name@company.com" data-validate="email" autocomplete="email">
                  </div>
                  <div class="intake-field">
                    <label for="bundle-lead-tier">Target Engagement Tier <span class="required-star">*</span></label>
                    <select id="bundle-lead-tier" name="requirement" required>
                      <option value="" disabled selected>Select Package Tier...</option>
                      ${bundle.pricingTiers.map(t => `<option value="${esc(t.tierId)}">${esc(t.tierName)}</option>`).join('')}
                      <option value="full_bundle_retainer">Full Bundle + Year-1 Governance</option>
                    </select>
                  </div>
                </div>
                <div class="intake-field">
                  <label for="bundle-lead-notes">District, Facility Scope &amp; Timeline Notes</label>
                  <textarea id="bundle-lead-notes" name="message" rows="3" placeholder="e.g., Kozhikode / Malappuram, entity status, estimated team/facility size..."></textarea>
                </div>
                <button type="submit" class="intake-submit-btn">Submit Scoped Enquiry &rarr;</button>
                <p class="intake-confidentiality-note">&#128274; DPDP-compliant intake. Statutory fees are separated transparently in your proposal.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <div id="global-footer">
${ssgFooter}
  </div>

  <script src="/assets/js/search-index.js" defer></script>
  <script src="/assets/js/service-search.js" defer></script>
  <script src="/assets/js/kerala-bundles.js" defer></script>
  <script src="/assets/js/navigation.js" defer></script>
  <script src="/assets/js/forms.js" defer></script>
  <script src="/assets/js/chat-widget.js" defer></script>
</body>
</html>
`;
}

if (!fs.existsSync(BUNDLES_DIR)) {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
}

const generatedFiles = [];
for (const bundle of bundlesData.bundles) {
  const outPath = path.join(BUNDLES_DIR, `${bundle.slug}.html`);
  fs.writeFileSync(outPath, renderBundlePage(bundle), 'utf8');
  generatedFiles.push(`bundles/${bundle.slug}.html`);
}

console.log(`Generated ${generatedFiles.length} Kerala vertical bundle landing pages:`);
generatedFiles.forEach(f => console.log('  -', f));
