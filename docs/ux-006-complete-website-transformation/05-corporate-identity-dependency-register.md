# 05. CORPORATE IDENTITY DEPENDENCY REGISTER

**Project:** CraftEgon Corporate Services (CCS)  
**Status:** UNRESOLVED CORPORATE IDENTITY DEPENDENCIES PRESERVED WITHOUT FABRICATION  
**Principle:** Documented with exact file locations and legal implications. No entity status is chosen without verified owner documentation.

---

## 1. Overview of Identity Dependencies

During the codebase audit, multiple historical and working corporate identity strings were identified across configuration files, footer disclosures, JSON-LD schemas, and test fixtures. Rather than making unverified legal assumptions, this register catalogs every occurrence to provide the business owner with a definitive decision ledger.

---

## 2. Identified Corporate Entities

### Entity A: CraftEgon LLP
- **Legal Form:** Limited Liability Partnership under the LLP Act, 2008.
- **LLPIN:** `ACA-3972` (referenced in benchmark fixtures and test datasets).
- **Current Usage:**
  - Used in `components/footer.html` copyright: *"© 2026 CraftEgon LLP. All rights reserved."*
  - Used in root `index.html` JSON-LD schema: `"legalName": "CraftEgon LLP"`.
  - Used in `package.json`: `"author": "CraftEgon LLP"`.
  - Used in `legal/terms.html` and `legal/disclaimer.html`.
- **Status:** Primary entity referenced across current public disclosures.

### Entity B: CraftEgon Technologies Private Limited
- **Legal Form:** Private Limited Company under the Companies Act, 2013.
- **CIN References Found:**
  1. `U72900KA2021PTC148562` (referenced in `assets/js/forms.js` validation fixtures and `assets/js/search-engine.js` benchmark entity profile).
  2. `U74999KL2021PTC068942` (referenced in earlier Kerala incorporation intake samples).
  3. `U72200KL2023PTC081234` (referenced in draft tech services test scripts).
- **Current Usage:**
  - Embedded as sample / benchmark entity in lookup engines.
- **Status:** Unresolved parent vs subsidiary vs operating entity relationship.

---

## 3. Registered Office Address Discrepancies

| Address Variation | Location Found | Notes / Status |
| :--- | :--- | :--- |
| **Address 1 (Alappuzha, Kerala)**<br>`Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, India - 690501` | `components/footer.html`<br>`assets/js/navigation.js`<br>`about.html`<br>`legal/*.html` | **Current verified physical office address** specified by owner. Unified across all public footer and policy disclosures. |
| **Address 2 (Bangalore, Karnataka)**<br>`Indiranagar / Koramangala, Bengaluru, Karnataka, 560038` | Legacy test fixtures<br>Historical draft documentation | Associated with earlier MCA Karnataka CIN (`U72900KA2021PTC148562`). Preserved in test fixtures. |
| **Address 3 (Kochi, Kerala)**<br>`Kakkanad, Kochi, Kerala, 682030` | Sample intake fixtures | Demo and testing data only. |

---

## 4. Owner Decision Required

The business owner must provide formal instruction on:
1. Whether **CraftEgon LLP** is the sole operating contracting entity for CCS public services.
2. The official corporate status of **CraftEgon Technologies Private Limited** (e.g. technology IP holding company vs dormant entity).
3. The canonical CIN/LLPIN to be displayed on institutional invoice footers and MCA regulatory filings.
