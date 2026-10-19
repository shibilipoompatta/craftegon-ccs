/**
 * CraftEgon CCS - Regulatory Intelligence Service
 * Coordinates source adapters, compliance event registry,
 * applicability evaluations, and trademark search workflows.
 */

const fs = require('node:fs');
const path = require('node:path');
const { validateComplianceEvent } = require('./compliance-event.model');
const { ApplicabilityEngine } = require('./applicability-engine');
const { McaSourceAdapter } = require('./adapters/mca-adapter');
const { RbiFemaSourceAdapter } = require('./adapters/rbi-fema-adapter');
const { TaxSourceAdapter } = require('./adapters/tax-adapter');
const { IpIndiaSourceAdapter } = require('./adapters/ipindia-adapter');

class RegulatoryService {
  constructor() {
    this.mcaAdapter = new McaSourceAdapter();
    this.rbiAdapter = new RbiFemaSourceAdapter();
    this.taxAdapter = new TaxSourceAdapter();
    this.ipIndiaAdapter = new IpIndiaSourceAdapter();

    // Load canonical sources
    const sourcesPath = path.join(__dirname, '../../../data/sources.json');
    this.sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

    // Load and validate canonical seed events
    const eventsPath = path.join(__dirname, 'canonical-events.json');
    const rawEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    this.events = new Map();
    for (const raw of rawEvents) {
      const validated = validateComplianceEvent(raw);
      this.events.set(validated.event_id, validated);
    }
  }

  /**
   * Lists all canonical sources with live health status
   */
  async listSources() {
    const healthMap = {
      'SRC-MCA-001': await this.mcaAdapter.checkHealth(),
      'SRC-RBI-001': await this.rbiAdapter.checkHealth(),
      'SRC-CBDT-001': await this.taxAdapter.checkHealth(),
      'SRC-CBIC-001': await this.taxAdapter.checkHealth(),
      'SRC-CGPDTM-001': await this.ipIndiaAdapter.checkHealth()
    };

    return this.sources.map(s => {
      const health = healthMap[s.source_id] || { status: 'HEALTHY', retrieval_mode: 'CACHED' };
      return {
        ...s,
        adapter_status: health.status,
        retrieval_mode: health.retrieval_mode
      };
    });
  }

  /**
   * Query compliance events with optional domain, jurisdiction, authority, or entity filters
   */
  listEvents(filters = {}) {
    let result = Array.from(this.events.values());

    if (filters.domain) {
      result = result.filter(e => e.regulatory_domain.toLowerCase().includes(filters.domain.toLowerCase()));
    }
    if (filters.jurisdiction) {
      result = result.filter(e => e.jurisdiction === filters.jurisdiction || e.jurisdiction === 'IN-CENTRAL');
    }
    if (filters.authority) {
      result = result.filter(e => e.authority.toLowerCase().includes(filters.authority.toLowerCase()));
    }
    if (filters.entity_type) {
      result = result.filter(e => e.affected_entities.includes(filters.entity_type.toLowerCase()));
    }
    if (filters.record_status) {
      result = result.filter(e => e.record_status === filters.record_status);
    } else {
      result = result.filter(e => e.record_status === 'ACTIVE');
    }

    return result;
  }

  /**
   * Get event by ID with citations and change history
   */
  getEventById(eventId) {
    return this.events.get(eventId) || null;
  }

  /**
   * Evaluate business profile applicability
   */
  evaluateProfile(profile = {}) {
    const activeEvents = this.listEvents({ record_status: 'ACTIVE' });
    const evaluations = ApplicabilityEngine.evaluateBatch(activeEvents, profile);

    const applicable = evaluations.filter(e => e.applicability_status === 'APPLICABLE');
    const requiresReview = evaluations.filter(e => e.applicability_status === 'REQUIRES_REVIEW');
    const notApplicable = evaluations.filter(e => e.applicability_status === 'NOT_APPLICABLE');

    return {
      evaluated_profile: profile,
      total_events_evaluated: activeEvents.length,
      counts: {
        applicable: applicable.length,
        requires_review: requiresReview.length,
        not_applicable: notApplicable.length
      },
      applicable_obligations: applicable,
      requires_review: requiresReview,
      not_applicable: notApplicable
    };
  }

  /**
   * Execute multi-source regulatory lookup across MCA, Tax, FEMA, and IP
   */
  async executeLookup(query = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      query,
      sources_consulted: [],
      data: {}
    };

    if (!query.domain || query.domain.toLowerCase().includes('mca') || query.domain.toLowerCase().includes('corporate')) {
      const mcaRes = await this.mcaAdapter.lookupComplianceRules(query);
      results.sources_consulted.push(mcaRes.source);
      results.data.mca = mcaRes;
    }

    if (!query.domain || query.domain.toLowerCase().includes('tax') || query.domain.toLowerCase().includes('gst')) {
      const taxRes = await this.taxAdapter.lookupTaxDeadlines(query);
      results.sources_consulted.push(taxRes.source);
      results.data.tax = taxRes;
    }

    if (!query.domain || query.domain.toLowerCase().includes('fema') || query.domain.toLowerCase().includes('rbi')) {
      const femaRes = await this.rbiAdapter.lookupFemaRules(query);
      results.sources_consulted.push(femaRes.source);
      results.data.fema = femaRes;
    }

    return results;
  }

  /**
   * Trademark search via IP India adapter
   */
  async searchTrademark(query = {}) {
    return await this.ipIndiaAdapter.searchTrademark(query);
  }
}

// Singleton instance
const regulatoryService = new RegulatoryService();

module.exports = {
  RegulatoryService,
  regulatoryService
};
