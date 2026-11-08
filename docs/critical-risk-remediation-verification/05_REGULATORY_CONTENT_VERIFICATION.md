# CRAFTEGON CORPORATE SERVICES (CCS)
## Independent Remediation Verification & Release-Gate Audit
### Report 05: Regulatory Content Verification, Statutory Claims & CCFS-2026 Lifecycle Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** 166 statutory references across HTML, JavaScript, JSON datasets, calculators, and sitemaps  
**Applicable Legal Frameworks:** Companies Act 2013 (Section 403, 92, 137, 248), MCA General Circular 04/2026, Income Tax Act 1961 (Section 43B(h), 92E), FEMA 1999  
**Audit Standard:** Cross-examination of published claims against current sovereign regulatory status  
**Status:** PARTIALLY VERIFIED — RESIDUAL CHAT WIDGET PROMOTION IDENTIFIED  

---

## 1. Statutory Context & The CCFS-2026 Issue

The Ministry of Corporate Affairs (MCA) introduced the **Companies Compliance Facilitation Scheme 2026 (CCFS-2026)** to condone delays in filing overdue statutory forms (such as AOC-4, MGT-7, ADT-1, and DIR-3 KYC) upon payment of normal filing fees plus a nominal 10% additional fee, granting immunity from prosecution.

By **MCA General Circular No. 04/2026** (dated 31 August 2026), the MCA extended the terminal deadline of the scheme to **15 September 2026**. 

The scheme has now concluded. No subsequent MCA circular has extended the scheme. Any corporate services website actively promoting current availability of CCFS-2026 after September 15, 2026 creates serious legal liability under the Consumer Protection Act, 2019 (deceptive trade practices).

---

## 2. Quantitative Scan: 166 Occurrences Audited

An automated scan across all repository files (excluding `.git` and `node_modules`) identified **166 occurrences** of terms matching `ccfs`, `companies compliance facilitation`, `15 sep.*2026`, or `amnesty`.

### Distribution Across Codebase:
1. **Client-Side Calculators (`assets/js/calculator.js`, `conversion/calculator.html`):** 16 occurrences.
2. **Interactive Chat Assistant (`assets/js/chat-widget.js`):** 10 occurrences.
3. **Entity Intelligence Engine (`assets/js/entity-intelligence.js`):** 6 occurrences.
4. **Data Schemas & Metadata (`data/ccfs-2026.json`, schema files):** 18 occurrences.
5. **Historical Planning Blueprint (`MERGE_BLUEPRINT.md`):** 46 occurrences.
6. **Remediation & Verification Reports (`docs/`):** 70 occurrences.

---

## 3. Ground Truth Verification Across Public Surfaces

### A. The Fee Calculator (`assets/js/calculator.js` & `conversion/calculator.html`)
- **TASK-003 Claim:** *"Calculator locks out CCFS-2026 calculation for dates past 15 September 2026."*
- **Actual Code Inspection:**
  In `assets/js/calculator.js` (lines 8–15, 499–518):
  ```javascript
  const CCFS_2026_DEADLINE = new Date('2026-09-15T23:59:59+05:30');
  const ccfsMode = Boolean(document.getElementById('ccfs-mode')?.checked) && Date.now() <= CCFS_2026_DEADLINE.getTime();
  ...
  function disableExpiredCcfsControl() {
    const closed = Date.now() > CCFS_2026_DEADLINE.getTime();
    if (closed && checkbox) {
      checkbox.disabled = true;
      checkbox.checked = false;
      ...
      label.appendChild(document.createTextNode(' CCFS-2026 closed 15 September 2026; historical relief is not applied.'));
    }
  }
  ```
  In `conversion/calculator.html` (line 117):
  ```html
  <input type="checkbox" id="ccfs-mode" onchange="calculateCost()" disabled> Closed 15 September 2026; no relief applied
  ```
- **Audit Verdict:** **VERIFIED PASS.** The calculator mathematically and visually enforces that CCFS-2026 is closed. Users cannot calculate or receive fee reductions under the expired scheme.

---

### B. The Global Chat Widget (`assets/js/chat-widget.js`) — RESIDUAL PROMOTION DETECTED
- **TASK-003 Claim:** *"Expired CCFS-2026 claims contained across the repository."*
- **Actual Code Inspection:**
  While the intent responses in `chat-widget.js` accurately explain that CCFS-2026 closed on 15 Sep 2026, **the widget actively promotes the scheme in public user-facing prompt text**:
  
  1. **Line 167 (Input Field Placeholder — Visible on all 123 pages):**
     ```javascript
     <input type="text" id="cchat-input-field" class="cchat-input" placeholder="Ask: 'AOC-4 due date', 'CCFS-2026 amnesty', 'MSME 45-day rule', 'RBI FLA filing'..." autocomplete="off">
     ```
  2. **Line 122 (Preset Quick-Action Buttons):**
     ```javascript
     ['CCFS-2026', 'What is the CCFS-2026 amnesty scheme deadline?']
     ```
  3. **Line 267 (Introductory Guidance Text):**
     ```javascript
     Select a prompt below or type your inquiry (e.g., "CCFS-2026 deadline", "MSME 45-day payment rule", "GSTR-2B reconciliation").
     ```
- **Audit Finding:** A first-time visitor landing on `ccs.craftegon.com` sees an input box asking them: *"Ask: 'CCFS-2026 amnesty'..."*. Presenting an expired amnesty scheme as a prominent recommended search query gives visitors the immediate impression that amnesty is currently available or that the platform's content is outdated.
- **Audit Verdict:** **PARTIALLY VERIFIED (Corrective Fix Required).**

---

### C. XML Sitemap Removal (`sitemap.xml`)
- **TASK-003 Claim:** *"Removed 4 non-existent CCFS URLs from sitemap.xml."*
- **Actual Code Inspection:**
  In `sitemap.xml`, the following 4 URLs were deleted in commit `324f4a4`:
  - `https://ccs.craftegon.com/ccfs-2026/`
  - `https://ccs.craftegon.com/ccfs-2026/eligibility`
  - `https://ccs.craftegon.com/ccfs-2026/fee-calculator`
  - `https://ccs.craftegon.com/ccfs-2026/engage`
- **Audit Verdict:** **VERIFIED PASS.** Removing these URLs prevented search engine crawlers from indexing 404 dead ends that claimed an expired scheme.

---

### D. Search Engine Test Fixture (`assets/js/search-engine.js:384`)
- **TASK-003 Claim:** *"Purged expired CCFS text from internal test fixture."*
- **Actual Code Inspection:**
  In `assets/js/search-engine.js` line 384:
  - Before: `"...CCFS-2026 amnesty available until 15 Sep 2026 (10% additional fee)."`
  - After: `"...Statutory fees governed under Section 403 of Companies Act 2013"`
- **Audit Verdict:** **VERIFIED PASS.**

---

### E. Entity Intelligence Dynamic Status (`assets/js/entity-intelligence.js`)
- **Code Inspection:**
  Lines 2, 40–43:
  ```javascript
  const ccfsDeadline = new Date('2026-09-15T23:59:59+05:30');
  const ccfsOpen = Date.now() <= ccfsDeadline.getTime();
  ...
  'CCFS-2026',
  ccfsOpen
    ? 'The scheme deadline is 15 September 2026. Confirm form eligibility...'
    : 'The scheme deadline of 15 September 2026 has passed. Do not apply the historical 10% additional-fee treatment to a current filing.'
  ```
- **Audit Verdict:** **VERIFIED PASS.** Correctly branches to display the expired notice for dates after 15 September 2026.

---

## 4. Other Regulatory Content Audited

| Statute / Regulatory Topic | Code Location | Published Position | Statutory Reality | Verification Finding |
| :--- | :--- | :--- | :--- | :---: |
| **Section 403 (₹100/day Late Fees)** | `calculator.js`, `roc-annual-compliance.html` | Calculates ₹100/day per form without cap | Active and enforced under Companies Act 2013 | **VERIFIED ACCURATE** |
| **MSME 45-Day Payment Rule (Sec 43B(h))** | `msme-compliance.html` | 45-day payment window for tax deductibility | In effect for AY 2024-25 onwards | **VERIFIED ACCURATE** |
| **DIN KYC Annual Deadline** | `dir3-kyc.html`, `chat-widget.js` | 30 September annual deadline, ₹5,000 reactivation fee | Rule 12A of Companies Rules | **VERIFIED ACCURATE** |
| **GST E-Invoicing 30-Day Limit** | `gst-annual.html` | Mandate to upload within 30 days for $\ge$ ₹5Cr turnover | CBIC notification enforced | **VERIFIED ACCURATE** |
| **RBI FLA Return Annual Filing** | `rbi-fla-return.html` | Annual return due 15 July for entities with FDI/ODI | RBI Master Direction enforced | **VERIFIED ACCURATE** |

---

## 5. Corrective Action Required Before Release

To complete the regulatory stabilization, the following single corrective change is required in `assets/js/chat-widget.js`:
1. **Line 167:** Update input placeholder to remove `'CCFS-2026 amnesty'`:
   - Replace with: `placeholder="Ask: 'AOC-4 due date', 'DIR-3 KYC deadline', 'MSME 45-day rule', 'RBI FLA filing'..."`
2. **Line 122:** Replace quick prompt `['CCFS-2026', 'What is the CCFS-2026 amnesty scheme deadline?']` with an active compliance topic:
   - Replace with: `['DIR-3 KYC', 'What is the annual Director KYC deadline?']`
3. **Line 267:** Update intro prompt text:
   - Replace `"CCFS-2026 deadline"` with `"DIR-3 KYC annual deadline"`.
