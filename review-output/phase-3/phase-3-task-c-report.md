# CraftEgon CCS — Phase 3 Task C: Secure Enquiry Ingestion & Lead Triage Report

**Document Reference:** `review-output/phase-3/phase-3-task-c-report.md`  
**Execution Timestamp:** 2026-10-18T13:48:30+05:30  
**Phase Context:** Phase 3 — Backend, Secure Enquiry, Client Portal, Document Intake, and Payments  
**Task Under Review:** Task C — Secure Enquiry Ingestion & Lead Triage  
**Task Status:** **TASK C COMPLETE**

---

## 1. Executive Summary & Preflight Gate Resolution

Task C implements secure, resilient enquiry ingestion and staff triage across the CraftEgon CCS platform. Prior to code implementation, the two preflight issues mandated by the exit gate were systematically audited and formally resolved with explicit user authorization.

### Preflight Gates Resolution
1. **Preflight A (Referral-Route Discrepancy Reconciliation):** **RESOLVED VIA USER APPROVAL**.
   - **Audit Finding:** The prompt baseline narrative listed `/services/strike-off-company-closure.html` alongside `/services/director-removal-board-disputes.html` and `/services/nclt-insolvency-defense.html`. Physical disk audit and canonical registers (`data/service-registry.json` and `docs/phase-1-route-register.csv`) proved that `/services/strike-off-company-closure.html` does not exist on disk or in the registry. It originated as a narrative typo in Phase 2 Task 7 report (line 111).
   - **Canonical Third Referral Route:** `/services/oppression-mismanagement-petitions.html` (Sections 241/242 Companies Act 2013 courtroom litigation) is the authoritative 3rd referral route.
   - **Commercial Strike-Off Confirmation:** Company closure via strike-off is an active commercial service represented by `/services/form-stk2-strike-off.html` (`V02-SVC-013`, Form STK-2) and `/services/llp-form24-strike-off.html` (`V02-SVC-015`, Form 24).
   - **User Decision:** The user formally selected Option 1: *"Approve canonical registry baseline: Confirm /services/oppression-mismanagement-petitions.html as the 3rd referral route, retain Form STK-2 (V02-SVC-013) as an active commercial service, and proceed with Task C using the local in-memory/repository layer."*
2. **Preflight B (Database Security & PostgreSQL Availability):** **DOCUMENTED AS UNVERIFIED ON LIVE ENGINE**.
   - PostgreSQL 18 is running locally as a Windows service (`postgresql-x64-18`), but authentication fails (`fe_sendauth: no password supplied`) because no local database credentials or test databases are provisioned in the environment.
   - In accordance with the prompt instruction (*"If PostgreSQL is unavailable, state clearly that migration execution and real RLS behavior remain unverified. Do not treat static inspection or mock tests as equivalent"*), we explicitly document that live PostgreSQL migration execution and engine-level RLS enforcement remain unverified against a running database instance.

---

## 2. Files Changed in Task C

1. **`src/backend/storage/enquiry-repository.js` (NEW):**
   - Created the dedicated `EnquiryRepository` abstraction separating the data access layer from storage engines.
   - Implemented `PostgresEnquiryStorage` with production-grade parameterized SQL queries (`INSERT INTO lead_enquiries ... RETURNING *`, `SELECT`, `UPDATE`).
   - Implemented `InMemoryEnquiryStorage` for local deterministic unit and integration tests with controllable failure injection (`setSimulateFailure`).
2. **`src/backend/controllers/enquiry.controller.js` (MODIFIED):**
   - Wired `handleCreateEnquiry` to persist enquiries through `enquiryRepository.createEnquiry(...)`.
   - Added robust try/catch error boundary recording `ENQUIRY_PERSISTENCE_FAILED` audit events and returning generic HTTP 500 error responses without stack trace disclosure.
   - Converted `handleGetEnquiry` to asynchronous retrieval via `enquiryRepository.getEnquiry(...)`.
3. **`src/backend/router.js` (MODIFIED):**
   - Added `await` to asynchronous handlers `handleCreateEnquiry` and `handleGetEnquiry`.
4. **`assets/js/forms.js` (MODIFIED):**
   - Connected all `.if-lead-form` elements to the backend API endpoint (`/api/v1/enquiries`).
   - Added payload field normalization (`contact_name`, `email`, `phone`, `service_id`, `vertical_id`, `scope_description`, `source_url`, `dpdp_consent: true`).
   - Injected anti-bot honeypot (`_hp_website`) and submission speed timestamp (`_render_time`).
   - Implemented accessible success confirmation reporting the confirmed `lead_reference` returned by the server.
   - Implemented accessible failure handling with field-level error messages and button retry states.
5. **`scripts/test-backend-foundation.js` (MODIFIED):**
   - Expanded from 61 to **78 assertions** (+17 new assertions).
   - Added full regression tests for all 3 canonical referral-only routes.
   - Added Test Suite 11 testing missing fields, invalid email/phone, missing DPDP consent, unknown service/vertical IDs, service/vertical mismatches, persistence error boundaries, and unauthenticated/client vs. staff triage authorization.

---

## 3. Frontend Form Inventory & API Mapping

The repository contains **21 forms** across `conversion/`, `portal/`, and `services/`. All 17 customer-facing intake forms have been mapped to their canonical backend API payloads.

### Form Mapping Table

| Form File | Selector | Business Vertical & Service | Primary Vertical ID | API Endpoint | Payload Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `conversion/contract-intake.html` | `.if-lead-form` | Commercial Contract Drafting | `V07` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V07-SVC-001", vertical_id: "V07", scope_description, dpdp_consent: true }` |
| `conversion/cross-border-retainer.html` | `.if-lead-form` | Cross-Border Retainer Desk | `V04` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V04-SVC-001", vertical_id: "V04", scope_description, dpdp_consent: true }` |
| `conversion/csr-audit-form.html` | `.if-lead-form` | CSR Audit & Filing (Form CSR-2) | `V02` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V02-SVC-010", vertical_id: "V02", scope_description, dpdp_consent: true }` |
| `conversion/dispute-consultation.html` | `.if-lead-form` | Dispute Consultation | `V15` | `POST /api/v1/enquiries` | **REJECTED (HTTP 422)** if mapped to referral litigation routes; routed to Partner Referral Desk. |
| `conversion/dpdp-audit-request.html` | `.if-lead-form` | DPDP Act Diagnostic Audit | `V12` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V12-SVC-002", vertical_id: "V12", scope_description, dpdp_consent: true }` |
| `conversion/fema-consultation.html` | `.if-lead-form` | Specialized FEMA Desk Inquiry | `V04` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V04-SVC-002", vertical_id: "V04", scope_description, dpdp_consent: true }` |
| `conversion/hr-audit.html` | `.if-lead-form` | Labour & POSH Compliance | `V10` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V10-SVC-001", vertical_id: "V10", scope_description, dpdp_consent: true }` |
| `conversion/license-qualification.html` | `.if-lead-form` | Industrial Licensing Audit | `V05` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V05-SVC-001", vertical_id: "V05", scope_description, dpdp_consent: true }` |
| `conversion/ma-advisory-enquiry.html` | `.if-lead-form` | Confidential M&A Advisory | `V08` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V08-SVC-001", vertical_id: "V08", scope_description, dpdp_consent: true }` |
| `conversion/post-incorporation-checkout.html` | `.if-lead-form` | Post-Inc Compliance Retainer | `V01` | `POST /api/v1/enquiries` | `{ contact_name: director_name, email, phone, service_id: "V01-SVC-007", vertical_id: "V01", dpdp_consent: true }` |
| `conversion/retainer-desk.html` | `.if-lead-form` | General Retainer Engagement | `V01` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "GENERAL", vertical_id: "V01", dpdp_consent: true }` |
| `conversion/secretarial-audit-scope.html` | `.if-lead-form` | Secretarial Audit Proposal | `V02` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V02-SVC-007", vertical_id: "V02", scope_description, dpdp_consent: true }` |
| `conversion/strike-off-checker.html` | `.if-lead-form` | Fast-Track Strike-Off STK-2 | `V02` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V02-SVC-013", vertical_id: "V02", dpdp_consent: true }` |
| `conversion/tax-intake.html` | `.if-lead-form` | Corporate Tax Intake | `V03` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V03-SVC-001", vertical_id: "V03", dpdp_consent: true }` |
| `conversion/trademark-search.html` | `.if-lead-form` | Trademark Search & Filing | `V06` | `POST /api/v1/enquiries` | `{ contact_name: applicant_name, email, phone, service_id: "V06-SVC-001", vertical_id: "V06", dpdp_consent: true }` |
| `conversion/venture-deal-booking.html` | `.if-lead-form` | Venture Financing Strategy | `V09` | `POST /api/v1/enquiries` | `{ contact_name, email, phone, service_id: "V09-SVC-001", vertical_id: "V09", dpdp_consent: true }` |
| `services/pvt-ltd-registration.html` | `.if-lead-form` | Private Limited Incorporation | `V01` | `POST /api/v1/enquiries` | `{ contact_name: company_name, email, phone, service_id: "V01-SVC-001", vertical_id: "V01", dpdp_consent: true }` |
| `conversion/ai-document-generator.html` | `#ai-drafter-form` | Client-Side Document Generator | N/A | Client Tool | Client-side tool only (no backend submission) |
| `conversion/calculator.html` | `#estimator-form` | Client-Side Fee Estimator | N/A | Client Tool | Client-side calculator |
| `portal/dashboard.html` | `#cin-lookup-form` | CIN Compliance Calendar Lookup | N/A | Client Portal | Portal utility tool |
| `portal/subscription.html` | `#checkout-form` | Retainer Sandbox Checkout | N/A | `POST /api/v1/portal/orders` | Sandbox payment simulation (Task E) |

---

## 4. API Contracts & Persistence Behavior

### API Contract: `POST /api/v1/enquiries`
- **Method:** `POST`
- **Path:** `/api/v1/enquiries`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "contact_name": "Rajesh Sharma",
    "email": "rajesh@acmeindia.com",
    "phone": "+91 9876543210",
    "service_id": "V01-SVC-007",
    "vertical_id": "V01",
    "scope_description": "Annual MCA compliance retainer inquiry",
    "source_url": "/conversion/post-incorporation-checkout.html",
    "dpdp_consent": true,
    "_hp_website": "",
    "_render_time": 1776500000000
  }
  ```
- **Response HTTP 201 Created:**
  ```json
  {
    "success": true,
    "lead_reference": "LEAD-2026-A1B2C3",
    "status": "ENQUIRY_RECEIVED",
    "message": "Your corporate compliance enquiry was accepted. CraftEgon will follow up via the contact channels provided.",
    "data_retention_days": 180
  }
  ```
- **Response HTTP 200 OK (Idempotent Duplicate Replay):**
  ```json
  {
    "success": true,
    "lead_reference": "LEAD-2026-A1B2C3",
    "status": "ENQUIRY_RECEIVED",
    "message": "Your corporate compliance enquiry was accepted...",
    "data_retention_days": 180,
    "idempotent_replay": true
  }
  ```
- **Response HTTP 422 Unprocessable Entity (Referral Route Rejection):**
  ```json
  {
    "error": "Unprocessable Entity",
    "message": "Enquiry payload failed validation constraints",
    "errors": [
      {
        "field": "source_url",
        "issue": "Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination."
      }
    ]
  }
  ```
- **Response HTTP 413 Payload Too Large:** Returned when request body exceeds 32 KB. Socket is drained and destroyed.
- **Response HTTP 429 Too Many Requests:** Returned when IP hash exceeds 5 requests per 10-minute window, with `Retry-After` header.

### API Contract: `GET /api/v1/enquiries/:reference`
- **Method:** `GET`
- **Path:** `/api/v1/enquiries/LEAD-2026-A1B2C3`
- **Authorization:** `Bearer cct_*` or `craftegon_session` cookie (restricted to `compliance_operator` or `managing_partner` roles).
- **Access Control:**
  - Unauthenticated request: **HTTP 401 Unauthorized**
  - Authenticated as `client`: **HTTP 403 Forbidden**
  - Authenticated as `compliance_operator` / `managing_partner`: **HTTP 200 OK** with lead enquiry details.

### Persistence Behavior & Data Access Layer
- The backend uses the `EnquiryRepository` abstraction ([src/backend/storage/enquiry-repository.js](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/storage/enquiry-repository.js)).
- **PostgresEnquiryStorage:** Contains the parameterized SQL queries designed for PostgreSQL / Supabase:
  ```sql
  INSERT INTO lead_enquiries (
    id, lead_reference, service_id, vertical_id, contact_name,
    email_hash, phone_hash, encrypted_contact_payload, scope_description,
    source_url, dpdp_consent, status, created_at, expires_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
  ) RETURNING *;
  ```
- **InMemoryEnquiryStorage:** Utilized for deterministic local tests and unit verification, supporting controlled error injection (`setSimulateFailure(true)`).
- **Durable Persistence Separation:** The repository layer explicitly isolates in-memory mocks from durable database persistence, preventing an in-memory store from being presented as durable storage.

---

## 5. Test Suite Execution & Verification Evidence

All test suites were executed cleanly using pure Node.js test runners without weakening any assertions:

```text
1. Backend Foundation & Secure Ingestion Suite:
   Command: npm run test:backend
   Output:  78 passed, 0 failed (78 total assertions across 11 test suites)

2. Prototype Security & Remediation Suite:
   Command: npm run test:prototype
   Output:  31 passed, 0 failed (31 total assertions across 6 test suites)

3. Master Regression Suite (Phase 1 & Phase 2 Baseline):
   Command: npm test
   Output:  142 passed, 0 failed (54 Phase 1 + 88 Phase 2 assertions across 8 test suites)

Total Verified Assertions: 251 passed, 0 failed (100% passing)
```

### Breakdown of Test Suite 11 (Task C Specific Assertions):
1. `Rejects enquiry with missing contact_name (HTTP 422)`: PASS
2. `Rejects enquiry with invalid email format (HTTP 422)`: PASS
3. `Rejects enquiry with invalid phone number (HTTP 422)`: PASS
4. `Rejects enquiry without explicit DPDP consent (HTTP 422)`: PASS
5. `Rejects unknown service_id not in canonical registry (HTTP 422)`: PASS
6. `Rejects unknown vertical_id not in canonical taxonomy (HTTP 422)`: PASS
7. `Rejects mismatched service_id and vertical_id combination (HTTP 422)`: PASS
8. `Persistence failure returns HTTP 500 Internal Server Error`: PASS
9. `Persistence error is shielded without leaking stack traces`: PASS
10. `Valid enquiry accepted and persisted with HTTP 201`: PASS
11. `Generates valid opaque lead reference`: PASS
12. `Unauthenticated triage access to lead enquiry returns HTTP 401 Unauthorized`: PASS
13. `Client role triage access to lead enquiry returns HTTP 403 Forbidden`: PASS
14. `Authorized compliance staff can triage and inspect lead enquiry (HTTP 200)`: PASS
15. `Triage response returns correct lead reference`: PASS

---

## 6. Security Limitations & Restrictions

1. **Loopback Binding:** Server is strictly bound to `127.0.0.1` ([src/backend/config.js:23](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs/src/backend/config.js#L23)). Accidental public listening is prevented.
2. **Synthetic Authentication Test-Only:** Blocked with HTTP 403 in production. Staff triage is inaccessible to unauthenticated callers.
3. **Document Upload Disabled:** Upload endpoint unconditionally returns HTTP 503 (`UNAVAILABLE_PENDING_SCANNER`).
4. **Payments Sandbox Only:** Locked to `RAZORPAY_SANDBOX` with zero real payment processing or webhook listeners.
5. **PostgreSQL Live Execution Unverified:** Due to absent local credentials, migration application and live engine-level RLS remain unverified against a running database.
6. **180-Day Retention Trigger:** Documented as an unapproved operational proposal requiring corporate legal counsel sign-off before implementing automated data purges.

---

## 7. Current Git Status

Exact output of `git status --short`:

```text
 M assets/js/forms.js
 M package.json
?? review-output/phase-3/phase-3-implementation-plan.md
?? review-output/phase-3/phase-3-task-b-security-verification.md
?? review-output/phase-3/phase-3-task-c-report.md
?? review-output/phase-3/phase-3-task-reports/
?? scripts/test-backend-foundation.js
?? src/backend/README.md
?? src/backend/config.js
?? src/backend/controllers/
?? src/backend/middleware/
?? src/backend/migrations/
?? src/backend/models/
?? src/backend/router.js
?? src/backend/server.js
?? src/backend/storage/
```

---

## 8. Final Status Determination

### **TASK C COMPLETE**

**Rationale:**
- Preflight Issue A was formally resolved by explicit user approval confirming `/services/oppression-mismanagement-petitions.html` as the 3rd referral route and retaining Form STK-2 (`V02-SVC-013`) as an active commercial service.
- Preflight Issue B was audited and documented with the mandatory verification caveat regarding local PostgreSQL credentials.
- All 17 customer-facing intake forms have been inventoried and connected to `/api/v1/enquiries` via `assets/js/forms.js`.
- Server-side validation strictly enforces field constraints, service IDs, vertical IDs, and referral-only boundaries.
- The repository layer (`EnquiryRepository`) cleanly abstracts data persistence with production SQL queries and error boundaries.
- Accessible success confirmations display the opaque lead tracking reference, and accessible error/retry states are rendered on failure.
- All 251 test assertions pass cleanly with zero failures.
- Task D has not been started.
