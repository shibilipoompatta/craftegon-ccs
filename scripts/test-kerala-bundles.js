/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - KERALA VERTICAL BUNDLES TEST SUITE
 * ============================================================================
 * Phase 1 Verification:
 * 1. Validates data/kerala-bundles.json strictly against data/schemas/kerala-bundles.schema.json (Ajv 2020-12)
 * 2. Verifies 100% referential integrity against data/service-registry.json & data/verticals.json
 * 3. Verifies milestone rule keys exist in portal/dashboard.html STATUTORY_DEADLINES
 * 4. Verifies relatedDiagnosticRoutes & calculator tabs exist cleanly on disk
 * 5. Enforces regulatory & pricing governance hygiene (PENDING_OWNER_REVIEW, fee separation, no guaranteed approval claims)
 * 6. Confirms parity between data/kerala-bundles.json and assets/js/kerala-bundles.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');

let total = 0;
let passed = 0;

function check(condition, label) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${label}`);
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('CRAFTEGON CCS: PHASE 1 KERALA BUNDLES DATA & INTEGRITY AUDIT');
console.log('================================================================\n');

const schemaPath = path.join(ROOT, 'data', 'schemas', 'kerala-bundles.schema.json');
const dataPath = path.join(ROOT, 'data', 'kerala-bundles.json');
const runtimeModulePath = path.join(ROOT, 'assets', 'js', 'kerala-bundles.js');
const serviceRegistryPath = path.join(ROOT, 'data', 'service-registry.json');
const verticalsPath = path.join(ROOT, 'data', 'verticals.json');
const dashboardPath = path.join(ROOT, 'portal', 'dashboard.html');
const calculatorHtmlPath = path.join(ROOT, 'conversion', 'calculator.html');

check(fs.existsSync(schemaPath), 'Schema file exists at data/schemas/kerala-bundles.schema.json');
check(fs.existsSync(dataPath), 'Bundle dataset exists at data/kerala-bundles.json');
check(fs.existsSync(runtimeModulePath), 'Browser/Node runtime accessor exists at assets/js/kerala-bundles.js');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const runtimeModule = require(runtimeModulePath);
const serviceRegistry = JSON.parse(fs.readFileSync(serviceRegistryPath, 'utf8'));
const verticals = JSON.parse(fs.readFileSync(verticalsPath, 'utf8'));
const dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');
const calculatorHtml = fs.readFileSync(calculatorHtmlPath, 'utf8');

// 1. Strict JSON Schema Validation via Ajv Draft 2020-12
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const schemaValid = validate(dataset);
if (!schemaValid) {
  console.error('Schema validation errors:', validate.errors);
}
check(schemaValid, 'data/kerala-bundles.json strictly conforms to kerala-bundles.schema.json');
check(dataset.bundles.length === 5, 'Dataset defines all 5 mandatory Kerala vertical bundles');

const validServiceIds = new Set(serviceRegistry.map(s => s.service_id).filter(Boolean));
const validVerticalIds = new Set(verticals.map(v => v.vertical_id).filter(Boolean));

// 2. Cross-Reference, Route & Hygiene Integrity
const expectedIds = new Set([
  'KL-BND-CLINIC',
  'KL-BND-EXIM',
  'KL-BND-FOOD',
  'KL-BND-HOSPITALITY',
  'KL-BND-EDTECH'
]);

const seenIds = new Set();
const seenSlugs = new Set();

for (const bundle of dataset.bundles) {
  check(!seenIds.has(bundle.id), `Unique bundle ID: ${bundle.id}`);
  check(!seenSlugs.has(bundle.slug), `Unique bundle slug: ${bundle.slug}`);
  seenIds.add(bundle.id);
  seenSlugs.add(bundle.slug);

  // Entity options referential integrity
  for (const opt of bundle.entityAndPreLaunchStack.entityOptions) {
    check(validServiceIds.has(opt.serviceId), `${bundle.id} entity option ${opt.serviceId} exists in service-registry.json`);
  }

  // Linked Service IDs referential integrity
  for (const svcId of bundle.catalogCrossReferences.linkedServiceIds) {
    check(validServiceIds.has(svcId), `${bundle.id} linkedServiceId ${svcId} exists in service-registry.json`);
  }

  // Primary Vertical IDs referential integrity
  for (const vId of bundle.catalogCrossReferences.primaryVerticalIds) {
    check(validVerticalIds.has(vId), `${bundle.id} primaryVerticalId ${vId} exists in verticals.json`);
  }

  // Calculator tab IDs exist in conversion/calculator.html
  for (const tab of bundle.catalogCrossReferences.calculatorTabs) {
    check(calculatorHtml.includes(`id="${tab.tabId}"`), `${bundle.id} calculator tab #${tab.tabId} exists in conversion/calculator.html`);
  }

  // Dashboard milestone rules exist in portal/dashboard.html STATUTORY_DEADLINES
  for (const ruleForm of bundle.catalogCrossReferences.dashboardMilestoneRules) {
    check(dashboardHtml.includes(`form: '${ruleForm}'`), `${bundle.id} milestone rule '${ruleForm}' exists in portal/dashboard.html`);
  }

  // Related diagnostic routes exist on disk (strip #hash)
  for (const route of bundle.catalogCrossReferences.relatedDiagnosticRoutes) {
    const cleanRel = route.split('#')[0].replace(/^\//, '');
    check(fs.existsSync(path.join(ROOT, cleanRel)), `${bundle.id} diagnostic route ${route} exists on disk`);
  }

  // Commercial approval & regulatory hygiene checks
  for (const tier of bundle.pricingTiers) {
    check(tier.commercialApprovalState === 'PENDING_OWNER_REVIEW', `${bundle.id} tier ${tier.tierId} preserves PENDING_OWNER_REVIEW gate`);
    check(!/₹|\bINR\s*[\d,]+/i.test(tier.publicQuoteMode), `${bundle.id} tier ${tier.tierId} publicQuoteMode leaks no unapproved rupee figure`);
  }

  const hygieneText = JSON.stringify(bundle.regulatoryHygiene);
  check(!/guaranteed approval|100% guaranteed/i.test(hygieneText), `${bundle.id} contains no guaranteed statutory approval claims`);
}

check(expectedIds.size === seenIds.size && [...expectedIds].every(id => seenIds.has(id)), 'All 5 expected bundle IDs present');

// 3. Parity with assets/js/kerala-bundles.js
const runtimeBundles = runtimeModule.getAllBundles();
check(runtimeBundles.length === dataset.bundles.length, 'Runtime JS module exports exact same bundle count (5)');

for (const bundle of dataset.bundles) {
  const rt = runtimeModule.getBundleBySlug(bundle.slug);
  check(Boolean(rt), `Runtime lookup getBundleBySlug('${bundle.slug}') succeeds`);
  if (rt) {
    check(rt.id === bundle.id, `${bundle.id} runtime ID matches JSON`);
    check(JSON.stringify(rt.linkedServiceIds) === JSON.stringify(bundle.catalogCrossReferences.linkedServiceIds), `${bundle.id} linkedServiceIds match JSON`);
    check(JSON.stringify(rt.dashboardMilestoneRules) === JSON.stringify(bundle.catalogCrossReferences.dashboardMilestoneRules), `${bundle.id} dashboardMilestoneRules match JSON`);
  }
}

console.log('\n================================================================');
console.log(`PHASE 1 KERALA BUNDLES AUDIT: ${passed} / ${total} PASSED`);
console.log('================================================================');
if (passed !== total) {
  process.exit(1);
}
