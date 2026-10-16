# CraftEgon CCS — Master Page, Route & Feature Inventory

**Document ID**: `CRAFTEGON-PROD-003`  
**Classification**: Traceable Product & Route Architecture Inventory  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  
**Total Managed Routes**: 113 Files (111 Content Pages, 2 Shared Partials)  

---

## 1. System Inventory Summary

| Classification | Count | Path Prefix | Key Function | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| **Corporate Gateway** | 1 | `/index.html` | Multi-vertical portal, service selector, and brand entry | **Implemented & Verified** |
| **Error Architecture** | 1 | `/404.html` | Cloudflare Pages 404 fallback with navigation recovery | **Implemented & Verified** |
| **Shared Partials** | 2 | `/components/*` | Reusable header with mega-menu & institutional footer | **Implemented & Verified** |
| **Practice Verticals** | 15 | `/verticals/*` | Practice area hubs for all 15 compliance disciplines | **Implemented & Verified** |
| **Specialized Services**| 57 | `/services/*` | High-intent commercial landing & filing pages | **Implemented & Verified** |
| **Conversion Engines** | 19 | `/conversion/*` | Intake portals, calculators, synthesizers & checkouts | **Implemented & Verified** |
| **Knowledge Blueprints**| 10 | `/knowledge/*` | Technical guides citing Companies Act, FEMA & DPDP | **Implemented & Verified** |
| **Legal & Governance** | 5 | `/legal/*` | Terms, Privacy (DPDP), Disclaimer, Refund, Confidentiality | **Implemented & Verified** |
| **Client Portal OS** | 3 | `/portal/*` | Autonomous Compliance Calendar, Subscription & Gateway | **Implemented & Verified** |

---

## 2. Practice Verticals (15 Practice Areas)

| Vertical ID | Route Path | Practice Area Name | Target Persona | Primary Statutory Focus | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **V01** | `/verticals/01-entity-formation.html` | Business Formation & Structuring | Founders & Startups | Companies Act 2013 (SPICe+), LLP Act 2008 | Implemented |
| **V02** | `/verticals/02-roc-compliance.html` | RoC Annual Compliance & Retainers | SMEs & Pvt Ltds | Form AOC-4, MGT-7, DIR-3 KYC, DPT-3 | Implemented |
| **V03** | `/verticals/03-tax-compliance.html` | Tax Compliance & Audit Filings | Corporate Taxpayers | Income Tax Act 1961, CGST/SGST Act 2017 | Implemented |
| **V04** | `/verticals/04-statutory-licenses.html` | Statutory Licenses & Registrations | Operating Businesses | FSSAI, MSME Udyam, Trade License, Shop & Est | Implemented |
| **V05** | `/verticals/05-contracts-legal.html` | Contracts & Legal Infrastructure | Enterprise Teams | Indian Contract Act 1872, Arbitration Act | Implemented |
| **V06** | `/verticals/06-ipr-protection.html` | IPR Protection & Brand Security | Brands & Creators | Trade Marks Act 1999, Copyright Act 1957 | Implemented |
| **V07** | `/verticals/07-labour-hr.html` | Labour, HR & Employment Compliance| Employers & HR | EPF Act 1952, ESI Act 1948, POSH Act 2013 | Implemented |
| **V08** | `/verticals/08-fundraising-investment.html` | Fundraising & Investment Legal | Growth Ventures | Shareholder Agreements, Due Diligence, Cap Tables | Implemented |
| **V09** | `/verticals/09-ma-restructuring.html` | M&A & Corporate Restructuring | Large Corporates | Fast-Track Mergers (Sec 233), Slump Sales | Implemented |
| **V10** | `/verticals/10-litigation-dispute.html` | Litigation, NCLT & Commercial Disputes| Corporate Boards | NCLT Petitions (Sec 241/242), IBC Insolvency | Implemented |
| **V11** | `/verticals/11-governance-audit.html` | Corporate Governance & Secretarial Audits| Large / Unlisted | Secretarial Audit Form MR-3 (Sec 204) | Implemented |
| **V12** | `/verticals/12-esg-csr.html` | ESG & Corporate Social Responsibility | Qualifying Entities | CSR Mandates (Sec 135), BRSR Reporting | Implemented |
| **V13** | `/verticals/13-cross-border-fema.html` | Cross-Border, FEMA & Structuring | Foreign MNCs / NRIs | FEMA 1999, RBI FLA Return, FC-GPR / FC-TRS | Implemented |
| **V14** | `/verticals/14-exit-insolvency.html` | Corporate Exit, Strike-Off & Dissolution| Inactive Entities | Form STK-2 Fast-Track Exit (Sec 248), IBC | Implemented |
| **V15** | `/verticals/15-it-digital.html` | IT, Cyber & Digital Compliance | Digital Platforms | DPDP Act 2023, IT Act 2000, CERT-In Rules | Implemented |

---

## 3. Diagnostic Tools, Calculators & Conversion Engines (19 Tools)

| Tool Name | Route Path | Inputs Collected | Outputs Delivered | Validation Logic | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RoC Fee Estimator** | `/conversion/calculator.html` | Entity type, Capital tier, Addons | Real-time Professional & Govt fee estimate | Pure JS formula (`assets/js/calculator.js`) | Implemented |
| **AI Legal Drafter** | `/conversion/ai-document-generator.html` | Doc type, Company, CIN, Parties | Client-side customizable legal contract draft | Client-side synthesizer with prefill | Implemented |
| **STK-2 Checker** | `/conversion/strike-off-checker.html` | Asset/liability status, dormancy years | Strike-off eligibility verdict | Rule-based conditional qualification | Implemented |
| **License Audit Engine** | `/conversion/license-qualification.html` | Industry, state, employee headcount | Mandatory license checklist (FSSAI, Shop) | Multi-criteria mapping table | Implemented |
| **Trademark Search** | `/conversion/trademark-search.html` | Proposed mark, Nice class | Phonetic search guidance & TM-A quote | Class index & registration steps | Implemented |
| **Contract Review Intake** | `/conversion/contract-intake.html` | Contract type, turnaround urgency, file | Scope assessment & retainer quote | Multi-step portal (`if-intake-portal`) | Implemented |
| **CSR Audit Form** | `/conversion/csr-audit-form.html` | Net worth, Turnover, Net profit | Sec 135 2% CSR obligation calculator | Mathematical formula under Companies Act | Implemented |
| **DPDP Audit Request** | `/conversion/dpdp-audit-request.html` | Data categories, user base, consent flow| Data Fiduciary risk assessment scope | Statutory checklist under DPDP Act 2023 | Implemented |
| **FEMA Consultation** | `/conversion/fema-consultation.html` | Investment type, FDI sector, currency | Regulatory routing & consultation intake | Foreign exchange rule qualification | Implemented |
| **Cross-Border Desk** | `/conversion/cross-border-retainer.html` | Parent entity country, subsidiary type | Cross-border retainer consultation | International tax & transfer pricing | Implemented |
| **Dispute Intake** | `/conversion/dispute-consultation.html` | Dispute nature, NCLT jurisdiction | Priority advocate partner allocation | Independent counsel disclaimer | Implemented |
| **HR Compliance Audit**| `/conversion/hr-audit.html` | Headcount, state, wage structure | PF/ESIC/POSH statutory gap analysis | Labour code applicability engine | Implemented |
| **M&A Advisory Desk** | `/conversion/ma-advisory-enquiry.html` | Deal structure, transaction size | Confidential partner consultation | Non-disclosure staging | Implemented |
| **Post-Incorp Checkout**| `/conversion/post-incorporation-checkout.html`| Company name, DIN, bank choice | Compliance onboarding kit order | Order parameter staging | Implemented |
| **Annual Retainer Desk**| `/conversion/retainer-desk.html` | Capital, turnover, monthly filings | Annual CS retainer proposal | Tier-based retainer scoping | Implemented |
| **Secretarial Scope** | `/conversion/secretarial-audit-scope.html`| Capital, outstanding loans, turnover | Form MR-3 statutory scope sheet | Section 204 threshold validation | Implemented |
| **Tax Filing Intake** | `/conversion/tax-intake.html` | Entity turnover, GST status, audit type | Income tax & GST filing plan | Direct & indirect tax audit scope | Implemented |
| **Venture Deal Desk** | `/conversion/venture-deal-booking.html` | Round size, investor type (Angel/VC) | Term sheet & SHA drafting intake | Equity cap table governance | Implemented |
| **Conversion Hub** | `/conversion/index.html` | Directory browse | 18-tool diagnostic suite index | Central directory navigation | Implemented |

---

## 4. Autonomous Compliance Calendar OS & Client Portal (3 Pages)

| Page | Route Path | Core Capabilities | Backend Dependency | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Portal Gateway** | `/portal/index.html` | Client authentication entryway, feature showcase | Static-first; future SSO | Implemented |
| **Compliance Calendar** | `/portal/dashboard.html` | Real-time countdown clocks (AOC-4, MGT-7, DIR-3 KYC, FLA), CIN/LLPIN lookup | Client-side ticker; future MCA API | Implemented |
| **SaaS Pricing Grid** | `/portal/subscription.html` | Starter (₹1,499), Growth (₹4,999), Enterprise (₹14,999) retainer tier checkout | Local parameter staging; future Razorpay | Implemented |

---

## 5. Regulatory Knowledge Blueprints (10 Blueprints)

| Blueprint Title | Route Path | Statutory Citations | Target Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SPICe+ MCA V3 Blueprint** | `/knowledge/spice-plus-mca-v3-blueprint.html` | Rule 38 Companies (Incorporation) Rules 2014, INC-20A | New Founders | Implemented |
| **MCA V3 E-Filing Guide** | `/knowledge/mca-v3-filing-guide.html` | V3 User Roles, DSC Registration, Challan Generation | CFOs, CS Practitioners | Implemented |
| **MCA Late Fee Calculator Guide**| `/knowledge/late-fee-calculator-guide.html` | Section 403, Fee Rules 2014, ₹100/day penalties | Corporate Promoters | Implemented |
| **RBI FLA Return Blueprint** | `/knowledge/rbi-fla-return-blueprint.html` | FEMA 1999, RBI FLAIR System, July 15 Deadline | FDI Entities, MNCs | Implemented |
| **LLP Solvency & Compliance** | `/knowledge/llp-compliance-solvency-guide.html` | LLP Act 2008, Form 8 (Solvency), Form 11 (Annual) | Designated Partners | Implemented |
| **SBO & Form BEN-2 Guide** | `/knowledge/sbo-ben2-guide.html` | Section 90 Companies Act 2013, Significant Owners | Holding Companies | Implemented |
| **PAS-6 Demat Audit Guide** | `/knowledge/pas6-demat-audit-guide.html` | Rule 9A Companies (Prospectus & Allotment) Rules | Unlisted Public / Pvt | Implemented |
| **Transfer Pricing Guide** | `/knowledge/transfer-pricing-guide.html` | Section 92E Income Tax Act 1961, Form 3CEB | Cross-Border Enterprises | Implemented |
| **DIN Disqualification Guide**| `/knowledge/director-disqualification-guide.html`| Section 164(2), 167(1)(a), High Court Writ Remedy | Disqualified Directors | Implemented |
| **Knowledge Base Gateway** | `/knowledge/index.html` | Master directory of all statutory regulatory blueprints | Enterprise Researchers | Implemented |

---

## 6. Statutory Legal Policies (5 Pages)

| Policy Name | Route Path | Legal Grounding | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Terms & Conditions** | `/legal/terms.html` | Indian Contract Act 1872, IT Act 2000 | Platform service terms, payment rules, user conduct | Implemented |
| **Privacy Policy** | `/legal/privacy.html` | Digital Personal Data Protection (DPDP) Act 2023 | Data Fiduciary disclosures, consent mechanisms | Implemented |
| **Professional Disclaimer** | `/legal/disclaimer.html` | Advocates Act 1961, Bar Council of India Rule 36 | Non-solicitation, independent advocate framework | Implemented |
| **Refund Policy** | `/legal/refund.html` | Consumer Protection Act 2019, MCA Govt Fees Rules | Non-refundable govt fees vs professional retentions | Implemented |
| **Confidentiality Policy** | `/legal/confidentiality.html` | Section 43A IT Act, Trade Secrets Common Law | NDA protection for client corporate records | Implemented |
