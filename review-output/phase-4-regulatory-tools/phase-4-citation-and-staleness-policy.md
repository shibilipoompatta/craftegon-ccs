# CraftEgon CCS — Phase 4 Citation, Freshness & Staleness Policy

**Document Reference:** CRAFTEGON-DOC-P4-007  
**Audit Date:** 2026-10-20  
**Status:** CITATION & STALENESS GOVERNANCE POLICY  
**Module:** `src/backend/regulatory/provenance-manager.js`  

---

## 1. Citation Requirements & Architecture

Every factual compliance claim, deadline, or filing requirement presented by CraftEgon CCS must be supported by a tamper-evident citation record containing:

1. **`source_id`:** Stable canonical source ID registered in the Phase 4 Source Register (e.g., `SRC-MCA-001`, `SRC-CBDT-001`).
2. **`source_title` & `issuing_authority`:** Official name and responsible government department.
3. **`jurisdiction`:** Scope of applicability (`IN-CENTRAL`, `IN-MH`, `IN-DL`, `IN-KA`).
4. **`official_url`:** Direct HTTP/HTTPS link to official gazette, statute, or portal.
5. **`document_reference`:** Exact statutory Section, Rule, or Notification number (e.g. `Section 137, Companies Act 2013`).
6. **`publication_date` & `effective_date`:** Known statutory dates in ISO `YYYY-MM-DD` format (or `null`).
7. **`retrieval_mode`:** `LIVE`, `CACHED`, `IMPORT`, or `MANUAL`.
8. **`content_fingerprint`:** 64-character SHA-256 hash computed over substantive fields to verify data integrity and prevent tampering.

### Strict Citation Rules
- **No Homepage Prototyping:** A general homepage link (e.g., `https://india.gov.in/`) cannot be used to prove a specific filing obligation or late fee formula.
- **No Fabricated Passages:** Quotations or summaries must reflect actual statutory provisions.
- **Null Safety:** Where a publication date or effective date is not provided by the authority, it must be stored as `null`, never guessed.

---

## 2. Staleness Thresholds and Governance

Different regulatory domains operate on vastly different statutory amendment cycles. CraftEgon CCS rejects a single arbitrary threshold in favor of domain-tailored staleness rules:

| Regulatory Domain | Staleness Threshold | Justification & Rationale | Action Upon Expiry |
|---|---|---|---|
| **Tax Filing Deadlines (CBDT / CBIC)** | **48 Hours** | Return deadlines and extension orders are frequently modified via executive circulars during filing seasons. | Triggers amber warning `STALE`; schedules immediate re-verification. |
| **MCA Filing Rules & Form Specs** | **48 Hours** | Portal technical outages and seasonal filing extensions occur frequently. | Triggers `STALE` status indicator on portal dashboards. |
| **RBI / FEMA Master Directions** | **7 Days** | Foreign exchange circulars and A.P. DIR series are typically issued periodically. | Weekly automated check against RBI notification feeds. |
| **Labour & Social Security (EPFO/ESIC)** | **7 Days** | Wage ceiling changes and notification rules are updated intermittently. | Weekly audit of Shram Suvidha gazette circulars. |
| **Cybersecurity Incident Rules (CERT-In)** | **24 Hours** | Threat intelligence and reporting directives are urgent and critical. | Daily verification against CERT-In advisory feeds. |
| **Parliamentary Statutes & Acts** | **90 Days** | Primary statutory enactments change only through formal legislative amendment acts. | Quarterly review by Corporate Secretary team. |
| **Trademark Clearance Benchmarks** | **24 Hours** | Registered mark statuses are dynamic. | Daily refresh against benchmark dataset. |

### The Golden Rule of Staleness
> **A failed refresh attempt must NEVER reset or update the `last_checked_at` timestamp.**  
> If an external check fails or a portal is down, the existing `last_checked_at` timestamp is preserved, and the record's `freshness_status` transitions to `STALE` or `UNAVAILABLE`.

---

## 3. Substantive Change Detection & Versioning

The `ProvenanceManager.detectChange` engine computes SHA-256 fingerprints across substantive legal fields (`title`, `summary`, `effective_date`, `compliance_due_date`, `applicability_rules`).

When an update occurs:
- **Formatting / Metadata Change:** If the substantive fingerprint matches, version is maintained and recorded as `METADATA_REFRESH`.
- **Substantive Content Change:** If dates, thresholds, or applicability rules change, the system increments `change_version`, computes the new `content_hash`, logs the before/after hashes in `change_history`, and flags `is_substantive: true`.

---

## 4. Query Reproducibility

For regulatory defense, compliance audits, and legal disputes, the system generates immutable query snapshots (`createReproducibilityRecord`).

Each snapshot logs:
- `query_id`: Unique query identifier (`QRY-[HEX]`).
- `query_fingerprint`: Cryptographic SHA-256 hash of parameters, source IDs, rule version, and timestamp.
- Exact sources consulted and rule versions applied.
- Result counts and any partial failure warnings.
