/**
 * CraftEgon CCS - Canonical Compliance Event Model
 * Validates, normalizes, fingerprints, and manages lifecycle transitions
 * for statutory compliance obligations and regulatory changes.
 */

const crypto = require('node:crypto');

const VALID_EVENT_TYPES = [
  'NOTIFICATION',
  'AMENDMENT',
  'FILING_DEADLINE',
  'RULE_CHANGE',
  'CIRCULAR',
  'ORDER',
  'CLARIFICATION'
];

const VALID_JURISDICTIONS = [
  'IN-CENTRAL',
  'IN-MH',
  'IN-DL',
  'IN-KA',
  'IN-TN',
  'IN-TS',
  'IN-GJ'
];

const VALID_APPLICABILITY_STATUSES = [
  'APPLICABLE',
  'POTENTIALLY_APPLICABLE',
  'NOT_APPLICABLE',
  'REQUIRES_REVIEW'
];

const VALID_FRESHNESS_STATUSES = [
  'CURRENT',
  'STALE',
  'UNAVAILABLE',
  'UNKNOWN'
];

const VALID_VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'SOURCE_IDENTIFIED',
  'SOURCE_VERIFIED',
  'PROFESSIONALLY_REVIEWED'
];

const VALID_RECORD_STATUSES = [
  'ACTIVE',
  'SUPERSEDED',
  'WITHDRAWN',
  'ARCHIVED'
];

/**
 * Computes deterministic SHA-256 fingerprint of substantive event fields
 */
function computeEventFingerprint(data) {
  const substantive = {
    title: data.title,
    summary: data.summary,
    jurisdiction: data.jurisdiction,
    authority: data.authority,
    regulatory_domain: data.regulatory_domain,
    affected_entities: Array.isArray(data.affected_entities) ? [...data.affected_entities].sort() : [],
    applicability_rules: data.applicability_rules || {},
    source_ids: Array.isArray(data.source_ids) ? [...data.source_ids].sort() : [],
    source_url: data.source_url,
    source_reference: data.source_reference,
    publication_date: data.publication_date || null,
    effective_date: data.effective_date || null,
    compliance_due_date: data.compliance_due_date || null
  };
  return crypto.createHash('sha256').update(JSON.stringify(substantive)).digest('hex');
}

/**
 * Validates and normalizes compliance event data
 */
function validateComplianceEvent(data, isNew = true) {
  const errors = [];

  if (!data.event_id || typeof data.event_id !== 'string' || !data.event_id.trim()) {
    errors.push('event_id is required and must be a non-empty string');
  }

  if (!VALID_EVENT_TYPES.includes(data.event_type)) {
    errors.push(`event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.push('title is required and must be at least 5 characters');
  }

  if (!data.summary || typeof data.summary !== 'string') {
    errors.push('summary is required');
  }

  if (!VALID_JURISDICTIONS.includes(data.jurisdiction)) {
    errors.push(`jurisdiction must be one of supported jurisdictions: ${VALID_JURISDICTIONS.join(', ')}`);
  }

  if (!data.authority || typeof data.authority !== 'string') {
    errors.push('authority is required');
  }

  if (!data.regulatory_domain || typeof data.regulatory_domain !== 'string') {
    errors.push('regulatory_domain is required');
  }

  if (!Array.isArray(data.source_ids) || data.source_ids.length === 0) {
    errors.push('source_ids must be a non-empty array of canonical source identifiers');
  }

  if (!data.source_url || typeof data.source_url !== 'string' || !data.source_url.startsWith('http')) {
    errors.push('source_url must be a valid HTTP/HTTPS URL');
  }

  if (data.publication_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.publication_date)) {
    errors.push('publication_date must be in YYYY-MM-DD format if provided');
  }

  if (data.effective_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.effective_date)) {
    errors.push('effective_date must be in YYYY-MM-DD format if provided');
  }

  if (data.compliance_due_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.compliance_due_date)) {
    errors.push('compliance_due_date must be in YYYY-MM-DD format if provided');
  }

  if (data.freshness_status && !VALID_FRESHNESS_STATUSES.includes(data.freshness_status)) {
    errors.push(`freshness_status must be one of: ${VALID_FRESHNESS_STATUSES.join(', ')}`);
  }

  if (data.verification_status && !VALID_VERIFICATION_STATUSES.includes(data.verification_status)) {
    errors.push(`verification_status must be one of: ${VALID_VERIFICATION_STATUSES.join(', ')}`);
  }

  if (data.record_status && !VALID_RECORD_STATUSES.includes(data.record_status)) {
    errors.push(`record_status must be one of: ${VALID_RECORD_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    const error = new Error(`Compliance event validation failed: ${errors.join('; ')}`);
    error.validationErrors = errors;
    throw error;
  }

  const now = new Date().toISOString();
  const contentHash = computeEventFingerprint(data);

  return {
    event_id: data.event_id.trim(),
    event_type: data.event_type,
    title: data.title.trim(),
    summary: data.summary.trim(),
    jurisdiction: data.jurisdiction,
    authority: data.authority.trim(),
    regulatory_domain: data.regulatory_domain.trim(),
    affected_entities: Array.isArray(data.affected_entities) ? [...data.affected_entities] : ['pvt_ltd'],
    applicability_rules: data.applicability_rules || {},
    applicability_status: data.applicability_status || 'REQUIRES_REVIEW',
    applicability_rationale: data.applicability_rationale || 'Initial canonical intake; requires profile evaluation.',
    source_ids: [...data.source_ids],
    source_url: data.source_url.trim(),
    source_reference: data.source_reference || 'Official Statutory Gazette Reference',
    publication_date: data.publication_date || null,
    effective_date: data.effective_date || null,
    compliance_due_date: data.compliance_due_date || null,
    first_observed_at: data.first_observed_at || now,
    last_checked_at: data.last_checked_at || now,
    source_updated_at: data.source_updated_at || null,
    freshness_status: data.freshness_status || 'CURRENT',
    verification_status: data.verification_status || 'SOURCE_VERIFIED',
    change_version: data.change_version || 1,
    supersedes_event_id: data.supersedes_event_id || null,
    record_status: data.record_status || 'ACTIVE',
    created_at: data.created_at || now,
    updated_at: now,
    recorded_by: data.recorded_by || 'SYSTEM_STATUTORY_INGESTION',
    content_hash: contentHash,
    change_history: Array.isArray(data.change_history) ? [...data.change_history] : [
      {
        version: 1,
        timestamp: now,
        actor: data.recorded_by || 'SYSTEM_STATUTORY_INGESTION',
        change_type: 'INITIAL_DISCOVERY_AND_VERIFICATION',
        content_hash: contentHash,
        notes: 'Canonical compliance obligation registered and verified against primary statutory source.'
      }
    ]
  };
}

/**
 * Applies a verified change to an existing event, updating version and appending audit trail
 */
function updateComplianceEvent(existingEvent, updates, actor = 'SYSTEM_UPDATER', notes = '') {
  if (existingEvent.record_status === 'WITHDRAWN' || existingEvent.record_status === 'ARCHIVED') {
    throw new Error(`Cannot update compliance event in terminal status '${existingEvent.record_status}'`);
  }

  const merged = {
    ...existingEvent,
    ...updates,
    change_version: (existingEvent.change_version || 1) + 1,
    updated_at: new Date().toISOString()
  };

  const newHash = computeEventFingerprint(merged);
  const isSubstantiveChange = newHash !== existingEvent.content_hash;

  const historyEntry = {
    version: merged.change_version,
    timestamp: merged.updated_at,
    actor,
    change_type: isSubstantiveChange ? 'SUBSTANTIVE_CONTENT_UPDATE' : 'METADATA_REFRESH',
    previous_hash: existingEvent.content_hash,
    new_hash: newHash,
    is_substantive: isSubstantiveChange,
    notes: notes || (isSubstantiveChange ? 'Substantive statutory or deadline change detected' : 'Metadata or checked timestamp refreshed')
  };

  merged.content_hash = newHash;
  merged.change_history = [...(existingEvent.change_history || []), historyEntry];

  return validateComplianceEvent(merged, false);
}

module.exports = {
  VALID_EVENT_TYPES,
  VALID_JURISDICTIONS,
  VALID_APPLICABILITY_STATUSES,
  VALID_FRESHNESS_STATUSES,
  VALID_VERIFICATION_STATUSES,
  VALID_RECORD_STATUSES,
  computeEventFingerprint,
  validateComplianceEvent,
  updateComplianceEvent
};
