# CraftEgon CCS — Official Regulatory Source & Live-Data Registry

**Document ID**: `CRAFTEGON-DATA-001`  
**Classification**: Official Regulatory Data & Integration Registry  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Registry Architecture & Verification Rules

This registry documents all official statutory portals, regulatory publishers, and data feeds across the 15 corporate compliance domains.

### Integration Guardrails
1. **Zero Unauthorized Scraping**: Live scraping behind CAPTCHAs, authenticated sessions, or terms prohibiting automated harvesting is strictly forbidden.
2. **Authorized Data Modes**:
   - **Mode 1 (Manual Verification)**: Practicing CS/CA accesses the portal via authorized professional credentials.
   - **Mode 2 (Official Public APIs)**: Licensed government APIs (e.g. GSTN GSP/ASP APIs, MCA V3 developer sandbox where available).
   - **Mode 3 (Authorized Aggregators)**: Verified commercial data providers (e.g. Karza/Perfios/Signzy) with statutory data redistribution licenses.
3. **Graceful Fallbacks**: When live data is offline or unreachable, the system automatically falls back to verified cached statutory tables and displays clear freshness timestamps.

---

## 2. Master Regulatory Source Registry

| Statutory Domain | Official Authority / Publisher | Official Portal URL | Integration Type & Technical Feasibility | Data Fields Available | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MCA Corporate Registry** | Ministry of Corporate Affairs (MCA), Govt. of India | `https://www.mca.gov.in/` | Public Master Data Search / MCA V3 API Sandbox (Authorized GSP) | CIN, Company Name, Class, RoC Jurisdiction, Authorized/Paid Capital, Status, Directorships | Cached MCA Master Data + Manual verification |
| **RBI Foreign Exchange** | Reserve Bank of India (RBI) | `https://firms.rbi.org.in/` & `https://flair.rbi.org.in/` | Entity-authenticated portal (FLAIR / FIRMS); manual filing via DSC/AD Bank | FDI tranches, Foreign Liabilities & Assets (FLA), FC-GPR/FC-TRS approvals | Client-side rule engine + Offline CS filing review |
| **Direct Taxation** | Central Board of Direct Taxes (CBDT), Dept of Revenue | `https://eportal.incometax.gov.in/` | Taxpayer e-filing portal / AIS / TIS via Authorized ERI / GSP | PAN status, Tax Deductions (26AS), Form 3CEB receipt, ITR-6 status | Standard statutory calendar dates + Manual verification |
| **Indirect Taxation (GST)**| Goods and Services Tax Network (GSTN) / CBIC | `https://www.gst.gov.in/` | Official GST System APIs via authorized GSP (GST Suvidha Provider) | GSTIN validation, Return filing status (GSTR-1, 3B, 9), ITC reconciliation | Public GSTIN search + Client-provided returns |
| **Trade Marks & IPR** | Controller General of Patents, Designs & Trademarks | `https://ipindiaonline.gov.in/` | Trade Marks Registry Electronic Search (Public web interface) | Wordmark, Class (1–45), Vienna code, Application status, Objections | Educational Class guide + Authorized search |
| **Labour & Social Security**| EPFO (Ministry of Labour & Employment) | `https://unifiedportal-emp.epfindia.gov.in/` | Employer Portal (Shram Suvidha / Unified Portal); manual filing | Establishment ID, ECR generation status, PF contribution challans | Statutory rules table + Monthly reminder engine |
| **Health Insurance (ESIC)** | Employees' State Insurance Corporation | `https://www.esic.gov.in/` | Employer Portal; manual monthly contribution filing | ESIC Code, Monthly contribution challan status, Insured persons count | Headcount threshold engine (10/20 employees) |
| **Food Safety & Standards**| FSSAI (Ministry of Health & Family Welfare) | `https://foscos.fssai.gov.in/` | FoSCoS portal (Food Safety Compliance System) | FSSAI License/Registration No., Expiry date, Annual Return status | Turnover-based criteria engine (Basic vs State/Central) |
| **Data Protection** | Data Protection Board of India / MeitY | `https://www.meity.gov.in/` | Statutory Gazette Publications (DPDP Act 2023 Rules) | Data Fiduciary categories, DPO registration mandates, Breach reports | Grounded statutory compliance checklist |
| **Commercial Court/NCLT** | National Company Law Tribunal | `https://nclt.gov.in/` & `https://efiling.nclt.gov.in/` | NCLT DMS / e-Court Cause List Portal | Case number, Next hearing date, Bench jurisdiction, Order copies | Associated advocate court clerk manual tracking |

---

## 3. Freshness, SLA & Outage Mitigation Protocol

```
┌────────────────────────────────────────────────────────────────────────┐
│ DATA RETRIEVAL FAILURE CASCADE                                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Attempt Live API Call (Timeout: 4,000ms, Max Retries: 2)           │
│    └─> [SUCCESS] Cache payload for 24h & render live verified badge    │
│    └─> [FAILURE / TIMEOUT] Trigger Step 2                              │
│                                                                        │
│ 2. Check Local Cached Snapshot                                         │
│    └─> [HIT] Render cached data with disclaimer:                       │
│        "Cached as of DD-MM-YYYY. Live portal temporarily unavailable." │
│    └─> [MISS] Trigger Step 3                                           │
│                                                                        │
│ 3. Fallback to Statutory Rule Engine                                   │
│    └─> Render indicative statutory due dates based on Companies Act   │
│        Section 137/92 with prompt to verify with Compliance Desk.      │
└────────────────────────────────────────────────────────────────────────┘
```
