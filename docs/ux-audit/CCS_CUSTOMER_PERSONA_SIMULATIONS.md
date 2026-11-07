# CRAFTEGON CORPORATE SERVICES (CCS)
## Customer Persona Simulations & Behavioral Journey Analysis

**Document Identifier:** `DOC-CCS-UX-SIM-001`  
**Classification:** Qualitative Customer Experience Simulation  
**Date:** 2026-11-07  
**Methodology:** Simulated Heuristic Journey Walkthroughs across 5 Target Customer Profiles  
**Notice:** These findings are structured heuristic simulations based on actual site navigation and code behavior, not empirical laboratory user testing data.  

---

## 1. Persona 1 — First-Time Entrepreneur (Priya)

### Profile:
- **Background:** First-time founder in Bangalore starting an e-commerce brand.
- **Core Need:** Wants to incorporate a legal business entity, register a brand name, and understand total costs.
- **Questions in Mind:** *"Should I register a Pvt Ltd or LLP? What will it cost in total? How long will it take? What documents do I need to send?"*

### Simulated Journey:
1. **Entry Page:** Homepage (`/index.html`) via Google search for "company registration bangalore".
2. **First 5 Seconds:** Notices the headline *"Your Business Infrastructure Partner."* Reads the lifecycle badges (`1. Establish`, `2. Operate`...). Understands immediately that the site does business formation.
3. **First 15 Seconds:** Clicks the prominent *"Incorporate Private Limited"* card in the practice areas grid.
4. **Landing on Service Page:** Lands on `/services/pvt-ltd-registration.html`.
5. **Questions Encountered:** Sees technical jargon: *"SPICe+ INC-32, Rule 38, e-MOA INC-33, AGILE-PRO-S"*. Wonders if she needs to know what these acronyms mean.
6. **Trust-Building Moments:** Sees the comprehensive list of deliverables: Certificate of Incorporation, PAN, TAN, EPFO/ESIC, and bank account setup. Appreciates the thoroughness.
7. **Friction Points:**
   - Looks for the price: Finds a pricing card stating `PENDING_COMMERCIAL_APPROVAL`. Feels disappointed that no exact price is shown.
   - Looks for a button to start: Sees *"Calculate Exact State Stamp Duty"* pointing to `/conversion/calculator.html`.
8. **Navigation Path:** Clicks to `/conversion/calculator.html`. Selects "Karnataka", enters ₹1,00,000 capital. Sees stamp duty calculation of ₹1,000.
9. **CTA Interaction:** The calculator shows the calculation, but there is no prominent "Hire CraftEgon to Incorporate My Company" button. Instead, she finds a static contact form that warns her that online submission is inactive and opens WhatsApp.
10. **Likely Decision:** **Hesitant Conversion via WhatsApp or Site Abandonment**. She messages on WhatsApp if she is highly motivated, but is likely to open a competing tab (e.g. IndiaFilings or Vakilsearch) that displays an instant "Pay ₹6,999" checkout button.

---

## 2. Persona 2 — Tech Startup Founder (Rohan)

### Profile:
- **Background:** Technical founder in Hyderabad building a B2B SaaS platform with a co-founder; preparing to raise angel funding.
- **Core Need:** Private Limited incorporation, Shareholder Agreement (SHA), DPIIT Startup India recognition for tax exemptions, and Trademark TM-A for their software brand.
- **Questions in Mind:** *"Does CCS understand tech startups? Can they draft a proper founder vesting agreement? Can they handle DPIIT? Can they coordinate CA sign-offs?"*

### Simulated Journey:
1. **Entry Page:** Services Directory (`/services.html`).
2. **Navigation Path:** Filters by "Startup" in the quick needs bar.
3. **Pages Visited:**
   - `/services/pvt-ltd-registration.html` (SPICe+ Incorporation)
   - `/services/founder-shareholder-agreements.html` (SHA & Founder Pacts)
   - `/services/dpiit-startup-india.html` (DPIIT Startup India)
   - `/services/trademark-registration.html` (Trademark TM-A)
4. **Trust-Building Moments:**
   - Highly impressed that CCS has dedicated services for SHA, tech transfer, and trademarking. Feels that CCS is far more sophisticated than commodity incorporation mills.
   - Reads the statutory disclaimer citing the Advocates Act 1961 and CA/CS certifications; appreciates the institutional legal honesty.
5. **Friction Points & Confusion:**
   - On `/services/dpiit-startup-india.html`, reads that DPIIT provides *"Section 56(2)(viib) Angel Tax exemption"*. Rohan knows from financial news that Angel Tax was abolished in the 2024 Union Budget. This outdated claim introduces a moment of doubt regarding how up-to-date CCS’s legal team is.
   - On `/services/founder-shareholder-agreements.html`, finds that it is marked `SPECIALIST` with no clear pricing or timeline.
6. **CTA Interaction:** Clicks "Request Scoping Consultation". The form opens a WhatsApp prompt.
7. **Likely Decision:** **Positive Consultation**. Rohan appreciates the depth of documentation and uses the WhatsApp link to initiate a direct founder conversation regarding a bundled package.

---

## 3. Persona 3 — Existing Small-Business Owner (Sunil)

### Profile:
- **Background:** Managing Partner of a traditional manufacturing firm in Pune.
- **Core Need:** Overdue GST annual return (GSTR-9) and MSME Udyam registration to ensure compliance with Section 43B(h) payment rules.
- **Questions in Mind:** *"Can CCS help me register for MSME immediately so my corporate buyers don't delay payments? How much do they charge for GST annual returns?"*

### Simulated Journey:
1. **Entry Page:** Enters via `/conversion/calculator.html` or direct search for "MSME 43B(h) payment rules".
2. **Pages Visited:**
   - `/services/msme-udyam.html`
   - `/services/gst-annual.html`
3. **Trust-Building Moments:**
   - On `/services/msme-udyam.html`, reads the clear explanation of Section 43B(h) 15/45-day payment rules. Immediately feels CCS understands SME commercial pressures.
4. **Friction Points & Confusion:**
   - Finds that `/services/gst-annual.html` is heavily focused on GSTR-9C reconciliation for turnover > ₹5 Crore. Sunil's turnover is ₹1.5 Crore; he is confused whether he even needs this service or if CCS handles routine GST filings.
   - The pricing table displays `PENDING_COMMERCIAL_APPROVAL`. He wants to know if it costs ₹2,000 or ₹20,000.
5. **CTA Interaction:** Clicks the inquiry button, sees the static fallback modal, and closes the tab because he does not want to use his personal WhatsApp on a desktop computer at his factory office.
6. **Likely Decision:** **Abandonment due to friction in desktop lead capture and absent pricing**.

---

## 4. Persona 4 — Corporate Director (Ananya)

### Profile:
- **Background:** Managing Director of a 4-year-old Private Limited company in Mumbai with ₹15 Crore turnover.
- **Core Need:** Routine annual RoC filings (Form AOC-4, MGT-7), DIR-3 KYC director verifications, and board secretarial retainer.
- **Questions in Mind:** *"Who will sign our annual return? Do they have a peer-reviewed Company Secretary? Can they track our statutory compliance calendar?"*

### Simulated Journey:
1. **Entry Page:** Homepage (`/index.html`) $\rightarrow$ Clicks "RoC Compliance" in navigation.
2. **Pages Visited:**
   - `/services/roc-annual-compliance.html`
   - `/services/form-aoc4.html`
   - `/services/form-mgt7.html`
   - `/portal/dashboard.html`
3. **Trust-Building Moments:**
   - Sees specific statutory knowledge regarding Form AOC-4 XBRL requirements and MGT-7 certification thresholds.
   - Notices that statutory disclaimers clearly state certifications are issued under independent CS UDINs under Section 204. This provides strong governance reassurance.
4. **Friction Points:**
   - Visits `/portal/dashboard.html` expecting to log into a client tracking portal. Discovers it is a static demonstration with mock cards.
   - Finds no clear SLA guarantee on RoC filing turnaround times.
5. **Likely Decision:** **Conditionally Qualified Lead**. Ananya sends an email inquiry asking for a formal retainer proposal, provided CCS can verify its partner CS credentials.

---

## 5. Persona 5 — Skeptical First-Time Visitor (Vikram)

### Profile:
- **Background:** Experienced corporate executive and angel investor comparing corporate service providers.
- **Core Need:** Vetting CraftEgon to see if it is a legitimate corporate institution or a speculative one-person website.
- **Questions in Mind:** *"Who owns CraftEgon? Where is their physical office? Who are the Chartered Accountants and Company Secretaries? Are their reviews real?"*

### Simulated Journey:
1. **Entry Page:** Homepage (`/index.html`).
2. **Pages Visited:**
   - `/index.html` (Hero, practice areas, footer)
   - `/legal/disclaimer.html`
   - `/components/footer.html`
   - `/services.html`
3. **Points of Extreme Skepticism:**
   - **Missing "About Us" / Leadership Page:** Searches the navbar for "About Us", "Team", or "Our Leadership". Finds no dedicated page profiling the founders, leadership team, or qualified professionals.
   - **Absence of Physical Address:** Finds no registered corporate office address or MCA LLPIN in the footer.
   - **Absence of Client Testimonials or Case Studies:** Finds no named client reviews, startup case studies, or institutional references.
4. **Trust-Building Moments:**
   - The statutory precision of the legal disclaimers and the technical quality of the search index indicate high technical competence.
5. **Likely Decision:** **Abandonment due to lack of social proof and organizational transparency**. Vikram decides to wait until CraftEgon publishes verified founder profiles, office details, and client references.

---

## 6. Summary of Persona Decision Funnel

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSONA SIMULATION OUTCOME FUNNEL                    │
├───────────────────────┬────────────────────────┬───────────────────────┤
│ Persona Profile       │ Primary Motivation     │ Simulated Outcome     │
├───────────────────────┼────────────────────────┼───────────────────────┤
│ 1. First-Time Founder │ Low cost, fast inc     │ 50% WhatsApp / 50% Out│
│ 2. Tech Startup Lead  │ Broad legaltech scope  │ High-Intent Lead      │
│ 3. SME Factory Owner  │ Quick compliance fix   │ Abandon (Desktop Drop)│
│ 4. Corporate Director │ Institutional secretar.│ Warm Retainer Inquiry │
│ 5. Skeptical Investor │ Institutional proof    │ Abandon (No Team Page)│
└───────────────────────┴────────────────────────┴───────────────────────┘
```
