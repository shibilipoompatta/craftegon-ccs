/**
 * CraftEgon CCS - Safe Direct-Connection IP Resolver
 * Anti-spoofing protection: ignores forwarding headers unless proxy is verified trusted
 */

const crypto = require('node:crypto');

function resolveClientIp(req, trustedProxies = []) {
  const directPeerIp = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '127.0.0.1';
  const isTrusted = Array.isArray(trustedProxies) && trustedProxies.length > 0 && trustedProxies.includes(directPeerIp);

  if (!isTrusted) {
    // Direct connection strategy: ignore all spoofable forwarding headers
    return directPeerIp;
  }

  // Trusted proxy strategy: inspect Cloudflare header first, then leftmost X-Forwarded-For
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

function hashIp(ip, salt = 'craftegon-local-salt-baseline') {
  if (!ip) ip = '127.0.0.1';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16);
}

module.exports = {
  resolveClientIp,
  hashIp
};
