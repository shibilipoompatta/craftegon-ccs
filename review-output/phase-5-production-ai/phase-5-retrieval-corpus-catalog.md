# Phase 5 Statutory Retrieval Corpus Catalog & Grounding Specification

**Project:** CraftEgon CCS  
**Component:** `src/backend/ai/retrieval-corpus.js`  
**Dataset:** `src/backend/ai/corpus/canonical-statutory-corpus.json`  
**Version:** 1.0.0  
**Jurisdiction:** IN-CENTRAL (National)  

---

## 1. Corpus Design Principles

The CraftEgon CCS canonical retrieval corpus is built under strict legal accuracy standards:
1. **Primary Statutory Sources Only:** Every chunk cites official legislative acts, rules, circulars, or notifications issued by competent regulatory bodies.
2. **Immutable Chunk Identifiers:** Every chunk carries a deterministic ID (`CORP-<STATUTE>-<PROVISION>`) and semver versioning (`1.0.0`).
3. **Structured Citation Metadata:** Every chunk contains `authority`, `statute`, `section_or_rule`, `effective_date`, `source_id`, and `title`.
4. **Refusal Thresholding:** A calibrated minimum relevance threshold (`DEFAULT_REFUSAL_THRESHOLD = 0.25`) ensures the engine prefers returning `UNVERIFIED_LEGAL_FACT` over low-confidence hallucinations.

---

## 2. Catalog Inventory (16 Curated Chunks)

| Chunk ID | Regulatory Authority | Statute / Act | Section / Rule | Title / Scope |
| :--- | :--- | :--- | :--- | :--- |
| `CORP-CA2013-S137` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 137 & Accounts Rules | Annual Financial Statements Filing (Form AOC-4) |
| `CORP-CA2013-S92` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 92 & Mgmt Rules | Annual Return of Company (Form MGT-7 / MGT-7A) |
| `CORP-CA2013-S179` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 179(3) & Meeting Rules | Powers of Board Exercisable at Meetings (Bank Accounts) |
| `CORP-CA2013-S101` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 101 & 102 | Notice of General Meetings (21 clear days / Shorter Notice) |
| `CORP-CA2013-S164` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 164(2) & DIR Rules | Director Disqualification & Form DIR-8 Disclosures |
| `CORP-CA2013-S403` | Ministry of Corporate Affairs (MCA) | Companies Act, 2013 | Section 403 & Fee Rules | Mandatory Late Filing Fees (₹100/day for ROC Returns) |
| `CORP-ITAX-S139` | Central Board of Direct Taxes (CBDT) | Income-tax Act, 1961 | Section 139(1) | Mandatory Corporate Tax Return Filing (Form ITR-6) |
| `CORP-ITAX-S44AB` | Central Board of Direct Taxes (CBDT) | Income-tax Act, 1961 | Section 44AB & Rule 6G | Tax Audit Thresholds & Reports (Form 3CD / 3CA) |
| `CORP-CGST-S37` | CBIC / GSTN | CGST Act, 2017 | Section 37 & Rule 59 | Monthly Outward Supplies Filing (Form GSTR-1) |
| `CORP-CGST-S39` | CBIC / GSTN | CGST Act, 2017 | Section 39 & Rule 61 | Monthly Summary Return & Tax Payment (Form GSTR-3B) |
| `CORP-FEMA-FLA` | Reserve Bank of India (RBI) | FEMA, 1999 | Circular No. 37 | Annual Foreign Liabilities & Assets Return (FLAIR Portal) |
| `CORP-FEMA-FCGPR` | Reserve Bank of India (RBI) | FEMA, 1999 | Regulation 13.1(1) | Foreign Investment Reporting on Share Allotment (SMF) |
| `CORP-DPDP-S08` | MeitY | DPDP Act, 2023 | Section 8 & Section 6 | Data Fiduciary Obligations & Consent Guardrails |
| `CORP-CERTIN-70B` | CERT-In | Information Technology Act, 2000 | Directions u/s 70B(6) | Mandatory 6-Hour Cyber Incident Reporting |
| `CORP-EPFO-S6` | EPFO | EPF Act, 1952 | Section 6 & Scheme Para 38 | Mandatory Monthly Provident Fund Remittance (ECR) |
| `CORP-TM-ACT1999` | IP India (CGPDTM) | Trade Marks Act, 1999 | Sections 9, 11, 18 | Grounds for Trademark Refusal & TM-A Filings |

---

## 3. Retrieval Scoring & Inverted Indexing Engine

The retrieval manager implements:
1. **Tokenization & Stopword Pruning:** Case-folding, punctuation normalization, and legal stopword filtering.
2. **Key Term Boosting:** Direct matches against curated `key_terms` provide a +0.45 weight boost.
3. **Exact Provision Matching:** Exact matches against `section_or_rule` provide a +0.50 weight boost.
4. **TF-IDF Inverted Index:** Calculates term frequency normalized against document frequency across the entire corpus.
5. **Specific Section Guardrail:** If an inquiry explicitly asks about a section (e.g. `Section 999`), candidate chunks for other sections are disqualified. If the requested section is completely absent from the corpus, `can_verify` immediately evaluates to `false`.
6. **Repealed Statute Guardrail:** Queries mentioning repealed statutes (e.g. `FERA, 1973`, `MRTP Act`) trigger automatic refusal explaining the statutory repeal.

---

## 4. Citation Formatting Standard

Every verified answer produces traceable structured citations matching this schema:

```json
{
  "source_id": "SRC-MCA-001",
  "chunk_id": "CORP-CA2013-S137",
  "authority": "Ministry of Corporate Affairs (MCA)",
  "statute": "Companies Act, 2013",
  "section_or_rule": "Section 137 & Companies (Accounts) Rules, 2014",
  "jurisdiction": "IN-CENTRAL",
  "effective_date": "2014-04-01",
  "title": "Filing of Financial Statements with Registrar of Companies (Form AOC-4)",
  "verifiable_reference": "Companies Act, 2013, Section 137 & Companies (Accounts) Rules, 2014 (Ministry of Corporate Affairs (MCA))"
}
```
