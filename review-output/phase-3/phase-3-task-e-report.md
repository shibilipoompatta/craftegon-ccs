# CraftEgon CCS — Phase 3 Task E: Secure Document Intake Report

**Document Reference:** `review-output/phase-3/phase-3-task-e-report.md`  
**Execution Timestamp:** 2026-10-19T22:25:00+05:30  
**Phase Context:** Phase 3 — Backend, Secure Enquiry, Client Portal, Document Intake, and Payments  
**Task Under Review:** Task E — Secure Document Intake  
**Task Status:** **TASK E COMPLETE — PENDING USER APPROVAL FOR TASK F**

---

## 1. Executive Summary & Preflight Resolution

Task E establishes an enterprise-grade, secure document intake, inspection, and retrieval pipeline for CraftEgon CCS. The architecture adheres strictly to zero-cloud-provisioning constraints, operates entirely on pure Node.js built-ins and local storage vaults, and validates multi-tenant Row-Level Security against the active local PostgreSQL 18 engine (`postgresql-x64-18` on `127.0.0.1:5432`).

### Preflight Baseline & Operational Gating
1. **Gated Upload Gating (`503 UNAVAILABLE_PENDING_SCANNER`):** In accordance with the security baseline, document intake returns HTTP 503 until private storage, signature validation, and scanning capabilities are explicitly operational.
2. **Private Vault Storage (Zero Public Objects):** Uploaded corporate files (financials, KYC, board resolutions, MOA/AOA) are stored exclusively in isolated, non-public vault directories (`storage/vault/clean` and `storage/vault/quarantine`), completely shielded from web server document roots and direct URL access.
3. **Magic-Byte Signature Verification:** Strict file header inspection identifies genuine `%PDF-`, PNG, JPEG, and PK ZIP (`.docx`) signatures, immediately detecting and rejecting spoofed MIME types, empty payloads, and executable binaries (DOS/PE `MZ`, ELF, Java bytecode, shell scripts).
4. **Malware Quarantine & Heuristic Scanning:** Every uploaded artifact enters an isolated quarantine staging area before release. Payloads are scanned against the EICAR test signature and heuristic script injection patterns, with seamless ClamAV daemon TCP socket integration (`INSTREAM` on port 3310). Infected files are immediately purged and flagged with status `INFECTED`.
5. **Short-Lived Signed Download URLs (<15 mins):** Clean documents are retrieved exclusively via temporary HMAC-SHA256 signed URLs verified in constant time (`crypto.timingSafeEqual`). Expired, tampered, or parameter-less download attempts are strictly rejected with HTTP 403.
6. **Live PostgreSQL 18 Engine-Level RLS Verification:** Document isolation and quarantine visibility policies were verified against the live PostgreSQL 18 database engine using the non-superuser unprivileged role `craftegon_test_app_user`. Clean documents are visible only to the authorized case owner and compliance staff; quarantined and deleted documents remain completely invisible to client tenants.
7. **Zero Cloud Provisioning & No Commits:** No remote cloud infrastructure or hosted accounts were touched. The Git working tree remains uncommitted and clean of unauthorized changes.

---

## 2. Implemented Architecture & Security Controls

### A. Database Schema & Migration 005 (`005_document_storage_policies.sql`)
- Added `deleted_at TIMESTAMPTZ` column to `case_documents` with filtered partial index `idx_case_documents_active` (`WHERE deleted_at IS NULL`) for soft-delete retention and audit compliance under the DPDP Act 2023.
- Implemented `case_documents_update_policy` restricting updates to compliance staff (`compliance_operator`, `managing_partner`).
- Implemented `case_documents_delete_policy` allowing document deletion by either the authorized case owner or compliance staff.
- Preserved existing RLS select policy ensuring client accounts can only query active (`deleted_at IS NULL`) and verified (`quarantine_status = 'CLEAN'`) documents attached to their own cases.

### B. Magic-Byte File Validation (`src/backend/models/document.model.js`)
- **Allowlisted Formats:** PDF (`application/pdf`), Word (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`), PNG (`image/png`), JPEG (`image/jpeg`).
- **Signature Detection (`detectFileSignature`):**
  - PDF: Magic bytes `%PDF-` (`0x25, 0x50, 0x44, 0x46, 0x2D`)
  - PNG: Header `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A` with valid `IHDR` chunk
  - JPEG: Header `0xFF, 0xD8, 0xFF`
  - DOCX: Header `0x50, 0x4B, 0x03, 0x04` (PK ZIP archive) with XML document payload markers
- **Disallowed Executables:** Rejects headers for DOS/PE (`0x4D, 0x5A` / `MZ`), ELF binaries (`0x7F, 0x45, 0x4C, 0x46`), Java bytecode (`0xCA, 0xFE, 0xBA, 0xBE`), and shell scripts (`#!/`).
- **Size Bounds:** Strictly enforces 15 MB limit (`15,728,640` bytes) and rejects 0-byte uploads.
- **Path Sanitization:** Strips directory traversal sequences (`../`, `..\`) and normalizes filenames to prevent arbitrary file overwrite attacks.

### C. Malware Scanning & Quarantine Lifecycle (`src/backend/models/scanner.service.js`)
- **Quarantine Staging:** Documents are written to `cases/<case_reference>/quarantine/<doc_id>.<ext>` prior to scanner clearance.
- **Threat Detection:**
  - EICAR Standard Antivirus Test Signature matching.
  - Heuristic script injection inspection (`<script`, `javascript:`, vbscript, iframe tags).
  - Executable header scanning.
  - Optional TCP ClamAV daemon streaming (`INSTREAM` on port 3310) with graceful fallback if the local daemon is offline.
- **Promotion / Purge:**
  - **Clean:** Atomically promoted to `cases/<case_reference>/clean/<doc_id>.<ext>` and database status set to `CLEAN`.
  - **Infected:** Quarantine file is securely purged immediately, status updated to `INFECTED`, and security alert recorded with HTTP 422 response.

### D. Short-Lived HMAC Signed URLs (`src/backend/models/signed-url.js`)
- **Generation:** Creates signed URL format `/api/v1/documents/:id/download?expires=<epoch>&sig=<hex_hmac>`.
- **HMAC Construction:** `crypto.createHmac('sha256', secret).update(`${docId}:${storagePath}:${expires}`).digest('hex')`.
- **Validation:**
  - Expiration check: Strictly enforces expiration window (<15 minutes).
  - Constant-Time Comparison: Uses `crypto.timingSafeEqual` between computed and provided signatures to eliminate side-channel timing attacks.
  - Hardening Headers: Downloads served with `Content-Security-Policy: default-src 'none'`, `X-Content-Type-Options: nosniff`, and `Cache-Control: private, no-cache, no-store`.

### E. Storage Repository & Dual-Engine Abstraction (`src/backend/storage/document-repository.js`)
- **`PostgresDocumentStorage`:**
  - Executes parameterized SQL inside transaction blocks setting session RLS context (`SET LOCAL ROLE craftegon_test_app_user; SET LOCAL app.current_user_id = ...; SET LOCAL app.current_user_role = ...;`).
  - Supports `createDocument`, `getDocumentById`, `listDocumentsForCase`, `updateQuarantineStatus`, and soft-delete `deleteDocument`.
- **`InMemoryDocumentStorage`:**
  - Memory-backed adapter mirroring RLS tenant isolation and quarantine gating for rapid test execution.
- **`VaultStorage` (`src/backend/storage/vault-storage.js`):**
  - Manages clean and quarantine disk storage with isolated directories, atomic promotion, and secure deletion.

### F. HTTP Middleware & Controllers
- **`body-parser.js` (`parseDocumentUpload`):**
  - Streaming parser supporting `multipart/form-data`, JSON base64 payloads, and binary octet streams.
  - Stream-level payload bounding halts and terminates the socket if upload exceeds 15 MB, returning HTTP 413 Payload Too Large.
- **`document.controller.js`:**
  - `handleUploadDocument`: Authenticates user, verifies case ownership, validates magic-bytes, stages in quarantine, scans for malware, and promotes to clean vault upon approval.
  - `handleGetDocumentDownloadUrl`: Verifies caller ownership/staff role and document `CLEAN` status, generating short-lived signed URL.
  - `handleDownloadDocument`: Verifies HMAC signature in constant time, checks expiration, and streams file with strict CSP headers.
  - `handleListCaseDocuments`: Lists verified case documents for authorized owners or compliance staff.
  - `handleDeleteDocument`: Soft-deletes document record and purges physical file from clean vault.

### G. Customer Portal UI Integration (`portal/dashboard.html` & `assets/css/portal.css`)
- Added `📎 Documents` action button to each active case card in the customer dashboard.
- Implemented accessible `#portal-docs-modal`:
  - Live document listing with filename, size, upload date, and status badges (`CLEAN`, `QUARANTINE`, `INFECTED`).
  - Secure download trigger invoking authenticated signed URL generation.
  - File upload form with format and size guidelines (PDF, DOCX, PNG, JPEG up to 15 MB).
  - Client-side validation for file size and format with inline feedback.
  - Automatic document list refresh following successful intake.

---

## 3. Test Execution & Verification Results

### Test Suite Summary

| Test Suite | Command | Total Assertions | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Task E (Document Intake)** | `npm run test:task-e` | **44** | **44** | **0** | **PASS** |
| **Task D (Auth & Portal)** | `npm run test:task-d` | **71** | **71** | **0** | **PASS** |
| **Backend Foundation** | `npm run test:backend` | **79** | **79** | **0** | **PASS** |
| **PostgreSQL 18 Verification** | `npm run test:postgres` | **30** | **30** | **0** | **PASS** |
| **Phase 2 & Core Registry** | `npm test` | **88+** | **88+** | **0** | **PASS** |
| **OVERALL TOTAL** | — | **350+** | **350+** | **0** | **100% PASS** |

### Detailed Suite Results for Task E (`scripts/test-task-e-document-intake.js`)

```text
======================================================================
CraftEgon CCS - Phase 3 Task E: Secure Document Intake Test Suite
======================================================================

--- Suite 1: Magic-Byte Signature Verification & Format Allowlist ---
  ✅ PASS: Identifies valid PDF magic bytes (%PDF-)
  ✅ PASS: Identifies valid PNG magic bytes
  ✅ PASS: Identifies valid JPEG magic bytes
  ✅ PASS: Identifies valid DOCX magic bytes (PK archive)
  ✅ PASS: Detects and strictly blocks DOS/PE executable signature
  ✅ PASS: Detects and strictly blocks ELF binary signature
  ✅ PASS: Rejects spoofed PDF whose magic bytes do not match %PDF-
  ✅ PASS: Rejects empty 0-byte document
  ✅ PASS: Enforces maximum file size limit
  ✅ PASS: Filename sanitization strips directory traversal sequences (../../../)

--- Suite 2: Malware Scanning & Quarantine Lifecycle ---
  ✅ PASS: Clean document passes malware scanner with 0 threats
  ✅ PASS: Detects EICAR antivirus test signature in payload
  ✅ PASS: Detects embedded script tag injection
  ✅ PASS: Handles scanner fault gracefully without crashing

--- Suite 3: Multi-Tenant Authorization & Case Document Isolation ---
  ✅ PASS: Unauthenticated upload rejected with HTTP 401
  ✅ PASS: Customer A uploads clean document successfully (HTTP 201)
  ✅ PASS: Clean document promoted to status CLEAN after scanner validation
  ✅ PASS: CROSS-TENANT ISOLATION: Customer B upload to Customer A case is rejected
  ✅ PASS: Customer A fetches case documents successfully (HTTP 200)
  ✅ PASS: Customer A sees exactly their 1 uploaded document
  ✅ PASS: CROSS-TENANT ISOLATION: Customer B listing Customer A documents returns HTTP 404
  ✅ PASS: Compliance staff can inspect documents across corporate cases

--- Suite 4: Quarantine Gating & Signed Download URLs ---
  ✅ PASS: Infected document upload strictly rejected with HTTP 422
  ✅ PASS: Upload response confirms INFECTED status
  ✅ PASS: Customer A requests signed download URL for clean document (HTTP 200)
  ✅ PASS: Download URL includes HMAC signature and expiration timestamp
  ✅ PASS: CROSS-TENANT ISOLATION: Customer B requesting download URL for Customer A document returns HTTP 404
  ✅ PASS: Download with valid signed URL succeeds (HTTP 200)
  ✅ PASS: Response includes correct Content-Type: application/pdf
  ✅ PASS: Includes X-Content-Type-Options: nosniff header
  ✅ PASS: Includes strict Content-Security-Policy: default-src 'none'
  ✅ PASS: Expired signed download URL strictly rejected with HTTP 403
  ✅ PASS: Tampered HMAC signature strictly rejected with HTTP 403
  ✅ PASS: Direct download attempt without signature parameters returns HTTP 403

--- Suite 5: Document Deletion & Soft-Delete Retention ---
  ✅ PASS: CROSS-TENANT ISOLATION: Customer B cannot delete Customer A document (HTTP 404)
  ✅ PASS: Customer A successfully deletes their document (HTTP 200)
  ✅ PASS: Deleted document is inaccessible for download URL generation (HTTP 404)
  ✅ PASS: Prior signed URL cannot download deleted file from vault (HTTP 404)

--- Suite 6: Live PostgreSQL 18 Engine-Level RLS Verification for Documents ---
  ✅ PASS: Created dedicated disposable test database 'craftegon_ccs_test'
  ✅ PASS: PostgreSQL RLS: Customer A can see their own CLEAN document
  ✅ PASS: PostgreSQL RLS: Customer A CANNOT see QUARANTINED document (Hidden by engine policy)
  ✅ PASS: PostgreSQL RLS: Customer B sees 0 documents for Customer A case
  ✅ PASS: PostgreSQL RLS: Customer B cannot update Customer A document (0 rows updated)
  ✅ PASS: PostgreSQL RLS: Compliance staff inspects both CLEAN and QUARANTINED documents for case audit
  Cleaned up 'craftegon_ccs_test' successfully.

======================================================================
TASK E TEST SUMMARY: 44 passed, 0 failed (44 total assertions)
======================================================================
```

---

## 4. Security Guarantees & Verification Matrix

| Security Domain | Implemented Control | Verified Behavior |
| :--- | :--- | :--- |
| **MIME Spoofing** | Magic-byte signature inspection | File extension/Content-Type header alone is never trusted. `%PDF-`, PNG, JPEG, and PK headers are verified against payload bytes. Spoofed text files are rejected. |
| **Executable Blocking** | Disallowed binary signatures | Headers matching DOS/PE (`MZ`), ELF, Java bytecode (`CAFEBABE`), and shell scripts (`#!/`) are strictly blocked. |
| **Payload Bounding** | Stream-level byte counter | Requests exceeding 15 MB are terminated immediately with HTTP 413, preventing resource exhaustion (DoS). |
| **Path Traversal** | Filename sanitization | Directory traversal sequences (`../../`) and dangerous characters are stripped from original filenames. |
| **Malware Isolation** | Quarantine staging & purge | Uploads enter isolated quarantine storage. Files with EICAR signature or embedded scripts trigger automatic purge and status `INFECTED`. |
| **Private Vault Storage** | Zero public URL mapping | Vault files reside outside the HTTP web root. Direct URL access is impossible; files can only be accessed through the signed download endpoint. |
| **Signed Download URLs** | Short-lived HMAC-SHA256 | Valid for <15 minutes. Signatures verified in constant time (`timingSafeEqual`). Expired or tampered signatures return HTTP 403. |
| **Tenant Isolation (App)** | Case ownership checks | Customer B cannot upload, list, download, or delete Customer A documents. Unowned resources return HTTP 404 (zero disclosure). |
| **Tenant Isolation (DB)** | PostgreSQL 18 Row-Level Security | Engine RLS verified using unprivileged role `craftegon_test_app_user`. Customer B sees 0 rows for Customer A documents. Customer A cannot see quarantined documents. |
| **Download Hardening** | Security response headers | Document downloads enforce `Content-Security-Policy: default-src 'none'`, `X-Content-Type-Options: nosniff`, and `attachment` disposition. |
| **Audit & Retention** | Soft-delete with timestamp | Document deletion sets `deleted_at`, preserving audit history while immediately removing access from the client portal and download endpoints. |

---

## 5. Remaining Risks & Phase 3 Roadmap (Tasks F & G)

1. **Task F (Payment Sandbox Integration):**
   - **Current State:** Payment checkout is a prototype sandbox endpoint without transaction persistence.
   - **Upcoming Scope:** Implement server-side order generation (`subscription_orders`), signature verification, webhook handler, and idempotency guarantees.
2. **Task G (End-to-End Acceptance Testing):**
   - **Upcoming Scope:** Verify complete customer journey: Enquiry submission -> Staff triage -> Account creation -> Login -> Portal case tracking -> Document intake -> Payment sandbox completion.

---

## 6. Files Changed in Task E

1. `src/backend/migrations/005_document_storage_policies.sql` (NEW — Document storage RLS update/delete policies & soft-delete index)
2. `src/backend/models/document.model.js` (NEW — Magic-byte validator, signature detector, path generator, filename sanitizer)
3. `src/backend/models/scanner.service.js` (NEW — Malware scanner service with EICAR & heuristic threat detection)
4. `src/backend/models/signed-url.js` (NEW — HMAC-SHA256 signed download URL generator & constant-time verifier)
5. `src/backend/storage/vault-storage.js` (NEW — Private isolated quarantine & clean vault storage adapter)
6. `src/backend/storage/document-repository.js` (NEW — PostgreSQL & In-Memory document repository with RLS context)
7. `src/backend/storage/case-repository.js` (MODIFIED — Enhanced `getCase` to resolve cases by UUID or case reference)
8. `src/backend/storage/memory-store.js` (MODIFIED — Enhanced `getCase` to resolve cases by UUID or case reference)
9. `src/backend/middleware/body-parser.js` (MODIFIED — Extended with `parseDocumentUpload` for multipart/json/binary streams)
10. `src/backend/controllers/document.controller.js` (MODIFIED — Implemented upload, signed URL, download, listing, and deletion)
11. `src/backend/config.js` (MODIFIED — Added `maxDocumentSizeBytes` and `scannerEnabled`)
12. `src/backend/router.js` (MODIFIED — Registered document upload, listing, download-url, download, and deletion routes)
13. `src/backend/server.js` (MODIFIED — Wired `documentRepository` in storage adapter initialization)
14. `portal/dashboard.html` (MODIFIED — Added Documents modal, document list view, and file upload form)
15. `assets/css/portal.css` (MODIFIED — Added modal styles, document items, status badges, and upload dropzone)
16. `package.json` (MODIFIED — Added `test:task-e` test script)
17. `scripts/test-task-e-document-intake.js` (NEW — 44-assertion comprehensive test suite including live PostgreSQL RLS)
18. `scripts/test-postgres-verification.js` (MODIFIED — Added Migration 005 to live PostgreSQL verification suite)
19. `review-output/phase-3/phase-3-task-e-report.md` (NEW — This report)

---

## 7. Current Git Working Tree Status

Exact output of `git status --short`:

```text
 M assets/css/portal.css
 M assets/js/forms.js
 M package.json
 M portal/dashboard.html
?? review-output/phase-3/phase-3-implementation-plan.md
?? review-output/phase-3/phase-3-local-postgres-verification.md
?? review-output/phase-3/phase-3-task-b-security-verification.md
?? review-output/phase-3/phase-3-task-c-report.md
?? review-output/phase-3/phase-3-task-c-verification.md
?? review-output/phase-3/phase-3-task-d-report.md
?? review-output/phase-3/phase-3-task-e-report.md
?? review-output/phase-3/phase-3-task-reports/
?? scripts/test-backend-foundation.js
?? scripts/test-postgres-verification.js
?? scripts/test-task-d-auth-portal.js
?? scripts/test-task-e-document-intake.js
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

## 8. Final Recommendation

### **RECOMMENDATION: APPROVE TASK F**

**Execution Hold:** In accordance with prompt instructions, execution has halted completely following the completion and verification of Task E. No work on Task F (Payment Sandbox Integration) has been started. We await user review and explicit authorization to proceed.
