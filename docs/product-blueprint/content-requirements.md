# CraftEgon CCS — Content Requirements & Reusable Page Schema

**Document ID**: `CRAFTEGON-PROD-005`  
**Classification**: Content Engineering & Regulatory Standard  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Universal Service Page Architecture (10 Mandatory Sections)

Every commercial service landing page across all 15 verticals must implement the following 10 structural sections:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. BREADCRUMB NAVIGATION                                               │
│    Home / [Vertical Hub] / [Current Service Page]                      │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO & VALUE PROPOSITION                                            │
│    • H1: Refined serif title (Cinzel / Playfair)                       │
│    • Lead paragraph with statutory scope and audience                  │
│    • Primary CTA ("Calculate Retainer" / "Intake Portal")              │
│    • Secondary CTA ("Chat on WhatsApp (+91 86069 18247)")             │
│    • Statutory Authority Badge (e.g. "MCA V3 Certified Pipeline")      │
├────────────────────────────────────────────────────────────────────────┤
│ 3. TARGET AUDIENCE & STATUTORY ELIGIBILITY                             │
│    • Explicit legal criteria (e.g. Pvt Ltd, LLP, Section 8, Foreign)  │
│    • Thresholds (Turnover, Paid-Up Capital, Headcount, Foreign Equity) │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SCOPE OF SERVICES (INCLUSIONS VS. EXCLUSIONS)                       │
│    • Bulleted list of professional deliverables included               │
│    • Explicit list of exclusions (e.g., state stamp duties, court fees)│
├────────────────────────────────────────────────────────────────────────┤
│ 5. MANDATORY CLIENT INPUTS & DOCUMENT CHECKLIST                        │
│    • KYC requirements (PAN, Aadhaar, Passport, Utility Bill < 2 mos)   │
│    • Corporate records (Board resolution, DSC tokens, Audited P&L)     │
├────────────────────────────────────────────────────────────────────────┤
│ 6. STEP-BY-STEP STATUTORY FILING PROCESS FLOW                          │
│    • Phase 1: Pre-requisites & DSC generation                          │
│    • Phase 2: Document drafting & Board approval                       │
│    • Phase 3: Portal e-filing & RoC challan generation                 │
│    • Phase 4: Government processing & statutory certificate delivery   │
├────────────────────────────────────────────────────────────────────────┤
│ 7. TRANSPARENT PRICING & GOVERNMENT FEES                               │
│    • Professional CS / Legal retainer fee component                    │
│    • Estimated Government statutory fees (challans, stamp duty)        │
│    • Mandatory Statutory Indicative Estimate Disclaimer                │
├────────────────────────────────────────────────────────────────────────┤
│ 8. STATUTORY-GROUNDED FAQS                                             │
│    • Minimum 4 FAQ accordions citing specific Acts and Sections        │
│    • Structured Schema FAQPage JSON-LD markup integration              │
├────────────────────────────────────────────────────────────────────────┤
│ 9. RELATED SERVICES & KNOWLEDGE BLUEPRINTS                             │
│    • Cross-links to parent vertical hub, calculators, and guides       │
├────────────────────────────────────────────────────────────────────────┤
│ 10. INSTITUTIONAL CONTACT CTA & INDEPENDENT COUNSEL DISCLAIMER        │
│    • WhatsApp trigger (`+91 86069 18247`) & Email (`admin@craftegon.com`)│
│    • Bar Council of India independent advocate representation notice   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Regulatory Citation & Evidence Grounding Rules

All service copy, knowledge articles, and calculator instructions must strictly adhere to the following evidence rules:

1. **Mandatory Statutory Identification**:
   - Never write *"according to the law"* or *"as per regulations"*.
   - Always state the exact Act and Section:
     - *Correct*: *"Under Section 137(1) of the Companies Act, 2013 read with Rule 12 of the Companies (Accounts) Rules, 2014..."*
     - *Incorrect*: *"You must file financial statements annually."*
2. **Fee Segregation**:
   - Always separate professional retainers from government statutory charges.
   - Government fees must be labeled as *Estimated Government Fees* or *Subject to Official Challan Generation*.
3. **Mandatory Estimate Disclaimer**:
   Every pricing card or calculation output must display:
   > *"Statutory Notice: Calculations and fee displays are indicative estimates. Official statutory fees (MCA stamp duty, RoC filing fees, IP India official fees) depend on state jurisdiction, authorized capital tiers, and official portal challan generation. Professional fees are subject to 18% GST."*
4. **Independent Legal Counsel Notice**:
   Every litigation, NCLT, or dispute-related service page must display:
   > *"Statutory Disclaimer & Legal Framework: CraftEgon CCS provides corporate secretarial, compliance, and document drafting infrastructure. All formal legal representation, court appearances, and litigation advocacy are handled exclusively through our panel of independent associated advocates and senior legal counsel under the Advocates Act, 1961."*

---

## 3. Editorial Tone & Brand Voice Guidelines

- **Tone**: Sophisticated, authoritative, objective, and calm.
- **Language**: Standard Indian Legal English with proper statutory capitalizations (e.g., *Companies Act, 2013*, *Board of Directors*, *Memorandum of Association*, *Registrar of Companies*).
- **Prohibited Patterns**:
  - No hyperbolic claims: *"100% Guaranteed Approval"*, *"Instant 5-Minute Company"*, *"No Questions Asked"*.
  - No fabricated testimonials or invented partner credentials.
  - No misleading promises of government timeline guarantees.
