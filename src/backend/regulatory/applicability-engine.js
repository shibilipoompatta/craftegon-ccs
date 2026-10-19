/**
 * CraftEgon CCS - Deterministic Regulatory Applicability Engine
 * Evaluates verified business profile facts against canonical compliance event rules.
 * Strictly prevents AI hallucination or fuzzy keyword matches from determining legal obligations.
 */

class ApplicabilityEngine {
  /**
   * Evaluates a business entity profile against a compliance event
   * @param {Object} event - Canonical compliance event
   * @param {Object} profile - Verified business facts
   * @returns {Object} Evaluated decision with rationale, citations, and confidence
   */
  static evaluate(event, profile = {}) {
    const decisionTimestamp = new Date().toISOString();
    const rules = event.applicability_rules || {};
    const citations = event.source_ids || [];
    const factsEvaluated = {
      entity_type: profile.entity_type || null,
      jurisdiction: profile.jurisdiction || null,
      turnover_inr: typeof profile.turnover_inr === 'number' ? profile.turnover_inr : null,
      has_fdi: typeof profile.has_fdi === 'boolean' ? profile.has_fdi : null,
      employee_count: typeof profile.employee_count === 'number' ? profile.employee_count : null,
      is_registered_gst: typeof profile.is_registered_gst === 'boolean' ? profile.is_registered_gst : null
    };

    // 1. Missing Baseline Facts: If entity_type or jurisdiction is missing, determination is impossible
    if (!profile.entity_type || !profile.jurisdiction) {
      return {
        event_id: event.event_id,
        applicability_status: 'REQUIRES_REVIEW',
        confidence: 0.25,
        facts_evaluated: factsEvaluated,
        rule_criterion: 'Baseline Corporate Facts Incomplete',
        source_citations: citations,
        rationale: 'Entity type or operational jurisdiction is unknown. Professional CS review is required to verify legal charter.',
        requires_human_review: true,
        decision_timestamp: decisionTimestamp
      };
    }

    // 2. Jurisdiction Filter: Event jurisdiction must match or be IN-CENTRAL (national)
    if (event.jurisdiction !== 'IN-CENTRAL' && event.jurisdiction !== profile.jurisdiction) {
      return {
        event_id: event.event_id,
        applicability_status: 'NOT_APPLICABLE',
        confidence: 1.0,
        facts_evaluated: factsEvaluated,
        rule_criterion: `Territorial Purview Restriction (${event.jurisdiction})`,
        source_citations: citations,
        rationale: `This regulation applies specifically to ${event.jurisdiction}. Entity operates in ${profile.jurisdiction}.`,
        requires_human_review: false,
        decision_timestamp: decisionTimestamp
      };
    }

    // 3. Entity Type Matching: If event specifies restricted entity types
    if (rules.entity_types && Array.isArray(rules.entity_types)) {
      const isTypeMatched = rules.entity_types.includes(profile.entity_type);
      if (!isTypeMatched) {
        return {
          event_id: event.event_id,
          applicability_status: 'NOT_APPLICABLE',
          confidence: 1.0,
          facts_evaluated: factsEvaluated,
          rule_criterion: `Statutory Entity Classification (${rules.entity_types.join(', ')})`,
          source_citations: citations,
          rationale: `This obligation applies exclusively to ${rules.entity_types.join(', ')}. Current entity is classified as ${profile.entity_type}.`,
          requires_human_review: false,
          decision_timestamp: decisionTimestamp
        };
      }
    }

    // 4. FDI Specific Rules (FEMA, FLA, FC-GPR)
    if (rules.fdi_required === true) {
      if (profile.has_fdi === null || profile.has_fdi === undefined) {
        return {
          event_id: event.event_id,
          applicability_status: 'REQUIRES_REVIEW',
          confidence: 0.5,
          facts_evaluated: factsEvaluated,
          rule_criterion: 'Foreign Direct Investment (FEMA) Status Unverified',
          source_citations: citations,
          rationale: 'Obligation depends on foreign equity or non-resident shareholding. Foreign direct investment status has not been confirmed.',
          requires_human_review: true,
          decision_timestamp: decisionTimestamp
        };
      }
      if (profile.has_fdi === false) {
        return {
          event_id: event.event_id,
          applicability_status: 'NOT_APPLICABLE',
          confidence: 1.0,
          facts_evaluated: factsEvaluated,
          rule_criterion: 'Absence of Foreign Equity Participation',
          source_citations: citations,
          rationale: 'Entity reports zero foreign equity investment or external commercial borrowings. FEMA filing obligations do not trigger.',
          requires_human_review: false,
          decision_timestamp: decisionTimestamp
        };
      }
    }

    // 5. Employee Count Thresholds (EPFO >= 20, ESIC, POSH >= 10)
    if (typeof rules.min_employee_count === 'number') {
      if (typeof profile.employee_count !== 'number') {
        return {
          event_id: event.event_id,
          applicability_status: 'REQUIRES_REVIEW',
          confidence: 0.5,
          facts_evaluated: factsEvaluated,
          rule_criterion: `Statutory Employee Threshold (${rules.min_employee_count}+ Employees)`,
          source_citations: citations,
          rationale: `Statutory threshold requires ${rules.min_employee_count} or more employees. Current headcount is unverified.`,
          requires_human_review: true,
          decision_timestamp: decisionTimestamp
        };
      }
      if (profile.employee_count < rules.min_employee_count) {
        return {
          event_id: event.event_id,
          applicability_status: 'NOT_APPLICABLE',
          confidence: 1.0,
          facts_evaluated: factsEvaluated,
          rule_criterion: `Below Statutory Employee Headcount Threshold (< ${rules.min_employee_count})`,
          source_citations: citations,
          rationale: `Entity headcount (${profile.employee_count}) is below the statutory applicability threshold of ${rules.min_employee_count} employees.`,
          requires_human_review: false,
          decision_timestamp: decisionTimestamp
        };
      }
    }

    // 6. Turnover Thresholds (e.g. GST registration, Tax Audit)
    if (typeof rules.min_turnover_inr === 'number') {
      if (typeof profile.turnover_inr !== 'number') {
        return {
          event_id: event.event_id,
          applicability_status: 'REQUIRES_REVIEW',
          confidence: 0.5,
          facts_evaluated: factsEvaluated,
          rule_criterion: `Statutory Revenue / Turnover Threshold (₹${rules.min_turnover_inr.toLocaleString('en-IN')})`,
          source_citations: citations,
          rationale: `Obligation triggers at revenue threshold ₹${rules.min_turnover_inr.toLocaleString('en-IN')}. Entity turnover is unverified.`,
          requires_human_review: true,
          decision_timestamp: decisionTimestamp
        };
      }
      if (profile.turnover_inr < rules.min_turnover_inr) {
        return {
          event_id: event.event_id,
          applicability_status: 'NOT_APPLICABLE',
          confidence: 0.95,
          facts_evaluated: factsEvaluated,
          rule_criterion: `Turnover Below Statutory Threshold (₹${profile.turnover_inr.toLocaleString('en-IN')} < ₹${rules.min_turnover_inr.toLocaleString('en-IN')})`,
          source_citations: citations,
          rationale: `Annual turnover is below the statutory requirement of ₹${rules.min_turnover_inr.toLocaleString('en-IN')}.`,
          requires_human_review: false,
          decision_timestamp: decisionTimestamp
        };
      }
    }

    // 7. All positive criteria satisfied
    return {
      event_id: event.event_id,
      applicability_status: 'APPLICABLE',
      confidence: 1.0,
      facts_evaluated: factsEvaluated,
      rule_criterion: 'Full Statutory Eligibility Criteria Satisfied',
      source_citations: citations,
      rationale: `Mandatory statutory obligation under ${event.authority} for ${profile.entity_type} in ${profile.jurisdiction}.`,
      requires_human_review: false,
      decision_timestamp: decisionTimestamp
    };
  }

  /**
   * Batch evaluates multiple events against a profile
   */
  static evaluateBatch(events, profile) {
    return events.map(evt => this.evaluate(evt, profile));
  }
}

module.exports = {
  ApplicabilityEngine
};
