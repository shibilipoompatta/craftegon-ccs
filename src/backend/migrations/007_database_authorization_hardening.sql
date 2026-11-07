-- ==============================================================================
-- CraftEgon CCS - Database Migration 007: Database Authorization & Credential Hardening
-- Target: PostgreSQL 15+
-- Security: Triple connection pool role separation (app, auth, gov),
--           Column-level least privilege, role immutability, inactive registration enforcement,
--           single-use email verification boundary, and persistent bootstrap locking.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure Persistent Bootstrap Tracking Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_bootstrap_state (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_bootstrapped BOOLEAN NOT NULL DEFAULT false,
    bootstrapped_at TIMESTAMPTZ,
    initial_managing_partner_id UUID,
    bootstrapped_by VARCHAR(100) NOT NULL
);

INSERT INTO public.system_bootstrap_state (id, is_bootstrapped, bootstrapped_at, bootstrapped_by)
VALUES (1, false, NULL, 'system')
ON CONFLICT (id) DO NOTHING;

-- If a managing_partner already exists from previous migrations, lock bootstrap immediately
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.client_accounts WHERE account_role = 'managing_partner') THEN
        UPDATE public.system_bootstrap_state 
        SET is_bootstrapped = true, 
            bootstrapped_at = CURRENT_TIMESTAMP, 
            bootstrapped_by = 'migration_007' 
        WHERE id = 1 AND is_bootstrapped = false;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Schema Hardening
-- ------------------------------------------------------------------------------
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- ------------------------------------------------------------------------------
-- 3. Demote Utility Context Functions to SECURITY INVOKER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_current_user_id()
RETURNS UUID AS $$
BEGIN
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID;
    END IF;
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, pg_temp;

CREATE OR REPLACE FUNCTION public.app_current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        RETURN COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'anon');
    END IF;
    RETURN COALESCE(NULLIF(current_setting('app.current_user_role', true), ''), 'anon');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anon';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, pg_temp;

GRANT EXECUTE ON FUNCTION public.app_current_user_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_current_user_role() TO PUBLIC;

-- ------------------------------------------------------------------------------
-- 4. Registration & Staff Insertion Validation Trigger (SECURITY INVOKER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_fn_validate_registration_and_staff_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Ordinary public registration (craftegon_app_user)
    IF CURRENT_USER = 'craftegon_app_user' THEN
        -- Force client role unconditionally
        NEW.account_role := 'client';
        -- Public registration forces inactive accounts unless email verification is disabled in app context
        IF current_setting('app.require_email_verification', true) = 'off' THEN
            NEW.is_active := COALESCE(NEW.is_active, true);
        ELSE
            NEW.is_active := false;
        END IF;
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

    -- Database Administrator / Migration path (postgres)
    IF CURRENT_USER = 'postgres' THEN
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

DROP TRIGGER IF EXISTS trg_validate_registration_and_staff_insert ON public.client_accounts;
CREATE TRIGGER trg_validate_registration_and_staff_insert
    BEFORE INSERT ON public.client_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_validate_registration_and_staff_insert();

-- ------------------------------------------------------------------------------
-- 5. Role Immutability and Escalation Prevention Trigger (SECURITY INVOKER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_fn_prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_role <> OLD.account_role THEN
        -- Account role is strictly IMMUTABLE for all runtime roles
        -- Neither craftegon_app_user NOR craftegon_gov_user may mutate existing roles
        IF CURRENT_USER <> 'postgres' THEN
            RAISE EXCEPTION 'IMMUTABLE_ACCOUNT_ROLE: Modification of account_role on existing accounts is forbidden for database role %', CURRENT_USER
                USING ERRCODE = 'insufficient_privilege';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.client_accounts;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.client_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_prevent_role_escalation();

-- ------------------------------------------------------------------------------
-- 6. Single-Use Email Verification Token Consumer (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sp_consume_email_verification_token(p_token_hash VARCHAR)
RETURNS TABLE (
    account_id UUID,
    primary_email VARCHAR
) AS $$
DECLARE
    v_clean_hash VARCHAR(64);
BEGIN
    v_clean_hash := LOWER(TRIM(p_token_hash));
    IF v_clean_hash IS NULL OR LENGTH(v_clean_hash) <> 64 OR v_clean_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'INVALID_TOKEN_FORMAT: Token hash must be a 64-character hex string'
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    RETURN QUERY
    WITH target_token AS (
        SELECT s.id, s.account_id
        FROM public.auth_sessions s
        WHERE s.session_token_hash = v_clean_hash
          AND s.user_agent = 'VERIFICATION_TOKEN'
          AND s.revoked_at IS NULL
          AND s.expires_at > CURRENT_TIMESTAMP
        FOR UPDATE
        LIMIT 1
    ),
    consumed AS (
        UPDATE public.auth_sessions s
        SET revoked_at = CURRENT_TIMESTAMP
        FROM target_token t
        WHERE s.id = t.id
        RETURNING s.account_id
    ),
    activated AS (
        UPDATE public.client_accounts ca
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        FROM consumed c
        WHERE ca.id = c.account_id
          AND ca.is_active = false
        RETURNING ca.id, ca.primary_email
    )
    SELECT a.id AS account_id, a.primary_email
    FROM activated a;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.sp_consume_email_verification_token(VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sp_consume_email_verification_token(VARCHAR) FROM craftegon_gov_user;
REVOKE ALL ON FUNCTION public.sp_consume_email_verification_token(VARCHAR) FROM craftegon_auth_user;
GRANT EXECUTE ON FUNCTION public.sp_consume_email_verification_token(VARCHAR) TO craftegon_app_user, postgres;

-- ------------------------------------------------------------------------------
-- 7. Dedicated Authentication Credential Fetch Helper (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_auth_fetch_credentials_for_login(p_email VARCHAR)
RETURNS TABLE (
    account_id UUID,
    email VARCHAR,
    password_hash VARCHAR,
    password_salt VARCHAR,
    failed_attempts INT,
    locked_until TIMESTAMPTZ,
    legal_entity_name VARCHAR,
    cin_llpin VARCHAR,
    account_role VARCHAR,
    account_is_active BOOLEAN
) AS $$
DECLARE
    v_clean_email VARCHAR(255);
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    IF v_clean_email IS NULL OR v_clean_email = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        ac.account_id,
        ac.email,
        ac.password_hash,
        ac.password_salt,
        ac.failed_attempts,
        ac.locked_until,
        ca.legal_entity_name,
        ca.cin_llpin,
        ca.account_role,
        ca.is_active AS account_is_active
    FROM public.auth_credentials ac
    JOIN public.client_accounts ca ON ca.id = ac.account_id
    WHERE LOWER(ac.email) = v_clean_email
      AND ca.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.fn_auth_fetch_credentials_for_login(VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_auth_fetch_credentials_for_login(VARCHAR) FROM craftegon_app_user;
REVOKE ALL ON FUNCTION public.fn_auth_fetch_credentials_for_login(VARCHAR) FROM craftegon_gov_user;
GRANT EXECUTE ON FUNCTION public.fn_auth_fetch_credentials_for_login(VARCHAR) TO craftegon_auth_user, postgres;

-- ------------------------------------------------------------------------------
-- 8. Persistent One-Time Bootstrap Procedure (SECURITY DEFINER)
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
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('craftegon_bootstrap_lock'));

    SELECT is_bootstrapped INTO v_is_bootstrapped 
    FROM public.system_bootstrap_state 
    WHERE id = 1 
    FOR UPDATE;

    IF v_is_bootstrapped IS TRUE THEN
        RAISE EXCEPTION 'BOOTSTRAP_PERMANENTLY_CLOSED: System has already completed initial bootstrap. Operation permanently disabled.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    IF EXISTS (SELECT 1 FROM public.client_accounts WHERE account_role = 'managing_partner') THEN
        UPDATE public.system_bootstrap_state 
        SET is_bootstrapped = true, 
            bootstrapped_at = CURRENT_TIMESTAMP, 
            bootstrapped_by = CURRENT_USER 
        WHERE id = 1;
        
        RAISE EXCEPTION 'BOOTSTRAP_ALREADY_INITIALIZED: Existing Managing Partner detected. Bootstrap permanently closed.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    INSERT INTO public.client_accounts (
        id, legal_entity_name, primary_email, primary_phone, account_role, is_active
    ) VALUES (
        gen_random_uuid(), p_legal_name, LOWER(TRIM(p_email)), '+91 86069 18247', 'managing_partner', true
    ) RETURNING id INTO v_new_account_id;

    INSERT INTO public.auth_credentials (account_id, email, password_hash, password_salt)
    VALUES (v_new_account_id, LOWER(TRIM(p_email)), p_password_hash, p_password_salt);

    INSERT INTO public.audit_logs (id, event_type, actor_id, target_entity, target_id, ip_address)
    VALUES (gen_random_uuid(), 'INITIAL_MANAGING_PARTNER_BOOTSTRAP', v_new_account_id, 'client_accounts', v_new_account_id, '127.0.0.1');

    UPDATE public.system_bootstrap_state 
    SET is_bootstrapped = true, 
        bootstrapped_at = CURRENT_TIMESTAMP, 
        initial_managing_partner_id = v_new_account_id, 
        bootstrapped_by = CURRENT_USER 
    WHERE id = 1;

    RETURN v_new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner FROM craftegon_app_user;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner FROM craftegon_gov_user;
REVOKE ALL ON FUNCTION public.sp_bootstrap_initial_managing_partner FROM craftegon_auth_user;
GRANT EXECUTE ON FUNCTION public.sp_bootstrap_initial_managing_partner TO postgres, craftegon_migrator;

-- ------------------------------------------------------------------------------
-- 9. Table and Column Privilege Hardening
-- ------------------------------------------------------------------------------

-- Ensure USAGE on schema public for all runtime roles
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_app_user') THEN
        GRANT USAGE ON SCHEMA public TO craftegon_app_user;
    END IF;
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_auth_user') THEN
        GRANT USAGE ON SCHEMA public TO craftegon_auth_user;
    END IF;
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'craftegon_gov_user') THEN
        GRANT USAGE ON SCHEMA public TO craftegon_gov_user;
    END IF;
END $$;

-- A. auth_credentials (Isolated to craftegon_auth_user)
REVOKE ALL ON public.auth_credentials FROM PUBLIC;
REVOKE ALL ON public.auth_credentials FROM craftegon_app_user;
REVOKE ALL ON public.auth_credentials FROM craftegon_gov_user;

GRANT SELECT, INSERT, UPDATE ON public.auth_credentials TO craftegon_auth_user;

-- Allow gov user to insert initial credentials during staff provisioning
GRANT INSERT (account_id, email, password_hash, password_salt)
ON public.auth_credentials TO craftegon_gov_user;

-- B. client_accounts
REVOKE ALL ON public.client_accounts FROM PUBLIC;
REVOKE ALL ON public.client_accounts FROM craftegon_app_user;
REVOKE ALL ON public.client_accounts FROM craftegon_auth_user;
REVOKE ALL ON public.client_accounts FROM craftegon_gov_user;

-- Table-level SELECT protected by Row-Level Security
GRANT SELECT ON public.client_accounts TO craftegon_app_user;
GRANT SELECT ON public.client_accounts TO craftegon_auth_user;
GRANT SELECT ON public.client_accounts TO craftegon_gov_user;

-- craftegon_app_user: INSERT for public registration, column-level UPDATE on safe profile fields
GRANT INSERT (id, auth_user_id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role, is_active)
ON public.client_accounts TO craftegon_app_user;

GRANT UPDATE (legal_entity_name, cin_llpin, primary_phone, updated_at)
ON public.client_accounts TO craftegon_app_user;

-- craftegon_gov_user: staff INSERT, status UPDATE
GRANT INSERT (id, auth_user_id, legal_entity_name, cin_llpin, primary_email, primary_phone, account_role, is_active)
ON public.client_accounts TO craftegon_gov_user;

GRANT UPDATE (is_active, updated_at)
ON public.client_accounts TO craftegon_gov_user;

-- C. auth_sessions
REVOKE ALL ON public.auth_sessions FROM PUBLIC;
REVOKE ALL ON public.auth_sessions FROM craftegon_app_user;
REVOKE ALL ON public.auth_sessions FROM craftegon_auth_user;
REVOKE ALL ON public.auth_sessions FROM craftegon_gov_user;

GRANT SELECT, INSERT ON public.auth_sessions TO craftegon_app_user;
GRANT UPDATE (revoked_at) ON public.auth_sessions TO craftegon_app_user;

GRANT SELECT, INSERT ON public.auth_sessions TO craftegon_auth_user;
GRANT UPDATE (revoked_at) ON public.auth_sessions TO craftegon_auth_user;

GRANT SELECT ON public.auth_sessions TO craftegon_gov_user;
GRANT UPDATE (revoked_at) ON public.auth_sessions TO craftegon_gov_user;

-- D. audit_logs
REVOKE ALL ON public.audit_logs FROM PUBLIC;
REVOKE ALL ON public.audit_logs FROM craftegon_app_user;
REVOKE ALL ON public.audit_logs FROM craftegon_auth_user;
REVOKE ALL ON public.audit_logs FROM craftegon_gov_user;
GRANT SELECT, INSERT ON public.audit_logs TO craftegon_app_user;
GRANT INSERT ON public.audit_logs TO craftegon_auth_user;
GRANT SELECT, INSERT ON public.audit_logs TO craftegon_gov_user;

-- ------------------------------------------------------------------------------
-- 10. Row-Level Security Policies Hardening
-- ------------------------------------------------------------------------------

-- A. client_accounts
DROP POLICY IF EXISTS client_accounts_select_policy ON public.client_accounts;
CREATE POLICY client_accounts_select_policy ON public.client_accounts
    FOR SELECT
    USING (
        id = public.app_current_user_id() 
        OR auth_user_id = public.app_current_user_id()
        OR public.app_current_user_role() IN ('compliance_operator', 'managing_partner')
        OR CURRENT_USER IN ('craftegon_gov_user', 'craftegon_auth_user', 'postgres')
    );

DROP POLICY IF EXISTS client_accounts_insert_policy ON public.client_accounts;
CREATE POLICY client_accounts_insert_policy ON public.client_accounts
    FOR INSERT
    WITH CHECK (
        account_role = 'client'
        OR public.app_current_user_role() = 'managing_partner'
        OR CURRENT_USER IN ('craftegon_gov_user', 'postgres')
    );

DROP POLICY IF EXISTS client_accounts_update_policy ON public.client_accounts;
CREATE POLICY client_accounts_update_policy ON public.client_accounts
    FOR UPDATE
    USING (
        id = public.app_current_user_id() 
        OR CURRENT_USER = 'craftegon_gov_user'
        OR CURRENT_USER = 'postgres'
    )
    WITH CHECK (
        id = public.app_current_user_id() 
        OR CURRENT_USER = 'craftegon_gov_user'
        OR CURRENT_USER = 'postgres'
    );

-- B. auth_credentials
DROP POLICY IF EXISTS auth_credentials_policy ON public.auth_credentials;
DROP POLICY IF EXISTS auth_credentials_select_policy ON public.auth_credentials;
DROP POLICY IF EXISTS auth_credentials_insert_policy ON public.auth_credentials;
DROP POLICY IF EXISTS auth_credentials_update_policy ON public.auth_credentials;
CREATE POLICY auth_credentials_policy ON public.auth_credentials
    FOR ALL
    USING (
        CURRENT_USER IN ('craftegon_auth_user', 'craftegon_gov_user', 'postgres')
    )
    WITH CHECK (
        CURRENT_USER IN ('craftegon_auth_user', 'craftegon_gov_user', 'postgres')
    );

-- C. auth_sessions
DROP POLICY IF EXISTS auth_sessions_policy ON public.auth_sessions;
DROP POLICY IF EXISTS auth_sessions_select_policy ON public.auth_sessions;
DROP POLICY IF EXISTS auth_sessions_insert_policy ON public.auth_sessions;
DROP POLICY IF EXISTS auth_sessions_update_policy ON public.auth_sessions;
CREATE POLICY auth_sessions_policy ON public.auth_sessions
    FOR ALL
    USING (
        account_id = public.app_current_user_id()
        OR CURRENT_USER IN ('craftegon_auth_user', 'craftegon_gov_user', 'postgres')
    )
    WITH CHECK (
        account_id = public.app_current_user_id()
        OR CURRENT_USER IN ('craftegon_auth_user', 'craftegon_gov_user', 'postgres')
    );
