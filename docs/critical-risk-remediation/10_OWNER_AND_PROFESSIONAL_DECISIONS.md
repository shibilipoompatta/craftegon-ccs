# CRAFTEGON CORPORATE SERVICES (CCS)
## Critical Risk Verification, Public-Claim Containment & Commercial Identity Stabilisation
### Report 10: Owner and Professional Decisions Register (Binding Action Punch List)

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Target Audience:** Business Owner, Managing Partner, Legal Counsel & Senior Professional Advisors  
**Purpose:** Formal punch list of binding executive decisions required to complete commercial stabilization  
**Status:** ACTION REQUIRED BY OWNER  

---

## 1. Governance Instructions for Executive Leadership

Technical risk containment under **TASK-CCS-UX-003** has succeeded in neutralizing deceptive algorithms, purging expired regulatory claims, and securing customer enquiry data flows.

However, software engineering cannot unilaterally resolve foundational legal questions regarding corporate entity structure, official registered office locations, partner fee-sharing arrangements, or commercial payment processing.

The following **7 Binding Decisions** must be formally reviewed and signed off by the business owner and legal counsel. Once signed off, the engineering team will execute a single, coordinated configuration update across the entire codebase.

---

## 2. Binding Executive Decisions Register

### Decision 01: Legal Entity Form & Master Corporate Identity
- **Issue:** The codebase currently alternates between *"CraftEgon LLP"*, *"CraftEgon Technologies Private Limited"*, and *"CraftEgon Corporate Services (CCS)"*, with 3 conflicting CINs (`U72900KA2021PTC148562`, `U74999KA2022PTC158911`, `U72900DL2022PTC394812`).
- **Options Available:**
  - **Option 1A:** Establish **"CraftEgon LLP"** as the sole operating and contracting entity. (Requires valid LLPIN).
  - **Option 1B:** Establish **"CraftEgon Technologies Private Limited"** as the sole operating company. (Requires verified CIN).
  - **Option 1C:** Use **"CraftEgon Corporate Services"** as a registered trade name/brand owned by the parent company.
- **Regulatory / Commercial Implication:** Inconsistent corporate identity violates Section 12 of Companies Act, 2013 / Section 21 of LLP Act, 2008 and impairs client invoice validity and bank merchant approvals.
- **Recommended Choice:** **Option 1A** (or 1B, whichever entity holds the active bank account, PAN, and GSTIN registration).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Official Entity Name: _____________________________________________
  - Official CIN / LLPIN: _____________________________________________
  - Date & Initials: _______________________

---

### Decision 02: Official Registered Office & Operating Branch Desks
- **Issue:** The site displays 3 conflicting locations:
  1. `Room No.2, NS Building, Kaanjippuzha, Alappuzha, Keralam, 690501` (New address)
  2. `Door No. 61/1243, 2nd Floor, Space City Building, Mavoor Road, Kozhikode, Kerala 673004`
  3. `Level 14, Concorde Towers, UB City, 1 Vittal Mallya Road, Bengaluru, Karnataka 560001`
- **Options Available:**
  - **Option 2A:** Designate **Alappuzha** as the Statutory Registered Office, **Kozhikode** as the Operational Branch/Client Desk, and completely eliminate the Bengaluru UB City placeholder.
  - **Option 2B:** Retain Bengaluru UB City only if a verified virtual office agreement or commercial lease is actively in effect.
- **Regulatory / Commercial Implication:** Advertising a prestigious office without a registered lease constitutes misrepresentation under the Consumer Protection Act, 2019 and incurs penalties under Section 12 of the Companies Act.
- **Recommended Choice:** **Option 2A** (Statutory Registered Office in Alappuzha; Operating Desk in Kozhikode; remove unverified Bengaluru placeholder).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Statutory Registered Office: ______________________________________
  - Operational Branch Address: _______________________________________
  - Date & Initials: _______________________

---

### Decision 03: Professional Service Agreements & Empanelment
- **Issue:** 28 out of 57 advertised services require statutory certification or legal representation by licensed professionals (CAs for statutory audit/Form 3CEB; CSs for secretarial audits; Advocates for NCLT/court appearances). Currently, no formal partner MoUs or SLAs are executed.
- **Options Available:**
  - **Option 3A:** Formalize written Network Partner Agreements with 2 Chartered Accountants, 1 Company Secretary, and 1 Advocate prior to public commercial launch.
  - **Option 3B:** Restrict initial operations strictly to Tier 1 direct corporate secretarial and documentation services, gating Tier 2/3 services under *"By Appointment / Scope Evaluation"*.
- **Regulatory / Commercial Implication:** Corporate entities cannot practice law or audit (Advocates Act 1961, CA Act 1949). Providing regulated services without contracted professionals creates severe professional liability and breach of contract exposure.
- **Recommended Choice:** **Option 3A + 3B** (Execute formal agreements with core partners while launching with the focused 5-service suite).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Designated Lead CA Partner: _______________________________________
  - Designated Lead CS Partner: _______________________________________
  - Date & Initials: _______________________

---

### Decision 04: Backend Infrastructure & Hosting Architecture
- **Issue:** The site currently runs as a static site on Cloudflare Pages. A complete Node/Express/PostgreSQL backend exists in `src/backend/` but is 100% idle in production. Lead forms gracefully fall back to WhatsApp and email.
- **Options Available:**
  - **Option 4A (Current / Zero-Cost):** Maintain Cloudflare Pages static edge hosting. Use WhatsApp and email consultation routing as the primary conversion funnel. Budget impact: ₹0/month.
  - **Option 4B (Full Cloud Deployment):** Provision a managed container (e.g. Google Cloud Run or Railway VPS) and PostgreSQL database (e.g. Supabase or Neon), apply migration 009, and connect the REST API. Budget impact: ₹2,000–₹5,000/month.
- **Regulatory / Commercial Implication:** Option 4A is ultra-resilient, fast, and carries ₹0 server maintenance overhead, perfectly suited for the <₹1,00,000 budget constraint. Option 4B enables live database persistence and client authentication.
- **Recommended Choice:** **Option 4A** for Phase 1 launch. Deploy Option 4B only after crossing 25 active paying retainer clients.
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Date & Initials: _______________________

---

### Decision 05: Client Portal & Admin Console Public Visibility
- **Issue:** The Client Portal (`/portal/dashboard.html`) and Admin Console (`/admin/index.html`) exist as static prototypes disconnected from live database authentication.
- **Options Available:**
  - **Option 5A:** Retain the Portal with a prominent *"Demonstration Preview"* watermark; gate the Admin console behind Cloudflare Access (Zero Trust).
  - **Option 5B:** Remove "Client Login" from the public header and replace with *"Client Helpdesk (+91 97782 52932)"*; restrict `/admin/` and `/portal/` entirely.
- **Regulatory / Commercial Implication:** Exposing non-functional logins creates client confusion and security scanning interest.
- **Recommended Choice:** **Option 5B** (Present a clean, 100% honest professional services firm interface; introduce client login only when the backend is live).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Date & Initials: _______________________

---

### Decision 06: Payment Processing Strategy
- **Issue:** The website does not have an active payment gateway. The previous deceptive checkout button was contained.
- **Options Available:**
  - **Option 6A:** Invoice-Based B2B Payment (Client submits inquiry $\rightarrow$ Scope & Engagement Letter issued $\rightarrow$ Payment via direct NEFT/RTGS/UPI to CraftEgon current account).
  - **Option 6B:** Integrate a certified payment aggregator (Razorpay, Cashfree, or PayU) requiring business KYC, merchant underwriting, and API key provisioning.
- **Regulatory / Commercial Implication:** Professional corporate compliance retainers and incorporations are standardly billed via formal engagement letters and invoices, which avoid payment gateway transaction fees (2–3%).
- **Recommended Choice:** **Option 6A** for Phase 1 launch (Invoice-based bank transfers; zero gateway fees).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Date & Initials: _______________________

---

### Decision 07: Service Catalogue Launch Scope
- **Issue:** 57 services are indexed on the website, but marketing all 57 simultaneously dilutes brand focus and risks operational overextension.
- **Options Available:**
  - **Option 7A:** Adopt the **5-Service Core Launch Suite** (Pvt Ltd Incorporation, LLP Formation, RoC Annual Retainer, GST Registration & Filing, Trademark Clearance & Filing) while maintaining the other 52 pages for SEO authority under *"Partner Network Scope"*.
  - **Option 7B:** Market all 57 services equally without prioritization.
- **Regulatory / Commercial Implication:** Focusing on 5 core services guarantees delivery excellence, predictable turnaround times, and high customer satisfaction during early commercial traction.
- **Recommended Choice:** **Option 7A** (5 Core Services promoted on homepage hero; 52 services available via directory).
- **Owner Sign-Off:**
  - [ ] Approved Choice: _______________
  - Date & Initials: _______________________

---

## 3. Execution Protocol Following Owner Sign-Off

Upon receiving signed determinations on Decisions 01 through 07:
1. Update `assets/js/config.js` with the master corporate identity constants.
2. Run automated script to synchronize header, footer, privacy policy, and terms of service across all 123 HTML files.
3. Verify updated telephone, email, and address routing.
4. Execute `npm test` to confirm zero regression.
5. Present final release artifact for production deployment approval.
