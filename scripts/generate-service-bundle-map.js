/**
 * ============================================================================
 * CRAFTEGON CCS: COMPLETE 57-ROUTE SERVICE-TO-BUNDLE MAPPING GENERATOR
 * ============================================================================
 * Maps every canonical route in data/service-registry.json (54 active services,
 * 3 referral-only routes, and 1 search utility route) to:
 *  - Assigned Industry Solution Bundles (KL-BND-* or GENERAL_CATALOG)
 *  - Customer-facing Delivery Phase ("Start Right", "Put the Essentials in Place",
 *    "Stay on Track", "General & Specialist Support", or "Referral Only")
 *  - Commercial Tier Classification (ONE_TIME_SETUP, SETUP_PLUS_CONTRACTS,
 *    ANNUAL_OR_MONTHLY_RETAINER, SPECIALIST_SCOPED, REFERRAL_ONLY)
 *  - Diagnostic Tool & Enquiry Routes
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'service-registry.json'), 'utf8'));
const bundlesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'kerala-bundles.json'), 'utf8'));

const ALL_BUNDLES = ['KL-BND-CLINIC', 'KL-BND-EXIM', 'KL-BND-FOOD', 'KL-BND-HOSPITALITY', 'KL-BND-EDTECH'];

// Explicit rule matrix covering all 54 active IDs + 3 referral routes + /search/
const EXPLICIT_RULES = {
  '/search/': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Discovery & Verification Utility',
    commercialTiers: ['DISCOVERY_UTILITY'],
    diagnosticToolRoute: '/search/',
    intakeRoute: '/conversion/calculator.html#readiness'
  },
  // Vertical 01: Entity Formation -> Phase 1: Start Right
  'V01-SVC-001': {
    assignedBundles: ['KL-BND-EDTECH', 'KL-BND-CLINIC'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/conversion/calculator.html#readiness',
    intakeRoute: '/conversion/post-incorporation-checkout.html'
  },
  'V01-SVC-002': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/ppc-company-registration.html'
  },
  'V01-SVC-003': {
    assignedBundles: ['KL-BND-FOOD', 'KL-BND-EXIM', 'KL-BND-CLINIC'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-3',
    intakeRoute: '/contact.html?service=msme-udyam'
  },
  'V01-SVC-004': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/conversion/ppc-company-registration.html'
  },
  'V01-SVC-005': {
    assignedBundles: ['KL-BND-FOOD', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/contact.html?service=partnership-registration'
  },
  'V01-SVC-006': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/contact.html?service=proprietorship-registration'
  },
  'V01-SVC-007': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/ppc-company-registration.html'
  },
  'V01-SVC-008': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EDTECH'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/contact.html?service=section-8-registration'
  },
  'V01-SVC-009': {
    assignedBundles: ['KL-BND-EDTECH', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/contact.html?service=society-registration'
  },
  'V01-SVC-010': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EDTECH', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/index.html#entity-selector',
    intakeRoute: '/contact.html?service=trust-registration'
  },

  // Vertical 02: Corporate Compliance -> Phase 3: Stay on Track (except Strike-Off in General Catalog)
  'V02-SVC-001': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-HOSPITALITY', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/ppc-annual-compliance.html'
  },
  'V02-SVC-002': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/ppc-annual-compliance.html'
  },
  'V02-SVC-003': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-004': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/ppc-annual-compliance.html'
  },
  'V02-SVC-005': {
    assignedBundles: ['KL-BND-HOSPITALITY', 'KL-BND-CLINIC', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-006': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-007': {
    assignedBundles: ['KL-BND-EDTECH', 'KL-BND-HOSPITALITY', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-008': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/ppc-annual-compliance.html'
  },
  'V02-SVC-009': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-010': {
    assignedBundles: ['KL-BND-EXIM', 'KL-BND-FOOD'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-3',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-011': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/strike-off-checker.html',
    intakeRoute: '/contact.html?service=form-msc1-dormant'
  },
  'V02-SVC-012': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-013': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/strike-off-checker.html',
    intakeRoute: '/contact.html?service=form-stk2-strike-off'
  },
  'V02-SVC-014': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-1',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-015': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/strike-off-checker.html',
    intakeRoute: '/contact.html?service=llp-form24-strike-off'
  },
  'V02-SVC-016': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V02-SVC-017': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/ppc-annual-compliance.html'
  },
  'V02-SVC-018': {
    assignedBundles: ['KL-BND-FOOD', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#readiness',
    intakeRoute: '/contact.html?service=rof-maintenance'
  },

  // Vertical 03: Tax & Regulatory -> Phase 3: Stay on Track
  'V03-SVC-001': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EDTECH', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/tax-intake.html',
    intakeRoute: '/conversion/tax-intake.html'
  },
  'V03-SVC-002': {
    assignedBundles: ['KL-BND-EXIM', 'KL-BND-HOSPITALITY'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-2',
    intakeRoute: '/conversion/tax-intake.html'
  },
  'V03-SVC-003': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/calculator.html#calc-tab-2',
    intakeRoute: '/conversion/tax-intake.html'
  },
  'V03-SVC-004': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EDTECH', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/tax-intake.html',
    intakeRoute: '/conversion/tax-intake.html'
  },
  'V03-SVC-005': {
    assignedBundles: ['KL-BND-FOOD', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/tax-intake.html',
    intakeRoute: '/conversion/tax-intake.html'
  },

  // Vertical 04: Statutory Registrations -> Phase 1 & Phase 3
  'V04-SVC-001': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP', 'ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/license-qualification.html',
    intakeRoute: '/conversion/hr-audit.html'
  },

  // Vertical 05: Contracts -> Phase 2: Put the Essentials in Place
  'V05-SVC-001': {
    assignedBundles: ['KL-BND-EDTECH', 'KL-BND-CLINIC', 'KL-BND-HOSPITALITY', 'KL-BND-EXIM'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/ai-document-generator.html',
    intakeRoute: '/conversion/contract-intake.html'
  },
  'V05-SVC-002': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/ai-document-generator.html',
    intakeRoute: '/conversion/contract-intake.html'
  },

  // Vertical 06: IPR -> Phase 2: Put the Essentials in Place
  'V06-SVC-001': {
    assignedBundles: ['KL-BND-EXIM', 'KL-BND-FOOD', 'KL-BND-EDTECH'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/trademark-search.html',
    intakeRoute: '/conversion/contract-intake.html'
  },
  'V06-SVC-002': {
    assignedBundles: ['KL-BND-EDTECH', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/trademark-search.html',
    intakeRoute: '/conversion/ppc-trademark-registration.html'
  },
  'V06-SVC-003': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/trademark-search.html',
    intakeRoute: '/conversion/ppc-trademark-registration.html'
  },

  // Vertical 07: Workforce & HR -> Phase 2: Put the Essentials in Place
  'V07-SVC-001': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EXIM', 'KL-BND-FOOD', 'KL-BND-HOSPITALITY', 'KL-BND-EDTECH'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/hr-audit.html',
    intakeRoute: '/conversion/hr-audit.html'
  },
  'V07-SVC-002': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/hr-audit.html',
    intakeRoute: '/conversion/hr-audit.html'
  },

  // Vertical 09: Transactions & M&A -> General & Specialist Support
  'V09-SVC-001': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/ma-advisory-enquiry.html',
    intakeRoute: '/conversion/ma-advisory-enquiry.html'
  },
  'V09-SVC-002': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-HOSPITALITY', 'GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/ma-advisory-enquiry.html',
    intakeRoute: '/conversion/ma-advisory-enquiry.html'
  },
  'V09-SVC-003': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/ma-advisory-enquiry.html',
    intakeRoute: '/conversion/ma-advisory-enquiry.html'
  },

  // Vertical 10: Dispute Avoidance (Referral Only)
  '/services/director-removal-board-disputes.html': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Referral-Only (Advocates Act Boundary)',
    commercialTiers: ['REFERRAL_ONLY'],
    diagnosticToolRoute: '/conversion/dispute-consultation.html',
    intakeRoute: '/conversion/dispute-consultation.html'
  },
  '/services/nclt-insolvency-defense.html': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Referral-Only (Advocates Act Boundary)',
    commercialTiers: ['REFERRAL_ONLY'],
    diagnosticToolRoute: '/conversion/dispute-consultation.html',
    intakeRoute: '/conversion/dispute-consultation.html'
  },
  '/services/oppression-mismanagement-petitions.html': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'Referral-Only (Advocates Act Boundary)',
    commercialTiers: ['REFERRAL_ONLY'],
    diagnosticToolRoute: '/conversion/dispute-consultation.html',
    intakeRoute: '/conversion/dispute-consultation.html'
  },

  // Vertical 11: Governance, Audit & Risk
  'V11-SVC-001': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-HOSPITALITY', 'GENERAL_CATALOG'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/secretarial-audit-scope.html',
    intakeRoute: '/conversion/secretarial-audit-scope.html'
  },
  'V11-SVC-002': {
    assignedBundles: ALL_BUNDLES,
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/retainer-desk.html',
    intakeRoute: '/conversion/retainer-desk.html'
  },
  'V11-SVC-003': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/csr-audit-form.html',
    intakeRoute: '/conversion/csr-audit-form.html'
  },
  'V11-SVC-004': {
    assignedBundles: ['GENERAL_CATALOG'],
    deliveryPhase: 'General & Specialist Support',
    commercialTiers: ['SPECIALIST_SCOPED'],
    diagnosticToolRoute: '/conversion/secretarial-audit-scope.html',
    intakeRoute: '/conversion/secretarial-audit-scope.html'
  },

  // Vertical 12: Data Privacy & Tech Law -> Phase 2: Put the Essentials in Place
  'V12-SVC-001': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-EDTECH', 'KL-BND-HOSPITALITY'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/dpdp-audit-request.html',
    intakeRoute: '/conversion/dpdp-audit-request.html'
  },
  'V12-SVC-002': {
    assignedBundles: ['KL-BND-CLINIC', 'KL-BND-HOSPITALITY', 'KL-BND-EDTECH'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/dpdp-audit-request.html',
    intakeRoute: '/conversion/dpdp-audit-request.html'
  },
  'V12-SVC-003': {
    assignedBundles: ['KL-BND-HOSPITALITY', 'KL-BND-EDTECH', 'KL-BND-FOOD'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/dpdp-audit-request.html',
    intakeRoute: '/conversion/dpdp-audit-request.html'
  },

  // Vertical 13: Cross-Border & FEMA -> Phase 1 / Phase 2 / Phase 3
  'V13-SVC-001': {
    assignedBundles: ['KL-BND-EXIM', 'KL-BND-EDTECH'],
    deliveryPhase: 'Phase 2: Put the Essentials in Place',
    commercialTiers: ['SETUP_PLUS_CONTRACTS'],
    diagnosticToolRoute: '/conversion/fema-consultation.html',
    intakeRoute: '/conversion/cross-border-retainer.html'
  },
  'V13-SVC-002': {
    assignedBundles: ['KL-BND-EXIM'],
    deliveryPhase: 'Phase 1: Start Right',
    commercialTiers: ['ONE_TIME_SETUP'],
    diagnosticToolRoute: '/conversion/fema-consultation.html',
    intakeRoute: '/conversion/fema-consultation.html'
  },
  'V13-SVC-003': {
    assignedBundles: ['KL-BND-EXIM', 'KL-BND-HOSPITALITY'],
    deliveryPhase: 'Phase 3: Stay on Track',
    commercialTiers: ['ANNUAL_OR_MONTHLY_RETAINER'],
    diagnosticToolRoute: '/conversion/fema-consultation.html',
    intakeRoute: '/conversion/cross-border-retainer.html'
  }
};

const mappedRecords = registry.map(entry => {
  const key = entry.service_id || entry.canonical_route;
  const rule = EXPLICIT_RULES[key];
  if (!rule) {
    throw new Error(`Missing bundle mapping rule for ${key} (${entry.canonical_route})`);
  }
  return {
    canonicalRoute: entry.canonical_route,
    serviceId: entry.service_id,
    serviceName: entry.service_name,
    recordStatus: entry.record_status,
    primaryVerticalId: entry.primary_vertical_id,
    relatedVerticalIds: entry.related_vertical_ids || [],
    assignedBundles: rule.assignedBundles,
    deliveryPhase: rule.deliveryPhase,
    commercialTiers: rule.commercialTiers,
    diagnosticToolRoute: rule.diagnosticToolRoute,
    intakeRoute: rule.intakeRoute
  };
});

// Verify 100% of registry routes mapped
if (mappedRecords.length !== registry.length) {
  throw new Error('Mapping count mismatch!');
}

const bundleLabels = {};
bundlesData.bundles.forEach(b => {
  bundleLabels[b.id] = {
    id: b.id,
    slug: b.slug,
    bundleName: b.bundleName,
    title: b.title,
    route: `/bundles/${b.slug}.html`
  };
});
bundleLabels.GENERAL_CATALOG = {
  id: 'GENERAL_CATALOG',
  slug: 'services',
  bundleName: 'General & Specialist Corporate Services',
  title: 'Specialist Transactions, Non-Profit & Ongoing Compliance Catalog',
  route: '/services.html'
};

const jsonOut = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-11-26',
  totalEntries: mappedRecords.length,
  activeServicesCount: mappedRecords.filter(r => r.recordStatus === 'ACTIVE_SERVICE').length,
  referralRoutesCount: mappedRecords.filter(r => r.recordStatus === 'REFERRAL_ONLY').length,
  bundleDirectory: bundleLabels,
  mappings: mappedRecords
};

fs.writeFileSync(path.join(ROOT, 'data', 'service-bundle-map.json'), JSON.stringify(jsonOut, null, 2), 'utf8');

// Browser & Node runtime module
const jsOut = `/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - 57-ROUTE SERVICE-TO-BUNDLE MAPPER
 * ============================================================================
 * Auto-generated from data/service-registry.json & data/kerala-bundles.json
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CRAFTEGON_SERVICE_BUNDLE_MAP = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BUNDLE_DIRECTORY = ${JSON.stringify(bundleLabels, null, 2)};
  const SERVICE_MAPPINGS = ${JSON.stringify(mappedRecords.map(r => ({
    r: r.canonicalRoute,
    id: r.serviceId,
    n: r.serviceName,
    st: r.recordStatus,
    b: r.assignedBundles,
    p: r.deliveryPhase,
    t: r.commercialTiers,
    tool: r.diagnosticToolRoute,
    cta: r.intakeRoute
  })), null, 2)};

  function getByRoute(route) {
    if (!route) return null;
    const clean = String(route).split('?')[0].split('#')[0];
    return SERVICE_MAPPINGS.find(m => m.r === clean) || null;
  }

  function getByServiceId(id) {
    if (!id) return null;
    return SERVICE_MAPPINGS.find(m => m.id === id) || null;
  }

  function getServicesForBundle(bundleId) {
    return SERVICE_MAPPINGS.filter(m => m.b.includes(bundleId));
  }

  return {
    bundleDirectory: BUNDLE_DIRECTORY,
    mappings: SERVICE_MAPPINGS,
    getByRoute,
    getByServiceId,
    getServicesForBundle
  };
}));
`;

fs.writeFileSync(path.join(ROOT, 'assets', 'js', 'service-bundle-map.js'), jsOut, 'utf8');

// Generate Markdown mapping report in docs/
const mdLines = [
  '# CraftEgon Corporate Services (CCS) — Service-to-Bundle Mapping Report',
  '',
  `**Total Registry Entries Mapped:** ${mappedRecords.length} (${jsonOut.activeServicesCount} Active Services, ${jsonOut.referralRoutesCount} Referral-Only Routes, 1 Utility Route)`,
  '',
  '| Service ID / Status | Canonical Route | Service Name | Assigned Bundles | Customer Delivery Phase | Commercial Tier | Diagnostic / Intake Tool |',
  '|---|---|---|---|---|---|---|'
];

mappedRecords.forEach(r => {
  const idLabel = r.serviceId || (r.recordStatus === 'REFERRAL_ONLY' ? 'REFERRAL-ONLY' : 'UTILITY');
  const bNames = r.assignedBundles.join(', ');
  mdLines.push(`| \`${idLabel}\` | \`${r.canonicalRoute}\` | ${r.serviceName} | ${bNames} | ${r.deliveryPhase} | ${r.commercialTiers.join(', ')} | \`${r.diagnosticToolRoute}\` |`);
});

fs.writeFileSync(path.join(ROOT, 'docs', 'CCS_SERVICE_TO_BUNDLE_MAPPING.md'), mdLines.join('\n') + '\n', 'utf8');
console.log(`Generated service-bundle mapping for ${mappedRecords.length} entries (${jsonOut.activeServicesCount} active + ${jsonOut.referralRoutesCount} referral + 1 utility).`);
