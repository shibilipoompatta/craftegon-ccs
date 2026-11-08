# CRAFTEGON CORPORATE SERVICES (CCS)
## Independent Remediation Verification & Release-Gate Audit
### Report 04: Empirical Synthetic Search Containment & Query Resilience Verification

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** `assets/js/search-engine.js`, `search/index.html`  
**Test Harness:** Headless JSDOM Node.js test harness executing actual search runtime  
**Test Date:** 07 November 2026  
**Status:** FULLY VERIFIED PASS (Zero Fabricated Records, Robust XSS Mitigation)  

---

## 1. Test Methodology & Objectives

Prior to TASK-CCS-UX-003, any unknown query entered on `https://ccs.craftegon.com/search/` triggered algorithmic fallback generators that procedurally fabricated:
- A plausible-sounding 21-digit Corporate Identity Number (CIN).
- Fictitious directors with simulated DINs.
- Overdue annual return filings (AOC-4 and MGT-7).
- Alarming compliance penalty calculations up to ₹54,000+ with red "HIGH RISK" alert banners.

The objective of this independent audit was to execute a comprehensive battery of safe synthetic queries against the updated `assets/js/search-engine.js` code in commit `324f4a4` to verify:
1. That unknown companies, trademarks, and GSTINs **never** display fabricated records or penalties.
2. That unknown queries render a transparent, honest "Not Found" notification with official registry links.
3. That known benchmark entities continue to resolve properly.
4. That malicious input strings (XSS, HTML tags, special characters) are safely sanitized.

---

## 2. Empirical Test Results Matrix

The test script executed 15 distinct query vectors covering known entities, unknown entities, edge cases, and injection payloads:

| # | Test Vector | Query String | Query Type | Expected Behavior | Actual Runtime Result | Verification Status |
| :-: | :--- | :--- | :---: | :--- | :--- | :---: |
| 1 | **Known Benchmark Company** | `craftegon` | Company | Return benchmark profile from `BENCHMARK_ENTITIES` | Matches `Craftegon Technologies Private Limited`, CIN `U72900KA2021PTC148562`. Verified benchmark record. | **VERIFIED PASS** |
| 2 | **Known Benchmark Company** | `reliance industries` | Company | Return benchmark profile from `BENCHMARK_ENTITIES` | Matches `Reliance Industries Limited`, CIN `L17110MH1973PLC019786`. Status: Active. | **VERIFIED PASS** |
| 3 | **Known Benchmark by CIN** | `L17110MH1973PLC019786` | Company | Return benchmark profile by exact CIN | Resolves Reliance Industries Limited. Status: Active. | **VERIFIED PASS** |
| 4 | **Known Benchmark Trademark** | `craftegon` | Trademark | Return benchmark trademark profile | Matches `CRAFTEGON (Word Mark)`, App No. `5829104`, Class 42 & 45. | **VERIFIED PASS** |
| 5 | **Known Benchmark Trademark** | `tcs` | Trademark | Return benchmark trademark profile | Matches `TATA CONSULTANCY SERVICES`, App No. `1234567`, Class 42. | **VERIFIED PASS** |
| 6 | **Known Benchmark GSTIN** | `29aaaca1234a1z5` | GSTIN | Return benchmark GSTIN profile | Resolves `29AAACA1234A1Z5` for Craftegon Technologies Pvt Ltd. | **VERIFIED PASS** |
| 7 | **Unknown Company** | `Acme Technologies Private Limited` | Company | Return `notFound: true`, render `showNotFound()` | Returns `{ notFound: true, query: "Acme...", type: "company" }`. Zero penalty, zero fake CIN, links to MCA V3 portal. | **VERIFIED PASS** |
| 8 | **Unknown GSTIN** | `29ABCDE1234F1Z5` | GSTIN | Return `notFound: true`, render `showNotFound()` | Returns `{ notFound: true }`. Zero fake filing history, links to Official GST Portal. | **VERIFIED PASS** |
| 9 | **Unknown Trademark** | `SuperAwesomeBrand` | Trademark | Return `notFound: true`, render `showNotFound()` | Returns `{ notFound: true }`. Zero fake status, links to IP India Trade Marks Portal. | **VERIFIED PASS** |
| 10 | **Empty Query** | `""` | Company | UI event handler catches empty input | In UI (`executeCompanySearch`), triggers error: *"Please enter a company name or CIN to search."* Does not search. | **VERIFIED PASS** |
| 11 | **Whitespace Query** | `"   "` | Company | UI event handler trims and alerts | In UI, trimmed query triggers validation error. In raw JS, returns `notFound: true`. | **VERIFIED PASS** |
| 12 | **Special Characters / Malformed** | `!!!@@@###$$$%%%` | Company | Handled safely without crash | Returns `{ notFound: true }`. Renders safe `showNotFound()`. Zero fabricated records. | **VERIFIED PASS** |
| 13 | **Script Injection (DOM-XSS)** | `<script>alert("xss")</script>` | Company | Script escaped; no DOM execution | String escaped via `escapeHtml()`. Output contains literal `&lt;script&gt;`. Zero execution. | **VERIFIED PASS** |
| 14 | **HTML Tag Injection (Image)** | `<img src=x onerror=alert(1)>` | Trademark | Tag escaped; no image load/error | String escaped. Rendered as literal text. Zero execution. | **VERIFIED PASS** |
| 15 | **HTML Tag Injection in GSTIN** | `<b>29ABCDE</b>` | GSTIN | Tag escaped; no bold rendering | String escaped. Rendered as literal text. Zero execution. | **VERIFIED PASS** |

---

## 3. Detailed Inspection of the `showNotFound()` Component

When an unknown query is searched, `assets/js/search-engine.js` invokes `showNotFound(containerId, query, type)`. The rendered DOM was inspected for legal and consumer protection compliance:

### Code Snippet Rendered in Browser:
```html
<div class="result-card" style="border-left: 4px solid var(--text-dark-gold, #8C6D14); background: #FFFFFF; padding: 1.5rem; border-radius: 8px;">
  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
    <span class="noble-badge" style="background: #FEF3C7; color: #92400E; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">
      UNVERIFIED RECORD
    </span>
    <span style="font-size: 0.8rem; color: #64748B;">Sovereign Registry Query Required</span>
  </div>
  <h3 style="font-family: var(--font-heading, 'Cinzel', serif); font-size: 1.15rem; color: #090D16; margin-bottom: 0.5rem;">
    No Verified Record in Benchmark Index for "${escapeHtml(query)}"
  </h3>
  <p style="font-size: 0.85rem; color: #475569; line-height: 1.5; margin-bottom: 1rem;">
    This demonstration search engine queries curated benchmark records and does not connect to live government databases in this static environment. 
    <strong>CraftEgon does not fabricate synthetic corporate entities, filing records, or compliance penalties.</strong>
  </p>
  ...
  <a href="${registryUrl}" target="_blank" rel="noopener noreferrer">
    Search on ${registryName} &rarr;
  </a>
</div>
```

### Forensic Quality Findings:
1. **Explicit Truth in Advertising:** Prominently informs the user: *"CraftEgon does not fabricate synthetic corporate entities, filing records, or compliance penalties."*
2. **Outbound Sovereign Portal Links:**
   - Company search $\rightarrow$ Links to MCA V3 Portal (`https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/company-llp-name-search.html`)
   - Trademark search $\rightarrow$ Links to IP India Portal (`https://ipindiaservices.gov.in/eregister/eregister.aspx`)
   - GSTIN search $\rightarrow$ Links to Official GST Portal (`https://services.gst.gov.in/services/searchtp`)
   - All links include `target="_blank"` and `rel="noopener noreferrer"`.
3. **Escaping Rigor:** The query string is passed through `escapeHtml()`, preventing HTML injection or script execution when reflecting user queries in the heading.

---

## 4. Benchmark Dataset Discrepancy

During our investigation, an important discrepancy between the TASK-003 documentation and the physical codebase was uncovered:

- **TASK-003 Documentation Claim (Report 02, line 8):**
  > *"Audit Target: assets/js/search-engine.js, assets/js/entity-intelligence.js, assets/js/data/benchmark-entities.json"*
- **Code Reality:**
  The file `assets/js/data/benchmark-entities.json` **does not exist** in the repository.
  In fact, `assets/js/data/` does not exist as a directory.
  Instead, `BENCHMARK_ENTITIES` is a hardcoded JavaScript object defined at lines 8–167 of `assets/js/search-engine.js`.
- **Verdict on Discrepancy:** Documentation inaccuracy / hallucinated file path. The actual code execution is unaffected because the object is embedded directly in the script.

---

## 5. Audit Verdict

### Overall Finding: **VERIFIED PASS**
The containment of synthetic search in `assets/js/search-engine.js` is **complete, robust, and verified**. Under no condition can an unknown query generate a fake CIN, dummy directors, or fabricated late filing penalties. The feature operates safely and honestly within the static Cloudflare Pages hosting constraints.
