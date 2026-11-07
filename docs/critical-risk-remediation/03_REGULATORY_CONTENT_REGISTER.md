# CRAFTEGON CORPORATE SERVICES (CCS)
## Critical Risk Verification, Public-Claim Containment & Commercial Identity Stabilisation
### Report 03: Regulatory Content Register & Statutory Claim Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** All statutory, regulatory, and legal compliance references across 123 HTML files, JavaScript calculators, and XML sitemaps  
**Applicable Legal Frameworks:** Companies Act 2013, Income Tax Act 1961, Central Goods & Services Tax (CGST) Act 2017, Foreign Exchange Management Act (FEMA) 1999, Trade Marks Act 1999  
**Status:** AUDITED, PURGED & STABILIZED  

---

## 1. Regulatory Audit Context & Objectives

A corporate services business derives its market credibility and legal defense from the strict precision of its statutory guidance. Publishing expired amnesty schemes, inaccurate penalty formulas, or unverified filing timelines can expose clients to statutory default and subject the firm to liability under the Consumer Protection Act, 2019.

This audit evaluates all statutory assertions published across the CraftEgon CCS codebase to:
1. Verify statutory accuracy under current circulars and notifications.
2. Identify expired schemes (particularly CCFS-2026).
3. Confirm calculator mathematical correctness under Section 403 of the Companies Act, 2013.
4. Eliminate dead URLs and obsolete claims from search engine indices.

---

## 2. Master Regulatory Content Register

| Regulatory Subject | Statutory / Administrative Authority | Published Position on CCS | Current Sovereign Legal Status | Codebase Location | Audit Finding & Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Companies Fresh Start Scheme 2026 (CCFS-2026)** | MCA General Circular No. 04/2026 (Ministry of Corporate Affairs) | Immunity from prosecution and waiver of additional late filing fees for defaulting companies upon payment of normal statutory fees. | **EXPIRED.** The extended window closed on **15 September 2026**. No further extension notified by MCA. | `conversion/calculator.html`, `assets/js/calculator.js`, `sitemap.xml`, `assets/js/search-engine.js` | **CONTAINED:** `calculator.js` already disables `#ccfs-mode` for calculation dates past 15 Sep 2026. Purged 4 non-existent URLs (`/ccfs-2026/*`) from `sitemap.xml`. Replaced expired text in `search-engine.js` test fixture. |
| **Section 403 Additional Fees (RoC Annual Returns)** | Section 403 read with Section 92 (MGT-7) & Section 137 (AOC-4) of Companies Act, 2013 | Additional fee of ₹100 per day of default per form, with no statutory cap for delayed filings. | **ACTIVE & ACCURATE.** Continues to govern statutory late fees across all Registrar of Companies (RoC) jurisdictions. | `assets/js/calculator.js`, `services/roc-annual-compliance.html`, `conversion/calculator.html` | **VERIFIED ACCURATE.** Mathematical logic in `calculator.js` calculates exact `days * 100 * numberOfForms`. Default guidance accurately informs clients of uncapped exposure. |
| **MSME 45-Day Payment Mandate (Section 43B(h))** | Section 43B(h) of Income Tax Act, 1961 read with Section 15 of MSMED Act, 2006 | Disallowance of expenses payable to Micro and Small enterprises if unpaid within agreed period (max 45 days / 15 days without agreement). | **ACTIVE & ACCURATE.** Mandatory for Assessment Year 2024-25 and subsequent assessment years. | `services/msme-compliance.html`, `sitemap.xml` | **PARTIALLY CONTAINED:** Substantive guidance on service pages is accurate. However, `sitemap.xml` contained 4 dead URLs for unbuilt `/msme-43bh/*` tools. **Action:** Purged dead URLs from `sitemap.xml`. |
| **Annual Director KYC (Form DIR-3 KYC / Web-KYC)** | Rule 12A of Companies (Appointment and Qualification of Directors) Rules, 2014 | Mandatory annual filing for all DIN holders on or before 30 September of the immediately following financial year; ₹5,000 late reactivation fee. | **ACTIVE & ACCURATE.** Governs annual director compliance; non-filing marks DIN "Deactivated due to non-filing of DIR-3 KYC". | `services/dir3-kyc.html`, `assets/js/chat-widget.js`, `sitemap.xml` | **CONTAINED:** Removed 1 dead article URL (`/learn/article/dir-3-kyc-annual-2026`) from `sitemap.xml`. Substantive guidance on `services/dir3-kyc.html` is legally accurate. |
| **GST E-Invoicing 30-Day Reporting Mandate** | CBIC Notification & GSTN Advisory (Mandatory IRP reporting) | Mandate for taxpayers with aggregate turnover $\ge$ ₹5 Crore to upload e-invoices to IRP within 30 days of invoice date. | **ACTIVE.** Governs time-bound generation of Invoice Reference Numbers (IRN). | `services/gst-annual.html`, `sitemap.xml` | **CONTAINED:** Removed dead article URL (`/learn/article/gst-einvoicing-30-day-mandate-2026`) from `sitemap.xml`. |
| **RBI Foreign Liabilities & Assets (FLA) Return** | A.P. (DIR Series) Circular No. 37 & Foreign Exchange Management Act (FEMA), 1999 | Mandatory annual reporting by 15 July for all Indian entities that have received Foreign Direct Investment (FDI) or made Overseas Direct Investment (ODI). | **ACTIVE & ACCURATE.** Governed via RBI FLAIR portal. Late submission attracts compounding under Section 15 of FEMA. | `services/rbi-fla-return.html`, `assets/js/chat-widget.js` | **VERIFIED ACCURATE.** Statutory guidance, portal requirements (audited balance sheet prerequisite), and compounding provisions accurately reflected. |
| **Fast-Track Company Strike-Off (Form STK-2)** | Section 248(2) of Companies Act, 2013 read with Companies (Removal of Names) Rules, 2016 | Voluntary closure of defunct companies non-operational for 2 consecutive financial years; statutory filing fee ₹10,000. | **ACTIVE & ACCURATE.** Requires zero liabilities, special resolution (75% consent), and indemnity bonds (STK-3/STK-4). | `services/form-stk2-strike-off.html`, `conversion/strike-off-checker.html` | **VERIFIED ACCURATE.** Rule requirements, prerequisite closures (bank account closure, GST surrender), and eligibility checks accurately implemented. |
| **Demat Mandate for Private Companies (Form PAS-6)** | Rule 9B of Companies (Prospectus and Allotment of Securities) Rules, 2014 | Mandatory half-yearly dematerialisation reconciliation for private companies (other than small companies); filed within 60 days of half-year end. | **ACTIVE & ACCURATE.** Enforced since 30 September 2024 compliance deadline. | `services/demat-private-company.html`, `assets/js/search-index.js` | **VERIFIED ACCURATE.** ISIN requirements, depository connectivity (NSDL/CDSL), and RTA engagement guidelines correctly articulated. |
| **Transfer Pricing Accountant's Report (Form 3CEB)** | Section 92E of Income Tax Act, 1961 | Mandatory report by Chartered Accountant for entities entering into international transactions or specified domestic transactions; due 31 October. | **ACTIVE & ACCURATE.** Default penalty ₹1,00,000 under Section 271BA for failure to furnish report. | `services/form-3ceb.html`, `conversion/tax-intake.html` | **VERIFIED ACCURATE.** Emphasizes that Form 3CEB requires mandatory certification by a practicing Chartered Accountant. |
| **Digital Personal Data Protection Compliance** | Digital Personal Data Protection (DPDP) Act, 2023 | Obligations of Data Fiduciaries: notice, explicit unbundled consent, data minimization, breach reporting, penalties up to ₹250 Crores. | **ENACTED.** Statutory provisions passed; rules and operationalisation under Data Protection Board in phased rollout. | `services/dpdp-compliance-audit.html`, `conversion/dpdp-audit-request.html` | **VERIFIED & CONTAINED.** Guidance accurately identifies DPDP as an enacted statute. Website intake forms aligned to principle of data minimization (PAN/GSTIN made optional). |

---

## 3. Detailed Audit of the CCFS-2026 Issue

### Statutory Background:
The Ministry of Corporate Affairs launched the Companies Fresh Start Scheme (CCFS) to provide a one-time condonation of delay for filing overdue statutory forms without attracting the punitive ₹100/day additional fees under Section 403. By General Circular 04/2026, the MCA set the terminal deadline as **September 15, 2026**.

### Risk Analysis of CCS Codebase:
1. **The Risk:** If a prospective client visits `ccs.craftegon.com` today and is told they can file 3 years of overdue returns under CCFS-2026 for a nominal government fee, and they subsequently discover that they owe ₹1,50,000+ in Section 403 fees, CraftEgon would face accusations of misrepresentation.
2. **Current Codebase Audit:**
   - **`assets/js/calculator.js` (Lines 88–96):**
     ```javascript
     const ccfsCheckbox = document.getElementById("ccfs-mode");
     const today = new Date();
     const ccfsExpiry = new Date("2026-09-15");
     if (today > ccfsExpiry) {
       ccfsCheckbox.disabled = true;
       ccfsCheckbox.checked = false;
       document.getElementById("ccfs-expiry-notice").textContent = 
         "CCFS-2026 amnesty concluded on 15 September 2026. Standard Section 403 fees apply.";
     }
     ```
     *Finding:* The dynamic calculator correctly enforces expiry logic.
   - **`sitemap.xml`:**
     Previously published 4 live URLs for CCFS-2026:
     - `https://ccs.craftegon.com/ccfs-2026/`
     - `https://ccs.craftegon.com/ccfs-2026/eligibility`
     - `https://ccs.craftegon.com/ccfs-2026/fee-calculator`
     - `https://ccs.craftegon.com/ccfs-2026/engage`
     *Finding:* None of these files existed on disk (would return 404), yet their presence in `sitemap.xml` caused search engine crawlers to index obsolete amnesty services.
     *Action Taken:* **Permanently excised all 4 CCFS-2026 URLs from `sitemap.xml`.**

---

## 4. Elimination of Sitemap Ghost URLs

During the audit under TASK-CCS-UX-003, `sitemap.xml` was inspected for consistency against the physical filesystem. The audit identified that **24 URLs out of 141 (17%)** were non-existent ghost URLs.

### Full Inventory of 24 Purged Sitemap URLs:

```
1.  /learn/
2.  /learn/category/mca
3.  /learn/category/gst
4.  /learn/category/income-tax
5.  /learn/category/fema
6.  /learn/category/ipr
7.  /learn/category/labour
8.  /learn/category/corporate-governance
9.  /learn/article/aoc-4-filing-guide-2026
10. /learn/article/dir-3-kyc-annual-2026
11. /learn/article/ccfs-2026-amnesty-scheme-2026
12. /learn/article/gst-einvoicing-30-day-mandate-2026
13. /ccfs-2026/
14. /ccfs-2026/eligibility
15. /ccfs-2026/fee-calculator
16. /ccfs-2026/engage
17. /msme-43bh/
18. /msme-43bh/payment-tracker
19. /msme-43bh/form-msme1-generator
20. /msme-43bh/engage
21. /partners/banking
22. /partners/banking/yes-bank
23. /partners/banking/icici
24. /partners/banking/dbs
```

### Result:
- Pre-Remediation URLs: 141
- Ghost URLs Removed: 24
- Post-Remediation Verified URLs: 117
- Physical Existence Rate: **100% (117/117 exist on disk)**
- Test Verification: `npm test` passed 75/75 test suites without errors.

---

## 5. Ongoing Regulatory Governance Protocol

To maintain 100% statutory precision going forward:
1. **Quarterly Gazette Review:** Review MCA General Circulars, CBDT Notifications, CBIC Circulars, and RBI Master Directions at the end of each calendar quarter.
2. **Strict Expiry Enforcement:** Whenever a temporary amnesty, compliance scheme, or filing window is referenced in marketing content or calculators, it must be paired with an automated JavaScript lockout date and an explicit disclaimer.
3. **No Unbuilt URLs in Sitemaps:** Sitemaps must only be populated via automated build scripts that inspect physical files on disk, preventing orphan/ghost indexing.
