/**
 * ============================================================================
 * CRAFTEGON CCS — PHASE 2 MASTER SERVICE REGISTRY VALIDATOR & TEST SUITE
 * ============================================================================
 * Task: Phase 2, Task 2: Define and Validate the Seven Data Files and Schemas
 * 
 * Enforces:
 * 1. Exactly 57 total routes (54 approved active service IDs + 3 referral-only routes)
 * 2. Exactly 15 approved verticals
 * 3. 100% route and ID reconciliation against authoritative Phase 1 baseline
 * 4. Zero duplicate service IDs or canonical routes
 * 5. Referral-only routes have strictly NO service IDs
 * 6. Zero obsolete (provisional) annotations
 * 7. Negative fixture test harness validating that corrupted registries fail
 * 8. Structural JSON Schema validation (Draft 2020-12 via Ajv) across all 7 datasets
 * 9. Cross-file referential integrity & evidence-gating consistency
 * 10. Comprehensive negative fixtures for schema, integrity, and verification states
 */

const fs = require('fs');
const path = require('path');

let Ajv2020 = null;
let addFormats = null;
try {
  Ajv2020 = require('ajv/dist/2020');
  addFormats = require('ajv-formats');
} catch (e) {
  // Graceful fallback to custom subset if ajv is not installed
}

let ajv2020Instance = null;
if (Ajv2020 && addFormats) {
  ajv2020Instance = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv2020Instance);
}

const ROOT = path.resolve(__dirname, '..');
const PHASE_2_CSV_PATH = path.join(ROOT, 'review-output', 'phase-2-service-registry', 'phase-2-service-ownership-review.csv');
const PHASE_1_CSV_PATH = path.join(ROOT, 'review-output', 'phase-1-foundations', 'phase-1-service-ownership-review.csv');
const SERVICES_DIR = path.join(ROOT, 'services');
const DATA_DIR = path.join(ROOT, 'data');
const SCHEMAS_DIR = path.join(DATA_DIR, 'schemas');

const APPROVED_VERTICALS = new Set([
  'V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07',
  'V08', 'V09', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'
]);

// Authoritative 57 routes baseline
const APPROVED_57_ROUTES = [
  '/services/dpiit-startup-india.html',
  '/services/llp-registration.html',
  '/services/msme-udyam.html',
  '/services/opc-registration.html',
  '/services/partnership-registration.html',
  '/services/proprietorship-registration.html',
  '/services/pvt-ltd-registration.html',
  '/services/section-8-registration.html',
  '/services/society-registration.html',
  '/services/trust-registration.html',
  '/services/aoc4-xbrl.html',
  '/services/dir3-kyc.html',
  '/services/form-adt1.html',
  '/services/form-aoc4.html',
  '/services/form-ben2.html',
  '/services/form-dpt3.html',
  '/services/form-mgt14.html',
  '/services/form-mgt7.html',
  '/services/form-mr1.html',
  '/services/form-msme1.html',
  '/services/form-msc1-dormant.html',
  '/services/form-pas6.html',
  '/services/form-stk2-strike-off.html',
  '/services/llp-compliance-forms.html',
  '/services/llp-form24-strike-off.html',
  '/services/mbp1-dir8.html',
  '/services/roc-annual-compliance.html',
  '/services/rof-maintenance.html',
  '/services/form-10b.html',
  '/services/form-3ceb.html',
  '/services/gst-annual.html',
  '/services/itr7.html',
  '/services/proprietorship-tax.html',
  '/services/pf-esic-compliance.html',
  '/services/founder-shareholder-agreements.html',
  '/services/master-service-agreements.html',
  '/services/ip-enforcement-cease-desist.html',
  '/services/software-copyright-patents.html',
  '/services/trademark-registration.html',
  '/services/labour-code-handbooks.html',
  '/services/posh-compliance.html',
  '/services/fast-track-mergers.html',
  '/services/slump-sale-asset-purchase.html',
  '/services/director-removal-board-disputes.html',
  '/services/nclt-insolvency-defense.html',
  '/services/nclt-merger-petitions.html',
  '/services/oppression-mismanagement-petitions.html',
  '/services/board-governance-risk-assessment.html',
  '/services/board-minutes.html',
  '/services/form-csr2.html',
  '/services/form-mr3-secretarial-audit.html',
  '/services/cyber-incident-reporting.html',
  '/services/dpdp-compliance-audit.html',
  '/services/saas-terms-privacy-architecture.html',
  '/services/cross-border-tech-transfer.html',
  '/services/form-fc3-fc4.html',
  '/services/rbi-fla-return.html'
];

const REFERRAL_ONLY_ROUTES = new Set([
  '/services/director-removal-board-disputes.html',
  '/services/nclt-insolvency-defense.html',
  '/services/oppression-mismanagement-petitions.html'
]);

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

/**
 * Validates a CSV string representing the registry.
 * Does NOT silently normalize IDs or convert unknown values into approved records.
 */
function validateRegistry(csvContent, options = {}) {
  const errors = [];
  const rows = parseCSV(csvContent);

  if (rows.length <= 1) {
    errors.push('Registry CSV is empty or has only headers.');
    return { valid: false, errors, metrics: {} };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const idIdx = 0;
  const classIdx = 1;
  const routeIdx = 2;
  const vCodeIdx = 4;
  const approvalIdx = headers.indexOf('Review & Approval Status');
  const conflictIdx = headers.indexOf('Unresolved Source Conflicts');

  const seenRoutes = new Map();
  const seenActiveIds = new Map();
  const activeRoutes = [];
  const referralRoutes = [];
  const verticalsPresent = new Set();

  dataRows.forEach((row, rowIdx) => {
    const lineNum = rowIdx + 2;
    const rawId = row[idIdx] !== undefined ? row[idIdx].trim() : '';
    const rawClass = row[classIdx] !== undefined ? row[classIdx].trim() : '';
    const rawRoute = row[routeIdx] !== undefined ? row[routeIdx].trim() : '';
    const rawVCode = row[vCodeIdx] !== undefined ? row[vCodeIdx].trim() : '';
    const rawApproval = approvalIdx !== -1 && row[approvalIdx] ? row[approvalIdx].trim() : '';
    const rawConflict = conflictIdx !== -1 && row[conflictIdx] ? row[conflictIdx].trim() : 'NONE';

    // Check: Empty route
    if (!rawRoute) {
      errors.push(`Line ${lineNum}: Missing canonical route.`);
      return;
    }

    // Check: Duplicate route
    if (seenRoutes.has(rawRoute)) {
      errors.push(`Line ${lineNum}: Duplicate canonical route '${rawRoute}' (already defined on line ${seenRoutes.get(rawRoute)}).`);
    } else {
      seenRoutes.set(rawRoute, lineNum);
    }

    // Check: Route validity format
    if (!rawRoute.startsWith('/services/') || !rawRoute.endsWith('.html')) {
      errors.push(`Line ${lineNum}: Canonical route '${rawRoute}' does not follow required pattern /services/*.html.`);
    }

    // Check: Obsolete (provisional) annotations
    if (rawId.includes('(provisional)') || rawRoute.includes('(provisional)')) {
      errors.push(`Line ${lineNum}: Obsolete (provisional) annotation remaining in '${rawId || rawRoute}'.`);
    }

    const isReferralRoute = REFERRAL_ONLY_ROUTES.has(rawRoute);

    if (isReferralRoute) {
      referralRoutes.push(rawRoute);
      // Check: Referral route must not have active service ID
      if (rawId && rawId !== 'NONE' && rawId !== 'N/A') {
        errors.push(`Line ${lineNum}: Referral-only route '${rawRoute}' must not have an active service ID, but found '${rawId}'.`);
      }
      // Check: Classification must indicate referral
      if (!rawClass.includes('REFERRAL')) {
        errors.push(`Line ${lineNum}: Referral route '${rawRoute}' classification '${rawClass}' does not indicate referral status.`);
      }
      // Check: Primary vertical code must be NONE or empty
      if (rawVCode && rawVCode !== 'NONE') {
        errors.push(`Line ${lineNum}: Referral route '${rawRoute}' must not specify primary vertical code, found '${rawVCode}'.`);
      }
    } else {
      // Active service route
      activeRoutes.push(rawRoute);

      // Check: Missing active service ID
      if (!rawId || rawId === 'NONE' || rawId === 'N/A') {
        errors.push(`Line ${lineNum}: Active service route '${rawRoute}' is missing an active service ID.`);
      } else {
        // Check: Duplicate active service ID
        if (seenActiveIds.has(rawId)) {
          errors.push(`Line ${lineNum}: Duplicate active service ID '${rawId}' assigned to '${rawRoute}' (already assigned to '${seenActiveIds.get(rawId).route}' at line ${seenActiveIds.get(rawId).line}).`);
        } else {
          seenActiveIds.set(rawId, { route: rawRoute, line: lineNum });
        }

        // Check: Valid service ID pattern
        if (!/^V\d{2}-SVC-\d{3}$/.test(rawId)) {
          errors.push(`Line ${lineNum}: Service ID '${rawId}' does not match standard approved pattern Vxx-SVC-xxx.`);
        }
      }

      // Check: Primary vertical validity
      if (!rawVCode || !APPROVED_VERTICALS.has(rawVCode)) {
        errors.push(`Line ${lineNum}: Route '${rawRoute}' has invalid or unknown primary vertical '${rawVCode}'.`);
      } else {
        verticalsPresent.add(rawVCode);
      }
    }

    // Check: Unresolved conflict marked as approved
    if (rawConflict !== 'NONE' && rawConflict !== '' && rawApproval.includes('APPROVED')) {
      errors.push(`Line ${lineNum}: Unresolved authoritative conflict '${rawConflict}' incorrectly marked as approved for route '${rawRoute}'.`);
    }
  });

  // Check: Total route count
  if (dataRows.length !== 57) {
    errors.push(`Registry route count mismatch: Expected exactly 57 routes, but found ${dataRows.length}.`);
  }

  // Check: Missing or unexpected routes compared to approved 57
  const foundRouteSet = new Set(dataRows.map(r => r[routeIdx].trim()));
  const missingRoutes = APPROVED_57_ROUTES.filter(r => !foundRouteSet.has(r));
  const unexpectedRoutes = Array.from(foundRouteSet).filter(r => !APPROVED_57_ROUTES.includes(r));

  if (missingRoutes.length > 0) {
    errors.push(`Missing expected routes (${missingRoutes.length}): ${missingRoutes.join(', ')}.`);
  }
  if (unexpectedRoutes.length > 0) {
    errors.push(`Unexpected routes detected (${unexpectedRoutes.length}): ${unexpectedRoutes.join(', ')}.`);
  }

  // Check: Active and referral counts
  if (seenActiveIds.size !== 54) {
    errors.push(`Active service ID count mismatch: Expected exactly 54 unique active IDs, found ${seenActiveIds.size}.`);
  }
  if (referralRoutes.length !== 3) {
    errors.push(`Referral-only route count mismatch: Expected exactly 3 referral routes, found ${referralRoutes.length}.`);
  }

  const metrics = {
    totalRoutes: dataRows.length,
    activeIdCount: seenActiveIds.size,
    referralRouteCount: referralRoutes.length,
    uniqueActiveIds: seenActiveIds.size,
    verticalsCount: verticalsPresent.size,
    errorCount: errors.length
  };

  return {
    valid: errors.length === 0,
    errors,
    metrics
  };
}

/**
 * Validates a JavaScript value against a JSON Schema Draft 2020-12 definition.
 * Uses official Ajv 2020 engine when available, with a robust fallback implementation.
 */
function validateJsonSchema(value, schema, path = '') {
  if (!schema) return [];

  if (ajv2020Instance) {
    try {
      const validate = ajv2020Instance.compile(schema);
      const valid = validate(value);
      if (!valid && validate.errors) {
        return validate.errors.map(err => `${path}${err.instancePath}: ${err.message} (${JSON.stringify(err.params)})`);
      }
      return [];
    } catch (e) {
      // Fallback to custom validator if Ajv compilation encounters an unhandled edge case
    }
  }

  return validateJsonSchemaFallback(value, schema, path);
}

/**
 * Fallback lightweight JSON Schema subset validator.
 */
function validateJsonSchemaFallback(value, schema, path = '') {
  const errors = [];
  if (!schema) return errors;

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${path}: Value ${JSON.stringify(value)} does not match const ${JSON.stringify(schema.const)}.`);
    return errors;
  }

  if (schema.type) {
    const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    let matched = false;
    for (const t of allowedTypes) {
      if (t === 'string' && typeof value === 'string') matched = true;
      if (t === 'number' && typeof value === 'number' && !isNaN(value)) matched = true;
      if (t === 'integer' && typeof value === 'number' && Number.isInteger(value)) matched = true;
      if (t === 'boolean' && typeof value === 'boolean') matched = true;
      if (t === 'array' && Array.isArray(value)) matched = true;
      if (t === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) matched = true;
      if (t === 'null' && value === null) matched = true;
    }
    if (!matched) {
      errors.push(`${path}: Expected type ${JSON.stringify(schema.type)} but got ${value === null ? 'null' : typeof value}.`);
      return errors;
    }
  }

  if (value === null || value === undefined) return errors;

  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: String '${value}' does not match pattern ${schema.pattern}.`);
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: String length ${value.length} is less than minLength ${schema.minLength}.`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${path}: Value '${value}' is not an allowed enum value (${schema.enum.join(', ')}).`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path}: Value ${value} is less than minimum ${schema.minimum}.`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: Array length ${value.length} is less than minItems ${schema.minItems}.`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${path}: Array length ${value.length} is greater than maxItems ${schema.maxItems}.`);
    }
    if (schema.items) {
      value.forEach((item, idx) => {
        errors.push(...validateJsonSchemaFallback(item, schema.items, `${path}[${idx}]`));
      });
    }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    if (schema.required) {
      for (const req of schema.required) {
        if (!(req in value) || value[req] === undefined) {
          errors.push(`${path}: Missing required property '${req}'.`);
        }
      }
    }
    if (schema.properties) {
      for (const [prop, propVal] of Object.entries(value)) {
        if (schema.properties[prop]) {
          errors.push(...validateJsonSchemaFallback(propVal, schema.properties[prop], `${path}.${prop}`));
        } else if (schema.additionalProperties === false) {
          errors.push(`${path}: Disallowed additional property '${prop}'.`);
        }
      }
    }
    if (schema.allOf) {
      for (const sub of schema.allOf) {
        if (sub.if && sub.then) {
          const ifErrors = validateJsonSchemaFallback(value, sub.if, `${path}(if)`);
          if (ifErrors.length === 0) {
            const thenErrors = validateJsonSchemaFallback(value, sub.then, path);
            errors.push(...thenErrors);
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Validates cross-file referential integrity and verification-state consistency across all seven datasets.
 */
function validateDataLayer(dataMap) {
  const errors = [];
  const { verticals, sources, services, pricing, eligibility, variations, claims } = dataMap;

  const verticalSet = new Set(verticals.map(v => v.vertical_id));
  const sourceSet = new Set(sources.map(s => s.source_id));
  const serviceMap = new Map();
  const routeSet = new Set();
  const pricingIds = new Set();
  const eligibilityIds = new Set();
  const variationIds = new Set();
  const claimIds = new Set();

  // 0. Dataset primary key uniqueness checks
  const verticalIds = new Set();
  verticals.forEach((v, idx) => {
    if (verticalIds.has(v.vertical_id)) {
      errors.push(`verticals[${idx}]: Duplicate vertical_id '${v.vertical_id}'.`);
    }
    verticalIds.add(v.vertical_id);
  });

  const sourceIds = new Set();
  sources.forEach((s, idx) => {
    if (sourceIds.has(s.source_id)) {
      errors.push(`sources[${idx}]: Duplicate source_id '${s.source_id}'.`);
    }
    sourceIds.add(s.source_id);
  });

  // 1. Service registry checks
  services.forEach((s, idx) => {
    if (routeSet.has(s.canonical_route)) {
      errors.push(`services[${idx}]: Duplicate canonical route '${s.canonical_route}'.`);
    }
    routeSet.add(s.canonical_route);

    if (s.record_status === 'ACTIVE_SERVICE') {
      if (!s.service_id) {
        errors.push(`services[${idx}]: Active service route '${s.canonical_route}' is missing an active service ID.`);
      } else {
        if (serviceMap.has(s.service_id)) {
          errors.push(`services[${idx}]: Duplicate active service ID '${s.service_id}'.`);
        }
        serviceMap.set(s.service_id, s);
      }
      if (!s.primary_vertical_id || !verticalSet.has(s.primary_vertical_id)) {
        errors.push(`services[${idx}]: Active service '${s.service_id || s.canonical_route}' has unknown primary vertical '${s.primary_vertical_id}'.`);
      }
    } else if (s.record_status === 'REFERRAL_ONLY') {
      if (s.service_id !== null) {
        errors.push(`services[${idx}]: Referral route '${s.canonical_route}' must not have service ID, but found '${s.service_id}'.`);
      }
      if (s.primary_vertical_id !== null) {
        errors.push(`services[${idx}]: Referral route '${s.canonical_route}' must not have primary vertical, but found '${s.primary_vertical_id}'.`);
      }
    } else if (s.record_status === 'UTILITY_ROUTE') {
      if (s.service_id !== null || s.primary_vertical_id !== null) {
        errors.push(`services[${idx}]: Utility route '${s.canonical_route}' must not have a service ID or primary vertical.`);
      }
    } else {
      errors.push(`services[${idx}]: Unknown record status '${s.record_status}'.`);
    }
  });

  // Invariants
  const serviceRoutes = services.filter(s => s.record_status === 'ACTIVE_SERVICE' || s.record_status === 'REFERRAL_ONLY');
  const utilityRoutes = services.filter(s => s.record_status === 'UTILITY_ROUTE');
  if (serviceRoutes.length !== 57 || utilityRoutes.length !== 1 || utilityRoutes[0]?.canonical_route !== '/search/') {
    errors.push(`Service registry route mismatch: Expected 57 service routes and registered /search/ utility route, found ${serviceRoutes.length} services and ${utilityRoutes.length} utility routes.`);
  }
  if (serviceMap.size !== 54) {
    errors.push(`Active service ID count mismatch: Expected 54, found ${serviceMap.size}.`);
  }

  // Referral routes set to prevent commercial contamination
  const referralRoutes = new Set(services.filter(s => s.record_status === 'REFERRAL_ONLY').map(s => s.canonical_route));

  // 2. Pricing checks
  const validPricingStatuses = new Set(['UNVERIFIED', 'VERIFIED']);
  pricing.forEach((p, idx) => {
    if (pricingIds.has(p.pricing_id)) {
      errors.push(`pricing[${idx}]: Duplicate pricing_id '${p.pricing_id}'.`);
    }
    pricingIds.add(p.pricing_id);

    if (!validPricingStatuses.has(p.verification_status)) {
      errors.push(`pricing[${idx}]: Invalid verification_status '${p.verification_status}' for '${p.pricing_id}'.`);
    }

    if (!serviceMap.has(p.service_id)) {
      errors.push(`pricing[${idx}]: Refers to unknown active service ID '${p.service_id}'.`);
    }
    if (p.canonical_route && referralRoutes.has(p.canonical_route)) {
      errors.push(`pricing[${idx}]: Referral route '${p.canonical_route}' must not have a commercial pricing record.`);
    }
    if (p.source_id && !sourceSet.has(p.source_id)) {
      errors.push(`pricing[${idx}]: Refers to unknown source ID '${p.source_id}'.`);
    }
    // Threshold and penalty checks to prevent conflation with service prices
    if (p.service_id === 'V03-SVC-003' && p.amount === 50000000) {
      errors.push(`pricing[${idx}]: Statutory turnover threshold (₹5 Crores) cannot be recorded as service price amount.`);
    }
    if (p.service_id === 'V02-SVC-017' && p.amount === 1000000) {
      errors.push(`pricing[${idx}]: Commercial authorized capital package cap (₹10 Lakhs) cannot be recorded as service price amount.`);
    }
    if (p.service_id === 'V02-SVC-002' && p.amount === 5000) {
      errors.push(`pricing[${idx}]: Statutory late filing penalty (₹5,000) cannot be recorded as service price amount.`);
    }
    if (p.commercial_approval_state === 'COMMERCIALLY_APPROVED' && p.verification_status === 'UNVERIFIED') {
      errors.push(`pricing[${idx}]: Price '${p.pricing_id}' cannot be marked COMMERCIALLY_APPROVED while remaining UNVERIFIED without approved resolution.`);
    }
    if (p.verification_status === 'VERIFIED') {
      if (!p.source_id || !p.amount || !p.last_verified_at || p.commercial_approval_state !== 'COMMERCIALLY_APPROVED') {
        errors.push(`pricing[${idx}]: Verified price '${p.pricing_id}' missing required source/amount/timestamp evidence.`);
      }
    } else {
      if (p.last_verified_at !== null) {
        errors.push(`pricing[${idx}]: Unverified price '${p.pricing_id}' cannot carry verification timestamp '${p.last_verified_at}'.`);
      }
    }
    if (p.effective_from && p.effective_to && p.effective_to < p.effective_from) {
      errors.push(`pricing[${idx}]: Reversed validity period (${p.effective_from} to ${p.effective_to}) for '${p.pricing_id}'.`);
    }
  });

  // Ensure every active service in service registry has a pricing record
  serviceMap.forEach((svc, svcId) => {
    if (!pricing.some(p => p.service_id === svcId)) {
      errors.push(`pricing: Missing pricing record for active service '${svcId}'.`);
    }
  });


  // 3. Eligibility checks
  const validEligibilityStatuses = new Set(['UNREVIEWED', 'SOURCE_IDENTIFIED', 'PENDING_PROFESSIONAL_REVIEW', 'VERIFIED']);
  eligibility.forEach((e, idx) => {
    if (eligibilityIds.has(e.eligibility_id)) {
      errors.push(`eligibility[${idx}]: Duplicate eligibility_id '${e.eligibility_id}'.`);
    }
    eligibilityIds.add(e.eligibility_id);

    if (!validEligibilityStatuses.has(e.verification_status)) {
      errors.push(`eligibility[${idx}]: Invalid verification_status '${e.verification_status}' for '${e.eligibility_id}'.`);
    }

    if (!serviceMap.has(e.service_id)) {
      errors.push(`eligibility[${idx}]: Refers to unknown active service ID '${e.service_id}'.`);
    } else if (e.primary_vertical_id) {
      const expectedVertical = serviceMap.get(e.service_id).primary_vertical_id;
      if (e.primary_vertical_id !== expectedVertical) {
        errors.push(`eligibility[${idx}]: Primary vertical '${e.primary_vertical_id}' does not match service registry vertical '${expectedVertical}' for '${e.service_id}'.`);
      }
    }
    if (e.source_id && !sourceSet.has(e.source_id)) {
      errors.push(`eligibility[${idx}]: Refers to unknown source ID '${e.source_id}'.`);
    }
    if (e.effective_from && e.effective_to && e.effective_to < e.effective_from) {
      errors.push(`eligibility[${idx}]: Reversed validity period (${e.effective_from} to ${e.effective_to}) for '${e.eligibility_id}'.`);
    }
    if (e.verification_status === 'VERIFIED') {
      if (!e.source_id || !e.last_verified_at) {
        errors.push(`eligibility[${idx}]: Verified eligibility record '${e.eligibility_id}' missing required source ID or verification timestamp.`);
      }
    } else {
      if (e.last_verified_at !== null) {
        errors.push(`eligibility[${idx}]: Unverified eligibility record '${e.eligibility_id}' cannot carry verification timestamp '${e.last_verified_at}'.`);
      }
    }
  });

  // Ensure every active service in service registry has an eligibility record
  serviceMap.forEach((svc, svcId) => {
    if (!eligibility.some(e => e.service_id === svcId)) {
      errors.push(`eligibility: Missing eligibility record for active service '${svcId}'.`);
    }
  });

  // 4. Jurisdiction variations checks
  const validVariationStatuses = new Set(['UNREVIEWED', 'SOURCE_IDENTIFIED', 'PENDING_PROFESSIONAL_REVIEW', 'VERIFIED']);
  variations.forEach((v, idx) => {
    if (variationIds.has(v.variation_id)) {
      errors.push(`variations[${idx}]: Duplicate variation_id '${v.variation_id}'.`);
    }
    variationIds.add(v.variation_id);

    if (!validVariationStatuses.has(v.verification_status)) {
      errors.push(`variations[${idx}]: Invalid verification_status '${v.verification_status}' for '${v.variation_id}'.`);
    }

    if (!serviceMap.has(v.service_id)) {
      errors.push(`variations[${idx}]: Refers to unknown active service ID '${v.service_id}'.`);
    }
    if (v.source_id && !sourceSet.has(v.source_id)) {
      errors.push(`variations[${idx}]: Refers to unknown source ID '${v.source_id}'.`);
    }
    if (v.effective_from && v.effective_to && v.effective_to < v.effective_from) {
      errors.push(`variations[${idx}]: Reversed validity period for '${v.variation_id}'.`);
    }
    if (v.verification_status === 'VERIFIED') {
      if (!v.source_id || !v.last_verified_at) {
        errors.push(`variations[${idx}]: Verified jurisdiction variation '${v.variation_id}' missing required source ID or verification timestamp.`);
      }
    } else {
      if (v.last_verified_at !== null) {
        errors.push(`variations[${idx}]: Unverified jurisdiction variation '${v.variation_id}' cannot carry verification timestamp '${v.last_verified_at}'.`);
      }
    }
  });

  // 5. Regulatory claims checks
  const validClaimStatuses = new Set(['UNREVIEWED', 'SOURCE_NEEDED', 'SOURCE_IDENTIFIED', 'PENDING_PROFESSIONAL_REVIEW', 'VERIFIED', 'REJECTED_OR_OUTDATED']);
  claims.forEach((c, idx) => {
    if (claimIds.has(c.claim_id)) {
      errors.push(`claims[${idx}]: Duplicate claim_id '${c.claim_id}'.`);
    }
    claimIds.add(c.claim_id);

    if (!validClaimStatuses.has(c.verification_status)) {
      errors.push(`claims[${idx}]: Invalid verification_status '${c.verification_status}' for '${c.claim_id}'.`);
    }

    if (c.service_id && !serviceMap.has(c.service_id)) {
      errors.push(`claims[${idx}]: Refers to unknown active service ID '${c.service_id}'.`);
    }
    if (c.vertical_id && !verticalSet.has(c.vertical_id)) {
      errors.push(`claims[${idx}]: Refers to unknown vertical ID '${c.vertical_id}'.`);
    }
    if (c.source_id && !sourceSet.has(c.source_id)) {
      errors.push(`claims[${idx}]: Refers to unknown source ID '${c.source_id}'.`);
    }
    if (c.effective_from && c.effective_to && c.effective_to < c.effective_from) {
      errors.push(`claims[${idx}]: Reversed validity period (${c.effective_from} to ${c.effective_to}) for '${c.claim_id}'.`);
    }
    if (c.checked_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(c.checked_date)) {
      errors.push(`claims[${idx}]: Invalid checked_date format '${c.checked_date}' for '${c.claim_id}'.`);
    }
    if (c.verification_status === 'VERIFIED') {
      if (!c.source_id) {
        errors.push(`claims[${idx}]: Verified claim '${c.claim_id}' missing required source ID.`);
      }
      if (!c.last_verified_at) {
        errors.push(`claims[${idx}]: Verified claim '${c.claim_id}' missing required verification timestamp.`);
      }
      if (c.professional_review_outcome !== 'APPROVED') {
        errors.push(`claims[${idx}]: Verified claim '${c.claim_id}' has non-approved review outcome '${c.professional_review_outcome}'.`);
      }
    } else {
      if (c.last_verified_at !== null) {
        errors.push(`claims[${idx}]: Unverified claim '${c.claim_id}' cannot carry verification timestamp '${c.last_verified_at}'.`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Authoritative production status-gating function.
 * Evaluates whether any record from the data layer is approved for client-facing
 * publication or legal/commercial quotation.
 * 
 * Rules:
 * A record CANNOT be presented as approved legal advice, verified requirements,
 * or confirmed commercial pricing unless:
 * 1. verification_status === 'VERIFIED'
 * 2. last_verified_at is a valid non-null date string (YYYY-MM-DD)
 * 3. source_id is non-null string
 * 4. If pricing: commercial_approval_state === 'COMMERCIALLY_APPROVED' and amount is positive number
 * 5. If regulatory claim: professional_review_outcome === 'APPROVED' and disposition !== 'CORRECTED' and disposition !== 'FALSE_POSITIVE' and disposition !== 'NEEDS_EXTERNAL_VERIFICATION'
 * 
 * Records with statuses:
 * 'UNVERIFIED', 'UNREVIEWED', 'SOURCE_IDENTIFIED', 'PENDING_PROFESSIONAL_REVIEW', 'PENDING_REVIEW', 'SOURCE_NEEDED', 'REJECTED_OR_OUTDATED', 'REJECTED'
 * MUST NEVER be presented as approved.
 */
function isApprovedForClientFacing(record) {
  if (!record || typeof record !== 'object') return false;
  if (record.verification_status !== 'VERIFIED') return false;
  if (!record.last_verified_at || typeof record.last_verified_at !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.last_verified_at)) return false;
  if (!record.source_id || typeof record.source_id !== 'string') return false;

  // Pricing-specific commercial approval checks
  if (record.pricing_id) {
    if (record.commercial_approval_state !== 'COMMERCIALLY_APPROVED') return false;
    if (record.amount === null || typeof record.amount !== 'number' || record.amount <= 0) return false;
  }

  // Regulatory claim professional review checks
  if (record.claim_id) {
    if (record.professional_review_outcome !== 'APPROVED') return false;
    if (record.disposition === 'CORRECTED' || record.disposition === 'FALSE_POSITIVE' || record.disposition === 'NEEDS_EXTERNAL_VERIFICATION') return false;
  }

  return true;
}

// ----------------------------------------------------
// RUN TEST SUITE
// ----------------------------------------------------
function runTestSuite() {
  let passCount = 0;
  let failCount = 0;

  function assertTest(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? '— ' + details : ''}`);
      failCount++;
    }
  }

  console.log('\n==================================================');
  console.log('CRAFTEGON CCS — PHASE 2 REGISTRY VALIDATOR SUITE');
  console.log('==================================================\n');

  // --- POSITIVE TESTS ---
  console.log('--- Test Suite 1: Positive Validation of Phase 2 Review Registry ---');
  assertTest(fs.existsSync(PHASE_2_CSV_PATH), 'Phase 2 review CSV exists at review-output/phase-2-service-registry/phase-2-service-ownership-review.csv');
  
  const phase2Csv = fs.readFileSync(PHASE_2_CSV_PATH, 'utf8');
  const res = validateRegistry(phase2Csv);

  assertTest(res.valid, 'Phase 2 review registry passes 100% of strict validation rules', res.errors.join('; '));
  assertTest(res.metrics.totalRoutes === 57, `Accounts for exactly 57 routes (found ${res.metrics.totalRoutes})`);
  assertTest(res.metrics.activeIdCount === 54, `Contains exactly 54 active service IDs (found ${res.metrics.activeIdCount})`);
  assertTest(res.metrics.referralRouteCount === 3, `Contains exactly 3 referral-only routes without service IDs (found ${res.metrics.referralRouteCount})`);
  assertTest(res.metrics.uniqueActiveIds === 54, `All 54 active service IDs are completely unique`);
  assertTest(!phase2Csv.includes('(provisional)'), 'No obsolete (provisional) annotations exist in Phase 2 CSV');
  assertTest(!phase2Csv.toLowerCase().includes('provisional'), 'Zero provisional substrings exist in Phase 2 CSV');

  // Check reconciliation against Phase 1
  console.log('\n--- Test Suite 2: Reconciliation Against Authoritative Phase 1 Baseline ---');
  const phase1Csv = fs.readFileSync(PHASE_1_CSV_PATH, 'utf8');
  const p1Rows = parseCSV(phase1Csv).slice(1);
  const p2Rows = parseCSV(phase2Csv).slice(1);

  assertTest(p1Rows.length === 57 && p2Rows.length === 57, 'Both Phase 1 and Phase 2 registers contain exactly 57 rows');

  let reconciliationDiscrepancies = 0;
  p1Rows.forEach((r1, i) => {
    const r2 = p2Rows[i];
    const id1 = r1[0].trim();
    const id2 = r2[0].trim();
    const route1 = r1[2].trim();
    const route2 = r2[2].trim();
    const v1 = r1[4].trim();
    const v2 = r2[4].trim();

    if (id1 !== id2 || route1 !== route2 || (v1 !== v2 && !(v1 === '' && v2 === 'NONE'))) {
      reconciliationDiscrepancies++;
    }
  });

  assertTest(reconciliationDiscrepancies === 0, `0 route/ID/vertical discrepancies between Phase 1 and Phase 2 registers`);

  // Check disk services
  console.log('\n--- Test Suite 3: Service Pages Disk Alignment ---');
  const diskFiles = fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  assertTest(diskFiles.length === 57, `Disk services/ directory contains exactly 57 canonical service HTML pages (found ${diskFiles.length})`);

  let diskMismatches = 0;
  p2Rows.forEach(r => {
    const sId = r[0].trim();
    const route = r[2].trim();
    const fileName = route.replace('/services/', '');
    const filePath = path.join(SERVICES_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      diskMismatches++;
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    if (sId) {
      if (!html.includes(`Service ID: ${sId}`) && !html.includes(`Service ID:</span> ${sId}`)) {
        diskMismatches++;
      }
    } else {
      if (html.includes('Service ID:')) {
        diskMismatches++;
      }
    }
  });
  assertTest(diskMismatches === 0, `All 57 service pages on disk strictly reflect the registry IDs and referral boundaries`);

  // --- NEGATIVE TESTS (In-Memory Fixtures) ---
  console.log('\n--- Test Suite 4: Negative Tests on Deliberately Corrupted Fixtures ---');

  // Negative 1: Missing route
  const missingRouteCsv = phase2Csv.split('\n').filter((_, idx) => idx !== 2).join('\n');
  const neg1 = validateRegistry(missingRouteCsv);
  assertTest(!neg1.valid && neg1.errors.some(e => e.includes('Missing expected routes')), 'Fails when an expected route is missing');

  // Negative 2: Unexpected route
  const unexpectedRouteCsv = phase2Csv + '\n"V99-SVC-999","CONFIRMED_APPROVED_SERVICE","/services/unexpected-service.html","Unexpected Service","V01","Business Formation","None","","","APPROVED_LOCKED","NONE","evidence"';
  const neg2 = validateRegistry(unexpectedRouteCsv);
  assertTest(!neg2.valid && neg2.errors.some(e => e.includes('Unexpected routes detected')), 'Fails when an unexpected route is added');

  // Negative 3: Route inventory mismatch (corrupted route path)
  const corruptPathCsv = phase2Csv.replace('/services/dpiit-startup-india.html', '/services/corrupted-route.html');
  const neg3 = validateRegistry(corruptPathCsv);
  assertTest(!neg3.valid && neg3.errors.some(e => e.includes('Missing expected routes') || e.includes('Unexpected routes')), 'Fails when route inventory path is corrupted');

  // Negative 4: Duplicate active service ID
  const dupIdCsv = phase2Csv.replace('V01-SVC-002', 'V01-SVC-001');
  const neg4 = validateRegistry(dupIdCsv);
  assertTest(!neg4.valid && neg4.errors.some(e => e.includes('Duplicate active service ID')), 'Fails when duplicate active service ID is present');

  // Negative 5: Duplicate canonical route
  const dupRouteCsv = phase2Csv.replace('/services/llp-registration.html', '/services/dpiit-startup-india.html');
  const neg5 = validateRegistry(dupRouteCsv);
  assertTest(!neg5.valid && neg5.errors.some(e => e.includes('Duplicate canonical route')), 'Fails when duplicate canonical route is present');

  // Negative 6: Missing active service ID (empty ID on active service)
  const missingIdCsv = phase2Csv.replace('"V01-SVC-001","CONFIRMED_APPROVED_SERVICE"', '"","CONFIRMED_APPROVED_SERVICE"');
  const neg6 = validateRegistry(missingIdCsv);
  assertTest(!neg6.valid && neg6.errors.some(e => e.includes('missing an active service ID')), 'Fails when active service has empty service ID');

  // Negative 7: Service ID assigned to referral-only route
  const referralWithIdCsv = phase2Csv.replace('"","CONFIRMED_REFERRAL_ONLY","/services/nclt-insolvency-defense.html"', '"V10-SVC-001","CONFIRMED_REFERRAL_ONLY","/services/nclt-insolvency-defense.html"');
  const neg7 = validateRegistry(referralWithIdCsv);
  assertTest(!neg7.valid && neg7.errors.some(e => e.includes('must not have an active service ID')), 'Fails when service ID is assigned to referral-only route');

  // Negative 8: Invalid or unknown primary vertical (e.g. V99)
  const invalidVerticalCsv = phase2Csv.replace('"V01","Business Formation & Structuring"', '"V99","Unknown Vertical"');
  const neg8 = validateRegistry(invalidVerticalCsv);
  assertTest(!neg8.valid && neg8.errors.some(e => e.includes('invalid or unknown primary vertical')), 'Fails when invalid or unknown primary vertical is specified');

  // Negative 9: Primary vertical mismatch against baseline
  const mismatchedVerticalCsv = phase2Csv.replace('"V01-SVC-001","CONFIRMED_APPROVED_SERVICE","/services/dpiit-startup-india.html","DPIIT Startup India Recognition & Section 56(2)(viib) Exemption","V01"', '"V01-SVC-001","CONFIRMED_APPROVED_SERVICE","/services/dpiit-startup-india.html","DPIIT Startup India Recognition & Section 56(2)(viib) Exemption","V02"');
  const neg9Rows = parseCSV(mismatchedVerticalCsv).slice(1);
  let neg9Discrepancy = false;
  neg9Rows.forEach((r, idx) => {
    if (r[4] !== p1Rows[idx][4] && !(r[4] === 'NONE' && p1Rows[idx][4] === '')) {
      neg9Discrepancy = true;
    }
  });
  assertTest(neg9Discrepancy, 'Detects primary vertical mismatch against authoritative baseline');

  // Negative 10: Unresolved conflict marked as approved
  const conflictCsv = phase2Csv.replace('"APPROVED_LOCKED","NONE"', '"APPROVED_LOCKED","CONFLICT: Unresolved source discrepancy"');
  const neg10 = validateRegistry(conflictCsv);
  assertTest(!neg10.valid && neg10.errors.some(e => e.includes('Unresolved authoritative conflict')), 'Fails when unresolved conflict is marked as approved');

  // Negative 11: Obsolete (provisional) annotation remaining in service ID
  const provisionalIdCsv = phase2Csv.replace('V09-SVC-003', 'V09-SVC-003 (provisional)');
  const neg11 = validateRegistry(provisionalIdCsv);
  assertTest(!neg11.valid && neg11.errors.some(e => e.includes('Obsolete (provisional) annotation remaining')), 'Fails when obsolete (provisional) annotation is present in service ID');

  // Negative 12: Malformed or non-standard service ID format
  const malformedIdCsv = phase2Csv.replace('V01-SVC-001', 'V01-INVALID-001');
  const neg12 = validateRegistry(malformedIdCsv);
  assertTest(!neg12.valid && neg12.errors.some(e => e.includes('does not match standard approved pattern')), 'Fails when service ID format is malformed or non-standard');

  // ====================================================
  // PHASE 2 TASK 2: DATA LAYER VALIDATION & TEST SUITES
  // ====================================================

  console.log('\n--- Test Suite 5: Structural JSON Schema Validation (All Seven Datasets) ---');
  const datasetNames = [
    'verticals',
    'sources',
    'service-registry',
    'pricing',
    'eligibility',
    'jurisdiction-variations',
    'regulatory-claims'
  ];

  const loadedData = {};
  datasetNames.forEach(dName => {
    const dataPath = path.join(DATA_DIR, `${dName}.json`);
    const schemaPath = path.join(SCHEMAS_DIR, `${dName}.schema.json`);
    const dataContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    loadedData[dName] = dataContent;

    const schemaErrors = validateJsonSchema(dataContent, schemaContent, dName);
    assertTest(schemaErrors.length === 0, `${dName}.json conforms strictly to ${dName}.schema.json (0 errors)`, schemaErrors.join('; '));
  });

  console.log('\n--- Test Suite 6: Cross-File Referential Integrity & Verification State Consistency ---');
  const dataLayerMap = {
    verticals: loadedData['verticals'],
    sources: loadedData['sources'],
    services: loadedData['service-registry'],
    pricing: loadedData['pricing'],
    eligibility: loadedData['eligibility'],
    variations: loadedData['jurisdiction-variations'],
    claims: loadedData['regulatory-claims']
  };

  const dlResult = validateDataLayer(dataLayerMap);
  assertTest(dlResult.valid, 'Data layer satisfies 100% of referential integrity and verification state rules', dlResult.errors.join('; '));

  assertTest(
    dataLayerMap.services.filter(s => s.record_status !== 'UTILITY_ROUTE').length === 57 && dataLayerMap.services.filter(s => s.record_status === 'ACTIVE_SERVICE').length === 54 && dataLayerMap.services.filter(s => s.record_status === 'REFERRAL_ONLY').length === 3 && dataLayerMap.services.some(s => s.record_status === 'UTILITY_ROUTE' && s.canonical_route === '/search/'),
    'Service registry preserves 57 services (54 active, 3 referral-only) and registers /search/ as a utility route'
  );

  assertTest(
    dataLayerMap.pricing.length === 54 && dataLayerMap.pricing.every(p => /^V\d{2}-SVC-\d{3}$/.test(p.service_id) && p.verification_status === 'UNVERIFIED' && p.last_verified_at === null),
    'Pricing dataset accounts for all 54 active services without orphaned references (100% UNVERIFIED baseline)'
  );

  assertTest(
    dataLayerMap.pricing.length === 54 &&
    dataLayerMap.pricing.filter(p => p.additional_tiers && p.additional_tiers.length > 0).length === 3 &&
    dataLayerMap.pricing.filter(p => p.amount === null).length === 1 &&
    dataLayerMap.pricing.filter(p => p.amount !== null).length === 53,
    'Pricing inventory reconciles 54 active services (50 single-tier, 3 dual-tier yielding 56 website prices, 1 custom quote gap)'
  );

  assertTest(
    dataLayerMap.pricing.some(p => p.service_id === 'V03-SVC-003' && p.statutory_thresholds && p.statutory_thresholds.length > 0) &&
    dataLayerMap.pricing.some(p => p.service_id === 'V02-SVC-017' && p.commercial_package_caps && p.commercial_package_caps.length > 0 && p.statutory_thresholds.length === 0) &&
    dataLayerMap.pricing.some(p => p.service_id === 'V02-SVC-002' && p.statutory_penalties && p.statutory_penalties.length > 0) &&
    dataLayerMap.pricing.every(p => p.amount !== 50000000 && p.amount !== 1000000),
    'Statutory thresholds (₹5 Crores turnover), commercial package caps (₹10 Lakhs capital), and statutory penalties (₹5,000) are cleanly separated from service prices'
  );

  const allInclusiveCards = dataLayerMap.pricing.filter(p => p.website_displayed_price && p.website_displayed_price.includes('All Inclusive'));
  assertTest(
    allInclusiveCards.length === 18 &&
    allInclusiveCards.every(p => p.tax_inclusion_status === 'UNCONFIRMED' && !p.excluded_charges.some(e => e.includes('18%'))),
    'All 18 cards labelled "All Inclusive" preserve exact website wording with tax inclusion marked UNCONFIRMED and zero assumed GST rates'
  );


  assertTest(
    dataLayerMap.eligibility.length === 54 &&
    dataLayerMap.eligibility.every(e => /^V\d{2}-SVC-\d{3}$/.test(e.service_id) && e.source_id !== null && e.last_verified_at === null && e.verification_status !== 'VERIFIED') &&
    dataLayerMap.eligibility.every(e => e.primary_vertical_id && e.statutory_provision && e.operational_recommendations.length > 0) &&
    dataLayerMap.eligibility.filter(e => e.verification_status === 'SOURCE_IDENTIFIED').length === 49 &&
    dataLayerMap.eligibility.filter(e => e.verification_status === 'PENDING_PROFESSIONAL_REVIEW').length === 5,
    'Eligibility dataset accounts for all 54 active services (49 source-identified, 5 pending review, 0 verified) with distinct operational recommendations'
  );

  assertTest(
    dataLayerMap.services.filter(s => s.record_status === 'ACTIVE_SERVICE').every(svc => dataLayerMap.eligibility.some(e => e.service_id === svc.service_id)),
    'Eligibility dataset accounts for 100% of active service IDs (54/54 services covered, 0 missing)'
  );

  assertTest(
    dataLayerMap.variations.length === 10 &&
    dataLayerMap.variations.every(v => /^IN-[A-Z]{2}$/.test(v.jurisdiction_id) && v.verification_status !== 'VERIFIED' && v.last_verified_at === null) &&
    dataLayerMap.variations.filter(v => v.verification_status === 'SOURCE_IDENTIFIED').length === 8 &&
    dataLayerMap.variations.filter(v => v.verification_status === 'UNREVIEWED').length === 1 &&
    dataLayerMap.variations.filter(v => v.verification_status === 'PENDING_PROFESSIONAL_REVIEW').length === 1 &&
    dataLayerMap.variations.some(v => v.variation_id === 'VAR-010' && v.verification_status === 'PENDING_PROFESSIONAL_REVIEW' && v.source_id === null) &&
    dataLayerMap.variations.some(v => v.variation_id === 'VAR-004' && v.verification_status === 'UNREVIEWED' && v.source_id === null),
    'Jurisdiction variations define genuine state/UT statutory differences with evidence gating (8 source-identified, 1 unreviewed, 1 pending review, 0 marked VERIFIED)'
  );

  assertTest(
    dataLayerMap.claims.length === 35 &&
    dataLayerMap.claims.every(c => c.verification_status !== 'VERIFIED' && c.last_verified_at === null) &&
    dataLayerMap.claims.filter(c => c.verification_status === 'REJECTED_OR_OUTDATED').length === 20 &&
    dataLayerMap.claims.filter(c => c.verification_status === 'PENDING_PROFESSIONAL_REVIEW').length === 13 &&
    dataLayerMap.claims.filter(c => c.verification_status === 'SOURCE_IDENTIFIED').length === 1 &&
    dataLayerMap.claims.filter(c => c.verification_status === 'SOURCE_NEEDED').length === 1 &&
    dataLayerMap.claims.some(c => c.claim_id === 'CLM-026' && c.source_id === 'SRC-CERTIN-001' && c.verification_status === 'PENDING_PROFESSIONAL_REVIEW') &&
    dataLayerMap.claims.some(c => c.claim_id === 'CLM-027' && c.source_id === 'SRC-DPDP-001' && c.verification_status === 'PENDING_PROFESSIONAL_REVIEW'),
    'Regulatory claims preserve evidence gating: 35 claims accounted for (20 rejected, 13 pending review, 1 source identified, 1 source needed, 0 verified)'
  );

  assertTest(
    dataLayerMap.claims.filter(c => c.verification_status === 'REJECTED_OR_OUTDATED').length === 20 &&
    dataLayerMap.claims.filter(c => c.verification_status === 'REJECTED_OR_OUTDATED').every(c => c.professional_review_outcome === 'REJECTED' && ['CORRECTED', 'FALSE_POSITIVE'].includes(c.disposition) && !isApprovedForClientFacing(c)),
    'All 20 rejected claims record explicit rejection outcome and disposition, with zero treated as approved or fallback'
  );

  assertTest(
    dataLayerMap.claims.filter(c => c.checked_date !== null).length === 13 &&
    dataLayerMap.claims.filter(c => c.checked_date === null).length === 22 &&
    dataLayerMap.claims.filter(c => c.checked_date !== null).every(c => [
      'CLM-013', 'CLM-014', 'CLM-015',
      'CLM-026', 'CLM-027', 'CLM-028', 'CLM-029', 'CLM-030',
      'CLM-031', 'CLM-032', 'CLM-033', 'CLM-034', 'CLM-035'
    ].includes(c.claim_id)),
    'Source-check dates strictly audited: exactly 13 statutory claims have confirmed source-check dates while 22 internal/rejected claims retain null'
  );

  const mockVerifiedRecord = {
    verification_status: 'VERIFIED',
    last_verified_at: '2026-10-17',
    source_id: 'SRC-TEST-001',
    professional_review_outcome: 'APPROVED',
    disposition: 'ACCEPTABLE_WITH_EVIDENCE'
  };
  const allDataRecordsBlocked = [
    dataLayerMap.pricing,
    dataLayerMap.eligibility,
    dataLayerMap.variations,
    dataLayerMap.claims
  ].every(list => list.every(r => isApprovedForClientFacing(r) === false));

  assertTest(
    isApprovedForClientFacing(mockVerifiedRecord) === true && allDataRecordsBlocked,
    'Production status gating blocks 100% of unverified, unreviewed, pending, source-needed, and rejected records from client-facing use'
  );

  console.log('\n--- Test Suite 7: Negative Fixture Tests on Corrupted Data Layer ---');

  // Neg D1: Dangling vertical ID in service registry
  const corruptedServicesD1 = JSON.parse(JSON.stringify(dataLayerMap.services));
  corruptedServicesD1.find(s => s.record_status === 'ACTIVE_SERVICE').primary_vertical_id = 'V99';
  const negD1 = validateDataLayer({ ...dataLayerMap, services: corruptedServicesD1 });
  assertTest(!negD1.valid && negD1.errors.some(e => e.includes('unknown primary vertical')), 'Fails when service registry references unknown / dangling vertical ID (V99)');

  // Neg D2: Dangling service ID in pricing
  const corruptedPricingD2 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD2[0].service_id = 'V99-SVC-999';
  const negD2 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD2 });
  assertTest(!negD2.valid && negD2.errors.some(e => e.includes('unknown active service ID')), 'Fails when pricing references unknown / dangling service ID');

  // Neg D3: Dangling service ID in eligibility
  const corruptedEligibilityD3 = JSON.parse(JSON.stringify(dataLayerMap.eligibility));
  corruptedEligibilityD3[0].service_id = 'V99-SVC-999';
  const negD3 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD3 });
  assertTest(!negD3.valid && negD3.errors.some(e => e.includes('unknown active service ID')), 'Fails when eligibility references unknown / dangling service ID');

  // Neg D4: Dangling service ID in jurisdiction variations
  const corruptedVariationsD4 = JSON.parse(JSON.stringify(dataLayerMap.variations));
  corruptedVariationsD4[0].service_id = 'V99-SVC-999';
  const negD4 = validateDataLayer({ ...dataLayerMap, variations: corruptedVariationsD4 });
  assertTest(!negD4.valid && negD4.errors.some(e => e.includes('unknown active service ID')), 'Fails when jurisdiction variations reference unknown / dangling service ID');

  // Neg D5: Dangling source ID in pricing
  const corruptedPricingD5 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD5[0].source_id = 'SRC-FAKE-999';
  const negD5 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD5 });
  assertTest(!negD5.valid && negD5.errors.some(e => e.includes('unknown source ID')), 'Fails when pricing cites an unknown / dangling source ID (SRC-FAKE-999)');

  // Neg D6: Unevidenced verified price (missing source / timestamp)
  const corruptedPricingD6 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD6[0].verification_status = 'VERIFIED';
  corruptedPricingD6[0].source_id = null;
  corruptedPricingD6[0].last_verified_at = null;
  const negD6 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD6 });
  assertTest(!negD6.valid && negD6.errors.some(e => e.includes('missing required source/amount/timestamp evidence')), 'Fails when unverified price is marked VERIFIED without required evidence metadata');

  // Neg D7: Verified legal claim bypassing professional review
  const corruptedClaimsD7 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD7[0].verification_status = 'VERIFIED';
  corruptedClaimsD7[0].professional_review_outcome = 'PENDING';
  const negD7 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD7 });
  assertTest(!negD7.valid && negD7.errors.some(e => e.includes('non-approved review outcome')), 'Fails when verified legal claim has pending / unapproved review outcome');

  // Neg D8: Reversed validity dates (effective_to < effective_from)
  const corruptedPricingD8 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD8[0].effective_from = '2026-10-15';
  corruptedPricingD8[0].effective_to = '2025-01-01';
  const negD8 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD8 });
  assertTest(!negD8.valid && negD8.errors.some(e => e.includes('Reversed validity period')), 'Fails when validity period dates are reversed (effective_to < effective_from)');

  // Neg D9: Duplicate primary identifier in pricing
  const corruptedPricingD9 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD9[1].pricing_id = corruptedPricingD9[0].pricing_id;
  const negD9 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD9 });
  assertTest(!negD9.valid && negD9.errors.some(e => e.includes('Duplicate pricing_id')), 'Fails when duplicate primary identifier is introduced in pricing');

  // Neg D10: Referral-only route assigned active service ID in JSON registry
  const corruptedServicesD10 = JSON.parse(JSON.stringify(dataLayerMap.services));
  const refRoute = corruptedServicesD10.find(s => s.record_status === 'REFERRAL_ONLY');
  refRoute.service_id = 'V10-SVC-001';
  const negD10 = validateDataLayer({ ...dataLayerMap, services: corruptedServicesD10 });
  assertTest(!negD10.valid && negD10.errors.some(e => e.includes('Referral route') && e.includes('must not have service ID')), 'Fails when referral route is assigned an active service ID in JSON registry');

  // Neg D11: Active service with null service ID in JSON registry
  const corruptedServicesD11 = JSON.parse(JSON.stringify(dataLayerMap.services));
  const actRoute = corruptedServicesD11.find(s => s.record_status === 'ACTIVE_SERVICE');
  actRoute.service_id = null;
  const negD11 = validateDataLayer({ ...dataLayerMap, services: corruptedServicesD11 });
  assertTest(!negD11.valid && negD11.errors.some(e => e.includes('Active service route') && e.includes('missing an active service ID')), 'Fails when active service has null or missing service ID in JSON registry');

  // Neg D12: Disallowed additional properties violating JSON Schema
  const corruptedPricingD12 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD12[0].arbitrary_unauthorized_property = 'illegal_value';
  const schemaPricing = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'pricing.schema.json'), 'utf8'));
  const schemaErrorsD12 = validateJsonSchema(corruptedPricingD12, schemaPricing, 'pricing');
  assertTest(schemaErrorsD12.length > 0 && schemaErrorsD12.some(e => e.includes('additional') || e.includes('Disallowed additional property')), 'Fails when dataset contains disallowed additional properties violating schema');

  // Neg D13: Invalid data type in dataset (e.g. number instead of string for service_name)
  const corruptedServicesD13 = JSON.parse(JSON.stringify(dataLayerMap.services));
  corruptedServicesD13[0].service_name = 12345;
  const schemaServices = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'service-registry.schema.json'), 'utf8'));
  const schemaErrorsD13 = validateJsonSchema(corruptedServicesD13, schemaServices, 'service-registry');
  assertTest(schemaErrorsD13.length > 0 && schemaErrorsD13.some(e => e.includes('type') || e.includes('string')), 'Fails when property violates schema data type requirements');

  // Neg D14: Missing required property in dataset (e.g. missing claim_text in regulatory-claims)
  const corruptedClaimsD14 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  delete corruptedClaimsD14[0].claim_text;
  const schemaClaims = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'regulatory-claims.schema.json'), 'utf8'));
  const schemaErrorsD14 = validateJsonSchema(corruptedClaimsD14, schemaClaims, 'regulatory-claims');
  assertTest(schemaErrorsD14.length > 0 && schemaErrorsD14.some(e => e.includes('required') || e.includes('claim_text')), 'Fails when required property is missing from dataset record');

  // Neg D15: Malformed pattern in dataset (e.g. invalid service_id format in pricing)
  const corruptedPricingD15 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD15[0].service_id = 'BAD-SVC-999';
  const schemaErrorsD15 = validateJsonSchema(corruptedPricingD15, schemaPricing, 'pricing');
  assertTest(schemaErrorsD15.length > 0 && schemaErrorsD15.some(e => e.includes('pattern')), 'Fails when identifier pattern violates regex constraints in schema');

  // Neg D16: Attempting to mark unreviewed jurisdiction variation as VERIFIED without evidence
  const corruptedVariationsD16 = JSON.parse(JSON.stringify(dataLayerMap.variations));
  corruptedVariationsD16[0].verification_status = 'VERIFIED';
  corruptedVariationsD16[0].source_id = null;
  corruptedVariationsD16[0].last_verified_at = null;
  const negD16 = validateDataLayer({ ...dataLayerMap, variations: corruptedVariationsD16 });
  assertTest(!negD16.valid && negD16.errors.some(e => e.includes('missing required source ID or verification timestamp')), 'Fails when unreviewed jurisdiction variation is marked VERIFIED without evidence');

  // Neg D17: Dangling source ID in eligibility
  const corruptedEligibilityD17 = JSON.parse(JSON.stringify(dataLayerMap.eligibility));
  corruptedEligibilityD17[0].source_id = 'SRC-FAKE-999';
  const negD17 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD17 });
  assertTest(!negD17.valid && negD17.errors.some(e => e.includes('unknown source ID')), 'Fails when eligibility cites an unknown / dangling source ID (SRC-FAKE-999)');

  // Neg D18: Dangling source ID in regulatory claims
  const corruptedClaimsD18 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD18[0].source_id = 'SRC-FAKE-999';
  const negD18 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD18 });
  assertTest(!negD18.valid && negD18.errors.some(e => e.includes('unknown source ID')), 'Fails when regulatory claims cite an unknown / dangling source ID (SRC-FAKE-999)');

  // Neg D19: Attempting to mark eligibility record as VERIFIED without verification timestamp
  const corruptedEligibilityD19 = JSON.parse(JSON.stringify(dataLayerMap.eligibility));
  corruptedEligibilityD19[0].verification_status = 'VERIFIED';
  corruptedEligibilityD19[0].last_verified_at = null;
  const negD19 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD19 });
  assertTest(!negD19.valid && negD19.errors.some(e => e.includes('missing required source ID or verification timestamp')), 'Fails when unverified eligibility record is marked VERIFIED without evidence');

  // Neg D20: Statutory turnover threshold (₹5 Crores) incorrectly recorded as service price
  const corruptedPricingD20 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  const gstPricing = corruptedPricingD20.find(p => p.service_id === 'V03-SVC-003');
  if (gstPricing) gstPricing.amount = 50000000;
  const negD20 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD20 });
  assertTest(!negD20.valid && negD20.errors.some(e => e.includes('Statutory turnover threshold')), 'Fails when statutory turnover threshold (₹5 Crores) is recorded as service price');

  // Neg D21: Referral route assigned a commercial pricing record
  const corruptedPricingD21 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD21.push({
    pricing_id: 'PRC-REF-001',
    service_id: 'V01-SVC-001',
    canonical_route: '/services/director-removal-board-disputes.html',
    currency: 'INR',
    amount: 15000,
    pricing_basis: 'FIXED',
    included_charges: ['Representation'],
    excluded_charges: ['GST'],
    verification_status: 'UNVERIFIED',
    last_verified_at: null
  });
  const negD21 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD21 });
  assertTest(!negD21.valid && negD21.errors.some(e => e.includes('Referral route')), 'Fails when referral-only route is assigned a commercial pricing record');

  // Neg D22: Missing active service pricing record
  const corruptedPricingD22 = dataLayerMap.pricing.slice(1);
  const negD22 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD22 });
  assertTest(!negD22.valid && negD22.errors.some(e => e.includes('Missing pricing record')), 'Fails when an active service pricing record is missing');

  // Neg D23: Unverified price marked as COMMERCIALLY_APPROVED
  const corruptedPricingD23 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD23[0].commercial_approval_state = 'COMMERCIALLY_APPROVED';
  corruptedPricingD23[0].verification_status = 'UNVERIFIED';
  const negD23 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD23 });
  assertTest(!negD23.valid && negD23.errors.some(e => e.includes('cannot be marked COMMERCIALLY_APPROVED while remaining UNVERIFIED')), 'Fails when unverified price is marked COMMERCIALLY_APPROVED without approved resolution');

  // Neg D24: Primary vertical mismatch in eligibility record
  const corruptedEligibilityD24 = JSON.parse(JSON.stringify(dataLayerMap.eligibility));
  corruptedEligibilityD24[0].primary_vertical_id = 'V99';
  const negD24 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD24 });
  assertTest(!negD24.valid && negD24.errors.some(e => e.includes('does not match service registry vertical')), 'Fails when eligibility record has mismatched primary vertical ID');

  // Neg D25: Jurisdiction variation with reversed validity period (effective_to < effective_from)
  const corruptedVariationsD25 = JSON.parse(JSON.stringify(dataLayerMap.variations));
  corruptedVariationsD25[0].effective_from = '2026-01-01';
  corruptedVariationsD25[0].effective_to = '2020-01-01';
  const negD25 = validateDataLayer({ ...dataLayerMap, variations: corruptedVariationsD25 });
  assertTest(!negD25.valid && negD25.errors.some(e => e.includes('Reversed validity period')), 'Fails when jurisdiction variation validity period is reversed');

  // Neg D26: Regulatory claim with reversed validity period (effective_to < effective_from)
  const corruptedClaimsD26 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD26[0].effective_from = '2026-01-01';
  corruptedClaimsD26[0].effective_to = '2020-01-01';
  const negD26 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD26 });
  assertTest(!negD26.valid && negD26.errors.some(e => e.includes('Reversed validity period')), 'Fails when regulatory claim validity period is reversed');

  // Neg D27: Rejected regulatory claim incorrectly treated as approved under production gating
  const rejectedClaimD27 = dataLayerMap.claims.find(c => c.verification_status === 'REJECTED_OR_OUTDATED');
  assertTest(rejectedClaimD27 && isApprovedForClientFacing(rejectedClaimD27) === false, 'Fails when rejected claim is evaluated as client-facing approved');

  // Neg D28: Claim marked VERIFIED without verification timestamp
  const corruptedClaimsD28 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD28[0].verification_status = 'VERIFIED';
  corruptedClaimsD28[0].source_id = 'SRC-MCA-001';
  corruptedClaimsD28[0].professional_review_outcome = 'APPROVED';
  corruptedClaimsD28[0].last_verified_at = null;
  const negD28 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD28 });
  assertTest(!negD28.valid && negD28.errors.some(e => e.includes('missing required verification timestamp')), 'Fails when claim marked VERIFIED without verification timestamp');

  // Neg D29: Claim with malformed checked_date format
  const corruptedClaimsD29 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD29[0].checked_date = 'invalid-date-format';
  const negD29 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD29 });
  assertTest(!negD29.valid && negD29.errors.some(e => e.includes('Invalid checked_date format')), 'Fails when regulatory claim checked_date format is malformed');

  // Neg D30: Pending review claim blocked by client-facing status gating
  const pendingClaimD30 = dataLayerMap.claims.find(c => c.verification_status === 'PENDING_PROFESSIONAL_REVIEW');
  assertTest(pendingClaimD30 && isApprovedForClientFacing(pendingClaimD30) === false, 'Fails when pending review statutory claim is evaluated as client-facing approved');

  // Neg D31: Active service missing eligibility record
  const corruptedEligibilityD31 = dataLayerMap.eligibility.slice(1);
  const negD31 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD31 });
  assertTest(!negD31.valid && negD31.errors.some(e => e.includes('Missing eligibility record for active service')), 'Fails when an active service eligibility record is missing');

  // Neg D32: Duplicate vertical ID in verticals dataset
  const corruptedVerticalsD32 = JSON.parse(JSON.stringify(dataLayerMap.verticals));
  corruptedVerticalsD32[1].vertical_id = corruptedVerticalsD32[0].vertical_id;
  const negD32 = validateDataLayer({ ...dataLayerMap, verticals: corruptedVerticalsD32 });
  assertTest(!negD32.valid && negD32.errors.some(e => e.includes('Duplicate vertical_id')), 'Fails when duplicate primary key (vertical_id) is introduced in verticals');

  // Neg D33: Duplicate source ID in sources dataset
  const corruptedSourcesD33 = JSON.parse(JSON.stringify(dataLayerMap.sources));
  corruptedSourcesD33[1].source_id = corruptedSourcesD33[0].source_id;
  const negD33 = validateDataLayer({ ...dataLayerMap, sources: corruptedSourcesD33 });
  assertTest(!negD33.valid && negD33.errors.some(e => e.includes('Duplicate source_id')), 'Fails when duplicate primary key (source_id) is introduced in sources');

  // Neg D34: Invalid verification_status in pricing
  const corruptedPricingD34 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD34[0].verification_status = 'APPROVED';
  const negD34 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD34 });
  assertTest(!negD34.valid && negD34.errors.some(e => e.includes('Invalid verification_status')), 'Fails when pricing contains unsupported verification status value');

  // Neg D35: Invalid verification_status in regulatory claims
  const corruptedClaimsD35 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD35[0].verification_status = 'PENDING_LEGAL_CHECK';
  const negD35 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD35 });
  assertTest(!negD35.valid && negD35.errors.some(e => e.includes('Invalid verification_status')), 'Fails when regulatory claim contains unsupported verification status value');

  // Neg D36: Verified price lacking commercial approval
  const corruptedPricingD36 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD36[0].verification_status = 'VERIFIED';
  corruptedPricingD36[0].source_id = 'SRC-MCA-001';
  corruptedPricingD36[0].last_verified_at = '2026-10-17';
  corruptedPricingD36[0].commercial_approval_state = 'PENDING_COMMERCIAL_APPROVAL';
  const negD36 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD36 });
  assertTest(!negD36.valid && negD36.errors.some(e => e.includes('missing required source/amount/timestamp evidence')), 'Fails when verified price lacks required COMMERCIALLY_APPROVED state');

  // Neg D37: Eligibility record with reversed validity period (effective_to < effective_from)
  const corruptedEligibilityD37 = JSON.parse(JSON.stringify(dataLayerMap.eligibility));
  corruptedEligibilityD37[0].effective_from = '2026-10-15';
  corruptedEligibilityD37[0].effective_to = '2025-01-01';
  const negD37 = validateDataLayer({ ...dataLayerMap, eligibility: corruptedEligibilityD37 });
  assertTest(!negD37.valid && negD37.errors.some(e => e.includes('Reversed validity period')), 'Fails when eligibility record validity period is reversed');

  // Neg D38: Dangling service ID in regulatory claims
  const corruptedClaimsD38 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD38[0].service_id = 'V99-SVC-999';
  const negD38 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD38 });
  assertTest(!negD38.valid && negD38.errors.some(e => e.includes('unknown active service ID')), 'Fails when regulatory claims reference unknown / dangling service ID');

  // Neg D39: Verified claim missing source ID
  const corruptedClaimsD39 = JSON.parse(JSON.stringify(dataLayerMap.claims));
  corruptedClaimsD39[0].verification_status = 'VERIFIED';
  corruptedClaimsD39[0].source_id = null;
  corruptedClaimsD39[0].last_verified_at = '2026-10-17';
  corruptedClaimsD39[0].professional_review_outcome = 'APPROVED';
  const negD39 = validateDataLayer({ ...dataLayerMap, claims: corruptedClaimsD39 });
  assertTest(!negD39.valid && negD39.errors.some(e => e.includes('missing required source ID')), 'Fails when regulatory claim marked VERIFIED lacks required source ID');

  // Neg D40: Verified price with null amount
  const corruptedPricingD40 = JSON.parse(JSON.stringify(dataLayerMap.pricing));
  corruptedPricingD40[0].verification_status = 'VERIFIED';
  corruptedPricingD40[0].source_id = 'SRC-MCA-001';
  corruptedPricingD40[0].last_verified_at = '2026-10-17';
  corruptedPricingD40[0].commercial_approval_state = 'COMMERCIALLY_APPROVED';
  corruptedPricingD40[0].amount = null;
  const negD40 = validateDataLayer({ ...dataLayerMap, pricing: corruptedPricingD40 });
  assertTest(!negD40.valid && negD40.errors.some(e => e.includes('missing required source/amount/timestamp evidence')), 'Fails when verified price carries null amount');

  // ====================================================
  // PHASE 2 TASK 7: STATUS GATING COMBINATORIAL MATRIX
  // ====================================================
  console.log('\n--- Test Suite 8: Authoritative Status-Gating Combinatorial Matrix ---');
  
  // 1. All unapproved statuses evaluate to false
  const unapprovedStatuses = [
    'UNVERIFIED', 'UNREVIEWED', 'SOURCE_IDENTIFIED',
    'PENDING_PROFESSIONAL_REVIEW', 'PENDING_REVIEW', 'SOURCE_NEEDED',
    'REJECTED_OR_OUTDATED', 'REJECTED', 'DRAFT', 'ARCHIVED', 'CUSTOM'
  ];
  let unapprovedFailures = 0;
  unapprovedStatuses.forEach(st => {
    const rec = {
      verification_status: st,
      last_verified_at: '2026-10-17',
      source_id: 'SRC-TEST-001',
      professional_review_outcome: 'APPROVED'
    };
    if (isApprovedForClientFacing(rec) !== false) unapprovedFailures++;
  });
  assertTest(unapprovedFailures === 0, `All 11 non-VERIFIED statuses evaluate strictly to false (tested ${unapprovedStatuses.length} states)`);

  // 2. Defective VERIFIED cases evaluate to false
  const defectiveCases = [
    { desc: 'Missing source_id', rec: { verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: null } },
    { desc: 'Empty source_id', rec: { verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: '' } },
    { desc: 'Null last_verified_at', rec: { verification_status: 'VERIFIED', last_verified_at: null, source_id: 'SRC-001' } },
    { desc: 'Invalid date format', rec: { verification_status: 'VERIFIED', last_verified_at: '17-10-2026', source_id: 'SRC-001' } },
    { desc: 'Pricing null amount', rec: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: null } },
    { desc: 'Pricing zero amount', rec: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: 0 } },
    { desc: 'Pricing negative amount', rec: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'COMMERCIALLY_APPROVED', amount: -500 } },
    { desc: 'Pricing unapproved state', rec: { pricing_id: 'PRC-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', commercial_approval_state: 'PENDING_COMMERCIAL_APPROVAL', amount: 5000 } },
    { desc: 'Claim pending review', rec: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'PENDING' } },
    { desc: 'Claim corrected disposition', rec: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'CORRECTED' } },
    { desc: 'Claim false positive disposition', rec: { claim_id: 'CLM-001', verification_status: 'VERIFIED', last_verified_at: '2026-10-17', source_id: 'SRC-001', professional_review_outcome: 'APPROVED', disposition: 'FALSE_POSITIVE' } }
  ];
  let defectiveFailures = 0;
  defectiveCases.forEach(tc => {
    if (isApprovedForClientFacing(tc.rec) !== false) defectiveFailures++;
  });
  assertTest(defectiveFailures === 0, `All 11 defective VERIFIED edge-cases evaluate strictly to false`);

  // 3. Genuine approved records across all record types evaluate to true
  const validPricingRecord = {
    pricing_id: 'PRC-TEST-001',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-10-17',
    source_id: 'SRC-MCA-001',
    commercial_approval_state: 'COMMERCIALLY_APPROVED',
    amount: 15000
  };
  const validClaimRecord = {
    claim_id: 'CLM-TEST-001',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-10-17',
    source_id: 'SRC-MCA-001',
    professional_review_outcome: 'APPROVED',
    disposition: 'ACCEPTABLE_WITH_EVIDENCE'
  };
  const validGenericRecord = {
    verification_status: 'VERIFIED',
    last_verified_at: '2026-10-17',
    source_id: 'SRC-MCA-001'
  };
  assertTest(
    isApprovedForClientFacing(validPricingRecord) === true &&
    isApprovedForClientFacing(validClaimRecord) === true &&
    isApprovedForClientFacing(validGenericRecord) === true,
    'Genuinely compliant records evaluate strictly to true across pricing, regulatory claims, and general records'
  );

  // 4. Zero records in active disk datasets pass gating
  const totalDiskRecords = dataLayerMap.pricing.length + dataLayerMap.eligibility.length + dataLayerMap.variations.length + dataLayerMap.claims.length;
  const passedDiskRecords = [
    ...dataLayerMap.pricing,
    ...dataLayerMap.eligibility,
    ...dataLayerMap.variations,
    ...dataLayerMap.claims
  ].filter(r => isApprovedForClientFacing(r) === true);
  assertTest(
    passedDiskRecords.length === 0 && totalDiskRecords === 153,
    `Zero disk records pass client-facing gating (0 / 153 approved, exactly 153 blocked)`
  );


  console.log('\n==================================================');
  console.log(`VALIDATION SUMMARY: ${passCount} passed, ${failCount} failed.`);
  console.log('==================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTestSuite();
}

module.exports = {
  validateRegistry,
  validateJsonSchema,
  validateDataLayer,
  isApprovedForClientFacing,
  APPROVED_57_ROUTES,
  REFERRAL_ONLY_ROUTES,
  APPROVED_VERTICALS
};
