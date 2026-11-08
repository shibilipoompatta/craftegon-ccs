# TASK-CCS-UX-013: Cloudflare Pages Pre-Deployment Checklist & Configuration Guide

**Project:** CraftEgon Corporate Services (CCS)  
**Production Domain:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  
**Auditor Status:** Independent Forensic Reviewer  

---

## 1. Explicit Safety & Boundary Notice

> [!IMPORTANT]
> **NO PRODUCTION DEPLOYMENT WAS PERFORMED DURING THIS AUDIT.**  
> The agent has not accessed, modified, or connected to the live Cloudflare dashboard, production DNS, or hosting infrastructure. The live domain `https://ccs.craftegon.com/` continues to serve its current configuration until the business owner independently applies the settings below.

---

## 2. Authoritative Cloudflare Pages Configuration

The following build parameters have been verified against `scripts/build-public.js` and `dist-public/`:

| Configuration Field | Required Production Setting | Purpose / Impact | Risk if Misconfigured |
| :--- | :--- | :--- | :--- |
| **Framework Preset** | `None` (or custom) | Informs Cloudflare not to apply Next.js/Vite/Astro presets. | Cloudflare may attempt to run uninstalled frameworks. |
| **Build Command** | `node scripts/build-public.js` | Compiles the public site, executes link sanitization, copies 151 production files, and synthesizes `_redirects` and `_headers`. | If left blank, Cloudflare will not assemble `dist-public/`. |
| **Build Output Directory** | `dist-public` | **CRITICAL:** Directs Cloudflare Pages to publish exclusively the contents of `dist-public/`. | **EXTREME RISK:** If left as `/`, Cloudflare will publish the entire Git repository, exposing `portal/`, `admin/`, `src/`, `docs/`, and `scripts/`. |
| **Root Directory** | `/` | Root of Git repository where `scripts/build-public.js` and `package.json` reside. | Build script will fail if set to a subfolder. |
| **Environment Variable** | `NODE_VERSION = 20` | Ensures modern Node.js runtime (v20.x or higher) with built-in crypto and fs support. | Legacy Node (v16) may fail modern JS syntax. |

---

## 3. Required Pre-Deployment Owner Action Checklist

Before triggering a production build in Cloudflare:

- [ ] **Owner Action 1: Verify Mailbox Status**  
  Send a test message from an external personal email to `admin@craftegon.com`. Verify that the message is received and monitored. If not yet provisioned, configure email forwarding or a live inbox before public announcement.
- [ ] **Owner Action 2: Verify WhatsApp Business Line**  
  Confirm that `+91 86069 18247` is active on WhatsApp Business and staffed during standard business hours.
- [ ] **Owner Action 3: Access Cloudflare Dashboard**  
  Log in at [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages** → Select `craftegon-ccs` project.
- [ ] **Owner Action 4: Update Build Configuration**  
  Navigate to **Settings** → **Builds & deployments** → **Build configuration** → **Edit configuration**:
  - Set **Build command:** `node scripts/build-public.js`
  - Set **Build output directory:** `dist-public`
  - Set **Root directory:** `/`
  - Click **Save**.
- [ ] **Owner Action 5: Set Node Version Environment Variable**  
  Under **Settings** → **Builds & deployments** → **Environment variables**:
  - Add `NODE_VERSION` with value `20`.
  - Click **Save**.
- [ ] **Owner Action 6: Trigger Production Build**  
  Navigate to **Deployments** → Click **Create deployment** (or retry latest deployment). Watch the build log to confirm `dist-public/` compilation.

---

## 4. Post-Deployment Verification Steps (Smoke Test)

Immediately following Cloudflare build completion, verify the live domain:

1. **Root Verification:**  
   Visit `https://ccs.craftegon.com/` → Confirm homepage loads with mint-and-sky visual aesthetic, single phone `+91 86069 18247`, and tagline "Building Business Infrastructure".
2. **Portal Interception Test (CRITICAL):**  
   Visit `https://ccs.craftegon.com/portal/dashboard.html`  
   - **MUST RETURN:** HTTP 404 (custom branded 404 page).  
   - **MUST NOT:** Load any client portal interface or mock dashboard.
3. **Admin Interception Test:**  
   Visit `https://ccs.craftegon.com/admin/index.html`  
   - **MUST RETURN:** HTTP 404.
4. **Documentation Interception Test:**  
   Visit `https://ccs.craftegon.com/docs/ux-013-final-public-build-verification/MASTER-REPORT.md`  
   - **MUST RETURN:** HTTP 404.
5. **Universal Services Directory Test:**  
   Visit `https://ccs.craftegon.com/services/`  
   - Confirm 57 canonical services display with working search and category filters.
6. **Contact & Enquiry Fallback Test:**  
   Visit `https://ccs.craftegon.com/contact.html`  
   - Submit a test inquiry. Confirm that the transparent static fallback appears offering direct WhatsApp and Email transmission.

---

## 5. Rollback Considerations

In the unlikely event that any post-deployment anomaly occurs:
1. In Cloudflare Pages dashboard, go to **Deployments**.
2. Identify the previous working deployment and click **Rollback to this deployment**.
3. Cloudflare restores the previous static asset state instantaneously with zero build delay.
