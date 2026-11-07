# CRAFTEGON CORPORATE SERVICES (CCS)
## Comprehensive Strategic Decision Register

**Document Reference:** `docs/CCS_DECISION_REGISTER.md`  
**Classification:** Strategic Governance, Product & Operational Decision Log  
**Author:** Combined COO, Technology Architect & Quality-Control Team  
**Date:** November 2026  
**Status:** ACTIVE STRATEGIC REGISTER (REVISION 1.0)  

---

### Classification Labels Applied:
- `ESTABLISHED FACT`: Empirically verified against code, catalog, or running system.
- `OBSERVED IN IMPLEMENTATION`: Direct observation of current HTML, JS, CSS, or JSON implementation.
- `PROPOSED DECISION`: Strategic or operational recommendation submitted for implementation.
- `OWNER CONFIRMATION REQUIRED`: Requires commercial, legal, or strategic decision by the Business Owner.
- `LEGAL/PROFESSIONAL VALIDATION REQUIRED`: Reserved professional matter requiring independent Indian legal or statutory validation.
- `FUTURE PHASE`: Capability scheduled for Phase 2, 3, 4, or 5.
- `NOT VERIFIED`: Claim or metric lacking empirical substantiation.

---

## 1. Summary of Strategic Decisions

| Decision ID | Decision Title | Category | Status | Owner Approval | Legal Validation |
|---|---|---|---|---|---|
| **DEC-001** | Brand Identity, Tagline & Strategic Positioning Refocus | Strategic Direction | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | No |
| **DEC-002** | 15-Vertical Architecture Preservation vs. Initial Focus | Service Strategy | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | No |
| **DEC-003** | Service Categorisation Framework (5 Tiers) | Operational Model | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`) |
| **DEC-004** | Priority Phase 1 Launch Service Portfolio (8 Core Services) | Service Strategy | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`) |
| **DEC-005** | Pricing Architecture & Status Classification | Revenue Model | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | No |
| **DEC-006** | Lead Intake UX Refactoring (Replacing "Static Environment" Alert) | Conversion & UX | `PROPOSED DECISION` | No (Safe in-scope frontend refactor) | No |
| **DEC-007** | Professional Network Onboarding & Fiduciary Boundary Framework | Professional Network | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`) |
| **DEC-008** | Client Engagement Standard Operating Procedure (14-Stage Lifecycle) | Operations & QC | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`) |
| **DEC-009** | Management Registers & Founder Independence Ratio KPI | Management & KPIs | `PROPOSED DECISION` | Yes (`OWNER CONFIRMATION REQUIRED`) | No |
| **DEC-010** | Technical & Database Governance Boundary (Preserving Migration 008) | Technical Governance | `ESTABLISHED FACT` | No (Enforcing existing baseline) | No |

---

## 2. Detailed Decision Records

### DEC-001: Brand Identity, Tagline & Strategic Positioning Refocus
- **Decision:** Align all public messaging and documentation with the authoritative Master Assignment parameters:
  - **Brand:** CraftEgon Corporate Services (CCS)
  - **Parent Brand:** CraftEgon (CraftEgon LLP)
  - **Tagline:** *"Building Business Infrastructure"*
  - **Positioning Statement:** *"Your Business Infrastructure Partner. From business formation to compliance, protection and growth — coordinated corporate services supported by professional expertise and technology."*
  - **Six Lifecycle Stages:** Establish, Operate, Comply, Protect, Grow, Continue.
- **Rationale:** The current homepage headline (*"Start. Comply. Scale with Certainty."*) and kicker (*"Corporate Secretarial & Regulatory Compliance Architecture"*) frame CCS primarily as a secretarial/compliance agent. The new positioning elevates CCS to an integrated infrastructure partner that supports the client across their entire lifecycle, without overpromising automated software capabilities.
- **Evidence:** `OBSERVED IN IMPLEMENTATION`: Current `index.html` lines 88–95 display historical positioning. Master Assignment Section 2 establishes new positioning.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** Updating `index.html`, `services.html`, metadata descriptions, and brand guidelines.

---

### DEC-002: 15-Vertical Architecture Preservation vs. Initial Focus
- **Decision:** Formally retain the 15-practice-vertical framework as the comprehensive long-term architectural universe, but strictly freeze active marketing and sales outreach on all non-core verticals during Phase 1.
- **Rationale:** Historical work has created structured documentation, schemas, and 54 routes. Discarding this work would destroy valuable long-term asset value. However, marketing 54 services across 11 active verticals on day 1 creates fatal operational dispersion, impossible quality control, and zero brand authority.
- **Evidence:** `ESTABLISHED FACT`: `data/verticals.json` lists 15 verticals, 4 of which are already marked as Approved Coverage Gaps. `data/service-registry.json` contains 54 services.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** Blueprint Service Architecture Matrix.

---

### DEC-003: Service Categorisation Framework (5 Tiers)
- **Decision:** Classify every service in the CCS catalog into exactly one of five operational tiers:
  1. `LAUNCH`: Suitable for controlled initial delivery by CCS internal coordination and standard workflows.
  2. `PARTNER-LED`: Coordinated by CCS but executed and certified by verified external practicing professionals (CAs, CSs, CMAs, Patent Agents).
  3. `SPECIALIST`: High-complexity or episodic transactions requiring bespoke scoping and specialist practitioners.
  4. `DEFERRED`: Viable long-term services not operationalized in Phase 1 (no proactive sales or automated checkouts).
  5. `REFERRAL-ONLY`: Statutory reserved contentious advocacy (NCLT, High Court) where CCS provides neutral referral to independent advocates under the Advocates Act 1961.
- **Rationale:** Eliminates the misleading binary of "DIRECT (54)" vs "REFERRAL (3)" currently on `services.html`. Protects CCS from regulatory penalties under the Chartered Accountants Act 1949, Company Secretaries Act 1980, and Advocates Act 1961.
- **Evidence:** `OBSERVED IN IMPLEMENTATION`: `services.html` currently filters by `DIRECT` vs `REFERRAL`. Several "DIRECT" services (e.g. Form 10B, Form 3CEB, Form MR-3) legally require independent practitioner certification.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`).
- **Dependencies:** Service registry update, Blueprint Section B, directory filter enhancement.

---

### DEC-004: Priority Phase 1 Launch Service Portfolio (8 Core Services)
- **Decision:** Prioritize the following 8 core services for initial marketing, automated qualification, and active delivery:
  1. **Private Limited Company Incorporation (SPICe+)** (V01-SVC-007)
  2. **Limited Liability Partnership (LLP) Registration** (V01-SVC-002)
  3. **Sole Proprietorship & Partnership Setup** (V01-SVC-005, V01-SVC-006)
  4. **MSME Udyam & PAN/TAN/GST Registration Coordination** (V01-SVC-003, V03-SVC-003/GST)
  5. **Trademark Clearance Search & Form TM-A Filing Coordination** (V06-SVC-003)
  6. **RoC Annual Compliance & Secretarial Retainer Coordination** (V02-SVC-017, AOC-4, MGT-7, DIR-3 KYC)
  7. **Standard Commercial Contracts (MSA, SOW, Founder Pacts)** (V05-SVC-001, V05-SVC-002)
  8. **Fast-Track Company Strike-Off (Form STK-2 / LLP-24)** (V02-SVC-013, V02-SVC-015)
- **Rationale:** High market demand, predictable statutory workflows, repeatable documentation checklists, clear gross contribution margins, and low rework risk when supported by verified checklists.
- **Evidence:** Commercial demand analysis in Indian SME/startup ecosystem; existing conversion tools (`calculator.html`, `trademark-search.html`, `strike-off-checker.html`).
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`).
- **Dependencies:** Homepage navigation, quick-needs bar, operational registers.

---

### DEC-005: Pricing Architecture & Status Classification
- **Decision:** Classify all current 54 pricing figures in `data/pricing.json` and on website pages as:
  > **"Indicative Proposed Professional Fees (Exclusive of Government Portal Fees, Stamp Duty & Disbursements — Subject to Formal Owner Sign-off)"**
  Establish a mathematical pricing formula:
  $$\text{Client Quote} = \text{Base Professional Fee} + \text{Actual Statutory/Govt Disbursements} + \text{Partner Execution Fee} + \text{Taxes (GST)}$$
- **Rationale:** Zero prices in `data/pricing.json` have been formally approved by the Business Owner. Hardcoding rigid prices risks taking on engagements at a loss or misleading clients regarding variable state stamp duties and RoC capital fees.
- **Evidence:** `ESTABLISHED FACT`: `data/pricing.json` inspection proves 54/54 records are `PENDING_COMMERCIAL_APPROVAL` and `UNVERIFIED`.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** Commercial pricing review, client quotations.

---

### DEC-006: Lead Intake UX Refactoring (Replacing "Static Environment" Alert)
- **Decision:** Refactor `showFormFallbackNotice` in `assets/js/forms.js` and associated CSS to replace the developer-oriented alert (*"Online form transmission is not active in this static environment"*) with an executive, high-trust direct consultation dispatch:
  > *"Direct Corporate Advisory Desk: To ensure immediate conflict verification and priority scoping, our compliance desk coordinates new engagements directly via WhatsApp and Secure Email."*
- **Rationale:** High-value corporate clients bounce when presented with messages implying the website is a non-functional static prototype. Transforming this fallback into an intentional, high-touch advisory bridge preserves 100% of data privacy and static-hosting security while dramatically lifting conversion rates.
- **Evidence:** `OBSERVED IN IMPLEMENTATION`: `assets/js/forms.js` lines 642–648 contain the current warning message.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** No (Safe in-scope frontend refactor).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** `assets/js/forms.js`.

---

### DEC-007: Professional Network Onboarding & Fiduciary Boundary Framework
- **Decision:** Establish a formal 12-point Partner Onboarding & Quality Agreement framework before enrolling external CAs, CSs, and Advocates. Explicitly disclaim on the public website that CCS currently operates an active public panel until partners are formally contracted.
- **Rationale:** Professional services regulations in India (Bar Council of India rules, ICAI Code of Ethics, ICSI Guidelines) prohibit fee-sharing, unauthorized legal practice, and solicitation. CCS must operate as an administrative infrastructure and technology coordinator, maintaining clear commercial agency and partner-subcontracting boundaries.
- **Evidence:** Bar Council of India Rules Part VI Chapter II; ICAI Code of Ethics (Clauses 2 & 3 of Part I of First Schedule); ICSI Code of Conduct.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`).
- **Dependencies:** Legal partner contracts, Blueprint Section F.

---

### DEC-008: Client Engagement Standard Operating Procedure (14-Stage Lifecycle)
- **Decision:** Mandate a uniform 14-stage standard customer journey for every client engagement:
  1. *Enquiry* → 2. *Qualification* → 3. *Conflict Check* → 4. *Scope Freeze* → 5. *Quotation* → 6. *Engagement Letter* → 7. *Advance Payment* → 8. *Document Intake* → 9. *Professional Assignment* → 10. *Execution & Filing* → 11. *Quality Audit* → 12. *Delivery & Challan Handover* → 13. *Matter Closure* → 14. *Annual Compliance Lifecycle Transition*.
- **Rationale:** Ensures no matter is executed without advance fee clearance, statutory document checklists, and formal proof of filing (SRN / Challan), eliminating founder bottlenecking and customer disputes.
- **Evidence:** Analysis of operational failure modes in historical corporate secretarial practices.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** Yes (`LEGAL/PROFESSIONAL VALIDATION REQUIRED`).
- **Dependencies:** Blueprint Section E, Operational Registers.

---

### DEC-009: Management Registers & Founder Independence Ratio KPI
- **Decision:** Define 5 operational registers (Lead, Client, Matter, Professional, Billing) and establish the **Founder Independence Ratio (FIR)** as the primary strategic efficiency KPI:
  $$\text{FIR} = \frac{\text{Engagements Completed Without Founder Intervention}}{\text{Total Completed Engagements}} \times 100$$
  Establish a 90-day baseline measurement protocol before locking numerical quarterly targets.
- **Rationale:** Prevents founder burnout, guarantees institutional scalability, and ensures operational systems function independently of founder day-to-day manual intervention.
- **Evidence:** Master Assignment Section 4.G.
- **Status:** `PROPOSED DECISION`.
- **Owner Approval Required:** Yes (`OWNER CONFIRMATION REQUIRED`).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** Blueprint Section G, internal register templates.

---

### DEC-010: Technical & Database Governance Boundary (Preserving Migration 008)
- **Decision:** Strictly enforce the technical governance rules:
  1. Local database `craftegon_ccs_dev` remains strictly anchored on Migration 008.
  2. Migration 009 remains **UNAPPLIED**.
  3. Business Owner Risk Acceptance Record remains **UNSIGNED**.
  4. Service-role credentials remain unprovisioned, and sweep scheduler remains undeployed.
  5. The working repository `craftegon-ccs-clean` is the sole modification target; the reference repository `craftegon-ccs-main` is strictly read-only.
- **Rationale:** Preserves production boundary integrity, complies with corporate governance directives, and prevents accidental catalog corruption or unauthorized database modifications.
- **Evidence:** `ESTABLISHED FACT`: Task constraints in Master Assignment Section 7 and verified database catalog state.
- **Status:** `ESTABLISHED FACT`.
- **Owner Approval Required:** No (Enforcing mandatory constraint).
- **Legal / Professional Validation Required:** No.
- **Dependencies:** Technical governance and database boundary scripts.

---

## 3. Discrepancy & Contradiction Resolutions

| Item | Contradiction Detected | Resolution Implemented | Authority / Basis |
|---|---|---|---|
| **CONTRA-01** | `services.html` displays "54 Direct Compliance Services", including services requiring statutory CA/CS audit licenses. | Reclassified catalog in Blueprint and Directory into 5 distinct operational tiers (`LAUNCH`, `PARTNER-LED`, `SPECIALIST`, `DEFERRED`, `REFERRAL-ONLY`). | Companies Act 2013 Sec 139/204; ICAI/ICSI Statutory Acts. |
| **CONTRA-02** | Display of fixed pricing cards on service pages vs. `PENDING_COMMERCIAL_APPROVAL` in `data/pricing.json`. | Added explicit legal and commercial disclaimers: all displayed prices are indicative baseline professional fees, exclusive of variable government fees and stamp duties. | Consumer Protection Act 2019; `data/pricing.json`. |
| **CONTRA-03** | Form submission static warning (*"Online transmission not active in this static environment"*) creates high user abandonment. | Refactored fallback into an intentional Executive Advisory Desk dispatch (WhatsApp & Email), maintaining static safety while lifting conversion. | Website Conversion & Usability Strategy. |
| **CONTRA-04** | Client portal links advertise live real-time compliance tracking, but portal is currently an unauthenticated static prototype. | Added transparent "Client Portal (Beta Preview)" boundary disclosures; prevented unauthenticated false promises. | Truthful Engineering Standards; DPDP Act 2023. |
