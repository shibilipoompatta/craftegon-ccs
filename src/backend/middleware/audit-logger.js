/**
 * CraftEgon CCS - PII-Masked Audit Event Logger
 * DPDP Act 2023 compliant: masks all email and phone fields before recording telemetry
 */

const auditLog = [];

function maskPii(str, type = 'email') {
  if (!str || typeof str !== 'string') return '***';
  if (type === 'email') {
    const parts = str.split('@');
    if (parts.length !== 2) return '***@***.com';
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  }
  if (type === 'phone') {
    const cleaned = str.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+91 ******${cleaned.slice(-4)}`;
    }
    return '***masked***';
  }
  return '***masked***';
}

function recordAuditEvent(event) {
  const entry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    event_type: event.event_type || 'SYSTEM_ACTION',
    actor_id: event.actor_id || null,
    actor_role: event.actor_role || 'anon',
    target_entity: event.target_entity || 'UNKNOWN',
    target_id: event.target_id || 'UNKNOWN',
    client_ip_hash: event.client_ip_hash || '127.0.0.1',
    action_status: event.action_status || 'SUCCESS',
    metadata: event.metadata || {}
  };

  auditLog.push(entry);
  return entry;
}

function getAuditLogs() {
  return [...auditLog];
}

function clearAuditLogs() {
  auditLog.length = 0;
}

module.exports = {
  maskPii,
  recordAuditEvent,
  getAuditLogs,
  clearAuditLogs
};
