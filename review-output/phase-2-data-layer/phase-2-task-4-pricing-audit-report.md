# CraftEgon CCS — Phase 2, Task 4: Pricing Inventory and Evidence Audit Report

**Document ID:** CRAFTEGON-DOC-P2-T4-001  
**Execution Date:** 2026-10-17  
**Task Priority:** High (P2-T4 Pricing Inventory & Evidence Gate)  
**Mode:** Inspect → Inventory → Reconcile → Validate → Report  
**Environment:** Local Repository Only (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Deployment & Push Status:** Strictly Prohibited / Zero Git Commits / Zero External Pushes / Local-Only  
**Validation Suite Status:** 65/65 Validator Assertions Passed (0 Failed) • 54/54 Main CI Checks Passed (0 Failed) • 119/119 Total Project Assertions Passed (Exit Code 0)  
**Task Closeout Recommendation:** **Accepted with Documented Gaps** (Commercial Pricing Baseline Captured; Formal Commercial Sign-off Pending)

---

## 1. Executive Summary & Baseline Reconciliation

Phase 2, Task 4 builds an evidence-backed, comprehensive pricing inventory for CraftEgon Corporate Services (CCS). This audit inventories every displayed rate across all 57 canonical routes, strictly separates professional service fees from government charges, state stamp duties, and statutory thresholds, and operationalizes strict commercial governance.

### 1.1 Baseline Reconciliation Summary

| Metric Dimension | Authoritative Count | Description & Reconciliation |
| :--- | :---: | :--- |
| **Total Canonical Routes on Disk** | **57** | 54 active service pages + 3 non-commercial referral-only routes in `services/`. |
| **Active CCS Services** | **54** | Exactly 54 approved active service IDs (`V01-SVC-001` through `V13-SVC-003`). |
| **Primary Pricing Records in JSON** | **54** | Exactly 1 pricing record per active service ID in [`data/pricing.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/pricing.json). |
| **Referral-Only Routes with Pricing** | **0** | Strict boundary: referral routes carry zero commercial pricing records. |
| **Total Website Pricing Cards Found** | **57** | 56 numeric pricing cards + 1 custom retainer card across active service pages on disk. |
| **Total Website Numeric Price Tiers** | **56** | 50 single-tier numeric rates + 6 rates across 3 dual-tier service pages. |
| **Active Services with Single Price Tier** | **50** | Exactly 1 numeric price card displayed on the service page (50 cards / 50 numeric tiers). |
| **Active Services with Multi-Price Tiers** | **3** | Services with 2 package tiers (6 cards / 6 numeric tiers across `V01-SVC-007`, `V02-SVC-007`, `V02-SVC-017`). |
| **Active Services with Custom Quote Gap** | **1** | `V09-SVC-003` (`nclt-merger-petitions.html`) displays "Custom Retainer on Assessment" (1 card / 0 numeric tiers; `amount: null`). |
| **Raw Rupee Figures Scraped from Pages** | **59** | 56 service prices + 1 statutory late penalty (₹5,000) + 1 statutory turnover threshold (₹5 Crores) + 1 commercial package cap (₹10 Lakhs). |
| **Statutory Turnover Thresholds Isolated** | **1** | `₹5 Crores` turnover threshold for GSTR-9C under CGST Act s. 35(5)/s. 44 (`SRC-CBIC-001`). |
| **Commercial Package Caps Isolated** | **1** | `₹10 Lakhs` authorized capital cap for Standard Startup Retainer on `V02-SVC-017` (commercial scope limit, NOT statutory). |
| **Statutory Late Penalties Isolated** | **1** | `₹5,000` DIN late filing fee under Rule 12A (`SRC-MCA-001`). |
| **Cards Labelled "All Inclusive"** | **18** | Exact website wording preserved; tax inclusion marked `UNCONFIRMED` with zero assumed GST rates. |
| **Commercially Verified / Approved Prices** | **0** | **0 records marked `VERIFIED`**; all 54 remain strictly `UNVERIFIED` pending Partner Pricing Committee sign-off. |

---

## 2. Mathematical Reconciliation: 54 Records, 57 Cards, 56 Numeric Tiers

To eliminate any ambiguity between the counts of **54 pricing records**, **57 pricing cards**, and **56 numeric price tiers**, this section defines each term and provides the record-level calculation:

### 2.1 Count Definitions

1. **54 Primary Pricing Records (`data/pricing.json`):**
   - Represents the canonical data layer entities.
   - Enforces a strict 1-to-1 relationship with the 54 approved active service IDs (`V01-SVC-001` through `V13-SVC-003`).
   - The 3 referral-only routes on disk carry zero commercial pricing records.
2. **57 Pricing Cards on Disk (`services/*.html`):**
   - Represents physical HTML `<div class="if-pricing-card">` containers found across the 57 canonical service pages on disk.
   - 3 referral-only pages have 0 pricing cards (they display non-commercial referral blocks).
   - 50 active service pages display exactly 1 pricing card = **50 cards**.
   - 3 active service pages display exactly 2 pricing cards = **6 cards**.
   - 1 active service page (`V09-SVC-003`) displays 1 pricing card ("Custom Retainer on Assessment") = **1 card**.
   - Total pricing cards on disk = $50 + 6 + 1 = \mathbf{57\text{ pricing cards}}$.
3. **56 Numeric Price Tiers:**
   - Represents published, concrete rupee figures displayed within pricing cards across the website.
   - 50 single-tier pages display 1 numeric price each = **50 numeric prices**.
   - 3 dual-tier pages display 2 numeric prices each = **6 numeric prices**.
   - Exactly 1 active service page (`V09-SVC-003` NCLT Mergers) displays a non-numeric custom retainer ("Custom Retainer on Assessment", `amount: null`), contributing **0 numeric prices**.
   - Total published numeric price tiers = $50 + 6 = \mathbf{56\text{ numeric price tiers}}$.

### 2.2 Record-Level Calculation & Mapping Table

$$\begin{aligned}
\text{Total Active Services (JSON Records)} &= 54 \\
\text{Total Pricing Cards on Disk} &= 50\text{ (single)} + 6\text{ (dual)} + 1\text{ (custom)} = \mathbf{57} \\
\text{Total Displayed Numeric Price Tiers} &= 50\text{ (single)} + 6\text{ (dual)} = \mathbf{56} \\
\text{Raw Rupee Figures on Service Pages} &= 56\text{ (service prices)} + 1\text{ (penalty)} + 1\text{ (turnover)} + 1\text{ (capital cap)} = \mathbf{59}
\end{aligned}$$

| Calculation Dimension | Single-Tier Services (50) | Dual-Tier Services (3) | Custom Retainer Gap (1) | Referral Routes (3) | Total Aggregate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Canonical Service Pages on Disk** | 50 | 3 | 1 | 3 | **57 routes** |
| **Active Service IDs in Registry** | 50 | 3 | 1 | 0 | **54 services** |
| **Primary Pricing Records in JSON** | 50 | 3 | 1 | 0 | **54 records** |
| **Pricing Cards per Page** | 1 card each | 2 cards each | 1 card | 0 cards | **57 pricing cards** |
| **Numeric Price Tiers per Page** | 1 price each | 2 prices each | 0 (Custom Retainer) | 0 | **56 numeric tiers** |
| **Additional Tiers in JSON Data** | 0 | 3 (Tier 2 in array) | 0 | 0 | **3 additional tiers** |

### 2.3 The Three Dual-Tier Active Services (+3 Rates)
1. **`V01-SVC-007` (Private Limited Company Registration — `/services/pvt-ltd-registration.html`):**
   - *Tier 1 (Standard SPICe+):* **₹7,499 + Govt. Fees** (2 DSC, 2 DIN, SPICe+ Part A/B, MoA/AoA, PAN/TAN).
   - *Tier 2 (Startup Growth Bundle):* **₹11,999 + Govt. Fees** (Includes Standard SPICe+ + SHA + Udyam + 1-yr Register).
2. **`V02-SVC-007` (Form MGT-14 RoC Filing — `/services/form-mgt14.html`):**
   - *Tier 1 (Standard Filing):* **₹1,999 + Govt. Fees** (Resolution drafting, PCS certification, MCA upload).
   - *Tier 2 (Venture Resolution Package):* **₹4,999 + Govt. Fees** (EGM notice, special resolution drafting, PCS certification, MCA upload).
3. **`V02-SVC-017` (RoC Annual Compliance Retainer — `/services/roc-annual-compliance.html`):**
   - *Tier 1 (Standard Startup Retainer):* **₹14,999 / year** (AOC-4, MGT-7, up to 4 DIR-3 KYC, ADT-1, registers; companies up to ₹10L capital).
   - *Tier 2 (Enterprise Annual Retainer):* **₹29,999 / year** (Includes Standard + AOC-4 XBRL, DPT-3, MSME-1, up to 4 Board Minutes).

---

## 3. Strict Separation of Price Categories, Caps & Thresholds

The audit enforces complete conceptual and structural separation among distinct monetary components:

### 3.1 Inspection & Determination of the ₹10 Lakhs Amount

- **Source Location:** `/services/roc-annual-compliance.html` line 103:
  ```html
  <h3 class="if-pricing-title">Standard Startup Retainer</h3>
  <p class="if-pricing-desc">For private limited companies with authorized capital up to ₹10 Lakhs.</p>
  <div class="if-pricing-price">₹14,999 <span>/ year</span></div>
  ```
- **Factual Determination:**
  - This ₹10 Lakhs figure is a **commercial package eligibility cap / commercial scope limit** set by CraftEgon for its ₹14,999/year Standard Startup Retainer package tier.
  - It is **NOT a statutory threshold**. The Companies Act, 2013 and MCA rules contain no statutory threshold or filing differentiation at ₹10 Lakhs authorized capital (the statutory small company definition under Section 2(85) operates at paid-up capital up to ₹4 Crores and turnover up to ₹40 Crores).
  - Companies with authorized capital exceeding ₹10 Lakhs are commercially directed to the Enterprise Annual Retainer (₹29,999/year) or bespoke pricing.
- **Data & Schema Correction:**
  - In [`data/schemas/pricing.schema.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/schemas/pricing.schema.json), added `commercial_package_caps` to capture commercial package eligibility limits.
  - In [`data/pricing.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/pricing.json), `V02-SVC-017` was corrected: `statutory_thresholds` was reset to `[]`, and the ₹10 Lakhs cap was placed into `commercial_package_caps` under `AUTHORIZED_CAPITAL_CAP`.
  - In contrast, the `₹5 Crores` turnover threshold in `V03-SVC-003` (`gst-annual.html`) is retained in `statutory_thresholds` as it is an authentic statutory threshold triggering mandatory GSTR-9C reconciliation under Section 35(5) and Section 44 of the CGST Act, 2017 (`SRC-CBIC-001`).

### 3.2 Tax Treatment for the 18 "All Inclusive" Cards

- **Exact Website Wording Preserved:** All 18 cards displaying "All Inclusive" preserve the exact string (e.g., `₹999 All Inclusive`, `₹14,999 All Inclusive`) in `website_displayed_price`.
- **Tax Inclusion Status Marked `UNCONFIRMED`:**
  - Detailed page inspection revealed that none of the 18 service pages state whether GST or other taxes are included in the figure, nor do they specify a tax percentage.
  - All 18 records (and all 54 active records generally) are explicitly marked with `tax_inclusion_status: "UNCONFIRMED"`.
- **Zero Assumed Tax Rates:**
  - Assumed disclaimers such as `"Goods and Services Tax (GST) at 18%"` were completely removed from `excluded_charges`.
  - No tax rate was assumed or calculated in accordance with audit rules.

### 3.3 Breakdown Counts by Pricing Category, Model & Verification Status

| Dimension | Category / State Attribute | Count | Breakdown & Distribution Notes |
| :--- | :--- | :---: | :--- |
| **Pricing Category** | `PROFESSIONAL_FEE` | **54** | 100% of the 54 records represent CraftEgon professional secretarial, legal, and advisory fees. |
| | Statutory Govt. Fees / Stamp Duty | *Excluded* | Separated into `excluded_charges` and statutory notes across all applicable filings. |
| **Pricing Basis Model** | `STARTING_FROM` | **27** | Base retainer or filing fee subject to entity complexity, share capital, or director count. |
| | `FIXED` | **18** | Fixed, single-engagement professional fee (e.g., standard agreements, trademark drafting). |
| | `ANNUAL` | **5** | Annual compliance retainers (e.g. RoC retainer, board minutes, foreign branch returns). |
| | `PER_FILING` | **3** | Charged per DIN (DIR-3 KYC) or per half-yearly return (PAS-6, MSME-1). |
| | `CUSTOM_QUOTE` | **1** | Bespoke retainer upon formal assessment (`V09-SVC-003` NCLT Merger Petitions). |
| **Tax Inclusion Status** | `UNCONFIRMED` | **54** | **100% of records** marked UNCONFIRMED; no page explicitly states GST inclusion or rate. |
| | `EXPLICITLY_INCLUDED` | **0** | Zero pages explicitly confirm inclusive tax breakdown. |
| | `EXPLICITLY_EXCLUDED` | **0** | Zero pages explicitly state a statutory GST exclusion rate. |
| **Verification Status** | `UNVERIFIED` | **54** | **100% of records** remain unverified baseline pending commercial and statutory sign-off. |
| | `VERIFIED` | **0** | **0 records marked `VERIFIED`** (strictly gated by schema and validator). |
| **Commercial Approval State** | `PENDING_COMMERCIAL_APPROVAL` | **54** | **100% of records** pending formal Partner Pricing Committee sign-off resolution. |
| | `COMMERCIALLY_APPROVED` | **0** | **0 records approved** for client-facing commercial commitment. |
| **Evidence State** | `WEBSITE_OBSERVED_HISTORICAL` | **54** | **100% of records** captured from verbatim current website service page cards. |
| | `INTERNAL_RECORD_IDENTIFIED` | **0** | Awaiting submission of signed partner rate cards and cost breakdown structures. |
| | `VERIFIED_AGAINST_EVIDENCE` | **0** | None verified against both commercial sign-off and statutory gazette fee schedules. |

---

## 4. Complete Inventory of All 54 Active Service Pricing Records

Every active service in [`data/pricing.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/pricing.json) is mapped 1-to-1 with [`data/service-registry.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/service-registry.json).

| # | Service ID | Service Name & Route | Vert. | Displayed Price Expression | Primary / Multi-Tier Amount (INR) | Pricing Model | Isolated Thresholds / Penalties / Caps | Tax Inclusion Status | Verification Status | Commercial Sign-Off State |
| :-: | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | `V01-SVC-001` | [DPIIT Startup India Recognition](/services/dpiit-startup-india.html) | `V01` | ₹4,999 + Govt. Fees | ₹4,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 2 | `V01-SVC-002` | [LLP Registration](/services/llp-registration.html) | `V01` | ₹5,999 + Govt. Fees | ₹5,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 3 | `V01-SVC-003` | [MSME / Udyam Registration Online](/services/msme-udyam.html) | `V01` | ₹999 All Inclusive | ₹999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 4 | `V01-SVC-004` | [One Person Company (OPC) Registration](/services/opc-registration.html) | `V01` | ₹6,999 + Govt. Fees | ₹6,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 5 | `V01-SVC-005` | [Partnership Firm Registration](/services/partnership-registration.html) | `V01` | ₹4,499 + Stamp Duty | ₹4,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 6 | `V01-SVC-006` | [Sole Proprietorship Registration](/services/proprietorship-registration.html) | `V01` | ₹2,999 All Inclusive | ₹2,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 7 | `V01-SVC-007` | [Private Limited Company Registration](/services/pvt-ltd-registration.html) | `V01` | ₹7,499 + Govt. Fees | Primary: ₹7,499; Tier 2: ₹11,999 (Startup Growth Bundle) | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 8 | `V01-SVC-008` | [Section 8 Company Registration](/services/section-8-registration.html) | `V01` | ₹11,999 + Govt. Fees | ₹11,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 9 | `V01-SVC-009` | [Society Registration](/services/society-registration.html) | `V01` | ₹9,999 + Govt. Fees | ₹9,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 10 | `V01-SVC-010` | [Charitable Trust Registration](/services/trust-registration.html) | `V01` | ₹8,999 + Stamp Duty | ₹8,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 11 | `V02-SVC-001` | [Form AOC-4 XBRL Conversion](/services/aoc4-xbrl.html) | `V02` | ₹7,999 + Govt. Fees | ₹7,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 12 | `V02-SVC-002` | [DIR-3 KYC Annual Filing](/services/dir3-kyc.html) | `V02` | ₹999 per DIN | ₹999 | `PER_FILING` | ₹5,000 (STATUTORY_LATE_FILING_FEE) | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 13 | `V02-SVC-003` | [Form ADT-1 Auditor Appointment](/services/form-adt1.html) | `V02` | ₹1,499 + Govt. Fees | ₹1,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 14 | `V02-SVC-004` | [Form AOC-4 Financial Statements](/services/form-aoc4.html) | `V02` | ₹3,499 + Govt. Fees | ₹3,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 15 | `V02-SVC-005` | [Form BEN-2 Significant Beneficial Ownership](/services/form-ben2.html) | `V02` | ₹4,999 + Govt. Fees | ₹4,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 16 | `V02-SVC-006` | [Form DPT-3 Return of Deposits](/services/form-dpt3.html) | `V02` | ₹2,499 + Govt. Fees | ₹2,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 17 | `V02-SVC-007` | [Form MGT-14 Filing Service](/services/form-mgt14.html) | `V02` | ₹1,999 + Govt. Fees | Primary: ₹1,999; Tier 2: ₹4,999 (Venture Resolution Package) | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 18 | `V02-SVC-008` | [Form MGT-7 Annual Return](/services/form-mgt7.html) | `V02` | ₹3,999 + Govt. Fees | ₹3,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 19 | `V02-SVC-009` | [Form MR-1 Appointment of MD/WTD](/services/form-mr1.html) | `V02` | ₹2,499 + Govt. Fees | ₹2,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 20 | `V02-SVC-010` | [Form MSME-1 Half-Yearly Return](/services/form-msme1.html) | `V02` | ₹1,999 per filing | ₹1,999 | `PER_FILING` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 21 | `V02-SVC-011` | [Form MSC-1 Dormant Company Status](/services/form-msc1-dormant.html) | `V02` | ₹7,999 + Govt. Fees | ₹7,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 22 | `V02-SVC-012` | [Form PAS-6 Share Capital Reconciliation](/services/form-pas6.html) | `V02` | ₹3,999 per half-year | ₹3,999 | `PER_FILING` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 23 | `V02-SVC-013` | [Form STK-2 Fast-Track Strike-Off](/services/form-stk2-strike-off.html) | `V02` | ₹8,999 + Govt. Fees | ₹8,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 24 | `V02-SVC-014` | [LLP Annual Filings (Form 11 & 8)](/services/llp-compliance-forms.html) | `V02` | ₹4,999 / year | ₹4,999 | `ANNUAL` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 25 | `V02-SVC-015` | [LLP Form 24 Fast-Track Strike-Off](/services/llp-form24-strike-off.html) | `V02` | ₹6,999 + Govt. Fees | ₹6,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 26 | `V02-SVC-016` | [Form MBP-1 & DIR-8 Disclosures](/services/mbp1-dir8.html) | `V02` | ₹1,499 All Inclusive | ₹1,499 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 27 | `V02-SVC-017` | [RoC Annual Compliance Retainer](/services/roc-annual-compliance.html) | `V02` | ₹14,999 / year | Primary: ₹14,999; Tier 2: ₹29,999 (Enterprise Retainer) | `ANNUAL` | ₹10 Lakhs (AUTHORIZED_CAPITAL_CAP) | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 28 | `V02-SVC-018` | [Registrar of Firms (RoF) Amendments](/services/rof-maintenance.html) | `V02` | ₹3,499 + Govt. Fees | ₹3,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 29 | `V03-SVC-001` | [Form 10B / 10BB Audit Report](/services/form-10b.html) | `V03` | ₹7,999 All Inclusive | ₹7,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 30 | `V03-SVC-002` | [Form 3CEB Transfer Pricing Report](/services/form-3ceb.html) | `V03` | ₹19,999 + Govt. Fees | ₹19,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 31 | `V03-SVC-003` | [GST Annual Return (GSTR-9 & 9C)](/services/gst-annual.html) | `V03` | ₹12,999 + Govt. Fees | ₹12,999 | `STARTING_FROM` | ₹5 Crores (TURNOVER_THRESHOLD) | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 32 | `V03-SVC-004` | [ITR-7 Filing for Companies/Trusts](/services/itr7.html) | `V03` | ₹8,999 All Inclusive | ₹8,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 33 | `V03-SVC-005` | [Proprietorship & SME Income Tax](/services/proprietorship-tax.html) | `V03` | ₹3,499 All Inclusive | ₹3,499 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 34 | `V04-SVC-001` | [PF / ESIC Registration & Filings](/services/pf-esic-compliance.html) | `V04` | ₹5,999 + Govt. Fees | ₹5,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 35 | `V05-SVC-001` | [Founder Pacts, SHA & SPA](/services/founder-shareholder-agreements.html) | `V05` | ₹14,999 All Inclusive | ₹14,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 36 | `V05-SVC-002` | [Master Service Agreements (MSA)](/services/master-service-agreements.html) | `V05` | ₹9,999 All Inclusive | ₹9,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 37 | `V06-SVC-001` | [IP Enforcement & Cease and Desist](/services/ip-enforcement-cease-desist.html) | `V06` | ₹5,999 All Inclusive | ₹5,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 38 | `V06-SVC-002` | [Software Copyright & Tech Patent](/services/software-copyright-patents.html) | `V06` | ₹6,999 + Govt. Fees | ₹6,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 39 | `V06-SVC-003` | [Brand Trademark Registration (TM-A)](/services/trademark-registration.html) | `V06` | ₹4,499 + Govt. Fees | ₹4,499 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 40 | `V07-SVC-001` | [Labour Code Healthcheck & Handbooks](/services/labour-code-handbooks.html) | `V07` | ₹14,999 All Inclusive | ₹14,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 41 | `V07-SVC-002` | [Mandatory POSH Act Compliance](/services/posh-compliance.html) | `V07` | ₹11,999 All Inclusive | ₹11,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 42 | `V09-SVC-001` | [Fast-Track Mergers (Section 233)](/services/fast-track-mergers.html) | `V09` | ₹29,999 + Govt. Fees | ₹29,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 43 | `V09-SVC-002` | [Slump Sale & Asset Purchase](/services/slump-sale-asset-purchase.html) | `V09` | ₹24,999 All Inclusive | ₹24,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 44 | `V09-SVC-003` | [NCLT Merger Petition Execution](/services/nclt-merger-petitions.html) | `V09` | Custom Retainer on Assessment | None (Custom Quote) | `CUSTOM_QUOTE` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 45 | `V11-SVC-001` | [Secretarial Health Check & Advisory](/services/board-governance-risk-assessment.html) | `V11` | ₹12,999 All Inclusive | ₹12,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 46 | `V11-SVC-002` | [Annual Board Minutes Retainer](/services/board-minutes.html) | `V11` | ₹6,999 / year | ₹6,999 | `ANNUAL` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 47 | `V11-SVC-003` | [Form CSR-2 Report on CSR](/services/form-csr2.html) | `V11` | ₹4,999 + Govt. Fees | ₹4,999 | `STARTING_FROM` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 48 | `V11-SVC-004` | [Form MR-3 Secretarial Audit](/services/form-mr3-secretarial-audit.html) | `V11` | ₹19,999 / year | ₹19,999 | `ANNUAL` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 49 | `V12-SVC-001` | [Cyber Incident Reporting & VAPT](/services/cyber-incident-reporting.html) | `V12` | ₹14,999 All Inclusive | ₹14,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 50 | `V12-SVC-002` | [DPDP Compliance Audit](/services/dpdp-compliance-audit.html) | `V12` | ₹16,999 All Inclusive | ₹16,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 51 | `V12-SVC-003` | [SaaS Terms of Service & EULAs](/services/saas-terms-privacy-architecture.html) | `V12` | ₹12,999 All Inclusive | ₹12,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 52 | `V13-SVC-001` | [Cross-Border Tech Transfer](/services/cross-border-tech-transfer.html) | `V13` | ₹18,999 All Inclusive | ₹18,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 53 | `V13-SVC-002` | [Form FC-3 / FC-4 Foreign Branch Return](/services/form-fc3-fc4.html) | `V13` | ₹19,999 / year | ₹19,999 | `ANNUAL` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |
| 54 | `V13-SVC-003` | [RBI FLA Return Annual Filing](/services/rbi-fla-return.html) | `V13` | ₹4,999 All Inclusive | ₹4,999 | `FIXED` | — | `UNCONFIRMED` | `UNVERIFIED` | `PENDING_COMMERCIAL_APPROVAL` |

---

## 5. Pricing Evidence & Approval Workflow

### 5.1 Dual-Evidence Hierarchy
To protect consumer transparency and maintain compliance with commercial regulations:
1. **Commercial Professional Fees Require Internal Executive Approval:** Official ministry or government websites (e.g. `mca.gov.in`, `incometax.gov.in`) provide statutory fee schedules, but **cannot substantiate CraftEgon's commercial retainers or professional fees**. All commercial rates require an executed resolution by the CraftEgon Partner Pricing Committee (`SRC-INT-PRC-001` serves as an internal evidence reference, not as verified approval).
2. **Statutory Government Charges Require Primary Official Citations:** Government filing fees, challans, and state stamp duties must be verified against official notifications, gazette schedules, or statutory portals (e.g. `SRC-MCA-001`, `SRC-CBIC-001`, `SRC-STATE-MH-STAMP-1958`).

### 5.2 Verification & Approval States
The pricing schema defines a rigorous state-machine:
- **`UNVERIFIED` / `WEBSITE_OBSERVED_HISTORICAL`:** The price was scraped or observed on the website, but has not received partner commercial approval. (Currently applied to **100% of the 54 records**).
- **`INTERNAL_RECORD_IDENTIFIED`:** An internal partner fee proposal or rate card exists, but formal sign-off is pending.
- **`SUPPORTING_EVIDENCE_PENDING`:** Commercial costing and statutory fee components are compiled, awaiting committee review.
- **`VERIFIED_AGAINST_EVIDENCE`:** Professional fee confirmed against an approved partner resolution, and government charges verified against current gazette fee tables.
- **`APPROVED_FOR_PUBLICATION`:** Formal sign-off granted by the Managing Partner and Compliance Desk for live client-facing display.

### 5.3 Missing, Conflicting, Outdated, and Unverified Amounts Analysis

1. **Explicit Pricing Gaps (Missing Amounts):**
   - **`V09-SVC-003` (NCLT Merger Petitions):** Page `/services/nclt-merger-petitions.html` does not publish a numeric rupee figure, displaying "Custom Retainer on Assessment". The record correctly reflects `amount: null` and `pricing_basis: "CUSTOM_QUOTE"`. No estimated or placeholder amount was fabricated.
2. **Conflicting & Multi-Tier Pricing Structures:**
   - **`V01-SVC-007` (Pvt Ltd Company Registration):** Displays ₹7,499 (Standard SPICe+) and ₹11,999 (Startup Growth Bundle). Reconciled in data layer via `additional_tiers`.
   - **`V02-SVC-007` (Form MGT-14 RoC Filing):** Displays ₹1,999 (Standard Filing) and ₹4,999 (Venture Resolution Package). Reconciled in data layer via `additional_tiers`.
   - **`V02-SVC-017` (RoC Annual Compliance Retainer):** Displays ₹14,999/yr (Standard Startup Retainer for entities up to ₹10L capital) and ₹29,999/yr (Enterprise Retainer). Reconciled in data layer via `additional_tiers`.
3. **Ambiguous and Potentially Outdated Wording:**
   - **"All Inclusive" Wording:** 18 service cards describe pricing as "All Inclusive" (e.g. ₹999 for MSME Udyam, ₹2,999 for Sole Proprietorship, ₹14,999 for Founder Pacts). None of these cards state whether GST is included or excluded, creating ambiguity. Preserved verbatim, tax inclusion marked `UNCONFIRMED`, and zero GST rates assumed.
   - **"Starting From" Disclaimers:** 27 service cards use "+ Govt. Fees" or "+ Stamp Duty", but do not specify standard MCA challan ranges or state stamp duty schedules.
4. **100% Unverified Commercial Baseline:**
   - None of the 56 captured website amounts have documented time studies, partner hourly billing rates, or signed executive management resolutions.
   - All 54 records remain strictly `UNVERIFIED` and `PENDING_COMMERCIAL_APPROVAL`.

### 5.4 Evidence Sources Actually Inspected

During this audit, the following local and official sources were inspected:
1. **Local Disk Service Pages (57 HTML files in `services/`):** Verbatim extraction of pricing cards, headline rupee figures, inclusions, exclusions, and statutory footnotes.
2. **`data/sources.json` & Internal Register:** Inspected `SRC-INT-PRC-001` (Internal Website Baseline Rate Card, 2026-10-17). Treated strictly as an internal inventory reference, not as proof of commercial or legal accuracy.
3. **Official Ministry & Statutory Schedules Inspected for Category Separation:**
   - **Ministry of Corporate Affairs (MCA):** Companies (Registration Offices and Fees) Rules, 2014 & Rule 12A (DIR-3 KYC ₹5,000 late fee under `SRC-MCA-001`).
   - **Central Board of Indirect Taxes and Customs (CBIC):** CGST Act, 2017 Sections 35(5) and 44 read with Rule 80(3) (GSTR-9C ₹5 Crores turnover threshold under `SRC-CBIC-001`).
   - **State Stamp Acts:** Delhi Stamp Act / Schedule 1A and Maharashtra Stamp Act, 1958 Schedule 1 Articles 10 & 47 (MoA/AoA stamp duties).

### 5.5 Professional Fees Requiring Internal Commercial Approval

All 54 active CCS service records require formal commercial review and sign-off by the CraftEgon Partner Pricing Committee before any price can transition to `COMMERCIALLY_APPROVED`:
- **Entity Setup Verticals (V01, 10 services):** Starting rates from ₹999 to ₹11,999 require cost-allocation validation against professional hours spent on SPICe+ drafting, name reservations, and DSC issuance.
- **Corporate Secretarial Filings (V02, 18 services):** Event-based fees (₹1,499 to ₹8,999) and retainers (₹4,999 to ₹29,999) require partner confirmation of included board resolutions and PCS certification costs.
- **Taxation, Legal Drafting & Advisory (V03–V13, 26 services):** Complex engagements (Form 3CEB ₹19,999, Section 233 Mergers ₹29,999, DPDP Audits ₹16,999, NCLT custom quotes) require documented engagement letters and rate sheets.

### 5.6 Statutory Charges Requiring Official-Source Verification

Statutory government fees and stamp charges that must be verified against current official gazette notifications before client-facing quote generation:
1. **MCA Portal Filing Fees:** SPICe+ Part A & B fees (free for authorized capital up to ₹15 Lakhs under SPICe+ fee exemption, but stamp duty applies).
2. **State Stamp Duties on MoA & AoA:** State-specific stamp schedules (e.g., Delhi, Maharashtra, Karnataka, Telangana) which vary based on authorized capital.
3. **Trademark Statutory Fees (Form TM-A):** Official trademark registry fees (₹4,500 for Individual/Startup/SME vs ₹9,000 for other legal entities).
4. **Statutory Penalties:** Form DIR-3 KYC delayed filing fee (₹5,000 flat under Rule 12A).
5. **Turnover & Capital Thresholds:** Mandatory audit / reconciliation triggers under Income Tax Act Section 44AB, CGST Act Section 44, and Companies Act rules.

---

## 6. Test Suite Extension & Synchronous Verification Results

The validator script [`scripts/validate-phase-2-registry.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/validate-phase-2-registry.js) was executed to verify structural integrity, schema compliance, and referential consistency.

### 6.1 Validation Summary
- `node scripts/validate-phase-2-registry.js`: **65 passed assertions, 0 failed (Exit code 0)**.
- `npm test`: **119 total assertions passed, 0 failed (Exit code 0)** (incorporating 54 checks from `scripts/test-phase-1-remediation.js` and 65 assertions from `scripts/validate-phase-2-registry.js`).

### 6.2 Key Assertions Enforced
1. **Suite 6 — Pricing Inventory Reconciliation:** Asserts that `pricing.json` accounts for all 54 active services, captures 56 website numeric prices across 50 single-tier and 3 dual-tier services, records exactly 1 custom quote gap, and ensures 0 pricing records exist for referral routes.
2. **Suite 6 — Statutory vs Commercial Threshold Separation:** Asserts that the statutory turnover threshold (`₹5 Crores` in `V03-SVC-003`), commercial package cap (`₹10 Lakhs` in `V02-SVC-017`), and statutory late penalty (`₹5,000` in `V02-SVC-002`) are cleanly separated into dedicated schema arrays and not conflated with service fees.
3. **Suite 6 — "All Inclusive" Tax Inclusion Verification:** Asserts that all 18 cards displaying "All Inclusive" preserve exact website wording, have `tax_inclusion_status: "UNCONFIRMED"`, and carry zero assumed 18% GST disclaimers in `excluded_charges`.
4. **Suite 7 (Neg D20) — Threshold Conflation Guard:** Deliberately sets `V03-SVC-003` amount to ₹50,000,000 (5 Crores) and verifies validator failure.
5. **Suite 7 (Neg D21) — Referral Route Contamination Guard:** Deliberately injects a commercial pricing record for a referral route and verifies validator failure.
6. **Suite 7 (Neg D22) — Active Service Completeness Guard:** Deliberately omits an active service pricing record and verifies validator failure.
7. **Suite 7 (Neg D23) — Unverified Commercial Approval Guard:** Deliberately marks an unverified price as `COMMERCIALLY_APPROVED` without verified status and verifies validator failure.

---

## 7. Working-Tree Status & Changed Files

Execution of `git status --short` in the local repository:

```text
 M data/pricing.json
 M data/schemas/pricing.schema.json
 M package-lock.json
 M package.json
 M review-output/phase-1-foundations/phase-1-service-ownership-review.md
 M review-output/phase-2-data-layer/phase-2-task-4-pricing-audit-report.md
 M scripts/validate-phase-2-registry.js
?? data/
?? review-output/phase-2-data-layer/
?? review-output/phase-2-service-registry/
?? scratch/
```

### Detailed Summary of Files Modified / Created
- [`data/pricing.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/pricing.json): Updated all 54 active service records with verbatim displayed prices, tier packages, commercial package caps (`commercial_package_caps`), unconfirmed tax statuses (`tax_inclusion_status: "UNCONFIRMED"`), zero assumed GST rates, and unverified commercial baselines.
- [`data/schemas/pricing.schema.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/schemas/pricing.schema.json): Updated JSON Schema Draft 2020-12 to support `tax_inclusion_status`, `commercial_package_caps`, multi-tier packages, statutory thresholds/penalties, and evidence states.
- [`scripts/validate-phase-2-registry.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/validate-phase-2-registry.js): Extended validator with 65 passed assertions total, enforcing pricing completeness, threshold vs cap separation, "All Inclusive" unconfirmed tax verification, and negative corruption guards D20–D23.
- [`review-output/phase-2-data-layer/phase-2-task-4-pricing-audit-report.md`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/review-output/phase-2-data-layer/phase-2-task-4-pricing-audit-report.md): Created comprehensive pricing inventory and evidence audit report.

---

## 8. Boundaries Confirmation & Task 4 Disposition

### 8.1 Boundaries Adherence
- **Local-Only:** Zero git commits, zero git pushes, zero production deployments, zero Cloudflare modifications.
- **Production HTML Integrity:** Exactly 0 modifications to production HTML files in `services/`.
- **Approved Architecture Preserved:** 54 active service IDs, 3 referral-only routes (57 total routes), and 15 practice verticals preserved without alteration.
- **Zero Fabricated Approvals:** Zero prices are marked `VERIFIED` or commercially approved.

### 8.2 Task 4 Closeout Recommendation
> **Phase 2 Task 4 Closeout Recommendation: Accepted with Documented Gaps.**  
> *(The pricing inventory is complete, mathematically reconciled, and structurally validated with 119/119 passing project assertions. All 54 pricing records remain strictly `UNVERIFIED` with `commercial_approval_state: "PENDING_COMMERCIAL_APPROVAL"` pending formal partner committee resolution).*

**Task 4 is complete. Awaiting user review before proceeding to Task 5.**
