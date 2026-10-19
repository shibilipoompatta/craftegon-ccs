-- ==============================================================================
-- CraftEgon CCS - Database Migration 005: Document Storage & Quarantine Policies
-- Target: PostgreSQL 15+
-- Security: Case document quarantine lifecycle, soft-deletion, and RLS update/delete
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Soft Deletion & Retention Support
-- ------------------------------------------------------------------------------
ALTER TABLE case_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_case_documents_deleted ON case_documents(deleted_at) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 2. Row-Level Security: Update Policy for case_documents
-- ------------------------------------------------------------------------------
-- Only authorized compliance staff or scanner service can update quarantine status or scan results.
DROP POLICY IF EXISTS case_documents_update_policy ON case_documents;
CREATE POLICY case_documents_update_policy ON case_documents
    FOR UPDATE
    USING (
        app_current_user_role() IN ('compliance_operator', 'managing_partner')
    );

-- ------------------------------------------------------------------------------
-- 3. Row-Level Security: Delete Policy for case_documents
-- ------------------------------------------------------------------------------
-- Authorized case owners or compliance staff may delete documents from their cases.
DROP POLICY IF EXISTS case_documents_delete_policy ON case_documents;
CREATE POLICY case_documents_delete_policy ON case_documents
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_documents.case_id
              AND (c.client_id = app_current_user_id() OR app_current_user_role() IN ('compliance_operator', 'managing_partner'))
        )
    );
