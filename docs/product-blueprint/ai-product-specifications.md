# CraftEgon CCS — AI Product Specifications & Grounding Architecture

**Document ID**: `CRAFTEGON-AI-001`  
**Classification**: AI Product Specification & Safety Governance  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Master AI Architectural Governance

All AI capabilities operating on the CraftEgon CCS platform must adhere to the **Sovereign Legal-Tech Guardrail Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SOVEREIGN LEGAL AI GUARDRAIL PIPELINE                                  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Zero Direct Generation from Base Model Weights                      │
│    └─> Every factual claim must be retrieved from the verified corpus. │
│ 2. Mandatory Statutory Citation                                        │
│    └─> Output must quote Act, Year, Section, Rule, and Gazetted Date.  │
│ 3. Explicit Uncertainty Handling                                       │
│    └─> If semantic similarity < 0.82, output fallback & human trigger. │
│ 4. Client Privacy Firewall (DPDP Act 2023)                             │
│    └─> PII (Aadhaar, PAN, DIN, Bank A/C) masked before model context.  │
│ 5. Independent Counsel Boundary                                        │
│    └─> Litigation inquiries automatically route to empanelled counsel. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Specifications for 7 AI Products

### AI-1: Grounded AI Compliance Assistant ("CraftEgon AI Co-Pilot")
- **Status**: Implemented Client-Side Beta ([`assets/js/chat-widget.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/chat-widget.js)).
- **User Problem**: Visitors need instant answers to basic compliance rules without waiting for a consultant callback.
- **Supported Tasks**:
  - Explaining statutory filing deadlines (AOC-4, MGT-7, DIR-3 KYC, DPT-3, FLA).
  - Computing late fee formula explanations under Section 403 of Companies Act 2013.
  - Guiding incorporation requirements (SPICe+ Part A/B, DSC, DIN).
  - Routing users directly to conversion calculators and diagnostic intake funnels.
- **Unsupported Tasks**: Giving binding tax opinions; drafting contested litigation arguments; evaluating personal criminal liability.
- **Approved Corpus**: Companies Act 2013, Companies (Incorporation) Rules 2014, MCA Fee Rules 2014, FEMA 1999 Master Directions, DPDP Act 2023.
- **Confidence Threshold**: $\ge 0.85$. If lower, triggers human escalation to WhatsApp (`+91 86069 18247`).

---

### AI-2: AI Compliance Calendar Assistant
- **Status**: Implemented Prototype ([`portal/dashboard.html`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/portal/dashboard.html)).
- **User Problem**: Promoters do not know which statutory forms apply to their specific corporate entity.
- **Supported Tasks**:
  - Parsing 21-digit Corporate Identity Numbers (CIN) or LLPINs to extract State, Year, Industry, and Ownership Class.
  - Triggering calendar obligation timelines based on incorporation date and AGM thresholds.
- **Input Schema**:
  ```json
  { "cin": "U72900KL2024PTC085123", "agm_date": "2026-09-30", "fdi_received": false }
  ```
- **Output Schema**:
  ```json
  {
    "applicable_obligations": [
      { "form": "AOC-4", "due_date": "2026-10-30", "statute": "Sec 137 Companies Act 2013" },
      { "form": "MGT-7", "due_date": "2026-11-29", "statute": "Sec 92 Companies Act 2013" }
    ]
  }
  ```

---

### AI-3: AI Regulatory Research Assistant
- **Status**: Planned Specification (Phase F).
- **User Problem**: General Counsels and CFOs require rapid cross-statute synthesis of regulatory amendments and notifications.
- **Supported Tasks**: Querying MCA General Circulars, CBDT Notifications, CBIC Tax Circulars, and RBI A.P. (DIR Series).
- **Corpus**: Official Ministry Gazette PDF repository indexed with vector embeddings.
- **Output Requirement**: Strict Markdown table format linking directly to official PDF gazette URLs.

---

### AI-4: AI Trademark Research Assistant
- **Status**: Implemented Client-Side Guidance ([`conversion/trademark-search.html`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/conversion/trademark-search.html)).
- **User Problem**: Brand owners do not know which of the 45 Nice Classes cover their technology or products.
- **Supported Tasks**: Natural language prompt parsing into Nice Classes 1–45 with goods/services descriptions.
- **Guardrail**: Explicitly disclaims that classification guidance is educational and does not constitute official TMR acceptance.

---

### AI-5: AI Legal Document & Drafting Assistant
- **Status**: Implemented Prototype ([`conversion/ai-document-generator.html`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/conversion/ai-document-generator.html)).
- **User Problem**: Startups pay excessive fees for routine statutory resolutions, NDAs, and founder agreements.
- **Supported Tasks**: Generating standardized Board Resolutions, Mutual NDAs, Co-Founder Equity Vesting Agreements, and SaaS MSAs.
- **Deep-Link Parameters**: Dynamically reads `?doc_type=...&company=...&cin=...` to pre-populate clauses.
- **Guardrail**: Every generated draft includes a watermarked statutory disclaimer advising review by independent legal counsel before execution.

---

### AI-6: AI Service Navigator & Diagnostic Intake Assistant
- **Status**: Implemented Staging Logic ([`assets/js/forms.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/forms.js)).
- **User Problem**: Clients with complex multi-issue requirements do not know which service vertical to select.
- **Supported Tasks**: Analyzing client multi-field inputs and prefilling contextual WhatsApp/Email routing parameters.

---

### AI-7: AI Document Checklist & Readiness Assistant
- **Status**: Planned Specification (Phase F).
- **User Problem**: High rate of MCA V3 form resubmissions due to invalid utility bills, missing director signatures, or expired DSC tokens.
- **Supported Tasks**: Pre-submission document readiness inspection (e.g. checking utility bill date is $< 2$ months old, verifying PAN name matches Aadhaar name).
- **Privacy Standard**: Client-side OCR validation where possible; zero retention of raw identity scans on public model endpoints.
