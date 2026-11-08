# TASK-CCS-UX-009: Client Portal & Admin Console Exclusion & Containment Plan

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Governing Authority:** Owner Business Decisions 4.4 & 4.5  
**Auditor:** Principal Software Architect & Cybersecurity Lead  
**Date:** November 8, 2026

---

## 1. Authoritative Mandate & Threat Model

In strict accordance with Owner Decisions 4.4 and 4.5:
- **Decision 4.4 (Client Portal):** The client portal suite (`/portal/`) must be **completely excluded from the public website** until it is fully engineered, backed by authenticated persistent infrastructure, and separately authorized.
- **Decision 4.5 (Admin Console):** The administrative console (`/admin/`) must also be **completely excluded from the public website**.

### Threat Model & Why `robots.txt` / `noindex` Are Insufficient:
1. `robots.txt` directives and `<meta name="robots" content="noindex">` are merely advisories for well-behaved search engine crawlers. They are **not access controls**.
2. Any visitor, competitor, or automated vulnerability scanner entering `https://ccs.craftegon.com/portal/` or `https://ccs.craftegon.com/admin/` directly can inspect the mock dashboard, view prototype wireframes, or probe non-existent API routes.
3. Simply hiding links in navigation menus leaves files publicly reachable via direct URL requests.
4. **Conclusion:** Physical exclusion from the public production deployment artifact is the only robust security and brand-protection solution.

---

## 2. Inventory of Files Targeted for Exclusion

The following **6 application files** and associated private styles will be removed from the public publishing directory:

| Path on Disk | Purpose / Current State | Risk Profile if Left Deployed | Action |
| :--- | :--- | :--- | :--- |
| `portal/index.html` | Mock Client Portal Login | Confuses visitors expecting a functional login account. | **Exclude from Build** |
| `portal/dashboard.html` | Mock Compliance Workspace | Displays hardcoded synthetic filing deadlines and alerts. | **Exclude from Build** |
| `portal/subscription.html`| Mock Retainer Management | Displays mock billing tiers and retainers. | **Exclude from Build** |
| `portal/documents.html` | Mock Document Upload Vault | Contains non-functional drag-and-drop file inputs. | **Exclude from Build** |
| `admin/index.html` | Mock Admin Governance Panel | Exposes internal operational workflows and lead tables. | **Exclude from Build** |
| `admin/login.html` | Mock Admin Authentication | Displays an administrative login form returning API 404s. | **Exclude from Build** |
| `assets/css/portal.css` | Bespoke Portal Stylesheet | Unnecessary dead code on public marketing site. | **Exclude from Build** |
| `admin/admin.js` | Mock Admin JavaScript | Inert administrative scripting logic. | **Exclude from Build** |

---

## 3. Four-Step Exclusion Architecture

### Step 1: Source Code Preservation in Private Branch
Before removing any files from the production branch:
1. Create a dedicated Git branch: `git checkout -b feature/portal-admin-suite`.
2. Commit all portal, admin, and backend migration scripts to this branch.
3. This branch will serve as the private workspace for future backend engineering (e.g., when implementing Supabase, Firebase, or Node/Postgres authentication).

### Step 2: Clean Public Web Root Excisions
On the public production branch (`main`):
1. Remove the `portal/` directory.
2. Remove the `admin/` directory.
3. Remove `assets/css/portal.css` and `admin/admin.js`.
4. Remove references to portal/admin in `package.json` test scripts (`test:task-d`, `test:admin`, `admin/admin.js` syntax check).

### Step 3: Cloudflare Edge Routing Updates (`_redirects`)
Update the `_redirects` configuration file to remove clean rewrites that previously exposed these endpoints:

```diff
- # --- Clean URL Rewrites (Status 200 for internal mapping) ---
- /admin         /admin/index.html       200
- /admin/        /admin/index.html       200
- /admin/*       /admin/:splat           200
- /portal        /portal/index.html      200
- /portal/*      /portal/:splat          200
```
- **Outcome:** Any request to `ccs.craftegon.com/portal/` or `ccs.craftegon.com/admin/` will fall through to the global 404 handler (`/* /404.html 404`), returning a clean HTTP 404 response.

### Step 4: Sitemap & Robots Directive Cleanup
1. Ensure `sitemap.xml` contains zero references to `/portal/` or `/admin/` (verified: already clean).
2. Retain `Disallow: /admin/` and `Disallow: /portal/` in `robots.txt` as defense-in-depth against lingering external backlinks.

---

## 4. Alternative Gating Architecture: Cloudflare Access (Zero Trust)

If the business owner wishes to retain the administrative dashboard or client portal mockups for internal stakeholder presentations on a staging URL without exposing them to the public:
1. Deploy a private staging subdomain: `staging.ccs.craftegon.com`.
2. Configure **Cloudflare Access (Zero Trust)** over `staging.ccs.craftegon.com/admin/*` and `/portal/*`.
3. Require email One-Time PIN (OTP) restricted exclusively to the business owner's authorized email address.
4. **Outcome:** Unauthenticated requests are blocked at the Cloudflare edge prior to serving any HTML.
