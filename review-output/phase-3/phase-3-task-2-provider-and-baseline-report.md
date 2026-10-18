# CraftEgon CCS — Phase 3, Task 2: Provider Decision and Local Backend Baseline

**Project:** CraftEgon Corporate Compliance Services (CCS)  
**Document:** Phase 3, Task 2 — Provider Decision and Local Backend Baseline Report  
**Repository:** Local `craftegon-ccs` workspace (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Execution Environment:** Node.js v20.18.0 / Windows (Local development & assessment only)  
**Execution Mode:** Local Baseline & Prototype (0 cloud resources provisioned, 0 production HTML changes, 0 commits, 0 pushes)  
**Date of Assessment:** October 18, 2026  
**Status:** Baseline Completed & Verified Locally — Awaiting User & Managing Partner Review  

---

## Executive Summary

Phase 3, Task 1 established that the CraftEgon CCS production platform is currently a pure static HTML5/CSS3/JavaScript website hosted on Cloudflare Pages with zero active backend runtime. All 22 forms display an in-browser fallback notice directing clients to WhatsApp and email, and all portal and checkout experiences are browser-side simulations.

The objective of **Phase 3, Task 2** is to establish the backend foundation for secure enquiry and lead tracking while strictly preserving the static production frontend. In accordance with task constraints:
1. **Zero Cloud Provisioning:** No external cloud services, managed databases, or third-party accounts were provisioned.
2. **Current Official Evidence:** Verified current official documentation and pricing (as of October 2026) for the preferred managed PostgreSQL/auth candidate (Supabase Pro), self-managed AWS RDS PostgreSQL, and the edge-native fallback (Cloudflare Workers/D1/R2).
3. **Local-Only Prototype Built:** Implemented a dependency-free local lead intake handler in [`src/backend/lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/lead-intake-prototype.js) using native Node.js built-ins (`node:http`, `node:crypto`).
4. **Data Layer Cross-Referencing:** The local handler dynamically validates `service_id` and `vertical_id` directly against the Phase 2 data layer ([`data/service-registry.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/service-registry.json) and [`data/verticals.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/verticals.json)), ensuring invalid or referral-only services cannot be submitted through self-serve intake.
5. **Rigorous Security Controls:** Verified server-side payload size limits (32 KB), RFC 5322 email validation, Indian mobile formatting, bot timing traps, honeypot quarantining, sliding-window rate limiting, idempotency duplicate suppression, masked audit logging, and zero credential leakage.
6. **Automated Testing:** 24 out of 24 automated test assertions pass with 100% success in [`scripts/test-lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/test-lead-intake-prototype.js).
7. **Safe Configuration Template:** Created a non-sensitive configuration template [`..env.example`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/.env.example) and updated `.gitignore` to prevent secret leakage.

---

## 1. Confirmation of Architecture Prerequisites

Reviewing the baseline established in [`review-output/phase-3/phase-3-backend-readiness-assessment.md`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/review-output/phase-3/phase-3-backend-readiness-assessment.md):

### 1.1 Backend Candidate and Fallback
- **Preferred Candidate Recommendation:** Managed PostgreSQL with built-in authentication, Row-Level Security (RLS), and S3-compatible file storage (evaluated using Supabase Pro in AWS Mumbai `ap-south-1`).
- **Secondary Cloud Candidate:** Self-managed AWS RDS PostgreSQL (`db.t4g.micro`/`small`) with AWS S3 Mumbai and custom authentication microservice.
- **Edge-Native Fallback:** Cloudflare Workers + D1 (Serverless SQLite) + R2 Object Storage + Cloudflare Turnstile.
- **Critical Status:** Neither candidate has been formally approved. Both options remain technical recommendations pending partner sign-off on cost, data residency, and operational complexity.

### 1.2 Database and Authentication Requirements
- **Relational Integrity:** Strong ACID compliance, relational foreign keys, schema migrations, and structured JSONB fields for dynamic diagnostic tool outputs.
- **Authentication & RBAC:** Multi-Factor Authentication (MFA / TOTP), session management via HTTP-only Secure SameSite=Strict cookies, and 6 distinct operational roles (`anonymous_visitor`, `lead_prospect`, `authenticated_client_admin`, `client_member`, `ccs_compliance_officer`, `managing_partner`).
- **Tenant Isolation:** Multi-tenant client isolation where client administrators and members can only access their own company's filings, corporate records, and KYC documents.
- **RLS Boundary Principle:** PostgreSQL Row-Level Security (RLS) is an engine-level rule evaluator, not a mathematical guarantee. True isolation requires:
  1. Complete coverage of `USING` and `WITH CHECK` clauses across `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
  2. Complete isolation of the privileged `service_role` superuser key (which bypasses RLS).
  3. Redundant application-layer authorization checks in API handlers.
  4. Automated negative cross-account penetration tests.

### 1.3 Data Location and Third-Party Processing Realities
Under the **Digital Personal Data Protection Act, 2023 (DPDP Act 2023)** and Section 128 of the **Companies Act, 2013**, corporate compliance data, statutory books, and client PII require strict residency oversight:
- **Primary Database Host:** Must be located physically within the Republic of India (AWS Mumbai `ap-south-1`).
- **Sub-Processor & Data-Transit Reality:** Selecting an Indian database host does **not** ensure that 100% of data stays in India:
  1. *Anycast CDN Edge Routing:* Cloudflare edge nodes terminate SSL globally. If Indian edge nodes experience high load or maintenance, TLS sessions may terminate in Singapore or UAE before routing to Mumbai.
  2. *Authentication Identity Services:* Cloud auth providers frequently replicate user identity metadata globally across redundant control planes.
  3. *Transactional Email Relays:* Services like Postmark, Resend, or SendGrid process and relay email bodies across US/EU data centers unless enterprise EU/India data residency add-ons are contracted.
  4. *SMS & WhatsApp Gateways:* Indian DLT-registered SMS gateways (e.g. Jio, Airtel, Gupshup) retain messages locally, but Meta WhatsApp Cloud API routes message payloads through global Meta data centers.
  5. *Error Telemetry:* Sentry or Datadog ingest traces in US/EU regions unless self-hosted or strictly scrubbed of PII.

### 1.4 Environment Separation Architecture
Three isolated deployment tiers must be maintained:
```
+----------------------------------------------------------------------------------------------------+
|                                    ENVIRONMENT SEPARATION TIERS                                    |
+----------------------------------------------------------------------------------------------------+
| Tier 1: Local Development (local-dev)                                                              |
|   - Node.js runtime binding to 127.0.0.1 (e.g. Port 3001)                                          |
|   - In-memory mock stores or local PostgreSQL in Docker container                                  |
|   - Synthetic test data only; zero external cloud network calls                                    |
|   - Configured via .env.local (ignored in .gitignore)                                              |
+----------------------------------------------------------------------------------------------------+
| Tier 2: Staging & Branch Previews (staging-preview)                                                |
|   - Cloudflare Pages preview deployments (*.craftegon-ccs.pages.dev)                               |
|   - Isolated staging PostgreSQL database instance in AWS Mumbai (ap-south-1)                       |
|   - Staging storage bucket for test document uploads (auto-purged weekly)                          |
|   - Mock Razorpay API keys (rzp_test_*) with test payment card numbers                             |
|   - Zero access to production client records; dummy KYC files only                                 |
+----------------------------------------------------------------------------------------------------+
| Tier 3: Production (production)                                                                    |
|   - Production domain (craftegon.com) on Cloudflare Pages edge                                     |
|   - Dedicated production PostgreSQL instance in AWS Mumbai (ap-south-1)                            |
|   - Hardened IP-restricted access for administrative connections                                   |
|   - Daily automated backups + PITR transaction archiving                                           |
|   - Live Razorpay merchant credentials (only activated after formal Partner Approval Gate 2)       |
+----------------------------------------------------------------------------------------------------+
```

### 1.5 Backups, Disaster Recovery, and Estimated Costs
- **Statutory Retention:** Companies Act 2013 (Section 128) requires 8 financial years of statutory books; PMLA requires 5 years post-engagement for KYC; DPDP Act requires unconverted marketing leads to be purged after 90–180 days.
- **Recovery Point Objective (RPO):** < 1 hour for transactional compliance events; < 24 hours for audit/lead logs.
- **Recovery Time Objective (RTO):** < 4 hours for portal services; < 15 minutes for static website failover.

---

## 2. Evidence-Based Provider Comparison

Official documentation, published pricing, and architectural constraints were audited as of **October 2026**.

### 2.1 Provider Comparison Matrix

| Evaluation Criterion | Candidate 1: Managed PostgreSQL + Auth (Supabase Pro) | Candidate 2: Self-Managed Cloud (AWS RDS PostgreSQL) | Fallback: Edge-Native Stack (Cloudflare Workers + D1 + R2) |
| :--- | :--- | :--- | :--- |
| **1. Authentication & Session Security** | **Built-in GoTrue engine.** JWTs, refresh tokens, MFA/TOTP, OAuth, Magic Links. Directly binds session claims (`auth.uid()`) to PostgreSQL RLS policies. | **Custom or AWS Cognito.** Cognito charges $0.0055/MAU after 50k MAUs. Requires writing custom JWT validation middleware and RLS connection session injection (`SET LOCAL app.current_user_id`). | **Custom in Worker code.** D1 has zero built-in user management. Must implement custom JWT validation or use Cloudflare Access (Zero Trust enterprise pricing for external clients). |
| **2. Database Authorization & RLS** | **Native PostgreSQL RLS.** Engine-level policy enforcement (`USING`, `WITH CHECK`). Well-established declarative access control. | **Native PostgreSQL RLS.** Full engine support. Requires connection pooling (RDS Proxy) configured to preserve session variables across pooled connections. | **Application-Layer Only.** D1 is SQLite-based and has **no native RLS**. Every query must manually enforce `WHERE client_id = ?` in JavaScript. Risk of developer error leaking records across clients. |
| **3. Private File Storage** | **Built-in S3-compatible Storage.** Includes declarative RLS on `storage.objects`. Presigned download URLs generated server-side. | **AWS S3 Bucket (Mumbai).** Direct S3 bucket in `ap-south-1`. Secure presigned URLs via AWS SDK v3. Strong encryption at rest (KMS). | **Cloudflare R2.** Native S3-compatible API. **Zero egress fees.** Presigned URLs supported via S3 SDK. |
| **4. Backup & Disaster Recovery** | **7 days daily backups included.** Point-in-Time Recovery (PITR) is a paid add-on starting at ~$100/mo (requires Small compute or higher). | **Built-in automated backups.** Retained 1–35 days at no extra fee within provisioned storage quota. Built-in PITR included in base instance pricing. | **Built-in 30-day Time Travel.** D1 includes point-in-time recovery for 30 days on Workers Paid ($5/mo). R2 supports bucket versioning and lifecycle rules. |
| **5. Data Residency & Sub-Processors** | **AWS Mumbai (`ap-south-1`) selectable on Pro.** Base DB in India. Management console, auth routers, and global CDN may route metadata internationally. Sub-processors require DPDP audit. | **100% Indian Sovereign.** Database, backups, and S3 buckets sit strictly inside AWS Mumbai `ap-south-1`. Zero external metadata routing if VPC is isolated. | **Global Anycast Edge.** Workers and D1 execute on global edge nodes. Regional data boundaries in D1 are currently limited to EU/US; pure India locking requires enterprise plan. |
| **6. Monthly Cost (Expected Usage)** | **~$25 to ~$30 / month.** Base Pro: $25 (includes $10 compute credit covering 1 Micro instance). Upgraded Small compute (2GB RAM): +$5 net. Optional PITR add-on: +$100/mo. | **~$18 to ~$35 / month.** `db.t4g.micro` (~$15.33/mo) or `db.t4g.small` (~$30.66/mo) in Mumbai + 20 GB `gp3` storage (~$2.62/mo) + S3 (~$1/mo). Zero PITR surcharge. | **~$5 / month.** Cloudflare Workers Paid ($5/mo) includes 10M requests, 25B D1 reads, 50M D1 writes, 5 GB D1 storage, 10 GB R2 storage with **$0 egress fees**. |
| **7. Exportability & Migration** | **100% Open-Source PostgreSQL.** Direct `pg_dump` and `pg_restore`. Zero vendor lock-in; can migrate to self-hosted Docker, RDS, or GCP Cloud SQL at any time. | **100% Standard PostgreSQL.** Direct `pg_dump`. Full portability across any cloud or on-premise infrastructure. | **SQLite / S3 Export.** D1 exports to SQLite files (`wrangler d1 export`); R2 uses standard S3 API. Schema migration to Postgres requires type adjustments. |
| **8. Operational Complexity** | **Low to Medium.** Unified dashboard, automated migrations via CLI, integrated auth and storage. Minimal DevOps maintenance. | **High.** Requires configuring VPCs, subnets, security groups, RDS Proxy, IAM roles, custom auth services, and database monitoring. | **Very Low.** Fully serverless, scales to zero automatically, single dashboard with existing Cloudflare Pages frontend. |

### 2.2 Cost Breakdown and Budget Modeling (Expected Usage)

Assuming CraftEgon CCS initial operational volume:
- **Monthly Inquiries:** 500 – 1,500 lead submissions.
- **Active Retainer Clients:** 20 – 50 companies.
- **Document Vault Storage:** 10 – 30 GB of PDF incorporation files, MOA/AOA, and board resolutions.
- **Monthly Active Users (Portal):** 100 – 300 users.

```
+----------------------------------------------------------------------------------------------------+
|                                    ESTIMATED MONTHLY COST BREAKDOWN                                 |
+----------------------------------------------------------------------------------------------------+
| Line Item                    | Candidate 1: Supabase Pro    | Candidate 2: AWS RDS  | Fallback: CF Workers |
+------------------------------+------------------------------+-----------------------+----------------------+
| Base Platform Fee            | $25.00                       | $0.00                 | $5.00                |
| Database Compute             | $0.00 (covered by $10 credit)| $15.33 (db.t4g.micro) | $0.00 (included)     |
| Database Storage (20 GB)     | $1.50 (12 GB overage @ $0.125| $2.62 (gp3 storage)   | $0.00 (5 GB included)|
| Object / Document Storage    | $0.00 (100 GB included)      | $0.50 (S3 Mumbai)     | $0.00 (10 GB included|
| Data Egress Bandwidth        | $0.00 (250 GB included)      | $0.90 ($0.09/GB)      | $0.00 (FREE egress)  |
| Authentication & Users       | $0.00 (100,000 MAUs included)| $0.00 (Cognito free)  | $0.00 (custom)       |
| Automated Backups            | $0.00 (7-day daily included) | $0.00 (included)      | $0.00 (30-day incl.) |
| Point-in-Time Recovery (PITR)| [Optional: +$100.00/mo]      | $0.00 (built-in)      | $0.00 (built-in)     |
+------------------------------+------------------------------+-----------------------+----------------------+
| TOTAL ESTIMATED BASELINE     | $26.50 / month (~₹2,225/mo)  | $19.35 / month (~₹1,625)| $5.00 / month (~₹420) |
| TOTAL WITH MANAGED PITR      | $126.50 / month (~₹10,625/mo)| $19.35 / month (~₹1,625)| $5.00 / month (~₹420) |
+------------------------------+------------------------------+-----------------------+----------------------+
```

### 2.3 Key Evidentiary Findings and Provider Disqualifications
1. **Neon Serverless Postgres Disqualification for Sovereignty:**
   - Official documentation confirms Neon **does not offer an infrastructure region in India (Mumbai / `ap-south-1`)**. The closest available region is Singapore (`ap-southeast-1`), adding 30–50ms round-trip latency and raising regulatory challenges regarding cross-border corporate records under the Companies Act 2013 and DPDP Act 2023. Neon is therefore disqualified as a primary production candidate.
2. **Supabase Pro vs. AWS RDS PITR Trade-off:**
   - Supabase Pro provides the best developer velocity (integrated Auth, S3 storage, and native PostgreSQL RLS), but its managed PITR add-on is expensive for a boutique firm ($100/mo). 
   - *Cost-effective mitigation:* CraftEgon CCS can run Supabase Pro ($25/mo) with its included 7-day daily backups, supplemented by an automated daily `pg_dump` script executing in an Indian cron worker writing encrypted dumps to AWS S3 Mumbai (~$1/mo), avoiding the $100/mo fee while satisfying disaster recovery standards.
3. **Cloudflare D1 Multi-Tenant Isolation Risk:**
   - Cloudflare D1's lack of native Row-Level Security means that tenant isolation depends 100% on application developers remembering to append `WHERE client_id = ?` to every query. In a legal compliance platform handling confidential board minutes, merger agreements, and director KYC, this architectural vulnerability represents a significant risk compared to engine-level PostgreSQL RLS.

**Sources Audited:**
- *Supabase Official Pricing & Limits:* [supabase.com/pricing](https://supabase.com/pricing), accessed October 2026.
- *Supabase Compute & PITR Documentation:* [supabase.com/docs/guides/platform/compute-add-ons](https://supabase.com/docs/guides/platform/compute-add-ons), accessed October 2026.
- *AWS RDS PostgreSQL Pricing (Mumbai ap-south-1):* [aws.amazon.com/rds/postgresql/pricing/](https://aws.amazon.com/rds/postgresql/pricing/), accessed October 2026.
- *Cloudflare Workers, D1 & R2 Pricing:* [developers.cloudflare.com/workers/platform/pricing/](https://developers.cloudflare.com/workers/platform/pricing/), accessed October 2026.
- *Neon Pricing & Regional Availability:* [neon.tech/pricing](https://neon.tech/pricing), accessed October 2026.

---

## 3. Local-Only Backend Architecture Design

To support secure enquiry capture without provisioning cloud services, a complete local-only architecture was designed and tested.

### 3.1 Minimum Lead Record Specification

```json
{
  "id": "c1f7a28b-9e45-42a1-8d2b-63a5e12f8091",
  "lead_reference": "LEAD-2026-8F4A12",
  "created_at": "2026-10-18T05:21:40.125Z",
  "retention_purge_date": "2027-04-16T05:21:40.125Z",
  "status": "NEW",
  "contact_name": "Vikram Malhotra",
  "email": "vikram.m@zenithholdings.co.in",
  "phone": "+91 98201 12345",
  "entity_name": "Zenith Holdings Private Limited",
  "service_id": "V01-SVC-007",
  "vertical_id": "V01",
  "scope_description": "Fast-track corporate incorporation with foreign FDI investment.",
  "source_url": "/services/pvt-ltd-registration.html",
  "consent_recorded": true,
  "ip_hash": "a1b2c3d4e5f67890"
}
```

### 3.2 Lead Submission Lifecycle

```
[ Anonymous Visitor ]
       │
       ▼ (Fills Static Form)
[ Client-Side Sanitization & Honeypot Check ]
       │
       ▼ (POST /api/v1/leads)
[ API Rate Limiter (Max 5 req / 10 min per salted IP hash) ]
       ├── (Exceeded) ───────────────────────────────────► [ HTTP 429 Too Many Requests ]
       │
       ▼ (Within Limits)
[ Payload Size & Content-Type Gate (Max 32 KB, application/json) ]
       ├── (Exceeded / Non-JSON) ────────────────────────► [ HTTP 413 / 415 Error ]
       │
       ▼ (Valid Format)
[ Spam & Bot Screen (Honeypot _hp_website + Timing Token _t_token) ]
       ├── (Bot Flagged) ────────────────────────────────► [ HTTP 200 Silent Quarantine (Zero Lead Created) ]
       │
       ▼ (Human Verified)
[ Schema & Phase 2 Registry Validation (Service ID & Vertical ID) ]
       ├── (Invalid Fields) ─────────────────────────────► [ HTTP 422 Unprocessable Entity ]
       │
       ▼ (Schema Valid)
[ Idempotency Hash Check (SHA-256 over email + service + scope + 15m window) ]
       ├── (Duplicate Found) ────────────────────────────► [ HTTP 200 Duplicate Suppressed (Return Cached Ref) ]
       │
       ▼ (Unique Enquiry)
[ Persist Lead Entity (Status: NEW, Purge Date: +180 Days) ]
       │
       ▼
[ Emit Masked Audit Event (Zero PII, Zero Credentials in Logs) ]
       │
       ▼
[ HTTP 201 Created Response to Client ]
```

### 3.3 Server-Side Security Controls
1. **Payload Size Guard:** Incoming body streams are monitored chunk-by-chunk. If bytes exceed `32,768 bytes` (32 KB), the connection is terminated with `HTTP 413 Payload Too Large`.
2. **Indian Phone Standard:** Phone numbers are cleaned of spaces, parentheses, and dashes, and validated against `/^(\+91)?[6-9]\d{9}$/`.
3. **Data Layer Cross-Validation:** If a submission contains `service_id`, it is checked against the 54 active services in [`data/service-registry.json`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/data/service-registry.json). Referral-only services (`is_referral_only: true` or `record_status: "REFERRAL_ONLY"`) are rejected with an explicit message that referral-only practices require direct partner contact.
4. **Honeypot Trap:** Forms contain a hidden field `_hp_website` (styled `display:none; tabIndex:-1`). If populated by automated autofill bots, the submission is silently quarantined without alerting the bot.
5. **Bot Timing Threshold:** Forms embed a millisecond timestamp token `_t_token`. If submission occurs in less than 2,000ms (2 seconds), it is classified as an automated script and quarantined.
6. **Sliding-Window Rate Limiter:** An in-memory store tracks submission timestamps per salted IP hash (`SHA-256(salt + IP)`). More than 5 submissions within 10 minutes return `HTTP 429 Too Many Requests` with `Retry-After: 600`.
7. **Idempotency & Duplicate Suppression:** Rapid duplicate clicks generate an identical SHA-256 hash across `(email + service_id + scope + 15-minute time bucket)`. The backend returns `HTTP 200` with `status: "DUPLICATE_SUPPRESSED"` and the existing lead reference, preventing duplicate internal notifications.
8. **Masked Audit Logging:** All audit events log structured JSON with masked email (`v***a@zenithholdings.co.in`) and masked phone (`+91 ******2345`). Raw payloads and raw IP addresses are never recorded in logs.

### 3.4 Target API Contract for Static Forms

When forms are eventually connected in Phase 3 Stage 2/3, the contract will be:

- **Endpoint:** `POST /api/v1/leads`
- **Headers:**
  - `Content-Type: application/json; charset=utf-8`
  - `X-CraftEgon-Client: ccs-web-client/1.0`
  - `Idempotency-Key: [optional client-generated UUIDv4]`
- **Request Body:**
  ```json
  {
    "contact_name": "Ananya Deshmukh",
    "email": "ananya.d@deshmukh-advisory.in",
    "phone": "+91 99887 76655",
    "service_id": "V01-SVC-007",
    "vertical_id": "V01",
    "entity_name": "Deshmukh Advisory Services Pvt Ltd",
    "scope_description": "Require statutory secretarial audit and board advisory.",
    "source_url": "/services/pvt-ltd-registration.html",
    "consent_agreed": true,
    "_hp_website": "",
    "_t_token": "1729228800000"
  }
  ```
- **Success Response (`HTTP 201 Created`):**
  ```json
  {
    "success": true,
    "status": "ACCEPTED",
    "lead_reference": "LEAD-2026-B4E9A1",
    "message": "Your compliance inquiry has been securely recorded. A corporate governance associate will reach out within 1 business day.",
    "estimated_response_hours": 24
  }
  ```
- **Duplicate Suppression Response (`HTTP 200 OK`):**
  ```json
  {
    "success": true,
    "status": "DUPLICATE_SUPPRESSED",
    "lead_reference": "LEAD-2026-B4E9A1",
    "message": "A matching enquiry was already received recently. Our compliance desk is reviewing your existing submission.",
    "estimated_response_hours": 24
  }
  ```
- **Validation Error (`HTTP 422 Unprocessable Entity`):**
  ```json
  {
    "success": false,
    "error_code": "VALIDATION_FAILED",
    "message": "Invalid submission payload. Please check input requirements.",
    "details": [
      { "field": "phone", "issue": "Valid 10-digit Indian mobile number required (starting with 6-9, optional +91 prefix)" }
    ]
  }
  ```

---

## 4. Local Prototype Implementation & Automated Test Verification

### 4.1 Prototype Implementation Details
The prototype is implemented in [`src/backend/lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/lead-intake-prototype.js) using 100% native Node.js built-ins (`node:http`, `node:crypto`, `node:fs`, `node:path`).
- Zero new runtime packages added to `package.json`.
- In-memory stores (`rateLimitStore`, `idempotencyStore`, `leadStore`, `auditLog`) handle local verification without touching disk or cloud resources.
- Safe error boundary shields the client from stack traces and internal paths on unexpected errors.

### 4.2 Automated Test Suite Results
The test suite in [`scripts/test-lead-intake-prototype.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/scripts/test-lead-intake-prototype.js) was executed. All **24 assertions passed with zero failures**:

```
======================================================================
CraftEgon CCS - Lead Intake Prototype Automated Test Suite
======================================================================

--- Test Suite 1: Input Validation & Schema Constraints ---
  ✅ PASS: Accepts a fully populated, valid lead submission with Phase 2 service ID (V01-SVC-007)
  ✅ PASS: Accepts a valid minimal submission with only required fields
  ✅ PASS: Rejects submission with missing contact_name
  ✅ PASS: Rejects contact_name exceeding 100 characters
  ✅ PASS: Rejects invalid email format
  ✅ PASS: Rejects invalid Indian phone numbers
  ✅ PASS: Rejects submission without explicit DPDP consent
  ✅ PASS: Rejects unknown service_id not present in Phase 2 registry
  ✅ PASS: Rejects unknown vertical_id not present in Phase 2 verticals
  ✅ PASS: Rejects scope_description exceeding 2000 characters

--- Test Suite 2: Anti-Spam & Automated Bot Detection ---
  ✅ PASS: Detects honeypot trap when _hp_website is populated by bot
  ✅ PASS: Detects bot submission occurring faster than human threshold (<2s)
  ✅ PASS: Allows genuine human submission with empty honeypot and normal speed (>2s)

--- Test Suite 3: Rate Limiting & Idempotency / Duplicate Suppression ---
  ✅ PASS: Enforces rate limiting after 5 requests from the same IP hash within 10m
  ✅ PASS: Suppresses duplicate submission within 15-minute window

--- Test Suite 4: Privacy Protection & Masked Audit Logging ---
  ✅ PASS: Correctly masks email addresses for audit logs
  ✅ PASS: Correctly masks phone numbers for audit logs
  ✅ PASS: Ensures audit log entries contain zero unmasked PII or credentials

--- Test Suite 5: HTTP Protocol, Size Limits & Network Handling ---
  ✅ PASS: Rejects non-POST HTTP methods with 405 Method Not Allowed
  ✅ PASS: Rejects non-JSON Content-Type with 415 Unsupported Media Type
  ✅ PASS: Rejects payloads exceeding 32 KB with 413 Payload Too Large
  ✅ PASS: Rejects malformed JSON with 400 Bad Request and zero stack trace leak
  ✅ PASS: Successfully processes valid HTTP POST submission (201 Created)
  ✅ PASS: Includes strict security headers (nosniff, DENY) on responses

======================================================================
PROTOTYPE TEST RESULTS: 24 passed, 0 failed (24 total assertions)
======================================================================
```

---

## 5. Working Tree Status and Changed Files

```
+----------------------------------------------------------------------------------------------------+
|                                    WORKING TREE & FILE CHANGES                                      |
+----------------------------------------------------------------------------------------------------+
| Created Files:                                                                                     |
|   - .env.example                                      : Safe local configuration template          |
|   - src/backend/lead-intake-prototype.js              : Local-only baseline intake prototype       |
|   - scripts/test-lead-intake-prototype.js             : Automated test suite for lead prototype    |
|   - review-output/phase-3/phase-3-task-2-provider-and-baseline-report.md: This deliverable report |
|                                                                                                    |
| Modified Files:                                                                                    |
|   - .gitignore                                        : Safeguarded .env and .env.* from commits   |
|                                                                                                    |
| Production Code Impact:                                                                            |
|   - Zero changes to HTML files in services/, portal/, conversion/, or index.html                   |
|   - Zero changes to client scripts in assets/js/                                                   |
|   - Zero changes to Phase 2 data files in data/*.json                                              |
|   - Zero cloud resources provisioned or credentials staged                                        |
+----------------------------------------------------------------------------------------------------+
```

All 88 assertions in `node scripts/validate-phase-2-registry.js` continue to pass with 0 errors.

---

## 6. Strategic Decisions Still Requiring Approval

Before proceeding to Phase 3, Task 3 / Stage 2, the following strategic approvals are required from the user and managing partners:

1. **Architecture Candidate Selection:**
   - Formal selection between **Candidate 1 (Supabase Pro with external S3 backup)**, **Candidate 2 (AWS RDS PostgreSQL with Cognito/custom auth)**, or **Fallback (Cloudflare Workers + D1 + R2)**.
2. **Data Residency and Sub-Processor Approval:**
   - Formal sign-off on deploying the primary database in **AWS Mumbai (`ap-south-1`)**, accompanied by approval of the third-party sub-processor audit (Anycast edge routing, transactional email, SMS gateway, telemetry).
3. **Sandbox Payment Integration Authorization:**
   - Formal authorization to configure Razorpay **Sandbox test credentials only** (`rzp_test_*`) for testing webhook signatures and checkout workflows. Live merchant onboarding remains gated.
4. **Commercial Pricing Approval:**
   - Formal sign-off on authoritative commercial service pricing before any price is wired into database schemas or payment orders.
5. **Document Retention Policy Legal Review:**
   - Formal legal sign-off on the 5-tier document retention matrix (Companies Act 8-year books, PMLA 5-year KYC, DPDP 180-day lead purge).

---

*Report prepared and verified locally. Ready for user and partner review.*
