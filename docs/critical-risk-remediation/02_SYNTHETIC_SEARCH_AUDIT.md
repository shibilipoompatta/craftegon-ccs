# CRAFTEGON CORPORATE SERVICES (CCS)
## Critical Risk Verification, Public-Claim Containment & Commercial Identity Stabilisation
### Report 02: Synthetic Corporate Search Audit & Algorithmic Deception Neutralisation

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** `assets/js/search-engine.js`, `assets/js/entity-intelligence.js`, `assets/js/data/benchmark-entities.json`  
**Risk Severity Prior to Remediation:** CRITICAL (Regulatory, Legal & Consumer Protection Exposure)  
**Status:** FULLY CONTAINED & NEUTRALISED  

---

## 1. Technical Architecture of the Search Feature

The CraftEgon CCS platform provides a unified search interface at `/search/` (rendered via `search/index.html`) allowing users to query:
1. **Corporate Entity Information** (by company name or CIN).
2. **Trade Mark Filings** (by trademark wordmark or application number).
3. **Goods & Services Tax Identification Numbers** (by GSTIN or trade name).

### Architectural Implementation:
- **Search Engine:** `assets/js/search-engine.js` (instantiated as `window.SearchEngine`).
- **Benchmark Corpus:** `assets/js/data/benchmark-entities.json` containing 10 curated benchmark companies (e.g., Zomato Limited, Swiggy Limited, Infosys Limited, Tata Consultancy Services Limited).
- **Client Execution:** The search executes entirely within the browser via client-side JavaScript. It does NOT call external government APIs (such as MCA V3 API, IP India public search, or GSTN APIs) because no server-side or API key proxy exists on Cloudflare Pages static edge hosting.

---

## 2. Root Cause Analysis: Algorithmic Simulation of Filings & Penalties

Prior to our remediation under TASK-CCS-UX-003, `assets/js/search-engine.js` contained fallback algorithms that triggered whenever a query did not match one of the 10 benchmark entities.

### The Deceptive Mechanism:
When a user searched for any arbitrary query (e.g., "Apex Logistics", "Sunrise Retail", or their own family business name), instead of indicating that the entity was not found in the local static database, the engine invoked procedural generators:
1. `generateSyntheticCompany(query)` (lines 351–393)
2. `generateSyntheticTrademark(query)` (lines 395–427)
3. `generateSyntheticGstin(query)` (lines 429–460)

### What `generateSyntheticCompany(query)` Fabricated:
```javascript
// PRE-REMEDIATION CODE (assets/js/search-engine.js):
function generateSyntheticCompany(query) {
  const hash = hashString(query);
  const states = ["DL", "MH", "KA", "TN", "TS", "HR", "GJ", "UP", "WB", "KL"];
  const state = states[hash % states.length];
  const year = 2015 + (hash % 10);
  const cin = `U72900${state}${year}PTC${String(100000 + (hash % 900000))}`;
  const daysOverdue = (hash % 300) + 30;
  const lateFee = daysOverdue * 100 * 2; // AOC-4 + MGT-7
  ...
  return {
    cin,
    name: query.toUpperCase(),
    company_type: "Private Limited",
    status: daysOverdue > 180 ? "Notice Issued" : "Active",
    filings: [
      { form: "AOC-4", status: "Overdue", days: daysOverdue, fee: daysOverdue * 100 },
      { form: "MGT-7", status: "Overdue", days: daysOverdue, fee: daysOverdue * 100 }
    ],
    total_penalty: lateFee,
    risk_level: daysOverdue > 180 ? "HIGH RISK" : "MODERATE RISK",
    recommended_action: "Regularise immediately via CraftEgon Fast-Track Filing"
  };
}
```

### Grave Commercial & Legal Hazards Identified:
1. **Fabricated Corporate Records:** Created the illusion that CraftEgon possesses live access to the Ministry of Corporate Affairs (MCA) database, generating plausible 21-digit alphanumeric CINs for non-existent companies or assigning incorrect CINs to real companies.
2. **Manufactured Non-Compliance Scare Tactics:** Falsely informed business founders that their company was "OVERDUE", had incurred thousands of rupees in statutory late filing penalties (e.g., ₹54,000+), and had been flagged as "HIGH RISK" or "Notice Issued".
3. **Consumer Protection Violations:** Under the **Consumer Protection Act, 2019 (Section 2(47))**, fabricating false statements regarding the status, quality, compliance, or penalties of a business to induce the purchase of compliance services constitutes an "unfair trade practice" and deceptive advertising.
4. **Defamation & Malicious Representation:** If an established company searched their own name, the site displayed fabricated overdue filings and severe regulatory warnings, potentially injuring their business reputation.
5. **Expired Regulatory Claims:** The synthetic generator output text stating *"CCFS-2026 amnesty available until 15 Sep 2026"*, which is now legally obsolete.

---

## 3. Remediation & Containment Implemented

Under TASK-CCS-UX-003, all procedural synthetic generation fallbacks were permanently severed and replaced with transparent, honest, and legally sound handling.

### Exact Changes in `assets/js/search-engine.js`:

#### A. Disabling Synthetic Execution in Core Search Functions:
```javascript
// IN searchCompany(query):
// BEFORE: return generateSyntheticCompany(query);
// AFTER:
return { notFound: true, query, type: 'company' };

// IN searchTrademark(query):
// BEFORE: return generateSyntheticTrademark(query);
// AFTER:
return { notFound: true, query, type: 'trademark' };

// IN searchGstin(query):
// BEFORE: return generateSyntheticGstin(query);
// AFTER:
return { notFound: true, query, type: 'gstin' };
```

#### B. Intercepting `notFound` in Execution Handlers:
```javascript
function executeCompanySearch(query) {
  const result = searchCompany(query);
  if (result.notFound) {
    showNotFound('company-results', result.query, 'company');
    return;
  }
  renderCompanyResult(result);
}
```

#### C. Implementation of the Transparent `showNotFound()` Component:
```javascript
function showNotFound(containerId, query, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const typeLabels = {
    company: 'Company / CIN',
    trademark: 'Trade Mark',
    gstin: 'GSTIN / Trade Name'
  };

  const officialPortals = {
    company: { name: 'MCA V3 Official Portal', url: 'https://www.mca.gov.in/content/mca/global/en/home.html' },
    trademark: { name: 'IP India Public Search', url: 'https://ipindiaservices.gov.in/tmrpublicsearch/' },
    gstin: { name: 'GST Portal Official Search', url: 'https://services.gst.gov.in/services/searchtp' }
  };

  const portal = officialPortals[type] || officialPortals.company;
  const label = typeLabels[type] || 'Entity';

  container.innerHTML = `
    <div class="if-search-not-found" style="background: var(--bg-ivory, #FCFBF9); border: 1.5px solid var(--border-color, #E5E5E5); border-radius: 8px; padding: 2rem; margin: 1.5rem 0; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.75rem;">🔍</div>
      <h3 style="font-family: var(--font-heading, 'Cinzel', serif); font-size: 1.25rem; color: var(--text-dark, #1A1A1A); margin-bottom: 0.5rem;">
        "${escapeHtml(query)}" Not in Static Benchmark Directory
      </h3>
      <p style="color: var(--text-muted, #555555); font-size: 0.95rem; max-width: 650px; margin: 0 auto 1.25rem; line-height: 1.6;">
        This demonstration directory contains a curated benchmark sample of verified Indian corporate filings.
        <strong>CraftEgon does not fabricate synthetic corporate records, director information, or estimated filing penalties.</strong>
      </p>
      <div style="background: #FFFFFF; border: 1px solid var(--border-color, #E5E5E5); border-radius: 6px; padding: 1rem; max-width: 550px; margin: 0 auto 1.5rem; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-dark, #1A1A1A); margin-bottom: 0.35rem;">
          Official Government Verification:
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted, #555555); margin: 0 0 0.5rem;">
          To verify live statutory status directly from sovereign registries, consult:
        </p>
        <a href="${portal.url}" target="_blank" rel="noopener noreferrer" style="color: var(--brand-gold-text, #997A15); font-size: 0.85rem; font-weight: 600; text-decoration: underline;">
          Verify on ${portal.name} →
        </a>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/conversion/retainer-desk.html" class="if-btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.9rem;">
          Request Corporate Desk Verification
        </a>
        <button type="button" onclick="document.getElementById('search-query').focus();" class="if-btn-secondary" style="padding: 0.75rem 1.5rem; font-size: 0.9rem;">
          Try Another Query
        </button>
      </div>
    </div>
  `;
}
```

#### D. Purging Expired Regulatory Text from Test Fixtures:
In `generateSyntheticCompany()` (retained strictly as an offline internal test fixture), line 384 previously claimed:
`"CCFS-2026 amnesty available until 15 Sep 2026"`
This was updated to:
`"Statutory fees governed under Section 403 of Companies Act 2013"`

---

## 4. Verification Evidence

The containment was verified by executing both dedicated and comprehensive test suites:

### Test 1: Dedicated Search Engine Test (`scripts/test-search-engine.js`)
```
Command: node scripts/test-search-engine.js
Output:
Search result escaping and preview-label tests passed for company, trademark, GSTIN, and live data.
Exit Code: 0 (PASS)
```

### Test 2: Full Integration Test Suite (`npm test`)
```
Command: npm test
Output:
- All 123 HTML files checked.
- Trademark search tests: 40/40 checks passed (DOM-XSS mitigated & claim integrity verified).
- Universal service search: 75/75 suites passed.
- Exit Code: 0 (PASS)
```

### Test 3: Manual Query Simulation
Queries tested against the updated engine:
1. `Zomato` (Benchmark entity) $\rightarrow$ Displays verified curated benchmark profile (`L93030DL2010PLC198141`).
2. `Acme Software Private Limited` (Unknown entity) $\rightarrow$ Displays transparent `showNotFound()` card; confirms query is not in benchmark; explicitly states no synthetic records are fabricated; links to MCA V3 portal; provides CTA to Corporate Desk.
3. `<script>alert(1)</script>` $\rightarrow$ Safely escaped via `escapeHtml()`; renders in `showNotFound()` as literal text without DOM-XSS execution.

---

## 5. Conclusion & Operational Recommendation

With the execution of TASK-CCS-UX-003, the synthetic search vulnerability has been **100% mitigated**. 

**Policy Rule for Future Development:**
Under no circumstances should client-side or server-side code generate simulated government registry records or hypothetical penalty notices presented as real company data. If live registry verification is desired in the future, it must be powered by official, authenticated, and licensed MCA/GST/IP India API aggregators with clear timestamped provenance.
