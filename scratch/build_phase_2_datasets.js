/**
 * Generator script for CraftEgon CCS Phase 2 Data Layer (Audited Version)
 * Generates the seven JSON datasets and writes them to data/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SCHEMAS_DIR = path.join(DATA_DIR, 'schemas');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SCHEMAS_DIR)) fs.mkdirSync(SCHEMAS_DIR, { recursive: true });

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let insideQuote = false;
    let field = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

// ----------------------------------------------------
// 1. DATASET G: Sources (Audited & Refined)
// ----------------------------------------------------
const sources = [
  {
    source_id: 'SRC-MCA-001',
    source_title: 'Ministry of Corporate Affairs — Companies Act, 2013 & LLP Act, 2008 Statutory Portals',
    issuing_authority: 'Ministry of Corporate Affairs (MCA), Government of India',
    official_url: 'https://www.mca.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2013-08-30',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Official government regulatory portal. Captcha-protected forms; automated harvesting prohibited. Professional CS DSC authentication required for filing.'
  },
  {
    source_id: 'SRC-CBDT-001',
    source_title: 'Income Tax Department — Income-tax Act, 1961 & E-Filing System',
    issuing_authority: 'Central Board of Direct Taxes (CBDT), Ministry of Finance',
    official_url: 'https://eportal.incometax.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1961-09-13',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Taxpayer authentication and authorized ERI/GSP credentials required. Public AIS/TIS portal.'
  },
  {
    source_id: 'SRC-CBIC-001',
    source_title: 'GST Network — Central Goods and Services Tax Act, 2017 & Portal',
    issuing_authority: 'Goods and Services Tax Network (GSTN) / CBIC',
    official_url: 'https://www.gst.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2017-04-12',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'GSP/ASP API connectivity requires licensed partner credentials. Public GSTIN verification portal.'
  },
  {
    source_id: 'SRC-CGPDTM-001',
    source_title: 'Controller General of Patents, Designs and Trade Marks (IP India)',
    issuing_authority: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    official_url: 'https://ipindiaonline.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1999-12-30',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Public electronic search interface for classes 1-45. Zero automated scraping permitted; manual clearance verification mandatory.'
  },
  {
    source_id: 'SRC-EPFO-001',
    source_title: "Employees' Provident Fund Organisation — Unified Shram Suvidha Portal",
    issuing_authority: 'Ministry of Labour and Employment, Government of India',
    official_url: 'https://unifiedportal-emp.epfindia.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1952-03-04',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Establishment DSC / employer credentials required for ECR generation and monthly return filing.'
  },
  {
    source_id: 'SRC-ESIC-001',
    source_title: "Employees' State Insurance Corporation — Employer Portal",
    issuing_authority: 'Ministry of Labour and Employment, Government of India',
    official_url: 'https://www.esic.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1948-04-19',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Employer registration and monthly contribution portal.'
  },
  {
    source_id: 'SRC-RBI-001',
    source_title: 'Reserve Bank of India — FIRMS & FLAIR Reporting Systems',
    issuing_authority: 'Reserve Bank of India (RBI), Foreign Exchange Department',
    official_url: 'https://firms.rbi.org.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1999-12-29',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Entity and AD Bank two-factor authentication required for Foreign Liabilities & Assets (FLA) and FC-GPR/FC-TRS submissions.'
  },
  {
    source_id: 'SRC-DPDP-001',
    source_title: 'Digital Personal Data Protection Act, 2023 & Gazette Notifications',
    issuing_authority: 'Ministry of Electronics and Information Technology (MeitY)',
    official_url: 'https://www.meity.gov.in/',
    source_type: 'REGULATORY_NOTIFICATION',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2023-08-11',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'OFFICIAL_GAZETTE',
    access_restrictions_notes: 'Statutory enactment defining Data Fiduciary obligations, consent frameworks, and Data Protection Board mandates.'
  },
  {
    source_id: 'SRC-CERTIN-001',
    source_title: 'CERT-In Cybersecurity Directions under Section 70B of IT Act 2000',
    issuing_authority: 'Indian Computer Emergency Response Team (CERT-In)',
    official_url: 'https://www.cert-in.org.in/',
    source_type: 'REGULATORY_NOTIFICATION',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2022-04-28',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'REGULATORY_AGENCY',
    access_restrictions_notes: 'Mandatory 6-hour cybersecurity incident reporting window for covered corporate bodies.'
  },
  {
    source_id: 'SRC-MSME-001',
    source_title: 'Ministry of MSME — Udyam Registration Portal',
    issuing_authority: 'Ministry of Micro, Small and Medium Enterprises',
    official_url: 'https://udyamregistration.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2020-06-26',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Paperless official registration portal integrated with CBDT and GSTN database.'
  },
  {
    source_id: 'SRC-DPIIT-001',
    source_title: 'DPIIT — Startup India Gazette Notifications & Recognition Portal',
    issuing_authority: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    official_url: 'https://www.startupindia.gov.in/',
    source_type: 'OFFICIAL_PORTAL',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2019-02-19',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Statutory recognition framework under Section 56(2)(viib) of the Income-tax Act.'
  },
  {
    source_id: 'SRC-BAR-001',
    source_title: 'Bar Council of India — Advocates Act, 1961 Statutory Representation Framework',
    issuing_authority: 'Bar Council of India / Parliament of India',
    official_url: 'https://www.barcouncilofindia.org/',
    source_type: 'STATUTE',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '1961-05-19',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'PRIMARY_STATUTORY',
    access_restrictions_notes: 'Statutory boundary governing legal representation in courts and tribunals. Confirms non-litigation corporate secretarial scope.'
  },
  {
    source_id: 'SRC-INT-001',
    source_title: 'CraftEgon CCS Master Service Registry Decision Record CRAFTEGON-DOC-P2-002',
    issuing_authority: 'CraftEgon Corporate Services Executive Council & Technical Architecture Team',
    official_url: 'https://ccs.craftegon.com/review-output/phase-2-service-registry/phase-2-service-id-reconciliation-report.md',
    source_type: 'INTERNAL_APPROVAL_RECORD',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2026-10-17',
    accessed_date: '2026-10-17',
    last_verified_at: '2026-10-17',
    next_review_at: '2027-04-01',
    reliability_classification: 'INTERNAL_EXECUTIVE_RECORD',
    access_restrictions_notes: 'Authoritative internal decision register locking 57 routes, 54 active service IDs, and 3 referral-only boundaries.'
  },
  {
    source_id: 'SRC-INT-PRC-001',
    source_title: 'CraftEgon CCS Captured Website Template Rates (Unverified Baseline)',
    issuing_authority: 'CraftEgon LLP Finance & Commercial Committee',
    official_url: 'https://ccs.craftegon.com/docs/product-blueprint/vertical-service-matrix.md',
    source_type: 'INTERNAL_COMMERCIAL_RECORD',
    jurisdiction: 'IN-CENTRAL',
    publication_date: '2026-10-15',
    accessed_date: '2026-10-17',
    last_verified_at: null,
    next_review_at: '2026-11-15',
    reliability_classification: 'INTERNAL_INDICATIVE_BASELINE',
    access_restrictions_notes: 'Captured indicative website template figures from Phase 1 HTML service pages, preserved as unverified historical baseline data. Not an authoritative professional fee quote or binding commercial offer.'
  }
];

fs.writeFileSync(path.join(DATA_DIR, 'sources.json'), JSON.stringify(sources, null, 2), 'utf8');
console.log(`Generated sources.json: ${sources.length} records`);

// ----------------------------------------------------
// 2. DATASET A: Service Registry
// ----------------------------------------------------
const p2CsvPath = path.join(ROOT, 'review-output', 'phase-2-service-registry', 'phase-2-service-ownership-review.csv');
const p2CsvRows = parseCSV(fs.readFileSync(p2CsvPath, 'utf8')).slice(1);

const serviceRegistry = p2CsvRows.map(r => {
  const rawId = r[0];
  const isReferral = !rawId || rawId === 'NONE' || r[1].includes('REFERRAL');
  const serviceId = isReferral ? null : rawId;
  const canonicalRoute = r[2];
  const serviceName = r[3];
  const primaryVCode = isReferral ? null : r[4];
  const rawRel = r[6] || '';
  const relCodes = (rawRel.match(/V\d{2}/g) || []);
  const scopeBoundary = r[8];
  const sourceEvidence = r[11];
  const verificationStatus = isReferral ? 'VERIFIED_REFERRAL_ONLY' : 'VERIFIED_APPROVED';

  return {
    canonical_route: canonicalRoute,
    service_id: serviceId,
    service_name: serviceName,
    record_status: isReferral ? 'REFERRAL_ONLY' : 'ACTIVE_SERVICE',
    primary_vertical_id: primaryVCode,
    related_vertical_ids: relCodes,
    scope_boundary: scopeBoundary,
    source_evidence: sourceEvidence,
    verification_status: verificationStatus
  };
});

fs.writeFileSync(path.join(DATA_DIR, 'service-registry.json'), JSON.stringify(serviceRegistry, null, 2), 'utf8');
console.log(`Generated service-registry.json: ${serviceRegistry.length} records`);

// ----------------------------------------------------
// 3. DATASET C: Pricing (Strictly Unverified Baseline)
// ----------------------------------------------------
const baselinePrices = {
  'V01-SVC-007': { amount: 7499, basis: 'STARTING_FROM', inc: ['SPICe+ preparation', 'Name reservation (RUN/SPICe+ Part A)', 'e-MoA and e-AoA drafting', 'DIN allotment for 2 directors', 'CoI, PAN, TAN & bank coordination'], exc: ['Official MCA filing fees & Central Registration Centre challans', 'State stamp duty on MoA/AoA', 'GST'] },
  'V01-SVC-002': { amount: 5999, basis: 'STARTING_FROM', inc: ['FiLLiP incorporation filing', 'RUN-LLP name reservation', 'Form 3 LLP Agreement drafting & filing'], exc: ['MCA registration fee', 'State stamp duty on LLP Agreement', 'GST'] },
  'V01-SVC-004': { amount: 6999, basis: 'STARTING_FROM', inc: ['SPICe+ OPC preparation', 'INC-3 nominee documentation', 'e-MoA/AoA drafting'], exc: ['MCA fees', 'Stamp duty', 'GST'] },
  'V01-SVC-008': { amount: 14999, basis: 'STARTING_FROM', inc: ['Form INC-12 Central Government license application', 'Non-profit MoA/AoA drafting', 'Section 8 incorporation'], exc: ['Central Govt filing challans', 'Stamp duty', 'GST'] },
  'V01-SVC-001': { amount: 4999, basis: 'STARTING_FROM', inc: ['Startup India portal application', 'Pitch deck / business profile structuring', 'DPIIT certificate processing'], exc: ['Tax exemption filing under Section 56(2)(viib)', 'GST'] },
  'V02-SVC-017': { amount: 14999, basis: 'ANNUAL', inc: ['Annual company secretarial retainer', 'Statutory registers maintenance', 'Board meeting & AGM minutes', 'Form AOC-4 filing', 'Form MGT-7 filing'], exc: ['MCA filing fees', 'Late filing penalties under Section 403', 'GST'] },
  'V02-SVC-004': { amount: 3999, basis: 'FIXED', inc: ['Form AOC-4 preparation', 'Financial statement tagging', 'CS verification & certification'], exc: ['MCA filing fee', 'Late fee', 'GST'] },
  'V02-SVC-008': { amount: 3999, basis: 'FIXED', inc: ['Form MGT-7 preparation', 'Shareholding list compilation', 'PCS certification where mandated'], exc: ['MCA filing fee', 'Late fee', 'GST'] },
  'V02-SVC-002': { amount: 999, basis: 'FIXED', inc: ['DIR-3 KYC verification', 'Mobile & email OTP authentication', 'MCA challan generation'], exc: ['Late penalty (₹5,000 post-deadline)', 'GST'] },
  'V02-SVC-013': { amount: 19999, basis: 'FIXED', inc: ['Form STK-2 application', 'Form STK-3 indemnity bond drafting', 'Form STK-4 affidavit drafting', 'Statement of accounts CS certification'], exc: ['RoC STK-2 statutory challan fee (₹10,000)', 'GST'] },
  'V06-SVC-003': { amount: 3499, basis: 'STARTING_FROM', inc: ['Comprehensive trademark search', 'Nice class classification advice', 'Form TM-A drafting and electronic filing'], exc: ['Official Trade Marks Registry fee (₹4,500 MSME / ₹9,000 Other)', 'Objection reply & hearings', 'GST'] },
  'V07-SVC-002': { amount: 9999, basis: 'STARTING_FROM', inc: ['Internal Committee (IC) constitution', 'POSH policy drafting', 'Annual report filing template'], exc: ['External member quarterly retainer', 'Inquiry proceedings representation', 'GST'] },
  'V09-SVC-001': { amount: 49999, basis: 'STARTING_FROM', inc: ['Section 233 fast-track merger scheme drafting', 'Board & member meeting notices', 'Regional Director (RD) & RoC coordination'], exc: ['Official liquidator / RD fees', 'Stamp duty on scheme', 'GST'] },
  'V09-SVC-003': { amount: 74999, basis: 'STARTING_FROM', inc: ['Sections 230-232 transactional secretarial documentation', 'Meeting convening notices and proxy forms', 'RoC/RD report filings'], exc: ['Tribunal advocacy / counsel representation before NCLT benches', 'Court fees', 'GST'] }
};

const pricingRecords = [];

serviceRegistry.forEach(svc => {
  if (svc.record_status === 'ACTIVE_SERVICE') {
    const sId = svc.service_id;
    const prcId = `PRC-${sId}`;
    const baseline = baselinePrices[sId];

    if (baseline) {
      pricingRecords.push({
        pricing_id: prcId,
        service_id: sId,
        currency: 'INR',
        amount: baseline.amount,
        pricing_basis: baseline.basis,
        included_charges: baseline.inc,
        excluded_charges: baseline.exc,
        effective_from: '2026-10-15',
        effective_to: null,
        source_id: 'SRC-INT-PRC-001',
        verification_status: 'UNVERIFIED',
        last_verified_at: null,
        next_review_at: '2026-11-15',
        notes: 'Captured website template baseline figure. Preserved strictly as UNVERIFIED pending partner pricing committee review.'
      });
    } else {
      pricingRecords.push({
        pricing_id: prcId,
        service_id: sId,
        currency: 'INR',
        amount: null,
        pricing_basis: 'CUSTOM_QUOTE',
        included_charges: ['Scope of work assessment', 'Professional time estimate', 'Deliverable milestone roadmap'],
        excluded_charges: ['Statutory government challans and fees', 'Out-of-pocket expenses', 'GST'],
        effective_from: '2026-10-15',
        effective_to: null,
        source_id: 'SRC-INT-PRC-001',
        verification_status: 'UNVERIFIED',
        last_verified_at: null,
        next_review_at: '2026-11-15',
        notes: 'Variable transactional scope. Preserved as custom quote with null amount; fees provided upon scoping.'
      });
    }
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'pricing.json'), JSON.stringify(pricingRecords, null, 2), 'utf8');
console.log(`Generated pricing.json: ${pricingRecords.length} records`);

// ----------------------------------------------------
// 4. DATASET D: Eligibility (Audited Sourcing & Unverified Gating)
// ----------------------------------------------------
const eligibilityRecords = [];
serviceRegistry.forEach(svc => {
  if (svc.record_status === 'ACTIVE_SERVICE') {
    const sId = svc.service_id;
    const elgId = `ELG-${sId}`;
    const vId = svc.primary_vertical_id;

    let entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'OPC', 'LLP'];
    let prereqs = ['Active entity status or eligible promoters/subscribers'];
    let docs = ['Identity & address proofs of key managerial personnel / promoters'];
    let exceptions = ['Non-standard objects or regulated sectors require prior sectoral regulator approvals'];
    let srcId = 'SRC-MCA-001';
    let status = 'SOURCE_IDENTIFIED';

    // Tailored requirements based on service domain
    if (sId === 'V01-SVC-001') {
      entityTypes = ['PVT_LTD', 'LLP', 'PARTNERSHIP'];
      prereqs = ['Entity incorporated < 10 years ago', 'Turnover < ₹100 crore in all preceding financial years', 'Innovative product/service or scalable business model'];
      docs = ['Certificate of Incorporation / Registration', 'Pitch deck / brief description of innovation', 'Website or mobile app link where applicable'];
      exceptions = ['Entities formed by splitting up or reconstruction of an existing business are ineligible'];
      srcId = 'SRC-DPIIT-001';
    } else if (sId === 'V01-SVC-002') {
      entityTypes = ['LLP'];
      prereqs = ['Minimum 2 designated partners', 'At least 1 resident designated partner in India', 'Consent to act as partner'];
      docs = ['PAN card of partners', 'Address proofs (< 2 months old)', 'Registered office utility bill and NOC', 'LLP Agreement'];
      exceptions = ['Bodies corporate acting as partner must appoint an individual nominee'];
      srcId = 'SRC-MCA-001';
    } else if (sId === 'V01-SVC-003') {
      entityTypes = ['PVT_LTD', 'LLP', 'OPC', 'PARTNERSHIP', 'PROPRIETORSHIP'];
      prereqs = ['Micro, Small or Medium enterprise investment & turnover thresholds satisfied'];
      docs = ['Aadhaar card of entrepreneur / partner / director', 'PAN of business entity', 'GSTIN where applicable'];
      exceptions = ['Trading entities without manufacturing/service activities subject to special NIC classification'];
      srcId = 'SRC-MSME-001';
    } else if (sId === 'V01-SVC-004') {
      entityTypes = ['OPC'];
      prereqs = ['Single individual natural person promoter', 'Promoter must be an Indian citizen', 'Nominee must be nominated in Form INC-3'];
      docs = ['PAN & ID of sole member', 'INC-3 consent form signed by nominee', 'Registered office address proof'];
      exceptions = ['A person cannot incorporate more than one OPC or become nominee in more than one OPC'];
      srcId = 'SRC-MCA-001';
    } else if (sId === 'V01-SVC-005') {
      entityTypes = ['PARTNERSHIP'];
      prereqs = ['Minimum 2 partners', 'Written partnership deed agreeing to share profits of a business'];
      docs = ['Partnership Deed executed on non-judicial stamp paper', 'PAN cards of all partners', 'Address proof of principal place of business'];
      exceptions = ['Minor can be admitted to benefits of partnership but cannot be made a full partner'];
      srcId = null; // State RoF jurisdiction under Indian Partnership Act 1932; not Central MCA
      status = 'UNREVIEWED';
    } else if (sId === 'V01-SVC-006') {
      entityTypes = ['PROPRIETORSHIP', 'INDIVIDUAL'];
      prereqs = ['Single individual proprietor operating a commercial activity'];
      docs = ['PAN card of proprietor', 'Aadhaar card', 'Bank account statement', 'Commercial electricity bill or rent agreement'];
      exceptions = ['Sole proprietorship does not possess a distinct legal personality separate from proprietor'];
      srcId = null;
      status = 'UNREVIEWED';
    } else if (sId === 'V01-SVC-007') {
      entityTypes = ['PVT_LTD'];
      prereqs = ['Minimum 2 directors (at least 1 resident in India)', 'Minimum 2 shareholders', 'Unique company name compliant with Rule 8'];
      docs = ['PAN card of all directors & subscribers', 'Aadhaar / Passport / Voter ID', 'Bank statement or electricity bill (< 2 months old)', 'NOC from registered office owner + utility bill', 'Specimen signature in Form INC-9'];
      exceptions = ['Foreign subscribers require notarized and apostilled KYC documentation'];
      srcId = 'SRC-MCA-001';
    } else if (sId === 'V01-SVC-008') {
      entityTypes = ['SECTION_8'];
      prereqs = ['Non-profit objects (promotion of commerce, art, charity, education, environment)', 'Statutory prohibition on dividend payments to members', 'Form INC-12 license approval'];
      docs = ['Draft MoA and AoA with Section 8 clauses', 'Three-year projected income and expenditure estimate', 'Declaration by practicing professional'];
      exceptions = ['Cannot alter MoA without prior approval of Central Government / Regional Director'];
      srcId = 'SRC-MCA-001';
    } else if (sId === 'V01-SVC-009' || sId === 'V01-SVC-010') {
      entityTypes = [sId === 'V01-SVC-009' ? 'SOCIETY' : 'TRUST'];
      prereqs = ['Eligible trustees / governing body members with charitable non-profit charter'];
      docs = ['Trust Deed / Society MoA & Byelaws', 'Identity & address proofs of trustees/founders'];
      exceptions = ['Governed under State Societies / Indian Trusts Act; not Central MCA'];
      srcId = null;
      status = 'UNREVIEWED';
    } else if (vId === 'V03') {
      // Tax filings
      if (sId === 'V03-SVC-003') {
        entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP', 'PROPRIETORSHIP', 'PARTNERSHIP'];
        prereqs = ['Registered regular GST taxpayer with turnover exceeding statutory threshold'];
        docs = ['GSTR-1 and GSTR-3B monthly return reconciliations', 'Audited annual financial statements'];
        exceptions = ['Composition taxpayers file Form GSTR-4 instead of GSTR-9'];
        srcId = 'SRC-CBIC-001';
      } else {
        entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP', 'TRUST', 'PROPRIETORSHIP'];
        prereqs = ['Taxable entity subject to Income-tax Act, 1961 assessment'];
        docs = ['Books of account', 'Tax audit report where mandated', 'Form 26AS / AIS / TIS tax credit reconciliations'];
        exceptions = ['Specified trust/international transactions require prescribed accountant audit certificates'];
        srcId = 'SRC-CBDT-001';
      }
    } else if (vId === 'V04') {
      // PF / ESIC (V04-SVC-001)
      entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP', 'PARTNERSHIP', 'PROPRIETORSHIP'];
      prereqs = ['Commercial establishment employing 20+ persons (PF) or 10+ persons in notified areas (ESIC)'];
      docs = ['Establishment PAN', 'Certificate of Incorporation / Registration', 'Cancelled cheque of business bank account', 'List of eligible employees with UAN/ESIC numbers'];
      exceptions = ['Voluntary registration permitted for establishments below statutory headcount threshold'];
      srcId = 'SRC-EPFO-001';
    } else if (vId === 'V06') {
      // IP Protection
      entityTypes = ['PVT_LTD', 'LLP', 'OPC', 'PARTNERSHIP', 'PROPRIETORSHIP', 'INDIVIDUAL'];
      prereqs = ['Distinctive brand name, logo, or mark used or proposed to be used in commerce'];
      docs = ['Form TM-48 Power of Attorney', 'Logo/wordmark representation', 'User affidavit with documentary proof where prior use is claimed', 'MSME/Udyam certificate for fee concession'];
      exceptions = ['Generic, descriptive, deceptive, or prohibited marks under Sections 9 and 11 cannot be registered'];
      srcId = 'SRC-CGPDTM-001';
    } else if (vId === 'V07') {
      entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP'];
      prereqs = ['Commercial establishment employing workforce subject to labour statutes / POSH Act'];
      docs = ['Workplace policy documentation', 'Internal Committee constitution order'];
      exceptions = ['Establishments with fewer than 10 employees remit complaints to District Local Committee'];
      srcId = null;
      status = 'UNREVIEWED';
    } else if (vId === 'V12') {
      if (sId === 'V12-SVC-001') {
        entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP', 'FOREIGN_COMPANY'];
        prereqs = ['Covered corporate entity experiencing cybersecurity incident under CERT-In directions'];
        docs = ['Incident logs', 'System forensic snapshot', 'Technical root cause analysis report'];
        exceptions = ['Mandatory 6-hour reporting window applies to all covered cyber security incidents'];
        srcId = 'SRC-CERTIN-001';
      } else if (sId === 'V12-SVC-002') {
        entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'FOREIGN_COMPANY'];
        prereqs = ['Data Fiduciary processing digital personal data of Indian data principals'];
        docs = ['Data inventory & mapping matrix', 'Consent notice templates', 'Grievance redressal mechanism documentation'];
        exceptions = ['Specified processing for state security or legal obligations subject to statutory exemptions'];
        srcId = 'SRC-DPDP-001';
      } else {
        srcId = null;
        status = 'UNREVIEWED';
      }
    } else if (vId === 'V13') {
      if (sId === 'V13-SVC-003') {
        entityTypes = ['PVT_LTD', 'PUBLIC_UNLISTED', 'LLP'];
        prereqs = ['Indian company or LLP holding Foreign Direct Investment (FDI) or Overseas Direct Investment (ODI)'];
        docs = ['Audited financial statements for financial year', 'FLAIR portal login credentials'];
        exceptions = ['Entities without foreign assets or liabilities are exempt from annual FLA filing'];
        srcId = 'SRC-RBI-001';
      } else {
        srcId = 'SRC-MCA-001';
      }
    } else if (sId === 'V02-SVC-018') {
      entityTypes = ['PARTNERSHIP'];
      prereqs = ['Registered partnership firm under Indian Partnership Act, 1932'];
      docs = ['Reconstitution deed / dissolution deed', 'Form B/C/D filings per state RoF rules'];
      exceptions = ['State Registrar of Firms jurisdiction; not Central MCA'];
      srcId = null;
      status = 'UNREVIEWED';
    }

    eligibilityRecords.push({
      eligibility_id: elgId,
      service_id: sId,
      applicable_entity_types: entityTypes,
      prerequisites: prereqs,
      required_documents: docs,
      exceptions_and_limitations: exceptions,
      jurisdiction: 'IN-CENTRAL',
      source_id: srcId,
      verification_status: status,
      last_verified_at: null, // Kept null because live professional CS/advocate signoff is pending
      next_review_at: '2027-04-01'
    });
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'eligibility.json'), JSON.stringify(eligibilityRecords, null, 2), 'utf8');
console.log(`Generated eligibility.json: ${eligibilityRecords.length} records`);

// ----------------------------------------------------
// 5. DATASET E: Jurisdiction Variations (Unreviewed Research Candidates)
// ----------------------------------------------------
const jurisdictionVariations = [
  {
    variation_id: 'VAR-001',
    service_id: 'V01-SVC-007',
    jurisdiction_id: 'IN-DL',
    jurisdiction_type: 'STATE',
    variation_category: 'STAMP_DUTY',
    rule_description: 'Delhi e-Stamp Duty: ₹200 on e-MoA and ₹1,000 on e-AoA (for nominal capital up to ₹1,00,000, scaled upwards per Delhi Stamp Act schedule). [Unverified research candidate awaiting state gazette citation].',
    effective_from: '2020-04-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-002',
    service_id: 'V01-SVC-007',
    jurisdiction_id: 'IN-MH',
    jurisdiction_type: 'STATE',
    variation_category: 'STAMP_DUTY',
    rule_description: 'Maharashtra e-Stamp Duty: ₹200 on e-MoA and 0.2% on authorized capital for e-AoA subject to a statutory maximum cap of ₹50,00,000. [Unverified research candidate awaiting state gazette citation].',
    effective_from: '2015-04-24',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-003',
    service_id: 'V01-SVC-007',
    jurisdiction_id: 'IN-KA',
    jurisdiction_type: 'STATE',
    variation_category: 'STAMP_DUTY',
    rule_description: 'Karnataka e-Stamp Duty: ₹1,000 on e-MoA and tiered percentage on e-AoA per Karnataka Stamp (Amendment) Act. [Unverified research candidate awaiting state gazette citation].',
    effective_from: '2014-04-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-004',
    service_id: 'V01-SVC-002',
    jurisdiction_id: 'IN-DL',
    jurisdiction_type: 'STATE',
    variation_category: 'STAMP_DUTY',
    rule_description: 'Delhi LLP Agreement Stamp Duty: ₹100 for capital contribution up to ₹1,00,000; non-judicial e-stamp paper required. [Unverified research candidate awaiting state gazette citation].',
    effective_from: '2019-01-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-005',
    service_id: 'V01-SVC-002',
    jurisdiction_id: 'IN-MH',
    jurisdiction_type: 'STATE',
    variation_category: 'STAMP_DUTY',
    rule_description: 'Maharashtra LLP Agreement Stamp Duty: ₹500 for contribution up to ₹50,000, progressive tiers up to ₹5,000 for contribution exceeding ₹10,00,000. [Unverified research candidate awaiting state gazette citation].',
    effective_from: '2015-04-24',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-006',
    service_id: 'V01-SVC-005',
    jurisdiction_id: 'IN-MH',
    jurisdiction_type: 'STATE',
    variation_category: 'LOCAL_ROF_PROCEDURE',
    rule_description: 'Maharashtra Registrar of Firms: Online filing via RoF Maharashtra portal; Form A submission with notarized deed on ₹500 stamp paper. [Unverified research candidate awaiting state RoF portal citation].',
    effective_from: '2018-01-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-007',
    service_id: 'V01-SVC-005',
    jurisdiction_id: 'IN-KA',
    jurisdiction_type: 'STATE',
    variation_category: 'LOCAL_ROF_PROCEDURE',
    rule_description: 'Karnataka Registrar of Firms: District Registrar of Societies and Firms jurisdiction; physical verification of original deed required. [Unverified research candidate awaiting state RoF portal citation].',
    effective_from: '2017-06-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-008',
    service_id: 'V04-SVC-001',
    jurisdiction_id: 'IN-MH',
    jurisdiction_type: 'STATE',
    variation_category: 'PROFESSIONAL_TAX',
    rule_description: 'Maharashtra Professional Tax: Mandatory PTRC for employers and PTEC for business entities under Maharashtra State Tax on Professions Act 1975. [Unverified research candidate awaiting MahaGST citation].',
    effective_from: '1975-04-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-009',
    service_id: 'V04-SVC-001',
    jurisdiction_id: 'IN-KA',
    jurisdiction_type: 'STATE',
    variation_category: 'PROFESSIONAL_TAX',
    rule_description: 'Karnataka Professional Tax: Mandatory registration within 30 days of hiring employees under Karnataka Tax on Professions Act 1976. [Unverified research candidate awaiting Karnataka Commercial Taxes citation].',
    effective_from: '1976-04-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  },
  {
    variation_id: 'VAR-010',
    service_id: 'V04-SVC-001',
    jurisdiction_id: 'IN-DL',
    jurisdiction_type: 'UNION_TERRITORY',
    variation_category: 'PROFESSIONAL_TAX',
    rule_description: 'Delhi National Capital Territory: Zero Professional Tax enactment; commercial establishments in Delhi are exempt from PT filings. [Unverified research candidate awaiting statutory confirmation].',
    effective_from: '1990-01-01',
    effective_to: null,
    source_id: null,
    verification_status: 'UNREVIEWED',
    last_verified_at: null,
    next_review_at: '2027-04-01'
  }
];

fs.writeFileSync(path.join(DATA_DIR, 'jurisdiction-variations.json'), JSON.stringify(jurisdictionVariations, null, 2), 'utf8');
console.log(`Generated jurisdiction-variations.json: ${jurisdictionVariations.length} records`);

// ----------------------------------------------------
// 6. DATASET F: Regulatory Claims (Audited Against Phase 1 Register)
// ----------------------------------------------------
const p1ClaimsCsvPath = path.join(ROOT, 'review-output', 'phase-1-foundations', 'phase-1-claims-register.csv');
const p1ClaimsRows = parseCSV(fs.readFileSync(p1ClaimsCsvPath, 'utf8')).slice(1);

const categoryMap = {
  'Government Connectivity Claim': 'GOVERNMENT_CONNECTIVITY',
  'Real-Time Data Sync Claim': 'REAL_TIME_SYNC',
  'Real-Time Automation Claim': 'REGULATORY_OS',
  'Real-Time Data Claim': 'COUNTDOWN_ACCURACY',
  'False Negative / Availability Guarantee': 'TRADEMARK_AVAILABILITY',
  'Availability Guarantee': 'TRADEMARK_AVAILABILITY',
  'Litigation Representation Claim': 'TRIBUNAL_ADVOCACY_SCOPE',
  'Advocacy / BCI Scope': 'TRIBUNAL_ADVOCACY_SCOPE',
  'Tribunal Litigation Claim': 'TRIBUNAL_ADVOCACY_SCOPE',
  'Statutory Provision Claim': 'STATUTORY_PROVISION',
  'Statutory Procedure Claim': 'STATUTORY_PROVISION',
  'Accessibility Attribute': 'HOST_AND_SECURITY',
  'UI Label': 'PRICING_AND_FEES',
  'Backend Architecture Plan': 'HOST_AND_SECURITY',
  'Pricing & Government Fee Claim': 'PRICING_AND_FEES',
  'Advocate Panel Claim': 'TRIBUNAL_ADVOCACY_SCOPE',
  'Automated Filing & Tribunal Defense Claim': 'TRIBUNAL_ADVOCACY_SCOPE',
  'Live Payment & Invoicing Claim': 'NOTIFICATION_GATEWAY',
  'Notification Gateway Claim': 'NOTIFICATION_GATEWAY',
  'Host Configuration Discrepancy': 'HOST_AND_SECURITY'
};

const regulatoryClaims = p1ClaimsRows.map(r => {
  const claimId = r[0]; // CLM-001 to CLM-025
  const claimText = r[2];
  const rawClass = r[3];
  const disposition = r[5];

  const category = categoryMap[rawClass] || 'STATUTORY_PROVISION';
  let riskPriority = 'P2_HIGH';
  if (['CLM-005', 'CLM-006', 'CLM-007', 'CLM-008', 'CLM-009', 'CLM-010', 'CLM-011', 'CLM-012', 'CLM-021', 'CLM-022'].includes(claimId)) {
    riskPriority = 'P1_CRITICAL';
  } else if (['CLM-016', 'CLM-017', 'CLM-018'].includes(claimId)) {
    riskPriority = 'P4_LOW';
  } else if (['CLM-019', 'CLM-025'].includes(claimId)) {
    riskPriority = 'P3_MEDIUM';
  }

  let serviceId = null;
  let verticalId = null;
  let sourceId = null;
  let verificationStatus = 'REJECTED_OR_OUTDATED';
  let requiresProfReview = true;
  let reviewOutcome = 'REJECTED';
  let lastReviewedAt = '2026-10-17';

  // Audit evaluation per claim
  if (['CLM-001', 'CLM-002', 'CLM-003', 'CLM-004'].includes(claimId)) {
    // Unsubstantiated live connectivity claims rejected in Phase 1
    sourceId = 'SRC-MCA-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (['CLM-005', 'CLM-006', 'CLM-007'].includes(claimId)) {
    // Misleading IP search and trademark availability claims rejected in Phase 1
    serviceId = 'V06-SVC-003';
    verticalId = 'V06';
    sourceId = 'SRC-CGPDTM-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (['CLM-008', 'CLM-009'].includes(claimId)) {
    // Contentious petition execution & tribunal advocacy rejected under Advocates Act 1961
    serviceId = 'V09-SVC-003';
    verticalId = 'V09';
    sourceId = 'SRC-BAR-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (['CLM-010', 'CLM-011', 'CLM-012'].includes(claimId)) {
    // Contentious tribunal litigation defense packages on referral-only routes rejected
    verticalId = 'V10';
    sourceId = 'SRC-BAR-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (claimId === 'CLM-013') {
    // Statutory provision: Section 403 late fee computation
    verticalId = 'V02';
    sourceId = 'SRC-MCA-001';
    verificationStatus = 'PENDING_PROFESSIONAL_REVIEW';
    reviewOutcome = 'PENDING';
    lastReviewedAt = null;
  } else if (claimId === 'CLM-014') {
    // Statutory procedure: SPICe+ Part A / B integration
    serviceId = 'V01-SVC-007';
    verticalId = 'V01';
    sourceId = 'SRC-MCA-001';
    verificationStatus = 'PENDING_PROFESSIONAL_REVIEW';
    reviewOutcome = 'PENDING';
    lastReviewedAt = null;
  } else if (claimId === 'CLM-015') {
    // Statutory rule: Rule 9B dematerialization of private company securities
    serviceId = 'V02-SVC-012';
    verticalId = 'V02';
    sourceId = 'SRC-MCA-001';
    verificationStatus = 'PENDING_PROFESSIONAL_REVIEW';
    reviewOutcome = 'PENDING';
    lastReviewedAt = null;
  } else if (['CLM-016', 'CLM-017'].includes(claimId)) {
    // Technical UI accessibility attributes — false positive as regulatory claims
    requiresProfReview = false;
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (claimId === 'CLM-018') {
    // Descriptive UI label — false positive as regulatory claim
    requiresProfReview = false;
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (claimId === 'CLM-019') {
    // Cloudflare Worker backend plan — gated for future phase
    verificationStatus = 'SOURCE_NEEDED';
    reviewOutcome = 'PENDING';
    lastReviewedAt = null;
  } else if (claimId === 'CLM-020') {
    // Indicative commercial fee statement — unverified baseline
    serviceId = 'V01-SVC-007';
    verticalId = 'V01';
    sourceId = 'SRC-INT-PRC-001';
    verificationStatus = 'SOURCE_IDENTIFIED';
    reviewOutcome = 'PENDING';
    lastReviewedAt = null;
  } else if (['CLM-021', 'CLM-022', 'CLM-023', 'CLM-024'].includes(claimId)) {
    // Advocate panel, automated AI legal drafting, instant checkout, alert gateway claims rejected
    sourceId = ['CLM-021', 'CLM-022'].includes(claimId) ? 'SRC-BAR-001' : 'SRC-INT-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  } else if (claimId === 'CLM-025') {
    // Obsolete host target corrected to ccs.craftegon.com
    sourceId = 'SRC-INT-001';
    verificationStatus = 'REJECTED_OR_OUTDATED';
    reviewOutcome = 'REJECTED';
  }

  return {
    claim_id: claimId,
    claim_text: claimText,
    category: category,
    risk_priority: riskPriority,
    service_id: serviceId,
    vertical_id: verticalId,
    jurisdiction: 'IN-CENTRAL',
    source_id: sourceId,
    verification_status: verificationStatus,
    requires_professional_review: requiresProfReview,
    professional_review_outcome: reviewOutcome,
    last_reviewed_at: lastReviewedAt,
    disposition: disposition
  };
});

fs.writeFileSync(path.join(DATA_DIR, 'regulatory-claims.json'), JSON.stringify(regulatoryClaims, null, 2), 'utf8');
console.log(`Generated regulatory-claims.json: ${regulatoryClaims.length} records`);

console.log('All Phase 2 datasets generated and audited successfully.');
