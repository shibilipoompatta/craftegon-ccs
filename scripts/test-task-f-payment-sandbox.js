/**
 * CraftEgon CCS - Phase 3 Task E & F: Payment Sandbox & Customer Order Test Suite
 * Comprehensive automated testing of Razorpay sandbox checkout, HMAC signature verification,
 * webhook idempotency, pricing gating, and PostgreSQL RLS tenant isolation.
 */

const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const { createServer } = require('../src/backend/server');
const { loadConfig } = require('../src/backend/config');
const { orderRepository, InMemoryOrderStorage, PostgresOrderStorage } = require('../src/backend/storage/order-repository');
const { accountRepository, InMemoryAccountStorage } = require('../src/backend/storage/account-repository');
const { PostgresClient } = require('../src/backend/storage/postgres-client');
const { memoryStore } = require('../src/backend/storage/memory-store');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runPaymentSandboxSuite() {
  console.log('======================================================================');
  console.log('CraftEgon CCS - Phase 3 Task E: Payment Sandbox & Order Test Suite');
  console.log('======================================================================\n');

  memoryStore.reset();
  orderRepository.setAdapter(new InMemoryOrderStorage());
  accountRepository.setAdapter(new InMemoryAccountStorage());

  const testPort = 3195;
  const testSecret = 'craftegon-sandbox-test-key-secret';
  const testWebhookSecret = 'craftegon-sandbox-webhook-secret-sig';

  const testInstance = createServer({
    PORT: testPort,
    NODE_ENV: 'test',
    DATABASE_PROVIDER: 'local_in_memory',
    RAZORPAY_KEY_ID: 'rzp_test_mock_12345',
    RAZORPAY_KEY_SECRET: testSecret,
    RAZORPAY_WEBHOOK_SECRET: testWebhookSecret
  });

  await testInstance.start();
  console.log(`Payment test server running on port ${testPort}\n`);

  try {
    // ------------------------------------------------------------------------
    // Setup Test Accounts
    // ------------------------------------------------------------------------
    const custA = await accountRepository.createAccount({
      legal_entity_name: 'Acme Technologies Pvt Ltd',
      primary_email: 'finance@acme.in',
      primary_phone: '+919876543210',
      account_role: 'client'
    });

    const custB = await accountRepository.createAccount({
      legal_entity_name: 'Beta Global LLP',
      primary_email: 'admin@betaglobal.in',
      primary_phone: '+919876543211',
      account_role: 'client'
    });

    const staffUser = await accountRepository.createAccount({
      legal_entity_name: 'CraftEgon Compliance Directorate',
      primary_email: 'billing@craftegon.com',
      primary_phone: '+919876543299',
      account_role: 'compliance_operator'
    });

    const cfg = testInstance.config;
    // Issue verified session tokens
    const sessionA = await accountRepository.createSession(custA);
    const sessionB = await accountRepository.createSession(custB);
    const sessionStaff = await accountRepository.createSession(staffUser);

    const custAToken = `Bearer ${sessionA.token}`;
    const custBToken = `Bearer ${sessionB.token}`;
    const staffToken = `Bearer ${sessionStaff.token}`;

    // ------------------------------------------------------------------------
    // Test Suite 1: Authentication & Server-Side Pricing Gating
    // ------------------------------------------------------------------------
    console.log('--- Test Suite 1: Pricing Gating & Order Initiation ---');

    // 1. Unauthenticated request rejected
    const unauthRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { tier_name: 'Growth Tier' });
    assert(unauthRes.statusCode === 401, 'Unauthenticated checkout request rejected with HTTP 401');

    // 2. Unapproved Phase 2 service pricing strictly blocked
    const unverifiedServiceRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, { service_id: 'V01-SVC-007' });
    assert(unverifiedServiceRes.statusCode === 422, 'Unverified Phase 2 service pricing strictly blocked from checkout (HTTP 422)');
    assert(unverifiedServiceRes.body.code === 'PRICING_UNVERIFIED_CHECKOUT_BLOCKED', 'Error code confirms PRICING_UNVERIFIED_CHECKOUT_BLOCKED');

    // 3. Client-provided amount is ignored; server calculates authoritative amount
    const createRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, {
      tier_name: 'Growth Tier',
      billing_cycle: 'annual',
      amount_total_paise: 100 // Malicious attempt to pay ₹1 instead of ₹49,990 + GST
    });

    assert(createRes.statusCode === 201, 'Customer A initiates sandbox order successfully (HTTP 201)');
    assert(createRes.body.order_reference.startsWith('ORD-2026-'), 'Generated authoritative order reference');
    assert(createRes.body.amount_subtotal_paise === 4999000, 'Server enforced authoritative annual subtotal: 4,999,000 paise (₹49,990)');
    assert(createRes.body.amount_tax_paise === 899820, 'Server calculated exact 18% GST: 899,820 paise (₹8,998.20)');
    assert(createRes.body.amount_total_paise === 5898820, 'Server calculated exact total: 5,898,820 paise (Client tampering ignored)');
    assert(createRes.body.gateway_order_id.startsWith('order_'), 'Assigned valid Razorpay gateway order ID');

    const orderRefA = createRes.body.order_reference;
    const gatewayOrderIdA = createRes.body.gateway_order_id;

    // 4. Idempotency test: duplicate submission within time window returns cached order
    const dupRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, { tier_name: 'Growth Tier', billing_cycle: 'annual' });
    assert(dupRes.statusCode === 200, 'Duplicate checkout request returns cached idempotent replay (HTTP 200)');
    assert(dupRes.body.order_reference === orderRefA, 'Idempotent replay returns identical order reference');
    assert(dupRes.body.is_idempotent_replay === true, 'Response confirms is_idempotent_replay: true');

    // ------------------------------------------------------------------------
    // Test Suite 2: Client Checkout Return & HMAC Signature Verification
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 2: Client Verification & HMAC Signature Security ---');

    const paymentIdA = 'pay_test_payment_998877';

    // 1. Missing signature fields rejected
    const missingSigRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, { razorpay_order_id: gatewayOrderIdA });
    assert(missingSigRes.statusCode === 400, 'Missing payment signature parameters rejected with HTTP 400');

    // 2. Tampered / invalid HMAC signature rejected
    const invalidSigRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, {
      razorpay_order_id: gatewayOrderIdA,
      razorpay_payment_id: paymentIdA,
      razorpay_signature: 'invalid_forged_hmac_signature_99999'
    });
    assert(invalidSigRes.statusCode === 400, 'Forged HMAC signature strictly rejected with HTTP 400');
    assert(invalidSigRes.body.code === 'INVALID_PAYMENT_SIGNATURE', 'Error code confirms INVALID_PAYMENT_SIGNATURE');

    // 3. Customer B attempting to verify Customer A order rejected
    const validSigA = crypto
      .createHmac('sha256', testSecret)
      .update(`${gatewayOrderIdA}|${paymentIdA}`)
      .digest('hex');

    const crossVerifyRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custBToken }
    }, {
      razorpay_order_id: gatewayOrderIdA,
      razorpay_payment_id: paymentIdA,
      razorpay_signature: validSigA
    });
    assert(crossVerifyRes.statusCode === 403, 'CROSS-TENANT ISOLATION: Customer B cannot verify Customer A payment (HTTP 403)');

    // 4. Valid signature by Customer A succeeds
    const validVerifyRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, {
      razorpay_order_id: gatewayOrderIdA,
      razorpay_payment_id: paymentIdA,
      razorpay_signature: validSigA
    });
    assert(validVerifyRes.statusCode === 200, 'Valid HMAC signature verifies payment successfully (HTTP 200)');
    assert(validVerifyRes.body.payment_status === 'PAID', 'Order transitioned to authoritative status PAID');

    // 5. Idempotent re-verification succeeds without error
    const reVerifyRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, {
      razorpay_order_id: gatewayOrderIdA,
      razorpay_payment_id: paymentIdA,
      razorpay_signature: validSigA
    });
    assert(reVerifyRes.statusCode === 200, 'Idempotent re-verification acknowledged with HTTP 200');

    // ------------------------------------------------------------------------
    // Test Suite 3: Razorpay Webhook Signatures, Idempotency & Mismatch
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 3: Webhook Security, Idempotency & Tampering Defense ---');

    // Create Order 2 for Webhook testing
    const createRes2 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custBToken }
    }, { tier_name: 'Starter Tier', billing_cycle: 'monthly' });

    const orderRefB = createRes2.body.order_reference;
    const gatewayOrderIdB = createRes2.body.gateway_order_id;
    const totalPaiseB = createRes2.body.amount_total_paise; // ₹1,499 + 18% = 176,882 paise

    // 1. Missing webhook signature header rejected
    const noSigWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ event: 'payment.captured' }));
    assert(noSigWebhookRes.statusCode === 400, 'Webhook missing X-Razorpay-Signature rejected with HTTP 400');

    // 2. Invalid webhook signature rejected
    const badSigWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'fake_webhook_signature_hash'
      }
    }, JSON.stringify({ event: 'payment.captured' }));
    assert(badSigWebhookRes.statusCode === 400, 'Invalid webhook signature strictly rejected with HTTP 400');
    assert(badSigWebhookRes.body.code === 'INVALID_WEBHOOK_SIGNATURE', 'Error code confirms INVALID_WEBHOOK_SIGNATURE');

    // 3. Amount Mismatch Attack: Webhook reports amount different from authoritative order
    const mismatchPayload = JSON.stringify({
      id: 'event_webhook_mismatch_001',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_mismatch_112233',
            order_id: gatewayOrderIdB,
            amount: 100, // Attacker forged webhook amount
            currency: 'INR'
          }
        }
      }
    });

    const mismatchSig = crypto.createHmac('sha256', testWebhookSecret).update(mismatchPayload).digest('hex');
    const mismatchRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': mismatchSig
      }
    }, mismatchPayload);
    assert(mismatchRes.statusCode === 400, 'AMOUNT TAMPERING: Webhook with amount mismatch strictly rejected (HTTP 400)');
    assert(mismatchRes.body.code === 'AMOUNT_MISMATCH', 'Error code confirms AMOUNT_MISMATCH');

    // 4. Valid Webhook event payment.captured succeeds
    const validWebhookPayload = JSON.stringify({
      id: 'event_webhook_valid_002',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_valid_445566',
            order_id: gatewayOrderIdB,
            amount: totalPaiseB,
            currency: 'INR'
          }
        }
      }
    });

    const validWebhookSig = crypto.createHmac('sha256', testWebhookSecret).update(validWebhookPayload).digest('hex');
    const validWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validWebhookSig
      }
    }, validWebhookPayload);
    assert(validWebhookRes.statusCode === 200, 'Valid Razorpay webhook processed successfully (HTTP 200)');
    assert(validWebhookRes.body.status === 'processed', 'Webhook confirms status: processed');

    // Verify order is now PAID
    const orderBRecord = await orderRepository.getOrder(orderRefB, { role: 'managing_partner' });
    assert(orderBRecord.payment_status === 'PAID', 'Order transitioned to PAID following valid webhook confirmation');

    // 5. Webhook Replay / Duplicate delivery is safely ignored
    const replayWebhookRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validWebhookSig
      }
    }, validWebhookPayload);
    assert(replayWebhookRes.statusCode === 200, 'Webhook replay detected and safely handled idempotently (HTTP 200)');
    assert(replayWebhookRes.body.status === 'ignored_duplicate', 'Response confirms status: ignored_duplicate');

    // 6. Webhook payment.failed transitions order to PAYMENT_FAILED
    const createRes3 = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custBToken }
    }, { tier_name: 'Enterprise Tier', billing_cycle: 'monthly' });

    const orderRefC = createRes3.body.order_reference;
    const gatewayOrderIdC = createRes3.body.gateway_order_id;

    const failPayload = JSON.stringify({
      id: 'event_webhook_fail_003',
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_failed_778899',
            order_id: gatewayOrderIdC,
            amount: createRes3.body.amount_total_paise,
            currency: 'INR',
            error_description: 'Card declined by issuing bank'
          }
        }
      }
    });

    const failSig = crypto.createHmac('sha256', testWebhookSecret).update(failPayload).digest('hex');
    const failRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': failSig
      }
    }, failPayload);

    assert(failRes.statusCode === 200, 'Webhook payment.failed processed successfully (HTTP 200)');
    const orderCRecord = await orderRepository.getOrder(orderRefC, { role: 'managing_partner' });
    assert(orderCRecord.payment_status === 'PAYMENT_FAILED', 'Order status accurately transitioned to PAYMENT_FAILED');

    // ------------------------------------------------------------------------
    // Test Suite 4: Multi-Tenant Order Queries & RLS Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 4: Multi-Tenant Order Access & Cross-Customer Isolation ---');

    // 1. Customer A lists orders: sees only their own order
    const listARes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/orders',
      method: 'GET',
      headers: { 'Authorization': custAToken }
    });
    assert(listARes.statusCode === 200, 'Customer A lists orders successfully (HTTP 200)');
    assert(listARes.body.total_orders === 1, 'Customer A sees exactly 1 order');
    assert(listARes.body.orders[0].order_reference === orderRefA, 'Customer A order reference matches Order 1');

    // 2. Customer B lists orders: sees only their own orders (Order B & Order C)
    const listBRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/orders',
      method: 'GET',
      headers: { 'Authorization': custBToken }
    });
    assert(listBRes.statusCode === 200, 'Customer B lists orders successfully (HTTP 200)');
    assert(listBRes.body.total_orders === 2, 'Customer B sees exactly 2 orders (Order A is completely isolated)');

    // 3. CROSS-TENANT ISOLATION: Customer B requesting Customer A order returns HTTP 404
    const crossOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/orders/${orderRefA}`,
      method: 'GET',
      headers: { 'Authorization': custBToken }
    });
    assert(crossOrderRes.statusCode === 404, 'CROSS-TENANT ISOLATION: Customer B querying Customer A order returns HTTP 404 Not Found (Zero leakage)');

    // 4. Customer A fetches own order returns full details
    const ownOrderRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: `/api/v1/portal/orders/${orderRefA}`,
      method: 'GET',
      headers: { 'Authorization': custAToken }
    });
    assert(ownOrderRes.statusCode === 200, 'Customer A fetches own order details (HTTP 200)');
    assert(ownOrderRes.body.order.payment_status === 'PAID', 'Verified order payment status is PAID');

    // 5. Staff can query orders across tenants
    const staffListRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/portal/orders',
      method: 'GET',
      headers: { 'Authorization': staffToken }
    });
    assert(staffListRes.statusCode === 200, 'Compliance staff queries all orders across tenants');
    assert(staffListRes.body.total_orders === 3, 'Staff sees all 3 orders across tenants');

    // ------------------------------------------------------------------------
    // Test Suite 5: Dedicated Sandbox Non-Commercial Fixture Verification
    // ------------------------------------------------------------------------
    console.log('\n--- Test Suite 5: Non-Commercial Sandbox Fixture Validation ---');

    const fixtureRes = await request({
      hostname: '127.0.0.1',
      port: testPort,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': custAToken }
    }, {
      tier_name: 'SANDBOX_TEST_FIXTURE',
      billing_cycle: 'monthly'
    });
    assert(fixtureRes.statusCode === 201, 'Dedicated non-commercial sandbox test fixture accepted with HTTP 201');
    assert(fixtureRes.body.amount_subtotal_paise === 500000, 'Sandbox fixture subtotal is 500,000 paise (₹5,000)');
    assert(fixtureRes.body.amount_tax_paise === 90000, 'Sandbox fixture GST is 90,000 paise (₹900)');
    assert(fixtureRes.body.amount_total_paise === 590000, 'Sandbox fixture total is 590,000 paise (₹5,900)');

  } finally {
    await testInstance.stop();
    console.log('\nPayment test server stopped.');
  }

  console.log('\n======================================================================');
  console.log(`TASK E TEST SUMMARY: ${passedAssertions} passed, ${failedAssertions} failed (${passedAssertions + failedAssertions} total assertions)`);
  console.log('======================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPaymentSandboxSuite().catch(err => {
    console.error('Fatal error in payment test suite:', err);
    process.exit(1);
  });
}

module.exports = { runPaymentSandboxSuite };
