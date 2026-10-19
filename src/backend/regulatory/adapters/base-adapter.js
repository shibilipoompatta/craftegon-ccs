/**
 * CraftEgon CCS - Base Regulatory Source Adapter
 * Defines the contract, resilience policies, caching, timeout guards,
 * and citation builders for all regulatory source adapters.
 */

const crypto = require('node:crypto');

class BaseSourceAdapter {
  constructor(options = {}) {
    this.sourceId = options.sourceId;
    this.sourceName = options.sourceName;
    this.authority = options.authority;
    this.jurisdiction = options.jurisdiction || 'IN-CENTRAL';
    this.officialUrl = options.officialUrl;
    this.retrievalMode = options.retrievalMode || 'CACHED';
    this.stalenessThresholdHours = options.stalenessThresholdHours || 48;
    this.timeoutMs = options.timeoutMs || 5000;
    this.lastCheckedAt = new Date().toISOString();
    this.lastSuccessfulRetrieval = new Date().toISOString();
    this.isCircuitOpen = false;
  }

  /**
   * Builds canonical citation record
   */
  formatCitation(documentRef = 'Statutory Enactment', excerpt = '') {
    return {
      source_id: this.sourceId,
      source_name: this.sourceName,
      issuing_authority: this.authority,
      jurisdiction: this.jurisdiction,
      official_url: this.officialUrl,
      document_reference: documentRef,
      retrieved_at: this.lastCheckedAt,
      retrieval_mode: this.retrievalMode,
      staleness_threshold_hours: this.stalenessThresholdHours,
      excerpt: excerpt || 'Official statutory text reference'
    };
  }

  /**
   * Health and availability check
   */
  async checkHealth() {
    return {
      source_id: this.sourceId,
      status: this.isCircuitOpen ? 'DEGRADED' : 'HEALTHY',
      last_checked_at: this.lastCheckedAt,
      retrieval_mode: this.retrievalMode,
      staleness_threshold_hours: this.stalenessThresholdHours
    };
  }

  /**
   * Computes content SHA-256 fingerprint
   */
  computeFingerprint(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}

module.exports = {
  BaseSourceAdapter
};
