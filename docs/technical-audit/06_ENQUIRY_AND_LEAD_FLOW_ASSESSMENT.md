# CraftEgon Corporate Services (CCS)
# Enquiry and Lead Flow Assessment

**Document Reference:** `docs/technical-audit/06_ENQUIRY_AND_LEAD_FLOW_ASSESSMENT.md`  
**Audit Date:** November 2026  
**Auditor:** Senior Software Architect & Lead Operations Analyst  
**Focus:** End-to-End Inspection of Forms, Validation, Endpoints, Delivery & Follow-Up  
**Status:** Complete Empirical Analysis  

---

## 1. Executive Summary: How a Customer Enquiry Currently Works

To evaluate how enquiries currently function on the CraftEgon Corporate Services website, both static source code and runtime behavior were audited:

1. **In Live Production (Static Cloudflare Pages):**
   - The user fills out an intake or consultation form on any page (e.g. `index.html#contact`, `services/pvt-ltd-registration.html`, `conversion/retainer-desk.html`).
   - The browser performs client-side format validation (validating PAN, GSTIN, CIN, DIN, 10-digit mobile, and email).
   - Upon clicking "Submit", `forms.js` evaluates `window.CRAFTEGON_CONFIG.isStatic`. Because production is static, the script **does not attempt an HTTP POST request to an offline backend**.
   - Instead, the form renders a prominent, gold-bordered direct engagement notice (`showFormFallbackNotice`):
     > *"Notice: Direct Engagement Channel — Online form transmission to a backend server is not active in this static environment. Details entered in this form are not stored or transmitted to CraftEgon CCS."*
   - Below the notice, the system automatically constructs two pre-filled, one-click action buttons:
     - **WhatsApp Direct Action:** `https://wa.me/918606918247?text=...` (Pre-fills service name, user's name, phone, email, and requirement text).
     - **Email Direct Action:** `mailto:admin@craftegon.com?subject=...&body=...` (Pre-fills corporate subject line and structured enquiry body).
2. **Can a real enquiry reach a monitored person?**
   - **YES.** When the customer clicks either the WhatsApp or Email button, the request opens in their native WhatsApp application or email composer, ready to send directly to CraftEgon's corporate desk (`+91 86069 18247` or `admin@craftegon.com`).
   - Both destinations are monitored corporate communication channels.
   - **Limitation:** If a user closes the tab without clicking either the WhatsApp or Email button after reading the notice, their entered details are discarded by the browser and do not reach CraftEgon.

---

## 2. Technical Inspection of Form Components

### 2.1 Input Validation Regex Patterns (`assets/js/forms.js`)
Forms implement strict, statutory-grade regular expressions:
- **PAN:** `/^[A-Z]{5}[0-9]{4}[A-Z]$/i` (Format: AAAAA0000A)
- **GSTIN:** `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i` (15-character GST format)
- **CIN:** `/^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i` (21-character MCA corporate ID)
- **LLPIN:** `/^[A-Z]{3}-?[0-9]{4}$/i` (LLP registration identifier)
- **DIN:** `/^[0-9]{8}$/` (8-digit Director Identification Number)
- **TAN:** `/^[A-Z]{4}[0-9]{5}[A-Z]$/i` (10-character Tax Deduction Account Number)
- **Mobile:** `/^[0-9]{10}$/` (10-digit Indian telephone number)
- **Email:** Standard RFC-compliant pattern

### 2.2 Anti-Spam & Bot Filtering (`assets/js/forms.js`)
All forms inject two automated anti-spam protections:
1. **Honeypot Trap (`_hp_website`):** A hidden input positioned off-screen (`left: -9999px`) with `tabIndex = -1`. Legitimate human users leave this blank; automated spam scrapers populate it and are rejected.
2. **Submission Timing Gate (`_render_time`):** Tracks the epoch timestamp when the form was rendered in the DOM. Submissions occurring in under 2,000 milliseconds are flagged as automated bot scripts.

### 2.3 Error Presentation & Accessibility
- Input errors are announced with `role="alert"` and linked via `aria-describedby`.
- Inputs receive visual borders (`var(--danger)`) and `aria-invalid="true"`.
- Focus automatically moves to the first invalid field upon form submission failure.

---

## 3. Communication Channel Parameters

| Channel | Destination / Endpoint | Display Label | Purpose & Routing |
| :--- | :--- | :--- | :--- |
| **WhatsApp Compliance Desk** | `https://wa.me/918606918247` | `+91 86069 18247` | Instant mobile consultation; pre-filled with service scope, applicant name, and phone. Monitored Mon–Sat 9AM–7PM IST. |
| **Corporate Email Desk** | `mailto:admin@craftegon.com` | `admin@craftegon.com` | Formal written enquiries, scope briefs, and statutory filing tenders. Monitored daily. |
| **Telephone Call** | `tel:+918606918247` | `+91 86069 18247` | Urgent director compliance escalation (e.g. DIR-3 KYC deadlines, MCA summons). |
| **Physical Desk** | Kozhikode, Kerala, PIN 673001 | Space Mall, Mavoor Road | In-person verification, document escrow, and partner consultations. |

---

## 4. Staging / Backend Lead Intake Foundation (`src/backend/`)

While inactive in production, an extensive backend enquiry intake pipeline exists in code:

### Endpoints (`src/backend/router.js` lines 92–100):
- `POST /api/v1/enquiries`: Creates a new compliance enquiry record.
- `GET /api/v1/enquiries`: Lists enquiries (protected by bearer token authentication).

### Validation & Processing (`src/backend/controllers/enquiry.controller.js`):
- Validates contact name, email, 10-digit phone, and canonical service ID (`V01-SVC-001` to `V15-SVC-003`).
- Rejects submissions violating the honeypot or minimum render timing rules.
- Generates a permanent corporate reference: `LEAD-YYYY-XXXXXX` (e.g. `LEAD-2026-F9A1B2`).

### Storage Layer (`src/backend/storage/enquiry-repository.js`):
- Inserts record into PostgreSQL table `lead_enquiries` with columns: `id`, `lead_reference`, `contact_name`, `email`, `phone`, `service_id`, `vertical_id`, `scope_description`, `source_url`, `created_at`.
- Protected by Row-Level Security (RLS) restricting query access to authenticated staff identities.

### Email Notification Pipeline (`src/backend/email/email-service.js`):
- Pre-configured to dispatch transactional notifications to `admin@craftegon.com` containing applicant contact details and service scope.

---

## 5. Assessment & Practical Recommendations

### Current Assessment:
- The current production lead flow is **truthful, functional, and privacy-respecting**.
- It does not make false promises of database delivery when running on static hosting.
- Customers who choose to click WhatsApp or Email are immediately connected to a live human operator with zero data loss.

### Recommended MVP Evolution (Phase 2 Roadmap):
1. **Short Term (Keep As-Is):** The current WhatsApp and Email routing is ideal for the immediate launch under the < ₹1,00,000 budget. It incurs zero hosting cost and eliminates server maintenance.
2. **Medium Term (Serverless Edge Intake):** Deploy a lightweight Cloudflare Worker or webhook endpoint that receives form submissions, verifies Turnstile captcha, stores leads in Cloudflare D1 or a managed database, and sends an instant notification to Telegram or email. This would allow background form submission without requiring users to click WhatsApp.
