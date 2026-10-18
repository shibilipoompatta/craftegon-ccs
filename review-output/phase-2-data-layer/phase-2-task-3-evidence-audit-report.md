# CraftEgon CCS — Phase 2, Task 3: Evidence-Backed Regulatory Data Final Acceptance Audit Report

**Document ID:** CRAFTEGON-DOC-P2-T3-001  
**Execution Date:** 2026-10-17  
**Task Priority:** High (P2-T3 Final Evidence Gate)  
**Mode:** Inspect → Research → Verify → Test → Report  
**Environment:** Local Repository Only (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Deployment & Push Status:** Prohibited / Zero Git Commits / Zero External Pushes / Local-Only  
**Validation Suite Status:** 58/58 Validator Assertions Passed (0 Failed) • 54/54 Main CI Checks Passed (0 Failed) • 112/112 Project Assertions Passed (Exit Code 0)  
**Task Closeout Disposition:** Accepted with Documented Gaps (Not Fully Legally Verified)

---

## 1. Executive Summary & Audit Baseline

Phase 2, Task 3 (P2-T3) establishes an authoritative, evidence-backed regulatory data layer for CraftEgon Corporate Services (CCS). This audit operationalizes strict evidence-gating principles: **no legal rule, government fee, eligibility threshold, jurisdiction variation, or commercial price is marked `VERIFIED` without verified primary source evidence and formal practicing professional sign-off**.

### 1.1 Baseline Verification Results
All test suites were executed synchronously to completion, yielding zero failures and exit code 0. These reflect internal automated software assertions on schema compliance, data referential integrity, and negative fixtures; **they do not constitute or claim independent third-party or qualified legal verification**:
1. `node scripts/validate-phase-2-registry.js` completed synchronously with **exit code 0**, passing **58 of 58 assertions** across 7 test suites (registry validation, Phase 1 reconciliation, disk alignment, negative fixtures, 7 JSON Draft 2020-12 schemas, referential integrity, status-gating specification, rejected claims reconciliation, and data corruption scenarios D1–D19).
2. `npm test` completed synchronously with **exit code 0**, passing all checks across the testing pipeline, executing **112 total assertions** (including 54 checks in `scripts/test-phase-1-remediation.js` and 58 assertions in `scripts/validate-phase-2-registry.js`).
3. Lockfile consistency was preserved using official Ajv Draft 2020-12 (`ajv` v8.20.0 and `ajv-formats` v3.0.1) in `package.json` devDependencies and locked in `package-lock.json`.

### 1.2 Truthful Evidence-Gating Decisions
- **Zero Fabricated Approvals:** Zero legal claims, zero eligibility records, zero jurisdiction variations, and zero commercial prices are claimed as legally verified or signed off.
- **Authority Existence vs Claim Substantiation:** Distinguishes between broad ministry homepages (e.g. `mca.gov.in`) and the specific statutory sections, gazette notifications, or enacted schedules supporting individual legal requirements.
- **`SOURCE_IDENTIFIED` Records Are Not Legally Verified:** Cataloging a relevant official statute, gazette, or department procedure under `SOURCE_IDENTIFIED` provides statutory traceability, but **does not thereby make the records legally verified**. Exact source-to-claim confirmation, statutory cross-verification, and formal review by a qualified practicing advocate or company secretary remain outstanding gaps for all 8 jurisdiction records and all 54 eligibility records.
- **Non-Litigation Boundary Enforced:** Tribunal advocacy claims, NCLT merger petitions, and dispute representations are explicitly flagged as outside corporate secretarial scope pursuant to Sections 29, 30, and 33 of the Advocates Act, 1961 (`SRC-BAR-001`).
- **Pricing Baseline Integrity:** All 54 pricing records remain strictly `UNVERIFIED` with `last_verified_at: null`. Exactly 40 services retain `amount: null` (`CUSTOM_QUOTE`), while 14 services retain captured indicative baseline figures under `SRC-INT-PRC-001`.
- **Jurisdiction Variations Researched:** Exactly 8 candidates have verified state statutes/gazettes identified (`SOURCE_IDENTIFIED`); 1 candidate (`VAR-004` Delhi LLP agreement stamp duty) is retained as `UNREVIEWED` with `source_id: null` due to statutory absence in Delhi Schedule 1A; 1 candidate (`VAR-010` Delhi professional tax) is downgraded to `PENDING_PROFESSIONAL_REVIEW` with `source_id: null` because an affirmative legal exemption cannot be inferred solely from legislative silence.


---

## 2. Statistical Record Counts & Verification Status Summary

| Dataset File | Total Records | Verified (`VERIFIED`) | Source Identified (`SOURCE_IDENTIFIED`) | Unreviewed / Unverified | Pending Review / Source Needed | Rejected / Outdated |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| [`data/service-registry.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/service-registry.json) | 57 | 54 (Active) + 3 (Referral) | 0 | 0 | 0 | 0 |
| [`data/verticals.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/verticals.json) | 15 | 15 (Approved Taxonomy) | 0 | 0 | 0 | 0 |
| [`data/sources.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/sources.json) | 33 | 31 (Inspected/Active) | 0 | 2 (Internal Baselines) | 0 | 0 |
| [`data/pricing.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/pricing.json) | 54 | **0** | 0 | **54 (100% UNVERIFIED)** | 0 | 0 |
| [`data/eligibility.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/eligibility.json) | 54 | **0** | **54 (100%)** | 0 | 0 | 0 |
| [`data/jurisdiction-variations.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/jurisdiction-variations.json) | 10 | **0** | **8 (80%)** | **1 (10% UNREVIEWED)** | **1 (10% PENDING_REVIEW)** | 0 |
| [`data/regulatory-claims.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/regulatory-claims.json) | 25 | **0** | 1 (Indicative Baseline) | 0 | 4 (Pending Review / Needed) | **20 (80%)** |
| **Total Evidence Units** | **248** | **72 (Controlled Architecture)** | **63 (Statutory Mapped)** | **55 (Preserved Baselines)** | **5 (Pending Gated)** | **20 (Rejected Claims)** |

> [!IMPORTANT]
> **Zero Legal Claims or Rules Marked Verified:** Across all 54 pricing records, 54 eligibility records, 10 jurisdiction variations, and 25 regulatory claims, **exactly 0 records are marked `VERIFIED`**. Every record maintains `last_verified_at: null` pending formal review by a licensed advocate or company secretary in practice.

---

## 3. Inspected Official Authorities and Statutory Sources

A total of 33 source records are cataloged in `data/sources.json`. Broad homepages have been supplemented with specific legislative enactments, statutory rules, gazette notifications, and state stamp schedules.

| Source ID | Source Title | Issuing Authority | Jurisdiction | Source Type | Reliability Classification | Checked Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `SRC-MCA-001` | Companies Act, 2013 & LLP Act, 2008 Statutory Portals | Ministry of Corporate Affairs (MCA) | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-CBDT-001` | Income-tax Act, 1961 & E-Filing System | Central Board of Direct Taxes (CBDT) | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-CBIC-001` | Central Goods and Services Tax Act, 2017 & Portal | GST Network (GSTN) / CBIC | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-CGPDTM-001` | Controller General of Patents, Designs and Trade Marks | DPIIT / IP India | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-EPFO-001` | Employees' Provident Fund Organisation — Unified Portal | Ministry of Labour and Employment | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ESIC-001` | Employees' State Insurance Corporation Employer Portal | Ministry of Labour and Employment | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-RBI-001` | Reserve Bank of India — FIRMS & FLAIR Reporting Systems | Reserve Bank of India (RBI) | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-DPDP-001` | Digital Personal Data Protection Act, 2023 | MeitY / Parliament of India | IN-CENTRAL | REGULATORY_NOTIFICATION | OFFICIAL_GAZETTE | 2026-10-17 |
| `SRC-CERTIN-001` | CERT-In Directions under Section 70B IT Act 2000 | CERT-In / MeitY | IN-CENTRAL | REGULATORY_NOTIFICATION | REGULATORY_AGENCY | 2026-10-17 |
| `SRC-MSME-001` | Ministry of MSME — Udyam Registration Portal | Ministry of MSME | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-DPIIT-001` | Startup India Gazette Notifications & Recognition Portal | DPIIT, Ministry of Commerce | IN-CENTRAL | OFFICIAL_PORTAL | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-BAR-001` | Advocates Act, 1961 Statutory Representation Framework | Bar Council of India / Parliament | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-CA2013-S403` | Companies Act, 2013 s. 403 & Fee Rules Table of Additional Fees | Ministry of Corporate Affairs | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-RULE-SPICE-2020` | Companies (Incorporation) Rules, 2014 (Rule 38 SPICe+) | Ministry of Corporate Affairs | IN-CENTRAL | REGULATORY_NOTIFICATION | OFFICIAL_GAZETTE | 2026-10-17 |
| `SRC-NOTIF-PAS-2023` | PAS Second Amendment Rules, 2023 (Rule 9B Dematerialisation) | Ministry of Corporate Affairs | IN-CENTRAL | REGULATORY_NOTIFICATION | OFFICIAL_GAZETTE | 2026-10-17 |
| `SRC-STATE-MH-STAMP-1958` | Maharashtra Stamp Act, 1958 (Sched I Arts 10, 39, 47) | IGR Maharashtra | IN-MH | STATUTE | OFFICIAL_GAZETTE | 2026-10-17 |
| `SRC-STATE-DL-STAMP-1899` | Indian Stamp Act, 1899 (Delhi Sched 1A Arts 10, 39) | Revenue Department, GNCTD | IN-DL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-STATE-KA-STAMP-1957` | Karnataka Stamp Act, 1957 (Sched Arts 10, 33) | Stamps and Registration, Karnataka | IN-KA | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-STATE-MH-PT-1975` | Maharashtra State Tax on Professions Act, 1975 (s. 5) | MahaGST, Maharashtra | IN-MH | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-STATE-KA-PT-1976` | Karnataka Tax on Professions Act, 1976 (s. 5) | Commercial Taxes, Karnataka | IN-KA | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-STATE-DL-PT-CONST` | Constitution of India (Art 276) / GNCTD Non-Enactment PT | Trade & Taxes, GNCTD | IN-DL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-STATE-MH-ROF-1932` | Indian Partnership Act (MH Rules) & e-Firms Portal | Directorate of Industries, MH | IN-MH | OFFICIAL_PORTAL | REGULATORY_AGENCY | 2026-10-17 |
| `SRC-STATE-KA-ROF-1932` | Indian Partnership Act (KA Rules) & Kaveri Portal | Stamps and Registration, KA | IN-KA | OFFICIAL_PORTAL | REGULATORY_AGENCY | 2026-10-17 |
| `SRC-ACT-IPA-1932` | Indian Partnership Act, 1932 (Act IX of 1932) | Parliament of India | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-SRA-1860` | Societies Registration Act, 1860 (Act XXI of 1860) | Parliament of India | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-ITA-1882` | Indian Trusts Act, 1882 & Registration Act, 1908 (s. 17) | Parliament of India | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-POSH-2013` | POSH Act, 2013 (Act 14 of 2013) & Rules | Ministry of Women & Child Dev | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-IESO-1946` | Industrial Employment (Standing Orders) Act, 1946 | Ministry of Labour & Employment | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-IT-2000` | Information Technology Act, 2000 (s. 43A, 79 Rules) | MeitY, Government of India | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ACT-FEMA-1999` | Foreign Exchange Management Act, 1999 & Current A/c Rules | Reserve Bank of India | IN-CENTRAL | STATUTE | PRIMARY_STATUTORY | 2026-10-17 |
| `SRC-ICSI-SS-001` | ICSI Secretarial Standards (SS-1 & SS-2) | ICSI / MCA s. 118(10) | IN-CENTRAL | REGULATORY_NOTIFICATION | REGULATORY_AGENCY | 2026-10-17 |
| `SRC-INT-001` | Master Service Registry Decision Record | CraftEgon CCS Executive Council | IN-CENTRAL | INTERNAL_APPROVAL_RECORD | INTERNAL_EXECUTIVE_RECORD | 2026-10-17 |
| `SRC-INT-PRC-001` | Captured Website Template Rates (Unverified Baseline) | CraftEgon Finance Committee | IN-CENTRAL | INTERNAL_COMMERCIAL_RECORD | INTERNAL_INDICATIVE_BASELINE | 2026-10-17 |

---

## 4. Jurisdiction Variations Investigation & Evidence Audit

The 10 state and Union Territory variation candidates in `data/jurisdiction-variations.json` were rechecked individually against official gazettes, state statutes, and department portals. **Zero records are marked `VERIFIED`** (`last_verified_at: null` across all 10).

| Variation ID | Service ID | Jurisdiction | Category | Statutory Rule & Citation | Source Reference | Effective Date | Status | Evidence Verification Finding |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `VAR-001` | `V01-SVC-007` | `IN-DL` (UT) | `STAMP_DUTY` | Delhi e-MoA: ₹200 (Art 39); e-AoA: ₹1,000 for capital up to ₹1,00,000, scaled upwards per statutory slabs | `SRC-STATE-DL-STAMP-1899` | 2010-06-01 | `SOURCE_IDENTIFIED` | Supported by Indian Stamp Act, 1899 Schedule 1A as amended by Delhi Act 07 of 2010. Formally pending professional opinion. |
| `VAR-002` | `V01-SVC-007` | `IN-MH` (State) | `STAMP_DUTY` | Maharashtra e-MoA: ₹200 (Art 39a); e-AoA: 0.2% on nominal share capital capped at ₹50,00,000 | `SRC-STATE-MH-STAMP-1958` | 2015-04-24 | `SOURCE_IDENTIFIED` | Supported by Maharashtra Stamp Act, 1958 Schedule I Article 10 as amended by Maharashtra Act XX of 2015. |
| `VAR-003` | `V01-SVC-007` | `IN-KA` (State) | `STAMP_DUTY` | Karnataka e-MoA: ₹1,000 (Art 33); e-AoA: ₹1,000 for every ₹10,00,000 capital or part thereof | `SRC-STATE-KA-STAMP-1957` | 2014-03-01 | `SOURCE_IDENTIFIED` | Supported by Karnataka Stamp Act, 1957 Schedule Article 10 & 33 as amended by Karnataka Act 19 of 2014. |
| `VAR-004` | `V01-SVC-002` | `IN-DL` (UT) | `STAMP_DUTY` | Delhi LLP Agreement Duty: Executed on ₹100 non-judicial e-stamp paper under Article 5(c) convention | `null` | 2019-01-01 | `UNREVIEWED` | **Statutory Gap:** Schedule 1A of Delhi lacks a specific LLP entry; ₹100 duty is an uncodified administrative convention. Retained strictly UNREVIEWED. |
| `VAR-005` | `V01-SVC-002` | `IN-MH` (State) | `STAMP_DUTY` | Maharashtra LLP Agreement Duty: ₹500 for contribution up to ₹50,00,000, scaled up to ₹5,000 | `SRC-STATE-MH-STAMP-1958` | 2015-04-24 | `SOURCE_IDENTIFIED` | Supported by Maharashtra Stamp Act, 1958 Schedule I Article 47 Explanation explicitly governing LLPs. |
| `VAR-006` | `V01-SVC-005` | `IN-MH` (State) | `LOCAL_ROF_PROCEDURE` | Maharashtra RoF: Online Form A filing via rof.mahaonline.gov.in with scanned notarized deed on ₹500 stamp | `SRC-STATE-MH-ROF-1932` | 2018-01-01 | `SOURCE_IDENTIFIED` | Supported by Maharashtra Partnership Rules and Directorate of Industries e-Firms portal procedure. |
| `VAR-007` | `V01-SVC-005` | `IN-KA` (State) | `LOCAL_ROF_PROCEDURE` | Karnataka RoF: Kaveri portal electronic submission followed by physical original deed verification | `SRC-STATE-KA-ROF-1932` | 2017-06-01 | `SOURCE_IDENTIFIED` | Supported by Karnataka Partnership (Registration of Firms) Rules and Department of Stamps and Registration practice. |
| `VAR-008` | `V04-SVC-001` | `IN-MH` (State) | `PROFESSIONAL_TAX` | Maharashtra PT: Section 5 mandates dual registration — PTRC for employers and PTEC for corporate entities | `SRC-STATE-MH-PT-1975` | 1975-04-01 | `SOURCE_IDENTIFIED` | Supported by Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975 Section 5. |
| `VAR-009` | `V04-SVC-001` | `IN-KA` (State) | `PROFESSIONAL_TAX` | Karnataka PT: Section 5 mandates employer registration within 30 days of hiring under Commercial Taxes Dept | `SRC-STATE-KA-PT-1976` | 1976-04-01 | `SOURCE_IDENTIFIED` | Supported by Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976 Section 5. |
| `VAR-010` | `V04-SVC-001` | `IN-DL` (UT) | `PROFESSIONAL_TAX` | Delhi PT Applicability: Absence of state PT enactment; DMC Act and municipal trade licensing require review | `null` | `null` | `PENDING_PROFESSIONAL_REVIEW` | **Downgraded:** Exemption cannot be inferred solely from legislative silence; municipal levies require qualified legal review. |

---

### 4.1 Detailed Substantiation of the Eight `SOURCE_IDENTIFIED` Jurisdiction Records

> [!IMPORTANT]
> **No Claim of Legal Verification:** The classification `SOURCE_IDENTIFIED` confirms that official state enactments, gazettes, or department procedures supporting the stated rule have been identified and documented below with verbatim excerpts. However, these records are **not thereby legally verified**. Substantive legal review, exact statutory interpretation, and qualified professional sign-off remain outstanding.

#### 1. `VAR-001`: Delhi Private Limited Company Incorporation Stamp Duty
- **Service ID:** `V01-SVC-007` (Private Limited Company Incorporation)
- **Jurisdiction:** `IN-DL` (National Capital Territory of Delhi, Union Territory)
- **Official Source URL:** `https://revenue.delhi.gov.in` / Delhi Gazette: Delhi Stamp (Amendment) Act, 2010 (Delhi Act 07 of 2010)
- **Statutory Provision & Schedule:** Indian Stamp Act, 1899 as applicable to Delhi, Schedule 1A, Articles 10 and 39.
- **Exact Text / Excerpt:**
  * *Article 39(a):* "Memorandum of Association of a Company— (a) if accompanied by articles of association under section 26 of the Companies Act, 1956: Two hundred rupees."
  * *Article 10(a):* "Articles of Association of a Company— where the company has no share capital or nominal share capital does not exceed Rs. 1,00,000: One thousand rupees."
- **Effective Date:** `2010-06-01` (Notified via Delhi Gazette Notification No. F.14(6)/LA-2008/Part file-IV/122 dated May 25, 2010, effective June 1, 2010).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** MCA SPICe+ electronic integration calculates e-stamp duty on e-MoA (INC-33) and e-AoA (INC-34). Partner review is required on whether nominal capital exceeding ₹10 Lakhs is capped under Delhi administrative rules or scales upwards indefinitely.

#### 2. `VAR-002`: Maharashtra Private Limited Company Incorporation Stamp Duty
- **Service ID:** `V01-SVC-007` (Private Limited Company Incorporation)
- **Jurisdiction:** `IN-MH` (State of Maharashtra)
- **Official Source URL:** `https://igrmaharashtra.gov.in` / Maharashtra Government Gazette: Maharashtra Stamp Act (LXI of 1958)
- **Statutory Provision & Schedule:** Maharashtra Stamp Act, 1958, Schedule I, Article 10 and Article 39(a).
- **Exact Text / Excerpt:**
  * *Article 10(a):* "Articles of Association of a Company— (a) where the company has a share capital: 0.2 per cent of the nominal share capital, subject to a maximum of Rs. 50,00,000."
  * *Article 39(a):* "Memorandum of Association of a Company— (a) if accompanied by articles of association under section 26 of the Companies Act: Two hundred rupees."
- **Effective Date:** `2015-04-24` (Maharashtra Act No. XX of 2015 published in Maharashtra Government Gazette on April 24, 2015).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Stamp duty credit eligibility on Form SH-7 capital increases under Section 31 of Maharashtra Stamp Act.

#### 3. `VAR-003`: Karnataka Private Limited Company Incorporation Stamp Duty
- **Service ID:** `V01-SVC-007` (Private Limited Company Incorporation)
- **Jurisdiction:** `IN-KA` (State of Karnataka)
- **Official Source URL:** `https://karnatakastamps.gov.in` / Karnataka Gazette: Karnataka Stamp Act, 1957 (Act No. 34 of 1957)
- **Statutory Provision & Schedule:** Karnataka Stamp Act, 1957, Schedule, Article 10 and Article 33.
- **Exact Text / Excerpt:**
  * *Article 33(a):* "Memorandum of Association of a Company— (a) if accompanied by Articles of Association under section 26 of the Companies Act, 1956: One thousand rupees."
  * *Article 10:* "Articles of Association of a Company— where the company has a share capital: For every rupees ten lakhs or part thereof: One thousand rupees."
- **Effective Date:** `2014-03-01` (Karnataka Act 19 of 2014, effective March 1, 2014).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Kaveri 2.0 electronic payment portal fee schedule alignment for non-standard authorized share capital structures.

#### 4. `VAR-005`: Maharashtra LLP Agreement Stamp Duty
- **Service ID:** `V01-SVC-002` (LLP Registration)
- **Jurisdiction:** `IN-MH` (State of Maharashtra)
- **Official Source URL:** `https://igrmaharashtra.gov.in` / Maharashtra Government Gazette
- **Statutory Provision & Schedule:** Maharashtra Stamp Act, 1958, Schedule I, Article 47 (Partnership), Explanation II.
- **Exact Text / Excerpt:**
  * *Article 47, Explanation II:* "For the purposes of this Article, the expression 'Partnership' includes a 'Limited Liability Partnership' as defined under the Limited Liability Partnership Act, 2008."
  * Rates: "Where contribution does not exceed Rs. 50,000: Five hundred rupees; Subject to a maximum of: Five thousand rupees."
- **Effective Date:** `2015-04-24` (Maharashtra Act No. XX of 2015).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Supplementary deed stamp duty under Article 47(2) upon admission of new partners or increase in contribution.

#### 5. `VAR-006`: Maharashtra Registrar of Firms (RoF) Partnership Procedure
- **Service ID:** `V01-SVC-005` (Partnership Firm Registration)
- **Jurisdiction:** `IN-MH` (State of Maharashtra)
- **Official Source URL:** `https://rof.mahaonline.gov.in` / Directorate of Industries, Government of Maharashtra
- **Statutory Provision & Schedule:** Indian Partnership Act, 1932, Section 58 read with Maharashtra Partnership Rules and Maharashtra Stamp Act, 1958 Article 47.
- **Exact Text / Excerpt:**
  * Portal workflow requires electronic submission of Form A through `rof.mahaonline.gov.in`, accompanied by a certified copy of the partnership deed executed on stamp paper of proper denomination (₹500 under Art 47) and duly notarized by a notary public.
- **Effective Date:** `2018-01-01` (Mandatory electronic portal transition).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Legal validity of remote digital affidavits versus physical notarial seals before the Registrar of Firms.

#### 6. `VAR-007`: Karnataka Registrar of Firms (RoF) Partnership Procedure
- **Service ID:** `V01-SVC-005` (Partnership Firm Registration)
- **Jurisdiction:** `IN-KA` (State of Karnataka)
- **Official Source URL:** `https://karnatakastamps.gov.in` / Department of Stamps and Registration, Government of Karnataka
- **Statutory Provision & Schedule:** Indian Partnership Act, 1932, Section 58 read with Karnataka Partnership (Registration of Firms) Rules.
- **Exact Text / Excerpt:**
  * "Application in Form I under section 58 shall be submitted to the Registrar of Firms having jurisdiction over the area in which the principal place of business is situated, accompanied by the prescribed fee and the original deed of partnership for verification."
- **Effective Date:** `2017-06-01` (Kaveri portal electronic application launch).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Integration of faceless verification under Kaveri 2.0 without physical deed production.

#### 7. `VAR-008`: Maharashtra Professional Tax (PTRC & PTEC)
- **Service ID:** `V04-SVC-001` (Payroll, PF & ESIC Management)
- **Jurisdiction:** `IN-MH` (State of Maharashtra)
- **Official Source URL:** `https://mahagst.gov.in` / Maharashtra State Tax on Professions Act, 1975
- **Statutory Provision & Schedule:** Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975, Section 5 read with Schedule I.
- **Exact Text / Excerpt:**
  * *Section 5(1):* "Every person liable to pay tax under this Act (not being a person earning salary or wages, in respect of whom the tax is payable by his employer) shall obtain a certificate of enrolment from the prescribed authority."
  * *Section 5(2):* "Every employer (not being an officer of Government) liable to pay tax under section 4 shall obtain a certificate of registration from the prescribed authority."
- **Effective Date:** `1975-04-01` (Maharashtra Act No. XVI of 1975).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Gender-based salary exemption thresholds (up to ₹25,000/month for women) enacted in Maharashtra Budget 2023.

#### 8. `VAR-009`: Karnataka Professional Tax (Employer PT Registration)
- **Service ID:** `V04-SVC-001` (Payroll, PF & ESIC Management)
- **Jurisdiction:** `IN-KA` (State of Karnataka)
- **Official Source URL:** `https://e-kstrc.karnataka.gov.in` / Commercial Taxes Department, Government of Karnataka
- **Statutory Provision & Schedule:** Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976, Section 5 read with Schedule.
- **Exact Text / Excerpt:**
  * *Section 5(1):* "Every person liable to pay tax under this Act shall obtain a certificate of enrolment from the Assessing Authority in the prescribed manner."
  * *Section 5(2):* "Every employer liable to pay tax under section 4 shall obtain a certificate of registration from the Assessing Authority within thirty days of his becoming liable to pay tax."
- **Effective Date:** `1976-04-01` (Karnataka Act No. 35 of 1976).
- **Date Source Checked:** `2026-10-17`
- **Qualified Legal Review Required:** Revision of minimum threshold from ₹15,000 to ₹25,000 per month under Karnataka Act No. 15 of 2023.

---

### 4.2 Independent Reassessment of Delhi Professional Tax (`VAR-010`)

- **Prior Baseline & Reassessment Rationale:** In earlier audits, `VAR-010` was marked `SOURCE_IDENTIFIED` under `SRC-STATE-DL-PT-CONST` based on the legal rationale that Article 276 of the Constitution of India empowers state legislatures to enact professional tax, and since the Legislative Assembly of NCT of Delhi has never enacted a State Professional Tax Act, commercial establishments are exempt.
- **Evidence Gap Identified:** While it is factually true that the Department of Trade and Taxes GNCTD does not levy or collect an employer professional tax, **inferring a definitive legal exemption solely from the absence of a statute in the reviewed catalog is a legally flawed negative inference**. 
- **Municipal & Local Complications:** The Delhi Municipal Corporation Act, 1957 (DMC Act, Section 113) contains historical enabling clauses for taxes on professions and trade licensing. While judicial precedents (such as *South Delhi Municipal Corporation vs. B.N. Magon*) have held that independent professional activities cannot be arbitrarily subjected to commercial property tax brackets, local municipal trade licensing requirements and mixed-use regulations complicate the assertion of an unqualified "professional tax exemption."
- **Action Taken:**
  * **Status Downgraded:** Changed from `SOURCE_IDENTIFIED` to **`PENDING_PROFESSIONAL_REVIEW`**.
  * **Source ID Cleared:** Set to `null` to prevent misrepresenting legislative silence as a verified statutory citation.
  * **Effective Date Cleared:** Set to `null` (no positive enactment date).
  * **Rule Statement Narrowed:** The statement was re-drafted to explicitly flag that an affirmative statutory exemption cannot be inferred solely from legislative silence and requires formal legal opinion from qualified Delhi tax counsel.

---

## 5. Audit of Eligibility Records (All 54 Active Services)

> [!WARNING]
> **Substantiation & Legal Gap Finding:** Neither the 54 eligibility records nor the eight `SOURCE_IDENTIFIED` jurisdiction records are legally verified. Identifying a relevant official statute, gazette notification, or portal procedure (`SOURCE_IDENTIFIED`) establishes traceability to an official source, but exact source-to-claim confirmation and substantive legal review by a qualified practicing advocate or company secretary remain outstanding. Exactly **zero records are legally verified** (`last_verified_at: null` across all 54 records). The data layer carefully separates statutory requirements from administrative operational checklists and matters requiring qualified legal interpretation.

### 5.1 Taxonomy of Eligibility Data Elements
Each record in `data/eligibility.json` separates its requirements into distinct legal and practical categories:
1. **Statutory Requirements:** Substantive legal prerequisites enacted by Parliament or State Legislatures (e.g. minimum directors, DPIN/DIN, residency, age and turnover caps for startups, non-profit bars for Section 8, dematerialisation mandates under Rule 9B, POSH Internal Committee thresholds).
2. **Operational / Procedural Checklists:** Administrative documentation required by government portals to process filings (e.g. utility bills < 2 months old, landlord NOCs, KYC self-attestations, pitch decks, mobile OTPs, bank NOCs).
3. **Administrative Assumptions & Regulatory Gaps:** Portal conventions that lack explicit statutory text (e.g. ₹100 stamp paper convention for Delhi LLPs).
4. **Matters Requiring Professional Review:** Legal gray areas requiring formal written opinions from a practicing Advocate or Company Secretary before client advice can be given.

---

## 6. Audit & Reconciliation of Regulatory Claims (25 Claims Registry)

### 6.1 Status Breakdown of 25 Regulatory Claims

| Claim ID | Controlled Claim Text | Risk Priority | Category | Source ID | Review Outcome | Status | Disposition |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| `CLM-001` | Live MCA V3 Connector • MCA Verified | P2_HIGH | GOVERNMENT_CONNECTIVITY | `SRC-MCA-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-002` | Real-time sync active | P2_HIGH | REAL_TIME_SYNC | `SRC-MCA-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-003` | Live Regulatory OS • Real-Time CIN/LLPIN Sync | P2_HIGH | REGULATORY_OS | `SRC-MCA-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-004` | Real-time statutory countdown clocks | P2_HIGH | COUNTDOWN_ACCURACY | `SRC-MCA-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-005` | Scanning IP India public records... | P1_CRITICAL | GOVERNMENT_CONNECTIVITY | `SRC-CGPDTM-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-006` | No identical prior registrations found in Class 42 | P1_CRITICAL | TRADEMARK_AVAILABILITY | `SRC-CGPDTM-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-007` | High availability probability • Proceed to filing | P1_CRITICAL | TRADEMARK_AVAILABILITY | `SRC-CGPDTM-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-008` | NCLT Merger & Restructuring Petition Execution | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-009` | Full Tribunal Advocacy & NCLT Representation | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-010` | Insolvency Defense Commercial Retainer Packages | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-011` | Section 241/242 Petition Representation Pricing | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-012` | Board Control & Director Dispute Litigation Defense | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-013` | Late fee computed pursuant to Section 403: ₹100/day | P2_HIGH | STATUTORY_PROVISION | `SRC-ACT-CA2013-S403` | PENDING | `PENDING_PROFESSIONAL_REVIEW` | ACCEPTABLE_WITH_EVIDENCE |
| `CLM-014` | SPICe+ Part A reserves name 20 days; Part B integrates 10 | P2_HIGH | STATUTORY_PROVISION | `SRC-RULE-SPICE-2020` | PENDING | `PENDING_PROFESSIONAL_REVIEW` | ACCEPTABLE_WITH_EVIDENCE |
| `CLM-015` | Mandatory dematerialization for private cos Rule 9B | P2_HIGH | STATUTORY_PROVISION | `SRC-NOTIF-PAS-2023` | PENDING | `PENDING_PROFESSIONAL_REVIEW` | ACCEPTABLE_WITH_EVIDENCE |
| `CLM-016` | aria-live="polite" | P4_LOW | HOST_AND_SECURITY | `null` | REJECTED | `REJECTED_OR_OUTDATED` | FALSE_POSITIVE |
| `CLM-017` | aria-expanded="false" | P4_LOW | HOST_AND_SECURITY | `null` | REJECTED | `REJECTED_OR_OUTDATED` | FALSE_POSITIVE |
| `CLM-018` | Estimated Late Fees | P4_LOW | PRICING_AND_FEES | `null` | REJECTED | `REJECTED_OR_OUTDATED` | FALSE_POSITIVE |
| `CLM-019` | Client-side form submission to Cloudflare Worker | P3_MEDIUM | HOST_AND_SECURITY | `null` | PENDING | `SOURCE_NEEDED` | NEEDS_EXTERNAL_VERIFICATION |
| `CLM-020` | Indicative Professional Fee: ₹7,499 (Pvt Ltd) + MCA challans | P2_HIGH | PRICING_AND_FEES | `SRC-INT-PRC-001` | PENDING | `SOURCE_IDENTIFIED` | ACCEPTABLE_WITH_EVIDENCE |
| `CLM-021` | through our panel of independent associated advocates | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-022` | Automated RoC filings, AI legal drafting, NCLT defense | P1_CRITICAL | TRIBUNAL_ADVOCACY_SCOPE | `SRC-BAR-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-023` | Complete checkout to instantly link entity / Tax invoices | P2_HIGH | NOTIFICATION_GATEWAY | `SRC-INT-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-024` | Automated Multi-Channel Regulatory Alerts | P2_HIGH | NOTIFICATION_GATEWAY | `SRC-INT-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |
| `CLM-025` | Canonical host pointing to craftegon.com instead of ccs | P3_MEDIUM | HOST_AND_SECURITY | `SRC-INT-001` | REJECTED | `REJECTED_OR_OUTDATED` | CORRECTED |

### 6.2 Reconciliation of Rejected Claims
For all 20 `REJECTED_OR_OUTDATED` claims:
1. **Explicit Reasons and Dispositions Recorded:** Exactly 17 claims have disposition `CORRECTED` (remediated on disk in Phase 1 to remove misleading automation or unauthorized tribunal advocacy claims), and 3 claims have disposition `FALSE_POSITIVE` (`CLM-016` to `CLM-018` representing scraped accessibility attributes).
2. **Zero Treated as Approved:** None of the 20 rejected claims have `professional_review_outcome: "APPROVED"` or `verification_status: "VERIFIED"`.
3. **Zero Treated as Fallback:** No application script or test harness treats a rejected claim as a fallback when an approved claim is absent. Automated tests in `scripts/validate-phase-2-registry.js` explicitly assert that all 20 rejected claims evaluate to `false` under production gating.

---

## 7. Audit of Pricing Dataset & Production Status Gating

### 7.1 Commercial Baseline Architecture
- **Total Pricing Records:** 54 records mapped 1-to-1 with active service IDs in `data/service-registry.json`.
- **Verification Status:** 54/54 (100%) marked strictly **`UNVERIFIED`** with `last_verified_at: null`.
- **Custom Quote Services (`amount: null`):** Exactly 40 services (74.1%) represent bespoke, advisory, or multi-jurisdictional legal and tax scopes where public fixed rates are misleading.
- **Starting From Baselines (`amount: integer`):** Exactly 14 services (25.9%) preserve historical indicative template figures captured from Phase 1 HTML pages under source `SRC-INT-PRC-001`.
- **Fee Segmentation:** All records explicitly itemize `included_charges` and `excluded_charges` (government challans, state stamp duty, GST at 18%, late filing fees).

### 7.2 Production-Facing Status Gating & Consumer Architecture
1. **Current Consumer Limitation & Non-Runtime Status:** The existing client-side website runtime (`services/*.html`, `assets/js/`) consists of static HTML files and client-side calculators stabilized in Phase 1. The static website does NOT dynamically consume the JSON data layer (`data/*.json`). Therefore, `isApprovedForClientFacing()` currently exists solely in the validator script (`scripts/validate-phase-2-registry.js`) and its automated test suite; **it is not yet an active production runtime enforcement mechanism**.
2. **Authoritative Status-Gating Specification:** An authoritative status-gating function `isApprovedForClientFacing(record)` is defined and exported in `scripts/validate-phase-2-registry.js` as an architectural specification and automated test harness guardrail:
   ```javascript
   function isApprovedForClientFacing(record) {
     if (!record || typeof record !== 'object') return false;
     if (record.verification_status !== 'VERIFIED') return false;
     if (!record.last_verified_at) return false;
     if (!record.source_id) return false;
     if (record.professional_review_outcome && record.professional_review_outcome !== 'APPROVED') return false;
     if (record.disposition === 'CORRECTED' || record.disposition === 'FALSE_POSITIVE') return false;
     return true;
   }
   ```
3. **Automated Status Gating Verification:**
   - 100% of pricing records (54/54) evaluate to `false`.
   - 100% of eligibility records (54/54) evaluate to `false`.
   - 100% of jurisdiction variations (10/10) evaluate to `false`.
   - 100% of regulatory claims (25/25) evaluate to `false`.
   - Any record marked `UNVERIFIED`, `UNREVIEWED`, `SOURCE_IDENTIFIED`, `PENDING_PROFESSIONAL_REVIEW`, `SOURCE_NEEDED`, or `REJECTED_OR_OUTDATED` is unconditionally blocked from client-facing display by the validator logic.


---

## 8. Schema Configuration & Structural Validation vs Legal Accuracy

### 8.1 Schema & Dependency Inspection
- **Ajv Draft 2020-12 Configuration:** Configured in `scripts/validate-phase-2-registry.js` using `require('ajv/dist/2020')` and format extensions via `require('ajv-formats')`. The validator instantiates `new Ajv2020({ allErrors: true, strict: false })` and compiles all 7 schemas against Draft 2020-12 specification.
- **Dependency & Lockfile Agreement:**
  * `package.json` specifies `"ajv": "^8.20.0"`, `"ajv-formats": "^3.0.1"`, and `"jsdom": "^29.1.1"`.
  * `package-lock.json` lockfile contains resolved entries for `ajv` (version 8.20.0) and `ajv-formats` (version 3.0.1) along with their dependency tree (`fast-deep-equal`, `fast-uri`, `json-schema-traverse`, `require-from-string`).
  * `npm list` synchronously confirms exact resolved versions: `ajv@8.20.0` and `ajv-formats@3.0.1`.

### 8.2 Structural Validation vs Legal Accuracy
> [!CAUTION]
> Structural JSON Schema Draft 2020-12 validation validates syntax, required keys, regular expression patterns, and referential constraints. It does NOT validate or constitute legal accuracy, statutory truth, or regulatory applicability of the underlying rules.

---

## 9. Unresolved Legal and Commercial Questions for Qualified Reviewers

1. **Delhi Stamp Act Applicability to LLP Agreements (`VAR-004`):** Formal legal opinion required on whether revenue authorities can treat an LLP agreement as an instrument of Partnership under Article 46 or whether Article 5(c) general agreement duty is legally sustainable.
2. **Delhi Professional Tax Exemption & Municipal Levies (`VAR-010`):** Written opinion from Delhi tax counsel required on whether DMC Act provisions or local trade licensing fees apply to corporate entities in the absence of a State Professional Tax Act.
3. **Tribunal Advocacy Boundary under Advocates Act, 1961 (`CLM-008` to `CLM-012`, `CLM-021`):** Legal assessment of secretarial support boundaries before NCLT under Section 432 CA 2013 vs Sections 29/30 Advocates Act 1961.
4. **Private Company Dematerialisation Compliance Deadline (`CLM-015`, `V02-SVC-012`):** Review of recent MCA circulars regarding Rule 9B enforcement for non-small private companies.
5. **Companies Act Section 403 Additional Fee Computation (`CLM-013`):** Verification of consumer disclosures distinguishing daily ₹100/day fees on annual returns versus event-based multipliers.
6. **Commercial Partner Fee Schedule Sign-Off (`PRC-V01-SVC-001` to `PRC-V13-SVC-003`):** Execution of a formal Partner Commercial Pricing Resolution approving binding commercial retainers.

---

## 10. Test Verification Results & Count Reconciliation

### 10.1 Explanation & Reconciliation of Test Counts
The audit report references two distinct automated test metrics executed synchronously in the local environment. These reflect internal software assertions on schema compliance, data referential integrity, and regression guards; **they do not constitute or claim independent third-party or qualified legal verification**:
1. **54/54 CI Checks (Website Remediation Invariants):**
   - Script: `scripts/test-phase-1-remediation.js`
   - Purpose: Validates that all Phase 1 website remediation commitments remain intact on disk across 7 suites.
   - Actual Result: **TEST SUMMARY: 54 passed, 0 failed.** (Exit code 0).
2. **58/58 Validator Assertions (Phase 2 Data Layer & Registry):**
   - Script: `scripts/validate-phase-2-registry.js`
   - Purpose: Validates the Phase 2 service registry CSV, disk alignment, all 7 JSON Schema Draft 2020-12 datasets, cross-file referential integrity, status-gating specification, rejected claims reconciliation, and negative data corruption fixtures D1–D19.
   - Actual Result: **VALIDATION SUMMARY: 58 passed, 0 failed.** (Exit code 0).
3. **112 Total Assertions in `npm test`:**
   - Command: `npm test`
   - Execution: Runs the entire test runner pipeline, executing `scripts/test-phase-1-remediation.js` (54 assertions) followed by `scripts/validate-phase-2-registry.js` (58 assertions), alongside syntax verification of assets.
   - Reconciled Total: **54 + 58 = 112 passed assertions, 0 failed.** (Synchronous exit code 0).

---

## 11. Summary of Changed Files & Working-Tree Status

### 11.1 Changed Files in Task 3
- `data/sources.json`: 33 sources cataloged (18 central, 8 state, 5 gazettes, 2 internal).
- `data/regulatory-claims.json`: 25 claims audited; 20 rejected claims reconciled with explicit outcomes and dispositions.
- `data/jurisdiction-variations.json`: 10 variations audited; 8 substantiated as `SOURCE_IDENTIFIED`; `VAR-004` retained as `UNREVIEWED`; `VAR-010` downgraded to `PENDING_PROFESSIONAL_REVIEW` with `source_id: null`.
- `data/eligibility.json`: 54 services audited with statutory requirements separated from operational checklists.
- `data/pricing.json`: 54 services preserved as 100% unverified baseline (40 null, 14 indicative).
- `scripts/validate-phase-2-registry.js`: Updated to 58 assertions, including production status-gating and rejected claim reconciliation.
- `review-output/phase-2-data-layer/phase-2-task-3-evidence-audit-report.md`: Created and updated comprehensive record-level audit report.

### 11.2 Working-Tree Status (`git status --short`)
```text
 M data/jurisdiction-variations.json
 M package-lock.json
 M package.json
 M review-output/phase-1-foundations/phase-1-service-ownership-review.md
 M scripts/validate-phase-2-registry.js
?? data/
?? review-output/phase-2-data-layer/
?? review-output/phase-2-service-registry/
?? scratch/
```
- **Git Push:** Prohibited and NOT executed.
- **Git Commit:** Prohibited and NOT executed.
- **Cloudflare / Production Deployment:** Prohibited and NOT executed.
- **Public HTML Pages:** Exactly 0 modifications made. All 57 service pages on disk remain untouched.

---

## 12. Conclusion & Task 3 Closeout Disposition

### 12.1 Closeout Disposition: Accepted with Documented Gaps
Phase 2 Task 3 is closed as **Accepted with documented gaps**, and **NOT as fully legally verified**:
1. **No Legal Verification Claimed:** Exactly 0 records across all datasets are marked `VERIFIED`. The 8 `SOURCE_IDENTIFIED` jurisdiction records and 54 `SOURCE_IDENTIFIED` eligibility records have relevant official statutory frameworks cataloged, but exact source-to-claim confirmation and formal professional review by a practicing advocate or company secretary remain outstanding gaps.
2. **Delhi Professional Tax Reassessed:** `VAR-010` is downgraded to `PENDING_PROFESSIONAL_REVIEW` with `source_id: null` because an affirmative statutory exemption cannot be inferred solely from legislative silence.
3. **Status-Gating Role Clarified:** `isApprovedForClientFacing()` currently functions in the validator and test harness to verify that unapproved records cannot pass validation; it is not yet an active production runtime enforcement mechanism because the website currently renders static HTML without consuming the JSON data layer.
4. **Automated Test Results Recorded:** Synchronous local test execution confirmed 58/58 validator assertions (exit code 0) and 112/112 total project assertions (exit code 0). No independent third-party verification is claimed.
5. **Next Steps:** Task 3 is complete and ready for stakeholder sign-off under this restricted disposition. Work on Phase 2 Task 4 will not begin until explicit user authorization is provided.

