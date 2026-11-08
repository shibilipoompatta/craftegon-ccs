# TASK-CCS-UX-010: Client Portal & Admin Console Public Exclusion Verification

**Project:** CraftEgon Corporate Services (CCS)  
**Document:** `docs/ux-010-controlled-website-transformation/09-portal-admin-public-exclusion-verification.md`  
**Execution Date:** November 8, 2026  
**Implementation Tool:** `scripts/build-public.js`  

---

## 1. Context & Owner Directives

Previous technical audits (TASK-003 through TASK-007) and TASK-009 identified serious customer-facing risks regarding the Client Portal (`/portal/`) and Admin Console (`/admin/`):
- **Synthetic/Demo Data Risk:** The prototype portal presented simulated MCA V3 entity lookups, mock compliance calendars, and pre-populated corporate filings. If accessed by public customers, this prototype could be mistaken for an operational, real-time government-connected platform.
- **Mandatory Authoritative Owner Decision:**
  > *"Client Portal: EXCLUDE from public website (navigation, promotional links, sitemap, publishing artifact). Preserve source code."*  
  > *"Admin Console: EXCLUDE from public website (navigation, sitemap, publishing artifact). Preserve source code."*

---

## 2. Engineering Solution: Dual-Environment Architecture

To satisfy both the owner's strict directive (complete exclusion from public publishing artifacts) and the repository's continuous integration requirements (maintaining 100% test pass rate across existing test suites):

### 2.1 Development Workspace vs. Public Distribution Separation
1. **In the Local Development Tree:**
   - Source code for `portal/*.html` and `admin/*.html` is completely preserved.
   - Internal test suites (such as `test-phase-1-remediation.js` and `test-service-search.js`) continue to validate syntax, security gating, and backward compatibility without errors.
2. **In the Public Publishing Pipeline (`scripts/build-public.js`):**
   - An automated build script packages the clean public website into `dist-public/`.
   - The build process strictly excludes `portal/`, `admin/`, `scratch/`, `docs/`, and `scripts/`.
   - Generates a hardened `_redirects` configuration that explicitly returns HTTP `404` for all incoming requests to `/admin*` and `/portal*`:
     ```
     /admin*            /404.html               404
     /portal*           /404.html               404
     ```
   - Generates a sanitized public `sitemap.xml` that strips all `/portal/` URLs and includes the new `/contact.html` route.

---

## 3. Public Link Cleansing Actions

1. **Homepage (`index.html`):**
   - Zero links to `/portal/` or `/admin/`.
   - All references to client management point to `/contact.html` or `/services/`.
2. **Global Navigation (`components/navbar.html`):**
   - "Client Portal" primary button removed from header actions.
   - Contact navigation points to `/contact.html`.
3. **Chat Engine (`assets/js/chat-widget.js`):**
   - Replaced portal intent actions (`/portal/dashboard.html`, `/portal/subscription.html`) with public services (`/services/roc-annual-compliance.html`, `/conversion/calculator.html`, `/conversion/retainer-desk.html`).
4. **Error Page (`404.html`):**
   - Directs lost visitors to `/services/`, `/conversion/calculator.html`, or `/contact.html`.

---

## 4. Release-Gate Verification

The public build script was executed and validated:
```
$ node scripts/build-public.js
============================================================
CRAFTEGON CCS — BUILDING PUBLIC PRODUCTION DISTRIBUTION
============================================================

✅ Public distribution build completed in dist-public/
✅ /portal/ and /admin/ excluded from public build
✅ Hardened _redirects configured with 404 for prototype routes
```
When deployed via Cloudflare Pages using `dist-public` as the root publishing artifact, public visitors requesting `/portal/` or `/admin/` will receive a clean 404 Not Found response, fully containing all prototype risks.
