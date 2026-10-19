/**
 * CraftEgon CCS - In-Memory Database Store & RLS Policy Simulator
 * Implements the 6 PostgreSQL tables and simulates engine-level Row-Level Security
 * for local development and deterministic automated testing.
 */

const crypto = require('node:crypto');
const { canTransition } = require('../models/state-machines');

class MemoryStore {
  constructor() {
    this.accounts = new Map();       // id -> account
    this.enquiries = new Map();      // lead_reference -> enquiry
    this.cases = new Map();          // case_reference -> case
    this.documents = new Map();      // id -> document
    this.orders = new Map();         // order_reference -> order
    this.alertPreferences = new Map(); // account_id -> preferences
    this.alerts = new Map();           // alert_id -> alert
    this.deliveryLogs = [];
    this.auditLogs = [];
  }

  reset() {
    this.accounts.clear();
    this.enquiries.clear();
    this.cases.clear();
    this.documents.clear();
    this.orders.clear();
    this.alertPreferences.clear();
    this.alerts.clear();
    this.deliveryLogs = [];
    this.auditLogs = [];
  }

  // --------------------------------------------------------------------------
  // 1. Client Accounts
  // --------------------------------------------------------------------------
  createClientAccount(data) {
    const id = data.id || crypto.randomUUID();
    const account = {
      id,
      auth_user_id: data.auth_user_id || id,
      legal_entity_name: data.legal_entity_name || 'Individual Client',
      cin_llpin: data.cin_llpin || null,
      primary_email: data.primary_email,
      primary_phone: data.primary_phone,
      account_role: data.account_role || 'client',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.accounts.set(id, account);
    return account;
  }

  getClientAccount(id, context = {}) {
    const account = this.accounts.get(id);
    if (!account) return null;

    // RLS: Client can only view their own account; staff can view all
    const isOwner = context.userId === account.id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) {
      return null; // RLS filters record out
    }

    return account;
  }

  // --------------------------------------------------------------------------
  // 2. Lead Enquiries
  // --------------------------------------------------------------------------
  createLeadEnquiry(data) {
    const id = data.id || crypto.randomUUID();
    const lead_reference = data.lead_reference;
    const enquiry = {
      id,
      lead_reference,
      service_id: data.service_id || 'GENERAL',
      vertical_id: data.vertical_id || 'V01',
      contact_name: data.contact_name,
      email_hash: data.email_hash,
      phone_hash: data.phone_hash,
      encrypted_contact_payload: data.encrypted_contact_payload || null,
      scope_description: data.scope_description || '',
      source_url: data.source_url || '',
      dpdp_consent: Boolean(data.dpdp_consent),
      status: 'ENQUIRY_RECEIVED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (180 * 86400 * 1000)).toISOString()
    };
    this.enquiries.set(lead_reference, enquiry);
    return enquiry;
  }

  getLeadEnquiry(ref, context = {}) {
    // RLS: Only staff can inspect lead enquiries
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) return null;

    return this.enquiries.get(ref) || null;
  }

  listLeadEnquiries(context = {}) {
    // RLS: Staff only
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) return [];

    return Array.from(this.enquiries.values());
  }

  updateLeadStatus(ref, newStatus, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }

    const lead = this.enquiries.get(ref);
    if (!lead) return null;

    if (!canTransition('lead', lead.status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition lead from ${lead.status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    lead.status = newStatus;
    lead.updated_at = new Date().toISOString();
    return lead;
  }

  // --------------------------------------------------------------------------
  // 3. Cases
  // --------------------------------------------------------------------------
  createCase(data, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only authorized compliance staff may create cases');
      err.statusCode = 403;
      throw err;
    }

    const id = data.id || crypto.randomUUID();
    const case_reference = data.case_reference;
    const caseItem = {
      id,
      case_reference,
      client_id: data.client_id,
      lead_id: data.lead_id || null,
      service_id: data.service_id,
      vertical_id: data.vertical_id,
      title: data.title,
      status: data.status || 'IN_PROGRESS',
      priority: data.priority || 'STANDARD',
      assigned_officer_id: data.assigned_officer_id || null,
      statutory_deadline: data.statutory_deadline || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.cases.set(case_reference, caseItem);
    return caseItem;
  }

  getCase(refOrId, context = {}) {
    let caseItem = this.cases.get(refOrId);
    if (!caseItem) {
      for (const item of this.cases.values()) {
        if (item.id === refOrId) {
          caseItem = item;
          break;
        }
      }
    }
    if (!caseItem) return null;

    // RLS: Customer can only view if client_id === context.userId
    const isOwner = context.userId === caseItem.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) {
      return null; // RLS isolates tenant
    }

    return caseItem;
  }

  listCases(context = {}) {
    const all = Array.from(this.cases.values());
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (isStaff) {
      return all;
    }

    if (!context.userId) {
      return [];
    }

    // RLS filter
    return all.filter(c => c.client_id === context.userId);
  }

  updateCaseStatus(ref, newStatus, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only compliance staff can update case lifecycle status');
      err.statusCode = 403;
      throw err;
    }

    const caseItem = this.cases.get(ref);
    if (!caseItem) return null;

    if (!canTransition('case', caseItem.status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition case from ${caseItem.status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    caseItem.status = newStatus;
    caseItem.updated_at = new Date().toISOString();
    return caseItem;
  }

  // --------------------------------------------------------------------------
  // 4. Case Documents
  // --------------------------------------------------------------------------
  createCaseDocument(data, context = {}) {
    // Find parent case
    const caseItem = Array.from(this.cases.values()).find(c => c.id === data.case_id);
    if (!caseItem) {
      const err = new Error('NOT_FOUND: Target case not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = context.userId === caseItem.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) {
      const err = new Error('FORBIDDEN: Cannot upload documents to cases owned by another tenant');
      err.statusCode = 403;
      throw err;
    }

    const id = data.id || crypto.randomUUID();
    const doc = {
      id,
      case_id: data.case_id,
      uploaded_by: context.userId || data.uploaded_by,
      original_filename: data.original_filename,
      storage_path: data.storage_path || `cases/${caseItem.case_reference}/quarantine/${id}`,
      file_signature: data.file_signature,
      file_size_bytes: data.file_size_bytes,
      mime_type: data.mime_type,
      quarantine_status: data.quarantine_status || 'QUARANTINE',
      scan_results: data.scan_results || null,
      created_at: new Date().toISOString()
    };
    this.documents.set(id, doc);
    return doc;
  }

  getCaseDocument(id, context = {}) {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const caseItem = Array.from(this.cases.values()).find(c => c.id === doc.case_id);
    if (!caseItem) return null;

    const isOwner = context.userId === caseItem.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    // RLS: Client can ONLY access if they own the case AND status is CLEAN
    if (isOwner) {
      if (doc.quarantine_status !== 'CLEAN') {
        // Quarantined, infected, or unverified documents are hidden/blocked
        return null;
      }
      return doc;
    }

    if (isStaff) {
      return doc;
    }

    return null;
  }

  listCaseDocuments(caseId, context = {}) {
    const caseItem = Array.from(this.cases.values()).find(c => c.id === caseId || c.case_reference === caseId);
    if (!caseItem) return [];

    const isOwner = context.userId === caseItem.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) {
      return []; // RLS isolation
    }

    const allDocs = Array.from(this.documents.values()).filter(d => d.case_id === caseItem.id);

    if (isStaff) {
      return allDocs;
    }

    // Owner only sees CLEAN documents
    return allDocs.filter(d => d.quarantine_status === 'CLEAN');
  }

  updateDocumentQuarantine(id, newStatus, scanResults = null, context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) {
      const err = new Error('FORBIDDEN: Only staff/scanner service can update quarantine status');
      err.statusCode = 403;
      throw err;
    }

    const doc = this.documents.get(id);
    if (!doc) return null;

    doc.quarantine_status = newStatus;
    if (scanResults) doc.scan_results = scanResults;
    return doc;
  }

  // --------------------------------------------------------------------------
  // 5. Subscription Orders
  // --------------------------------------------------------------------------
  createSubscriptionOrder(data, context = {}) {
    const id = data.id || crypto.randomUUID();
    const order_reference = data.order_reference;
    const order = {
      id,
      order_reference,
      client_id: data.client_id || context.userId,
      tier_name: data.tier_name,
      billing_cycle: data.billing_cycle,
      amount_subtotal_paise: data.amount_subtotal_paise,
      amount_tax_paise: data.amount_tax_paise,
      amount_total_paise: data.amount_total_paise,
      currency: data.currency || 'INR',
      gateway_provider: data.gateway_provider || 'RAZORPAY_SANDBOX',
      gateway_order_id: data.gateway_order_id || null,
      payment_status: 'ORDER_CREATED',
      idempotency_hash: data.idempotency_hash || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.orders.set(order_reference, order);
    return order;
  }

  getSubscriptionOrder(ref, context = {}) {
    const order = this.orders.get(ref);
    if (!order) return null;

    const isOwner = context.userId === order.client_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);

    if (!isOwner && !isStaff) return null;
    return order;
  }

  getSubscriptionOrderByGatewayId(gatewayOrderId) {
    if (!gatewayOrderId) return null;
    return Array.from(this.orders.values()).find(o => o.gateway_order_id === gatewayOrderId) || null;
  }

  listSubscriptionOrders(context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    const allOrders = Array.from(this.orders.values());

    if (isStaff) {
      return allOrders;
    }

    if (context.userId) {
      return allOrders.filter(o => o.client_id === context.userId);
    }

    return [];
  }

  updateSubscriptionOrderStatus(ref, newStatus, extraData = {}, context = {}) {
    const order = this.orders.get(ref);
    if (!order) return null;

    if (!canTransition('payment', order.payment_status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition payment from ${order.payment_status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    order.payment_status = newStatus;
    order.updated_at = new Date().toISOString();
    Object.assign(order, extraData);
    return order;
  }

  // --------------------------------------------------------------------------
  // 6. Alert Preferences & Consent
  // --------------------------------------------------------------------------
  setAlertPreferences(accountId, data, context = {}) {
    const isOwner = context.userId === accountId;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isOwner && !isStaff) {
      const err = new Error('FORBIDDEN_ACCESS: Cannot modify notification preferences for other accounts');
      err.statusCode = 403;
      throw err;
    }

    const consentGranted = Boolean(data.consent_granted);
    const existing = this.alertPreferences.get(accountId) || {};

    const preferences = {
      account_id: accountId,
      consent_granted: consentGranted,
      consent_timestamp: consentGranted ? (existing.consent_timestamp || new Date().toISOString()) : null,
      channels: Array.isArray(data.channels) ? [...data.channels] : (existing.channels || ['email']),
      topics: Array.isArray(data.topics) ? [...data.topics] : (existing.topics || ['MCA_FILINGS', 'TAX_DEADLINES']),
      jurisdictions: Array.isArray(data.jurisdictions) ? [...data.jurisdictions] : (existing.jurisdictions || ['IN-CENTRAL']),
      frequency: data.frequency || existing.frequency || 'IMMEDIATE',
      updated_at: new Date().toISOString()
    };

    this.alertPreferences.set(accountId, preferences);
    return preferences;
  }

  getAlertPreferences(accountId, context = {}) {
    const isOwner = context.userId === accountId;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isOwner && !isStaff) {
      return null; // RLS isolates customer preferences
    }

    const existing = this.alertPreferences.get(accountId);
    if (existing) return existing;

    // Default un-consented preference record
    return {
      account_id: accountId,
      consent_granted: false,
      consent_timestamp: null,
      channels: [],
      topics: [],
      jurisdictions: ['IN-CENTRAL'],
      frequency: 'IMMEDIATE',
      updated_at: null
    };
  }

  // --------------------------------------------------------------------------
  // 7. Alert Records & Lifecycle
  // --------------------------------------------------------------------------
  createAlert(data, context = {}) {
    const isOwner = context.userId === data.account_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (context.userId && !isOwner && !isStaff) {
      const err = new Error('FORBIDDEN_ACCESS: Cannot dispatch alert for another account');
      err.statusCode = 403;
      throw err;
    }

    const alertId = data.alert_id || `ALT-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const alert = {
      alert_id: alertId,
      account_id: data.account_id,
      event_id: data.event_id,
      channel: data.channel || 'email',
      alert_version: data.alert_version || 1,
      status: data.status || 'CREATED',
      idempotency_key: data.idempotency_key || null,
      attempt_count: data.attempt_count || 0,
      provider_message_id: data.provider_message_id || null,
      last_error: data.last_error || null,
      created_at: now,
      updated_at: now
    };

    this.alerts.set(alertId, alert);
    return alert;
  }

  getAlert(alertId, context = {}) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const isOwner = context.userId === alert.account_id;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isOwner && !isStaff) {
      return null;
    }

    return alert;
  }

  listAlerts(accountId, context = {}) {
    const isOwner = context.userId === accountId;
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isOwner && !isStaff) {
      return [];
    }

    return Array.from(this.alerts.values()).filter(a => a.account_id === accountId);
  }

  findAlertByIdempotencyKey(key) {
    if (!key) return null;
    for (const alert of this.alerts.values()) {
      if (alert.idempotency_key === key) {
        return alert;
      }
    }
    return null;
  }

  updateAlertStatus(alertId, newStatus, extraData = {}, context = {}) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    if (!canTransition('alert', alert.status, newStatus)) {
      const err = new Error(`INVALID_TRANSITION: Cannot transition alert from ${alert.status} to ${newStatus}`);
      err.statusCode = 422;
      throw err;
    }

    alert.status = newStatus;
    alert.updated_at = new Date().toISOString();
    Object.assign(alert, extraData);
    return alert;
  }

  // --------------------------------------------------------------------------
  // 8. Delivery Audit Logs
  // --------------------------------------------------------------------------
  logDeliveryAttempt(logEntry) {
    const sanitized = {
      log_id: `LOG-${crypto.randomUUID()}`,
      alert_id: logEntry.alert_id,
      triggering_event_id: logEntry.triggering_event_id,
      recipient_account_id: logEntry.recipient_account_id,
      channel: logEntry.channel,
      attempt_number: logEntry.attempt_number || 1,
      attempt_timestamp: new Date().toISOString(),
      outcome: logEntry.outcome, // 'DELIVERED', 'TRANSIENT_FAILURE', 'PERMANENT_FAILURE', 'CONSENT_REVOKED'
      provider_message_id: logEntry.provider_message_id || null,
      next_retry_time: logEntry.next_retry_time || null,
      failure_classification: logEntry.failure_classification || null
    };

    this.deliveryLogs.push(sanitized);
    return sanitized;
  }

  listDeliveryLogs(context = {}) {
    const isStaff = ['compliance_operator', 'managing_partner'].includes(context.role);
    if (!isStaff) return []; // Delivery audit logs restricted to compliance staff
    return [...this.deliveryLogs];
  }
}

// Global singleton instance for local runtime and tests
const memoryStore = new MemoryStore();

module.exports = {
  MemoryStore,
  memoryStore
};
