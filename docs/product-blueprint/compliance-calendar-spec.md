# CraftEgon CCS — Autonomous Compliance Calendar OS Specification

**Document ID**: `CRAFTEGON-PROD-006`  
**Classification**: Regulatory Engine & Calendar Product Specification  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Product Overview & Architectural Objectives

The **Autonomous Compliance Calendar OS** is a client-facing statutory deadline forecasting and reminder engine. It calculates mandatory statutory filing dates under the **Companies Act, 2013**, **Income Tax Act, 1961**, **CGST Act, 2017**, and **FEMA, 1999**, customized dynamically to an entity's corporate structure, financial year, and capital bracket.

---

## 2. Business Profile Capture & Statutory Applicability Engine

```
Entity CIN / LLPIN / Profile Input
            │
            ▼
┌───────────────────────────────────────┐
│ STATUTORY CLASSIFICATION MATRIX       │
├───────────────────────────────────────┤
│ • Entity Type: Pvt Ltd / LLP / OPC    │
│ • Paid-Up Capital Slabs (Sec 403)     │
│ • AGM Date (Financial Year End + 6mo) │
│ • Foreign Direct Investment (FEMA)    │
│ • GST Turnover Thresholds             │
│ • Employee Headcount (EPFO/ESIC/POSH) │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│ OBLIGATION DISPATCH & REASONING       │
├───────────────────────────────────────┤
│ Form AOC-4  -> AGM Date + 30 Days     │
│ Form MGT-7  -> AGM Date + 60 Days     │
│ DIR-3 KYC   -> Annual Fixed (Sep 30)  │
│ Form DPT-3  -> Annual Fixed (June 30) │
│ RBI FLA     -> Annual Fixed (July 15) │
│ Form 3CEB   -> Annual Fixed (Oct 31)  │
│ GSTR-9/9C   -> Annual Fixed (Dec 31)  │
└───────────────────────────────────────┘
```

---

## 3. Statutory Obligation Rules & Due-Date Calculation Matrix

| Form / Obligation ID | Governing Statute | Trigger Event / Milestone | Due Date Formula | Applicability Rationale | Penalty for Late Filing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MCA-AOC4** | Sec 137, Companies Act 2013 | Holding of Annual General Meeting (AGM) | $\text{AGM Date} + 30\text{ Days}$ (Typically Oct 30) | All registered Private & Public Limited Companies | ₹100 per day flat penalty with zero upper cap (Sec 403) |
| **MCA-MGT7** | Sec 92, Companies Act 2013 | Holding of Annual General Meeting (AGM) | $\text{AGM Date} + 60\text{ Days}$ (Typically Nov 29) | All registered Private & Public Limited Companies | ₹100 per day flat penalty with zero upper cap |
| **MCA-DIR3KYC** | Rule 12A, Companies (Dir) Rules | Every individual holding an approved DIN | Annually on or before September 30 | Every Director Identification Number holder | Flat ₹5,000 statutory challan penalty & DIN deactivation |
| **MCA-DPT3** | Rule 16, Companies (Deposits) Rules | Close of Financial Year (March 31) | Annually on or before June 30 | Entities having outstanding loans, deposits, or advances | ₹5,000 to ₹50,000 fine on company and defaulting officers |
| **MCA-MSME1** | Sec 405, Companies Act 2013 | Half-Year End (Sep 30 & Mar 31) | October 31 & April 30 | Companies with outstanding MSME dues > 45 days | Upto ₹20,000 on company; ₹1,000/day for continuing default |
| **MCA-INC20A** | Sec 10A, Companies Act 2013 | Date of Company Incorporation | Within 180 Days of Incorporation Date | Companies incorporated post-Nov 2, 2018 having share capital | ₹50,000 on company; ₹1,000/day on directors; RoC strike-off risk |
| **RBI-FLA** | FEMA 1999 (FLAIR Portal) | Close of Financial Year | Annually on or before July 15 | Companies receiving FDI or making Overseas Investments | Compounding proceedings under Section 15 of FEMA 1999 |
| **IT-3CEB** | Sec 92E, Income Tax Act 1961 | International / Specified Domestic Deals | Annually on or before October 31 | Entities with cross-border related party transactions | Flat ₹1,00,000 penalty under Section 271BA |
| **GST-GSTR9** | Sec 44, CGST Act 2017 | Close of Financial Year | Annually on or before December 31 | Regular GST taxpayers with aggregate turnover > ₹2 Cr | ₹200 per day (₹100 CGST + ₹100 SGST) capped at 0.5% turnover |

---

## 4. Extensions, Gazetted Holidays & Circular Tracking

1. **Section 10 of General Clauses Act, 1897**: When the prescribed statutory due date falls on a Sunday or gazetted public holiday, the act shall be considered done if performed on the next working day.
2. **Ministry Extension Handling**:
   - The system supports dynamic `extension_date` and `extension_circular_url` fields.
   - When the MCA issues a General Circular extending AOC-4 or MGT-7 deadlines (e.g. during V3 portal migration), the countdown clock dynamically recalibrates without overwriting the statutory rule version.
3. **Audit Trail**: Every date calculation logs:
   - `calculated_at`: Timestamp of computation.
   - `statutory_rule_version`: e.g. `MCA-FEE-RULES-2014-V3.2`.
   - `confidence`: `VERIFIED_STATUTORY` or `INFERRED_ASSUMPTION`.

---

## 5. Multi-Channel Reminder & Consent Architecture

- **Consent Prerequisite**: No SMS, WhatsApp, or Email alerts may be dispatched without explicit affirmative consent recorded in compliance with the **Digital Personal Data Protection (DPDP) Act, 2023**.
- **Dispatch Schedule**:
  - `T - 30 Days`: Informational Notice (Audit & Board Resolution preparation).
  - `T - 15 Days`: Milestone Warning (Drafting financial disclosures).
  - `T - 7 Days`: Critical Action Alert (Digital Signature token verification).
  - `T - 3 Days`: Emergency Due Date Reminder.
  - `T + 1 Day`: Penalty Incurred Notification with live ₹100/day ticker.
