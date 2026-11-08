# Cloudflare Pages Configuration Review & Edge Architecture Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-014  
**Date:** 2026-11-08  
**Evaluator:** Senior DevOps Engineer & Web Security Auditor  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Executive Summary

This document defines the exact, authoritative Cloudflare Pages build and deployment configuration required to safely publish the CraftEgon Corporate Services public website.

Publishing a static site repository that contains internal administrative modules (`/portal/`, `/admin/`, `src/`, `docs/`) presents a critical exposure risk if the hosting platform is improperly configured. This review details the technical safeguards implemented in the local build pipeline and specifies the mandatory Cloudflare dashboard settings to prevent accidental leakage of internal tools or unvetted systems.

---

## 2. Authoritative Cloudflare Pages Project Settings

To ensure only vetted public assets are served at the edge, Cloudflare Pages must be configured with the following parameters:

| Configuration Parameter | Required Cloudflare Setting | Verification Status | Rationale |
| :--- | :--- | :--- | :--- |
| **Project Name** | `craftegon-ccs` (or designated Cloudflare project name) | **EXTERNAL CONFIGURATION REQUIRED** | Cloudflare Pages project namespace. |
| **Production Branch** | `main` | **VERIFIED FACT** | Matches repository default branch. |
| **Framework Preset** | `None` / `Custom` | **VERIFIED FACT** | Pure static output; avoids unwanted preset transformations. |
| **Build Command** | `node scripts/build-public.js` | **VERIFIED FACT** | Executes the public isolation compiler that outputs strictly vetted files. |
| **Build Output Directory** | `dist-public` | **VERIFIED FACT** | **CRITICAL SAFETY BOUNDARY:** Instructs Cloudflare Pages to publish ONLY `dist-public/`, never repository root. |
| **Root Directory** | `/` (leave empty or default) | **VERIFIED FACT** | Build script executes relative to repository root. |
| **Node.js Version** | `20` (or `NODE_VERSION=20`) | **VERIFIED FACT** | Matches local build environment (Node v20.19.0). Configurable via Environment Variable. |

---

## 3. The Root-Directory Exposure Risk & Mitigation

### 3.1 The Risk: Accidental Root Directory Publishing
If the Cloudflare Pages "Build output directory" is left empty, set to `/`, or set to `.`:
1. Cloudflare will publish the entire Git working tree.
2. Incomplete or unvetted modules (`/portal/*`, `/admin/*`) would become publicly accessible over the internet.
3. Internal documentation, test scripts, and build tooling would be exposed.

### 3.2 The Multi-Layered Defense-in-Depth Solution
CraftEgon CCS employs a two-tier containment strategy:
1. **Tier 1 — Build-Time Physical Isolation:**  
   `scripts/build-public.js` creates a dedicated directory `dist-public/` containing exclusively vetted public files. Portal, admin, documentation, and raw build tools are never copied into this directory.
2. **Tier 2 — Edge-Level Routing Denials (`_redirects`):**  
   Even within `dist-public/`, an edge `_redirects` file is published with high-priority wildcard rules:
   ```text
   # Explicit Denial of Internal/Unvetted Routes
   /portal/*  /404.html  404!
   /admin/*   /404.html  404!
   /portal    /404.html  404!
   /admin     /404.html  404!
   ```
   The `!` operator forces Cloudflare Pages to return an immediate HTTP 404 regardless of any file matching on the edge.

---

## 4. Edge Routing & Security Headers Specification

Cloudflare Pages automatically processes `_redirects` and `_headers` placed in the build output directory (`dist-public/`).

### 4.1 Edge Redirects (`dist-public/_redirects`)
- **/services rewrite:** `/services  /services.html  200` ensures clean URLs for the service catalog.
- **/portal wildcard denial:** `/portal/*  /404.html  404!` forces 404 status.
- **/admin wildcard denial:** `/admin/*  /404.html  404!` forces 404 status.

### 4.2 Edge Security Headers (`dist-public/_headers`)
Applied to all routes (`/*`):
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
```
- **X-Frame-Options: DENY** prevents framing/clickjacking attacks.
- **X-Content-Type-Options: nosniff** prevents MIME-type sniffing.
- **CSP (Content Security Policy)** enforces local origin script execution while permitting Cloudflare Turnstile bot protection (`challenges.cloudflare.com`) and Google Fonts.
- **Referrer-Policy: strict-origin-when-cross-origin** protects user privacy during external navigation.

---

## 5. Environment Variables & Runtime Dependencies

| Variable Name | Required Value | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Production & Preview | Guarantees consistent Node.js LTS runtime during Cloudflare CI build. |

- **Zero Secret Dependencies:** The public website build script requires **zero secrets or API keys**. No database credentials, payment keys, or third-party tokens are needed or stored.

---

## 6. Verification Checklist for Owner in Cloudflare Dashboard

Before triggering any deployment in Cloudflare Pages, the owner must verify the following items:

1. [ ] Log into Cloudflare Dashboard -> **Workers & Pages** -> **craftegon-ccs** (or create project).
2. [ ] Navigate to **Settings** -> **Builds & deployments**.
3. [ ] Under **Build configurations**:
   - **Framework preset:** `None`
   - **Build command:** `node scripts/build-public.js`
   - **Build output directory:** `dist-public` (Verify this is **NOT** blank or `/`).
   - **Root directory:** `/`
4. [ ] Under **Environment variables**:
   - Add variable `NODE_VERSION` with value `20`.
5. [ ] Under **Custom domains** (for Production only):
   - Ensure `ccs.craftegon.com` is configured with active SSL/TLS (Full or Strict).
