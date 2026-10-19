/**
 * CraftEgon CCS - HMAC-SHA256 Signed Download URL Generator & Verifier
 * Pure Node.js built-ins. Issues short-lived, tamper-proof download URLs.
 */

const crypto = require('node:crypto');

const DEFAULT_EXPIRATION_SECONDS = 900; // 15 minutes

/**
 * Generate a short-lived presigned download URL with HMAC-SHA256 signature
 */
function generateSignedDownloadUrl(documentId, storagePath, secret, expiresInSeconds = DEFAULT_EXPIRATION_SECONDS) {
  if (!documentId || !storagePath || !secret) {
    throw new Error('MISSING_PARAMETERS: documentId, storagePath, and secret are required');
  }

  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${documentId}:${storagePath}:${expires}`;
  const sig = crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const downloadPath = `/api/v1/documents/${documentId}/download?expires=${expires}&sig=${sig}`;

  return {
    downloadUrl: downloadPath,
    expiresAt: expires,
    expiresInSeconds
  };
}

/**
 * Verify a signed download URL against the document ID, storage path, expiry, and secret
 */
function verifySignedDownloadUrl(documentId, storagePath, expiresStr, sigHex, secret) {
  if (!documentId || !storagePath || !expiresStr || !sigHex || !secret) {
    return { valid: false, reason: 'MISSING_URL_PARAMETERS' };
  }

  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires)) {
    return { valid: false, reason: 'MALFORMED_EXPIRATION_TIMESTAMP' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    return { valid: false, reason: 'EXPIRED_URL' };
  }

  const expectedPayload = `${documentId}:${storagePath}:${expires}`;
  const expectedSig = crypto.createHmac('sha256', secret)
    .update(expectedPayload)
    .digest('hex');

  const sigBuf = Buffer.from(sigHex, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');

  if (sigBuf.length !== expectedBuf.length) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  // Constant-time comparison
  const matches = crypto.timingSafeEqual(sigBuf, expectedBuf);
  if (!matches) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  return { valid: true, reason: null };
}

module.exports = {
  DEFAULT_EXPIRATION_SECONDS,
  generateSignedDownloadUrl,
  verifySignedDownloadUrl
};
