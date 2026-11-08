# TASK-CCS-UX-007: Business Owner Decisions & Authorisation Register

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com`  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Auditor:** Independent Technical Auditor  
**Date:** November 8, 2026

---

## 1. Executive Notice for Business Owner

Following the comprehensive technical audit, unauthorized claim containment, and mobile responsiveness stabilization executed in **TASK-CCS-UX-007**, the codebase is technically stable, 100% test-verified, and safe for preview.

However, to ensure strict legal and regulatory compliance under Indian corporate law, **five high-priority business determinations** require your formal selection and sign-off before initiating public DNS cutover.

Please review each decision item below and provide your written confirmation.

---

## 2. Decision Register

### DECISION 1: Formal Legal Entity Structure
- **Current Code Status:** Neutralized to the trade brand **"CraftEgon Corporate Services (CCS)"** across all public footers, metadata, and narratives.
- **Options Available:**
  - `[ ] Option 1A:` **CraftEgon LLP** (Limited Liability Partnership registered under the LLP Act, 2008).
  - `[ ] Option 1B:` **CraftEgon Private Limited** (Private limited company registered under the Companies Act, 2013).
  - `[ ] Option 1C:` **CraftEgon Services** (Sole Proprietorship / Partnership firm).
  - `[ ] Option 1D:` **Retain Brand Identity Only** (Publish as "CraftEgon Corporate Services", withholding statutory entity disclosure until incorporation is finalized).
- **Owner Selection / Notes:** __________________________________________________

---

### DECISION 2: Statutory Identification Number Publication (CIN / LLPIN)
- **Current Code Status:** Omitted from public pages to prevent fictitious or placeholder registration claims.
- **Options Available:**
  - `[ ] Option 2A:` Publish official **LLPIN** (e.g., `LLPIN: ACA-XXXX`).
  - `[ ] Option 2B:` Publish official **CIN** (e.g., `CIN: U74999KL2026PTC012345`).
  - `[ ] Option 2C:` Omit statutory registration number from footer until official certificate is issued.
- **Official Identifier (if applicable):** ________________________________________

---

### DECISION 3: Official Contact Phone & WhatsApp Line
- **Current Code Status:** Configured as `+91 86069 18247` across 28+ service pages, footer, offline form fallback, and automated test assertions.
- **Background:** Forensic investigation verified that `+91 97782 52932` was only an audit report allegation and never existed in application source code.
- **Options Available:**
  - `[ ] Option 3A (Recommended):` **Ratify `+91 86069 18247`** as the official customer voice and WhatsApp support line.
  - `[ ] Option 3B:` Replace with `+91 97782 52932` across all templates, config, and automated tests.
  - `[ ] Option 3C:` Replace with a newly designated corporate toll-free or virtual desk number.
- **Designated Number:** _______________________________________________________

---

### DECISION 4: Client Portal Prototype Deployment Strategy
- **Current Code Status:** All speculative roadmap dates ("Q1 2027") and simulated encryption claims have been removed. `/portal/` is prominent with "Demonstration Prototype - Non-Production Preview" disclaimers.
- **Options Available:**
  - `[ ] Option 4A (Recommended):` **Keep `/portal/` live with prototype notices.** Useful for demonstrating forward-looking compliance tracking to prospective clients during sales conversations.
  - `[ ] Option 4B:` **Exclude `/portal/` from public production build** until full backend engineering is completed.
- **Owner Selection:** __________________________________________________________

---

### DECISION 5: Administrative Console Access Boundary
- **Current Code Status:** `/admin/` is excluded from search indexing (`noindex`, `robots.txt`, `sitemap.xml`) and displays "Demonstration Prototype". Form submission returns 404. However, direct URL navigation serves the static template.
- **Options Available:**
  - `[ ] Option 5A (Recommended):` **Protect `/admin/*` using Cloudflare Access (Zero Trust)** with email OTP authentication restricted to the business owner.
  - `[ ] Option 5B:` **Exclude `/admin/` from Cloudflare Pages build** (retain solely in private repository).
  - `[ ] Option 5C:` Leave as a demonstration mockup with current 404 API behavior.
- **Owner Selection:** __________________________________________________________

---

## 3. Sign-off Submission Form

To apply your decisions, please reply with your choices (e.g., `Decision 1: Option 1A, Decision 2: Option 2A [LLPIN], Decision 3: Option 3A, Decision 4: Option 4A, Decision 5: Option 5A`).
