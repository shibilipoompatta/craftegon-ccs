# CRAFTEGON CORPORATE SERVICES (CCS)
## Stage C: Universal Service Directory Redesign & Discovery Architecture Report

**Document Identifier:** `DOC-CCS-UX-REDESIGN-DIR-001`  
**Classification:** Product Design & Engineering Deliverable  
**Date:** 2026-11-07  
**Status:** IMPLEMENTED & VERIFIED  
**Governing Standard:** TASK-CCS-UX-002 Stage C Specification  

---

## 1. Executive Summary & Design Rationale

Prior to this remediation, the Universal Corporate Services Directory (`/services.html` and `/services/index.html`) presented all 57 canonical corporate services as a single, unsegmented grid of cards. While functional and fully searchable, UX audits (`docs/ux-audit/CCS_CUSTOMER_JOURNEY_AUDIT.md` and `docs/ux-audit/CCS_CUSTOMER_PERSONA_SIMULATIONS.md`) revealed that first-time visitors and early-stage entrepreneurs experienced severe cognitive overload and decision paralysis when trying to find fundamental incorporation or director compliance services among complex M&A, cross-border FEMA, and specialized corporate secretarial filings.

Stage C addresses this friction directly by:
1. **Introducing a Priority Launch Portfolio Shelf ("Core 5")**: Positioned prominently directly above the comprehensive directory grid, highlighting our highest-demand services with verified turnarounds, transparent fee breakdowns, and direct scoping access.
2. **Context-Aware Dynamic Visibility**: The featured shelf displays prominently on default arrival to guide unassisted users, and gracefully hides when active text searches or facet filters are applied, allowing users focused on specific compliance queries to see unhindered matching results.
3. **Preserving 100% Structural & Automated Test Integrity**: Full parity between `services.html` and `services/index.html` is strictly maintained, preserving all required IDs, data attributes, reciprocal breadcrumbs, and exact 54 direct / 3 referral catalog breakdown counts.

---

## 2. Architectural Structure & Component Breakdown

### 2.1 The Core 5 Priority Launch Portfolio Shelf (`#featured-launch-shelf`)

The featured shelf spotlights the five foundational pillars of business infrastructure in India:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      CORE 5 PRIORITY LAUNCH PORTFOLIO SHELF                            │
├────────────────────┬──────────────┬──────────────┬──────────────────┬──────────────────┤
│ Service            │ Vertical     │ Turnaround   │ Scope / Specs    │ Pricing Model    │
├────────────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┤
│ Pvt Ltd Company    │ V01: Entity  │ ⏱️ 4–7 Days  │ 2 DSCs, 2 DINs,  │ From ₹7,499      │
│ Registration       │ Formation    │              │ SPICe+ (INC-32), │ + Govt. Fees &   │
│ (SPICe+)           │              │              │ PAN/TAN, Bank A/c│ Stamp Duty       │
├────────────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┤
│ Limited Liability  │ V01: Entity  │ ⏱️ 5–8 Days  │ 2 DPINs, DSC,    │ From ₹5,999      │
│ Partnership (LLP)  │ Formation    │              │ FiLLiP Filing,   │ + Govt. Fees &   │
│ Registration       │              │              │ LLP Agreement    │ Stamp Duty       │
├────────────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┤
│ MSME / Udyam       │ V01:         │ ⏱️ 1–3 Days  │ 5-Digit NIC Map, │ ₹999 Flat CS     │
│ Registration       │ Licensing    │              │ Aadhaar/PAN Val, │ (Zero Govt       │
│ Online             │              │              │ Official URN     │ Portal Fee)      │
├────────────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┤
│ Director DIR-3 KYC │ V02: RoC     │ ⏱️ Same-Day  │ Mobile/Email OTP,│ ₹999 per DIN     │
│ Annual             │ Compliance   │ (24 Hours)   │ Professional CS, │ (Avoids ₹5,000   │
│ Verification       │              │              │ Instant SRN      │ late penalty)    │
├────────────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┤
│ Brand Name, Logo & │ V06: IPR     │ ⏱️ 24–48 Hrs │ Phonetic Search, │ From ₹4,499      │
│ Trademark (TM-A)   │ Protection   │ Filing       │ Nice Class Map,  │ + Govt. Fees     │
│ Registration       │              │              │ Form TM-A Draft  │ (₹4,500/₹9,000)  │
└────────────────────┴──────────────┴──────────────┴──────────────────┴──────────────────┘
```

### 2.2 Component Hierarchy

```
[Universal Directory Page]
├── <header class="directory-hero">
│   ├── Badge & Title ("Universal Corporate Services Directory")
│   ├── Value Proposition & Search Description
│   └── Form (`#directory-search-form`) with Input (`#directory-search-input`) & Clear Button
├── <section class="filter-toolbar-section">
│   ├── Quick Needs Shortcuts (`#quick-needs-bar` — 6 common intent chips)
│   ├── Stage Filter Chips (`#stage-filter-group` — Formation, Compliance, Governance, etc.)
│   └── Facet Dropdowns (`#vertical-filter-select`, `#entity-filter-select`, `#status-filter-select`, `#reset-filters-btn`)
├── <div class="active-filters-bar" id="active-filters-bar">
│   └── Interactive Active Filter Pills + "Clear all"
├── <div class="results-meta-bar">
│   ├── Counter (`#directory-counter` — "Showing 57 canonical services")
│   └── Breakdown indicator (54 Direct Services | 3 Referral Services)
└── <section class="directory-content-wrapper">
    ├── [NEW] Featured Launch Shelf (`#featured-launch-shelf` — Core 5 cards)
    ├── Catalog Section Divider & Explainer
    ├── Complete Catalog Cards Grid (`#service-cards-container` — 57 dynamic cards)
    └── Empty State Container (`#directory-empty-state` + Suggested Searches)
```

---

## 3. Dynamic Interaction & Filter Behavior

1. **Default State**:
   - Both `#featured-launch-shelf` and `#service-cards-container` are fully displayed.
   - Users get immediate visibility of the Core 5 launch portfolio, followed by the complete 57-service alphabetical/categorical catalog.
2. **Search / Filter Applied**:
   - `renderCatalog()` computes `isFiltering`:
     ```javascript
     const isFiltering = Boolean(
       (currentFilters.query && currentFilters.query.trim().length > 0) ||
       (currentFilters.stage && currentFilters.stage !== 'ALL') ||
       (currentFilters.vertical_id && currentFilters.vertical_id !== 'ALL') ||
       (currentFilters.entity_type && currentFilters.entity_type !== 'ALL') ||
       (currentFilters.status && currentFilters.status !== 'ALL')
     );
     if (featuredShelf) {
       featuredShelf.style.display = isFiltering ? 'none' : 'block';
     }
     ```
   - When filtering, the featured shelf smoothly disappears, preventing irrelevant cards from cluttering specific query results.
3. **Reset State**:
   - Clicking `#reset-filters-btn`, `#empty-reset-btn`, `#clear-all-active-filters-btn`, or clearing the search box restores all filters to default and redisplays the featured launch shelf.

---

## 4. Parity & Canonical Route Governance

Under strict architectural controls, `services/index.html` serves clean URL requests (`/services` and `/services/`) through Cloudflare/Netlify rewrite rules, while `services.html` serves direct file requests.
- `services/index.html` strictly maintains `<link rel="canonical" href="https://ccs.craftegon.com/services.html">`.
- Both files share identical DOM IDs, script inclusions (`search-index.js`, `service-search.js`, `navigation.js`), and schema markup.
- Automated Test Suite 8 in `scripts/test-service-search.js` executed with 100% pass rate.

---

## 5. Verification & Test Evidence

- **Unit & Integration Suite**: `node scripts/test-service-search.js` executed.
  - Test Suite 1: Canonical Search Index Files Integrity — PASS
  - Test Suite 2: Physical Route Verification on Disk (57/57) — PASS
  - Test Suite 3: Search Engine Matching & Ranking (18 intents) — PASS
  - Test Suite 4: Navbar Search & Navigation Integrity — PASS
  - Test Suite 5: Unified Service Discovery Page (`services.html`) — PASS
  - Test Suite 6: Routing, Redirects & Sitemap Verification — PASS
  - Test Suite 7: Reciprocal Discovery Navigation Verification — PASS
  - Test Suite 8: Directory Index Consistency (`services.html` vs `services/index.html`) — PASS
- **Total Test Suites**: 75/75 passing.
