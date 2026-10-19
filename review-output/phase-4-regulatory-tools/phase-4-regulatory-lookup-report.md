# CraftEgon CCS — Phase 4 Regulatory Lookup Report

**Document Reference:** CRAFTEGON-DOC-P4-005  
**Audit Date:** 2026-10-20  
**Status:** REGULATORY LOOKUP IMPLEMENTATION REPORT  
**Module:** `src/backend/regulatory/adapters/` & `regulatory-service.js`  

---

## 1. Executive Summary

Phase 4 establishes an integrated, source-aware regulatory lookup architecture. Rather than treating lookup as a generic full-text search engine or delegating legal interpretation to ungrounded LLMs, CraftEgon CCS implements dedicated statutory source adapters for each primary authority:

1. **`McaSourceAdapter` (Ministry of Corporate Affairs):** Companies Act, 2013 and LLP Act, 2008 statutory filing schedules and fee rules under Section 403.
2. **`RbiFemaSourceAdapter` (Reserve Bank of India):** Cross-border capital reporting rules, FLAIR annual reporting timelines, and FC-GPR/FC-TRS filing windows under FEMA, 1999.
3. **`TaxSourceAdapter` (CBDT & CBIC):** Income-tax Act, 1961 corporate return schedules (ITR-6, Form 3CD, TDS) and Central Goods and Services Tax Act, 2017 monthly/annual return timelines (GSTR-1, GSTR-3B).
4. **`IpIndiaSourceAdapter` (CGPDTM):** Trademark classification, verified clearance benchmarks, and transparent manual lookup guidance.

---

## 2. Source-Adapter Contract and Standard Interface

All adapters extend `BaseSourceAdapter` (`src/backend/regulatory/adapters/base-adapter.js`) and enforce:
- **Canonical Provenance:** Every response includes `source_id`, `source_name`, `issuing_authority`, `jurisdiction`, `official_url`, `document_reference`, and `retrieval_mode`.
- **Retrieval Modes:**
  - `LIVE`: Live programmatic API querying (when authorized and available).
  - `CACHED`: Statutorily verified local rulebook refreshed against official gazettes.
  - `MANUAL`: Interactive portal lookup mandatory due to portal anti-bot/CAPTCHA restrictions.
- **Circuit Breaker & Health Reporting:** Each adapter exposes `checkHealth()`, reporting `HEALTHY`, `DEGRADED`, or `UNAVAILABLE`.
- **Bounded Latency:** Default 5,000ms timeout prevents connection hanging.

---

## 3. Lookup Behavior and State Distinctions

The lookup coordinator (`RegulatoryService.executeLookup`) cleanly distinguishes between six critical query states:

| Query State | System Behavior | User Representation |
|---|---|---|
| **Matching Statutory Rules Found** | Returns structured array of statutory forms, sections, due timelines, and late fee formulas. | Clear, authoritative filing table with official citations and links. |
| **No Matches for Specific Query** | Distinguishes query with zero matches from absent obligation. | Displays: "Zero matching statutory filings for query criteria. Note: An empty query result does not prove that no compliance obligation exists." |
| **Partial Coverage Across Sources** | Queries multiple domain adapters; aggregates available results and reports missing domains. | Displays found results with explicit warning badge for un-queried or unavailable domains. |
| **Source Unavailable / Degraded** | Circuit breaker trips; falls back to cached baseline with warning. | Displays: "Source portal currently unavailable. Displaying verified canonical baseline as of [Timestamp]." |
| **Manual Lookup Required** | Direct scraping blocked by government portal access controls. | Displays: "Manual Registry Search Required" with direct portal link and instructions. |
| **Stale Verification State** | `last_verified_at` exceeds domain threshold (e.g., > 48h for dynamic tax dates). | Displays prominent amber alert: "Verification Stale — Source Re-Verification Scheduled." |

---

## 4. Multi-Source Lookup API (`GET /api/v1/regulatory/lookup`)

The endpoint accepts query parameters:
- `domain`: Optional filter (`mca`, `tax`, `fema`).
- `entity_type`: Filter by entity charter (`pvt_ltd`, `public_ltd`, `llp`, `opc`, etc.).
- `form_name`: Filter by specific statutory form (e.g. `AOC-4`, `GSTR-3B`, `FLA`).

### Sample Verified Response:
```json
{
  "success": true,
  "lookup": {
    "timestamp": "2026-10-20T00:35:00.000Z",
    "sources_consulted": [
      {
        "source_id": "SRC-MCA-001",
        "official_url": "https://www.mca.gov.in/",
        "retrieval_mode": "CACHED"
      }
    ],
    "data": {
      "mca": {
        "result_count": 4,
        "is_empty": false,
        "freshness": "CURRENT",
        "data": [
          {
            "form_name": "AOC-4 / AOC-4 XBRL",
            "section": "Section 137, Companies Act 2013",
            "standard_due_timeline": "Within 30 days of AGM (typically 30th October)",
            "official_fee_rule": "Standard statutory fee + ₹100/day late fee under Section 403"
          }
        ]
      }
    }
  }
}
```
