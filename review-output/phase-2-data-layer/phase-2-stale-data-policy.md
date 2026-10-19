# CraftEgon CCS — Phase 2: Stale-Data and Source Freshness Policy

**Document ID**: `CRAFTEGON-DOC-P2-STALE-001`  
**Milestone**: Phase 2, Workstream E & Workstream H: Stale-Data Validation & Freshness Policy  
**Classification**: Data Governance, Regulatory Freshness & Information Quality Policy  
**Governing Body**: CraftEgon Corporate Compliance Services (CraftEgon LLP)  
**Effective Date**: 2026-10-19  
**Review Cadence**: Semi-Annual  
**Status**: ACTIVE & AUTOMATED (100% Deterministic In-Tree Enforcement)  

---

## 1. Objective and Scope

In corporate legal compliance, regulatory data (statutory filing deadlines, penalty structures, stamp duty rates, and government portal guidelines) changes frequently via gazette notifications, circulars, and annual Finance Acts. Relying on stale or obsolete regulatory data creates severe legal liability, regulatory sanctions, and customer financial damage.

This **Stale-Data and Source Freshness Policy** defines the mandatory freshness thresholds, validation rules, timestamp standards, and automated gating mechanisms across all seven canonical datasets in `craftegon-ccs`.

---

## 2. Category Freshness Thresholds

Every source in `data/sources.json` and every claim in `data/regulatory-claims.json` is categorized with an explicit freshness threshold:

| Category Code | Source / Claim Category | Maximum Validity Threshold | Review Cadence | Rationale |
|---|---|---:|---|---|
| `CAT-STAT-ACT` | Primary Statutory Acts & Central Rules | **365 Calendar Days** (1 Year) | Annual (post-Union Budget & MCA amendments) | Primary legislation remains relatively stable but requires annual reconciliation with the Finance Act and Companies Amendment Acts. |
| `CAT-REG-CIRC` | Ministry Notifications, Circulars & Orders | **90 Calendar Days** (1 Quarter) | Quarterly | Ministry of Corporate Affairs, CBDT, CBIC, and DPIIT frequently issue ad-hoc clarification circulars and filing deadline extensions. |
| `CAT-COMM-FEE` | Statutory Filing Fees & Commercial Pricing | **180 Calendar Days** (6 Months) | Semi-Annual | Government fee schedules (MCA CRC fees, state stamp duty) and CraftEgon commercial charges must be re-validated bi-annually. |
| `CAT-PROC-GUID` | Procedural Guidelines & Portal Operations | **180 Calendar Days** (6 Months) | Semi-Annual | Online portals (MCA21 V3, IP India Gateway, GSTN portal) frequently alter technical validation rules, browser requirements, and DSC utilities. |

---

## 3. Timestamp Formatting Standards

To ensure deterministic machine-readability across schemas and test runners:
1. **Standard Format**: All date fields (`publication_date`, `accessed_date`, `checked_date`, `last_verified_at`, `next_review_at`, `effective_from`, `effective_to`) must strictly conform to:
   - Date only: `YYYY-MM-DD` (ISO-8601 calendar date)
   - Date-time: `YYYY-MM-DDTHH:mm:ssZ` (ISO-8601 UTC timestamp)
2. **Strict Pattern Validation**: Enforced via regex `^\d{4}-\d{2}-\d{2}$` and Ajv Draft 2020-12 `date` / `date-time` format constraints.
3. **No Relative Timestamps**: Strings such as "recently", "last week", "current as of now", or "updated today" are strictly banned from datasets.

---

## 4. Deterministic Freshness Validation Rules

The test harness in `scripts/validate-phase-2-registry.js` enforces four deterministic staleness checks:

### Rule 1: Rejection of Future Timestamps
Any timestamp where `checked_date > CURRENT_EXECUTION_DATE` or `last_verified_at > CURRENT_EXECUTION_DATE` immediately triggers a fatal validation error. Verification cannot occur in the future.

### Rule 2: Rejection of Missing Timestamps on Verified Records
If a record carries `verification_status: "VERIFIED"` but has a `null`, missing, or unparseable `last_verified_at` or `checked_date`, validation immediately fails. Every verified fact must have an empirical verification date.

### Rule 3: Rejection of Inverted Validity Periods
Any record defining `effective_from` and `effective_to` must satisfy `effective_to >= effective_from`. If `effective_to < effective_from`, the dataset is rejected.

### Rule 4: Automatic Transition to Stale Status
If the time elapsed between `CURRENT_DATE` and `last_verified_at` exceeds the threshold defined for its category:
- The record's effective verification status automatically downgrades to `STALE`.
- The status-gating engine automatically revokes `client_facing_approved` (evaluating to `false`).
- The record is flagged in the automated validation report with its age in days and its required review date.

---

## 5. Current Dataset Staleness Audit

Direct inspection of `data/sources.json` and `data/regulatory-claims.json` confirms:
1. **Sources (33 records)**:
   - All 33 sources carry valid ISO-8601 `accessed_date` and `last_verified_at` timestamps (baseline: October 2026).
   - All 33 sources have scheduled `next_review_at` dates within 90 to 365 days of their verification.
   - Zero future dates detected.
   - Zero expired/stale records currently exist.
2. **Regulatory Claims (35 records)**:
   - Exactly 13 statutory claims citing official gazette sources carry verified `checked_date` timestamps (`2026-10-17`).
   - The remaining 22 internal/rejected claims retain explicit `null` checked dates, correctly reflecting that they have not been verified against a live statutory gazette.
   - Zero claims are falsely marked verified.

---

## 6. Re-Verification and Maintenance Workflow

When a source or claim approaches its `next_review_at` date:
1. **Automated Warning**: The validator flags records within 14 days of expiration during `npm run test:registry`.
2. **Research Execution**: The compliance research analyst inspects the primary government portal (MCA, IP India, Gazette of India, GST Council).
3. **Evidence Logging**: The analyst updates `accessed_date`, `last_verified_at`, and `next_review_at`, providing the updated gazette circular reference.
4. **Automated Verification**: The test suite runs and confirms the updated record meets all schema and referential integrity constraints.
