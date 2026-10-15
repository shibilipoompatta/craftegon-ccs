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
├── conversion/                 # 19 Diagnostic tools, calculators, intake forms & checkout funnels
├── docs/
│   └── audit/                  # Formal technical audit & verification deliverables
│       ├── initial-audit.md
│       ├── route-inventory.md
│       ├── feature-inventory.md
│       ├── implementation-roadmap.md
│       └── skeleton-verification.md
├── knowledge/                  # 10 Statutory blueprints (SPICe+, AOC-4, FLA, DPDP, Transfer Pricing)
├── legal/                      # 5 Policies (Terms, Privacy [DPDP 2023], Disclaimer, Refund, Confidentiality)
├── portal/                     # 3 Client Portal pages (Dashboard calendar ticker, Subscription tiers)
├── scripts/                    # Automated testing & quality assurance test suite
│   ├── verify-links.js         # Internal link & anchor crawler (0 broken links)
│   ├── check-orphans.js        # Reverse reference crawler (0 orphan pages)
│   ├── audit-seo.js            # Metadata, canonical, title, description & schema auditor
│   └── test-chat-engine.js     # Statutory intent & routing test engine
├── services/                   # 57 Specialized commercial service landing pages
├── verticals/                  # 15 Practice area hubs (01 Entity Formation to 15 IT & Digital)
├── _redirects                  # Cloudflare Pages edge routing rules (/portal/* 200, /* /404.html 404)
├── 404.html                    # Branded 404 error page with quick recovery triggers
├── index.html                  # Root corporate gateway & interactive portal showcase
├── package.json                # Standard npm test runner definitions
├── robots.txt                  # Search engine crawl directives & sitemap location
└── sitemap.xml                 # XML sitemap indexing all 110 content routes
```

---

## 4. Verification & Testing

The repository includes an automated in-tree quality assurance suite using Node.js built-ins:

```bash
# Run all tests (links, orphans, SEO, chat grounding, and JS syntax):
npm test

# Run individual verification suites:
npm run test:links     # Scans all 113 HTML files for dead internal links
npm run test:orphans   # Verifies all pages are linked in navigation or content
npm run test:seo       # Verifies titles, descriptions, canonicals, schemas & OG tags
npm run test:chat      # Grounding test for GenAI Co-Pilot statutory intents
```

---

## 5. Deployment Workflow (Cloudflare Pages)

1. **Pre-flight Checks**: Execute `npm test` to verify 100% test pass.
2. **Git Commit & Push**:
   ```bash
   git status
   git push origin main
   ```
3. **Automated Edge Build**: Cloudflare Pages automatically detects changes on `main` and deploys the static bundle globally in < 30 seconds.
4. **Smoke Test**: Visit [https://ccs.craftegon.com](https://ccs.craftegon.com/) and verify headers, forms, calculators, and contact links.

---

## 6. Statutory Disclaimer & Regulatory Framework

CraftEgon CCS provides corporate secretarial, statutory compliance, and document drafting infrastructure. All formal legal representation, court appearances, and litigation advocacy before the NCLT, NCLAT, High Courts, and Supreme Court are handled exclusively through our panel of independent associated advocates and senior legal counsel in strict adherence to the Advocates Act, 1961 and Bar Council of India regulations.
