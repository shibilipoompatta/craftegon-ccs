# TASK-CCS-UX-009: Repository Architecture & Technology Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Auditor:** Principal Software Architect & DevOps Reviewer  
**Date:** November 8, 2026

---

## 1. Executive Technical Profile

A rigorous, evidence-based code and configuration inspection was executed across `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean` to determine the authentic technology stack, file architecture, and build pipeline.

### Architectural Ground Truth:
- **Architecture Type:** Multi-Page Application (MPA) constructed using pure vanilla HTML5, CSS3, and ES6+ JavaScript.
- **Frontend Frameworks:** **None.** The repository contains zero instances of React, Next.js, Vue, Nuxt, Angular, Astro, or Svelte.
- **Bundler / Build Tools:** **None.** There is no Webpack, Vite, Rollup, Parcel, or esbuild pipeline. HTML, CSS, and JS files are served raw and unbundled.
- **Hosting & Infrastructure:** Deployed as a static site to **Cloudflare Pages**. Edge routing, security headers, and rewrite behaviors are governed by `_redirects` and `robots.txt`.
- **Runtime Environment:** Pure client-side browser execution. There is no active server-side Node.js, Python, or PHP process running in production. Node.js is utilized exclusively on local developer machines for executing offline automated test suites and schema validation scripts.

---

## 2. Dependency & Package Manifest Audit

Inspection of `package.json` reveals the following configuration:

```json
{
  "name": "craftegon-ccs",
  "version": "1.0.0",
  "description": "CraftEgon Corporate Services (CCS) - Enterprise Corporate Governance & Legal Compliance Operating System",
  "private": true,
  "devDependencies": {
    "ajv": "^8.20.0",
    "ajv-formats": "^3.0.1",
    "jsdom": "^29.1.1"
  },
  "dependencies": {
    "pg": "^8.23.1"
  }
}
```

### Analysis of Dependencies:
1. **`ajv` (v8.20.0) & `ajv-formats` (v3.0.1):** DevDependencies used strictly in local Node test runners (`scripts/test-schemas.js` and `scripts/test-phase-6-schemas.js`) to validate static JSON datasets against draft-07 JSON Schemas. They do not ship in any client-side JavaScript bundle.
2. **`jsdom` (v29.1.1):** DevDependency used by local regression scripts to parse and test DOM trees (link checking, canonical tag audits, meta description verification, and orphan detection).
3. **`pg` (v8.23.1):** Listed under `dependencies`. This library was introduced during earlier backend prototyping tasks (`scripts/test-postgres-verification.js`). Because Cloudflare Pages static hosting does not execute Node.js scripts or backend database migrations, this driver is completely inert in production and should be pruned to eliminate confusion.

---

## 3. Directory Layout & File Organization

```
C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean/
├── index.html                   # Core public landing page (72KB, 1274 lines)
├── about.html                   # Institutional firm profile & practice standards
├── services.html                # Root Universal Corporate Services Directory
├── 404.html                     # Custom statutory route error page
├── _redirects                   # Cloudflare Pages edge routing rules
├── robots.txt                   # Web crawler directives
├── sitemap.xml                  # XML sitemap containing 119 canonical URLs
├── package.json                 # Project manifest & test runner definitions
├── admin/                       # [NON-PUBLIC] Admin console mockups (2 HTML files)
├── assets/
│   ├── css/                     # 7 CSS stylesheets (theme.css, navbar.css, tokens.css, etc.)
│   ├── js/                      # 10 modular JavaScript files (config.js, forms.js, etc.)
│   └── images/                  # Corporate logo and statutory iconography
├── components/                  # Shared HTML component fragments (navbar.html, footer.html)
├── conversion/                  # 20 interactive tools, calculators, and intake forms
├── data/                        # 12 JSON databases (services, pricing, eligibility, etc.)
├── docs/                        # Project governance, audit archives, and release records
├── knowledge/                   # 12 statutory guides and educational blueprints
├── legal/                       # 5 legal terms, privacy policies, and compliance disclaimers
├── portal/                      # [NON-PUBLIC] Client compliance portal mockups (4 HTML files)
├── scripts/                     # 13 active test suites and utility generators
├── search/                      # 1 third-party company/trademark/GSTIN search tool
├── services/                    # 58 files: 57 individual service pages + services/index.html
└── verticals/                   # 15 practice area vertical landing pages
```

---

## 4. Component Architecture & Client-Side Templating

### 4.1 Shared Component Injection
The site utilizes a hybrid templating mechanism:
1. **Static Pre-rendering:** In each HTML page, the complete markup for `<header class="if-header">` and `<footer class="if-footer">` is directly hardcoded. This ensures instant First Contentful Paint (FCP) and prevents layout shifts (CLS) when JavaScript is loading or disabled.
2. **Client-Side Hydration & Fallback:** `assets/js/navigation.js` attempts to asynchronously `fetch('/components/footer.html')` and `/components/navbar.html`. If the fetch succeeds, it dynamically synchronizes any updated footer elements; if the fetch fails (or runs offline), it falls back seamlessly to the hardcoded markup.
3. **Defect Identified:** Maintaining both hardcoded static markup in 123 HTML files AND shared component fragments in `components/` creates maintenance divergence. For example, updating the footer address in `components/footer.html` does not automatically update the hardcoded HTML across all 123 files unless a build script or manual sweep is executed.

---

## 5. CSS Architecture & Design Token Implementation

The visual styling is partitioned across seven stylesheets:
1. `assets/css/tokens.css` & `assets/css/theme.css`: Declares CSS custom properties (`:root`), defining color palettes, border radii, typography stacks, and focus states.
2. `assets/css/navbar.css`: Contains styles for the fixed top header (`.if-header`), mega-menus, search bar overlay, and mobile drawer navigation.
3. `assets/css/home-unique.css`: Bespoke layout styles for the homepage hero, feature grids, and trust sections.
4. `assets/css/service-page.css`: Styles for service detail layouts, deliverable cards, and sticky consultation sidebars.
5. `assets/css/portal.css`: Styles for the simulated client portal suite.
6. `assets/css/chat-widget.css`: Styles for the floating corporate assistant widget.

---

## 6. JavaScript Architecture & State Management

Client-side logic is organized into self-contained, event-driven modules:
1. `assets/js/config.js`: Central configuration store setting global parameters (`window.CRAFTEGON_CONFIG`).
2. `assets/js/navigation.js`: Manages mobile menu toggling, drawer focus traps, and breadcrumbs.
3. `assets/js/service-search.js` & `assets/js/search-index.js`: Powers instant in-memory filtering of all 57 services across categories, practice areas, and MCA form numbers.
4. `assets/js/forms.js`: Handles client-side form validation, reference code generation (`CCS-REQ-XXXX`), and offline WhatsApp message serialization.
5. `assets/js/calculator.js`: Calculates statutory MCA late fees and stamp duty estimates using pure client-side mathematical logic.
6. `assets/js/chat-widget.js`: Floating interactive advisory widget using keyword regex matching to route users to relevant service pages.

---

## 7. Automated Test Runner & Verification Infrastructure

The repository possesses a mature, comprehensive automated regression harness executed via `npm test`:

| Test Suite Script | Verification Domain | Operational Verification |
| :--- | :--- | :--- |
| `scripts/verify-links.js` | 100% Link Mesh Integrity | Scans all 123 HTML files; verifies all anchor targets exist on disk. |
| `scripts/check-orphans.js` | Graph Reachability | Traverses link graph from `index.html`; detects unreachable pages. |
| `scripts/audit-seo.js` | Technical SEO Compliance | Validates titles, meta descriptions, canonical URLs, and OG tags. |
| `scripts/test-schemas.js` | Ajv JSON Schema Validation | Asserts JSON datasets match strict schema definitions. |
| `scripts/test-service-search.js` | Search Algorithm Accuracy | Runs 75 automated queries testing exact forms, aliases, and typos. |
| `scripts/test-trademark-search.js`| DOM-XSS Security | Injects malicious script payloads; verifies HTML entity encoding. |
| `scripts/test-phase-1-form-fallback.js`| Operational Continuity | Asserts offline form submission generates verified WhatsApp links. |

---

## 8. Summary of Architectural Bottlenecks

1. **No Static Site Generator (SSG) / Component Compiler:** Managing 123 static HTML files by hand risks drift between shared headers, footers, and meta tags.
2. **Dual Duplicate Routes for Services:** `services.html` and `services/index.html` are identical copies on disk.
3. **Inert Backend Code:** Prototype database migration scripts and PostgreSQL drivers remain in `scripts/` and `package.json`, confusing development boundaries on a static Cloudflare Pages site.
4. **Publishing Artifact Contamination:** Non-public prototype directories (`/admin/` and `/portal/`) reside directly inside the public deployment root.
