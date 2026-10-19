-- ==============================================================================
-- CraftEgon CCS - Database Migration 004: Authentication, Credentials & Sessions
-- Target: PostgreSQL 15+
-- Security: Scrypt password hashes, single-use recovery tokens, session tracking
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Auth Credentials Table
-- Maps 1:1 with client_accounts for password-based local authentication
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE REFERENCES client_accounts(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Format: scrypt:<salt_hex>:<hash_hex>
    password_salt VARCHAR(64) NOT NULL,
    recovery_token_hash VARCHAR(64),
    recovery_token_expires_at TIMESTAMPTZ,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_credentials_email ON auth_credentials(email);
CREATE INDEX IF NOT EXISTS idx_auth_credentials_account ON auth_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_auth_credentials_recovery ON auth_credentials(recovery_token_hash) WHERE recovery_token_hash IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. Auth Sessions Table
-- Durable server-side session management
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token_hash VARCHAR(64) NOT NULL UNIQUE,
    account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'compliance_operator', 'managing_partner')),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash ON auth_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_account ON auth_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

-- ------------------------------------------------------------------------------
-- 3. Row-Level Security for Auth Tables
-- ------------------------------------------------------------------------------
ALTER TABLE auth_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- auth_credentials: Never accessible by regular client roles.
-- Only managing partners or system operations can access credentials.
CREATE POLICY auth_credentials_policy ON auth_credentials
    FOR ALL
    USING (app_current_user_role() = 'managing_partner');

-- auth_sessions: Clients can view only their own active sessions.
CREATE POLICY auth_sessions_select_policy ON auth_sessions
    FOR SELECT
    USING (
        account_id = app_current_user_id()
        OR app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );
