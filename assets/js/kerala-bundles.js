/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - KERALA VERTICAL BUNDLES RUNTIME MODULE
 * ============================================================================
 * Browser & Node-compatible accessor for Kerala Launch-to-Operate + Year-1
 * Governance vertical bundles. Powers Phase 2 bundle landing pages and
 * Phase 3 Kerala Readiness Diagnostics & Bundle Estimators.
 *
 * Canonical JSON source: data/kerala-bundles.json
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CRAFTEGON_KERALA_BUNDLES = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KERALA_BUNDLE_INDEX = [
    {
      id: 'KL-BND-CLINIC',
      slug: 'clinics-diagnostics-kerala',
      bundleName: 'Clinic Launch & Year-1 Risk Shield',
      title: 'Clinics, Diagnostics & Care/Research Centers',
      shortTagline: 'Entity setup, K-SWIFT & Kerala Clinical Establishments routing, KSPCB BMW coordination, specialist doctor contracts, and Year-1 healthcare governance.',
      linkedServiceIds: ['V01-SVC-007', 'V01-SVC-002', 'V02-SVC-017', 'V04-SVC-001', 'V05-SVC-002', 'V06-SVC-003', 'V07-SVC-001', 'V07-SVC-002', 'V11-SVC-002', 'V12-SVC-002'],
      primaryVerticalIds: ['V01', 'V02', 'V04', 'V05', 'V07', 'V12'],
      dashboardMilestoneRules: ['AOC-4', 'MGT-7 / MGT-7A', 'ADT-1', 'DIR-3 KYC', 'DPT-3', 'GSTR-1', 'GSTR-3B'],
      defaultCalculatorRoute: '/conversion/calculator.html#calc-tab-1'
    },
    {
      id: 'KL-BND-EXIM',
      slug: 'exim-cold-chain-kerala',
      bundleName: 'EXIM & Cold-Chain Trade Pack',
      title: 'EXIM, Freight, Warehousing & Cold-Chain Logistics',
      shortTagline: 'Import-Export setup, port AD Code & LUT routing, warehouse/KSPCB approvals, CHA & cold-chain SLA contracts, and FEMA/EDPMS Year-1 governance.',
      linkedServiceIds: ['V01-SVC-007', 'V01-SVC-002', 'V02-SVC-010', 'V02-SVC-017', 'V03-SVC-002', 'V03-SVC-003', 'V04-SVC-001', 'V05-SVC-002', 'V06-SVC-003', 'V13-SVC-001', 'V13-SVC-002', 'V13-SVC-003'],
      primaryVerticalIds: ['V01', 'V02', 'V03', 'V05', 'V13'],
      dashboardMilestoneRules: ['AOC-4', 'MGT-7 / MGT-7A', 'GSTR-1', 'GSTR-3B', 'GSTR-9', 'Form 3CEB', 'RBI FLA Return', 'FC-GPR'],
      defaultCalculatorRoute: '/conversion/calculator.html#calc-tab-2'
    },
    {
      id: 'KL-BND-FOOD',
      slug: 'food-spice-processing-kerala',
      bundleName: 'Plant-to-Shelf Launch & Retainer',
      title: 'Food, Spice/Agri Processing & Wellness/Nutraceutical Units',
      shortTagline: 'Entity + Udyam setup, K-SWIFT & KSPCB plant approvals, FSSAI manufacturing licensing, co-packing & distributor contracts, and Year-1 compliance.',
      linkedServiceIds: ['V01-SVC-007', 'V01-SVC-002', 'V01-SVC-003', 'V01-SVC-005', 'V02-SVC-010', 'V02-SVC-017', 'V03-SVC-003', 'V04-SVC-001', 'V05-SVC-002', 'V06-SVC-003', 'V07-SVC-001', 'V07-SVC-002'],
      primaryVerticalIds: ['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07'],
      dashboardMilestoneRules: ['AOC-4', 'MGT-7 / MGT-7A', 'MSME-1', 'GSTR-1', 'GSTR-3B', 'GSTR-9'],
      defaultCalculatorRoute: '/conversion/calculator.html#calc-tab-3'
    },
    {
      id: 'KL-BND-HOSPITALITY',
      slug: 'hospitality-resorts-kerala',
      bundleName: 'Property Launch & Hospitality Suite',
      title: 'Hospitality, Boutique Stays & Eco/Wellness Resorts',
      shortTagline: 'Asset/operating SPV setup, K-SWIFT/LSGD/KSPCB/Fire resort clearances, land lease & operator contracts, guest privacy, and Year-1 compliance.',
      linkedServiceIds: ['V01-SVC-007', 'V01-SVC-002', 'V02-SVC-017', 'V03-SVC-003', 'V04-SVC-001', 'V05-SVC-002', 'V06-SVC-003', 'V07-SVC-001', 'V07-SVC-002', 'V12-SVC-002', 'V12-SVC-003', 'V13-SVC-003'],
      primaryVerticalIds: ['V01', 'V02', 'V03', 'V05', 'V07', 'V12', 'V13'],
      dashboardMilestoneRules: ['AOC-4', 'MGT-7 / MGT-7A', 'GSTR-1', 'GSTR-3B', 'GSTR-9', 'RBI FLA Return', 'FC-GPR'],
      defaultCalculatorRoute: '/conversion/calculator.html#calc-tab-1'
    },
    {
      id: 'KL-BND-EDTECH',
      slug: 'edtech-academies-kerala',
      bundleName: 'Academy & EdTech Foundation Pack',
      title: 'EdTech, Coaching Academies & Skill Training Institutes',
      shortTagline: 'Pvt Ltd & DPIIT/KSUM setup, faculty IP & content ownership pacts, DPDP student privacy, refund/fee governance, and Year-1 academy compliance.',
      linkedServiceIds: ['V01-SVC-001', 'V01-SVC-007', 'V01-SVC-002', 'V01-SVC-008', 'V02-SVC-017', 'V03-SVC-003', 'V04-SVC-001', 'V05-SVC-001', 'V05-SVC-002', 'V06-SVC-001', 'V06-SVC-002', 'V06-SVC-003', 'V07-SVC-002', 'V12-SVC-002', 'V12-SVC-003'],
      primaryVerticalIds: ['V01', 'V02', 'V05', 'V06', 'V07', 'V12'],
      dashboardMilestoneRules: ['AOC-4', 'MGT-7 / MGT-7A', 'ADT-1', 'MGT-14', 'GSTR-1', 'GSTR-3B', 'GSTR-9'],
      defaultCalculatorRoute: '/conversion/calculator.html#calc-tab-4'
    }
  ];

  function getAllBundles() {
    return KERALA_BUNDLE_INDEX.slice();
  }

  function getBundleById(id) {
    return KERALA_BUNDLE_INDEX.find(b => b.id === id) || null;
  }

  function getBundleBySlug(slug) {
    return KERALA_BUNDLE_INDEX.find(b => b.slug === slug) || null;
  }

  function getBundlesForServiceId(serviceId) {
    return KERALA_BUNDLE_INDEX.filter(b => b.linkedServiceIds.includes(serviceId));
  }

  function fetchFullBundlesDataset(url) {
    const targetUrl = url || '/data/kerala-bundles.json';
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('Fetch API unavailable in current runtime'));
    }
    return fetch(targetUrl, { credentials: 'same-origin' }).then(res => {
      if (!res.ok) throw new Error('Failed to load Kerala bundles dataset: HTTP ' + res.status);
      return res.json();
    });
  }

  return {
    version: '1.0.0',
    bundles: KERALA_BUNDLE_INDEX,
    getAllBundles,
    getBundleById,
    getBundleBySlug,
    getBundlesForServiceId,
    fetchFullBundlesDataset
  };
}));
