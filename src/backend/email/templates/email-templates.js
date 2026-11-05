/**
 * CraftEgon CCS - Transactional Email Templates
 * Generates structured, accessible text and HTML transactional notifications.
 * Pure Node.js built-ins. Zero external runtime dependencies.
 */

function sanitizeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 1. Customer Registration Verification Template
 */
function renderRegistrationVerification({ name, verificationUrl, token, expiresAt }) {
  const safeName = sanitizeHtml(name || 'Valued Client');
  const safeUrl = sanitizeHtml(verificationUrl);
  const safeToken = sanitizeHtml(token);
  const expiryHours = expiresAt ? Math.round((new Date(expiresAt).getTime() - Date.now()) / 3600000) : 24;

  const subject = 'Verify your CraftEgon Corporate Services account';

  const text = [
    `Dear ${name || 'Valued Client'},`,
    '',
    'Thank you for registering with CraftEgon Corporate Services (CCS).',
    'To complete your onboarding and activate your corporate portal account, please verify your email address:',
    '',
    `Verification Link: ${verificationUrl}`,
    `Verification Code: ${token}`,
    '',
    `This verification link will expire in ${expiryHours > 0 ? expiryHours : 24} hours.`,
    'If you did not register for an account with CraftEgon CCS, please safely disregard this email.',
    '',
    'Sincerely,',
    'CraftEgon Corporate Services Compliance Desk'
  ].join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px;">
          <h2 style="color: #0f172a; margin-top: 0;">Verify Your Account</h2>
          <p>Dear ${safeName},</p>
          <p>Thank you for registering with <strong>CraftEgon Corporate Services</strong>. To activate your corporate portal account, please verify your email address below:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${safeUrl}" style="background-color: #1e40af; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">Or copy and paste this verification code into the portal: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${safeToken}</code></p>
          <p style="font-size: 14px; color: #64748b;">This verification link will expire in <strong>${expiryHours > 0 ? expiryHours : 24} hours</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If you did not initiate this request, no further action is required. Your account will not be activated without verification.</p>
        </div>
      </body>
    </html>
  `.trim();

  return { subject, text, html };
}

/**
 * 2. Password Recovery Template
 */
function renderPasswordRecovery({ name, resetUrl, token, expiresAt }) {
  const safeName = sanitizeHtml(name || 'Valued Client');
  const safeUrl = sanitizeHtml(resetUrl);
  const safeToken = sanitizeHtml(token);
  const expiryMins = expiresAt ? Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000) : 60;

  const subject = 'Password Recovery Request — CraftEgon Corporate Services';

  const text = [
    `Dear ${name || 'Valued Client'},`,
    '',
    'We received a request to reset the password for your CraftEgon Corporate Services account.',
    'To choose a new password, please visit the single-use link below:',
    '',
    `Reset Password Link: ${resetUrl}`,
    `Single-Use Reset Token: ${token}`,
    '',
    `This single-use link is valid for ${expiryMins > 0 ? expiryMins : 60} minutes.`,
    'CraftEgon staff will NEVER ask for your password or reset link.',
    'If you did not make this request, please contact our compliance desk immediately; your password remains unchanged.',
    '',
    'Sincerely,',
    'CraftEgon Corporate Governance & Security Desk'
  ].join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px;">
          <h2 style="color: #0f172a; margin-top: 0;">Password Recovery Request</h2>
          <p>Dear ${safeName},</p>
          <p>We received a request to reset your password for the CraftEgon Corporate Services portal. Click the button below to set a new password:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${safeUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">Or use reset token: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${safeToken}</code></p>
          <p style="font-size: 14px; color: #64748b;">This link is single-use and will expire in <strong>${expiryMins > 0 ? expiryMins : 60} minutes</strong>.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-top: 16px;">
            <p style="font-size: 13px; color: #991b1b; margin: 0;"><strong>Security Reminder:</strong> CraftEgon staff will never ask for your password or reset token. If you did not request this reset, your account credentials remain safe and no action is needed.</p>
          </div>
        </div>
      </body>
    </html>
  `.trim();

  return { subject, text, html };
}

/**
 * 3. Customer Enquiry Receipt Template
 */
function renderEnquiryReceipt({ name, leadReference, serviceId, verticalId }) {
  const safeName = sanitizeHtml(name || 'Valued Client');
  const safeRef = sanitizeHtml(leadReference);
  const safeService = sanitizeHtml(serviceId || 'General Corporate Advisory');
  const safeVertical = sanitizeHtml(verticalId || 'V01');

  const subject = `Corporate Compliance Enquiry Received — [${leadReference}]`;

  const text = [
    `Dear ${name || 'Valued Client'},`,
    '',
    'Thank you for contacting CraftEgon Corporate Services.',
    'Your enquiry has been successfully logged into our compliance intake system:',
    '',
    `Lead Reference: ${leadReference}`,
    `Service Category: ${verticalId}`,
    `Service ID: ${serviceId}`,
    '',
    'Our compliance advisory desk will review your requirements and reach out via your registered contact channels within 1 business day.',
    'Under our statutory DPDP Act 2023 compliance framework, your data is handled strictly in accordance with our data protection policy.',
    '',
    'Sincerely,',
    'CraftEgon Corporate Services Client Desk'
  ].join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px;">
          <h2 style="color: #0f172a; margin-top: 0;">Enquiry Received</h2>
          <p>Dear ${safeName},</p>
          <p>Thank you for submitting your corporate compliance enquiry. Your request has been logged into our intake system with the following reference details:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Lead Reference:</strong> <code style="color: #1e40af;">${safeRef}</code></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Vertical:</strong> ${safeVertical}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Service:</strong> ${safeService}</p>
          </div>
          <p style="font-size: 14px; color: #475569;">Our compliance advisory desk will review your scope description and follow up within one business day.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">CraftEgon Corporate Services adheres strictly to the Digital Personal Data Protection (DPDP) Act 2023.</p>
        </div>
      </body>
    </html>
  `.trim();

  return { subject, text, html };
}

/**
 * 4. Staff Enquiry Notification Template
 */
function renderStaffEnquiryNotification({ leadReference, serviceId, verticalId, contactName }) {
  const safeRef = sanitizeHtml(leadReference);
  const safeService = sanitizeHtml(serviceId || 'General Advisory');
  const safeVertical = sanitizeHtml(verticalId || 'V01');
  const safeName = sanitizeHtml(contactName || 'Corporate Client');

  const subject = `[ACTION REQUIRED] New Corporate Compliance Enquiry — ${leadReference}`;

  const text = [
    'CraftEgon Compliance Operations Desk Notification:',
    '',
    `A new lead enquiry has been submitted and persisted to the storage engine:`,
    `Lead Reference: ${leadReference}`,
    `Contact Name: ${contactName}`,
    `Vertical: ${verticalId}`,
    `Service ID: ${serviceId}`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    'Please authenticate to the operational console to review and triage this lead:',
    'Console URL: /admin',
    '',
    'CraftEgon Compliance Desk Dispatcher'
  ].join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px;">
          <h2 style="color: #991b1b; margin-top: 0;">New Enquiry Logged</h2>
          <p>A new client enquiry has been validated and persisted. Triage is required within statutory/SLA timelines:</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Lead Reference:</strong> <code>${safeRef}</code></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Contact:</strong> ${safeName}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Vertical:</strong> ${safeVertical}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Service ID:</strong> ${safeService}</p>
          </div>
          <p style="font-size: 14px;"><a href="/admin" style="color: #1e40af; font-weight: 600;">Log in to Admin Console &rarr;</a></p>
        </div>
      </body>
    </html>
  `.trim();

  return { subject, text, html };
}

module.exports = {
  renderRegistrationVerification,
  renderPasswordRecovery,
  renderEnquiryReceipt,
  renderStaffEnquiryNotification
};
