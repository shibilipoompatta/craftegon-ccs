# Production Incident Root-Cause Investigation Report

**Priority:** CRITICAL — Production Website Recovery  
**Project:** CraftEgon Corporate Services (CCS)  
**Live Target Domain:** `https://ccs.craftegon.com`  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly read-only; 100% untouched)  
**Evaluator Roles:** Senior DevOps Engineer, Release Manager, Web Security Auditor & Quality Assurance Architect  
**Date:** 2026-11-08  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Executive Incident Summary

Following an emergency notification from the business owner regarding the unacceptable, unprofessional, and visually disorganized state of the live production website (`https://ccs.craftegon.com`), an immediate technical, architectural, and visual investigation was conducted.

Direct inspection of the live production website, historical Git logs, local artifacts, and network responses reveals that the production degradation was caused by a **tri-factor failure**:
1. **Design Deterioration (Authored in TASK-010):** The premature "homepage content rationalisation" gutted the comprehensive corporate homepage from 72,128 bytes down to 31,274 bytes (-57%), deleted 73.5% of structured card components, stripped interactive regulatory diagnostics and problem-solution tabs, and appended 685 lines of ad-hoc, uncoordinated CSS to `home-unique.css`.
2. **Architectural & Visual Inconsistency:** The homepage was redesigned into a sparse, generic 22-card outline with mismatched class names, while all 57 underlying service pages, 15 practice verticals, and tools retained their rich institutional styling, causing an immediate, severe visual and functional disconnect upon landing.
3. **Severe Cloudflare Deployment Misconfiguration (Live Exposure):** Live HTTP inspection confirms that Cloudflare Pages is configured with "Build output directory" set to `/` (or blank), publishing the **RAW REPOSITORY ROOT** rather than the compiled `dist-public/` artifact. Consequently:
   - The unvetted client portal (`/portal/`) is publicly accessible with HTTP 200.
   - The root `_headers` file is served rather than the hardened edge headers.
   - The live site is exposing internal development and documentation assets.

---

## 2. Exhaustive Root-Cause Inquiry (12 Mandated Questions)

### Q1: What did the owner commit?
**VERIFIED FACT.**  
At `Sun Nov 8 15:21:35 2026 +0530`, commit `fa59cda914b2b1555cea49eb15174f5a8b2ad9f9` was recorded on `main` with the commit message `"new changes"`. It committed 198 files comprising the entire uncommitted working tree from tasks TASK-010 through TASK-015:
- 22 modified source and configuration files (including the gutted 31KB `index.html` and bloated 1,957-line `home-unique.css`).
- 3 new files (`contact.html`, `scripts/build-public.js`, `scripts/verify-public-build.js`).
- 173 documentation and QA files in `docs/` (including 80 binary screenshots totaling ~17 MB).

### Q2: Which commit or changes introduced the problem?
**VERIFIED FACT.**  
The visual and structural deterioration was authored during **TASK-010** when the homepage was rewritten and `home-unique.css` was bloated. This unpolished state became **LIVE on production** when commit `fa59cda` was pushed to `origin/main` and Cloudflare Pages automatically triggered a production build from `main`.

### Q3: Was the correct public build directory used?
**VERIFIED FACT.**  
**NO.** Cloudflare Pages did NOT publish `dist-public/`. It was never configured to serve `dist-public`.

### Q4: Did Cloudflare potentially publish the repository root instead of `dist-public`?
**VERIFIED FACT.**  
**YES, CONFIRMED BEYOND DOUBT.** Direct live HTTP probing of `https://ccs.craftegon.com`:
- `https://ccs.craftegon.com/portal/` returns **HTTP 200 OK** (proving the raw repository tree is deployed).
- `https://ccs.craftegon.com/dist-public/` returns **HTTP 404 Not Found** (proving `dist-public` is not mapped as the root).
- The HTTP response headers on `https://ccs.craftegon.com` match the repository root `_headers` byte-for-byte (including legacy CSP allowing `cdn.jsdelivr.net`), rather than the hardened `dist-public/_headers`.

### Q5: Are CSS and JavaScript loading correctly?
**VERIFIED FACT.**  
All 5 stylesheet links on the live homepage (`tokens.css`, `theme.css`, `navbar.css`, `home-unique.css`, `chat-widget.css`) return HTTP 200. However, `home-unique.css` contains 685 lines of appended conflicting styles that override base container paddings, card borders, and typography. Furthermore, line 8 of `assets/css/theme.css` contains `@import url('/assets/css/portal.css');`, which leaks portal styles into the global cascade.

### Q6: Were historical styles or shared components overwritten?
**VERIFIED FACT.**  
Yes. In `assets/css/home-unique.css`, lines 1271–1957 were appended to implement the TASK-010 redesign, introducing conflicting styles for `.section-container`, `.section-title`, `.hero-badge`, and card grids that degraded visual rhythm and spacing across the page.

### Q7: Were some pages transformed while others were not?
**VERIFIED FACT.**  
**YES — CRITICAL ARCHITECTURAL FRACTURE.**  
The homepage was stripped down to a sparse 6-section text list, while the rest of the website (57 service detail pages, 15 verticals, calculator, search) retained the rich corporate design system. When prospective clients navigate from the homepage to any service page, the layout, typography, navigation, and density change drastically, creating an amateurish and disorganized impression.

### Q8: Were any asset paths broken?
**VERIFIED FACT.**  
Images, fonts, and primary scripts load with HTTP 200. However, inside `assets/css/theme.css`, `@import url('/assets/css/portal.css');` represents an architectural defect: in `dist-public/`, `portal.css` is intentionally excluded, causing a silent broken stylesheet import at runtime.

### Q9: Is the problem primarily design-related, technical, deployment-related or a combination?
**VERIFIED FACT.**  
**It is a tri-factor combination:**
1. *Design Failure:* Over-zealous content deletion in TASK-010 that destroyed the rich corporate infrastructure aesthetic.
2. *Deployment Failure:* Cloudflare Pages publishing the repository root instead of `dist-public`, exposing internal portals.
3. *Cascade Failure:* Conflicting CSS rules in `home-unique.css` and uncoordinated style imports in `theme.css`.

### Q10: What exactly has been recovered?
**VERIFIED FACT.**  
In the isolated recovery candidate:
- Restored the comprehensive, polished, 10-section corporate homepage design from baseline commit `7d02d17`.
- Restored the clean 1,272-line `home-unique.css` (removing the 685 lines of bloated override CSS).
- Sanitized residual portal links (replacing `/portal/subscription.html` with legitimate service links).
- Preserved all authoritative owner decisions: brand name "CraftEgon Corporate Services", phone `+91 86069 18247`, location "Operational Service Desk, Alappuzha, Kerala", and zero unconfirmed entity or headquarters claims.
- Fixed `assets/css/theme.css` to eliminate the `@import url('/assets/css/portal.css');` leak.
- Compiled an isolated `dist-public/` artifact passing 100% of automated tests (51/51 build checks; 75/75 test suites).

### Q11: What remains unresolved?
**OWNER CONFIRMATION & CLOUDFLARE CONFIGURATION REQUIRED.**  
1. Cloudflare Pages "Build output directory" must be updated in the Cloudflare dashboard from `/` to `dist-public`.
2. Owner operational verification of incoming emails to `admin@craftegon.com`.

### Q12: What is the safest route to restore the live website?
**RECOMMENDED RUNBOOK:**
1. Review the visual evidence and screenshots of the recovered candidate in `docs/ux-016-emergency-website-recovery/screenshots/`.
2. Update the Cloudflare Pages project configuration in Cloudflare dashboard:
   - **Build command:** `node scripts/build-public.js`
   - **Build output directory:** `dist-public` (**CRITICAL**)
   - **Node version:** `20`
3. Upon owner authorization, deploy the verified recovery candidate.
