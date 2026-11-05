-- ==============================================================================
-- CraftEgon CCS - Database Migration 006: Runtime Security, Force RLS & Grants
-- Target: PostgreSQL 15+
-- Principle: Defense-in-depth, Least Privilege, Engine-Level Tenant Boundary
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Force Row-Level Security on All Core Tables
-- Ensures RLS applies even to table owners (only superusers bypass)
-- ------------------------------------------------------------------------------
ALTER TABLE client_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE lead_enquiries FORCE ROW LEVEL SECURITY;
ALTER TABLE cases FORCE ROW LEVEL SECURITY;
ALTER TABLE case_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Client Accounts Insert Policy (DEF-001 Hardening at Database Level)
-- Public registration is restricted to 'client' role at database engine level.
-- Only managing partners can provision staff accounts.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS client_accounts_insert_policy ON client_accounts;
CREATE POLICY client_accounts_insert_policy ON client_accounts
    FOR INSERT
    WITH CHECK (
        account_role = 'client'
        OR app_current_user_role() = 'managing_partner'
    );

-- ------------------------------------------------------------------------------
-- 3. Cases Insert Policy (Tenant Ownership Enforcement at Database Level)
-- Clients can ONLY insert cases where client_id matches app_current_user_id().
-- Staff roles can create cases across clients for operational fulfillment.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS cases_insert_policy ON cases;
CREATE POLICY cases_insert_policy ON cases
    FOR INSERT
    WITH CHECK (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
        OR (app_current_user_role() = 'client' AND client_id = app_current_user_id())
    );

-- ------------------------------------------------------------------------------
-- 4. Auth Credentials & Sessions Policies
-- Server-side authentication and session lifecycle support
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS auth_credentials_policy ON auth_credentials;
DROP POLICY IF EXISTS auth_credentials_select_policy ON auth_credentials;
CREATE POLICY auth_credentials_select_policy ON auth_credentials
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS auth_credentials_insert_policy ON auth_credentials;
CREATE POLICY auth_credentials_insert_policy ON auth_credentials
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS auth_credentials_update_policy ON auth_credentials;
CREATE POLICY auth_credentials_update_policy ON auth_credentials
    FOR UPDATE
    USING (
        account_id = app_current_user_id()
        OR app_current_user_role() = 'managing_partner'
    );

DROP POLICY IF EXISTS auth_sessions_select_policy ON auth_sessions;
CREATE POLICY auth_sessions_select_policy ON auth_sessions
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS auth_sessions_insert_policy ON auth_sessions;
CREATE POLICY auth_sessions_insert_policy ON auth_sessions
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS auth_sessions_update_policy ON auth_sessions;
CREATE POLICY auth_sessions_update_policy ON auth_sessions
    FOR UPDATE
    USING (true);

-- ------------------------------------------------------------------------------
-- 5. Least-Privilege Grants for craftegon_app_user
-- Strictly limited to DML; zero DDL, zero DELETE on critical audit/case records
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_app_user') THEN
        GRANT USAGE ON SCHEMA public TO craftegon_app_user;
        GRANT SELECT, INSERT, UPDATE ON TABLE client_accounts, auth_credentials, auth_sessions, lead_enquiries, cases, case_documents, subscription_orders TO craftegon_app_user;
        GRANT SELECT, INSERT ON TABLE audit_logs TO craftegon_app_user;
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO craftegon_app_user;
    END IF;
END $$;
