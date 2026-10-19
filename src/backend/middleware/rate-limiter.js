/**
 * CraftEgon CCS - Sliding Window In-Memory Rate Limiter
 * Bounds submission volume per salted client IP hash
 */

const rateLimitStore = new Map();

function checkRateLimit(ipHash, windowMs = 600000, maxRequests = 5) {
  const now = Date.now();
  const cutoff = now - windowMs;

  let timestamps = rateLimitStore.get(ipHash) || [];
  timestamps = timestamps.filter(ts => ts > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldestTimestamp = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return {
      allowed: false,
      current: timestamps.length,
      max: maxRequests,
      retryAfterSeconds: Math.max(1, retryAfterSeconds)
    };
  }

  timestamps.push(now);
  rateLimitStore.set(ipHash, timestamps);

  return {
    allowed: true,
    current: timestamps.length,
    max: maxRequests,
    remaining: maxRequests - timestamps.length
  };
}

function clearRateLimitStore() {
  rateLimitStore.clear();
}

module.exports = {
  checkRateLimit,
  clearRateLimitStore
};
