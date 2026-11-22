# CRAFTEGON CORPORATE SERVICES (CCS)
## Master Information Architecture, UX Wireframe Specification & Conversion Blueprint
**Document:** Information Architecture & UX Redesign Blueprint  
**Role:** Senior Website Architect, UX Strategist & CRO Consultant  
**Date:** 22 November 2026  
**Status:** Architecture Blueprint – Ready for Founder Review Prior to Implementation  
**Brand:** CRAFTEGON Corporate Services (CCS)  
**Parent Entity:** CRAFTEGON LLP  
**Primary Domain:** `https://ccs.craftegon.com/`  

---

## 1. Executive Summary & Architectural Philosophy

The objective of this Information Architecture (IA) and UX redesign is to transform the CRAFTEGON Corporate Services (CCS) web presence from a dense catalog of 58 disparate services into a **high-converting, structured business infrastructure platform**.

### Core UX & CRO Principles
1. **Customer-Centric Cognitive Routing:** Visitors do not browse by internal regulatory vertical codes (e.g., "V01", "V02"). They browse by immediate commercial intent: *"I want to start a company"*, *"I need to file my annual returns"*, *"I need a contract"*, or *"I am an NRI investing in Kerala"*. The IA routes users through **Exactly Six Core Service Categories** on the front-end, mapping cleanly to the 15 specialist practice verticals internally.
2. **The "Zero-Ambiguity" Pricing Standard:** Price opacity is the primary driver of bounce rates and abandoned checkouts in Indian legal-tech. Every service page and calculator enforces an unmasked, three-part statutory cost breakdown: **Professional Advisory Fee + Government Portal Fees + Kerala Stamp Duty**.
3. **Dual-Speed Conversion Paths:**
   - *Fast Lane (Self-Service & Diagnostic):* 60-Second Entity Selector Tool $\rightarrow$ Instant WhatsApp Handover with pre-filled case brief.
   - *Consideration Lane (Institutional & Enterprise):* Full statutory scope, documents checklist, process milestones $\rightarrow$ Structured intake form or 15-minute scheduled specialist consultation.
4. **Mobile Thumb-Zone First:** Over 68% of initial traffic from founders and NRIs originates on mobile devices. Navigation, form controls, and sticky call-to-actions are engineered specifically for one-handed thumb interaction without horizontal scroll or layout shift.

---

## 2. Complete Master Sitemap Architecture

```
https://ccs.craftegon.com/
│
├── / (Homepage – Cognitive Conversion Hub)
│
├── /about.html (Institutional Identity, Practicing CS/CA Governance & Kerala Operating Desk)
├── /contact.html (Multi-Channel Service Desk & Office Location)
│
├── /categories/ (The 6 Customer Intent Hubs)
│   ├── /categories/business-setup.html (Core 01: Business Setup & Structuring)
│   ├── /categories/corporate-compliance.html (Core 02: Corporate Compliance & Secretarial)
│   ├── /categories/tax-compliance.html (Core 03: Tax & Financial Compliance)
│   ├── /categories/licences-registrations.html (Core 04: Licences & Statutory Registrations)
│   ├── /categories/legal-contracts-ip.html (Core 05: Legal, Contracts & Intellectual Property)
│   └── /categories/workforce-operations.html (Core 06: Workforce & Business Operations)
│
├── /services/ (Standardized High-Conversion Service Pages)
│   ├── /services/pvt-ltd-registration.html (Private Limited Company SPICe+)
│   ├── /services/llp-registration.html (Limited Liability Partnership)
│   ├── /services/opc-registration.html (One Person Company)
│   ├── /services/proprietorship-registration.html (Sole Proprietorship & MSME)
│   ├── /services/section-8-registration.html (Section 8 Non-Profit Company)
│   ├── /services/roc-annual-compliance.html (Annual Secretarial Compliance Retainer)
│   ├── /services/form-aoc4.html (AOC-4 Financial Statements Filing)
│   ├── /services/form-mgt7.html (MGT-7/7A Annual Return Filing)
│   ├── /services/dir3-kyc.html (DIR-3 KYC Director Verification)
│   ├── /services/gst-registration.html (GSTIN Registration & Setup)
│   ├── /services/gst-monthly-filing.html (Monthly GSTR-1 & GSTR-3B Retainers)
│   ├── /services/trademark-registration.html (Trademark Application TM-A)
│   ├── /services/founder-agreement.html (Co-Founder & Shareholder Agreements)
│   ├── /services/dpiit-startup-india.html (DPIIT Recognition & Section 80-IAC)
│   └── ... [Total 57 verified service routes]
│
├── /solutions/ (Specialized Audience & Corridors)
│   ├── /solutions/gulf-nri-desk.html (Gulf-Kerala Cross-Border NRI Investment Desk)
│   ├── /solutions/startup-package.html (Kerala Startup Mission / Cyberpark Incubation Pack)
│   └── /solutions/msme-supply-chain.html (MSMED Act & Section 43B(h) Vendor Protection)
│
├── /tools/ (Interactive Utilities & Lead Magnets)
│   ├── /tools/entity-selector.html (60-Second Entity Diagnostic Tool)
│   ├── /tools/fee-calculator.html (RoC & Statutory Fee Estimator)
│   └── /search/ (Corporate Registry & DIN/CIN Search Lookup)
│
├── /legal/ (Statutory & Regulatory Transparency)
│   ├── /legal/terms.html (Terms & Conditions of Service)
│   ├── /legal/privacy.html (Privacy Policy – DPDP Act 2023 Compliant)
│   ├── /legal/refund.html (Transparent Refund & Cancellation Policy)
│   ├── /legal/disclaimer.html (Professional Disclaimer – Advocates Act, 1961 Boundary)
│   └── /legal/confidentiality.html (Corporate Confidentiality & Non-Disclosure Policy)
│
└── sitemap.xml & robots.txt
```

---

## 3. Main Navigation & Header Redesign

```
+----------------------------------------------------------------------------------------------------+
|                                    DESKTOP HEADER & MAIN NAVIGATION                                |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [CRAFTEGON CCS LOGO]   [Services v]   [Solutions v]   [Tools v]   [About]   [Contact]             |
|                                                                                                    |
|                                                  [WhatsApp Desk]   [Schedule Consultation (CTA)]   |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Desktop Mega-Menu Structure (`[Services v]`)
Clicking or hovering on **Services** opens a full-width, 3-column architectural mega-menu organized strictly around the **Six Core Service Categories**:

* **Column 1: Establishment & Governance**
  * **01. Business Setup & Structuring:** Pvt Ltd (SPICe+), LLP, OPC, Sole Proprietorship, Section 8, Trust/Society.
  * **02. Corporate Compliance:** Annual RoC Retainers, Form AOC-4, Form MGT-7/7A, DIR-3 KYC, Statutory Registers, Board Minutes.
* **Column 2: Taxation & Statutory Approvals**
  * **03. Tax & Financial Compliance:** GST Registration, Monthly GST Retainers, TDS Compliance, Corporate Tax (ITR-6/7).
  * **04. Licences & Registrations:** MSME Udyam, FSSAI Food Licensing, Import Export Code (IEC), Kerala Shops & Est.
* **Column 3: Protection, Scale & Operations**
  * **05. Legal, Contracts & IP:** Trademark (TM-A), Founder Agreements, Shareholder Agreements (SHA), Vendor MSAs.
  * **06. Workforce & Operations:** ESOP Pool Structuring, Employment Contracts, POSH Compliance, Secretarial Audit.
  * *Bottom Mega-Menu Banner:* *"Need custom structuring? Talk directly with our practicing Company Secretaries & Chartered Accountants $\rightarrow$"*

### 3.2 Mobile Drawer & Bottom Sticky Bar Navigation
* **Top Bar:** CRAFTEGON CCS Logo + Quick WhatsApp Icon + Accessible Hamburger Menu Button (min $48 \times 48\text{px}$ touch target).
* **Drawer Menu:** Clean vertical accordion with large tap targets ($52\text{px}$ height), high-contrast text, direct phone/WhatsApp links, and operating office address.
* **Mobile Sticky Bottom Action Bar:**
  A fixed bar anchored at the base of the viewport across all mobile screens:
  ```
  +------------------------------------------------------------------+
  |  [ Call / WhatsApp Desk (40%) ]  |  [ Get Started / Quote (60%) ]|
  +------------------------------------------------------------------+
  ```

---

## 4. Homepage Specification: 10-Section Cognitive Flow

Every section on the homepage guides the visitor down a structured psychological conversion funnel: **Awareness $\rightarrow$ Self-Diagnosis $\rightarrow$ Solution Matching $\rightarrow$ Fee Transparency $\rightarrow$ Credibility $\rightarrow$ Conversion**.

```
+----------------------------------------------------------------------------------------------------+
|                                    HOMEPAGE WIREFRAME BLUEPRINT                                    |
+----------------------------------------------------------------------------------------------------+
|  SECTION 01: HERO SHOWCASE                                                                         |
|  - Pill Badge: "REGULATED CORPORATE SERVICES & BUSINESS INFRASTRUCTURE"                            |
|  - H1: "Build Your Business on Solid Ground."                                                      |
|  - Sub-lead: Coordinated company setup, RoC compliance, tax filings, and legal contracts.          |
|  - Dual CTAs: [Find Your Business Structure (Primary)]  [Speak with a Specialist (Secondary)]     |
|  - Trust Badges: Supervised by Practicing CS & CA • Zero Hidden Fees • Advocates Act Compliant     |
|                                                                                                    |
|  SECTION 02: 60-SECOND INTERACTIVE ENTITY SELECTOR WIZARD                                          |
|  - Live Diagnostic: Step 1 (Funding Goal) + Step 2 (Team Size) + Step 3 (Governance)              |
|  - Output Card: Instant statutory recommendation with transparent pricing & direct WhatsApp CTA    |
|                                                                                                    |
|  SECTION 03: THE SIX CORE SERVICE CATEGORIES (PORTFOLIO HUBS)                                      |
|  - 6 Bento-Grid Cards representing customer intent hubs with top 3 services and pricing anchors    |
|                                                                                                    |
|  SECTION 04: STATUTORY FEE ESTIMATOR & PRICE TRANSPARENCY PROMISE                                  |
|  - Interactive Slider/Selector: Entity Type x State (Kerala default) x Capital Slab                |
|  - Explicit Breakdown: Professional Fee + Kerala Stamp Duty + MCA Government Filing Fee            |
|                                                                                                    |
|  SECTION 05: THE HYBRID ADVANTAGE (WHY CRAFTEGON CCS)                                              |
|  - 3-Way Comparison: National Aggregators vs. Local Traditional CAs vs. CRAFTEGON CCS              |
|  - Highlights: Digital Speed + Real Practicing CS/CA Accountability + Regional Malabar Context      |
|                                                                                                    |
|  SECTION 06: SPECIALIZED REGIONAL & AUDIENCE SOLUTIONS                                             |
|  - 3 High-Impact Cards: Gulf-Kerala NRI Desk | KSUM/Cyberpark Startup Pack | MSME Supply Chain      |
|                                                                                                    |
|  SECTION 07: FOUR-STAGE DELIVERY TIMELINE & LIFECYCLE ROADMAP                                      |
|  - Stage 1: Discovery & KYC -> Stage 2: Drafting -> Stage 3: Statutory Filing -> Stage 4: Retainer |
|                                                                                                    |
|  SECTION 08: FOUNDER & EXECUTIVE FAQS (ACCORDION WITH SCHEMA MARKUP)                               |
|  - 6 High-Friction Objections Resolved (Pricing, Turnaround, Legal Demarcation, MCA V3, Retainers)  |
|                                                                                                    |
|  SECTION 09: HIGH-INTENT LEAD CAPTURE & CONSULTATION INTAKE                                        |
|  - Minimalist 4-field progressive form: Name, Phone/WhatsApp, Email, Service Needed               |
|                                                                                                    |
|  SECTION 10: INSTITUTIONAL FOOTER & REGULATORY DISCLOSURES                                         |
|  - Bar Council Non-Contentious Disclaimer, ROC Ernakulam Jurisdiction, Alappuzha Office Address    |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. Validation of Exactly Six Core Service Categories

In strict alignment with the Master Business Architecture and customer intent mapping, the front-end presents **exactly six core categories**, each with a clear customer promise, validated scope, and primary internal vertical mapping:

```
+----------------------------------------------------------------------------------------------------+
|                                  THE SIX CORE SERVICE CATEGORIES                                   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  CORE 01: BUSINESS SETUP & STRUCTURING                                                             |
|  - Customer Promise: "Start your business with the right corporate foundation."                   |
|  - Scope: Private Limited (SPICe+), LLP, OPC, Sole Proprietorship, Section 8, Trust/Society, MSME. |
|  - Primary Internal Vertical: V01 (Business Formation & Structuring)                              |
|  - Conversion Target: First-time founders, startups, sole consultants, family businesses.          |
|                                                                                                    |
|  CORE 02: CORPORATE COMPLIANCE & SECRETARIAL                                                       |
|  - Customer Promise: "Keep your company compliant, active, and penalty-free."                     |
|  - Scope: Annual RoC Retainers, Form AOC-4, Form MGT-7/7A, DIR-3 KYC, Board Minutes, Registers.   |
|  - Primary Internal Vertical: V02 (Corporate Compliance & Secretarial)                             |
|  - Conversion Target: Active Private Limited companies and LLPs seeking recurring peace of mind.  |
|                                                                                                    |
|  CORE 03: TAX & FINANCIAL COMPLIANCE                                                               |
|  - Customer Promise: "Manage recurring tax registrations, GST returns, and corporate filings."    |
|  - Scope: GST Registration, Monthly GST Returns (GSTR-1/3B), TDS Compliance, Corporate Tax (ITR). |
|  - Primary Internal Vertical: V03 (Tax & Regulatory Registrations)                                 |
|  - Conversion Target: Trading businesses, service providers, corporate entities.                  |
|                                                                                                    |
|  CORE 04: LICENCES & STATUTORY REGISTRATIONS                                                       |
|  - Customer Promise: "Obtain the approvals and trade permits required for your industry."          |
|  - Scope: FSSAI Food Licensing, Import Export Code (IEC), Kerala Shops & Est., Trade Licences.     |
|  - Primary Internal Vertical: V04 (Licences & Statutory Registrations)                             |
|  - Conversion Target: Food businesses, exporters/importers, physical commercial establishments.    |
|                                                                                                    |
|  CORE 05: LEGAL, CONTRACTS & INTELLECTUAL PROPERTY                                                 |
|  - Customer Promise: "Protect your commercial interests, brand equity, and contracts."            |
|  - Scope: Trademark Registration (TM-A), Founder Agreements, Shareholder Agreements, MSAs, NDAs.  |
|  - Primary Internal Verticals: V05 (Contracts & Architecture) & V06 (Intellectual Property)        |
|  - Conversion Target: Startups with IP, multi-founder ventures, commercial vendors.                |
|                                                                                                    |
|  CORE 06: WORKFORCE & BUSINESS OPERATIONS                                                          |
|  - Customer Promise: "Build governance systems, protect equity, and manage employee compliance."   |
|  - Scope: ESOP Scheme Design, Employment Contracts, POSH Compliance, Secretarial Governance Audit. |
|  - Primary Internal Verticals: V07 (Employment & HR) & V11 (Governance, Audit & Risk)             |
|  - Conversion Target: Growth-stage companies hiring talent, institutionalizing governance.         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 6. Individual Service Page Blueprint (Standardized Template)

Every individual service page (e.g., `/services/pvt-ltd-registration.html`, `/services/roc-annual-compliance.html`) follows an 8-block high-conversion layout:

```
+----------------------------------------------------------------------------------------------------+
|                               INDIVIDUAL SERVICE PAGE WIREFRAME LAYOUT                             |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  BLOCK 01: BREADCRUMBS & HERO INTRO                                                                |
|  - Breadcrumbs: Home > Business Setup > Private Limited Company                                    |
|  - Statutory Tag: "Companies Act, 2013 • Form SPICe+ (INC-32) • CRC National Jurisdiction"        |
|  - H1 Headline: "Private Limited Company Registration in India & Kerala"                           |
|  - Lead Paragraph: Clear explanation of limited liability, VC readiness, and entity suitability.   |
|  - Hero Floating Card / Quick CTA: [Incorporate Now ->] [WhatsApp Desk]                            |
|                                                                                                    |
|  BLOCK 02: THE STATUTORY PRICE TRANSPARENCY CARD (HERO CONVERSION ANCHOR)                          |
|  - Itemized Box:                                                                                   |
|    * CCS Professional Advisory Fee: ₹7,999                                                         |
|    * Kerala State Stamp Duty (₹1L Capital): ₹3,025 (at actuals)                                    |
|    * MCA Government Filing Fee: ₹0 (Nil for capital up to ₹15 Lakhs)                               |
|    * Class 3 Digital Signature (2x Directors): ₹1,400 (at actuals)                                 |
|    * Total Estimated Out-of-Pocket: ₹12,424                                                        |
|  - Micro-Trust: "Zero hidden charges. Official MCA treasury challans handed over within 2 hours."   |
|                                                                                                    |
|  BLOCK 03: STATUTORY SCOPE & DELIVERABLES (WHAT'S INCLUDED)                                        |
|  - 2-Column Grid: 10 Included Deliverables (DSC, DIN, RUN Name, MoA/AoA, PAN/TAN, Bank Kit)        |
|  - Clear Exclusion Notes: Professional tax or external notary costs clearly stated.                |
|                                                                                                    |
|  BLOCK 04: STEP-BY-STEP DELIVERY TIMELINE (MILESTONE TRACKER)                                      |
|  - Day 1: Document KYC & Name Reservation (RUN)                                                    |
|  - Day 2–3: MoA/AoA Drafting & Class 3 DSC Generation                                              |
|  - Day 4: SPICe+ Part B & AGILE-PRO-S Submission                                                  |
|  - Day 5: CRC Approval & Certificate of Incorporation (CIN) Issuance                               |
|                                                                                                    |
|  BLOCK 05: REQUIRED DOCUMENTS CHECKLIST (INTERACTIVE TABS)                                         |
|  - Tab 1: Directors/Shareholders (PAN, Aadhaar/Passport, Bank Statement, Photo)                    |
|  - Tab 2: Registered Office Proof (Electricity Bill, Rent Agreement, Owner NOC)                   |
|  - Tab 3: NRI/Foreign Directors (Passport Apostille / Embassy Attestation Guide)                   |
|                                                                                                    |
|  BLOCK 06: POST-INCORPORATION ROADMAP & COMPLIANCE WARNINGS                                        |
|  - Form INC-20A (Commencement of Business within 180 days)                                         |
|  - First Board Meeting within 30 days                                                              |
|  - Statutory Auditor Appointment (Form ADT-1 within 30 days)                                       |
|  - Bridge to Annual Compliance Retainer                                                            |
|                                                                                                    |
|  BLOCK 07: FREQUENTLY ASKED QUESTIONS (ACCORDION WITH FAQ SCHEMA)                                  |
|  - 5–6 specific, highly relevant questions addressing common statutory objections                 |
|                                                                                                    |
|  BLOCK 08: STICKY BOTTOM CONVERSION BAR                                                            |
|  - Desktop: Subtle slide-in banner upon 40% scroll                                                 |
|  - Mobile: Fixed bottom bar: [Talk to CS / WhatsApp] [Start Incorporation]                         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 7. About & Credibility Architecture

The `/about.html` page must defeat the common objections: *"Who is behind this? Are they legitimate? Are they allowed to do this under Indian law?"*

### Key Content Blocks
1. **The CRAFTEGON Heritage:** Founded as an integrated corporate services division of **CRAFTEGON LLP**, built on the belief that compliance is foundational business infrastructure.
2. **Professional Governance & Supervisory Model:**
   - Explains that all statutory filings, drafting, and regulatory certifications are reviewed and executed by qualified, practicing members of the **Institute of Company Secretaries of India (ICSI)** and the **Institute of Chartered Accountants of India (ICAI)**.
3. **Statutory Boundary Pledge (Advocates Act, 1961):**
   - Formal disclosure that CCS provides corporate secretarial administration, regulatory filings, and commercial contract drafting. Contentious court and tribunal litigation (NCLT, High Court) is referred to independent advocates.
4. **Physical Operating Service Desk:**
   - Room No. 2, NS Building, Kaanjippuzha, Alappuzha, Kerala, PIN 690501.
   - Regional consultation network covering Kozhikode (Calicut), Malappuram, and Kochi.

---

## 8. Contact & Enquiry Journeys

```
+----------------------------------------------------------------------------------------------------+
|                                    FOUR CONVERSION ENTRY POINTS                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ PATHWAY A: INSTANT WHATSAPP DESK ]        ==>  Best for: Urgent questions, quick pricing        |
|  - One-click trigger with pre-filled text          Response SLA: < 15 minutes during business hours|
|                                                                                                    |
|  [ PATHWAY B: 15-MIN SPECIALIST CALL ]       ==>  Best for: Startups choosing between Pvt Ltd/LLP  |
|  - Cal.com / Calendly integration                  Direct booking with a Company Secretary / CA    |
|                                                                                                    |
|  [ PATHWAY C: STRUCTURED SERVICE BRIEF ]     ==>  Best for: Complex inquiries, multi-partner firms |
|  - Progressive 4-field web form                    Generates instant PDF checklist & ticket receipt|
|                                                                                                    |
|  [ PATHWAY D: GULF NRI DESK ]                ==>  Best for: Overseas investors in UAE/GCC          |
|  - WhatsApp / Google Meet video onboarding         Time-zone aligned scheduling                    |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 9. Lead Capture Forms & CRO Best Practices

### 9.1 Form Field Optimization (Eliminating Cognitive Friction)
Traditional legal inquiry forms demand 10+ fields (authorized capital, director names, DIN numbers) upfront, causing massive abandonment. CCS deploys **Progressive Profiling**:

* **Step 1 (The Micro-Commitment Form – 4 Fields Only):**
  1. Full Name
  2. WhatsApp / Mobile Number (with country code selector for Gulf NRIs)
  3. Work Email
  4. Service Required (Dropdown: Pvt Ltd, LLP, Annual Retainer, Trademark, Other)
* **Step 2 (The Instant Thank-You & Direct Handover):**
  Upon submitting Step 1, the user is immediately shown:
  - An instant button: *"Continue directly on WhatsApp with pre-filled case brief"*
  - An optional second step: *"Add details now to fast-track your draft (Company name, State)"*

### 9.2 Privacy & Spam Defense
* Explicit consent checkbox: *"I consent to receiving regulatory updates and service communications in compliance with the Digital Personal Data Protection (DPDP) Act, 2023."*
* Invisible honeypot field + Cloudflare Turnstile CAPTCHA (friction-free for humans, zero bot spam).

---

## 10. Legal & Regulatory Pages Architecture

All legal pages must be written in clear, legally enforceable terms conforming to Indian law:

1. **/legal/terms.html (Terms & Conditions):** Covers service engagement rules, payment schedules, client document accuracy warranties, MCA portal delay disclaimers, and dispute resolution under Alappuzha/Kerala jurisdiction.
2. **/legal/privacy.html (Privacy Policy – DPDP Act 2023 Compliant):** Explains KYC document storage, Aadhaar/PAN data handling, zero third-party commercial data sharing, and user rights to correction/erasure.
3. **/legal/refund.html (Refund & Cancellation Policy):** Explicit breakdown: professional fees are refundable if work has not commenced; government filing fees and stamp duty already paid to MCA/treasury are strictly non-refundable once challaned.
4. **/legal/disclaimer.html (Professional Practice Disclaimer):** Re-iterates compliance with the Advocates Act, 1961, Bar Council of India guidelines, and ICSI/ICAI professional codes.
5. **/legal/confidentiality.html (Corporate NDA & Confidentiality Policy):** Standard non-disclosure commitment protecting client trade secrets, cap tables, and commercial terms.

---

## 11. SEO & Content Architecture

### 11.1 Semantic URL Hierarchy
* Core Category Hubs: `/categories/business-setup.html`, `/categories/corporate-compliance.html`
* Core Services: `/services/pvt-ltd-registration.html`, `/services/llp-registration.html`
* Audience Solutions: `/solutions/gulf-nri-desk.html`, `/solutions/startup-package.html`
* Utilities: `/tools/entity-selector.html`, `/tools/fee-calculator.html`

### 11.2 Structured Data (Schema.org) Strategy
Every page must embed JSON-LD schema to maximize Google Rich Snippet real estate:
* **Organization Schema:** CRAFTEGON Corporate Services, logo, parent entity CRAFTEGON LLP, operating address in Alappuzha, official contact details.
* **Service Schema:** On all 57 service pages (Service name, serviceType, provider, areaServed: "India", hasOfferCatalog with starting prices).
* **FAQPage Schema:** On every page containing FAQs, enabling collapsible Q&A accordions directly in Google SERP results.
* **BreadcrumbList Schema:** Clean visual hierarchy navigation in search snippets.

---

## 12. Mobile UX & Thumb-Zone Specifications

```
+----------------------------------------------------------------------------------------------------+
|                                    MOBILE THUMB-ZONE ARCHITECTURE                                  |
+----------------------------------------------------------------------------------------------------+
|  [ TOP APP BAR (56px) ]                                                                            |
|  - Brand Logo + Quick WhatsApp Button + Hamburger Menu                                             |
|                                                                                                    |
|  [ HARD-TO-REACH UPPER ZONE (Inspection only) ]                                                    |
|  - Hero image / badges / decorative graphics                                                       |
|                                                                                                    |
|  [ NATURAL THUMB ZONE (Primary Interaction) ]                                                      |
|  - Interactive Entity Selector Chips (Min 48px height)                                             |
|  - Accordion FAQ Headers                                                                           |
|  - Form Input Fields                                                                               |
|                                                                                                    |
|  [ STICKY BOTTOM ACTION BAR (64px) - MAXIMUM REACHABILITY ]                                        |
|  +----------------------------------------------------------------------------------------------+  |
|  |  [ WhatsApp Desk (Icon + Text) (40%) ]  |  [ Incorporate Now / Call (60%) ]                 |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

* **Touch Target Standards:** Every interactive element (buttons, chip radio cards, dropdowns) has a minimum touch target of $48 \times 48\text{px}$ with at least $8\text{px}$ spacing between adjacent targets.
* **Zero Horizontal Overflow:** CSS enforced with `max-width: 100vw; overflow-x: clip; box-sizing: border-box;` across all table, card, and code elements.
* **Performance:** Hero images use native WebP with explicit dimensions (`width` and `height`) and `fetchpriority="high"`; all below-the-fold media uses `loading="lazy"`.

---

## 13. Implementation Roadmap & Readiness Checklist

Before executing code modifications, the team must confirm readiness against this blueprint:

| Component | Status | Next Engineering Step |
| :--- | :--- | :--- |
| **Information Architecture** | Spec Complete | Create `/categories/` hub pages and update header mega-menu |
| **Six Core Categories** | Validated | Group 57 service registry records into the 6 verified categories |
| **Entity Selector Wizard** | Operational | Maintain pure vanilla JS extracted controller with CSP compliance |
| **Pricing Architecture** | Validated | Ensure all 57 pages display the 3-part statutory split |
| **Lead Capture Forms** | Pending Backend | Deploy Cloudflare Pages Function at `functions/api/v1/enquiries.js` |
| **Mobile Sticky Bar** | Designed | Inject reusable responsive sticky action bar across all pages |

---

> [!NOTE]
> This wireframe and IA specification serves as the formal architectural reference. Once approved, engineering implementation will proceed stage-by-stage without breaking the 75/75 system test suites or CSP compliance.
