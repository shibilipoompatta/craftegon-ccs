/**
 * CraftEgon CCS - Alert Controller
 * Manages customer notification consent and preferences,
 * tenant-isolated alert listing, alert dispatching, and delivery audit logs.
 */

const { requireAuth } = require('../middleware/auth-guard');
const { alertRepository } = require('../storage/alert-repository');

// Deterministic test delivery adapter (simulates email/SMS delivery provider)
class StandardDeliveryAdapter {
  constructor(shouldFailTransiently = false, shouldFailPermanently = false) {
    this.shouldFailTransiently = shouldFailTransiently;
    this.shouldFailPermanently = shouldFailPermanently;
    this.callCount = 0;
  }

  async send(params) {
    this.callCount++;

    if (this.shouldFailPermanently) {
      return {
        success: false,
        is_permanent: true,
        error: 'HARD_BOUNCE: Invalid recipient mailbox address'
      };
    }

    if (this.shouldFailTransiently && this.callCount === 1) {
      return {
        success: false,
        is_permanent: false,
        error: 'GATEWAY_TIMEOUT: Delivery provider temporarily unreachable'
      };
    }

    return {
      success: true,
      message_id: `MSG-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    };
  }
}

async function handleGetPreferences(req, res, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const prefs = await alertRepository.getPreferences(user.user_id, {
    userId: user.user_id,
    role: user.role
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    preferences: prefs
  }));
}

async function handleUpdatePreferences(req, res, config, body) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (!body || typeof body !== 'object') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'Body must be a valid preferences object'
    }));
  }

  const updated = await alertRepository.updatePreferences(user.user_id, body, {
    userId: user.user_id,
    role: user.role
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message: 'Notification preferences and consent updated successfully',
    preferences: updated
  }));
}

async function handleListAlerts(req, res, config) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const alerts = await alertRepository.listAlerts(user.user_id, {
    userId: user.user_id,
    role: user.role
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total: alerts.length,
    alerts
  }));
}

async function handleDispatchAlert(req, res, config, body, customAdapter = null) {
  // Only authenticated staff or internal system can trigger alert dispatches
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return;

  if (!body || !body.account_id || !body.event_id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Bad Request',
      message: 'account_id and event_id are required fields'
    }));
  }

  const adapter = customAdapter || new StandardDeliveryAdapter();
  const dispatchResult = await alertRepository.dispatchAlert(body, adapter, {
    userId: user.user_id,
    role: user.role
  });

  const statusCode = dispatchResult.success ? 200 : 422;
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dispatchResult));
}

async function handleListDeliveryLogs(req, res, config) {
  // Restricted strictly to compliance operators and partners
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return;

  const logs = await alertRepository.listDeliveryLogs({
    userId: user.user_id,
    role: user.role
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    total_logs: logs.length,
    logs
  }));
}

module.exports = {
  StandardDeliveryAdapter,
  handleGetPreferences,
  handleUpdatePreferences,
  handleListAlerts,
  handleDispatchAlert,
  handleListDeliveryLogs
};
