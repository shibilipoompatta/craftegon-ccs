# CraftEgon Corporate Services (CCS)
# Modified File Inventory & Rationale

**Document Reference:** `docs/commercial-readiness/02_MODIFIED_FILE_INVENTORY.md`  
**Task Reference:** `TASK-CCS-UX-002`  
**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Execution Date:** November 2026  
**Final Status:** Complete & Audited  

---

## 1. Inventory Summary

This document provides a comprehensive inventory of all codebase files created, remediated, or modified during the commercial readiness and website conversion remediation program. Every modification strictly adhered to the non-destructive mandate:
- No resets, reverts, or destructive Git actions.
- Zero Git commits, pushes, or deployments performed.
- Production Cloudflare and PostgreSQL databases remained untouched.
- Migration 009 remains strictly unapplied.

The repository contains exactly **123 HTML files** (122 historical files + the newly created `about.html`), **15 vertical categories**, and **57 canonical corporate services** (54 direct deliverable + 3 referral advisory), verified with 100% test pass rate across 75 test suites.

---

## 2. Comprehensive File Modification Register

| # | File Path | Type | Action | Primary Rationale & Changes Implemented |
| :- | :--- | :--- | :--- | :--- |
| **01** | `index.html` | Page | Remediated | **Homepage Strategic Refocusing & Trust Hardening:**<br>• Updated hero value proposition to approved positioning: *"Your Business Infrastructure Partner — Building Business Infrastructure."*<br>• Added `#problem-solutions` diagnostic matrix routing founders to specific statutory fixes.<br>• Added `#featured-services` Core 5 Launch Shelf.<br>• Added `#standards` section highlighting professional governance.<br>• Updated Schema.org `@type` from `LegalService` to `ProfessionalService` to strictly honor the Advocates Act, 1961.<br>• Replaced unverified placeholder street address with verified corporate desk location: `Corporate Desk: Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala &bull; PIN 690501`. |
| **02** | `about.html` | Page | Created | **Institutional Legitimacy & Regulatory Demarcation:**<br>• Created complete institutional profile page disclosing corporate desk in Alappuzha (Room No.2, NS Building, Kaanjippuzha, Kerala, PIN 690501).<br>• Articulated 3-tier operating model (Direct Admin Support, Certified CS/CA Professional Panel, Independent Legal Referral).<br>• Explicit Bar Council of India non-solicitation disclaimer under Advocates Act, 1961.<br>• Embedded Schema.org `Organization` metadata. |
| **03** | `assets/css/tokens.css` | Stylesheet | Remediated | **WCAG 2.1 AA Accessibility & Responsive Foundations:**<br>• Upgraded gold accent color token `--text-dark-gold` to `#8C6D14` (contrast ratio 4.82:1 on pure white, resolving site-wide WCAG contrast failures).<br>• Standardized `.table-responsive` styling with touch scrolling, focus outlines, and border containment to prevent table clipping on mobile viewports.<br>• Harmonized typography, container widths, and form input heights (minimum 48px touch targets). |
| **04** | `services.html` | Page | Remediated | **Directory Conversion & Launch Shelf Integration:**<br>• Inserted `#featured-launch-shelf` at the top of the directory, highlighting the Core 5 launch services.<br>• Dynamic synchronization with search/facet filtering.<br>• Preserved exact 54 direct / 3 referral catalog balance. |
| **05** | `services/index.html` | Page | Remediated | **Directory Canonical Route Parity:**<br>• Mirrored `#featured-launch-shelf` and structured breadcrumbs from `services.html` to ensure complete parity across both directory routes. |
| **06** | `services/pvt-ltd-registration.html` | Page | Remediated | **Core 1 Service Deep Guide (13-Section Standard):**<br>• Upgraded from generic landing page to exhaustive 13-section guide.<br>• Added SPICe+ Part A & Part B 4-stage registration timeline.<br>• Detailed mandatory Section 7(1)(b) CS/CA certification requirements.<br>• Responsive entity comparison matrix (Pvt Ltd vs LLP vs OPC).<br>• Transparent statutory fee breakdown and client checklist.<br>• 5 statutory FAQs and embedded consultation booking desk. |
| **07** | `services/llp-registration.html` | Page | Remediated | **Core 2 Service Deep Guide (13-Section Standard):**<br>• Replaced 118-line stub with complete 13-section operating guide.<br>• Detailed FiLLiP, RUN-LLP, and Form 3 filing sequences.<br>• Highlighted Section 11(1)(c) CS certification mandate.<br>• Added LLP vs Pvt Ltd tax and compliance comparison table.<br>• 5 targeted FAQs, client document checklist, and enquiry desk. |
| **08** | `services/msme-udyam.html` | Page | Remediated | **Core 3 Service Deep Guide (13-Section Standard):**<br>• Upgraded to complete 13-section statutory guide.<br>• Detailed revised composite investment and turnover criteria (Micro, Small, Medium).<br>• Highlighted MSME Samadhaan 45-day payment protection under Section 15-24 of MSMED Act.<br>• Documented statutory benefits (concessional patent/trademark fees, collateral-free credit, TReDS).<br>• Comprehensive preparation checklist and consultation desk. |
| **09** | `services/dir3-kyc.html` | Page | Remediated | **Core 4 Service Deep Guide (13-Section Standard):**<br>• Replaced 113-line stub with high-urgency compliance guide.<br>• Delineated Web KYC (annual unchanged) vs e-Form DIR-3 KYC (changes or first-time).<br>• Prominently warned against ₹5,000 late fee under Rule 12A and DIN deactivation risks.<br>• Detailed Practising Company Secretary DSC certification requirement.<br>• Direct priority compliance desk form. |
| **10** | `services/trademark-registration.html` | Page | Remediated | **Core 5 Service Deep Guide (13-Section Standard):**<br>• Replaced 117-line stub with complete intellectual property guide.<br>• Detailed Form TM-A process and Nice Classification (Classes 1–45).<br>• Documented 50% statutory fee concession for MSMEs/Startups (₹4,500 vs ₹9,000).<br>• Clarified Registered Trademark (®) vs Common-Law (™) rights.<br>• Detailed certified Trademark Agent representation and consultation desk. |
| **11** | `assets/js/forms.js` | Script | Remediated | **Enquiry Flow & Anti-Bot Fail-Closed Architecture:**<br>• Enhanced client-side input validation with strict regex patterns for PAN, GSTIN, CIN, DIN, Indian Phone (10 digits starting 6–9), and Email.<br>• Implemented anti-bot honeypot check (`website_url`).<br>• Standardized `showFormFallbackNotice` in static Cloudflare Pages environments.<br>• Formats user enquiry into pre-filled WhatsApp (`+91 86069 18247`) and Email (`admin@craftegon.com`) dispatch buttons.<br>• Strictly eliminated false claims of server-side database insertion in static mode. |
| **12** | `assets/js/search.js` | Script | Remediated | **Directory UX & Shelf State Management:**<br>• Added logic to automatically collapse/hide `#featured-launch-shelf` when a search query or vertical facet filter is active, preventing visual clutter while browsing the 57 services. |
| **13** | `components/navbar.html` | Component | Remediated | **Navigation Trust & Routing:**<br>• Added direct navigation link to `about.html`.<br>• Ensured consultation CTAs consistently route to `#contact` or WhatsApp. |
| **14** | `components/footer.html` | Component | Remediated | **Statutory Disclaimer & Desk Disclosures:**<br>• Added corporate desk location (`Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, India &bull; PIN 690501`).<br>• Embedded Advocates Act 1961 non-advocacy demarcation.<br>• Linked to `about.html`, `legal/disclaimer.html`, and `legal/privacy.html`. |
| **15** | `portal/dashboard.html` | Page | Remediated | **Demo Portal Fallback Hardening:**<br>• Verified static deployment behavior; runs in zero-error Anonymous Demo Mode without triggering failing backend API requests. |
| **16** | `assets/css/portal.css` | Stylesheet | Remediated | **Portal Styling & Badge Contrast:**<br>• Remediated CSS token bindings and verified WCAG contrast for all portal status pills. |

---

## 3. Preservation Verification

The following critical system areas were deliberately preserved without alteration:
1. **Canonical Service Registry (`data/service-registry.json`):** Preserved 58 records (Record 0 is utility route `/search/`; Records 1–57 represent the approved canonical services across 15 verticals).
2. **Database Migrations (`migrations/`):** All historical migrations 001–008 preserved. **Migration 009 remains unapplied.**
3. **Edge Configuration (`_headers`, `_redirects`, `robots.txt`):** Strict security headers (CSP, HSTS, X-Content-Type-Options) and `/api/*` 404 blocking rules remain intact.
4. **Test Harness (`tests/`):** All 75 automated test suites pass without regression.
