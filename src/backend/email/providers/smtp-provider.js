/**
 * CraftEgon CCS - SMTP Transactional Email Provider Skeleton
 * Provides a provider interface for future SMTP relay integration (e.g. AWS SES Mumbai / Postmark).
 * Fails closed if invoked without genuine verified credentials.
 */

const { BaseEmailProvider } = require('./base-provider');

class SmtpEmailProvider extends BaseEmailProvider {
  constructor(options = {}) {
    super('smtp', options);
    this.host = options.host || process.env.SMTP_HOST || null;
    this.port = options.port || parseInt(process.env.SMTP_PORT || '587', 10);
    this.user = options.user || process.env.SMTP_USER || null;
    this.pass = options.pass || process.env.SMTP_PASS || null;
    this.secure = options.secure !== undefined ? Boolean(options.secure) : (this.port === 465);
  }

  isConfigured() {
    return Boolean(this.host && this.user && this.pass);
  }

  async performSend(message) {
    if (!this.isConfigured()) {
      const err = new Error('SMTP provider is unconfigured. Missing required SMTP host, username, or password credentials.');
      err.code = 'SMTP_UNCONFIGURED';
      throw err;
    }

    // Explicit fail-safe: real outbound delivery requires an approved external provider and credentials.
    // In current environment, no external SMTP connection is initiated without verified setup.
    const err = new Error('External SMTP network transmission is restricted pending verified subprocessor approval.');
    err.code = 'EXTERNAL_TRANSMISSION_RESTRICTED';
    throw err;
  }
}

module.exports = {
  SmtpEmailProvider
};
