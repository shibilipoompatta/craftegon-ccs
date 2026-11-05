/**
 * CraftEgon CCS - No-Op Email Provider
 * Silently drops all outbound emails without side effects.
 */

const crypto = require('node:crypto');
const { BaseEmailProvider } = require('./base-provider');

class NoopEmailProvider extends BaseEmailProvider {
  constructor(options = {}) {
    super('noop', options);
  }

  async performSend(message) {
    return {
      success: true,
      messageId: `noop_${crypto.randomUUID()}`,
      provider: 'noop',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  NoopEmailProvider
};
