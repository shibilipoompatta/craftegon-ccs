/**
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

  const BUNDLE_DIRECTORY = {
  "KL-BND-CLINIC": {
    "id": "KL-BND-CLINIC",
    "slug": "clinics-diagnostics-kerala",
    "bundleName": "Clinic Launch & Year-1 Risk Shield",
    "title": "Clinics, Diagnostics & Care/Research Centers",
    "route": "/bundles/clinics-diagnostics-kerala.html"
  },
  "KL-BND-EXIM": {
    "id": "KL-BND-EXIM",
    "slug": "exim-cold-chain-kerala",
    "bundleName": "EXIM & Cold-Chain Trade Pack",
    "title": "EXIM, Freight, Warehousing & Cold-Chain Logistics",
    "route": "/bundles/exim-cold-chain-kerala.html"
  },
  "KL-BND-FOOD": {
    "id": "KL-BND-FOOD",
    "slug": "food-spice-processing-kerala",
    "bundleName": "Plant-to-Shelf Launch & Retainer",
    "title": "Food, Spice/Agri Processing & Wellness/Nutraceutical Units",
    "route": "/bundles/food-spice-processing-kerala.html"
  },
  "KL-BND-HOSPITALITY": {
    "id": "KL-BND-HOSPITALITY",
    "slug": "hospitality-resorts-kerala",
    "bundleName": "Property Launch & Hospitality Suite",
    "title": "Hospitality, Boutique Stays & Eco/Wellness Resorts",
    "route": "/bundles/hospitality-resorts-kerala.html"
  },
  "KL-BND-EDTECH": {
    "id": "KL-BND-EDTECH",
    "slug": "edtech-academies-kerala",
    "bundleName": "Academy & EdTech Foundation Pack",
    "title": "EdTech, Coaching Academies & Skill Training Institutes",
    "route": "/bundles/edtech-academies-kerala.html"
  },
  "GENERAL_CATALOG": {
    "id": "GENERAL_CATALOG",
    "slug": "services",
    "bundleName": "General & Specialist Corporate Services",
    "title": "Specialist Transactions, Non-Profit & Ongoing Compliance Catalog",
    "route": "/services.html"
  }
};
  const SERVICE_MAPPINGS = [
  {
    "r": "/search/",
    "id": null,
    "n": "Corporate & IP Search Directory",
    "st": "UTILITY_ROUTE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Discovery & Verification Utility",
    "t": [
      "DISCOVERY_UTILITY"
    ],
    "tool": "/search/",
    "cta": "/conversion/calculator.html#readiness"
  },
  {
    "r": "/services/dpiit-startup-india.html",
    "id": "V01-SVC-001",
    "n": "DPIIT Startup India Recognition & Section 140 Tax Holiday Assessment",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EDTECH",
      "KL-BND-CLINIC"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/conversion/calculator.html#readiness",
    "cta": "/conversion/post-incorporation-checkout.html"
  },
  {
    "r": "/services/llp-registration.html",
    "id": "V01-SVC-002",
    "n": "Limited Liability Partnership (LLP) Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/ppc-company-registration.html"
  },
  {
    "r": "/services/msme-udyam.html",
    "id": "V01-SVC-003",
    "n": "MSME / Udyam Registration Online",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-FOOD",
      "KL-BND-EXIM",
      "KL-BND-CLINIC"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/conversion/calculator.html#calc-tab-3",
    "cta": "/contact.html?service=msme-udyam"
  },
  {
    "r": "/services/opc-registration.html",
    "id": "V01-SVC-004",
    "n": "One Person Company (OPC) Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/conversion/ppc-company-registration.html"
  },
  {
    "r": "/services/partnership-registration.html",
    "id": "V01-SVC-005",
    "n": "Partnership Firm Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-FOOD",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/contact.html?service=partnership-registration"
  },
  {
    "r": "/services/proprietorship-registration.html",
    "id": "V01-SVC-006",
    "n": "Sole Proprietorship Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/contact.html?service=proprietorship-registration"
  },
  {
    "r": "/services/pvt-ltd-registration.html",
    "id": "V01-SVC-007",
    "n": "Private Limited Company Registration (SPICe+)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/ppc-company-registration.html"
  },
  {
    "r": "/services/section-8-registration.html",
    "id": "V01-SVC-008",
    "n": "Section 8 Company / Non-Profit Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/contact.html?service=section-8-registration"
  },
  {
    "r": "/services/society-registration.html",
    "id": "V01-SVC-009",
    "n": "Society Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EDTECH",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/contact.html?service=society-registration"
  },
  {
    "r": "/services/trust-registration.html",
    "id": "V01-SVC-010",
    "n": "Charitable Trust Registration",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EDTECH",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/index.html#entity-selector",
    "cta": "/contact.html?service=trust-registration"
  },
  {
    "r": "/services/aoc4-xbrl.html",
    "id": "V02-SVC-001",
    "n": "AOC-4 XBRL Financial Tagging & Filing",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-HOSPITALITY",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/ppc-annual-compliance.html"
  },
  {
    "r": "/services/dir3-kyc.html",
    "id": "V02-SVC-002",
    "n": "DIR-3 KYC Annual Director Verification",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/ppc-annual-compliance.html"
  },
  {
    "r": "/services/form-adt1.html",
    "id": "V02-SVC-003",
    "n": "Form ADT-1 Statutory Auditor Appointment",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-aoc4.html",
    "id": "V02-SVC-004",
    "n": "Form AOC-4 Financial Statements Filing",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/ppc-annual-compliance.html"
  },
  {
    "r": "/services/form-ben2.html",
    "id": "V02-SVC-005",
    "n": "Form BEN-2 Significant Beneficial Ownership (SBO)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-HOSPITALITY",
      "KL-BND-CLINIC",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-dpt3.html",
    "id": "V02-SVC-006",
    "n": "Form DPT-3 Return of Deposits & Loans",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-mgt14.html",
    "id": "V02-SVC-007",
    "n": "Form MGT-14 Resolution & Filing Solutions",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EDTECH",
      "KL-BND-HOSPITALITY",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-mgt7.html",
    "id": "V02-SVC-008",
    "n": "Form MGT-7 Annual Return Filing",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/ppc-annual-compliance.html"
  },
  {
    "r": "/services/form-mr1.html",
    "id": "V02-SVC-009",
    "n": "Form MR-1 Appointment of Managing Director, WTD or Manager",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-msme1.html",
    "id": "V02-SVC-010",
    "n": "Form MSME-1 Half-Yearly Return",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM",
      "KL-BND-FOOD"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-3",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-msc1-dormant.html",
    "id": "V02-SVC-011",
    "n": "Form MSC-1 Application to Obtain Dormant Company Status",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/strike-off-checker.html",
    "cta": "/contact.html?service=form-msc1-dormant"
  },
  {
    "r": "/services/form-pas6.html",
    "id": "V02-SVC-012",
    "n": "Form PAS-6 Reconciliation of Share Capital Audit",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-stk2-strike-off.html",
    "id": "V02-SVC-013",
    "n": "Form STK-2 Fast-Track Company Strike-Off & Voluntary Closure",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/strike-off-checker.html",
    "cta": "/contact.html?service=form-stk2-strike-off"
  },
  {
    "r": "/services/llp-compliance-forms.html",
    "id": "V02-SVC-014",
    "n": "LLP Annual Filings (Form 11 Annual Return & Form 8 Statement of Account)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-1",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/llp-form24-strike-off.html",
    "id": "V02-SVC-015",
    "n": "LLP Form 24 Fast-Track Strike-Off & Closure",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/strike-off-checker.html",
    "cta": "/contact.html?service=llp-form24-strike-off"
  },
  {
    "r": "/services/mbp1-dir8.html",
    "id": "V02-SVC-016",
    "n": "Form MBP-1 & DIR-8 Director Disclosures",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/roc-annual-compliance.html",
    "id": "V02-SVC-017",
    "n": "RoC Annual Compliance & Secretarial Retainer",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/ppc-annual-compliance.html"
  },
  {
    "r": "/services/rof-maintenance.html",
    "id": "V02-SVC-018",
    "n": "Registrar of Firms (RoF) Maintenance & Amendments",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-FOOD",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#readiness",
    "cta": "/contact.html?service=rof-maintenance"
  },
  {
    "r": "/services/form-10b.html",
    "id": "V03-SVC-001",
    "n": "Form 10B / 10BB Trust Audit Report",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EDTECH",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/tax-intake.html",
    "cta": "/conversion/tax-intake.html"
  },
  {
    "r": "/services/form-3ceb.html",
    "id": "V03-SVC-002",
    "n": "Form 3CEB International Transfer Pricing Report",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM",
      "KL-BND-HOSPITALITY"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-2",
    "cta": "/conversion/tax-intake.html"
  },
  {
    "r": "/services/gst-annual.html",
    "id": "V03-SVC-003",
    "n": "GST Annual Return & Reconciliation (GSTR-9 & GSTR-9C)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/calculator.html#calc-tab-2",
    "cta": "/conversion/tax-intake.html"
  },
  {
    "r": "/services/itr7.html",
    "id": "V03-SVC-004",
    "n": "ITR-7 Filing for Companies, Trusts & Institutions",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EDTECH",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/tax-intake.html",
    "cta": "/conversion/tax-intake.html"
  },
  {
    "r": "/services/proprietorship-tax.html",
    "id": "V03-SVC-005",
    "n": "Proprietorship & SME Income Tax Returns",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-FOOD",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/tax-intake.html",
    "cta": "/conversion/tax-intake.html"
  },
  {
    "r": "/services/pf-esic-compliance.html",
    "id": "V04-SVC-001",
    "n": "PF / ESIC Statutory Registration & Monthly Return Filings",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP",
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/license-qualification.html",
    "cta": "/conversion/hr-audit.html"
  },
  {
    "r": "/services/founder-shareholder-agreements.html",
    "id": "V05-SVC-001",
    "n": "Founder Pacts, Shareholder Agreements (SHA) & Share Purchase Agreements (SPA)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EDTECH",
      "KL-BND-CLINIC",
      "KL-BND-HOSPITALITY",
      "KL-BND-EXIM"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/ai-document-generator.html",
    "cta": "/conversion/contract-intake.html"
  },
  {
    "r": "/services/master-service-agreements.html",
    "id": "V05-SVC-002",
    "n": "Master Service Agreements (MSA), SOWs & Commercial Vendor Contracts",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/ai-document-generator.html",
    "cta": "/conversion/contract-intake.html"
  },
  {
    "r": "/services/ip-enforcement-cease-desist.html",
    "id": "V06-SVC-001",
    "n": "IP Enforcement & Cease and Desist Issuance",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/trademark-search.html",
    "cta": "/conversion/contract-intake.html"
  },
  {
    "r": "/services/software-copyright-patents.html",
    "id": "V06-SVC-002",
    "n": "Software Copyright, Source Code & Tech Patent Filings",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EDTECH",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/trademark-search.html",
    "cta": "/conversion/ppc-trademark-registration.html"
  },
  {
    "r": "/services/trademark-registration.html",
    "id": "V06-SVC-003",
    "n": "Brand Name, Logo & Slogan Trademark Registration (Form TM-A)",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/trademark-search.html",
    "cta": "/conversion/ppc-trademark-registration.html"
  },
  {
    "r": "/services/labour-code-handbooks.html",
    "id": "V07-SVC-001",
    "n": "Labour Code Healthcheck & Comprehensive Employee Handbooks",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/hr-audit.html",
    "cta": "/conversion/hr-audit.html"
  },
  {
    "r": "/services/posh-compliance.html",
    "id": "V07-SVC-002",
    "n": "Mandatory POSH Act Compliance & Internal Committee (IC) Setup",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/hr-audit.html",
    "cta": "/conversion/hr-audit.html"
  },
  {
    "r": "/services/fast-track-mergers.html",
    "id": "V09-SVC-001",
    "n": "Section 233 Fast-Track Parent-Subsidiary & Small Company Mergers",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/ma-advisory-enquiry.html",
    "cta": "/conversion/ma-advisory-enquiry.html"
  },
  {
    "r": "/services/slump-sale-asset-purchase.html",
    "id": "V09-SVC-002",
    "n": "Corporate Slump Sale & Business Asset Purchase Governance",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-HOSPITALITY",
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/ma-advisory-enquiry.html",
    "cta": "/conversion/ma-advisory-enquiry.html"
  },
  {
    "r": "/services/director-removal-board-disputes.html",
    "id": null,
    "n": "Director Removal, Vacation of Office & Board Control Litigation",
    "st": "REFERRAL_ONLY",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Referral-Only (Advocates Act Boundary)",
    "t": [
      "REFERRAL_ONLY"
    ],
    "tool": "/conversion/dispute-consultation.html",
    "cta": "/conversion/dispute-consultation.html"
  },
  {
    "r": "/services/nclt-insolvency-defense.html",
    "id": null,
    "n": "NCLT Corporate Insolvency Resolution Process (CIRP) Defense",
    "st": "REFERRAL_ONLY",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Referral-Only (Advocates Act Boundary)",
    "t": [
      "REFERRAL_ONLY"
    ],
    "tool": "/conversion/dispute-consultation.html",
    "cta": "/conversion/dispute-consultation.html"
  },
  {
    "r": "/services/nclt-merger-petitions.html",
    "id": "V09-SVC-003",
    "n": "NCLT Merger Petition & Complex Amalgamation Execution",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/ma-advisory-enquiry.html",
    "cta": "/conversion/ma-advisory-enquiry.html"
  },
  {
    "r": "/services/oppression-mismanagement-petitions.html",
    "id": null,
    "n": "Section 241 & 242 Oppression and Mismanagement Petitions",
    "st": "REFERRAL_ONLY",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "Referral-Only (Advocates Act Boundary)",
    "t": [
      "REFERRAL_ONLY"
    ],
    "tool": "/conversion/dispute-consultation.html",
    "cta": "/conversion/dispute-consultation.html"
  },
  {
    "r": "/services/board-governance-risk-assessment.html",
    "id": "V11-SVC-001",
    "n": "Internal Board Governance & Secretarial Health Check",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-HOSPITALITY",
      "GENERAL_CATALOG"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/secretarial-audit-scope.html",
    "cta": "/conversion/secretarial-audit-scope.html"
  },
  {
    "r": "/services/board-minutes.html",
    "id": "V11-SVC-002",
    "n": "Board Minutes & Statutory Registers Maintenance",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EXIM",
      "KL-BND-FOOD",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/retainer-desk.html",
    "cta": "/conversion/retainer-desk.html"
  },
  {
    "r": "/services/form-csr2.html",
    "id": "V11-SVC-003",
    "n": "Form CSR-2 Annual Corporate Social Responsibility Report",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/csr-audit-form.html",
    "cta": "/conversion/csr-audit-form.html"
  },
  {
    "r": "/services/form-mr3-secretarial-audit.html",
    "id": "V11-SVC-004",
    "n": "Mandatory Form MR-3 Secretarial Audit Services",
    "st": "ACTIVE_SERVICE",
    "b": [
      "GENERAL_CATALOG"
    ],
    "p": "General & Specialist Support",
    "t": [
      "SPECIALIST_SCOPED"
    ],
    "tool": "/conversion/secretarial-audit-scope.html",
    "cta": "/conversion/secretarial-audit-scope.html"
  },
  {
    "r": "/services/cyber-incident-reporting.html",
    "id": "V12-SVC-001",
    "n": "Cyber Incident Reporting, CERT-In & IT Act Statutory Mandates",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-EDTECH",
      "KL-BND-HOSPITALITY"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/dpdp-audit-request.html",
    "cta": "/conversion/dpdp-audit-request.html"
  },
  {
    "r": "/services/dpdp-compliance-audit.html",
    "id": "V12-SVC-002",
    "n": "DPDP Act Data Fiduciary Governance & Readiness Audit",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-CLINIC",
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/dpdp-audit-request.html",
    "cta": "/conversion/dpdp-audit-request.html"
  },
  {
    "r": "/services/saas-terms-privacy-architecture.html",
    "id": "V12-SVC-003",
    "n": "SaaS Terms of Service, EULAs & Privacy Architecture",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-HOSPITALITY",
      "KL-BND-EDTECH",
      "KL-BND-FOOD"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/dpdp-audit-request.html",
    "cta": "/conversion/dpdp-audit-request.html"
  },
  {
    "r": "/services/cross-border-tech-transfer.html",
    "id": "V13-SVC-001",
    "n": "Cross-Border Technology Transfer & Licensing Agreements",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM",
      "KL-BND-EDTECH"
    ],
    "p": "Phase 2: Put the Essentials in Place",
    "t": [
      "SETUP_PLUS_CONTRACTS"
    ],
    "tool": "/conversion/fema-consultation.html",
    "cta": "/conversion/cross-border-retainer.html"
  },
  {
    "r": "/services/form-fc3-fc4.html",
    "id": "V13-SVC-002",
    "n": "Form FC-3 / FC-4 Foreign Branch Office (BO) & Liaison Office (LO) Compliance",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM"
    ],
    "p": "Phase 1: Start Right",
    "t": [
      "ONE_TIME_SETUP"
    ],
    "tool": "/conversion/fema-consultation.html",
    "cta": "/conversion/fema-consultation.html"
  },
  {
    "r": "/services/rbi-fla-return.html",
    "id": "V13-SVC-003",
    "n": "RBI Foreign Liabilities and Assets (FLA) Return Filing",
    "st": "ACTIVE_SERVICE",
    "b": [
      "KL-BND-EXIM",
      "KL-BND-HOSPITALITY"
    ],
    "p": "Phase 3: Stay on Track",
    "t": [
      "ANNUAL_OR_MONTHLY_RETAINER"
    ],
    "tool": "/conversion/fema-consultation.html",
    "cta": "/conversion/cross-border-retainer.html"
  }
];

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
