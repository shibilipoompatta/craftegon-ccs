# CRAFTEGON CORPORATE SERVICES (CCS)
## The Goldfish Review: Independent, Stateless First-Time Customer Audit

**Document Identifier:** `DOC-CCS-UX-GOLDFISH-001`  
**Classification:** Stateless Customer Heuristic & Visceral Reaction Audit  
**Date:** 2026-11-07  
**Review Perspective:** First-Time Prospect With Zero Institutional Knowledge or Developer Context  
**Methodology Notice:** This review operates with zero assumed context. It evaluates only what is physically rendered on screen, without rationalizing technical constraints or architectural intent.  

---

## 1. Executive Goldfish Verdict

> *"You have built an enormous, impressive encyclopedia of Indian corporate law, but it often forgets that I am a busy person trying to buy a service. I do not want to study the Companies Act; I want to know how much you charge, how fast you will finish my filing, who is doing the work, and how to pay you."*

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GOLDFISH TEN-QUESTION BENCHMARK                      │
├─────────────────────────────────────────┬──────────────────────────────┤
│ Evaluated Dimension                     │ First-Time Customer Verdict  │
├─────────────────────────────────────────┼──────────────────────────────┤
│ 1. Is the page purpose obvious?         │ PARTIAL (Too much text)      │
│ 2. What is the most confusing element?  │ "Pending Commercial Approval"│
│ 3. What looks unprofessional?           │ Static form fallback modal   │
│ 4. What information is missing?         │ Actual prices & team faces   │
│ 5. What feels unnecessary?              │ 18 individual secretarial pg │
│ 6. Would I trust this business?         │ CONDITIONAL (Looks credible, │
│                                         │ but feels faceless)          │
│ 7. Would I take the intended action?    │ HESITANT (Afraid of WhatsApp)│
│ 8. What would make me leave?            │ Having to calculate my own   │
│                                         │ stamp duty without a price   │
└─────────────────────────────────────────┴──────────────────────────────┘
```

---

## 2. Key Page-by-Page Goldfish Inspections

### 1. The Homepage (`/index.html`)
- **What it communicates:** You handle company formation, compliance, and corporate legal services in India.
- **Is the purpose obvious?** Yes, the new title *"Your Business Infrastructure Partner"* is clear.
- **What is confusing?** There are 15 practice areas shown below the hero. As a founder, I don't know which one applies to me. Do I click "Business Formation" or "Corporate Compliance"?
- **What feels unnecessary?** The live CIN search box right below the hero. Why would a visitor search a company's CIN on your homepage before understanding who you are?
- **What would make me leave?** Information overload. I feel like I'm reading an annual corporate report before I've even decided if you're the right agency.

### 2. Private Limited Incorporation Page (`/services/pvt-ltd-registration.html`)
- **What it communicates:** SPICe+ Private Limited registration in India.
- **Is the purpose obvious?** Yes.
- **What looks unprofessional?** The pricing card says: *"Status: Pending Commercial Approval"*. Why are you showing me a service you haven't commercially approved yet? Can I buy this or not?
- **What information is missing?** The actual price! If competing corporate desks say ₹6,999 or ₹7,499, what do you charge?
- **What is confusing?** The primary button says *"Calculate Exact State Stamp Duty"* and sends me to a calculator page. Why can't I just click "Incorporate Now" and fill in my details?
- **What would make me leave?** Having to click through three pages just to find out what you charge.

### 3. Services Directory (`/services.html`)
- **What it communicates:** A massive library of 57 corporate services.
- **Is the purpose obvious?** Yes, it's a search catalog.
- **What is confusing?** There are 57 services listed in a massive grid. Seeing "Section 233 Fast-Track Mergers" next to "MSME Udyam Registration" makes no sense. One is a ₹2 Lakh corporate M&A restructuring; the other is a ₹0 government registration!
- **What feels missing?** A simple "Popular Starter Packages" section for new businesses.

### 4. DPIIT Startup India Page (`/services/dpiit-startup-india.html`)
- **What it communicates:** Startup India recognition and tax benefits.
- **What looks unprofessional?** You are advertising "Section 56(2)(viib) Angel Tax exemption". Anyone who follows the startup ecosystem knows that the Indian government abolished Angel Tax in the July 2024 budget! This makes me think your website copy hasn't been updated since 2023.

### 5. Conversion Checkout Pages (`/conversion/*.html`)
- **What happens when I click Submit?** A popup appears telling me: *"Notice: Online form transmission to a backend server is not active in this static environment. Details entered in this form are not stored or transmitted to CraftEgon CCS."*
- **Visceral Reaction:** **"Is this website fake? Is it a student project?"** If the form doesn't work, why is there a submit button?
- **The WhatsApp button:** It offers to open WhatsApp. Okay, that's helpful, but if I'm at work on my office desktop, I don't want to chat on WhatsApp. I just wanted to send an inquiry form.

### 6. Client Portal (`/portal/dashboard.html`)
- **What it communicates:** A high-tech client dashboard where I can track filings.
- **Visceral Reaction:** I try to click "My Documents" or "Settings" and nothing happens because it's a static demo mock. Why let me into a dashboard if I haven't even signed up? It makes the platform feel like a demo rather than a live operating company.

---

## 3. The Ten Blunt Things That Drive Customers Away

1. **Unapproved Pricing Disclaimers:** Displaying `PENDING_COMMERCIAL_APPROVAL` signals that the business is not commercially operational.
2. **The Missing Price Tag:** Forcing users to guess total fees or navigate to external calculators.
3. **The Static Form Warning:** Popping up a message stating "transmission is not active" destroys instant credibility.
4. **Outdated Regulatory Citations:** Mentioning abolished Angel Tax rules tells tech founders the content is stale.
5. **No Faces, No Founders:** Not a single human being is pictured or named on the entire website.
6. **No Physical Office Address:** The absence of a registered corporate office address in the footer triggers scam anxiety.
7. **Jargon-Heavy Introductions:** Starting every page with statutory section numbers rather than customer benefits.
8. **Lack of Instant Action on Service Pages:** Sending users on a scavenger hunt through the calculator before capturing their name.
9. **Desktop WhatsApp Friction:** Assuming all corporate clients want to conduct business over mobile WhatsApp.
10. **Choice Overload in the Directory:** Drowning new founders in 57 services when they only need 2 or 3.
