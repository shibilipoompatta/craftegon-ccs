# CRAFTEGON CORPORATE SERVICES (CCS)
## End-to-End Customer Journey & Conversion Funnel Audit

**Document Identifier:** `DOC-CCS-UX-JOURNEY-001`  
**Classification:** Customer Experience & Conversion Architecture  
**Date:** 2026-11-07  
**Scope:** Evaluation of customer flows from initial discovery to final enquiry across all 20 conversion pathways.  

---

## 1. Executive Funnel Architecture

The customer journey on CraftEgon Corporate Services is divided into five critical milestones:

```
[1. Discovery] ──► [2. Self-Qualification] ──► [3. Price Discovery] ──► [4. Inquiry Submission] ──► [5. Operational Follow-up]
     │                       │                        │                          │                             │
  Organic /               Service Page /           Calculator /              Form Fallback /                WhatsApp Desk /
  Directory                Directory Filter        Pricing Table             WhatsApp Redirect              Email Outreach
```

### Funnel Performance Diagnosis:
- **Top of Funnel (Stages 1 & 2):** **STRONG (Rating: 8.5/10)**. Search indexing, practice verticals, universal service directory, and filter facets function with impressive speed and precision.
- **Middle of Funnel (Stage 3):** **WEAK (Rating: 4.5/10)**. Customers searching for exact pricing encounter unverified tables (`PENDING_COMMERCIAL_APPROVAL`) or are redirected into the Stamp Duty Calculator, adding an extra step without direct checkout.
- **Bottom of Funnel (Stage 4):** **VULNERABLE (Rating: 5.0/10)**. Static frontend form fallback interrupts desktop visitors by alerting them that online transmission is inactive, losing users who do not use WhatsApp Web on desktop computers.

---

## 2. Detailed Audit of Customer Flow Pathways

### Path A: The Direct Incorporation Journey
- **Flow:** `Homepage` $\rightarrow$ `services/pvt-ltd-registration.html` $\rightarrow$ `conversion/calculator.html` $\rightarrow$ `Static Fallback Alert` $\rightarrow$ `WhatsApp`
- **Friction Points:**
  1. No inline lead capture form on `services/pvt-ltd-registration.html`.
  2. The visitor must click into the calculator to see costs.
  3. After calculating, there is no direct "Book Incorporation" button that pre-fills the calculated stamp duty into an order form.
  4. Visitor must manually recount details on WhatsApp.
- **Conversion Drop-off Estimate:** ~45% drop-off between service page and WhatsApp initiation.

### Path B: The Compliance Directory Discovery Journey
- **Flow:** `Homepage` $\rightarrow$ `services.html` (Universal Directory) $\rightarrow$ `Directory Search Filter` $\rightarrow$ `Target Service Card` $\rightarrow$ `Service Detail Page`
- **Friction Points:**
  1. The directory displays all 57 canonical services without visual hierarchy between high-demand Core Launch items and niche specialist matters.
  2. A founder looking for "Annual Compliance" sees 18 individual secretarial forms (AOC-4, MGT-7, BEN-2, DPT-3, MSME-1, PAS-6, etc.), inducing analysis paralysis.
- **Conversion Drop-off Estimate:** ~30% drop-off due to choice overload.

### Path C: The Knowledge-to-Conversion Journey
- **Flow:** `Google Search` $\rightarrow$ `knowledge/spice-plus-mca-v3-blueprint.html` $\rightarrow$ `Article Reading` $\rightarrow$ `Footer Link` $\rightarrow$ `services.html`
- **Friction Points:**
  1. The technical article has no sticky header CTA or floating "Let Us Handle Your SPICe+ Filing" widget.
  2. When the user finishes reading a 3,000-word article, the bottom of the page simply provides links to other knowledge articles, failing to convert high-intent educational traffic.
- **Conversion Drop-off Estimate:** ~70% drop-off (readers leave after consuming the free information).

---

## 3. Form Behaviour & Submission Friction Audit

### Analysis of the 55 Frontend Forms:
Across the 20 conversion pages and service templates, forms utilize `assets/js/forms.js` for client-side event handling:

1. **Client-Side Validation Quality:**
   - Phone numbers, email formats, and mandatory text inputs validate cleanly.
   - Field errors display in red text below inputs without disrupting layout.
2. **The Fallback Modal Customer Experience:**
   - In the static production environment, submitting any form triggers the fallback modal:
     > *"Notice: Online form transmission to a backend server is not active in this static environment. Details entered in this form are not stored or transmitted to CraftEgon CCS."*
   - **Customer Psychology:** While legally honest and transparent, this message can startle a corporate client, making them wonder if the platform is unfinished or broken.
3. **The WhatsApp Transition:**
   - Clicking "Continue via WhatsApp" opens WhatsApp with the message text pre-populated.
   - For mobile users, this is relatively seamless.
   - For desktop enterprise users (e.g. corporate directors at work who do not have WhatsApp Web linked on company laptops), this is a fatal point of abandonment.

---

## 4. Priority Conversion Recommendations (The 4-Step Funnel Fix)

1. **Embed Direct 3-Field Lead Capture on Every Service Page:**
   - Replace indirect redirects with a prominent right-rail contact box: `[Name] [Phone / WhatsApp] [City/State] [Button: Request Instant Scoping Quote]`.
2. **Implement Serverless Webhook Ingestion:**
   - Deploy a lightweight serverless endpoint (Cloudflare Worker) to ingest form submissions directly to email/CRM, presenting an instant success confirmation: *"Thank you. Our corporate secretarial desk has received your request and will contact you within 2 business hours."*
   - Keep the WhatsApp button as an **optional instant fast-track**, not a mandatory hurdle.
3. **Contextual CTAs in Knowledge Guides:**
   - Add a sticky bottom-bar or floating side card on all 12 knowledge guides: *"Need expert help with this filing? Speak to our corporate advisory desk."*
4. **Interactive Stamp Duty Calculator Lead Gate:**
   - On `/conversion/calculator.html`, add a button: *"Email Me This Detailed Cost Breakdown & Document Checklist"*, capturing the lead at the moment of highest intent.
