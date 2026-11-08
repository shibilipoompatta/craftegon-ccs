# TASK-CCS-UX-009: Contact Channels & Corporate Identity Register

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Governing Authority:** Owner Business Decisions 4.1, 4.2, 4.3 & 4.6  
**Auditor:** Legaltech Compliance Reviewer & Identity Architect  
**Date:** November 8, 2026

---

## 1. Executive Identity Framework

Under Indian corporate law (Companies Act 2013 and Limited Liability Partnership Act 2008), advertising an unverified corporate structure, an unauthorized statutory registration number (CIN/LLPIN), or a misleading statutory registered office creates severe regulatory exposure.

To establish absolute compliance while preserving commercial effectiveness:
1. **Public Brand Identity:** **CraftEgon Corporate Services (CCS)** is established as the public trading brand and platform identity.
2. **Statutory Entity Decoupling:** The brand is strictly decoupled from the underlying legal entity until incorporation documentation is finalized by the business owner.
3. **Physical Address Truthfulness:** The Alappuzha location is officially designated as the **Operational Service Desk**, truthfully describing its day-to-day role without claiming to be an MCA-registered statutory head office.

---

## 2. Authoritative Contact Channel Mapping

| Channel Parameter | Authoritative Value | Operational Verification & Constraints |
| :--- | :--- | :--- |
| **Public Business Brand** | **CraftEgon Corporate Services** | Tagline: *Building Business Infrastructure* |
| **Primary Inbound Voice** | `+91 86069 18247` | Active clickable `tel:+918606918247` across all headers, footers, and service pages. |
| **Primary Client WhatsApp**| `https://wa.me/918606918247` | Generates prefilled query parameters; serves as offline form fallback. |
| **Suppressed Phone Number** | `+91 97782 52932` | **STRICTLY PROHIBITED.** Proven by audit to be an external report artifact never present in source code. |
| **Service Desk Location** | Room No.2, NS Building, Kaanjippuzha, Alappuzha, Keralam, 690501 | Permitted strictly as: **Operational Service Desk**. |
| **Prohibited Address Titles**| *"Registered Office"*, *"Statutory Office"*, *"Corporate Head Office"* | **STRICTLY PROHIBITED** until backed by MCA incorporation certificates. |
| **Official Public Email** | `services@craftegon.com` | Primary client intake and customer correspondence mailbox. |
| **Administrative Email** | `admin@craftegon.com` | Institutional fallback contact mailbox. |
| **Availability / SLA Claims**| Business Hours (Mon–Sat) | **No invented 24/7 or instant response SLA commitments.** |

---

## 3. Unresolved Corporate Identity Register (Pending Owner Determinations)

The following corporate variables remain formally **UNRESOLVED** and are strictly safeguarded in the codebase:

```javascript
// Located in assets/js/config.js
window.CRAFTEGON_CONFIG = {
  // Brand Parameters (Approved)
  BRAND_NAME: 'CraftEgon Corporate Services',
  BRAND_TAGLINE: 'Building Business Infrastructure',
  
  // Operational Channels (Approved)
  PHONE_FORMATTED: '+91 86069 18247',
  WHATSAPP_NUMBER: '918606918247',
  EMAIL_SERVICES: 'services@craftegon.com',
  SERVICE_DESK_LOCATION: 'Operational Service Desk, Alappuzha, Kerala',
  
  // STATUTORY VARIABLES: Strictly PENDING OWNER DETERMINATION
  LEGAL_CONTRACTING_ENTITY: null,  // [PENDING: Confirm LLP vs Pvt Ltd]
  STATUTORY_REGISTRATION_ID: null, // [PENDING: Confirm CIN or LLPIN]
  STATUTORY_REGISTERED_OFFICE: null // [PENDING: Confirm MCA Registered Office]
};
```

---

## 4. Owner Decision Register (Status Matrix D)

| Decision Item | Statutory Law Implication | Current Status | Required Owner Action |
| :--- | :--- | :--- | :--- |
| **1. Contracting Entity Form** | Determines whether agreements are executed as a Limited Liability Partnership (LLP) or Private Limited Company. | **UNCONFIRMED** | Specify whether CraftEgon is an LLP, Private Limited, or Proprietorship. |
| **2. Statutory ID (CIN / LLPIN)** | Companies Act Sec 12(3)(c) requires CIN on letters/notices; displaying fictitious CIN is an offense. | **WITHHELD** | Provide verified CIN or LLPIN, or authorize withholding until incorporation is complete. |
| **3. Statutory Registered Office** | Place where official MCA summons and legal notices are served. | **WITHHELD** | Provide official registered office if different from the Alappuzha Service Desk. |
| **4. Professional Fee Benchmarks** | Standardized professional fees (e.g., ₹4,999 for Pvt Ltd, ₹999 for MSME). | **PROVISIONALLY ACTIVE** | Review and formally ratify price schedules in `data/pricing.json`. |
