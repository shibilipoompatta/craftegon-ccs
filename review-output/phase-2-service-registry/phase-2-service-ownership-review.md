# CraftEgon CCS — Phase 2 Service-ID Assignment Review Table

**Document ID**: `CRAFTEGON-DOC-P2-001`  
**Milestone**: Phase 2, Task 1: Registry and Service-ID Reconciliation  
**Classification**: Master Service Registry & Architectural Baseline  
**Governing Authority**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  
**Audit Date**: 2026-10-17  
**Status**: APPROVED & LOCKED (100% Reconciled Across Repository Source Code)  

---

## 1. Registry Architecture & Reconciliation Overview

This register represents the reconciled, auditable, and machine-readable service-ID assignment review table for Phase 2. Every route accounts for exactly one entry across the 57 services in `craftegon-ccs`.

### Summary Metrics
- **Total Registered Routes**: Exactly 57 routes.
- **Confirmed Approved Active Service IDs**: Exactly 54 unique IDs.
- **Confirmed Referral-Only Routes**: Exactly 3 routes (0 service IDs, 0 active primary verticals).
- **Approved Coverage Gaps**: 4 verticals (V08, V10, V14, V15) with 0 active service IDs.
- **Unresolved Source Conflicts**: 0.
- **Obsolete Annotations**: All provisional labels resolved to confirmed approved status.

---

## 2. Approved 15-Vertical Taxonomy Baseline

| Vertical Code | Approved Vertical Name | Active Service Count | Status | Notes |
| :--- | :--- | :---: | :--- | :--- |
| **V01** | Business Formation & Structuring | 10 | Fully Mapped | `V01-SVC-001` to `V01-SVC-010` |
| **V02** | Corporate Compliance & Secretarial | 18 | Fully Mapped | `V02-SVC-001` to `V02-SVC-018` |
| **V03** | Tax & Regulatory Registrations | 5 | Fully Mapped | `V03-SVC-001` to `V03-SVC-005` |
| **V04** | Licenses & Statutory Registrations | 1 | Fully Mapped | `V04-SVC-001` |
| **V05** | Contracts & Legal Architecture | 2 | Fully Mapped | `V05-SVC-001` to `V05-SVC-002` |
| **V06** | Intellectual Property (IPR) | 3 | Fully Mapped | `V06-SVC-001` to `V06-SVC-003` |
| **V07** | Employment & HR Compliance | 2 | Fully Mapped | `V07-SVC-001` to `V07-SVC-002` |
| **V08** | Startup & Investment Advisory | 0 | Coverage Gap | 0 services; secondary link from V05 |
| **V09** | Corporate Transactions & M&A | 3 | Fully Mapped | `V09-SVC-001` to `V09-SVC-003` (transactional merger execution) |
| **V10** | Dispute Avoidance (Non-Litigation) | 0 | Coverage Gap | 3 litigation routes are neutral referral only |
| **V11** | Governance, Audit & Risk | 4 | Fully Mapped | `V11-SVC-001` to `V11-SVC-004` (includes Form CSR-2) |
| **V12** | Data Privacy & Tech Law | 3 | Fully Mapped | `V12-SVC-001` to `V12-SVC-003` (includes DPDP & Cyber Incident) |
| **V13** | International Business & FEMA | 3 | Fully Mapped | `V13-SVC-001` to `V13-SVC-003` |
| **V14** | Corporate Retainers & Legal Desk | 0 | Coverage Gap | 0 services; secondary link from V02 |
| **V15** | IT & Digital Infrastructure | 0 | Coverage Gap | Approved coverage gap with 0 services |
| **Total** | | **54 Active + 3 Referral** | | **57 Total Service Routes** |

---

## 3. Master Service-ID Assignment Table (All 57 Routes)

| Approved ID | Classification | Canonical Route | Service / Information Label | Primary Vertical | Secondary Links | Scope & Governance Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `V01-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/dpiit-startup-india.html` | DPIIT Startup India Recognition & Section 56(2)(viib) Exemption | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/llp-registration.html` | Limited Liability Partnership (LLP) Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/msme-udyam.html` | MSME / Udyam Registration Online | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-004` | CONFIRMED_APPROVED_SERVICE | `/services/opc-registration.html` | One Person Company (OPC) Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-005` | CONFIRMED_APPROVED_SERVICE | `/services/partnership-registration.html` | Partnership Firm Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-006` | CONFIRMED_APPROVED_SERVICE | `/services/proprietorship-registration.html` | Sole Proprietorship Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-007` | CONFIRMED_APPROVED_SERVICE | `/services/pvt-ltd-registration.html` | Private Limited Company Registration (SPICe+) | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-008` | CONFIRMED_APPROVED_SERVICE | `/services/section-8-registration.html` | Section 8 Company / Non-Profit Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-009` | CONFIRMED_APPROVED_SERVICE | `/services/society-registration.html` | Society Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V01-SVC-010` | CONFIRMED_APPROVED_SERVICE | `/services/trust-registration.html` | Charitable Trust Registration | V01 — Business Formation & Structuring | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/aoc4-xbrl.html` | AOC-4 XBRL Financial Tagging & Filing | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/dir3-kyc.html` | DIR-3 KYC Annual Director Verification | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/form-adt1.html` | Form ADT-1 Statutory Auditor Appointment | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-004` | CONFIRMED_APPROVED_SERVICE | `/services/form-aoc4.html` | Form AOC-4 Financial Statements Filing | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-005` | CONFIRMED_APPROVED_SERVICE | `/services/form-ben2.html` | Form BEN-2 Significant Beneficial Ownership (SBO) | V02 — Corporate Compliance & Secretarial | V11 — Governance, Audit & Risk | Retain V02 approved as canonical primary for MCA filing; link beneficial-ownership governance to V11 secondarily. |
| `V02-SVC-006` | CONFIRMED_APPROVED_SERVICE | `/services/form-dpt3.html` | Form DPT-3 Return of Deposits & Loans | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-007` | CONFIRMED_APPROVED_SERVICE | `/services/form-mgt14.html` | Form MGT-14 Resolution & Filing Solutions | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-008` | CONFIRMED_APPROVED_SERVICE | `/services/form-mgt7.html` | Form MGT-7 Annual Return Filing | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-009` | CONFIRMED_APPROVED_SERVICE | `/services/form-mr1.html` | Form MR-1 Appointment of Managing Director, WTD or Manager | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-010` | CONFIRMED_APPROVED_SERVICE | `/services/form-msme1.html` | Form MSME-1 Half-Yearly Return | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-011` | CONFIRMED_APPROVED_SERVICE | `/services/form-msc1-dormant.html` | Form MSC-1 Application to Obtain Dormant Company Status | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-012` | CONFIRMED_APPROVED_SERVICE | `/services/form-pas6.html` | Form PAS-6 Reconciliation of Share Capital Audit | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-013` | CONFIRMED_APPROVED_SERVICE | `/services/form-stk2-strike-off.html` | Form STK-2 Fast-Track Company Strike-Off & Voluntary Closure | V02 — Corporate Compliance & Secretarial | None | Retain V02 approved for routine company/LLP closure per supplied source scope. Link from legacy Exit discovery as a secondary related-service link; do not duplicate or renumber. |
| `V02-SVC-014` | CONFIRMED_APPROVED_SERVICE | `/services/llp-compliance-forms.html` | LLP Annual Filings (Form 11 Annual Return & Form 8 Statement of Account) | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-015` | CONFIRMED_APPROVED_SERVICE | `/services/llp-form24-strike-off.html` | LLP Form 24 Fast-Track Strike-Off & Closure | V02 — Corporate Compliance & Secretarial | None | Retain V02 approved for routine company/LLP closure per supplied source scope. Link from legacy Exit discovery as a secondary related-service link; do not duplicate or renumber. |
| `V02-SVC-016` | CONFIRMED_APPROVED_SERVICE | `/services/mbp1-dir8.html` | Form MBP-1 & DIR-8 Director Disclosures | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V02-SVC-017` | CONFIRMED_APPROVED_SERVICE | `/services/roc-annual-compliance.html` | RoC Annual Compliance & Secretarial Retainer | V02 — Corporate Compliance & Secretarial | V14 — Corporate Retainers & Legal Desk | Retain V02 approved for compliance deliverables. Retainer/ongoing legal-desk engagement is a secondary V14 relationship; split only if distinct deliverables are approved. |
| `V02-SVC-018` | CONFIRMED_APPROVED_SERVICE | `/services/rof-maintenance.html` | Registrar of Firms (RoF) Maintenance & Amendments | V02 — Corporate Compliance & Secretarial | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V03-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/form-10b.html` | Form 10B / 10BB Trust Audit Report | V03 — Tax & Regulatory Registrations | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V03-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/form-3ceb.html` | Form 3CEB International Transfer Pricing Report | V03 — Tax & Regulatory Registrations | V13 — International Business & FEMA | Retain V03 approved as canonical primary for tax reporting; link cross-border context to V13 secondarily. |
| `V03-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/gst-annual.html` | GST Annual Return & Reconciliation (GSTR-9 & GSTR-9C) | V03 — Tax & Regulatory Registrations | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V03-SVC-004` | CONFIRMED_APPROVED_SERVICE | `/services/itr7.html` | ITR-7 Filing for Companies, Trusts & Institutions | V03 — Tax & Regulatory Registrations | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V03-SVC-005` | CONFIRMED_APPROVED_SERVICE | `/services/proprietorship-tax.html` | Proprietorship & SME Income Tax Returns | V03 — Tax & Regulatory Registrations | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V04-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/pf-esic-compliance.html` | PF / ESIC Statutory Registration & Monthly Return Filings | V04 — Licenses & Statutory Registrations | V07 — Employment & HR Compliance | Retain V04 approved as canonical primary for registrations/authorizations; link recurring employment compliance to V07 secondarily. |
| `V05-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/founder-shareholder-agreements.html` | Founder Pacts, Shareholder Agreements (SHA) & Share Purchase Agreements (SPA) | V05 — Contracts & Legal Architecture | V08 — Startup & Investment Advisory | Retain V05 approved as canonical primary for agreement drafting; link to V08 for fundraising/investment context. Do not duplicate ownership. |
| `V05-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/master-service-agreements.html` | Master Service Agreements (MSA), SOWs & Commercial Vendor Contracts | V05 — Contracts & Legal Architecture | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V06-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/ip-enforcement-cease-desist.html` | IP Enforcement & Cease and Desist Issuance | V06 — Intellectual Property (IPR) | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V06-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/software-copyright-patents.html` | Software Copyright, Source Code & Tech Patent Filings | V06 — Intellectual Property (IPR) | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V06-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/trademark-registration.html` | Brand Name, Logo & Slogan Trademark Registration (Form TM-A) | V06 — Intellectual Property (IPR) | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V07-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/labour-code-handbooks.html` | Labour Code Healthcheck & Comprehensive Employee Handbooks | V07 — Employment & HR Compliance | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V07-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/posh-compliance.html` | Mandatory POSH Act Compliance & Internal Committee (IC) Setup | V07 — Employment & HR Compliance | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V09-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/fast-track-mergers.html` | Section 233 Fast-Track Parent-Subsidiary & Small Company Mergers | V09 — Corporate Transactions & M&A | None | Retain V09 approved as transactional merger work; any contentious representation is outside this assignment and requires separate review. |
| `V09-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/slump-sale-asset-purchase.html` | Corporate Slump Sale & Business Asset Purchase Governance | V09 — Corporate Transactions & M&A | V05 — Contracts & Legal Architecture | Retain V09 approved as transactional work; related contract drafting may be linked secondarily to V05. |
| `*(None)*` | CONFIRMED_REFERRAL_ONLY | `/services/director-removal-board-disputes.html` | Director Removal, Vacation of Office & Board Control Litigation | *(None — Referral Only)* | None | Retain only clearly labelled external-referral information. No CCS representation/service offer; no canonical service ID or primary vertical. |
| `*(None)*` | CONFIRMED_REFERRAL_ONLY | `/services/nclt-insolvency-defense.html` | NCLT Corporate Insolvency Resolution Process (CIRP) Defense | *(None — Referral Only)* | None | Retain only clearly labelled external-referral information. No CCS representation/service offer; no canonical service ID or primary vertical. |
| `V09-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/nclt-merger-petitions.html` | NCLT Merger Petition & Complex Amalgamation Execution | V09 — Corporate Transactions & M&A | None | V09 transactional merger/amalgamation execution only. Contentious representation, litigation, and NCLT advocacy excluded; those matters are referral-only or require separate approved handling. This is a scope split of the existing archive route; no new page is asserted. |
| `*(None)*` | CONFIRMED_REFERRAL_ONLY | `/services/oppression-mismanagement-petitions.html` | Section 241 & 242 Oppression and Mismanagement Petitions | *(None — Referral Only)* | None | Retain only clearly labelled external-referral information. No CCS representation/service offer; no canonical service ID or primary vertical. |
| `V11-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/board-governance-risk-assessment.html` | Internal Board Governance & Secretarial Health Check | V11 — Governance, Audit & Risk | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V11-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/board-minutes.html` | Board Minutes & Statutory Registers Maintenance | V11 — Governance, Audit & Risk | V02 — Corporate Compliance & Secretarial | Retain V11 approved as canonical primary for governance records; link statutory filing/compliance aspects to V02 secondarily. |
| `V11-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/form-csr2.html` | Form CSR-2 Annual Corporate Social Responsibility Report | V11 — Governance, Audit & Risk | V02 — Corporate Compliance & Secretarial | Retain V11-SVC-003 approved as requested ESG/CSR destination. If filing mechanics are separately identified, keep one primary owner and link V02 secondarily; no split is asserted from title alone. |
| `V11-SVC-004` | CONFIRMED_APPROVED_SERVICE | `/services/form-mr3-secretarial-audit.html` | Mandatory Form MR-3 Secretarial Audit Services | V11 — Governance, Audit & Risk | V02 — Corporate Compliance & Secretarial | Retain V11 approved as canonical primary for audit/governance; link statutory filing mechanics to V02 secondarily. |
| `V12-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/cyber-incident-reporting.html` | Cyber Incident Reporting, CERT-In & IT Act Statutory Mandates | V12 — Data Privacy & Tech Law | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V12-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/dpdp-compliance-audit.html` | DPDP Act Data Fiduciary Governance & Readiness Audit | V12 — Data Privacy & Tech Law | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V12-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/saas-terms-privacy-architecture.html` | SaaS Terms of Service, EULAs & Privacy Architecture | V12 — Data Privacy & Tech Law | V05 — Contracts & Legal Architecture | Retain V12 approved as the canonical primary for privacy architecture; SaaS contract drafting may link secondarily to V05. If archive content contains separable deliverables, propose a split for review; no extra page assumed. |
| `V13-SVC-001` | CONFIRMED_APPROVED_SERVICE | `/services/cross-border-tech-transfer.html` | Cross-Border Technology Transfer & Licensing Agreements | V13 — International Business & FEMA | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |
| `V13-SVC-002` | CONFIRMED_APPROVED_SERVICE | `/services/form-fc3-fc4.html` | Form FC-3 / FC-4 Foreign Branch Office (BO) & Liaison Office (LO) Compliance | V13 — International Business & FEMA | V02 — Corporate Compliance & Secretarial | Retain V13 approved as canonical primary for foreign-office/FEMA scope; link filing mechanics to V02 secondarily. |
| `V13-SVC-003` | CONFIRMED_APPROVED_SERVICE | `/services/rbi-fla-return.html` | RBI Foreign Liabilities and Assets (FLA) Return Filing | V13 — International Business & FEMA | None | No checkpoint-driven ID change. Keep one canonical primary vertical; represent adjacent ownership only with secondary related-service links. |

---

## 4. Key Scope and Governance Boundary Assertions

1. **Transactional Merger Scope (`V09-SVC-003`)**:
   - Scope is restricted strictly to Sections 230–232 scheme secretarial documentation, shareholder/creditor meeting notices, RoC/RD coordination, and company secretarial certifications.
   - Contentious tribunal advocacy and pleading before NCLT benches are excluded.

2. **External Referral Routes (No Service IDs)**:
   - `/services/director-removal-board-disputes.html`
   - `/services/nclt-insolvency-defense.html`
   - `/services/oppression-mismanagement-petitions.html`
   - These routes provide objective statutory guidance and neutral referral notices directing users to independent legal practitioners enrolled under the Advocates Act, 1961. Zero claims of representation, in-house advocacy, or exclusive advocate panels.

3. **Coverage Gaps (V08, V10, V14, V15)**:
   - Preserved as strictly 0 active service IDs. No synthetic services or gap-filling IDs created.
