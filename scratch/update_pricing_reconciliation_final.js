const fs = require('fs');
const path = require('path');

const pricing = JSON.parse(fs.readFileSync('data/pricing.json', 'utf8'));

for (const rec of pricing) {
  // 1. Tax inclusion status is UNCONFIRMED across all records
  rec.tax_inclusion_status = 'UNCONFIRMED';

  // 2. Commercial package caps
  if (rec.service_id === 'V02-SVC-017') {
    rec.commercial_package_caps = [
      {
        cap_type: 'AUTHORIZED_CAPITAL_CAP',
        monetary_expression: '₹10 Lakhs',
        amount_inr: 1000000,
        description: 'Standard Startup Retainer package eligibility cap for private limited companies with authorized share capital up to ₹10 Lakhs.',
        commercial_context: 'Commercial scope limitation set by CraftEgon for the ₹14,999/year package tier. Companies with authorized capital exceeding ₹10 Lakhs are directed to the Enterprise Annual Retainer.'
      }
    ];
    // Remove from statutory thresholds
    rec.statutory_thresholds = [];
  } else {
    rec.commercial_package_caps = [];
  }

  // 3. Clean up excluded_charges to never assume 18% GST or unstated taxes
  const displayed = rec.website_displayed_price || '';
  const newExcluded = [];
  if (displayed.includes('+ Govt. Fees')) {
    newExcluded.push('Government statutory portal filing fees (payable at actuals per website "+ Govt. Fees" wording)');
  }
  if (displayed.includes('+ Stamp Duty')) {
    newExcluded.push('State stamp duty on instruments/deeds (payable per state schedule per website "+ Stamp Duty" wording)');
  }
  rec.excluded_charges = newExcluded;

  // 4. Update notes to explicitly state UNCONFIRMED tax and unverified baseline
  if (rec.website_price_type === 'FIXED_ALL_INCLUSIVE') {
    rec.notes = `Captured website template baseline figure of ${rec.website_displayed_price} from ${rec.canonical_route}. Marked tax inclusion as UNCONFIRMED (page displays "All Inclusive" without specifying GST inclusion or rate). Preserved strictly as UNVERIFIED pending formal review and resolution by the Partner Pricing Committee.`;
  } else if (rec.service_id === 'V02-SVC-017') {
    rec.notes = `Captured website template baseline figure of ${rec.website_displayed_price} from ${rec.canonical_route}. The ₹10 Lakhs figure in description represents a commercial package eligibility cap, NOT a statutory threshold. Preserved strictly as UNVERIFIED pending formal review and resolution by the Partner Pricing Committee.`;
  } else if (rec.service_id === 'V09-SVC-003') {
    rec.notes = `Identified pricing gap on ${rec.canonical_route}: card displays "Custom Retainer on Assessment" with amount set to null. Preserved strictly as UNVERIFIED pending formal review and resolution by the Partner Pricing Committee.`;
  } else {
    rec.notes = `Captured website template baseline figure of ${rec.website_displayed_price} from ${rec.canonical_route}. Tax inclusion status is UNCONFIRMED. Preserved strictly as UNVERIFIED pending formal review and resolution by the Partner Pricing Committee.`;
  }
}

fs.writeFileSync('data/pricing.json', JSON.stringify(pricing, null, 2) + '\n');
console.log('Successfully updated data/pricing.json with tax_inclusion_status and commercial_package_caps');
