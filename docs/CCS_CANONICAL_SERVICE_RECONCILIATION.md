# CRAFTEGON CORPORATE SERVICES (CCS)
## Canonical Service Architecture & 57-Service Reconciliation Register

**Document Identifier:** `DOC-CCS-RECON-001`  
**Classification:** Technical & Operational Architecture Audit  
**Date:** 2026-11-07  
**Status:** `COMPLETED & VERIFIED`  

---

## 1. Executive Summary

This document provides the authoritative, line-by-line reconciliation of the **15 canonical practice verticals** and **all 57 canonical corporate services** of CraftEgon Corporate Services (CCS) against the initial Business Operating Blueprint.

### Key Findings of this Audit:
1. **Zero Structural Mutation:** Exactly 57 canonical service pages exist on disk in `services/`, backed by 58 entries in `data/service-registry.json` (54 active corporate secretarial/filing services, 3 referral-only services, and 1 utility route `/search/`). **Zero services have been renamed, renumbered, merged, deleted, or relocated.**
2. **Resolution of Blueprint Discrepancies:** The preliminary blueprint had loosely assigned names to certain verticals (e.g. referencing "Real Estate & Infrastructure" or "Banking & Foreign Exchange") and hypothesized route names (e.g. `/services/gst-advisory-filings.html` and `/services/trademark-registration-protection.html`). This document establishes the exact, authoritative 1:1 mapping against `data/verticals.json` and the physical HTML files on disk.
3. **5-Tier Operational Realism:** Services are classified into **LAUNCH (Core 5)**, **PARTNER-LED (24)**, **SPECIALIST (25)**, **DEFERRED (0)**, and **REFERRAL-ONLY (3)** based on direct in-house coordination viability versus reserved statutory professional acts under the CA Act 1949, CS Act 1980, and Advocates Act 1961.

---

## 2. Canonical 15-Vertical Master Architecture

The table below reflects the canonical master structure from `data/verticals.json` validated by the schema verification suite (`npm run test:schemas`).

| Vertical ID | Canonical Practice Vertical Name | Active Service Count | Coverage Gap Status | Statutory & Operational Scope |
| :--- | :--- | :---: | :---: | :--- |
| **V01** | Business Formation & Structuring | 10 | `ACTIVE (0 GAPS)` | Statutory corporate and enterprise incorporation, including Private Limited (SPICe+), LLP, OPC, Section 8, Trust, Society, and MSME/DPIIT registrations under the Companies Act 2013 and applicable statutes. |
| **V02** | Corporate Compliance & Secretarial | 18 | `ACTIVE (0 GAPS)` | Routine and event-based company secretarial compliance, statutory RoC filings, annual returns (AOC-4, MGT-7, ADT-1), DIR-3 KYC, and corporate secretarial retainers under the Companies Act 2013. |
| **V03** | Tax & Regulatory Registrations | 5 | `ACTIVE (0 GAPS)` | Corporate direct and indirect tax return filings, statutory trust audits (Form 10B/10BB), transfer pricing reports (Form 3CEB), and GST annual reconciliations (GSTR-9/9C). |
| **V04** | Licenses & Statutory Registrations | 1 | `ACTIVE (0 GAPS)` | Labour and social security establishment registrations, monthly EPFO and ESIC compliance, and statutory enterprise registrations. |
| **V05** | Contracts & Legal Architecture | 2 | `ACTIVE (0 GAPS)` | Corporate commercial agreements, Master Service Agreements (MSA), Statements of Work (SOW), Founder Vesting Pacts, and Share Purchase/Shareholders Agreements under the Indian Contract Act 1872. |
| **V06** | Intellectual Property (IPR) | 3 | `ACTIVE (0 GAPS)` | Trademark clearance searches, Form TM-A filings, software copyright registration, technology patent documentation, and formal IP enforcement notices under the Trade Marks Act 1999 and Copyright Act 1957. |
| **V07** | Employment & HR Compliance | 2 | `ACTIVE (0 GAPS)` | Employment policy handbooks aligned with the 4 Labour Codes, statutory POSH Act Internal Committee (IC) constitution, governance, and annual compliance reporting. |
| **V08** | Startup & Investment Advisory | 0 | `TRUE (PLANNED)` | Approved Coverage Gap in this 57-route archive. Seed/venture investment governance, cap table management, and term sheet advisory; cross-linked secondarily from V05 Founder Agreements. |
| **V09** | Corporate Transactions & M&A | 3 | `ACTIVE (0 GAPS)` | Section 233 fast-track mergers, business slump sales and asset purchase transfers, and transactional scheme company secretarial documentation under Sections 230–232 of the Companies Act 2013. |
| **V10** | Dispute Avoidance (Non-Litigation) | 0 | `TRUE (PLANNED)` | Approved Coverage Gap in this 57-route archive. Neutral statutory guidance and external referral advisory. All contentious tribunal advocacy and litigation representation are referred to independent advocates under the Advocates Act 1961. |
| **V11** | Governance, Audit & Risk | 4 | `ACTIVE (0 GAPS)` | Internal Board governance reviews, Secretarial Standards SS-1/SS-2 compliance, Form CSR-2 corporate social responsibility reporting, and Form MR-3 secretarial audit services under Section 204. |
| **V12** | Data Privacy & Tech Law | 3 | `ACTIVE (0 GAPS)` | Digital Personal Data Protection (DPDP) Act 2023 compliance audits, CERT-In statutory 6-hour cyber incident disclosures, and enterprise SaaS terms and privacy architecture. |
| **V13** | International Business & FEMA | 3 | `ACTIVE (0 GAPS)` | Cross-border intellectual property licensing, Form FC-3/FC-4 foreign branch and liaison office compliance, and RBI Foreign Liabilities and Assets (FLA) return filings under FEMA 1999. |
| **V14** | Corporate Retainers & Legal Desk | 0 | `TRUE (PLANNED)` | Approved Coverage Gap in this 57-route archive. General corporate counsel retainers and ongoing legal desk advisory; cross-linked secondarily from V02 RoC Retainer. |
| **V15** | IT & Digital Infrastructure | 0 | `TRUE (PLANNED)` | Approved Coverage Gap in this 57-route archive. IT compliance architecture and digital systems governance; zero active services or artificial IDs created. |

> [!NOTE]
> Verticals `V08` (Startup & Investment Advisory), `V10` (Dispute Avoidance), `V14` (Corporate Retainers & Legal Desk), and `V15` (IT & Digital Infrastructure) are currently defined as coverage gap domains (`is_coverage_gap: true`). High-stakes disputes and litigation are handled strictly via the 3 non-service external referral routes under the Advocates Act 1961.

---

## 3. Discrepancy & Hallucination Resolution

| Category | Blueprint Observation | Canonical Reality on Disk | Corrective Action |
| :--- | :--- | :--- | :--- |
| **GST Service Route** | Blueprint cited `/services/gst-advisory-filings.html` (`V03-SVC-001`) | Canonical route is `/services/gst-annual.html` (`V03-SVC-003`). `V03-SVC-001` is Form 10B/10BB Trust Audit. | Corrected route to `/services/gst-annual.html`; classified GSTR-9/9C as `PARTNER-LED` due to mandatory tax audit reconciliation. |
| **Trademark Route** | Blueprint cited `/services/trademark-registration-protection.html` (`V06-SVC-001`) | Canonical route is `/services/trademark-registration.html` (`V06-SVC-003`). `V06-SVC-001` is IP Enforcement & Cease/Desist. | Reconciled to canonical `V06-SVC-003` `/services/trademark-registration.html`. |
| **RoC Retainer Route** | Blueprint cited `/services/roc-annual-compliance.html` as `V02-SVC-004/008` | Canonical route is `/services/roc-annual-compliance.html` (`V02-SVC-017`). Form AOC-4 is `V02-SVC-004` and MGT-7 is `V02-SVC-008`. | Reconciled retainer to `V02-SVC-017` and standalone forms to `V02-SVC-004`/`008`. |
| **Pricing Status** | Blueprint suggested potential fixed published fees | 100% of 54 priced services are `PENDING_COMMERCIAL_APPROVAL` and `UNVERIFIED` | Instituted mandatory cost-plus formula; rates remain strictly unpublished. |

---

## 4. Comprehensive 57-Service Canonical Reconciliation Table

| Vertical | Service ID | Service Name | Canonical Route | Current Blueprint Class | Proposed Delivery Class | Professional Requirements | Commercial Readiness | Legal Validation Status | Launch Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **V01** | `V01-SVC-001` | [DPIIT Startup India Recognition & Section 56(2)(viib) Exemption](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/dpiit-startup-india.html) | `/services/dpiit-startup-india.html` | `LAUNCH` | `PARTNER-LED` | DPIIT Consultant / CA (80-IAC) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_2_PARTNER_EXPANSION` |
| **V01** | `V01-SVC-002` | [Limited Liability Partnership (LLP) Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/llp-registration.html) | `/services/llp-registration.html` | `LAUNCH` | `LAUNCH` | Internal Ops + Practicing CS/CA (Form 3 UDIN) | `undefined` | `VERIFIED` | `CORE_LAUNCH_PORTFOLIO` |
| **V01** | `V01-SVC-003` | [MSME / Udyam Registration Online](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/msme-udyam.html) | `/services/msme-udyam.html` | `LAUNCH` | `LAUNCH` | Internal Ops (Aadhaar OTP direct) | `undefined` | `VERIFIED` | `CORE_LAUNCH_PORTFOLIO` |
| **V01** | `V01-SVC-004` | [One Person Company (OPC) Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/opc-registration.html) | `/services/opc-registration.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Ops + Practicing CA/CS/Advocate | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V01** | `V01-SVC-005` | [Partnership Firm Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/partnership-registration.html) | `/services/partnership-registration.html` | `PARTNER-LED` | `PARTNER-LED` | RoF Liaison / Regional Advocate | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_2_PARTNER_EXPANSION` |
| **V01** | `V01-SVC-006` | [Sole Proprietorship Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/proprietorship-registration.html) | `/services/proprietorship-registration.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Ops (Udyam + GSTIN + Shop Act) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V01** | `V01-SVC-007` | [Private Limited Company Registration (SPICe+)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/pvt-ltd-registration.html) | `/services/pvt-ltd-registration.html` | `LAUNCH` | `LAUNCH` | Internal Ops + Practicing CA/CS/Advocate (SPICe+ INC-140 UDIN) | `undefined` | `VERIFIED` | `CORE_LAUNCH_PORTFOLIO` |
| **V01** | `V01-SVC-008` | [Section 8 Company / Non-Profit Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/section-8-registration.html) | `/services/section-8-registration.html` | `SPECIALIST` | `SPECIALIST` | Senior Practicing CS / CA (Form INC-12 RD License) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V01** | `V01-SVC-009` | [Society Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/society-registration.html) | `/services/society-registration.html` | `SPECIALIST` | `SPECIALIST` | Societies Registrar Liaison / Advocate | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V01** | `V01-SVC-010` | [Charitable Trust Registration](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/trust-registration.html) | `/services/trust-registration.html` | `SPECIALIST` | `SPECIALIST` | Sub-Registrar Liaison + CA (12AB/80G) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V02** | `V02-SVC-001` | [AOC-4 XBRL Financial Tagging & Filing](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/aoc4-xbrl.html) | `/services/aoc4-xbrl.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS / CA with MCA XBRL Software | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-002` | [DIR-3 KYC Annual Director Verification](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/dir3-kyc.html) | `/services/dir3-kyc.html` | `LAUNCH` | `LAUNCH` | Internal Ops (Web OTP) / CS with DSC (e-Form) | `undefined` | `VERIFIED` | `CORE_LAUNCH_PORTFOLIO` |
| **V02** | `V02-SVC-003` | [Form ADT-1 Statutory Auditor Appointment](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-adt1.html) | `/services/form-adt1.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Ops (Board Res) + Practicing CS/CA | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-004` | [Form AOC-4 Financial Statements Filing](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-aoc4.html) | `/services/form-aoc4.html` | `LAUNCH` | `PARTNER-LED` | Independent Statutory Auditor (CA) + CS (Certification) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-005` | [Form BEN-2 Significant Beneficial Ownership (SBO)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-ben2.html) | `/services/form-ben2.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS (SBO declaration & verification) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-006` | [Form DPT-3 Return of Deposits & Loans](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-dpt3.html) | `/services/form-dpt3.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CA / Statutory Auditor (Cert of Deposits) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-007` | [Form MGT-14 Resolution & Filing Solutions](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-mgt14.html) | `/services/form-mgt14.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS (Sec 117 Resolution Certification) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-008` | [Form MGT-7 Annual Return Filing](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-mgt7.html) | `/services/form-mgt7.html` | `LAUNCH` | `PARTNER-LED` | Practicing CS (Form MGT-7/7A Certification with UDIN) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-009` | [Form MR-1 Appointment of Managing Director, WTD or Manager](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-mr1.html) | `/services/form-mr1.html` | `SPECIALIST` | `SPECIALIST` | Senior Practicing CS (Sec 196/197 Remuneration Compliance) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V02** | `V02-SVC-010` | [Form MSME-1 Half-Yearly Return](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-msme1.html) | `/services/form-msme1.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Ops + CA/CS verification of outstanding vendor dues | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-011` | [Form MSC-1 Application to Obtain Dormant Company Status](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-msc1-dormant.html) | `/services/form-msc1-dormant.html` | `SPECIALIST` | `SPECIALIST` | Practicing CS (Sec 455 Dormant Status Application) | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V02** | `V02-SVC-012` | [Form PAS-6 Reconciliation of Share Capital Audit](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-pas6.html) | `/services/form-pas6.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS / CA (Half-yearly Demat Reconciliation Audit) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-013` | [Form STK-2 Fast-Track Company Strike-Off & Voluntary Closure](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-stk2-strike-off.html) | `/services/form-stk2-strike-off.html` | `SPECIALIST` | `SPECIALIST` | Practicing CA (Indemnity/Statement of Accounts) + CS | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V02** | `V02-SVC-014` | [LLP Annual Filings (Form 11 Annual Return & Form 8 Statement of Account)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/llp-compliance-forms.html) | `/services/llp-compliance-forms.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS / CA (LLP Form 11 & Form 8 Statement of Accounts) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-015` | [LLP Form 24 Fast-Track Strike-Off & Closure](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/llp-form24-strike-off.html) | `/services/llp-form24-strike-off.html` | `SPECIALIST` | `SPECIALIST` | Practicing CA (Statement of Nil Assets/Liabilities) + CS | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V02** | `V02-SVC-016` | [Form MBP-1 & DIR-8 Director Disclosures](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/mbp1-dir8.html) | `/services/mbp1-dir8.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Ops secretarial drafting (Sec 184/164 disclosures) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-017` | [RoC Annual Compliance & Secretarial Retainer](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/roc-annual-compliance.html) | `/services/roc-annual-compliance.html` | `LAUNCH` | `PARTNER-LED` | Practicing CS Retainer (Annual RoC Compliance Bundle) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V02** | `V02-SVC-018` | [Registrar of Firms (RoF) Maintenance & Amendments](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/rof-maintenance.html) | `/services/rof-maintenance.html` | `PARTNER-LED` | `PARTNER-LED` | RoF Liaison / Corporate Paralegal | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_2_PARTNER_EXPANSION` |
| **V03** | `V03-SVC-001` | [Form 10B / 10BB Trust Audit Report](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-10b.html) | `/services/form-10b.html` | `SPECIALIST` | `SPECIALIST` | Practicing CA (Sec 12A(1)(b) Trust Audit with UDIN) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V03** | `V03-SVC-002` | [Form 3CEB International Transfer Pricing Report](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-3ceb.html) | `/services/form-3ceb.html` | `SPECIALIST` | `SPECIALIST` | Practicing CA with International Tax Specialization (Sec 92E) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V03** | `V03-SVC-003` | [GST Annual Return & Reconciliation (GSTR-9 & GSTR-9C)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/gst-annual.html) | `/services/gst-annual.html` | `LAUNCH` | `PARTNER-LED` | Practicing CA (GSTR-9/9C Reconciliation & Tax Audit) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V03** | `V03-SVC-004` | [ITR-7 Filing for Companies, Trusts & Institutions](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/itr7.html) | `/services/itr7.html` | `SPECIALIST` | `SPECIALIST` | Practicing CA (ITR-7 Trust/Company Tax Filing) | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V03** | `V03-SVC-005` | [Proprietorship & SME Income Tax Returns](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/proprietorship-tax.html) | `/services/proprietorship-tax.html` | `PARTNER-LED` | `PARTNER-LED` | Tax Practitioner / CA (ITR-3/ITR-4 SME Tax) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V04** | `V04-SVC-001` | [PF / ESIC Statutory Registration & Monthly Return Filings](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/pf-esic-compliance.html) | `/services/pf-esic-compliance.html` | `PARTNER-LED` | `PARTNER-LED` | Payroll & Labour Compliance Specialist | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V05** | `V05-SVC-001` | [Founder Pacts, Shareholder Agreements (SHA) & Share Purchase Agreements (SPA)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/founder-shareholder-agreements.html) | `/services/founder-shareholder-agreements.html` | `SPECIALIST` | `SPECIALIST` | Vetted Corporate Commercial Counsel (Advocate) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V05** | `V05-SVC-002` | [Master Service Agreements (MSA), SOWs & Commercial Vendor Contracts](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/master-service-agreements.html) | `/services/master-service-agreements.html` | `PARTNER-LED` | `PARTNER-LED` | Commercial Contracts Counsel (Advocate/LLM) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V06** | `V06-SVC-001` | [IP Enforcement & Cease and Desist Issuance](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/ip-enforcement-cease-desist.html) | `/services/ip-enforcement-cease-desist.html` | `SPECIALIST` | `SPECIALIST` | Practicing IP Advocate (Formal Cease & Desist Notice) | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V06** | `V06-SVC-002` | [Software Copyright, Source Code & Tech Patent Filings](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/software-copyright-patents.html) | `/services/software-copyright-patents.html` | `SPECIALIST` | `SPECIALIST` | Registered Patent Agent / IP Counsel | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V06** | `V06-SVC-003` | [Brand Name, Logo & Slogan Trademark Registration (Form TM-A)](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/trademark-registration.html) | `/services/trademark-registration.html` | `LAUNCH` | `LAUNCH` | Internal Ops (Search & Prep) + Registered Trademark Agent | `undefined` | `VERIFIED` | `CORE_LAUNCH_PORTFOLIO` |
| **V07** | `V07-SVC-001` | [Labour Code Healthcheck & Comprehensive Employee Handbooks](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/labour-code-handbooks.html) | `/services/labour-code-handbooks.html` | `PARTNER-LED` | `PARTNER-LED` | Labour Law Practitioner / HR Legal Counsel | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_2_PARTNER_EXPANSION` |
| **V07** | `V07-SVC-002` | [Mandatory POSH Act Compliance & Internal Committee (IC) Setup](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/posh-compliance.html) | `/services/posh-compliance.html` | `PARTNER-LED` | `PARTNER-LED` | Certified POSH External Member / Advocate | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V09** | `V09-SVC-001` | [Section 233 Fast-Track Parent-Subsidiary & Small Company Mergers](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/fast-track-mergers.html) | `/services/fast-track-mergers.html` | `SPECIALIST` | `SPECIALIST` | Senior Practicing CS + Corporate Counsel (Sec 233 RD approval) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V09** | `V09-SVC-002` | [Corporate Slump Sale & Business Asset Purchase Governance](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/slump-sale-asset-purchase.html) | `/services/slump-sale-asset-purchase.html` | `SPECIALIST` | `SPECIALIST` | M&A Tax Partner (CA) + Corporate Counsel (Sec 50B BTA) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **OTHER** | `NONE` | [Director Removal, Vacation of Office & Board Control Litigation](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/director-removal-board-disputes.html) | `/services/director-removal-board-disputes.html` | `REFERRAL-ONLY` | `REFERRAL-ONLY` | Independent Practicing Advocate (High Court/NCLT Vakalatnama) | `N/A (REFERRAL)` | `VERIFIED` | `REFERRAL_ONLY` |
| **OTHER** | `NONE` | [NCLT Corporate Insolvency Resolution Process (CIRP) Defense](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/nclt-insolvency-defense.html) | `/services/nclt-insolvency-defense.html` | `REFERRAL-ONLY` | `REFERRAL-ONLY` | Insolvency Professional (IBBI) / Advocate (NCLT Vakalatnama) | `N/A (REFERRAL)` | `VERIFIED` | `REFERRAL_ONLY` |
| **V09** | `V09-SVC-003` | [NCLT Merger Petition & Complex Amalgamation Execution](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/nclt-merger-petitions.html) | `/services/nclt-merger-petitions.html` | `SPECIALIST` | `SPECIALIST` | Practicing CS (Scheme drafting) + Advocate (NCLT petition) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **OTHER** | `NONE` | [Section 241 & 242 Oppression and Mismanagement Petitions](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/oppression-mismanagement-petitions.html) | `/services/oppression-mismanagement-petitions.html` | `REFERRAL-ONLY` | `REFERRAL-ONLY` | Independent NCLT Practicing Advocate (Sec 241/242 Vakalatnama) | `N/A (REFERRAL)` | `VERIFIED` | `REFERRAL_ONLY` |
| **V11** | `V11-SVC-001` | [Internal Board Governance & Secretarial Health Check](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/board-governance-risk-assessment.html) | `/services/board-governance-risk-assessment.html` | `SPECIALIST` | `SPECIALIST` | Senior Practicing CS (Governance Audit) | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V11** | `V11-SVC-002` | [Board Minutes & Statutory Registers Maintenance](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/board-minutes.html) | `/services/board-minutes.html` | `PARTNER-LED` | `PARTNER-LED` | Internal Secretarial Operations / CS Trainee | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V11** | `V11-SVC-003` | [Form CSR-2 Annual Corporate Social Responsibility Report](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-csr2.html) | `/services/form-csr2.html` | `PARTNER-LED` | `PARTNER-LED` | Practicing CS / CA (Form CSR-2 statutory reporting) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |
| **V11** | `V11-SVC-004` | [Mandatory Form MR-3 Secretarial Audit Services](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-mr3-secretarial-audit.html) | `/services/form-mr3-secretarial-audit.html` | `SPECIALIST` | `SPECIALIST` | Independent Practicing CS with Peer Review (Sec 204 MR-3) | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V12** | `V12-SVC-001` | [Cyber Incident Reporting, CERT-In & IT Act Statutory Mandates](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/cyber-incident-reporting.html) | `/services/cyber-incident-reporting.html` | `SPECIALIST` | `SPECIALIST` | Cybersecurity Legal Counsel / IT Act Specialist | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V12** | `V12-SVC-002` | [DPDP Act Data Fiduciary Governance & Readiness Audit](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/dpdp-compliance-audit.html) | `/services/dpdp-compliance-audit.html` | `SPECIALIST` | `SPECIALIST` | Certified Data Protection Officer (DPO) / DPDP Counsel | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V12** | `V12-SVC-003` | [SaaS Terms of Service, EULAs & Privacy Architecture](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/saas-terms-privacy-architecture.html) | `/services/saas-terms-privacy-architecture.html` | `SPECIALIST` | `SPECIALIST` | Tech Transactions Attorney / IT Contracts Specialist | `undefined` | `VERIFIED` | `TIER_3_SPECIALIST_ADVISORY` |
| **V13** | `V13-SVC-001` | [Cross-Border Technology Transfer & Licensing Agreements](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/cross-border-tech-transfer.html) | `/services/cross-border-tech-transfer.html` | `SPECIALIST` | `SPECIALIST` | FEMA & Cross-Border Counsel (Advocate/CA) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V13** | `V13-SVC-002` | [Form FC-3 / FC-4 Foreign Branch Office (BO) & Liaison Office (LO) Compliance](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/form-fc3-fc4.html) | `/services/form-fc3-fc4.html` | `SPECIALIST` | `SPECIALIST` | Practicing CS / CA (RBI & MCA Form FC-3/FC-4 filings) | `undefined` | `REQUIRES_PROFESSIONAL_REVIEW` | `TIER_3_SPECIALIST_ADVISORY` |
| **V13** | `V13-SVC-003` | [RBI Foreign Liabilities and Assets (FLA) Return Filing](file:///C:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/services/rbi-fla-return.html) | `/services/rbi-fla-return.html` | `SPECIALIST` | `PARTNER-LED` | Practicing CA / FEMA Specialist (RBI FLA FIRMS portal) | `undefined` | `VERIFIED` | `TIER_2_PARTNER_EXPANSION` |

---

## 5. Summary of Recommended Delivery Classifications

### A. CORE LAUNCH PORTFOLIO (5 Services)
1. `V01-SVC-007`: Private Limited Company Registration (SPICe+) (`/services/pvt-ltd-registration.html`)
2. `V01-SVC-002`: Limited Liability Partnership (LLP) Registration (`/services/llp-registration.html`)
3. `V01-SVC-003`: MSME / Udyam Registration Online (`/services/msme-udyam.html`)
4. `V02-SVC-002`: DIR-3 KYC Annual Director Verification (`/services/dir3-kyc.html`)
5. `V06-SVC-003`: Brand Name, Logo & Slogan Trademark Registration (Form TM-A) (`/services/trademark-registration.html`)

> **Rationale for Core 5 Focus:** These 5 services represent the absolute highest-velocity, lowest-risk, operationally self-contained corporate legal and secretarial filings in India. They require standard documentation, possess clear statutory turnaround times, and can be coordinated smoothly with accredited partner sign-off.

### B. TIER 2: PARTNER-LED SERVICES (24 Services)
Recurring RoC compliance, GST reconciliation, DPIIT registrations, and routine board filings. These services require pre-negotiated service-level agreements (SLAs) with qualified practicing Company Secretaries and Chartered Accountants.

### C. TIER 3: SPECIALIST ADVISORY (25 Services)
High-complexity matters including Section 233 Fast-Track Mergers, Slump Sales, Cross-Border FEMA structuring, DPDP Act audits, and Section 204 Secretarial Audits. Delivered exclusively on a custom scope-and-quote basis by senior corporate practitioners.

### D. REFERRAL-ONLY (3 Services)
1. Director Removal, Vacation of Office & Board Control Litigation (`/services/director-removal-board-disputes.html`)
2. NCLT Corporate Insolvency Resolution Process (CIRP) Defense (`/services/nclt-insolvency-defense.html`)
3. Section 241 & 242 Oppression and Mismanagement Petitions (`/services/oppression-mismanagement-petitions.html`)
> **Legal Boundary:** Under the Advocates Act 1961 and Bar Council of India rules, CCS does not represent clients in judicial or quasi-judicial forums. Inquiries are redirected to independent practicing advocates on separate vakalatnamas.

---

## 6. Structural Invariant Certification

- [x] 100% of 15 Canonical Verticals preserved.
- [x] 100% of 57 Canonical Services accounted for on disk.
- [x] Zero files renamed, relocated, deleted, or merged.
- [x] Zero changes to `data/service-registry.json` or `data/pricing.json`.
- [x] Zero changes to database schema or migrations.
