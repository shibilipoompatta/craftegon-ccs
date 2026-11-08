# TASK-CCS-UX-012: Current Publishing Architecture Review
## Forensic Audit of Zero-Build Cloudflare Pages Root Serving & Need for Build Isolation

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  

---

### 1. Architectural Baseline (Prior to TASK-012)

Prior to the execution of TASK-CCS-UX-012, CraftEgon Corporate Services operated on a zero-build static publishing model. The GitHub repository was connected directly to Cloudflare Pages with:
- **Build Command:** *(empty / none)*
- **Build Output Directory:** `/` (the root of the repository)
- **Deployment Trigger:** Push to branch `main`

#### Consequences of Root-Level Publishing
When Cloudflare Pages serves from the repository root, every file and directory in the repository that is not explicitly blocked at the edge is uploaded to the Cloudflare Pages asset CDN. This architecture introduced four critical vulnerabilities:

1. **Exposure of Internal Prototypes (`portal/` and `admin/`):**
   - The repository contains development prototypes for a client portal (`portal/dashboard.html`, `portal/vault.html`, `portal/filing-tracker.html`, `portal/compliance-calendar.html`) and an administrative management interface (`admin/`).
   - These interfaces contain mock data, client profile simulations, and prototype interfaces intended for private testing or future authenticated platforms.
   - Under root publishing, requests to `https://ccs.craftegon.com/portal/dashboard.html` or `https://ccs.craftegon.com/admin/index.html` were served directly to public visitors and web scrapers.
2. **Exposure of Internal Documentation & Engineering Artifacts:**
   - Directories such as `docs/`, `scripts/`, `scratch/`, `review-output/`, and `.vault/` were present in the repository root.
   - Any visitor guessing a direct URL (e.g., `https://ccs.craftegon.com/docs/ux-010-controlled-website-transformation/...`) could inspect confidential architectural deliberations, security audits, and internal strategies.
3. **Search Engine Indexing Risk:**
   - Web crawlers discovering internal prototype links in early script iterations or historical web archives could index simulated corporate records, synthetic compliance data, or administrative dashboards.
4. **Fragile Link Mesh:**
   - Public pages inadvertently containing links to `/portal/...` (such as chat engine suggestions or 404 error cards) directed real prospective clients to unauthenticated, unfinished prototype dashboards rather than commercial contact forms or RoC retainer desks.

---

### 2. The Architectural Solution: Public Build Isolation

To permanently resolve these vulnerabilities without disrupting the active development workflows or deleting internal prototypes needed for future phases, TASK-012 establishes a hardened build step:

```
[ Git Repository: main ]
         │
         ▼
[ scripts/build-public.js ]  ── (Filters & Sanitizes)
         │
         ├── Excludes: portal/, admin/, src/, docs/, scripts/, .vault/, review-output/
         ├── Sanitizes: Residual /portal/ links -> genuine public URLs
         ├── Copies: All 118 public HTML pages, CSS, JS, images, data
         ├── Generates: _redirects (Strict 404 for /portal* and /admin*)
         ├── Generates: _headers (CSP, HSTS, X-Frame-Options, X-Content-Type)
         ├── Generates: robots.txt (Blocks /portal, /admin, /api)
         └── Generates: sitemap.xml & build-manifest.json
         │
         ▼
[ dist-public/ Release Artifact ]
         │
         ▼
[ Cloudflare Pages Production Deployment ]
```

---

### 3. Comparison Matrix: Root Publishing vs. Isolated Build

| Dimension | Previous State (Root Publishing) | Target State (Isolated `dist-public/`) | Benefit |
| :--- | :--- | :--- | :--- |
| **Output Directory** | `/` (entire repository) | `dist-public/` | Only verified public files are published. |
| **Portal / Admin Access** | Accessible to anyone with URL | Completely physically absent (404 enforced) | Eliminates all customer confusion & mock exposure. |
| **Internal Docs Exposure** | `docs/` accessible if probed | `docs/` completely excluded from release | Commercial and architectural confidentiality preserved. |
| **Link Integrity** | 15 residual portal links in public pages | 0 residual portal links; all sanitized | Seamless user experience focused on conversion. |
| **Edge Hardening** | Basic headers, no portal redirect protection | Hardened `_redirects` & comprehensive `_headers` | Edge returns strict 404 before reaching filesystem. |
| **Build Reproducibility** | Undefined; whatever was in Git root | Deterministic; tracked via `build-manifest.json` | 100% auditable release artifacts. |

---

### 4. Implementation Path for Owner

The implementation requires zero changes to the underlying Git branch architecture. The owner simply configures Cloudflare Pages to run `node scripts/build-public.js` and serve `dist-public`. This completely neutralises the exposure surface while keeping the clean repository codebase intact.
