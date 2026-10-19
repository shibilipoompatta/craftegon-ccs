# Phase 5 Drafting Architecture Report — Template vs. AI Separation

**Project:** CraftEgon CCS  
**Component:** `src/backend/ai/document-drafter.js`  
**Templates:** `src/backend/ai/templates/*.json`  

---

## 1. The Core Legal Dilemma in Legal Drafting

In enterprise corporate compliance, generating formal governance documents (such as Board Resolutions, EGM Notices, or Director Disclosures) using probabilistic Large Language Models presents unacceptable liability risks:
1. **Risk of Hallucinated Quorum or Majority:** An LLM might draft "passed by simple majority" for a matter statutorily requiring a 75% Special Resolution under the Companies Act, 2013.
2. **Risk of Inaccurate Statutory Sanction:** An LLM might cite non-applicable sections or omit mandatory statutory disclosures required under Section 102.
3. **Risk of Unenforceability:** A document missing standard boilerplate or statutory wording may be rejected by banks, ROC officers, or judicial bodies.

To solve this, CraftEgon CCS implements **strict architectural separation** between:
1. `DETERMINISTIC_STATUTORY_TEMPLATE` (Zero-hallucination variable substitution on approved templates)
2. `AI_ASSISTED_DRAFT` (Probabilistic drafting for non-standard commercial clauses with mandatory watermarks and review flags)

---

## 2. Deterministic Statutory Templates

### 2.1 Characteristics
- **Bypasses Language Models Completely:** No generative AI is used. Variable substitution is strictly mechanical and validated.
- **Strict Variable Validation:** If any required variable (`cin`, `meeting_date`, `bank_name`, etc.) is absent or empty, the drafter fails deterministically with `MISSING_REQUIRED_VARIABLES` (HTTP 400).
- **Watermark:** Prepends and appends:  
  `=== [CRAFTEGON CCS: DETERMINISTIC STATUTORY TEMPLATE — NON-PROBABILISTIC DRAFT] ===`
- **Metadata Output:** `is_ai_generated: false`, `drafting_mode: 'DETERMINISTIC_STATUTORY_TEMPLATE'`.

### 2.2 Template Registry

| Template ID | Name | Statutory Authority | Category |
| :--- | :--- | :--- | :--- |
| `TMPL-MCA-BOARD-BANK-001` | Board Resolution: Bank Account Opening | Section 179(3) Companies Act, 2013 | Corporate Governance |
| `TMPL-MCA-NOTICE-EGM-001` | Notice of Extraordinary General Meeting | Sections 101 & 102 Companies Act, 2013 | Shareholder Meetings |
| `TMPL-MCA-DIR8-DISCLOSURE-001` | Form DIR-8 Director Non-Disqualification | Section 164(2) Companies Act, 2013 | Director Compliance |
| `TMPL-COM-NDA-MUTUAL-001` | Standard Mutual Non-Disclosure Agreement | Indian Contract Act, 1872 | Commercial Contracts |

---

## 3. AI-Assisted Custom Drafting

### 3.1 Characteristics
- **Scope:** Used for bespoke clauses, non-standard contract amendments, or novel commercial provisions.
- **Grounding Integration:** Ingests relevant statutory corpus chunks to ground clause construction.
- **Watermark:** Prepends and appends:  
  `=== [CRAFTEGON CCS: AI-ASSISTED DRAFT — REQUIRES HUMAN LEGAL REVIEW — NOT AN EXECUTED INSTRUMENT] ===`
- **Metadata Output:** `is_ai_generated: true`, `drafting_mode: 'AI_ASSISTED_DRAFT'`, `requires_human_professional_review: true`.
- **Statutory Disclaimer:** Informs the user that the document does not constitute a certified legal instrument under the Advocates Act, 1961.

---

## 4. Architectural Comparison Table

| Attribute | Deterministic Template | AI-Assisted Draft |
| :--- | :--- | :--- |
| **Model Invocations** | None (0 tokens) | Model Gateway (`gemini-1.5-flash` or offline reasoner) |
| **Generation Type** | String placeholder substitution | Probabilistic generative drafting |
| **Hallucination Risk** | Absolute Zero (0%) | Constrained by RAG & Watermarks |
| **Variable Validation** | Strict schema validation | Open-ended prompt extraction |
| **Execution Watermark** | `DETERMINISTIC STATUTORY TEMPLATE` | `AI-ASSISTED DRAFT — NOT AN EXECUTED INSTRUMENT` |
| **Human Review Flag** | `requires_human_professional_review: true` | `requires_human_professional_review: true` |
| **Appropriate Use Cases** | RoC Board Resolutions, DIR-8, EGM Notices | Custom commercial clauses, special indemnities |
