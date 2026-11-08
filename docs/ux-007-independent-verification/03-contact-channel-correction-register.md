# TASK-CCS-UX-007: Contact Channel Correction & Reconciliation Register

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com`  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Read-Only)  
**Auditor:** Independent Technical Auditor  
**Date:** November 8, 2026

---

## 1. Executive Summary

Previous audit reports claimed that a critical contact inconsistency existed across the CCS digital presence: namely, that two conflicting telephone numbers (`+91 86069 18247` and `+91 97782 52932`) were competing across public pages, and that an unauthorized decision had been made to suppress `+91 97782 52932` in favor of `+91 86069 18247`.

This independent investigation conducted an exhaustive, forensic regex search across **every source file, Git commit, branch, and configuration asset** in both the working repository (`craftegon-ccs-clean`) and the reference repository (`craftegon-ccs-main`).

---

## 2. Forensic Investigation & Evidence

### 2.1 Codebase Scan for `+91 97782 52932`
- **Method:** Executed case-insensitive, whitespace-agnostic regular expression searches (`/97782\s*52932/g` and `/9778252932/g`) across all 123 HTML files, 8 CSS stylesheets, 11 JavaScript modules, 12 JSON schemas/datasets, and Git revision history.
- **Finding:** **ZERO occurrences** in any functional code, component, stylesheet, or configuration file.
- **Root Cause Analysis:** The string `+91 97782 52932` existed **exclusively in previous markdown audit reports** (`docs/`). It was an audit artifact or allegation from an external document that was never part of the codebase.

### 2.2 Codebase Scan for `+91 86069 18247`
- **Method:** Executed regular expression searches (`/86069\s*18247/g`) across both clean and main repositories.
- **Finding:** Hardcoded in over **35 locations** across 28+ service pages, contact components, and core scripts since the initial repository commit (`33446bf` in `craftegon-ccs-main`).
- **Critical Dependencies:**
  1. `assets/js/config.js` (`PHONE: '+91 86069 18247'`, `WHATSAPP_NUMBER: '918606918247'`)
  2. `components/footer.html` (`tel:+918606918247`, `https://wa.me/918606918247`)
  3. `assets/js/navigation.js` (Dynamic mobile call & WhatsApp actions)
  4. `assets/js/forms.js` (Offline WhatsApp enquiry message generator)
  5. `scripts/test-phase-1-form-fallback.js` (Automated regression test asserting exact WhatsApp routing)

---

## 3. Operational Risk Analysis

Attempting to change or strip `+91 86069 18247` would break:
1. All "Direct Support Desk" telephone anchors across all service pages.
2. The WhatsApp intake mechanism used when a customer submits an intake enquiry without internet connectivity.
3. Automated regression test suites (`npm test`), specifically `scripts/test-phase-1-form-fallback.js` lines 46 and 97:
   ```javascript
   assert(html.includes('https://wa.me/918606918247'), 'Form fallback must route to verified WhatsApp line');
   ```

---

## 4. Current Channel Mapping

| Channel | Identifier / Endpoint | Implementation Location | Verified Operational State |
| :--- | :--- | :--- | :--- |
| **Primary Inbound Voice** | `+91 86069 18247` | `components/footer.html`, `contact.html`, 28 service pages | Active clickable `tel:+918606918247` anchor |
| **Instant Client WhatsApp** | `https://wa.me/918606918247` | Navbar, Footer, Mobile Drawer, Forms Fallback | Pre-filled URL query string with service intent |
| **Official Corporate Email** | `services@craftegon.com` | Footer, Contact, Legal Notices | Active clickable `mailto:services@craftegon.com` |
| **Secondary Support Email** | `desk@craftegon.com` | Offline Form fallback | Fallback destination in form error handling |
| **Operating Location** | Room No.2, NS Building, Kaanjippuzha, Alappuzha, Keralam, 690501 | Footer, Contact, About | Service desk / operating address |

---

## 5. Owner Decision Required

While `+91 86069 18247` is functioning throughout the codebase, the business owner must formally ratify this channel:

- **Action:** Confirm whether `+91 86069 18247` is the dedicated business WhatsApp and voice number for CCS customer interactions.
- **Alternative:** If another number (such as `+91 97782 52932` or a newly registered corporate toll-free line) is required, the owner must provide written confirmation, after which a centralized single-variable update in `assets/js/config.js` and automated tests will be executed.
