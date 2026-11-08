# CRAFTEGON CCS — TASK-CCS-UX-011: INDEPENDENT VERIFICATION & RELEASE-GATE AUDIT
## Report 09: Mandatory Owner Decisions Required Prior to Release

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Author:** Senior Corporate Governance & Commercial Systems Architect  
**Audit Date:** November 8, 2026  

---

### 1. The Requirement for Formal Owner Determinations

While engineering and UX teams can stabilize frontend presentation, eliminate code defects, and contain unverified claims, **only the business owners possess the legal authority to bind the commercial identity, statutory representations, and cloud infrastructure of the enterprise.**

Until the following six decisions are formally resolved in writing by the business owners, the website cannot be released to production.

---

### 2. Decision Punch List Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXECUTIVE OWNER DECISION PUNCH LIST                   │
├────┬─────────────────────────────┬──────────────────────────┬───────────────┤
│ ID │ Decision Area               │ Regulatory / Legal Basis │ Priority      │
├────┼─────────────────────────────┼──────────────────────────┼───────────────┤
│ D1 │ Contracting Legal Entity    │ Companies Act / Contract │ CRITICAL      │
│ D2 │ Statutory Registered Office │ Sec 12, Companies Act    │ CRITICAL      │
│ D3 │ Cloudflare Publishing Edge  │ Data Protection / Edge   │ CRITICAL      │
│ D4 │ Corporate Inbound Email     │ Commercial Governance    │ MEDIUM        │
│ D5 │ Client Intake Privacy Flow  │ DPDP Act 2023            │ HIGH          │
│ D6 │ Professional Panel Retainer │ Advocates / CS / CA Acts │ MEDIUM        │
└────┴─────────────────────────────┴──────────────────────────┴───────────────┘
```

---

### 3. Detailed Decision Specifications

#### Decision 1: Confirmation of Contracting Legal Entity
- **The Problem:** The public website operates under the trade brand "CraftEgon Corporate Services (CCS)". However, terms of service, commercial client agreements, tax invoices, GST registrations, and statutory filings require a defined legal person.
- **Available Options:**
  - **Option 1A: CraftEgon LLP.** (Requires verified LLPIN, registered partnership agreement, and valid GSTIN).
  - **Option 1B: CraftEgon Technologies Private Limited.** (Requires verified CIN, Certificate of Incorporation, and board authorization).
  - **Option 1C: Sole Proprietorship / Partnership.** (Requires formal trade name registration and proprietary tax registration).
- **Mandatory Action:** Owner must issue a formal corporate resolution declaring which legal person enters into client contracts and incurs corporate liabilities.

---

#### Decision 2: Statutory Registered Office Address
- **The Problem:** In accordance with Authoritative Owner Decision 2, the Alappuzha location (`Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, 690501`) is strictly designated as an **Operational Service Desk**. It is not legally registered with the Registrar of Companies (ROC) as a statutory registered office.
- **Available Options:**
  - **Option 2A:** Formally file MCA Form INC-22 (for Pvt Ltd) or Form 15 (for LLP) to designate the Alappuzha premises as the official Registered Office.
  - **Option 2B:** Maintain an existing statutory registered office in another city (e.g., Bengaluru or Kozhikode) and state both addresses transparently on legal terms:
    - *"Registered Office: [Statutory Address]"*
    - *"Operational Service Desk: Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala - 690501"*
- **Mandatory Action:** Owner must confirm whether Alappuzha will be registered with the ROC or provide the actual legal registered address.

---

#### Decision 3: Cloudflare Pages Publishing Pipeline Configuration
- **The Problem:** Cloudflare Pages currently deploys from the Git repository root `/` in a zero-build configuration. Consequently, `/portal/` and `/admin/` are actively served to the public internet despite local exclusion scripts (Report 04).
- **Available Options:**
  - **Option 3A (Recommended):** Log into the Cloudflare Pages Dashboard, navigate to `Settings > Builds & deployments`, and configure:
    - *Build command:* `node scripts/build-public.js`
    - *Build output directory:* `dist-public`
  - **Option 3B:** Physically extract `/portal/` and `/admin/` into a private internal repository and deploy them to an authenticated internal subdomain (e.g., `https://portal.craftegon.com`).
- **Mandatory Action:** Owner/DevOps must update Cloudflare configuration prior to Git deployment.

---

#### Decision 4: Corporate Inbound Email Standardization
- **The Problem:** The repository baseline uses `admin@craftegon.com`, which is tested across automated test scripts. TASK-010 introduced `services@craftegon.com`.
- **Available Options:**
  - **Option 4A (Standardized in TASK-011):** Retain `admin@craftegon.com` across all surfaces.
  - **Option 4B:** Provision a dedicated Google Workspace mailbox or alias for `services@craftegon.com` or `desk@craftegon.com` and update configuration globally.
- **Mandatory Action:** Owner must confirm that the selected email address is actively provisioned with valid SPF, DKIM, and DMARC DNS records.

---

#### Decision 5: Client Intake Privacy Architecture (DPDP Act, 2023)
- **The Problem:** The current static fallback encodes prospective client personal data (Name, Phone, Email, Service Requirements) into a prefilled WhatsApp link URL.
- **Available Options:**
  - **Option 5A (Interim MVP):** Formally accept the privacy risk of URL parameter encoding for initial launch, relying on the prominent static fallback disclaimer.
  - **Option 5B (Production Hardening):** Provision an edge API endpoint (e.g., Cloudflare Worker or backend microservice) that ingests intake submissions via HTTPS POST, encrypts PII, and transmits it directly to an authenticated CRM or internal database.
- **Mandatory Action:** Owner must sign off on the data protection risk or commission the edge API endpoint.

---

#### Decision 6: Professional Associate Panel Terms
- **The Problem:** The website clearly states that filings and certifications are coordinated through independent professional associates (CS, CA, Advocates).
- **Available Options:**
  - Standardize bilateral associate engagement agreements covering confidentiality, turnarounds, conflict checks, and Bar Council / ICSI / ICAI compliance boundaries.
- **Mandatory Action:** Owner must ensure written panel agreements are in place with qualified practitioners.

---

### 4. Owner Sign-Off Template

```
I, the undersigned authorized executive / owner of CraftEgon Corporate Services:

1. Confirm the Contracting Entity to be: ____________________________________
   Registration Number (CIN / LLPIN):   ____________________________________

2. Confirm the Statutory Registered Office to be: ___________________________
   _________________________________________________________________________

3. Authorize Cloudflare Pages deployment configuration under Option: [  ] 3A  [  ] 3B

4. Approve the Corporate Inbound Email address: ____________________________

5. Authorize Client Intake Architecture under Option: [  ] 5A  [  ] 5B

Signature: __________________________            Date: ____________________
Name:      __________________________            Title: ____________________
```
