# CraftEgon CCS — Phase 3, Task 7: Verification and Correction Report

**Project:** CraftEgon Corporate Compliance Services (CCS)  
**Document:** Phase 3, Task 7 — Verification & Correction Report  
**Repository:** Local `craftegon-ccs` workspace (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Execution Environment:** Node.js v20.18.0 / Windows (Local audit, testing & reconciliation only)  
**Execution Mode:** Local Verification & Correction Only (0 cloud provisioning, 0 accounts created, 0 payment integrations, 0 production code changes, 0 commits, 0 pushes)  
**Date of Assessment:** October 18, 2026  
**Status:** Verification Completed & Discrepancies Resolved — 100% Tests Passing  

---

## Executive Summary

Phase 3, Task 6 produced an implementation plan validation and staging readiness specification. However, several verification gaps and conflicting historical references remained:
1. **The Test-Count Discrepancy:** Earlier Phase 3 reports recorded 142 passing regression assertions, whereas Task 6 reported 88 assertions.
2. **The Referral-Route Discrepancy:** Prior task prompts and report narratives listed `/services/strike-off-company-closure.html` as an approved referral-only route, whereas the canonical registry and filesystem show company strike-off as an active commercial secretarial service and identify `/services/oppression-mismanagement-petitions.html` as the third canonical referral route.
3. **Route Checking vs. Canonical Identifiers:** The local prototype previously relied solely on string matching against an ad-hoc set of routes rather than querying the canonical registry item's `record_status`.
4. **Risk of Over-Broad Referral Blocking:** Ensuring active transactional services (such as strike-off filings and transactional merger petitions) are not inadvertently blocked by broad keyword or pattern matching.

**Phase 3, Task 7** has definitively resolved all four areas through empirical codebase inspection, mathematical test-suite aggregation analysis, canonical registry cross-referencing, and narrowly scoped code hardening.

---

## 1. Repository State Before and After Task 7

### 1.1 State Before Task 7
- **Tracked Modifications:**
  - `.gitignore`: Added `.env`, `.env.local`, `.env.*`, `!.env.example`.
  - `package.json`: Added ajv and ajv-formats devDependencies; added `test:registry` script; added `validate-phase-2-registry.js` to `npm test`.
  - `package-lock.json`: Dependency tree updated for ajv.
  - `review-output/phase-1-foundations/phase-1-service-ownership-review.md`: V09-SVC-003 line updated to reflect locked approval.
- **Untracked Additions:**
  - `data/`: Phase 2 canonical data layer (7 JSON files, 7 schemas).
  - `review-output/phase-2-data-layer/`: Phase 2 reports.
  - `review-output/phase-2-service-registry/`: Phase 2 CSV registers.
  - `review-output/phase-3/`: Phase 3 Tasks 1 through 6 reports.
  - `scratch/`: Scratch analysis scripts from Phase 2.
  - `scripts/test-lead-intake-prototype.js`: Prototype test suite (30 assertions).
  - `scripts/validate-phase-2-registry.js`: Phase 2 master registry validator (88 assertions).
  - `src/backend/lead-intake-prototype.js`: Local lead intake prototype handler.
  - `.env.example`: Non-sensitive configuration template.

### 1.2 State After Task 7
- **Narrowly Scoped Code Corrections:**
  - Hardened [`src/backend/lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/lead-intake-prototype.js): Indexed the canonical registry by `canonical_route` (`canonicalRoutesCache`) so that route classification directly checks canonical `record_status === 'REFERRAL_ONLY'` rather than relying on unindexed string sets.
  - Expanded [`scripts/test-lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/test-lead-intake-prototype.js): Added dedicated test case verifying that active transactional services with "strike-off" or "merger" terms (`V02-SVC-013`, `V02-SVC-015`, `V09-SVC-003`) are always accepted and not blocked. Assertions increased from 30 to **31 passed (100%)**.
- **Preservation of Baselines:** Phase 1 approved foundations (57 routes, 15 verticals) and Phase 2 canonical datasets (`data/*.json`) remain 100% unaltered. Production HTML, CSS, and frontend JavaScript remain completely untouched.

---

## 2. Explanation of the Test-Count Discrepancy

### 2.1 The Issue
Earlier Phase 3 reports (Task 2, Task 3, Task 4, and Task 5) cited **142 passing regression assertions**, while the Task 6 report cited **88 passing assertions** for `npm test`.

### 2.2 Root Cause Analysis
The discrepancy was caused by **different counting aggregation methods in reporting**, not by removed tests, broken code, or changed test suites.

The `npm test` script in [`package.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/package.json#L7) executes the following sequential chain:
```bash
node scripts/verify-links.js && \
node scripts/check-orphans.js && \
node scripts/audit-seo.js && \
node scripts/test-chat-engine.js && \
node scripts/test-trademark-search.js && \
node scripts/test-phase-1-remediation.js && \
node scripts/validate-phase-2-registry.js && \
node -c assets/js/config.js assets/js/navigation.js assets/js/forms.js assets/js/calculator.js assets/js/chat-widget.js
```

Inspecting the output of each individual test runner reveals:
1. `scripts/test-phase-1-remediation.js` concludes with:
   ```
   ==================================================
   TEST SUMMARY: 54 passed, 0 failed.
   ==================================================
   ```
2. `scripts/validate-phase-2-registry.js` concludes with:
   ```
   ==================================================
   VALIDATION SUMMARY: 88 passed, 0 failed.
   ==================================================
   ```

### 2.3 Mathematical Reconciliation
$$54 \text{ (Phase 1 Remediation Tests)} + 88 \text{ (Phase 2 Master Data Layer Tests)} = \mathbf{142 \text{ Assertions}}$$

- **In Tasks 2 through 5:** The author summed the two explicitly printed test summary totals: $54 + 88 = 142$.
- **In Task 6:** The author cited only the final printed summary from the last test script in the chain (`validate-phase-2-registry.js`: 88 passed), while noting in text that the Phase 1 suites had also passed.
- **Additional Uncounted Checks in `npm test`:**
  - `scripts/verify-links.js`: Checks 113 HTML files (0 broken links).
  - `scripts/check-orphans.js`: Checks 113 HTML files (0 orphan pages).
  - `scripts/audit-seo.js`: Audits 111 content files (100% technical SEO compliance).
  - `scripts/test-chat-engine.js`: Tests 10 user queries and verifies 30 action URLs on disk (40 checks).
  - `scripts/test-trademark-search.js`: 40 automated checks passed (DOM-XSS & claim safety).
  - `node -c assets/js/*.js`: Syntax compilation check on 5 frontend scripts.

**Conclusion:** All tests have continuously run and passed with zero failures. Zero tests were removed. The standard reported assertion count for `npm test` across Phase 1 and Phase 2 suites is **142 formal assertions** (or 88 Phase 2 registry assertions when reporting Phase 2 isolation).

---

## 3. Exact Test Commands, Results, and Exit Codes

### 3.1 Prototype Test Suite (`scripts/test-lead-intake-prototype.js`)

```bash
node scripts/test-lead-intake-prototype.js
```
- **Exit Code:** `0`
- **Results:** **31 passed, 0 failed** (31 total assertions, 100% success)
- **Suite Breakdown:**
  - Suite 1: Input Validation, Relational Integrity & Referral Boundaries: **13/13 PASS**
  - Suite 2: Anti-Spam & Automated Bot Detection: **3/3 PASS**
  - Suite 3: Safe Direct-Connection IP Resolution & Anti-Spoofing: **2/2 PASS**
  - Suite 4: Rate Limiting, Idempotency & Concurrency: **2/2 PASS**
  - Suite 5: Privacy Protection & Masked Audit Logging: **3/3 PASS**
  - Suite 6: HTTP Protocol, Network Security & Concurrency: **8/8 PASS**

### 3.2 Master Regression Suite (`npm test`)

```bash
npm test
```
- **Exit Code:** `0`
- **Results:**
  - `verify-links.js`: 113 files verified, 0 broken links (**PASS**)
  - `check-orphans.js`: 113 files verified, 0 orphans (**PASS**)
  - `audit-seo.js`: 111 content files evaluated, 100% SEO compliant (**PASS**)
  - `test-chat-engine.js`: 10 queries, 30 action URLs verified on disk (**PASS**)
  - `test-trademark-search.js`: 40 checks passed (**PASS**)
  - `test-phase-1-remediation.js`: **54 passed, 0 failed** (**PASS**)
  - `validate-phase-2-registry.js`: **88 passed, 0 failed** (**PASS**)
  - `node -c assets/js/*.js`: 5 scripts syntax-checked (**PASS**)
- **Total Explicit Formal Assertions:** **142 passed, 0 failed** (100% success)

---

## 4. Referral-Route Reconciliation Table with Evidence

### 4.1 Master Route Forensic Audit

| Disputed Route Path | Canonical Service ID | Canonical Registry Status (`data/service-registry.json`) | Physical Disk File (`services/*.html`) | Canonical Ownership Evidence | Prototype Handling | Final Recommended Disposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/services/director-removal-board-disputes.html` | `null` | `REFERRAL_ONLY` | **EXISTS** (Row 45) | `docs/phase-1-route-register.csv` (Row 48); Phase 1 Review (Row 45) | Checks canonical registry; rejects with Advocates Act 1961 notice | **CONFIRMED CANONICAL REFERRAL-ONLY ROUTE.** Section 169 Companies Act contentious courtroom dispute. Direct self-serve intake prohibited. |
| `/services/nclt-insolvency-defense.html` | `null` | `REFERRAL_ONLY` | **EXISTS** (Row 46) | `docs/phase-1-route-register.csv` (Row 79); Phase 1 Review (Row 46) | Checks canonical registry; rejects with Advocates Act 1961 notice | **CONFIRMED CANONICAL REFERRAL-ONLY ROUTE.** IBC 2016 corporate insolvency defense before NCLT. Direct self-serve intake prohibited. |
| `/services/oppression-mismanagement-petitions.html` | `null` | `REFERRAL_ONLY` | **EXISTS** (Row 48) | `docs/phase-1-route-register.csv` (Row 82); Phase 1 Review (Row 48); Phase 2 Registry (lines 520–530) | Checks canonical registry; rejects with Advocates Act 1961 notice | **CONFIRMED CANONICAL REFERRAL-ONLY ROUTE.** Section 241/242 minority oppression tribunal petition. Direct self-serve intake prohibited. Prior reports that omitted this route did so due to an early narrative typo. |
| `/services/strike-off-company-closure.html` | `null` | **NOT IN REGISTRY** | **DOES NOT EXIST ON DISK** | Not in route register; not in Phase 1 CSV; not in Phase 2 registry | Defensively blocked via alias to catch stale report references | **DOCUMENT AS REPORT NARRATIVE TYPO & RETAIN DEFENSIVE ALIAS.** Strike-off is an active commercial secretarial service handled by `form-stk2-strike-off.html` (`V02-SVC-013`) and `llp-form24-strike-off.html` (`V02-SVC-015`). Route does not exist on disk. |
| `/services/nclt-merger-petitions.html` | `V09-SVC-003` | `ACTIVE_SERVICE` | **EXISTS** (Row 47) | `docs/phase-1-route-register.csv` (Row 80); Phase 1 Review (Row 47); Phase 2 Registry (lines 509–519) | Validated as active service `V09-SVC-003` under Vertical `V09` | **CONFIRMED ACTIVE SERVICE (SPLIT SCOPE).** Section 230–232 transactional amalgamation execution approved. Contentious litigation excluded. Not a referral-only route. |
| `/services/form-stk2-strike-off.html` | `V02-SVC-013` | `ACTIVE_SERVICE` | **EXISTS** (Row 26) | `docs/phase-1-route-register.csv` (Row 67); Phase 2 Registry (lines 304–314) | Validated as active service `V02-SVC-013` under Vertical `V02` | **CONFIRMED ACTIVE SERVICE.** Routine administrative secretarial filing under Section 248 Companies Act 2013. Fully accepted by intake. |
| `/services/llp-form24-strike-off.html` | `V02-SVC-015` | `ACTIVE_SERVICE` | **EXISTS** (Row 28) | `docs/phase-1-route-register.csv` (Row 74); Phase 2 Registry (lines 328–338) | Validated as active service `V02-SVC-015` under Vertical `V02` | **CONFIRMED ACTIVE SERVICE.** Routine administrative strike-off under Section 75 LLP Act 2008. Fully accepted by intake. |
| `/services/commercial-disputes-litigation.html` | `null` | **NOT IN REGISTRY** | **DOES NOT EXIST ON DISK** | Non-existent hypothetical test fixture | Defensively blocked via alias | **RETAIN IN TEST FIXTURES ONLY.** Used to verify that contentious litigation routes fail safely. |

### 4.2 Discrepancy Reconciliation Summary
The canonical Phase 2 registry (`data/service-registry.json`), the Phase 1 Route Register (`docs/phase-1-route-register.csv`), and the physical disk (`services/`) are in **100% agreement**:
- **57 Total Routes:** Exactly 57 HTML pages exist on disk.
- **54 Active Commercial Services:** Each carries a unique canonical service ID (`V01-SVC-001` through `V13-SVC-003`) and an assigned primary vertical.
- **3 Referral-Only Routes:** Exactly 3 routes carry no service ID, no primary vertical, and have `record_status: "REFERRAL_ONLY"`:
  1. `/services/director-removal-board-disputes.html`
  2. `/services/nclt-insolvency-defense.html`
  3. `/services/oppression-mismanagement-petitions.html`
- **Strike-Off Services are Active:** Company closure via strike-off is an active commercial service represented by Form STK-2 (`V02-SVC-013`) and LLP Form 24 (`V02-SVC-015`). The reference in earlier prompts to `/services/strike-off-company-closure.html` was a typo from an earlier report narrative.

---

## 5. Code Corrections and Justifications

### 5.1 Hardened Route Checking in `src/backend/lead-intake-prototype.js`
- **Issue in Task 6:** Route checking relied partly on a pre-populated Set of route strings (`referralRoutesCache`) rather than querying the loaded canonical registry records.
- **Correction Implemented:**
  1. In `loadPhase2Registry()`, added `canonicalRoutesCache = new Map()`, indexing all 57 canonical items from `data/service-registry.json` by `canonical_route`.
  2. In `validateLeadPayload()`, if `source_url` is provided:
     ```javascript
     const canonicalRouteRecord = canonicalRoutes && canonicalRoutes.has(route) ? canonicalRoutes.get(route) : null;
     if (canonicalRouteRecord && canonicalRouteRecord.record_status === 'REFERRAL_ONLY') {
       errors.push({
         field: 'source_url',
         issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
       });
     } else if (referralRoutes.has(route)) {
       errors.push({
         field: 'source_url',
         issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
       });
     }
     ```
  3. Grounded the classification directly in the canonical record's `record_status` property.
  4. Retained the defensive alias check (`referralRoutes.has(route)`) to safely catch unrouted legacy or hypothetical strings (`strike-off-company-closure.html`, `commercial-disputes-litigation.html`).

### 5.2 Verification of Non-Blocking for Active Services
- **Audit:** Confirmed that `validateLeadPayload()` does **not** perform substring or keyword matching on routes. It uses exact map lookup.
- **Test Added in `scripts/test-lead-intake-prototype.js`:**
  ```javascript
  it('Accepts valid active transactional services with strike-off or tribunal keywords (V02-SVC-013, V02-SVC-015, V09-SVC-003)', () => {
    const activeCases = [
      { service_id: 'V02-SVC-013', vertical_id: 'V02', source_url: '/services/form-stk2-strike-off.html' },
      { service_id: 'V02-SVC-015', vertical_id: 'V02', source_url: '/services/llp-form24-strike-off.html' },
      { service_id: 'V09-SVC-003', vertical_id: 'V09', source_url: '/services/nclt-merger-petitions.html' }
    ];
    for (const item of activeCases) {
      const result = validateLeadPayload({ ...item, ...validContactFields });
      assert.strictEqual(result.valid, true);
    }
  });
  ```
- **Result:** Confirmed that active strike-off and merger services pass cleanly with 0 errors.

---

## 6. Remaining Ambiguities and Unresolved Risks

1. **Approval Gate 1 Pending:** The Managing Partner and qualified legal counsel have not yet formally signed off on Approval Gate 1 (Architecture & Legal Boundaries). Cloud provisioning remains blocked.
2. **Statutory Retention Periods:** Retention intervals (180 days for unconverted leads under DPDP Act 2023; 8 financial years for company records under Companies Act 2013 Section 128) remain architectural proposals and require formal confirmation by legal counsel.
3. **Commercial Pricing Schedule Unapproved:** All pricing in `data/pricing.json` and static website cards remains classified as `UNVERIFIED_BASELINE` and is blocked from client-facing display by Phase 2 gating rules.
4. **Antivirus Worker Architecture:** Because Supabase Storage lacks native malware scanning, an external asynchronous worker (AWS Lambda / container running ClamAV) must be provisioned during staging setup to inspect documents before release.

---

## 7. Files Changed and Purpose

| File | Change Description | Purpose |
| :--- | :--- | :--- |
| [`src/backend/lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/lead-intake-prototype.js) | Added `canonicalRoutesCache` to `loadPhase2Registry()` and grounded route referral checking in canonical `record_status === 'REFERRAL_ONLY'`. | Ensures route validation uses canonical data layer classifications rather than unindexed string matching. |
| [`scripts/test-lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/test-lead-intake-prototype.js) | Added test asserting active transactional services (`V02-SVC-013`, `V02-SVC-015`, `V09-SVC-003`) are accepted and not blocked. Assertions: 31 passed. | Prevents regressions and proves transactional strike-off/merger services are never blocked. |
| [`review-output/phase-3/phase-3-task-7-verification-correction-report.md`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/review-output/phase-3/phase-3-task-7-verification-correction-report.md) | Authored this comprehensive report documenting the test-count resolution, route reconciliation, and prototype safeguards. | Delivers the required Task 7 verification report. |

---

## 8. Exact Final Repository Status (`git status --short`)

```
 M .gitignore
 M package-lock.json
 M package.json
 M review-output/phase-1-foundations/phase-1-service-ownership-review.md
?? .env.example
?? data/
?? review-output/phase-2-data-layer/
?? review-output/phase-2-service-registry/
?? review-output/phase-3/
?? scratch/analyze_page_prices.js
?? scratch/analyzed_page_prices.json
?? scratch/audit_schemas.js
?? scratch/build_phase_2_datasets.js
?? scratch/compile_pricing_stats.js
?? scratch/detailed_scanned_prices.json
?? scratch/extract_card_details.js
?? scratch/extract_price_details.js
?? scratch/generate_comprehensive_pricing_data.js
?? scratch/generate_phase_2_registry.js
?? scratch/inventory_pricing_cards.js
?? scratch/list_pricing_cards.js
?? scratch/pricing_card_inventory.json
?? scratch/pricing_table_rows.txt
?? scratch/scan_service_prices.js
?? scratch/scanned_prices.json
?? scratch/summarize_phase_2.js
?? scratch/temp_stub.json
?? scratch/test_ajv.js
?? scratch/test_ajv_duplicate.js
?? scratch/test_gating_matrix.js
?? scratch/test_integrity_checks.js
?? scratch/test_pricing_output.json
?? scratch/update_all_eligibility.js
?? scratch/update_claims.js
?? scratch/update_eligibility_task_5.js
?? scratch/update_jurisdiction_task_5.js
?? scratch/update_phase_2_task_3_data.js
?? scratch/update_pricing_reconciliation_final.js
?? scratch/update_regulatory_claims_task_6.js
?? scripts/test-lead-intake-prototype.js
?? scripts/validate-phase-2-registry.js
?? src/
```

- **Phase 1 Foundations:** 15 approved verticals and 57 routes remain 100% preserved.
- **Phase 2 Data Layer:** All 7 JSON datasets and schemas remain 100% compliant and intact.
- **Production Code:** Production HTML, CSS, and client-side JavaScript remain completely unmodified.
- **Test Integrity:** 100% passing across all 31 prototype assertions (`node scripts/test-lead-intake-prototype.js`) and all 142 regression suite assertions (`npm test`).
