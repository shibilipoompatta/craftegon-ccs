const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../legal/refund.html');
let html = fs.readFileSync(filePath, 'utf8');

const startMarker = '<h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">\r\n        1. Professional Retainer';
const startMarkerLF = '<h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">\n        1. Professional Retainer';

let startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  startIdx = html.indexOf(startMarkerLF);
}
if (startIdx === -1) {
  startIdx = html.indexOf('1. Professional Retainer &amp; Subscription Cancellation');
  if (startIdx !== -1) {
    startIdx = html.lastIndexOf('<h2', startIdx);
  }
}

const endMarker = '</article>';
const endIdx = html.indexOf(endMarker, startIdx);

console.log('Found indices:', startIdx, endIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers');
  process.exit(1);
}

const replacement = `      <!-- 1. Four-Tier Cancellation & Refund Schedule -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2.25rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        1. Tiered Professional Fee Cancellation Matrix
      </h2>
      <p>
        CraftEgon CCS operates on a transparent, milestone-driven resource commitment model. When an engagement is booked, professional time is immediately reserved across Practicing Company Secretaries (PCS), Chartered Accountants, and corporate legal specialists. Cancellations of professional fee components are governed strictly by the execution stage of the engagement:
      </p>

      <div style="overflow-x: auto; margin: 1.5rem 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px;">
          <thead>
            <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1; text-align: left;">
              <th style="padding: 0.75rem 1rem; color: #1E293B;">Milestone Tier</th>
              <th style="padding: 0.75rem 1rem; color: #1E293B;">Cancellation Window</th>
              <th style="padding: 0.75rem 1rem; color: #1E293B;">Professional Fee Refund</th>
              <th style="padding: 0.75rem 1rem; color: #1E293B;">Accounting Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #065F46;">Tier 1: Pre-Allocation</td>
              <td style="padding: 0.75rem 1rem;">Within 2 hours of payment, prior to specialist assignment</td>
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #10B981;">100% Refund</td>
              <td style="padding: 0.75rem 1rem; font-size: 0.82rem; color: #64748B;">Minus 2.5% standard payment gateway transaction charge.</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1E40AF;">Tier 2: Post-Allocation</td>
              <td style="padding: 0.75rem 1rem;">After specialist assignment &amp; preliminary conflict check, before drafting</td>
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #2563EB;">80% Refund</td>
              <td style="padding: 0.75rem 1rem; font-size: 0.82rem; color: #64748B;">20% retained towards KYC verification, conflict screening, and dossier setup.</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #9A3412;">Tier 3: Active Drafting</td>
              <td style="padding: 0.75rem 1rem;">Statutory instruments, resolutions, or webforms actively drafted</td>
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #D97706;">50% Refund</td>
              <td style="padding: 0.75rem 1rem; font-size: 0.82rem; color: #64748B;">50% retained towards professional drafting hours expended by qualified personnel.</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #991B1B;">Tier 4: Uploaded / Filed</td>
              <td style="padding: 0.75rem 1rem;">Form uploaded to MCA / GSTN / IP India or SRN challan generated</td>
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #DC2626;">0% (Non-Refundable)</td>
              <td style="padding: 0.75rem 1rem; font-size: 0.82rem; color: #64748B;">Statutory deliverable fully discharged and submitted to Government portal.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. Pure Agent Fiduciary Escrow -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        2. Pure Agent Escrow &amp; Statutory Government Disbursements
      </h2>
      <p>
        In accordance with <strong>Rule 33 of the Central Goods and Services Tax (CGST) Rules, 2017</strong>, CraftEgon CCS acts strictly as a <em>Pure Agent</em> of the client when receiving advances towards statutory government fees, RoC filing challans, MCA late fees, state stamp duties, and Trade Marks Registry examination charges:
      </p>
      <ul style="padding-left: 1.25rem; font-size: 0.95rem; line-height: 1.7;">
        <li><strong>Fiduciary Custody:</strong> All statutory government outlays are held in a designated client escrow ledger separate from operational professional revenues.</li>
        <li><strong>100% Pre-Challan Refund:</strong> If an engagement is terminated prior to the generation of the official government challan or payment gateway transmission, 100% of all unspent statutory outlays are immediately returned to the client without deductions.</li>
        <li><strong>Zero Post-Challan Refund:</strong> Once an official Service Request Number (SRN), MCA PayGov challan, GST portal CPIN/CIN, or IP India transaction receipt has been generated, statutory funds are irrevocably transferred into the Consolidated Fund of India or respective State Government treasury. These disbursements are strictly non-refundable by CraftEgon CCS.</li>
        <li><strong>Zero Commercial Markup:</strong> CraftEgon CCS levies zero markup, zero commission, and zero transaction premium on statutory government fees. All government challans are delivered to the client at exact statutory face value.</li>
      </ul>

      <!-- 3. Quality Guarantee & Defect Remediation -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        3. Service Quality Guarantee &amp; Defect Remediation
      </h2>
      <p>
        Every statutory deliverable undergoes multi-tier pre-scrutiny by a qualified Practicing Company Secretary or Chartered Accountant. In the event of a regulatory query, defect notice, or resubmission requirement:
      </p>
      <ul style="padding-left: 1.25rem; font-size: 0.95rem; line-height: 1.7;">
        <li><strong>Errors Attributable to CCS:</strong> If a resubmission notice or defect is raised by the Registrar of Companies (CRC/RoC), GST authorities, or Trade Marks Registry due to an internal drafting error, clerical omission, or procedural fault of CraftEgon CCS, all remediation, re-drafting, and re-filing work will be executed at <strong>₹0 additional professional fee</strong>.</li>
        <li><strong>Errors Attributable to Client Inputs:</strong> If a resubmission or rejection arises from false information, altered documents, forged identity proofs, unverified OTP delays exceeding statutory limits, or failure to disclose material facts by the client, rectifications are billed at standard hourly rates or discounted filing fees.</li>
      </ul>

      <!-- 4. Portal Outages & Force Majeure -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        4. Government Portal Outages &amp; Force Majeure
      </h2>
      <p>
        CraftEgon CCS maintains active uptime monitoring across MCA V3, GSTN, ICEGATE, and IP India portals. However, CraftEgon CCS cannot be held liable for statutory late fees, filing rejections, or processing delays arising exclusively from:
      </p>
      <ul style="padding-left: 1.25rem; font-size: 0.95rem; line-height: 1.7;">
        <li>Prolonged downtime, session crashes, or V3 login lockouts of the Ministry of Corporate Affairs portal.</li>
        <li>Bank payment gateway failures on Bharatkosh, PayGov, or State e-Treasury platforms.</li>
        <li>Adjudication delays within government departments or judicial tribunal registries.</li>
      </ul>
      <p style="font-size: 0.92rem; color: #475569;">
        In all such events, CraftEgon CCS logs formal technical helpdesk tickets with the respective government nodal agency (e.g., MCA Service Desk) and provides contemporaneous proof of timely submission attempts.
      </p>

      <!-- 5. Refund Processing Timeline -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        5. Refund Settlement Timeline &amp; Method
      </h2>
      <p>
        Approved refunds are processed in strict accordance with Reserve Bank of India (RBI) payment settlement guidelines:
      </p>
      <ul style="padding-left: 1.25rem; font-size: 0.95rem; line-height: 1.7;">
        <li><strong>Credit Timeline:</strong> Refunds are initiated within <strong>2 business days</strong> of approval and typically credit back to the source account within <strong>5 to 7 business days</strong>.</li>
        <li><strong>Source Instrument Settlement:</strong> Under anti-money laundering (PMLA 2002) guidelines, refunds are strictly remitted to the original payment source instrument (credit card, net banking account, or UPI handle). Cash refunds or third-party bank transfers are prohibited.</li>
      </ul>

      <!-- 6. Grievance Redressal -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        6. Statutory Grievance Redressal Mechanism
      </h2>
      <p>
        In compliance with <strong>Rule 5(3) of the Consumer Protection (E-Commerce) Rules, 2020</strong>, CraftEgon CCS has appointed a designated Grievance Redressal Officer to address all client escalations, cancellation disputes, and refund reviews:
      </p>
      <div style="background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 8px; padding: 1.25rem 1.5rem; margin: 1rem 0; font-size: 0.9rem; line-height: 1.6;">
        <strong style="color: #0F172A; display: block; margin-bottom: 0.25rem;">Nodal Grievance Redressal Officer:</strong>
        <span>Principal Corporate Secretarial Lead &bull; Compliance Desk</span><br>
        <span><strong>Email:</strong> <a href="mailto:corporate.secretarial@craftegon.com" style="color: var(--navy-800); font-weight: 600;">corporate.secretarial@craftegon.com</a></span><br>
        <span><strong>Address:</strong> Cyber Park Road, Corporate Heights, Bangalore, Karnataka 560001</span><br>
        <span style="font-size: 0.82rem; color: #64748B; margin-top: 0.5rem; display: block;">
          Acknowledgement SLA: Within 48 business hours &bull; Final Redressal SLA: Within 30 business days.
        </span>
      </div>

      <!-- 7. How to Request Cancellation -->
      <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--charcoal, var(--text-dark));">
        7. How to Initiate a Cancellation Request
      </h2>
      <p>
        To request a cancellation, submit an email to <a href="mailto:corporate.secretarial@craftegon.com" style="color: var(--navy-800); font-weight: 600;">corporate.secretarial@craftegon.com</a> with the subject line <code>"Cancellation Request: [Invoice / Order Number]"</code>, including:
      </p>
      <ol style="padding-left: 1.25rem; font-size: 0.92rem; line-height: 1.6; margin-bottom: 2rem;">
        <li>Original payment invoice or transaction reference ID.</li>
        <li>Entity name and registered email address.</li>
        <li>Specific service name and reason for cancellation.</li>
      </ol>
    `;

html = html.slice(0, startIdx) + replacement + html.slice(endIdx);
fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully upgraded legal/refund.html with institutional refund and cancellation policy.');
