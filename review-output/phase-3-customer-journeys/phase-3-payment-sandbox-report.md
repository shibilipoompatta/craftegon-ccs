# CraftEgon CCS — Phase 3: Payment Sandbox Integration Report

**Project:** CraftEgon CCS (`ccs.craftegon.com`)  
**Workspace:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs`  
**Report Focus:** Razorpay Sandbox Checkout, Authoritative Pricing Integrity, HMAC Verification & Webhook Idempotency  
**Execution Timestamp:** 2026-10-19  

---

## 1. Payment Provider Architecture & Sandbox Configuration

CraftEgon CCS integrates with **Razorpay Sandbox** (`RAZORPAY_SANDBOX`) as the primary payment gateway for Indian corporate services, retainer subscriptions, and statutory compliance packages.

### Provider Details & Boundaries
- **Provider:** Razorpay (Sandbox Environment).
- **Mode:** `sandbox` / `test` (using `rzp_test_*` credentials).
- **Live Payments:** **STRICTLY DISABLED**. Live payment credentials are not present, and production subscriptions cannot be billed.
- **Credential Storage:** Private server-side configuration (`src/backend/config.js`), loaded via environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`). No secret or private key is bundled into frontend code.
- **Environment Documentation:** `.env.example` provides documentation with placeholder names only.

---

## 2. Server-Authoritative Pricing & Checkout Gating

Under the Phase 3 architecture, the browser **never** specifies the payment amount. All amounts are calculated server-side in Indian paise (1 INR = 100 paise) with explicit 18% GST calculation.

### 2.1 Phase 2 Commercial Pricing Gate
In Phase 2, all 54 active services in `data/pricing.json` were cataloged with `verification_status: "UNVERIFIED"`. The payment controller enforces that checkout on these services is strictly blocked:

```javascript
// Rule: Unapproved Phase 2 services cannot be purchased
if (!servicePrice || servicePrice.verification_status !== 'VERIFIED' || servicePrice.commercial_approval_state !== 'COMMERCIALLY_APPROVED') {
  res.writeHead(422, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({
    error: 'Unprocessable Entity',
    code: 'PRICING_UNVERIFIED_CHECKOUT_BLOCKED',
    message: `Commercial pricing for service '${service_id}' has not received formal executive approval and is blocked from checkout.`
  }));
}
```

### 2.2 Dedicated Non-Commercial Sandbox Fixture
To validate the end-to-end payment gateway without making unapproved commercial claims, a dedicated non-commercial test fixture is provided:
- **Fixture Identifier:** `SANDBOX_TEST_FIXTURE` / `Sandbox Test Tier`
- **Subtotal:** 500,000 paise (₹5,000.00)
- **18% GST:** 90,000 paise (₹900.00)
- **Total Amount:** 590,000 paise (₹5,900.00)

### 2.3 Client Tampering Rejection
If a client attempts to submit a modified amount (e.g., submitting `amount_total_paise: 100` instead of `5898820`), the server completely ignores the client parameter and enforces the authoritative catalog calculation.

---

## 3. Order Persistence & Idempotency

When an order is created (`POST /api/v1/payments/create-order`):
1. **Order Reference:** Generated as `ORD-<year>-<hex>` (e.g., `ORD-2026-F8A3B2`).
2. **Gateway Order ID:** Created and mapped to the order record (e.g., `order_9c71a392b5`).
3. **Idempotency Hash:** SHA-256 hash of `userId:tier_name:cycle:totalPaise`. Duplicate requests within the payment pending window return the existing order with `is_idempotent_replay: true`.
4. **Initial Status:** `PAYMENT_PENDING`.

---

## 4. Payment Verification & HMAC Signature Security

When a customer completes sandbox checkout, Razorpay issues a callback containing three parameters:
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

### HMAC Verification Formula
In `handleVerifyPayment` (`src/backend/controllers/payment.controller.js`):
```javascript
const expectedSignature = crypto
  .createHmac('sha256', config.razorpayKeySecret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  // Reject forged signature with HTTP 400 INVALID_PAYMENT_SIGNATURE
}
```

### Verification Tests Executed
1. **Missing Fields:** Returns HTTP 400 (`MISSING_PAYMENT_FIELDS`).
2. **Forged Signature:** Returns HTTP 400 (`INVALID_PAYMENT_SIGNATURE`).
3. **Cross-Tenant Verification Attempt:** Customer B attempting to verify Customer A's order returns HTTP 403 (`Forbidden`).
4. **Valid Signature:** Transitions order to authoritative status `PAID` with timestamp.
5. **Idempotent Re-verification:** Subsequent verification calls acknowledge status `PAID` without side effects.

---

## 5. Webhook Security, Idempotency & Replay Defense

The webhook endpoint (`POST /api/v1/payments/webhook`) processes asynchronous events from Razorpay.

### Security Controls
1. **Raw Body Stream Signature:** Validates the `X-Razorpay-Signature` header by computing HMAC-SHA256 across the unparsed UTF-8 stream bytes.
2. **Event Idempotency Cache:** Processed event IDs (`event.id`) are tracked in memory. Replay events or duplicate deliveries return HTTP 200 with `status: "ignored_duplicate"`.
3. **Amount & Currency Integrity Verification:** When receiving `payment.captured`, the payload's `amount` and `currency` are compared against the authoritative database record. If an attacker tampers with the webhook amount, the order is flagged `PAYMENT_FAILED` and the webhook is rejected with HTTP 400 (`AMOUNT_MISMATCH`).
4. **Payment Failure Handling:** Events with `payment.failed` transition the order to `PAYMENT_FAILED` with the gateway error reason recorded in the audit trail.

---

## 6. Multi-Tenant Order Queries & RLS Isolation

- **List Orders (`GET /api/v1/portal/orders`):** Authenticated clients see only their own subscription orders.
- **Get Order (`GET /api/v1/portal/orders/:ref`):** Cross-tenant lookup returns HTTP 404 (`Not Found`) with zero leakage.
- **Compliance Staff Queries:** Staff roles (`compliance_operator`, `managing_partner`) can inspect orders across all tenants for billing audits and statutory reconciliation.
