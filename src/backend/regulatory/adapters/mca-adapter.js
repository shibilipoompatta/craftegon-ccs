/**
 * CraftEgon CCS - MCA Source Adapter
 * Queries statutory filing schedules, form specifications, and ROC compliance rules
 * under Companies Act 2013 and LLP Act 2008 (SRC-MCA-001).
 */

const { BaseSourceAdapter } = require('./base-adapter');

class McaSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceId: 'SRC-MCA-001',
      sourceName: 'Ministry of Corporate Affairs — Companies Act 2013 Statutory Portal',
      authority: 'Ministry of Corporate Affairs (MCA), Government of India',
      jurisdiction: 'IN-CENTRAL',
      officialUrl: 'https://www.mca.gov.in/',
      retrievalMode: 'CACHED',
      stalenessThresholdHours: 48
    });

    // Authoritative statutory filing schedule register
    this.filingRegister = [
      {
        form_name: 'AOC-4 / AOC-4 XBRL',
        purpose: 'Filing of audited balance sheet and financial statements',
        section: 'Section 137, Companies Act 2013',
        standard_due_timeline: 'Within 30 days of Annual General Meeting (typically 30th October)',
        target_entities: ['pvt_ltd', 'public_ltd', 'opc'],
        official_fee_rule: 'Standard statutory fee + ₹100/day late fee under Section 403',
        source_id: 'SRC-MCA-001'
      },
      {
        form_name: 'MGT-7 / MGT-7A',
        purpose: 'Annual Return of Company disclosing shareholding and directors',
        section: 'Section 92, Companies Act 2013',
        standard_due_timeline: 'Within 60 days of Annual General Meeting (typically 29th November)',
        target_entities: ['pvt_ltd', 'public_ltd', 'opc'],
        official_fee_rule: 'Standard statutory fee + ₹100/day late fee under Section 403',
        source_id: 'SRC-MCA-001'
      },
      {
        form_name: 'DIR-3 KYC / DIR-3 KYC-WEB',
        purpose: 'Annual Director Identification Number KYC verification',
        section: 'Rule 12A, Companies (Appointment and Qualification of Directors) Rules',
        standard_due_timeline: 'Annually on or before 30th September',
        target_entities: ['pvt_ltd', 'public_ltd', 'opc', 'llp'],
        official_fee_rule: 'Free if filed before 30th September; ₹5,000 late fee per DIN thereafter',
        source_id: 'SRC-MCA-001'
      },
      {
        form_name: 'PAS-6',
        purpose: 'Reconciliation of Share Capital Audit Report (Half-yearly)',
        section: 'Rule 9A / 9B, Companies (Prospectus and Allotment of Securities) Rules',
        standard_due_timeline: 'Within 60 days from conclusion of each half of the financial year',
        target_entities: ['pvt_ltd', 'public_ltd'],
        official_fee_rule: 'Mandatory for unlisted public companies and non-small private companies',
        source_id: 'SRC-NOTIF-PAS-2023'
      },
      {
        form_name: 'Form 11 (LLP)',
        purpose: 'Annual Return of Limited Liability Partnership',
        section: 'Section 35, LLP Act 2008 & Rule 25(1)',
        standard_due_timeline: 'Within 60 days of financial year end (on or before 30th May)',
        target_entities: ['llp'],
        official_fee_rule: '₹100/day delay fee under Section 69 of LLP Act',
        source_id: 'SRC-MCA-001'
      },
      {
        form_name: 'Form 8 (LLP)',
        purpose: 'Statement of Account & Solvency of LLP',
        section: 'Section 34, LLP Act 2008 & Rule 24',
        standard_due_timeline: 'Within 30 days from end of 6 months of financial year (30th October)',
        target_entities: ['llp'],
        official_fee_rule: '₹100/day delay fee under Section 69 of LLP Act',
        source_id: 'SRC-MCA-001'
      }
    ];
  }

  /**
   * Look up applicable MCA statutory forms and rules for an entity type
   */
  async lookupComplianceRules(query = {}) {
    this.lastCheckedAt = new Date().toISOString();
    const entityType = query.entity_type ? query.entity_type.toLowerCase().trim() : null;
    const formName = query.form_name ? query.form_name.toUpperCase().trim() : null;

    let matches = this.filingRegister;

    if (entityType) {
      matches = matches.filter(f => f.target_entities.includes(entityType));
    }

    if (formName) {
      matches = matches.filter(f => f.form_name.includes(formName));
    }

    return {
      source: this.formatCitation('Companies Act 2013 & LLP Act 2008 Rules'),
      query: { entity_type: entityType, form_name: formName },
      result_count: matches.length,
      is_empty: matches.length === 0,
      freshness: 'CURRENT',
      data: matches
    };
  }
}

module.exports = {
  McaSourceAdapter
};
