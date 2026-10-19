-- ==============================================================================
-- CraftEgon CCS - Database Migration 002: Row-Level Security (RLS) Policies
-- Target: PostgreSQL 15+ (Compatible with Supabase Pro & Local PG Session Vars)
-- Security Principle: Complete Cross-Tenant Isolation with Zero Leakage
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Functions for Authentication Context
-- Compatible with Supabase auth.uid() and PostgreSQL session settings
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Check if running inside Supabase Auth environment
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID;
    END IF;
    -- Fallback to session variable for local development and integration testing
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION app_current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    -- Check Supabase JWT claims
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        RETURN COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'anon');
    END IF;
    -- Fallback to session variable for local testing
    RETURN COALESCE(NULLIF(current_setting('app.current_user_role', true), ''), 'anon');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anon';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 2. Enable Row-Level Security on All Core Tables
-- ------------------------------------------------------------------------------
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. RLS Policies: client_accounts
-- ------------------------------------------------------------------------------
-- Clients may view only their own account record (matching primary ID or GoTrue auth_user_id).
-- Compliance operators and managing partners may view all client accounts.
CREATE POLICY client_accounts_select_policy ON client_accounts
    FOR SELECT
    USING (
        id = app_current_user_id()
        OR auth_user_id = app_current_user_id()
        OR app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- Only account owners or managing partners may update account metadata.
CREATE POLICY client_accounts_update_policy ON client_accounts
    FOR UPDATE
    USING (
        id = app_current_user_id()
        OR auth_user_id = app_current_user_id()
        OR app_current_user_role() = 'managing_partner'
    );

-- Prevent unauthorized role escalation during client profile updates
CREATE OR REPLACE FUNCTION trg_fn_prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_role <> OLD.account_role AND app_current_user_role() <> 'managing_partner' THEN
        RAISE EXCEPTION 'Access Denied: Only managing partners may modify account roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON client_accounts;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON client_accounts
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_prevent_role_escalation();

-- ------------------------------------------------------------------------------
-- 4. RLS Policies: cases
-- ------------------------------------------------------------------------------
-- Clients may view only cases belonging to their authorized client account.
-- Resolves client_id via direct ID or linked auth_user_id.
-- Staff roles may view all cases for operational compliance execution.
CREATE POLICY cases_select_policy ON cases
    FOR SELECT
    USING (
        client_id = app_current_user_id()
        OR client_id IN (SELECT ca.id FROM client_accounts ca WHERE ca.auth_user_id = app_current_user_id())
        OR app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- Cases can be created and mutated only by authorized staff roles.
CREATE POLICY cases_insert_policy ON cases
    FOR INSERT
    WITH CHECK (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

CREATE POLICY cases_update_policy ON cases
    FOR UPDATE
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- ------------------------------------------------------------------------------
-- 5. RLS Policies: case_documents
-- ------------------------------------------------------------------------------
-- Clients can download/view documents IF AND ONLY IF:
-- 1. The document belongs to a case they own.
-- 2. The document quarantine status is strictly 'CLEAN'.
-- Quarantined, infected, or blocked files are NEVER accessible to clients.
CREATE POLICY case_documents_select_policy ON case_documents
    FOR SELECT
    USING (
        (
            EXISTS (
                SELECT 1 FROM cases c
                WHERE c.id = case_documents.case_id
                  AND c.client_id = app_current_user_id()
            )
            AND quarantine_status = 'CLEAN'
        )
        OR app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- Only authorized case owners or staff can upload documents into a case.
CREATE POLICY case_documents_insert_policy ON case_documents
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_documents.case_id
              AND (c.client_id = app_current_user_id() OR app_current_user_role() IN ('compliance_operator', 'managing_partner'))
        )
    );

-- ------------------------------------------------------------------------------
-- 6. RLS Policies: subscription_orders
-- ------------------------------------------------------------------------------
-- Clients can view only their own orders. Staff can view all orders.
CREATE POLICY subscription_orders_select_policy ON subscription_orders
    FOR SELECT
    USING (
        client_id = app_current_user_id()
        OR client_id IN (SELECT ca.id FROM client_accounts ca WHERE ca.auth_user_id = app_current_user_id())
        OR app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- Orders can be updated only by trusted backend service roles (e.g. verified webhook handler).
CREATE POLICY subscription_orders_update_policy ON subscription_orders
    FOR UPDATE
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner', 'service_role')
    );

-- ------------------------------------------------------------------------------
-- 7. RLS Policies: lead_enquiries
-- ------------------------------------------------------------------------------
-- Public anonymous users can submit enquiries.
CREATE POLICY lead_enquiries_insert_policy ON lead_enquiries
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated staff can view or manage incoming lead enquiries.
-- Prospective clients cannot query other leads.
CREATE POLICY lead_enquiries_select_policy ON lead_enquiries
    FOR SELECT
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

CREATE POLICY lead_enquiries_update_policy ON lead_enquiries
    FOR UPDATE
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- ------------------------------------------------------------------------------
-- 8. RLS Policies: audit_logs
-- ------------------------------------------------------------------------------
-- Audit logs are strictly append-only. No updates or deletions allowed.
CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Only managing partners and compliance operators may inspect audit logs.
CREATE POLICY audit_logs_select_policy ON audit_logs
    FOR SELECT
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );
