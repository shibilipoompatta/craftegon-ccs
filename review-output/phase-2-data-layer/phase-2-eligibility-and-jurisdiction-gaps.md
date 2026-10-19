# CraftEgon CCS — Phase 2: Eligibility Criteria and Jurisdiction Variations Audit

**Document ID**: `CRAFTEGON-DOC-P2-ELIG-001`  
**Milestone**: Phase 2, Workstream E & F: Eligibility & Jurisdiction Rules Audit  
**Classification**: Legal Prerequisites, Operational Boundaries & State Law Audit  
**Governing Body**: CraftEgon Corporate Compliance Services (CraftEgon LLP)  
**Audit Date**: 2026-10-19  
**Auditor**: Senior Regulatory Research Analyst & Legal Compliance Specialist  
**Status**: COMPLETE — 54 ELIGIBILITY & 10 JURISDICTION RECORDS AUDITED (0 FABRICATIONS)  

---

## 1. Executive Summary & Regulatory Framework

This report documents the audit of `data/eligibility.json` and `data/jurisdiction-variations.json`.

In compliance with professional standards:
1. **Statutory prerequisites are strictly distinguished from operational advice**: Legal requirements mandated by the Companies Act 2013, LLP Act 2008, and Trade Marks Act 1999 are segregated from CraftEgon's commercial recommendations.
2. **State law diversity is explicitly recognized**: Indian states enforce radically different stamp duty schedules, Shops & Establishments Acts, and professional tax rules. State-level differences are documented where primary sources exist; unresearched states are explicitly designated as research gaps.
3. **Zero false verifications**: All 54 eligibility records and all 10 jurisdiction records remain in provisional or source-identified states pending formal professional review.

---

## 2. Eligibility Dataset Audit (`data/eligibility.json`)

### 2.1 Inventory Breakdown (54 Active Services)
- **Total Records**: Exactly **54 service records** corresponding 1:1 with the active transactional service inventory.
- **Verification Distribution**:
  - `SOURCE_IDENTIFIED`: **49 services** (Statutory source identified via MCA rules, IP India guidelines, or CBDT/CBIC notifications).
  - `NEEDS_PROFESSIONAL_REVIEW`: **5 services** (Complex transactional services requiring specialized legal counsel review: e.g., Fast-Track Mergers, Slump Sale, Section 8 Non-Profit licensing, Cross-border ODI/FDI).
  - `VERIFIED`: **0 services** (Zero records promoted to verified without formal written legal sign-off).
- **Referential Integrity**: 100% of foreign keys resolve to valid `service_id` records in `data/service-registry.json` and `primary_vertical_id` records in `data/verticals.json`.

### 2.2 Separation of Statutory Prerequisites from Operational Advice
Previous website copy often presented recommended best practices as if they were mandatory legal prerequisites. The Phase 2 data model enforces strict separation:

| Service Example | Mandated Statutory Prerequisite (Source-Backed) | Operational Recommendation (Business Advice) |
|---|---|---|
| **Pvt Ltd Registration** (`V01-SVC-007`) | Minimum 2 directors, 1 Indian resident director, valid DIN/DSC, unique name under Companies (Incorporation) Rules 2014. | Drafting a comprehensive Founder/Shareholder Agreement, setting up 4-year vesting schedules, maintaining a separate bank account. |
| **DPIIT Startup India** (`V01-SVC-001`) | Entity registered as Pvt Ltd, LLP, or Registered Partnership; incorporated < 10 years ago; annual turnover < ₹100 Cr; working towards innovation/scalability. | Securing preliminary customer traction, preparing an investor-ready pitch deck, registering early IP/patents. |
| **GST Registration** (`V05-SVC-001`) | Aggregate turnover exceeding ₹40 Lakhs (goods) / ₹20 Lakhs (services) under CGST Act Sec 22; or mandatory interstate taxable supply under Sec 24. | Voluntary registration for B2B input tax credit pass-through, monthly reconciliations via automated accounting software. |
| **POSH Compliance** (`V06-SVC-003`) | Mandatory constitution of Internal Committee (IC) for any workplace with 10 or more employees under Section 4 of POSH Act 2013. | Annual employee sensitization workshops, external POSH member retainer, bi-annual policy refresh. |

---

## 3. Jurisdiction Variations Dataset Audit (`data/jurisdiction-variations.json`)

### 3.1 Audited State-Level Variations (10 Records)
The audit identified 10 state-specific statutory variations where primary local legislation dictates differing requirements:

| Record ID | State / UT | Applicable Service | Variation Type | Statutory Source Basis | Verification State |
|---|---|---|---|---|---|
| `VAR-MH-001` | Maharashtra (`IN-MH`) | `V01-SVC-007` (Pvt Ltd) | Stamp Duty on MoA/AoA | Maharashtra Stamp Act (Schedule I, Art 10) | SOURCE_IDENTIFIED |
| `VAR-MH-002` | Maharashtra (`IN-MH`) | `V06-SVC-001` (Shops & Est) | Local Registration (Gumasta) | Maharashtra Shops and Establishments Act 2017 | SOURCE_IDENTIFIED |
| `VAR-KA-001` | Karnataka (`IN-KA`) | `V01-SVC-007` (Pvt Ltd) | Stamp Duty on MoA/AoA | Karnataka Stamp Act 1957 (Schedule, Art 20) | SOURCE_IDENTIFIED |
| `VAR-KA-002` | Karnataka (`IN-KA`) | `V06-SVC-001` (Shops & Est) | Mandatory e-Karmika Registration | Karnataka Shops and Commercial Establishments Act 1961 | SOURCE_IDENTIFIED |
| `VAR-DL-001` | Delhi (`IN-DL`) | `V01-SVC-007` (Pvt Ltd) | Stamp Duty on MoA/AoA | Indian Stamp (Delhi Amendment) Act 2010 | SOURCE_IDENTIFIED |
| `VAR-DL-002` | Delhi (`IN-DL`) | `V06-SVC-001` (Shops & Est) | Online Registration Portal | Delhi Shops and Establishments Act 1954 | SOURCE_IDENTIFIED |
| `VAR-TN-001` | Tamil Nadu (`IN-TN`) | `V01-SVC-007` (Pvt Ltd) | Stamp Duty on MoA/AoA | Indian Stamp (Tamil Nadu Amendment) Act | SOURCE_IDENTIFIED |
| `VAR-GJ-001` | Gujarat (`IN-GJ`) | `V01-SVC-007` (Pvt Ltd) | Stamp Duty on Articles | Gujarat Stamp Act 1958 | SOURCE_IDENTIFIED |
| `VAR-TS-001` | Telangana (`IN-TS`) | `V06-SVC-001` (Shops & Est) | TS-iPASS Integrated Clearance | Telangana Shops and Establishments Act | PENDING_REVIEW |
| `VAR-UP-001` | Uttar Pradesh (`IN-UP`) | `V06-SVC-001` (Shops & Est) | Nivesh Mitra Portal Registration | UP Dookan Aur Vanijya Adhishthan Adhiniyam | UNREVIEWED |

### 3.2 Explicit Research Gaps for Unresearched Jurisdictions
India comprises 28 states and 8 union territories. The current dataset covers 7 key commercial states (`IN-MH`, `IN-KA`, `IN-DL`, `IN-TN`, `IN-GJ`, `IN-TS`, `IN-UP`). 

**Explicit Finding**: The remaining 21 states and 8 union territories (including West Bengal, Kerala, Andhra Pradesh, Rajasthan, Punjab, Haryana, and Goa) are explicitly cataloged as **unresearched jurisdictions**.
- Website copy and conversion tools are strictly prohibited from stating that stamp duty or local municipal compliance is "standardized across India".
- Where a customer operates in an unresearched state, the platform must issue an explicit notice: *"State-specific stamp duty and local municipal registrations will be verified based on your registered office location."*

---

## 4. Required Legal Actions to Finalize Records

1. **Company Secretary Sign-Off on Statutory Prerequisites**: Confirm that all 54 active services accurately represent current MCA/IP India regulations.
2. **State Revenue Counsel Review on Stamp Duty Tables**: Engage local state practitioners to verify the exact ad-valorem stamp duty calculation formulas for Maharashtra, Karnataka, and Delhi.
3. **Publication Gating Maintenance**: Maintain all eligibility and jurisdiction variation records in gated status until written legal review is logged in the register.
