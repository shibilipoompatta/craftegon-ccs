# CraftEgon CCS — Security, Privacy & Statutory Legal Governance

**Document ID**: `CRAFTEGON-SEC-001`  
**Classification**: Security, Privacy & Compliance Architecture  
**Version**: 1.0  
**Operating Entity**: CraftEgon Corporate Compliance Services, under **CraftEgon LLP**  

---

## 1. Digital Personal Data Protection (DPDP) Act, 2023 Compliance

CraftEgon CCS operates as a **Data Fiduciary** under India's **Digital Personal Data Protection Act, 2023**. All personal data processing must satisfy the following statutory mandates:

```
┌────────────────────────────────────────────────────────────────────────┐
│ DPDP ACT 2023 COMPLIANCE MANDATES                                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Itemized, Unbundled Consent (Section 6)                             │
│    • Consent notices must be clear, plain language, and revocable.     │
│    • No pre-ticked consent checkboxes.                                 │
│ 2. Purpose Limitation (Section 5)                                      │
│    • KYC/entity data collected solely for statutory e-filing & advice. │
│ 3. Data Principal Rights (Sections 11–14)                              │
│    • Right to Access summary of personal data & processing history.    │
│    • Right to Correction, completion & updating of records.            │
│    • Right to Erasure upon conclusion of statutory retention periods.  │
│ 4. Reasonable Security Safeguards (Section 8)                          │
│    • End-to-end encryption, strict role-based access control (RBAC).   │
│ 5. CERT-In Cyber Incident Reporting                                    │
│    • 6-hour mandatory notification to CERT-In upon security incidents. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bar Council of India & Independent Counsel Legal Firewall

```
┌────────────────────────────────────────────────────────────────────────┐
│ CRAFTEGON CCS PLATFORM (Corporate Secretarial & Compliance Desk)       │
│ • MCA V3 E-Filings (AOC-4, MGT-7, SPICe+, INC-20A, DPT-3)              │
│ • GST & Income Tax Return Prep & Accounting Audits                     │
│ • Commercial Contract Synthesizer & Resolution Drafter                 │
│ • Statutory Calendar Tracking & Fee Calculators                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                    [STATUTORY LEGAL FIREWALL]
           Advocates Act, 1961 & BCI Rules (Rule 36)
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ INDEPENDENT ASSOCIATED LEGAL COUNSEL (Advocates on Record / Counsel)   │
│ • Formal NCLT / NCLAT Petitions (Section 241/242, IBC Sec 7/9/10)      │
│ • High Court Writ Petitions (DIN restoration, de-freezing accounts)   │
│ • Courtroom Litigation, Injunction Hearings & Oral Arguments           │
│ • Privileged Legal Opinions & Contested Dispute Advocacy               │
└────────────────────────────────────────────────────────────────────────┘
```

### Statutory Disclaimer Requirement
Every litigation, dispute, or court-related service page, document output, and footer must display the verified disclaimer:
> *"Statutory Disclaimer & Legal Framework: CraftEgon CCS provides corporate secretarial, compliance, and document drafting infrastructure. All formal legal representation, court appearances, and litigation advocacy are handled exclusively through our panel of independent associated advocates and senior legal counsel under the Advocates Act, 1961."*

---

## 3. Data Security & Cryptographic Standards

| Layer | Security Control | Implementation Standard |
| :--- | :--- | :--- |
| **In Transit** | TLS 1.3 Encryption | Enforced across all HTTP traffic via Cloudflare Pages edge certificates. |
| **At Rest** | AES-256 GCM | Stored client documents, MoA/AoA copies, and DSC metadata encrypted at rest. |
| **Authentication** | Multi-Factor Auth (MFA) | Time-based OTP (TOTP) or SMS/WhatsApp OTP for client portal sessions. |
| **Form Submissions** | Origin & HTTPS Validation | `assets/js/forms.js` enforces same-origin checks and requires verified endpoints. |
| **Zero Code Secrets** | Automated Git Scanning | Continuous CI scanner checks for API keys, database URLs, and private keys. |
| **Access Control** | Role-Based Access (RBAC) | Strict separation between Client, Compliance Associate, CS Partner, and Admin. |

---

## 4. Incident Response & Breach Management SLA

1. **Detection & Triage ($< 1$ Hour)**: Automated alerts from edge logs and database anomaly detection.
2. **Containment ($< 2$ Hours)**: Immediate revocation of compromised API keys and session tokens.
3. **CERT-In Notification ($< 6$ Hours)**: Formally report incident to `incident@cert-in.org.in` in compliance with CERT-In directions of 28 April 2022.
4. **Data Principal Notification**: Transparent communication to affected users with remedial guidance.
