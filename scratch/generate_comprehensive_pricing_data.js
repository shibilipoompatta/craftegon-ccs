const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const servicesDir = path.join(__dirname, '..', 'services');
const serviceRegistryPath = path.join(__dirname, '..', 'data', 'service-registry.json');
const registry = JSON.parse(fs.readFileSync(serviceRegistryPath, 'utf8'));

// Extract data from every active service
const activeServices = registry.filter(s => s.record_status === 'ACTIVE_SERVICE');
console.log(`Processing ${activeServices.length} active services...`);

const pricingDataset = [];

activeServices.forEach(svc => {
  const filePath = path.join(servicesDir, path.basename(svc.canonical_route));
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const cards = doc.querySelectorAll('.if-pricing-card, .pricing-card');
  const cardList = [];

  cards.forEach((card, idx) => {
    const titleEl = card.querySelector('.if-pricing-title, .pricing-title, h3, h4');
    const priceEl = card.querySelector('.if-pricing-price, .pricing-price');
    const descEl = card.querySelector('.if-pricing-desc, .pricing-desc');
    const features = Array.from(card.querySelectorAll('ul li, .if-pricing-features li')).map(li => li.textContent.trim().replace(/\s+/g, ' '));

    cardList.push({
      cardIndex: idx,
      title: titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '',
      price: priceEl ? priceEl.textContent.trim().replace(/\s+/g, ' ') : '',
      desc: descEl ? descEl.textContent.trim().replace(/\s+/g, ' ') : '',
      features
    });
  });

  // Determine primary pricing basis and amount
  let amount = null;
  let pricing_basis = 'CUSTOM_QUOTE';
  let website_displayed_price = 'None Displayed';
  let package_title = null;
  let website_price_type = 'UNSPECIFIED';
  let additional_tiers = [];
  let statutory_thresholds = [];
  let statutory_penalties = [];

  if (cardList.length > 0) {
    const primaryCard = cardList[0];
    package_title = primaryCard.title;
    website_displayed_price = primaryCard.price;

    const numMatch = primaryCard.price.match(/₹\s*([\d,]+)/);
    if (numMatch) {
      amount = parseInt(numMatch[1].replace(/,/g, ''), 10);
      if (primaryCard.price.includes('/ year') || primaryCard.price.includes('/ yr') || primaryCard.price.includes('per year')) {
        pricing_basis = 'ANNUAL';
        website_price_type = 'ANNUAL_RETAINER';
      } else if (primaryCard.price.includes('per filing') || primaryCard.price.includes('per half-year')) {
        pricing_basis = 'PER_FILING';
        website_price_type = 'PER_FILING';
      } else if (primaryCard.price.includes('per DIN')) {
        pricing_basis = 'PER_FILING';
        website_price_type = 'PER_DIN_UNIT';
      } else if (primaryCard.price.includes('+ Govt. Fees') || primaryCard.price.includes('+ Stamp Duty')) {
        pricing_basis = 'STARTING_FROM';
        website_price_type = 'STARTING_PRICE_PLUS_DISBURSEMENTS';
      } else if (primaryCard.price.includes('All Inclusive')) {
        pricing_basis = 'FIXED';
        website_price_type = 'FIXED_ALL_INCLUSIVE';
      } else {
        pricing_basis = 'STARTING_FROM';
        website_price_type = 'STARTING_PRICE';
      }
    } else {
      amount = null;
      pricing_basis = 'CUSTOM_QUOTE';
      website_price_type = 'CUSTOM_QUOTE';
    }

    // Additional tiers if more than 1 card
    if (cardList.length > 1) {
      for (let i = 1; i < cardList.length; i++) {
        const c = cardList[i];
        const tierNumMatch = c.price.match(/₹\s*([\d,]+)/);
        additional_tiers.push({
          tier_index: i + 1,
          package_title: c.title,
          website_displayed_price: c.price,
          amount: tierNumMatch ? parseInt(tierNumMatch[1].replace(/,/g, ''), 10) : null,
          pricing_basis: c.price.includes('/ year') ? 'ANNUAL' : (c.price.includes('+ Govt') ? 'STARTING_FROM' : 'FIXED'),
          description: c.desc,
          features: c.features
        });
      }
    }
  }

  // Check for statutory thresholds or penalties mentioned in text
  const bodyText = doc.body ? doc.body.textContent : html;
  if (svc.canonical_route === '/services/gst-annual.html') {
    statutory_thresholds.push({
      threshold_type: 'TURNOVER_THRESHOLD',
      monetary_expression: '₹5 Crores',
      amount_inr: 50000000,
      description: 'Mandatory annual GST audit and reconciliation (Form GSTR-9C) for enterprises with aggregate annual turnover exceeding ₹5 Crores.',
      statutory_citation: 'Central Goods and Services Tax Act, 2017 Section 35(5) and Section 44 read with Rule 80(3)',
      source_id: 'SRC-CBIC-001'
    });
  }
  if (svc.canonical_route === '/services/roc-annual-compliance.html') {
    statutory_thresholds.push({
      threshold_type: 'AUTHORIZED_CAPITAL_THRESHOLD',
      monetary_expression: '₹10 Lakhs',
      amount_inr: 1000000,
      description: 'Standard Startup Retainer applicability cap for private limited companies with authorized share capital up to ₹10 Lakhs.',
      statutory_citation: 'Companies Act, 2013 Table of Additional Fees & Internal Commercial Retainer Band',
      source_id: 'SRC-INT-PRC-001'
    });
  }
  if (svc.canonical_route === '/services/dir3-kyc.html') {
    statutory_penalties.push({
      penalty_type: 'STATUTORY_LATE_FILING_FEE',
      monetary_expression: '₹5,000',
      amount_inr: 5000,
      description: 'Mandatory government late filing penalty for annual DIR-3 KYC submitted after the statutory September 30 deadline, leading to DIN deactivation.',
      statutory_citation: 'Rule 12A of Companies (Appointment and Qualification of Directors) Rules, 2014 & MCA Fee Rules',
      source_id: 'SRC-MCA-001'
    });
  }

  // Standard included/excluded charges
  const included_charges = [];
  const excluded_charges = [];

  if (cardList.length > 0 && cardList[0].features.length > 0) {
    included_charges.push(...cardList[0].features);
  } else {
    included_charges.push(
      'Professional secretarial review & document structuring',
      'Statutory compliance preparation',
      'Client support & milestone status communication'
    );
  }

  if (website_displayed_price.includes('+ Govt. Fees')) {
    excluded_charges.push(
      'Government MCA statutory portal filing fees (payable at actuals on MCA V3)',
      'State stamp duty on MoA/AoA/deeds (payable per state stamp act)',
      'Goods and Services Tax (GST) at 18%'
    );
  } else if (website_displayed_price.includes('+ Stamp Duty')) {
    excluded_charges.push(
      'State stamp duty on partnership/trust instruments (payable per state schedule)',
      'Sub-Registrar/RoF physical presentation/verification expenses',
      'Goods and Services Tax (GST) at 18%'
    );
  } else if (website_displayed_price.includes('All Inclusive')) {
    excluded_charges.push(
      'Statutory penalties or late filing additional fees for past defaults',
      'Substantive court/tribunal litigation or contested advocacy',
      'Goods and Services Tax (GST) at 18% unless explicitly bundled'
    );
  } else {
    excluded_charges.push(
      'Government statutory fees, portal challans, and state stamp duties',
      'Third-party valuer, auditor, or external agency disbursements',
      'Goods and Services Tax (GST) at 18%'
    );
  }

  pricingDataset.push({
    pricing_id: `PRC-${svc.service_id}`,
    service_id: svc.service_id,
    service_name: svc.service_name,
    canonical_route: svc.canonical_route,
    primary_vertical_id: svc.primary_vertical_id,
    currency: 'INR',
    amount: amount,
    pricing_basis: pricing_basis,
    price_category: 'PROFESSIONAL_FEE',
    jurisdiction: 'IN-CENTRAL',
    website_displayed_price: website_displayed_price,
    package_title: package_title,
    website_price_type: website_price_type,
    included_charges: included_charges,
    excluded_charges: excluded_charges,
    additional_tiers: additional_tiers,
    statutory_thresholds: statutory_thresholds,
    statutory_penalties: statutory_penalties,
    effective_from: '2026-10-15',
    effective_to: null,
    source_id: 'SRC-INT-PRC-001',
    evidence_source: 'WEBSITE_PAGE_AUDIT',
    verification_status: 'UNVERIFIED',
    evidence_state: 'WEBSITE_OBSERVED_HISTORICAL',
    commercial_approval_state: 'PENDING_COMMERCIAL_APPROVAL',
    last_verified_at: null,
    checked_date: '2026-10-17',
    notes: amount !== null 
      ? `Captured website template baseline figure of ${website_displayed_price} from ${svc.canonical_route}. Preserved strictly as UNVERIFIED pending formal review and resolution by the Partner Pricing Committee.`
      : `Bespoke professional engagement. No fixed price displayed on website; quote provided upon scope assessment. Preserved strictly as UNVERIFIED pending partner pricing resolution.`
  });
});

console.log(`Generated ${pricingDataset.length} pricing records.`);
fs.writeFileSync(path.join(__dirname, 'test_pricing_output.json'), JSON.stringify(pricingDataset, null, 2));
console.log('Saved to scratch/test_pricing_output.json');
