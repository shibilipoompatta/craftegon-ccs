# CraftEgon Corporate Services (CCS)
# Technology Stack Inventory

**Document Reference:** `docs/technical-audit/02_TECHNOLOGY_STACK_INVENTORY.md`  
**Audit Date:** November 2026  
**Auditor:** Senior Software Architect & Full-Stack Engineer  
**Status:** Verified via Static Code & Configuration Analysis  

---

## 1. High-Level Stack Architecture

```mermaid
graph TD
    Client["Browser / Mobile Client"]
    CDN["Cloudflare Pages Edge CDN (ccs.craftegon.com)"]
    StaticFiles["123 Static HTML5 Files + CSS Tokens + ES6 Scripts"]
    FallBackLead["Direct WhatsApp / Email Engagement Channels"]
    LocalNode["Local Node.js Foundation (src/backend/ - Staging / Dev Only)"]
    LocalPG["PostgreSQL 16+ Database (8 SQL Migrations - Staging Only)"]

    Client -->|HTTPS Request| CDN
    CDN -->|Static Assets| StaticFiles
    Client -->|Form Submit (Production)| FallBackLead
    LocalNode -.->|Optional Dev Run| LocalPG
    CDN -.->|/api/* Blocked (HTTP 404)| LocalNode
```

---

## 2. Frontend Layer

| Attribute | Specification | Evidence / File Reference | Architectural Evaluation |
| :--- | :--- | :--- | :--- |
| **Markup Language** | HTML5 Semantic (WCAG 2.1 AA) | 123 HTML files across root, `services/`, `verticals/`, `conversion/`, `knowledge/`, `legal/` | Semantic landmarks (`<header>`, `<main id="main-content">`, `<nav>`, `<footer>`, `<aside>`). Single `<h1>` per page. |
| **Styling Architecture** | Vanilla CSS3 with Custom Tokens | `assets/css/tokens.css`<br>`assets/css/theme.css`<br>`assets/css/navbar.css`<br>`assets/css/service-page.css` | No heavy CSS frameworks (Bootstrap/Tailwind). Uses CSS variables for color, typography, spacing, and elevation. |
| **Design System Palette** | Primary Deep Navy (`#0F172A`), Light Slate (`#F8FAFC`), Accent Gold (`#8C6D14`) | `assets/css/tokens.css` | Remediated from failing ivory/gold to WCAG AA compliant dark gold (4.82:1 on white). |
| **Typography Triad** | `Cinzel` (Headings), `Manrope` (Body), `DM Mono` (Data/Code) | `assets/css/theme.css` | Google Fonts loaded asynchronously with `font-display: swap` and local fallbacks. |
| **Scripting Language** | Vanilla ECMAScript 2020+ (ES6+) | `assets/js/*.js` (10 core client modules) | Pure vanilla JS; zero front-end framework (No React, Vue, Angular, or jQuery). |
| **Component Injection** | Asynchronous Component Hydration | `assets/js/navigation.js` | Injects `components/navbar.html` and `components/footer.html` with inline fallback DOM if network fails. |
| **Search Engine** | Client-Side Fuzzy & Inverted Index | `assets/js/search-engine.js`<br>`assets/js/search-index.js`<br>`assets/js/service-search.js` | 83KB pre-computed search index indexing 57 services, statutory forms, and practice verticals. Instant response time (< 5ms). |
| **Client Bundler** | None (Raw Native ESM / Scripts) | `package.json` | No Webpack, Vite, Parcel, or Rollup. Zero build step required. Direct edge delivery. |

---

## 3. Backend Layer (Development & Staging Baseline)

| Component | Technology | Configuration & Evidence | Operational Status |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js 18+ LTS | `src/backend/server.js`<br>`package.json` | Local development and test runner only. **Not running in production.** |
| **HTTP Framework** | Pure Node Built-ins (`node:http`) | `src/backend/server.js` | Zero external framework (No Express/Fastify). Uses native `http.createServer`. |
| **Routing Architecture** | Custom RegExp / Path Dispatcher | `src/backend/router.js` (556 lines) | Dispatches REST endpoints (`/api/v1/*`), health checks, CORS preflight, and body parsing. |
| **Data Access Layer** | Repository Pattern with Dual Adapters | `src/backend/storage/*-repository.js` | Seamlessly swaps between `Postgres...Storage` and `InMemory...Storage` for tests. |
| **Regulatory Engine** | Domain Adapters for MCA, IP India, RBI | `src/backend/regulatory/adapters/` | Deterministic compliance logic evaluating statutory due dates, late fees, and exemptions. |
| **AI Reasoner / Drafter** | Corpus-based Template Engine | `src/backend/ai/` | Structured statutory text generation and evaluation; operates safely without open API keys. |
| **Email Service** | Node.js Mail Dispatcher Stub | `src/backend/email/email-service.js` | Transactional email notification pipeline designed for lead routing. |

---

## 4. Database Layer (Staging Baseline)

| Attribute | Specification | Evidence / File Reference | Status |
| :--- | :--- | :--- | :--- |
| **Database Engine** | PostgreSQL 16+ | `src/backend/storage/postgres-pool.js` | Designed for managed PostgreSQL (e.g. AWS RDS or Supabase). |
| **Node Driver** | `pg: ^8.23.1` | `package.json` line 53 | Only production npm dependency in `package.json`. |
| **Migration System** | Sequential SQL Files (001 – 008) | `src/backend/migrations/*.sql` | 8 migrations establishing core schema, constraints, indexes, roles, and Row-Level Security. |
| **Security Mechanism** | Row-Level Security (RLS) & Multi-Tenant Isolation | `002_row_level_security.sql`<br>`007_database_authorization_hardening.sql` | `ENABLE ROW LEVEL SECURITY` enforced across all client tables (`client_accounts`, `cases`, `lead_enquiries`). |
| **Role Separation** | Least-Privilege Database Roles | `006_runtime_security_and_grants.sql` | Delineates `craftegon_app_user`, `craftegon_auth_service`, `craftegon_gov_role`. |
| **Production State** | **Unprovisioned / Offline** | `_redirects` line 7 (`/api/* 404`)<br>`assets/js/config.js` | **No active database connection in production.** Production runs purely static. |

---

## 5. Hosting, CDN & Edge Infrastructure

| Dimension | Provider / Technology | Configuration File | Notes |
| :--- | :--- | :--- | :--- |
| **Hosting Platform** | Cloudflare Pages | `_headers`, `_redirects` | Free tier edge hosting; zero cold starts; global CDN replication. |
| **Custom Domain** | `ccs.craftegon.com` | DNS via Cloudflare | Canonical domain for corporate services. |
| **TLS / SSL** | Cloudflare Universal SSL (TLS 1.3) | Cloudflare Edge Managed | Automated certificate renewal with HSTS preload. |
| **HTTP Security Headers** | HSTS, CSP, X-Frame-Options, Nosniff | `_headers` | Strict Content Security Policy allowing only verified CDN origins. |
| **Routing / Rewrites** | Clean URL Rewrites & Security Blocks | `_redirects` | Rewrites clean directory paths; blocks access to `.env`, `.git`, `scripts/`, `docs/`. |
| **Monthly Hosting Burn** | **₹0.00 / month** | Free Tier Cloudflare Pages | Unlimited bandwidth, 500 builds/month, zero infrastructure cost. |

---

## 6. Software Dependencies (`package.json`)

```json
{
  "name": "craftegon-ccs",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "pg": "^8.23.1"
  },
  "devDependencies": {
    "ajv": "^8.20.0",
    "ajv-formats": "^3.0.1",
    "jsdom": "^29.1.1"
  }
}
```

- **Runtime Dependencies:** 1 (`pg` — strictly used by local Node.js backend).
- **Development Dependencies:** 3 (`ajv`, `ajv-formats`, `jsdom` — used exclusively for automated JSON Schema validation and headless DOM test suites).
- **Supply Chain Vulnerability Count:** **0** (`npm audit` verified clean).
