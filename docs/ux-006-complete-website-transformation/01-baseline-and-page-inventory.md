# 01. BASELINE AND PAGE INVENTORY

**Project:** CraftEgon Corporate Services (CCS)  
**Date:** November 2026  
**Inventory Scope:** Comprehensive repository census of all HTML, CSS, JavaScript, and JSON assets in `craftegon-ccs-clean`.

---

## 1. Inventory Summary

The website consists of **123 HTML files** organized into 10 directory archetypes, supported by 8 modular CSS stylesheets, 8 primary client-side JavaScript controllers, and structured JSON schemas/catalogs.

| Archetype / Directory | File Count | Primary Function |
| :--- | :---: | :--- |
| **Root (Core Institutional)** | 4 | Homepage (`index.html`), About (`about.html`), Directory (`services.html`), `404.html` |
| **Practice Verticals (`verticals/`)** | 15 | Practice area category hub pages (Formation, RoC, Tax, FEMA, etc.) |
| **Service Detail Pages (`services/`)** | 58 | 57 statutory service records + `services/index.html` directory index |
| **Conversion & Diagnostic Tools (`conversion/`)** | 20 | Multi-step calculators, checkers, contract generators, intakes |
| **Knowledge Centre (`knowledge/`)** | 12 | Educational compliance blueprints, MCA guides, regulatory advisories |
| **Client Portal (`portal/`)** | 4 | `dashboard.html`, `index.html`, `subscription.html`, `entity-search.html` |
| **Executive Admin Console (`admin/`)** | 2 | Internal operations console (`index.html`) and authentication (`login.html`) |
| **Legal & Policies (`legal/`)** | 5 | Terms, Privacy, Refund, Disclaimer, Confidentiality |
| **Components (`components/`)** | 2 | Reusable partials: `navbar.html`, `footer.html` |
| **Directory Search (`search/`)** | 1 | Entity & IPR search interface (`search/index.html`) |
| **Total HTML Inventory** | **123** | **100% accounted for and verified** |

---

## 2. Directory Breakdown & File Census

### A. Root Directory (4 files)
1. `index.html` — Primary institutional homepage
2. `about.html` — Institutional background, operating model, physical office
3. `services.html` — Master service directory and discovery interface
4. `404.html` — Standardized error and fallback routing page

### B. Practice Verticals (15 files in `verticals/`)
1. `verticals/01-entity-formation.html` — Entity Formation & Structuring
2. `verticals/02-roc-compliance.html` — RoC Secretarial & Annual Filings
3. `verticals/03-tax-compliance.html` — Corporate Tax & GST Compliance
4. `verticals/04-statutory-licenses.html` — Statutory Licenses & Registrations
5. `verticals/05-contracts-legal.html` — Commercial Contracts & Drafting
6. `verticals/06-ipr-protection.html` — Intellectual Property Rights & Trademarks
7. `verticals/07-labour-hr.html` — Labour Law, HR Compliance & POSH
8. `verticals/08-real-estate.html` — Real Estate & Infrastructure Advisory
9. `verticals/09-ma-restructuring.html` — Mergers, Acquisitions & Restructuring
10. `verticals/10-litigation-dispute.html` — Dispute Avoidance & Non-Litigation
11. `verticals/11-corporate-governance.html` — Corporate Governance & Secretarial Audit
12. `verticals/12-esg-csr.html` — ESG, CSR & Tech Law / DPDP Advisory
13. `verticals/13-cross-border-fema.html` — Cross-Border Investment & FEMA
14. `verticals/14-fintech-banking.html` — Fintech, Banking & NBFC Advisory
15. `verticals/15-white-collar-defense.html` — Economic Offenses & White-Collar Defense

### C. Service Detail Pages (58 files in `services/`)
- 57 individual statutory service detail pages covering Pvt Ltd registration, LLP formation, Section 8, OPC, Form AOC-4, MGT-7, DIR-3 KYC, DPT-3, PAS-6, STK-2, GSTR-9, GST LUT, Trademark TM-A, RBI FLA, DPDP audit, and more.
- 1 directory index page: `services/index.html`.

### D. Conversion & Diagnostic Tools (20 files in `conversion/`)
- Calculators & Checkers: `calculator.html`, `strike-off-checker.html`, `trademark-search.html`, `retainer-desk.html`, `post-incorporation-checkout.html`, `contract-intake.html`, `tax-intake.html`, `fema-consultation.html`, `dispute-consultation.html`, `dpdp-audit-request.html`, `csr-audit-form.html`, `license-qualification.html`, `secretarial-audit-scope.html`, `venture-deal-booking.html`, `hr-audit.html`, `ma-advisory-enquiry.html`, `partner-ecosystems.html`, `ai-document-generator.html`, `index.html`, `post-incorporation-success.html`.

### E. Knowledge Centre (12 files in `knowledge/`)
- Educational blueprints and regulatory guides: `index.html`, `spice-plus-mca-v3-blueprint.html`, `mca-v3-filing-guide.html`, `late-fee-calculator-guide.html`, `gst-einvoicing-compliance-mandate.html`, `rbi-fla-return-blueprint.html`, `trademark-objection-hearing-playbook.html`, `transfer-pricing-guide.html`, `posh-act-compliance-framework.html`, `csr-amendment-rules-audit.html`, `fdi-pricing-guidelines-fem20r.html`, `dpdp-compliance-handbook.html`.

### F. Client Portal (4 files in `portal/`)
- `portal/dashboard.html` — Interactive Compliance Calendar OS
- `portal/index.html` — Client Portal institutional gateway
- `portal/subscription.html` — Retainer plans and subscription tiers
- `portal/entity-search.html` — CIN, LLPIN, and Trademark statutory lookup

### G. Executive Admin Console (2 files in `admin/`)
- `admin/index.html` — Administrative management dashboard
- `admin/login.html` — Administrator authentication interface

### H. Legal & Compliance Policies (5 files in `legal/`)
- `legal/terms.html` — Master Terms and Conditions
- `legal/privacy.html` — Privacy Policy (DPDP Act 2023 aligned)
- `legal/refund.html` — Refund and Cancellation Policy
- `legal/disclaimer.html` — Professional Advocates Act 1961 Statutory Disclaimer
- `legal/confidentiality.html` — Confidentiality and Non-Disclosure Standard

### I. Shared Components & Search (3 files)
- `components/navbar.html` — Global responsive navigation bar and mega-menu
- `components/footer.html` — Institutional footer with statutory disclosures
- `search/index.html` — Entity & Trademark search directory

---

## 3. Stylesheet & Asset Architecture

| File | Purpose | Lines | Transformation Status |
| :--- | :--- | :---: | :--- |
| `assets/css/tokens.css` | Master design tokens, palette variables, typography | 146 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/theme.css` | Global resets, typography, buttons, cards, notices | 664 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/navbar.css` | Header, mega-menu, mobile drawer, search input | 1360 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/home-unique.css` | Homepage hero, stats, sections, CTA strips | 1270 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/service-page.css`| Service heroes, pricing tables, statutory grids | 244 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/portal.css` | Portal dashboard, calendar, countdowns, badges | 983 | **Updated to Mint/Sky Blue & Deep Teal** |
| `assets/css/chat-widget.css` | Floating AI Counsel widget, bubbles, action cards | 532 | **Updated to Mint/Sky Blue & Deep Teal** |
| `admin/admin.css` | Admin console dark/light theme and case cards | 430 | **Maintained with demo alerts** |

---

## 4. Verification Checkpoint

All 123 HTML files are accounted for and tracked. No files were deleted, moved, or restructured.
