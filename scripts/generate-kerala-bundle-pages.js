/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - KERALA INDUSTRY SOLUTION PAGE GENERATOR
 * ============================================================================
 * Generates 5 dedicated, sector-specific landing pages under /bundles/*.html:
 *  - data/kerala-bundles.json
 *  - data/service-registry.json
 *  - data/service-bundle-map.json
 *  - components/navbar.html & components/footer.html
 *
 * Implements customer-facing 3-Phase framing ("Start Right", "Put the Essentials
 * in Place", "Stay on Track"), sector-specific deliverables & premises guides,
 * Deep Emerald (#176B4A) / Charcoal Green (#17251F) styling, PENDING_OWNER_REVIEW
 * commercial gating, and Advocates Act / fee-separation boundaries.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUNDLES_DIR = path.join(ROOT, 'bundles');

const bundlesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kerala-bundles.json'), 'utf8'));
const serviceRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'service-registry.json'), 'utf8'));
const serviceBundleMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'service-bundle-map.json'), 'utf8'));

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

const SECTOR_PROFILES = {
  'KL-BND-CLINIC': {
    eyebrow: 'Healthcare & Clinical Establishments',
    image: '/assets/images/bundles/clinics-diagnostics.jpg',
    imageAlt: 'Editorial architectural illustration of a modern Kerala medical clinic and diagnostic centre framed by tropical foliage',
    headline: 'Structured Entity Setup, Clinical Licensing Readiness & Governance for Healthcare Centres.',
    lead: 'Coordinate incorporation, local-body premises verification, Clinical Establishments Act dossiers, bio-medical waste authorization workflows, doctor engagement contracts, and ongoing tax compliance from one desk.',
    heroChecklistNote: 'Covers diagnostic labs, dental & specialty polyclinics, rehab units, and research clinics across Kerala.',
    premisesTitle: 'Clinical Facility & Local-Body Premises Readiness',
    premisesNotes: [
      'Confirm commercial building occupancy classification with your Grama Panchayat, Municipality, or Corporation before signing fit-out commitments.',
      'Assess Kerala Clinical Establishments Act registration rules early (particularly where services extend beyond individual doctor consultations).',
      'Verify KSPCB Bio-Medical Waste (BMW) category applicability and authorized CBMWTF collection onboarding alongside AERB e-LORA or Drug Control triggers where imaging or pharmacy counters operate.'
    ],
    deliverables: [
      { title: 'Clinical Licensing Scope Matrix', desc: 'Property occupancy check, Clinical Establishments checklist, K-SWIFT dossier folder, and BMW tie-up roadmap.' },
      { title: 'Practitioner & Equipment Contract Pack', desc: 'Visiting specialist agreements (Sec 194J aligned), lab/imaging AMC SLAs, and patient DPDP consent notices.' },
      { title: 'Monthly Healthcare Compliance Ledger', desc: 'Segregated consultation vs diagnostic vs pharmacy GST treatment, doctor TDS deduction schedules, and renewal reminders.' }
    ],
    phaseSummaries: {
      p1: 'Scope Pvt Ltd, LLP, or Section 8 registration alongside Kerala premises, K-SWIFT, Clinical Establishments, and pollution board filing prep.',
      p2: 'Draft doctor consultant agreements, diagnostic equipment service-level pacts, premises lease protections, and patient health-data notices.',
      p3: 'Align monthly books, Section 194J TDS, exempt vs taxable GST splits, annual RoC returns, and healthcare licence renewal reminders.'
    }
  },
  'KL-BND-EXIM': {
    eyebrow: 'Export, Import & Cold-Chain Infrastructure',
    image: '/assets/images/bundles/exim-cold-chain.jpg',
    imageAlt: 'Editorial architectural illustration of a coastal Kerala port crane, cold-chain logistics facility, and cargo vessel',
    headline: 'Customs Port Readiness, Trade Contracts & Cross-Border Compliance for EXIM Operations.',
    lead: 'Align company incorporation, DGFT IEC, ICEGATE & Bank AD Code mapping, export LUTs, warehouse consents, CHA & reefer SLAs, and FEMA/EDPMS realization tracking cleanly.',
    heroChecklistNote: 'Designed for spice, agro & seafood shippers, 3PL warehouses, and cold-chain fleet operators.',
    premisesTitle: 'Port, Bonded Godown & Cold-Storage Premises Readiness',
    premisesNotes: [
      'Ensure Bank Authorized Dealer (AD) Code registration is mapped on ICEGATE per port (Cochin/Vallarpadam, Beypore, or air cargo complexes) before shipping bills are generated.',
      'Add every warehouse and cold-storage location cleanly as an Additional Place of Business under GSTIN alongside K-SWIFT/LSGD godown permissions.',
      'Review KSPCB refrigerant/noise thresholds and commodity RCMC rules (Spices Board, APEDA, MPEDA, or FIEO) based on cargo classification.'
    ],
    deliverables: [
      { title: 'Pre-Shipment Port Readiness Pack', desc: 'IEC registration, ICEGATE entity mapping, AD Code port letter, and annual bond-free GST Export LUT (RFD-11).' },
      { title: 'Freight, CHA & Cold-Chain SLAs', desc: 'Custom House Agent accountability terms, temperature-excursion bailment contracts, and Incoterms 2020 supply agreements.' },
      { title: 'EDPMS & Cross-Border Governance File', desc: '9-month export realization ledger reconciliation, GSTR zero-rated ITC refund support, and RBI FLA / Form 3CEB coordination.' }
    ],
    phaseSummaries: {
      p1: 'Establish corporate or LLP trade vehicles alongside DGFT IEC, port AD Code prep, GST Export LUT, RCMC scoping, and warehouse clearances.',
      p2: 'Put CHA agreements, cold-chain transport SLAs, Incoterms supply contracts, and warehouse lease clauses in place before cargo moves.',
      p3: 'Coordinate EDPMS/e-BRC tracking, zero-rated GST filings, annual RBI FLA & Form 3CEB reviews, and IEC/RCMC renewals.'
    }
  },
  'KL-BND-FOOD': {
    eyebrow: 'Food Processing, Spices & Nutraceutical Units',
    image: '/assets/images/bundles/food-spice-processing.jpg',
    imageAlt: 'Editorial architectural illustration of a Kerala food and spice processing facility with botanical motifs and storage silos',
    headline: 'Factory Licensing, Packaging Readiness & Supply-Chain Contracts From Plant to Shelf.',
    lead: 'Coordinate manufacturing entity formation, MSME Udyam protection, K-SWIFT & KSPCB CTE/CTO dossiers, FSSAI licensing, co-packing and distributor agreements, and multi-HSN compliance.',
    heroChecklistNote: 'Tailored for spice mills, coconut/agro units, D2C food brands, and contract packers.',
    premisesTitle: 'Processing Plant, Effluent & Labeling Readiness',
    premisesNotes: [
      'Confirm machinery horsepower limits, industrial zoning, or KINFRA plot conditions with LSGD and Factories & Boilers rules before machinery installation.',
      'Verify KSPCB White/Green/Orange classification and Consent to Establish (CTE) / Consent to Operate (CTO) effluent requirements prior to commercial batches.',
      'Match FSSAI State vs Central manufacturing & nutraceutical product categories alongside Legal Metrology packer declarations and NABL testing triggers.'
    ],
    deliverables: [
      { title: 'Plant-to-Shelf Regulatory Dossier', desc: 'Entity + MSME Udyam certificate (Sec 43B(h) shield), K-SWIFT filing prep, KSPCB CTE dossier, and FoSCoS FSSAI application.' },
      { title: 'Co-Packing & Distributor Contract Kit', desc: 'OEM formulation NDA agreements, super-stockist credit & return SLAs, raw-commodity spec contracts, and Class 29/30 trademark filing.' },
      { title: 'Batch HSN & Renewal Tracker', desc: 'Monthly multi-rate HSN GST coordination, Form MSME-1 vendor checks, FSSAI Form D-1 return prep, and Legal Metrology reminders.' }
    ],
    phaseSummaries: {
      p1: 'Scope Pvt Ltd, LLP, or Partnership formation plus Udyam registration, K-SWIFT factory intake, KSPCB consents, and FSSAI licensing.',
      p2: 'Protect formulations and retail channels with OEM co-packing contracts, distributor SLAs, brand trademarks, and factory HR/POSH policies.',
      p3: 'Maintain multi-HSN GST returns, Sec 43B(h) small-supplier tracking, annual FSSAI Form D-1 filing coordination, and plant licence renewals.'
    }
  },
  'KL-BND-HOSPITALITY': {
    eyebrow: 'Hospitality, Boutique Stays & Wellness Resorts',
    image: '/assets/images/bundles/hospitality-resorts.jpg',
    imageAlt: 'Editorial architectural illustration of a Kerala heritage boutique courtyard resort beside calm backwaters and palms',
    headline: 'Property SPV Structuring, Resort Approvals & Operator Agreements Without Pre-Opening Surprises.',
    lead: 'Coordinate hospitality SPVs, LSGD commercial occupancy checks, KSPCB STP/DG consents, Fire safety checklists, property lease and OTA contracts, and ongoing seasonal governance.',
    heroChecklistNote: 'Structured for boutique resorts, heritage stays, eco-lodges, serviced villas, and NRI property SPVs.',
    premisesTitle: 'Land Occupancy, STP, Fire & Tourism Premises Checks',
    premisesNotes: [
      'Validate building occupancy classification, Panchayat/Municipal commercial rules, and coastal/eco-sensitivity restrictions prior to executing long-term lease lock-ins.',
      'Scope KSPCB Sewage Treatment Plant (STP) and DG set thresholds early based on total room keys and dining seating.',
      'Coordinate Fire & Rescue pre-audit checklists, FoSCoS kitchen licenses, Kerala Tourism classification criteria, and FRRO C-Form readiness for international guests.'
    ],
    deliverables: [
      { title: 'Pre-Opening Clearance Roadmap', desc: 'Hospitality SPV incorporation, LSGD trade/occupancy file, KSPCB & Fire checklist, and FEMA/NRE structuring notes where NRI equity applies.' },
      { title: 'Property Lease, Operator & OTA Suite', desc: 'Condition-precedent lease deeds, management KPI contracts, contractor fit-out SLAs, and DPDP guest ID/CCTV privacy notices.' },
      { title: 'OTA/POS & Seasonal Governance Ledger', desc: 'Booking platform settlement reconciliation, GST room-tariff & F&B slab coordination, payroll filings, and annual resort permit tracking.' }
    ],
    phaseSummaries: {
      p1: 'Structure clean resident or NRI hospitality SPVs and coordinate LSGD occupancy, K-SWIFT, KSPCB STP/DG, Fire, FSSAI, and FRRO C-Form readiness.',
      p2: 'Establish enforceable land leases, resort management contracts, OTA terms, fit-out SLAs, and guest data-privacy documentation.',
      p3: 'Reconcile OTA and POS settlements, coordinate tariff-slab GST & payroll filings, track FEMA FLA returns, and monitor annual resort renewals.'
    }
  },
  'KL-BND-EDTECH': {
    eyebrow: 'EdTech Startups, Coaching & Skill Academies',
    image: '/assets/images/bundles/edtech-academies.jpg',
    imageAlt: 'Editorial architectural illustration of a modern Kerala training academy and digital learning studio courtyard',
    headline: 'Entity Structuring, Faculty Content IP Ownership & Student Data Governance for Education Businesses.',
    lead: 'Align Pvt Ltd or Section 8 incorporation, DPIIT Startup/KSUM readiness, faculty IP assignment contracts, student refund charters, DPDP minor-consent policies, and payment gateway reconciliation.',
    heroChecklistNote: 'Built for hybrid test-prep campuses, SaaS LMS platforms, healthcare upskilling & vocational institutes.',
    premisesTitle: 'Campus Safety, Hybrid Licensing & Online Platform Readiness',
    premisesNotes: [
      'For physical or hybrid coaching centres, align LSGD commercial premises permissions alongside Fire & Rescue and student-campus safety norms.',
      'Assess eligibility carefully before assuming DPIIT Startup India recognition, Section 140 exemptions, or GST educational exemptions apply to your curriculum.',
      'Segregate taxable commercial coaching/SaaS subscriptions from qualifying exempt vocational or NSDC-aligned skill programs.'
    ],
    deliverables: [
      { title: 'Academy Entity & Brand IP Pack', desc: 'Pvt Ltd/LLP/Section 8 formation, DPIIT dossier prep, Trademark Class 41/42 filing, and software/courseware copyright documentation.' },
      { title: 'Faculty IP & Student Governance Kit', desc: 'Recorded lecture & curriculum IP assignment agreements, clear refund/cancellation charter, LMS terms, and DPDP Section 9 parental consent kit.' },
      { title: 'Gateway & Revenue Segregation Ledger', desc: 'UPI/NBFC fee batch reconciliation, faculty retainer (194J) vs payroll TDS mapping, POSH annual reporting, and piracy notice templates.' }
    ],
    phaseSummaries: {
      p1: 'Select the right entity vehicle, check DPIIT/KSUM and campus safety readiness, secure brand trademarks/copyright, and map GST applicability.',
      p2: 'Lock down recorded course ownership with faculty IP assignments, transparent refund policies, DPDP minor-consent flows, and safe-campus POSH setup.',
      p3: 'Coordinate payment-gateway ledger reconciliation, faculty TDS/EPF, annual RoC secretarial filings, ESOP records, and IP renewal monitoring.'
    }
  }
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function billingLabel(model) {
  if (model === 'ONE_TIME_SETUP') return 'Tier 1: One-Time Setup';
  if (model === 'SETUP_PLUS_CONTRACTS') return 'Tier 2: Setup + Contracts & Risk Shield';
  return 'Tier 3: Ongoing Governance Retainer';
}

function buildBundleFaqs(bundle) {
  return [
    {
      q: `Why does ${bundle.title} benefit from a structured three-phase engagement?`,
      a: `${bundle.supplyGapThesis} Organizing Phase 1 entity and pre-launch dossiers alongside Phase 2 CraftEgon LLP commercial agreements and Phase 3 recurring compliance helps prevent operational delays caused by disconnected vendors.`
    },
    {
      q: `Are all listed registrations, contracts, or tax exemptions automatically included in every quote?`,
      a: `No. Each item listed in this sector framework depends on your exact business activity, premises location, capital structure, headcount, and current laws. Exact scope is determined through diagnostic assessment and confirmed in writing before work begins.`
    },
    {
      q: `How do CraftEgon LLP fees relate to statutory government fees and third-party costs?`,
      a: `${bundle.regulatoryHygiene.governmentFeeSeparationClause} Regulated statutory certifications, audits, architectural approvals, and lab tests must be carried out and certified by appropriately qualified independent professionals where required.`
    },
    {
      q: `Does CraftEgon guarantee statutory approvals or fixed processing timelines?`,
      a: `${bundle.regulatoryHygiene.noGuaranteedTimelineClause}`
    },
    {
      q: `How do CraftEgon Corporate Services (CCS) and CraftEgon LLP operate under the Advocates Act?`,
      a: `CraftEgon Corporate Services (CCS) operates under CraftEgon LLP (LLPIN: ACO-0239) to coordinate non-contentious corporate filings, commercial documentation, and ongoing compliance administration (with zero banking partnerships; external frameworks such as NIEG norms are referenced only where relevant on a non-affiliated basis). ${bundle.regulatoryHygiene.advocatesActBoundary}`
    }
  ];
}

function renderBundlePage(bundle) {
  const sector = SECTOR_PROFILES[bundle.id];
  const canonicalUrl = `https://ccs.craftegon.com/bundles/${bundle.slug}.html`;
  const pageTitle = `${bundle.bundleName} | ${bundle.title} | CraftEgon Corporate Services (CCS)`;
  const metaDesc = `${sector.lead} Coordinated by CraftEgon LLP (LLPIN: ACO-0239) — Alappuzha Commercial Desk & Malappuram MCA Registered Office.`;
  const faqs = buildBundleFaqs(bundle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ccs.craftegon.com/" },
          { "@type": "ListItem", "position": 2, "name": "Industry Solutions", "item": "https://ccs.craftegon.com/index.html#kerala-bundles" },
          { "@type": "ListItem", "position": 3, "name": bundle.bundleName, "item": canonicalUrl }
        ]
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        "name": `${bundle.bundleName} (${bundle.title})`,
        "serviceType": "Sector Business Setup, Commercial Documentation & Compliance Coordination",
        "description": metaDesc,
        "provider": {
          "@type": "Organization",
          "name": "CraftEgon Corporate Services (CCS) — CraftEgon LLP",
          "url": "https://ccs.craftegon.com/"
        },
        "areaServed": {
          "@type": "State",
          "name": "Kerala"
        },
        "url": canonicalUrl
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

  const targetAudienceHtml = bundle.targetAudience
    .map(aud => `<li>${esc(aud)}</li>`)
    .join('\n                ');

  const entityCardsHtml = bundle.entityAndPreLaunchStack.entityOptions.map(opt => {
    const svc = serviceMap.get(opt.serviceId);
    const svcUrl = svc ? svc.canonical_route : '/services.html';
    return `
            <div class="kl-check-item">
              <div class="kl-check-top">
                <span class="kl-check-code">${esc(opt.serviceId)}</span>
                <a href="${esc(svcUrl)}" style="font-size:0.75rem; font-weight:700; color:var(--brand-emerald, #176B4A);">View Service Details &rarr;</a>
              </div>
              <h4>${esc(opt.entityType)}</h4>
              <p>${esc(opt.fitRationale)}</p>
            </div>`;
  }).join('');

  const regCardsHtml = bundle.entityAndPreLaunchStack.keralaAndCentralRegistrations.map(reg => `
            <div class="kl-check-item">
              <div class="kl-check-top">
                <span class="kl-check-code">${esc(reg.code)}</span>
                <span class="kl-cond-badge">${reg.isConditional ? 'Activity / Threshold Based' : 'Core Filing Area'}</span>
              </div>
              <h4>${esc(reg.title)}</h4>
              <div class="kl-check-auth">Authority: ${esc(reg.authority)}</div>
              <p>${esc(reg.scopeNote)}</p>
            </div>`).join('');

  const contractsHtml = bundle.commercialAndRiskShield.coreContracts.map(c => `
            <div class="kl-check-item">
              <div class="kl-check-top">
                <span class="kl-check-code">${esc(c.code)}</span>
                <span class="kl-cond-badge">${esc(c.draftingOwner)}</span>
              </div>
              <h4>${esc(c.title)}</h4>
              <p>${esc(c.riskMitigated)}</p>
            </div>`).join('');

  const sopsHtml = bundle.commercialAndRiskShield.governanceAndSops
    .map(s => `<li>${esc(s)}</li>`)
    .join('\n              ');

  const retainerCadenceHtml = bundle.recurringAnnualRetainer.statutoryCadence
    .map(item => `<li>${esc(item)}</li>`)
    .join('\n              ');

  const renewalTrackingHtml = bundle.recurringAnnualRetainer.renewalTracking
    .map(item => `<li>${esc(item)}</li>`)
    .join('\n              ');

  const premisesNotesHtml = sector.premisesNotes
    .map(n => `<li>${esc(n)}</li>`)
    .join('\n                ');

  const deliverablesHtml = sector.deliverables.map((d, idx) => `
            <div class="kl-check-item">
              <div class="kl-check-top">
                <span class="kl-check-code">DELIVERABLE EXAMPLE 0${idx + 1}</span>
              </div>
              <h4>${esc(d.title)}</h4>
              <p>${esc(d.desc)}</p>
            </div>`).join('');

  const tiersHtml = bundle.pricingTiers.map((tier, idx) => `
          <article class="kl-tier-card ${idx === 1 ? 'kl-tier-card-highlight' : ''}">
            <div>
              <div class="kl-tier-model">${esc(tier.tierId)} &bull; ${esc(billingLabel(tier.billingModel))}</div>
              <h3>${esc(tier.tierName)}</h3>
              <div class="kl-tier-quote-pill">
                ${esc(tier.publicQuoteMode)} &bull; Written Quotation Required
              </div>

              <div class="kl-tier-list-label">Potential CCS Scope (Subject to Assessment)</div>
              <ul class="kl-tier-list">
                ${tier.ccsScopeIncluded.map(x => `<li>${esc(x)}</li>`).join('')}
              </ul>

              <div class="kl-tier-list-label">Statutory Government Fees (At Actuals)</div>
              <ul class="kl-tier-list">
                ${tier.statutoryDisbursementsExcluded.map(x => `<li>${esc(x)}</li>`).join('')}
              </ul>

              <div class="kl-tier-list-label">Third-Party &amp; Regulated Costs (Excluded)</div>
              <ul class="kl-tier-list">
                ${tier.thirdPartyExclusions.map(x => `<li>${esc(x)}</li>`).join('')}
              </ul>
            </div>

            <div style="margin-top:1.35rem;">
              <a href="/contact.html?bundle=${encodeURIComponent(bundle.id)}&tier=${encodeURIComponent(tier.tierId)}" class="${idx === 1 ? 'kl-btn-primary' : 'kl-btn-secondary'}" style="width:100%; box-sizing:border-box;">
                Request a Scoped Quote &rarr;
              </a>
            </div>
          </article>`).join('\n');

  const mappedBundleEntries = serviceBundleMap.mappings.filter(m => m.assignedBundles.includes(bundle.id) && m.recordStatus === 'ACTIVE_SERVICE');
  const linkedServicesHtml = mappedBundleEntries.map(m => {
    const shortPhase = m.deliveryPhase.replace(/^Phase \d:\s*/, '');
    return `<a href="${esc(m.canonicalRoute)}" class="kl-service-chip"><span>${esc(m.serviceId)}</span> &middot; ${esc(m.serviceName)} <small style="color:var(--text-secondary);">(${esc(shortPhase)})</small></a>`;
  }).join('\n            ');

  const calcCardsHtml = bundle.catalogCrossReferences.calculatorTabs.map(c => `
          <a href="/conversion/calculator.html#${esc(c.tabId)}" class="kl-tool-link-card">
            <strong>${esc(c.label)} &rarr;</strong>
            <span>Interactive outlay, stamp duty, or compliance estimation</span>
          </a>`).join('');

  const diagCardsHtml = bundle.catalogCrossReferences.relatedDiagnosticRoutes.map(route => `
          <a href="${esc(route)}" class="kl-tool-link-card">
            <strong>${esc(route.replace('/conversion/', '').replace('/services/', '').replace('/locations/', '').replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()))} &rarr;</strong>
            <span>Diagnostic intake &amp; requirement review</span>
          </a>`).join('');

  const milestoneBadgesHtml = bundle.catalogCrossReferences.dashboardMilestoneRules
    .map(m => `<span style="display:inline-block; padding:0.22rem 0.55rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:4px; font-family:var(--font-mono,monospace); font-size:0.74rem; color:#FFFFFF; margin:0 0.35rem 0.35rem 0;">${esc(m)}</span>`)
    .join('');

  const faqsHtml = faqs.map(f => `
          <details class="faq-item">
            <summary class="faq-summary">
              <span class="faq-question">${esc(f.q)}</span>
              <span class="faq-chevron" aria-hidden="true">+</span>
            </summary>
            <div class="faq-answer">
              <p>${esc(f.a)}</p>
            </div>
          </details>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${esc(canonicalUrl)}">

  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CraftEgon Corporate Services (CCS)">
  <meta property="og:url" content="${esc(canonicalUrl)}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="https://ccs.craftegon.com/assets/images/craftegon-logo.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap">

  <link rel="stylesheet" href="/assets/css/tokens.css?v=4.0">
  <link rel="stylesheet" href="/assets/css/theme.css?v=4.0">
  <link rel="stylesheet" href="/assets/css/navbar.css?v=4.0">
  <link rel="stylesheet" href="/assets/css/home-unique.css?v=4.0">
  <link rel="stylesheet" href="/assets/css/bundles.css?v=4.0">
  <link rel="stylesheet" href="/assets/css/chat-widget.css?v=4.0">

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <div id="global-navbar">
${ssgNavbar}
  </div>

  <main id="main-content">
    <!-- 1. Sector-Specific Hero -->
    <section class="kl-page-hero" aria-labelledby="bundle-hero-title">
      <div class="kl-container">
        <nav class="if-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:1.25rem;">
          <a href="/index.html">Home</a> &gt;
          <a href="/index.html#kerala-bundles">Industry Solutions</a> &gt;
          <span aria-current="page">${esc(bundle.title)}</span>
        </nav>

        <div class="kl-hero-grid">
          <div>
            <span class="kl-eyebrow">${esc(sector.eyebrow)} &bull; ${esc(bundle.id)}</span>
            <h1 id="bundle-hero-title" class="kl-h1">${esc(sector.headline)}</h1>
            <p class="kl-lead" style="margin:0 0 1rem;">${esc(sector.lead)}</p>
            <p style="font-size:0.86rem; color:var(--text-secondary, #64746B); margin:0 0 1.25rem;">${esc(sector.heroChecklistNote)}</p>

            <div class="kl-hero-actions">
              <a href="/conversion/calculator.html?bundle=${encodeURIComponent(bundle.id)}#readiness" class="kl-btn-primary">
                <span>Check Your Business Readiness</span>
                <span>&rarr;</span>
              </a>
              <a href="#bundle-consultation" class="kl-btn-secondary">
                <span>Request a Scoped Quote</span>
              </a>
            </div>
          </div>

          <aside class="kl-hero-summary-card" aria-label="Engagement Governance Summary">
            <h2>Solution Scope Overview</h2>
            <ul class="kl-hero-summary-list">
              <li>
                <strong>Operating Entity</strong>
                CraftEgon LLP (LLPIN: ACO-0239) &bull; Commercial Desk: Alappuzha 690501 &bull; MCA Regd. Office: Malappuram 676319
              </li>
              <li>
                <strong>Fee Transparency</strong>
                CCS coordination fees separated cleanly from government portal fees, stamp duty &amp; third-party costs
              </li>
              <li>
                <strong>Delivery Structure</strong>
                Start Right &rarr; Put the Essentials in Place &rarr; Stay on Track (Scoped per business model)
              </li>
              <li>
                <strong>Tracked Compliance Milestones</strong>
                ${milestoneBadgesHtml}
              </li>
            </ul>
            <a href="#package-tiers" style="display:inline-block; color:#E8F2EC; font-weight:700; font-size:0.86rem; text-decoration:underline;">Compare 3 Engagement Tiers &darr;</a>
          </aside>
        </div>

        <figure class="kl-sector-visual-figure">
          <img src="${esc(sector.image)}" alt="${esc(sector.imageAlt)}" width="1600" height="900" loading="eager">
          <figcaption>
            <span><strong>Sector Visual Overview</strong> &bull; ${esc(bundle.title)}</span>
            <span>Editorial Illustration &bull; CraftEgon LLP (ACO-0239)</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- 2 & 3. Target Customers & Common Challenges -->
    <section class="kl-section kl-section-white" id="kerala-bottleneck" aria-labelledby="bottleneck-heading">
      <div class="kl-container">
        <div class="kl-section-head" style="text-align:left; margin: 0 0 2rem;">
          <span class="kl-eyebrow">Target Businesses &amp; Operational Challenges</span>
          <h2 id="bottleneck-heading" class="kl-h2">Who This Suite Serves &amp; Where Post-Incorporation Delays Happen</h2>
        </div>
        <div class="kl-bottleneck-grid">
          <div class="kl-thesis-card kl-thesis-card-demand">
            <span class="kl-thesis-tag">Who This Is Built For</span>
            <h3>Target Business Profiles in Kerala</h3>
            <ul class="kl-tier-list" style="margin-bottom:0.85rem;">
              ${targetAudienceHtml}
            </ul>
            <p style="font-size:0.86rem; color:var(--text-secondary);">${esc(bundle.keralaDemandThesis)}</p>
          </div>
          <div class="kl-thesis-card kl-thesis-card-gap">
            <span class="kl-thesis-tag">Common Operational Bottlenecks</span>
            <h3>Why Registration Alone Isn't Operational Readiness</h3>
            <p>${esc(bundle.supplyGapThesis)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Three-Phase Delivery Overview (Start Right -> Put Essentials in Place -> Stay on Track) -->
    <section class="kl-section kl-section-canvas" aria-labelledby="lifecycle-heading">
      <div class="kl-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Structured Three-Phase Delivery</span>
          <h2 id="lifecycle-heading" class="kl-h2">From Business Setup to Day-to-Day Compliance</h2>
          <p class="kl-lead">Exact deliverables are scoped during initial assessment based on your entity type, premises, staffing, and regulatory triggers.</p>
        </div>

        <div class="ccs-lifecycle-stepper">
          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 1</span>
              <span class="ccs-phase-step-tag">One-Time Setup</span>
            </div>
            <h3 class="ccs-phase-step-title">Start Right</h3>
            <p class="ccs-phase-step-desc">${esc(sector.phaseSummaries.p1)}</p>
          </article>
          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 2</span>
              <span class="ccs-phase-step-tag">Essentials &amp; Contracts</span>
            </div>
            <h3 class="ccs-phase-step-title">Put the Essentials in Place</h3>
            <p class="ccs-phase-step-desc">${esc(sector.phaseSummaries.p2)}</p>
          </article>
          <article class="ccs-phase-step-card">
            <div class="ccs-phase-step-meta">
              <span class="ccs-phase-step-badge">Phase 3</span>
              <span class="ccs-phase-step-tag">Ongoing Governance</span>
            </div>
            <h3 class="ccs-phase-step-title">Stay on Track</h3>
            <p class="ccs-phase-step-desc">${esc(sector.phaseSummaries.p3)}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 5, 6, 7 & 8. Detailed Phase Breakdown, Premises Considerations & Deliverable Examples -->
    <section class="kl-section kl-section-white" id="roadmap-phases" aria-labelledby="roadmap-heading">
      <div class="kl-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Scoping Framework &amp; Requirements</span>
          <h2 id="roadmap-heading" class="kl-h2">Detailed Scope Across All Three Phases</h2>
          <p class="kl-lead">Items below reflect typical requirements to evaluate for this sector; final applicability is determined after reviewing your business model and premises.</p>
        </div>

        <!-- Phase 1: Start Right -->
        <div class="kl-phase-block">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 1 &bull; START RIGHT</span>
            <h3 class="kl-phase-title">Entity Options &amp; Pre-Launch Licensing Readiness</h3>
          </div>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin:0 0 1.1rem;"><strong>Entity Structure Scoping:</strong> Subject to shareholder count, liability needs, and investment plans.</p>
          <div class="kl-checklist-grid" style="margin-bottom: 1.5rem;">
            ${entityCardsHtml}
          </div>

          <div class="kl-check-item" style="margin-bottom: 1.5rem; background:#FFFFFF; border-left: 4px solid var(--brand-emerald, #176B4A);">
            <div class="kl-check-top">
              <span class="kl-check-code">PREMISES &amp; FACILITY CHECKS</span>
              <span class="kl-cond-badge">Site-Dependent Scope</span>
            </div>
            <h4>${esc(sector.premisesTitle)}</h4>
            <ul class="kl-tier-list" style="margin-top:0.5rem;">
              ${premisesNotesHtml}
            </ul>
          </div>

          <p style="font-size:0.9rem; color:var(--text-secondary); margin:0 0 1.1rem;"><strong>Regulatory &amp; Registration Scoping:</strong> Coordination and dossier preparation; statutory approvals rest solely with the competent authorities.</p>
          <div class="kl-checklist-grid">
            ${regCardsHtml}
          </div>
        </div>

        <!-- Phase 2: Put the Essentials in Place -->
        <div class="kl-phase-block">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 2 &bull; PUT THE ESSENTIALS IN PLACE</span>
            <h3 class="kl-phase-title">Commercial Agreements, IP &amp; Internal Policies</h3>
          </div>
          <div class="kl-checklist-grid" style="margin-bottom: 1.35rem;">
            ${contractsHtml}
          </div>
          <div style="background:var(--brand-off-white, #F5F8F5); border:1px solid var(--border-color, #D8E3DC); border-radius:8px; padding:1.15rem 1.35rem;">
            <strong style="display:block; font-size:0.86rem; color:var(--brand-charcoal-green, #17251F); margin-bottom:0.5rem;">Workforce, Privacy &amp; Brand Policies</strong>
            <ul class="kl-tier-list">
              ${sopsHtml}
            </ul>
          </div>
          <div class="kl-nieg-callout">
            <strong>Optional Ethical Benchmark Reference &bull; ${esc(bundle.commercialAndRiskShield.niegTouchpoint.standardName)}</strong>
            <p>${esc(bundle.commercialAndRiskShield.niegTouchpoint.applicationScope)} <em>(Provided solely as a non-affiliated contextual reference; CCS has no commercial or operational dependency on NIEG.)</em></p>
          </div>
        </div>

        <!-- Phase 3: Stay on Track -->
        <div class="kl-phase-block">
          <div class="kl-phase-header">
            <span class="kl-phase-num">PHASE 3 &bull; STAY ON TRACK</span>
            <h3 class="kl-phase-title">Accounting Coordination, Tax Filings &amp; Ongoing Governance</h3>
          </div>
          <p style="font-size:0.94rem; color:var(--text-main); line-height:1.6; margin:0 0 1.25rem;">
            <strong>Accounting &amp; Ledger Alignment:</strong> ${esc(bundle.recurringAnnualRetainer.connectedBankingScope)}
          </p>
          <div class="kl-bottleneck-grid">
            <div class="kl-check-item">
              <h4>Recurring Tax, Payroll &amp; Corporate Filings</h4>
              <ul class="kl-tier-list" style="margin-top:0.5rem;">
                ${retainerCadenceHtml}
              </ul>
            </div>
            <div class="kl-check-item">
              <h4>Licence &amp; Contract Renewal Tracking</h4>
              <ul class="kl-tier-list" style="margin-top:0.5rem;">
                ${renewalTrackingHtml}
              </ul>
            </div>
          </div>
        </div>

        <!-- Sample Deliverable Examples -->
        <div class="kl-phase-block" style="margin-bottom:0;">
          <div class="kl-phase-header">
            <span class="kl-phase-num">DELIVERABLES</span>
            <h3 class="kl-phase-title">Illustrative Deliverable Examples</h3>
          </div>
          <div class="kl-checklist-grid">
            ${deliverablesHtml}
          </div>
        </div>
      </div>
    </section>

    <!-- 9 & 10. Three Commercial Tiers & Transparent Cost Separation -->
    <section class="kl-section kl-section-canvas" id="package-tiers" aria-labelledby="tiers-heading">
      <div class="kl-container">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Commercial Architecture &bull; Cost Transparency</span>
          <h2 id="tiers-heading" class="kl-h2">Three Scoped Engagement Tiers</h2>
          <p class="kl-lead">Final fees depend on your entity structure, premises count, staff size, and filing scope. Every proposal separates CCS coordination fees from government and third-party charges.</p>
        </div>

        <div class="kl-tiers-grid">
          ${tiersHtml}
        </div>

        <div class="kl-fee-separation-banner">
          <strong style="display:block; margin-bottom:0.35rem; color:var(--brand-charcoal-green, #17251F);">Statutory Scope, Professional Sign-Off &amp; Fee Transparency Notice</strong>
          <p style="margin:0 0 0.45rem;">&bull; <strong>Indicative Scope Only:</strong> ${esc(bundle.regulatoryHygiene.noGuaranteedTimelineClause)}</p>
          <p style="margin:0 0 0.45rem;">&bull; <strong>Regulated Professionals &amp; Advocates Act:</strong> Certifications, UDIN attestations, audits, architectural inspections, and lab tests are conducted by independent qualified professionals where mandated. ${esc(bundle.regulatoryHygiene.advocatesActBoundary)}</p>
          <p style="margin:0;">&bull; <strong>Fee Separation:</strong> ${esc(bundle.regulatoryHygiene.governmentFeeSeparationClause)}</p>
        </div>
      </div>
    </section>

    <!-- 11 & 12. Tools, Calculators & Underlying Mapped Catalog Services -->
    <section class="kl-section kl-section-white" id="self-qualification" aria-labelledby="tools-heading">
      <div class="kl-container">
        <div class="kl-section-head" style="text-align:left; margin: 0 0 1.75rem;">
          <span class="kl-eyebrow">Self-Qualification &amp; Supporting Services</span>
          <h2 id="tools-heading" class="kl-h2">Calculators, Readiness Estimator &amp; Individual Services</h2>
        </div>

        <div class="kl-tools-grid">
          <a href="/conversion/calculator.html?bundle=${encodeURIComponent(bundle.id)}#readiness" class="kl-tool-link-card" style="border-color:var(--brand-emerald); background:var(--brand-off-white);">
            <strong>Kerala Readiness Estimator &rarr;</strong>
            <span>Check indicative licensing, contract &amp; compliance requirements for ${esc(bundle.title)}</span>
          </a>
          ${calcCardsHtml}
          ${diagCardsHtml}
          <a href="/search/" class="kl-tool-link-card">
            <strong>Corporate &amp; IP Master Search &rarr;</strong>
            <span>Look up company names, CIN/LLPIN patterns &amp; trademark formats</span>
          </a>
        </div>

        <div style="margin-top:2rem;">
          <h3 style="font-family:var(--font-heading); font-size:1rem; color:var(--brand-charcoal-green); margin:0 0 0.5rem;">All Underlying Services Mapped to ${esc(bundle.bundleName)} (${mappedBundleEntries.length})</h3>
          <div class="kl-service-chips">
            ${linkedServicesHtml}
          </div>
          <div style="margin-top:1.1rem;">
            <a href="/services.html" style="font-size:0.86rem; font-weight:700; color:var(--brand-emerald, #176B4A);">Explore All 57 Individual Services &rarr;</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 13. Vertical FAQs -->
    <section class="kl-section kl-section-canvas" id="bundle-faqs" aria-labelledby="faq-heading">
      <div class="home-container-narrow">
        <div class="kl-section-head">
          <span class="kl-eyebrow">Sector Questions</span>
          <h2 id="faq-heading" class="kl-h2">Frequently Asked Questions</h2>
        </div>
        <div class="faq-accordion-group">
          ${faqsHtml}
        </div>
      </div>
    </section>

    <!-- 14. Request a Scoped Quote -->
    <section class="final-cta-section" id="bundle-consultation" aria-labelledby="cta-heading">
      <div class="home-container">
        <div class="final-cta-card">
          <div class="final-cta-split-grid">
            <div class="final-cta-info-col">
              <span class="final-cta-badge">${esc(bundle.bundleName)} &bull; CraftEgon CCS</span>
              <h2 id="cta-heading" class="final-cta-title">Discuss Your Requirements for ${esc(bundle.title)}</h2>
              <p class="final-cta-lead">
                CraftEgon LLP (LLPIN: ACO-0239) operates our Commercial Desk in Alappuzha (PIN 690501) and MCA Registered Office at Chettipadi, Tirurangadi, Malappuram (PIN 676319). Share your business footprint to receive an itemized written quotation.
              </p>
              <div class="final-cta-direct-actions">
                <a href="https://wa.me/918606918247?text=${encodeURIComponent(`Hello CraftEgon CCS, I would like to discuss requirements for ${bundle.bundleName} (${bundle.id}).`)}" class="btn-whatsapp-direct" target="_blank" rel="noopener noreferrer">
                  <span>WhatsApp Desk (+91 86069 18247)</span>
                </a>
                <a href="tel:+918606918247" class="btn-call-direct">
                  <span>Call Direct: +91 86069 18247</span>
                </a>
              </div>
              <div class="final-cta-trust-points">
                <div class="trust-point-item"><span class="trust-check">&check;</span> Written Scope Before Any Commercial Billing</div>
                <div class="trust-point-item"><span class="trust-check">&check;</span> Statutory Government Fees Itemized at Actuals</div>
                <div class="trust-point-item"><span class="trust-check">&check;</span> Independent CA / CS &amp; Advocate Referral Boundaries</div>
              </div>
            </div>

            <div class="final-cta-form-col">
              <form id="bundle-enquiry-form" class="if-lead-form home-intake-form" method="POST" action="/api/v1/enquiries" data-bundle-id="${esc(bundle.id)}">
                <div class="intake-form-header">
                  <h3 class="intake-form-title">Request a Scoped Quote</h3>
                  <p class="intake-form-sub">Receives a preliminary format check and scope assessment.</p>
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
                      <option value="" disabled selected>Select Engagement Tier...</option>
                      ${bundle.pricingTiers.map(t => `<option value="${esc(t.tierId)}">${esc(t.tierName)}</option>`).join('')}
                      <option value="full_bundle_retainer">Full Three-Phase Scope</option>
                    </select>
                  </div>
                </div>
                <div class="intake-field">
                  <label for="bundle-lead-notes">District, Premises &amp; Requirement Notes</label>
                  <textarea id="bundle-lead-notes" name="message" rows="3" placeholder="Share your district in Kerala, entity status, premises type, and timeline..."></textarea>
                </div>
                <button type="submit" class="intake-submit-btn">Request a Scoped Quote &rarr;</button>
                <p class="intake-confidentiality-note">DPDP-compliant intake. Government fees and third-party costs are itemized separately in your written quotation.</p>
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
  <script src="/assets/js/service-bundle-map.js" defer></script>
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
