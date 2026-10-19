# CraftEgon CCS — Phase 6: JSON Schemas & Regulatory Accuracy Verification Report

## Executive Summary
This report presents the complete audit results for data schema validation and statutory regulatory accuracy across the CraftEgon CCS codebase. All core datasets adhere strictly to JSON Schema Draft 2020-12 specifications. All legal citations, penalty rates, thresholds, and judicial boundaries match current Indian statutes (Companies Act 2013, Income Tax Act 1961, CGST Act 2017, EPF & MP Act 1952, FEMA 1999, CERT-In Directions 2022).

---

## 1. Schema Compliance (Ajv Draft 2020-12)

- **Test Suite Runner**: `scripts/test-phase-6-schemas.js`
- **Total Schema Tests**: 9
- **Passed**: 9 (100%)
- **Validation Engine**: Ajv v8.20.0 with `ajv-formats`

### Dataset Verification Results

| Dataset | Schema File | Total Records | Validation Status | Notes |
|---|---|---|---|---|
| `data/verticals.json` | `data/schemas/verticals.schema.json` | 6 Verticals | VALID | Validates identifiers, slugs, metadata, and service references |
| `data/sources.json` | `data/schemas/sources.schema.json` | 6 Authorities | VALID | Validates authority names, official URLs, gazette references |
| `data/service-registry.json` | `data/schemas/service-registry.schema.json` | 57 Services | VALID | 54 `ACTIVE_SERVICE` + 3 `REFERRAL_ONLY` records |
| `data/pricing.json` | `data/schemas/pricing.schema.json` | 57 Pricing Rules | VALID | Government statutory fees vs. professional retainers separated |
| `data/eligibility.json` | `data/schemas/eligibility.schema.json` | 57 Rulesets | VALID | Required documents, conditions precedent, MCA eligibility criteria |
| `data/jurisdiction-variations.json`| `data/schemas/jurisdiction-variations.schema.json`| 36 Variations | VALID | Stamp duty rates, state tax rules, ROC local jurisdictions |
| `data/regulatory-claims.json` | `data/schemas/regulatory-claims.schema.json` | 20 Claims | VALID | Rejected claims audited with rationale and statutory basis |

---

## 2. JSON-LD Structured Data Audit

- **Pages Audited**: 113 HTML documents
- **JSON-LD Blocks Verified**: 111 blocks
- **Schema.org Types Validated**:
  - `Organization`, `WebSite`, `LegalService`, `ProfessionalService`
  - `Service`, `BreadcrumbList`, `FAQPage`, `Article`, `WebPage`
- **Syntax & Schema Validity**: 100% Valid JSON. Zero unclosed brackets, zero duplicate keys.
- **Canonical Consistency**: All `@id` and `url` properties strictly use `https://ccs.craftegon.com/...` with zero insecure or staging hosts.

---

## 3. Statutory Regulatory Accuracy Audit

- **Test Suite Runner**: `scripts/test-phase-6-regulatory-accuracy.js`
- **Total Accuracy Tests**: 12
- **Passed**: 12 (100%)

### 3.1 Service Boundaries & Referral Integrity
- **Active Services**: Exactly 54 active compliance and governance services.
- **Referral-Only Services**: Exactly 3 services strictly gated for judicial dispute forums:
  1. `/services/nclt-insolvency-defense.html` (NCLT / IBC 2016)
  2. `/services/director-removal-board-disputes.html` (Sections 169 & 241 Companies Act 2013)
  3. `/services/oppression-mismanagement-petitions.html` (Section 241/242 Companies Act 2013)
- **Judicial Boundary**: Enforces explicit Advocates Act 1961 disclaimers; routes users to empanelled practicing advocates rather than offering corporate secretarial automation.

### 3.2 Statutory Penalties, Fees & Interest Grounding

| Statute / Section | Regulatory Parameter | Verified Statutory Value | Source Provenance |
|---|---|---|---|
| **Companies Act 2013, Section 403** | Additional late filing fee for MCA forms (AOC-4, MGT-7) | **₹100 per day** of delay | Companies (Registration Offices and Fees) Rules, 2014 |
| **Income Tax Act 1961, Section 234F** | Late filing fee for Income Tax Returns (ITR) | Capped at **₹5,000** (₹1,000 if income <= ₹5L) | Finance Act Amendment (CBDT) |
| **CGST Act 2017, Section 50(1)** | Interest on delayed payment of GST on net cash liability | **18% per annum** | CBIC Notification No. 13/2017-CT |
| **EPF & MP Act 1952, Section 6** | Statutory EPF employee & employer basic contribution rate | **12% of basic + DA** | EPFO Statutory Notification |
| **IT Act 2000 / CERT-In Directions 2022** | Mandatory cyber incident reporting window | Within **6 hours** of noticing | CERT-In Cyber Security Directions (April 2022) |

### 3.3 Statutory Thresholds & Deadlines

| Obligation | Statute / Regulation | Statutory Threshold / Due Date | Status |
|---|---|---|---|
| **Tax Audit** | Section 44AB, Income Tax Act 1961 | **₹1 Crore** (₹10 Crores if 95%+ transactions are digital/banking) | VERIFIED |
| **Extraordinary General Meeting (EGM)** | Section 101, Companies Act 2013 | **21 clear days' notice** (shorter notice requires 95% consent) | VERIFIED |
| **Annual Return on Foreign Liabilities (FLA)** | FEMA 1999 / RBI Regulation | Due by **15th July** each fiscal year via FLAIR portal | VERIFIED |

### 3.4 Regulatory Claim Gating
- 20 statutory claims audited against primary gazette notifications.
- 100% of rejected marketing assertions ("guaranteed 24-hour company registration", "zero audit requirement for startups without condition") recorded in `data/regulatory-claims.json` with explicit prohibition.
