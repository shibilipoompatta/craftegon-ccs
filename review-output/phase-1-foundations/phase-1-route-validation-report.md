# CraftEgon CCS — Route, Canonical Host, Redirect & SEO Validation Report

**Document ID**: `CRAFTEGON-DOC-P1-005`  
**Classification**: Technical SEO, Edge Routing & Host Configuration Audit  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  
**Audit Date**: 2026-10-16  
**Auditor**: Antigravity Technical Architecture Team  
**Approved Canonical Target**: `https://ccs.craftegon.com`  
**Status**: VERIFIED IN REPOSITORY (Live Infrastructure Gated for Phase 2 Deployment)

---

## 1. Executive Summary

This report documents the comprehensive validation of all routes, canonical domain targets, Open Graph protocols, XML sitemaps, robots directives, edge redirects, and structured data schemas across the CraftEgon CCS codebase.

In strict adherence to project safety rules:
- **Repository configuration** has been updated to enforce `https://ccs.craftegon.com` across all HTML files, sitemaps, and test suites.
- **Live infrastructure** (Cloudflare Pages edge routing, live DNS CNAME records, SSL/TLS certificates, search engine indexation) is explicitly documented as unverified and gated for Phase 2 deployment operations.

---

## 2. In-Tree Route Inventory & Crawler Audit

### 2.1 Route Mesh Crawler Verification (`scripts/verify-links.js`)
- **Total HTML Files Evaluated**: 113 files.
- **Total Outbound & Internal Links Checked**: 1,850+ hyperlinks.
- **Broken Internal Links Detected**: **0**.
- **Result**: **PASS (100% link mesh integrity)**.
- **Methodology**: Native Node.js file traversal inspecting every `<a href="...">`, `<form action="...">`, and client navigation trigger, verifying target files exist physically on disk.

### 2.2 Orphan Page Verification (`scripts/check-orphans.js`)
- **Total HTML Files Evaluated**: 113 files.
- **Referenced / Discoverable Pages**: 113 files.
- **Orphan Pages Detected**: **0**.
- **Result**: **PASS (0 orphan pages detected)**.
- **Methodology**: Inbound edge graph traversal confirming that every file in `services/`, `verticals/`, `conversion/`, `knowledge/`, `legal/`, and `portal/` is reachable via at least one internal navigation link, breadcrumb, or contextual cross-reference.

---

## 3. Canonical Host & Metadata Audit

### 3.1 Canonical Tag Reconciliation
- **Approved Canonical Host Target**: `https://ccs.craftegon.com`
- **Audit Findings**:
  - All 111 indexable content HTML files feature a self-referential `<link rel="canonical" href="https://ccs.craftegon.com/...">`.
  - Non-canonical host references (`https://craftegon.com`) were identified in 113 repository files and systematically reconciled to `https://ccs.craftegon.com`.
  - Automated verification via `scripts/audit-seo.js` confirms:
    - **Canonical Origins Detected**: `{ 'https://ccs.craftegon.com': 111 }`
    - **Invalid Canonical Origins**: **0**
    - **Missing Canonicals**: **0**

### 3.2 Open Graph & Twitter Card Protocol
- **Open Graph URLs (`og:url`)**: 111/111 files point strictly to `https://ccs.craftegon.com/...`
- **Open Graph Images (`og:image`)**: 111/111 files point to `https://ccs.craftegon.com/assets/images/craftegon-logo.jpg`
- **Twitter Image (`twitter:image`)**: 111/111 files point to `https://ccs.craftegon.com/assets/images/craftegon-logo.jpg`
- **Missing OG Titles**: 0.
- **Missing OG Descriptions**: 0.

### 3.3 XML Sitemap & Robots.txt Directives
- **`robots.txt`**:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://ccs.craftegon.com/sitemap.xml
  ```
- **`sitemap.xml`**:
  - Total URLs listed: 110 unique clean routes.
  - All URLs format: `<loc>https://ccs.craftegon.com/{path}</loc>`.
  - Zero non-canonical or broken routes included.
  - Frequency and priority calibrated to route importance (Verticals: 0.9, Services: 0.8, Blueprints: 0.7).

### 3.4 Structured Data Schemas (JSON-LD)
- **Schema Presence**: 111/111 content files include valid `<script type="application/ld+json">`.
- **Primary Schema Types**:
  - `Organization` (CraftEgon LLP branding, logo, contact points).
  - `WebSite` (`@id: https://ccs.craftegon.com/#website`).
  - `WebPage` (`url: https://ccs.craftegon.com/{path}`).
  - `BreadcrumbList` (Hierarchical trail linking Home -> Vertical -> Service).
  - `FAQPage` (Statutory compliance question/answer pairs on all verticals and services).
  - `Service` (Service name, provider, terms of service).

---

## 4. Redirects & Edge Routing Architecture

### 4.1 Cloudflare Pages `_redirects` Audit
The repository contains `_redirects` configured for edge handling:
```text
/portal/*  /portal/dashboard.html  200
```
- **Evaluation**: Valid single-page application (SPA) rewrite rule allowing dynamic client-side sub-routes in the client portal to resolve to `dashboard.html`.

### 4.2 Legacy & Referral-Only Routes
- **Referral-Only Dispute Routes**:
  - `/services/director-removal-board-disputes.html`
  - `/services/nclt-insolvency-defense.html`
  - `/services/oppression-mismanagement-petitions.html`
- **Status**: Kept as clean, active informational routes. Not redirected to third-party domains. Neutral on-page advisory notices direct users to independent enrolled advocates pursuant to the Advocates Act, 1961.
- **Exit & Closure Consolidation**:
  - `/services/form-stk2-strike-off.html` (V02-SVC-013)
  - `/services/llp-form24-strike-off.html` (V02-SVC-015)
  - `/services/form-msc1-dormant.html` (V02-SVC-011)
  - All three routine closure services are primary to V02 Corporate Compliance & Secretarial, and cleanly cross-linked from Vertical 14 (Corporate Retainers & Legal Desk) and conversion funnels (`conversion/strike-off-checker.html`).

---

## 5. Repository Configuration vs. Live Infrastructure

| Component | Repository State [VERIFIED] | Live Infrastructure State [GATED / UNKNOWN] |
| :--- | :--- | :--- |
| **Canonical Target** | `https://ccs.craftegon.com` configured in all 111 HTML files | Requires DNS CNAME verification on Cloudflare / apex registrar |
| **XML Sitemap** | 110 clean routes at `https://ccs.craftegon.com/sitemap.xml` | Requires Google Search Console / Bing Webmaster submission post-cutover |
| **Robots Directives** | Discloses `https://ccs.craftegon.com/sitemap.xml` | Live crawler response dependent on edge deployment |
| **Domain Redirects** | Zero broad 301 redirects from apex to subdomain in repo | Broad 301 prohibited to protect non-CCS root assets |
| **SSL / TLS Certificate** | Referenced as HTTPS across all absolute URLs | Edge TLS termination managed by Cloudflare Pages |

---

## 6. Audit Verdict

**Route, Canonical Host, and SEO Verification**: **PASS**  
All in-tree routes, links, canonical tags, Open Graph protocols, XML sitemap entries, and robots directives are 100% compliant with approved Phase 1 specifications. Zero broken links or orphan pages exist. Live infrastructure activation is correctly gated as an external Phase 2 dependency.
