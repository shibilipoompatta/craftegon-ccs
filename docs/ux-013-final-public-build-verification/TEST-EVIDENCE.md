# TASK-CCS-UX-013: Independent Test & Build Verification Evidence Report

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  
**Auditor Status:** Independent Forensic Reviewer  

---

## 1. Commands Executed & Real Outcomes

The following build, verification, and regression test commands were independently executed in the local environment:

| Command Executed | Execution Context | Execution Time | Assertions / Suites | Exit Code | Verified Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `node scripts/build-public.js` | Release Compilation | ~1.1s | 151 files assembled, 15 links sanitized | 0 | **SUCCESS** |
| `node scripts/verify-public-build.js` | Artifact Verification | ~0.4s | 51 assertions across 5 suites | 0 | **100% PASS (51/51)** |
| `npm test` | Full Regression Harness | ~8.5s | 75 suites across 14 test execution steps | 0 | **100% PASS (75/75)** |
| `node scratch/recapture_missing_shots.js` | Headless Visual QA | ~28s | 80 screenshots captured across 8 viewports | 0 | **100% PASS (80/80)** |

---

## 2. Test Architecture Breakdown: Static vs. Dynamic vs. Mocked

To prevent conflating static file checks with end-to-end production integration, the test suites are categorized by their actual implementation mechanism:

| Test Script | Execution Engine | Test Target | What It Actually Tests | Limitations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `verify-public-build.js` | Node.js `fs` / Regex | `dist-public/` | Directory existence, physical absence of 10 forbidden dirs, 0 residual `/portal/` links, 0 broken internal links across 118 HTML pages, edge configs (`_redirects`, `_headers`, `robots.txt`, `sitemap.xml`). | Static filesystem audit. Does not execute HTTP requests against a live web server. |
| `verify-links.js` | Node.js `fs` / JSDOM | Source HTML | Checks internal hyperlinks (`href`, `src`) across 124 source HTML documents against disk. | Static check. Ignores query strings and hashes. |
| `check-orphans.js` | Node.js Graph Traversal | Source HTML | Verifies that all 124 HTML pages can be reached starting from `index.html` or `sitemap.xml`. | Static graph check. |
| `audit-seo.js` | Node.js HTML Parser | Source HTML | Validates unique `<title>`, `<meta name="description">`, and `<link rel="canonical">` pointing to `https://ccs.craftegon.com`. | Static metadata check. |
| `test-schemas.js` & `test-phase-6-schemas.js` | Node.js / `ajv` | `data/*.json`, HTML | Validates 7 JSON datasets against JSON Schemas; parses 236 JSON-LD structured data blocks across HTML files. | Validates schema conformance, not real-time search engine rich snippet rendering. |
| `test-search-engine.js` | Node.js / JSDOM | `assets/js/search-engine.js` | Injects synthetic search results into DOM; verifies HTML entity escaping, absence of `<script>` tags, and presence of "Demo/Benchmark Preview" badge. | Unit test running in synthetic JSDOM. Does not query real MCA or GST APIs. |
| `test-round-3-utilities.js` | Node.js / JSDOM | `assets/js/search-engine.js`, `calculator.js` | Tests benchmark CIN lookup (`U72900KA2021PTC148562`), LLPIN sample, and fee calculator functions under mocked offline fetch. | **Mocked test.** Relies on hardcoded benchmark records. |
| `test-chat-engine.js` | Node.js / Regex | `assets/js/chat-widget.js` | Evaluates 10 conversational user queries against chat intent regex rules; asserts that all 30 suggested action destination URLs physically exist on disk. | Static intent matching. Does not use an LLM or live chat backend. |
| `test-phase-1-form-fallback.js` | Node.js / JSDOM | `contact.html`, `assets/js/forms.js` | Simulates form submission in a static environment; asserts insertion of accessible fallback notice, WhatsApp link, and mailto link. | Simulates client DOM; does not send real WhatsApp messages or network packets. |
| `test-phase-1-routing.js` | Node.js Routing Table | `_redirects` | Asserts that `/services`, `/services/`, and sub-service routes resolve without redirect loops. | Evaluates edge routing rules against static table. |
| `test-service-search.js` | Node.js / JSDOM | `services/index.html`, `service-search.js` | Evaluates search input filtering across 57 canonical services, practice vertical selects, and empty state rendering. | DOM integration test. |
| `Syntax Checks` (`node -c`) | V8 Compiler | 8 Core JS files | Verifies syntax validity of `config.js`, `navigation.js`, `forms.js`, `calculator.js`, `chat-widget.js`, `search-index.js`, `service-search.js`, `admin/admin.js`. | Verifies parseability; does not test runtime logic. |

---

## 3. Discrepancy Reconciliation

### A. Manifest File Count Reconciliation
- **Previous Claim:** 154 files included, 2.49 MB.
- **Investigated Finding:** 151 unique files physically present on disk in `dist-public/` (2.46 MB).
- **Cause:** Double-push of `_redirects`, `_headers`, `robots.txt`, and `sitemap.xml` in the previous build script, while `build-manifest.json` was written after the count.
- **Remediation:** Fixed in `scripts/build-public.js`. Disk files and manifest now match 100% at **151 files**.

### B. Screenshot Verification Reconciliation
- **Previous Claim:** 64 screenshots across 8 pages and 8 viewports.
- **Investigated Finding:** 16 screenshots (`vertical` and `calculator`) were 404 error captures due to invalid path targets, and `about.html` was missing.
- **Remediation:** Recaptured all 4 missing/misrouted pages across all 8 viewports. Total valid screenshot inventory on disk is now **80 screenshots**.

---

## 4. Skipped, Mocked, or Unavailable Tests

1. **Live External API Tests:** All calls to external MCA, GST, or IP India APIs are mocked or bypassed using local benchmark cache. No network calls to government registries occur during testing.
2. **Server-Side Form Processing:** Because Cloudflare Pages is configured without backend functions, server-side database insertion is not tested; tests explicitly verify the transparent client-side fallback.
3. **Cross-Browser Mobile Testing:** Tests utilize Node.js JSDOM and Microsoft Edge headless mode on Windows. Native iOS WebKit rendering and Android WebView touch gestures were not tested.
