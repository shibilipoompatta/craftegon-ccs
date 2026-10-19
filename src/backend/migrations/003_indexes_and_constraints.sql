-- ==============================================================================
-- CraftEgon CCS - Database Migration 003: Indexes & Constraints
-- Target: PostgreSQL 15+
-- Optimization: Query performance, foreign-key indexing, and deduplication
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Performance Indexes for Foreign Keys & Unique Identifiers
-- ------------------------------------------------------------------------------

-- Client Accounts
CREATE INDEX IF NOT EXISTS idx_client_accounts_auth_user ON client_accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_email ON client_accounts(primary_email);
CREATE INDEX IF NOT EXISTS idx_client_accounts_role ON client_accounts(account_role);

-- Lead Enquiries
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_ref ON lead_enquiries(lead_reference);
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_email_hash ON lead_enquiries(email_hash);
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_service_vertical ON lead_enquiries(service_id, vertical_id);
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_status ON lead_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_created ON lead_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_enquiries_retention ON lead_enquiries(expires_at) WHERE status != 'CONVERTED_TO_CASE';

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_ref ON cases(case_reference);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_officer ON cases(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON cases(statutory_deadline);
CREATE INDEX IF NOT EXISTS idx_cases_service ON cases(service_id);

-- Case Documents
CREATE INDEX IF NOT EXISTS idx_case_documents_case ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_quarantine ON case_documents(quarantine_status);
CREATE INDEX IF NOT EXISTS idx_case_documents_signature ON case_documents(file_signature);

-- Subscription Orders
CREATE INDEX IF NOT EXISTS idx_subscription_orders_ref ON subscription_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_client ON subscription_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_gateway ON subscription_orders(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_idempotency ON subscription_orders(idempotency_hash);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON subscription_orders(payment_status);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_entity, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type);
