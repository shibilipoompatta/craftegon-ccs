# CraftEgon CCS — Phase 6: Operational Ownership Matrix & Integration SLAs

## Executive Summary
This document establishes formal operational ownership, on-call accountability, escalation pathways, and statutory review cadences for all external integrations and platform subsystems comprising CraftEgon CCS.

---

## 1. Live Integration Ownership Matrix

Every third-party adapter, government interface, and storage subsystem has a named primary engineer, a designated secondary engineer, an executive sponsor, and a defined SLA.

| Subsystem / Integration | Category | Primary Engineer | Secondary Engineer | Executive Sponsor | Monitoring Tool | P1 Escalation SLA |
|---|---|---|---|---|---|---|
| **Razorpay Payment Gateway** | Payments & Orders | **FinTech Engineering Lead** (`fintech-lead@craftegon.com`) | Staff Payments Architect | VP of Engineering | `scripts/synthetic-monitor.js` (Check #3) | < 15 minutes |
| **MCA V3 Portal Adapter** | Corporate Governance | **Lead MCA Regulatory Specialist** (`mca-lead@craftegon.com`) | Senior Compliance Officer | Head of Legal & Secretarial | Synthetic Adapter Health | < 30 minutes |
| **RBI FIRMS / FLAIR Adapter** | Foreign Exchange (FEMA) | **FEMA Compliance Officer** (`fema-lead@craftegon.com`) | Cross-Border Operations Lead | Principal Legal Counsel | Synthetic Adapter Health | < 1 hour |
| **GSTN / CBDT Tax Adapter** | Direct & Indirect Taxation | **Tax Systems Architect** (`tax-lead@craftegon.com`) | Senior Chartered Accountant | Financial Controller | Synthetic Adapter Health | < 30 minutes |
| **EPFO Shram Suvidha Adapter** | Labour & Social Security | **Labour Law Specialist** (`labour-lead@craftegon.com`) | Payroll Operations Lead | Head of Human Resources | Synthetic Adapter Health | < 2 hours |
| **IP India Trade Marks Registry** | Intellectual Property | **Registered Trademark Agent** (`ip-lead@craftegon.com`) | IP Paralegal | Partner, IP Practice | Synthetic Adapter Health | < 2 hours |
| **Private Vault Storage (`.vault/`)** | Secure Document Storage | **Lead Security Engineer** (`sec-lead@craftegon.com`) | DevSecOps Specialist | Chief Information Security Officer | Storage Quarantine Monitor | < 15 minutes |
| **Cloudflare Pages (Static Edge)** | Web Edge & Security Headers | **Site Reliability Lead** (`sre-lead@craftegon.com`) | Senior DevOps Engineer | VP of Engineering | Edge Health & Cert Monitor | < 15 minutes |
| **Core Node.js Application Backend** | API Services & Auth | **Backend Systems Lead** (`backend-lead@craftegon.com`) | Senior Node.js Engineer | VP of Engineering | Process Monitor & Health Check | < 15 minutes |
| **Statutory AI Reasoner Gateway** | AI & Regulatory Inference | **AI Governance Lead** (`ai-lead@craftegon.com`) | Applied ML Engineer | Head of Legal Technology | AI Refusal Benchmark Suite | < 30 minutes |

---

## 2. Statutory Content & Regulatory Review Cadence

To prevent regulatory drift, all statutes, rules, forms, fee schedules, and tax thresholds are subjected to scheduled reviews:

| Frequency | Target Subsystems | Scope of Review | Responsible Group |
|---|---|---|---|
| **Bi-weekly** | MCA V3, CBDT & CBIC Portals | Gazette notifications, MCA circulars, GST Council updates, filing deadline extensions | Regulatory Research Desk |
| **Monthly** | Synthetic Monitor & Test Suites | Flakiness audit, synthetic latency trends, sandbox credential rotation | Quality Engineering & SRE |
| **Quarterly** | Service Registry (`data/service-registry.json`) | Full statutory audit of 54 active + 3 referral routes, pricing parity, eligibility criteria | Joint Legal & Product Council |
| **Annually** | Union Budget Statutory Updates | Tax audit limits (Section 44AB), corporate tax brackets, stamp duty revisions | Corporate Legal Department |

---

## 3. Incident Severity Levels & Response Protocols

- **SEV-1 (Critical)**: Payment failure, vault data breach, cross-tenant isolation compromise, or Cloudflare Pages outage. Response: Immediate paging; triage within 15 minutes.
- **SEV-2 (High)**: Regulatory API degradation, incorrect penalty calculation formula, or AI hallucination bypass. Response: Triage within 1 hour; hotfix within 4 hours.
- **SEV-3 (Medium)**: Broken UI layout, minor non-blocking validation discrepancy. Response: Fix within normal sprint cycle.
