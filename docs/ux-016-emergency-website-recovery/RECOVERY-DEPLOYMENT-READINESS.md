# Production Recovery Deployment Readiness & Edge Configuration Runbook

**Project:** CraftEgon Corporate Services (CCS)  
**Deliverable:** Deliverable 7 — Recovery Deployment Readiness  
**Live Target Domain:** `https://ccs.craftegon.com`  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly read-only)  
**Recovery Candidate Path:** `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate`  
**Date:** 2026-11-08  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED  

---

## 1. Incident Remediation Status

The technical, architectural, and visual issues identified in the incident investigation have been completely resolved within the isolated recovery candidate environment:

1. **Visual Disorganization & Content Gutting:**
   - **Resolved.** Restored the comprehensive 10-section corporate homepage design from historical baseline `7d02d17`, featuring 83 structured cards, interactive problem-solution tabs, and balanced Mint (`#BCEBD5`) and Sky (`#B8E3F7`) styling.
2. **Conflicting CSS Overrides:**
   - **Resolved.** Stripped the 685 lines of uncoordinated CSS overrides from `assets/css/home-unique.css`, restoring the clean 1,272-line production stylesheet.
3. **Public Exposure of Unfinished Internal Modules:**
   - **Resolved locally.** Verified that `scripts/build-public.js` compiles an isolated `dist-public/` artifact containing 151 public files (2.50 MB) with zero portal or admin modules.
4. **Automated Test Validation:**
   - **Resolved.** 51/51 public build assertions passed; 75/75 repository test suites passed (100%).

---

## 2. Mandatory Cloudflare Pages Dashboard Configuration

> [!CAUTION]
> **CRITICAL EXTERNAL PREREQUISITE:**  
> The live incident occurred because Cloudflare Pages was configured to publish the **repository root (`/`)** rather than the compiled `dist-public/` artifact. Even if the codebase is fixed, pushing to `main` without updating Cloudflare's settings will continue deploying raw repository files (including `/portal/`).

The account owner or DevOps administrator must log in to the Cloudflare dashboard and apply the following exact settings:

### Cloudflare Pages Settings Matrix:
| Configuration Setting | Current Live Value | Required Corrected Value | Status / Action Required |
| :--- | :--- | :--- | :--- |
| **Project Name** | `craftegon-ccs` (or `ccs`) | `craftegon-ccs` | Existing |
| **Production Branch** | `main` | `main` | Existing |
| **Framework Preset** | `None` | `None` | Verify |
| **Build Command** | *Empty* or `None` | `node scripts/build-public.js` | **EXTERNAL CONFIGURATION REQUIRED** |
| **Build Output Directory** | `/` (Root) or *Empty* | `dist-public` | **CRITICAL EXTERNAL CONFIGURATION REQUIRED** |
| **Root Directory** | `/` (Root) | `/` (Root) | Leave as default `/` |
| **Node.js Version** | Default (`12.x` / `16.x`) | `20` (via `NODE_VERSION=20`) | **EXTERNAL CONFIGURATION REQUIRED** |

### Step-by-Step Cloudflare Dashboard Instructions:
1. Navigate to **Cloudflare Dashboard** -> **Workers & Pages** -> Select the CCS Pages project.
2. Click on the **Settings** tab.
3. In the left navigation, select **Builds & deployments**.
4. In the **Build configurations** section, click **Edit configuration**.
5. Set:
   - **Build command:** `node scripts/build-public.js`
   - **Build output directory:** `dist-public`
6. In the **Environment variables** section (under Production):
   - Add variable: `NODE_VERSION` = `20`
7. Click **Save**.

---

## 3. Pre-Deployment Verification Checklist

Prior to initiating any production deployment, verify each gate item:

| Gate # | Check Item | Evidence / Reference | Verification Status |
| :--- | :--- | :--- | :--- |
| **G-01** | Reference repository untouched | `craftegon-ccs-main` git status clean | **VERIFIED FACT** |
| **G-02** | Recovery candidate built in sandbox | `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate` | **VERIFIED FACT** |
| **G-03** | Public build script execution | `dist-public/` (151 files, 2.50 MB) | **VERIFIED FACT** |
| **G-04** | Portal & Admin completely excluded | 0 portal files in `dist-public/` | **VERIFIED FACT** |
| **G-05** | Public build automated verification | `scripts/verify-public-build.js` (51/51 PASS) | **VERIFIED FACT** |
| **G-06** | Full regression test suite | `npm test` (75/75 test suites PASS across 14 stages) | **VERIFIED FACT** |
| **G-07** | Multi-viewport visual QA | 16 candidate screenshots captured (360px–1440px) | **VERIFIED FACT** |
| **G-08** | Statutory identity compliance | Brand, phone, Alappuzha desk, neutral entity verified | **VERIFIED FACT** |
| **G-09** | Cloudflare Pages settings updated | Dashboard "Build output directory" set to `dist-public` | **EXTERNAL CONFIGURATION REQUIRED** |
| **G-10** | Owner visual review & authorization | Owner reviews screenshots and authorizes deployment | **OWNER CONFIRMATION REQUIRED** |

---

## 4. Controlled Production Deployment Execution Plan

Once owner authorization is granted and Cloudflare settings are confirmed, execute the following controlled release procedure:

### Phase 1: Apply Verified Recovery Files to Working Tree
Copy the verified source files from `C:\Users\shibi\AppData\Local\Temp\ccs-recovery-candidate` into `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`:
- `index.html` (Restored 72KB historical homepage with sanitized line 800)
- `assets/css/home-unique.css` (Restored 1,272-line clean CSS)
- `assets/css/theme.css` (Sanitized line 8 without portal `@import`)
- `config.js` (Verified authoritative identity configuration)
- `scripts/build-public.js` & `scripts/verify-public-build.js`
- Test scripts with `dist-public/` exclusion (`scripts/check-orphans.js`, etc.)

### Phase 2: Local Verification
Run local build and test in the working repository:
```powershell
node scripts/build-public.js
node scripts/verify-public-build.js
npm test
```
Confirm 100% pass rate.

### Phase 3: Git Commit & Push
Commit the recovery package to Git:
```bash
git checkout -b recovery/restore-historical-baseline
git add index.html assets/css/home-unique.css assets/css/theme.css config.js scripts/
git commit -m "fix(recovery): restore historical 7d02d17 baseline, isolate public build, eliminate portal leaks"
git checkout main
git merge recovery/restore-historical-baseline --ff-only
git push origin main
```

### Phase 4: Edge Live Validation
Once Cloudflare Pages finishes the deployment build:
1. Probe homepage:
   `curl -I https://ccs.craftegon.com/` (Must return HTTP 200 with hardened CSP headers).
2. Probe portal isolation:
   `curl -I https://ccs.craftegon.com/portal/` (Must return **HTTP 404 Not Found**).
   `curl -I https://ccs.craftegon.com/portal/dashboard.html` (Must return **HTTP 404 Not Found**).
3. Verify visual rendering in browser on desktop and mobile.

---

## 5. Emergency Rollback Runbook

If any unforeseen visual or routing anomaly occurs post-deployment:

### Immediate Cloudflare Instant Rollback (Zero Git Action Required):
1. In Cloudflare Dashboard, go to **Workers & Pages** -> **craftegon-ccs** -> **Deployments**.
2. Locate the last stable deployment prior to the incident.
3. Click the three dots (`...`) next to that deployment and select **Rollback to this deployment**.
4. Cloudflare will instantly re-route traffic to the selected build artifact within ~10 seconds.

### Local Git Reversion:
If Git history rollback is necessary:
```bash
git revert HEAD --no-edit
git push origin main
```
