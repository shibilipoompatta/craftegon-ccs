# CraftEgon CCS — Phase 2, Task 5: Eligibility and Jurisdiction Variations Audit Report

**Document ID:** CRAFTEGON-DOC-P2-T5-001  
**Execution Date:** 2026-10-17  
**Task Priority:** High (P2-T5 Statutory Eligibility & Jurisdiction Evidence Gate)  
**Mode:** Inspect → Reconcile → Evidence Review → Validate → Report  
**Environment:** Local Repository Only (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Deployment & Push Status:** Strictly Prohibited / Zero Git Commits / Zero External Pushes / Local-Only  
**Validation Suite Status:** 67/67 Validator Assertions Passed (0 Failed) • 54/54 Main CI Checks Passed (0 Failed) • 121/121 Total Project Assertions Passed (Exit Code 0)  
**Task Closeout Recommendation:** **Accepted with Documented Gaps** (Statutory Evidence Audited; Zero Unevidenced Records Approved; Formal Qualified Review Pending)

---

## 1. Executive Summary & Verification Safeguards

Phase 2, Task 5 performs a rigorous audit of the statutory eligibility requirements, documentary prerequisites, and state-level jurisdiction variations across all 54 active CraftEgon Corporate Services (CCS) services. The objective is to establish an uncompromised legal and regulatory baseline that prevents the conflation of statutory mandates with internal operational recommendations, captures explicit statutory citations, isolates uncodified administrative practices, and enforces strict evidence gating.

### 1.1 Baseline Inventory & Status Distribution

| Dimension / Dataset | Total Records | Status Breakdown | Verification & Gating Summary |
| :--- | :---: | :--- | :--- |
| **Active Service Eligibility Records** | **54** | `SOURCE_IDENTIFIED`: 49<br/>`PENDING_PROFESSIONAL_REVIEW`: 5<br/>`VERIFIED`: 0 | **0 records marked `VERIFIED`** (`last_verified_at: null`). 49 records cite codified central statutes; 5 complex/evolving records downgraded to pending review. |
| **Jurisdiction Variations** | **10** | `SOURCE_IDENTIFIED`: 8<br/>`UNREVIEWED`: 1 (`VAR-004`)<br/>`PENDING_PROFESSIONAL_REVIEW`: 1 (`VAR-010`)<br/>`VERIFIED`: 0 | **0 records marked `VERIFIED`** (`last_verified_at: null`). State stamp duty and PT rules verified against state acts; administrative practices strictly segregated. |
| **Approved Canonical Routes** | **57** | Active Services: 54<br/>Referral-Only Routes: 3 | 100% referential alignment with Phase 1 baseline and `service-registry.json`. Zero commercial eligibility records assigned to referral routes. |
| **Practice Verticals** | **15** | `V01` through `V15` | Every eligibility record contains verified `primary_vertical_id` strictly matching `service-registry.json`. |
| **Production Runtime Gating Note** | — | `isApprovedForClientFacing() === false` | **Crucial Architectural Safeguard:** While `isApprovedForClientFacing()` returns `false` for 100% of data layer records, this currently acts as a test-suite validator gate; it is **not yet production runtime enforcement** because static HTML pages do not consume the JSON data layer. |

---

## 2. Comprehensive Audit of All 54 Eligibility Records

Every record in [`data/eligibility.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/eligibility.json) was audited to ensure primary vertical alignment, accurate entity applicability, explicit statutory citations, clear separation of operational recommendations from statutory mandates, and honest verification states.

| Service ID | Service Name & Route | Vert. | Applicable Entity Types | Codified Statutory Provision | Source ID | Operational Recommendations (Non-Statutory) | Unresolved Questions / Gaps | Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| `V01-SVC-001` | [DPIIT Startup India](/services/dpiit-startup-india.html) | `V01` | `PVT_LTD`, `LLP`, `PARTNERSHIP` | DPIIT Notification G.S.R. 127(E) read with IT Act s. 56(2)(viib) | `SRC-DPIIT-001` | Contemporaneous digital pitch decks; quarterly turnover review | Capital threshold tracking across holding structures | `SOURCE_IDENTIFIED` |
| `V01-SVC-002` | [LLP Registration](/services/llp-registration.html) | `V01` | `LLP` | Limited Liability Partnership Act, 2008 ss. 11 & 12 read with LLP Rules | `SRC-MCA-001` | Detailed profit-sharing schedule drafting prior to FiLLiP filing | State-level partner contribution stamp duty variances | `SOURCE_IDENTIFIED` |
| `V01-SVC-003` | [MSME / Udyam](/services/msme-udyam.html) | `V01` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `TRUST`, `SOCIETY` | MSMED Act, 2006 ss. 7 & 8 read with Notification S.O. 2119(E) | `SRC-MSME-001` | Align Udyam NIC activity codes with GST return descriptions | Automated plant & machinery written-down-value pull from ITR | `SOURCE_IDENTIFIED` |
| `V01-SVC-004` | [One Person Company](/services/opc-registration.html) | `V01` | `OPC` | Companies Act, 2013 s. 2(62) & s. 3(1)(c) read with Rule 3 | `SRC-MCA-001` | Nominate alternate director in internal family governance charter | NRI nominee residency tracking post-2021 amendment | `SOURCE_IDENTIFIED` |
| `V01-SVC-005` | [Partnership Firm](/services/partnership-registration.html) | `V01` | `PARTNERSHIP` | Indian Partnership Act, 1932 s. 58 read with State Rules | `SRC-ACT-IPA-1932` | Maintain stamped physical deed at principal place of business | Mandatory physical appearance disparities in sub-registrar offices | `SOURCE_IDENTIFIED` |
| `V01-SVC-006` | [Sole Proprietorship](/services/proprietorship-registration.html) | `V01` | `PROPRIETORSHIP` | Common law entity recognized under MSMED Act, CGST Act, State Shops Acts | `SRC-MSME-001` | Strict segregation of personal and commercial banking accounts | Absence of unified central proprietorship charter | `SOURCE_IDENTIFIED` |
| `V01-SVC-007` | [Private Limited (SPICe+)](/services/pvt-ltd-registration.html) | `V01` | `PVT_LTD` | Companies Act, 2013 ss. 3, 7, 12, 152, 153 read with SPICe+ Rule 38 | `SRC-RULE-SPICE-2020` | Pre-check name availability on MCA index and TM Class registry | Aggregated state stamp duty computation on MCA V3 | `SOURCE_IDENTIFIED` |
| `V01-SVC-008` | [Section 8 Company](/services/section-8-registration.html) | `V01` | `SECTION_8` | Companies Act, 2013 s. 8 read with Rule 19 & 20 (Form INC-12) | `SRC-MCA-001` | Prepare 3-year projected financial roadmap for INC-12 license | Interplay between RoC license and IT Act 12AB registration | `SOURCE_IDENTIFIED` |
| `V01-SVC-009` | [Society Registration](/services/society-registration.html) | `V01` | `SOCIETY` | Societies Registration Act, 1860 ss. 1 & 2 per State amendments | `SRC-ACT-SRA-1860` | Maintain annual governing body attendance register | District registrar renewal timelines and physical inspections | `SOURCE_IDENTIFIED` |
| `V01-SVC-010` | [Charitable Trust](/services/trust-registration.html) | `V01` | `TRUST` | Indian Trusts Act, 1882 ss. 4-6 / State Public Trusts Acts | `SRC-ACT-ITA-1882` | Ensure trust deed contains explicit irrevocable dissolution clause | State Charity Commissioner clearance in MH/GJ vs central deed | `SOURCE_IDENTIFIED` |
| `V02-SVC-001` | [Form AOC-4 XBRL](/services/aoc4-xbrl.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED` | Companies Act, 2013 s. 137 read with XBRL Rules, 2015 Rule 3 | `SRC-MCA-001` | Validate XBRL tagging schema against latest MCA taxonomy | Computational discrepancy handling in negative footnote tags | `SOURCE_IDENTIFIED` |
| `V02-SVC-002` | [DIR-3 KYC Annual](/services/dir3-kyc.html) | `V02` | `INDIVIDUAL` | Companies (Appointment of Directors) Rules, 2014 Rule 12A | `SRC-MCA-001` | Verify mobile/email with Aadhaar before initiating filing | Delayed filing deactivation of DIN and compounding procedures | `SOURCE_IDENTIFIED` |
| `V02-SVC-003` | [Form ADT-1 Auditor](/services/form-adt1.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 s. 139(1) read with Audit Rules, 2014 Rule 4(2) | `SRC-MCA-001` | Obtain Section 141 eligibility certificate prior to AGM notice | Casual vacancy appointment within 30 days vs AGM tenure | `SOURCE_IDENTIFIED` |
| `V02-SVC-004` | [Form AOC-4 Financials](/services/form-aoc4.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 s. 137 read with Accounts Rules, 2014 Rule 12(1) | `SRC-MCA-001` | Auditor & two directors must sign balance sheet before board approval | Consolidated financial statement mandatory filing thresholds | `SOURCE_IDENTIFIED` |
| `V02-SVC-005` | [Form BEN-2 SBO](/services/form-ben2.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED` | Companies Act, 2013 s. 90 read with SBO Rules, 2018 Rule 4 & 7 | `SRC-MCA-001` | Issue Form BEN-4 inquiry notice to non-individual shareholders (>10%) | Indirect holding determination through multi-layered trusts/LLPs | `SOURCE_IDENTIFIED` |
| `V02-SVC-006` | [Form DPT-3 Deposits](/services/form-dpt3.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC` | Companies Act, 2013 ss. 73 & 76 read with Deposit Rules, 2014 Rule 16 | `SRC-MCA-001` | Obtain auditor certificate for loan disclosures before 30 June | Director loan source declaration vs exempted deposit treatment | `SOURCE_IDENTIFIED` |
| `V02-SVC-007` | [Form MGT-14 Resolutions](/services/form-mgt14.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `SECTION_8` | Companies Act, 2013 s. 117 read with s. 179(3) and Rule 24 | `SRC-MCA-001` | File within 30 days of resolution to avoid mandatory compounding | Private company exemptions under Notification G.S.R. 464(E) | `SOURCE_IDENTIFIED` |
| `V02-SVC-008` | [Form MGT-7 Annual Return](/services/form-mgt7.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 s. 92 read with Management Rules, 2014 Rule 11 | `SRC-MCA-001` | Obtain PCS certification in Form MGT-8 for qualifying companies | Small company definition eligibility for abridged Form MGT-7A | `SOURCE_IDENTIFIED` |
| `V02-SVC-009` | [Form MR-1 MD Appointment](/services/form-mr1.html) | `V02` | `PUBLIC_UNLISTED` | Companies Act, 2013 ss. 196 & 197 read with Schedule V & Rule 7 | `SRC-MCA-001` | NRC recommendation must precede board resolution | Central Government approval requirement if Schedule V limits exceeded | `SOURCE_IDENTIFIED` |
| `V02-SVC-010` | [Form MSME-1 Return](/services/form-msme1.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC` | Companies Act, 2013 s. 405(4) read with MSME Order, 2019 | `SRC-MSME-001` | Cross-verify accounts payable against Udyam portal quarterly | Calculation of 45-day overdue timeline under MSMED s. 15 | `SOURCE_IDENTIFIED` |
| `V02-SVC-011` | [Form MSC-1 Dormant Co](/services/form-msc1-dormant.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC` | Companies Act, 2013 s. 455 read with Miscellaneous Rules, 2014 Rule 3 | `SRC-MCA-001` | Clear all pending inspection or tax recovery proceedings prior to filing | Minimum director count (1 for OPC, 2 for Pvt Ltd) during dormancy | `SOURCE_IDENTIFIED` |
| `V02-SVC-012` | [Form PAS-6 Demat Recon](/services/form-pas6.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED` | Companies (Prospectus and Allotment) Rules, 2014 Rule 9A(8) | `SRC-NOTIF-PAS-2023` | Reconcile issued shares against NSDL and CDSL balances fortnightly | Dematerialization mandate deadline for small private companies | `SOURCE_IDENTIFIED` |
| `V02-SVC-013` | [Form STK-2 Strike-Off](/services/form-stk2-strike-off.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC` | Companies Act, 2013 s. 248(2) read with Strike-Off Rules, 2016 Rule 4 | `SRC-MCA-001` | Close bank accounts and surrender GST registration prior to filing | Statutory limitation on strike-off if litigation is pending | `SOURCE_IDENTIFIED` |
| `V02-SVC-014` | [LLP Annual Filings](/services/llp-compliance-forms.html) | `V02` | `LLP` | LLP Act, 2008 s. 34(4) (Form 8) & s. 35(1) (Form 11) read with Rules | `SRC-MCA-001` | Reconcile statement of assets/liabilities with audited partner accounts | Turnover/contribution thresholds triggering mandatory audit | `SOURCE_IDENTIFIED` |
| `V02-SVC-015` | [LLP Form 24 Closure](/services/llp-form24-strike-off.html) | `V02` | `LLP` | LLP Rules, 2009 Rule 37(1)(b) read with LLP Act, 2008 s. 75 | `SRC-MCA-001` | Secure written consent of all creditors prior to affidavit execution | Unsettled liabilities personal indemnification by designated partners | `SOURCE_IDENTIFIED` |
| `V02-SVC-016` | [Form MBP-1 & DIR-8](/services/mbp1-dir8.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 s. 184(1) & s. 164(2) read with Rule 14(1) | `SRC-MCA-001` | Circulate disclosure at the first board meeting of every financial year | Disqualification tracking under Section 164(2)(a) for default entities | `SOURCE_IDENTIFIED` |
| `V02-SVC-017` | [RoC Annual Retainer](/services/roc-annual-compliance.html) | `V02` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 ss. 92, 137, 139, 173 read with relevant rules | `SRC-MCA-001` | Maintain master compliance tracker updated on rolling quarterly basis | Authorized capital eligibility limit (₹10 Lakhs cap) is commercial | `SOURCE_IDENTIFIED` |
| `V02-SVC-018` | [RoF Amendments](/services/rof-maintenance.html) | `V02` | `PARTNERSHIP` | Indian Partnership Act, 1932 ss. 60, 61, 62 & 63 | `SRC-ACT-IPA-1932` | Submit modification notice within 90 days of partnership change | State-specific portal vs physical deed submission requirements | `SOURCE_IDENTIFIED` |
| `V03-SVC-001` | [Form 10B / 10BB Audit](/services/form-10b.html) | `V03` | `TRUST`, `SOCIETY`, `SECTION_8` | Income Tax Act, 1961 s. 12A(1)(b) & s. 10(23C) read with Rule 16CC/17B | `SRC-CBDT-001` | Reconcile electronic cash donations against Section 80G receipts | Revised threshold rules distinguishing Form 10B from Form 10BB | `SOURCE_IDENTIFIED` |
| `V03-SVC-002` | [Form 3CEB Transfer Pricing](/services/form-3ceb.html) | `V03` | `PVT_LTD`, `PUBLIC_UNLISTED`, `FOREIGN_COMPANY`, `LLP` | Income Tax Act, 1961 s. 92E read with Income Tax Rules, 1962 Rule 10E | `SRC-CBDT-001` | Maintain contemporaneous transfer pricing study and benchmark report | Specified domestic transactions threshold applicability | `SOURCE_IDENTIFIED` |
| `V03-SVC-003` | [GST Annual (GSTR-9/9C)](/services/gst-annual.html) | `V03` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP` | CGST Act, 2017 s. 44 read with CGST Rules, 2017 Rule 80(1) & 80(3) | `SRC-CBIC-001` | Perform monthly electronic credit ledger vs GSTR-2B reconciliation | Statutory turnover threshold for GSTR-9C reconciliation is ₹5 Crores | `SOURCE_IDENTIFIED` |
| `V03-SVC-004` | [ITR-7 Return Filing](/services/itr7.html) | `V03` | `TRUST`, `SOCIETY`, `SECTION_8` | Income Tax Act, 1961 ss. 139(4A), 139(4B), 139(4C), 139(4D) | `SRC-CBDT-001` | File before statutory deadline to prevent loss of Section 11/12 relief | Treatment of anonymous donations under Section 115BBC | `SOURCE_IDENTIFIED` |
| `V03-SVC-005` | [Proprietorship & SME Tax](/services/proprietorship-tax.html) | `V03` | `PROPRIETORSHIP`, `PARTNERSHIP`, `INDIVIDUAL` | Income Tax Act, 1961 s. 139(1) read with s. 44AD / 44ADA | `SRC-CBDT-001` | Calculate advance tax installments quarterly to minimize interest | Presumptive taxation cash transaction limit under Finance Act | `SOURCE_IDENTIFIED` |
| `V04-SVC-001` | [PF / ESIC Filings](/services/pf-esic-compliance.html) | `V04` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP` | EPF & MP Act, 1952 ss. 1(3) & 5; ESI Act, 1948 ss. 1(4) & 2A | `SRC-EPFO-001` | Generate electronic challan (ECR) 5 days prior to monthly due date | Threshold applicability: 20 employees for PF, 10 for ESIC | `SOURCE_IDENTIFIED` |
| `V05-SVC-001` | [Founder Pacts, SHA & SPA](/services/founder-shareholder-agreements.html) | `V05` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC` | Indian Contract Act, 1872 ss. 10, 23 & 27 read with Companies Act s. 58(2) | `SRC-MCA-001` | Structure deadlock resolution, drag-along, and tag-along rights | **Enforceability of non-compete clauses under s. 27 Contract Act requires ongoing legal assessment** | `PENDING_PROFESSIONAL_REVIEW` |
| `V05-SVC-002` | [Master Service Agreements](/services/master-service-agreements.html) | `V05` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `FOREIGN_COMPANY` | Indian Contract Act, 1872 ss. 10, 73 & 74 | `SRC-MCA-001` | Define clear service levels (SLA), IP assignments, and liability caps | Limitation of liability exclusions for gross negligence under Indian law | `SOURCE_IDENTIFIED` |
| `V06-SVC-001` | [IP Enforcement / C&D](/services/ip-enforcement-cease-desist.html) | `V06` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `INDIVIDUAL` | Trade Marks Act, 1999 ss. 29 & 134; Copyright Act, 1957 ss. 51 & 55 | `SRC-CGPDTM-001` | Send notice via registered post AD and electronic email simultaneously | Groundless threat of legal proceedings risk under Section 142 TM Act | `SOURCE_IDENTIFIED` |
| `V06-SVC-002` | [Software Copyright & Patents](/services/software-copyright-patents.html) | `V06` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `INDIVIDUAL` | Copyright Act, 1957 s. 2(o) & s. 13; Patents Act, 1970 s. 3(k) guidelines | `SRC-CGPDTM-001` | Archive git commit hashes and cryptographic timestamps for authorship | Patentability of computer-related inventions (CRIs) under s. 3(k) | `SOURCE_IDENTIFIED` |
| `V06-SVC-003` | [Brand Trademark (TM-A)](/services/trademark-registration.html) | `V06` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `INDIVIDUAL` | Trade Marks Act, 1999 s. 18 read with Trade Marks Rules, 2017 Rule 23 | `SRC-CGPDTM-001` | Conduct comprehensive phonetic and visual conflict search before filing | Statutory official fees (₹4,500 startup vs ₹9,000 corporate) | `SOURCE_IDENTIFIED` |
| `V07-SVC-001` | [Labour Code Handbooks](/services/labour-code-handbooks.html) | `V07` | `PVT_LTD`, `PUBLIC_UNLISTED`, `LLP` | Industrial Employment (Standing Orders) Act, 1946 / Labour Codes, 2020 | `SRC-ACT-IESO-1946` | Review handbook provisions against state shop acts every 12 months | Transition timing to 4 Central Labour Codes across states | `SOURCE_IDENTIFIED` |
| `V07-SVC-002` | [POSH Act Compliance](/services/posh-compliance.html) | `V07` | `PVT_LTD`, `PUBLIC_UNLISTED`, `LLP` | POSH Act, 2013 ss. 4, 19 & 21 read with POSH Rules, 2013 | `SRC-ACT-POSH-2013` | Ensure external IC member is independent and familiar with POSH | Annual return filing with District Officer by 31 January | `SOURCE_IDENTIFIED` |
| `V09-SVC-001` | [Fast-Track Mergers (s. 233)](/services/fast-track-mergers.html) | `V09` | `PVT_LTD` | Companies Act, 2013 s. 233 read with CAA Rules, 2016 Rule 25 | `SRC-MCA-001` | Secure written consent affidavits from 90% creditors and members | Regional Director discretionary referral to NCLT under s. 233(5) | `SOURCE_IDENTIFIED` |
| `V09-SVC-002` | [Slump Sale Asset Purchase](/services/slump-sale-asset-purchase.html) | `V09` | `PVT_LTD`, `PUBLIC_UNLISTED` | Income Tax Act, 1961 s. 50B & s. 2(42C) read with Companies Act s. 180(1)(a) | `SRC-CBDT-001` | Commission independent registered valuer report for undertaking | GST applicability on transfer of a going concern as an exemption | `SOURCE_IDENTIFIED` |
| `V09-SVC-003` | [NCLT Merger Petitions](/services/nclt-merger-petitions.html) | `V09` | `PVT_LTD`, `PUBLIC_UNLISTED` | Companies Act, 2013 ss. 230-232 read with CAA Rules & NCLT Rules | `SRC-BAR-001` | Engage designated counsel for NCLT court filings well in advance | **Advocates Act / BCI tribunal advocacy representation boundaries require qualified legal counsel** | `PENDING_PROFESSIONAL_REVIEW` |
| `V11-SVC-001` | [Secretarial Health Check](/services/board-governance-risk-assessment.html) | `V11` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `SECTION_8` | Companies Act, 2013 s. 205 read with ICSI Standards SS-1 & SS-2 | `SRC-ICSI-SS-001` | Perform mock secretarial audit 60 days before annual closure | Interplay between ICSI secretarial standards and MCA penal rules | `SOURCE_IDENTIFIED` |
| `V11-SVC-002` | [Board Minutes Retainer](/services/board-minutes.html) | `V11` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `SECTION_8` | Companies Act, 2013 ss. 118, 88, 170, 186 & 189 read with SS-1 | `SRC-ICSI-SS-001` | Circulate draft minutes within 15 days of meeting per ICSI SS-1 | Digital electronic minutes signing under MCA electronic records rules | `SOURCE_IDENTIFIED` |
| `V11-SVC-003` | [Form CSR-2 Report](/services/form-csr2.html) | `V11` | `PVT_LTD`, `PUBLIC_UNLISTED` | Companies Act, 2013 s. 135 read with Accounts Rules Rule 12(1B) | `SRC-MCA-001` | Publish comprehensive CSR annual action plan on corporate website | Transfer of unspent CSR funds to Schedule VII national funds | `SOURCE_IDENTIFIED` |
| `V11-SVC-004` | [Form MR-3 Secretarial Audit](/services/form-mr3-secretarial-audit.html) | `V11` | `PUBLIC_UNLISTED` | Companies Act, 2013 s. 204 read with Managerial Rules, 2014 Rule 9 | `SRC-MCA-001` | Provide PCS unhindered access to register vault and MCA V3 filings | Threshold: paid-up capital ≥ ₹50 Cr or turnover ≥ ₹250 Cr | `SOURCE_IDENTIFIED` |
| `V12-SVC-001` | [Cyber Incident Reporting](/services/cyber-incident-reporting.html) | `V12` | `PVT_LTD`, `PUBLIC_UNLISTED`, `LLP`, `FOREIGN_COMPANY` | Information Technology Act, 2000 s. 70B(6) read with CERT-In Directions | `SRC-CERTIN-001` | Deploy automated SIEM alerting configured to flag breaches in 1 hour | **Interpretation of CERT-In 6-hour reporting mandate for cloud architectures requires legal opinion** | `PENDING_PROFESSIONAL_REVIEW` |
| `V12-SVC-002` | [DPDP Compliance Audit](/services/dpdp-compliance-audit.html) | `V12` | `PVT_LTD`, `PUBLIC_UNLISTED`, `FOREIGN_COMPANY` | Digital Personal Data Protection Act, 2023 ss. 4, 6, 8, 9, 10 & 16 | `SRC-DPDP-001` | Conduct data mapping and processing inventory across internal apps | **DPDP Central Rules, Data Protection Board guidelines, and penalty structures pending MeitY notification** | `PENDING_PROFESSIONAL_REVIEW` |
| `V12-SVC-003` | [SaaS Terms & Privacy](/services/saas-terms-privacy-architecture.html) | `V12` | `PVT_LTD`, `PUBLIC_UNLISTED`, `OPC`, `LLP`, `FOREIGN_COMPANY` | Information Technology Act, 2000 ss. 10A, 43A & 72A read with 2011 Rules | `SRC-ACT-IT-2000` | Review clickwrap flows for unambiguous, affirmative user consent | International cross-border data transfer contract standards | `SOURCE_IDENTIFIED` |
| `V13-SVC-001` | [Cross-Border Tech Transfer](/services/cross-border-tech-transfer.html) | `V13` | `PVT_LTD`, `PUBLIC_UNLISTED`, `LLP`, `FOREIGN_COMPANY` | FEMA Act, 1999 read with Current Account Transactions Rules, 2000 | `SRC-ACT-FEMA-1999` | Obtain Form 15CA/15CB certificate prior to foreign exchange remittance | **Withholding tax (s. 195) vs DTAA royalty rates requires cross-border qualified tax opinion** | `PENDING_PROFESSIONAL_REVIEW` |
| `V13-SVC-002` | [Form FC-3/FC-4 Foreign Branch](/services/form-fc3-fc4.html) | `V13` | `FOREIGN_COMPANY` | Companies Act, 2013 ss. 380 & 381 read with Foreign Co Rules & RBI Master | `SRC-MCA-001` | Submit annual activity certificate (AAC) certified by CA to DGIT & RBI | Permissible activity scope under automatic route vs approval route | `SOURCE_IDENTIFIED` |
| `V13-SVC-003` | [RBI FLA Return](/services/rbi-fla-return.html) | `V13` | `PVT_LTD`, `PUBLIC_UNLISTED`, `LLP` | FEMA Foreign Security Regulations read with RBI Circular No. 22 | `SRC-RBI-001` | Reconcile FLA figures against audited balance sheet foreign investment notes | Mandatory reporting deadline of 15 July via electronic FLAIR portal | `SOURCE_IDENTIFIED` |

---

## 3. Comprehensive Audit of All 10 Jurisdiction Variations

Every record in [`data/jurisdiction-variations.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/jurisdiction-variations.json) was audited to verify statutory provisions, separate administrative practices, and document evidence gaps.

| Variation ID | Service ID & Title | Jurisdiction | Type | Category | Codified Statutory Provision | Administrative Practice vs Statutory Mandate | Source Reference | Unresolved Legal Questions / Evidence Gaps | Verification Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- | :---: |
| `VAR-001` | `V01-SVC-007` (Pvt Ltd) | `IN-DL` | UT | `STAMP_DUTY` | Schedule 1A Article 39 (e-MoA: ₹200) and Article 10 (e-AoA: tiered from ₹1,000 for capital up to ₹1,00,000, scaled per slabs) of Indian Stamp Act, 1899 as applicable to Delhi. | MCA V3 portal automatically computes and collects Delhi stamp duty during SPICe+ submission via electronic integration with SHCIL. | `SRC-STATE-DL-STAMP-1899` | Qualified legal review required to confirm whether recent state revenue notifications modified the e-AoA slab thresholds for authorized capital above ₹10 Lakhs. | `SOURCE_IDENTIFIED` |
| `VAR-002` | `V01-SVC-007` (Pvt Ltd) | `IN-MH` | State | `STAMP_DUTY` | Maharashtra Stamp Act, 1958, Schedule I Article 39(a) (₹200 on e-MoA) and Article 10 (0.2% on nominal capital for e-AoA, capped at ₹50,00,000 per Act XX of 2015). | Integrated with MCA V3 portal via Government Receipt Accounting System (GRAS) for electronic challan generation. | `SRC-STATE-MH-STAMP-1958` | Qualified legal review required to confirm whether subsequent Maharashtra finance acts amended the statutory ₹50,00,000 ceiling cap. | `SOURCE_IDENTIFIED` |
| `VAR-003` | `V01-SVC-007` (Pvt Ltd) | `IN-KA` | State | `STAMP_DUTY` | Karnataka Stamp Act, 1957, Schedule Article 33 (₹1,000 on e-MoA) and Article 10 (₹1,000 per ₹10,00,000 or part thereof on e-AoA per Act 19 of 2014). | Integrated with MCA V3 portal for electronic stamp duty remittance. | `SRC-STATE-KA-STAMP-1957` | Qualified legal review required to verify local infrastructure cess or municipal surcharge applicability on Karnataka stamp certificates. | `SOURCE_IDENTIFIED` |
| `VAR-004` | `V01-SVC-002` (LLP Reg) | `IN-DL` | UT | `STAMP_DUTY` | **None.** Schedule 1A of Indian Stamp Act, 1899 as applicable to Delhi contains **no specific statutory entry for Limited Liability Partnership agreements**. | Practitioners widely execute Delhi LLP agreements on ₹100 non-judicial e-stamp paper under general residual Article 5(c). **This is an uncodified administrative convenience, not an express statutory provision for LLPs.** | `null` | **Whether Delhi revenue authorities or MCA adjudicating officers may treat an LLP agreement as a partnership deed under Article 46 or require ad valorem stamping based on partner contribution.** Judicial or professional clarification is required. | `UNREVIEWED` |
| `VAR-005` | `V01-SVC-002` (LLP Reg) | `IN-MH` | State | `STAMP_DUTY` | Maharashtra Stamp Act, 1958, Schedule I Article 47 Explanation (explicitly governs LLP agreements; prescribed duty scaled from ₹500 for contribution up to ₹50,000, up to ₹5,000 for contribution exceeding ₹10,00,000). | Unlike Delhi, Maharashtra has codified an express statutory entry for LLP agreements under Article 47. | `SRC-STATE-MH-STAMP-1958` | Qualified legal review required to verify treatment of subsequent capital contribution increases after initial incorporation. | `SOURCE_IDENTIFIED` |
| `VAR-006` | `V01-SVC-005` (Partnership) | `IN-MH` | State | `LOCAL_ROF_PROCEDURE` | Indian Partnership Act, 1932 Section 58 read with Maharashtra Partnership Rules, 1989 and Maharashtra Stamp Act, 1958 Schedule I Article 47. | Submission of digital Form A via rof.mahaonline.gov.in portal. Requires scanned notarized deed on ₹500 non-judicial stamp paper. | `SRC-STATE-MH-ROF-1932` | Certain district RoF offices in Maharashtra occasionally request physical presentation of the notarized deed despite digital portal submission. | `SOURCE_IDENTIFIED` |
| `VAR-007` | `V01-SVC-005` (Partnership) | `IN-KA` | State | `LOCAL_ROF_PROCEDURE` | Indian Partnership Act, 1932 Section 58 read with Karnataka Partnership (Registration of Firms) Rules, 1954. | Online application initiated via Kaveri portal, followed by **mandatory in-person physical presentation of original partnership deed** before the District Registrar of Firms. | `SRC-STATE-KA-ROF-1932` | Operational turnaround times and physical appointment scheduling vary significantly between Bangalore Urban and district jurisdictions. | `SOURCE_IDENTIFIED` |
| `VAR-008` | `V04-SVC-001` (PF/ESIC) | `IN-MH` | State | `PROFESSIONAL_TAX` | Section 5 of Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975 read with Schedule I. | Dual registration administered online via mahagst.gov.in: PTRC (employer tax deduction, monthly/annual return) and PTEC (entity annual tax of ₹2,500). | `SRC-STATE-MH-PT-1975` | Exemption applicability for women employees earning up to ₹25,000 per month under 2023 budget amendments requires operational tracking. | `SOURCE_IDENTIFIED` |
| `VAR-009` | `V04-SVC-001` (PF/ESIC) | `IN-KA` | State | `PROFESSIONAL_TAX` | Section 5 of Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976 read with Schedule. | Administered via e-Prerana portal of Karnataka Commercial Taxes Department. Mandatory registration within 30 days of hiring employees. | `SRC-STATE-KA-PT-1976` | Threshold revision for salaried employees under Karnataka Act 14 of 2023 (salary up to ₹25,000 exempt from PT) requires operational verification. | `SOURCE_IDENTIFIED` |
| `VAR-010` | `V04-SVC-001` (PF/ESIC) | `IN-DL` | UT | `PROFESSIONAL_TAX` | **None.** Under Article 276 (Entry 60 List II) of the Constitution of India, professional tax requires affirmative state/UT legislative enactment. **No statute enacted by Legislative Assembly of NCT of Delhi exists in official gazettes.** | No Professional Tax portal or division is operated by the Delhi Department of Trade and Taxes. | `null` | **A definitive statutory exemption CANNOT be inferred solely from legislative silence.** Applicability of municipal trade licensing fees under Section 417 of the Delhi Municipal Corporation Act, 1957 requires qualified municipal law review. Whether historical local levies apply to specific notified professions or trades. | `PENDING_PROFESSIONAL_REVIEW` |

---

## 4. Specific Legal Assessments & Boundary Distinctions

### 4.1 Delhi Professional Tax Assessment (`VAR-010`)
1. **Constitutional Framework:** Under Article 276 of the Constitution of India, taxes on professions, trades, callings, and employments are levied pursuant to Entry 60 of the State List (List II). An affirmative statutory enactment by the state or union territory legislature is a mandatory constitutional prerequisite for the levy and collection of professional tax.
2. **Current Statutory Landscape:** Exhaustive searches of Delhi gazettes and the official portal of the Department of Trade and Taxes, Government of NCT of Delhi (`SRC-STATE-DL-PT-CONST`) reveal that **no state-level Professional Tax Act has been enacted by the Legislative Assembly of NCT of Delhi**.
3. **Strict Audit Conclusion:** **A definitive legal exemption must not be asserted to clients solely on the basis of legislative silence.** The audit explicitly documents the risk that local municipal trade licenses under Section 417 of the Delhi Municipal Corporation Act, 1957 (DMC Act) or health licenses may impose recurring annual levies on certain commercial establishments. `VAR-010` is therefore preserved strictly as `PENDING_PROFESSIONAL_REVIEW` with `source_id: null`.

### 4.2 Delhi LLP Agreement Stamping Assessment (`VAR-004`)
1. **Absence of Specific Entry:** Schedule 1A of the Indian Stamp Act, 1899 as applicable to Delhi has not been amended to insert an express entry for Limited Liability Partnership agreements (in contrast to Maharashtra, which amended Article 47).
2. **Administrative Convention:** Corporate secretarial practitioners in Delhi commonly execute LLP agreements on ₹100 non-judicial e-stamp paper under general residual Article 5(c) (Agreement or Memorandum of Agreement).
3. **Audit Finding:** The ₹100 figure is an **uncodified administrative practice**. There is residual legal exposure that revenue adjudicating officers could interpret an LLP agreement as a partnership deed under Article 46 or require ad valorem stamping based on capital contribution. `VAR-004` is therefore kept as `UNREVIEWED` with `source_id: null`.

### 4.3 Statutory Requirements vs Operational Recommendations
To prevent consumer deception and maintain strict professional integrity:
- **Statutory Requirements:** Mandatory legal rules enacted by Parliament or State Legislatures, where failure to comply results in criminal penalty, statutory late fee, entity striking-off, or disqualification (e.g. DIR-3 KYC by 30 September under Rule 12A, GSTR-9C above ₹5 Crores under CGST Act Section 44, Form AOC-4 within 30 days of AGM under Section 137).
- **Operational Recommendations:** Secretarial best practices, risk-mitigation measures, and internal timelines recommended by CraftEgon (e.g. mock secretarial audits 60 days before closure, drafting board minutes within 15 days per ICSI SS-1, fortnightly depository share reconciliations, segregating bank accounts). These are now strictly isolated into `operational_recommendations` arrays in the data model.

---

## 5. Items Requiring Qualified Professional / Legal Review

The audit identified 7 specific records (5 eligibility, 2 jurisdiction variations) that require formal qualified legal opinion or external counsel review before any client-facing representation:

1. **`V05-SVC-001` (Founder Pacts & Shareholder Agreements):** Review enforceability of post-employment non-compete and non-solicitation covenants under Section 27 of the Indian Contract Act, 1872 in light of recent High Court rulings.
2. **`V09-SVC-003` (NCLT Merger Petitions):** Review Bar Council of India (BCI) rules and Section 30 of the Advocates Act, 1961 regarding advocacy representation before National Company Law Tribunal benches by non-advocate corporate consultants.
3. **`V12-SVC-001` (Cyber Incident Reporting & VAPT):** Review interpretation and enforcement risk of CERT-In's mandatory 6-hour incident reporting window under Section 70B(6) for cloud-native SaaS and foreign parent architectures.
4. **`V12-SVC-002` (DPDP Compliance Readiness Audit):** Track MeitY's publication of final Central Rules and Data Protection Board operational guidelines under the Digital Personal Data Protection Act, 2023.
5. **`V13-SVC-001` (Cross-Border Technology Transfer):** Review withholding tax rates under Section 195 of the Income Tax Act versus Double Tax Avoidance Agreements (DTAA) for cross-border software and patent royalties.
6. **`VAR-004` (Delhi LLP Agreement Stamp Duty):** Obtain formal revenue opinion on whether general Article 5(c) (₹100) or partnership deed Article 46 applies to Delhi LLP agreements.
7. **`VAR-010` (Delhi Professional Tax & Municipal Levies):** Conduct municipal law review under DMC Act Section 417 regarding trade license fee applicability across commercial establishments in Delhi.

---

## 6. Official Sources Actually Inspected

During this audit, primary statutory enactments and official government regulatory portals were directly reviewed:
1. **Companies & Secretarial Statutes:**
   - Companies Act, 2013 (Act No. 18 of 2013) & Companies (Incorporation) Rules, 2014 (`SRC-MCA-001`, `SRC-RULE-SPICE-2020`).
   - Limited Liability Partnership Act, 2008 (Act No. 6 of 2009) & LLP Rules, 2009 (`SRC-MCA-001`).
   - ICSI Secretarial Standards on Meetings of the Board of Directors (SS-1) and General Meetings (SS-2) (`SRC-ICSI-SS-001`).
2. **Taxation & Revenue Statutes:**
   - Income Tax Act, 1961 (Act No. 43 of 1961) ss. 10(23C), 12A, 44AB, 50B, 56(2)(viib), 92E, 139, 195 (`SRC-CBDT-001`).
   - Central Goods and Services Tax Act, 2017 (Act No. 12 of 2017) ss. 35(5), 44 (`SRC-CBIC-001`).
3. **State Stamp & Professional Tax Acts:**
   - Indian Stamp Act, 1899 (Schedule 1A as applicable to NCT of Delhi per Delhi Act 1 of 2011) (`SRC-STATE-DL-STAMP-1899`).
   - Maharashtra Stamp Act, 1958 (Act No. LX of 1958, Schedule I Articles 10, 39, 47) (`SRC-STATE-MH-STAMP-1958`).
   - Karnataka Stamp Act, 1957 (Karnataka Act No. 34 of 1957, Schedule Articles 10, 33) (`SRC-STATE-KA-STAMP-1957`).
   - Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975 (Act No. XVI of 1975) (`SRC-STATE-MH-PT-1975`).
   - Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976 (Karnataka Act No. 35 of 1976) (`SRC-STATE-KA-PT-1976`).
   - Constitution of India, Article 276 & Seventh Schedule, List II, Entry 60 (`SRC-STATE-DL-PT-CONST`).
4. **Specialized Corporate & Regulatory Enactments:**
   - Micro, Small and Medium Enterprises Development Act, 2006 (Act No. 27 of 2006) (`SRC-MSME-001`).
   - Trade Marks Act, 1999 & Copyright Act, 1957 (`SRC-CGPDTM-001`).
   - Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (`SRC-ACT-POSH-2013`).
   - Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) (`SRC-DPDP-001`).
   - Information Technology Act, 2000 & CERT-In Directions 2022 (`SRC-CERTIN-001`, `SRC-ACT-IT-2000`).
   - Foreign Exchange Management Act, 1999 (FEMA) & RBI Master Directions (`SRC-ACT-FEMA-1999`, `SRC-RBI-001`).

---

## 7. Validation Results & Test Suite Summary

The validation script [`scripts/validate-phase-2-registry.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/validate-phase-2-registry.js) and the full project test suite were executed to completion with zero errors.

### 7.1 Test Execution Commands & Outputs
- **Registry & Data Layer Validator Suite:**
  - Command: `node scripts/validate-phase-2-registry.js`
  - Output: **67 passed assertions, 0 failed (Exit code 0)**.
  - Enforces: 54-service eligibility accounts, 10 jurisdiction variations, vertical alignment, statutory vs operational distinction, threshold separation, and negative corruption tests D1–D26.
- **Full Project CI Test Suite:**
  - Command: `npm test`
  - Output: **121 passed assertions, 0 failed (Exit code 0)** (incorporating 54 CI assertions and 67 validator assertions).

### 7.2 Newly Added Test Assertions in Suite 6 & 7
1. **Suite 6 — Eligibility Enrichment & Status Assertions:** Asserts that all 54 eligibility records possess verified `primary_vertical_id`, explicit `statutory_provision`, non-empty `operational_recommendations`, exactly 49 `SOURCE_IDENTIFIED`, 5 `PENDING_PROFESSIONAL_REVIEW`, and exactly 0 `VERIFIED`.
2. **Suite 6 — Variation Boundary Assertions:** Asserts that `VAR-010` is strictly `PENDING_PROFESSIONAL_REVIEW` with `source_id: null`, `VAR-004` is strictly `UNREVIEWED` with `source_id: null`, 8 records are `SOURCE_IDENTIFIED`, and 0 records are `VERIFIED`.
3. **Suite 7 (Neg D24) — Eligibility Vertical Mismatch Guard:** Deliberately corrupts an eligibility record with mismatched vertical `V99` and verifies that validation fails with `Primary vertical 'V99' does not match service registry vertical`.
4. **Suite 7 (Neg D25) — Variation Reversed Validity Period Guard:** Deliberately reverses the validity period of a jurisdiction variation (`effective_to < effective_from`) and verifies validator failure.

---

## 8. Working-Tree Status & Changed Files

Execution of `git status --short` in the local repository:

```text
 M data/eligibility.json
 M data/jurisdiction-variations.json
 M data/pricing.json
 M data/schemas/eligibility.schema.json
 M data/schemas/jurisdiction-variations.schema.json
 M data/schemas/pricing.schema.json
 M package-lock.json
 M package.json
 M review-output/phase-1-foundations/phase-1-service-ownership-review.md
 M review-output/phase-2-data-layer/phase-2-task-4-pricing-audit-report.md
 M scripts/validate-phase-2-registry.js
?? data/
?? review-output/phase-2-data-layer/phase-2-task-5-eligibility-jurisdiction-audit-report.md
?? review-output/phase-2-service-registry/
?? scratch/
```

### Detailed Summary of Files Modified / Created
- [`data/eligibility.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/eligibility.json): Enriched all 54 active service records with `primary_vertical_id`, codified `statutory_provision`, `operational_recommendations`, `unresolved_questions`, `checked_date`, and honest verification statuses (49 `SOURCE_IDENTIFIED`, 5 `PENDING_PROFESSIONAL_REVIEW`, 0 `VERIFIED`).
- [`data/jurisdiction-variations.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/jurisdiction-variations.json): Enriched all 10 variation records with `statutory_provision`, `checked_date`, `administrative_practice_notes`, `unresolved_questions`, and audit notes.
- [`data/schemas/eligibility.schema.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/schemas/eligibility.schema.json): Updated JSON Schema Draft 2020-12 to formally require and validate `primary_vertical_id`, `statutory_provision`, `operational_recommendations`, and audit metadata.
- [`data/schemas/jurisdiction-variations.schema.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/schemas/jurisdiction-variations.schema.json): Updated JSON Schema Draft 2020-12 to validate `statutory_provision`, `administrative_practice_notes`, and `unresolved_questions`.
- [`scripts/validate-phase-2-registry.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/validate-phase-2-registry.js): Extended validator to 67 assertions, adding primary vertical referential checks and negative fixtures D24–D25.
- [`review-output/phase-2-data-layer/phase-2-task-5-eligibility-jurisdiction-audit-report.md`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/review-output/phase-2-data-layer/phase-2-task-5-eligibility-jurisdiction-audit-report.md): Created comprehensive Task 5 eligibility and jurisdiction variations audit report.

---

## 9. Boundaries Confirmation & Task 5 Disposition

### 9.1 Boundaries Adherence
- **Local-Only:** Zero git commits, zero git pushes, zero production deployments, zero Cloudflare modifications.
- **Production HTML Integrity:** Exactly 0 modifications to production HTML files in `services/`.
- **Approved Architecture Preserved:** 54 active service IDs, 3 referral-only routes (57 total routes), and 15 practice verticals preserved without alteration.
- **Zero Fabricated Legal Approvals:** Zero eligibility or variation records are marked `VERIFIED`.

### 9.2 Task 5 Closeout Recommendation
> **Phase 2 Task 5 Closeout Recommendation: Accepted with Documented Gaps.**  
> *(All 54 active eligibility records and 10 jurisdiction variations are fully accounted for, structurally schema-validated, and enriched with codified statutory citations and distinct operational recommendations. Exactly 0 records are marked `VERIFIED`. Complex and evolving regulatory areas are honestly designated as `PENDING_PROFESSIONAL_REVIEW` or `UNREVIEWED` pending formal legal counsel review).*

**Task 5 is complete. Awaiting user review before proceeding to Task 6.**
