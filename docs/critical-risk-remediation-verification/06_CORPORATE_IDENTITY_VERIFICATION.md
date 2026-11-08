# CRAFTEGON CORPORATE SERVICES (CCS)
## Independent Remediation Verification & Release-Gate Audit
### Report 06: Corporate Identity Verification & Public Contradiction Inventory

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** All corporate identity, registration, office address, and contact details across 123 HTML files, configuration scripts, and terms of service  
**Statutory Framework:** Section 12 of Companies Act 2013, Section 21 of LLP Act 2008, Consumer Protection (E-Commerce) Rules 2020  
**Audit Standard:** Verification of actual published content on live HTML pages  
**Status:** UNRESOLVED ON PUBLIC PAGES — BINDING OWNER DETERMINATION REQUIRED  

---

## 1. Executive Findings: Public Identity Conflicts Remain Published

Under TASK-CCS-UX-003, the engineering team mapped all 709 occurrences of corporate identity terms and authored a structured decision punch list in `10_OWNER_AND_PROFESSIONAL_DECISIONS.md`.

However, as an independent release-gate review, we must report the physical ground truth:
**Zero code changes were applied to fix corporate identity across the 123 HTML files.**

Because the engineering team was strictly instructed *not* to invent corporate details, the public website today **still publishes contradictory legal entity names, three conflicting CINs, three conflicting office addresses, and two different telephone helpdesk numbers**.

Any visitor browsing `https://ccs.craftegon.com` can observe these contradictions directly.

---

## 2. Inventory of Unresolved Public Contradictions

### A. Contradiction 1: Legal Entity Form & Name
The platform cannot decide whether it is a Limited Liability Partnership or a Private Limited Company:

| File Location | Line Number | Published Value | Constitutional Conflict |
| :--- | :---: | :--- | :--- |
| `package.json` | 45 | `"author": "CraftEgon LLP"` | Declares an LLP entity. |
| `assets/js/config.js` | 120 | `legalEntity: "CraftEgon LLP"` | Declares an LLP entity. |
| `terms-of-service.html` | 89 | `"CraftEgon Technologies Private Limited ("CraftEgon", "CCS", "we", "us")"` | Declares a Private Limited Company. |
| `privacy-policy.html` | 114 | `"Data Fiduciary: CraftEgon LLP"` | Declares an LLP entity. |
| `assets/js/search-engine.js` | 11 | `name: 'Craftegon Technologies Private Limited'` | Benchmark company is a Pvt Ltd company. |
| `assets/js/search-engine.js` | 111 | `proprietor: 'Craftegon LLP'` | Benchmark trademark proprietor is an LLP! |

- **Legal Risk:** An entity cannot be simultaneously an LLP and a Private Limited Company. Issuing invoices, engagement letters, or legal disclaimers under interchangeable entities creates severe contract enforceability issues and invalidates GST input tax credit (ITC) claims for B2B corporate clients.

---

### B. Contradiction 2: Corporate Registration Numbers (CIN vs. LLPIN)
Three distinct 21-digit Corporate Identity Numbers appear across the codebase, with zero valid LLPINs:

| File Location | Line Number | Published CIN Value | MCA Sovereign Registry Meaning |
| :--- | :---: | :--- | :--- |
| `terms-of-service.html` | 91 | `CIN: U72900KA2021PTC148562` | 2021 Karnataka tech entity (`PTC` = Private Limited). |
| `assets/js/search-engine.js` | 12, 39 | `cin: 'U72900KA2021PTC148562'` | Same 2021 Karnataka entity. |
| `assets/js/entity-intelligence.js`| 84 | `cin: 'U74999KA2022PTC158911'` | 2022 Karnataka consulting entity (`PTC`). |
| `assets/js/forms.js` | 76 | `VALIDATORS.cin` sample: `U72900KA2021PTC148562` | Used as regex validation reference. |
| Legacy files / scratch | Various | `U72900DL2022PTC394812` | 2022 Delhi entity (`PTC`). |
| Across entire codebase | All | *No LLPIN published anywhere* | An LLP requires an LLPIN (format: `AAA-1234`). |

- **Legal Risk:** If CraftEgon is an LLP, publishing a Pvt Ltd CIN is legally invalid. If CraftEgon is a Pvt Ltd company, it must publish only its genuine, registered CIN.

---

### C. Contradiction 3: Registered Office Address & Physical Footprint
Three completely distinct geographical locations are published as the firm's office:

| File Location | Line Number | Published Address | Statutory Role / Nature |
| :--- | :---: | :--- | :--- |
| `assets/js/config.js` | 121 | `Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, India • PIN: 690501` | Owner-specified New Statutory Address. |
| `contact.html` | 148 | `Door No. 61/1243, 2nd Floor, Space City Building, Mavoor Road, Kozhikode, Kerala 673004` | Kerala Operations / Delivery Desk. |
| `contact.html` | 172 | `Level 14, Concorde Towers, UB City, 1 Vittal Mallya Road, Bengaluru, Karnataka 560001` | Prestige Virtual Address (UB City). |
| `assets/js/search-engine.js` | 19, 159 | `Cyber Park Road, Corporate Heights, Bangalore, KA 560001` | Placeholder Bangalore address. |
| `assets/js/search-engine.js` | 113, 127 | `Room No.2, NS Building, Kaanjippuzha, Alappuzha, KL 690501` | Alappuzha address for Trademark. |
| `about.html` | 215 | Mentions offices in Bangalore, Kozhikode, and Alappuzha | Multi-location claim. |

- **Legal Risk:** Under Section 12 of the Companies Act, 2013, a company must publish its official registered office address where notices can be legally served. Claiming a registered office at UB City, Bengaluru without an active registered commercial lease creates exposure to statutory fines of ₹1,000/day.

---

### D. Contradiction 4: Published Telephone Helpdesk Numbers
Two distinct mobile/telephone numbers are published across different pages as the official helpdesk:

| File Location | Line Number | Published Number | Purpose / Label |
| :--- | :---: | :--- | :--- |
| `assets/js/config.js` | 125, 127 | `+91 86069 18247` | Canonical `phoneDisplay` and WhatsApp URL. |
| `assets/js/navigation.js` | 123, 177 | `+91 86069 18247` | Header and footer WhatsApp desk. |
| `contact.html` | 154 | `+91 97782 52932` | Kerala Operations Desk direct phone. |
| `services/pvt-ltd-registration.html` | 481 | `+91 86069 18247` | Service page WhatsApp CTA. |

- **Operational Risk:** Inconsistent phone numbers degrade conversion trust and cause inbound prospective client calls to split across different staff or personal devices.

---

## 3. Regulated Professional Capacity Boundaries

The website contains headings and marketing claims that touch on the exclusive statutory domain of advocates, chartered accountants, and company secretaries:

### Statutory Prohibitions:
1. **The Advocates Act, 1961 (Section 29 & 33):** Only advocates enrolled with a State Bar Council may practice law or represent parties before courts and tribunals. A corporate entity cannot act as an advocate or legal firm.
2. **The Chartered Accountants Act, 1949 (Section 25 & 26):** No company may practice as a Chartered Accountant or certify statutory financial audits.
3. **The Company Secretaries Act, 1980:** Corporate entities cannot certify Form MR-3 (Secretarial Audit).

### Published Claims Requiring Formal Disclaimer:
- On `services/oppression-mismanagement.html`: Discusses petitioning the National Company Law Tribunal (NCLT).
- On `services/form-3ceb.html`: Discusses transfer pricing audit certifications.
- On `services/secretarial-audit.html`: Discusses statutory secretarial audits.

### Required Boundary Statement:
To eliminate regulatory exposure, every page referencing court representation, statutory tax audit, or secretarial audit must carry a uniform institutional footer note:
> *"CraftEgon Corporate Services is a corporate services facilitation and technology platform. Statutory audits, tax certifications, and legal representations before judicial and quasi-judicial authorities (NCLT, High Courts) are rendered exclusively by independent, licensed Chartered Accountants, Company Secretaries, and Advocates empanelled in the CraftEgon Professional Network."*

---

## 4. Action Plan: Transition from Documentation to Code

To transition from "mapped conflicts" to "contained reality", the business owner must provide binding determinations on the two foundational questions:

```
+------------------------------------------------------------------------------------+
| BINDING OWNER DETERMINATIONS REQUIRED                                              |
|                                                                                    |
| [ ] 1. OFFICIAL LEGAL ENTITY NAME:                                                 |
|        ( ) CraftEgon LLP  (LLPIN: _______________)                                 |
|        ( ) CraftEgon Technologies Private Limited  (CIN: _______________________)  |
|                                                                                    |
| [ ] 2. OFFICIAL STATUTORY REGISTERED OFFICE ADDRESS:                               |
|        Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, 690501             |
|                                                                                    |
| [ ] 3. OFFICIAL OPERATING DESK:                                                    |
|        Space City Building, Mavoor Road, Kozhikode, Kerala, 673004                 |
|                                                                                    |
| [ ] 4. OFFICIAL PUBLIC DESK NUMBER:                                                |
|        ( ) +91 86069 18247   ( ) +91 97782 52932                                  |
+------------------------------------------------------------------------------------+
```

Once signed off, an automated script will perform a single, synchronized global replacement across all 123 HTML files, resolving all contradictions in the public code.

---

## 5. Audit Verdict

### Overall Finding: **OWNER DECISION REQUIRED / LEGAL REVIEW REQUIRED**
Documenting conflicts in `05_CORPORATE_IDENTITY_CONFLICTS.md` was a necessary analytical step, but until the owner determinations are made and applied to the HTML source code, **corporate identity conflicts remain an active, uncontained public risk on the live website**.
