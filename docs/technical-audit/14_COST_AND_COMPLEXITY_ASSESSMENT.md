# CraftEgon Corporate Services (CCS)
# Cost and Complexity Assessment

**Document Reference:** `docs/technical-audit/14_COST_AND_COMPLEXITY_ASSESSMENT.md`  
**Audit Date:** November 2026  
**Auditor:** Technical Management Consultant & Full-Stack Architect  
**Approved Budget Constraint:** Strictly Below ₹1,00,000  
**Working Spend Plan:** ₹85,000 (including ₹8,000 reserve)  
**Unallocated Headroom:** ₹15,000  

---

## 1. Budget Allocation & Working Spend Plan

To ensure the launch of the CraftEgon Corporate Services website remains strictly within the owner's approved **below-₹1-lakh budget**, the following working budget plan is structured across delivery phases:

| Phase | Scope & Deliverables | Estimated Amount | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0: Technical Discovery & Audit** | Codebase inspection, technology inventory, security review, URL mapping, and architectural assessment. | ₹12,000 | Complete (This Audit) |
| **Phase 1: Priorities & Content Curation** | Approval of Core 5 services, 3-tier operating model, `about.html` institutional disclosures, regulatory updates (Angel tax abolition). | ₹15,000 | Complete |
| **Phase 2: Website & UX Remediation** | Homepage conversion redesign, Core 5 13-section template expansion, universal directory restructuring, WCAG AA contrast remediation. | ₹30,000 | Complete |
| **Phase 3: Lead Operations & Validation** | Fail-closed form fallback, WhatsApp/Email pre-fill generators, anti-spam honeypot, contact desk routing. | ₹10,000 | Complete |
| **Phase 4: Trust, SEO & Launch QA** | Link mesh integrity (123 files), 75 automated test suites, JSON-LD Schema.org validation, sitemap/robots verification, 25 screenshots. | ₹10,000 | Complete |
| **Controlled Reserve Buffer** | Contingency allocation for post-launch adjustments or owner-requested copy tweaks. | ₹8,000 | Unspent |
| **TOTAL WORKING PLAN** | **Complete Website MVP Delivery** | **₹85,000** | **₹15,000 Below Cap** |

> [!NOTE]
> The ₹15,000 remaining between the ₹85,000 working plan and the ₹1,00,000 budget cap represents **unallocated financial headroom**, not approved scope expansion. It remains entirely unspent.

---

## 2. Infrastructure & Hosting Cost Comparison

| Hosting Model | Upfront Setup Cost | Recurring Monthly Burn | Annual Infrastructure Cost | Commercial Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages Static (Current)** | **₹0.00** | **₹0.00 / month** | **₹0.00** | **RECOMMENDED (Option A)**: Zero hosting cost; unlimited bandwidth; global edge CDN. |
| **Managed WordPress / Webflow (CMS)** | ₹25,000 – ₹45,000 | ₹2,500 – ₹4,500 / month | ₹30,000 – ₹54,000 / year | **REJECTED (Option C)**: High recurring burn; plugin security vulnerabilities. |
| **AWS Full-Stack (EC2 + RDS Postgres)** | ₹60,000 – ₹90,000 | ₹5,500 – ₹9,000 / month | ₹66,000 – ₹1,08,000 / year | **REJECTED (Option D)**: Severe budget violation; unnecessary maintenance overhead. |
| **Vercel Pro + Supabase Pro** | ₹30,000 – ₹50,000 | ₹3,500 – ₹5,000 / month | ₹42,000 – ₹60,000 / year | **DEFERRED (Phase 2)**: Consider only when paid portal subscriptions begin. |

---

## 3. Complexity Elimination Matrix

A critical responsibility of this technical audit is identifying and eliminating unnecessary engineering complexity that consumes budget without producing revenue:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 UNNECESSARY COMPLEXITY ELIMINATED FROM MVP                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ❌ Stateful Authenticated Client Portal (Deferred to Phase 2/3)              │
│ ❌ Production PostgreSQL Cluster & Migration Deployment (Deferred)          │
│ ❌ Live Payment Gateway Subscriptions (Razorpay commercial activation deferred)│
│ ❌ External Paid LLM APIs (OpenAI / Anthropic token burn eliminated)        │
│ ❌ Premature Microservices & Dynamic SSR Hydration (Eliminated)             │
├─────────────────────────────────────────────────────────────────────────────┤
│                 LEAN HIGH-VALUE ASSETS DELIVERED FOR MVP                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ 123 Static HTML5 Pages with Sub-50ms Global Edge Delivery                │
│ ✅ 5 Standardized 13-Section Core Service Launch Pages                      │
│ ✅ Universal 57-Service Directory with Stage / Vertical Facet Filters        │
│ ✅ Zero-Cost, Fail-Closed Lead Routing via Verified WhatsApp and Email      │
│ ✅ 100% Passing Automated Regression Harness (75 Suites via npm test)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Cost Drivers & Risk Factors

1. **Third-Party SaaS Subscriptions:** Zero third-party SaaS subscriptions are required to launch or operate the website today.
2. **Maintenance Overhead:** Because there are zero runtime npm dependencies, there are no recurring package patch cycles or framework upgrades.
3. **Operational Simplicity:** The business owner can operate the website indefinitely without paying retainer fees to external DevOps agencies.
