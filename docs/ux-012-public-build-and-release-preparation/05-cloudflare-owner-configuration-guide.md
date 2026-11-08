# TASK-CCS-UX-012: Cloudflare Pages Owner Configuration Guide
## Step-by-Step Instructions for Activating the Isolated Public Build Pipeline

**Project:** CraftEgon Corporate Services (CCS)  
**Production Domain:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  

---

### 1. Purpose of This Guide

Currently, the production website `https://ccs.craftegon.com/` is deployed via Cloudflare Pages using root-level directory serving (zero build).

This guide provides the project owner with exact, step-by-step instructions to configure Cloudflare Pages so that every subsequent deployment automatically executes `scripts/build-public.js` and publishes exclusively the hardened, isolated `dist-public/` artifact.

> [!IMPORTANT]
> Until the owner updates these two fields in the Cloudflare dashboard, pushing changes to the repository will continue to serve from the repository root. Applying this configuration takes less than 2 minutes and requires no downtime.

---

### 2. Configuration Settings Summary

| Setting Field | Current Value | Required New Value | Notes |
| :--- | :--- | :--- | :--- |
| **Framework Preset** | `None` | `None` | Plain Node.js static build |
| **Build Command** | *(empty / none)* | `node scripts/build-public.js` | Executes public build script |
| **Build Output Directory** | `/` | `dist-public` | Serves only the release directory |
| **Root Directory** | `/` | `/` | Root of Git repository |
| **Environment Variables** | *(none required)* | `NODE_VERSION = 20` *(recommended)* | Ensures modern Node.js runtime |

---

### 3. Step-by-Step Instructions

#### Step 1: Sign in to Cloudflare Dashboard
1. Open [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and log in with the account owning `craftegon.com`.
2. In the left navigation menu, click **Workers & Pages**.
3. Under the **Pages** tab, select the project associated with `ccs.craftegon.com` (e.g., `craftegon-ccs` or `ccs`).

#### Step 2: Access Build Settings
1. Click the **Settings** tab at the top of the project overview.
2. In the left sub-menu, click **Builds & deployments**.
3. Locate the section titled **Build configuration** and click the **Edit configuration** button.

#### Step 3: Enter Build Command & Output Directory
1. **Framework preset:** Leave as **None** (or custom).
2. **Build command:** Enter exactly:
   ```bash
   node scripts/build-public.js
   ```
3. **Build output directory:** Enter exactly:
   ```bash
   dist-public
   ```
4. **Root directory:** Leave as `/` (do not change).
5. Click **Save**.

#### Step 4: Configure Node.js Version (Recommended)
1. Still under **Settings** → **Builds & deployments**, scroll down to **Environment variables**.
2. Click **Add variable** under **Production**:
   - **Variable name:** `NODE_VERSION`
   - **Value:** `20.18.0` (or `22`)
3. Click **Save**.

#### Step 5: Trigger a Clean Build & Verify
1. Go to the **Deployments** tab.
2. Click **Create deployment** or select the latest commit and click **Retry deployment**.
3. Alternatively, make a new commit on `main` and push to GitHub.
4. Watch the build log:
   - It will run `node scripts/build-public.js`.
   - Output will report:
     `[BUILD COMPLETE] Assembled 154 files (2.49 MB) in dist-public/`
     `Sanitized 15 residual internal links.`
   - Cloudflare Pages will report:
     `Uploading build output from dist-public...`
     `Success: Deployment complete!`

---

### 4. Post-Deployment Verification Checklist

After the first build finishes, perform these verification checks in your browser:

1. **Homepage Check:**
   - Visit `https://ccs.craftegon.com/`
   - Verify mint-and-sky visual styling, hero banner, canonical services grid, and single phone number `+91 86069 18247`.
2. **Portal Exclusion Check (CRITICAL):**
   - Visit `https://ccs.craftegon.com/portal/dashboard.html`
   - **Expected Result:** HTTP 404 page ("Page Not Found — RoC Compliance & Retainer Desk").
   - **MUST NOT:** Load the client portal dashboard mock.
3. **Admin Exclusion Check:**
   - Visit `https://ccs.craftegon.com/admin/index.html`
   - **Expected Result:** HTTP 404 page.
4. **Internal Docs Exclusion Check:**
   - Visit `https://ccs.craftegon.com/docs/ux-012-public-build-and-release-preparation/00-executive-summary.md`
   - **Expected Result:** HTTP 404 page.
5. **Entity Search Engine Check:**
   - Visit `https://ccs.craftegon.com/search/index.html`
   - Verify that search input works and results link to canonical service pages.
6. **Contact Journey Check:**
   - Visit `https://ccs.craftegon.com/contact.html`
   - Verify desk location: "Operational Service Desk, Alappuzha, Kerala".
   - Submit a test inquiry to verify validation and static fallback options.

---

### 5. Rollback Procedure (Contingency)

In the highly unlikely event that any issue occurs:
1. Return to **Settings** → **Builds & deployments** → **Build configuration**.
2. Clear the build command and set the output directory back to `/`.
3. Click **Save** and trigger a re-deployment.
*(Note: Because `dist-public/` has been verified by 51 automated tests, rollback is not anticipated).*
