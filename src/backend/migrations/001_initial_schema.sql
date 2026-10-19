-- ==============================================================================
-- CraftEgon CCS - Database Migration 001: Initial Core Schema
-- Target: PostgreSQL 15+ (Compatible with Supabase Pro AWS Mumbai ap-south-1)
-- Standards: DPDP Act 2023, Companies Act 2013, Strict Foreign Keys & UUIDs
-- ==============================================================================

-- Enable UUID extension (built-in in Postgres 13+ as gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Client Accounts (Tenant Profiles & Staff Directory)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Mapped to Supabase auth.users(id) or local auth provider
    legal_entity_name VARCHAR(200) NOT NULL,
    cin_llpin VARCHAR(25),
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(20) NOT NULL,
    account_role VARCHAR(50) NOT NULL DEFAULT 'client'
        CHECK (account_role IN ('client', 'compliance_operator', 'managing_partner')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Lead Enquiries (Public Ingestion & Triage Staging)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. LEAD-2026-A1B2C3
    service_id VARCHAR(50) NOT NULL,            -- Canonical Phase 2 Service ID (e.g. V01-SVC-007)
    vertical_id VARCHAR(10) NOT NULL,           -- Canonical Phase 2 Vertical ID (e.g. V01)
    contact_name VARCHAR(100) NOT NULL,
    email_hash VARCHAR(64) NOT NULL,            -- SHA-256 hash for masked querying & deduplication
    phone_hash VARCHAR(64) NOT NULL,
    encrypted_contact_payload TEXT,             -- AES-256-GCM encrypted PII payload at rest
    scope_description TEXT,
    source_url VARCHAR(255),
    dpdp_consent BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'ENQUIRY_RECEIVED'
        CHECK (status IN (
            'ENQUIRY_RECEIVED',
            'AWAITING_REVIEW',
            'FOLLOW_UP_REQUIRED',
            'REJECTED',
            'ACCEPTED',
            'CONVERTED_TO_CASE'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Retention proposal: 180-day period for unconverted leads is an operational policy proposal pending formal legal counsel review
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '180 days')
);

-- ------------------------------------------------------------------------------
-- 3. Cases (Active Corporate Engagements & Statutory Filings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. CASE-2026-F9E8D7
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES lead_enquiries(id) ON DELETE SET NULL,
    service_id VARCHAR(50) NOT NULL,
    vertical_id VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS'
        CHECK (status IN (
            'IN_PROGRESS',
            'AWAITING_CUSTOMER_ACTION',
            'STATUTORY_FILING_STAGED',
            'COMPLETED',
            'CLOSED'
        )),
    priority VARCHAR(20) NOT NULL DEFAULT 'STANDARD'
        CHECK (priority IN ('STANDARD', 'PRIORITY', 'EXPEDITED')),
    assigned_officer_id UUID REFERENCES client_accounts(id) ON DELETE SET NULL,
    statutory_deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. Case Documents (Private Vault & Quarantine Intake)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES client_accounts(id) ON DELETE RESTRICT,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) UNIQUE NOT NULL,  -- Isolated S3 key / object path
    file_signature VARCHAR(64) NOT NULL,        -- SHA-256 hash of payload
    file_size_bytes BIGINT NOT NULL
        CHECK (file_size_bytes > 0 AND file_size_bytes <= 15728640), -- Max 15 MB
    mime_type VARCHAR(100) NOT NULL
        CHECK (mime_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png')),
    quarantine_status VARCHAR(50) NOT NULL DEFAULT 'QUARANTINE'
        CHECK (quarantine_status IN ('QUARANTINE', 'VALIDATING_SIGNATURE', 'MALWARE_SCANNING', 'CLEAN', 'INFECTED', 'BLOCKED')),
    scan_results JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. Subscription Orders (Commercial Retainer Records - Sandbox Baseline)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. ORD-2026-X1Y2Z3
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE RESTRICT,
    tier_name VARCHAR(50) NOT NULL
        CHECK (tier_name IN ('Starter Tier', 'Growth Tier', 'Enterprise Tier', 'Custom Retainer')),
    billing_cycle VARCHAR(20) NOT NULL
        CHECK (billing_cycle IN ('monthly', 'annual')),
    amount_subtotal_paise BIGINT NOT NULL CHECK (amount_subtotal_paise >= 0),
    amount_tax_paise BIGINT NOT NULL CHECK (amount_tax_paise >= 0),
    amount_total_paise BIGINT NOT NULL CHECK (amount_total_paise >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY_SANDBOX',
    gateway_order_id VARCHAR(100) UNIQUE,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'ORDER_CREATED'
        CHECK (payment_status IN (
            'ORDER_CREATED',
            'PAYMENT_PENDING',
            'PAYMENT_FAILED',
            'PAYMENT_CANCELLED',
            'PAID',
            'REFUNDED'
        )),
    idempotency_hash VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. Audit Logs (DPDP Compliance & Security Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES client_accounts(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    client_ip_hash VARCHAR(64) NOT NULL,
    action_status VARCHAR(20) NOT NULL CHECK (action_status IN ('SUCCESS', 'FAILED', 'BLOCKED')),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
