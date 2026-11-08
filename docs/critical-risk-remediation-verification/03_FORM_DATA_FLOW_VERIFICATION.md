# CRAFTEGON CORPORATE SERVICES (CCS)
## Independent Remediation Verification & Release-Gate Audit
### Report 03: Forensic Form Data-Flow Audit & `forms.js` Discrepancy Investigation

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** `assets/js/forms.js`, all 39 HTML forms across `conversion/`, `services/`, and root pages  
**Core Question:** Why is `forms.js` absent from the modified files list, and can sensitive tax identifiers enter outbound URLs?  
**Audit Standard:** Forensic AST inspection, execution trace, and data flow modeling  
**Status:** DISCREPANCY CONFIRMED — DATA FLOW EXAMINED — PARTIALLY VERIFIED  

---

## 1. Resolution of the `forms.js` Discrepancy

### The Discrepancy:
In TASK-CCS-UX-003, Report 01 (`01_EXECUTIVE_FINDINGS.md`) and Report 04 (`04_ENQUIRY_DATA_FLOW_AUDIT.md`) made the following explicit claim:
> *"In assets/js/forms.js (lines 338–350), the API submission payload sanitizes data down to non-sensitive contact parameters (contact_name, email, phone, service_id, scope_description). Personal identifiers (PAN, GSTIN, Aadhaar) are deliberately excluded from automated URL query strings."*

Yet `assets/js/forms.js` was conspicuously absent from the 5-file modified-code inventory in Git commit `324f4a4`.

### Forensic Git Findings:
An inspection of the Git commit history for `assets/js/forms.js` established:
```
$ git log -n 5 --oneline assets/js/forms.js
2c9b703 feat(release): CraftEgon CCS static showcase launch (P0-P9 complete)
04960fe feat(round-4): implement pervasive AI counsel, form micro-automations...
a9aad72 REA architecture update via OpenCode
3c49b38 feat: consolidate CraftEgon CCS implementation, regulatory tools...
6f50976 chore(platform): comprehensive update of UI tokens, brand lockup...
```
- **Finding:** `assets/js/forms.js` was **last modified in commit `2c9b703`**.
- **Root Cause of Discrepancy:** The previous audit team discovered that `assets/js/forms.js` *already contained* selective payload mapping from prior development phases. The author described this pre-existing architecture as if it were a remediation action executed under TASK-003. 
- **Audit Verdict on Claim:** **VERIFIED FAIL (Documentation Inflation).** No code was modified in `assets/js/forms.js` under TASK-003.

---

## 2. Complete End-to-End Form Execution Trace

To determine whether client data (including optional PAN or GSTIN) can leak into outbound URLs, the complete frontend execution path was traced from DOM submission to external transport:

```
[ User Submits Form (.if-lead-form) ]
               |
               v
[ 1. Event Listener: assets/js/forms.js:273 ]
     - e.preventDefault()
     - Validates required fields via validateField()
               |
               v
[ 2. Data Ingestion: assets/js/forms.js:294-295 ]
     - const formData = new FormData(form);
     - const data = Object.fromEntries(formData.entries());
     --> Note: 'data' contains EVERY input field present in the form, 
         including 'pan', 'gstin', 'cin', etc., if filled by user.
               |
               v
[ 3. Preliminary Audit: assets/js/forms.js:296 ]
     - renderPreliminaryAudit(form, data)
     - Runs regex check on PAN/GSTIN if provided. Renders checklist card in DOM.
               |
               v
[ 4. Static Hosting Check: assets/js/forms.js:304 ]
     - if (form.dataset.staticFallback === "true" || window.CRAFTEGON_CONFIG?.isStatic === true)
     - In production (Cloudflare Pages), window.CRAFTEGON_CONFIG.isStatic is TRUE.
     - Routes directly to showFormFallbackNotice(form, data)
               |
               v
[ 5. Fallback Notice & URL Generation: assets/js/forms.js:601-641 ]
     - Reads contactName, phone, email, serviceName, scope from 'data'.
     - Calls cfg.getWhatsAppUrl(serviceName)
     - Calls cfg.getEmailUrl("Compliance Inquiry: " + serviceName)
```

---

## 3. Forensic Analysis: Can Sensitive Values Enter Outbound URLs?

Let us inspect the exact code that constructs the WhatsApp and `mailto:` URLs in `assets/js/forms.js`:

### A. WhatsApp URL Generation (Lines 618–627):
```javascript
let waText = `Hello CraftEgon Compliance Desk, I would like to consult on: ${serviceName}.`;
if (contactName) waText += `\nName: ${contactName}`;
if (phone) waText += `\nPhone: ${phone}`;
if (email) waText += `\nEmail: ${email}`;
if (scope) waText += `\nRequirement: ${scope}`;

const prefill = encodeURIComponent(waText);
const waUrl = (typeof cfg.getWhatsAppUrl === "function") 
  ? cfg.getWhatsAppUrl(serviceName) 
  : `https://wa.me/918606918247?text=${prefill}`;
```

#### Ground Truth Finding:
1. `cfg.getWhatsAppUrl` is a defined function in `assets/js/config.js` (lines 148–153):
   ```javascript
   getWhatsAppUrl: function (topic) {
     const text = topic 
       ? encodeURIComponent(`Hello CraftEgon Compliance Desk, I would like to consult on: ${topic}.`)
       : encodeURIComponent("Hello CraftEgon Compliance Desk, I would like to consult on corporate compliance services.");
     return `${this.whatsappUrl}?text=${text}`;
   }
   ```
2. Because `typeof cfg.getWhatsAppUrl === "function"` evaluates to **true**, `waUrl` receives **only the `serviceName` topic parameter**.
3. It completely discards `contactName`, `phone`, `email`, and `scope` from the URL!
4. **Conclusion for WhatsApp:** Neither PAN, GSTIN, Aadhaar, nor even the user's phone/email enters the WhatsApp URL in standard production runtime.

### B. `mailto:` URL Generation (Lines 629–637):
```javascript
let mailBody = `Hello CraftEgon Compliance Desk,\n\nI would like to consult on: ${serviceName}.\n\n`;
if (contactName) mailBody += `Name: ${contactName}\n`;
if (phone) mailBody += `Phone: ${phone}\n`;
if (email) mailBody += `Email: ${email}\n`;
if (scope) mailBody += `Requirement: ${scope}\n`;

const mailUrl = (typeof cfg.getEmailUrl === "function") 
  ? cfg.getEmailUrl("Compliance Inquiry: " + serviceName) 
  : `mailto:admin@craftegon.com?subject=${encodeURIComponent("Compliance Inquiry: " + serviceName)}&body=${encodeURIComponent(mailBody)}`;
```

#### Ground Truth Finding:
1. `cfg.getEmailUrl` is a defined function in `assets/js/config.js` (lines 155–158):
   ```javascript
   getEmailUrl: function (subject) {
     const subj = subject ? encodeURIComponent(subject) : encodeURIComponent("Corporate Compliance Inquiry");
     return `${this.emailHref}?subject=${subj}`;
   }
   ```
2. Because `typeof cfg.getEmailUrl === "function"` evaluates to **true**, `mailUrl` receives **only the subject line**.
3. It discards `mailBody` entirely!
4. **Conclusion for Email:** No user inputs, and zero sensitive identifiers, enter the `mailto:` URL in standard production runtime.

---

## 4. Residual Privacy Hazards: What "Making Fields Optional" Does NOT Fix

While the outbound URLs in `forms.js` are safe, the audit identified three subtle residual privacy risks that cannot be solved merely by making PAN and GSTIN optional:

### Hazard 1: Voluntary Entry Still Captures Sensitive Identifiers
On `conversion/tax-intake.html`, the input `<input type="text" name="pan" placeholder="ABCDE1234F">` remains rendered on the screen.
- A user who wishes to be thorough will voluntarily enter their 10-digit PAN.
- When submitted, `data.pan` is collected into the browser's JavaScript memory and processed by `preliminaryAuditItems()`.
- If the dynamic backend were ever enabled in the future, `data.pan` is currently excluded from `payload` (lines 338–349), meaning the user's PAN is silently dropped without their knowledge.
- **Privacy Principle:** If a corporate services firm does not intend to store or transmit PAN during preliminary intake, the field should not be presented in the form at all until formal client onboarding.

### Hazard 2: User Input in the "Scope" / "Notes" Free-Text Area
In fallback mode (if `cfg.getWhatsAppUrl` were absent), `scope` is appended to `waText`:
```javascript
if (scope) waText += `\nRequirement: ${scope}`;
```
If a founder writes in the notes textarea: *"Please file our returns, our PAN is ABCDE1234F and GSTIN is 29AAACA1234A1Z5"*, that text would be passed into the URL query string.
- Query strings are cached in browser history, proxy server access logs, and telecom provider metadata.

### Hazard 3: Banking Desk Integration Passes CIN in Plain URL Query
In `assets/js/forms.js` lines 492–502:
```javascript
const params = new URLSearchParams({
  type,
  bank: provider,
  purpose: isBank ? "Corporate current account opening" : "Marketplace seller onboarding",
  auto_generate: "true"
});
const company = localStorage.getItem("craftegon_client_company");
const cin = localStorage.getItem("craftegon_client_cin");
if (company) params.set("company", company);
if (cin) params.set("cin", cin);
window.location.assign(`/conversion/ai-document-generator.html?${params.toString()}`);
```
- If a user previously used the site, their `craftegon_client_cin` is appended to the browser address bar as `?cin=...`.
- While CIN is technically a public corporate identifier under MCA, passing it via URL parameters exposes it to HTTP `Referer` leakage if the document generator contains external links.

---

## 5. Comprehensive Inventory of All 39 Forms Across the Repository

An automated scan of all HTML files across `conversion/`, `services/`, `portal/`, `admin/`, and root directories was executed:

| Form Location | Form Type | Fields Present | Sensitive Fields Detected | Required Status | Handled By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `conversion/tax-intake.html` | `.if-lead-form` | entity_name, pan, tax_service, turnover, contact_name, email, phone | **`pan`** | **OPTIONAL** | `forms.js` |
| `services/gst-annual.html` | `.if-lead-form` | company_name, gstin, name, email, phone | **`gstin`** | **OPTIONAL** | `forms.js` |
| `conversion/post-incorporation-checkout.html` | Standard `<form>` | director_name, phone, email | None | Mandatory contact | `forms.js` |
| `conversion/ai-document-generator.html` | Template `<form>` | doc_type, entity_name, cin, director_name | `cin` | Client-side only | `ai-drafter.js` |
| `conversion/calculator.html` | Utility `<form>` | entity_type, service_type, capital_tier | None | Non-personal | `calculator.js` |
| `services/roc-annual-compliance.html` | `.if-lead-form` | company_name, cin, name, email, phone | `cin` | Optional CIN | `forms.js` |
| 52 other service pages | `.if-lead-form` | company_name, name, email, phone | None | Standard contact | `forms.js` |
| `admin/login.html` | Admin login | email, password | Password | Internal | `admin.js` |
| `portal/login.html` | Portal login | email, password | Password | Prototype | Static mock |

---

## 6. Audit Verdict & Corrective Recommendations

### Verdict: **PARTIALLY VERIFIED**
- **Verified Safe:** Under existing production runtime (`config.js` active), outbound WhatsApp and `mailto:` links do **NOT** leak PAN, GSTIN, or personal identifiers.
- **Documentation Discrepancy:** The claim in TASK-003 that `forms.js` was modified or sanitized under TASK-003 is **unsupported by Git evidence**.
- **Corrective Action Required:**
  1. Correct documentation in `08_REMEDIATION_CHANGELOG.md` to reflect that `forms.js` was already operating in this mode and was not part of commit `324f4a4`.
  2. On `conversion/tax-intake.html`, consider removing the `<input name="pan">` field completely from the preliminary intake form, replacing it with: *"Tax identification numbers (PAN / GSTIN) will be requested securely upon engagement letter execution."*
