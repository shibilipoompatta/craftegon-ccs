/**
 * CraftEgon CCS - Lead Intake Prototype Automated Test Suite (Harden v2)
 * 
 * Verifies:
 * 1. Safe Direct-Connection Strategy & Anti-Spoofing of X-Forwarded-For.
 * 2. Strict Service ID <-> Vertical ID Relational Integrity (Phase 2 canonical alignment).
 * 3. Referral-Only Route Rejection (Advocates Act 1961 compliance).
 * 4. Safe Payload Size & Stream Management (immediate memory dump, socket destruction).
 * 5. Concurrent Duplicate Submissions & Idempotency Race Handling.
 * 6. Privacy Protection & Zero Secret / Token / Path Leakage in Audit Logs and Responses.
 * 7. Malformed JSON & Unexpected Error Shielding (zero stack traces).
 * 
 * Local test execution only - 100% synthetic test fixtures.
 */

const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert');
const {
  resolveClientIp,
  validateLeadPayload,
  checkSpamAndBot,
  checkRateLimit,
  checkIdempotency,
  maskPII,
  processLeadSubmission,
  handleLeadSubmission,
  createLeadServer,
  _stores
} = require('../src/backend/lead-intake-prototype.js');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('======================================================================');
console.log('CraftEgon CCS - Lead Intake Prototype Security & Remediation Test Suite');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// Suite 1: Input Validation, Schema & Phase 2 Relational Integrity
// ---------------------------------------------------------------------------
console.log('--- Test Suite 1: Input Validation, Relational Integrity & Referral Boundaries ---');

it('Accepts a fully populated, valid lead submission with matching service and vertical (V01-SVC-007 and V01)', () => {
  const result = validateLeadPayload({
    contact_name: 'Vikram Malhotra',
    email: 'vikram.m@zenithholdings.co.in',
    phone: '+91 98201 12345',
    entity_name: 'Zenith Holdings Private Limited',
    service_id: 'V01-SVC-007',
    vertical_id: 'V01',
    scope_description: 'Fast-track corporate incorporation with foreign FDI investment.',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, true, `Errors: ${JSON.stringify(result.errors)}`);
  assert.strictEqual(result.errors.length, 0);
});

it('Accepts a valid minimal submission with only required fields', () => {
  const result = validateLeadPayload({
    contact_name: 'Priya Iyer',
    email: 'priya.iyer@gmail.com',
    phone: '9845012345',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, true);
});

it('Rejects submission with missing contact_name', () => {
  const result = validateLeadPayload({
    email: 'test@example.com',
    phone: '9845012345',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'contact_name'));
});

it('Rejects contact_name exceeding 100 characters', () => {
  const result = validateLeadPayload({
    contact_name: 'A'.repeat(101),
    email: 'test@example.com',
    phone: '9845012345',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'contact_name'));
});

it('Rejects invalid email format', () => {
  const invalidEmails = ['invalid-email', 'missing@domain', '@nodomain.com', 'spaces in@email.com'];
  for (const email of invalidEmails) {
    const result = validateLeadPayload({
      contact_name: 'Test Name',
      email,
      phone: '9845012345',
      consent_agreed: true
    });
    assert.strictEqual(result.valid, false, `Expected failure for email: ${email}`);
    assert(result.errors.some(e => e.field === 'email'));
  }
});

it('Rejects invalid Indian phone numbers', () => {
  const invalidPhones = ['12345', '1234567890', '09845012345', '+1 555 123 4567', 'abcdefghij'];
  for (const phone of invalidPhones) {
    const result = validateLeadPayload({
      contact_name: 'Test Name',
      email: 'test@example.com',
      phone,
      consent_agreed: true
    });
    assert.strictEqual(result.valid, false, `Expected failure for phone: ${phone}`);
    assert(result.errors.some(e => e.field === 'phone'));
  }
});

it('Rejects submission without explicit DPDP consent', () => {
  const result = validateLeadPayload({
    contact_name: 'Test Name',
    email: 'test@example.com',
    phone: '9845012345',
    consent_agreed: false
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'consent_agreed'));
});

it('Rejects unknown service_id not present in Phase 2 registry', () => {
  const result = validateLeadPayload({
    contact_name: 'Test Name',
    email: 'test@example.com',
    phone: '9845012345',
    service_id: 'SRV-UNKNOWN-999',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'service_id'));
});

it('Rejects unknown vertical_id not present in Phase 2 verticals', () => {
  const result = validateLeadPayload({
    contact_name: 'Test Name',
    email: 'test@example.com',
    phone: '9845012345',
    vertical_id: 'V99',
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'vertical_id'));
});

it('REMEDIATION FIX: Rejects mismatched service_id and vertical_id (V01-SVC-007 with V08)', () => {
  const result = validateLeadPayload({
    contact_name: 'Test Name',
    email: 'test@example.com',
    phone: '9845012345',
    service_id: 'V01-SVC-007', // Private Limited Registration (Primary: V01)
    vertical_id: 'V08',        // Intellectual Property (Mismatch!)
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'vertical_id' && e.issue.includes('does not match service')));
});

it('REMEDIATION FIX: Rejects intake originating from referral-only routes (/services/nclt-insolvency-defense.html)', () => {
  const referralRoutes = [
    '/services/nclt-insolvency-defense.html',
    '/services/director-removal-board-disputes.html',
    '/services/oppression-mismanagement-petitions.html',
    '/services/commercial-disputes-litigation.html'
  ];

  for (const route of referralRoutes) {
    const result = validateLeadPayload({
      contact_name: 'Litigation Inquirer',
      email: 'litigation@example.com',
      phone: '9845012345',
      source_url: route,
      consent_agreed: true
    });
    assert.strictEqual(result.valid, false, `Expected rejection for referral route: ${route}`);
    assert(result.errors.some(e => e.field === 'source_url' && e.issue.includes('Direct self-serve intake is not available')));
  }
});

it('Accepts valid active transactional services with strike-off or tribunal keywords (V02-SVC-013, V02-SVC-015, V09-SVC-003)', () => {
  const activeCases = [
    { service_id: 'V02-SVC-013', vertical_id: 'V02', source_url: '/services/form-stk2-strike-off.html' },
    { service_id: 'V02-SVC-015', vertical_id: 'V02', source_url: '/services/llp-form24-strike-off.html' },
    { service_id: 'V09-SVC-003', vertical_id: 'V09', source_url: '/services/nclt-merger-petitions.html' }
  ];

  for (const item of activeCases) {
    const result = validateLeadPayload({
      contact_name: 'Corporate Secretary',
      email: 'compliance@example.com',
      phone: '9845012345',
      service_id: item.service_id,
      vertical_id: item.vertical_id,
      source_url: item.source_url,
      consent_agreed: true
    });
    assert.strictEqual(result.valid, true, `Expected active service ${item.service_id} to pass, but got errors: ${JSON.stringify(result.errors)}`);
  }
});

it('Rejects scope_description exceeding 2000 characters', () => {
  const result = validateLeadPayload({
    contact_name: 'Test Name',
    email: 'test@example.com',
    phone: '9845012345',
    scope_description: 'X'.repeat(2001),
    consent_agreed: true
  });
  assert.strictEqual(result.valid, false);
  assert(result.errors.some(e => e.field === 'scope_description'));
});

// ---------------------------------------------------------------------------
// Suite 2: Anti-Spam & Bot Detection
// ---------------------------------------------------------------------------
console.log('\n--- Test Suite 2: Anti-Spam & Automated Bot Detection ---');

it('Detects honeypot trap when _hp_website is populated by bot', () => {
  const result = checkSpamAndBot({
    contact_name: 'Bot Runner',
    email: 'spammer@auto-leads.xyz',
    phone: '9845012345',
    _hp_website: 'https://spam-seo-promo.com'
  });
  assert.strictEqual(result.isSpam, true);
  assert.strictEqual(result.reason, 'SPAM_HONEYPOT_TRIGGERED');
});

it('Detects bot submission occurring faster than human threshold (<2s)', () => {
  const now = Date.now();
  const result = checkSpamAndBot({
    contact_name: 'Rapid Submitter',
    email: 'fast@bot.com',
    phone: '9845012345',
    _t_token: String(now - 800) // 800ms between render and submit
  });
  assert.strictEqual(result.isSpam, true);
  assert.strictEqual(result.reason, 'SPAM_SUBMISSION_TOO_FAST');
});

it('Allows genuine human submission with empty honeypot and normal speed (>2s)', () => {
  const now = Date.now();
  const result = checkSpamAndBot({
    contact_name: 'Human User',
    email: 'human@corp.in',
    phone: '9845012345',
    _hp_website: '',
    _t_token: String(now - 5500) // 5.5 seconds elapsed
  });
  assert.strictEqual(result.isSpam, false);
});

// ---------------------------------------------------------------------------
// Suite 3: Client IP Resolution & Anti-Spoofing Strategy
// ---------------------------------------------------------------------------
console.log('\n--- Test Suite 3: Safe Direct-Connection IP Resolution & Anti-Spoofing ---');

it('REMEDIATION FIX: Ignores spoofed X-Forwarded-For headers on direct connections by default', () => {
  const fakeReq = {
    socket: { remoteAddress: '198.51.100.25' },
    headers: {
      'x-forwarded-for': '203.0.113.195, 10.0.0.1',
      'cf-connecting-ip': '203.0.113.88'
    }
  };

  // Default direct connection: trustedProxies is empty
  const resolvedIp = resolveClientIp(fakeReq, { trustedProxies: [] });
  assert.strictEqual(resolvedIp, '198.51.100.25', 'Must use direct socket peer IP and ignore spoofed headers');
});

it('REMEDIATION FIX: Honors CF-Connecting-IP / X-Forwarded-For if and only if upstream proxy is verified trusted', () => {
  const fakeReq = {
    socket: { remoteAddress: '10.0.0.1' }, // Trusted internal reverse proxy
    headers: {
      'cf-connecting-ip': '203.0.113.44',
      'x-forwarded-for': '203.0.113.44, 10.0.0.1'
    }
  };

  const resolvedIp = resolveClientIp(fakeReq, { trustedProxies: ['10.0.0.1'] });
  assert.strictEqual(resolvedIp, '203.0.113.44', 'Must resolve genuine client IP from verified trusted proxy');
});

// ---------------------------------------------------------------------------
// Suite 4: Rate Limiting & Idempotency / Duplicate Suppression
// ---------------------------------------------------------------------------
console.log('\n--- Test Suite 4: Rate Limiting, Idempotency & Concurrency ---');

it('Enforces rate limiting after 5 requests from the same IP hash within 10m', () => {
  const testIpHash = 'test-ip-hash-limit-check';
  _stores.rateLimitStore.delete(testIpHash);

  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testIpHash);
    assert.strictEqual(res.limited, false, `Request ${i} should be allowed`);
  }

  // 6th request must be blocked
  const blockedRes = checkRateLimit(testIpHash);
  assert.strictEqual(blockedRes.limited, true, '6th request must be rate limited');
  assert(blockedRes.retryAfterSec > 0, 'Must provide retry-after seconds');
});

it('Suppresses duplicate submission within 15-minute window', () => {
  const email = 'duplicate.test@craftegon.test';
  const rawPayload = JSON.stringify({
    contact_name: 'Duplicate Checker',
    email,
    phone: '9876543210',
    service_id: 'V01-SVC-007',
    vertical_id: 'V01',
    scope_description: 'Incorporation query',
    consent_agreed: true
  });

  // First submission
  const first = processLeadSubmission(rawPayload, {}, '192.168.1.100');
  assert.strictEqual(first.statusCode, 201, `Failed first submission: ${JSON.stringify(first.body)}`);
  assert.strictEqual(first.body.status, 'ACCEPTED');
  const ref1 = first.body.lead_reference;

  // Second submission with exact same details
  const second = processLeadSubmission(rawPayload, {}, '192.168.1.100');
  assert.strictEqual(second.statusCode, 200);
  assert.strictEqual(second.body.status, 'DUPLICATE_SUPPRESSED');
  assert.strictEqual(second.body.lead_reference, ref1, 'Must return original lead reference');
});

// ---------------------------------------------------------------------------
// Suite 5: Privacy Protection & Masked Audit Logging
// ---------------------------------------------------------------------------
console.log('\n--- Test Suite 5: Privacy Protection & Masked Audit Logging ---');

it('Correctly masks email addresses for audit logs', () => {
  assert.strictEqual(maskPII('rohan.sharma@example.com', 'email'), 'r***a@example.com');
  assert.strictEqual(maskPII('ab@domain.in', 'email'), 'a***@domain.in');
});

it('Correctly masks phone numbers for audit logs', () => {
  assert.strictEqual(maskPII('+91 98201 12345', 'phone'), '+91 ******2345');
  assert.strictEqual(maskPII('9876543210', 'phone'), '+91 ******3210');
});

it('REMEDIATION FIX: Audit log entries contain zero unmasked PII, tokens, secrets, or internal paths', () => {
  const rawPayload = JSON.stringify({
    contact_name: 'Confidential Client Officer',
    email: 'confidential.director@tata-enterprises.co.in',
    phone: '9812345678',
    service_id: 'V01-SVC-007',
    vertical_id: 'V01',
    consent_agreed: true,
    _t_token: '1729228800000'
  });

  const res = processLeadSubmission(rawPayload, {}, '10.0.0.50');
  assert.strictEqual(res.statusCode, 201, `Creation failed: ${JSON.stringify(res.body)}`);

  const lastAudit = _stores.auditLog[_stores.auditLog.length - 1];

  assert(lastAudit !== undefined);
  assert.strictEqual(lastAudit.details.email, undefined, 'Raw email must not exist in audit details');
  assert.strictEqual(lastAudit.details.phone, undefined, 'Raw phone must not exist in audit details');
  assert.strictEqual(lastAudit.details.raw_payload, undefined, 'Raw payload must never be logged');
  assert.strictEqual(lastAudit.details._t_token, undefined, 'Security tokens must not be logged');
  assert.strictEqual(lastAudit.details.stack, undefined, 'Stack traces must not be logged');
  assert.strictEqual(lastAudit.details.filepath, undefined, 'File paths must not be logged');
  assert(lastAudit.details.email_masked.includes('***'), 'Email must be masked');
  assert(lastAudit.details.phone_masked.includes('******'), 'Phone must be masked');
});

// ---------------------------------------------------------------------------
// Suite 6: HTTP Protocol, Size Limits & Network Handling
// ---------------------------------------------------------------------------
console.log('\n--- Test Suite 6: HTTP Protocol, Network Security & Concurrency ---');

async function runHttpTests() {
  const TEST_PORT = 3198;
  const { server, listen, close } = createLeadServer(TEST_PORT);

  await new Promise((resolve) => listen(resolve));

  function makeRequest({ method = 'POST', path = '/', headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: {
          'Connection': 'close',
          'Content-Type': 'application/json',
          ...headers
        }
      }, (res) => {
        let chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed;
          try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
        });
      });

      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  try {
    // 1. Method rejection
    await itAsync('Rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
      const res = await makeRequest({ method: 'GET' });
      assert.strictEqual(res.statusCode, 405);
      assert.strictEqual(res.body.error_code, 'METHOD_NOT_ALLOWED');
    });

    // 2. Unsupported Content-Type
    await itAsync('Rejects non-JSON Content-Type with 415 Unsupported Media Type', async () => {
      const res = await makeRequest({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'contact_name=Bob'
      });
      assert.strictEqual(res.statusCode, 415);
      assert.strictEqual(res.body.error_code, 'UNSUPPORTED_MEDIA_TYPE');
    });

    // 3. REMEDIATION FIX: Oversized payload connection drain & clean termination
    await itAsync('REMEDIATION FIX: Rejects payloads exceeding 32 KB with 413, Connection: close and socket drain', async () => {
      const largePayload = JSON.stringify({
        contact_name: 'Large Submitter',
        email: 'large@example.com',
        phone: '9845012345',
        scope_description: 'X'.repeat(35 * 1024), // 35 KB
        consent_agreed: true
      });

      const res = await makeRequest({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: largePayload
      });
      assert.strictEqual(res.statusCode, 413);
      assert.strictEqual(res.body.error_code, 'PAYLOAD_TOO_LARGE');
      assert.strictEqual(res.headers['connection'], 'close');
    });

    // 4. Malformed JSON
    await itAsync('Rejects malformed JSON with 400 Bad Request and zero stack trace leak', async () => {
      const res = await makeRequest({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ "broken_json": true, '
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error_code, 'INVALID_JSON');
      assert.strictEqual(res.body.stack, undefined, 'Zero stack trace leakage allowed');
    });

    // 5. Successful end-to-end HTTP creation
    await itAsync('Successfully processes valid HTTP POST submission (201 Created)', async () => {
      const validPayload = JSON.stringify({
        contact_name: 'Ananya Deshmukh',
        email: 'ananya.d@deshmukh-advisory.in',
        phone: '+91 99887 76655',
        service_id: 'V01-SVC-007',
        vertical_id: 'V01',
        scope_description: 'Need full board secretarial advisory for new subsidiary.',
        consent_agreed: true
      });

      const res = await makeRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CraftEgon-Client': 'ccs-test-runner/1.0'
        },
        body: validPayload
      });

      assert.strictEqual(res.statusCode, 201, `Failed creation: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.status, 'ACCEPTED');
      assert(/^LEAD-\d{4}-[A-F0-9]{6}$/.test(res.body.lead_reference));
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    });

    // 6. REMEDIATION FIX: Concurrent duplicate submission handling
    await itAsync('REMEDIATION FIX: Handles concurrent duplicate submissions gracefully via idempotency cache', async () => {
      const testEmail = `concurrent.${Date.now()}@example.com`;
      const concurrentPayload = JSON.stringify({
        contact_name: 'Concurrent Submitter',
        email: testEmail,
        phone: '9845012345',
        service_id: 'V01-SVC-007',
        vertical_id: 'V01',
        scope_description: 'Parallel click test',
        consent_agreed: true
      });

      const [res1, res2] = await Promise.all([
        makeRequest({ method: 'POST', body: concurrentPayload }),
        makeRequest({ method: 'POST', body: concurrentPayload })
      ]);

      const statuses = [res1.statusCode, res2.statusCode].sort();
      assert.deepStrictEqual(statuses, [200, 201], 'One request must succeed (201) and duplicate must be suppressed (200)');
      
      const ref1 = res1.body.lead_reference;
      const ref2 = res2.body.lead_reference;
      assert.strictEqual(ref1, ref2, 'Both concurrent responses must reference the identical lead entity');
    });

    // 7. REMEDIATION FIX: Anti-spoofing rate limit test over HTTP
    await itAsync('REMEDIATION FIX: Spoofed X-Forwarded-For headers from same direct client do not bypass rate limits', async () => {
      // Clear rate limit store for 127.0.0.1
      const localHash = crypto.createHash('sha256').update('craftegon-local-salt-baseline:127.0.0.1').digest('hex').slice(0, 16);
      _stores.rateLimitStore.delete(localHash);

      // Send 5 requests with spoofed IPs
      for (let i = 1; i <= 5; i++) {
        const payload = JSON.stringify({
          contact_name: `Spoof User ${i}`,
          email: `spoof${i}_${Date.now()}@example.com`,
          phone: '9845012345',
          consent_agreed: true
        });
        const res = await makeRequest({
          method: 'POST',
          headers: { 'X-Forwarded-For': `203.0.113.${10 + i}` },
          body: payload
        });
        assert.strictEqual(res.statusCode, 201, `Request ${i} should succeed`);
      }

      // 6th request with yet another spoofed IP must STILL be rate limited
      const payload6 = JSON.stringify({
        contact_name: 'Spoof User 6',
        email: `spoof6_${Date.now()}@example.com`,
        phone: '9845012345',
        consent_agreed: true
      });
      const res6 = await makeRequest({
        method: 'POST',
        headers: { 'X-Forwarded-For': '198.51.100.99' },
        body: payload6
      });

      assert.strictEqual(res6.statusCode, 429, '6th request must be rate limited despite spoofed X-Forwarded-For header');
      assert.strictEqual(res6.body.error_code, 'RATE_LIMIT_EXCEEDED');
    });

    // 8. Security headers check
    await itAsync('Includes strict security headers (nosniff, DENY) on responses', async () => {
      const res = await makeRequest({ method: 'OPTIONS' });
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
      assert.strictEqual(res.headers['x-frame-options'], 'DENY');
    });

  } finally {
    await new Promise((resolve) => close(resolve));
  }
}

// ---------------------------------------------------------------------------
// Execution Entrypoint
// ---------------------------------------------------------------------------
runHttpTests().then(() => {
  console.log('\n======================================================================');
  console.log(`PROTOTYPE TEST RESULTS: ${passedTests} passed, ${totalTests - passedTests} failed (${totalTests} total assertions)`);
  console.log('======================================================================');
  if (totalTests !== passedTests) {
    process.exit(1);
  }
}).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
