# TASK-CCS-UX-010: Homepage Content Rationalisation Implementation

**Project:** CraftEgon Corporate Services (CCS)  
**Document:** `docs/ux-010-controlled-website-transformation/02-homepage-content-rationalisation-implementation.md`  
**Target File:** `index.html`  
**Supporting Stylesheet:** `assets/css/home-unique.css`  
**Execution Date:** November 8, 2026  

---

## 1. Executive Problem Statement & Objectives

In TASK-CCS-UX-009, the homepage (`index.html`) was identified as experiencing severe cognitive overload, excessive DOM weight, and consecutive redundant service listings. Specifically:
- **Redundant Service Stacking:** Section 3 (`#featured-services`, 5 cards) and Section 4 (`#key-services`, 20 cards) presented 44 service links immediately adjacent to each other.
- **Excessive Length:** The page contained 10 sprawling vertical sections, 83 card elements, 1,274 lines of HTML, and exceeded 9,800px in vertical scroll height on mobile viewports.
- **Unclear Narrative Arc:** The page lacked a coherent progression from high-level positioning down to engagement, forcing users to scroll past multiple diagnostic calculators and knowledge articles before reaching a contact form.

### The 8-Section Rationalisation Target:
Following the blueprint established in `docs/ux-009-website-intelligence-and-transformation-blueprint/04-homepage-transformation-blueprint.md`, `index.html` was restructured into exactly 8 focused sections:
1. **Hero & Strategic Positioning:** Core identity, value proposition, primary CTAs, and 3 trust badges.
2. **Business Lifecycle Progression:** 5-stage corporate journey (Establish, Operate, Comply, Protect, Grow).
3. **Priority Service Groups:** 4 high-demand clusters (Formation, Secretarial/ROC, Tax/Registrations, IP/Contracts) plus Directory Callout Banner.
4. **Coordinated Operating Model:** 4 structured steps showing how CCS coordinates accredited professionals and Service Desk operations.
5. **Transparent Engagement Process:** 5 predictable milestones from intake to statutory certificate delivery.
6. **Professional Standards & Regulatory Boundaries:** Transparent fees, independent advocacy referrals under the Advocates Act 1961, and private entity non-affiliation disclosure.
7. **Final Conversion Invitation:** Direct telephone, WhatsApp desk, email, and Operational Service Desk details with CTA to `/contact.html`.
8. **Compact Institutional Footer:** Clear 4-column layout with verified operational details, practice vertical links, core services, and statutory disclosures.

---

## 2. Detailed Section-by-Section Implementation

### Section 1: Hero & Strategic Positioning
- **H1:** "Your Business Infrastructure Partner."
- **Eyebrow Badge:** "Building Business Infrastructure • CraftEgon Corporate Services"
- **Subtitle:** "From business formation to compliance, protection and growth — coordinated corporate services supported by professional expertise and technology."
- **Action CTAs:** "Explore All 57 Services →" (linking to `/services/`) and "Contact Service Desk" (linking to `/contact.html`).
- **Trust Bar:** 3 clean trust pills:
  1. *Certified Secretarial & Tax Execution*
  2. *Transparent Itemised Government Fee Schedules*
  3. *Operational Service Desk in Alappuzha, Kerala*

### Section 2: Business Lifecycle Progression
- Replaces generic marketing cards with a linear, 5-stage corporate lifecycle framework:
  1. **Establish:** Entity formation, founder structuring, DIN/DSC, MSME (links to `/verticals/01-entity-formation.html`).
  2. **Operate:** Secretarial support, board governance, commercial contracts (links to `/verticals/05-contracts-legal.html`).
  3. **Comply:** Statutory annual ROC returns (AOC-4, MGT-7), DIR-3 KYC, GST (links to `/verticals/02-roc-compliance.html`).
  4. **Protect:** Trademarks, DPDP Act 2023 privacy compliance, IP defense (links to `/verticals/06-ipr-protection.html`).
  5. **Grow:** Retainers, restructuring, exit advisory (links to `/verticals/14-exit-insolvency.html`).

### Section 3: Priority Service Groups
- Groups the most critical commercial offerings into 4 digestible cards (each with turnaround badge, description, 4 verified direct service links, and vertical view link):
  - **Group 1: Business Formation & Structuring:** Private Limited, LLP, Section 8, Cross-Border Transfer.
  - **Group 2: Corporate Secretarial & ROC Filing:** Form AOC-4, Form MGT-7, DIR-3 KYC, Fast-Track Strike-Off Form STK-2.
  - **Group 3: Tax & Regulatory Registrations:** GST Annual Return (GSTR-9/9C), MSME Udyam, Form 3CEB Transfer Pricing, RBI FLA Return.
  - **Group 4: Intellectual Property & Contracts:** Trademark TM-A, IP Enforcement, Founder Agreements, DPDP Act Audit.
- **Directory Callout Banner:** Prominent card inviting users seeking any of the 57 services to open the complete directory.

### Section 4: Coordinated Operating Model (How CCS Works)
- Clearly explains the technology-assisted corporate secretarial model in 4 clear steps:
  1. *Requirement Scoping* (Entity parameter audit without upsells).
  2. *Accredited Coordination* (CS, CA, and legal associate execution).
  3. *Fixed-Fee Transparency* (Clear separation of professional and government dues).
  4. *Statutory Completion* (MCA V3, GST, and IP India filing confirmation).

### Section 5: Transparent Engagement Process
- Outlines the 5 operational milestones:
  - Step 1: Initial Intake
  - Step 2: Qualification & Parameter Check
  - Step 3: Fixed Scope & Quote
  - Step 4: Specialist Drafting & Filing
  - Step 5: Certificate & Challan Delivery

### Section 6: Professional Standards & Regulatory Boundaries
- Critical compliance guardrails integrated cleanly into the page layout:
  - **Transparent, Fixed Fees:** No hidden surcharges or disguised government fee markups.
  - **Independent Advocacy Referral:** Clear disclosure that courtroom litigation and tribunal appearances are referred to independent advocates under the Advocates Act, 1961.
  - **No Government Affiliation:** Private facilitator disclosure (independent of MCA, CBIC, or IP India).

### Section 7: Final Conversion Invitation
- High-visibility closing card summarizing the approved communication channels:
  - Direct Phone: `+91 86069 18247`
  - WhatsApp Consultation: `+91 86069 18247`
  - Official Email: `services@craftegon.com`
  - Operational Service Desk: Alappuzha, Kerala (PIN 690501)
  - Action buttons routing to `/contact.html` and WhatsApp.

### Section 8: Compact Institutional Footer
- Fully compliant with the universal navbar/footer schema:
  - Practice Verticals column including approved taxonomy (`Dispute Avoidance (Non-Litigation)`, `Data Privacy & Tech Law`, `IT & Digital Infrastructure`).
  - Core Services column linking directly to key services and `/services/`.
  - Governance column linking to `/about.html`, `/contact.html`, and legal policies.
  - Statutory governance notice and copyright line.

---

## 3. Code Quality & Syntax Verification

- Complete document verified via `node scripts/verify-links.js` with **0 broken links**.
- Complete document verified via `node scripts/audit-seo.js` with **100% canonical host and JSON-LD schema validity**.
- Complete document verified via `node scripts/test-phase-1-remediation.js` with **all taxonomy checks passing**.
