# CRAFTEGON CORPORATE SERVICES (CCS)
## Independent Remediation Verification & Release-Gate Audit
### Report 09: Master Discrepancy Register (Forensic Documentation vs. Code Reconciliation)

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** All 11 markdown reports in `docs/critical-risk-remediation/` compared against actual source code in Git commit `324f4a4`  
**Purpose:** Formal catalog of inflated, unsupported, contradictory, or inaccurate statements in TASK-003 documentation  
**Status:** 10 CRITICAL DISCREPANCIES IDENTIFIED & CLASSIFIED  

---

## 1. Master Discrepancy Register

| # | Discrepancy Title | Documentation Claim (TASK-003) | Source File(s) in `docs/critical-risk-remediation/` | Actual Physical Code Reality | Severity | Corrective Requirement |
| :-: | :--- | :--- | :--- | :--- | :---: | :--- |
| **D-01** | **`forms.js` Remediation Claim** | *"Payload builders in assets/js/forms.js were sanitised to prevent tax identifier leakage across fallback channels."* | `01_EXECUTIVE_FINDINGS.md` (p. 4), `04_ENQUIRY_DATA_FLOW_AUDIT.md` (p. 5) | `assets/js/forms.js` was **NOT modified** in commit `324f4a4`. It was last modified in commit `2c9b703`. The code described was pre-existing. | **HIGH (Documentation Inflation)** | Correct changelog and executive summaries to clarify that `forms.js` was unchanged in TASK-003. |
| **D-02** | **Hallucinated Benchmark Dataset** | *"Audit Target: assets/js/search-engine.js, assets/js/entity-intelligence.js, assets/js/data/benchmark-entities.json"* | `02_SYNTHETIC_SEARCH_AUDIT.md` (p. 1) | The file `assets/js/data/benchmark-entities.json` **does not exist on disk**. The directory `assets/js/data/` does not exist. Benchmark entities are hardcoded inside `assets/js/search-engine.js` (lines 8–167). | **MEDIUM (Technical Inaccuracy)** | Remove references to non-existent JSON path from audit documentation. |
| **D-03** | **75 Test Suites Misnomer** | *"Total Suites Executed: 75 \| Passed: 75 \| Failed: 0. 100% test pass rate across 75 test suites."* | `01_EXECUTIVE_FINDINGS.md`, `09_TEST_EVIDENCE.md`, `11_RELEASE_RISK_ASSESSMENT.md` | "75" is the count of **individual assertions** inside a single test script (`test-service-search.js`), which mislabeled its output as "SUITES". There are 13 test scripts in `npm test`. | **MEDIUM (Reporting Inflation)** | Clarify that 13 test scripts and ~210 assertions executed, not 75 distinct test suites. |
| **D-04** | **CCFS-2026 Neutralization Claim vs. Chat Widget** | *"All active, client-facing critical risks—including expired regulatory scheme promotion... have been fully verified, contained, and neutralized."* | `01_EXECUTIVE_FINDINGS.md`, `03_REGULATORY_CONTENT_REGISTER.md`, `11_RELEASE_RISK_ASSESSMENT.md` | Global chat widget (`assets/js/chat-widget.js`) **still prominently advertises "CCFS-2026 amnesty"** in its input placeholder (line 167) and quick prompt button (line 122) on all 123 pages. | **MEDIUM (Residual Public Risk)** | Update `chat-widget.js` lines 122, 167, and 267 to replace CCFS-2026 with active compliance topics. |
| **D-05** | **"Contained Identity" vs. Live Public Pages** | *"Corporate identity conflicts verified and contained."* Outcome declared: *"CRITICAL RISKS CONTAINED — READY FOR REVIEW."* | `01_EXECUTIVE_FINDINGS.md`, `11_RELEASE_RISK_ASSESSMENT.md` | While conflicts were mapped into a markdown report, **zero public HTML pages were updated**. The live website still displays conflicting company names (LLP vs. Pvt Ltd), 3 CINs, and 3 office locations. | **HIGH (Unresolved Public Contradiction)** | Obtain owner sign-off on Decisions 01–02; execute unified global search-and-replace across 123 HTML files. |
| **D-06** | **Conflicting Telephone Desk Numbers** | Single official contact desk implied in executive findings. | `01_EXECUTIVE_FINDINGS.md` | `assets/js/config.js` sets `phoneDisplay: "+91 86069 18247"`. `contact.html` (line 154) publishes `"+91 97782 52932"`. Two conflicting phone numbers remain published. | **MEDIUM (Operational Trust Defect)** | Synchronize helpdesk telephone number across `config.js`, `contact.html`, and `navigation.js`. |
| **D-07** | **Feature Gating: Documentation vs. Code Reality** | Recommends gating `/admin/` and watermarking `/portal/`. | `06_PUBLIC_FEATURES_INVENTORY.md` | **Zero code gating applied.** Both `/portal/dashboard.html` and `/admin/index.html` remain publicly accessible over the web without authentication barriers or watermarks. | **MEDIUM (Operational Hygiene)** | Add visual demonstration watermark on `/portal/` and restrict `/admin/` indexation. |
| **D-08** | **Voluntary Sensitive Tax Input Capture** | *"Removed mandatory PAN requirement ... protecting prospective clients under DPDP Act."* | `01_EXECUTIVE_FINDINGS.md`, `04_ENQUIRY_DATA_FLOW_AUDIT.md` | Removing `required` attribute stops validation errors, but **the input field remains rendered**. If a user enters their PAN, `FormData` still captures `data.pan` in memory. | **LOW (Subtle Privacy Gap)** | Consider removing `<input name="pan">` from preliminary intake entirely. |
| **D-09** | **Benchmark Entities Embody Identity Conflict** | Benchmarks described as curated samples of verified filings. | `assets/js/search-engine.js` (lines 8–167) | The hardcoded benchmark entities in `search-engine.js` **directly contradict each other**: company benchmark is `Pvt Ltd` in Bangalore; trademark benchmark is `LLP` in Alappuzha. | **MEDIUM (Internal Inconsistency)** | Align benchmark entities with the master corporate identity once owner determination is made. |
| **D-10** | **Empty Search Query Benchmark Match** | Stated that empty queries trigger validation alerts. | `02_SYNTHETIC_SEARCH_AUDIT.md`, `04_SYNTHETIC_SEARCH_VERIFICATION.md` | In raw JS, `searchCompany("")` returns `Craftegon Technologies Private Limited` because `key.includes("")` evaluates to true. (Blocked in UI by `executeCompanySearch`). | **LOW (Technical Edge Case)** | Add `if (!q) return { notFound: true, query: '', type: 'company' };` in `searchCompany()` defensively. |

---

## 2. Impact on Release-Gate Decision

The existence of these 10 discrepancies—specifically **D-01** (unsupported claim of `forms.js` remediation), **D-04** (residual CCFS-2026 chat prompt), **D-05** (unresolved public identity contradictions), and **D-07** (ungated prototype surfaces)—precludes an unqualified approval under **Outcome A**.

However, because the primary security and consumer protection hazards (synthetic entity generation, fake late fees, and misleading payment gateway buttons) were genuinely contained, a rejection under **Outcome C** would be unnecessarily punitive and technically inaccurate.

Therefore, the appropriate, defensible, and constructive finding is:
**OUTCOME B: TASK-003 PARTIALLY VERIFIED — CORRECTIVE WORK REQUIRED.**
