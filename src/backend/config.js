/**
 * CraftEgon Corporate Services (CCS) - Backend Configuration Manager
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function parseEnvList(val) {
  if (!val || typeof val !== 'string') return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function loadDotEnvFiles() {
  const rootDir = path.resolve(__dirname, '../../');
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split('\n').forEach(line => {
          line = line.trim();
          if (!line || line.startsWith('#')) return;
          const idx = line.indexOf('=');
          if (idx !== -1) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            if (process.env[key] === undefined) {
              process.env[key] = val;
            }
          }
        });
      } catch (e) {
        // Safe silent ignore for missing or unreadable files
      }
    }
  }
}

function loadConfig(overrides = {}) {
  loadDotEnvFiles();
  const env = overrides.NODE_ENV || process.env.NODE_ENV || 'development';
  const isDev = env === 'development';
  const isTest = env === 'test';

  const config = {
    env,
    isDev,
    isTest,
    isProd: env === 'production',
    host: overrides.HOST || process.env.HOST || '127.0.0.1',
    port: parseInt(overrides.PORT || process.env.PORT || '3001', 10),
    corsOrigin: overrides.CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:8080',
    
    // Security & Anti-Abuse
    ipHashSalt: overrides.IP_HASH_SALT || process.env.IP_HASH_SALT || 'craftegon-local-salt-baseline',
    rateLimitWindowMs: parseInt(overrides.RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || '600000', 10), // 10m
    rateLimitMaxRequests: parseInt(overrides.RATE_LIMIT_MAX_REQUESTS || process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
    maxPayloadSizeBytes: parseInt(overrides.MAX_PAYLOAD_SIZE_BYTES || process.env.MAX_PAYLOAD_SIZE_BYTES || '32768', 10), // 32 KB
    botMinTimeMs: parseInt(overrides.BOT_DETECTION_MIN_TIME_MS || process.env.BOT_DETECTION_MIN_TIME_MS || '2000', 10),
    trustedProxies: overrides.TRUSTED_PROXIES ? parseEnvList(overrides.TRUSTED_PROXIES) : parseEnvList(process.env.TRUSTED_PROXIES),
    
    // Auth & Session
    jwtSecret: overrides.JWT_SECRET || process.env.JWT_SECRET || 'craftegon-local-test-jwt-secret-do-not-use-in-prod',
    sessionDurationSeconds: parseInt(overrides.SESSION_DURATION_SECONDS || process.env.SESSION_DURATION_SECONDS || '86400', 10),

    // DPDP Act 2023 Statutory Retention
    leadRetentionDays: parseInt(overrides.LEAD_RETENTION_DAYS || process.env.LEAD_RETENTION_DAYS || '180', 10),

    // Document Intake & Scanner Bounds
    maxDocumentSizeBytes: parseInt(overrides.MAX_DOCUMENT_SIZE_BYTES || process.env.MAX_DOCUMENT_SIZE_BYTES || '15728640', 10), // 15 MB
    scannerEnabled: overrides.SCANNER_ENABLED !== undefined ? Boolean(overrides.SCANNER_ENABLED) : (process.env.SCANNER_ENABLED === 'true'),

    // Candidate Providers (Metadata placeholders - zero cloud connections)
    databaseProvider: overrides.DATABASE_PROVIDER || process.env.DATABASE_PROVIDER || 'local_in_memory',
    paymentProvider: overrides.PAYMENT_PROVIDER || process.env.PAYMENT_PROVIDER || 'razorpay_sandbox',
    storageProvider: overrides.STORAGE_PROVIDER || process.env.STORAGE_PROVIDER || 'local_quarantine',

    // Payment Sandbox Settings (Razorpay Sandbox)
    razorpayKeyId: overrides.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
    razorpayKeySecret: overrides.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'craftegon-sandbox-test-secret',
    razorpayWebhookSecret: overrides.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'craftegon-webhook-test-secret'
  };

  return Object.freeze(config);
}

module.exports = {
  loadConfig,
  currentConfig: loadConfig()
};
