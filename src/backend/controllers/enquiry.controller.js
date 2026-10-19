/**
 * CraftEgon CCS - Enquiry Controller
 * Handles public lead intake and staff retrieval
 */

const { validateEnquiryPayload, generateLeadReference } = require('../models/enquiry.model');
const { resolveClientIp, hashIp } = require('../middleware/ip-resolver');
const { checkRateLimit } = require('../middleware/rate-limiter');
const { computeContentHash, getIdempotencyRecord, setIdempotencyRecord } = require('../middleware/idempotency');
const { maskPii, recordAuditEvent } = require('../middleware/audit-logger');
const { requireAuth } = require('../middleware/auth-guard');
const { enquiryRepository } = require('../storage/enquiry-repository');

async function handleCreateEnquiry(req, res, config, body) {
  const clientIp = resolveClientIp(req, config.trustedProxies);
  const ipHash = hashIp(clientIp, config.ipHashSalt);

  // 1. Anti-Bot: Honeypot trap check
  if (body && (body._hp_website || body._hp_email || body._hp_name)) {
    recordAuditEvent({
      event_type: 'BOT_TRAP_TRIGGERED',
      actor_role: 'bot',
      target_entity: 'lead_enquiries',
      target_id: 'HONEYPOT',
      client_ip_hash: ipHash,
      action_status: 'BLOCKED',
      metadata: { reason: 'Honeypot field populated' }
    });
    // Silently return 201 to disorient automated spammers
    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      lead_reference: `LEAD-${new Date().getFullYear()}-000000`,
      message: 'Your corporate enquiry has been received.'
    }));
  }

  // 2. Anti-Bot: Submission Speed Threshold
  if (body && body._render_time) {
    const elapsed = Date.now() - parseInt(body._render_time, 10);
    if (!isNaN(elapsed) && elapsed < config.botMinTimeMs) {
      recordAuditEvent({
        event_type: 'BOT_SPEED_TRIGGERED',
        actor_role: 'bot',
        target_entity: 'lead_enquiries',
        target_id: 'SPEED_VIOLATION',
        client_ip_hash: ipHash,
        action_status: 'BLOCKED',
        metadata: { elapsed_ms: elapsed, threshold_ms: config.botMinTimeMs }
      });
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: 'Submission completed unnaturally fast. Automated bot behavior suspected.'
      }));
    }
  }

  // 3. Sliding-Window Rate Limiting
  const rateLimitResult = checkRateLimit(ipHash, config.rateLimitWindowMs, config.rateLimitMaxRequests);
  if (!rateLimitResult.allowed) {
    recordAuditEvent({
      event_type: 'RATE_LIMIT_EXCEEDED',
      actor_role: 'anon',
      target_entity: 'lead_enquiries',
      target_id: ipHash,
      client_ip_hash: ipHash,
      action_status: 'BLOCKED',
      metadata: { current: rateLimitResult.current, max: rateLimitResult.max }
    });
    res.writeHead(429, {
      'Content-Type': 'application/json',
      'Retry-After': String(rateLimitResult.retryAfterSeconds)
    });
    return res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${config.rateLimitMaxRequests} requests per 10-minute window allowed.`,
      retry_after_seconds: rateLimitResult.retryAfterSeconds
    }));
  }

  // 4. Idempotency & Duplicate Suppression
  const contentHash = computeContentHash(body);
  if (contentHash) {
    const cached = getIdempotencyRecord(contentHash);
    if (cached) {
      recordAuditEvent({
        event_type: 'IDEMPOTENT_DUPLICATE_SUPPRESSED',
        actor_role: 'anon',
        target_entity: 'lead_enquiries',
        target_id: cached.response.lead_reference,
        client_ip_hash: ipHash,
        action_status: 'SUCCESS',
        metadata: { duplicate: true }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ...cached.response,
        idempotent_replay: true
      }));
    }
  }

  // 5. Payload Validation
  const validation = validateEnquiryPayload(body);
  if (!validation.valid) {
    recordAuditEvent({
      event_type: 'ENQUIRY_VALIDATION_FAILED',
      actor_role: 'anon',
      target_entity: 'lead_enquiries',
      target_id: 'VALIDATION_ERROR',
      client_ip_hash: ipHash,
      action_status: 'FAILED',
      metadata: { errors: validation.errors }
    });
    res.writeHead(422, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Unprocessable Entity',
      message: 'Enquiry payload failed validation constraints',
      errors: validation.errors
    }));
  }

  // 6. Persistence via Data Access Layer
  const lead_reference = generateLeadReference();
  let enquiryRecord;
  try {
    enquiryRecord = await enquiryRepository.createEnquiry({
      lead_reference,
      service_id: body.service_id,
      vertical_id: body.vertical_id,
      contact_name: body.contact_name.trim(),
      email_hash: hashIp(body.email.trim().toLowerCase(), 'salt_email'),
      phone_hash: hashIp(body.phone.trim(), 'salt_phone'),
      scope_description: body.scope_description ? body.scope_description.trim() : '',
      source_url: body.source_url ? body.source_url.trim() : '',
      dpdp_consent: body.dpdp_consent
    });
  } catch (err) {
    recordAuditEvent({
      event_type: 'ENQUIRY_PERSISTENCE_FAILED',
      actor_role: 'anon',
      target_entity: 'lead_enquiries',
      target_id: lead_reference,
      client_ip_hash: ipHash,
      action_status: 'FAILED',
      metadata: { error: err.message }
    });
    const statusCode = err.statusCode || 500;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to securely persist enquiry to the storage engine. Please retry shortly.'
    }));
  }

  // 7. Audit Logging (Zero raw PII)
  recordAuditEvent({
    event_type: 'ENQUIRY_ACCEPTED',
    actor_role: 'anon',
    target_entity: 'lead_enquiries',
    target_id: lead_reference,
    client_ip_hash: ipHash,
    action_status: 'SUCCESS',
    metadata: {
      service_id: body.service_id || 'GENERAL',
      vertical_id: body.vertical_id || 'V01',
      masked_email: maskPii(body.email, 'email'),
      masked_phone: maskPii(body.phone, 'phone')
    }
  });

  // 8. Cache response for idempotency
  const responseData = {
    success: true,
    lead_reference,
    status: enquiryRecord.status,
    message: 'Your corporate compliance enquiry was accepted. CraftEgon will follow up via the contact channels provided.',
    data_retention_days: config.leadRetentionDays
  };

  if (contentHash) {
    setIdempotencyRecord(contentHash, responseData, 900000); // 15m
  }

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responseData));
}

async function handleGetEnquiry(req, res, ref, config) {
  const user = await requireAuth(req, res, ['compliance_operator', 'managing_partner']);
  if (!user) return; // Response sent by requireAuth

  const enquiry = await enquiryRepository.getEnquiry(ref, { userId: user.user_id, role: user.role });
  if (!enquiry) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not Found', message: `Lead enquiry '${ref}' not found` }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, enquiry }));
}

module.exports = {
  handleCreateEnquiry,
  handleGetEnquiry
};
