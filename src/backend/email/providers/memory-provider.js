/**
 * CraftEgon CCS - Memory / Test Transactional Email Provider
 * Stores sent messages in-memory for testing and offline development.
 * Guarantees zero external network requests.
 */

const crypto = require('node:crypto');
const { BaseEmailProvider } = require('./base-provider');

class MemoryEmailProvider extends BaseEmailProvider {
  constructor(options = {}) {
    super('memory', options);
    this.sentEmails = [];
    this.maxEmails = options.maxEmails || 1000;
    this.simulatedError = null;
    this.simulatedDelayMs = 0;
  }

  async performSend(message) {
    if (this.simulatedDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.simulatedDelayMs));
    }

    if (this.simulatedError) {
      const err = typeof this.simulatedError === 'string'
        ? new Error(this.simulatedError)
        : this.simulatedError;
      throw err;
    }

    const messageId = `mem_${crypto.randomUUID()}`;
    const record = {
      messageId,
      from: message.from || 'compliance@craftegon.local',
      to: message.to,
      subject: message.subject,
      text: message.text || null,
      html: message.html || null,
      metadata: message.metadata || {},
      timestamp: new Date().toISOString()
    };

    this.sentEmails.push(record);
    if (this.sentEmails.length > this.maxEmails) {
      this.sentEmails.shift();
    }

    return {
      success: true,
      messageId,
      provider: 'memory',
      timestamp: record.timestamp
    };
  }

  getSentEmails() {
    return [...this.sentEmails];
  }

  findEmail(predicate) {
    return this.sentEmails.find(predicate) || null;
  }

  clear() {
    this.sentEmails = [];
    this.simulatedError = null;
    this.simulatedDelayMs = 0;
  }

  simulateFailure(error = 'Simulated email provider network failure') {
    this.simulatedError = error;
  }

  simulateTimeout(delayMs = 10000) {
    this.simulatedDelayMs = delayMs;
  }

  restoreNormal() {
    this.simulatedError = null;
    this.simulatedDelayMs = 0;
  }
}

module.exports = {
  MemoryEmailProvider
};
