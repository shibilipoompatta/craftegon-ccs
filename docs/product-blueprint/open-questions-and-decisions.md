# CraftEgon CCS — Open Questions & Strategic Decisions Log

## 1. Executive Summary & Purpose

This document catalogs the unresolved strategic, technical, commercial, regulatory, and infrastructural decisions requiring formal review and sign-off by the leadership of **CraftEgon Corporate Compliance Services** (under CraftEgon LLP).

Per **Rule 13**, this log rigorously separates:
- **Observed Facts**: Realities verified directly within the repository code, git history, and current build.
- **Official-Source Findings**: Documented government policies, statutory provisions, and external API limitations.
- **Design Proposals**: Architectural, UX, and workflow recommendations formulated in this blueprint.
- **Unresolved Assumptions**: Speculative items, pricing structures, third-party vendor choices, and legal structures requiring owner approval.

---

## 2. Decision Matrix Summary

| Decision ID | Domain | Strategic Question | Recommended Option | Priority | Owner / Stakeholder |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **DEC-01** | **Regulatory Integration** | Which corporate data aggregator should power live MCA V3 master lookups? | **Karza (Perfios)** for depth & reliability. | High | Tech Lead & Founder |
| **DEC-02** | **AI Infrastructure** | Which LLM hosting model complies with DPDP Act 2023 Indian data residency? | **Google Cloud Vertex AI (Mumbai/Delhi)**. | High | Chief Information Officer |
| **DEC-03** | **Commercial & Pricing** | Should annual RoC retainers adopt fixed slab pricing or dynamic volume pricing? | **Tiered Base Retainer + Per-Event Surcharge**. | High | Managing Partner (CraftEgon LLP) |
| **DEC-04** | **Messaging & Alerts** | Which WhatsApp Business Solution Provider (BSP) should deliver statutory reminders? | **Gupshup** (Optimized for Indian regulatory templates). | Medium | Product Lead |
| **DEC-05** | **Recurring Billing** | Which payment gateway should manage annual compliance auto-debits (e-NACH / UPI)? | **Razorpay Subscriptions & Smart Collect**. | Medium | Finance & Legal Lead |
| **DEC-06** | **Litigation Firewall** | How should independent advocate empanelment agreements be formalized under BCI rules? | **Standardized Non-Exclusive Referral & Advisory MoU**. | High | Regulatory & Legal Counsel |
| **DEC-07** | **Authentication Stack** | Which identity provider should secure the Phase G Client Portal? | **Supabase Auth or Firebase Auth**. | Low (Phase G) | Lead Architect |
| **DEC-08** | **Document Retention** | How long should client audited financials and board minutes remain in the Digital Vault? | **8 Years** (Per Companies Act Sec 128 & DPDP consent).| Medium | Data Protection Officer |

---

## 3. Detailed Decision Proposals

### Decision 01: Corporate Data Aggregator Selection for MCA V3 Lookups
- **Observed Fact**: The Ministry of Corporate Affairs (MCA21 V3) does not provide a public, unauthenticated, real-time developer REST API for external developers. The current website uses manual client inputs.
- **Official-Source Finding**: Direct scraping of `mca.gov.in` violates terms of service and is blocked by government Cloudflare/WAF protections and CAPTCHAs.
- **Design Proposal**: Integrate a licensed, enterprise corporate data aggregator during Phase E to support instant CIN-based master data prefill.
- **Options**:
  1. *Option A (Recommended)*: **Karza Technologies (Perfios)**. Industry standard in India for banking/NBFCs; ~₹1.50–₹2.50 per company master lookup; 99.8% SLA.
  2. *Option B*: **Signzy**. Strong API suite; includes MCA + GST + Director DIN lookups in unified bundles.
  3. *Option C*: **Probe42**. Excellent financial data depth, higher minimum monthly commitment.
  4. *Option D*: **No API / Static User Input**. Continue requiring founders to manually input their CIN, Incorporation Date, and Authorized Capital.
- **Decision Required**: Approve budget (~₹15,000–₹25,000 initial API credit) or mandate static client input for MVP.

---

### Decision 02: AI Hosting & Indian Data Residency (DPDP Act 2023)
- **Observed Fact**: The website currently runs a purely client-side rule-based chat widget (`assets/js/chat-widget.js`) with zero external AI API connections.
- **Official-Source Finding**: Digital Personal Data Protection Act 2023 (DPDP) and corporate confidentiality guidelines prohibit transmitting sensitive financial statements or board resolutions to foreign LLM servers without explicit cross-border data transfer compliance.
- **Design Proposal**: Deploy Gemini models via **Google Cloud Vertex AI residing in `asia-south1` (Mumbai) or `asia-south2` (Delhi)** with enterprise zero-data-retention agreements.
- **Options**:
  1. *Option A (Recommended)*: **Google Cloud Vertex AI (Mumbai)**. Enterprise data privacy guarantee; data is never used to train base foundation models; data stays in India.
  2. *Option B*: **Standard Google AI Studio Gemini API**. Fast and cost-effective, but requires careful review of terms regarding data logging and location.
  3. *Option C*: **Self-Hosted Open Source Model (e.g., Llama 3 on AWS India EC2)**. Maximum privacy control, but high ongoing GPU infrastructure cost ($400+/month).
- **Decision Required**: Confirm whether enterprise Vertex AI India is required from launch of Phase F.

---

### Decision 03: Commercial Retainer Pricing Structure
- **Observed Fact**: Current website pages display indicative starting fees (e.g., Private Limited Incorporation from ₹6,999; RoC Annual Compliance from ₹11,999; Trademark Registration from ₹4,499).
- **Official-Source Finding**: Statutory government fees are fixed by rules and vary by authorized capital slabs (e.g., MCA Form AOC-4 fee is ₹200 for capital under ₹1L, ₹300 for ₹1L–₹5L, ₹400 for ₹5L–₹25L, ₹500 for ₹25L–₹1Cr, and ₹600 for over ₹1Cr).
- **Design Proposal**: Transition all pricing disclosures from single flat figures to transparent **"Professional Fee + Actual Government Fee at Cost"** breakdowns.
- **Options**:
  1. *Option A (Recommended)*: **Transparent Two-Part Pricing**. Clear breakdown showing CraftEgon Professional Advisory Fee + Exact Government Challan Reimbursement at Cost. Builds trust and eliminates disputes when client capital increases.
  2. *Option B*: **All-Inclusive Flat Fee Packages**. Absorbs government fees up to standard limits; easier for sales, but risks margin loss when statutory forms require additional filings (e.g., MGT-14, DPT-3, DIR-12).
- **Decision Required**: Formal sign-off on the standard fee schedule for all 57 services.

---

### Decision 04: WhatsApp Business Solution Provider (BSP) for Statutory Reminders
- **Observed Fact**: Current website uses direct `wa.me/918606918247` click-to-chat links for instantaneous human consultation.
- **Official-Source Finding**: Sending automated, proactive, outbound WhatsApp reminder templates (e.g., *"Your AOC-4 filing is due in 7 days"*) requires an official WhatsApp Business Platform API account registered with Meta and approved message templates.
- **Design Proposal**: Keep human consultation on direct WhatsApp (`+91 86069 18247`) while provisioning an official WhatsApp API BSP in Phase G for automated compliance notifications.
- **Options**:
  1. *Option A (Recommended)*: **Gupshup**. Proven Indian leader in compliance and banking WhatsApp notification delivery; competitive per-message template rates (~₹0.40–₹0.60 per utility message).
  2. *Option B*: **Wati / Interakt**. User-friendly dashboard for SMBs, higher platform subscription fee.
  3. *Option C*: **Twilio**. Excellent international delivery, slightly higher latency for Indian domestic telecom routing.
- **Decision Required**: Approve timeline for provisioning Meta Business Manager verification and WhatsApp API credentials.

---

### Decision 05: Payment Gateway & Recurring Auto-Debit Mandates
- **Observed Fact**: No payment gateway is currently integrated; client transactions are handled via manual invoice and bank NEFT/RTGS transfers.
- **Official-Source Finding**: Annual compliance retainers have high customer drop-off if clients must remember to initiate manual payments annually. RBI guidelines permit recurring e-mandates on credit cards, debit cards, and UPI AutoPay up to ₹15,000 without additional AFA.
- **Design Proposal**: Integrate **Razorpay Subscriptions & UPI AutoPay** in Phase G for seamless annual retainer billing.
- **Options**:
  1. *Option A (Recommended)*: **Razorpay**. Most comprehensive support for UPI AutoPay, e-NACH, and corporate credit cards in India.
  2. *Option B*: **Cashfree Payments**. Competitive MDR, strong instant payout capabilities for vendor disbursements.
- **Decision Required**: Authorize merchant account onboarding under CraftEgon LLP.

---

### Decision 06: Advocate Empanelment Structure under Advocates Act 1961
- **Observed Fact**: CraftEgon CCS is a corporate compliance and advisory service operating under CraftEgon LLP, not a law firm.
- **Official-Source Finding**: Under the Advocates Act, 1961 and Bar Council of India (BCI) Rules, non-advocate corporate entities cannot practice law, represent clients in courts, or solicit litigation business.
- **Design Proposal**: Maintain an explicit, legally vetted firewall:
  - CraftEgon CCS performs corporate compliance audits, secretarial drafting, documentation, valuation, and advisory.
  - Court, NCLT, NCLAT, High Court, and Tribunal appearances are conducted strictly by **independent empanelled advocates** engaged directly by the client or through formal briefing retainers.
- **Options**:
  1. *Option A (Recommended)*: **Formal Empanelment Charter**. Draft standard non-exclusive legal advisory and briefing referral agreements with independent advocates in Chennai, Bengaluru, Mumbai, and New Delhi benches of the NCLT.
  2. *Option B*: **Ad-Hoc Client Referral**. Simply provide clients with contact details of independent counsel without an institutional framework.
- **Decision Required**: Legal counsel to approve the standard Empanelment MoU and website disclaimer text.

---

### Decision 07: Digital Document Retention Window (DPDP Act 2023 vs Companies Act 2013)
- **Observed Fact**: Indian companies are required under Section 128(5) of the Companies Act, 2013 to preserve books of account and vouchers for a minimum period of **8 financial years**.
- **Official-Source Finding**: The DPDP Act, 2023 mandates that personal data must be erased as soon as the purpose for which it was collected has been fulfilled, unless retention is required by other statutory enactments.
- **Design Proposal**: Define the Vault retention policy as **8 Financial Years from the filing date**, backed by explicit customer consent during portal registration, after which data is securely purged unless an active audit or litigation hold exists.
- **Decision Required**: Formal sign-off by the Data Protection Officer on the 8-year statutory retention schedule.

---

## 4. Summary of Observed Facts vs Unresolved Assumptions

```
┌────────────────────────────────────────────────────────────────────────┐
│ OBSERVED FACTS (Verified in Repository & Codebase)                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 113 total HTML files across 15 verticals and 57 services.           │
│ 2. 0 broken links; 0 orphan pages; 100% passing automated link mesh.   │
│ 3. SEO audit passes on all 111 indexable pages with valid JSON-LD.     │
│ 4. Client-side chat engine operates purely on static local regex.      │
│ 5. WhatsApp (+91 86069 18247) and Email (admin@craftegon.com) active.   │
│ 6. No live government APIs or serverless databases currently attached. │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ UNRESOLVED ASSUMPTIONS (Requires Formal Owner Sign-off)                │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Selection of corporate data aggregator (Karza vs Signzy).           │
│ 2. Budget allocation for Vertex AI India RAG infrastructure.           │
│ 3. Approval of final published fee schedule across all 57 services.    │
│ 4. Meta Business Manager registration for automated WhatsApp API.      │
│ 5. Execution of BCI-compliant Advocate Empanelment MoUs.               │
└────────────────────────────────────────────────────────────────────────┘
```
