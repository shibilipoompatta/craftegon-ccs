/**
 * CraftEgon CCS - Tax Source Adapter
 * Queries direct tax filing schedules (CBDT / Income-tax Act 1961)
 * and indirect tax return calendars (GSTN / CGST Act 2017) (SRC-CBDT-001, SRC-CBIC-001).
 */

const { BaseSourceAdapter } = require('./base-adapter');

class TaxSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceId: 'SRC-CBDT-001',
      sourceName: 'Income Tax Department & GST Network Statutory Tax Engines',
      authority: 'Central Board of Direct Taxes (CBDT) & Central Board of Indirect Taxes and Customs (CBIC)',
      jurisdiction: 'IN-CENTRAL',
      officialUrl: 'https://eportal.incometax.gov.in/',
      retrievalMode: 'CACHED',
      stalenessThresholdHours: 48
    });

    this.taxDeadlines = [
      {
        tax_type: 'INCOME_TAX',
        return_form: 'ITR-6',
        description: 'Corporate Income Tax Return (Subject to Tax Audit)',
        statutory_section: 'Section 139(1), Income-tax Act, 1961',
        due_date: '31st October of the assessment year',
        late_fee_rule: '₹5,000 under Section 234F + 1% per month interest under Section 234A',
        source_id: 'SRC-CBDT-001'
      },
      {
        tax_type: 'INCOME_TAX',
        return_form: 'Form 3CA/3CB + 3CD',
        description: 'Tax Audit Report under Section 44AB',
        statutory_section: 'Section 44AB, Income-tax Act, 1961',
        due_date: '30th September of the assessment year',
        late_fee_rule: '0.5% of turnover or ₹1,50,000 (whichever is less) under Section 271B',
        source_id: 'SRC-CBDT-001'
      },
      {
        tax_type: 'INCOME_TAX',
        return_form: 'TDS Returns (24Q / 26Q / 27Q)',
        description: 'Quarterly statement of tax deducted at source',
        statutory_section: 'Section 200(3), Income-tax Act, 1961',
        due_date: '31st July (Q1), 31st October (Q2), 31st January (Q3), 31st May (Q4)',
        late_fee_rule: '₹200 per day under Section 234E',
        source_id: 'SRC-CBDT-001'
      },
      {
        tax_type: 'GST',
        return_form: 'GSTR-1',
        description: 'Monthly statement of outward supplies of goods and services',
        statutory_section: 'Section 37, Central Goods and Services Tax Act, 2017',
        due_date: '11th of the succeeding month (or 13th of month succeeding quarter for QRMP)',
        late_fee_rule: '₹50/day (₹20/day for nil return) under Section 47 CGST Act',
        source_id: 'SRC-CBIC-001'
      },
      {
        tax_type: 'GST',
        return_form: 'GSTR-3B',
        description: 'Monthly summary return and discharge of tax liabilities',
        statutory_section: 'Section 39, Central Goods and Services Tax Act, 2017',
        due_date: '20th of the succeeding month',
        late_fee_rule: '₹50/day (₹20/day for nil return) + 18% p.a. interest under Section 50',
        source_id: 'SRC-CBIC-001'
      },
      {
        tax_type: 'GST',
        return_form: 'GSTR-9 / GSTR-9C',
        description: 'Annual Return and Self-Certified Reconciliation Statement',
        statutory_section: 'Section 44, Central Goods and Services Tax Act, 2017',
        due_date: '31st December following the end of financial year',
        late_fee_rule: '₹50/day (max 0.04% of turnover in state) under Section 47',
        source_id: 'SRC-CBIC-001'
      }
    ];
  }

  async lookupTaxDeadlines(query = {}) {
    this.lastCheckedAt = new Date().toISOString();
    const taxType = query.tax_type ? query.tax_type.toUpperCase().trim() : null;
    const formName = query.form_name ? query.form_name.toUpperCase().trim() : null;

    let matches = this.taxDeadlines;
    if (taxType) {
      matches = matches.filter(t => t.tax_type === taxType);
    }
    if (formName) {
      matches = matches.filter(t => t.return_form.includes(formName));
    }

    return {
      source: this.formatCitation('Income-tax Act 1961 & CGST Act 2017 Statutory Schedules'),
      query: { tax_type: taxType, form_name: formName },
      result_count: matches.length,
      is_empty: matches.length === 0,
      freshness: 'CURRENT',
      data: matches
    };
  }
}

module.exports = {
  TaxSourceAdapter
};
