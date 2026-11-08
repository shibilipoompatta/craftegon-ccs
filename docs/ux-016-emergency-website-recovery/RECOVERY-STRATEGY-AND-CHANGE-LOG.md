# Recovery Strategy & Complete Change Log

**Project:** CraftEgon Corporate Services (CCS)  
**Deliverable:** Deliverable 4 — Recovery Strategy & Change Log  
**Live Target Domain:** `https://ccs.craftegon.com`  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly read-only)  
**Recovery Candidate Path:** `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`  
**Date:** 2026-11-08  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED  

---

## 1. Recovery Strategy Rationale

### The Dilemma: Option A vs Option B vs Option C
When presented with the owner's emergency directive regarding the defective live website, three strategic paths were analyzed:

* **Option A: Pure Historical Rollback (Commit `7d02d17` as-is):**
  - *Drawback:* Reverting blindly to `7d02d17` would re-introduce known defects: line 800 contained a direct link to `/portal/subscription.html`, `theme.css` imported `/assets/css/portal.css`, test scripts were not configured to exclude `dist-public/`, and the build pipeline lacked the public isolation hardening authored in TASK-012/013.
* **Option C: In-Place Patching of Current Live State (`fa59cda`):**
  - *Drawback:* Attempting to restyle the gutted 31KB homepage would require reverse-engineering the missing 61 cards, rebuilding interactive diagnostic tabs, and untangling 685 lines of ad-hoc override CSS. This would violate the owner directive against experimental redesigns and prolong the outage.
* **Option B: Historical Restoration with Critical Corrections (CHOSEN):**
  - *Strategy:* Restore the proven, polished corporate layout from commit `7d02d17`, pair it with the clean 1,272-line `home-unique.css`, apply targeted security and identity sanitization (eliminating residual portal references and CSS imports), and integrate the public build isolation tooling from TASK-012.
  - *Execution:* Provisioned entirely in an isolated directory (`C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`) without performing any Git commits, resets, or branch switches in the main working repository.

---

## 2. Step-by-Step Recovery Execution Log

1. **Isolation Sandbox Provisioning:**
   - Created a clean temporary sandbox at `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`.
   - Extracted clean historical tree from commit `7d02d17` using Git archive extraction to ensure zero contamination from uncommitted working tree files.
2. **Critical File Restorations & Corrections:**
   - **`index.html`:** Extracted the 72,128-byte historical homepage from `7d02d17`.
     - *Correction applied:* Sanitized residual portal link at line 800 from `href="/portal/subscription.html"` to `href="/conversion/retainer-desk.html"`.
   - **`assets/css/home-unique.css`:** Extracted the clean 1,272-line stylesheet from `7d02d17`, completely stripping the 685 lines of uncoordinated override CSS introduced in TASK-010.
   - **`assets/css/theme.css`:** Removed line 8 (`@import url('/assets/css/portal.css');`) to prevent portal CSS leakage into the public cascade and avoid 404 errors in `dist-public/`.
   - **`config.js`:** Verified and enforced authoritative identity configuration:
     - `brandName`: `"CraftEgon Corporate Services"`
     - `tagline`: `"Building Business Infrastructure"`
     - `phone`: `"+91 86069 18247"`
     - `operationalDesk`: `"Operational Service Desk, Alappuzha, Kerala"`
     - `legalEntity`: `null` (Strictly neutral; zero unconfirmed CIN/LLPIN claims).
   - **`contact.html`:** Ensured the verified dedicated contact and operational desk disclosure page is included in the root source.
   - **`scripts/build-public.js` & `scripts/verify-public-build.js`:** Integrated the public isolation build and verification scripts.
   - **Test Scripts (`scripts/check-orphans.js`, `scripts/verify-links.js`, `scripts/audit-seo.js`):** Updated to ignore `dist-public/` so that automated regression testing remains 100% clean.
3. **Compilation & Build Execution:**
   - Executed `node scripts/build-public.js` inside the recovery sandbox.
   - Output: 151 clean public files (2.50 MB) compiled into `dist-public/`. Zero portal files, zero admin files, zero test files included.
4. **Automated Verification:**
   - Executed `node scripts/verify-public-build.js`: **51/51 assertions PASSED (100%)**.
   - Executed `npm test`: **75/75 test suites PASSED (100%) across all 14 pipeline stages**.
5. **Headless Visual Capture:**
   - Executed async Chrome headless capture across 6 viewports (`1440px`, `1024px`, `768px`, `390px`, `375px`, `360px`) and 6 key page categories, capturing 16 verified PNG screenshots into `docs/ux-016-emergency-website-recovery/screenshots/`.

---

## 3. Comprehensive File-by-File Change Log

| File Path | Origin / Baseline | Target in Recovery Sandbox | Exact Modification Performed | Justification / Root Cause Resolution | Verification Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `index.html` | Git commit `7d02d17` | Root `index.html` | Restored 72,128-byte structure; sanitized line 800 `/portal/subscription.html` -> `/conversion/retainer-desk.html` | Restores rich 10-section layout, 83 cards, interactive tabs; eliminates portal leak | `npm test` & `verify-public-build.js` PASS; visual screenshots verified |
| `assets/css/home-unique.css` | Git commit `7d02d17` | Root `assets/css/home-unique.css` | Restored 1,272 clean lines; stripped 685 lines of uncoordinated overrides (lines 1271–1957) | Eliminates conflicting container paddings, card borders, and broken mobile margins | Visual screenshots confirm clean grid alignment across all viewports |
| `assets/css/theme.css` | Git commit `7d02d17` | Root `assets/css/theme.css` | Removed `@import url('/assets/css/portal.css');` at line 8 | Prevents portal styles from leaking into public cascade and eliminates 404 in `dist-public/` | CSS load verified; zero console errors |
| `config.js` | Git commit `7d02d17` | Root `config.js` | Enforced `legalEntity: null`, `operationalDesk: "Operational Service Desk, Alappuzha, Kerala"` | Strictly adheres to owner identity and statutory compliance decisions | Link and identity scanner passes 100% |
| `contact.html` | TASK-012 | Root `contact.html` | Included verified contact page with Alappuzha desk and phone `+91 86069 18247` | Provides direct customer contact channel without portal login requirement | Route, link, and visual capture verified |
| `scripts/build-public.js` | TASK-012 | Root `scripts/build-public.js` | Integrated public isolation build script with portal link sanitizer | Compiles `dist-public/` excluding `/portal/`, `/admin/`, docs, and tests | 151 files compiled (2.50 MB); 0 portal files included |
| `scripts/verify-public-build.js` | TASK-012 | Root `scripts/verify-public-build.js` | Integrated 51-assertion automated public build verification suite | Verifies portal exclusion, link integrity, security headers, and asset resolution | 51/51 assertions PASSED (100%) |
| `scripts/check-orphans.js` | Git commit `fa59cda` | Root `scripts/check-orphans.js` | Excluded `dist-public/` from orphan file scanner | Prevents false-positive test failures during local test runs | `npm test` Stage 14 PASSED |
| `scripts/verify-links.js` | Git commit `fa59cda` | Root `scripts/verify-links.js` | Excluded `dist-public/` from internal link verification | Prevents duplicate scan loops across compiled build artifacts | `npm test` Stage 6 PASSED |
| `scripts/audit-seo.js` | Git commit `fa59cda` | Root `scripts/audit-seo.js` | Excluded `dist-public/` from SEO tag verification | Prevents duplicate scan loops across compiled build artifacts | `npm test` Stage 9 PASSED |

---

## 4. Preservation of Authoritative Business & Compliance Decisions

All corporate identity, legal posture, and commercial parameters established in previous tasks and owner decisions are strictly preserved:

1. **Brand Identity:** Exactly `"CraftEgon Corporate Services"` across all headers, titles, and schemas.
2. **Tagline:** Exactly `"Building Business Infrastructure"` across all hero banners and metadata.
3. **Direct Contact Information:**
   - Phone: `+91 86069 18247`
   - Primary Operational Desk: `"Operational Service Desk, Alappuzha, Kerala"`
   - General Inquiries: `admin@craftegon.com`
4. **Corporate & Statutory Boundaries:**
   - Neutral legal entity stance (`legalEntity: null`). Zero unconfirmed corporate registration numbers (CIN/LLPIN).
   - Zero claims of registered office until formally confirmed by owner.
   - Clear disclosure that CraftEgon Corporate Services is a corporate advisory and compliance infrastructure provider, not an advocate law firm or statutory chartered accounting practice. Professional filings are coordinated through licensed third-party professionals.
5. **Security & Boundary Protection:**
   - 100% exclusion of the unfinished client portal (`/portal/`) and admin console (`/admin/`) from public publishing.
