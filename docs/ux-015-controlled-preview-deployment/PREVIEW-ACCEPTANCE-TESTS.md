# Preview Deployment Acceptance Testing Protocol & Baseline Verification

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-015  
**Date:** 2026-11-08  
**Evaluator:** Senior Quality Assurance Architect & Web Security Auditor  
**Deployment Status:** **HELD AT APPROVAL CHECKPOINT** (External preview URL pending owner authorization)  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Executive Summary

In strict compliance with Section 4, Section 8, and Section 19 of the TASK-015 mandate, **no external preview deployment has been executed without prior explicit owner authorization.**

This document establishes:
1. The baseline test results from the local edge simulation environment (`127.0.0.1:8788`), validating the underlying artifact.
2. The rigorous test execution protocol that will be executed against the live Cloudflare preview URL (`https://preview-ccs-task-015.<project-name>.pages.dev`) immediately upon owner approval and successful deployment.

---

## 2. Pre-Deployment Local Edge Simulation Baseline Results

Prior to requesting owner approval for remote Git operations, the public distribution build (`dist-public/`) was compiled via `node scripts/build-public.js` and verified locally using an edge-simulation HTTP server mimicking Cloudflare Pages routing and headers:

| Test Group | Tests Executed | Passed | Failed | Status | Evidence Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Build Verification** | 51 automated assertions | 51 | 0 | **PASS** | **VERIFIED FACT** (`scripts/verify-public-build.js`) |
| **Full Regression Suite** | 75 suites across 14 stages | 75 | 0 | **PASS** | **VERIFIED FACT** (`npm test`) |
| **Edge Simulation (Public Pages)** | 6 core public endpoints | 6 | 0 | **PASS** | **VERIFIED FACT** (HTTP 200 with security headers) |
| **Edge Simulation (Internal Isolation)** | 6 portal & admin endpoints | 6 | 0 | **PASS** | **VERIFIED FACT** (HTTP 404 forced denial) |
| **JavaScript Syntax Validation** | All public script files | All | 0 | **PASS** | **VERIFIED FACT** (`node -c`) |

---

## 3. Mandatory Acceptance Testing Protocol for Live Cloudflare Preview

Immediately upon owner approval of the Git push and Cloudflare preview build completion, the following test protocol must be executed against the live preview URL (`https://<preview-domain>.pages.dev`):

### Protocol A: Core Public Website Availability
Each route must return HTTP 200 with complete CSS styling, working JavaScript, and zero console errors:
- [ ] `/` (Homepage)
- [ ] `/services.html` (Service Catalog Hub)
- [ ] `/services/index.html` (Service Directory Mirror)
- [ ] `/about.html` (Corporate About Page)
- [ ] `/contact.html` (Contact Intake Desk)
- [ ] `/search/index.html` (Unified Site Search)
- [ ] `/conversion/calculator.html` (Incorporation Fee Calculator)
- [ ] `/verticals/01-entity-formation.html` (Practice Vertical)
- [ ] `/services/pvt-ltd-registration.html` (Service Detail Page)
- [ ] `/legal/privacy.html` (DPDP Privacy Policy)
- [ ] `/404.html` (Custom Not Found Page)

### Protocol B: Mandatory Portal & Admin Exclusion Verification
Every request to internal namespaces must return **HTTP 404 Not Found** at the edge:
- [ ] `GET /portal/` -> **Expected: HTTP 404**
- [ ] `GET /portal/dashboard.html` -> **Expected: HTTP 404**
- [ ] `GET /portal/login.html` -> **Expected: HTTP 404**
- [ ] `GET /portal/client-hub.html` -> **Expected: HTTP 404**
- [ ] `GET /admin/` -> **Expected: HTTP 404**
- [ ] `GET /admin/index.html` -> **Expected: HTTP 404**
- [ ] `GET /admin/compliance-ops.html` -> **Expected: HTTP 404**
- [ ] `GET /assets/css/portal.css` -> **Expected: HTTP 404**

*Verification Criterion:* Missing internal paths must return an actual HTTP 404 response body, not an HTTP 200 homepage rewrite or JavaScript-only redirect.

### Protocol C: Edge Security Headers Inspection
Execute `curl -I https://<preview-domain>.pages.dev/` and verify presence of:
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] `Content-Security-Policy` enforcing `'self'` with allowed CDN hosts (`challenges.cloudflare.com`, `fonts.googleapis.com`)

### Protocol D: Contact & Enquiry Flows (Fictional Test Data)
Test contact forms using synthetic test data (`Test User`, `test@example.com`, `9876543210`):
- [ ] Client-side validation triggers on incomplete fields.
- [ ] In static mode without API backend, form displays transparent static notice.
- [ ] Direct WhatsApp escalation link resolves to `https://wa.me/918606918247`.
- [ ] Direct phone escalation link resolves to `tel:+918606918247`.
- [ ] Direct email link resolves to `mailto:admin@craftegon.com`.
- [ ] Zero sensitive data appears in URL query parameters.

### Protocol E: Viewport & Mobile Responsiveness
Test across 5 standard device viewports:
- [ ] **360 px (Narrow Mobile):** Zero horizontal scrollbar, hamburger drawer opens cleanly.
- [ ] **390 px (Standard Mobile):** Service cards stack in single column, typography legible.
- [ ] **768 px (Tablet Portrait):** 2-column grid transitions smoothly.
- [ ] **1024 px (Tablet Landscape / Laptop):** Navigation switches to desktop header.
- [ ] **1440 px (Desktop Large):** Balanced margins and centered content layout.

---

## 4. Current Test Status Classification

- **Local Build & Simulation Tests:** **PASSED** (**VERIFIED FACT**).
- **Live Cloudflare Preview Tests:** **NOT TESTED** (Held per mandatory approval boundary; awaiting owner authorization to push preview branch).
