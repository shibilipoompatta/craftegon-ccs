# TASK-CCS-UX-009: Prioritised Website Transformation Roadmap

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Auditor:** Principal Software Architect & Delivery Lead  
**Date:** November 8, 2026

---

## 1. Roadmap Architecture & Execution Philosophy

This roadmap organizes the complete website transformation into **ten logical, risk-managed phases**. Each phase is self-contained, backed by concrete acceptance criteria, and bounded by automated regression verification.

In strict compliance with project rules:
- **No implementation is executed in this task.**
- Each phase requires formal business owner authorization before execution begins.
- No artificial delivery dates or speculative budgets are assumed.

---

## 2. Ten-Phase Transformation Roadmap

### Phase 1: Non-Public Suite Exclusion & Security Hardening
- **Objective:** Physically excise `/portal/` (4 files) and `/admin/` (2 files) from the public web root in accordance with Owner Decisions 4.4 and 4.5.
- **Affected Components:** `portal/`, `admin/`, `assets/css/portal.css`, `_redirects`, `robots.txt`, `package.json`.
- **Dependencies:** Create `feature/portal-admin-suite` private branch to preserve code.
- **Risks:** Breaking automated test scripts that previously asserted portal/admin existence.
- **Effort Category:** **Low.**
- **Acceptance Criteria:** `ccs.craftegon.com/portal/` and `ccs.craftegon.com/admin/` return HTTP 404; `npm test` passes 100%.
- **Required Owner Sign-off:** Sign-off on branch preservation.

### Phase 2: Homepage Content Rationalisation & Redesign
- **Objective:** Transform `index.html` from an overloaded 72KB/10-section page into a focused, high-conversion 8-section front door (<2,500px on mobile).
- **Affected Components:** `index.html`, `assets/css/home-unique.css`.
- **Dependencies:** Phase 1 complete; approved copy from Report 04.
- **Risks:** Disrupting inbound SEO traffic to homepage.
- **Effort Category:** **Medium.**
- **Acceptance Criteria:** Homepage scroll height reduced by ≥70% on mobile; back-to-back service card duplication eliminated; all CTAs point to `/services/` or approved contact channels.

### Phase 3: Information Architecture & Navigation Realignment
- **Objective:** Deploy dedicated standalone `/contact.html` route, streamline desktop mega-menus, and synchronize header/footer templates across all pages.
- **Affected Components:** `contact.html`, `components/navbar.html`, `components/footer.html`, `assets/js/navigation.js`.
- **Dependencies:** Phase 2 complete.
- **Risks:** Broken anchor links targeting `/index.html#contact`.
- **Effort Category:** **Medium.**
- **Acceptance Criteria:** Standalone `/contact.html` live; all navigation menus link cleanly; zero broken links.

### Phase 4: Explore Services & Search Experience Modernization
- **Objective:** Eliminate mobile content obscuration by replacing the bulky sticky filter toolbar with a compact 48px control strip and mobile off-canvas filter drawer.
- **Affected Components:** `services/index.html`, `services.html`, `assets/css/navbar.css`, `assets/js/service-search.js`.
- **Dependencies:** Phase 3 complete.
- **Risks:** Mobile JavaScript event handling in off-canvas drawer.
- **Effort Category:** **Medium.**
- **Acceptance Criteria:** Zero service card clipping on mobile; search operates in <15ms; 75 search tests pass.

### Phase 5: Individual Service Detail Page Standardization
- **Objective:** Migrate all 57 service pages to the standardized, high-conversion template specified in Report 08.
- **Affected Components:** 57 files in `services/*.html`, `assets/css/service-page.css`.
- **Dependencies:** Phase 4 complete.
- **Risks:** Regression in canonical SEO tags or structured data.
- **Effort Category:** **High (Scope Volume).**
- **Acceptance Criteria:** All 57 pages share identical 12-section layout, responsive tables, clear delivery badges, and zero old navy styling.

### Phase 6: Knowledge Centre & Diagnostic Tools Polish
- **Objective:** Add contextual "Statutory Service Companion" callout boxes across all 12 guides and enhance calculator print summaries.
- **Affected Components:** 12 files in `knowledge/*.html`, `conversion/calculator.html`, `conversion/trademark-search.html`.
- **Dependencies:** Phase 5 complete.
- **Risks:** None. Pure additive content refinement.
- **Effort Category:** **Low-Medium.**
- **Acceptance Criteria:** Educational guides link cleanly to service pages; tools maintain zero data collection.

### Phase 7: Mobile Responsiveness, Touch Targets & Accessibility Hardening
- **Objective:** Audit all 123 pages across 10 viewports; enforce 16px minimum form font size; ensure 44×44px touch targets.
- **Affected Components:** Global CSS (`theme.css`, `responsive.css`).
- **Dependencies:** Phases 2–6 complete.
- **Risks:** Visual spacing adjustments on small screens.
- **Effort Category:** **Medium.**
- **Acceptance Criteria:** 100% automated WCAG 2.2 AA pass; zero horizontal blowout across 320px–1920px.

### Phase 8: Technical SEO, Schema Consolidation & AEO Definitions
- **Objective:** Consolidate `services.html` into `services/index.html` via 301 redirect; add definition-first AEO copy across top 20 services.
- **Affected Components:** `_redirects`, `sitemap.xml`, `data/*.json`.
- **Dependencies:** Phase 7 complete.
- **Risks:** 301 redirect mapping errors.
- **Effort Category:** **Low.**
- **Acceptance Criteria:** Google Rich Snippet test validates 100% of JSON-LD schemas; zero invalid canonical origins.

### Phase 9: Comprehensive Automated Regression & Security Validation
- **Objective:** Run exhaustive automated test harness (`npm run test:all`), verify XSS escaping, link mesh, and offline form fallbacks.
- **Affected Components:** All test scripts in `scripts/`.
- **Dependencies:** Phases 1–8 complete.
- **Risks:** Discovery of edge-case link regressions.
- **Effort Category:** **Low-Medium.**
- **Acceptance Criteria:** 13/13 test suites pass with 0 failures, 0 warnings.

### Phase 10: Production Release Preparation & Cloudflare Hardening
- **Objective:** Configure Cloudflare `_headers` (CSP, HSTS), verify DNS cutover, and establish instant one-click rollback procedures.
- **Affected Components:** Cloudflare Pages Dashboard, `_headers`.
- **Dependencies:** Written business owner sign-off on Decisions 1–5.
- **Risks:** DNS propagation delays.
- **Effort Category:** **Low.**
- **Acceptance Criteria:** Production live at `https://ccs.craftegon.com/`; HTTP 200 on all canonical routes; rollback verified.
