/**
 * CraftEgon Corporate Services (CCS) - Lead Intake Prototype
 * 
 * Local-only backend baseline handler for enquiry and lead tracking.
 * Pure Node.js built-ins only (zero external runtime dependencies).
 * 
 * ===========================================================================
 * ARCHITECTURAL CONTEXT & DEVELOPMENT BOUNDARY:
 * 1. LOCAL DEVELOPMENT ONLY: This module is an in-memory prototype baseline.
 * 2. VOLATILE STATE: Rate-limiting, idempotency caches, and lead stores reside
 *    strictly in-memory. They vanish upon process restart and do NOT provide
 *    distributed coordination across clustered nodes or serverless functions.
 * 3. NO PRODUCTION CLAIMS: Do not claim distributed protection or durable
 *    duplicate prevention until backed by an ACID PostgreSQL database with a
 *    UNIQUE index on (idempotency_hash) and a distributed rate limiter (e.g. Redis/WAF).
 * ===========================================================================
 * 
 * Key Capabilities:
 * 1. Safe Direct-Connection IP Resolution (X-Forwarded-For ignored unless proxy is trusted).
 * 2. Strict Input Validation & Canonical Phase 2 Relational Integrity (service_id <-> vertical_id).
 * 3. Referral-Only Route & Litigation Boundary Enforcement (Advocates Act 1961 compliance).
 * 4. Safe Payload Size & Stream Management (immediate memory release, connection close).
 * 5. Spam Protection (honeypot field + submission speed analysis).
 * 6. Sliding-Window Rate Limiting via Salted IP Hashes.
 * 7. Idempotency & Duplicate Suppression (deterministic SHA-256 content hashing).
 * 8. Masked Audit Event Logging (zero PII, zero tokens, zero filesystem paths, zero secrets).
 * 9. Safe Error Shielding (zero stack traces or internal paths exposed to clients).
 */

const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// ---------------------------------------------------------------------------
// Configuration Constants & Defaults (Local Baseline)
// ---------------------------------------------------------------------------
const MAX_PAYLOAD_BYTES = 32 * 1024; // 32 KB maximum payload
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 submissions per 10m per IP hash
const IDEMPOTENCY_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MIN_SUBMISSION_TIME_MS = 2000; // Under 2 seconds = suspected bot
const RETENTION_DAYS = 180; // DPDP Act 2023 unconverted lead retention limit

// Cache of Phase 2 Service Registry, Verticals & Referral Routes
let serviceRegistryCache = null;
let verticalsCache = null;
let referralRoutesCache = null;
let canonicalRoutesCache = null;

function loadPhase2Registry() {
  if (serviceRegistryCache && verticalsCache && referralRoutesCache && canonicalRoutesCache) {
    return { services: serviceRegistryCache, verticals: verticalsCache, referralRoutes: referralRoutesCache, canonicalRoutes: canonicalRoutesCache };
  }

  try {
    const dataDir = path.resolve(__dirname, '../../data');
    const regPath = path.join(dataDir, 'service-registry.json');
    const vertPath = path.join(dataDir, 'verticals.json');

    serviceRegistryCache = new Map();
    verticalsCache = new Set();
    referralRoutesCache = new Set();
    canonicalRoutesCache = new Map();

    // Canonical & Defensive Referral Route Boundaries:
    // Approved canonical routes:
    // 1. /services/director-removal-board-disputes.html
    // 2. /services/nclt-insolvency-defense.html
    // 3. /services/oppression-mismanagement-petitions.html
    // Plus defensive report alias:
    // - /services/strike-off-company-closure.html
    // - /services/commercial-disputes-litigation.html
    referralRoutesCache.add('/services/strike-off-company-closure.html');
    referralRoutesCache.add('/services/commercial-disputes-litigation.html');

    if (fs.existsSync(regPath) && fs.existsSync(vertPath)) {
      const regData = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      const vertData = JSON.parse(fs.readFileSync(vertPath, 'utf8'));

      const list = Array.isArray(regData) ? regData : (regData.services || []);
      for (const item of list) {
        if (item.service_id) {
          serviceRegistryCache.set(item.service_id, item);
        }
        if (item.canonical_route) {
          canonicalRoutesCache.set(item.canonical_route, item);
        }
        if (item.record_status === 'REFERRAL_ONLY' && item.canonical_route) {
          referralRoutesCache.add(item.canonical_route);
        }
      }

      const vList = Array.isArray(vertData) ? vertData : (vertData.verticals || []);
      for (const v of vList) {
        if (v.vertical_id) {
          verticalsCache.add(v.vertical_id);
        }
      }
    }
  } catch (err) {
    serviceRegistryCache = new Map();
    verticalsCache = new Set();
    referralRoutesCache = new Set();
    canonicalRoutesCache = new Map();
  }

  return { services: serviceRegistryCache, verticals: verticalsCache, referralRoutes: referralRoutesCache, canonicalRoutes: canonicalRoutesCache };
}

// ---------------------------------------------------------------------------
// In-Memory Volatile Stores (Development / Prototype Only)
// ---------------------------------------------------------------------------
// WARNING: In-memory stores reset upon process restart or crash.
const rateLimitStore = new Map(); // ipHash -> [timestamps]
const idempotencyStore = new Map(); // idempotencyHash -> { lead_reference, timestamp, response }
const leadStore = new Map(); // lead_reference -> leadRecord
const auditLog = []; // in-memory audit log entries

// ---------------------------------------------------------------------------
// Client IP Resolution (Safe Direct-Connection Strategy)
// ---------------------------------------------------------------------------
/**
 * Resolves the client IP address using a safe direct-connection strategy.
 * By default, forwarding headers (X-Forwarded-For, CF-Connecting-IP, X-Real-IP)
 * are COMPLETELY IGNORED to prevent IP spoofing attacks.
 * 
 * They are evaluated if and only if the socket remoteAddress matches an
 * explicitly configured trusted proxy list.
 */
function resolveClientIp(req, options = {}) {
  const directPeerIp = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '127.0.0.1';
  
  // Extract trusted proxy configuration (options override or process.env)
  let trustedProxies = options.trustedProxies;
  if (!trustedProxies && process.env.TRUSTED_PROXIES) {
    trustedProxies = process.env.TRUSTED_PROXIES.split(',').map(s => s.trim()).filter(Boolean);
  }

  const isTrusted = Array.isArray(trustedProxies) && trustedProxies.length > 0 && trustedProxies.includes(directPeerIp);

  if (!isTrusted) {
    // Direct connection strategy: Ignore all forwarding headers
    return directPeerIp;
  }

  // Trusted proxy mode: inspect Cloudflare header first, then leftmost X-Forwarded-For
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[0];
    }
  }

  return directPeerIp;
}

// ---------------------------------------------------------------------------
// Utility & Sanitization Functions
// ---------------------------------------------------------------------------
function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

function hashIP(ip, salt = 'craftegon-local-salt-baseline') {
  if (!ip) ip = '127.0.0.1';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16);
}

function maskPII(str, type = 'email') {
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

function generateLeadReference() {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LEAD-${year}-${randomHex}`;
}

// ---------------------------------------------------------------------------
// Validation Logic (Schema, Canonical Registry & Relational Integrity)
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateLeadPayload(payload) {
  const errors = [];
  const { services, verticals, referralRoutes, canonicalRoutes } = loadPhase2Registry();

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: [{ field: 'body', issue: 'Request body must be a valid JSON object' }] };
  }

  // 1. Referral-Only Route & Canonical Service Status Check
  // NOTE: Regulatory notices and statutory assertions regarding Advocates Act 1961
  // professional-practice restrictions are unapproved draft copy pending qualified legal review.
  if (payload.source_url && typeof payload.source_url === 'string') {
    const route = payload.source_url.trim().toLowerCase();
    const canonicalRouteRecord = canonicalRoutes && canonicalRoutes.has(route) ? canonicalRoutes.get(route) : null;

    if (canonicalRouteRecord && canonicalRouteRecord.record_status === 'REFERRAL_ONLY') {
      errors.push({
        field: 'source_url',
        issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
      });
    } else if (referralRoutes.has(route)) {
      // Defensive alias check (e.g. unrouted strike-off alias, litigation fixtures)
      errors.push({
        field: 'source_url',
        issue: 'Direct self-serve intake is not available for contentious tribunal or courtroom litigation matters under Advocates Act 1961 regulations. Please contact our managing partner desk directly for neutral advocate referral coordination.'
      });
    }
  }

  // 2. Required contact_name
  if (!payload.contact_name || typeof payload.contact_name !== 'string') {
    errors.push({ field: 'contact_name', issue: 'Contact name is required' });
  } else {
    const trimmed = payload.contact_name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      errors.push({ field: 'contact_name', issue: 'Contact name must be between 2 and 100 characters' });
    }
  }

  // 3. Required email
  if (!payload.email || typeof payload.email !== 'string') {
    errors.push({ field: 'email', issue: 'Email address is required' });
  } else {
    const trimmedEmail = payload.email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 254) {
      errors.push({ field: 'email', issue: 'Valid corporate or personal email address required' });
    }
  }

  // 4. Required phone (Indian mobile number format)
  if (!payload.phone || typeof payload.phone !== 'string') {
    errors.push({ field: 'phone', issue: 'Phone number is required' });
  } else {
    const trimmedPhone = payload.phone.trim();
    const digits = trimmedPhone.replace(/[\s\-\(\)]/g, '');
    const isValidPhone = /^(\+91)?[6-9]\d{9}$/.test(digits);
    if (!isValidPhone) {
      errors.push({ field: 'phone', issue: 'Valid 10-digit Indian mobile number required (starting with 6-9, optional +91 prefix)' });
    }
  }

  // 5. Optional entity_name
  if (payload.entity_name !== undefined && payload.entity_name !== null) {
    if (typeof payload.entity_name !== 'string' || payload.entity_name.trim().length > 150) {
      errors.push({ field: 'entity_name', issue: 'Entity name must not exceed 150 characters' });
    }
  }

  // 6. Optional service_id cross-reference
  let matchedService = null;
  if (payload.service_id !== undefined && payload.service_id !== null && payload.service_id !== '') {
    if (typeof payload.service_id !== 'string') {
      errors.push({ field: 'service_id', issue: 'Service ID must be a string' });
    } else {
      const sId = payload.service_id.trim();
      if (services.size > 0) {
        if (!services.has(sId)) {
          errors.push({ field: 'service_id', issue: `Service ID "${sId}" is not recognized in the approved service registry` });
        } else {
          matchedService = services.get(sId);
          if (matchedService.is_referral_only || matchedService.status === 'referral_only' || matchedService.record_status === 'REFERRAL_ONLY') {
            errors.push({ field: 'service_id', issue: `Service "${sId}" is a referral-only practice and cannot accept direct self-serve intake` });
          }
        }
      }
    }
  }

  // 7. Optional vertical_id cross-reference
  let vId = null;
  if (payload.vertical_id !== undefined && payload.vertical_id !== null && payload.vertical_id !== '') {
    if (typeof payload.vertical_id !== 'string') {
      errors.push({ field: 'vertical_id', issue: 'Vertical ID must be a string' });
    } else {
      vId = payload.vertical_id.trim();
      if (verticals.size > 0 && !verticals.has(vId)) {
        errors.push({ field: 'vertical_id', issue: `Vertical ID "${vId}" is not recognized in approved practice verticals` });
      }
    }
  }

  // 8. Relational Consistency Check: service_id <-> vertical_id
  if (matchedService && vId) {
    const primary = matchedService.primary_vertical_id;
    const related = matchedService.related_vertical_ids || [];
    const isMatching = (vId === primary) || related.includes(vId);

    if (!isMatching) {
      errors.push({
        field: 'vertical_id',
        issue: `Vertical ID "${vId}" does not match service "${matchedService.service_id}" (canonical primary: "${primary}"${related.length ? ', related: ' + related.join(', ') : ''})`
      });
    }
  }

  // 9. Optional scope_description
  if (payload.scope_description !== undefined && payload.scope_description !== null) {
    if (typeof payload.scope_description !== 'string' || payload.scope_description.length > 2000) {
      errors.push({ field: 'scope_description', issue: 'Scope description must not exceed 2000 characters' });
    }
  }

  // 10. Consent verification (DPDP Act 2023 compliance)
  if (payload.consent_agreed !== true) {
    errors.push({ field: 'consent_agreed', issue: 'Explicit consent to the processing of compliance enquiry data is required' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ---------------------------------------------------------------------------
// Spam & Rate Limit Handling
// ---------------------------------------------------------------------------
function checkSpamAndBot(payload) {
  // Honeypot check: _hp_website must be empty string or undefined
  if (payload._hp_website && typeof payload._hp_website === 'string' && payload._hp_website.trim() !== '') {
    return { isSpam: true, reason: 'SPAM_HONEYPOT_TRIGGERED' };
  }

  // Timing check: _t_token contains timestamp when form rendered
  if (payload._t_token !== undefined && payload._t_token !== null) {
    const renderTime = Number(payload._t_token);
    const now = Date.now();
    if (!isNaN(renderTime) && now - renderTime < MIN_SUBMISSION_TIME_MS) {
      return { isSpam: true, reason: 'SPAM_SUBMISSION_TOO_FAST' };
    }
  }

  return { isSpam: false };
}

function checkRateLimit(ipHash) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let timestamps = rateLimitStore.get(ipHash) || [];
  // Filter timestamps within current window
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestTimestamp = timestamps[0];
    const retryAfterSec = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { limited: true, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  timestamps.push(now);
  rateLimitStore.set(ipHash, timestamps);
  return { limited: false };
}

function checkIdempotency(payload, clientKey) {
  const now = Date.now();
  let idempotencyKey = clientKey;

  if (!idempotencyKey) {
    // Generate deterministic hash from (email + service_id + scope + 15m window bucket)
    const email = (payload.email || '').trim().toLowerCase();
    const serviceId = (payload.service_id || '').trim();
    const scope = (payload.scope_description || '').trim();
    const timeBucket = Math.floor(now / IDEMPOTENCY_WINDOW_MS);
    idempotencyKey = crypto.createHash('sha256')
      .update(`${email}:${serviceId}:${scope}:${timeBucket}`)
      .digest('hex');
  }

  if (idempotencyStore.has(idempotencyKey)) {
    const existing = idempotencyStore.get(idempotencyKey);
    if (now - existing.timestamp < IDEMPOTENCY_WINDOW_MS) {
      return { isDuplicate: true, existingRecord: existing };
    }
  }

  return { isDuplicate: false, idempotencyKey };
}

/**
 * Records structured audit events with strict PII and secret shielding.
 * Zero raw request bodies, tokens, secrets, or internal paths are logged.
 */
function recordAuditEvent(eventType, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    details: {
      ...details,
      email_masked: details.email ? maskPII(details.email, 'email') : undefined,
      phone_masked: details.phone ? maskPII(details.phone, 'phone') : undefined
    }
  };

  // Strip all sensitive, PII, and security fields
  delete entry.details.email;
  delete entry.details.phone;
  delete entry.details.raw_payload;
  delete entry.details.payload;
  delete entry.details.token;
  delete entry.details._t_token;
  delete entry.details.secret;
  delete entry.details.stack;
  delete entry.details.filepath;

  auditLog.push(entry);
  return entry;
}

// ---------------------------------------------------------------------------
// Lead Processing Engine
// ---------------------------------------------------------------------------
function processLeadSubmission(rawBody, headers = {}, clientIp = '127.0.0.1') {
  const ipHash = hashIP(clientIp);

  // 1. Rate Limit Verification
  const rateLimitResult = checkRateLimit(ipHash);
  if (rateLimitResult.limited) {
    recordAuditEvent('lead.rate_limited', { ip_hash: ipHash, retry_after: rateLimitResult.retryAfterSec });
    return {
      statusCode: 429,
      body: {
        success: false,
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many submissions received. Please wait before submitting another enquiry, or contact us directly on WhatsApp.',
        retry_after_seconds: rateLimitResult.retryAfterSec
      }
    };
  }

  // 2. Parse JSON Payload
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    recordAuditEvent('lead.malformed_json', { ip_hash: ipHash });
    return {
      statusCode: 400,
      body: {
        success: false,
        error_code: 'INVALID_JSON',
        message: 'Request body must be valid JSON format'
      }
    };
  }

  // 3. Spam and Bot Detection
  const spamCheck = checkSpamAndBot(payload);
  if (spamCheck.isSpam) {
    recordAuditEvent('lead.spam_detected', {
      ip_hash: ipHash,
      reason: spamCheck.reason,
      email: payload.email,
      phone: payload.phone
    });
    // Silent containment: return 200 with generic notice to avoid alerting spambots
    return {
      statusCode: 200,
      body: {
        success: true,
        status: 'QUARANTINED',
        lead_reference: 'LEAD-HOLD-VERIFY',
        message: 'Your compliance inquiry has been received and queued for security screening.'
      }
    };
  }

  // 4. Input Validation & Schema Checks
  const validation = validateLeadPayload(payload);
  if (!validation.valid) {
    recordAuditEvent('lead.validation_failed', {
      ip_hash: ipHash,
      error_count: validation.errors.length,
      fields: validation.errors.map(e => e.field)
    });
    return {
      statusCode: 422,
      body: {
        success: false,
        error_code: 'VALIDATION_FAILED',
        message: 'Invalid submission payload. Please check input requirements.',
        details: validation.errors
      }
    };
  }

  // 5. Idempotency & Duplicate Suppression
  const clientKey = headers['idempotency-key'] || headers['Idempotency-Key'];
  const idempotencyCheck = checkIdempotency(payload, clientKey);
  if (idempotencyCheck.isDuplicate) {
    recordAuditEvent('lead.duplicate_suppressed', {
      ip_hash: ipHash,
      lead_reference: idempotencyCheck.existingRecord.lead_reference
    });
    return {
      statusCode: 200,
      body: {
        success: true,
        status: 'DUPLICATE_SUPPRESSED',
        lead_reference: idempotencyCheck.existingRecord.lead_reference,
        message: 'A matching enquiry was already received recently. Our compliance desk is reviewing your existing submission.',
        estimated_response_hours: 24
      }
    };
  }

  // 6. Record Lead Entity
  const leadReference = generateLeadReference();
  const createdAt = new Date().toISOString();
  const purgeDate = new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const leadRecord = {
    id: crypto.randomUUID(),
    lead_reference: leadReference,
    created_at: createdAt,
    retention_purge_date: purgeDate,
    status: 'NEW',
    contact_name: sanitizeString(payload.contact_name, 100),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    entity_name: payload.entity_name ? sanitizeString(payload.entity_name, 150) : null,
    service_id: payload.service_id ? payload.service_id.trim() : null,
    vertical_id: payload.vertical_id ? payload.vertical_id.trim() : null,
    scope_description: payload.scope_description ? sanitizeString(payload.scope_description, 2000) : null,
    source_url: payload.source_url ? sanitizeString(payload.source_url, 255) : '/index.html',
    consent_recorded: true,
    ip_hash: ipHash
  };

  leadStore.set(leadReference, leadRecord);

  // Store in idempotency cache
  idempotencyStore.set(idempotencyCheck.idempotencyKey, {
    lead_reference: leadReference,
    timestamp: Date.now()
  });

  recordAuditEvent('lead.created', {
    lead_reference: leadReference,
    ip_hash: ipHash,
    service_id: leadRecord.service_id,
    vertical_id: leadRecord.vertical_id,
    email: leadRecord.email,
    phone: leadRecord.phone
  });

  return {
    statusCode: 201,
    body: {
      success: true,
      status: 'ACCEPTED',
      lead_reference: leadReference,
      message: 'Your compliance inquiry has been securely recorded. A corporate governance associate will reach out within 1 business day.',
      estimated_response_hours: 24
    }
  };
}

// ---------------------------------------------------------------------------
// HTTP Request Dispatcher
// ---------------------------------------------------------------------------
function handleLeadSubmission(req, res, options = {}) {
  // CORS & Security Headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Allow OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-CraftEgon-Client');
    res.writeHead(204);
    res.end();
    return;
  }

  // Method guard
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Allow': 'POST' });
    res.end(JSON.stringify({
      success: false,
      error_code: 'METHOD_NOT_ALLOWED',
      message: 'Only POST method is accepted on this endpoint'
    }));
    return;
  }

  // Content-Type validation
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    res.writeHead(415);
    res.end(JSON.stringify({
      success: false,
      error_code: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Content-Type must be application/json'
    }));
    return;
  }

  let bodyChunks = [];
  let bytesReceived = 0;
  let isOverLimit = false;

  req.on('data', chunk => {
    if (isOverLimit) return;

    bytesReceived += chunk.length;
    if (bytesReceived > MAX_PAYLOAD_BYTES) {
      isOverLimit = true;
      bodyChunks = null; // Immediately clear accumulator to release memory

      res.writeHead(413, {
        'Content-Type': 'application/json; charset=utf-8',
        'Connection': 'close',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      });
      res.end(JSON.stringify({
        success: false,
        error_code: 'PAYLOAD_TOO_LARGE',
        message: `Payload exceeds maximum limit of ${MAX_PAYLOAD_BYTES / 1024} KB`
      }));

      // Cleanly terminate socket on response finish to prevent hanging connections
      res.on('finish', () => {
        if (!req.destroyed) {
          req.destroy();
        }
      });

      // Resume reading stream into void to discard incoming kernel buffers safely
      req.resume();
    } else {
      bodyChunks.push(chunk);
    }
  });

  req.on('end', () => {
    if (isOverLimit || res.writableEnded) return;

    const rawBody = Buffer.concat(bodyChunks).toString('utf8');
    const clientIp = resolveClientIp(req, options);

    try {
      const result = processLeadSubmission(rawBody, req.headers, clientIp);
      res.writeHead(result.statusCode);
      res.end(JSON.stringify(result.body));
    } catch (err) {
      // Safe error shielding: never expose stack traces or internal paths to client
      const errorRef = crypto.randomBytes(4).toString('hex');
      recordAuditEvent('lead.internal_error', { error_ref: errorRef });
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal error occurred while processing the enquiry.',
        error_reference: errorRef
      }));
    }
  });
}

// ---------------------------------------------------------------------------
// Server Factory & Public API Export
// ---------------------------------------------------------------------------
function createLeadServer(port = 3001, options = {}) {
  const server = http.createServer((req, res) => handleLeadSubmission(req, res, options));
  return {
    server,
    listen: (callback) => server.listen(port, '127.0.0.1', callback),
    close: (callback) => server.close(callback)
  };
}

module.exports = {
  resolveClientIp,
  validateLeadPayload,
  checkSpamAndBot,
  checkRateLimit,
  checkIdempotency,
  maskPII,
  recordAuditEvent,
  processLeadSubmission,
  handleLeadSubmission,
  createLeadServer,
  _stores: {
    rateLimitStore,
    idempotencyStore,
    leadStore,
    auditLog
  }
};
