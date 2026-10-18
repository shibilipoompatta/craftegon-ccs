# CraftEgon CCS — Phase 3, Task 1: Backend Architecture and Readiness Assessment

**Project:** CraftEgon Corporate Compliance Services (CCS)  
**Document:** Phase 3, Task 1 — Backend Architecture and Readiness Assessment (Revised Baseline)  
**Repository:** Local `craftegon-ccs` workspace (`c:\Users\shibi\OneDrive\Desktop\craftegon-ccs`)  
**Execution Environment:** Node.js v20.18.0 / Windows (Local assessment only)  
**Execution Mode:** Assessment Only (0 commits, 0 pushes, 0 deployments, 0 Cloudflare modifications)  
**Date of Assessment:** October 18, 2026  
**Status:** Completed Assessment — Awaiting User & Managing Partner Review  

---

## Executive Summary

Phase 2 established an authoritative, schema-validated JSON data layer (`data/*.json`) and service registry (54 active services, 3 referral-only routes, 15 practice verticals) with 142 automated tests passing. However, the production website currently remains a **purely static HTML5/CSS3/Vanilla JS platform deployed on Cloudflare Pages**. 

There is **zero backend runtime currently deployed**. All 22 forms across the repository rely on client-side regex checks and deliberately display an in-browser fallback notice directing clients to WhatsApp and email. The client portal (`portal/dashboard.html`), SaaS subscription checkout (`portal/subscription.html`), and intake flows (`conversion/*.html`) are client-side simulations utilizing browser `localStorage` and timeout stubs. There is no active database, no authentication mechanism, no file upload intake, no email delivery engine, and no payment gateway integration.

The objective of this assessment is to determine the **safest, most cost-effective, and operationally robust backend architecture** to transition CraftEgon CCS from a static marketing and diagnostic portal into a functional corporate governance operating system. 

### Key Assessment Principles & Corrected Constraints:
1. **Candidate Architecture Status:** Managed PostgreSQL with built-in authentication and Row-Level Security (RLS) is evaluated as the **preferred candidate recommendation**, pending formal verification of provider configuration, security posture, actual monthly operational costs, and physical data-location residency.
2. **Provider & Data-Location Realities:** Selecting a primary database region (such as AWS Mumbai `ap-south-1`) does **not** guarantee that every category of data is stored or processed exclusively within India. Edge CDN routing, authentication identity stores, third-party transactional email relays, SMS/WhatsApp gateways, and telemetry pipelines frequently route metadata internationally unless sovereign multi-tenant isolation is contractually verified.
3. **RLS Reality vs. Theoretical Guarantees:** Database Row-Level Security (RLS) is an engine-level rule evaluator, **not a mathematical guarantee of tenant isolation**. Tenant boundaries depend strictly on non-bypassable policy definitions across all operations, rigorous protection of privileged service-role / superuser keys, redundant application-layer authorization, and continuous automated negative cross-account penetration testing.
4. **Payment Gateway as Candidate Only:** Razorpay is evaluated strictly as a **candidate payment provider**. This assessment does **not** authorize merchant onboarding, account creation, live payment processing, or subscription sales. Sandbox integration testing and live merchant activation are distinct milestones requiring separate, explicit approvals.
5. **Preservation of Unapproved Pricing:** All 54 pricing records in `data/pricing.json` remain unapproved baseline figures. Website-captured amounts must **never** be used as authoritative checkout prices until formal commercial pricing approval is recorded by the managing partners.
6. **Category-Specific Retention Matrix:** Blanket document-retention proposals are replaced with a structured **document-category retention matrix** separating statutory retention obligations (e.g. Companies Act Section 128) from DPDP Act 2023 data-minimization, lead-purge, and client-deletion rights, subject to formal legal review.
7. **Explicit Status of Security Controls:** All advanced security mechanisms — including malware scanning, automated backups, disaster recovery, access control, audit trails, and privacy procedures — are explicitly marked as **PROPOSED / PLANNED ONLY**. They do not exist today and offer zero protection until implemented and verified by automated tests.

---

## 1. Verified Current-State Inventory (Baseline Audit)

A thorough inspection of all repository assets was performed. All findings are verified against physical repository code:

```
+----------------------------------------------------------------------------------------------------+
|                               CRAFTEGON CCS CURRENT REPOSITORY STACK                                |
+----------------------------------------------------------------------------------------------------+
  Frontend Layer      : Pure Static HTML5 (57 service pages, 15 vertical hubs, 19 diagnostic tools)
  Styling Engine      : Vanilla CSS3 using custom token architecture (tokens.css, theme.css, portal.css)
  Client Scripting    : Vanilla ES6+ JavaScript (5 files: config.js, navigation.js, forms.js,
                        calculator.js, chat-widget.js)
  Deployment Target   : Cloudflare Pages edge hosting (configured via _redirects)
  Active Backend      : NONE (Zero serverless functions, zero API routes, zero server daemons)
  Active Database     : NONE (Phase 2 JSON files are static data files on disk, not an active DB)
  Active Auth         : NONE (Zero user accounts, zero sessions, zero cookies, zero JWT tokens)
  Active Storage      : NONE (Zero cloud storage buckets, zero upload handlers, zero file inputs)
  Active Payments     : NONE (Zero payment gateway SDKs, zero webhooks, zero live pricing APIs)
  Active Email Engine : NONE (All links are mailto: protocols to admin@craftegon.com)
  Environment Secrets : NONE (Zero .env files, zero process.env references in client scripts)
  Automated Testing   : 142 passing assertions across 8 validator suites and 7 CI scripts (npm test)
+----------------------------------------------------------------------------------------------------+
```

### 1.1 Form Inventory & Submission Handling
An exhaustive audit of the repository discovered **22 forms**:
- **16 General & Diagnostic Lead Forms (`.if-lead-form`):** Located across `conversion/` (`contract-intake`, `cross-border-retainer`, `csr-audit-form`, `dispute-consultation`, `dpdp-audit-request`, `fema-consultation`, `hr-audit`, `license-qualification`, `ma-advisory-enquiry`, `post-incorporation-checkout`, `retainer-desk`, `secretarial-audit-scope`, `strike-off-checker`, `tax-intake`, `trademark-search`, `venture-deal-booking`) and `services/pvt-ltd-registration.html`.
- **1 AI Document Generator Form:** `conversion/ai-document-generator.html` (`id="ai-drafter-form"`).
- **1 Statutory Fee Calculator Form:** `conversion/calculator.html` (`id="estimator-form"`).
- **1 AI Chat Widget Input Form:** `assets/js/chat-widget.js` (`id="cchat-form"`).
- **1 Entity CIN Lookup Form:** `portal/dashboard.html` (`id="cin-lookup-form"`).
- **1 Subscription Checkout Modal Form:** `portal/subscription.html` (`id="checkout-form"`).

**Verified Form Submission Mechanism:**
In [`assets/js/forms.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/forms.js#L43-L47), form submission checks for a `data-endpoint` attribute on the `<form>` element.
- **Current State:** **100% of forms have `data-endpoint: undefined`**.
- **Execution Flow:** Because no endpoint is defined, `forms.js` immediately halts network transmission and calls `showFormFallbackNotice()`, displaying a prominent yellow institutional alert:
  > *"Submission Notice: Online form transmission to a backend server is not active in this static environment. Details entered in this form are not stored or transmitted to CraftEgon CCS."*
- It then renders prefilled direct engagement links to WhatsApp (`+91 86069 18247`) and Email (`admin@craftegon.com`).
- **If an endpoint were configured:** `forms.js` validates that the URL matches `window.location.origin` and uses `https:` before issuing a `POST` request with JSON body.

### 1.2 Portal, Checkout & Document Intake Simulations
- **Client Portal & Compliance Calendar ([`portal/dashboard.html`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/portal/dashboard.html)):**
  - CIN / LLPIN calibration is a client-side simulation. Entering a CIN triggers a 650ms `setTimeout` that matches hardcoded sample profiles (e.g. *CraftEgon Technologies Pvt Ltd*, *Malabar Ventures LLP*) and runs local countdown timers in browser memory.
  - The interface prominently states: *"Demo & Reference Mode: Deadlines and entity profiles shown are simulated demonstrations... This interface does not connect to, query, or live-sync with the MCA V3 portal."*
- **SaaS Subscription Checkout ([`portal/subscription.html`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/portal/subscription.html)):**
  - Displays monthly/annual billing toggles for Starter (₹1,499/mo), Growth (₹4,999/mo), and Enterprise (₹14,999/mo).
  - Clicking "Stage Retainer & Launch Sandbox" executes `handleCheckoutSubmit()`, which writes `selectedTierName` and `company` to browser `localStorage` and redirects to the dashboard after a 950ms timer.
  - States: *"Sandbox demonstration: No card or bank account will be charged. Payment gateway integration is staged..."*
- **Document Intake & File Uploads:**
  - Pages like `conversion/contract-intake.html` state *"Upload your agreement draft or specify your custom drafting requirements..."*, but **contain zero `<input type="file">` elements**. The form only captures text inputs (`entity_name`, `contract_type`, `scope`, `contact_name`, `phone`, `email`).
  - There is currently no file upload mechanism anywhere in the repository.
- **AI Chat Widget ([`assets/js/chat-widget.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/chat-widget.js)):**
  - Executes completely in-browser (<15KB) using a hardcoded keyword index array (`const KB = [...]`). It requires zero backend API calls or external LLM tokens.

### 1.3 Hosting & Edge Infrastructure Evidence
- **Cloudflare Pages:** The presence of [`_redirects`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/_redirects) (with rewrite rules `/portal/* /portal/:splat 200` and fallback `/* /404.html 404`) and documentation in `README.md` confirms that Cloudflare Pages is the established production deployment target.
- **Serverless Workers / Functions:** There are currently **no Cloudflare Workers or Pages Functions** in the repository (`functions/` directory does not exist, and no `wrangler.toml` exists).

### 1.4 Phase 2 Data Layer Constraints
- The seven JSON datasets in `data/` (`verticals`, `sources`, `service-registry`, `pricing`, `eligibility`, `jurisdiction-variations`, `regulatory-claims`) represent a validated local relational model.
- **Crucial Boundary:** Across all 153 transactional records, **exactly 0 records are marked as verified**. All 54 pricing records are marked `UNVERIFIED` baseline figures (pending partner sign-off), 20 regulatory claims are rejected marketing statements, and 15 statutory claims are pending legal counsel review. 
- **Rule:** The backend cannot treat these files as an authoritative, commercially approved production database without formal sign-offs. In particular, captured amounts cannot be used as live checkout prices.

---

## 2. End-to-End Customer Journey & Trust Boundaries

The target operational architecture must securely orchestrate a 10-stage lifecycle from anonymous visitor enquiry to recurring enterprise compliance retainer:

```
[VISITOR / PUBLIC CLIENT]                [AUTHENTICATED CLIENT]                    [INTERNAL STAFF DESK]
         │                                         │                                         │
   (1) Submit Enquiry                             │                                         │
         │                                         │                                         │
         ▼                                         │                                         │
   [Public API Gateway]                            │                                         │
         │                                         │                                         │
   (2) Validate & Store Lead                       │                                         │
         │                                         │                                         │
         ▼                                         │                                         │
   ┌──────────────┐                                │                                   (3) Review & Assign
   │  leads table │─────────────────────────────────────────────────────────────────────────►│
   └──────────────┘                                │                                         │
         │                                         │                                   (4) Convert to Case
         ▼                                         │                                         │
   ┌──────────────┐                                │                                         │
   │  cases table │◄─────────────────────────────────────────────────────────────────────────┘
   └──────────────┘                                │
         │                                         │
         │ (5) Magic Link / OTP                    ▼
         └─────────────────────────────────► Authenticate
                                                   │
                                             (6) Upload Docs (Presigned S3/R2 URL)
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │ Private R2   │◄─── (7) Review & Progress Case
                                            └──────────────┘           (Audit History)
                                                   │
                                             (8) Checkout Service
                                                   │
                                                   ▼
                                            [Candidate Gateway]
                                                   │
                                             (9) Webhook (HMAC)
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │ orders table │
                                            └──────────────┘
                                                   │
                                             (10) View Active
                                                  Retainer / Records
```

### Detailed Stage Mapping & Failure Modes

| Stage | Action / Lifecycle State | Primary Actor | Data Invariants & Trust Boundary | Failure Modes & Recovery Workflows |
| :--- | :--- | :--- | :--- | :--- |
| **1. Visitor Enquiry** | Submits form (`.if-lead-form` or diagnostic intake). | Anonymous Visitor | Public untrusted input. TLS encryption in transit. | Form field validation errors; network drop; duplicate button clicks. *Mitigation:* Client validation + button lock. |
| **2. Lead Processing** | Server validates schema, rate limits, and inserts into DB. | Backend API | Sanitized payload inserted into `leads` table with status `NEW`. | Spam floods, bot attacks, DB down. *Mitigation:* Cloudflare Turnstile verification + IP rate limits (5 req/10m) + exponential backoff. |
| **3. Staff Assignment** | Internal desk reviews lead and assigns case manager. | Authorized Staff | Role-based access control (RBAC). Staff view only assigned queue. | Lead unassigned/neglected. *Mitigation:* Automated SLA alert via internal channel after 2 hours. |
| **4. Case Conversion** | Qualified lead converts to an active compliance Case. | Senior CS / Partner | Lead links to `cases` table with unique Case ID and assigned Service ID. | Invalid Service ID or duplicate case. *Mitigation:* Foreign key validation against `service-registry.json`. |
| **5. Client Authentication** | Customer receives portal invite; logs in via OTP/Magic Link. | Client User | Passwordless Auth. HttpOnly, Secure, SameSite=Strict session cookie. | Email delivery delay, expired token, phishing. *Mitigation:* 15-minute token expiry, rate-limited auth endpoints. |
| **6. Secure Document Intake** | Client uploads required KYC / financial docs. | Client User | Direct-to-bucket upload via short-lived presigned PUT URL. Zero public bucket access. | Malicious file, mime spoofing, file >10MB, network drop. *Mitigation:* Whitelist (`.pdf`, `.jpg`, `.png`), magic-number verification, antivirus scan before marking `CLEAN`. |
| **7. Milestone Updates** | Staff updates filing status (e.g. `MCA_FILED`, `APPROVED`). | Assigned Staff | All updates log to immutable `case_status_history` table with user attribution. | Missing audit trail, client unaware of status. *Mitigation:* Enforce DB trigger logging + transactional notification dispatch. |
| **8. Service / Retainer Checkout** | Client selects retainer tier or one-time statutory filing. | Client User | Server generates order using formally approved server pricing (never unverified Phase 2 amounts). | Price tampering, abandoned checkout. *Mitigation:* Server-side order creation; client cannot specify amount. |
| **9. Payment Confirmation** | Payment gateway posts signed webhook event. | Candidate Gateway | Server verifies HMAC-SHA256 signature; idempotent processing via Event ID. | Webhook dropped, signature mismatch, replay attack. *Mitigation:* Reject invalid signatures; deduplicate against `payment_events`; polling fallback. |
| **10. Ongoing Governance** | Client and staff view compliance status, invoices, and docs. | Client & Staff | Server-side authorization + RLS: Clients access ONLY their own records. | Insecure Direct Object Reference (IDOR). *Mitigation:* Defense-in-depth authorization + automated cross-account penetration tests. |

---

## 3. Architecture Options Evaluation & Candidate Recommendation

We evaluated three potential backend architectures against the specific realities of the CraftEgon CCS platform:

### 3.1 Architecture Comparison Matrix

| Evaluation Criterion | Option A: Cloudflare Edge-Native (Pages Functions + D1 + R2) | Option B: Managed Backend (Managed PostgreSQL + R2/S3) — **RECOMMENDED CANDIDATE** | Option C: Custom Dedicated Backend (Node.js/Fastify on AWS ECS / Cloud Run) |
| :--- | :--- | :--- | :--- |
| **Core Components** | Cloudflare Pages Functions (TypeScript), D1 (SQLite at edge), R2 Storage, Cloudflare Access / Turnstile. | Cloudflare Pages (Frontend) + Managed PostgreSQL (with RLS, Auth, S3-compatible Storage) in AWS Mumbai (`ap-south-1`). | Cloudflare Pages (Frontend) + Custom Node.js/Fastify container on Google Cloud Run + Cloud SQL PostgreSQL + GCS. |
| **Data Integrity & Authorization** | **Moderate.** D1 is SQLite; lacks native database-level Row-Level Security. Multi-tenant isolation must be enforced exclusively in edge application code. | **High (with verification).** Relational PostgreSQL with declarative Row-Level Security (RLS) policies. Requires privileged-key protection and server-side checks. | **Moderate to High.** Relational PostgreSQL, but multi-tenant authorization logic must be hand-coded in API middleware. |
| **Document Security & Storage** | **Excellent.** Cloudflare R2 provides S3-compatible private buckets with zero egress fees and presigned PUT URLs. | **Excellent.** Private Cloudflare R2 or S3 bucket with short-lived presigned URLs and private ACLs. | **Good.** Private S3/GCS bucket; requires custom presigned URL generation and IAM policy configuration. |
| **Authentication Engine** | Requires building custom JWT / WebAuthn handling or integrating an external auth service. | **Integrated.** Native passwordless OTP, magic links, session management, and RBAC integrated directly with PostgreSQL identities. | Requires implementing complete auth stack (bcrypt, JWT rotation, session store, password reset funnels). |
| **Operational Complexity** | **Low.** Zero server maintenance; edge deployment managed via Git. | **Low.** Managed database, managed auth, automated daily snapshots, web dashboard for operational support. | **Highest.** Requires container build pipelines, Dockerfile maintenance, cluster sizing, VPC peering, SSL management. |
| **Monthly Baseline Cost** | **Lowest.** Free to ~$5–$15/month (Cloudflare Workers Paid plan). Zero egress fees. | **Low.** ~$25/month for managed tier (automated daily snapshots, 8GB DB, 100GB storage). Requires usage monitoring. | **Moderate to High.** ~$45–$90/month minimum (Cloud Run + Cloud SQL instance + Cloud NAT + VPC connector). |
| **Vendor Lock-in & Portability** | **Moderate.** D1 has specific SQLite dialect quirks. Exporting requires custom migration scripts. | **Lowest.** Standard PostgreSQL (`pg_dump` compatible). Can be migrated to standard AWS RDS or local server anytime. | **Lowest.** Standard Docker container and standard PostgreSQL database. |
| **Network Latency in India** | Edge POPs in Mumbai, Delhi, Chennai, Bangalore (<10ms edge execution). | Database hosted in AWS Mumbai (`ap-south-1`) (~25–40ms from Indian clients via Cloudflare CDN). | Cloud Run / Cloud SQL in Mumbai region (`asia-south1`) (~30–50ms). |

### 3.2 Candidate Recommendation: Option B (Managed PostgreSQL with Auth & RLS)

**Candidate Status:** Managed PostgreSQL with built-in authentication and Row-Level Security (RLS) is **recommended as the preferred candidate architecture**, pending formal partner verification of the following four areas:
1. **Configuration Verification:** Ensuring connection pooling (PgBouncer/Supavisor), SSL enforcement (`sslmode=require`), and strict superuser/service-role key segregation.
2. **Security Posture & Negative Testing:** Establishing automated cross-tenant security test suites in CI before staging real data.
3. **Cost Predictability:** Confirming baseline monthly tiers (~$25/mo) and bandwidth/storage overage limits.
4. **Data-Location Residency & Sub-Processor Audit:** Conducting a formal audit of where each data category is processed and stored (see Section 3.3).

**Technical Rationale:**
- **Standardized Relational Architecture:** Legal compliance and corporate governance require strict referential integrity across entities, cases, filings, and statutory deadlines. PostgreSQL provides robust relational constraints, foreign keys, and transaction atomicity (ACID).
- **Declarative Access Policies:** RLS enables declarative policy definition at the schema level, providing a critical layer of defense-in-depth behind application-level authorization.
- **Data Portability:** Complete freedom from proprietary database lock-in. The entire schema and audit log can be extracted at any time via standard `pg_dump`.

### 3.3 Critical Data-Location & Regional Processing Boundaries

A critical requirement of this assessment is addressing geographic data sovereignty:

> **Important Notice on Data Residency:** Selecting an Indian deployment region (such as AWS Mumbai `ap-south-1`) for the primary database does **NOT** guarantee that every category of data is stored or processed exclusively within India.

The technical architecture must account for the following data-flow realities:
- **Global Edge & CDN Caching:** Cloudflare Pages routes public web traffic through its global Anycast network (over 300 cities worldwide). While Indian users hit Indian POPs (Mumbai, Delhi, Chennai, Bangalore), global visitors or routing failovers may process HTTP request headers outside India.
- **Authentication & Identity Metadata:** Managed backend providers may process authentication tokens, OAuth exchanges, or passwordless login metadata through globally distributed control planes unless a dedicated single-region enterprise tenancy is verified.
- **Transactional Email & Notification Relays:** Third-party transactional email providers (e.g., Postmark, Resend, SendGrid) and SMS/WhatsApp business API providers frequently process or store message logs, recipient email addresses, and subject lines in US or EU data centers.
- **Application Telemetry & Error Tracking:** Logging and monitoring pipelines (e.g., Sentry, Datadog) typically ingest stack traces, client IP addresses, and diagnostic metadata into overseas multi-tenant clusters.
- **Compliance Action Required:** Before handling sensitive customer records or filing documents, a formal **Sub-Processor and Data Residency Review** must be conducted under the DPDP Act 2023 to catalog every external API, verify data processing agreements (DPAs), and ensure appropriate customer consent notices are displayed.

### 3.4 Realistic Row-Level Security (RLS) Boundaries

> **Realistic Boundary:** Database Row-Level Security (RLS) is an engine-level rule evaluator, **not a mathematical guarantee of tenant isolation**.

RLS does **not** provide absolute security on its own. Total tenant isolation is an operational property that depends strictly on four non-negotiable technical controls:
1. **Exhaustive Policy Coverage:** Policies must explicitly cover all four database operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) with both `USING` (read filter) and `WITH CHECK` (write validation) clauses. A missing clause on `INSERT` or `UPDATE` will allow an authenticated user to write or reassign records to another tenant.
2. **Strict Privileged-Key Segregation:** Backend application code and edge workers must connect using the standard authenticated user context (`authenticated` role). The database superuser or `service_role` key **bypasses all RLS policies unconditionally**. If backend API handlers use the service-role key for general queries, RLS is rendered 100% inert.
3. **Redundant Server-Side Authorization:** API endpoints must perform independent authorization checks (defense-in-depth) before querying the database, rather than relying solely on database error triggers.
4. **Mandatory Automated Negative Testing:** The CI pipeline must run automated **negative cross-account penetration tests** (e.g., User A attempts to read, modify, or delete User B's cases and documents, asserting that the database returns 0 rows or HTTP 403 Forbidden). RLS cannot be considered functional until these negative tests pass.

---

## 4. Minimum Server-Side Data Models & Proposed Security Controls

### 4.1 Relational Data Model Schema (PostgreSQL DDL Blueprint)

```sql
-- 1. User Profiles & Accounts (Mapped to Auth Identity)
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    cin_llpin TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'STAFF_ASSOCIATE', 'STAFF_CS', 'PARTNER_ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Leads & Diagnostic Enquiries
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    entity_name TEXT,
    service_id TEXT, -- References approved Phase 2 ID (e.g. V01-SVC-001)
    vertical_id TEXT, -- References approved Vertical (V01 - V15)
    intake_type TEXT NOT NULL DEFAULT 'GENERAL_ENQUIRY',
    form_payload JSONB DEFAULT '{}'::jsonb, -- Raw form metadata (e.g. turnover, capital)
    funnel_source TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED', 'REFERRAL_ONLY')),
    assigned_to UUID REFERENCES public.accounts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Compliance Cases & Client Engagements
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL, -- e.g. CCS-2026-0001
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES public.leads(id),
    service_id TEXT NOT NULL, -- Strict Phase 2 Service ID validation
    vertical_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'INTAKE_PENDING' CHECK (status IN (
        'INTAKE_PENDING', 'DOCUMENTS_AWAITING_REVIEW', 'DRAFTING', 
        'PCS_CERTIFICATION', 'MCA_FILED', 'COMPLETED', 'CANCELLED'
    )),
    assigned_staff_id UUID REFERENCES public.accounts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Case Status Audit History (Immutable)
CREATE TABLE public.case_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.accounts(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Private Documents & Upload Metadata
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.accounts(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'image/jpeg', 'image/png')),
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes <= 10485760), -- 10MB Limit
    storage_path TEXT UNIQUE NOT NULL, -- Path in private R2/S3 bucket
    checksum_sha256 TEXT NOT NULL,
    virus_scan_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (virus_scan_status IN ('PENDING', 'CLEAN', 'INFECTED')),
    access_classification TEXT NOT NULL DEFAULT 'CONFIDENTIAL' CHECK (access_classification IN ('CONFIDENTIAL', 'RESTRICTED')),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Commercial Orders & Invoices
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. ORD-2026-0001
    account_id UUID NOT NULL REFERENCES public.accounts(id),
    case_id UUID REFERENCES public.cases(id),
    service_id TEXT NOT NULL,
    pricing_id TEXT, -- References data/pricing.json (ONLY after commercial approval)
    currency TEXT NOT NULL DEFAULT 'INR',
    base_amount NUMERIC(12, 2) NOT NULL CHECK (base_amount >= 0),
    gst_rate NUMERIC(4, 2) NOT NULL DEFAULT 18.00,
    gst_amount NUMERIC(12, 2) NOT NULL CHECK (gst_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Recurring Retainer Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id),
    tier_name TEXT NOT NULL CHECK (tier_name IN ('STARTER', 'GROWTH', 'ENTERPRISE')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
    gateway_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Gateway Webhook Events (Idempotency Register)
CREATE TABLE public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_event_id TEXT UNIQUE NOT NULL, -- Gateway Event ID (e.g. evt_xxxx)
    gateway_order_id TEXT,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (processed_status IN ('PROCESSED', 'IGNORED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Comprehensive Audit Trail
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.accounts(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 Proposed Row-Level Security (RLS) Policy Specifications

```sql
-- Enable RLS across all customer tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Customer Policy: Users can only read/update their own profile
CREATE POLICY "Customer profile access" ON public.accounts
    FOR ALL USING (auth.uid() = id);

-- Customer Policy: Users can only read cases belonging to their account
CREATE POLICY "Customer case view" ON public.cases
    FOR SELECT USING (auth.uid() = account_id);

-- Customer Policy: Users can only access documents linked to their own cases
CREATE POLICY "Customer document access" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cases 
            WHERE cases.id = documents.case_id 
            AND cases.account_id = auth.uid()
        )
    );

-- Staff Policy: Internal Staff with role 'STAFF_ASSOCIATE' / 'STAFF_CS' / 'PARTNER_ADMIN' have full access
CREATE POLICY "Staff full access" ON public.cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = auth.uid() 
            AND accounts.role IN ('STAFF_ASSOCIATE', 'STAFF_CS', 'PARTNER_ADMIN')
        )
    );
```

### 4.3 Proposed vs. Implemented Security Controls

To maintain complete audit integrity, the table below explicitly distinguishes controls currently active in the repository from planned controls:

| Security Control Category | Implementation Status in Repository | Technical Specification & Operational Requirement |
| :--- | :---: | :--- |
| **Client-Side Field Validation** | **IMPLEMENTED** | Validates email format and 10-digit mobile number via regex in [`assets/js/forms.js`](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/assets/js/forms.js). |
| **Direct Engagement Fallback Notice** | **IMPLEMENTED** | When `data-endpoint` is missing, renders institutional warning and direct WhatsApp/Email links. |
| **Server-Side Input Sanitization** | **PROPOSED / PLANNED** | Schema validation and SQL parameterization to prevent injection attacks on backend receipt. |
| **Bot Protection (Cloudflare Turnstile)**| **PROPOSED / PLANNED** | Pass and verify `cf-turnstile-response` tokens on public enquiry endpoints. |
| **API Rate Limiting** | **PROPOSED / PLANNED** | Limit lead submissions (5/10m per IP) and OTP requests (10/hour per email). |
| **Session Cookie Security** | **PROPOSED / PLANNED** | Issue `HttpOnly`, `Secure`, `SameSite=Strict` session cookies with 12h absolute expiry. |
| **Presigned Private Storage Intake** | **PROPOSED / PLANNED** | Direct streaming to private R2/S3 bucket via short-lived presigned PUT URLs (zero public read). |
| **Asynchronous Malware Scanning** | **PROPOSED / PLANNED** | Antivirus scan (ClamAV/VirusTotal hook) verifying files before staff review. |
| **Row-Level Security (RLS)** | **PROPOSED / PLANNED** | Database-level tenant filtering; requires passing automated cross-account penetration tests. |
| **Automated Database Backups** | **PROPOSED / PLANNED** | Daily automated snapshots + Point-in-Time Recovery (PITR) with secondary encrypted cloud storage. |
| **Disaster Recovery Runbook** | **PROPOSED / PLANNED** | Documented and tested restore procedures with verified RTO (<4h) and RPO (<1h). |
| **Audit Logging Engine** | **PROPOSED / PLANNED** | Immutable trigger-based logging of all case milestone modifications and privileged access. |
| **DPDP Privacy & Deletion Workflows** | **PROPOSED / PLANNED** | Purpose limitation notices, consent records, and automated lead purging. |

> **Strict Boundary:** Sensitive client records, financial statements, and corporate documents must **never** be accepted or uploaded until the presigned storage pipeline, antivirus scanning, and RLS policies are built, deployed, and proven functional via automated tests.

### 4.4 Document-Category Retention Matrix (Replacing Blanket Policy)

Under Indian corporate law and data protection regulations, a blanket retention period is legally inappropriate. Statutory record-keeping obligations under the Companies Act 2013 must be balanced against data-minimization mandates under the Digital Personal Data Protection (DPDP) Act 2023.

The following **Document-Category Retention Matrix** establishes the proposed operational schedule, **subject to formal legal counsel sign-off**:

| Document / Data Category | Governing Legal Basis | Proposed Retention Period | Post-Retention Action | Data Minimization & Privacy Safeguards |
| :--- | :--- | :--- | :--- | :--- |
| **Statutory Corporate Registers & Filings** (AOC-4, MGT-7, Minutes, Register of Members) | Section 128(5) & Section 88, Companies Act 2013 | **8 Financial Years** from completion of the relevant financial year (Permanent for core incorporation deeds/minutes). | Secure Archival in encrypted cold storage or permanent secretarial retention. | Access restricted strictly to Partner Admins and assigned CS professionals. |
| **Client KYC & Identification Documents** (Director PAN, Aadhaar, Passport, Address Proofs) | Prevention of Money Laundering Act (PMLA) & statutory KYC guidelines | **Duration of Active Retainer + 5 Years** following engagement termination. | Cryptographic erasure / permanent deletion of file blobs and checksums. | Redact national identifiers where statutory filing does not require full unmasked display. |
| **Commercial Drafts & Contract Review Files** (Working drafts, redlines, preliminary negotiations) | Limitation Act 1963 (3-year contractual claim limitation period) | **Final Execution / Closing + 3 Years**, unless litigation or dispute is formally notified. | Purged from active bucket; final executed copy transferred to corporate register. | Ephemeral working drafts purged after agreement execution. |
| **Unqualified / Disqualified Lead Enquiries** (General contact submissions, dropped diagnostic funnels) | DPDP Act 2023 (Purpose Limitation & Data Minimization) | **90 to 180 Days** from submission date for business follow-up. | Automated automated scheduled purge from `leads` table. | Explicit notice displayed on intake form; consent withdrawal respected immediately. |
| **Payment Records & GST Invoices** (Transaction logs, tax invoices, credit notes) | Central Goods & Services Tax (CGST) Act 2017 & Income Tax Act 1961 | **8 Years** following the end of the relevant tax assessment year. | Tax archive storage; sanitized of card/banking transit metadata. | Retain tax invoice and SAC codes; zero raw payment credential storage. |

---

## 5. Payment Gateway Candidate Evaluation (Indian Jurisdiction)

### 5.1 Candidate Provider Status & Requirements
For an entity incorporated and operating under Indian corporate and tax law (**CraftEgon LLP**, Kozhikode, Kerala), the payment gateway must natively support:
- Indian Rupee (INR) transactions via **UPI (Intent & Dynamic QR)**, Netbanking across 50+ scheduled commercial banks, and RuPay/Visa/Mastercard corporate credit cards.
- **RBI-Compliant Recurring Subscriptions (e-Mandate):** Strict compliance with Reserve Bank of India (RBI) circulars on recurring transactions (mandatory pre-debit notifications dispatched 24 hours prior to charge, Additional Factor Authentication [AFA] / OTP for recurring amounts exceeding ₹15,000).
- **Automated GST Invoicing:** B2B GSTIN collection, state tax split (CGST+SGST for Kerala intra-state; IGST for inter-state), and HSN/SAC code assignment (SAC 9982 for Legal & Accounting Services).

**Evaluated Candidate:** **Razorpay (India)**
- *Candidate Strengths:* Proven track record for Indian B2B legaltech and SaaS. Full support for UPI AutoPay e-mandates, corporate card recurring billing, automated GST invoicing, and signed webhook infrastructure.
- *Alternative Candidate:* **Cashfree Payments** (viable secondary alternative for Indian recurring billing and automated bank account verification).

### 5.2 Mandatory Separation of Payment Approvals
To maintain strict governance, payment implementation is split into **two distinct, sequential approval gates**:

```
[PHASE 3 CANDIDATE EVALUATION]
              │
              ▼
   [APPROVAL GATE 1: SANDBOX INTEGRATION]
   • Authorize technical integration against mock / sandbox API.
   • Implement server-side order generation and webhook signature verification.
   • Test failure modes, refunds, and idempotency using test cards.
   • ZERO live merchant accounts; ZERO real currency collected.
              │
              ▼
   [APPROVAL GATE 2: MERCHANT ONBOARDING & LIVE ACTIVATION]
   • Managing Partners formally sign off on data/pricing.json.
   • Managing Partners approve merchant agreement with candidate gateway.
   • Complete KYC, bank account verification, and GSTIN registration.
   • Activate live API keys; begin commercial subscription sales.
```

> **Strict Boundary:** This assessment does **NOT** authorize opening live merchant accounts, collecting client funds, or selling subscriptions. Sandbox testing and live merchant activation are completely separate partner approvals.

### 5.3 Server-Side Hosted Checkout & Webhook Lifecycle
Raw credit card, debit card, or UPI PIN details must **never** touch CraftEgon CCS servers (ensuring PCI-DSS SAQ-A compliance).

```
[CUSTOMER BROWSER]               [CCS BACKEND API]                [CANDIDATE GATEWAY API]
       │                                │                                    │
       │ (1) Select Retainer Tier       │                                    │
       ├───────────────────────────────►│                                    │
       │                                │ (2) Fetch Approved Server Price    │
       │                                │     (Never client-supplied amount) │
       │                                │     Create Order Record (DRAFT)    │
       │                                │                                    │
       │                                │ (3) POST /v1/orders                │
       │                                ├───────────────────────────────────►│
       │                                │◄───────────────────────────────────┤
       │                                │     Returns gateway_order_id       │
       │ (4) Return gateway_order_id    │                                    │
       │◄───────────────────────────────┤                                    │
       │                                                                     │
       │ (5) Launch Hosted Checkout (Standard Modal / Redirect)              │
       ├────────────────────────────────────────────────────────────────────►│
       │                                                                     │ (6) Authorize &
       │                                                                     │     Capture Payment
       │ (7) Client Success Toast                                            │
       │◄────────────────────────────────────────────────────────────────────┤
       │                                                                     │
       │                                │ (8) POST /api/webhooks/payment     │
       │                                │     (Signed HMAC-SHA256 Payload)   │
       │                                │◄───────────────────────────────────┤
       │                                │                                    │
       │                                │ (9) Verify Webhook Signature       │
       │                                │     Check gateway_event_id idempotency
       │                                │     Update Order to 'PAID'         │
       │                                │     Generate GST Tax Invoice       │
       │                                │     Send Email Receipt             │
       │                                │                                    │
       │                                │ (10) 200 OK Response               │
       │                                ├───────────────────────────────────►│
```

### 5.4 Webhook Idempotency & Fault-Tolerance Invariants
1. **Cryptographic Verification:** Every incoming webhook at `/api/webhooks/payment` must verify the gateway signature header against `crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex')`. Unsigned or mismatched requests are rejected with `400 Bad Request`.
2. **Idempotency Register:** The server inserts `gateway_event_id` into `payment_events`. If a duplicate event arrives (due to gateway retries), the database unique constraint rejects it, returning `200 OK` to prevent duplicate case activation or duplicate receipt generation.
3. **Zero Client Trust:** The client-side checkout callback (`handler: function(response){...}`) is treated purely as a UI redirect trigger. The case, subscription, or order is **never** marked `PAID` until the server receives and validates the official backend webhook.
4. **Commercial Pricing Prerequisite:** All 54 pricing records in `data/pricing.json` are currently `UNVERIFIED` scraped numbers. **No live checkout or subscription order may be processed using unapproved website amounts.** Formal commercial sign-off by the Managing Partners is a mandatory prerequisite before any live payment integration.

---

## 6. Staged Implementation Plan & Strict Exit Gates

To ensure risk-free progression, Phase 3 implementation is structured into **5 sequential stages**. Each stage contains strict dependencies, required deliverables, automated tests, security checks, and an explicit exit gate.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              PHASE 3 STAGED IMPLEMENTATION ROADMAP                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
   [Stage 1: Lead Capture] ──► [Stage 2: Case & Docs] ──► [Stage 3: Auth & Portal] ──► [Stage 4: Payments]
                                                                                              │
                                                                                              ▼
                                                                                  [Stage 5: Final Hardening]
```

### Stage 1: Secure Enquiry & Lead Intake Pipeline
- **Deliverables:**
  - Setup backend project structure (Cloudflare Pages Functions or Managed API).
  - Deploy `/api/leads` endpoint with schema validation and rate limiting.
  - Implement Cloudflare Turnstile token verification.
  - Connect all 16 `.if-lead-form` forms by setting `data-endpoint="/api/leads"`.
  - Connect internal email/notification webhook on new lead submission.
- **Dependencies:** Approved database instance and Cloudflare Turnstile credentials.
- **Tests:** Unit test payload schema; integration test Turnstile verification; rate limit saturation test; simulated form submission test across all 16 forms.
- **Security Review:** Verify sanitization against stored XSS; confirm zero lead data leakage in network logs.
- **Exit Gate 1:** 100% of website forms submit cleanly to the database with Turnstile validation; fallback notice cleanly replaced by genuine success state; spam bots blocked.

### Stage 2: Case Management & Secure Document Intake
- **Deliverables:**
  - Database tables for `cases`, `case_status_history`, and `documents`.
  - Private Cloudflare R2 / S3 storage bucket configuration (zero public read).
  - Presigned upload URL generator endpoint (`/api/documents/request-upload`).
  - Antivirus scanning hook and SHA256 integrity check.
  - File upload component on `conversion/contract-intake.html` and client portal.
- **Dependencies:** Stage 1 complete; private bucket provisioned.
- **Tests:** Upload unit test with invalid file extensions (reject `.exe`, `.sh`, `.html`); file size boundary test (>10MB rejected); **private-storage test asserting that direct public bucket requests return 403 Forbidden**.
- **Security Review:** Verify that storage keys use random UUIDs; verify that no user-supplied filenames exist in storage paths.
- **Exit Gate 2:** Clients can upload documents directly to private bucket; files undergo antivirus verification; staff can securely review uploaded files via short-lived signed download links; zero public bucket access.

### Stage 3: Authentication & Customer Portal Gateway
- **Deliverables:**
  - Passwordless Magic Link & OTP authentication flow.
  - Secure session cookie management (`HttpOnly`, `Secure`, `SameSite=Strict`).
  - Client portal dashboard (`portal/dashboard.html`) wired to live database: real case status, real milestone clocks, and uploaded documents.
  - Implement and verify Row-Level Security (RLS) policies on all tables.
- **Dependencies:** Stage 2 complete.
- **Tests:** **Automated negative cross-account tenant-isolation tests** in CI (User A attempts to read, modify, or delete User B's cases and documents, asserting HTTP 403 Forbidden / 0 rows returned); session expiry and renewal tests; brute-force OTP rate-limit tests.
- **Security Review:** Audit all RLS policies; verify that backend API code does not use the bypass `service_role` key for standard user queries.
- **Exit Gate 3:** Clients authenticate securely; dashboard reflects live case milestones; multi-tenant isolation proven functional through passing negative cross-account access tests.

### Stage 4: Payment Gateway & Subscription Lifecycle (Sandbox Only)
- **Deliverables:**
  - Commercial pricing partner sign-off on `data/pricing.json`.
  - Candidate gateway (Razorpay) sandbox configuration (**Approval Gate 1**).
  - Server-side order creation endpoint (`/api/orders/create`) reading only approved prices.
  - Hosted checkout modal integration in `portal/subscription.html`.
  - Signed webhook handler (`/api/webhooks/payment`) with HMAC-SHA256 verification and idempotency register.
  - Automated GST invoice PDF generator (SAC 9982).
- **Dependencies:** Stage 3 complete; formal commercial pricing sign-off; Approval Gate 1 (Sandbox authorization).
- **Tests:** Sandbox test matrix: successful payment, failed payment, cancelled checkout, expired order, **duplicate webhook replay test** (verifies idempotency deduplication), refund webhook test, client amount-tampering test (verifies order rejected).
- **Security Review:** Verify that client amount tampering fails; verify that unverified prices in `data/pricing.json` cannot be purchased.
- **Exit Gate 4:** End-to-end sandbox purchase of Starter, Growth, and Enterprise plans completes cleanly; signed webhooks process idempotently; zero live charges; zero production merchant onboarding until Approval Gate 2.

### Stage 5: End-to-End Integration, Security Audit & Disaster Recovery
- **Deliverables:**
  - Automated continuous backup pipeline (daily snapshots to secondary encrypted cloud storage).
  - Complete end-to-end journey audit: Visitor Enquiry -> Staff Assignment -> Case Creation -> Client Login -> Document Upload -> Payment Sandbox Checkout -> Completion.
  - WCAG 2.1 AA accessibility audit across all updated portal flows.
  - Disaster recovery runbook.
- **Dependencies:** Stages 1–4 complete.
- **Tests:** Full simulated disaster recovery restore from backup; end-to-end automated regression suite verifying complete customer journey without mock dependencies.
- **Security Review:** Independent vulnerability assessment & penetration testing (VAPT) sign-off.
- **Exit Gate 5 (Overall Phase 3 Exit Gate):** Fully tested, documented, and approved enquiry-to-fulfilment customer journey with passing payment sandbox tests, verified tenant isolation, automated backups, and partner sign-off.

---

## 7. Key Decisions Required from User / Managing Partners

Before commencing technical implementation of Stage 1, the user and managing partners must formally resolve four strategic decisions:

```
+----------------------------------------------------------------------------------------------------+
|                         MANDATORY STRATEGIC DECISIONS BEFORE IMPLEMENTATION                        |
+----------------------------------------------------------------------------------------------------+
  [ ] 1. Architecture Selection Approval
      • Review and approve Option B (Managed PostgreSQL with Native RLS via Supabase / AWS Mumbai)
        as the candidate architecture, pending configuration, security, cost, and data-location
        verification; OR mandate Option A (Cloudflare Edge-Native D1/Workers).

  [ ] 2. Payment Gateway Sandbox Authorization (Approval Gate 1)
      • Authorize technical integration and sandbox testing with candidate provider (Razorpay India).
      • Acknowledge that merchant onboarding, KYC verification, live activation, and subscription
        sales (Approval Gate 2) remain separate future approvals.

  [ ] 3. Commercial Pricing Sign-Off
      • Formally review and approve base fees, GST inclusion policies, and custom quote rules in
        data/pricing.json (resolving the 54 UNVERIFIED baseline from Phase 2).
      • Confirm that website-captured amounts will NOT be used for checkout until approved.

  [ ] 4. Document-Category Retention Schedule & Legal Review
      • Approve the proposed Document-Category Retention Matrix (Section 4.4) for legal counsel review.
      • Confirm 8-year corporate record retention under Companies Act 2013 and 90–180 day lead-purging
        schedule under the DPDP Act 2023.
+----------------------------------------------------------------------------------------------------+
```

---

## 8. Working-Tree and Safety Verification

In accordance with strict assessment boundaries, no production code was modified, no backend services were deployed, and no credentials were created:

### 8.1 Git Working-Tree Status (`git status --short`)
```text
 M package-lock.json
 M package.json
 M review-output/phase-1-foundations/phase-1-service-ownership-review.md
?? data/
?? review-output/phase-2-data-layer/
?? review-output/phase-2-service-registry/
?? review-output/phase-3/
?? scratch/
?? scripts/validate-phase-2-registry.js
```

### 8.2 Strict Boundaries Confirmation
- **Production HTML Modified:** 0 files modified in `services/`, `portal/`, or `conversion/`.
- **Git Commits Created:** 0 commits.
- **Git Remote Operations:** 0 pushes, 0 fetches.
- **Production Deployments:** 0 deployments.
- **Cloudflare Infrastructure Changes:** 0 DNS, Worker, or Page changes.
- **Real Accounts Created:** 0 accounts.
- **Customer Documents Collected:** 0 documents.
- **Payments Processed:** ₹0 processed.
- **Secrets in Source Code:** 0 secrets.
- **Taxonomy Preserved:** Exactly 54 active service IDs, 3 referral routes, 15 verticals intact.

---

## 9. Conclusion and Next Steps

This revised readiness assessment establishes a technically sound, legally cautious blueprint for operationalizing CraftEgon CCS. By treating managed PostgreSQL and Razorpay as candidate options subject to explicit approvals, establishing realistic boundaries around Row-Level Security, replacing blanket retention with a categorized statutory matrix, and marking all advanced controls as proposed until tested, the assessment provides a truthful, risk-managed roadmap.

**Recommendation:** **Review and accept this revised Phase 3 Backend Architecture Assessment report, and address the four strategic partner decisions before any Stage 1 implementation begins.**

*Task 1 is complete. All work has halted. Awaiting user review and authorization.*
