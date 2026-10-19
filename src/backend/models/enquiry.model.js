/**
 * CraftEgon CCS - Enquiry Validation & Model Logic
 * Strictly enforces Phase 2 Relational Integrity & Referral Boundaries
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

let cachedRegistry = null;

function loadPhase2Registry() {
  if (cachedRegistry) return cachedRegistry;

  const dataDir = path.resolve(__dirname, '../../../data');
  const serviceRegPath = path.join(dataDir, 'service-registry.json');
  const verticalsPath = path.join(dataDir, 'verticals.json');

  const services = new Map();
  const verticals = new Set();
  const referralRoutes = new Set();
  const canonicalRoutes = new Map();

  try {
    if (fs.existsSync(serviceRegPath)) {
      const data = JSON.parse(fs.readFileSync(serviceRegPath, 'utf8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.canonical_route) {
            canonicalRoutes.set(item.canonical_route.toLowerCase(), item);
          }
          if (item.record_status === 'REFERRAL_ONLY') {
            if (item.canonical_route) referralRoutes.add(item.canonical_route.toLowerCase());
          } else if (item.service_id) {
            services.set(item.service_id, {
              service_id: item.service_id,
              primary_vertical_id: item.primary_vertical_id,
              service_title: item.service_title,
              canonical_route: item.canonical_route
            });
          }
        }
      }
    }

    if (fs.existsSync(verticalsPath)) {
      const vData = JSON.parse(fs.readFileSync(verticalsPath, 'utf8'));
      if (Array.isArray(vData)) {
        for (const v of vData) {
          if (v.vertical_id) verticals.add(v.vertical_id);
        }
      }
    }
  } catch (err) {
    // Graceful fallback if files cannot be read
  }

  // Defensive referral route aliases
  referralRoutes.add('/services/director-removal-board-disputes.html');
  referralRoutes.add('/services/nclt-insolvency-defense.html');
  referralRoutes.add('/services/oppression-mismanagement-petitions.html');
  referralRoutes.add('/services/strike-off-company-closure.html'); // narrative fixture alias

  cachedRegistry = { services, verticals, referralRoutes, canonicalRoutes };
  return cachedRegistry;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateEnquiryPayload(payload) {
  const errors = [];
  const { services, verticals, referralRoutes, canonicalRoutes } = loadPhase2Registry();

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: [{ field: 'body', issue: 'Request body must be a valid JSON object' }] };
  }

  // 1. Referral-Only Route Boundary
  if (payload.source_url && typeof payload.source_url === 'string') {
    const route = payload.source_url.trim().toLowerCase();
    const canonicalRouteRecord = canonicalRoutes && canonicalRoutes.has(route) ? canonicalRoutes.get(route) : null;

    if (canonicalRouteRecord && canonicalRouteRecord.record_status === 'REFERRAL_ONLY') {
      errors.push({
        field: 'source_url',
        issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
      });
    } else if (referralRoutes.has(route)) {
      errors.push({
        field: 'source_url',
        issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
      });
    }
  }

  // 2. Required contact_name
  if (!payload.contact_name || typeof payload.contact_name !== 'string') {
    errors.push({ field: 'contact_name', issue: 'Contact name is required' });
  } else {
    const trimmed = payload.contact_name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      errors.push({ field: 'contact_name', issue: 'Contact name must be between 2 and 100 characters' });
    }
  }

  // 3. Required email
  if (!payload.email || typeof payload.email !== 'string') {
    errors.push({ field: 'email', issue: 'Email address is required' });
  } else {
    const trimmedEmail = payload.email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 254) {
      errors.push({ field: 'email', issue: 'Valid corporate or personal email address required' });
    }
  }

  // 4. Required phone
  if (!payload.phone || typeof payload.phone !== 'string') {
    errors.push({ field: 'phone', issue: 'Phone number is required' });
  } else {
    const cleanedPhone = payload.phone.replace(/[\s\-\(\)\+]/g, '');
    const indianMobileRegex = /^(?:91)?[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanedPhone)) {
      errors.push({ field: 'phone', issue: 'Valid 10-digit Indian mobile number required' });
    }
  }

  // 5. Explicit DPDP Consent
  if (payload.dpdp_consent !== true && payload.dpdp_consent !== 'true') {
    errors.push({ field: 'dpdp_consent', issue: 'Explicit consent under Digital Personal Data Protection (DPDP) Act 2023 is required to process corporate enquiry' });
  }

  // 6. Canonical Service ID Validation
  if (payload.service_id) {
    if (typeof payload.service_id !== 'string' || !services.has(payload.service_id)) {
      errors.push({ field: 'service_id', issue: `Service ID '${payload.service_id}' is not recognized in the canonical Phase 2 registry` });
    }
  }

  // 7. Canonical Vertical ID Validation
  if (payload.vertical_id) {
    if (typeof payload.vertical_id !== 'string' || !verticals.has(payload.vertical_id)) {
      errors.push({ field: 'vertical_id', issue: `Vertical ID '${payload.vertical_id}' is not recognized in the canonical Phase 2 taxonomy` });
    }
  }

  // 8. Relational Integrity: service_id <-> vertical_id match
  if (payload.service_id && payload.vertical_id && services.has(payload.service_id)) {
    const serviceRecord = services.get(payload.service_id);
    if (serviceRecord.primary_vertical_id !== payload.vertical_id) {
      errors.push({
        field: 'service_id',
        issue: `Service ID '${payload.service_id}' belongs to primary vertical '${serviceRecord.primary_vertical_id}', not '${payload.vertical_id}'. Mismatched service/vertical combination rejected.`
      });
    }
  }

  // 9. Scope description length limit
  if (payload.scope_description && typeof payload.scope_description === 'string' && payload.scope_description.length > 2000) {
    errors.push({ field: 'scope_description', issue: 'Scope description cannot exceed 2000 characters' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function generateLeadReference() {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LEAD-${year}-${hex}`;
}

function generateCaseReference() {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CASE-${year}-${hex}`;
}

function generateOrderReference() {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${year}-${hex}`;
}

module.exports = {
  loadPhase2Registry,
  validateEnquiryPayload,
  generateLeadReference,
  generateCaseReference,
  generateOrderReference
};
