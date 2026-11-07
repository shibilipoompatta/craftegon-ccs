# CRAFTEGON CORPORATE SERVICES (CCS)
## Customer Journey, Proportionate Intake & Service Delivery SOP

**Document Identifier:** `DOC-CCS-SOP-001`  
**Classification:** Standard Operating Procedure (SOP) & Customer Journey Architecture  
**Date:** 2026-11-07  
**Status:** `OPERATIONAL SPECIFICATION — CURRENT REALITY VS TARGET ARCHITECTURE`  

---

## 1. Executive Summary & Operational Realism

This document specifies the end-to-end client journey and service-delivery Standard Operating Procedure (SOP) for CraftEgon Corporate Services (CCS). It supersedes overly theoretical workflows by eliminating excessive data collection, correcting unverified technical claims, and enforcing strict compliance with the **Digital Personal Data Protection (DPDP) Act, 2023**.

### Critical Operational Truths & Boundary Disclosures:
1. **No "Client Data Vault" Implemented:** Historical documentation referenced an autonomous "Client Data Vault". **No such vault is currently implemented or security-tested in the working repository.** Client documents are collected and handled via encrypted email channels and access-restricted operational cloud storage.
2. **Operationally Deployed vs. Target Designed Workflows:**
   - **Current Operationally Deployed State:** Client discovery occurs on the static website; enquiries transition honestly to WhatsApp/Email fallback; proposals, KYC collection, and payments are coordinated manually by operations personnel; records are logged in manual operational spreadsheets.
   - **Target Designed State (Future Phase):** Webhook-driven CRM ingestion, self-service client dashboard, automated payment gateway callbacks, and direct portal webhooks.
3. **Proportionate Data Collection (Data Minimization):** In accordance with Section 6 of the DPDP Act 2023, personal data is collected strictly on a "need-to-know" basis. No identity documents or personal financial data are requested during initial discovery or quotation.

---

## 2. The 15-Stage Client Engagement SOP

### Stage 1: Enquiry Qualification & Intake
- **Action:** Client submits an inquiry via website form, WhatsApp desk, or email.
- **Data Collected:** Client Name, Corporate Email, Phone Number, Target Entity Type, and Primary Service Requirement.
- **Qualification Gate:** Operations lead reviews request within 2 business hours. Discard spam; verify that request falls within CCS corporate services scope (reject direct litigation inquiries and refer to independent advocates).
- **Record Generated:** Entry created in `LEAD-REG` (`LEAD-YYYY-XXXX`).

### Stage 2: Conflict of Interest Check
- **Action:** Check proposed entity name, promoters, and key counterparties against active clients in `CLIENT-REG`.
- **Conflict Rule:** CCS will not represent adverse parties in contested corporate reorganizations, shareholder agreements, or bilateral transactions.
- **Record Generated:** Conflict clearance flag marked in `LEAD-REG`.

### Stage 3: Scope Definition & Exclusions Formulation
- **Action:** Formulate explicit, unbundled Scope of Work.
- **Mandatory Exclusions Clause:** Clearly state what is NOT included (e.g. government stamp duty over nominal capital, non-statutory agreements, trademark oppositions, ongoing accounting).
- **Record Generated:** Draft Proposal (`PROP-YYYY-XXXX`).

### Stage 4: Formal Quotation & Transparent Fee Split
- **Action:** Issue written formal quotation itemizing:
  1. CCS Service Coordination Fee.
  2. Partner Professional Execution Fee (CA/CS/TM Agent).
  3. Statutory Government Disbursements (Pure Agent at actuals).
  4. Applicable GST (18% on service fees).
- **Record Generated:** Formal Proposal delivered via PDF email / WhatsApp.

### Stage 5: Engagement Acceptance & Terms Agreement
- **Action:** Client confirms acceptance by signing the Engagement Letter (`ENG-YYYY-XXXX`).
- **Binding Provisions:** Pure agent disbursement consent, out-of-scope surcharge terms, client data accuracy warranty, and limitation of liability.
- **Record Generated:** Executed Engagement Letter logged in `CLIENT-REG`.

### Stage 6: Payment Collection & Pure Agent Accounting
- **Action:** Collect 100% of estimated Statutory Disbursements and 50% advance on Professional Fees.
- **Accounting Protocol:** Disbursements are credited to a dedicated pass-through ledger; professional fees are credited to operational revenue.
- **Record Generated:** Advance Receipt Voucher / Proforma Invoice logged in `BILLING-REG`.

### Stage 7: Proportionate Document Collection & Verification
- **Data Minimization Principle:** Collect ONLY documents mandated by MCA V3 or statutory portals for the specific filing:
  - *For Pvt Ltd Incorporation:* PAN, Aadhaar/Passport, Bank Statement (last 2 months with current address), Specimen Signature, Registered Office utility bill + Owner NOC.
  - *For MSME Udyam:* PAN, GSTIN (if applicable), Aadhaar of Authorized Partner/Director.
  - *For DIR-3 KYC:* Mobile and Email OTP (Web) or self-attested PAN and Aadhaar/Passport with DSC (e-Form).
- **Security Storage:** Files stored in client-specific encrypted directory with restricted role-based staff access.
- **Record Generated:** Document Verification Checklist completed in `MATTER-REG`.

### Stage 8: Professional Partner Allocation
- **Action:** If statutory certification is required (e.g. SPICe+ Part B, Form 3, MGT-7), assign matter to accredited Primary Partner in `PARTNER-REG`.
- **Failover SLA:** Partner must acknowledge assignment within 4 hours; failure triggers reassignment to Secondary Partner.
- **Record Generated:** Partner Assignment logged in `MATTER-REG`.

### Stage 9: Internal Operations Review & Pre-Filing QA
- **Action:** Two-tier internal quality check:
  - Tier 1: Operations drafter prepares forms, checks spellings, address matches, and attachments.
  - Tier 2: Senior Reviewer validates statutory completeness and legal consistency.
- **Record Generated:** Pre-Filing QA Checklist signed off in `MATTER-REG`.

### Stage 10: Statutory Portal Submission
- **Action:** Form uploaded to official government portal (MCA V3, GSTN, IP India). Digital Signature Certificates (DSC) appended by promoters and certifying professional (with UDIN).
- **Payment of Govt Challan:** Government fees paid from client advance funds.
- **Record Generated:** Official Service Request Number (SRN) / Filing Challan generated and logged in `MATTER-REG`.

### Stage 11: Real-Time Tracking & Resubmission Query Handling
- **Action:** Daily tracking of SRN status on government portal.
- **Query SLA:** If MCA or RoC raises a resubmission notice, operations prepares clarified documents and responds within 48 hours (well within the statutory 15-day resubmission window).
- **Record Generated:** Resubmission log updated in `MATTER-REG`.

### Stage 12: Matter Completion & Verification
- **Action:** Download final statutory artifact: Certificate of Incorporation (CoI), PAN/TAN allotment letters, Udyam Certificate, or Trademark TM-A Receipt.
- **Validation:** Verify that company name, CIN, DIN, and authorized capital match approved parameters.
- **Record Generated:** Matter marked `PENDING_HANDOVER` in `MATTER-REG`.

### Stage 13: Client Handover & Compliance Briefing
- **Action:** Formal delivery package issued to client via email:
  1. Statutory Certificates & Portal Approval Receipts.
  2. Approved MOA & AOA / Executed Agreement.
  3. **Master Handover Memo (`MEMO-YYYY-XXXX`):** Itemizes post-incorporation statutory requirements (Bank account opening, INC-20A Commencement of Business within 180 days, Auditor appointment Form ADT-1 within 30 days).
- **Record Generated:** Client Delivery Confirmation recorded in `MATTER-REG`.

### Stage 14: Final Invoicing & Financial Settlement
- **Action:** Issue final Tax Invoice reflecting actual statutory disbursements (supported by government challans) and professional balance fee.
- **Record Generated:** Final Invoice (`INV-YYYY-XXXX`) logged and closed in `BILLING-REG`.

### Stage 15: Record Retention, Compliance Calendar & Data Archival
- **Record Retention Rule:** Statutory filings, MOA/AOA, and government approvals retained for permanent archive in accordance with Section 128 of the Companies Act 2013.
- **DPDP Data Purge:** Temporary identity proofs (e.g. director bank statements) purged after 180 days post-incorporation unless retention is mandated by law.
- **Future Calendar Registration:** Inscribe company statutory due dates (INC-20A, ADT-1, DIR-3 KYC, AOC-4, MGT-7) in the master compliance calendar for automated client renewal reminders.

