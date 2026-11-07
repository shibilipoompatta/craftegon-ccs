# CraftEgon Corporate Services (CCS)
# Open Questions and Access Dependencies

**Document Reference:** `docs/technical-audit/16_OPEN_QUESTIONS_AND_ACCESS_DEPENDENCIES.md`  
**Audit Date:** November 2026  
**Auditor:** Senior Software Architect & Technical Lead  
**Purpose:** Pre-Launch Operational, Legal & Administrative Decision Register  
**Status:** Requires Business Owner Action Before Production Cutover  

---

## 1. Statutory & Corporate Identity Decisions

| # | Question / Item | Current State in Codebase | Action Required from Business Owner |
| :- | :--- | :--- | :--- |
| **01** | **Official Entity Incorporation** | Disclosed as *"Entity incorporation and statutory filings in progress under the Companies Act, 2013 / LLP Act, 2008"*. | Confirm whether the entity is registered as **CraftEgon LLP** or a Private Limited company. Provide official CIN / LLPIN upon receipt of RoC certificate. |
| **02** | **Physical Operational Desk** | Disclosed as *2nd Floor, Space Mall, Mavoor Road, Kozhikode, Kerala, PIN 673001, India*. | Confirm physical lease/operational agreement and utility bill proof for RoC registered office and GST registration address. |
| **03** | **Brand Naming Consistency** | Standardized across platform as *"CraftEgon Corporate Services — Your Business Infrastructure Partner"*. | Confirm approved trading name and logo trademark application status with IP India. |

---

## 2. Professional Attestation & Network Partnerships

| # | Professional Role | Statutory Mandate | Action Required from Business Owner |
| :- | :--- | :--- | :--- |
| **04** | **Practising Company Secretary (PCS)** | Section 7(1)(b) Companies Act 2013 (SPICe+ Part B) & Section 11(1)(c) LLP Act 2008 (FiLLiP). | Execute formal bilateral Service Level Agreement (SLA) with certified CS partner firm in Kozhikode / Kochi for digital signature token attestation. |
| **05** | **Chartered Accountant (CA)** | Section 44AB Tax Audit & Section 92E Form 3CEB Transfer Pricing. | Identify ICAI member firm for Tier-2 statutory accounting attestations. |
| **06** | **Registered Trade Mark Agent** | Rule 112 Trade Marks Rules 2017 (Form TM-A filing). | Confirm whether trademark applications are filed under an in-house TM agent code or an empanelled IP attorney. |
| **07** | **Advocates Act 1961 Demarcation** | Declared in `about.html`, `legal/disclaimer.html`, and footer that CCS is not a law firm. | Confirm legal counsel review of non-advocacy disclaimers to ensure compliance with Bar Council of India rules. |

---

## 3. Communication Channels & Operational Desk

| # | Communication Channel | Parameter in Codebase | Verification Required |
| :- | :--- | :--- | :--- |
| **08** | **WhatsApp Business Number** | `+91 86069 18247` (`https://wa.me/918606918247`) | Verify that this SIM card is active, registered under WhatsApp Business, and equipped with automated business hours greetings. |
| **09** | **Corporate Email Desk** | `admin@craftegon.com` (`mailto:admin@craftegon.com`) | Verify MX records and inbox access on Google Workspace, Zoho Mail, or Microsoft 365, with daily inbox monitoring. |
| **10** | **Response Service Level Agreement (SLA)** | Displayed as *Monday – Saturday, 9:00 AM – 7:00 PM IST*. | Confirm staff availability to respond to incoming WhatsApp and email consultations within 2–4 hours during business days. |

---

## 4. Technical Access & Hosting Credentials

To deploy and maintain the production website, the following administrative credentials will be required during the deployment gate:

| # | Service / Platform | Required Access Level | Purpose |
| :- | :--- | :--- | :--- |
| **11** | **Cloudflare Dashboard** | Administrator / Pages Access | Verify production deployment triggers, custom domain binding (`ccs.craftegon.com`), and edge caching rules. |
| **12** | **GitHub Repository** | Maintainer / Write Access | Merge approved commits from `main` to trigger automated Cloudflare Pages builds. |
| **13** | **Domain Registrar (DNS)** | DNS Zone Editor | Ensure apex domain `craftegon.com` and `www.craftegon.com` redirect smoothly to `ccs.craftegon.com`. |

---

## 5. Commercial Pricing Approvals

Confirm owner sign-off on the published indicative professional fee schedule:
- **Private Limited Company Incorporation:** ₹7,499 professional fee (+ statutory MCA stamp duty & name approval).
- **LLP Registration:** ₹5,999 professional fee (+ statutory filing fees).
- **MSME Udyam Registration:** ₹999 professional fee (Zero government fees).
- **Annual DIR-3 KYC:** ₹999 professional fee (Zero MCA fees if filed before Sept 30; ₹5,000 late fee thereafter).
- **Trademark Registration:** ₹4,499 professional fee (+ ₹4,500 government fee for individuals/MSMEs).
