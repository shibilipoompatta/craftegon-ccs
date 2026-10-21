# MERGE_BLUEPRINT.md
## Craftegon Corporate Services (CCS) — Round 1: REA Evidence Extraction & 2026 Merge Blueprint

> **Classification:** Strategic Architecture Document  
> **Status:** DRAFT — For Review & Approval Before Round 2 Implementation  
> **Generated:** 2026-10-21 via REA (Reverse Engineer Anything) analysis of `https://www.indiafilings.com/`  
> **Target:** Upgrade CCS (`ccs.craftegon.com`) to 5⭐ Enterprise Standard  

---

## 📋 EXECUTIVE SUMMARY

This blueprint documents the **Reverse Engineered Architecture (REA)** of IndiaFilings — India's largest AI-powered corporate services platform — and defines a **non-breaking merge strategy** to integrate their proven functional modules, UI patterns, and 2026 statutory data structures into Craftegon CCS.

**Core Principle:** Zero orphan pages, zero broken links, zero regression. Every merge operation must preserve the existing 113-route mesh integrity verified by `npm test`.

---

## 🔍 PART 1: REA EVIDENCE — INDIAFILINGS FUNCTIONAL ARCHITECTURE

### 1.1 Top-Level Navigation & User Journey Map

| Nav Item | Route | Core Function | Lead Capture Pattern |
|----------|-------|---------------|---------------------|
| **Startup** | `/startup` | Entity formation (Pvt Ltd, LLP, OPC, Sec 8) | WhatsApp CTA + "Continue" button above fold |
| **Registrations** | `/registrations` | Licenses, certifications, IEC, FSSAI, etc. | Price anchor (₹1,899) + WhatsApp |
| **Trademark** | `/trademark` | TM search, filing (Form TM-A), monitoring | ₹1,899 price + class selector |
| **GST** | `/gst` | Registration, returns (GSTR-1/3B/9), reconciliation | ₹1,499/mo + LEDGERS software upsell |
| **Income Tax** | `/income-tax` | ITR filing, TDS, tax planning | "Get a Quote" + WhatsApp |
| **MCA Services** | `/mca-services` | Annual filings (AOC-4, MGT-7), DIR-3 KYC | ₹1,999/mo subscription + "Consult Advisor" |
| **Compliance (HR)** | `/hr-services` | Payroll, PF/ESI, attendance, LEDGERS HR | "Get a Quote" |
| **Consultation** | `/consultation` | CA/Lawyer booking (30-min slots) | "Get a Quote" + long-form content |
| **Global** | `/uae` | UAE company formation (Filings.AE) | Cross-sell to separate platform |
| **Referral** | `/referral` | Partner/affiliate program | Viral loop |

**Key Journey Pattern:** Every vertical page follows **Hero → Price Anchor → Feature Bullets → WhatsApp CTA → FAQ → Footer**. No dead ends.

---

### 1.2 Business Search & Intelligence Platform (`/search`)

**Evidence Captured:**
- **Three-tab search**: Company (India/UAE/USA), Trademark, GSTIN
- **Registration cross-sell**: Each search tab shows "Register [Jurisdiction] Company" CTAs
- **No live results rendered** in static fetch — likely AJAX/hydrated post-load
- **Strategic purpose**: Free tool → lead gen → paid filing service

**Data Sources Referenced:**
- MCA Master Data (CIN/LLPIN)
- IP India Trademark Registry
- GSTN GSTIN validation

---

### 1.3 Learning Center — 2026 Statutory Content Hub (`/learn`)

**Verified Live Articles (2026-dated):**

| Article | URL Pattern | Key 2026 Regulatory Content |
|---------|-------------|------------------------------|
| **AOC-4 Filing Guide** | `/learn/aoc-4` | XBRL mandates, fee slabs (₹200–600), penalty table (2×–18×), due dates |
| **DIR-3 eKYC / DIN KYC** | `/learn/dir-3-ekyc` | 2020 fee waiver (Circular 11/12), annual OTP/biometric, ₹5,000 reactivation |
| **CCFS-2026 Extension** | `/company-annual-filing/ccfs-2026-extended` | **Sep 15, 2026 deadline** (Circular 04/2026), 10% additional fee benefit, eligibility matrix |
| **CCFS-2026 History** | `/company-annual-filing/ccfs-2026-ends-on-31st-august-2026` | Timeline: Feb 24 → Apr 15 → Jul 15 → Aug 31 → **Sep 15** |

**Content Architecture Patterns:**
- **Structured tables**: Fee slabs, penalty matrices, due date timelines
- **Official circular PDFs** embedded (MCA notifications)
- **Cross-links** to service pages (`/company-annual-filing`, `/ccfs-scheme-company-compliance/fees`)
- **FAQ schema** at bottom (rich snippet optimization)
- **Author bylines** with expertise badges (Jasmine Kaur Huda — AGM)
- **Related Guides sidebar** for content mesh retention

---

### 1.4 LEDGERS Platform & Developer Ecosystem

| Component | Evidence | Strategic Value |
|-----------|----------|-----------------|
| **LEDGERS Cloud** | `https://ledgers.cloud/in/accountant/` | Unified compliance OS (MCA, GST, IT, TM, Payroll) |
| **LEDGERS API** | `/developers` + `in-api.ledgers.cloud` | REST API for accounting, invoicing, inventory, payments |
| **Sandbox/Prod** | UAT + Production environments | Developer onboarding funnel |
| **AI Compliance Cloud** | Homepage hero positioning | "Connect banks, payment gateways, gov portals in one workflow" |

**API Capabilities:** Business CRUD, contacts, catalogs, quotations, invoices, receipts, POs, expenses, credit/debit notes, webhooks.

---

### 1.5 Banking & Marketplace Partner Desk

**Visible Partners (Homepage Footer):**
- **Yes Bank**, **ICICI Bank**, **DBS Bank** — displayed as "Partners"
- **Integration claim**: "Connect banks, payment gateways, government portals in one workflow"
- **Strategic role**: Banking on-ramp for incorporated entities (current account opening, payment gateway setup)

---

### 1.6 Lead Capture & Conversion Mechanics

| Mechanism | Placement | Trigger |
|-----------|-----------|---------|
| **WhatsApp Float** | Fixed bottom-right (all pages) | Instant `wa.me/91...` deep link |
| **Price Anchor + "Continue"** | Hero section, above fold | Click → WhatsApp pre-filled message |
| **"Get a Quote"** | Service pages (IT, HR, Consultation) | Form → WhatsApp/Email staging |
| **"Consult Advisor"** | MCA, Compliance pages | 30-min paid consultation booking |
| **"Subscribe Now"** | MCA Compliance (₹1,999/mo) | Recurring revenue funnel |
| **Referral Program** | `/referral` nav item | Viral coefficient optimization |

---

### 1.7 2026 Statutory Data Structures Extracted

| Regulation | Data Points Captured | Source Article |
|------------|---------------------|----------------|
| **CCFS-2026 (MCA Amnesty)** | Deadline: **Sep 15, 2026**; 10% additional fee; eligible forms (AOC-4, MGT-7, ADT-1, etc.); unchanged terms | Circular 04/2026 (Aug 31, 2026) |
| **MSME Section 43B(h)** | 45-day payment rule; written contract requirement; IT deduction denial for non-compliance; Form MSME-1 half-yearly | Referenced in entity search diagnostic |
| **DIR-3 KYC Annual** | Due: **Sep 30 annually**; OTP/biometric; ₹5,000 penalty; DIN deactivation → Sec 164(2) disqualification | 2020 waiver + current rules |
| **GST E-Invoicing** | 30-day mandate (Rule 48(4)); biometric auth (Rule 10B); Rule 88C/88D high-value UPI notices | `gst-einvoicing-compliance-mandate` |
| **PAS-6 Demat Audit** | Rule 9B (Oct 27, 2023); non-small private cos; half-yearly ISIN reconciliation; NSDL/CDSL | `pas6-demat-audit-guide` |
| **Section 403 Late Fees** | ₹100/day/form; multiplier slabs (2×–18×); no ceiling; Sec 454 adjudication; DIN deactivation risk | `late-fee-calculator-guide` |
| **Transfer Pricing (3CEB)** | Sec 92E; Rule 10D docs; benchmarking; specified domestic transactions | `transfer-pricing-guide` |

---

## 🏗 PART 2: CCS CURRENT ARCHITECTURE — GAP ANALYSIS

### 2.1 Vertical Taxonomy Coverage (15 Verticals, 3 Gaps)

| Vertical | ID | Status | Services | IndiaFilings Equivalent |
|----------|-----|--------|----------|------------------------|
| Entity Formation | V01 | ✅ Active | 10 | `/startup`, `/registrations` |
| Corporate Compliance | V02 | ✅ Active | 18 | `/mca-services` |
| Tax & Regulatory | V03 | ✅ Active | 5 | `/gst`, `/income-tax` |
| Licenses & Registrations | V04 | ✅ Active | 1 | `/registrations` (partial) |
| Contracts & Legal | V05 | ✅ Active | 2 | `/consultation` (partial) |
| IPR Protection | V06 | ✅ Active | 3 | `/trademark` |
| Employment & HR | V07 | ✅ Active | 2 | `/hr-services` |
| **Startup & Investment** | **V08** | ⚠️ **GAP** | 0 | `/startup` (fundraising missing) |
| Corporate Transactions | V09 | ✅ Active | 3 | `/mca-services` (mergers partial) |
| **Dispute Avoidance** | **V10** | ⚠️ **GAP** | 0 | `/consultation` (referral only) |
| Governance, Audit & Risk | V11 | ✅ Active | 4 | `/mca-services` (audit partial) |
| Data Privacy & Tech Law | V12 | ✅ Active | 3 | `/consultation` (partial) |
| International & FEMA | V13 | ✅ Active | 3 | `/uae` + cross-border |
| **Corporate Retainers** | **V14** | ⚠️ **GAP** | 0 | `/mca-services` (₹1,999/mo) |
| **IT & Digital** | **V15** | ⚠️ **GAP** | 0 | `/developers` (LEDGERS API) |

---

### 2.2 Existing CCS Strengths (Preserve & Extend)

| Asset | Location | Competitive Advantage |
|-------|----------|----------------------|
| **Entity Search Portal** | `/portal/entity-search.html` | AI penalty diagnostic (96/100 scoring), CIN/LLPIN/TM lookup, risk items (43Bh, PAS-6, DIR-3 KYC) |
| **Statutory Calculator Suite** | `/conversion/calculator.html` | 4 modules: RoC late fees, GST/ITC, Tax regime, Cap table — **superior to IndiaFilings** |
| **Trademark Search** | `/conversion/trademark-search.html` | Format validation + Nice class + benchmark matches + official registry guidance |
| **Knowledge Blueprints** | `/knowledge/` | 11 deep technical guides with computational logic |
| **Conversion Funnels** | `/conversion/` | 19 intake forms (venture, M&A, HR, DPDP, FEMA, etc.) |
| **Client Portal** | `/portal/` | Dashboard calendar ticker, subscription tiers |
| **Governance Mesh** | `data/*.json`, `scripts/*.js` | 0 orphans, 0 broken links, 100% SEO, XSS-safe |

---

### 2.3 Critical Gaps vs IndiaFilings

| Gap Category | IndiaFilings Has | CCS Missing | Priority |
|--------------|------------------|-------------|----------|
| **Business Search Directory** | `/search` (Company, TM, GSTIN, 3 jurisdictions) | Entity search only (no GSTIN, no UAE/USA) | 🔴 P0 |
| **Learning Center CMS** | 100+ articles, PDF circulars, FAQ schema, author bylines | 11 static blueprints only | 🔴 P0 |
| **Subscription SaaS** | ₹1,999/mo MCA, ₹1,499/mo GST, HR license | Portal subscription page exists but no backend | 🟡 P1 |
| **LEDGERS-style Platform** | Full accounting/compliance OS + API | Calculator + portal only | 🟡 P1 |
| **Banking Partner Desk** | Yes Bank, ICICI, DBS integration claims | No banking marketplace | 🟡 P1 |
| **Developer/API Portal** | `/developers` with sandbox/prod keys | No API exposure | 🟢 P2 |
| **Referral/Affiliate** | `/referral` nav + program | None | 🟢 P2 |
| **Customer Stories** | 4 video case studies | None | 🟢 P2 |
| **MSME 43B(h) Hub** | Embedded in search diagnostic | Only in entity search risk item | 🔴 P0 |
| **CCFS-2026 Content** | 3+ articles, fee calculator, eligibility | Not present | 🔴 P0 |

---

## 🎯 PART 3: MERGE STRATEGY — MODULE BY MODULE

### 3.1 Merge Principles (Non-Negotiable)

1. **Zero Orphan/Broken Link Guarantee**: Every new route registered in `data/search-index.json`, `data/service-registry.json`, `verticals.json`, `sitemap.xml`, `_redirects`
2. **Canonical ID Preservation**: Existing `V##-SVC-###` IDs immutable; new services get next sequential IDs
3. **Vertical Integrity**: New content maps to existing verticals; coverage gaps (V08, V10, V14, V15) filled via new services
4. **Schema Compliance**: All new JSON conforms to `data/schemas/*.schema.json`
5. **Static-First**: No server-side rendering; all dynamic features via client-side JS + edge functions
6. **Accessibility**: WCAG 2.1 AA maintained across new components

---

### 3.2 Module 1: Business Search & Intelligence Directory (P0)

#### 3.2.1 New Routes to Create
```
/search                                    → Main search hub (replaces /portal/entity-search.html as public tool)
/search/company                            → Company/LLP master data (CIN/LLPIN) — India, UAE, USA
/search/trademark                          → Trademark search (IP India + Madrid)
/search/gstin                              → GSTIN validation + return status
/api/v1/search/company                     → Edge function for live MCA lookup (cached)
/api/v1/search/trademark                   → Edge function for IP India lookup (cached)
/api/v1/search/gstin                       → Edge function for GSTN lookup (cached)
```

#### 3.2.2 Integration with Existing `/portal/entity-search.html`
- **Action**: Refactor entity-search.html → **Client Portal Dashboard Widget** (authenticated users)
- **Public `/search`** becomes the **lead gen tool** (IndiaFilings pattern)
- **Shared component**: `assets/js/search-engine.js` used by both

#### 3.2.3 Data Structures (New `data/search-sources.json`)
```json
{
  "sources": [
    { "id": "mca-master", "name": "MCA Master Data", "jurisdiction": "IN", "endpoint": "https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do", "cacheTTL": 86400 },
    { "id": "ipindia-tm", "name": "IP India Trademark Registry", "jurisdiction": "IN", "endpoint": "https://ipindiaservices.gov.in/tmrpublicsearch/", "cacheTTL": 86400 },
    { "id": "gstn-gstin", "name": "GSTN GSTIN Validation", "jurisdiction": "IN", "endpoint": "https://services.gst.gov.in/services/api/search/gstin", "cacheTTL": 3600 },
    { "id": "uae-ded", "name": "UAE DED / Free Zone Registry", "jurisdiction": "AE", "endpoint": "https://api.filings.ae/v1/company", "cacheTTL": 86400 },
    { "id": "us-sos", "name": "US Secretary of State (Delaware)", "jurisdiction": "US", "endpoint": "https://api.opencorporates.com/v0.4/companies/search", "cacheTTL": 86400 }
  ]
}
```

#### 3.2.4 UI Patterns to Adopt (from IndiaFilings)
- **Three-tab search UI** with jurisdiction flags (🇮🇳 🇦🇪 🇺🇸)
- **Registration cross-sell cards** below each search tab
- **Preset sample chips** (already in CCS entity-search — keep)
- **Results card**: Entity name, CIN/LLPIN/TM No, status, ROC/Registry, key dates, **AI diagnostic badge**

---

### 3.3 Module 2: Learning Center — 2026 Statutory Content Hub (P0)

#### 3.3.1 New Route Structure
```
/learn/                                    → Learning Center hub (category grid + search)
/learn/category/mca                        → MCA/RoC filings (AOC-4, MGT-7, DIR-3, CCFS, PAS-6, ADT-1)
/learn/category/gst                        → GST (registration, returns, e-invoicing, scrutiny)
/learn/category/income-tax                 → ITR, TDS, presumptive, tax planning
/learn/category/feema                      → FLA, FC-3/4, ODI, transfer pricing
/learn/category/ipr                        → Trademark, copyright, patent, design
/learn/category/labour                     → POSH, PF/ESI, labour codes, handbooks
/learn/category/corporate-governance       → Board minutes, secretarial audit, CSR, SBO
/learn/article/{slug}                      → Individual article (e.g., ccfs-2026-extended)
```

#### 3.3.2 Content Migration Plan (IndiaFilings → CCS)

| IndiaFilings Article | CCS Target Route | Vertical | Enhancement |
|---------------------|------------------|----------|-------------|
| `/learn/aoc-4` | `/learn/article/aoc-4-filing-guide-2026` | V02 | Embed late fee calculator widget |
| `/learn/dir-3-ekyc` | `/learn/article/dir-3-kyc-annual-2026` | V02 | Embed DIN status checker widget |
| `/company-annual-filing/ccfs-2026-extended` | `/learn/article/ccfs-2026-amnesty-scheme-2026` | V02 | **NEW**: CCFS fee calculator + eligibility checker |
| `/learn/gst-einvoicing...` (implied) | `/learn/article/gst-einvoicing-30-day-mandate-2026` | V03 | Link to GST calculator Module 2 |
| **NEW: MSME 43B(h)** | `/learn/article/msme-43bh-payment-rule-2026` | V02/V07 | Payment tracker + Form MSME-1 generator |
| **NEW: DPDP 2023 Rules** | `/learn/article/dpdp-rules-2025-implementation` | V12 | Consent artifact generator |
| **NEW: GST 2026 Updates** | `/learn/article/gst-updates-2026-budget` | V03 | Rate change impact simulator |

#### 3.3.3 Article Template (Standardized)
```html
<!-- Every article includes: -->
<article>
  <header>Category breadcrumb | Author badge | Publish date | Update badge</header>
  <h1>Title with statute reference</h1>
  <section class="key-facts">Table: fees, deadlines, penalties</section>
  <section class="procedure">Step-by-step with form numbers</section>
  <section class="compliance-checklist">Interactive checkboxes (localStorage)</section>
  <section class="circulars">Embedded PDFs of MCA/CBDT/CBIC notifications</section>
  <section class="calculator-widget">Embedded mini-calculator from /conversion/calculator.html</section>
  <section class="faq">Schema.org FAQPage markup</section>
  <aside class="related-guides">Cross-links to services + blueprints + other articles</aside>
  <footer class="cta-banner">"Need help? Book consultation →" (WhatsApp deep link)</footer>
</article>
```

#### 3.3.4 Data Structure: `data/learning-articles.json`
```json
{
  "articles": [
    {
      "slug": "ccfs-2026-amnesty-scheme-2026",
      "title": "CCFS-2026: Companies Compliance Facilitation Scheme 2026 — Extended to 15 Sep 2026",
      "category": "mca",
      "verticalIds": ["V02"],
      "tags": ["CCFS-2026", "MCA Amnesty", "Section 403", "AOC-4", "MGT-7", "2026"],
      "statutoryRefs": ["General Circular 04/2026", "General Circular 01/2026", "Sec 403 Co. Act"],
      "keyDates": { "schemeStart": "2026-04-15", "originalEnd": "2026-07-15", "firstExtension": "2026-08-31", "finalDeadline": "2026-09-15" },
      "feeBenefit": "10% of applicable additional fee",
      "eligibleForms": ["AOC-4", "MGT-7", "ADT-1", "DIR-3 KYC", "INC-20A", "PAS-6", "MSME-1", "BEN-2", "CSR-2", "MR-3"],
      "author": { "name": "Jasmine Kaur Huda", "role": "Assistant General Manager", "expertise": ["MCA Compliance", "Secretarial Audit"] },
      "publishDate": "2026-09-25",
      "lastUpdated": "2026-09-25",
      "pdfs": [
        { "title": "General Circular 04/2026", "url": "https://www.mca.gov.in/bin/ccfs-2026-circular-04-2026.pdf" },
        { "title": "General Circular 01/2026", "url": "https://www.mca.gov.in/bin/ccfs-2026-circular-01-2026.pdf" }
      ],
      "relatedServices": ["roc-annual-compliance", "form-aoc4", "form-mgt7", "dir3-kyc", "form-msme1", "form-ben2", "form-csr2", "form-mr3-secretarial-audit"],
      "relatedBlueprints": ["late-fee-calculator-guide", "mca-adjudication-penalties"],
      "faqSchema": [ { "q": "What is CCFS-2026?", "a": "..." }, ... ]
    }
  ]
}
```

---

### 3.4 Module 3: CCFS-2026 & MSME 43B(h) Specialized Hubs (P0)

#### 3.4.1 CCFS-2026 Dedicated Mini-Site
```
/ccfs-2026/                              → Landing: deadline countdown, eligibility checker, fee calculator
/ccfs-2026/eligibility                   → Interactive questionnaire (company type, pending forms, years overdue)
/ccfs-2026/fee-calculator                → Embedded calculator (from /conversion/calculator.html Module 1)
/ccfs-2026/engage                        → Lead capture → WhatsApp "CCFS-2026 Filing Package"
```

**Data Structure**: `data/ccfs-2026.json` with eligible forms, fee matrix, circular refs, deadline countdown.

#### 3.4.2 MSME 43B(h) Payment Compliance Hub
```
/msme-43bh/                              → Landing: 45-day rule explainer, written contract template
/msme-43bh/payment-tracker               → Client tool: vendor MSME status + payment aging + auto-reminders
/msme-43bh/form-msme1-generator          → Half-yearly return draft (auto-populated from tracker)
/msme-43bh/engage                        → Lead capture → "MSME Compliance Audit"
```

**Integration**: Entity search diagnostic already flags 43B(h) — deep link to this hub.

---

### 3.5 Module 4: Subscription SaaS & Compliance OS (P1)

#### 3.5.1 IndiaFilings Pattern → CCS Adaptation

| IndiaFilings Tier | CCS Equivalent (New) | Price | Includes |
|-------------------|---------------------|-------|----------|
| MCA Compliance | **CCS RoC Compliance OS** | ₹1,999/mo | AOC-4, MGT-7, ADT-1, DIR-3 KYC, calendar alerts, portal access |
| GST Compliance | **CCS GST Compliance OS** | ₹1,499/mo | GSTR-1/3B/9, reconciliation, LEDGERS-lite, notices |
| HR & Payroll | **CCS HR Compliance OS** | ₹2,499/mo | PF/ESI, payroll, attendance, Form 16, TDS on salary |
| **NEW** | **CCS Corporate Secretarial Retainer** | ₹4,999/mo | All above + board minutes, statutory registers, secretarial audit |

#### 3.5.2 Portal Enhancement (`/portal/subscription.html`)
- **Tier comparison matrix** (feature × plan)
- **Usage meters**: Filings used/remaining, days to deadline, compliance health score
- **Auto-renewal + invoice history** (edge function + KV store)
- **Upgrade/downgrade** proration logic

#### 3.5.3 Data Structure: `data/subscription-tiers.json`
```json
{
  "tiers": [
    {
      "id": "roc-compliance",
      "name": "RoC Compliance OS",
      "priceMonthly": 1999,
      "priceAnnual": 19990,
      "verticalId": "V02",
      "features": [
        "AOC-4 XBRL Filing (Annual)",
        "MGT-7/MGT-7A Annual Return",
        "ADT-1 Auditor Appointment",
        "DIR-3 KYC (All Directors)",
        "Compliance Calendar & Alerts",
        "Portal Dashboard Access",
        "Email/WhatsApp Reminders (30/15/7/1 day)",
        "Late Fee Diagnostic (Section 403)"
      ],
      "limits": { "entities": 1, "filingsPerYear": 4, "directorsCovered": 3 }
    }
  ]
}
```

---

### 3.6 Module 5: Banking & Marketplace Partner Desk (P1)

#### 3.6.1 New Routes
```
/partners/banking                        → Partner bank grid (Yes Bank, ICICI, DBS, HDFC, Kotak, Axis)
/partners/banking/{bank-slug}            → Bank-specific: current account, payment gateway, loan products
/partners/payment-gateways               → Razorpay, Cashfree, PayU, Stripe (India) comparison
/partners/professional                   → CA/CS firms, law firms, valuation experts (referral network)
```

#### 3.6.2 Integration Points
- **Post-incorporation flow**: After `/conversion/post-incorporation-checkout.html` → redirect to `/partners/banking`
- **Entity search diagnostic**: "Banking Ready?" badge → deep link to partner desk
- **Subscription tiers**: "Banking Concierge" add-on for ₹999/mo

---

### 3.7 Module 6: Developer & API Portal (P2)

#### 3.7.1 New Routes
```
/developers/                             → API docs hub (like IndiaFilings `/developers`)
/developers/api-reference                → OpenAPI/Swagger UI for CCS APIs
/developers/sandbox                      → Sandbox credentials + test data
/developers/webhooks                     → Webhook registry + retry logic
/developers/sdks                         → NPM/PyPI packages for CCS API client
```

#### 3.7.2 APIs to Expose (Phase 1)
| API | Endpoint | Use Case |
|-----|----------|----------|
| **Entity Search** | `GET /api/v1/entities/search?q={cin|name}` | CIN/LLPIN/TM lookup |
| **Statutory Calculator** | `POST /api/v1/calculate/roc-late-fee` | Fee computation |
| **Compliance Calendar** | `GET /api/v1/compliance/calendar?cin={cin}` | Upcoming due dates |
| **Document Generator** | `POST /api/v1/documents/generate` | SHA, board resolutions, Form drafts |

---

### 3.8 Module 7: Referral & Affiliate Program (P2)

#### 3.8.1 New Routes
```
/referral/                               → Referral dashboard (unique link, earnings, payouts)
/referral/terms                          → Terms & conditions
/referral/leaderboard                    → Top referrers (gamification)
```

#### 3.8.2 Mechanics
- **Referrer reward**: 10% of first service fee (max ₹5,000)
- **Referee benefit**: 5% discount on first service
- **Tracking**: UTM parameters + cookie (30-day attribution)
- **Payout**: Monthly via UPI/bank transfer (KYC verified)

---

### 3.9 Module 8: Customer Stories & Social Proof (P2)

#### 3.9.1 New Routes
```
/stories/                                → Grid of video/written case studies
/stories/{slug}                          → Individual story (Thinai Organics, Chennai Kulfi style)
```

#### 3.9.2 Data Structure: `data/customer-stories.json`
```json
{
  "stories": [
    {
      "slug": "thinai-organics",
      "title": "How Thinai Organics Built a Brand from Home",
      "vertical": "V01",
      "servicesUsed": ["pvt-ltd-registration", "trademark-registration", "gst-annual"],
      "videoUrl": "https://cdn.craftegon.com/stories/thinai-organics.mp4",
      "testimonial": "CCS made incorporation seamless...",
      "metrics": { "timeToIncorporate": "7 days", "trademarkClasses": 2, "gstFiling": "on-time" }
    }
  ]
}
```

---

## 🤖 PART 4: AUTONOMOUS AI CAPABILITIES — SUPERIORITY LAYER

> **Goal**: Make CCS **vastly superior** to IndiaFilings by embedding autonomous AI at every touchpoint.

### 4.1 AI Capability Matrix

| Capability | IndiaFilings | CCS Target | Implementation |
|------------|--------------|------------|----------------|
| **Statutory Chat** | Not visible | ✅ **RAG-lite Chat Widget** (exists) | Extend with 2026 circulars, CCFS-2026, 43B(h) |
| **Entity Risk Diagnostic** | Basic | ✅ **96/100 Scoring** (exists) | Add predictive: "Next 90 days risk forecast" |
| **Document Generation** | Manual | ✅ **AI Document Drafter** (exists) | Add: auto-populate from entity search + calculator outputs |
| **Compliance Calendar** | LEDGERS | 🔄 **Autonomous Scheduler** | Edge cron: daily MCA/GSTN sync → alert → auto-draft filing |
| **GST Reconciliation** | LEDGERS | 🔄 **GSTR-2B Auto-Match** | Client uploads JSON → AI matches → flags blocked ITC |
| **Trademark Watch** | Monitoring service | 🔄 **Autonomous TM Watch** | Daily IP India scrape → similarity scoring → alert |
| **MSME 43B(h) Tracker** | None | 🆕 **Autonomous Payment Monitor** | Vendor MSME status + invoice aging → auto-reminder → Form MSME-1 draft |
| **CCFS-2026 Eligibility** | Article only | 🆕 **Auto-Eligibility Engine** | CIN input → MCA filing history scan → eligible forms list + fee calc |
| **Tax Regime Optimizer** | Consultation | ✅ **Calculator Module 3** (exists) | Add: auto-generate Form 10-IEA + Section 80C optimizer |
| **Cap Table Simulator** | None | ✅ **Calculator Module 4** (exists) | Add: auto-generate PAS-3 + SHA clauses |

---

### 4.2 Autonomous Workflow Triggers (Event-Driven)

```mermaid
graph TD
    A[Daily Cron: MCA Master Data Sync] --> B{Entity in Portfolio?}
    B -->|Yes| C[Check Pending Filings vs Due Dates]
    C --> D{Overdue > 30 days?}
    D -->|Yes| E[Trigger: CCFS-2026 Eligibility Check]
    E --> F[Auto-calculate 10% fee benefit]
    F --> G[Generate WhatsApp Alert to Client + CCS Team]
    G --> H[Auto-draft Form AOC-4/MGT-7/ADT-1]
    H --> I[Queue for Professional Review]
    
    C --> J{DIR-3 KYC Due < 15 days?}
    J -->|Yes| K[Trigger: DIN KYC Reminder + Biometric Guide]
    K --> L[Auto-populate DIR-3 KYC Web Form JSON]
    
    A --> M[Daily Cron: GSTN GSTR-2B Fetch]
    M --> N[AI Match: Purchase Register vs 2B]
    N --> O{Blocked ITC > 5%?}
    O -->|Yes| P[Alert: Section 17(5) Risk + Rule 88B Exposure]
    P --> Q[Auto-draft Reconciliation Reply]
    
    A --> R[Daily Cron: IP India TM Journal]
    R --> S[Similarity Score vs Client Marks]
    S --> T{Score > 85%?}
    T -->|Yes| U[Alert: Opposition Window + Cease & Desist Draft]
```

**Implementation**: Cloudflare Workers Cron Triggers + KV/D1 storage + `assets/js/autonomous-engine.js`

---

### 4.3 Real-Time Data Lookup Architecture

| Lookup Type | Source | Freshness | Cache Strategy | Fallback |
|-------------|--------|-----------|----------------|----------|
| **MCA CIN/LLPIN** | MCA V3 / mca.gov.in | T+1 day | 24h KV cache | Benchmark dataset (BENCHMARK_ENTITIES) |
| **IP India TM** | ipindiaservices.gov.in | T+1 day | 24h KV cache | Benchmark dataset |
| **GSTN GSTIN** | services.gst.gov.in | Real-time | 1h KV cache | Format validation only |
| **CCFS-2026 Eligibility** | Computed (MCA history) | On-demand | 6h cache | Manual checklist |
| **MSME 43B(h) Status** | Udyam API + client data | Real-time | Client-side (localStorage) | Manual entry |
| **DIR-3 KYC Status** | MCA V3 DIN Services | T+1 day | 24h cache | Manual verification |

---

## 📦 PART 5: DATA STRUCTURES & SCHEMA EXTENSIONS

### 5.1 New JSON Files to Create

| File | Purpose | Schema |
|------|---------|--------|
| `data/search-sources.json` | Search directory data sources | Extend `sources.schema.json` |
| `data/learning-articles.json` | Learning center articles | New `learning-article.schema.json` |
| `data/ccfs-2026.json` | CCFS-2026 scheme data | New `ccfs-scheme.schema.json` |
| `data/msme-43bh.json` | 43B(h) rule data + templates | New `msme-payment.schema.json` |
| `data/subscription-tiers.json` | SaaS tier definitions | New `subscription.schema.json` |
| `data/banking-partners.json` | Bank partner catalog | New `partner.schema.json` |
| `data/customer-stories.json` | Case studies | New `story.schema.json` |
| `data/referral-config.json` | Referral program rules | New `referral.schema.json` |

### 5.2 Schema Extensions Required

```json
// data/schemas/learning-article.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["slug", "title", "category", "verticalIds", "publishDate", "statutoryRefs", "author"],
  "properties": {
    "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "title": { "type": "string", "maxLength": 120 },
    "category": { "enum": ["mca", "gst", "income-tax", "fema", "ipr", "labour", "corporate-governance"] },
    "verticalIds": { "type": "array", "items": { "type": "string", "pattern": "^V[0-9]{2}$" } },
    "tags": { "type": "array", "items": { "type": "string" } },
    "statutoryRefs": { "type": "array", "items": { "type": "string" } },
    "keyDates": { "type": "object" },
    "feeBenefit": { "type": "string" },
    "eligibleForms": { "type": "array", "items": { "type": "string" } },
    "author": { "type": "object", "required": ["name", "role"], "properties": { "name": {"type": "string"}, "role": {"type": "string"}, "expertise": {"type": "array", "items": {"type": "string"}} }},
    "publishDate": { "type": "string", "format": "date" },
    "lastUpdated": { "type": "string", "format": "date" },
    "pdfs": { "type": "array", "items": { "type": "object", "required": ["title", "url"], "properties": { "title": {"type": "string"}, "url": {"type": "string", "format": "uri"} }}},
    "relatedServices": { "type": "array", "items": { "type": "string", "pattern": "^[a-z-]+$" } },
    "relatedBlueprints": { "type": "array", "items": { "type": "string", "pattern": "^[a-z-]+$" } },
    "faqSchema": { "type": "array", "items": { "type": "object", "required": ["q", "a"], "properties": { "q": {"type": "string"}, "a": {"type": "string"} }}}
  }
}
```

---

## 🔗 PART 6: ROUTE REGISTRY & MESH INTEGRITY

### 6.1 New Routes Summary (42 Total)

| Category | Count | Routes |
|----------|-------|--------|
| Search Directory | 7 | `/search`, `/search/company`, `/search/trademark`, `/search/gstin`, `/api/v1/search/*` (3) |
| Learning Center | 12 | `/learn`, `/learn/category/*` (7), `/learn/article/*` (4 initial) |
| CCFS-2026 Hub | 4 | `/ccfs-2026`, `/ccfs-2026/eligibility`, `/ccfs-2026/fee-calculator`, `/ccfs-2026/engage` |
| MSME 43B(h) Hub | 4 | `/msme-43bh`, `/msme-43bh/payment-tracker`, `/msme-43bh/form-msme1-generator`, `/msme-43bh/engage` |
| Subscription SaaS | 3 | `/portal/subscription` (enhance), `/portal/billing`, `/portal/usage` |
| Banking Partners | 4 | `/partners/banking`, `/partners/banking/{slug}` (3 banks) |
| Developer Portal | 5 | `/developers`, `/developers/api-reference`, `/developers/sandbox`, `/developers/webhooks`, `/developers/sdks` |
| Referral Program | 3 | `/referral`, `/referral/terms`, `/referral/leaderboard` |
| Customer Stories | 2 | `/stories`, `/stories/{slug}` |

### 6.2 Registration Checklist (Per Route)
- [ ] Add to `data/search-index.json` (title, description, vertical, tags, canonical)
- [ ] Add to `data/service-registry.json` (if service) or `data/verticals.json` (if hub)
- [ ] Add to `sitemap.xml` with `<lastmod>2026-10-21</lastmod>`
- [ ] Add `_redirects` rule if legacy path exists
- [ ] Update `components/navbar.html` mega-menu (if top-level)
- [ ] Update `components/footer.html` (if footer link)
- [ ] Verify `npm run test:links` passes
- [ ] Verify `npm run test:orphans` passes
- [ ] Verify `npm run test:seo` passes (title, desc, canonical, schema, OG)

---

## 📅 PART 7: IMPLEMENTATION SEQUENCE (ROUND 2+)

### Round 2: Search Directory & Learning Center Foundation (Week 1-2)
1. Create `/search` hub with 3-tab UI + registration cross-sell
2. Implement edge functions for MCA/IP India/GSTN lookups (cached)
3. Build `/learn` hub with category grid + article template
4. Migrate 4 IndiaFilings articles (AOC-4, DIR-3 KYC, CCFS-2026, GST e-invoicing)
5. Create `data/learning-articles.json` + schema
6. **Verify**: All tests pass, 0 orphans, 0 broken links

### Round 3: 2026 Statutory Hubs & Calculators (Week 2-3)
1. Build `/ccfs-2026` mini-site with eligibility checker + fee calculator
2. Build `/msme-43bh` hub with payment tracker + Form MSME-1 generator
3. Enhance `/conversion/calculator.html` Module 1 with CCFS-2026 mode
4. Embed calculator widgets in learning articles
5. **Verify**: Calculator accuracy vs statutory rules, mesh integrity

### Round 4: Subscription SaaS & Portal Enhancement (Week 3-4)
1. Enhance `/portal/subscription.html` with tier matrix + usage meters
2. Implement edge functions for subscription state (KV/D1)
3. Add billing portal (`/portal/billing`) + usage dashboard (`/portal/usage`)
4. Connect subscription to entity search diagnostic ("Onboard to Compliance OS")
5. **Verify**: Payment flow (Razorpay test), webhook handling, portal auth

### Round 5: Banking Partners & Marketplace (Week 4-5)
1. Create `/partners/banking` with 6 bank profiles
2. Integrate with post-incorporation checkout flow
3. Add "Banking Ready" badge to entity search results
4. **Verify**: Partner links valid, UTM tracking, no broken links

### Round 6: Developer Portal & API Exposure (Week 5-6)
1. Build `/developers` with OpenAPI/Swagger UI
2. Expose 4 APIs via Cloudflare Workers
3. Create sandbox environment with test credentials
4. Publish SDK stubs (npm `@craftegon/ccs-api`)
5. **Verify**: API rate limiting, auth, schema validation

### Round 7: Autonomous AI & Workflow Triggers (Week 6-8)
1. Deploy `assets/js/autonomous-engine.js` with cron triggers
2. Implement daily MCA/GSTN/IP India sync jobs
3. Build predictive risk forecast (90-day horizon)
4. Add autonomous document generation from calculator outputs
5. **Verify**: End-to-end workflow (cron → alert → draft → review queue)

### Round 8: Referral, Stories & Polish (Week 8-9)
1. Launch referral program with tracking
2. Publish 3 customer story videos
3. Accessibility audit (WCAG 2.1 AA)
4. Performance audit (Core Web Vitals < 2.5s LCP)
5. **Final Verify**: `npm test` 100% pass, 0 orphans, 0 broken links, 100% SEO

---

## 🛡 PART 8: RISK MITIGATION & REGRESSION GUARDS

| Risk | Mitigation |
|------|------------|
| **Broken links from new routes** | Automated `verify-links.js` runs on every PR; fail CI on any 404 |
| **Orphan pages** | `check-orphans.js` crawls navbar, footer, sitemap, content links |
| **Schema drift** | JSON Schema validation in `scripts/validate-schemas.js` (add to `npm test`) |
| **Calculator regression** | `test-calculator.js` with 50+ test cases per module |
| **Search API failure** | Graceful degradation: benchmark dataset + "manual lookup" guidance |
| **Circular PDFs 404** | Host PDFs on `cdn.craftegon.com` (R2 bucket) with immutable URLs |
| **IndiaFilings pattern copyright** | **Transform, don't copy**: Use REA patterns, not code/content. All statutory data is public domain. |
| **Canonical domain mismatch** | All new routes use `https://ccs.craftegon.com`; gated per README |

---

## ✅ PART 9: APPROVAL GATES FOR ROUND 2

**Round 2 may ONLY begin after:**

1. [ ] **Stakeholder Review**: This `MERGE_BLUEPRINT.md` approved by Product + Legal + Engineering leads
2. [ ] **Schema Review**: New `data/schemas/*.schema.json` files validated against existing data
3. [ ] **Resource Allocation**: Cloudflare Workers KV/D1 quotas confirmed for search APIs + cron triggers
4. [ ] **Content Legal Clearance**: CCFS-2026, MSME 43B(h) content verified against bare acts + circulars
5. [ ] **Brand Alignment**: UI patterns adapted to CCS Ivory/Gold/Silver/Charcoal tokens (not IndiaFilings blue)

---

## 📎 APPENDICES

### Appendix A: IndiaFilings URL Inventory (Captured 2026-10-21)

```
https://www.indiafilings.com/                           → Home
https://www.indiafilings.com/startup                    → Entity formation
https://www.indiafilings.com/registrations              → Licenses & registrations
https://www.indiafilings.com/trademark                  → TM search & filing
https://www.indiafilings.com/gst                        → GST compliance
https://www.indiafilings.com/income-tax                 → ITR & tax planning
https://www.indiafilings.com/mca-services               → RoC annual filings
https://www.indiafilings.com/hr-services                → Payroll & HR compliance
https://www.indiafilings.com/consultation               → Expert booking
https://www.indiafilings.com/uae                        → UAE formation (Filings.AE)
https://www.indiafilings.com/referral                   → Affiliate program
https://www.indiafilings.com/search                     → Business search (Company/TM/GSTIN)
https://www.indiafilings.com/learn                      → Learning center hub
https://www.indiafilings.com/learn/aoc-4                → AOC-4 guide (2026-08-11)
https://www.indiafilings.com/learn/dir-3-ekyc           → DIR-3 KYC guide (2026-08-11)
https://www.indiafilings.com/company-annual-filing/ccfs-2026-extended  → CCFS-2026 (2026-09-25)
https://www.indiafilings.com/company-annual-filing/ccfs-2026-ends-on-31st-august-2026
https://www.indiafilings.com/company-annual-filing/ccfs-due-date-extended
https://www.indiafilings.com/ccfs-scheme-company-compliance/fees
https://www.indiafilings.com/ccfs-scheme-company-compliance/pricing
https://www.indiafilings.com/developers                 → LEDGERS API docs
https://ledgers.readme.io/llms.txt                      → API spec for LLMs
https://in-api.ledgers.cloud                            → Production API
https://in-api-uat.ledgers.cloud                        → Sandbox API
```

### Appendix B: CCS Route Inventory (Current 113 Routes)

*See `docs/phase-1-route-register.csv` for full registry. Key segments:*
- `/` (index.html)
- `/verticals/*` (15 vertical hubs)
- `/services/*` (57 service pages)
- `/conversion/*` (19 tools/funnels)
- `/knowledge/*` (11 blueprints + index)
- `/portal/*` (3 portal pages)
- `/legal/*` (5 policies)

### Appendix C: Statutory Reference Matrix (2026)

| Statute | Section/Rule | CCS Coverage | IndiaFilings Coverage | Action |
|---------|--------------|--------------|----------------------|--------|
| Companies Act 2013 | Sec 403 (Late fees) | ✅ Calculator + Blueprint | ✅ Article + Fee table | Enhance: CCFS-2026 mode |
| Companies Act 2013 | Sec 164(2) (DIN DQ) | ✅ Blueprint | ✅ Article | Sync: 2026 rules |
| Companies Act 2013 | Sec 90 (SBO/BEN-2) | ✅ Blueprint | ⚠️ Partial | Add: BEN-2 learning article |
| Companies Act 2013 | Sec 441 (Compounding) | ✅ Blueprint | ❌ | **CCS Advantage** |
| MSME Act | Sec 43B(h) (45-day) | ✅ Entity search flag | ✅ Referenced | **Build: Dedicated hub** |
| MCA Circulars 2026 | CCFS-2026 (01/2026, 04/2026) | ❌ | ✅ 3 articles | **URGENT: Build hub** |
| GST Act 2017 | Rule 48(4) (E-invoice) | ✅ Blueprint | ✅ Article | Sync: 30-day mandate |
| GST Act 2017 | Rule 88C/88D (Scrutiny) | ✅ Blueprint | ⚠️ | Enhance: Auto-notice reply |
| DPDP Act 2023 | Rules 2025 (Draft) | ✅ Service + Blueprint | ❌ | **CCS Advantage** |
| FEMA 1999 | FLA Return (July 15) | ✅ Blueprint | ⚠️ Partial | Add: FLA learning article |

---

**END OF MERGE_BLUEPRINT.md**  
*Ready for stakeholder review. Round 2 implementation begins upon approval.*