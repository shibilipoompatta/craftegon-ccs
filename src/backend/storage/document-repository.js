/**
 * CraftEgon CCS - Document Repository & Data Access Layer
 * Server-backed document management enforcing PostgreSQL Row-Level Security
 * Supports both PostgresDocumentStorage and InMemoryDocumentStorage
 */

const crypto = require('node:crypto');
const { memoryStore } = require('./memory-store');

class InMemoryDocumentStorage {
  async createDocument(data, context = {}) {
    return memoryStore.createCaseDocument(data, context);
  }

  async getDocumentById(id, context = {}) {
    const doc = memoryStore.getCaseDocument(id, context);
    if (!doc || doc.deleted_at) return null;
    return doc;
  }

  async listDocumentsForCase(caseId, context = {}) {
    const docs = memoryStore.listCaseDocuments(caseId, context);
    return docs.filter(d => !d.deleted_at);
  }

  async updateQuarantineStatus(id, newStatus, scanResults = null, cleanPath = null, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only authorized compliance staff may update quarantine status');
      err.statusCode = 403;
      throw err;
    }

    const doc = memoryStore.documents.get(id);
    if (!doc || doc.deleted_at) return null;

    doc.quarantine_status = newStatus;
    if (scanResults) doc.scan_results = scanResults;
    if (cleanPath) doc.storage_path = cleanPath;
    return doc;
  }

  async deleteDocument(id, context = {}) {
    const doc = memoryStore.documents.get(id);
    if (!doc || doc.deleted_at) return null;

    const caseItem = Array.from(memoryStore.cases.values()).find(c => c.id === doc.case_id);
    if (!caseItem) return null;

    const isOwner = context.userId === caseItem.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) {
      const err = new Error('FORBIDDEN: Cannot delete documents owned by another tenant');
      err.statusCode = 403;
      throw err;
    }

    doc.deleted_at = new Date().toISOString();
    return doc;
  }
}

class PostgresDocumentStorage {
  constructor(pgClient, defaultAppRole = 'craftegon_test_app_user') {
    this.client = pgClient;
    this.defaultAppRole = defaultAppRole;
  }

  async executeQuery(text, params = [], context = {}) {
    if (!this.client) {
      throw new Error('POSTGRES_CLIENT_UNAVAILABLE: Cannot query PostgreSQL without active client');
    }

    let formattedSql = text;
    params.forEach((val, idx) => {
      let sqlVal = 'NULL';
      if (val !== null && val !== undefined) {
        if (typeof val === 'boolean') {
          sqlVal = val ? 'true' : 'false';
        } else if (typeof val === 'number') {
          sqlVal = String(val);
        } else if (typeof val === 'object') {
          sqlVal = `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
        } else {
          sqlVal = `'${String(val).replace(/'/g, "''")}'`;
        }
      }
      const placeholder = new RegExp(`\\$${idx + 1}(?![0-9])`, 'g');
      formattedSql = formattedSql.replace(placeholder, sqlVal);
    });

    formattedSql = formattedSql.replace(/;\s*$/, '');
    const isMutation = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(formattedSql);
    const hasReturning = /\bRETURNING\b/i.test(formattedSql);
    if (isMutation && !hasReturning) {
      formattedSql += ' RETURNING *';
    }

    const jsonSql = `WITH q AS (${formattedSql}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q;`;

    // Execute with transaction-scoped RLS role and session variables
    const queryOpts = {
      userId: context.userId || '',
      userRole: context.role || 'anon',
      dbRole: context.dbRole || this.defaultAppRole
    };

    const raw = this.client.query(jsonSql, queryOpts);
    try {
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end >= start) {
        return JSON.parse(raw.slice(start, end + 1));
      }
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  async createDocument(data, context = {}) {
    const id = data.id || crypto.randomUUID();
    const rows = await this.executeQuery(
      `INSERT INTO case_documents (
        id, case_id, uploaded_by, original_filename, storage_path,
        file_signature, file_size_bytes, mime_type, quarantine_status, scan_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`,
      [
        id,
        data.case_id,
        data.uploaded_by || context.userId,
        data.original_filename,
        data.storage_path,
        data.file_signature,
        data.file_size_bytes,
        data.mime_type,
        data.quarantine_status || 'QUARANTINE',
        data.scan_results || null
      ],
      context
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async getDocumentById(id, context = {}) {
    const rows = await this.executeQuery(
      `SELECT * FROM case_documents WHERE id = $1 AND (deleted_at IS NULL);`,
      [id],
      context
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async listDocumentsForCase(caseId, context = {}) {
    return await this.executeQuery(
      `SELECT * FROM case_documents WHERE case_id = $1 AND (deleted_at IS NULL) ORDER BY created_at DESC;`,
      [caseId],
      context
    );
  }

  async updateQuarantineStatus(id, newStatus, scanResults = null, cleanPath = null, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only authorized compliance staff may update quarantine status');
      err.statusCode = 403;
      throw err;
    }

    let query = `UPDATE case_documents SET quarantine_status = $2, scan_results = $3`;
    const params = [id, newStatus, scanResults];

    if (cleanPath) {
      query += `, storage_path = $4 WHERE id = $1 RETURNING *;`;
      params.push(cleanPath);
    } else {
      query += ` WHERE id = $1 RETURNING *;`;
    }

    const rows = await this.executeQuery(query, params, context);
    return rows.length > 0 ? rows[0] : null;
  }

  async deleteDocument(id, context = {}) {
    const rows = await this.executeQuery(
      `UPDATE case_documents SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`,
      [id],
      context
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

class DocumentRepository {
  constructor(storageAdapter = new InMemoryDocumentStorage()) {
    this.storage = storageAdapter;
  }

  setStorage(storageAdapter) {
    this.storage = storageAdapter;
  }

  setAdapter(storageAdapter) {
    this.storage = storageAdapter;
  }

  async createDocument(data, context = {}) {
    return this.storage.createDocument(data, context);
  }

  async getDocumentById(id, context = {}) {
    return this.storage.getDocumentById(id, context);
  }

  async listDocumentsForCase(caseId, context = {}) {
    return this.storage.listDocumentsForCase(caseId, context);
  }

  async updateQuarantineStatus(id, newStatus, scanResults = null, cleanPath = null, context = {}) {
    return this.storage.updateQuarantineStatus(id, newStatus, scanResults, cleanPath, context);
  }

  async deleteDocument(id, context = {}) {
    return this.storage.deleteDocument(id, context);
  }
}

const documentRepository = new DocumentRepository();

module.exports = {
  InMemoryDocumentStorage,
  PostgresDocumentStorage,
  DocumentRepository,
  documentRepository
};
