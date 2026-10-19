/**
 * CraftEgon CCS - RBI / FEMA Regulatory Source Adapter
 * Queries cross-border investment compliance rules, FIRMS portal schedules,
 * and Foreign Liabilities & Assets (FLA) returns under FEMA 1999 (SRC-RBI-001).
 */

const { BaseSourceAdapter } = require('./base-adapter');

class RbiFemaSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceId: 'SRC-RBI-001',
      sourceName: 'Reserve Bank of India — FIRMS & FLAIR Reporting Systems',
      authority: 'Reserve Bank of India (RBI), Foreign Exchange Department',
      jurisdiction: 'IN-CENTRAL',
      officialUrl: 'https://firms.rbi.org.in/',
      retrievalMode: 'CACHED',
      stalenessThresholdHours: 48
    });

    this.femaRegulations = [
      {
        form_name: 'FLA Return (Foreign Liabilities and Assets)',
        purpose: 'Annual reporting of foreign liabilities, foreign assets, and FDI stock on FLAIR portal',
        timeline: 'Annually on or before 15th July for prior financial year audited figures',
        applicability: 'All Indian companies and LLPs that have received FDI or made Overseas Direct Investment (ODI)',
        statutory_basis: 'A.P. (DIR Series) Circular No. 37 dated June 28, 2019',
        penalty_rule: 'Late Submission Fee (LSF) under Section 13(1) of FEMA 1999',
        source_id: 'SRC-RBI-001'
      },
      {
        form_name: 'Form FC-GPR (Foreign Currency - Gross Provisional Return)',
        purpose: 'Reporting allotment of capital instruments to persons resident outside India',
        timeline: 'Within 30 days from the date of allotment of capital instruments on Single Master Form (SMF)',
        applicability: 'Indian companies issuing shares/convertible instruments against inbound foreign remittance',
        statutory_basis: 'Regulation 13.1(1) of FEMA 20(R)/2017-RB',
        penalty_rule: 'Late Submission Fee (LSF) calculation as per RBI Compounding Directions',
        source_id: 'SRC-RBI-001'
      },
      {
        form_name: 'Form FC-TRS (Foreign Currency - Transfer of Shares)',
        purpose: 'Reporting transfer of capital instruments between resident and non-resident',
        timeline: 'Within 60 days from the date of transfer of capital instruments or receipt/remittance of funds',
        applicability: 'Resident transferors/transferees and non-resident counterparties',
        statutory_basis: 'Regulation 13.1(2) of FEMA 20(R)/2017-RB',
        penalty_rule: 'Late Submission Fee (LSF) or adjudication under Section 13 FEMA',
        source_id: 'SRC-RBI-001'
      }
    ];
  }

  async lookupFemaRules(query = {}) {
    this.lastCheckedAt = new Date().toISOString();
    const fdiType = query.fdi_type ? query.fdi_type.toUpperCase().trim() : null;

    let matches = this.femaRegulations;
    if (fdiType) {
      matches = matches.filter(r => r.form_name.includes(fdiType));
    }

    return {
      source: this.formatCitation('RBI Master Direction on Foreign Investment in India'),
      query: { fdi_type: fdiType },
      result_count: matches.length,
      is_empty: matches.length === 0,
      freshness: 'CURRENT',
      data: matches
    };
  }
}

module.exports = {
  RbiFemaSourceAdapter
};
