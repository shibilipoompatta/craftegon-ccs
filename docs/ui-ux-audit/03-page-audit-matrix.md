# CRAFTEGON Corporate Services (CCS)
## Independent UI/UX, Design, Navigation & Architecture Audit
### Deliverable 3: Page-by-Page Audit Matrix

**Document Reference:** `DOC-CCS-UX-AUDIT-03-MATRIX`  
**Classification:** Granular Page Audit, UX/UI Scoring & Lifecycle Action Matrix  
**Auditing Team:** Senior Digital Product Transformation Team  
**Date:** November 2026  
**Evaluation Scope:** All Public & Core Service Routes across the 157-Page Codebase  

---

## 1. Audit Scoring Methodology

Every page is evaluated across three core criteria on a strict **0 to 10 scale**:
- **UX Score (User Experience):** Evaluates cognitive load, scan-ability, information hierarchy, mobile usability, CTA clarity, and ease of reaching completion.
- **Visual Design Score:** Evaluates art direction, typography craft, spacing discipline, color restraint, visual differentiation, and freedom from "AI slop".
- **Content Score:** Evaluates regulatory accuracy, statutory completeness, clarity of scope (inclusions/exclusions/statutory fees), and absence of filler marketing text.

### Prescribed Lifecycle Actions:
- `KEEP`: Retain page structure with minimal maintenance.
- `REDESIGN`: Overhaul the UI layout, component hierarchy, and visual presentation while preserving text/logic.
- `REWRITE`: Substantially revise marketing copy, headings, and readability.
- `MERGE`: Consolidate thin, redundant pages into a single canonical URL with 301 redirects.
- `SPLIT`: Break an overloaded page into focused sub-pages.
- `MOVE`: Relocate page into a more logical directory or navigation hierarchy.
- `ARCHIVE`: Deprecate and remove obsolete routes.
- `NO CHANGE`: Page is production-ready and fully aligned with design standards.

---

## 2. Comprehensive Page-by-Page Audit Matrix

| URL / Route | Page Title / Purpose | UX (0-10) | Visual (0-10) | Content (0-10) | Critical UX/UI Problems Identified | Recommended Action | Priority |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: | :---: |
| `/index.html` | Homepage & Primary Platform Gateway | 6.8 | 6.5 | 8.5 | High card density (flagship cards, channel cards, wizard cards). Hero search is functional but visually heavy. Emoji prefixes (`⚡`, `🚀`, `🏛️`) cheapen enterprise credibility. Inline styles clutter wizard. | **REDESIGN** | **P1** |
| `/services.html` | Master 57-Service Directory | 6.5 | 6.0 | 8.0 | Long repetitive list of cards. Filter tabs are hard to scan on mobile. Needs an editorial table view or faceted sidebar navigation instead of an endless card grid. | **REDESIGN** | **P1** |
| `/about.html` | About CCS & Tripartite Institutional Model | 7.5 | 7.0 | 9.0 | Content explaining the Tripartite Model (LLP vs. CA/CS vs. Advocates) is legally brilliant, but presented in dry text blocks. Needs clean architectural infographics. | **REDESIGN** | **P2** |
| `/contact.html` | Contact Desk & Regional Offices | 7.2 | 7.0 | 8.0 | Standard form layout. Lacks interactive map or clear routing by query type (Tax vs. Secretarial vs. Dispute). | **REDESIGN** | **P2** |
| `/404.html` | Custom 404 Error Page | 8.0 | 7.5 | 8.0 | Clean error recovery links to search, services, and home. Minimal styling debt. | **KEEP** | **P3** |
| `/categories/index.html` | 6 Core Service Pillars Directory | 7.0 | 6.8 | 8.5 | Good conceptual structure, but uses generic icon-and-card layout. Needs prominent integration into main desktop header. | **REDESIGN** | **P0** |
| `/categories/business-setup.html` | Category Hub 1: Entity Structuring | 7.2 | 6.8 | 8.8 | Clean categorization of Pvt Ltd, LLP, OPC, Section 8, and Firm setups. Lacks comparison matrix for decision-making. | **REDESIGN** | **P1** |
| `/categories/corporate-compliance.html` | Category Hub 2: RoC Compliance | 7.0 | 6.5 | 8.8 | Good coverage of AOC-4, MGT-7, and Retainers. Needs a compliance calendar visualizer instead of cards. | **REDESIGN** | **P1** |
| `/categories/tax-compliance.html` | Category Hub 3: GST & Corporate Tax | 7.0 | 6.5 | 8.5 | Covers GSTR-9, ITR-7, and 3CEB well. Needs clear explanation of Section 43B(h) and tax deadlines. | **REDESIGN** | **P1** |
| `/categories/licences-registrations.html` | Category Hub 4: Statutory Licences | 7.2 | 6.8 | 8.5 | Features Udyam and DPIIT prominently. Needs sector-specific licensing selector (Food, Shop, Import/Export). | **REDESIGN** | **P1** |
| `/categories/legal-contracts-ip.html` | Category Hub 5: Contracts & Trademarks | 7.0 | 6.5 | 8.8 | Merges commercial contracts with IP effectively. Visual layout repeats the same card grid pattern. | **REDESIGN** | **P1** |
| `/categories/workforce-operations.html` | Category Hub 6: Workforce & Digital | 7.2 | 6.8 | 8.8 | Covers POSH, EPF, and DPDP Act. Good regulatory depth, but typography needs cleaner sectioning. | **REDESIGN** | **P1** |
| `/verticals/01-entity-formation.html` | Vertical 01: Entity Formation | 6.0 | 5.8 | 8.5 | Identical document SVG icon copy-pasted across all 6 cards. Generic descriptions. Repetitive layout. | **REDESIGN** | **P1** |
| `/verticals/02-roc-compliance.html` | Vertical 02: RoC Compliance | 6.0 | 5.8 | 8.5 | Repeats the exact same card layout as Vertical 01. Lacks timeline or filing calendar. | **REDESIGN** | **P1** |
| `/verticals/03-tax-compliance.html` | Vertical 03: Tax & Regulatory | 6.0 | 5.8 | 8.5 | Mechanical 3-column card grid. Does not communicate tax audit urgency or penalty structures effectively. | **REDESIGN** | **P1** |
| `/verticals/04-statutory-licenses.html` | Vertical 04: Statutory Licences | 6.0 | 5.8 | 8.5 | Identical card template. Descriptions feel auto-generated. | **REDESIGN** | **P1** |
| `/verticals/05-contracts-legal.html` | Vertical 05: Commercial Drafting | 6.2 | 5.8 | 8.8 | Good legal contract descriptions, but layout fails to show sample clauses or drafting turnaround timelines. | **REDESIGN** | **P1** |
| `/verticals/06-ipr-protection.html` | Vertical 06: Intellectual Property | 6.2 | 6.0 | 8.8 | Covers TM-A and Copyright. Needs a visual explanation of the 5-stage trademark lifecycle (Search to Registration). | **REDESIGN** | **P1** |
| `/verticals/07-labour-hr.html` | Vertical 07: Employment & HR | 6.0 | 5.8 | 8.5 | Identical card grid. POSH and Labour Code content deserve high-impact policy previews. | **REDESIGN** | **P1** |
| `/verticals/08-fundraising-investment.html` | Vertical 08: Startup & Investment | 6.2 | 5.8 | 8.5 | Covers SHA and term sheets. Visually identical to other verticals; lacks investor cap table diagrams. | **REDESIGN** | **P1** |
| `/verticals/09-ma-restructuring.html` | Vertical 09: Transactions & M&A | 6.0 | 5.5 | 8.8 | Covers Section 233 Fast-Track Mergers. Layout is too casual for complex corporate reorganizations. | **REDESIGN** | **P1** |
| `/verticals/10-litigation-dispute.html` | Vertical 10: Dispute Avoidance | 6.5 | 6.0 | 9.0 | Excellent Advocates Act boundary disclaimers, but visually indistinguishable from non-litigation pages. | **REDESIGN** | **P1** |
| `/verticals/11-governance-audit.html` | Vertical 11: Governance & Audit | 6.0 | 5.5 | 8.8 | Secretarial Audit and Board Minutes. Monotonous card grid undermines institutional prestige. | **REDESIGN** | **P1** |
| `/verticals/12-esg-csr.html` | Vertical 12: Data Privacy & Tech Law | 6.2 | 6.0 | 8.8 | Excellent DPDP Act coverage. Needs an interactive privacy audit checklist instead of text cards. | **REDESIGN** | **P1** |
| `/verticals/13-cross-border-fema.html` | Vertical 13: International & FEMA | 6.0 | 5.8 | 8.8 | Cross-border FDI and FLA returns. Deserves an international currency and timeline visualizer. | **REDESIGN** | **P1** |
| `/verticals/14-retainers-legal-desk.html` | Vertical 14: Corporate Retainers | 6.2 | 6.0 | 8.5 | Explains retainer plans, but overlaps heavily with `/conversion/retainer-desk.html`. | **REDESIGN & MERGE** | **P2** |
| `/verticals/15-it-digital.html` | Vertical 15: IT & Digital | 6.0 | 5.5 | 8.0 | SaaS agreements and digital compliance. Generic card layout. | **REDESIGN** | **P2** |
| `/services/pvt-ltd-registration.html` | Flagship: Private Limited Setup | 7.0 | 6.5 | 9.2 | Legally exhaustive (3-box pricing, inclusions/exclusions, INC-20A add-on). 277 inline styles! Wall of text causes fatigue. | **REDESIGN** | **P0** |
| `/services/llp-registration.html` | Flagship: LLP Registration | 7.0 | 6.5 | 9.0 | 260 inline styles. Strong explanation of Form 3 and State Stamp Duty. Needs visual workflow diagram. | **REDESIGN** | **P0** |
| `/services/msme-udyam.html` | Flagship: MSME Udyam | 6.8 | 6.2 | 9.0 | 399 inline styles! Highest inline styling count in codebase. Needs stylesheet extraction and cleaner benefits grid. | **REDESIGN** | **P0** |
| `/services/trademark-registration.html` | Flagship: Trademark Form TM-A | 7.0 | 6.5 | 9.2 | 351 inline styles. Pricing (₹3,499 + ₹4,500 govt) is very transparent. Needs interactive Class 1-45 search pill. | **REDESIGN** | **P0** |
| `/services/roc-annual-compliance.html` | Flagship: RoC Annual Retainer | 7.2 | 6.8 | 9.2 | Strong explanation of ₹100/day late fee prevention. Needs tabular comparison of Retainer Tiers (Bronze/Silver/Gold). | **REDESIGN** | **P0** |
| `/services/opc-registration.html` | Core: One Person Company | 6.8 | 6.2 | 8.8 | 242 inline styles. Nominee consent requirements well explained, but page feels copy-pasted from Pvt Ltd. | **REDESIGN** | **P1** |
| `/services/section-8-registration.html` | Core: Section 8 Non-Profit | 6.8 | 6.2 | 8.8 | 248 inline styles. Complex licensing (INC-12) explained well, but visual presentation is dense and intimidating. | **REDESIGN** | **P1** |
| `/services/partnership-registration.html` | Core: Partnership Firm Setup | 7.0 | 6.5 | 8.8 | Crucial Section 69 bar explained accurately. Needs clean deed drafting checklist. | **REDESIGN** | **P1** |
| `/services/sole-proprietorship.html` | Core: Sole Proprietorship | 6.8 | 6.2 | 8.5 | Clear distinction between legal personhood and individual liability. Visual layout is basic. | **REDESIGN** | **P2** |
| `/services/dpiit-startup-india.html` | Core: DPIIT Startup India | 7.5 | 7.0 | 9.5 | Excellent regulatory precision (reflects Finance Act 2024 Angel Tax abolition and Sec 80-IAC). Needs visual grant roadmap. | **REDESIGN** | **P1** |
| `/services/form-aoc4.html` | RoC: AOC-4 Financials | 6.5 | 6.0 | 8.8 | Heavy on technical compliance text. Lacks visual deadline indicator (30 days from AGM). | **REDESIGN** | **P1** |
| `/services/form-mgt7.html` | RoC: MGT-7 Annual Return | 6.5 | 6.0 | 8.8 | MGT-8 threshold (₹10Cr capital / ₹50Cr turnover) clearly stated. Card structure is mechanical. | **REDESIGN** | **P1** |
| `/services/dir3-kyc.html` | RoC: DIR-3 KYC Verification | 7.0 | 6.5 | 8.8 | Accurately explains Web OTP vs. e-Form DSC. Needs a simple 2-step decision tree for directors. | **REDESIGN** | **P1** |
| `/services/form-adt1.html` | RoC: Auditor Appointment | 6.5 | 6.0 | 8.5 | 15-day statutory deadline from AGM date. Clear, but page layout is basic. | **REDESIGN** | **P2** |
| `/services/form-dpt3.html` | RoC: Return of Deposits | 6.5 | 6.0 | 8.5 | Explains loans from directors vs. public deposits. Technical language needs scannable bullet points. | **REDESIGN** | **P2** |
| `/services/form-pas6.html` | RoC: Demat Reconciliation | 6.5 | 6.0 | 8.5 | Covers Rule 9B dematerialisation mandate. Very technical; needs visual explanation of ISIN allocation. | **REDESIGN** | **P2** |
| `/services/form-ben2.html` | RoC: SBO Reporting | 6.5 | 6.0 | 8.8 | Section 90 beneficial ownership rules. Needs visual chart of 10% direct/indirect holding triggers. | **REDESIGN** | **P2** |
| `/services/form-mgt14.html` | RoC: Special Resolutions | 6.5 | 6.0 | 8.5 | 30-day filing rule. Layout is plain and lacks table of common special resolution triggers. | **REDESIGN** | **P2** |
| `/services/form-msc1-dormant.html` | RoC: Dormant Company Status | 6.8 | 6.2 | 8.8 | Excellent cost-saving value proposition. Needs comparison of Dormant status vs. Strike-off (STK-2). | **REDESIGN** | **P2** |
| `/services/llp-compliance-forms.html` | RoC: LLP Form 8 & 11 | 6.8 | 6.2 | 8.8 | May 30 and Oct 30 deadlines clearly highlighted. Card grid needs modernization. | **REDESIGN** | **P1** |
| `/services/form-stk2.html` | RoC: Fast-Track Strike-Off | 6.8 | 6.2 | 8.8 | Section 248 closure procedures. Needs an indemnity and statement of liabilities checklist. | **REDESIGN** | **P1** |
| `/services/gst-annual.html` | Tax: GSTR-9 & 9C Return | 7.0 | 6.5 | 9.0 | Turnover thresholds (>₹2Cr for 9, >₹5Cr for 9C) clearly articulated. Needs visual ITC reconciliation steps. | **REDESIGN** | **P1** |
| `/services/itr7.html` | Tax: Corporate ITR-7 | 6.5 | 6.0 | 8.5 | Non-profit and company tax filing. Text-heavy; needs timeline calendar for audit cases (Oct 31). | **REDESIGN** | **P2** |
| `/services/proprietorship-tax.html` | Tax: Proprietorship SME Tax | 6.8 | 6.2 | 8.5 | Presumptive taxation (44AD/44ADA) vs. normal books. Needs an interactive tax slab estimator. | **REDESIGN** | **P2** |
| `/services/form-3ceb.html` | Tax: Transfer Pricing Form 3CEB | 6.5 | 6.0 | 8.8 | Section 92E international transactions. Very technical; needs visual cross-border transaction diagram. | **REDESIGN** | **P2** |
| `/services/form-10b.html` | Tax: Trust Audit Form 10B/10BB | 6.5 | 6.0 | 8.8 | Trust tax exemption requirements. Needs a clear pre-audit document checklist. | **REDESIGN** | **P2** |
| `/services/pf-esic-compliance.html` | Workforce: PF & ESIC Setup | 6.8 | 6.2 | 8.5 | 10 and 20 employee thresholds clearly stated. Needs visual monthly ECR filing workflow. | **REDESIGN** | **P2** |
| `/services/posh-compliance.html` | Workforce: POSH Act Compliance | 7.2 | 6.8 | 9.0 | Internal Committee constitution order, annual report, and Section 134(3)(q) board disclosure. Strong page. | **REDESIGN** | **P1** |
| `/services/founder-shareholder-agreements.html` | Legal: Founder Pacts & SHAs | 7.0 | 6.5 | 9.0 | Reverse vesting, drag-along/tag-along, and deadlock mechanisms. Needs visual equity vesting graph. | **REDESIGN** | **P1** |
| `/services/master-service-agreements.html` | Legal: Master Service Agreements | 7.0 | 6.5 | 8.8 | B2B service scope, SLA, and limitation of liability clauses. Clean content; plain presentation. | **REDESIGN** | **P2** |
| `/services/software-copyright-patents.html` | IP: Software Copyright & Patents | 6.8 | 6.2 | 8.8 | Clear distinction between copyright and patentability of computer programs. Needs patent eligibility guide. | **REDESIGN** | **P2** |
| `/services/ip-enforcement-cease-desist.html` | IP: Infringement & Demand Notices | 7.0 | 6.5 | 9.0 | Advocates Act boundary clearly preserved. Needs a sample notice structure preview. | **REDESIGN** | **P2** |
| `/services/fast-track-merger-233.html` | M&A: Section 233 Mergers | 6.5 | 5.8 | 9.0 | Fast-track Regional Director procedures. Very dense; needs visual step-by-step merger flowchart. | **REDESIGN** | **P1** |
| `/services/corporate-slump-sale.html` | M&A: Corporate Slump Sale | 6.5 | 5.8 | 8.8 | Business Transfer Agreement and Section 50B tax rules. Needs valuation and board resolution checklist. | **REDESIGN** | **P2** |
| `/services/secretarial-audit-mr3.html` | Governance: Form MR-3 Audit | 6.8 | 6.2 | 9.0 | Section 204 mandatory audit thresholds. Strong content; needs visual compliance scope diagram. | **REDESIGN** | **P2** |
| `/services/saas-terms-privacy-architecture.html` | Tech Law: SaaS Terms & Privacy | 7.2 | 6.8 | 9.0 | Section 79 IT Act safe harbour, user terms, and DPDP notices. Good page; needs layout refinement. | **REDESIGN** | **P2** |
| `/services/form-fc3-fc4.html` | Cross-Border: Foreign Branch Office | 6.5 | 6.0 | 8.8 | RBI FIRMS and MCA FC-3/4 filings. Needs a foreign inward remittance procedural chart. | **REDESIGN** | **P2** |
| `/conversion/calculator.html` | RoC Late Fee & Stamp Duty Calculator | 7.5 | 7.0 | 9.0 | High-value interactive utility. Sidebar layout is cramped on tablets; needs cleaner result cards. | **REDESIGN** | **P1** |
| `/conversion/retainer-desk.html` | Secretarial Retainer Quote Desk | 7.2 | 6.8 | 8.8 | Interactive quote builder. Form controls need polished styling and cleaner state transitions. | **REDESIGN** | **P1** |
| `/conversion/index.html` | Diagnostic Tools Master Hub | 6.8 | 6.2 | 8.0 | Card listing of diagnostic tools. Repeats the same bento-grid AI pattern. | **REDESIGN** | **P2** |
| `/locations/kozhikode-corporate-services.html` | Regional Corridor: Kozhikode | 7.2 | 6.8 | 8.5 | Focuses on Cyberpark and IT startups. Needs genuine local office photography and map embed. | **REDESIGN** | **P2** |
| `/locations/malappuram-nri-business-desk.html` | Regional Corridor: Malappuram | 7.2 | 6.8 | 8.5 | Focuses on NRI Gulf capital and healthcare ventures. Strong commercial relevance; plain layout. | **REDESIGN** | **P2** |
| `/legal/terms.html` | Master Terms of Service | 8.0 | 7.5 | 9.5 | Legally comprehensive (Advocates Act disclaimer, Section 447/448 indemnity, DPDP consent, arbitration). | **KEEP** | **P3** |
| `/legal/disclaimer.html` | Professional Statutory Disclaimer | 8.0 | 7.5 | 9.5 | Crucial legal barrier preventing litigation holding-out. Clean, legible typography. | **KEEP** | **P3** |
| `/legal/privacy.html` | Privacy Policy (DPDP Act 2023) | 8.0 | 7.5 | 9.5 | Compliant with DPDP Rules 2025. Clear Data Principal rights and grievance contacts. | **KEEP** | **P3** |
| `/legal/refund.html` | Refund & Pure Agent Fee Policy | 8.0 | 7.5 | 9.2 | Clear separation of professional fees from government disbursements. | **KEEP** | **P3** |
| `/legal/confidentiality.html` | Confidentiality & Data Safeguards | 8.0 | 7.5 | 9.2 | Professional privilege standards and AES-256 storage disclosures. | **KEEP** | **P3** |

---

## 3. High-Priority Consolidation Targets (P0 & P1)

1. **Flagship Service Template Refactor (P0):**
   - The top 5 gateway pages (`pvt-ltd-registration.html`, `llp-registration.html`, `msme-udyam.html`, `trademark-registration.html`, `roc-annual-compliance.html`) contain **over 1,500 hardcoded inline styles combined**. They must be refactored into a single, clean, semantic HTML template utilizing shared CSS classes from `assets/css/service-page.css`.
2. **Vertical Hub Template Modernization (P1):**
   - The 15 vertical pages (`verticals/01` to `15`) must be rewritten from copy-paste card grids into structured editorial hubs featuring:
     - An authoritative practice overview.
     - A clean service comparison table.
     - A stepped statutory process guide.
     - Practice-specific FAQs.
3. **Core Category Integration (P0):**
   - Elevate `/categories/` to become the primary discovery gateway in the top navigation bar, relegating the 15 verticals to a secondary technical lookup index.

---
*End of Deliverable 3. Proceed to Deliverable 4 for the AI Design Pattern Audit.*
