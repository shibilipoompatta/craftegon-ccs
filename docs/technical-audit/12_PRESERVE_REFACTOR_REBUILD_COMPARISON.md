# CraftEgon Corporate Services (CCS)
# Preserve / Refactor / Rebuild Comparison

**Document Reference:** `docs/technical-audit/12_PRESERVE_REFACTOR_REBUILD_COMPARISON.md`  
**Audit Date:** November 2026  
**Auditor:** Senior Software Architect & Technical Management Consultant  
**Commercial Constraint:** Strictly Below ₹1,00,000  
**Business Priority:** Public Website & Lead Generation  

---

## 1. Comparative Options Matrix

| Dimension | Option A: Preserve & Improve (Recommended) | Option B: Refactor Existing Codebase | Option C: Rebuild Public Website Only | Option D: Complete Greenfield Redevelopment |
| :--- | :--- | :--- | :--- | :--- |
| **Strategic Premise** | Audit, polish, and launch the existing 123 static HTML/CSS/JS assets on Cloudflare Pages. | Introduce a frontend bundler (Vite/Astro) or headless CMS while retaining core content. | Discard the custom HTML codebase; rebuild public marketing pages on WordPress/Webflow. | Scrap both frontend and backend; build a full-stack Next.js/Remix + PostgreSQL app from scratch. |
| **Technical Feasibility** | **Very High (10/10)**<br>Zero technical blockers; 75/75 automated test suites already pass. | **Medium (6/10)**<br>Requires rewriting component injection, assets paths, and test scripts. | **Low (4/10)**<br>Re-creating 123 content pages, calculators, and schemas in a CMS is tedious. | **Extremely Low (2/10)**<br>Massive engineering scope; cannot be delivered within budget or timeline. |
| **Budget Feasibility (< ₹1,00,000)**| **Fully Compliant**<br>Working plan: ₹85,000 (includes ₹8k reserve, leaves ₹15k headroom). | **High Risk**<br>Estimated cost: ₹60,000 – ₹90,000 (Risks consuming entire budget). | **Violates Budget Cap**<br>Estimated cost: ₹1,20,000 – ₹1,80,000 + CMS subscription fees. | **Severe Violation**<br>Estimated cost: ₹3,00,000 – ₹6,00,000+. |
| **Time to Launch** | **Immediate (1 – 2 Weeks)** | **4 – 6 Weeks** | **8 – 12 Weeks** | **16 – 24 Weeks** |
| **Monthly Hosting Cost** | **₹0.00 / month** (Cloudflare Pages) | **₹0.00 – ₹1,500 / month** | **₹2,000 – ₹4,500 / month** (CMS + Hosting + Plugins) | **₹4,000 – ₹10,000 / month** (VPS + Managed DB + Redis) |
| **Supply Chain Vulnerability Risk** | **Zero** (0 npm runtime dependencies; clean `npm audit`). | **Medium** (Bundler plugins, dependencies, Node build pipeline). | **High** (WordPress theme/plugin vulnerabilities, Webflow lock-in). | **High** (Large npm dependency tree, framework updates). |
| **SEO Equity Preservation** | **100% Preserved**<br>119 canonical URLs, titles, meta, and JSON-LD schemas remain intact. | **Moderate Risk**<br>Hydration mismatches, build rewrites may alter URL structures. | **High Risk**<br>Likely broken links, redirect latency, loss of hand-crafted schema graphs. | **Severe Risk**<br>Complete loss of existing crawl index; requires massive 301 redirect map. |

---

## 2. In-Depth Evaluation of Each Alternative

### OPTION A — Preserve and Improve Existing Website (RECOMMENDED)
- **Technical Feasibility:** Exceptional. The codebase is already complete, functional, mobile-responsive, and backed by a comprehensive automated test harness (75/75 passing suites).
- **Advantages:**
  - Zero disruption to existing work; capitalizes on months of accumulated research, statutory filing workflows, and content curation.
  - Zero recurring hosting cost on Cloudflare Pages (Free Tier).
  - 100% link mesh integrity (0 broken links across 123 HTML files).
  - Instant edge paint times (< 50ms TTFB globally).
  - Fail-closed lead flow via WhatsApp and Email channels guarantees zero lead data loss.
- **Disadvantages:**
  - Content edits require modifying HTML or JSON files directly (no visual drag-and-drop WYSIWYG editor).
- **Indicative Cost:** ₹0 in new software purchases. Fits cleanly into the ₹85,000 working plan.

---

### OPTION B — Refactor Existing Codebase
- **Technical Feasibility:** Moderate. Involves migrating vanilla HTML/JS into a modern static site generator (e.g. Astro or 11ty) or bundler (Vite).
- **Advantages:**
  - Improved templating via components (`.astro` or Nunjucks partials).
- **Disadvantages:**
  - Introduces a build pipeline and node dependency footprint where none was previously required.
  - High probability of breaking existing test scripts (`verify-links.js`, `test-service-search.js`).
  - Consumes developer hours without adding customer-facing business value.
- **Indicative Cost:** ₹60,000 – ₹90,000 in refactoring engineering fees.

---

### OPTION C — Rebuild Only the Public Website (CMS Migration)
- **Technical Feasibility:** Low. Moving 123 custom HTML pages, 57 canonical services, 15 practice hubs, and interactive late fee calculators into WordPress, Webflow, or Squarespace.
- **Advantages:**
  - Non-technical staff can edit blog posts and page copy via a graphical dashboard.
- **Disadvantages:**
  - Ongoing SaaS subscription fees (Webflow: ~$29–$39/month; WordPress: managed hosting + security plugins).
  - Re-creating complex custom calculators (`calculator.js`, `ai-document-generator.html`) inside CMS plugins is costly and fragile.
  - Substantial risk of SEO traffic drop during URL migration.
- **Indicative Cost:** ₹1,20,000 – ₹1,80,000 setup + ₹30,000/year recurring. (Exceeds ₹1,00,000 budget cap).

---

### OPTION D — Complete Greenfield Redevelopment
- **Technical Feasibility:** Completely Unjustified. Scrapping the entire repository to build a dynamic full-stack Next.js/React application with live PostgreSQL database, authentication, and client portal.
- **Why It Fails Commercial Criteria:**
  - The business owner’s approved budget is **strictly below ₹1,00,000**.
  - A full-stack legal-tech SaaS platform costs between ₹3,00,000 and ₹6,00,000 to architect, build, audit, and deploy securely.
  - A startup corporate services firm does not need a complex authenticated portal before validating basic market demand and generating consistent lead volume.
- **Indicative Cost:** ₹3,50,000 – ₹6,00,000. (3.5x to 6x over budget).

---

## 3. Comparative Recommendation Synthesis

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                    STRATEGIC VERDICT                             │
  ├──────────────────────────────────────────────────────────────────┤
  │ Option A (Preserve & Improve) is the ONLY option that:           │
  │  1. Honors the below-₹1,00,000 budget constraint.                │
  │  2. Leverages the existing 123 verified HTML assets.             │
  │  3. Maintains zero recurring monthly hosting costs.              │
  │  4. Preserves 100% SEO link equity and Schema.org graphs.        │
  │  5. Allows immediate commercial launch within 1-2 weeks.         │
  └──────────────────────────────────────────────────────────────────┘
```
