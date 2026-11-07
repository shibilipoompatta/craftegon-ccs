# CraftEgon Corporate Services (CCS)
# Hosting and Deployment Assessment

**Document Reference:** `docs/technical-audit/10_HOSTING_AND_DEPLOYMENT_ASSESSMENT.md`  
**Audit Date:** November 2026  
**Auditor:** Senior DevOps Engineer & Cloud Infrastructure Architect  
**Current Host:** Cloudflare Pages  
**Monthly Infrastructure Cost:** **₹0.00 / month**  
**Rollback Capability:** Instantaneous One-Click Edge Reversion  

---

## 1. Hosting Architecture & Infrastructure Profile

CraftEgon Corporate Services is deployed on **Cloudflare Pages**, a modern edge platform designed for static sites and JAMstack architectures:

```
┌────────────────────────────────────────────────────────┐
│             CLOUDFLARE PAGES EDGE PROFILE              │
├────────────────────────────────────────────────────────┤
│ CDN Network:           Cloudflare Anycast (300+ PoPs)   │
│ Production Host:       ccs.craftegon.com               │
│ Build Command:         None (Direct Static Serving)    │
│ Build Output Dir:      / (Repository Root)             │
│ Bandwidth Allowance:   Unlimited (Free Tier)           │
│ Builds Allowance:      500 per month (Free Tier)       │
│ Global Latency:        < 50ms average Time-To-First-Byte│
│ SSL / TLS:             Automated Universal SSL (TLS 1.3│
│ DDoS Protection:       Unmetered L3/L4/L7 Mitigation   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Configuration & Edge Rules

### 2.1 HTTP Response Headers (`_headers`)
Applied automatically at the Cloudflare edge:
- **Cache-Control:**
  - CSS & JS: `public, max-age=0, must-revalidate` (Ensures users always receive the latest styles and logic without stale cache issues).
  - Images: `public, max-age=86400` (1-day edge caching for logos and graphics).
- **Security Defense-in-Depth:**
  - HSTS: `max-age=31536000; includeSubDomains; preload` (Forces HTTPS).
  - CSP: Restricts scripts, styles, fonts, and connects to verified origins.
  - Framing: `X-Frame-Options: DENY` and `frame-ancestors 'none'`.

### 2.2 Clean URL Rewriting & Path Guardrails (`_redirects`)
1. **Clean Route Mapping:** Rewrites directory queries (e.g. `/services`, `/knowledge`, `/portal`, `/admin`) to their respective `index.html` files with HTTP Status 200.
2. **Access Control Directives:** Blocks direct public HTTP requests to internal development files:
   - `/.env*` $\rightarrow$ `/404.html` (404)
   - `/.git*` $\rightarrow$ `/404.html` (404)
   - `/scripts/*` $\rightarrow$ `/404.html` (404)
   - `/docs/*` $\rightarrow$ `/404.html` (404)
   - `/data/*.schema.json` $\rightarrow$ `/404.html` (404)
   - `/api/*` $\rightarrow$ `/404.html` (404)
3. **Global Fallback:** `/*` $\rightarrow$ `/404.html` (404) ensures non-existent URLs display the branded 404 page rather than an unstyled Cloudflare error.

---

## 3. Deployment Pipeline & Git Integration

- **CI/CD Mechanism:** Cloudflare Pages integrates directly with the GitHub repository (`shibilipoompatta/craftegon-ccs`).
- **Build Step:** Because the frontend is vanilla HTML/CSS/JS, no build compilation step is required. Cloudflare simply clones the repository and pushes the static assets to the edge CDN in under 30 seconds.
- **Pre-Deployment Quality Gate:** Developers execute `npm test` locally prior to pushing to `main`. This ensures all 75 automated test suites (link integrity, orphan checks, SEO schemas) pass before deployment.

---

## 4. Rollback & Disaster Recovery Mechanisms

1. **Instantaneous Edge Rollback:** Cloudflare Pages maintains a permanent immutable history of every deployment. In the event of a breaking change or content error, the administrator can revert to any prior deployment with a single click in the Cloudflare Dashboard, taking effect globally within seconds.
2. **Version Control Snapshots:** Git branch management on `main` ensures full traceability of all commit hashes, authors, and timestamps.
3. **Data Integrity:** Because no dynamic database is live in production, there is zero risk of database corruption, data loss, or failed migration rollbacks on the public site.

---

## 5. Environment Separation Matrix

| Environment | Hostname | Mode | API State | Intended Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | `ccs.craftegon.com`<br>`craftegon.com` | Live Edge CDN | Static Showcase (`isStatic: true`) | Public marketing, lead generation, WhatsApp/Email routing. |
| **Staging** | `staging.ccs.craftegon.com` | Edge Preview | Dynamic Capable (`isDynamic: true`) | Staging review and client acceptance testing. |
| **Local Development** | `localhost:8080`<br>`127.0.0.1:8089` | Localhost | Configurable | Feature development, screenshot capture, automated test runs. |

---

## 6. Financial & Commercial Assessment

| Cost Component | Provider | Billing Frequency | Current Annual Cost |
| :--- | :--- | :--- | :--- |
| **Web Hosting & Global CDN** | Cloudflare Pages (Free Tier) | Monthly | **₹0.00** |
| **DDoS & WAF Protection** | Cloudflare Edge (Included) | Monthly | **₹0.00** |
| **SSL / TLS Encryption** | Cloudflare Universal SSL | Annual | **₹0.00** |
| **Domain Registration** | `craftegon.com` | Annual | ~₹1,000 / year (Existing asset) |
| **Total Recurring Hosting Burn** | — | — | **₹0.00 / month** |

**Conclusion:** The hosting infrastructure is virtually indestructible, globally fast, highly secure, and costs ₹0 per month. Migrating away from Cloudflare Pages would be a severe commercial error.
