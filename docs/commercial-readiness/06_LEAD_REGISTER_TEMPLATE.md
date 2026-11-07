# CraftEgon Corporate Services (CCS)
# Inbound Lead Register Template & Data Dictionary

**Document Reference:** `docs/commercial-readiness/06_LEAD_REGISTER_TEMPLATE.md`  
**Task Reference:** `TASK-CCS-UX-002`  
**Project:** CraftEgon Corporate Services (CCS)  
**Maintained By:** Corporate Services Desk (Kozhikode)  
**Execution Date:** November 2026  
**Final Status:** Complete & Production-Ready  

---

## 1. Operational Overview

This document specifies the internal Lead Register used by CraftEgon Corporate Services to manage, track, and audit all inbound prospective client enquiries arriving from `ccs.craftegon.com`, WhatsApp Business, and direct corporate email.

Because the public platform is deployed as a static edge site without a live SQL backend, this register serves as the authoritative operational record. It can be implemented immediately in a secure internal spreadsheet (Google Sheets or Microsoft Excel) with access restricted to authorized compliance personnel in accordance with the Digital Personal Data Protection (DPDP) Act, 2023.

---

## 2. Lead Register Schema & Data Dictionary

| # | Field Name | Data Type | Required | Description / Valid Values |
| :- | :--- | :--- | :-: | :--- |
| **01** | `Lead_ID` | String | Yes | Unique sequential identifier: `CCS-YYYY-NNNN` (e.g. `CCS-2026-0001`). |
| **02** | `Date_Received` | ISO Date / Time | Yes | Timestamp of initial enquiry receipt (e.g. `2026-11-08 10:15 IST`). |
| **03** | `Channel` | Enum | Yes | `WhatsApp`, `Email`, `Website_Fallback`, `Phone`, `Referral`. |
| **04** | `Prospect_Name` | String | Yes | Full name of the primary contact person. |
| **05** | `Entity_Name` | String | No | Proposed company name, or existing registered entity name. |
| **06** | `Phone_Number` | String (Regex) | Yes | 10-digit mobile number (`^[6-9]\d{9}$`) or international formatted. |
| **07** | `Email_Address` | String (Email) | Yes | Valid email address for quotations and document delivery. |
| **08** | `Location_State` | String | Yes | State/UT for calculating state-specific stamp duty (e.g. Kerala, Karnataka). |
| **09** | `Service_Requested` | String | Yes | Canonical service requested (e.g. `Pvt Ltd Registration`, `DIR-3 KYC`). |
| **10** | `Delivery_Tier` | Enum | Yes | `Tier_1_Direct_Admin`, `Tier_2_CS_CA_Led`, `Tier_3_Advocate_Referral`. |
| **11** | `Qualification_Status` | Enum | Yes | `New`, `Qualified`, `Unqualified`, `Spam`, `Duplicate`. |
| **12** | `Desk_Coordinator` | String | Yes | Internal team member responsible for lead communication. |
| **13** | `Panel_Professional` | String | No | Assigned Practising CS / CA / TM Agent name and membership number. |
| **14** | `Pipeline_Stage` | Enum | Yes | `Logged`, `Contacted`, `Scope_Sent`, `Quoted`, `Paid`, `In_Filing`, `Completed`, `Lost`. |
| **15** | `Statutory_Govt_Fee` | Currency (₹) | No | Exact government filing fees payable to MCA / IP India. |
| **16** | `Professional_Fee` | Currency (₹) | No | CraftEgon / professional panel service fee. |
| **17** | `Total_Quote_Value` | Currency (₹) | No | Sum of government fees and professional fees. |
| **18** | `Statutory_Deadline` | Date | No | Regulatory due date (e.g. `2026-09-30` for DIR-3 KYC). |
| **19** | `Next_Followup_Date` | Date | Yes | Scheduled date for next client touchpoint. |
| **20** | `Outcome_Notes` | Text | No | Filing SRN, rejection reason, or lost lead rationale. |

---

## 3. Operational Lead Register Template (Sample Records)

Below is the production-ready register populated with representative cases across all delivery tiers:

| Lead_ID | Date_Received | Channel | Prospect_Name | Entity_Name | Phone_Number | Email_Address | Location_State | Service_Requested | Delivery_Tier | Pipeline_Stage | Statutory_Govt_Fee | Professional_Fee | Total_Quote_Value | Statutory_Deadline | Next_Followup | Outcome_Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CCS-2026-0001` | 2026-11-08 09:30 | `WhatsApp` | Rahul Menon | NexaByte Labs Pvt Ltd | `9847012345` | `rahul@nexabyte.io` | Kerala | Pvt Ltd Registration | `Tier_2_CS_CA_Led` | `In_Filing` | ₹1,000 | ₹6,999 | ₹7,999 | N/A | 2026-11-10 | SPICe+ Part A approved. Part B signed by CS Ananya (FCS 12345). |
| `CCS-2026-0002` | 2026-11-08 10:45 | `Website_Fallback` | Dr. K. V. Suresh | Malabar Health LLP | `9447198765` | `suresh@malabarmed.in` | Kerala | LLP Registration | `Tier_2_CS_CA_Led` | `Quoted` | ₹1,500 | ₹4,999 | ₹6,499 | N/A | 2026-11-09 | FiLLiP documents drafted; awaiting partner PAN & Aadhaar DSCs. |
| `CCS-2026-0003` | 2026-11-08 11:15 | `WhatsApp` | Sneha Nair | CraftEgon Studio | `9895123890` | `sneha@craftegon.art` | Karnataka | MSME Udyam Registration | `Tier_1_Direct_Admin` | `Completed` | ₹0 | ₹999 | ₹999 | N/A | Completed | Udyam Certificate issued: UDYAM-KR-03-0098765. |
| `CCS-2026-0004` | 2026-11-08 13:20 | `Email` | Rajesh Kumar | Zenith Infra Ltd | `9810054321` | `rkumar@zenithinfra.com` | Delhi | Annual DIR-3 KYC | `Tier_2_CS_CA_Led` | `Completed` | ₹0 (On-time) | ₹1,499 | ₹1,499 | 2026-09-30 | Completed | e-Form DIR-3 KYC certified by CA Pradeep (FCA 45678). SRN: R98765432. |
| `CCS-2026-0005` | 2026-11-08 14:05 | `WhatsApp` | Mohammed Farhan | Farhan Logistics | `9744112233` | `farhan@fl-kerala.com` | Kerala | Trademark Registration | `Tier_2_CS_CA_Led` | `Scope_Sent` | ₹4,500 (MSME) | ₹3,499 | ₹7,999 | N/A | 2026-11-09 | Class 39 search conducted; clear path. TM Agent Code: TMA-9874. |
| `CCS-2026-0006` | 2026-11-08 15:40 | `Phone` | George Thomas | Thomas & Sons Ltd | `9846056789` | `george@thomassons.co` | Kerala | NCLT Oppression & Mismanagement | `Tier_3_Advocate_Referral` | `Completed` | N/A | ₹0 (Referral) | ₹0 | N/A | 2026-11-12 | Referred directly to Adv. V. Ramachandran (K/123/2010). Bar Council non-advocacy disclosure issued. |

---

## 4. Privacy & Data Protection Protocols

In accordance with the DPDP Act, 2023:
1. **Access Control:** This register must be stored on a password-protected, encrypted Google Drive or internal SharePoint drive accessible only by designated desk coordinators.
2. **Data Minimization:** No Aadhaar numbers or bank account credentials are to be stored in the open register; such documents must be maintained in dedicated, access-restricted encrypted folders per client.
3. **Retention & Purging:** Unqualified spam records must be deleted every 30 days. Client records for completed statutory filings must be retained for the mandatory statutory period under the Companies Act (8 years for books/records) and then purged.
