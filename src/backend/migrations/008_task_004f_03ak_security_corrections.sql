-- ==============================================================================
-- Migration 008: Task 004F-03AK Security Corrections & Defense-in-Depth Hardening
--
-- Security Objectives:
-- 1. Precondition checks: Validate roles, tables, columns, and triggers from Migration 007.
-- 2. Eliminate Registration Activation Bypass (FINDING-01):
--    - Alter client_accounts.is_active default to false.
--    - Revoke INSERT (is_active) on public.client_accounts from craftegon_app_user.
--    - Redefine trg_fn_validate_registration_and_staff_insert to unconditionally
--      force NEW.account_role := 'client' and NEW.is_active := false for craftegon_app_user,
--      completely eliminating caller-controlled GUC trust ('app.require_email_verification').
-- 3. Correct Staff Credential Isolation & Safe Compensation (FINDING-02):
--    - Explicitly REVOKE ALL ON public.auth_credentials FROM craftegon_gov_user,
--      ensuring governance runtime has ZERO privilege on auth_credentials.
--    - Provide sp_compensate_uncredentialed_account(UUID) for atomic cleanup if
--      credential creation fails across the multi-pool transaction boundary.
-- 4. Correct Managing Partner Bootstrap Audit Schema Mismatch (FINDING-03):
--    - Redefine sp_bootstrap_initial_managing_partner to insert into the actual
--      audit_logs schema (actor_role, client_ip_hash, action_status) using a SHA-256
--      hash rather than invalid column 'ip_address'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Precondition Verification
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Verify core tables exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_accounts') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Table public.client_accounts does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_credentials') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Table public.auth_credentials does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Table public.audit_logs does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_bootstrap_state') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Table public.system_bootstrap_state does not exist';
    END IF;

    -- Verify runtime roles exist
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_app_user') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Role craftegon_app_user does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_auth_user') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Role craftegon_auth_user does not exist';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_gov_user') THEN
        RAISE EXCEPTION 'MIGRATION_008_PRECONDITION_FAILED: Role craftegon_gov_user does not exist';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Priority 1: Inactive Client Registration Hardening (FINDING-01)
-- ------------------------------------------------------------------------------

-- 2.1 Set fail-closed default for is_active
ALTER TABLE public.client_accounts ALTER COLUMN is_active SET DEFAULT false;

-- 2.2 Revoke column INSERT on is_active from craftegon_app_user
-- App user must NEVER supply or choose the is_active status on insert
REVOKE INSERT (is_active) ON public.client_accounts FROM craftegon_app_user;

-- 2.3 Redefine registration & staff insert validation trigger function
-- Strips all trust from caller-controlled GUC 'app.require_email_verification'
CREATE OR REPLACE FUNCTION public.trg_fn_validate_registration_and_staff_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Ordinary public registration (craftegon_app_user)
    IF CURRENT_USER = 'craftegon_app_user' THEN
        -- Force client role unconditionally
        NEW.account_role := 'client';
        -- Unconditional inactive status: zero trust in caller GUCs or parameters
        NEW.is_active := false;
        RETURN NEW;
    END IF;

    -- Privileged governance staff provisioning (craftegon_gov_user)
    IF CURRENT_USER = 'craftegon_gov_user' THEN
        -- Whitelist enforcement: May ONLY provision approved staff roles
        IF NEW.account_role NOT IN ('compliance_operator', 'managing_partner') THEN
            RAISE EXCEPTION 'INVALID_STAFF_ROLE: Governance role may only provision compliance_operator or managing_partner (attempted: %)', NEW.account_role
                USING ERRCODE = 'invalid_parameter_value';
        END IF;
        -- Governance explicitly sets is_active (defaults to true if null)
        NEW.is_active := COALESCE(NEW.is_active, true);
        RETURN NEW;
    END IF;

    -- Database Administrator / Migration path (postgres, craftegon_migrator)
    IF CURRENT_USER IN ('postgres', 'craftegon_migrator') THEN
        IF NEW.account_role NOT IN ('client', 'compliance_operator', 'managing_partner') THEN
            RAISE EXCEPTION 'INVALID_ROLE: Role % is not permitted by system domain schema', NEW.account_role
                USING ERRCODE = 'invalid_parameter_value';
        END IF;
        RETURN NEW;
    END IF;

    -- Any other database role is rejected
    RAISE EXCEPTION 'UNAUTHORIZED_INSERT: Role % is not permitted to insert accounts', CURRENT_USER
        USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public, pg_temp;

-- ------------------------------------------------------------------------------
-- 3. Priority 2: Staff Credential Isolation & Safe Compensation (FINDING-02)
-- ------------------------------------------------------------------------------

-- 3.1 Strictly revoke all access to auth_credentials from craftegon_gov_user
REVOKE ALL ON public.auth_credentials FROM craftegon_gov_user;

-- 3.2 Provide safe compensation procedure to clean up orphaned accounts
-- If credential creation in authPool fails after client_accounts row was inserted,
-- this procedure permits deleting the uncredentialed account without granting general DELETE on client_accounts
CREATE OR REPLACE FUNCTION public.sp_compensate_uncredentialed_account(p_account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Guard: Only delete if NO credentials record exists for this account
    IF EXISTS (SELECT 1 FROM public.auth_credentials WHERE account_id = p_account_id) THEN
        RETURN false;
    END IF;

    DELETE FROM public.client_accounts
    WHERE id = p_account_id
      AND NOT EXISTS (SELECT 1 FROM public.auth_credentials WHERE account_id = p_account_id);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp;

REVOKE ALL ON FUNCTION public.sp_compensate_uncredentialed_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sp_compensate_uncredentialed_account(UUID) TO craftegon_app_user, craftegon_gov_user, postgres;

-- ------------------------------------------------------------------------------
-- 4. Priority 3: Repair Managing Partner Bootstrap Audit Logging (FINDING-03)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sp_bootstrap_initial_managing_partner(
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_password_salt VARCHAR,
    p_legal_name VARCHAR DEFAULT 'CraftEgon Managing Partner'
)
RETURNS UUID AS $$
DECLARE
    v_new_account_id UUID;
    v_is_bootstrapped BOOLEAN;
    v_clean_email VARCHAR(255);
BEGIN
    -- Concurrency guard: transactional advisory lock
    PERFORM pg_advisory_xact_lock(hashtext('craftegon_bootstrap_lock'));

    v_clean_email := LOWER(TRIM(p_email));
    IF v_clean_email IS NULL OR v_clean_email = '' OR v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
        RAISE EXCEPTION 'INVALID_EMAIL: Valid email address is required for initial bootstrap'
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF p_password_hash IS NULL OR p_password_hash = '' OR p_password_salt IS NULL OR p_password_salt = '' THEN
        RAISE EXCEPTION 'INVALID_CREDENTIALS: Password hash and salt are required for initial bootstrap'
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Check singleton bootstrap state table
    SELECT is_bootstrapped INTO v_is_bootstrapped 
    FROM public.system_bootstrap_state 
    WHERE id = 1 
    FOR UPDATE;

    IF v_is_bootstrapped IS TRUE THEN
        RAISE EXCEPTION 'BOOTSTRAP_PERMANENTLY_CLOSED: System has already completed initial bootstrap. Operation permanently disabled.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    -- Secondary defense: if any managing partner account exists, close bootstrap permanently
    IF EXISTS (SELECT 1 FROM public.client_accounts WHERE account_role = 'managing_partner') THEN
        UPDATE public.system_bootstrap_state 
        SET is_bootstrapped = true, 
            bootstrapped_at = CURRENT_TIMESTAMP, 
            bootstrapped_by = CURRENT_USER 
        WHERE id = 1;
        
        RAISE EXCEPTION 'BOOTSTRAP_ALREADY_INITIALIZED: Existing Managing Partner detected. Bootstrap permanently closed.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    -- Generate primary identity
    v_new_account_id := gen_random_uuid();

    -- 1. Insert Managing Partner account
    INSERT INTO public.client_accounts (
        id, auth_user_id, legal_entity_name, primary_email, primary_phone, account_role, is_active
    ) VALUES (
        v_new_account_id, v_new_account_id, p_legal_name, v_clean_email, '+91 86069 18247', 'managing_partner', true
    );

    -- 2. Insert credentials
    INSERT INTO public.auth_credentials (
        account_id, email, password_hash, password_salt
    ) VALUES (
        v_new_account_id, v_clean_email, p_password_hash, p_password_salt
    );

    -- 3. Write audit log entry conforming to actual audit_logs schema
    -- Uses SHA-256 hash of localhost IP to satisfy non-null client_ip_hash constraint
    INSERT INTO public.audit_logs (
        id,
        event_type,
        actor_id,
        actor_role,
        target_entity,
        target_id,
        client_ip_hash,
        action_status,
        created_at
    ) VALUES (
        gen_random_uuid(),
        'INITIAL_MANAGING_PARTNER_BOOTSTRAP',
        v_new_account_id,
        'managing_partner',
        'client_accounts',
        v_new_account_id::text,
        encode(sha256('127.0.0.1'::bytea), 'hex'),
        'SUCCESS',
        CURRENT_TIMESTAMP
    );

    -- 4. Permanently close bootstrap state
    UPDATE public.system_bootstrap_state 
    SET is_bootstrapped = true, 
        bootstrapped_at = CURRENT_TIMESTAMP, 
        initial_managing_partner_id = v_new_account_id, 
        bootstrapped_by = CURRENT_USER 
    WHERE id = 1;

    RETURN v_new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp;

REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM craftegon_app_user;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM craftegon_gov_user;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM craftegon_auth_user;
GRANT EXECUTE ON FUNCTION public.sp_bootstrap_initial_managing_partner(VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO postgres, craftegon_migrator;
