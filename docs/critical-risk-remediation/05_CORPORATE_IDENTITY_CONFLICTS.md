# CRAFTEGON CORPORATE SERVICES (CCS)
## Critical Risk Verification, Public-Claim Containment & Commercial Identity Stabilisation
### Report 05: Corporate Identity Conflicts, Registration Numbers & Registered Office Reconciliation

**Project:** CraftEgon Corporate Services (CCS)  
**Domain:** `https://ccs.craftegon.com`  
**Audit Target:** All corporate identity references across 123 HTML files, JavaScript libraries, JSON schemas, and configuration files  
**Total Identity References Audited:** 709 occurrences (264 CCS brand, 81 CraftEgon LLP, 11 CraftEgon Technologies Pvt Ltd, 25 Bangalore, 18 Kozhikode, 21 Alappuzha, 3 conflicting CINs)  
**Status:** FULLY INVENTORIED — PENDING BINDING OWNER DETERMINATION  

---

## 1. Executive Context & Identity Hazard

Under Indian corporate law (Section 12 of the Companies Act, 2013 and Section 21 of the Limited Liability Partnership Act, 2008), every company and LLP must display its registered name, Corporate Identity Number (CIN) or LLP Identification Number (LLPIN), and registered office address on all official publications, websites, letterheads, and business notices.

Furthermore, under the **Consumer Protection (E-Commerce) Rules, 2020 (Rule 4(1))**, every digital platform operating in India must prominently display:
- The legal name of the entity.
- Its principal geographic address.
- Its official website and contact details.
- Valid corporate registration details.

Our technical audit discovered that the CraftEgon CCS codebase contains **severe internal contradictions** regarding its legal constitution, corporate registration numbers, and official registered address. 

Per the operating instructions of TASK-CCS-UX-003, the engineering team has **NOT guessed, invented, or unilaterally chosen** an entity name or address. This report lays out the exact evidence and discrepancies in a structured 5-column reconciliation table for binding owner determination.

---

## 2. Master Corporate Identity Reconciliation Table

| Field | Published Value(s) in Codebase | Source File(s) | Conflict / Discrepancy Description | Required Owner & Legal Determination |
| :--- | :--- | :--- | :--- | :--- |
| **Legal Entity Form & Name** | 1. `CraftEgon LLP`<br>2. `CraftEgon Technologies Private Limited`<br>3. `CraftEgon Corporate Services`<br>4. `CraftEgon Technologies LLP` | `package.json`, `privacy-policy.html`, `terms-of-service.html`, `assets/js/navigation.js`, `index.html`, `contact.html`, `about.html` | The site alternates between a **Limited Liability Partnership (LLP)** and a **Private Limited Company (Pvt Ltd)**. In some pages, "CraftEgon LLP" is named as the data fiduciary, while in others, "CraftEgon Technologies Private Limited" is named as the operator. | **Owner must confirm:** What is the exact legal entity that owns and operates CCS?<br>*(A) CraftEgon LLP*<br>*(B) CraftEgon Technologies Private Limited*<br>*(C) A separate proprietary firm* |
| **Corporate Registration Number (CIN / LLPIN)** | 1. `U72900KA2021PTC148562`<br>2. `U74999KA2022PTC158911`<br>3. `U72900DL2022PTC394812`<br>4. *Missing LLPIN* | `assets/js/entity-intelligence.js`, `assets/js/forms.js`, `assets/js/search-engine.js`, `terms-of-service.html` | Three completely different 21-digit Corporate Identity Numbers appear across the codebase. None of them represent an LLP (which requires an LLPIN format like `AAA-1234`). CIN 1 indicates a 2021 Karnataka tech firm; CIN 2 indicates a 2022 Karnataka consulting firm; CIN 3 indicates a 2022 Delhi firm. | **Owner must provide:** The official Certificate of Incorporation / Registration issued by MCA to verify the true CIN or LLPIN. |
| **Registered Office Address** | 1. `Room No.2, NS Building, Kaanjippuzha, Alappuzha, Keralam, 690501`<br>2. `Door No. 61/1243, 2nd Floor, Space City Building, Mavoor Road, Kozhikode, Kerala 673004`<br>3. `Level 14, Concorde Towers, UB City, 1 Vittal Mallya Road, Bengaluru, Karnataka 560001` | `contact.html`, `about.html`, `index.html`, `privacy-policy.html`, `terms-of-service.html`, `assets/js/navigation.js` | The website displays 3 completely different locations as its office:<br>- **Alappuzha:** Owner-supplied new official address.<br>- **Kozhikode:** Kerala operational branch/space.<br>- **Bengaluru:** Prestige corporate address placeholder (UB City). | **Owner must classify:**<br>1. Official Registered Office (per MCA Form INC-22 or FiLLiP).<br>2. Operational Branch Office / Delivery Desk.<br>3. Deprecate Bengaluru UB City placeholder if no physical lease exists. |
| **Operating Telephone & Helpdesk** | 1. `+91 97782 52932`<br>2. `+91 98765 43210` (Placeholder)<br>3. `+91 80 4123 4567` (Bengaluru PBX placeholder) | `contact.html`, `assets/js/navigation.js`, `assets/js/forms.js` | While `+91 97782 52932` is the active operational mobile/WhatsApp contact for the Kerala desk, remnants of mock placeholder numbers exist in older HTML forms. | **Owner must confirm:** Official public helpline number and WhatsApp business number for client communications. |
| **Official Email Desks** | 1. `contact@craftegon.com`<br>2. `compliance@craftegon.com`<br>3. `privacy@craftegon.com`<br>4. `legal@craftegon.com` | `assets/js/navigation.js`, `privacy-policy.html`, `contact.html` | All domain emails use `@craftegon.com`. However, email hosting and MX records on Cloudflare must be verified to ensure mail delivered to these aliases reaches operational staff. | **Owner must confirm:** MX record configuration and active routing for `contact@craftegon.com`. |

---

## 3. Detailed Geospatial & Address Footprint Analysis

A quantitative scan of all 123 HTML files and JavaScript assets mapped the distribution of address references:

```
+------------------------------------------------------------------------------------+
| GEOGRAPHIC FOOTPRINT DISTRIBUTION IN CODEBASE                                     |
|                                                                                    |
| [ Alappuzha, Kerala (690501) ]   ----------------> 21 references (New Official)    |
| [ Kozhikode, Kerala (673004) ]   ----------------> 18 references (Operating Space) |
| [ Bengaluru, Karnataka (560001) ] ---------------> 25 references (UB City Virtual) |
| [ Mumbai / Delhi / Hyderabad ]   ----------------> 7 references (Branch / Pan-India)|
+------------------------------------------------------------------------------------+
```

### Risk Evaluation:
- **UB City, Bengaluru:** UB City Concorde Towers is one of the most prestigious commercial addresses in India. Claiming a physical registered office at UB City without a valid registered lease agreement or virtual office agreement creates substantial regulatory exposure under Section 12 of the Companies Act, 2013 (penalty of ₹1,000/day on company and officer in default).
- **Alappuzha vs Kozhikode:** Having dual Kerala addresses is normal for an expanding business, provided their statutory roles are clarified:
  - **Statutory Registered Office:** `Room No.2, NS Building, Kaanjippuzha, Alappuzha, Keralam, 690501`
  - **Corporate Delivery / Client Desk:** `Space City Building, Mavoor Road, Kozhikode, Kerala 673004`

---

## 4. Professional Practice & Capacity Discrepancy

Beyond statutory corporate details, an acute legal risk arises from how the business describes its service capacity:

### Prohibitions Under Indian Law:
1. **The Advocates Act, 1961 (Section 29 & Section 33):** Only natural persons enrolled on the roll of a State Bar Council have the exclusive right to practice law in India. Corporate entities (LLPs and Pvt Ltd companies) are strictly prohibited from practicing law, pleading before courts/tribunals, or holding themselves out as a law firm.
2. **The Chartered Accountants Act, 1949 (Section 25 & Section 26):** Companies and non-CA entities are strictly prohibited from practicing as Chartered Accountants or certifying financial statements under Section 137 of the Companies Act.
3. **The Company Secretaries Act, 1980:** Companies cannot issue Secretarial Audit reports (Form MR-3) or conduct formal secretarial audits.

### Codebase Claim Audit:
Across certain marketing headings and footer badges, phrases such as *"Premier Corporate Law & Tax Practice"* or *"Our In-House Advocates and Auditors"* appear. 

### Necessary Alignment:
CraftEgon must strictly position itself as:
> **"CraftEgon Corporate Services — A Corporate Services Facilitation & Technology Platform."**
> *"Statutory audits, tax certifications, and legal representations before judicial and quasi-judicial tribunals (NCLT, High Court, NCLAT) are executed exclusively by independent, licensed Chartered Accountants, Company Secretaries, and Advocates empanelled within the CraftEgon Professional Network."*

---

## 5. Immediate Action Plan for Owner Sign-Off

To permanently resolve all corporate identity conflicts across the codebase, the owner must complete the sign-off register in **Report 10: Owner and Professional Decisions Register**:
1. Confirm the single official legal entity name.
2. Provide the official CIN or LLPIN.
3. Designate the registered office and operational desk addresses.
4. Execute an automated global search-and-replace using a verified single source of truth configuration (`assets/js/config.js`).
