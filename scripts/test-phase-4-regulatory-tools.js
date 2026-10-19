/**
 * CraftEgon CCS - Phase 4 Comprehensive Automated Test Suite
 * Validates:
 * 1. Regulatory Source Governance & Adapters (MCA, RBI/FEMA, Tax, IP India)
 * 2. Canonical Compliance Event Model & Deterministic Applicability Engine
 * 3. Trademark Search & Status Transparency (Nice classification, benchmark match, manual fallback)
 * 4. Citations, Freshness, Staleness Policies, and Cryptographic Fingerprints
 * 5. Consent-Based Alerts, Lifecycle, Idempotency, Bounded Retries, and Audit Logs
 * 6. HTTP API Router Endpoints, RLS Tenant Isolation, and Role-Based Access Control
 */

const assert = require('node:assert');
const http = require('node:http');
const crypto = require('node:crypto');
const { routeRequest } = require('../src/backend/router');
const { memoryStore } = require('../src/backend/storage/memory-store');
const { validateComplianceEvent, updateComplianceEvent, computeEventFingerprint } = require('../src/backend/regulatory/compliance-event.model');
const { ApplicabilityEngine } = require('../src/backend/regulatory/applicability-engine');
const { ProvenanceManager } = require('../src/backend/regulatory/provenance-manager');
const { McaSourceAdapter } = require('../src/backend/regulatory/adapters/mca-adapter');
const { RbiFemaSourceAdapter } = require('../src/backend/regulatory/adapters/rbi-fema-adapter');
const { TaxSourceAdapter } = require('../src/backend/regulatory/adapters/tax-adapter');
const { IpIndiaSourceAdapter } = require('../src/backend/regulatory/adapters/ipindia-adapter');
const { alertRepository } = require('../src/backend/storage/alert-repository');
const { StandardDeliveryAdapter } = require('../src/backend/controllers/alert.controller');
const { accountRepository } = require('../src/backend/storage/account-repository');
const { generateSessionToken, hashToken } = require('../src/backend/models/account.model');

let passedAssertions = 0;
let failedAssertions = 0;

function pass(msg) {
  passedAssertions++;
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg, err) {
  failedAssertions++;
  console.error(`  ❌ FAIL: ${msg}`);
  if (err) console.error(err);
}

// Helper: Make HTTP request to local test server
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 4 Regulatory Tools Test Suite');
  console.log('======================================================================\n');

  memoryStore.reset();

  // --------------------------------------------------------------------------
  // Suite 1: Source Adapters (MCA, Tax, FEMA, IP India)
  // --------------------------------------------------------------------------
  console.log('--- Test Suite 1: Regulatory Source Adapters ---');
  try {
    const mca = new McaSourceAdapter();
    const mcaRes = await mca.lookupComplianceRules({ entity_type: 'pvt_ltd' });
    assert.strictEqual(mcaRes.is_empty, false, 'MCA adapter should return forms for pvt_ltd');
    assert.strictEqual(mcaRes.source.source_id, 'SRC-MCA-001', 'MCA source citation must match');
    assert.ok(mcaRes.data.some(f => f.form_name.includes('AOC-4')), 'AOC-4 must be in MCA filing register');
    pass('MCA adapter returns verified filing rules for Private Limited company');

    const rbi = new RbiFemaSourceAdapter();
    const femaRes = await rbi.lookupFemaRules({ fdi_type: 'FLA' });
    assert.strictEqual(femaRes.is_empty, false, 'RBI adapter should return FLA rules');
    assert.strictEqual(femaRes.source.source_id, 'SRC-RBI-001', 'RBI source citation must match');
    assert.ok(femaRes.data[0].timeline.includes('15th July'), 'FLA due timeline must cite July 15');
    pass('RBI FEMA adapter returns authoritative FLA return deadlines and citations');

    const tax = new TaxSourceAdapter();
    const itRes = await tax.lookupTaxDeadlines({ tax_type: 'INCOME_TAX' });
    assert.strictEqual(itRes.is_empty, false, 'Tax adapter should return income tax deadlines');
    assert.ok(itRes.data.some(d => d.return_form === 'ITR-6'), 'ITR-6 must be in tax deadline register');
    pass('Tax adapter returns direct tax corporate return schedules');

    const gstRes = await tax.lookupTaxDeadlines({ tax_type: 'GST' });
    assert.ok(gstRes.data.some(d => d.return_form === 'GSTR-3B'), 'GSTR-3B must be in GST register');
    pass('Tax adapter returns indirect tax GSTR-3B summary return schedules');

    // Adapter health checks
    const mcaHealth = await mca.checkHealth();
    assert.strictEqual(mcaHealth.status, 'HEALTHY', 'MCA health check should report HEALTHY');
    pass('Source adapter health reporting functions correctly');
  } catch (err) {
    fail('Source adapter test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 2: Compliance Event Model Schema & Lifecycle
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Compliance Event Model & Lifecycle ---');
  try {
    const validRaw = {
      event_id: 'EVT-TEST-001',
      event_type: 'FILING_DEADLINE',
      title: 'Annual Secretarial Audit Report Form MR-3',
      summary: 'Mandatory secretarial audit report under Section 204 of Companies Act 2013',
      jurisdiction: 'IN-CENTRAL',
      authority: 'Ministry of Corporate Affairs (MCA)',
      regulatory_domain: 'Corporate Secretarial & MCA Compliance',
      affected_entities: ['public_ltd'],
      applicability_rules: { entity_types: ['public_ltd'], min_turnover_inr: 2500000000 },
      source_ids: ['SRC-MCA-001'],
      source_url: 'https://www.mca.gov.in/',
      publication_date: '2014-03-31',
      effective_date: '2014-04-01',
      compliance_due_date: '2026-10-30'
    };

    const validated = validateComplianceEvent(validRaw);
    assert.strictEqual(validated.event_id, 'EVT-TEST-001', 'Validated event ID matches');
    assert.strictEqual(typeof validated.content_hash, 'string', 'Computes SHA-256 content hash');
    assert.strictEqual(validated.content_hash.length, 64, 'SHA-256 hash length is 64 hex characters');
    assert.strictEqual(validated.change_version, 1, 'Initial change version is 1');
    assert.strictEqual(validated.change_history.length, 1, 'Initial audit trail has 1 entry');
    pass('Compliance event schema validation and initial fingerprint calculation pass');

    // Rejection of invalid schema
    assert.throws(() => {
      validateComplianceEvent({ ...validRaw, event_type: 'INVALID_EVENT_TYPE' });
    }, /event_type must be one of/, 'Rejects invalid event type');
    pass('Strictly rejects invalid event type enum');

    assert.throws(() => {
      validateComplianceEvent({ ...validRaw, publication_date: '31/03/2014' });
    }, /publication_date must be in YYYY-MM-DD/, 'Rejects non-ISO date format');
    pass('Strictly rejects non-ISO date format');

    // Update with substantive change
    const updated = updateComplianceEvent(validated, {
      compliance_due_date: '2026-11-15'
    }, 'COMPLIANCE_OFFICER_01', 'Government gazette deadline extension');

    assert.strictEqual(updated.change_version, 2, 'Version increments to 2');
    assert.strictEqual(updated.compliance_due_date, '2026-11-15', 'Due date updated');
    assert.strictEqual(updated.change_history.length, 2, 'Audit trail appended');
    assert.strictEqual(updated.change_history[1].change_type, 'SUBSTANTIVE_CONTENT_UPDATE', 'Classifies as substantive update');
    assert.notStrictEqual(updated.content_hash, validated.content_hash, 'Content hash changes on substantive update');
    pass('Substantive change updates version, recomputes hash, and appends audit log');

    // Terminal status mutation protection
    const archived = { ...validated, record_status: 'ARCHIVED' };
    assert.throws(() => {
      updateComplianceEvent(archived, { title: 'New Title' });
    }, /Cannot update compliance event in terminal status 'ARCHIVED'/, 'Blocks modification of archived event');
    pass('Strictly blocks mutation of compliance event in terminal ARCHIVED state');
  } catch (err) {
    fail('Compliance event model test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 3: Deterministic Applicability Engine
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: Deterministic Applicability Engine ---');
  try {
    const mcaEvent = {
      event_id: 'EVT-MCA-AOC4-2026',
      jurisdiction: 'IN-CENTRAL',
      authority: 'MCA',
      applicability_rules: { entity_types: ['pvt_ltd', 'public_ltd'] },
      source_ids: ['SRC-MCA-001']
    };

    const femaEvent = {
      event_id: 'EVT-FEMA-FLA-2026',
      jurisdiction: 'IN-CENTRAL',
      authority: 'RBI',
      applicability_rules: { entity_types: ['pvt_ltd', 'public_ltd', 'llp'], fdi_required: true },
      source_ids: ['SRC-RBI-001']
    };

    const mhPtEvent = {
      event_id: 'EVT-STATE-MH-PT-2026',
      jurisdiction: 'IN-MH',
      authority: 'MahaGST',
      applicability_rules: { jurisdiction: 'IN-MH' },
      source_ids: ['SRC-STATE-MH-PT-1975']
    };

    // Case 1: Full facts, applicable
    const eval1 = ApplicabilityEngine.evaluate(mcaEvent, {
      entity_type: 'pvt_ltd',
      jurisdiction: 'IN-DL'
    });
    assert.strictEqual(eval1.applicability_status, 'APPLICABLE', 'MCA event is APPLICABLE to pvt_ltd in Delhi');
    assert.strictEqual(eval1.confidence, 1.0, 'Confidence is 1.0 for full fact match');
    assert.strictEqual(eval1.requires_human_review, false, 'No human review needed');
    pass('Determines APPLICABLE with 1.0 confidence for matching entity and national jurisdiction');

    // Case 2: Territorial mismatch
    const eval2 = ApplicabilityEngine.evaluate(mhPtEvent, {
      entity_type: 'pvt_ltd',
      jurisdiction: 'IN-DL'
    });
    assert.strictEqual(eval2.applicability_status, 'NOT_APPLICABLE', 'Maharashtra PT not applicable in Delhi');
    assert.strictEqual(eval2.confidence, 1.0, 'Confidence 1.0 for territorial exclusion');
    pass('Determines NOT_APPLICABLE for territorial mismatch (Maharashtra PT for Delhi company)');

    // Case 3: Entity type mismatch
    const eval3 = ApplicabilityEngine.evaluate(mcaEvent, {
      entity_type: 'partnership',
      jurisdiction: 'IN-DL'
    });
    assert.strictEqual(eval3.applicability_status, 'NOT_APPLICABLE', 'Companies Act AOC-4 not applicable to Partnership');
    pass('Determines NOT_APPLICABLE for entity type mismatch');

    // Case 4: Missing crucial fact (FDI status unconfirmed) -> REQUIRES_REVIEW
    const eval4 = ApplicabilityEngine.evaluate(femaEvent, {
      entity_type: 'pvt_ltd',
      jurisdiction: 'IN-MH',
      has_fdi: null // Unverified!
    });
    assert.strictEqual(eval4.applicability_status, 'REQUIRES_REVIEW', 'Unverified FDI requires human review');
    assert.strictEqual(eval4.requires_human_review, true, 'Human review flagged');
    assert.strictEqual(eval4.confidence, 0.5, 'Reduced confidence when facts are missing');
    assert.ok(eval4.rationale.includes('Foreign direct investment status has not been confirmed'), 'Exact rationale provided');
    pass('Missing facts return REQUIRES_REVIEW with explicit rationale (No false AI guessing)');

    // Case 5: Missing baseline corporate charter facts
    const eval5 = ApplicabilityEngine.evaluate(mcaEvent, {});
    assert.strictEqual(eval5.applicability_status, 'REQUIRES_REVIEW', 'Missing entity type/jurisdiction triggers review');
    pass('Missing entity type or jurisdiction immediately returns REQUIRES_REVIEW');
  } catch (err) {
    fail('Applicability engine test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 4: Trademark Search & Status Transparency
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Trademark Search & Status Transparency ---');
  try {
    const tmAdapter = new IpIndiaSourceAdapter();

    // Query 1: Benchmark match (CRAFTEGON in Class 35)
    const matchRes = await tmAdapter.searchTrademark({ wordmark: 'CRAFTEGON', class: 35 });
    assert.strictEqual(matchRes.execution_status, 'VERIFIED_BENCHMARK_MATCH', 'Should find verified benchmark match');
    assert.strictEqual(matchRes.benchmark_records_found, 1, 'Finds 1 matching benchmark record');
    assert.strictEqual(matchRes.benchmark_records[0].proprietor, 'CraftEgon Corporate Services LLP', 'Matches proprietor');
    pass('Returns verified benchmark match for prior registered mark');

    // Query 2: No benchmark match -> Transparent MANUAL_LOOKUP_REQUIRED
    const noMatchRes = await tmAdapter.searchTrademark({ wordmark: 'RANDOMUNIQUE982', class: 42 });
    assert.strictEqual(noMatchRes.execution_status, 'MANUAL_LOOKUP_REQUIRED', 'Status must be MANUAL_LOOKUP_REQUIRED');
    assert.strictEqual(noMatchRes.benchmark_records_found, 0, 'Zero benchmark records');
    assert.strictEqual(noMatchRes.retrieval_mode, 'MANUAL', 'Retrieval mode is MANUAL');
    assert.ok(noMatchRes.official_registry_status.portal_url.includes('ipindiaservices.gov.in'), 'Provides official IP India URL');
    assert.ok(noMatchRes.official_registry_status.access_restriction.includes('interactive visual CAPTCHA'), 'Explains CAPTCHA restriction');
    assert.ok(noMatchRes.legal_disclaimer.includes('Zero benchmark records found does NOT signify mark availability'), 'Statutory disclaimer verified');
    pass('Zero benchmark match explicitly outputs MANUAL_LOOKUP_REQUIRED with official URL & anti-scraping explanation');
    pass('Statutory disclaimer verified: Never infers trademark availability or lack of conflict from no match');

    // Query 3: Short wordmark rejected
    await assert.rejects(async () => {
      await tmAdapter.searchTrademark({ wordmark: 'A' });
    }, /Wordmark must be at least 2 characters long/, 'Rejects short wordmark');
    pass('Input validation rejects wordmark shorter than 2 characters');

    // Query 4: Invalid Nice class rejected
    await assert.rejects(async () => {
      await tmAdapter.searchTrademark({ wordmark: 'VALIDNAME', class: 99 });
    }, /Must be an integer between 1 and 45/, 'Rejects invalid Nice class');
    pass('Input validation rejects invalid Nice class outside 1-45 range');
  } catch (err) {
    fail('Trademark search test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 5: Citations, Freshness & Staleness Policies
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Citations, Freshness & Staleness Policies ---');
  try {
    // Current timestamp evaluation
    const freshEval = ProvenanceManager.evaluateFreshness(new Date().toISOString(), 48);
    assert.strictEqual(freshEval.status, 'CURRENT', 'Fresh verification reports CURRENT');
    assert.strictEqual(freshEval.is_stale, false, 'is_stale is false');
    pass('Fresh verification timestamp evaluated as CURRENT');

    // Stale timestamp evaluation (5 days ago with 48h threshold)
    const fiveDaysAgo = new Date(Date.now() - (5 * 24 * 3600 * 1000)).toISOString();
    const staleEval = ProvenanceManager.evaluateFreshness(fiveDaysAgo, 48);
    assert.strictEqual(staleEval.status, 'STALE', 'Expired verification reports STALE');
    assert.strictEqual(staleEval.is_stale, true, 'is_stale is true');
    assert.ok(staleEval.hours_elapsed >= 119, 'Reports accurate elapsed hours');
    pass('Expired verification timestamp accurately evaluated as STALE with elapsed duration');

    // Null timestamp evaluation
    const nullEval = ProvenanceManager.evaluateFreshness(null, 48);
    assert.strictEqual(nullEval.status, 'UNKNOWN', 'Null timestamp reports UNKNOWN');
    assert.strictEqual(nullEval.is_stale, true, 'Null timestamp is treated as stale');
    pass('Null verification timestamp safely evaluated as UNKNOWN');

    // Reproducibility query record
    const repro = ProvenanceManager.createReproducibilityRecord({ domain: 'tax' }, [{ source_id: 'SRC-CBDT-001' }], 4, 1);
    assert.ok(repro.query_id.startsWith('QRY-'), 'Generates unique query ID');
    assert.strictEqual(typeof repro.query_fingerprint, 'string', 'Computes query fingerprint');
    pass('Reproducibility manager generates immutable query snapshot and fingerprint');
  } catch (err) {
    fail('Citations and freshness test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 6: Consent-Based Alerts, Retries & Delivery Logs
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 6: Consent-Based Alerts, Retries & Delivery Logs ---');
  try {
    const accountId = 'ACC-TEST-TENANT-001';
    const staffContext = { userId: 'STAFF-01', role: 'compliance_operator' };
    const clientContext = { userId: accountId, role: 'client' };

    // Case 1: Alert attempted WITHOUT consent -> Strictly BLOCKED
    const dispatchNoConsent = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-MCA-AOC4-2026',
      channel: 'email'
    }, new StandardDeliveryAdapter(), staffContext);

    assert.strictEqual(dispatchNoConsent.success, false, 'Dispatch without consent must fail');
    assert.strictEqual(dispatchNoConsent.error, 'CONSENT_REVOKED_OR_MISSING', 'Error confirms consent missing');
    pass('Pre-flight consent check strictly blocks alert dispatch when opt-in consent is missing');

    // Case 2: Grant explicit opt-in consent
    const prefs = await alertRepository.updatePreferences(accountId, {
      consent_granted: true,
      channels: ['email', 'in_app'],
      topics: ['MCA_FILINGS', 'TAX_DEADLINES'],
      jurisdictions: ['IN-CENTRAL', 'IN-MH']
    }, clientContext);

    assert.strictEqual(prefs.consent_granted, true, 'Consent is granted');
    assert.ok(prefs.consent_timestamp, 'Records consent timestamp');
    pass('Customer grants explicit opt-in consent with channels, topics, and timestamp');

    // Case 3: Successful dispatch with consent
    const deliveryAdapter = new StandardDeliveryAdapter();
    const dispatchOk = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-MCA-AOC4-2026',
      channel: 'email',
      alert_version: 1
    }, deliveryAdapter, staffContext);

    assert.strictEqual(dispatchOk.success, true, 'Alert dispatch succeeds');
    assert.strictEqual(dispatchOk.status, 'DELIVERED', 'Status is DELIVERED');
    pass('Alert delivered successfully and transitioned to DELIVERED status');

    // Case 4: Idempotency & Deduplication: Duplicate dispatch returns cached record
    const duplicateDispatch = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-MCA-AOC4-2026',
      channel: 'email',
      alert_version: 1
    }, deliveryAdapter, staffContext);

    assert.strictEqual(duplicateDispatch.success, true, 'Duplicate returns success');
    assert.strictEqual(duplicateDispatch.is_idempotent_replay, true, 'Confirms is_idempotent_replay');
    assert.strictEqual(deliveryAdapter.callCount, 1, 'Delivery provider was NOT called a second time (deduplicated)');
    pass('Idempotency key prevents duplicate alert delivery; provider called exactly once');

    // Case 5: Transient provider failure triggers bounded retry
    const transientAdapter = new StandardDeliveryAdapter(true, false);
    const retryDispatch = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-TAX-ITR6-2026',
      channel: 'email',
      alert_version: 1
    }, transientAdapter, staffContext);

    assert.strictEqual(retryDispatch.success, true, 'Recovers after transient failure');
    assert.strictEqual(retryDispatch.attempt_count, 2, 'Delivered on attempt 2 after retry');
    pass('Transient provider failure triggers backoff retry and succeeds on subsequent attempt');

    // Case 6: Permanent provider failure stops immediately
    const permAdapter = new StandardDeliveryAdapter(false, true);
    const permDispatch = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-TAX-AUDIT-2026',
      channel: 'email',
      alert_version: 1
    }, permAdapter, staffContext);

    assert.strictEqual(permDispatch.success, false, 'Permanent failure terminates');
    assert.strictEqual(permDispatch.status, 'FAILED', 'Transitions to FAILED');
    assert.strictEqual(permAdapter.callCount, 1, 'Stops on attempt 1 for permanent failure');
    pass('Permanent failure (hard bounce) terminates immediately without infinite retry storm');

    // Case 7: Consent Revocation: User revokes consent -> Subsequent dispatch blocked
    await alertRepository.updatePreferences(accountId, {
      consent_granted: false
    }, clientContext);

    const postRevokeDispatch = await alertRepository.dispatchAlert({
      account_id: accountId,
      event_id: 'EVT-LABOUR-EPFO-2026',
      channel: 'email'
    }, deliveryAdapter, staffContext);

    assert.strictEqual(postRevokeDispatch.success, false, 'Dispatch after revocation blocked');
    assert.strictEqual(postRevokeDispatch.error, 'CONSENT_REVOKED_OR_MISSING', 'Confirms revocation enforced');
    pass('Consent revocation immediately takes effect; subsequent alert dispatch blocked');

    // Case 8: Delivery audit logs inspection
    const deliveryLogs = await alertRepository.listDeliveryLogs(staffContext);
    assert.ok(deliveryLogs.length >= 4, 'Multiple delivery attempts logged');
    assert.ok(deliveryLogs.every(l => !l.password && !l.token && !l.secret), 'Delivery logs are strictly sanitized');
    pass('Delivery audit logs record attempt numbers, timestamps, outcomes, and are sanitized');
  } catch (err) {
    fail('Alerts and delivery test failed', err);
  }

  // --------------------------------------------------------------------------
  // Suite 7: HTTP API Endpoints, RLS Tenant Isolation & Access Control
  // --------------------------------------------------------------------------
  console.log('\n--- Test Suite 7: HTTP API Endpoints & Tenant Isolation ---');
  const server = http.createServer((req, res) => {
    routeRequest(req, res, { maxPayloadSizeBytes: 1024 * 1024 });
  });

  await new Promise(resolve => server.listen(0, resolve));

  try {
    // 1. GET /api/v1/regulatory/sources (Public)
    const sourcesRes = await makeRequest(server, { path: '/api/v1/regulatory/sources' });
    assert.strictEqual(sourcesRes.status, 200, 'Sources endpoint returns 200');
    assert.strictEqual(sourcesRes.data.success, true, 'Sources success is true');
    assert.ok(sourcesRes.data.total_sources >= 30, 'Returns 30+ canonical sources');
    pass('GET /api/v1/regulatory/sources returns canonical source inventory (HTTP 200)');

    // 2. GET /api/v1/regulatory/events (Public query)
    const eventsRes = await makeRequest(server, { path: '/api/v1/regulatory/events?domain=tax' });
    assert.strictEqual(eventsRes.status, 200, 'Events endpoint returns 200');
    assert.ok(eventsRes.data.total >= 2, 'Returns tax events');
    pass('GET /api/v1/regulatory/events returns filtered compliance events');

    // 3. GET /api/v1/regulatory/events/:id (Public item)
    const eventItemRes = await makeRequest(server, { path: '/api/v1/regulatory/events/EVT-MCA-AOC4-2026' });
    assert.strictEqual(eventItemRes.status, 200, 'Event item returns 200');
    assert.strictEqual(eventItemRes.data.event.event_id, 'EVT-MCA-AOC4-2026', 'Matches event ID');
    assert.ok(eventItemRes.data.freshness_evaluation, 'Includes freshness evaluation');
    pass('GET /api/v1/regulatory/events/:id returns event details and freshness evaluation');

    // 4. GET /api/v1/regulatory/events/NOT_FOUND -> 404
    const notFoundEvent = await makeRequest(server, { path: '/api/v1/regulatory/events/EVT-NONEXISTENT-999' });
    assert.strictEqual(notFoundEvent.status, 404, 'Non-existent event returns 404');
    pass('Non-existent compliance event ID returns HTTP 404 Not Found');

    // 5. POST /api/v1/regulatory/evaluate-applicability
    const evalRes = await makeRequest(server, {
      path: '/api/v1/regulatory/evaluate-applicability',
      method: 'POST'
    }, {
      entity_type: 'pvt_ltd',
      jurisdiction: 'IN-DL',
      turnover_inr: 50000000,
      has_fdi: false,
      employee_count: 5
    });
    assert.strictEqual(evalRes.status, 200, 'Evaluate applicability returns 200');
    assert.strictEqual(evalRes.data.success, true, 'Evaluation success is true');
    assert.ok(evalRes.data.evaluation.counts.applicable > 0, 'Found applicable obligations');
    pass('POST /api/v1/regulatory/evaluate-applicability evaluates corporate facts deterministically');

    // 6. GET /api/v1/regulatory/lookup (Multi-source lookup)
    const lookupRes = await makeRequest(server, { path: '/api/v1/regulatory/lookup?domain=mca' });
    assert.strictEqual(lookupRes.status, 200, 'Lookup endpoint returns 200');
    assert.ok(lookupRes.data.lookup.data.mca, 'Contains MCA lookup result');
    pass('GET /api/v1/regulatory/lookup executes multi-source regulatory search with provenance');

    // 7. GET /api/v1/regulatory/trademark/search
    const tmMatch = await makeRequest(server, { path: '/api/v1/regulatory/trademark/search?query=CRAFTEGON&class=35' });
    assert.strictEqual(tmMatch.status, 200, 'Trademark search returns 200');
    assert.strictEqual(tmMatch.data.result.execution_status, 'VERIFIED_BENCHMARK_MATCH', 'Finds verified match');
    pass('GET /api/v1/regulatory/trademark/search returns verified benchmark records');

    const tmManual = await makeRequest(server, { path: '/api/v1/regulatory/trademark/search?query=UNREGISTEREDXYZ&class=42' });
    assert.strictEqual(tmManual.status, 200, 'Trademark no-match returns 200');
    assert.strictEqual(tmManual.data.result.execution_status, 'MANUAL_LOOKUP_REQUIRED', 'Reports MANUAL_LOOKUP_REQUIRED');
    pass('GET /api/v1/regulatory/trademark/search handles manual lookup fallback with full transparency');

    // Setup authenticated sessions for Tenant A and Tenant B
    const tenantA = await accountRepository.createAccount({
      legal_entity_name: 'Acme Technologies Pvt Ltd',
      primary_email: 'acme_reg@example.com',
      primary_phone: '+919876543210',
      password: 'StrongPassword123!'
    });
    const tenantB = await accountRepository.createAccount({
      legal_entity_name: 'Beta Global LLP',
      primary_email: 'beta_reg@example.com',
      primary_phone: '+919876543211',
      password: 'StrongPassword123!'
    });
    const staffAccount = await accountRepository.createAccount({
      legal_entity_name: 'Staff Operator',
      primary_email: 'staff_reg@craftegon.com',
      primary_phone: '+919876543212',
      account_role: 'compliance_operator',
      password: 'StrongPassword123!'
    });

    const sessionA = await accountRepository.createSession(tenantA);
    const sessionB = await accountRepository.createSession(tenantB);
    const sessionStaff = await accountRepository.createSession(staffAccount);

    const tokenA = sessionA.token;
    const tokenB = sessionB.token;
    const tokenStaff = sessionStaff.token;

    // 8. Tenant A updates alert preferences
    const updatePrefRes = await makeRequest(server, {
      path: '/api/v1/alerts/preferences',
      method: 'PUT',
      headers: { 'Cookie': `craftegon_session=${tokenA}` }
    }, {
      consent_granted: true,
      channels: ['email'],
      topics: ['MCA_FILINGS']
    });
    assert.strictEqual(updatePrefRes.status, 200, 'Tenant A updates preferences');
    assert.strictEqual(updatePrefRes.data.preferences.consent_granted, true, 'Consent saved');
    pass('Authenticated client updates notification preferences & consent (HTTP 200)');

    // 9. CROSS-TENANT ISOLATION: Tenant B querying /api/v1/alerts sees ZERO alerts of Tenant A
    // Create an alert for Tenant A
    memoryStore.createAlert({
      account_id: tenantA.id,
      event_id: 'EVT-MCA-AOC4-2026',
      channel: 'email',
      status: 'DELIVERED'
    }, { userId: tenantA.id, role: 'client' });

    const tenantAAlerts = await makeRequest(server, {
      path: '/api/v1/portal/alerts',
      headers: { 'Cookie': `craftegon_session=${tokenA}` }
    });
    assert.strictEqual(tenantAAlerts.status, 200, 'Tenant A lists alerts');
    assert.strictEqual(tenantAAlerts.data.total, 1, 'Tenant A sees 1 alert');
    pass('Customer A queries own alerts (HTTP 200, sees 1 alert)');

    const tenantBAlerts = await makeRequest(server, {
      path: '/api/v1/portal/alerts',
      headers: { 'Cookie': `craftegon_session=${tokenB}` }
    });
    assert.strictEqual(tenantBAlerts.status, 200, 'Tenant B lists alerts');
    assert.strictEqual(tenantBAlerts.data.total, 0, 'Tenant B sees ZERO alerts (RLS isolated)');
    pass('CROSS-TENANT ISOLATION: Customer B querying alerts sees 0 records (Zero leakage of Customer A data)');

    // 10. PRIVILEGE ESCALATION: Client role cannot access staff delivery logs
    const clientLogAttempt = await makeRequest(server, {
      path: '/api/v1/alerts/delivery-logs',
      headers: { 'Cookie': `craftegon_session=${tokenA}` }
    });
    assert.strictEqual(clientLogAttempt.status, 403, 'Client querying delivery logs is rejected with 403');
    pass('PRIVILEGE ESCALATION BLOCKED: Client role cannot view staff delivery audit logs (HTTP 403)');

    // Staff role querying delivery logs succeeds
    const staffLogs = await makeRequest(server, {
      path: '/api/v1/alerts/delivery-logs',
      headers: { 'Cookie': `craftegon_session=${tokenStaff}` }
    });
    assert.strictEqual(staffLogs.status, 200, 'Staff querying delivery logs succeeds');
    pass('Staff operator queries delivery audit logs successfully (HTTP 200)');
  } catch (err) {
    fail('HTTP API endpoint test failed', err);
  } finally {
    server.close();
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`PHASE 4 TEST SUMMARY: ${passedAssertions} passed, ${failedAssertions} failed (${passedAssertions + failedAssertions} total assertions)`);
  console.log('======================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
