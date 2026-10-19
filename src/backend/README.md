# CraftEgon CCS — Backend and Database Foundation

**Architecture Baseline:** Phase 3 Task B  
**Runtime:** Node.js v18+ (Pure Node.js built-ins, zero external runtime npm dependencies)  
**Database Architecture:** PostgreSQL 15+ with engine-level Row-Level Security (RLS)  
**Target Cloud Deployment:** Supabase Pro in AWS Mumbai (`ap-south-1`) *(Proposed candidate — zero cloud provisioning authorized)*  

---

## 1. Directory Structure

```
src/backend/
├── config.js               # Central environment & configuration loader with validation
├── server.js               # Core HTTP server baseline, middleware chain & error shielding
├── router.js               # Route matching, parameter parsing, and controller dispatch
├── controllers/            # Endpoint business logic
│   ├── health.controller.js    # Health check & system metadata
│   ├── enquiry.controller.js   # Public lead intake & staff lookup
│   ├── auth.controller.js      # Session token issuance & verification
│   ├── portal.controller.js    # Client cases & staff management with RLS
│   └── document.controller.js  # Quarantine gating & presigned URLs
├── middleware/             # Reusable security middleware
│   ├── body-parser.js      # 32 KB payload size bounding & socket drain
│   ├── security-headers.js # Strict CSP, nosniff, DENY, CORS
│   ├── ip-resolver.js      # Direct vs. verified proxy IP resolution (anti-spoofing)
│   ├── rate-limiter.js     # Salted sliding-window in-memory limiter
│   ├── idempotency.js      # Content-hash duplicate suppression (15m window)
│   ├── auth-guard.js       # Session token verification & role enforcement
│   └── audit-logger.js     # PII-masked audit event logging
├── models/                 # Schemas & state machines
│   ├── enquiry.model.js    # Phase 2 canonical registry validation
│   └── state-machines.js   # Authoritative transitions for leads, cases, docs, payments
├── storage/                # Database repository
│   └── memory-store.js     # In-memory store simulating 6 Postgres tables & RLS policies
├── migrations/             # PostgreSQL DDL migrations
│   ├── 001_initial_schema.sql         # Tables: accounts, leads, cases, docs, orders, audit
│   ├── 002_row_level_security.sql     # RLS policies & tenant isolation rules
│   └── 003_indexes_and_constraints.sql # Foreign key indexes & check constraints
└── lead-intake-prototype.js # Preserved baseline prototype
```

---

## 2. Local Environment Configuration

Copy `.env.example` to `.env` or set environment variables:

```bash
# Core Server
NODE_ENV=development
HOST=127.0.0.1
PORT=3001
CORS_ORIGIN=http://localhost:8080

# Security & Anti-Abuse
IP_HASH_SALT=craftegon-local-dev-salt-baseline
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=5
MAX_PAYLOAD_SIZE_BYTES=32768
BOT_DETECTION_MIN_TIME_MS=2000

# Trusted reverse proxies (comma-separated). Leave empty for direct connections:
TRUSTED_PROXIES=

# Session & Retention
JWT_SECRET=local-dev-secret-do-not-use-in-prod
SESSION_DURATION_SECONDS=86400
LEAD_RETENTION_DAYS=180
```

> [!WARNING]
> Never commit real secrets, private keys, or `.env` files to Git. `.gitignore` strictly excludes `.env*` (except `.env.example`).

---

## 3. Database Migrations Guide

The SQL migrations in `src/backend/migrations/` are standard PostgreSQL DDL compatible with PostgreSQL 15+, Supabase, and AWS RDS:

1. **`001_initial_schema.sql`:**
   * Creates the 6 core tables: `client_accounts`, `lead_enquiries`, `cases`, `case_documents`, `subscription_orders`, and `audit_logs`.
   * Enforces strict check constraints, foreign keys, and UUID primary keys.
2. **`002_row_level_security.sql`:**
   * Enables Row-Level Security on all 6 tables.
   * Defines helper functions `app_current_user_id()` and `app_current_user_role()` (compatible with Supabase `auth.uid()` and standard PostgreSQL session variables `current_setting('app.current_user_id')`).
   * Implements strict cross-tenant isolation: clients can only view their own accounts, cases, orders, and clean documents.
3. **`003_indexes_and_constraints.sql`:**
   * Creates performance indexes on all foreign keys, status fields, and unique references (`lead_reference`, `case_reference`, `order_reference`).

### Applying Migrations to Local PostgreSQL (Optional)
```bash
psql -h localhost -U postgres -d craftegon_ccs -f src/backend/migrations/001_initial_schema.sql
psql -h localhost -U postgres -d craftegon_ccs -f src/backend/migrations/002_row_level_security.sql
psql -h localhost -U postgres -d craftegon_ccs -f src/backend/migrations/003_indexes_and_constraints.sql
```

*Note: For local automated testing and development, `src/backend/storage/memory-store.js` provides an in-memory database adapter that simulates the identical schema and RLS rules without requiring a live PostgreSQL instance.*

---

## 4. Running the Server Locally

```bash
node src/backend/server.js
```
Expected output:
```
[CraftEgon CCS] Backend server active on http://127.0.0.1:3001
[CraftEgon CCS] Local development baseline. Zero cloud connections.
```

---

## 5. Running Automated Tests

```bash
# Run Task B Backend Foundation Test Suite (60 assertions):
npm run test:backend

# Run Lead Intake Prototype Suite (31 assertions):
npm run test:prototype

# Run Master Regression Suite (142 assertions + static audits):
npm test
```

---

## 6. Security Boundaries & Limitations

1. **Local Development Baseline:** In-memory stores (`MemoryStore`) are volatile and reset upon process restart. Durable multi-node coordination requires an ACID PostgreSQL instance.
2. **Document Uploads Gated:** The `/api/v1/documents/upload` endpoint returns HTTP 503 (`UNAVAILABLE_PENDING_SCANNER`). Customer uploads remain strictly disabled until private storage and asynchronous ClamAV malware scanning are operational.
3. **Payments:** Payment processing is restricted to sandbox order creation. Zero live payments or production merchant credentials are permitted.
4. **Referral Routes:** Direct intake for contentious litigation / NCLT routes is rejected under Advocates Act 1961 professional boundaries.
