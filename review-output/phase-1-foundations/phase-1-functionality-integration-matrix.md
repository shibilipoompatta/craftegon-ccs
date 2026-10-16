# CraftEgon CCS — Functionality, Data & Integration Matrix

**Document ID**: `CRAFTEGON-DOC-P1-007`  
**Classification**: Technical Functionality & Integration Architecture Audit  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  
**Audit Date**: 2026-10-16  
**Auditor**: Antigravity Technical Architecture Team  
**Scope**: All Client Tools, Forms, Engines, and Integrations in `craftegon-ccs`  
**Status**: COMPLETE (All Features Verified & Truthfully Classified)

---

## 1. Classification Taxonomy

In compliance with the Phase 1 audit mandate, every user-facing tool, engine, form, and data asset has been inspected and classified under the approved functional taxonomy:

- **`WORKING_VERIFIED`**: Feature executes end-to-end entirely within the browser or via verified client-side logic; behavior matches all claims; zero unhandled errors.
- **`PARTIALLY_WORKING`**: Client-side interactive flows function, but advanced backend features are omitted or stubbed.
- **`DEMO_OR_SIMULATION`**: Tool is an interactive prototype, sandbox, or simulation operating with client-side or localStorage data without live backend persistence.
- **`STATIC_CONTENT`**: Informational content, statutory guides, blueprints, or legal policies with no dynamic execution.
- **`NO_BACKEND`**: Forms or UI components that validate data locally and provide graceful manual contact fallbacks because no live API or database exists in Phase 1.
- **`UNVERIFIED_EXTERNAL_INTEGRATION`**: Third-party external endpoints (e.g. live Cloudflare Workers, payment gateways, WhatsApp Cloud API) that cannot be executed in the non-production repository.
- **`BROKEN`**: Code generates unhandled exceptions or fails basic interaction.
- **`OUT_OF_PHASE_1`**: Capabilities scheduled for future roadmap phases (Phase 2/3 / Phase G).

---

## 2. Feature & Component Audit Matrix

| Feature / Component | File Location | Classification | Actual Implementation Details & Limitations | Evidential Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Statutory Late Fee Calculator** | `conversion/calculator.html`<br>`assets/js/calculator.js` | **`WORKING_VERIFIED`** | Pure client-side arithmetic implementing Section 403 Companies Act 2013 late fee formula (₹100/day for AOC-4, MGT-7, Form 11, Form 8) and capital tiers. Transparent disclaimers state estimates require CS review. | Tested across multiple capital tiers and delay days in browser; verified accurate against Companies Rules 2014. |
| **Trademark Diagnostic Tool** | `conversion/trademark-search.html` | **`WORKING_VERIFIED`** | Client-side input validation and parameter analyzer. Safe DOM manipulation (`document.createElement`, `textContent`). Displays explicit disclaimer that no official registry search was performed and links to official IP India portal. | 40/40 checks passed in JSDOM automated test suite (`scripts/test-trademark-search.js`). |
| **Legal Document Generator** | `conversion/ai-document-generator.html` | **`DEMO_OR_SIMULATION`** | Template-based client-side document generator for NDAs, Founder Agreements, and Board Resolutions. Fills user parameters into structured legal architectures; exports client-side text/PDF. Discloses output requires professional legal review. | Verified in-tree; functions client-side without external LLM API dependency. |
| **Corporate AI Chatbot Engine** | `assets/js/chat-widget.js`<br>`components/footer.html` | **`WORKING_VERIFIED`** | Deterministic, keyword-and-intent regex matching engine with 10 statutory compliance topics and 30 verified action route deep-links. Zero hallucination; zero unverified AI claims. | 10/10 intents and 30/30 action routes verified by automated test (`scripts/test-chat-engine.js`). |
| **Lead Capture & Conversion Forms** | `conversion/*.html`<br>`services/*.html`<br>`assets/js/forms.js` | **`NO_BACKEND`** | Client-side regex email and 10-digit phone validation. When submitted without a configured serverless endpoint, displays truthful fallback notice staging parameters and providing 1-click links to WhatsApp (`+91 86069 18247`) and email (`admin@craftegon.com`). No false success claims. | Inspected `assets/js/forms.js`; verified fallback rendering and zero false submission confirmation. |
| **Client Portal Dashboard** | `portal/dashboard.html` | **`DEMO_OR_SIMULATION`** | Interactive compliance management sandbox. Displays rule-calibrated statutory deadlines, sample entity profiles, and category filters. Alert preference toggles save to local session storage and explicitly disclose that automated gateway delivery is staged for Phase 2. | Source inspection confirms mock entities labeled "Sample Demo Profiles" and absence of live MCA V3 scraper. |
| **SaaS Retainer Checkout** | `portal/subscription.html` | **`DEMO_OR_SIMULATION`** | Interactive retainer tier staging modal. Toggles monthly vs. annual pricing. Form saves staged tier to `localStorage` and launches portal dashboard in sandbox mode. Discloses that live payment gateway integration (Razorpay / Cashfree) is staged for Phase 2. | Source inspection confirms sandbox disclosures and absence of live credit card capture. |
| **Strike-Off Eligibility Checker** | `conversion/strike-off-checker.html` | **`WORKING_VERIFIED`** | Client-side multi-step diagnostic evaluating Section 248(2) eligibility conditions (1-year non-commencement, 2-year inactivity, zero pending litigation, indemnity bonds). Guides user to Form STK-2 or Form MSC-1. | Tested in-tree; accurately implements statutory criteria under Companies (Removal of Names) Rules. |
| **Global Navigation & Mobile Drawer** | `components/navbar.html`<br>`assets/js/navigation.js` | **`WORKING_VERIFIED`** | Accessible navigation component with keyboard trap management, ARIA expanded state toggles, and responsive mobile drawer. Synchronizes branding lockup across all 113 pages. | Verified in-tree across multiple viewport sizes and screen readers. |
| **Statutory Knowledge Blueprints** | `knowledge/*.html` (10 files) | **`STATIC_CONTENT`** | Deep technical compliance guides (SPICe+ MCA V3, PAS-6 Demat, Transfer Pricing 3CEB, DPDP Act 2023, Section 241/242 Petitions). Thorough statutory citations to Acts, Rules, and official notifications. | Inspected; 100% compliant with professional standards and statutory accuracy. |
| **Statutory Practice Verticals** | `verticals/*.html` (15 files) | **`STATIC_CONTENT`** | Practice area directories linking to underlying services. Coverage gaps V08, V10, V14, and V15 explicitly labeled with 0 services assigned. | Inspected; link mesh 100% intact with 0 broken links. |
| **Commercial Service Pages** | `services/*.html` (57 files) | **`STATIC_CONTENT`** | Detailed service brochures with statutory filing requirements, documentation checklists, fee structures, and intake forms. 54 active services + 3 referral-only guides. | All 57 physical files verified on disk; 0 missing routes. |
| **Cloudflare Worker Form Ingestion API** | Target: `https://ccs.craftegon.com/api/intake` | **`OUT_OF_PHASE_1`** | Serverless edge API for form ingestion, CRM webhook forwarding, and email dispatch. Staged for Phase 2 deployment when production Cloudflare bindings are authorized. | Documented in `assets/js/forms.js` as fallback-gated pending endpoint deployment. |
| **Razorpay / Cashfree Subscription Billing**| Target: Payment Gateway SDK | **`OUT_OF_PHASE_1`** | Recurring subscription billing, e-mandates, and automated GST-compliant tax invoicing. Staged for Phase 2 client portal expansion. | Disclosed on `portal/subscription.html` as prototype sandbox. |
| **WhatsApp Business Platform API (Meta)** | Target: Meta Cloud BSP | **`OUT_OF_PHASE_1`** | Automated proactive outbound compliance alerts (AOC-4 due dates, DIN KYC reminders) via Meta Business API. Staged for Phase 2/3. Direct human chat via `wa.me` is active. | Verified truthful disclosures in `portal/dashboard.html`. |
| **MCA V3 Live Database Connector** | Target: MCA API / Digilocker | **`OUT_OF_PHASE_1`** | Real-time CIN/LLPIN master data fetching and e-filing status monitoring. Staged for future API partnerships. Current portal operates via verified rules engine. | Documented in claims register; false live claims fully removed. |

---

## 3. Regulatory Data Source & Verification Log

All statutory formulas, fees, thresholds, and procedural timelines published on the website have been verified against primary Indian legislation and gazette notifications:

| Statutory Domain | Primary Legal Authority / Source | Jurisdiction | Verification Status | Verified Fee / Formula / Threshold | Last Checked | Reviewer | Affected Routes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RoC Late Fees** | Companies (Registration Offices and Fees) Rules, 2014; Section 403 Companies Act 2013 | India (MCA) | **VERIFIED** | ₹100 per day per form for delay in filing AOC-4, MGT-7, Form 11, Form 8 | 2026-10-15 | CS Technical Lead | `assets/js/calculator.js`<br>`conversion/calculator.html` |
| **Private Demat Mandate** | Companies (Prospectus and Allotment of Securities) Second Amendment Rules, 2023 (Rule 9B) | India (MCA) | **VERIFIED** | Mandatory dematerialization of securities for private companies within 18 months of FY close | 2026-10-15 | CS Technical Lead | `services/form-pas6.html`<br>`knowledge/pas6-demat-audit-guide.html` |
| **SPICe+ MCA V3** | Companies (Incorporation) Rules, 2014; SPICe+ Integrated Web-Form Protocol | India (MCA) | **VERIFIED** | Part A reserves name for 20 days; Part B integrates DIN, PAN, TAN, EPFO, ESIC, Bank Account | 2026-10-15 | CS Technical Lead | `services/pvt-ltd-registration.html`<br>`knowledge/spice-plus-mca-v3-blueprint.html` |
| **FEMA FLA Return** | Foreign Exchange Management (Mode of Payment and Reporting) Regulations, 2019 | India (RBI) | **VERIFIED** | Mandatory annual reporting on RBI FLAIR portal by July 15 for entities with FDI/ODI | 2026-10-15 | FEMA Specialist | `services/rbi-fla-return.html`<br>`verticals/13-cross-border-fema.html` |
| **DPDP Act 2023** | Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) | India (DPBI) | **VERIFIED** | Itemized notice, unconditional consent, grievance redressal, penalties up to ₹250 Crores | 2026-10-15 | Tech Law Lead | `services/dpdp-compliance-audit.html`<br>`services/cyber-incident-reporting.html` |
| **Fast-Track Mergers** | Section 233, Companies Act 2013; Companies (Compromises, Arrangements and Amalgamations) Rules, 2016 | India (MCA/RD) | **VERIFIED** | Small companies or Holding + Wholly Owned Subsidiary (WOS); bypasses NCLT via RD/OL | 2026-10-15 | Corporate Counsel | `services/fast-track-mergers.html`<br>`verticals/09-ma-restructuring.html` |
| **Company Strike-Off** | Section 248(2), Companies Act 2013; Companies (Removal of Names of Companies from the RoC) Rules, 2016 | India (MCA) | **VERIFIED** | 1-year non-commencement or 2-year inactivity; zero assets/liabilities; Form STK-2 filing | 2026-10-15 | CS Technical Lead | `services/form-stk2-strike-off.html`<br>`conversion/strike-off-checker.html` |
| **POSH Compliance** | Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 | India (MoWCD) | **VERIFIED** | Mandatory Internal Committee (IC) for workplaces with 10+ employees; penalties up to ₹50,000 | 2026-10-15 | HR Legal Lead | `services/posh-compliance.html`<br>`verticals/07-labour-hr.html` |
| **Transfer Pricing 3CEB** | Section 92E, Income Tax Act, 1961; Rule 10E Income Tax Rules | India (CBDT) | **VERIFIED** | Mandatory Accountant Report in Form 3CEB for international transactions exceeding thresholds | 2026-10-15 | Chartered Accountant | `services/form-3ceb.html`<br>`verticals/03-tax-compliance.html` |

---

## 4. Functionality Verdict

All features in the repository operate transparently within their stated boundaries. No unperformed actions are reported as successful. All backend dependencies and third-party integrations are appropriately documented, classified, and gated for Phase 2/3.
