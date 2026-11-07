# CRAFTEGON CORPORATE SERVICES (CCS)
## Stage D: Standardized 13-Section Core Service Page Specification

**Document Identifier:** `DOC-CCS-UX-SPEC-SVC-001`  
**Classification:** Design System & Technical Content Specification  
**Date:** 2026-11-07  
**Status:** APPROVED & MANDATED  
**Applicability:** All 5 Core Launch Services & Canonical Service Pages  

---

## 1. Overview & Conversion Architecture

To convert discerning corporate clients, founders, and legal teams, CCS service pages must abandon thin marketing summaries and high-friction generic calculators. Every primary service page must present an authoritative, fully transparent, single-page operational blueprint that provides exact clarity on statutory rules, processing timelines, costs, and deliverable boundaries.

Every core service page must implement the following **13 standardized structural sections**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   13-SECTION SERVICE ARCHITECTURE                      │
├─────┬─────────────────────────────────────┬────────────────────────────┤
│  1  │ Service Definition & Authority      │ Hero & Statutory Basis     │
│  2  │ Who Needs It & Eligibility          │ Personas & Criteria        │
│  3  │ Benefits & Suitability Comparison   │ Value & Entity Comparison  │
│  4  │ What CCS Handles (Scope)            │ Professional Deliverables  │
│  5  │ What Customer Provides              │ Client Responsibilities    │
│  6  │ Required Documents Checklist        │ KYC & Evidentiary Inputs   │
│  7  │ Step-by-Step Filing Process         │ Portal Touchpoints         │
│  8  │ Expected Timelines & SLA            │ Realistic Business Days    │
│  9  │ Fees & Statutory Cost Separation    │ Professional vs Govt Fees  │
│ 10  │ Professional Involvement & Role     │ Qualified CS/CA Cert       │
│ 11  │ Exclusions & Scope Boundaries       │ What is NOT included       │
│ 12  │ Frequently Asked Questions (FAQs)   │ 5–8 Critical Inquiries     │
│ 13  │ Direct Service Intake Desk          │ Embedded 3-Field Lead Card │
└─────┴─────────────────────────────────────┴────────────────────────────┘
```

---

## 2. Detailed Section Specifications

### Section 1: What the Service Is (Plain English Definition & Authority)
- **Component:** `.if-service-hero`
- **Required Elements:**
  - Canonical Service Identifier badge (e.g. `Service ID: V01-SVC-007`)
  - Operational mode pill (`Direct Regulatory Service` vs `Referral Service`)
  - Government Portal badge (e.g. `MCA V3 SPICe+`, `MCA FiLLiP`, `Udyam Portal`, `IP India TM-A`)
  - Clear `<h1>` heading with canonical title
  - 2-sentence plain English summary defining the statutory purpose under relevant Indian Acts (Companies Act 2013, LLP Act 2008, MSMED Act 2006, Trade Marks Act 1999)
  - 3-item Quick Highlights bar: Statutory Authority, Eligible Entities, Baseline SLA.

### Section 2: Who Needs It & Statutory Eligibility
- **Component:** `<section>` with clear heading
- **Required Elements:**
  - Target customer personas (e.g. Early-stage venture startups, consulting firms, foreign subsidiaries, sole proprietors transitioning to corporate identity).
  - Explicit statutory eligibility criteria (e.g. Minimum 2 directors/partners, Indian resident director requirements under Section 149(3), threshold criteria for MSME investment/turnover).

### Section 3: Benefits & Suitability Comparison
- **Component:** Comparative card grid or structured table
- **Required Elements:**
  - Key operational and legal advantages (Limited liability, separate legal personality, brand exclusivity, credit priority).
  - Practical comparison against alternative legal forms (e.g. Pvt Ltd vs LLP vs OPC; Trademark TM-A vs unasserted common-law mark).

### Section 4: What CCS Handles (End-to-End Scope)
- **Component:** `.scope-card.included` (Green border/accent)
- **Required Elements:**
  - Bulleted, unambiguous list of all statutory deliverables executed by CraftEgon CCS.
  - Examples: Class 3 DSC token preparation, DIN/DPIN generation, electronic MOA/AOA or LLP agreement drafting, portal XML upload, stamp duty coordination, and official COI/acknowledgement delivery.

### Section 5: What Customer Provides
- **Component:** Client responsibility card
- **Required Elements:**
  - Explicit checklist of inputs needed from the customer (e.g. Digital OTP verification during active filing windows, physical signature cards, registered office rent receipt/NOC, capital deposit verification).

### Section 6: Required Documents & Formatting Checklist
- **Component:** Multi-column document table or checklist
- **Required Elements:**
  - Categorized list: 1) Identity Proofs, 2) Address Proofs, 3) Registered Office Proofs, 4) Corporate Resolution / NOC.
  - Exact formatting guidelines (e.g. Self-attestation rule, validity within 2 months, apostille requirement for foreign nationals).

### Section 7: Process & Step-by-Step Filing Workflow
- **Component:** Numbered vertical timeline (`.process-step-list`)
- **Required Elements:**
  - 4 to 5 sequential chronological stages from document intake to government approval.
  - Named government portal touchpoints (MCA CRC, MCA RoC, DGFT, IP India).

### Section 8: Expected Timelines & Realistic SLAs
- **Component:** SLA summary strip / badges
- **Required Elements:**
  - Realistic business day turnaround range (e.g. 4–7 business days for Pvt Ltd, 1–3 business days for MSME, 24 hours for DIR-3 KYC).
  - Explicit disclaimers regarding government portal maintenance outages or RoC resubmission scrutiny.

### Section 9: Transparent Fees & Statutory Cost Separation
- **Component:** `.if-pricing-grid`
- **Required Elements:**
  - Strict visual and accounting separation between:
    1. **Professional CS/Filing Assistance Fee** (Retained by CCS).
    2. **Government Statutory Portal Fees** (MCA, MSME, IP India statutory challans).
    3. **State Stamp Duty** (Payable to respective State Revenue Treasury).
  - Zero deceptive claims (no "Free company incorporation" without disclosing ₹3,000–₹10,000 state stamp duties).

### Section 10: Professional Involvement & Regulatory Role
- **Component:** Professional governance statement
- **Required Elements:**
  - Explicit declaration of qualified professionals involved in scrutiny and certification (Associate/Fellow Company Secretaries - ACS/FCS, Chartered Accountants - ACA/FCA).
  - Clear boundary demarcation under the Advocates Act, 1961 (non-litigation secretarial filing infrastructure).

### Section 11: Exclusions & What's NOT Included
- **Component:** `.scope-card.excluded` (Amber border/accent)
- **Required Elements:**
  - List of subsequent statutory obligations not covered in the base filing (e.g. Form INC-20A Commencement of Business, Form ADT-1 Auditor Appointment, Trademark objection hearings).

### Section 12: Frequently Asked Questions (FAQs)
- **Component:** Accessible FAQ accordion / details grid
- **Required Elements:**
  - 5 to 8 practical, scenario-based questions directly addressing founder hesitations, statutory penalties, and timeline contingencies.

### Section 13: Direct Enquiry Intake Desk & Instant Channels
- **Component:** Embedded `.if-lead-form` Card
- **Required Elements:**
  - Direct 3-to-4 field lead intake form:
    1. Full Name
    2. Mobile / WhatsApp Number (Mandatory)
    3. City / State of Registered Office
    4. Service-specific field (e.g. Proposed Company Name, DIN, Trademark Wordmark)
  - Clear SLA note: "Contacted within 4 business hours by our corporate advisory desk."
  - Direct fallback links to WhatsApp Live Desk, Phone, and Email Desk.
  - Link to Confidentiality Policy.

---

## 3. Implementation Plan for Core 5 Services

1. `services/pvt-ltd-registration.html` (V01-SVC-007) — Add Benefits vs LLP comparison, Client responsibilities, Professional role, and 6 comprehensive FAQs.
2. `services/llp-registration.html` (V01-SVC-002) — Expand from 118-line stub to full 13-section template.
3. `services/msme-udyam.html` (V01-SVC-003) — Align with 13-section template, add Client responsibilities, Professional role, and expanded FAQs.
4. `services/dir3-kyc.html` (V02-SVC-002) — Expand from 113-line stub to full 13-section template.
5. `services/trademark-registration.html` (V06-SVC-003) — Expand from 117-line stub to full 13-section template.
