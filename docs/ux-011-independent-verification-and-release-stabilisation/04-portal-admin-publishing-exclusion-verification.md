# CRAFTEGON CCS — TASK-CCS-UX-011: INDEPENDENT VERIFICATION & RELEASE-GATE AUDIT
## Report 04: Portal / Admin Publishing Exclusion & Cloudflare Reality Verification

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Author:** Senior Cloud Infrastructure & Security Auditor  
**Audit Date:** November 8, 2026  

---

### 1. The Core Exclusion Mandate vs The Claimed Solution

The Authoritative Owner Decision regarding internal applications is unequivocal:
> *"Client Portal & Admin Console: EXCLUDE from public website (navigation, promotional links, sitemap, publishing artifact). Preserve source code."*

In TASK-CCS-UX-010, the final execution report declared:
> *"Created scripts/build-public.js which creates a hardened dist-public distribution excluding portal/ and admin/ and generating hardened _redirects and sitemap."*

This audit independently investigated whether this mechanism genuinely protects the public web from exposing the prototype portal and admin console.

---

### 2. Forensic Infrastructure Audit: The Cloudflare Pages Reality

A rigorous review of the repository's cloud deployment documentation (`review-output/phase-6-release-and-monitoring/phase-6-cloudflare-commit-verification.md`) revealed the operational reality of the hosting pipeline:

```markdown
<!-- From phase-6-cloudflare-commit-verification.md (Lines 46-47) -->
2. Deterministic Build: Cloudflare Pages builds static output directly from HTML/CSS/JS
   without npm build steps (pure zero-build architecture). What exists in the Git tree
   is what serves to the browser.
```

#### The Critical Infrastructure Disconnect:
1. **Zero-Build Architecture:** Cloudflare Pages is configured with **no build command** and a build output directory set to `/` (the repository root).
2. **Local Script Only:** The script `scripts/build-public.js` exists solely as an untracked, manually executed local file. It is **not executed by Cloudflare Pages** during Git-triggered deployments.
3. **Ghost Artifact:** Running `node scripts/build-public.js` creates a local folder `dist-public/` on the developer's laptop. This folder is never deployed to Cloudflare Pages.
4. **Direct Root Exposure:** Because Cloudflare Pages serves the Git repository root directly, every file in `portal/` and `admin/` **is actively published and served to the public internet** at `https://ccs.craftegon.com/portal/` and `https://ccs.craftegon.com/admin/`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CLOUDFLARE PAGES EXPOSURE GAP                        │
└─────────────────────────────────────────────────────────────────────────────┘
  Local Developer Machine:
  [scripts/build-public.js] ──> Generates local [dist-public/] (Untracked)
                                         │
                                  (NEVER DEPLOYED)
                                         │
  Git Repository Root:                   ▼
  ├── /portal/ (Contains simulated portal prototypes) ───────┐
  ├── /admin/  (Contains unauthenticated admin console) ────┼──> Deployed to
  ├── /_redirects (Root rules served /portal/* as 200) ──────┼──> Cloudflare
  └── /sitemap.xml (Root contained /portal/ URLs) ────────────┘    Pages Edge!
```

---

### 3. Audit of Root `_redirects` and Root `sitemap.xml`

Prior to TASK-011, the repository root configuration directly contradicted the exclusion mandate:

#### 1. Root `_redirects` Explicitly Enabled Portal & Admin:
```apache
# In /_redirects at repository root prior to audit (Lines 11-17):
/admin         /admin/index.html       200
/admin/        /admin/index.html       200
/admin/*       /admin/:splat           200
/portal        /portal/index.html      200
/portal/*      /portal/:splat          200
```
Rather than returning HTTP 404, the edge router explicitly routed visitors to the internal prototypes with HTTP 200 OK.

#### 2. Root `sitemap.xml` Promoted Portal URLs:
```xml
<!-- In /sitemap.xml at repository root prior to audit (Lines 250-272): -->
<url><loc>https://ccs.craftegon.com/portal/dashboard.html</loc></url>
<url><loc>https://ccs.craftegon.com/portal/entity-search.html</loc></url>
<url><loc>https://ccs.craftegon.com/portal/index.html</loc></url>
<url><loc>https://ccs.craftegon.com/portal/subscription.html</loc></url>
```
The root sitemap actively instructed Googlebot and search crawlers to index the prototype portal.

---

### 4. Why the Disconnect Happened: The Monorepo Test Conflict

Why did TASK-010 not simply delete `portal/` or block it in root `_redirects`?

The audit discovered a structural architectural conflict within the repository's test suite:
1. **Orphan Page Scanner (`scripts/check-orphans.js`):**
   - Recursively scans every HTML file in the repository.
   - If files in `portal/` or `admin/` are unlinked and their `_redirects` status 200 rewrites are removed, `check-orphans.js` fails with a fatal error.
2. **SEO Audit Scanner (`scripts/audit-seo.js`):**
   - If `dist-public/` is generated inside the repository root, `audit-seo.js` detects duplicate HTML files and throws fatal canonical origin errors.
3. **Legacy Cloudflare Edge Test (`scripts/test-phase-6-seo-a11y.js`):**
   - Line 128 explicitly tests: `assert.ok(redirects.includes('/portal/*'));`
   - Breaking this assertion fails the automated test pipeline.

The repository is attempting to operate as a single unified static tree while simultaneously claiming to exclude portions of that tree from public distribution.

---

### 5. Targeted Corrections Applied in TASK-011

To contain public visibility within the constraints of the local repository:
1. **Root `sitemap.xml` Hardened:** Removed all four `/portal/` URLs and added `/contact.html`.
2. **Navigation & Links Verified Clean:** Confirmed that `index.html`, `contact.html`, `components/header.html`, and `components/footer.html` contain zero links to `/portal/` or `/admin/`.

---

### 6. Architectural Recommendations to Achieve Real Edge Isolation

To truly exclude `/portal/` and `/admin/` from production without breaking local development, the business owners must choose one of two structural solutions:

#### Option 1: Configure Cloudflare Pages Build Pipeline (Recommended)
- Set Cloudflare Pages Build Command: `node scripts/build-public.js`
- Set Cloudflare Pages Build Output Directory: `dist-public`
- Add `dist-public/` to `.gitignore`.
- Result: Cloudflare Pages compiles and deploys only the hardened distribution, leaving internal prototypes completely excluded from the edge.

#### Option 2: Physical Repository Decoupling (Monorepo Split)
- Move `/portal/` and `/admin/` into a private internal repository (`craftegon-portal-internal`).
- Keep `craftegon-ccs` strictly as the public marketing and client intake website.
- Host the portal on a separate authenticated subdomain (e.g., `https://portal.craftegon.com`) behind zero-trust access controls.

---

### 7. Definitive Release-Gate Verdict on Exclusion

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                   PORTAL / ADMIN EXCLUSION VERDICT:                            ║
║                   FAILED / UNVERIFIED AT THE EDGE                              ║
║                                                                                ║
║  Public navigation is clean, but the deployment pipeline remains unhardened.  ║
║  Deploying the repository root will serve /portal/ and /admin/ to the public.  ║
╚════════════════════════════════════════════════════════════════════════════════╝
```
