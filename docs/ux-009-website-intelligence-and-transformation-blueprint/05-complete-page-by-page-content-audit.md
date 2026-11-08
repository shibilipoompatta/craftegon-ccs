# TASK-CCS-UX-009: Site-Wide Page-by-Page Content Intelligence Audit

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Auditor:** Content Strategist & Information Architect  
**Date:** November 8, 2026

---

## 1. Executive Content Audit Overview

Every page on the CraftEgon Corporate Services platform must fulfill a specific visitor intent, provide clear next steps, communicate accurate statutory requirements, and maintain absolute integrity regarding operational capabilities.

This site-wide audit categorizes the complete **123 HTML page inventory** into eight functional families, evaluating audience, primary question, content quality, length, risks, and proposed transformation treatment.

---

## 2. Page Family 1: Core Institutional & Discovery Pages (4 Pages)

| File Path | Primary Audience | Visitor's Core Question | Main Purpose | Content Relevance & Quality | Length Assessment | Proposed Treatment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `index.html` | Business founders, CFOs, corporate legal teams. | *"Who is CraftEgon, what services do you provide, and can I trust you with my corporate filings?"* | Brand front door, high-level capability showcase, and primary conversion point. | Overloaded with 10 sections and 44 service cards. | **Excessively Long** (72KB, 1,274 lines, >9,800px on mobile). | **REWRITE:** Rationalise into 8 concise sections; relocate deep service cards to `/services/`. |
| `about.html` | Prospective enterprise clients, partners, investors. | *"What is CraftEgon's operating model, professional team background, and regulatory status?"* | Detailed firm narrative, operational service desk overview, professional standards. | High quality; accurately distinguishes secretarial coordination from legal advocacy. | **Appropriate** (507 words). | **REWRITE:** Ensure strict compliance with approved brand positioning and Service Desk designation. |
| `services.html` | Founders and finance managers seeking a specific filing or registration. | *"What specific corporate service packages do you offer, how much do they cost, and how long do they take?"* | Universal searchable and filterable directory of all 57 corporate services. | High utility. Fast client-side filtering, category chips, and MCA form code search. | **Appropriate** (Comprehensive directory). | **REWRITE:** Resolve sticky filter toolbar overlap on mobile; make `services.html` canonical target. |
| `404.html` | Visitors arriving via mistyped or broken external links. | *"Where did my requested compliance page go?"* | Error recovery, search guidance, and redirection to practice areas. | Clean, helpful, includes search suggestions and direct links to popular verticals. | **Concise** (106 words). | **KEEP:** Retain existing helpful error recovery layout. |

---

## 3. Page Family 2: Corporate Practice Area Verticals (15 Pages in `/verticals/`)

The 15 vertical pages represent CraftEgon's core practice pillars. Each vertical serves as a high-level thematic hub grouping related individual services:

| Vertical Route | Practice Area Name | Target Audience | Primary Need Addressed | Content Quality & Consistency | Proposed Treatment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01-entity-formation.html` | Business Formation & Structuring | New entrepreneurs, startup founders. | Entity selection (Pvt Ltd vs LLP vs OPC vs Branch). | High. Clear comparison tables and procedural roadmaps. | **KEEP & REVISE:** Standardize hero and CTA. |
| `02-roc-compliance.html` | Corporate Secretarial & ROC Filing | Existing Indian company directors, CFOs. | Annual compliance milestones (AOC-4, MGT-7, KYC). | High. Accurate statutory timelines under Companies Act. | **KEEP & REVISE:** Link directly to late-fee calculator. |
| `03-tax-compliance.html` | Tax & Regulatory Registrations | Finance teams, accountants. | GST returns, TDS compliance, Transfer Pricing. | Solid. Accurately separates routine tax from advisory. | **KEEP & REVISE:** Highlight direct vs referral scope. |
| `04-licences-registrations.html` | Statutory Licences & Clearances | Operating business owners. | MSME, Shop & Establishment, FSSAI, Import-Export. | High. Clear eligibility checklists. | **KEEP & REVISE:** Ensure zero unconfirmed turnaround claims. |
| `05-contracts-documentation.html` | Commercial Contracts & Legal Drafting| Corporate executives, founders. | Founder agreements, vendor contracts, NDAs. | Strong. Clear drafting scopes. | **KEEP & REVISE:** Clarify drafting vs advocacy boundaries. |
| `06-intellectual-property.html` | Intellectual Property & Trademarks | Brand owners, innovators. | Trademark searches, TM-A filings, objection replies. | High. Accurate IP India procedural context. | **KEEP & REVISE:** Link to trademark search tool. |
| `07-hr-employment.html` | Employment & HR Compliance | HR heads, startup employers. | EPF, ESI, POSH policies, employment contracts. | Solid. Clear statutory threshold explanations. | **KEEP & REVISE:** Standardize layout. |
| `08-startup-investment.html` | Startup Advisory & Investment | Funded startups, angel investors. | Cap table advisory, SHA drafting, Due Diligence. | Good. Reassuring professional scoping. | **KEEP & REVISE:** Contextual intake button. |
| `09-corporate-transactions.html` | Mergers, Amalgamations & Restructuring| Expanding mid-market enterprises. | Section 230-232 schemes, capital reduction. | Technical. Appropriate for senior leadership. | **KEEP & REVISE:** Strict referral disclaimers. |
| `10-dispute-avoidance.html` | Non-Litigation Dispute Avoidance | Distressed businesses, partner disputes. | Board deadlocks, contract mediation, settlements. | Critical. Accurately framed as non-litigation advisory. | **KEEP & REVISE:** Ensure zero court representation claims. |
| `11-governance-audit.html` | Internal Governance, Secretarial Audit | Board committees, compliance officers. | Form MR-3 secretarial audit, ESG compliance. | High quality technical secretarial content. | **KEEP & REVISE:** Link to retainer desk. |
| `12-data-privacy.html` | Data Privacy & DPDP Compliance | Digital products, tech enterprises. | DPDP Act 2023 readiness, Consent Architecture. | Excellent modern legaltech guidance. | **KEEP & REVISE:** Connect to DPDP diagnostic tool. |
| `13-international-fema.html` | Cross-Border & Foreign Investment | Foreign subsidiaries, NRI investors. | RBI FLA return, FC-GPR filing, FDI reporting. | Rigorous. Accurate FEMA 1999 regulatory references. | **KEEP & REVISE:** Link to cross-border intake. |
| `14-corporate-retainers.html` | Retainer & Dedicated Legal Desk | Growing companies needing continuous support.| Fractional corporate secretarial & compliance desk. | High commercial value. Clearly explains retainer tiers. | **KEEP & REVISE:** Primary conversion funnel. |
| `15-digital-it-infrastructure.html` | Technology & Digital Infrastructure | Modern businesses scaling IT infrastructure.| SaaS terms, technology agreements, cloud governance. | Strong intersection of legal and digital infrastructure. | **KEEP & REVISE:** Standardize hero styling. |

---

## 4. Page Family 3: Individual Service Detail Pages (57 Pages in `/services/`)

The 57 individual service pages represent the functional core of CraftEgon's service delivery. Each page focuses on a single statutory filing, registration, or compliance requirement.

### Content Quality & Standardisation Findings:
1. **Strengths:** 
   - Consistent data structure: Overview, Who Needs It, Statutory Timeline, Government Fees, Scope of Assistance, and Required Documents.
   - Statutory grounding: Every page cites applicable sections of the Companies Act 2013, LLP Act 2008, Trade Marks Act 1999, or Income Tax Act 1961.
   - Clear delivery model indicators: Distinguishes direct secretarial execution (e.g., Form AOC-4) from coordinated professional referral (e.g., NCLT appearances).
2. **Defects to Remediate in Transformation:**
   - Visual inconsistency: Some service pages use older navy-and-gold CSS classes (`.reg-card`, `.btn-gold`), while others use the new mint-and-sky design tokens.
   - Contact CTA hardcoding: Several pages embed full contact forms rather than clean consultation cards linking to the centralized enquiry desk.
   - Proposed Treatment: **KEEP all 57 pages**; migrate them systematically to a unified, responsive service detail template.

---

## 5. Page Family 4: Conversion Tools & Intakes (20 Pages in `/conversion/`)

| Page Route | Tool / Form Name | Commercial Purpose | Technical Implementation | Proposed Treatment |
| :--- | :--- | :--- | :--- | :--- |
| `calculator.html` | Late Fee & Stamp Duty Calculator | High-intent lead generation via statutory penalty estimates. | Client-side JS (`calculator.js`). Instant math based on days overdue. | **KEEP & REVISE:** Clean interface, add print summary. |
| `post-incorporation-checkout.html` | Post-Incorporation Compliance Intake | Captures newly incorporated entities for first-year filings. | Multi-step form with itemised milestone checklist. | **KEEP & REVISE:** Minimize personal data fields. |
| `tax-intake.html` | Corporate Tax Consultation Desk | Gathers financial year and filing status for tax retainers. | Dynamic conditional form inputs based on entity turnover. | **KEEP & REVISE:** Remove sensitive financial document uploads. |
| `retainer-desk.html` | Retainer Desk Enquiry | Enterprise intake for fractional secretarial retainers. | High-tier enquiry form with dedicated service scoping options. | **KEEP & REVISE:** Position as the primary structured contact desk. |
| `trademark-search.html` | Preliminary Trademark Evaluator | Evaluates mark availability and Nice Class selection. | Interactive search interface with Class 1-45 lookup. | **KEEP & REVISE:** Retain XSS-sanitized search. |
| `strike-off-checker.html` | Form STK-2 Defunct Company Checker | Assesses eligibility for fast-track corporate closure. | Interactive 4-step eligibility questionnaire. | **KEEP & REVISE:** Add clear qualification disclaimers. |
| `fema-consultation.html` | Cross-Border & Foreign Investment Intake | Captures inbound FDI / outbound remittance parameters. | Specialized international business inquiry form. | **KEEP & REVISE:** Ensure strict FEMA advisory disclaimers. |
| `dpdp-audit-request.html` | Data Protection Audit Request | Captures organizational data processing parameters. | Structured questionnaire for DPDP compliance reviews. | **KEEP & REVISE:** Align with Digital Personal Data Protection Act. |
| *(Remaining 12 intake tools)* | Specialized service intakes | Targeted intake forms for specific corporate filings. | Consistent form handlers with offline WhatsApp fallback. | **KEEP & REVISE:** Consolidate redundant form schemas. |

---

## 6. Page Family 5: Knowledge Centre & Statutory Guides (12 Pages in `/knowledge/`)

| Article Path | Statutory Topic | Educational Value | Relationship to Services | Proposed Treatment |
| :--- | :--- | :--- | :--- | :--- |
| `spice-plus-mca-v3-blueprint.html` | SPICe+ MCA V3 Step-by-Step | Explains Ministry of Corporate Affairs incorporation. | Links to `pvt-ltd-registration.html`. | **KEEP:** Excellent organic SEO asset. |
| `transfer-pricing-guide.html` | Form 3CEB & Transfer Pricing | Explains arm's length documentation rules. | Links to `form-3ceb.html`. | **KEEP:** High-value enterprise guide. |
| `fast-track-strike-off-guide.html` | Section 248 Company Closure | Explains STK-2 filing prerequisites. | Links to `form-stk2-strike-off.html`. | **KEEP:** High organic intent. |
| `dpdp-readiness-checklist.html` | DPDP Act 2023 Implementation | Practical 10-point data privacy readiness guide. | Links to `dpdp-compliance-audit.html`. | **KEEP:** Timely regulatory asset. |
| `late-fee-calculator-guide.html` | Section 403 MCA Penalty Rules | Explains ₹100/day late fee calculation mechanics. | Links to `calculator.html`. | **KEEP:** Strong companion to calculator. |
| *(Remaining 7 articles)* | Secretarial and tax filing guides | Clear plain-language procedural explanations. | Contextual service backlinks. | **KEEP:** Retain and cross-link contextually. |

---

## 7. Page Family 6: Legal & Regulatory Policies (5 Pages in `/legal/`)

- `privacy.html`: Data privacy policy complying with the DPDP Act 2023. Explicitly states data minimization policies. (**KEEP**)
- `terms.html`: Terms of engagement detailing service scopes, fixed quotes, and payment terms. (**KEEP**)
- `disclaimer.html`: Mandatory statutory disclaimer clarifying that CraftEgon Corporate Services is a corporate secretarial and business support provider, not a law firm, and does not engage in court litigation or unauthorized practice of law under the Advocates Act, 1961. (**KEEP - Essential**)
- `cookie-policy.html`: Explains client-side cookie usage and local storage parameters. (**KEEP**)
- `grievance.html`: Statutory grievance redressal mechanism with contact channels. (**KEEP**)

---

## 8. Page Family 7: Excluded Non-Public Modules (6 Pages)

In strict accordance with **Owner Decisions 4.4 and 4.5**:
- `portal/index.html`, `dashboard.html`, `documents.html`, `subscription.html`: **EXCLUDE FROM PUBLIC WEBSITE.**
- `admin/index.html`, `login.html`: **EXCLUDE FROM PUBLIC WEBSITE.**
- Action: These 6 files must not be published to the public Cloudflare Pages artifact. Source files will be retained in a private developer branch.
