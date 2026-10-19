# CraftEgon CCS — Phase 3, Task A: Baseline & Implementation Plan Report

**Project:** CraftEgon Corporate Compliance Services (CCS)  
**Document:** Phase 3, Task A — Baseline & Implementation Plan Report  
**Repository:** Local `craftegon-ccs` workspace (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Execution Environment:** Node.js v20.18.0 / Windows (Local architecture, inspection & test execution only)  
**Execution Mode:** Local Planning & Inspection Only (0 external cloud resources provisioned, 0 accounts created, 0 payment integrations, 0 production code changes, 0 commits, 0 pushes)  
**Date of Assessment:** October 18, 2026  
**Status:** Task A Completed — Awaiting Managing Partner Approval Before Task B  

---

## Executive Summary

Phase 3 transitions CraftEgon CCS from a static client-side marketing site with an in-memory prototype into an authenticated, enterprise-grade corporate governance platform.

**Task A** establishes the baseline inspection, confirms provider architecture options, inventories all customer-facing forms, models the database entities with engine-level Row-Level Security (RLS), defines the lead/case/document/payment state machines, and identifies all unresolved governance decisions before making any infrastructure changes or provisioning external accounts.

---

## 1. Actual Repository State & Test Verification

### 1.1 Branch & Working Tree State
* **Branch:** `main` (clean, synchronized with `origin/main`).
* **Latest Commit:** `cda19a4 chore(platform): comprehensive update of UI tokens, brand lockup, legal disclaimers, and content architecture`.
* **Zero Production Mutations:** All 113 production HTML files, CSS tokens (`assets/css/`), and frontend scripts (`assets/js/*.js`) remain 100% untouched.

### 1.2 Baseline Test Execution Evidence
Both automated test suites were executed on the clean baseline:

1. **Master Test Suite (`npm test`):**
   ```
   ==================================================
   TEST SUMMARY: 54 passed, 0 failed (Phase 1 Remediation)
   VALIDATION SUMMARY: 88 passed, 0 failed (Phase 2 Master Data Layer)
   ==================================================
   Total Assertions: 142 passed, 0 failed (Exit Code 0)
   ```
   * Link Integrity: 113 HTML files audited, 0 broken links.
   * Orphan Page Audit: 113 HTML files audited, 0 orphan pages.
   * SEO Compliance: 111 content files audited, 100% compliant.
   * Chat Engine: 10 queries, 30 action URLs verified on disk.
   * Trademark Search XSS Suite: 40 automated checks passed.
   * Syntax Verification: 5 frontend scripts compiled cleanly via `node -c`.

2. **Lead Intake Prototype Test Suite (`node scripts/test-lead-intake-prototype.js`):**
   ```
   ======================================================================
   PROTOTYPE TEST RESULTS: 31 passed, 0 failed (31 total assertions, Exit Code 0)
   ======================================================================
   ```
   * Full verification of input validation, relational integrity (`service_id` $\leftrightarrow$ `vertical_id`), referral route boundaries, anti-spoofing IP resolution, honeypot traps, sliding-window rate limiting, and PII-masked audit logs.

---

## 2. Inventory of Existing Forms & Customer Journeys

An empirical AST traversal of all HTML pages on disk identified **exactly 21 `<form>` elements**:

### 2.1 Form Grouping by Customer Journey
1. **Public Lead Capture & Service Enquiry Journey (15 forms):**
   * `services/pvt-ltd-registration.html` (`.if-lead-form`)
   * 14 conversion pages (`conversion/*.html`): `contract-intake.html`, `cross-border-retainer.html`, `csr-audit-form.html`, `dpdp-audit-request.html`, `fema-consultation.html`, `hr-audit.html`, `license-qualification.html`, `ma-advisory-enquiry.html`, `post-incorporation-checkout.html`, `retainer-desk.html`, `secretarial-audit-scope.html`, `strike-off-checker.html`, `tax-intake.html`, `trademark-search.html`, `venture-deal-booking.html`.
   * *Status:* Forms currently display safe direct-engagement fallback notices via `assets/js/forms.js` because `data-endpoint` is unpopulated.
2. **Referral-Only Boundary Journey (1 form):**
   * `conversion/dispute-consultation.html` (`.if-lead-form`): NCLT / dispute review.
   * *Status:* Contentious litigation representation cannot be offered directly under the Advocates Act 1961. Must strictly enforce the referral boundary.
3. **Interactive Client-Side Calculation Tools (2 forms):**
   * `conversion/calculator.html` (`#estimator-form`): MCA statutory late fee estimator.
   * `conversion/ai-document-generator.html` (`#ai-drafter-form`): Client-side document template drafter.
4. **Retainer Checkout & Payment Journey (1 form):**
   * `portal/subscription.html` (`#checkout-form`): Currently simulates retainer activation via `localStorage` and redirects to the portal.
5. **Authenticated Portal & Calendar Calibration Journey (1 form):**
   * `portal/dashboard.html` (`#cin-lookup-form`): Simulates statutory filing countdown clocks based on CIN inputs.
6. **Secure Document Intake Journey:**
   * *Audit Finding:* Exactly **zero `<input type="file">` elements exist on disk**. Forms like `contract-intake.html` describe file uploads in marketing text but provide only text inputs. Secure file upload architecture must be implemented from the ground up.

---

## 3. Concrete Provider Architecture & Deployment Plan

### 3.1 Provider Comparison Summary

| Provider Candidate | Tier Status | Security & Architecture Fit | Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Supabase Pro (AWS Mumbai `ap-south-1`)** | **Preferred Candidate** *(Subject to formal sign-off)* | **Native PostgreSQL Row-Level Security (RLS)** directly bound to `auth.uid()`. Built-in GoTrue authentication with MFA. S3-compatible private storage with declarative RLS. Sits within India sovereign cloud boundary. | **$26.50 – $32.50 / mo (~₹2,225 – ₹2,730)** |
| **Cloudflare Workers + D1 + R2** | **Secondary Fallback** | Scale-to-zero cost ($5/mo), built-in 30-day D1 Time Travel, $0 R2 egress. **Critical Flaw:** D1 lacks database RLS, forcing tenant isolation into application code. | **$5.00 – $10.00 / mo (~₹420 – ₹840)** |
| **AWS Dedicated (RDS + ECS + S3)** | **Enterprise Option** | Full sovereign control, GuardDuty malware protection, native KMS encryption. High operational complexity for initial phase. | **$25.00 – $45.00 / mo (~₹2,100 – ₹3,780)** |

### 3.2 Security, Storage & Payment Handling Blueprint
1. **Database & Migrations:** PostgreSQL 15+ with RLS enabled across all tables (`lead_enquiries`, `client_accounts`, `cases`, `case_documents`, `subscription_orders`, `audit_logs`). Standard SQL migrations version-controlled in repository.
2. **Authentication:** GoTrue engine issuing secure, httpOnly session cookies and short-lived JWTs. Least-privilege roles (`anon`, `authenticated_client`, `compliance_operator`, `managing_partner`).
3. **Private Document Storage:** Presigned upload/download URLs expiring in $<15$ minutes. Enforced magic-byte file signature validation, size limits ($\le 15$ MB), quarantine state machine, and explicit unavailable state if ClamAV scanner is offline.
4. **Payment Sandbox:** Razorpay test mode (`rzp_test_*`). Server-side order creation (`POST /api/v1/payments/create-order`), HMAC-SHA256 webhook signature verification, and idempotent transaction processing.

---

## 4. Key Unresolved Decisions & Immediate Next Steps

The following 5 decisions require explicit authorization:

1. **Provider Sign-Off:** Formally approve **Supabase Pro in AWS Mumbai (`ap-south-1`)** as the primary backend and database provider.
2. **Document Malware Scanner Strategy:** Authorize the deployment of ClamAV on a non-production runner or AWS Lambda container for Task E file quarantine.
3. **Payment Sandbox Authorization:** Authorize onboarding a **Razorpay Sandbox account (`rzp_test_*`)** for Task F testing (0 live transactions).
4. **Commercial Pricing Approval:** Acknowledge that Phase 2 pricing datasets remain UNVERIFIED baseline estimates and cannot be used for live customer checkout.
5. **Litigation Referral Boundary:** Confirm that `conversion/dispute-consultation.html` will reject commercial intake and route to independent advocate referral notices.

---

## 5. Exit Gate & Pause

Task A has been completed in full compliance with the project's governance framework:
* Comprehensive architecture and deployment plan written to [`review-output/phase-3/phase-3-implementation-plan.md`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/review-output/phase-3/phase-3-implementation-plan.md).
* Baseline test suites rerun and 100% passing.
* Zero cloud resources provisioned, zero external accounts created, and zero production code modified.

**Awaiting user/managing partner approval to proceed to Task B (Backend and Database Foundation).**
