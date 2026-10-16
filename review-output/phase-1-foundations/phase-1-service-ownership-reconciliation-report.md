# CraftEgon CCS — Phase 1 Service Ownership Reconciliation Report

**Document ID**: `CRAFTEGON-DOC-P1-002`  
**Classification**: Regulatory Architecture & Service Taxonomy Audit  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  
**Audit Date**: 2026-10-16  
**Auditor**: Antigravity Technical Architecture Team  
**Governing Register**: `phase-1-service-ownership-review.csv` & `phase-1-service-ownership-review.md` (Approved 2026-10-16)  
**Status**: COMPLETE (100% Reconciled Across Repository Source Code)

---

## 1. Reconciliation Overview

This report provides a line-by-line audit comparing the authoritative Phase 1 decision records (`phase-1-service-ownership-review.csv` and `phase-1-service-ownership-review.md`) against the physical source files, navigation trees, and route registers in `craftegon-ccs`.

### Reconciliation Metrics
- **Total Service Routes Audited**: 57 unique `/services/*.html` routes.
- **Physical Service Files on Disk**: 57 files verified in `services/`.
- **Approved Active Service IDs Locked**: 54 IDs (53 active services + 1 transactional merger `V09-SVC-003`).
- **Referral-Only Informational Routes**: 3 routes (0 service IDs, 0 active primary verticals).
- **Approved Coverage Gaps**: 4 verticals (V08, V10, V14, V15) with exactly 0 assigned service IDs.
- **Duplicate Service IDs**: 0.
- **Missing or Orphan Routes**: 0.
- **Reconciliation Conflicts**: 0.

---

## 2. Approved Taxonomy Coverage Summary

| Code | Approved Vertical Name | Mapped Routes | Active Service IDs | Coverage Status | Notes |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **V01** | Business Formation & Structuring | 10 | 10 | Fully Mapped | `V01-SVC-001` to `V01-SVC-010` |
| **V02** | Corporate Compliance & Secretarial | 18 | 18 | Fully Mapped | `V02-SVC-001` to `V02-SVC-018` |
| **V03** | Tax & Regulatory Registrations | 5 | 5 | Fully Mapped | `V03-SVC-001` to `V03-SVC-005` |
| **V04** | Licenses & Statutory Registrations | 1 | 1 | Fully Mapped | `V04-SVC-001` |
| **V05** | Contracts & Legal Architecture | 2 | 2 | Fully Mapped | `V05-SVC-001` to `V05-SVC-002` |
| **V06** | Intellectual Property (IPR) | 3 | 3 | Fully Mapped | `V06-SVC-001` to `V06-SVC-003` (including trademark-registration.html) |
| **V07** | Employment & HR Compliance | 2 | 2 | Fully Mapped | `V07-SVC-001` to `V07-SVC-002` |
| **V08** | Startup & Investment Advisory | 0 | 0 | **Coverage Gap** | No service assigned; cross-links only from V05 |
| **V09** | Corporate Transactions & M&A | 3 | 3 | Fully Mapped | `V09-SVC-001` to `V09-SVC-003` (includes NCLT transactional merger) |
| **V10** | Dispute Avoidance (Non-Litigation) | 0 | 0 | **Coverage Gap** | 3 litigation routes are external referral only |
| **V11** | Governance, Audit & Risk | 4 | 4 | Fully Mapped | `V11-SVC-001` to `V11-SVC-004` (includes CSR-2) |
| **V12** | Data Privacy & Tech Law | 3 | 3 | Fully Mapped | `V12-SVC-001` to `V12-SVC-003` (includes DPDP & Cyber Incident) |
| **V13** | International Business & FEMA | 3 | 3 | Fully Mapped | `V13-SVC-001` to `V13-SVC-003` |
| **V14** | Corporate Retainers & Legal Desk | 0 | 0 | **Coverage Gap** | Approved name: Corporate Retainers & Legal Desk |
| **V15** | IT & Digital Infrastructure | 0 | 0 | **Coverage Gap** | Approved coverage gap with 0 services (V15 = 0) |
| **Total** | | **57** | **54** | | **54 Approved Service IDs + 3 Referral-Only Routes** |

---

## 3. Line-by-Line Service Ownership Register (All 57 Routes)

| Approved Service ID | Status | Route | Service / Information Label | Primary Vertical | Related Verticals | Scope & Reconciliation Notes | Disk State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `V01-SVC-001` | Active Service | `/services/dpiit-startup-india.html` | DPIIT Startup India Recognition & Section 56(2)(viib) Exemption | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-002` | Active Service | `/services/llp-registration.html` | Limited Liability Partnership (LLP) Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-003` | Active Service | `/services/msme-udyam.html` | MSME / Udyam Registration Online | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-004` | Active Service | `/services/opc-registration.html` | One Person Company (OPC) Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-005` | Active Service | `/services/partnership-registration.html` | Partnership Firm Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-006` | Active Service | `/services/proprietorship-registration.html` | Sole Proprietorship Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-007` | Active Service | `/services/pvt-ltd-registration.html` | Private Limited Company Registration (SPICe+) | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-008` | Active Service | `/services/section-8-registration.html` | Section 8 Company / Non-Profit Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-009` | Active Service | `/services/society-registration.html` | Society Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V01-SVC-010` | Active Service | `/services/trust-registration.html` | Charitable Trust Registration | V01 Business Formation & Structuring | None | Canonical primary V01. | Present |
| `V02-SVC-001` | Active Service | `/services/aoc4-xbrl.html` | AOC-4 XBRL Financial Tagging & Filing | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-002` | Active Service | `/services/dir3-kyc.html` | DIR-3 KYC Annual Director Verification | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-003` | Active Service | `/services/form-adt1.html` | Form ADT-1 Statutory Auditor Appointment | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-004` | Active Service | `/services/form-aoc4.html` | Form AOC-4 Financial Statements Filing | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-005` | Active Service | `/services/form-ben2.html` | Form BEN-2 Significant Beneficial Ownership (SBO) | V02 Corporate Compliance & Secretarial | V11 Governance, Audit & Risk | Canonical primary V02; secondary link to V11. | Present |
| `V02-SVC-006` | Active Service | `/services/form-dpt3.html` | Form DPT-3 Return of Deposits & Loans | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-007` | Active Service | `/services/form-mgt14.html` | Form MGT-14 Resolution & Filing Solutions | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-008` | Active Service | `/services/form-mgt7.html` | Form MGT-7 Annual Return Filing | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-009` | Active Service | `/services/form-mr1.html` | Form MR-1 Appointment of Managing Director, WTD or Manager | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-010` | Active Service | `/services/form-msme1.html` | Form MSME-1 Half-Yearly Return | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-011` | Active Service | `/services/form-msc1-dormant.html` | Form MSC-1 Application to Obtain Dormant Company Status | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-012` | Active Service | `/services/form-pas6.html` | Form PAS-6 Reconciliation of Share Capital Audit | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-013` | Active Service | `/services/form-stk2-strike-off.html` | Form STK-2 Fast-Track Company Strike-Off & Voluntary Closure | V02 Corporate Compliance & Secretarial | None | Canonical primary V02 routine closure; cross-link from Exit. | Present |
| `V02-SVC-014` | Active Service | `/services/llp-compliance-forms.html` | LLP Annual Filings (Form 11 Annual Return & Form 8 Statement of Account) | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-015` | Active Service | `/services/llp-form24-strike-off.html` | LLP Form 24 Fast-Track Strike-Off & Closure | V02 Corporate Compliance & Secretarial | None | Canonical primary V02 routine closure; cross-link from Exit. | Present |
| `V02-SVC-016` | Active Service | `/services/mbp1-dir8.html` | Form MBP-1 & DIR-8 Director Disclosures | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V02-SVC-017` | Active Service | `/services/roc-annual-compliance.html` | RoC Annual Compliance & Secretarial Retainer | V02 Corporate Compliance & Secretarial | V14 Corporate Retainers & Legal Desk | Canonical primary V02; secondary link to V14. | Present |
| `V02-SVC-018` | Active Service | `/services/rof-maintenance.html` | Registrar of Firms (RoF) Maintenance & Amendments | V02 Corporate Compliance & Secretarial | None | Canonical primary V02. | Present |
| `V03-SVC-001` | Active Service | `/services/form-10b.html` | Form 10B / 10BB Trust Audit Report | V03 Tax & Regulatory Registrations | None | Canonical primary V03. | Present |
| `V03-SVC-002` | Active Service | `/services/form-3ceb.html` | Form 3CEB International Transfer Pricing Report | V03 Tax & Regulatory Registrations | V13 International Business & FEMA | Canonical primary V03; secondary link to V13. | Present |
| `V03-SVC-003` | Active Service | `/services/gst-annual.html` | GST Annual Return & Reconciliation (GSTR-9 & GSTR-9C) | V03 Tax & Regulatory Registrations | None | Canonical primary V03. | Present |
| `V03-SVC-004` | Active Service | `/services/itr7.html` | ITR-7 Filing for Companies, Trusts & Institutions | V03 Tax & Regulatory Registrations | None | Canonical primary V03. | Present |
| `V03-SVC-005` | Active Service | `/services/proprietorship-tax.html` | Proprietorship & SME Income Tax Returns | V03 Tax & Regulatory Registrations | None | Canonical primary V03. | Present |
| `V04-SVC-001` | Active Service | `/services/pf-esic-compliance.html` | PF / ESIC Statutory Registration & Monthly Return Filings | V04 Licenses & Statutory Registrations | V07 Employment & HR Compliance | Canonical primary V04; secondary link to V07. | Present |
| `V05-SVC-001` | Active Service | `/services/founder-shareholder-agreements.html` | Founder Pacts, Shareholder Agreements (SHA) & Share Purchase Agreements (SPA) | V05 Contracts & Legal Architecture | V08 Startup & Investment Advisory | Canonical primary V05; secondary link to V08. | Present |
| `V05-SVC-002` | Active Service | `/services/master-service-agreements.html` | Master Service Agreements (MSA), SOWs & Commercial Vendor Contracts | V05 Contracts & Legal Architecture | None | Canonical primary V05. | Present |
| `V06-SVC-001` | Active Service | `/services/ip-enforcement-cease-desist.html` | IP Enforcement & Cease and Desist Issuance | V06 Intellectual Property (IPR) | None | Canonical primary V06. | Present |
| `V06-SVC-002` | Active Service | `/services/software-copyright-patents.html` | Software Copyright, Source Code & Tech Patent Filings | V06 Intellectual Property (IPR) | None | Canonical primary V06. | Present |
| `V06-SVC-003` | Active Service | `/services/trademark-registration.html` | Brand Name, Logo & Slogan Trademark Registration (Form TM-A) | V06 Intellectual Property (IPR) | None | Canonical primary V06. Physically present in extracted tree. | Present |
| `V07-SVC-001` | Active Service | `/services/labour-code-handbooks.html` | Labour Code Healthcheck & Comprehensive Employee Handbooks | V07 Employment & HR Compliance | None | Canonical primary V07. | Present |
| `V07-SVC-002` | Active Service | `/services/posh-compliance.html` | Mandatory POSH Act Compliance & Internal Committee (IC) Setup | V07 Employment & HR Compliance | None | Canonical primary V07. | Present |
| `V09-SVC-001` | Active Service | `/services/fast-track-mergers.html` | Section 233 Fast-Track Parent-Subsidiary & Small Company Mergers | V09 Corporate Transactions & M&A | None | Canonical primary V09 transactional. | Present |
| `V09-SVC-002` | Active Service | `/services/slump-sale-asset-purchase.html` | Corporate Slump Sale & Business Asset Purchase Governance | V09 Corporate Transactions & M&A | V05 Contracts & Legal Architecture | Canonical primary V09; secondary link to V05. | Present |
| *(None)* | Referral Only | `/services/director-removal-board-disputes.html` | Director Removal, Vacation of Office & Board Control Litigation | *(None — External Referral Only)* | None | Informational guide; neutral referral notice. Zero service ID. | Present |
| *(None)* | Referral Only | `/services/nclt-insolvency-defense.html` | NCLT Corporate Insolvency Resolution Process (CIRP) Defense | *(None — External Referral Only)* | None | Informational guide; neutral referral notice. Zero service ID. | Present |
| `V09-SVC-003` | Active Service | `/services/nclt-merger-petitions.html` | NCLT Merger Petition & Complex Amalgamation Execution | V09 Corporate Transactions & M&A | None | Transactional scheme secretarial execution only. Contentious advocacy excluded. | Present |
| *(None)* | Referral Only | `/services/oppression-mismanagement-petitions.html` | Section 241 & 242 Oppression and Mismanagement Petitions | *(None — External Referral Only)* | None | Informational guide; neutral referral notice. Zero service ID. | Present |
| `V11-SVC-001` | Active Service | `/services/board-governance-risk-assessment.html` | Internal Board Governance & Secretarial Health Check | V11 Governance, Audit & Risk | None | Canonical primary V11. | Present |
| `V11-SVC-002` | Active Service | `/services/board-minutes.html` | Board Minutes & Statutory Registers Maintenance | V11 Governance, Audit & Risk | V02 Corporate Compliance & Secretarial | Canonical primary V11; secondary link to V02. | Present |
| `V11-SVC-003` | Active Service | `/services/form-csr2.html` | Form CSR-2 Annual Corporate Social Responsibility Report | V11 Governance, Audit & Risk | V02 Corporate Compliance & Secretarial | Canonical primary V11 (ESG destination); secondary link to V02. | Present |
| `V11-SVC-004` | Active Service | `/services/form-mr3-secretarial-audit.html` | Mandatory Form MR-3 Secretarial Audit Services | V11 Governance, Audit & Risk | V02 Corporate Compliance & Secretarial | Canonical primary V11; secondary link to V02. | Present |
| `V12-SVC-001` | Active Service | `/services/cyber-incident-reporting.html` | Cyber Incident Reporting, CERT-In & IT Act Statutory Mandates | V12 Data Privacy & Tech Law | None | Canonical primary V12. | Present |
| `V12-SVC-002` | Active Service | `/services/dpdp-compliance-audit.html` | DPDP Act Data Fiduciary Governance & Readiness Audit | V12 Data Privacy & Tech Law | None | Canonical primary V12. | Present |
| `V12-SVC-003` | Active Service | `/services/saas-terms-privacy-architecture.html` | SaaS Terms of Service, EULAs & Privacy Architecture | V12 Data Privacy & Tech Law | V05 Contracts & Legal Architecture | Canonical primary V12; secondary link to V05. | Present |
| `V13-SVC-001` | Active Service | `/services/cross-border-tech-transfer.html` | Cross-Border Technology Transfer & Licensing Agreements | V13 International Business & FEMA | None | Canonical primary V13. | Present |
| `V13-SVC-002` | Active Service | `/services/form-fc3-fc4.html` | Form FC-3 / FC-4 Foreign Branch Office (BO) & Liaison Office (LO) Compliance | V13 International Business & FEMA | V02 Corporate Compliance & Secretarial | Canonical primary V13; secondary link to V02. | Present |
| `V13-SVC-003` | Active Service | `/services/rbi-fla-return.html` | RBI Foreign Liabilities and Assets (FLA) Return Filing | V13 International Business & FEMA | None | Canonical primary V13. | Present |

---

## 4. Special Scope & Boundary Audits

### 4.1 Transactional Merger Scope (`V09-SVC-003`)
- **Route**: `/services/nclt-merger-petitions.html`
- **Scope**: Section 230–232 scheme secretarial documentation, convening meetings of creditors and shareholders, preparing notices, statutory company secretarial affidavits, and coordinator with registered valuers and regional directors.
- **Excluded**: Appearance as pleader or arguing counsel before NCLT benches; contentious shareholder opposition litigation.

### 4.2 Three Referral-Only Litigation & Insolvency Routes
- **Routes**: `/services/nclt-insolvency-defense.html`, `/services/oppression-mismanagement-petitions.html`, `/services/director-removal-board-disputes.html`
- **Ownership**: Neither active services nor part of CraftEgon CCS commercial offerings.
- **Disclaimer**: Neutral statutory advisory directing clients to independent counsel enrolled with the Bar Council of India pursuant to the Advocates Act, 1961. Zero claim of an exclusive advocate panel, network, or shared fee arrangement.

### 4.3 Coverage Gaps (V08, V10, V14, V15)
- **V08 (Startup & Investment Advisory)**: 0 services. Cross-referenced from V05 SHA contracts.
- **V10 (Dispute Avoidance)**: 0 services. Non-litigation advisory only.
- **V14 (Corporate Retainers & Legal Desk)**: 0 services. Cross-referenced from V02 RoC retainers.
- **V15 (IT & Digital Infrastructure)**: 0 services. Strictly preserved as 0; zero synthetic services created.

---

## 5. Verification Conclusion

Every service route physically existing in `craftegon-ccs` has been verified against the approved CSV and Markdown register. All 54 service IDs match exactly, all 3 referral-only routes are cleanly separated, and all 4 coverage gaps are transparently recorded.
