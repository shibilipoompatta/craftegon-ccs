# TASK-CCS-UX-009: Homepage Content Rationalisation Matrix

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Target Page:** `index.html`  
**Auditor:** Content Strategist & Information Architect  
**Date:** November 8, 2026

---

## 1. Master Section-by-Section Treatment Matrix

| # | Existing Section | Current Content Summary | Visitor Value | Repetition / Overlap | Proposed Treatment | Target Destination | Strategic Rationale | Risks & Dependencies |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Hero Banner** (`.home-hero`) | Headline: *"Your Business Infrastructure Partner"*, sub-pitch, search bar with 4 chips, primary CTA. | **High.** Immediate comprehension of brand and capability. | Search box partially duplicates the fixed navbar search. | **REWRITE** | Homepage (Retain at top) | Streamline hero. Remove redundant in-hero search input; rely on clear positioning statement and dual CTAs ("Explore Services" / "Contact Desk"). | Ensure navbar search remains highly visible on mobile. |
| **2** | **Problem & Solutions** (`#problem-solutions`) | 4 cards outlining MCA V3 bottlenecks, hidden costs, unqualified advice, and agency friction. | **Medium.** Builds empathy, but excessively verbose for an early section. | Duplicates trust themes found in Sections 6, 7, and 8. | **MERGE** | Section 4 & 6 (How CCS Works & Standards) | Consolidate the 4 problem points into a concise 2-sentence value proposition inside the "How CCS Works" narrative. | Ensure pain-point awareness is preserved without taking up 800 vertical pixels. |
| **3** | **Featured Services** (`#featured-services`) | 5 large service cards (Pvt Ltd, LLP, ROC, Trademark, MSME) with pricing, turnarounds, and deliverables. | **Medium-High.** Demonstrates pricing transparency, but too detailed. | Duplicates Section 4 (`#key-services`) and the full `/services/` directory. | **MERGE & MOVE** | Move card details to `/services/`; merge category overview into Section 3. | The homepage should direct visitors to the directory rather than rendering exhaustive service cards. Replace with 4 high-level category cards. | Must preserve canonical links to popular services (`pvt-ltd-registration.html`, `trademark-registration.html`). |
| **4** | **Key Services Catalog** (`#key-services`) | 4 large category pillars containing 20 individual service text links and directory button. | **Low-Medium.** Overwhelming wall of text on mobile screens. | Directly repeats Section 3. | **REMOVE FROM HOMEPAGE** | `/services/index.html` (Explore Services) | Move the 20-link list to the dedicated Explore Services directory, which is purpose-built for multi-category discovery. | Users seeking specific niches can use the universal search bar or Explore Services link. |
| **5** | **Self-Service Tools** (`#tools`) | 4 interactive diagnostic cards (Late Fee Calculator, Stamp Duty, Deadline Tracker, MSME). | **High Value.** High utility, but out of place on the brand front door. | Competes with primary conversion pathway. | **MOVE** | Dedicated Tools Hub (`/conversion/index.html` or `/tools/`) | Move full cards to a dedicated interactive tools section; reference via a single compact highlight banner on the homepage. | Ensure tool canonical URLs are preserved for SEO ranking. |
| **6** | **How It Works** (`#how-it-works`) | 4 sequential lifecycle steps: Scoping, Documentation, Statutory Filing, Delivery/Monitoring. | **Very High.** Crucial for building visitor confidence in service delivery. | Clean, concise, no direct duplication. | **REWRITE & KEEP** | Homepage Section 5 (Engagement Process) | Refine into the 5 owner-approved steps: Enquiry → Qualification → Scope → Professional Assignment → Execution → Delivery. | Avoid promising artificial turnaround guarantees. |
| **7** | **About CraftEgon** (`#about`) | 3 pillar cards: Multidisciplinary Team, Fixed-Fee Transparency, Technology-Assisted Delivery. | **Medium.** Good institutional overview, but duplicates Section 8. | Heavy overlap with Section 2 (Solutions) and Section 8 (Standards). | **MERGE** | Merge into Section 4 ("How CCS Works") & move long copy to `/about.html`. | Keep the homepage concise; full company story and founder vision belong on `/about.html`. | Ensure `/about.html` link is prominent. |
| **8** | **Standards & Boundaries** (`#standards`) | 3 compliance cards: Scope Clarity, Independent Legal Referral, No Government Affiliation. | **Critical.** Mandatory regulatory disclosures regarding advocacy referral and independence. | None. Essential legal boundary. | **REWRITE & KEEP** | Homepage Section 6 (Trust & Standards) | Preserve all regulatory disclaimers, but format as a sleek, reassuring trust seal block. | Must strictly preserve referral disclaimers for Advocates Act compliance. |
| **9** | **Curated Guidance** (`#knowledge`) | 4 regulatory guide cards (SPICe+, Transfer Pricing, Strike-Off, DPDP Act). | **Medium.** Useful content, but distracts from commercial intake. | Competes with commercial conversion. Belongs in Knowledge Centre. | **MOVE** | `/knowledge/index.html` (Knowledge Centre) | Move article cards to `/knowledge/`; replace on homepage with a simple 1-line resource link in the footer. | Preserve SEO internal links to knowledge articles via sitemap and directory. |
| **10**| **Contact & Form** (`#contact`) | Phone number (`+91 86069 18247`), WhatsApp, and a 5-field interactive intake form. | **High.** Primary conversion action. | Heavy form fields create visual friction at the base of the page. | **REWRITE** | Homepage Section 7 (Final Conversion) & `/contact.html` | Streamline homepage contact section to a high-impact direct invitation (Phone, WhatsApp, and a simple 2-field quick enquiry). Create standalone `/contact.html` for deep forms. | Maintain offline WhatsApp fallback mechanism. |

---

## 2. Proposed Homepage Section Architecture (Target: 8 Sections)

```
================================================================================
Section 1: Hero & Positioning
- Approved Brand: CraftEgon Corporate Services
- Tagline: Building Business Infrastructure
- Approved Positioning: "Your Business Infrastructure Partner. From business 
  formation to compliance, protection and growth — coordinated corporate 
  services supported by professional expertise and technology."
- Actions: [Explore Services →] [Contact Service Desk]

================================================================================
Section 2: Business Lifecycle Progression
- Visual 5-Stage Strip:
  1. Establish (Formation, Structuring, Registrations)
  2. Operate (Secretarial, Governance, Contracts)
  3. Comply (ROC Filings, GST/Tax, Statutory Registers)
  4. Protect (IP, Trademarks, Data Privacy, Employment)
  5. Grow (Restructuring, FDI/FEMA, Capital Expansion)

================================================================================
Section 3: Core Service Capability Groups
- 4 Curated Category Tiles (Each with 3-4 bullet services):
  • Corporate Formation & Structuring (Pvt Ltd, LLP, Section 8, Branch Offices)
  • Corporate Secretarial & Annual ROC (AOC-4, MGT-7, DIR-3 KYC, Board Minutes)
  • Tax & Statutory Registrations (GST, MSME, Professional Tax, PAN/TAN)
  • Intellectual Property & Commercial Contracts (Trademarks, Copyrights, NDAs)
- Primary Navigation Action: [View All 57 Services in Canonical Directory →]

================================================================================
Section 4: Operating Model: How CCS Works
- Explanation of coordinated corporate service model:
  • Dedicated Service Desk coordination
  • Qualified Chartered Accountants, Company Secretaries, and Legal Associates
  • Clear separation between secretarial coordination and external advocacy

================================================================================
Section 5: Transparent Engagement Process
- 5 Clear Milestones:
  1. Enquiry & Intake → 2. Scope & Fixed Quote → 3. Specialist Assignment → 
  4. Statutory Execution & Filing → 5. Delivery & Ongoing Monitoring

================================================================================
Section 6: Trust, Transparency & Professional Standards
- Three Core Assurances:
  • Transparent, itemised fee schedules (Zero hidden government fee markups)
  • Strict statutory compliance with MCA, GST, and Income Tax regulations
  • Independent legal advocacy referral disclaimer (Advocates Act adherence)

================================================================================
Section 7: Final Conversion & Direct Enquiry
- Approved Public Contact: +91 86069 18247 (Voice & WhatsApp)
- Direct Consultation Card: "Speak with our Service Desk or submit a requirement"
- Quick Enquiry Form (Name, Phone/Email, Business Need)

================================================================================
Section 8: Compact Institutional Footer
- Operational Service Desk: Alappuzha, Kerala
- Approved Contact Details (+91 86069 18247, services@craftegon.com)
- Essential Links (Services, Practice Verticals, Knowledge, About, Legal)
- Neutral statutory disclaimer & copyright notice
================================================================================
```
