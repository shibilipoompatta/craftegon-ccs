# CraftEgon CCS — Phase 2: Seven Canonical Datasets & JSON Schemas Audit

**Document ID**: `CRAFTEGON-DOC-P2-SCHEMA-001`  
**Milestone**: Phase 2, Workstream B: Complete the Seven Datasets and Schemas  
**Classification**: Structural Data Architecture & Schema Validation Audit  
**Governing Body**: CraftEgon Corporate Compliance Services (CraftEgon LLP)  
**Audit Date**: 2026-10-19  
**Status**: COMPLETE & VALIDATED (100% Schema Conformance Under Draft 2020-12)  

---

## 1. Executive Summary & Schema Framework

This report documents the structural integrity, typing constraints, and validation performance of the **seven canonical JSON datasets** and their matching **seven JSON Schemas** in `craftegon-ccs`.

All schemas are located in `data/schemas/` and are authored strictly according to **JSON Schema Draft 2020-12** specifications:
```json
"$schema": "https://json-schema.org/draft/2020-12/schema"
```

Validation is executed programmatically via `Ajv` (Draft 2020-12 engine with `ajv-formats`) inside `scripts/validate-phase-2-registry.js`. Every schema strictly sets `additionalProperties: false` on object definitions, preventing undocumented properties from infiltrating the data layer.

---

## 2. Dataset-by-Dataset Audit

### 2.1 `data/verticals.json` (`data/schemas/verticals.schema.json`)
- **Record Count**: 15 canonical practice verticals.
- **Key Constraints**:
  - `vertical_id`: Pattern `^V(0[1-9]|1[0-5])$` (strictly V01 to V15).
  - `canonical_name`: Unique human-readable title.
  - `status`: Enum `['ACTIVE_VERTICAL', 'APPROVED_COVERAGE_GAP']`.
  - `coverage_classification`: Enum `['FULL_TRANSACTIONAL_COVERAGE', 'PARTIAL_TRANSACTIONAL_COVERAGE', 'APPROVED_COVERAGE_GAP']`.
  - `active_service_ids`: Array of valid service IDs conforming to `^V(0[1-9]|1[0-5])-SVC-[0-9]{3}$`.
- **Validation Result**: 0 schema errors. All 4 coverage gaps (V08, V10, V14, V15) have empty `active_service_ids` and are marked `APPROVED_COVERAGE_GAP`.

### 2.2 `data/sources.json` (`data/schemas/sources.schema.json`)
- **Record Count**: 33 statutory and regulatory authorities/instruments.
- **Key Constraints**:
  - `source_id`: Pattern `^SRC-[A-Z0-9]+-[0-9]{3,}$`.
  - `official_url`: Valid URI format pointing to government or official gazette endpoints.
  - `reliability_classification`: Enum `['PRIMARY_STATUTORY', 'OFFICIAL_REGULATORY_PORTAL', 'STATUTORY_RULES_GAZETTE']`.
  - `verification_status`: Enum `['SOURCE_VERIFIED', 'SOURCE_IDENTIFIED', 'PENDING_RECHECK']`.
  - Date validations: `accessed_date`, `last_verified_at`, `next_review_at` formatted as ISO-8601 dates.
- **Validation Result**: 0 schema errors. 0 fabricated sources.

### 2.3 `data/service-registry.json` (`data/schemas/service-registry.schema.json`)
- **Record Count**: 57 canonical routes.
- **Key Constraints**:
  - `canonical_route`: Path string starting with `/services/` and ending in `.html`. Unique across all records.
  - `service_id`: Either valid ID pattern `^V(0[1-9]|1[0-5])-SVC-[0-9]{3}$` (for `ACTIVE_SERVICE`) or strictly `null` (for `REFERRAL_ONLY`).
  - `record_status`: Enum `['ACTIVE_SERVICE', 'REFERRAL_ONLY']`.
  - `primary_vertical_id`: Either valid vertical ID (for `ACTIVE_SERVICE`) or strictly `null` (for `REFERRAL_ONLY`).
  - `verification_status`: Enum `['VERIFIED_APPROVED', 'VERIFIED_REFERRAL_ONLY']`.
- **Validation Result**: 0 schema errors. Exactly 54 active IDs and 3 referral-only records.

### 2.4 `data/pricing.json` (`data/schemas/pricing.schema.json`)
- **Record Count**: 54 active service pricing entries (covering 153 package tier records).
- **Key Constraints**:
  - `service_id`: Valid foreign key to active service in `service-registry.json`.
  - `currency`: Fixed enum `['INR']`.
  - `charge_type`: Enum `['PROFESSIONAL_FEE', 'STATUTORY_CHARGE', 'COMBINED_PACKAGE', 'CUSTOM_QUOTE']`.
  - `verification_status`: Fixed enum `['UNVERIFIED', 'SOURCE_IDENTIFIED', 'VERIFIED', 'STALE']`. All current records are `UNVERIFIED`.
  - `commercial_review_status`: Fixed enum `['COMMERCIALLY_UNREVIEWED', 'COMMERCIALLY_APPROVED', 'PENDING_APPROVAL']`. All current records are `COMMERCIALLY_UNREVIEWED`.
  - `client_facing_approved`: Boolean flag. Must be strictly `false` unless verified and approved.
- **Validation Result**: 0 schema errors. 100% of records blocked from client display.

### 2.5 `data/eligibility.json` (`data/schemas/eligibility.schema.json`)
- **Record Count**: 54 active service eligibility entries.
- **Key Constraints**:
  - `service_id`: Valid foreign key to active service in `service-registry.json`.
  - `primary_vertical_id`: Valid foreign key to `verticals.json`.
  - `statutory_prerequisites`: Array of statutory legal prerequisites with associated source IDs.
  - `operational_recommendations`: Array of operational recommendations cleanly separated from legal prerequisites.
  - `verification_status`: Enum `['UNVERIFIED', 'SOURCE_IDENTIFIED', 'VERIFIED', 'NEEDS_PROFESSIONAL_REVIEW']`.
- **Validation Result**: 0 schema errors. 49 source-identified, 5 pending review, 0 falsely marked verified.

### 2.6 `data/jurisdiction-variations.json` (`data/schemas/jurisdiction-variations.schema.json`)
- **Record Count**: 10 state/UT-specific jurisdiction variations.
- **Key Constraints**:
  - `jurisdiction_id`: Pattern `^IN-[A-Z]{2}$` (ISO 3166-2:IN sub-codes, e.g. `IN-MH`, `IN-KA`, `IN-DL`).
  - `applicable_service_id`: Valid foreign key to active service in `service-registry.json`.
  - `variation_type`: Enum `['STAMP_DUTY', 'LOCAL_REGISTRATION', 'PROCEDURAL_DIFFERENCE', 'STATUTORY_FILING_FEE']`.
  - `verification_status`: Enum `['UNREVIEWED', 'SOURCE_IDENTIFIED', 'VERIFIED', 'NEEDS_PROFESSIONAL_REVIEW']`.
- **Validation Result**: 0 schema errors. 8 source-identified, 1 unreviewed, 1 pending review, 0 falsely marked verified.

### 2.7 `data/regulatory-claims.json` (`data/schemas/regulatory-claims.schema.json`)
- **Record Count**: 35 material regulatory claims.
- **Key Constraints**:
  - `claim_id`: Pattern `^CLM-[A-Z0-9]+-[0-9]{3,}$`.
  - `category`: Enum `['STATUTORY_DEADLINE', 'REGULATORY_INTEGRATION', 'APPROVAL_GUARANTEE', 'PROCEDURAL_TIMELINE', 'LEGAL_DETERMINATION']`.
  - `risk_priority`: Enum `['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']`.
  - `disposition`: Enum `['REJECTED_UNSUPPORTED', 'PENDING_PROFESSIONAL_REVIEW', 'SOURCE_IDENTIFIED', 'SOURCE_NEEDED']`.
  - `verification_status`: Fixed enum `['UNVERIFIED', 'SOURCE_IDENTIFIED', 'VERIFIED', 'NEEDS_PROFESSIONAL_REVIEW']`.
  - `client_facing_approved`: Boolean flag. Must be strictly `false` for unverified/rejected claims.
- **Validation Result**: 0 schema errors. Exactly 20 rejected claims, 13 pending professional review, 1 source identified, 1 source needed, 0 verified.

---

## 3. Negative Schema Test Harness Verification

Test Suite 7 of `scripts/validate-phase-2-registry.js` subjects all 7 schemas to deliberately corrupted mock objects, confirming:
- Additional unknown properties are rejected (`additionalProperties: false`).
- Malformed dates (e.g. `2026/13/45`) fail validation.
- Reversed validity periods (`effective_to < effective_from`) fail validation.
- Invalid ID regex formats fail validation.
- Missing required fields throw detailed diagnostic errors.

The schema framework is complete, fully automated, and prevents any unvalidated data from entering the production build.
