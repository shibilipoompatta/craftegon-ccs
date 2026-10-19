/**
 * CraftEgon CCS - Idempotency & Duplicate Suppression
 * Uses deterministic SHA-256 content hashing to deduplicate submissions within a 15-minute window
 */

const crypto = require('node:crypto');

const idempotencyStore = new Map();

function computeContentHash(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const canonicalString = JSON.stringify({
    email: (payload.email || '').trim().toLowerCase(),
    phone: (payload.phone || '').replace(/\D/g, ''),
    service_id: (payload.service_id || '').trim(),
    vertical_id: (payload.vertical_id || '').trim()
  });
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

function getIdempotencyRecord(hash) {
  if (!hash) return null;
  const record = idempotencyStore.get(hash);
  if (!record) return null;

  if (Date.now() > record.expiresAt) {
    idempotencyStore.delete(hash);
    return null;
  }

  return record;
}

function setIdempotencyRecord(hash, responseData, ttlMs = 900000) {
  if (!hash) return;
  idempotencyStore.set(hash, {
    response: responseData,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlMs
  });
}

function clearIdempotencyStore() {
  idempotencyStore.clear();
}

module.exports = {
  computeContentHash,
  getIdempotencyRecord,
  setIdempotencyRecord,
  clearIdempotencyStore
};
