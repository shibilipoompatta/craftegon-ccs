/**
 * CraftEgon CCS - Base Transactional Email Provider
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

class BaseEmailProvider {
  constructor(name = 'base', options = {}) {
    this.name = name;
    this.options = options;
    this.timeoutMs = options.timeoutMs || 5000;
  }

  /**
   * Validates standard message shape
   */
  validateMessage(message) {
    if (!message || typeof message !== 'object') {
      throw new Error('Email message must be a valid object');
    }
    if (!message.to || typeof message.to !== 'string' || !message.to.includes('@')) {
      throw new Error('A valid recipient email address (to) is required');
    }
    if (!message.subject || typeof message.subject !== 'string' || !message.subject.trim()) {
      throw new Error('Email subject is required');
    }
    if (!message.text && !message.html) {
      throw new Error('Email must contain either text or html content');
    }
  }

  /**
   * Executes send operation with a timeout guard
   */
  async send(message) {
    this.validateMessage(message);

    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error(`Email provider '${this.name}' delivery timed out after ${this.timeoutMs}ms`);
        err.code = 'EMAIL_DELIVERY_TIMEOUT';
        reject(err);
      }, this.timeoutMs);
    });

    try {
      const result = await Promise.race([
        this.performSend(message),
        timeoutPromise
      ]);
      return result;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Abstract method to be overridden by child providers
   */
  async performSend(message) {
    throw new Error(`performSend not implemented on ${this.name}`);
  }
}

module.exports = {
  BaseEmailProvider
};
