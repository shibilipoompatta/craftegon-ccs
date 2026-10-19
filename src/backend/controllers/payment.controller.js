/**
 * CraftEgon CCS - Payment & Subscription Controller (Razorpay Sandbox Integration)
 * Strict server-side pricing integrity, status gating, HMAC signature verification & webhook idempotency
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { orderRepository } = require('../storage/order-repository');
const { requireAuth } = require('../middleware/auth-guard');

// Cache processed webhook event IDs for idempotency
const processedWebhookEvents = new Set();

// Load canonical pricing dataset for strict pricing gating
let pricingData = null;
function getPricingData() {
  if (!pricingData) {
    try {
      const p = path.resolve(__dirname, '../../../data/pricing.json');
      if (fs.existsSync(p)) {
        pricingData = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      pricingData = [];
    }
  }
  return pricingData || [];
}

// Server-authoritative catalog of subscription tiers (paise amounts)
const SUBSCRIPTION_CATALOG = {
  'Starter Tier': {
    monthly: 149900,  // ₹1,499
    annual: 1499000   // ₹14,990
  },
  'Growth Tier': {
    monthly: 499900,  // ₹4,999
    annual: 4999000   // ₹49,990
  },
  'Enterprise Tier': {
    monthly: 1499900, // ₹14,999
    annual: 14999000  // ₹1,49,990
  },
  'SANDBOX_TEST_FIXTURE': {
    monthly: 500000,  // ₹5,000
    annual: 5000000   // ₹50,000
  },
  'Sandbox Test Tier': {
    monthly: 500000,
    annual: 5000000
  }
};

/**
 * POST /api/v1/payments/create-order
 * Initiates server-backed sandbox order with strict pricing gating & authoritative amounts
 */
async function handleCreateOrder(req, res, config, body = {}) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const userId = user.account_id || user.id || user.user_id;

  const { tier_name, billing_cycle = 'annual', service_id, is_sandbox_test } = body;

  // 1. Strict Pricing Gate: Transactional Services from Phase 2
  if (service_id) {
    const allPricing = getPricingData();
    const servicePrice = allPricing.find(p => p.service_id === service_id);

    // Rule: All Phase 2 services are currently UNVERIFIED / PENDING_COMMERCIAL_APPROVAL
    if (!servicePrice || servicePrice.verification_status !== 'VERIFIED' || servicePrice.commercial_approval_state !== 'COMMERCIALLY_APPROVED') {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Unprocessable Entity',
        code: 'PRICING_UNVERIFIED_CHECKOUT_BLOCKED',
        message: `Commercial pricing for service '${service_id}' has not received formal executive approval and is blocked from checkout.`
      }));
    }
  }

  // 2. Pricing Gate: Production Retainer Block
  const isFixture = is_sandbox_test || tier_name === 'SANDBOX_TEST_FIXTURE' || tier_name === 'Sandbox Test Tier';
  if (config.isProd && !isFixture) {
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      code: 'COMMERCIAL_APPROVAL_REQUIRED',
      message: `Subscription tier '${tier_name}' pricing is awaiting executive commercial approval and cannot be purchased in production.`
    }));
  }

  // 3. Server-Authoritative Amount Calculation (Never trust client amount)
  const tierConfig = SUBSCRIPTION_CATALOG[tier_name] || (isFixture ? SUBSCRIPTION_CATALOG['SANDBOX_TEST_FIXTURE'] : null);
  if (!tierConfig) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      code: 'INVALID_TIER',
      message: `Unrecognized tier '${tier_name}'. Available tiers: Starter Tier, Growth Tier, Enterprise Tier, SANDBOX_TEST_FIXTURE.`
    }));
  }

  const cycle = billing_cycle === 'monthly' ? 'monthly' : 'annual';
  const subtotalPaise = tierConfig[cycle];
  const taxPaise = Math.round(subtotalPaise * 0.18); // 18% GST
  const totalPaise = subtotalPaise + taxPaise;

  // 4. Idempotency Check
  const idempotencyHash = crypto
    .createHash('sha256')
    .update(`${userId}:${tier_name}:${cycle}:${totalPaise}`)
    .digest('hex');

  const context = { userId, role: user.role };
  const existingOrders = await orderRepository.listOrders(context);
  const duplicate = existingOrders.find(
    o => o.idempotency_hash === idempotencyHash && o.payment_status === 'PAYMENT_PENDING'
  );

  if (duplicate) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'success',
      order_reference: duplicate.order_reference,
      gateway_order_id: duplicate.gateway_order_id,
      amount_subtotal_paise: duplicate.amount_subtotal_paise,
      amount_tax_paise: duplicate.amount_tax_paise,
      amount_total_paise: duplicate.amount_total_paise,
      currency: duplicate.currency,
      key_id: config.razorpayKeyId,
      tier_name: duplicate.tier_name,
      billing_cycle: duplicate.billing_cycle,
      is_idempotent_replay: true
    }));
  }

  // 5. Generate Order Records
  const year = new Date().getFullYear();
  const refSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const orderReference = `ORD-${year}-${refSuffix}`;
  const gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  const orderData = {
    order_reference: orderReference,
    client_id: userId,
    tier_name,
    billing_cycle: cycle,
    amount_subtotal_paise: subtotalPaise,
    amount_tax_paise: taxPaise,
    amount_total_paise: totalPaise,
    currency: 'INR',
    gateway_provider: 'RAZORPAY_SANDBOX',
    gateway_order_id: gatewayOrderId,
    idempotency_hash: idempotencyHash
  };

  const createdOrder = await orderRepository.createOrder(orderData, context);
  // Transition to PAYMENT_PENDING
  await orderRepository.updateOrderStatus(orderReference, 'PAYMENT_PENDING', { gateway_order_id: gatewayOrderId }, context);

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    order_reference: orderReference,
    gateway_order_id: gatewayOrderId,
    amount_subtotal_paise: subtotalPaise,
    amount_tax_paise: taxPaise,
    amount_total_paise: totalPaise,
    currency: 'INR',
    key_id: config.razorpayKeyId,
    tier_name,
    billing_cycle: cycle
  }));
}

/**
 * POST /api/v1/payments/verify
 * Verifies Razorpay checkout callback signature and transitions order to PAID
 */
async function handleVerifyPayment(req, res, config, body = {}) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const userId = user.account_id || user.id || user.user_id;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      code: 'MISSING_PAYMENT_FIELDS',
      message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
    }));
  }

  // 1. Verify HMAC Signature
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      code: 'INVALID_PAYMENT_SIGNATURE',
      message: 'Razorpay payment signature verification failed'
    }));
  }

  // 2. Resolve Order
  const order = await orderRepository.getOrderByGatewayId(razorpay_order_id);
  if (!order) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not Found', message: 'Target order not found' }));
  }

  // 3. Multi-Tenant Authorization Check
  const isOwner = userId === order.client_id;
  const isStaff = ['compliance_operator', 'managing_partner'].includes(user.role);
  if (!isOwner && !isStaff) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Forbidden', message: 'Cannot verify payment for another client order' }));
  }

  // 4. Transition to PAID (Idempotent)
  if (order.payment_status !== 'PAID') {
    await orderRepository.updateOrderStatus(order.order_reference, 'PAID', {
      gateway_payment_id: razorpay_payment_id,
      paid_at: new Date().toISOString()
    }, { role: 'managing_partner' });
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    order_reference: order.order_reference,
    payment_status: 'PAID',
    gateway_payment_id: razorpay_payment_id
  }));
}

/**
 * POST /api/v1/payments/webhook
 * Authenticates Razorpay webhook signature, checks idempotency & updates order status
 */
async function handleWebhook(req, res, config, rawBody = '') {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', code: 'MISSING_SIGNATURE', message: 'Missing X-Razorpay-Signature header' }));
  }

  // 1. Validate Webhook Signature
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Webhook signature verification failed' }));
  }

  let event = null;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Bad Request', message: 'Malformed JSON payload' }));
  }

  // 2. Idempotency Check (Prevent duplicate/replay processing)
  const eventId = event.id || (event.payload && event.payload.payment && event.payload.payment.entity && event.payload.payment.entity.id);
  if (eventId && processedWebhookEvents.has(eventId)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ignored_duplicate', message: 'Webhook event already processed' }));
  }

  const eventType = event.event;
  const paymentEntity = event.payload && event.payload.payment && event.payload.payment.entity;

  if (!paymentEntity || !paymentEntity.order_id) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ignored_unrelated', message: 'Event does not contain order entity' }));
  }

  const order = await orderRepository.getOrderByGatewayId(paymentEntity.order_id);
  if (!order) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not Found', message: `Order with gateway id '${paymentEntity.order_id}' not found` }));
  }

  // 3. Process Specific Events
  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    // Validate Amount & Currency Integrity
    if (paymentEntity.currency !== 'INR' || paymentEntity.amount !== order.amount_total_paise) {
      await orderRepository.updateOrderStatus(order.order_reference, 'PAYMENT_FAILED', {
        failure_reason: 'AMOUNT_OR_CURRENCY_MISMATCH'
      }, { role: 'managing_partner' });

      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Bad Request',
        code: 'AMOUNT_MISMATCH',
        message: 'Payment entity amount does not match authoritative order amount'
      }));
    }

    if (order.payment_status !== 'PAID') {
      await orderRepository.updateOrderStatus(order.order_reference, 'PAID', {
        gateway_payment_id: paymentEntity.id,
        paid_at: new Date().toISOString()
      }, { role: 'managing_partner' });
    }
  } else if (eventType === 'payment.failed') {
    if (order.payment_status !== 'PAID') {
      await orderRepository.updateOrderStatus(order.order_reference, 'PAYMENT_FAILED', {
        gateway_payment_id: paymentEntity.id,
        failure_reason: paymentEntity.error_description || 'Payment declined by gateway'
      }, { role: 'managing_partner' });
    }
  }

  if (eventId) {
    processedWebhookEvents.add(eventId);
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'processed',
    event: eventType,
    order_reference: order.order_reference
  }));
}

/**
 * GET /api/v1/portal/orders
 * Returns list of subscription orders for authenticated client
 */
async function handleListOrders(req, res, config) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const userId = user.account_id || user.id || user.user_id;

  const context = { userId, role: user.role };
  const orders = await orderRepository.listOrders(context);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    total_orders: orders.length,
    orders: orders.map(o => ({
      order_reference: o.order_reference,
      tier_name: o.tier_name,
      billing_cycle: o.billing_cycle,
      amount_total_paise: o.amount_total_paise,
      currency: o.currency,
      payment_status: o.payment_status,
      created_at: o.created_at
    }))
  }));
}

/**
 * GET /api/v1/portal/orders/:ref
 * Fetches single order with cross-tenant RLS isolation
 */
async function handleGetOrder(req, res, ref, config) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const userId = user.account_id || user.id || user.user_id;

  const context = { userId, role: user.role };
  const order = await orderRepository.getOrder(ref, context);

  if (!order) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Not Found',
      message: `Order '${ref}' not found or access denied`
    }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    order: {
      order_reference: order.order_reference,
      tier_name: order.tier_name,
      billing_cycle: order.billing_cycle,
      amount_subtotal_paise: order.amount_subtotal_paise,
      amount_tax_paise: order.amount_tax_paise,
      amount_total_paise: order.amount_total_paise,
      currency: order.currency,
      payment_status: order.payment_status,
      gateway_order_id: order.gateway_order_id,
      created_at: order.created_at,
      updated_at: order.updated_at
    }
  }));
}

module.exports = {
  handleCreateOrder,
  handleVerifyPayment,
  handleWebhook,
  handleListOrders,
  handleGetOrder,
  SUBSCRIPTION_CATALOG
};
