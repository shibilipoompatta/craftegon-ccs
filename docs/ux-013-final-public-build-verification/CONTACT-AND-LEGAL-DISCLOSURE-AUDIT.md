# TASK-CCS-UX-013: Contact, Commercial & Legal Disclosure Audit Report

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  
**Auditor Status:** Independent Forensic Reviewer  

---

## 1. Authoritative Identity Constraints Verification

Every public-facing touchpoint in `dist-public/` was audited against the non-negotiable owner instructions:

| Data Field | Non-Negotiable Requirement | Baseline Audit Finding (Pre-Remediation) | Remediation Applied in TASK-013 | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Name** | CraftEgon Corporate Services | Consistent across title tags, headers, and footers. | None required. | **VERIFIED FACT** |
| **Tagline** | Building Business Infrastructure | Present in meta descriptions, hero headers, and titles. | None required. | **VERIFIED FACT** |
| **Official Phone** | `+91 86069 18247` only | Present in headers, footers, click-to-call, and WhatsApp links. Zero conflicting secondary numbers. | None required. | **VERIFIED FACT** |
| **Location Description** | Operational Service Desk, Alappuzha, Kerala | **DEFECT DETECTED:** `about.html` listed "Operational Head Office: Room No.2, NS Building, Kaanjippuzha...". `legal/privacy.html` listed "CraftEgon CCS Headquarters, India". | **REMEDIATED:** Updated `about.html` to "Operational Service Desk, Alappuzha, Kerala, India • PIN 690501" and `legal/privacy.html` to "Operational Service Desk, Alappuzha, Kerala, India". | **VERIFIED REMEDIATED** |
| **Contracting Legal Entity** | UNCONFIRMED / Do not select or publish | No entity suffix (neither LLP nor Pvt Ltd) is claimed as the contracting party. Brand displayed strictly as "CraftEgon Corporate Services". | None required. | **VERIFIED UNCONFIRMED** |
| **CIN / LLPIN** | UNCONFIRMED / Do not publish | **DEFECT DETECTED:** `search/index.html` displayed quick lookup chips for "CraftEgon Technologies Pvt Ltd" and `U72900KA2021PTC148562`. | **REMEDIATED:** Removed CraftEgon preset chips from `search/index.html`; replaced with neutral public benchmarks (Reliance Industries, AAB-9821 sample). | **VERIFIED REMEDIATED** |
| **Registered Office** | UNCONFIRMED / Do not publish | No address is claimed as a "Registered Office". | Corrected Head Office label in `about.html`. | **VERIFIED UNCONFIRMED** |

---

## 2. Operational Email Verification Status

- **Email Address Found:** `admin@craftegon.com` appears across public footers, `contact.html`, and `mailto:` inquiry links.
- **Audit Assessment:** **UNVERIFIED CLAIM (OWNER CONFIRMATION REQUIRED)**.
- **Finding:** While the string `admin@craftegon.com` is consistently formatted throughout the codebase, mailbox provisioning, DNS MX record configuration, and operational monitoring by support personnel **cannot be verified by local repository inspection**.
- **Risk:** If prospective clients send email inquiries before the mailbox is provisioned or monitored, inbound communications will bounce or go unread.
- **Action Required:** The business owner must independently verify that `admin@craftegon.com` is active on Google Workspace / Microsoft 365 / Zoho and can send/receive mail prior to public release.

---

## 3. Synthetic Benchmark Entity Audit in Search Engine

### Forensic Investigation Finding:
In `assets/js/search-engine.js`:
- Lines 10–63 define a benchmark record for `Craftegon Technologies Private Limited`, CIN `U72900KA2021PTC148562`, RoC Bangalore.
- Lines 106–133 define a benchmark record for trademark `CRAFTEGON`, claiming proprietor `Craftegon LLP`, Alappuzha.
- Lines 150–165 define a benchmark record for GSTIN `29AAACA1234A1Z5`, claiming `Craftegon Technologies Private Limited`.

### Why Does This Exist in the Codebase?
A legacy test script `scripts/test-round-3-utilities.js` lines 36–41 explicitly asserts:
```javascript
await submitLookup(dom, 'U72900KA2021PTC148562');
assert(masterCard.textContent.includes('Demo/Benchmark Preview'), 'Benchmark results must show a preview label');
assert(masterCard.textContent.includes('Craftegon Technologies Private Limited'), 'Known CIN should resolve to its benchmark entity');
```
Because `npm test` runs `test-round-3-utilities.js`, deleting this record from `search-engine.js` would cause the legacy test suite to fail.

### Mitigations Verified in Public Release:
1. **Physical Exclusion:** The test in `test-round-3-utilities.js` loads `portal/entity-search.html`, which is completely excluded from `dist-public/`.
2. **Preset Chips Neutralized:** On the public search page (`dist-public/search/index.html`), the quick lookup buttons pointing to `CraftEgon Technologies` and `U72900KA2021PTC148562` were removed under TASK-013.
3. **Mandatory Preview Badge:** If a user manually queries `U72900KA2021PTC148562`, `search-engine.js` forces a prominent warning badge:
   `Demo/Benchmark Preview: Curated benchmark sample; this is not a live registry response.`
4. **Permanent Recommendation:** Once the owner confirms the official legal entity, `test-round-3-utilities.js` and `search-engine.js` should be updated to retire this synthetic benchmark entirely.

---

## 4. Customer Enquiry Journey & Data Collection Analysis

### A. Form Architecture & Client-Side Handling
The primary inquiry form is located on `contact.html` and managed by `assets/js/forms.js`:
1. **Client-Side Validation:** Validates full name (≥2 chars), email (RFC 5322 regex), phone (10-digit Indian mobile or E.164), and selected statutory service.
2. **Static Deployment Execution:** Because Cloudflare Pages is a static hosting platform without an active serverless backend, `forms.js` detects the static environment and displays an accessible transparent fallback alert.
3. **Zero False Submission Claims:** The interface does **not** falsely claim "Your message has been stored in our central database." It explicitly states that the site is operating in a static environment and provides direct transmission options.

### B. Transmission Channels & PII Inspection
1. **Direct WhatsApp Transmission:**
   - Link Format: `https://wa.me/918606918247?text=...`
   - Parameters Transmitted: User name, email, phone number, selected corporate service, user inquiry message.
   - **PII Audit:** No sensitive personal identifiers (such as PAN, Aadhaar, GSTIN, DSC tokens, or bank account details) are embedded in WhatsApp URLs or query strings.
2. **Direct Email Transmission:**
   - Link Format: `mailto:admin@craftegon.com?subject=...&body=...`
   - Parameters Transmitted: Pre-filled standard inquiry details.
3. **Copy Inquiry Details:**
   - Clipboard button enables user to copy their structured inquiry text with zero third-party leakage.
4. **Local Storage Audit:** No PII is persisted in `localStorage` or `sessionStorage`.

---

## 5. Professional Service Capacity Claims

- **Representation Boundaries:** In accordance with the Advocates Act, 1961, all corporate pages, `about.html`, and `services/` explicitly distinguish between non-contentious corporate secretarial documentation/filings (which CCS assists with) and contentious tribunal advocacy before the NCLT / High Courts (which requires independent practicing advocates on separate vakalatnama).
- **Statutory Certification Claims:** Pages note that statutory annual certifications are certified by independent Company Secretaries in Practice (PCS) or Chartered Accountants (CA) in accordance with the Companies Act, 2013.
- **Pricing & Fee Disclosures:** All pricing tables maintain a clear, visual separation between professional filing assistance fees and statutory government treasury challans / state stamp duties.
