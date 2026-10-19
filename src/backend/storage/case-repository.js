/**
 * CraftEgon CCS - Case Repository & Data Access Layer
 * Server-backed case management enforcing PostgreSQL Row-Level Security
 * Supports both PostgresCaseStorage and InMemoryCaseStorage
 */

const crypto = require('node:crypto');
const { memoryStore } = require('./memory-store');
const { canTransition } = require('../models/state-machines');

class InMemoryCaseStorage {
  async createCase(data, context = {}) {
    return memoryStore.createCase(data, context);
  }

  async getCase(ref, context = {}) {
    return memoryStore.getCase(ref, context);
  }

  async listCases(context = {}, filters = {}) {
    let cases = memoryStore.listCases(context);
    if (filters.status) {
      cases = cases.filter(c => c.status === filters.status);
    }
    if (filters.vertical_id) {
      cases = cases.filter(c => c.vertical_id === filters.vertical_id);
    }
    return cases;
  }

  async updateCaseStatus(ref, newStatus, context = {}) {
    return memoryStore.updateCaseStatus(ref, newStatus, context);
  }

  async listCaseDocuments(caseId, context = {}) {
    return memoryStore.listCaseDocuments(caseId, context);
  }
}

class PostgresCaseStorage {
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
    
    // Execute inside transaction with local session context and unprivileged role for RLS enforcement
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

  async createCase(data, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only authorized compliance staff may create cases');
      err.statusCode = 403;
      throw err;
    }

    const id = data.id || crypto.randomUUID();
    const caseRef = data.case_reference || `CASE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const query = `
      INSERT INTO cases (
        id, case_reference, client_id, lead_id, service_id, vertical_id,
        title, status, priority, statutory_deadline
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *;
    `;

    const rows = await this.executeQuery(query, [
      id,
      caseRef,
      data.client_id,
      data.lead_id || null,
      data.service_id,
      data.vertical_id,
      data.title,
      data.status || 'IN_PROGRESS',
      data.priority || 'STANDARD',
      data.statutory_deadline || null
    ], context);

    return rows[0] || null;
  }

  async getCase(refOrId, context = {}) {
    const query = `
      SELECT * FROM cases
      WHERE case_reference = $1 OR id::text = $1
      LIMIT 1;
    `;
    const rows = await this.executeQuery(query, [refOrId], context);
    return rows[0] || null;
  }

  async listCases(context = {}, filters = {}) {
    let whereClauses = [];
    let params = [];

    if (filters.status) {
      params.push(filters.status);
      whereClauses.push(`status = $${params.length}`);
    }
    if (filters.vertical_id) {
      params.push(filters.vertical_id);
      whereClauses.push(`vertical_id = $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `
      SELECT * FROM cases
      ${whereSql}
      ORDER BY created_at DESC;
    `;

    return await this.executeQuery(query, params, context);
  }

  async updateCaseStatus(ref, newStatus, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only compliance staff can update case lifecycle status');
      err.statusCode = 403;
      throw err;
    }

    // Fetch existing case first to validate transition
    const existing = await this.getCase(ref, context);
    if (!existing) {
      return null;
    }

    if (!canTransition('case', existing.status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition case from ${existing.status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    const query = `
      UPDATE cases
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE case_reference = $2
      RETURNING *;
    `;

    const rows = await this.executeQuery(query, [newStatus, ref], context);
    return rows[0] || null;
  }

  async listCaseDocuments(caseId, context = {}) {
    const query = `
      SELECT id, case_id, uploaded_by, original_filename, file_size_bytes, mime_type, quarantine_status, created_at
      FROM case_documents
      WHERE case_id = $1
      ORDER BY created_at DESC;
    `;
    return await this.executeQuery(query, [caseId], context);
  }
}

class CaseRepository {
  constructor(storageAdapter = null) {
    this.adapter = storageAdapter || new InMemoryCaseStorage();
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  createCase(data, context) {
    return this.adapter.createCase(data, context);
  }

  getCase(ref, context) {
    return this.adapter.getCase(ref, context);
  }

  listCases(context, filters) {
    return this.adapter.listCases(context, filters);
  }

  updateCaseStatus(ref, newStatus, context) {
    return this.adapter.updateCaseStatus(ref, newStatus, context);
  }

  listCaseDocuments(caseId, context) {
    return this.adapter.listCaseDocuments(caseId, context);
  }
}

const caseRepository = new CaseRepository();

module.exports = {
  CaseRepository,
  caseRepository,
  InMemoryCaseStorage,
  PostgresCaseStorage
};
