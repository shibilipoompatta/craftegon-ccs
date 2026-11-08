# TASK-CCS-UX-012: Public Build Manifest Report
## Artifact Inventory, File Categorisation & Verification Checksums

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Build Target Directory:** `dist-public/`  
**Manifest File:** `docs/ux-012-public-build-and-release-preparation/build-manifest.json`  
**Date:** November 2026  

---

### 1. Build Overview & Summary Metrics

The public release build was generated using `scripts/build-public.js` in a deterministic, isolated pipeline.

```
Total Files Included:          154
Total Output Size:             2,606,393 bytes (2.49 MB)
Total HTML Pages Included:     118 pages
Residual Links Sanitized:      15 links
Total Forbidden Paths in Dist: 0
Build Execution Time:          ~1.2 seconds
```

---

### 2. Breakdown by File Type and Extension

| Extension / Category | File Count | Approximate Size | Key Contents |
| :--- | :--- | :--- | :--- |
| **`.html` (Public Documents)** | 118 | ~1.65 MB | Homepage, service catalog (57 canonical services), vertical launchpads, knowledge guides, calculators, search engine, 404, contact, about. |
| **`.css` (Stylesheets)** | 6 | ~114 KB | `tokens.css`, `theme.css`, `navbar.css`, `home-unique.css`, `service-page.css`, `chat-widget.css`. |
| **`.js` (Client Scripts)** | 10 | ~142 KB | `config.js`, `theme.js`, `navbar.js`, `forms.js`, `chat-widget.js`, `calculator.js`, `search-engine.js`, `entity-intelligence.js`, etc. |
| **`.json` (Static Data/Indexes)** | 11 | ~460 KB | `services-index.json`, search indexes, rate cards, regulatory data mappings, `build-manifest.json`. |
| **`.jpg` / Images** | 1 | ~194 KB | `assets/images/craftegon-logo.jpg`. |
| **`.txt` (Text Protocols)** | 2 | ~1.5 KB | `robots.txt` (crawling policy), `humans.txt`. |
| **`.xml` (Sitemaps)** | 2 | ~35 KB | `sitemap.xml` (all 118 public URLs). |
| **Edge Config (`_redirects`, `_headers`)** | 2 | ~2.5 KB | Cloudflare Pages edge routing and security headers. |
| **Total** | **154** | **2.49 MB** | **Complete, self-contained public release package** |

---

### 3. Directory Structure of `dist-public/`

```
dist-public/
├── 404.html
├── about.html
├── contact.html
├── index.html
├── services.html
├── sitemap.xml
├── robots.txt
├── _headers
├── _redirects
├── build-manifest.json
├── assets/
│   ├── css/
│   │   ├── chat-widget.css
│   │   ├── home-unique.css
│   │   ├── navbar.css
│   │   ├── service-page.css
│   │   ├── theme.css
│   │   └── tokens.css
│   ├── data/
│   │   ├── [10 search and regulatory json datasets]
│   ├── images/
│   │   └── craftegon-logo.jpg
│   └── js/
│       ├── calculator.js
│       ├── chat-widget.js
│       ├── config.js
│       ├── entity-intelligence.js
│       ├── forms.js
│       ├── home-unique.js
│       ├── navbar.js
│       ├── search-engine.js
│       ├── theme.js
│       └── [other public scripts]
├── components/
│   ├── footer.html
│   └── navbar.html
├── conversion/
│   ├── incorporation-calculator.html
│   ├── post-incorporation-checkout.html
│   ├── retainer-desk.html
│   └── [conversion forms & landing pages]
├── knowledge/
│   ├── mca-v3-filing-guide.html
│   ├── gst-compliance-handbook.html
│   └── [statutory compliance guides]
├── landing/
│   ├── startup-launchpad.html
│   ├── nri-desk.html
│   └── [segment landing pages]
├── search/
│   └── index.html
└── services/
    ├── index.html
    ├── pvt-ltd-registration.html
    ├── llp-incorporation.html
    ├── roc-annual-compliance.html
    ├── gst-registration.html
    ├── trademark-registration.html
    └── [52 additional individual service pages]
```

---

### 4. Sanitization Details

The build pipeline scanned every HTML and JS file for accidental cross-boundary links pointing to the excluded `/portal/` directory. Exactly **15 occurrences** were detected and automatically re-routed:

| Original Link in Source | Sanitized Target in `dist-public/` | Context / Reason |
| :--- | :--- | :--- |
| `href="/portal/entity-search.html"` | `href="/search/index.html"` | Replaces internal prototype search link with public entity search engine. |
| `href="/portal/subscription.html"` | `href="/conversion/retainer-desk.html"` | Directs compliance retainer inquiries to public RoC retainer booking desk. |
| `href="/portal/dashboard.html"` | `href="/conversion/retainer-desk.html"` | Neutralises internal portal dashboard link on 404 card and chat suggestions. |
| `"/portal/index.html"` | `"/services/roc-annual-compliance.html"` | Replaces generic portal link in chat suggestions with public RoC service page. |

All 15 sanitizations have been verified by `scripts/verify-public-build.js` with zero residual occurrences remaining in `dist-public/`.
