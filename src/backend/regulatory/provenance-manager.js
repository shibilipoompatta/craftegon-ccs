/**
 * CraftEgon CCS - Source Citations, Staleness & Change Provenance Manager
 * Enforces citation integrity, source-specific staleness thresholds,
 * cryptographic content fingerprinting, and reproducible query audit logging.
 */

const crypto = require('node:crypto');

// Configurable staleness thresholds by regulatory domain/source type
const DEFAULT_STALENESS_THRESHOLDS_HOURS = {
  TAX_DEADLINES: 48,          // Tax due dates change dynamically via CBDT/CBIC circulars
  MCA_FILINGS: 48,            // MCA annual filing timelines and portal maintenance notices
  FEMA_CIRCULARS: 168,        // 7 days for RBI A.P. DIR Series circulars
  LABOUR_RULES: 168,          // 7 days for EPFO/ESIC notices
  CYBER_INCIDENTS: 24,        // 24 hours for CERT-In / cyber advisories
  STATUTES_AND_ACTS: 2160,    // 90 days for parliamentary legislative enactments
  TRADEMARK_BENCHMARKS: 24    // 24 hours for verified clearance benchmarks
};

class ProvenanceManager {
  /**
   * Evaluates freshness status of a source or record based on its last checked timestamp
   * Rule: A failed refresh must NOT update or reset the checked timestamp.
   */
  static evaluateFreshness(lastCheckedIso, thresholdHours = 48) {
    if (!lastCheckedIso) {
      return {
        status: 'UNKNOWN',
        is_stale: true,
        hours_elapsed: null,
        message: 'No record of successful verification exists.'
      };
    }

    const checkedDate = new Date(lastCheckedIso);
    if (isNaN(checkedDate.getTime())) {
      return {
        status: 'UNKNOWN',
        is_stale: true,
        hours_elapsed: null,
        message: 'Invalid last checked timestamp format.'
      };
    }

    const now = Date.now();
    const elapsedMs = now - checkedDate.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    if (elapsedHours > thresholdHours) {
      return {
        status: 'STALE',
        is_stale: true,
        hours_elapsed: Math.round(elapsedHours),
        threshold_hours: thresholdHours,
        message: `Data verification expired ${Math.round(elapsedHours)} hours ago (threshold: ${thresholdHours} hours). Source re-verification required.`
      };
    }

    return {
      status: 'CURRENT',
      is_stale: false,
      hours_elapsed: Math.round(elapsedHours),
      threshold_hours: thresholdHours,
      message: 'Source verification is current and valid.'
    };
  }

  /**
   * Constructs a standardized, tamper-evident citation record
   */
  static buildCitation(source, options = {}) {
    const substantiveData = {
      source_id: source.source_id,
      url: source.official_url,
      document_ref: options.document_reference || source.source_title,
      effective_date: options.effective_date || source.publication_date || null
    };

    const fingerprint = crypto.createHash('sha256').update(JSON.stringify(substantiveData)).digest('hex');

    return {
      source_id: source.source_id,
      official_title: source.source_title,
      issuing_authority: source.issuing_authority,
      jurisdiction: source.jurisdiction,
      official_url: source.official_url,
      document_reference: options.document_reference || source.source_title,
      publication_date: source.publication_date || null,
      effective_date: options.effective_date || null,
      retrieval_mode: options.retrieval_mode || 'CACHED',
      retrieved_at: options.retrieved_at || new Date().toISOString(),
      content_fingerprint: fingerprint,
      staleness_evaluation: this.evaluateFreshness(source.last_verified_at, options.threshold_hours || 48)
    };
  }

  /**
   * Compares an existing event with updated source data to detect substantive changes
   */
  static detectChange(existingEvent, updatedData) {
    const oldHash = existingEvent.content_hash;
    const newHash = crypto.createHash('sha256').update(JSON.stringify({
      title: updatedData.title || existingEvent.title,
      summary: updatedData.summary || existingEvent.summary,
      effective_date: updatedData.effective_date !== undefined ? updatedData.effective_date : existingEvent.effective_date,
      compliance_due_date: updatedData.compliance_due_date !== undefined ? updatedData.compliance_due_date : existingEvent.compliance_due_date,
      applicability_rules: updatedData.applicability_rules || existingEvent.applicability_rules
    })).digest('hex');

    const isSubstantive = oldHash !== newHash;

    return {
      is_changed: isSubstantive,
      change_type: isSubstantive ? 'SUBSTANTIVE_RULE_CHANGE' : 'FORMATTING_OR_METADATA_ONLY',
      previous_hash: oldHash,
      new_hash: newHash,
      detected_at: new Date().toISOString()
    };
  }

  /**
   * Constructs a reproducible query snapshot for audit and regulatory defense
   */
  static createReproducibilityRecord(queryParams, sourcesConsulted, resultCount, ruleVersion = 1) {
    const payload = {
      query: queryParams,
      sources: sourcesConsulted.map(s => s.source_id),
      rule_version: ruleVersion,
      result_count: resultCount,
      timestamp: new Date().toISOString()
    };

    return {
      query_id: `QRY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      timestamp: payload.timestamp,
      query_fingerprint: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
      payload
    };
  }
}

module.exports = {
  ProvenanceManager,
  DEFAULT_STALENESS_THRESHOLDS_HOURS
};
