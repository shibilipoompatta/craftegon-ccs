# CraftEgon CCS — Phase 4 Alert Delivery & Consent Report

**Document Reference:** CRAFTEGON-DOC-P4-008  
**Audit Date:** 2026-10-20  
**Status:** ALERT DELIVERY & AUDIT LOGGING REPORT  
**Module:** `src/backend/storage/alert-repository.js` & `controllers/alert.controller.js`  

---

## 1. Executive Summary & Delivery Principles

A database row or frontend toast does not constitute proof that an alert reached a customer. Phase 4 implements a server-backed, consent-governed notification engine built around five core safety pillars:

1. **Mandatory Opt-In Consent:** No compliance alert can be dispatched unless the customer has explicitly opted in with verified channels and topics.
2. **Immediate Pre-Flight Re-Verification:** The system re-checks live consent and topic preferences immediately before attempting dispatch. Consent revocation takes effect instantly.
3. **Formal State Machine:** Strict lifecycle transitions: `CREATED` → `QUEUED` → `SENDING` → `DELIVERED` (or `RETRY_PENDING` → `FAILED` / `CANCELLED`).
4. **Idempotency & Deduplication:** Deterministic hashing prevents double-sending or repeat alerting for the same event, recipient, and version.
5. **Bounded Exponential Retries:** Transient provider errors are retried up to 3 times with exponential backoff and jitter. Permanent failures (e.g. hard bounce) terminate immediately without infinite retry storms.
6. **Sanitized Delivery Logs:** Delivery audit trails record provider message IDs, attempt counts, timestamps, and failure classifications without exposing customer PII or provider secrets.

---

## 2. Server-Side Consent Model & Preferences

### 2.1 Consent Fields Stored
- `account_id`: Authenticated customer identifier.
- `consent_granted`: Boolean (`true` / `false`).
- `consent_timestamp`: ISO 8601 timestamp recorded upon opt-in.
- `channels`: Supported channels (`email`, `sms`, `in_app`).
- `topics`: Permitted topics (`MCA_FILINGS`, `TAX_DEADLINES`, `FEMA_NOTIFICATIONS`, `IP_TRADEMARK`, `LABOUR_COMPLIANCE`, `CYBER_ALERTS`).
- `jurisdictions`: Subscribed jurisdictions (`IN-CENTRAL`, `IN-MH`, `IN-DL`, `IN-KA`).
- `frequency`: Digest preference (`IMMEDIATE`, `DAILY_DIGEST`, `WEEKLY_SUMMARY`).

### 2.2 RLS Isolation
Customers can only view and update their own notification preferences (`context.userId === account_id`). Compliance operators and managing partners have administrative read access for compliance audits. Cross-tenant access is strictly blocked.

---

## 3. Idempotency & Deduplication Engine

The alert engine generates a deterministic 64-character SHA-256 idempotency key:

$$\text{IdempotencyKey} = \text{SHA256}(\text{account\_id} \parallel \text{event\_id} \parallel \text{channel} \parallel \text{alert\_version})$$

When an alert dispatch is requested:
1. The repository searches for an existing alert matching this key.
2. If an existing alert with status `DELIVERED` is found, the engine acknowledges the request with `is_idempotent_replay: true` and returns the cached record.
3. The external delivery provider is NOT invoked a second time. This prevents duplicate email blasts or notification spam during batch re-runs.

---

## 4. Bounded Retries with Exponential Backoff

When transient provider errors occur (e.g., gateway timeout or HTTP 503):
- **Maximum Attempts:** 3.
- **Backoff Formula:**

$$\text{DelayMs} = 2^{\text{attempt}} \times 1000\text{ms} + \text{RandomJitter}(0\dots 200\text{ms})$$

- **Transient Failures:** Logged as `outcome: 'TRANSIENT_FAILURE'`, status set to `RETRY_PENDING`, with `next_retry_time` computed.
- **Permanent Failures:** Hard bounces (e.g., invalid mailbox, non-existent recipient) terminate immediately on Attempt 1, setting status directly to `FAILED`.
- **Retry Exhaustion:** If Attempt 3 fails, the alert transitions to terminal `FAILED` status and logs `failure_classification: 'RETRY_EXHAUSTED_OR_TERMINAL_ERROR'`.

---

## 5. Delivery Audit Logs

All delivery attempts are recorded in `MemoryStore.deliveryLogs` (and mapped to PostgreSQL table `compliance_delivery_logs`).

### Log Record Schema:
```json
{
  "log_id": "LOG-550e8400-e29b-41d4-a716-446655440000",
  "alert_id": "ALT-9821-4412",
  "triggering_event_id": "EVT-MCA-AOC4-2026",
  "recipient_account_id": "ACC-TENANT-001",
  "channel": "email",
  "attempt_number": 1,
  "attempt_timestamp": "2026-10-20T00:35:10.123Z",
  "outcome": "DELIVERED",
  "provider_message_id": "MSG-1792149310-8492",
  "next_retry_time": null,
  "failure_classification": null
}
```

### Privacy & Sanitization:
- Zero passwords, raw session tokens, or API credentials logged.
- Full message HTML bodies containing sensitive corporate facts are omitted from logs.
- Audit logs are accessible exclusively to authenticated staff (`compliance_operator`, `managing_partner`). Client accounts cannot view global delivery logs.
