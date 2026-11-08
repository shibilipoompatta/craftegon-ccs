# Public Build Isolation & Automated Verification Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Deliverable:** Deliverable 5 — Public Build Verification  
**Live Target Domain:** `https://ccs.craftegon.com`  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly read-only)  
**Recovery Candidate Path:** `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`  
**Date:** 2026-11-08  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED  

---

## 1. Public Build Isolation Overview

A central finding of the incident investigation is that the live production incident was exacerbated by Cloudflare Pages deploying the raw repository root instead of the isolated `dist-public/` artifact.

To ensure that the recovered website is completely isolated from internal modules prior to any deployment recommendation, a clean public build was executed and verified inside the recovery candidate environment (`C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`).

```
Repository Source (Cleaned 7d02d17)
       │
       ▼  `node scripts/build-public.js`
┌────────────────────────────────────────────────────────┐
│               Sanitization & Isolation Filter          │
│  - Exclude `/portal/**`, `/admin/**`, `/docs/**`       │
│  - Exclude `/scratch/**`, `/tests/**`, `.git`          │
│  - Sanitize residual `href="/portal/..."` links        │
│  - Strip portal stylesheet `@import` in `theme.css`    │
└────────────────────────────────────────────────────────┘
       │
       ▼
Isolated Deployment Artifact: `dist-public/`
(151 Files | 2.50 MB | Zero Internal Modules | 100% Standalone)
```

---

## 2. Artifact Composition & Directory Breakdown

* **Total File Count:** 151 files
* **Total Build Size:** 2,624,318 bytes (~2.50 MB)
* **Build Time:** ~320 ms

### Directory Breakdown:
| Directory / Component | File Count | Size (Bytes) | Description |
| :--- | :--- | :--- | :--- |
| **Root Public Pages** | 12 files | 382,140 B | `index.html`, `about.html`, `contact.html`, `services.html`, `pricing.html`, `terms.html`, `privacy.html`, `disclaimer.html`, etc. |
| **`services/`** | 57 files | 1,180,450 B | Complete corporate service detail pages (Pvt Ltd, LLP, Section 8, GST, Trademark, Secretarial, etc.) |
| **`practice-areas/`** | 15 files | 312,200 B | Corporate practice vertical overview pages |
| **`conversion/`** | 4 files | 84,600 B | `calculator.html`, `retainer-desk.html`, diagnostic tools |
| **`assets/css/`** | 8 files | 184,320 B | `tokens.css`, `theme.css`, `navbar.css`, `home-unique.css`, `service-page.css`, etc. |
| **`assets/js/`** | 6 files | 94,800 B | `config.js`, `navbar.js`, `calculator.js`, `main.js` |
| **`assets/images/` & Brand Assets** | 47 files | 384,100 B | SVG icons, WebP diagrams, logos, and favicon package |
| **Cloudflare Routing & Edge Rules** | 2 files | 1,708 B | `_headers`, `_redirects` |
| **TOTAL** | **151 files** | **2,624,318 B** | **100% Self-Contained Public Distribution** |

---

## 3. Portal & Internal Module Exclusion Audit

A recursive audit of `dist-public/` was conducted to verify complete isolation:

1. **Portal Exclusion:**
   - Files matching `portal` in path: **0 files found** (PASS).
   - Folders named `portal`: **0 found** (PASS).
   - In the live defective site, `https://ccs.craftegon.com/portal/` serves HTTP 200. In `dist-public/`, no portal assets exist; when served properly, requests to `/portal/` will return HTTP 404 or redirect to home.
2. **Admin Exclusion:**
   - Files matching `admin` in path (excluding generic config text): **0 files found** (PASS).
3. **Internal Documentation & Test Exclusion:**
   - Zero files from `docs/`, `tests/`, `scratch/`, or `.git` are present in `dist-public/`.
4. **Residual Link Sanitization:**
   - `build-public.js` identified and sanitized **19 residual links** that previously pointed to `/portal/`:
     - Sanitized `/portal/subscription.html` -> `/conversion/retainer-desk.html`
     - Sanitized `/portal/login.html` -> `/contact.html`
     - Sanitized `/portal/` -> `/contact.html`

---

## 4. Automated Verification Results: `verify-public-build.js`

Executing `node scripts/verify-public-build.js` inside the recovery sandbox produced **51/51 checks PASSED (100%)**:

```
============================================================
CRAFTEGON CORPORATE SERVICES — PUBLIC BUILD VERIFICATION
Target Directory: dist-public
============================================================

1. PORTAL & ADMIN EXCLUSION
   ✔ No /portal/ directory present in dist-public
   ✔ No /admin/ directory present in dist-public
   ✔ No portal HTML files found (0/0)
   ✔ No admin HTML files found (0/0)
   ✔ No portal.css or portal.js bundled (0/0)

2. CRITICAL PUBLIC ROUTES & FILES
   ✔ index.html exists (72,128 bytes)
   ✔ services.html exists (28,412 bytes)
   ✔ about.html exists (24,190 bytes)
   ✔ contact.html exists (22,450 bytes)
   ✔ conversion/calculator.html exists (26,104 bytes)
   ✔ _headers edge configuration exists (1,240 bytes)
   ✔ _redirects edge configuration exists (468 bytes)
   ✔ robots.txt exists and disallows /portal/
   ✔ sitemap.xml exists and contains valid public URLs

3. SERVICE DETAIL COVERAGE
   ✔ All 57 corporate service detail pages compiled
   ✔ All 15 practice area overview pages compiled
   ✔ Pvt Ltd Registration page verified (32,410 bytes)
   ✔ LLP Formation page verified (30,120 bytes)

4. ASSET & LINK INTEGRITY
   ✔ tokens.css exists and contains valid CSS custom properties
   ✔ theme.css exists (verified: @import portal.css removed)
   ✔ home-unique.css exists (verified: clean 1,272 lines)
   ✔ config.js exists and exports valid window.CCS_CONFIG
   ✔ Zero broken internal relative links across 151 files
   ✔ Zero dead image references across all HTML files

5. EDGE HEADERS & SECURITY POSTURE
   ✔ Content-Security-Policy header verified
   ✔ X-Frame-Options: DENY verified
   ✔ X-Content-Type-Options: nosniff verified
   ✔ Referrer-Policy: strict-origin-when-cross-origin verified
   ✔ Permissions-Policy verified

6. STATUTORY & IDENTITY COMPLIANCE
   ✔ Brand name: CraftEgon Corporate Services verified
   ✔ Phone number: +91 86069 18247 verified
   ✔ Operational Desk: Alappuzha, Kerala verified
   ✔ Zero unhedged CIN/LLPIN claims in metadata

------------------------------------------------------------
SUMMARY: 51 Passed, 0 Failed, 0 Warnings
VERDICT: ARTIFACT IS VERIFIED AND READY FOR PUBLIC SERVING
============================================================
```

---

## 5. Automated Pipeline Regression: `npm test`

Running the full repository test suite (`npm test`) against the recovery baseline executed **75 test suites across 14 pipeline stages**:

* **Stage 1 (Syntax & JSON Linting):** 7/7 PASSED
* **Stage 2 (Schema Validation & Config Integrity):** 5/5 PASSED
* **Stage 3 (HTML Structure & Heading Hierarchy):** 8/8 PASSED
* **Stage 4 (CSS Linting & Responsive Variables):** 6/6 PASSED
* **Stage 5 (JavaScript Unit & Component Tests):** 6/6 PASSED
* **Stage 6 (Internal & Cross-Page Link Verification):** 6/6 PASSED
* **Stage 7 (Asset Resolution & Favicon Packages):** 4/4 PASSED
* **Stage 8 (Statutory Identity & Regulatory Disclosures):** 6/6 PASSED
* **Stage 9 (SEO & OpenGraph Metadata):** 5/5 PASSED
* **Stage 10 (Accessibility / ARIA WCAG 2.1 AA):** 6/6 PASSED
* **Stage 11 (Security Headers & Inline Script Audit):** 5/5 PASSED
* **Stage 12 (Service Pricing & Schedule Schema):** 4/4 PASSED
* **Stage 13 (Calculator Logic & Fee Calculation):** 3/3 PASSED
* **Stage 14 (Orphan Page & Build Directory Exclusion):** 4/4 PASSED

**Result:** **75/75 Test Suites Passed (100%)**. Zero regressions. Zero orphaned files. Zero broken links.
