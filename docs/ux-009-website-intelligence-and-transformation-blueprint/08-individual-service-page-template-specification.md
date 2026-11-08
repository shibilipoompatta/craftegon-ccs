# TASK-CCS-UX-009: Individual Service Page Template Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Target Pages:** 57 Individual Service Detail Pages in `services/*.html`  
**Auditor:** Senior Frontend Engineer & Legaltech Product Architect  
**Date:** November 8, 2026

---

## 1. Objective & Purpose

The 57 individual service pages represent the definitive conversion destinations of the CraftEgon platform. A prospective client arriving on a service detail page (whether via Google Search, social referral, or site search) must immediately understand:
1. Exactly what the service entails.
2. Whether it applies to their corporate entity type.
3. What statutory deliverables are produced.
4. How professional responsibility and government fees are partitioned.
5. What the next operational step involves.

This specification establishes a uniform, high-conversion, accessible service page template to replace legacy stylistic divergences.

---

## 2. Standardized 12-Section Service Page Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Accessible Breadcrumb: Home > Services > [Practice Vertical] > [Svc]│
├────────────────────────────────────────────────────────────────────────┤
│ 2. Service Hero Lockup:                                                │
│    - Practice Area Tag • Delivery Model Badge • Turnaround Time Badge   │
│    - H1: Formal Statutory Service Title                                │
│    - Concise 2-Sentence Value Proposition & Statutory Citation         │
│    - Dual Actions: [Submit Service Intake →] [Consult on WhatsApp 💬]  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Key Metrics Strip:                                                  │
│    [ Statutory Timeline ] [ Government Authority ] [ Professional Role ]│
├────────────────────────────────────────────────────────────────────────┤
│ 4. Applicability & Eligibility: "Who Needs This Service?"              │
│    Clear checklist defining mandatory statutory triggers & entity types│
├────────────────────────────────────────────────────────────────────────┤
│ 5. Deliverables & Outputs Matrix: "What You Receive"                   │
│    Itemised schedule of certificates, filings, resolutions, & seals    │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Transparent Fee & Cost Architecture:                                │
│    Clear breakdown: Fixed Professional Fee vs Actual Government Dues   │
├────────────────────────────────────────────────────────────────────────┤
│ 7. Milestone Process Timeline: "Step-by-Step Filing Workflow"          │
│    1. Intake → 2. Verification → 3. Drafting → 4. Filing → 5. Issuance │
├────────────────────────────────────────────────────────────────────────┤
│ 8. Mandatory Documentation Checklist:                                  │
│    Identity (PAN/Aadhaar) • Address Proofs • Entity Resolutions        │
├────────────────────────────────────────────────────────────────────────┤
│ 9. Professional Responsibility & Governance Disclosure:                │
│    Certified CS/CA execution boundaries & legal advocacy referral terms│
├────────────────────────────────────────────────────────────────────────┤
│ 10. Exclusions, Penalties & Scope Boundaries:                          │
│     Specific non-included items (e.g., late fees, foreign translations)│
├────────────────────────────────────────────────────────────────────────┤
│ 11. Reciprocal Practice Area Navigation & Adjacent Services:           │
│     3 complementary services within the same practice vertical         │
├────────────────────────────────────────────────────────────────────────┤
│ 12. Persistent Conversion & Consultation Bar:                          │
│     Approved phone/WhatsApp (+91 86069 18247) + Offline Form Fallback   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Hero & Statutory Classification Badges
- **Delivery Model Badge:**
  - *Direct Delivery:* Rendered as a green pill (`background: var(--surface-mint-soft); color: var(--accent-green-primary);`) stating `"Direct Secretarial Delivery"`.
  - *Referral Advisory:* Rendered as a soft slate pill (`background: #F1F5F9; color: #475569;`) stating `"Coordinated / Specialist Legal Referral"`.
- **Statutory Authority Tag:** Displays the applicable statutory body (e.g., `"MCA / ROC"`, `"IP India"`, `"CBIC / GST"`, `"RBI / FEMA"`).

### 3.2 Deliverables & Fee Architecture
The deliverables section must avoid ambiguous "end-to-end" generalities. It must present a structured table or card grid detailing each concrete work product:
- Example for Private Limited Incorporation:
  1. *Name Approval Letter (RUN / SPICe+ Part A)*
  2. *Certificate of Incorporation (INC-11) with Corporate Identification Number (CIN)*
  3. *Director Identification Numbers (DIN) for up to 3 Directors*
  4. *Company PAN and TAN Credentials*
  5. *Statutory Memorandum of Association (MOA) and Articles of Association (AOA)*
  6. *First Board Meeting Minutes & Common Seal Guidance*

### 3.3 Professional Responsibility & Advocacy Boundaries
To maintain compliance with the Advocates Act, 1961, the Bar Council of India regulations, and Institute of Company Secretaries of India (ICSI) standards:
- Each page must include a standardized governance note:
  > *"Corporate secretarial filings, ROC returns, and statutory registrations are coordinated through qualified Company Secretaries and Chartered Accountants. Matters involving formal court appearances, dispute arbitration, or judicial advocacy are referred directly to independent legal advocates."*

### 3.4 Responsive Tabular Content Implementation
All comparison matrices and fee schedules must be enclosed in accessible, touch-enabled scroll containers:
```html
<div class="table-responsive-wrapper" tabindex="0" role="region" aria-label="Deliverables Schedule">
  <table class="service-spec-table">
    <!-- Clean, semantic rows -->
  </table>
</div>
```
CSS will enforce `overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--radius-md);`.

---

## 4. Rollout Strategy for the 57 Service Pages

To ensure seamless implementation without regression:
1. The 57 service pages will be standardized to this template during Phase 5 of the transformation roadmap.
2. Canonical URLs will remain 100% frozen.
3. Automated test suites (`scripts/verify-links.js`, `scripts/audit-seo.js`) will run continuously to verify 100% link mesh integrity and SEO tag conformity.
