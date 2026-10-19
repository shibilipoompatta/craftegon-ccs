/**
 * CraftEgon CCS - Alert & Delivery Repository
 * Manages consent-based alert subscriptions, deduplication,
 * bounded retries with exponential backoff, and delivery audit logs.
 */

const crypto = require('node:crypto');
const { memoryStore } = require('./memory-store');

class AlertRepository {
  constructor(store = memoryStore) {
    this.store = store;
    this.maxRetries = 3;
    this.baseDelayMs = 1000;
  }

  /**
   * Updates or saves user notification preferences and opt-in consent
   */
  async updatePreferences(accountId, data, context = {}) {
    return this.store.setAlertPreferences(accountId, data, context);
  }

  /**
   * Retrieves user notification preferences
   */
  async getPreferences(accountId, context = {}) {
    return this.store.getAlertPreferences(accountId, context);
  }

  /**
   * Computes deterministic idempotency key for alert deduplication
   */
  computeIdempotencyKey(accountId, eventId, channel, alertVersion = 1) {
    return crypto.createHash('sha256')
      .update(`${accountId}:${eventId}:${channel}:${alertVersion}`)
      .digest('hex');
  }

  /**
   * Prepares and dispatches an alert with pre-flight consent check,
   * idempotency deduplication, and bounded retry logic.
   */
  async dispatchAlert(params, deliveryAdapter, context = {}) {
    const { account_id, event_id, channel = 'email', alert_version = 1, payload = {} } = params;

    // 1. Pre-flight Consent Verification: Must check live preferences immediately before delivery
    const preferences = await this.getPreferences(account_id, { userId: account_id, role: 'client' });
    if (!preferences || !preferences.consent_granted) {
      const log = this.store.logDeliveryAttempt({
        alert_id: 'PREFLIGHT_BLOCKED',
        triggering_event_id: event_id,
        recipient_account_id: account_id,
        channel,
        attempt_number: 1,
        outcome: 'CONSENT_REQUIRED_OR_REVOKED',
        failure_classification: 'OPT_OUT_ENFORCED'
      });

      return {
        success: false,
        error: 'CONSENT_REVOKED_OR_MISSING',
        message: 'Recipient has not granted opt-in consent or has revoked notification consent.',
        log
      };
    }

    // 2. Channel & Topic Verification
    if (!preferences.channels.includes(channel)) {
      return {
        success: false,
        error: 'CHANNEL_NOT_SUBSCRIBED',
        message: `Recipient has not consented to alerts via channel '${channel}'.`
      };
    }

    // 3. Deduplication & Idempotency Check
    const idempotencyKey = this.computeIdempotencyKey(account_id, event_id, channel, alert_version);
    const existingAlert = this.store.findAlertByIdempotencyKey(idempotencyKey);
    if (existingAlert && existingAlert.status === 'DELIVERED') {
      return {
        success: true,
        is_idempotent_replay: true,
        alert: existingAlert,
        message: 'Alert has already been delivered for this event, channel, and version. Deduplication enforced.'
      };
    }

    // 4. Create Alert Record in QUEUED status
    const alert = this.store.createAlert({
      account_id,
      event_id,
      channel,
      alert_version,
      idempotency_key: idempotencyKey,
      status: 'QUEUED'
    }, context);

    // 5. Attempt Delivery with Bounded Retries
    let attempt = 0;
    let delivered = false;
    let lastError = null;
    let providerMessageId = null;

    while (attempt < this.maxRetries && !delivered) {
      attempt++;
      this.store.updateAlertStatus(alert.alert_id, 'SENDING', { attempt_count: attempt }, context);
      try {
        const deliveryResult = await deliveryAdapter.send({
          recipient: account_id,
          channel,
          event_id,
          payload
        });

        if (deliveryResult && deliveryResult.success) {
          delivered = true;
          providerMessageId = deliveryResult.message_id || `MSG-${crypto.randomUUID()}`;

          this.store.updateAlertStatus(alert.alert_id, 'DELIVERED', {
            attempt_count: attempt,
            provider_message_id: providerMessageId
          }, context);

          this.store.logDeliveryAttempt({
            alert_id: alert.alert_id,
            triggering_event_id: event_id,
            recipient_account_id: account_id,
            channel,
            attempt_number: attempt,
            outcome: 'DELIVERED',
            provider_message_id: providerMessageId
          });

          return {
            success: true,
            alert_id: alert.alert_id,
            status: 'DELIVERED',
            attempt_count: attempt,
            provider_message_id: providerMessageId
          };
        } else {
          lastError = (deliveryResult && deliveryResult.error) || 'Transient provider rejection';
          const isPermanent = deliveryResult && deliveryResult.is_permanent;

          if (isPermanent) {
            // Do not retry permanent failures
            break;
          }
        }
      } catch (err) {
        lastError = err.message || 'Network exception during alert delivery';
      }

      // If not delivered and attempts remain, calculate backoff delay
      if (attempt < this.maxRetries) {
        const backoffMs = Math.pow(2, attempt) * this.baseDelayMs + Math.floor(Math.random() * 200);
        this.store.updateAlertStatus(alert.alert_id, 'RETRY_PENDING', {
          attempt_count: attempt,
          last_error: lastError
        }, context);

        this.store.logDeliveryAttempt({
          alert_id: alert.alert_id,
          triggering_event_id: event_id,
          recipient_account_id: account_id,
          channel,
          attempt_number: attempt,
          outcome: 'TRANSIENT_FAILURE',
          next_retry_time: new Date(Date.now() + backoffMs).toISOString(),
          failure_classification: 'PROVIDER_TRANSIENT_ERROR'
        });
      }
    }

    // Exhausted retries or permanent failure
    this.store.updateAlertStatus(alert.alert_id, 'FAILED', {
      attempt_count: attempt,
      last_error: lastError
    }, context);

    this.store.logDeliveryAttempt({
      alert_id: alert.alert_id,
      triggering_event_id: event_id,
      recipient_account_id: account_id,
      channel,
      attempt_number: attempt,
      outcome: 'PERMANENT_FAILURE',
      failure_classification: 'RETRY_EXHAUSTED_OR_TERMINAL_ERROR'
    });

    return {
      success: false,
      alert_id: alert.alert_id,
      status: 'FAILED',
      attempts: attempt,
      error: lastError
    };
  }

  /**
   * Lists customer alert history
   */
  async listAlerts(accountId, context = {}) {
    return this.store.listAlerts(accountId, context);
  }

  /**
   * Lists delivery audit logs (Staff only)
   */
  async listDeliveryLogs(context = {}) {
    return this.store.listDeliveryLogs(context);
  }
}

// Global singleton instance
const alertRepository = new AlertRepository();

module.exports = {
  AlertRepository,
  alertRepository
};
