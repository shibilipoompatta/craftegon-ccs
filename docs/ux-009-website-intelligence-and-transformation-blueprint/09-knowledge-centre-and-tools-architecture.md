# TASK-CCS-UX-009: Knowledge Centre & Diagnostic Tools Architecture

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Target Sections:** `/knowledge/` (12 Guides) and `/conversion/` (20 Tools & Intakes)  
**Auditor:** Content Strategist & Lead Tools Architect  
**Date:** November 8, 2026

---

## 1. Role and Strategic Separation

A core finding of the website intelligence audit is that informational content and commercial service offerings are occasionally conflated, leading to bloated pages and duplicate text.

To ensure clarity:
1. **Individual Service Pages (`/services/`):** Focus exclusively on **commercial execution**: eligibility, deliverables, timeline, pricing transparency, and direct intake.
2. **Knowledge Centre (`/knowledge/`):** Focuses on **educational value, regulatory intelligence, and statutory procedure**: plain-language blueprints, legal frameworks, and compliance due-date calendars.
3. **Diagnostic Tools (`/conversion/`):** Focus on **interactive self-service assessment**: calculating late fees, stamp duty, or checking strike-off eligibility.

---

## 2. Knowledge Centre Architecture (`/knowledge/`)

The Knowledge Centre will be organized into four authoritative statutory collections:

```
/knowledge/ (Knowledge Centre Index)
├── 1. Corporate Incorporation & Structuring Guides
│   ├── spice-plus-mca-v3-blueprint.html      (SPICe+ MCA V3 Step-by-Step Filing)
│   ├── pvt-vs-llp-comparative-guide.html      (Comparative Structuring Blueprint)
│   └── foreign-direct-investment-guide.html   (Inbound FDI & FEMA Framework)
├── 2. Annual ROC & Corporate Secretarial Blueprints
│   ├── late-fee-calculator-guide.html        (Section 403 MCA Penalty Scaling)
│   ├── annual-general-meeting-compliance.html (AGM & Board Secretarial Calendar)
│   └── director-kyc-compliance-blueprint.html (DIR-3 KYC Statutory Framework)
├── 3. Corporate Restructuring & Entity Exit
│   ├── fast-track-strike-off-guide.html      (Section 248 Defunct Company Closure)
│   └── voluntary-winding-up-overview.html    (Insolvency & Bankruptcy IBC Exit)
└── 4. Technology, Data Privacy & Tax Governance
    ├── dpdp-readiness-checklist.html         (DPDP Act 2023 Implementation Blueprint)
    ├── transfer-pricing-guide.html           (Form 3CEB Arm's Length Standards)
    └── msme-section-43bh-guide.html          (45-Day Payment Rule Compliance)
```

### Contextual Cross-Linking Rules:
- Every educational guide must include a subtle, high-intent **"Statutory Service Companion"** callout box.
- *Example:* Inside `late-fee-calculator-guide.html`, a clean card provides:
  > *"Need to calculate your exact accrued late fees? Use our [Interactive MCA Late Fee Calculator →](/conversion/calculator.html) or consult our [Annual ROC Filing Desk →](/services/roc-annual-compliance.html)."*

---

## 3. Diagnostic Tools & Calculator Suite

CraftEgon's diagnostic tools provide immense organic top-of-funnel value by solving immediate client calculation needs without friction:

| Tool Route | Statutory Mathematical Engine | Value Proposition | Privacy & Data Boundary | Commercial Conversion Path |
| :--- | :--- | :--- | :--- | :--- |
| `calculator.html` | Companies Act 2013 Sec 403 penalty engine (`calculator.js`). | Computes exact ₹100/day late fees for Forms AOC-4, MGT-7, and DIR-3 KYC based on filing date. | Pure client-side execution; zero data transmitted or stored. | Prompts user to generate an itemised penalty waiver or filing plan. |
| `trademark-search.html` | Nice Classification (Classes 1–45) search and conflict screener. | Identifies appropriate trademark classification and checks phonetically similar marks. | Searches run against client-side sanitized index. | Invites user to initiate formal TM-A filing through IP desk. |
| `strike-off-checker.html`| Section 248 Companies Act eligibility decision tree. | Evaluates whether a company has zero assets/liabilities and satisfies the 2-year non-operation rule. | Client-side questionnaire; anonymous. | Routes eligible founders to Form STK-2 Fast-Track Closure service. |
| `fema-consultation.html` | Foreign investment reporting requirement evaluator. | Determines whether transaction triggers FC-GPR, FC-TRS, or FLA reporting. | High-level scoping only. | Direct consultation with Cross-Border Desk. |

---

## 4. Privacy & Data Minimization Guarantees

All interactive tools on the CCS platform must adhere strictly to the **Data Minimization Principle** of the Digital Personal Data Protection (DPDP) Act, 2023:
1. No corporate registration numbers (CIN), personal identification (PAN/Aadhaar), or proprietary financial accounts are requested or required to operate any calculator or tool.
2. Calculations are executed in local browser memory via JavaScript.
3. If a visitor requests a formal calculation report, only basic contact coordinates (Name, Phone/WhatsApp, Email) are collected to deliver the summary.
