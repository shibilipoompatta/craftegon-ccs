# TASK-CCS-UX-009: Dependencies & Outstanding Owner Decisions Register

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Auditor:** Corporate Legaltech Product Strategist & Delivery Lead  
**Date:** November 8, 2026

---

## 1. Executive Notice for Business Owner

This document establishes the definitive separation between:
1. **Authoritative Owner Decisions** already approved and incorporated into the blueprint.
2. **Outstanding Statutory & Commercial Determinations** that require your formal written choice before implementation and public production release.

---

## 2. Inventory of Authoritative Owner Decisions (Confirmed)

The following determinations have been issued by the business owner and are formally locked into the blueprint:

- **Confirmed Brand Name:** **CraftEgon Corporate Services** (Tagline: *Building Business Infrastructure*).
- **Confirmed Positioning:** *"Your Business Infrastructure Partner. From business formation to compliance, protection and growth — coordinated corporate services supported by professional expertise and technology."*
- **Confirmed Service Desk:** **Operational Service Desk, Alappuzha, Kerala** (Must never be called Registered Office, Statutory Office, or Legal Head Office).
- **Confirmed Public Contact:** **+91 86069 18247** (Approved for Voice & WhatsApp). Suppress `+91 97782 52932`. Zero invented 24/7 SLA commitments.
- **Confirmed Portal Policy:** **Exclude `/portal/` completely from the public website** and publishing artifact. Preserve source code in private branch.
- **Confirmed Admin Policy:** **Exclude `/admin/` completely from the public website** and publishing artifact. Preserve source code.

---

## 3. Register of Outstanding Owner Decisions (Action Required)

The following four business and legal items remain unresolved:

### DECISION 1: Formal Legal Contracting Entity Form
- **Current Technical State:** Decoupled. Website operates strictly under the trade brand *"CraftEgon Corporate Services (CCS)"*.
- **Options Available for Selection:**
  - `[ ] Option 1A:` **CraftEgon LLP** (Limited Liability Partnership under LLP Act, 2008).
  - `[ ] Option 1B:` **CraftEgon Private Limited** (Private Limited Company under Companies Act, 2013).
  - `[ ] Option 1C:` **CraftEgon Services** (Registered Sole Proprietorship or Partnership).
  - `[ ] Option 1D (Recommended for Phase 1):` **Retain Brand Identity Only** pending statutory incorporation filing.
- **Owner Choice:** __________________________________________________

---

### DECISION 2: Statutory Registration Number Publication (CIN / LLPIN)
- **Current Technical State:** Omitted from public pages to prevent fictitious or placeholder registration claims.
- **Options Available for Selection:**
  - `[ ] Option 2A:` Publish official **LLPIN** (e.g., `LLPIN: ACA-XXXX`).
  - `[ ] Option 2B:` Publish official **CIN** (e.g., `CIN: U74999KL2026PTC012345`).
  - `[ ] Option 2C (Recommended):` **Omit statutory registration identifier** from the institutional footer until official MCA certificate is issued.
- **Owner Choice / Identifier:** ________________________________________

---

### DECISION 3: Statutory Registered Office vs. Operational Service Desk
- **Current Technical State:** Alappuzha address is designated exclusively as the *Operational Service Desk*.
- **Options Available for Selection:**
  - `[ ] Option 3A (Recommended):` **Maintain current Service Desk designation** for all customer-facing touchpoints.
  - `[ ] Option 3B:` Publish official Registered Office address if an alternate statutory address is registered with MCA.
- **Owner Choice / Address:** __________________________________________

---

### DECISION 4: Commercial Pricing & Fee Schedule Ratification
- **Current Technical State:** Standardized professional service fees are declared in `data/pricing.json` (e.g., Pvt Ltd Formation ₹4,999 + Govt Fees, GST Annual Return ₹4,999, MSME Udyam ₹999).
- **Options Available for Selection:**
  - `[ ] Option 4A (Recommended):` **Formally ratify existing published fee schedules** as accurate baseline prices.
  - `[ ] Option 4B:` Provide updated professional fee schedules for incorporation into `data/pricing.json`.
- **Owner Choice:** __________________________________________________

---

## 4. Implementation Dependencies Summary

| Transformation Milestone | Prerequisite Dependency | Blocker Risk | Mitigation |
| :--- | :--- | :--- | :--- |
| **Phases 1–4 (Architecture & Homepage)** | Owner approval of Blueprint | None (Uses approved Brand and Service Desk) | Can begin immediately upon blueprint sign-off. |
| **Phase 5 (Service Detail Pages)** | Decision 4 (Pricing Ratification) | Low (Can use approved provisional fees) | Standardize layout; fee values are centralized in JSON. |
| **Phase 10 (Production Release)** | Decisions 1, 2, 3 (Legal Identity) | Medium (Statutory compliance on launch) | Brand lockup handles launch cleanly even if entity choice is pending. |
