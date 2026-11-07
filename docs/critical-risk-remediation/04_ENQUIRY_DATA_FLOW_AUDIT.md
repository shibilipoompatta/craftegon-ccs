# CRAFTEGON CORPORATE SERVICES (CCS)
## Critical Risk Verification, Public-Claim Containment & Commercial Identity Stabilisation
### Report 04: Enquiry Data Flow, Form Security & DPDP Act Privacy Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** All lead capture forms, intake portals (`conversion/*.html`), service enquiry forms, fallback transmission channels, and client-side data handling (`assets/js/forms.js`)  
**Applicable Legal Framework:** Digital Personal Data Protection (DPDP) Act, 2023 & Information Technology (IT) Act, 2000  
**Status:** AUDITED, CONTAINED & HARMONIZED  

---

## 1. Context & Regulatory Imperative

The Digital Personal Data Protection (DPDP) Act, 2023 imposes stringent statutory obligations on **Data Fiduciaries** who process digital personal data in India:
1. **Notice & Purpose Limitation (Section 5):** An itemized notice stating the purpose of data processing and the categories of personal data collected must precede or accompany consent.
2. **Data Minimization (Section 6(1)):** Personal data collected must be strictly limited to what is necessary for the specified purpose.
3. **Reasonable Security Safeguards (Section 8(5)):** The Data Fiduciary must protect personal data in its possession or under its control by taking reasonable security safeguards to prevent data breach.

This audit examines how personal, financial, and corporate identifiers are captured, processed, stored, and transmitted across the CraftEgon CCS web ecosystem.

---

## 2. Inventory of Intake Mechanisms & Input Fields

The CCS web platform operates two tiers of lead intake:
1. **Universal Service Lead Forms (`.if-lead-form`):** Standard contact cards embedded across 57 canonical service pages.
2. **Specialized Multi-Step Conversion Portals (`.if-intake-portal`):** 17 dedicated intake workflows located in `/conversion/`.

### Field Inventory Across 17 Conversion Portals:

| File Name | Functional Purpose | Fields Collected | Pre-Remediation Mandatory Status | Post-Remediation Status |
| :--- | :--- | :--- | :--- | :--- |
| `tax-intake.html` | Corporate & Individual Tax Intake | Entity Name, **PAN**, Tax Service, Turnover, Contact Name, Email, Phone | **PAN was MANDATORY** | **PAN made OPTIONAL** for preliminary contact |
| `post-incorporation-checkout.html` | Post-Incorporation Starter Kit | Entity Type, Business Stage, Director Name, Phone, Email | Director Name, Phone, Email mandatory | CTA updated to "Request Consultation"; no payment data requested |
| `trademark-search.html` | Trade Mark Clearance Scope | Wordmark, Class (1–45), Applicant Name, Email, Phone | Basic contact mandatory | Compliant (Class selection only) |
| `contract-intake.html` | Contract Drafting Scope | Contract Type, Parties, Key Terms, Email, Phone | Standard business scope | Compliant |
| `cross-border-retainer.html` | FEMA & Cross-Border Desk | Transaction Type, Inbound/Outbound, Target Country, Email, Phone | Standard consultation fields | Compliant |
| `csr-audit-form.html` | CSR Statutory Audit Scope | Company Name, CSR Budget, Project State, Email, Phone | Corporate profile data | Compliant |
| `dispute-consultation.html` | Dispute Referral Intake | Matter Type (NCLT/Arbitration), Opposing Party, Summary, Email, Phone | Case background scope | Compliant (Referral boundary clarified) |
| `dpdp-audit-request.html` | Data Protection Audit Scope | Organization Type, Headcount, User Records Processed, Email, Phone | Compliance scoping metrics | Compliant |
| `fema-consultation.html` | Inbound FDI / FLA Return Intake | Investment Route, Currency, Entity Name, Email, Phone | Investment profile data | Compliant |
| `hr-audit.html` | Labour & HR Compliance Review | Headcount, Multi-State Presence, PF/ESI Status, Email, Phone | Organizational parameters | Compliant |
| `license-qualification.html` | FSSAI / PSARA / Trade Licensing | License Category, Operating State, Turnover, Email, Phone | Licensing parameters | Compliant |
| `ma-advisory-enquiry.html` | M&A / Due Diligence Intake | Deal Size, Industry Sector, Transaction Structure, Email, Phone | Transaction parameters | Compliant |
| `retainer-desk.html` | General Corporate Retainer Desk | Organization Type, Monthly Compliance Scope, Email, Phone | Corporate profile data | Compliant |
| `secretarial-audit-scope.html` | CS Secretarial Audit Scope | Paid-Up Capital, Turnover, Listing Status, Email, Phone | Statutory threshold metrics | Compliant |
| `strike-off-checker.html` | STK-2 Dormancy Qualification | Incorporation Year, Bank Status, Asset/Liability Status, Email, Phone | Fast-track eligibility criteria | Compliant |
| `venture-deal-booking.html` | Term Sheet / Cap Table Review | Round Stage (Seed/Series A), Target Amount, Investor Type, Email, Phone | Venture capital metrics | Compliant |
| `ai-document-generator.html` | Resolution & Document Drafter | Document Type, Entity Name, CIN, Director Name, Signing Authority | Client-side drafting template | Pure client-side generation |

---

## 3. End-to-End Data Flow & Transmission Architecture

The diagram below traces the path of prospective client data from user keystroke to storage or transmission:

```
[ Prospective Client Browser ]
        |
        v  (User types PAN, GSTIN, Phone, Email)
[ DOM Input Fields ]
        |
        +---> [ assets/js/forms.js: validateField() ]
        |        - Regex validation (VALIDATORS.pan, VALIDATORS.gstin, etc.)
        |        - Immediate DOM format feedback
        |
        +---> [ assets/js/forms.js: submit handler ]
                 |
                 +---> [ fetch('https://ccs.craftegon.com/api/v1/enquiries') ]
                          |
                          v
                 [ Cloudflare Pages Edge (Static Hosting) ]
                          |
                          v  (No API Route on Static Host)
                 [ HTTP 404 Not Found ]
                          |
                          v
                 [ assets/js/forms.js: showFormFallbackNotice() ]
                          |
                          +---> Option A: Format mailto link (Plain text body)
                          |
                          +---> Option B: Format WhatsApp link (URL encoded query)
                          |
                          +---> Option C: Display manual telephone desk (+91 97782 52932)
```

### Critical Security & Privacy Findings:

#### 1. The Premature Identification Vulnerability (PAN / GSTIN)
- **Problem:** On `conversion/tax-intake.html` (Line 108) and `services/gst-annual.html` (Line 326), `pan` and `gstin` were marked `required`.
- **Privacy Analysis:** Demanding a tax identifier (Permanent Account Number or GSTIN) before establishing an attorney-client or consultant-client relationship violates **DPDP Act Section 6(1) Data Minimization**. A visitor seeking a basic preliminary quotation should not be forced to disclose confidential tax identifiers.
- **Remediation Implemented:**
  - `tax-intake.html`: Made PAN optional:
    ```html
    <label>PAN Number <span style="font-weight: normal; color: var(--text-muted);">(Optional for preliminary inquiry)</span></label>
    <input type="text" name="pan" placeholder="ABCDE1234F">
    ```
  - `services/gst-annual.html`: Made GSTIN optional:
    ```html
    <label>Goods & Services Taxpayer ID (GSTIN) <span style="font-weight: normal; color: var(--text-muted);">(Optional for preliminary inquiry)</span></label>
    <input type="text" name="gstin" placeholder="32AAAAA0000A1Z5">
    ```

#### 2. Insecure Transmission via URL Fallbacks (WhatsApp & Mailto)
- **Problem:** When the static host triggers `showFormFallbackNotice()`, it builds WhatsApp links (`https://api.whatsapp.com/send?phone=...&text=...`) and `mailto:` links containing client inputs.
- **Privacy Hazard:** If PAN, Aadhaar, or financial details are included in a URL query string, they become visible in:
  - Browser history.
  - Proxy and firewall logs.
  - Third-party HTTP `Referer` headers when clicking subsequent links.
  - Telecommunication metadata.
- **Remediation & Governance:**
  In `assets/js/forms.js` (lines 338–350), the API submission payload sanitizes data down to non-sensitive contact parameters (`contact_name`, `email`, `phone`, `service_id`, `scope_description`). Personal identifiers (PAN, GSTIN, Aadhaar) are deliberately excluded from automated URL query strings.

#### 3. Client-Side Storage Inspection (`localStorage` & `sessionStorage`)
- An audit of JavaScript files revealed:
  - `assets/js/forms.js` (lines 498–501): Reads `localStorage.getItem("craftegon_client_company")` and `craftegon_client_cin` to pre-fill the AI document generator.
  - `admin/admin.js`: Stores authentication tokens in `localStorage`.
- **Finding:** No unencrypted sensitive financial or tax records are cached permanently in browser storage. Pre-filling is limited to corporate legal names and CINs.

---

## 4. Deceptive Checkout Remediation

### The Issue on `conversion/post-incorporation-checkout.html`:
Line 137 previously rendered:
```html
<button type="submit" class="if-btn-primary">Proceed to Secure Payment Gateway</button>
```

### Deceptive Practice Risk:
This button text strongly implied that clicking would redirect the user to an encrypted payment gateway (e.g., Razorpay, Stripe, CCAvenue) to charge a debit/credit card or process a UPI transaction. In reality, the website is hosted on static Cloudflare Pages with zero payment gateway infrastructure. Submitting simply invoked `forms.js`, which failed to reach `/api/v1/enquiries` and fell back to WhatsApp.

### Remediation Applied:
1. Re-labeled the button to accurately reflect the action:
   ```html
   <button type="submit" class="if-btn-primary">Request Starter Kit Consultation & Scope</button>
   ```
2. Appended an explicit, transparent consumer disclosure directly beneath the button:
   ```html
   <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 0.5rem; text-align: center;">
     Submitting formats an enquiry for our corporate desk. No payment is processed online in this environment.
   </p>
   ```

---

## 5. DPDP Act 2023 Compliance Checklist for CCS

| DPDP Act Requirement | Current Status on CCS | Required Action / Protocol |
| :--- | :--- | :--- |
| **Notice Requirement (Sec 5)** | **COMPLIANT** | All lead forms include explicit consent checkboxes linking to `privacy-policy.html`. |
| **Data Minimization (Sec 6)** | **CONTAINED** | Mandatory PAN and GSTIN collection eliminated. Intake forms capture only necessary contact fields. |
| **Unbundled Consent (Sec 6)** | **COMPLIANT** | Marketing communications are separate from direct service consultation consent. |
| **Data Security Safeguards (Sec 8)** | **COMPLIANT** | Production delivery enforced over strict HTTPS via Cloudflare edge SSL/TLS. |
| **Right to Erasure / Rectification** | **PROCESS GAP** | Need operational mailbox (`privacy@craftegon.com` or `dpo@craftegon.com`) for handling user data deletion requests. |

---

## 6. Recommendations for Management

1. **Establish Dedicated Privacy Mailbox:** Configure `privacy@craftegon.com` to receive data subject access and erasure requests under the DPDP Act.
2. **Formal Data Retention Schedule:** Adopt an internal operating policy that prospective customer lead records received via email or WhatsApp are deleted after 90 days if no professional retainer or engagement letter is executed.
3. **No Sensitive Document Intake via WhatsApp:** Instruct corporate intake desk staff that signed tax returns, financial statements, and director Aadhaar cards must only be transmitted via encrypted email or authenticated secure vaults, never via consumer WhatsApp chats.
