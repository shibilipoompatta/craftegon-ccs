# CraftEgon Corporate Compliance Services (CCS)

> Enterprise-grade digital corporate compliance infrastructure, statutory filing portals, and multi-vertical professional legal-tech directory for Indian corporate affairs.

---

## 1. Platform Overview

**CraftEgon Corporate Compliance Services (CCS)**, operating under **CraftEgon LLP**, delivers high-velocity, accurate corporate governance, statutory secretarial compliance, direct & indirect tax advisory, and cross-border regulatory architecture.

- **Production Live**: [https://ccs.craftegon.com](https://ccs.craftegon.com/) &bull; [https://craftegon.com](https://craftegon.com/)
- **Repository**: `shibilipoompatta/craftegon-ccs`
- **Architecture**: Pure static-first web platform (HTML5, Vanilla CSS3 with Custom Tokens, ES6+ JavaScript).
- **Edge Deployment**: Optimized for **Cloudflare Pages** CDN.
- **Dependencies**: **Zero third-party npm runtime dependencies** for maximum security, sub-second edge paint times, and complete auditability.

---

## 2. Canonical Business Contact Details

Centralized in [`assets/js/config.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/config.js) and rendered across header, mobile drawer, footer, forms, and JSON-LD schema:

- **Entity**: CraftEgon Corporate Compliance Services, under CraftEgon LLP
- **Headquarters**: Kozhikode, Kerala, India &bull; PIN: 673001
- **Telephone / WhatsApp**: `+91 86069 18247`
- **WhatsApp Direct Action URL**: `https://wa.me/918606918247`
- **Business Email**: `admin@craftegon.com`
- **Email Action URL**: `mailto:admin@craftegon.com`

---

## 3. Directory Anatomy

```
craftegon-ccs/
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (Ivory, Gold, Silver & Charcoal palette)
│   │   ├── theme.css           # Global typography triad (Cinzel, Manrope, DM Mono) & base layout
│   │   ├── navbar.css          # Fixed header, mega-menu, mobile off-canvas drawer & footer
│   │   ├── service-page.css    # Standardized service cards, pricing grids, and FAQ accordions
│   │   ├── portal.css          # Client portal, compliance calendar ticker & SaaS subscription UI
│   │   └── chat-widget.css     # Floating GenAI Customer Co-Pilot chat interface
│   ├── js/
│   │   ├── config.js           # Centralized configuration source of truth (contact & domains)
│   │   ├── navigation.js       # Asynchronous header/footer injector with offline fallbacks
│   │   ├── forms.js            # Truthful input validation & WhatsApp/Email staged fallbacks
│   │   ├── calculator.js       # Statutory RoC late fee & retainer computation engine
│   │   └── chat-widget.js      # Zero-dependency RAG-lite statutory knowledge chat assistant
│   └── images/
│       └── craftegon-logo.jpg  # Official brand insignia
├── components/
│   ├── navbar.html             # Institutional header with 15-vertical mega-menu & WhatsApp CTA
│   └── footer.html             # Institutional 5-column footer with statutory legal disclaimers
├── conversion/                 # 19 Diagnostic tools, calculators, intake funnels & checkout funnels
├── docs/                       # Governance, risk, claims & technical audit deliverables
│   ├── phase-1-foundations-audit.md  # Architectural baseline, findings & evidential classifications
│   ├── phase-1-risk-register.csv     # 12-point risk matrix (XSS, claims, litigation scope, DNS)
│   ├── phase-1-claims-register.csv   # Comprehensive claims inventory & truthfulness dispositions
│   ├── phase-1-route-register.csv    # 113-route registry (53 locked IDs, V09-SVC-003, 3 referrals)
│   ├── phase-1-validation.md         # Exact test execution outputs, environment & limitations
│   ├── audit/                        # Phase 0 route & feature inventories
│   └── product-blueprint/            # 16-document statutory architecture & product blueprints
├── knowledge/                  # 10 Statutory blueprints (SPICe+, AOC-4, FLA, DPDP, Transfer Pricing)
├── legal/                      # 5 Policies (Terms, Privacy [DPDP 2023], Disclaimer, Refund, Confidentiality)
├── portal/                     # 3 Client Portal pages (Dashboard calendar ticker, Subscription tiers)
├── scripts/                    # Automated testing & quality assurance test suite
│   ├── verify-links.js         # Internal link & anchor crawler (0 broken links across 113 files)
│   ├── check-orphans.js        # Reverse reference crawler (0 orphan pages)
│   ├── audit-seo.js            # Metadata, canonical, title, description & schema auditor
│   ├── test-chat-engine.js     # Statutory intent & routing test engine (10 intents, 30 URLs)
│   └── test-trademark-search.js# Real DOM-level XSS regression & false-claim test suite (40 checks)
├── services/                   # 57 Specialized commercial & educational service landing pages
├── verticals/                  # 15 Practice area hubs (01 Entity Formation to 15 IT & Digital)
├── _redirects                  # Cloudflare Pages edge routing rules (/portal/* 200, /* /404.html 404)
├── 404.html                    # Branded 404 error page with quick recovery triggers
├── index.html                  # Root corporate gateway & interactive portal showcase
├── package.json                # Standard npm test runner definitions
├── robots.txt                  # Search engine crawl directives & sitemap location
└── sitemap.xml                 # XML sitemap indexing all 110 content routes
```

---

## 4. Phase 1 Foundations & Governance Status

Phase 1 foundations have been completed and verified within the local non-production working tree:

| Governance Area | Implemented & Evidenced State | Verification Status |
| :--- | :--- | :--- |
| **15-Vertical Taxonomy** | Fully approved and aligned across navigation, vertical hubs, and service routes | **VERIFIED** |
| **Active Service Ownership** | 53 retained active services locked with exact IDs and primary vertical owners | **VERIFIED** |
| **Transactional Merger Scope** | `services/nclt-merger-petitions.html` locked to `V09-SVC-003` for transactional secretarial scheme execution under Sections 230–232; contentious advocacy excluded | **VERIFIED** |
| **Litigation Firewall** | 3 litigation/insolvency routes (`nclt-insolvency-defense.html`, `oppression-mismanagement-petitions.html`, `director-removal-board-disputes.html`) converted to External Referral Only (NO service ID, NO primary vertical, NO CCS representation offer) | **VERIFIED** |
| **Taxonomy Coverage Gaps** | V08 (Fundraising), V14 (Exit/Insolvency), and V15 (IT/Digital) explicitly retained as documented gaps; no synthetic services or speculative IDs created | **VERIFIED** |
| **DOM-XSS Mitigation** | `conversion/trademark-search.html` refactored to safe DOM node creation (`textContent`); zero `innerHTML` interpolation of user input; tested via `jsdom` (40/40 checks pass) | **VERIFIED** |
| **Truthful Claims** | Removed deceptive claims of "Live MCA V3 Connector", "Real-time sync", and false trademark availability guarantees; replaced with truthful, rules-grounded descriptions | **VERIFIED** |
| **Canonical Strategy** | Intended canonical domain is `https://ccs.craftegon.com`; in-tree sources currently reference `https://craftegon.com`. Broad redirects from root domain are strictly prohibited; canonical tag cutover is gated pending DNS verification | **GATED** |

### Gated Items for Production Deployment Owner:
1. **DNS & Hosting Delegation**: Authoritative DNS configuration of CNAME `ccs.craftegon.com` and SSL certificate provisioning on Cloudflare Pages.
2. **Production Canonical Cutover**: Updating in-tree canonical metadata from `https://craftegon.com` to `https://ccs.craftegon.com` once live edge routing is verified.
3. **Advocate Network Agreements**: Formal bilateral execution of panel representation agreements with independent practicing advocates under the Advocates Act, 1961.

---

## 5. Verification & Testing

The repository includes an automated in-tree quality assurance suite using Node.js built-ins and `jsdom`:

```bash
# Run all tests (links, orphans, SEO, chat grounding, trademark XSS, and JS syntax):
npm test

# Run individual verification suites:
npm run test:links     # Scans all 113 HTML files for dead internal links (0 broken links)
npm run test:orphans   # Verifies all pages are linked in navigation or content (0 orphans)
npm run test:seo       # Verifies titles, descriptions, canonicals, schemas & OG tags (100% pass)
npm run test:chat      # Grounding test for GenAI Co-Pilot statutory intents (10/10 intents)
npm run test:tm        # Real DOM-level XSS regression & claim integrity suite (40/40 checks)
```

---

## 6. Deployment Workflow (Cloudflare Pages)

> [!IMPORTANT]
> Non-production working tree only. Production deployment must remain disabled until Phase 1 review sign-off and deployment-owner DNS verification.

1. **Pre-flight Checks**: Execute `npm test` to verify 100% test pass.
2. **Production Review & Git Push**:
   ```bash
   git status
   git push origin main
   ```
3. **Automated Edge Build**: Cloudflare Pages automatically detects changes on `main` and deploys the static bundle globally in < 30 seconds.
4. **Smoke Test**: Visit [https://ccs.craftegon.com](https://ccs.craftegon.com/) and verify headers, forms, calculators, and contact links.

---

## 7. Statutory Disclaimer & Regulatory Framework

CraftEgon CCS provides corporate secretarial, statutory compliance, and document drafting infrastructure. All formal legal representation, court appearances, and litigation advocacy before the NCLT, NCLAT, High Courts, and Supreme Court are handled exclusively through our panel of independent associated advocates and senior legal counsel in strict adherence to the Advocates Act, 1961 and Bar Council of India regulations.
