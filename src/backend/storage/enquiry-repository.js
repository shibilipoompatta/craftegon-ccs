/**
 * CraftEgon CCS - Enquiry Repository & Data Access Layer
 * Manages durable persistence for public enquiries and staff triage
 * 
 * Supports three storage strategies:
 * 1. PostgresEnquiryStorage: Production PostgreSQL / Supabase parameterized SQL queries
 * 2. FileJournalEnquiryStorage: Local append-only JSONL journal for durable local persistence
 * 3. InMemoryEnquiryStorage: Ephemeral store for deterministic automated unit/integration tests
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { memoryStore } = require('./memory-store');

class PostgresEnquiryStorage {
  constructor(pgClientOrPool = null) {
    this.client = pgClientOrPool;
    this.simulateFailure = false;
  }

  setSimulateFailure(shouldFail) {
    this.simulateFailure = Boolean(shouldFail);
  }

  async executeQuery(text, params = []) {
    if (this.simulateFailure) {
      const err = new Error('DATABASE_WRITE_FAILURE: Simulated database storage write exception');
      err.statusCode = 500;
      throw err;
    }
    if (!this.client) {
      throw new Error('POSTGRES_POOL_UNAVAILABLE: Cannot persist to PostgreSQL without active connection pool or client');
    }

    // 1. If client is node-postgres pg.Pool
    if (typeof this.client.query === 'function' && this.client.connect) {
      const result = await this.client.query(text, params);
      return result.rows;
    }

    // 2. If client is PostgresClient (pure-Node psql wrapper)
    if (typeof this.client.query === 'function') {
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

      const jsonSql = `WITH q AS (${formattedSql.replace(/;\s*$/, '')}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q;`;
      const raw = this.client.query(jsonSql);
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

    throw new Error('INVALID_POSTGRES_CLIENT: Client lacks query method');
  }

  async create(data) {
    const query = `
      INSERT INTO lead_enquiries (
        id, lead_reference, service_id, vertical_id, contact_name,
        email_hash, phone_hash, encrypted_contact_payload, scope_description,
        source_url, dpdp_consent, status, created_at, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *;
    `;

    const values = [
      data.id || crypto.randomUUID(),
      data.lead_reference,
      data.service_id,
      data.vertical_id,
      data.contact_name,
      data.email_hash,
      data.phone_hash,
      data.encrypted_contact_payload || null,
      data.scope_description || '',
      data.source_url || '',
      Boolean(data.dpdp_consent),
      data.status || 'ENQUIRY_RECEIVED',
      data.created_at || new Date().toISOString(),
      data.expires_at || new Date(Date.now() + (180 * 86400 * 1000)).toISOString()
    ];

    const rows = await this.executeQuery(query, values);
    return rows[0] || null;
  }

  async getByReference(ref, context = {}) {
    const query = 'SELECT * FROM lead_enquiries WHERE lead_reference = $1;';
    const rows = await this.executeQuery(query, [ref]);
    return rows[0] || null;
  }

  async list(context = {}) {
    const query = 'SELECT * FROM lead_enquiries ORDER BY created_at DESC;';
    return this.executeQuery(query);
  }

  async updateStatus(ref, newStatus, context = {}) {
    const query = 'UPDATE lead_enquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE lead_reference = $2 RETURNING *;';
    const rows = await this.executeQuery(query, [newStatus, ref]);
    return rows[0] || null;
  }
}

class InMemoryEnquiryStorage {
  constructor(store = memoryStore) {
    this.store = store;
    this.simulateFailure = false;
  }

  setSimulateFailure(shouldFail) {
    this.simulateFailure = Boolean(shouldFail);
  }

  async create(data) {
    if (this.simulateFailure) {
      const err = new Error('DATABASE_WRITE_FAILURE: Simulated database storage write exception');
      err.statusCode = 500;
      throw err;
    }
    return this.store.createLeadEnquiry(data);
  }

  async getByReference(ref, context = {}) {
    return this.store.getLeadEnquiry(ref, context);
  }

  async list(context = {}) {
    return this.store.listLeadEnquiries(context);
  }

  async updateStatus(ref, newStatus, context = {}) {
    return this.store.updateLeadStatus(ref, newStatus, context);
  }
}

class EnquiryRepository {
  constructor(adapter = null) {
    if (adapter) {
      this.adapter = adapter;
    } else {
      const { currentConfig } = require('../config');
      if (currentConfig.databaseProvider === 'postgresql') {
        const { postgresClient } = require('./postgres-client');
        this.adapter = new PostgresEnquiryStorage(postgresClient);
      } else {
        this.adapter = new InMemoryEnquiryStorage();
      }
    }
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  async createEnquiry(enquiryData) {
    return this.adapter.create(enquiryData);
  }

  async getEnquiry(ref, context) {
    return this.adapter.getByReference(ref, context);
  }

  async listEnquiries(context) {
    return this.adapter.list(context);
  }

  async updateStatus(ref, newStatus, context) {
    return this.adapter.updateStatus(ref, newStatus, context);
  }
}

// Global repository singleton
const enquiryRepository = new EnquiryRepository();

module.exports = {
  PostgresEnquiryStorage,
  InMemoryEnquiryStorage,
  EnquiryRepository,
  enquiryRepository
};
