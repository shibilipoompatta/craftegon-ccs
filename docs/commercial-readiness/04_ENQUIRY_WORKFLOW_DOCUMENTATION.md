# CraftEgon Corporate Services (CCS)
# Enquiry Workflow Architecture & Fail-Closed Lead Flow

**Document Reference:** `docs/commercial-readiness/04_ENQUIRY_WORKFLOW_DOCUMENTATION.md`  
**Task Reference:** `TASK-CCS-UX-002`  
**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Core Implementation:** `assets/js/forms.js`  
**Execution Date:** November 2026  
**Final Status:** Complete & Audited  

---

## 1. Architectural Overview

The CraftEgon Corporate Services public platform is hosted as an immutable, high-performance static website on Cloudflare Pages. By design, Cloudflare Pages static edge hosting does not execute persistent server-side application runtimes, and all `/api/*` routes are fail-closed to 404 responses via `_redirects`.

To deliver a reliable, conversion-optimized, and legally honest customer experience, the lead intake architecture implemented in `assets/js/forms.js` operates on a **Fail-Closed Direct Dispatch Model**:
1. **Local Client-Side Validation:** Validates all user inputs against strict statutory syntax patterns (PAN, GSTIN, CIN, DIN, Phone, Email) before submission.
2. **Anti-Bot Honeypot Defense:** Traps automated form spam without requiring invasive or privacy-degrading third-party CAPTCHAs.
3. **Static Environment Detection:** Detects static hosting (`isStatic === true` or unavailable backend API).
4. **Transparent Lead Handoff (`showFormFallbackNotice`):** Generates pre-formatted, one-click WhatsApp and Email links directly in the user interface.
5. **Zero False Claims:** Completely eliminates misleading "Submission saved to database" messages, ensuring complete transparency with prospective clients and strict compliance with the Digital Personal Data Protection (DPDP) Act, 2023.

```mermaid
flowchart TD
    A["Prospect Fills Form on Website"] --> B["Client-Side Validation & Regex Check"]
    B -->|Invalid Data| C["Inline Field Error Highlighted"]
    B -->|Valid Data| D{"Honeypot Filled?"}
    D -->|Yes (Spam Bot)| E["Silent Drop (No Action)"]
    D -->|No (Genuine Prospect)| F{"Environment Check"}
    F -->|Production / Static Cloudflare Pages| G["Trigger showFormFallbackNotice()"]
    F -->|Local / Staging API Available| H["POST /api/leads"]
    H -->|API Failure / 404| G
    G --> I["Display Transparent Desk Notice"]
    I --> J["Button 1: One-Click WhatsApp (+91 86069 18247)"]
    I --> K["Button 2: One-Click Direct Email (admin@craftegon.com)"]
    J --> L["WhatsApp Conversation Opened with Pre-filled Lead Payload"]
    K --> M["Default Email Client Opened with Structured Subject & Body"]
```

---

## 2. Input Validation & Statutory Syntax Rules

The script `assets/js/forms.js` enforces strict format verification to ensure that incoming leads contain actionable statutory identifiers:

| Field Identifier | Statutory Format Enforced | Regex Pattern | Error Guidance Displayed |
| :--- | :--- | :--- | :--- |
| **Phone Number** | 10-digit Indian Mobile Number starting with 6, 7, 8, or 9 | `/^[6-9]\d{9}$/` | "Please enter a valid 10-digit Indian mobile number." |
| **Email Address** | Standard RFC 5322 Email Format | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Please enter a valid email address." |
| **PAN Number** | 10-character Permanent Account Number | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i` | "Invalid PAN format (e.g. ABCDE1234F)." |
| **GSTIN Number** | 15-character Goods & Services Tax Identification Number | `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i` | "Invalid GSTIN format (e.g. 32ABCDE1234F1Z5)." |
| **CIN Number** | 21-character Corporate Identification Number | `/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i` | "Invalid CIN format (e.g. U72200KL2026PTC123456)." |
| **DIN Number** | 8-digit Director Identification Number | `/^[0-9]{8}$/` | "Invalid DIN format (8 numeric digits)." |

---

## 3. Anti-Bot Honeypot Mechanism

Every form contains an invisible honeypot field disguised as a legitimate input:
```html
<div style="position: absolute; left: -9999px; top: -9999px;" aria-hidden="true">
    <input type="text" name="website_url" tabindex="-1" autocomplete="off">
</div>
```

- **Legitimate Users:** Cannot see or focus the field; the value remains empty string `""`.
- **Automated Spambots:** Automatically populate all form inputs.
- **Handling:** If `formData.website_url` is non-empty, `assets/js/forms.js` immediately halts execution and simulates a neutral completion without initiating outbound communication or alerting the bot.

---

## 4. Transparent Lead Handoff (`showFormFallbackNotice`)

When form submission occurs on the static platform, `showFormFallbackNotice` is invoked. It dynamically builds an accessible notice box replacing or overlaying the form:

### A. Notice Structure & Tone
The notice explicitly informs the visitor:
> **"Direct Corporate Desk Connection"**  
> *"Your enquiry has been formatted for immediate processing by our corporate compliance team in Kozhikode. Because our public website operates on a hardened static architecture for maximum privacy, please choose your preferred channel below to send your details directly:"*

### B. Pre-Filled WhatsApp Dispatch Payload
A one-click button links to:
```
https://wa.me/918606918247?text=...
```
The payload is URL-encoded with standard operational parameters:
```
Hello CraftEgon Corporate Services,
I would like to enquire about your services:
- Name: [Full Name]
- Phone: [Phone Number]
- Email: [Email Address]
- Service: [Selected Service / Category]
- Entity: [Company / LLP Name / Status]
- Message: [Client Message]
(Sent via ccs.craftegon.com consultation desk)
```

### C. Pre-Filled Email Dispatch Payload
A secondary button links to:
```
mailto:admin@craftegon.com?subject=...&body=...
```
- **Subject:** `[CCS Enquiry] [Selected Service] - [Client Name]`
- **Body:** Formatted identically to the WhatsApp payload for structured ingestion.

---

## 5. Failure Modes & Edge Case Resilience

| Scenario | System Behavior | Prospect Recovery Path |
| :--- | :--- | :--- |
| **JavaScript Disabled** | Standard `<form action="mailto:admin@craftegon.com" method="GET">` fallback attributes activate. | Prospect's native mail application opens upon clicking Submit. |
| **Popup Blocker Active** | Links use `target="_self"` or trigger standard OS handler protocols (`wa.me` app link or `mailto:`). | Handled directly by operating system without triggering browser popup blockers. |
| **Mobile Browser (Android/iOS)** | `https://wa.me/...` URL protocol automatically opens the native WhatsApp application. | Frictionless 1-tap transmission directly into chat desk. |
| **Desktop without WhatsApp** | WhatsApp Web is loaded automatically in the browser with message draft ready to send. | Prospect clicks "Send" in WhatsApp Web or selects "Send via Email" button. |
| **Network Interruption** | Client-side form state is preserved; form fields are not wiped until successful handoff. | User can retry immediately once connectivity resumes. |
