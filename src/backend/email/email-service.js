/**
 * CraftEgon CCS - Transactional Email Service
 * Provides a provider-neutral application-level email interface.
 * Decouples business logic from outbound transport providers.
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

const { MemoryEmailProvider } = require('./providers/memory-provider');
const { NoopEmailProvider } = require('./providers/noop-provider');
const { SmtpEmailProvider } = require('./providers/smtp-provider');
const {
  renderRegistrationVerification,
  renderPasswordRecovery,
  renderEnquiryReceipt,
  renderStaffEnquiryNotification
} = require('./templates/email-templates');
const { maskPii, recordAuditEvent } = require('../middleware/audit-logger');

class EmailService {
  constructor(config = {}) {
    this.config = config;
    this.providerName = (config.emailProvider || 'memory').toLowerCase();
    this.provider = this._initializeProvider(this.providerName, config);
  }

  configure(config = {}) {
    this.config = Object.assign({}, this.config, config);
    this.providerName = (this.config.emailProvider || 'memory').toLowerCase();
    this.provider = this._initializeProvider(this.providerName, this.config);
    return this;
  }

  _initializeProvider(name, config) {
    const options = {
      timeoutMs: config.emailTimeoutMs || 5000,
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      pass: config.smtpPass
    };

    switch (name) {
      case 'memory':
      case 'test':
        return new MemoryEmailProvider(options);
      case 'noop':
        return new NoopEmailProvider(options);
      case 'smtp':
        return new SmtpEmailProvider(options);
      default:
        // Default to safe memory provider in development/test
        return new MemoryEmailProvider(options);
    }
  }

  /**
   * Indicates whether transactional email delivery is configured and enabled
   */
  isDeliveryConfigured() {
    if (!this.config.emailDeliveryEnabled) {
      return false;
    }
    if (this.providerName === 'smtp') {
      return this.provider.isConfigured();
    }
    return Boolean(this.provider);
  }

  /**
   * Internal generic dispatcher with audit logging and safe error wrapping
   */
  async sendEmail({ to, subject, text, html, metadata = {} }) {
    if (!this.isDeliveryConfigured()) {
      return {
        success: false,
        reason: 'EMAIL_DELIVERY_DISABLED',
        message: 'Outbound email delivery is not configured or is disabled in environment.'
      };
    }

    const from = this.config.emailFrom || 'compliance@craftegon.local';
    const message = { from, to, subject, text, html, metadata };

    try {
      const result = await this.provider.send(message);

      // Audit log event with zero message body or raw credentials
      recordAuditEvent({
        event_type: 'TRANSACTIONAL_EMAIL_DISPATCHED',
        actor_role: 'system',
        target_entity: 'email_service',
        target_id: result.messageId || 'MSG_UNKNOWN',
        client_ip_hash: '127.0.0.1',
        action_status: 'SUCCESS',
        metadata: {
          recipient_masked: maskPii(to, 'email'),
          template: metadata.template || 'generic',
          provider: this.providerName
        }
      });

      return result;
    } catch (err) {
      // Safe error recording without exposing credentials or payload
      recordAuditEvent({
        event_type: 'TRANSACTIONAL_EMAIL_FAILED',
        actor_role: 'system',
        target_entity: 'email_service',
        target_id: metadata.template || 'generic',
        client_ip_hash: '127.0.0.1',
        action_status: 'FAILED',
        metadata: {
          recipient_masked: maskPii(to, 'email'),
          error_code: err.code || 'EMAIL_DELIVERY_FAILED',
          provider: this.providerName
        }
      });

      return {
        success: false,
        error: err.message,
        code: err.code || 'EMAIL_DELIVERY_FAILED'
      };
    }
  }

  /**
   * 1. Registration Verification Workflow
   */
  async sendRegistrationVerification({ to, name, token, expiresAt }) {
    const appUrl = (this.config.emailAppUrl || 'http://localhost:8080').replace(/\/$/, '');
    const verificationUrl = `${appUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;

    const { subject, text, html } = renderRegistrationVerification({
      name,
      verificationUrl,
      token,
      expiresAt
    });

    return await this.sendEmail({
      to,
      subject,
      text,
      html,
      metadata: {
        template: 'registration_verification',
        expiresAt
      }
    });
  }

  /**
   * 2. Password Recovery Workflow
   */
  async sendPasswordRecovery({ to, name, token, expiresAt }) {
    const appUrl = (this.config.emailAppUrl || 'http://localhost:8080').replace(/\/$/, '');
    const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const { subject, text, html } = renderPasswordRecovery({
      name,
      resetUrl,
      token,
      expiresAt
    });

    return await this.sendEmail({
      to,
      subject,
      text,
      html,
      metadata: {
        template: 'password_recovery',
        expiresAt
      }
    });
  }

  /**
   * 3. Enquiry Receipt Workflow
   */
  async sendEnquiryReceipt({ to, name, leadReference, serviceId, verticalId }) {
    const { subject, text, html } = renderEnquiryReceipt({
      name,
      leadReference,
      serviceId,
      verticalId
    });

    return await this.sendEmail({
      to,
      subject,
      text,
      html,
      metadata: {
        template: 'enquiry_receipt',
        leadReference
      }
    });
  }

  /**
   * 4. Staff Enquiry Notification Workflow
   */
  async sendStaffEnquiryNotification({ to, leadReference, serviceId, verticalId, contactName }) {
    const recipient = to || this.config.emailStaffRecipient || 'compliance-desk@craftegon.local';
    const { subject, text, html } = renderStaffEnquiryNotification({
      leadReference,
      serviceId,
      verticalId,
      contactName
    });

    return await this.sendEmail({
      to: recipient,
      subject,
      text,
      html,
      metadata: {
        template: 'staff_enquiry_notification',
        leadReference
      }
    });
  }

  // Test inspection utilities
  getSentEmails() {
    if (this.provider && typeof this.provider.getSentEmails === 'function') {
      return this.provider.getSentEmails();
    }
    return [];
  }

  clearSentEmails() {
    if (this.provider && typeof this.provider.clear === 'function') {
      this.provider.clear();
    }
  }
}

// Singleton instance wired to currentConfig
const { currentConfig } = require('../config');
const emailService = new EmailService(currentConfig);

module.exports = {
  EmailService,
  emailService
};
