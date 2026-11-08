/**
 * ============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - GOOGLE DRIVE & SHEETS SYNC SCRIPT
 * Version: 2.0.0 (Production)
 * ============================================================================
 *
 * HOW TO INSTALL IN GOOGLE DRIVE:
 * 1. Open your Google Drive: https://drive.google.com
 * 2. Open or create the Google Sheet: "CraftEgon CCS — Client Inquiries & Intake"
 *    (This is the same sheet linked to your Google Form)
 * 3. In the top menu, click: Extensions > Apps Script
 * 4. Delete any code in the editor, and paste this entire script.
 * 5. Click "Save" (disk icon).
 * 6. Click the blue "Deploy" button (top right) > "New deployment"
 * 7. Click the gear icon next to "Select type" > choose "Web app"
 * 8. Set the settings:
 *    - Description: "CraftEgon CCS Website Intake Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (allows website visitors to submit securely)
 * 9. Click "Deploy" > "Authorize access" > choose your CraftEgon Google account.
 * 10. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 11. Paste that URL into assets/js/config.js under `googleWorkspace.webhookUrl`.
 *
 * RESULT:
 * Every inquiry from ANY page on https://ccs.craftegon.com will immediately
 * create a new row in this Google Sheet in Google Drive, and send an email
 * alert to admin@craftegon.com!
 * ============================================================================
 */

const NOTIFICATION_EMAIL = "admin@craftegon.com";
const SHEET_NAME = "Website Inquiries"; // or leave blank to use the active sheet

function setupHeaders(sheet) {
  const headers = [
    "Timestamp",
    "Lead Reference",
    "Full Name / Signatory",
    "Work Email",
    "Mobile / WhatsApp",
    "Entity / Company Name",
    "Entity Type / Jurisdiction",
    "Reg. ID (CIN / GSTIN / PAN / DIN)",
    "Service Requested",
    "Scope & Requirements",
    "Website Source URL",
    "DPDP Consent"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#1E293B");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("#F8FAFC");
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : null;
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }
    
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }
    
    const timestamp = new Date();
    const leadRef = "CCS-" + Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyyMMdd-HHmmss");
    
    const row = [
      Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
      leadRef,
      data.name || data.contact_name || data.director_name || data.applicant_name || "Prospective Client",
      data.email || "",
      data.phone || data.mobile || "",
      data.company_name || data.entity_name || data.startup_name || "",
      data.entity_type || data.state || "",
      data.reg_number || data.cin || data.gstin || data.pan || data.din || "",
      data.service_name || data.service || data.service_id || "General Corporate Compliance",
      data.scope || data.scope_description || data.notes || data.message || "",
      data.source_url || data.source_path || "Website Intake",
      data.dpdp_consent ? "Consent Granted" : "Yes"
    ];
    
    sheet.appendRow(row);
    
    // Send email alert to admin@craftegon.com
    try {
      sendNotificationEmail(row, leadRef);
    } catch (mailErr) {
      Logger.log("Email notification error: " + mailErr.toString());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      lead_reference: leadRef,
      message: "Compliance inquiry successfully recorded into CraftEgon Google Drive ledger."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotificationEmail(row, leadRef) {
  const subject = "⚡ New Client Compliance Inquiry: " + row[5] + " (" + row[8] + ") [" + leadRef + "]";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.5;">
      <div style="background: #090d16; padding: 20px; border-radius: 8px 8px 0 0; color: #ffffff;">
        <h2 style="margin: 0; color: #f59e0b; font-size: 18px;">CraftEgon Corporate Services</h2>
        <p style="margin: 5px 0 0; font-size: 13px; color: #94a3b8;">New Website Compliance Inquiry • Reference: <strong>${leadRef}</strong></p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; background: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 35%;">Client Name:</td><td style="padding: 8px 0; font-weight: bold;">${row[2]}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email Address:</td><td style="padding: 8px 0;"><a href="mailto:${row[3]}">${row[3]}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Mobile / WhatsApp:</td><td style="padding: 8px 0;"><a href="https://wa.me/${String(row[4]).replace(/[^0-9]/g, '')}">${row[4]}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Company / Entity:</td><td style="padding: 8px 0; font-weight: bold;">${row[5]}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Registration ID:</td><td style="padding: 8px 0; font-family: monospace;">${row[7] || 'None specified'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Service Required:</td><td style="padding: 8px 0; color: #2563eb; font-weight: bold;">${row[8]}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Scope / Notes:</td><td style="padding: 8px 0; white-space: pre-wrap;">${row[9] || 'Standard onboarding inquiry'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Source Page:</td><td style="padding: 8px 0; font-size: 12px; color: #64748b;">${row[10]}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #64748b;">
          Recorded directly to Google Drive Sheet: <strong>CraftEgon CCS — Client Inquiries & Intake</strong>.<br/>
          Operational Desk: Alappuzha, Kerala • Phone: +91 86069 18247
        </div>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "CraftEgon CCS Google Drive Intake Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
