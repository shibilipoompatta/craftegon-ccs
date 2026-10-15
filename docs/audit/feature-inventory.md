# CraftEgon CCS — Comprehensive Feature & Capabilities Inventory

**Platform**: CraftEgon Corporate Compliance Services (CCS)  
**Parent Firm**: CraftEgon LLP  
**Repository**: `shibilipoompatta/craftegon-ccs`  
**Audit Date**: 2026-10-15  
**Audit Scope**: Complete interactive and technical feature set across 110 content pages and 4 JavaScript modules.

---

## 1. Global Navigation & Layout Architecture

### Component Summary
- **Desktop Mega-Menu** (`components/navbar.html`):
  - 3-column structured mega-menu cataloging all 15 practice areas without numerical noise or redundant "vertical" labels.
  - Dropdown menus for **Diagnostic Tools & AI** (18 tools), **Knowledge Base** (9 blueprints), and **Client Portal** (Compliance Calendar, Subscription tiers, Gateway).
  - Quick action header buttons: `Portal OS`, `AI Drafter`, `Calculate Retainer`.
- **Mobile Responsive Drawer** (`components/navbar.html` & `assets/js/navigation.js`):
  - Off-canvas overlay drawer with focus trap, backdrop blur, and accessible close button.
  - Accordion dropdowns for Practice Areas, Diagnostic Tools, and Knowledge Blueprints.
- **Dynamic Partial Injector** (`assets/js/navigation.js`):
  - Asynchronously loads `/components/navbar.html` and `/components/footer.html` into placeholder divs.
  - Features robust fallback HTML strings with identical brand links in case network fetching fails.
  - Automatically highlights the active route based on current URL path.

---

## 2. GenAI Customer Co-Pilot ("CraftEgon AI Assistant")

### File Locations
- Script: `assets/js/chat-widget.js` (15.88 KB, pure zero-dependency vanilla JS)
- Styling: `assets/css/chat-widget.css`

### Core Capabilities
- **Floating Gold Trigger**: Pulsing gold badge with online presence indicator.
- **RAG-Lite Statutory Knowledge Base**:
  - Grounded in Companies Act 2013 (SPICe+, AOC-4, MGT-7, DIR-3 KYC, DPT-3, MSME-1, STK-2).
  - Grounded in FEMA 1999 & RBI Master Directions (FLA Return, FC-GPR, FC-TRS, FIRMS).
  - Grounded in DPDP Act 2023 (Data Fiduciary obligations, DPO requirements, CERT-In 6-hour reporting).
  - Grounded in Corporate Tax (Form 3CEB Transfer Pricing, GSTR-9, Section 8 audits).
  - Grounded in Dispute Litigation (NCLT Section 241/242, IBC Section 7/9/10, DIN restoration).
  - Grounded in SaaS Portal & Subscription Tiers (Starter ₹1,499, Growth ₹4,999, Enterprise ₹14,999).
- **Interactive Quick-Action Pills**:
  - `⚡ Compliance Calendar` &bull; `💎 Subscription Plans` &bull; `⚡ Incorporate Pvt Ltd` &bull; `📅 MCA Due Dates` &bull; `💰 RoC Late Fees` &bull; `🌐 RBI FLA Return` &bull; `🔒 DPDP Act Audit` &bull; `📄 AI Doc Drafter`.
- **Contextual Routing**: Every query response is accompanied by deep-links pointing directly to relevant conversion engines, service landing pages, or portal calendars.

---

## 3. Statutory Calculators & Computational Engines

### RoC Late Fee & Retainer Calculator
- **File**: `conversion/calculator.html`
- **Logic Module**: `assets/js/calculator.js`
- **Computational Rules**:
  - **Form AOC-4 / MGT-7 Delay**: Enforces Section 137 / 92 late filing rules under MCA Fee Rules 2014 at a flat ₹100 per day per form with zero cap.
  - **Normal Filings (Slab Multipliers)**: Calculates 2x (up to 30 days), 4x (30-60 days), 6x (60-90 days), 10x (90-180 days), and 12x/18x (>180 days) based on entity nominal share capital tiers.
  - **DIR-3 KYC Statutory Penalty**: Adds flat ₹5,000 late fee for director KYC post-September 30.
  - **Indicative Disclaimer**: Prominently warns users that calculated numbers are statutory estimates and actual RoC challan fees depend on official MCA portal generation.

---

## 4. AI Legal Document Generation Engine

### Module Overview
- **File**: `conversion/ai-document-generator.html`
- **Supported Document Types**:
  - **Board Resolutions**: MCA V3 statutory format with director authorization and common seal clauses.
  - **Non-Disclosure Agreements (NDAs)**: Unilateral and mutual confidentiality terms aligned with the Indian Contract Act 1872 and DPDP Act 2023.
  - **Co-Founder Agreements**: Equity vesting schedules, reverse dilution, IP assignment, and dispute arbitration.
  - **Master Service Agreements (MSAs)**: Enterprise commercial terms, SLA warranties, indemnity caps, and Indian jurisdiction.
- **Deep-Link URL Preloading**: Accepts query parameters (`?doc_type=board_resolution&company=...&cin=...`) to dynamically populate entity data directly from the Compliance Calendar.

---

## 5. Autonomous Compliance Calendar OS

### Module Overview
- **File**: `portal/dashboard.html`
- **Styles**: `assets/css/portal.css`
- **Features**:
  - **CIN / LLPIN Lookup Simulation**: Validates 21-digit CINs or LLPINs and dynamically renders entity metadata (Authorized Capital, Incorporation Date, RoC Jurisdiction, Active Status).
  - **Live Countdown Clocks**: Real-time tick counters (Days, Hours, Minutes, Seconds) for major statutory filing deadlines:
    - *Form AOC-4 (Financial Statements)* — Due October 30 (Status: Warning / Amber).
    - *Form MGT-7 (Annual Return)* — Due November 29 (Status: Secure / Green).
    - *DIR-3 KYC (Director Verification)* — Due September 30 (Status: Overdue / Critical).
    - *RBI FLA Annual Return* — Due July 15 (Status: Upcoming / Blue).
    - *Form 3CEB (Transfer Pricing)* — Due October 31.
    - *GSTR-9 / 9C (GST Annual Return)* — Due December 31.
  - **Multi-Channel Alert Toggles**: Client-configurable switches for WhatsApp, Email, and SMS reminders (7 days, 3 days, 24 hours prior) with interactive toast notifications.
  - **1-Click AI Drafter Shortcut**: Direct button link passing entity name and CIN to the document drafter.

---

## 6. SaaS Subscription Pricing & Retainer Checkout

### Module Overview
- **File**: `portal/subscription.html`
- **Styles**: `assets/css/portal.css`
- **Subscription Tiers**:
  1. **Starter Tier (LLPs & Micro-Enterprises)**: ₹1,499/month (or ₹14,990/year). Includes calendar tracking, alerts, 10 AI drafting credits, and standard email desk.
  2. **Growth Tier (Pvt Ltd Startups)**: ₹4,999/month (or ₹49,990/year). Includes full MCA tracking, automated AOC-4/MGT-7 data staging, 50 AI drafting credits, and priority CS review.
  3. **Enterprise Tier (VC-Backed & Cross-Border)**: ₹14,999/month (or ₹1,49,990/year). Includes dedicated secretarial desk, secretarial audit (Form MR-3), custom cap table management, and FEMA/RBI advisory.
- **Interactive Billing Toggle**: Smooth Monthly vs. Annual switch featuring a "Save 17% &bull; 2 Months Free" discount badge.
- **Checkout Modal**: Computes 18% GST breakdown, captures company details, provides payment method tabs (UPI, Card, NetBanking), and saves client state to `localStorage`.

---

## 7. Conversion Intake Forms & Validation Architecture

### Form Inventory (21 Active Forms)
- `conversion/ai-document-generator.html` — Document parameter inputs
- `conversion/calculator.html` — Computational delay form
- `conversion/contract-intake.html` — Contract review intake form
- `conversion/cross-border-retainer.html` — Cross-border retainer inquiry
- `conversion/csr-audit-form.html` — CSR Section 135 audit intake
- `conversion/dispute-consultation.html` — NCLT litigation consultation booking
- `conversion/dpdp-audit-request.html` — DPDP Act compliance audit booking
- `conversion/fema-consultation.html` — FEMA FDI/ODI consultation intake
- `conversion/hr-audit.html` — Labour codes & POSH compliance intake
- `conversion/license-qualification.html` — Statutory license qualifier
- `conversion/ma-advisory-enquiry.html` — M&A and demerger advisory booking
- `conversion/post-incorporation-checkout.html` — Post-incorporation compliance package
- `conversion/retainer-desk.html` — Annual RoC retainer intake
- `conversion/secretarial-audit-scope.html` — Form MR-3 secretarial audit intake
- `conversion/strike-off-checker.html` — STK-2 fast-track closure qualifier
- `conversion/tax-intake.html` — Corporate tax & transfer pricing intake
- `conversion/trademark-search.html` — IP India trademark search request
- `conversion/venture-deal-booking.html` — Fundraising & cap table intake
- `portal/dashboard.html` — CIN/LLPIN lookup form
- `portal/subscription.html` — Plan activation modal form
- `services/pvt-ltd-registration.html` — Formation intake form

### Client-Side Engine (`assets/js/forms.js`)
- Validates 10-digit Indian mobile numbers and valid email patterns.
- Multi-step wizard support for complex intake flows.
- Strict prevention of fake submissions; informs user clearly when no submission endpoint is configured.

---

## 8. 15 Practice Area Verticals & 57 Service Landers

- **V01: Entity Formation & Structuring** (Pvt Ltd, LLP, OPC, Section 8, Trust, Society, Partnership)
- **V02: RoC Annual Compliance** (AOC-4, MGT-7, DIR-3 KYC, DPT-3, MSME-1, MBP-1, DIR-8)
- **V03: Corporate Tax & GST Compliance** (Transfer Pricing 3CEB, GST Annual, Form 10B, ITR-7)
- **V04: Statutory & Sectoral Licenses** (MSME Udyam, DPIIT Startup India, RoF Maintenance)
- **V05: Contracts & Commercial Drafting** (NDAs, MSAs, Founder Agreements, SaaS Terms)
- **V06: IPR & Trademark Prosecution** (Trademark Registration, Search, Cease & Desist, Software Copyright)
- **V07: Labour Codes & Workforce HR** (Labour Code Handbooks, PF & ESIC, POSH Compliance)
- **V08: Fundraising & Cap Table** (VC Term Sheets, SHA, Due Diligence, Rights Issues)
- **V09: M&A, Demergers & Slump Sales** (Fast-Track Mergers, Slump Sales, Asset Purchase, NCLT Petitions)
- **V10: NCLT Dispute Resolution** (Section 241/242 Oppression/Mismanagement, IBC CIRP Defense, DIN Restoration)
- **V11: Secretarial Audit & Form MR-3** (Form MR-3 Audits, Board Minutes, Governance Risk Audits)
- **V12: ESG Advisory & CSR Mandate** (CSR-2 Filings, BRSR Reporting, Net-Zero Structuring)
- **V13: Cross-Border FDI & FEMA** (RBI FLA Return, FC-GPR, FC-TRS, Form FC-3/FC-4 Foreign Branches)
- **V14: Corporate Exit & Fast-Track STK-2** (STK-2 Private Limited Closure, LLP Form 24 Strike-Off, Dormant Status MSC-1)
- **V15: DPDP Act 2023 & IT Governance** (Data Fiduciary Audits, CERT-In Reporting, Cross-Border Data Transfer)

---

## 9. Legal Policies & Institutional Governance

- `legal/terms.html`: Terms of Service governing corporate secretarial technology and legal consultancy.
- `legal/privacy.html`: Comprehensive privacy policy adhering to DPDP Act 2023 and GDPR guidelines.
- `legal/disclaimer.html`: Professional legal disclaimer clarifying that court appearances and statutory certifications are executed by registered practicing professionals (CS, CA, Advocates).
- `legal/refund.html`: Commercial refund and cancellation terms.
- `legal/confidentiality.html`: Client non-disclosure and data safeguarding protocol.

---

## 10. Edge Hosting & Cloudflare Deployment

- `_redirects`: Edge rewrites for clean URL routing on Cloudflare Pages.
- `robots.txt`: Search crawler directives allowing all crawlers and pointing to `sitemap.xml`.
- `sitemap.xml`: Complete XML sitemap index with 110 validated content URLs.
