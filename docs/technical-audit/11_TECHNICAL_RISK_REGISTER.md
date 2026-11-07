# CraftEgon Corporate Services (CCS)
# Technical Risk Register

**Document Reference:** `docs/technical-audit/11_TECHNICAL_RISK_REGISTER.md`  
**Audit Date:** November 2026  
**Auditor:** Senior Technical Risk Analyst & Cybersecurity Reviewer  
**Scope:** Architectural, Operational, Security, Commercial & Regulatory Risks  

---

## 1. Technical Risk Matrix

| Risk ID | Category | Risk Description | Likelihood | Impact | Severity | Mitigation & Controls | Residual Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TR-01** | Architecture | **Backend Disconnect:** Node.js backend in `src/backend/` is unhosted, while frontend expects static mode in production. | High | Medium | **Medium** | Keep static showcase mode as the default for MVP. Connect serverless intake (Cloudflare Worker) only when Phase 2 budget is allocated. | **Low** |
| **TR-02** | Lead Gen | **Lead Drop-Off:** Visitor submits form, sees fallback notice, but fails to click WhatsApp or Email link. | Medium | Medium | **Medium** | Ensure fallback notice is prominent, explains direct human review, and provides clear one-click CTA buttons with pre-filled context. | **Low** |
| **TR-03** | Commercial | **Budget Overrun:** Prematurely attempting to deploy PostgreSQL, client portal, and multi-tenant auth within the < ₹1,00,000 budget cap. | High | High | **High** | Strictly freeze portal and database deployment for the MVP. Focus all resources on public website conversion and lead generation. | **Low** |
| **TR-04** | Regulatory | **Statutory Obsolescence:** MCA/CBDT statutory filing fees or rules change (e.g. MCA V3 forms, late fee caps) making static copy outdated. | Medium | High | **Medium** | Include explicit "Last Reviewed: November 2026" and statutory verification disclaimers on all fee schedules and service pages. | **Low** |
| **TR-05** | Operational | **Content Regression:** Non-technical editor edits HTML files directly and breaks link mesh or schema markup. | Medium | Medium | **Medium** | Enforce `npm test` pre-commit gate (75 automated test suites) before any git push to `main`. | **Low** |
| **TR-06** | Database | **Premature Migration 009 Execution:** Inadvertently applying Migration 009 or altering database roles before credentials are verified. | Low | High | **Medium** | Maintain project invariant: Migration 009 strictly unapplied. Database baseline locked to Migration 008. | **Low** |
| **TR-07** | Infrastructure| **DNS / CDN Misconfiguration:** Manual changes to Cloudflare DNS or SSL settings causing downtime. | Low | High | **Medium** | Restrict Cloudflare dashboard admin access to business owner; maintain version-controlled `_headers` and `_redirects`. | **Low** |
| **TR-08** | Compliance | **Legal Practice Misconception:** Visitor assumes CraftEgon CCS is a law firm rather than a corporate infrastructure provider. | Low | High | **Medium** | Published explicit non-advocacy demarcation under Advocates Act, 1961 in `about.html`, `legal/disclaimer.html`, and global footer. | **Low** |
| **TR-09** | Security | **Client-Side Data Leakage:** User enters confidential documents into calculators or interactive tools. | Low | Medium | **Low** | Calculators execute 100% in-browser; zero data transmission to external servers; tools do not request Aadhaar/passwords. | **Low** |
| **TR-10** | Search / SEO | **Canonical Cannibalization:** Duplicate URL indexing between root and subdirectories. | Low | Medium | **Low** | Canonical tags strictly enforced to `https://ccs.craftegon.com` across 119 content files; verified by `audit-seo.js`. | **Zero** |

---

## 2. Risk Mitigation Protocols

### Protocol A: Non-Destructive Code & Git Discipline
All updates to the codebase must follow the established non-destructive workflow:
1. Verify working repository status (`git status`).
2. Treat `craftegon-ccs-main` as strictly read-only.
3. Execute `npm test` to ensure 75/75 test suites pass prior to any release review.
4. No direct database DDL executions in production.

### Protocol B: Fail-Closed Production Defaults
Production hostname detection in `assets/js/config.js` must remain fail-closed:
```js
if (isProductionHost(hostname)) {
  return false; // Force isStatic = true in production
}
```
This guarantees that an inadvertent client-side toggle cannot trigger unauthenticated HTTP network requests to offline servers.
