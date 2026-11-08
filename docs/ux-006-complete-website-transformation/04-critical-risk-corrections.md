# 04. CRITICAL RISK CORRECTIONS (WORKSTREAM A)

**Project:** CraftEgon Corporate Services (CCS)  
**Execution Context:** TASK-CCS-UX-006 Workstream A Verification & Remediation  
**Status:** ALL CRITICAL RISKS REMEDIATED AND TESTED

---

## 1. Summary of Workstream A Remediations

Workstream A targeted specific operational, regulatory, and privacy risks identified during prior audits. Every defect was verified on the actual working codebase, modified, and validated against automated test suites.

---

## 2. Detailed Findings & Actions Taken

### Defect A1: Public Suggestion of Expired CCFS-2026 Amnesty Scheme
- **Vulnerability Identified:**  
  Although the calculator logic in `assets/js/calculator.js` correctly disabled the expired scheme after its 15 September 2026 cutoff, the public AI chat widget (`assets/js/chat-widget.js`) was still actively prompting visitors to inquire about it:
  - Line 122: Preset pill button `['CCFS-2026', 'What is the CCFS-2026 amnesty scheme deadline?']`
  - Line 167: Input placeholder `placeholder="Ask: 'AOC-4 due date', 'CCFS-2026 amnesty'..."`
  - Line 267: Intro greeting text `...type your inquiry (e.g., "CCFS-2026 deadline"...`
- **Remediation Action:**  
  1. Replaced pill button at line 122 with an active annual milestone:  
     `['DIR-3 KYC', 'What is the annual Director KYC deadline?']`
  2. Updated input placeholder at line 167:  
     `placeholder="Ask: 'AOC-4 due date', 'DIR-3 KYC deadline', 'MSME 45-day rule', 'RBI FLA filing'..."`
  3. Updated intro greeting at line 267:  
     `Select a prompt below or type your inquiry (e.g., "DIR-3 KYC deadline", "MSME 45-day payment rule", "GSTR-2B reconciliation").`
- **Verification Evidence:**  
  - Tested with `node -c assets/js/chat-widget.js` (Syntax clean).
  - Executed `scripts/test-chat-engine.js` (10/10 intents matched, 30/30 action URLs verified).
  - Verified `scripts/test-round-3-utilities.js` passes (calculator retains disabled "Closed" state for CCFS-2026).

---

### Defect A2: Client Portal Prototype Status Disclosures
- **Vulnerability Identified:**  
  The Client Portal (`portal/dashboard.html`, `portal/index.html`, `portal/subscription.html`) presents an interactive Compliance Calendar OS with sample entity lookups. Without clear persistent watermarking, prospective clients could mistake it for a live government-integrated portal.
- **Remediation Action:**  
  Injected a prominent, non-dismissible demonstration disclosure banner across all portal entry points:
  ```html
  <aside class="portal-prototype-banner" role="status" aria-label="Demonstration Prototype Notice" style="background: #F4FAF7; border: 1px solid #75CDA9; border-left: 4px solid #247A62; padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 1.75rem; display: flex; align-items: flex-start; gap: 0.85rem; color: #193B46;">
    ...
    <strong style="color: #193B46; font-size: 0.95rem; display: block; margin-bottom: 0.25rem;">DEMONSTRATION PREVIEW — Interactive Client Dashboard Prototype</strong>
    <p style="margin: 0; font-size: 0.88rem; color: #243746; line-height: 1.5;">
      This client portal interface is an interactive demonstration preview. Client records and live authentication launch Q1 2027. No client data is stored or transmitted in this demonstration environment.
    </p>
  </aside>
  ```
- **Verification Evidence:**  
  Verified presence and accessible markup on `portal/dashboard.html`, `portal/index.html`, and `portal/subscription.html`.

---

### Defect A3: Executive Admin Console Access Containment
- **Vulnerability Identified:**  
  The internal administration console (`admin/index.html` and `admin/login.html`) must never be accessible or indexed as a public marketing page.
- **Remediation Action:**  
  1. Confirmed both `admin/index.html` and `admin/login.html` contain:  
     `<meta name="robots" content="noindex, nofollow">`
  2. Confirmed `robots.txt` includes `Disallow: /admin/`.
  3. Confirmed zero public navigation links to `/admin/` exist in `components/navbar.html`, `components/footer.html`, `sitemap.xml`, or content pages.
  4. Added prominent demonstration banners inside `admin/index.html` and `admin/login.html` stating that the static interface is disconnected from live operational databases.
- **Verification Evidence:**  
  Search across all public HTML and JS files returned zero references to `/admin/`.

---

### Defect A4: Preliminary Enquiry Form Data Minimisation
- **Vulnerability Identified:**  
  Risk of requiring sensitive tax/identity numbers (PAN, GSTIN, Aadhaar) on initial inquiry forms or transmitting them via insecure URL parameters during WhatsApp/mailto fallback handoffs.
- **Remediation Action:**  
  1. In `assets/js/forms.js`, line 59 ensures non-required fields are bypassed during validation if blank.
  2. Conversion intake templates (`conversion/tax-intake.html`, `services/gst-annual.html`, etc.) designate PAN and GSTIN as strictly optional preliminary context.
  3. Fallback handoffs (`showFormFallbackNotice`) serialize only contact name, email, phone, and service scope into WhatsApp and mailto links. Zero tax numbers or personal identifiers enter URL query parameters.
- **Verification Evidence:**  
  `scripts/test-phase-1-form-fallback.js` passed all 55 form tests with 0 failures.
