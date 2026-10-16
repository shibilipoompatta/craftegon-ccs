# CraftEgon CCS — Product Scope & Architectural Boundaries

**Document ID**: `CRAFTEGON-PROD-001`  
**Classification**: Master Product Scope Document  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Strategic Vision & Mission

### Mission Statement
To provide Indian enterprises, founders, foreign multinationals, and corporate boards with a sovereign, high-precision compliance and corporate legal operating system that reduces statutory friction, eliminates late fees, and guarantees regulatory integrity.

### Vision
To evolve from an authoritative 15-vertical compliance directory into India's leading legal-tech infrastructure platform, orchestrating autonomous compliance tracking, client matter management, and grounded regulatory AI.

---

## 2. Core Value Propositions

| Value Pillar | Customer Outcome | Architectural Mechanism |
| :--- | :--- | :--- |
| **1. Autonomous Deadline Tracking** | Zero RoC penalties (avoiding ₹100/day fines under Section 403 of Companies Act 2013). | Live statutory calendar ticker calibrated to entity type, capital tier, and financial year milestones. |
| **2. Transparent Fee Modeling** | Clear separation between professional retainers and statutory government challan fees. | Pure client-side computational engines with state-specific stamp duty and capital multipliers. |
| **3. Grounded Statutory Authority** | Zero speculative legal advice; every recommendation cites governing Acts and Sections. | Regulatory knowledge engine mapped to official MCA V3, RBI FIRMS, and Income Tax gazettes. |
| **4. Sovereign Multi-Vertical Coverage** | One unified corporate services desk for 15 legal, secretarial, tax, and cyber disciplines. | Normalized 15-practice taxonomy spanning entity setup, RoC, Tax, FEMA, NCLT, and DPDP Act. |
| **5. Independent Counsel Model** | Full compliance with Bar Council of India regulations without sacrificing litigation capability. | Clear statutory segregation: secretarial/filing tasks handled in-house; court advocacy routed to empanelled advocates. |

---

## 3. Product Boundaries: What CraftEgon CCS Is and Is Not

```
┌────────────────────────────────────────────────────────────────────────┐
│ WHAT CRAFTEGON CCS IS                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ • A digital corporate secretarial, tax, and regulatory compliance desk │
│ • A licensed Company Secretary (CS) and accounting filing pipeline     │
│ • A client-side diagnostic calculator suite for statutory fee planning │
│ • A curated knowledge repository citing verified Indian legal codes   │
│ • A client matter staging, drafting, and document intake engine       │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ WHAT CRAFTEGON CCS IS NOT                                              │
├────────────────────────────────────────────────────────────────────────┤
│ • NOT a government portal or official registry agency                 │
│ • NOT an unregulated law firm soliciting clients (BCI Rule 36 compliant│
│ • NOT an autonomous bot that uploads to MCA/IT without human DSC sign  │
│ • NOT a provider of speculative or guaranteed government outcomes      │
│ • NOT a simulated backend that stores data without client consent      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. In-Scope vs. Out-of-Scope Capabilities by Phase

### Phase 1: Static Edge Website & Knowledge Directory (Current Production)
- **In-Scope**:
  - 113 fully responsive HTML pages across 15 verticals, 57 specialized services, 19 diagnostic tools, 10 knowledge blueprints, 5 legal policies, and 3 portal gateway pages.
  - Zero-dependency client-side navigation injection with offline fallbacks.
  - Pure JavaScript fee calculator (`assets/js/calculator.js`) and document synthesizer (`ai-document-generator.html`).
  - Standardized business contact information (`+91 86069 18247`, `admin@craftegon.com`).
  - Strict WCAG 2.2 AA accessibility and light corporate design system (Ivory, Gold, Silver & Charcoal).
  - 100% unique titles, meta descriptions, canonical URLs, and structured JSON-LD schemas.
- **Out-of-Scope**:
  - Live server-side user registration or database persistence.
  - Direct transmission of form data without confirmed HTTPS endpoint.
  - Real-time API scraping of MCA V3 or IP India portals.

### Phase 2: Client Portal OS & Grounded Client-Side Assistant (Current Beta)
- **In-Scope**:
  - Autonomous Compliance Calendar dashboard (`portal/dashboard.html`) with client-side countdown clocks for AOC-4, MGT-7, DIR-3 KYC, and RBI FLA.
  - CIN/LLPIN format validation and status lookup simulation.
  - GenAI Co-Pilot widget (`assets/js/chat-widget.js`) with 10 statutory intent trees grounded in Companies Act 2013, FEMA, and DPDP Act.
  - Deep-link URL parameter passing (`?doc_type=...&company=...&cin=...`) from calendar to document drafter.
- **Out-of-Scope**:
  - Automated WhatsApp message dispatching without user-triggered click.
  - Storage of sensitive director identification numbers (DIN) or Aadhaar numbers in browser storage.

### Phase 3: SaaS Legal-Tech Platform & Live Backend (Future Implementation)
- **In-Scope**:
  - Cloudflare Workers / Node.js serverless REST API.
  - PostgreSQL / Supabase encrypted database with Row-Level Security (RLS).
  - Verified OTP / SSO authentication for corporate clients and directors.
  - Razorpay subscription billing for monthly/annual retainers with automated GST e-invoicing.
  - Live MCA V3 and GSTN API integration for automated entity monitoring.
  - Full server-side RAG pipeline over official gazette repositories.
- **Out-of-Scope**:
  - Automated filing of legal petitions without advocate-on-record review.
  - Handling of non-Indian local state taxes outside the Republic of India.
