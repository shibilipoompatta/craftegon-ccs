-- ==============================================================================
-- CRAFTEGON CORPORATE SERVICES (CCS)
-- Cloudflare D1 Serverless Relational Database Schema
-- Database Name: ccs-compliance-db
-- Dialect: SQLite 3 / Cloudflare D1
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Clients Table (Corporate Accounts & Primary Founders)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,                           -- UUID / CUST-YYYYMMDD-XXXX
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    company_designation TEXT DEFAULT 'Director',
    kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    dpdp_consent_timestamp TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- 2. Corporate Entities Table (Companies, LLPs, Non-Profits)
CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,                           -- ENT-YYYYMMDD-XXXX
    client_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'LLP', 'OPC', 'SECTION_8', 
        'PARTNERSHIP', 'PROPRIETORSHIP', 'FOREIGN_SUBSIDIARY'
    )),
    cin_llpin TEXT UNIQUE,                         -- e.g. U72900KL2026PTC012345 or AAP-1234
    pan TEXT,
    gstin TEXT,
    incorporation_date TEXT,
    authorized_capital INTEGER DEFAULT 100000,     -- In Indian Rupees (INR)
    paid_up_capital INTEGER DEFAULT 10000,
    registered_office_address TEXT,
    state_jurisdiction TEXT DEFAULT 'Kerala',
    roc_jurisdiction TEXT DEFAULT 'RoC Ernakulam (Kerala)',
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entities_cin ON entities(cin_llpin);
CREATE INDEX IF NOT EXISTS idx_entities_client_id ON entities(client_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);

-- 3. Compliance Milestones & Filings Table
CREATE TABLE IF NOT EXISTS compliance_milestones (
    id TEXT PRIMARY KEY,                           -- MLS-YYYYMMDD-XXXX
    entity_id TEXT NOT NULL,
    financial_year TEXT NOT NULL,                  -- e.g. '2025-26'
    form_name TEXT NOT NULL CHECK (form_name IN (
        'SPICe+', 'INC-20A', 'DIR-3_KYC', 'AOC-4', 'AOC-4_XBRL', 
        'MGT-7', 'MGT-7A', 'ADT-1', 'DPT-3', 'FORM_11', 'FORM_8', 
        'GSTR-1', 'GSTR-3B', 'GSTR-9', 'ITR-6', 'FORM_3CEB', 'TM-A'
    )),
    statutory_due_date TEXT NOT NULL,              -- YYYY-MM-DD
    extended_due_date TEXT,                        -- If MCA/CBDT circular extends
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'DOCUMENTS_AWAITING', 'REVIEW_UNDERWAY', 
        'CHALLAN_GENERATED', 'UDIN_ATTESTED', 'FILED', 'OVERDUE'
    )),
    statutory_challan_amount INTEGER DEFAULT 0,    -- In INR (Pure Agent Pass-Through)
    professional_fee_amount INTEGER DEFAULT 0,     -- In INR (Taxable at 18% GST)
    filing_srn TEXT,                               -- Official MCA SRN / Acknowledgement
    udin TEXT,                                     -- ICAI/ICSI Unique Document ID
    empanelled_professional_id TEXT,               -- CA/CS Member ID who certified
    filed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_entity ON compliance_milestones(entity_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON compliance_milestones(statutory_due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON compliance_milestones(status);

-- 4. Encrypted Document Vault Registry (Metadata for Cloudflare R2 Objects)
CREATE TABLE IF NOT EXISTS vault_documents (
    id TEXT PRIMARY KEY,                           -- DOC-YYYYMMDD-XXXX
    entity_id TEXT NOT NULL,
    document_category TEXT NOT NULL CHECK (document_category IN (
        'DIRECTOR_KYC', 'DSC_CERTIFICATE', 'INCORPORATION_DOSSIER', 
        'MOA_AOA', 'ROC_CHALLAN_RECEIPT', 'BOARD_MINUTES', 
        'TAX_RETURN_ACK', 'TRADE_LICENSE', 'CONTRACT_AGREEMENT'
    )),
    file_name TEXT NOT NULL,
    r2_object_key TEXT NOT NULL UNIQUE,            -- Path inside Cloudflare R2 bucket
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    sha256_checksum TEXT NOT NULL,                 -- Integrity verification hash
    is_client_accessible INTEGER DEFAULT 1,
    uploaded_by TEXT NOT NULL,
    expires_at TEXT,                               -- Optional retention expiration
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vault_entity ON vault_documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_vault_category ON vault_documents(document_category);

-- 5. Institutional Audit Logs (DPDP Act & Security Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_identity TEXT NOT NULL,                  -- User ID or Cloudflare Access Email
    action TEXT NOT NULL,                          -- e.g. 'VAULT_DOWNLOAD', 'CHALLAN_UPLOAD'
    target_resource TEXT NOT NULL,                 -- e.g. 'doc:DOC-2026-F9A1B2'
    ip_address TEXT,
    user_agent TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
