const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const desks = [
  {
    file: 'contract-intake.html',
    title: 'Commercial Contracts & Drafting SLA & Checklist',
    sla: '24-48 Hours for Review • 3-5 Days for Bespoke Drafting',
    checklist: [
      'Current draft agreement, MoU, or term sheet (Word/PDF format)',
      'Entity legal details of both parties (CIN/LLPIN, registered office, authorized signatory)',
      'Specific commercial terms: pricing schedules, deliverables, payment milestones, SLA metrics',
      'Special risk provisions required (IP ownership, non-solicitation, jurisdiction, liability caps)',
      'Any prior agreements or amendments being modified or superseded'
    ]
  },
  {
    file: 'cross-border-retainer.html',
    title: 'Cross-Border FDI & FEMA Advisory SLA & Checklist',
    sla: '2-Hour Triage • 24 Hours for Initial Strategy Memo • 3-7 Days Execution',
    checklist: [
      'Certificate of Incorporation and Memorandum & Articles of Association (foreign & Indian entities)',
      'Foreign Inward Remittance Certificate (FIRC) and Know Your Customer (KYC) from AD Bank',
      'Valuation Certificate issued by SEBI Registered Merchant Banker / Chartered Accountant (DCF method)',
      'Board Resolution authorizing inbound/outbound investment and designating authorized signatory',
      'Prior RBI approval letters or past Form FC-GPR / FC-TRS acknowledgment receipts'
    ]
  },
  {
    file: 'csr-audit-form.html',
    title: 'Corporate Social Responsibility (CSR-2) Audit SLA & Checklist',
    sla: '24 Hours for Scope Assessment • 3-5 Days Audit Completion',
    checklist: [
      'Audited financial statements for preceding 3 financial years (Net Profit computation u/s 198)',
      'CSR Committee constitution resolution, meeting agendas, and signed minutes',
      'Approved CSR Policy document and annual action plan approved by the Board',
      'Implementing agency documentation: Form CSR-1 registration, 80G/12A certificates, and MoUs',
      'Project-wise fund disbursement records, impact assessment reports (if spend > ₹10 crore), and unspent CSR bank account statements'
    ]
  },
  {
    file: 'dispute-consultation.html',
    title: 'Corporate Dispute Avoidance (Non-Litigation) SLA & Checklist',
    sla: '2-Hour Urgent Triage • 24-Hour Dossier Review & Strategy Briefing',
    checklist: [
      'Certified copy of Memorandum & Articles of Association (specifically director/shareholder dispute clauses)',
      'Extract of signed Board & General Meeting minutes from the preceding 12-24 months',
      'Statutory notices issued or received (Section 169 director removal, Section 100 EGM requisitions)',
      'Proof of dispatch / receipt of notices (speed post tracking receipts, email acknowledgments)',
      'Current MCA Master Data extract showing active directors, signatories, and charge registers'
    ]
  },
  {
    file: 'dpdp-audit-request.html',
    title: 'DPDP Act Data Privacy & Governance Audit SLA & Checklist',
    sla: '24-48 Hours for Preliminary Gap Map • 5-7 Days Comprehensive Audit',
    checklist: [
      'Current Privacy Policy, Terms of Service, and user-facing data collection notices',
      'Data flow inventory: Categories of personal data collected, stored, processed, and transferred',
      'Consent architecture wireframes/screenshots and consent withdrawal mechanisms',
      'Data Processor / Vendor agreements containing cross-border and third-party processing terms',
      'Information Security policy, breach management SOPs, and Grievance Officer designation details'
    ]
  },
  {
    file: 'fema-consultation.html',
    title: 'RBI & FEMA Statutory Consultation SLA & Checklist',
    sla: '2-Hour Priority Triage • 24-Hour Regulatory Opinion Delivery',
    checklist: [
      'Entity incorporation details (CIN/LLPIN) and current shareholding cap table',
      'Remittance details: Inward/outward remittance challans, AD Bank name, and SWIFT advice copies',
      'Relevant contracts: External Commercial Borrowing (ECB) agreements, ODI agreements, or royalty licenses',
      'Prior filings on RBI FIRMS portal (Single Master Form, FLA annual returns)',
      'Specific transaction timeline and statutory deadline for reporting to Authorized Dealer Bank'
    ]
  },
  {
    file: 'hr-audit.html',
    title: 'Employment & POSH Compliance Audit SLA & Checklist',
    sla: '24 Hours for Document Review • 3-4 Days Audit Report Delivery',
    checklist: [
      'Standard employment contract templates (probation, permanent, executive agreements)',
      'Employee handbook / HR policy manual including code of conduct and leave rules',
      'Internal Complaints Committee (ICC) constitution order and POSH policy document',
      'Annual POSH compliance report submitted to the District Officer (under Section 21)',
      'Statutory registers maintained under Labour Codes (attendance, wages, overtime, deductions)'
    ]
  },
  {
    file: 'license-qualification.html',
    title: 'Statutory Licensing & Registrations SLA & Checklist',
    sla: '2-Hour Assessment • 24-48 Hours Application Filing',
    checklist: [
      'Registered office address proof (lease agreement + electricity bill/tax receipt + owner NOC)',
      'Identity and address proofs of all promoters/directors (PAN, Aadhaar/Passport)',
      'Entity incorporation documents (Certificate of Incorporation, MOA/AOA, or Partnership Deed)',
      'Specific trade requirements: Layout plan, equipment list, medical fitness certificates (FSSAI)',
      'Bank statement or cancelled cheque for bank account validation'
    ]
  },
  {
    file: 'ma-advisory-enquiry.html',
    title: 'Corporate Restructuring & M&A Advisory SLA & Checklist',
    sla: '2-Hour Confidential Triage • 24-48 Hours Preliminary Transaction Memo',
    checklist: [
      'Audited financial statements of both transferor and transferee companies for past 3 years',
      'Detailed schedule of assets and liabilities to be transferred (in case of slump sale)',
      'Proposed transaction structure: Merger (Sec 232), Fast-Track (Sec 233), or Business Purchase',
      'Draft Term Sheet / Letter of Intent (LOI) outlining commercial consideration and timeline',
      'Independent Valuation Report or preliminary balance sheet extract for swap ratio determination'
    ]
  },
  {
    file: 'post-incorporation-checkout.html',
    title: 'Post-Incorporation First 180-Days Filings SLA & Checklist',
    sla: 'Same-Day Initiation • 2-3 Days for INC-20A & Statutory Registers',
    checklist: [
      'Certificate of Incorporation (COI) issued by Central Registration Centre (CRC)',
      'e-Memorandum (INC-33) and e-Articles of Association (INC-34) as approved by MCA',
      'Bank account statement showing credit of initial subscription money from all subscribers',
      'Form INC-20A board resolution approving commencement of business and auditor appointment',
      'Geo-tagged photograph of registered office showing company name board in English and vernacular'
    ]
  },
  {
    file: 'retainer-desk.html',
    title: 'Annual Corporate Compliance Retainer SLA & Checklist',
    sla: '2-Hour Triage • 24-Hour Compliance Gap Assessment • Annual Execution',
    checklist: [
      'Latest filed Form AOC-4 (Financial Statements) and Form MGT-7 (Annual Return) with SRN challans',
      'List of active directors with DIN, designation, appointment date, and DIR-3 KYC status',
      'Audited financial statements, Director’s Report, and Statutory Auditor’s Report for previous FY',
      'Notice, agenda, and minutes of the last Annual General Meeting (AGM) and Board Meetings',
      'Register of Members, Register of Charges, and Register of Significant Beneficial Owners (BEN-2)'
    ]
  },
  {
    file: 'secretarial-audit-scope.html',
    title: 'Form MR-3 Secretarial Audit SLA & Checklist',
    sla: '24 Hours Scoping • 7-10 Days Field Audit & Draft Report Delivery',
    checklist: [
      'Notices, agendas, director attendance records, and signed minutes of all Board and Committee meetings',
      'Minutes of the Annual General Meeting (AGM) and any Extra-Ordinary General Meetings (EGM)',
      'Copies of all MCA e-forms filed during the financial year with official SRN payment receipts',
      'Statutory Registers maintained under Companies Act 2013 (MBP-2, MBP-4, SH-4, Register of Directors)',
      'SEBI / Listing compliance certifications (if applicable to listed / high debt entity)'
    ]
  },
  {
    file: 'tax-intake.html',
    title: 'Corporate Tax, Form 3CEB & Audit SLA & Checklist',
    sla: '2-Hour Triage • 24-Hour Dossier Review • 3-5 Days Return Compilation',
    checklist: [
      'Draft or audited Balance Sheet, Profit & Loss Account, and Notes to Accounts',
      'Tax Audit Report (Form 3CA/3CD) prepared by statutory auditors',
      'For Form 3CEB: Schedule of international transactions and specified domestic transactions with associated enterprises',
      'Transfer pricing documentation study and contemporaneous comparability analysis',
      'Annual Information Statement (AIS) and Form 26AS tax credit reconciliation report'
    ]
  },
  {
    file: 'venture-deal-booking.html',
    title: 'Fundraising Support & Venture Deal SLA & Checklist',
    sla: '2-Hour Confidential Triage • 24-48 Hours Deal Docket Compilation',
    checklist: [
      'Signed Term Sheet or Letter of Intent detailing investment amount, pre-money valuation, and instruments (CCPS/Equity)',
      'Current Cap Table with fully diluted shareholding percentage before the proposed round',
      'Draft Shareholders’ Agreement (SHA) and Share Subscription Agreement (SSA)',
      'Rule 11UA / DCF Valuation Report prepared by SEBI Merchant Banker or Registered Valuer',
      'Draft Board Resolution and EGM Notice for private placement offer letter (Form PAS-4 / PAS-5)'
    ]
  },
  {
    file: 'calculator.html',
    title: 'Statutory Late Fee Calculation SLA & Filing Checklist',
    sla: 'Instant Calculation • 2-Hour Escalation Desk • Same-Day Filing Remediation',
    checklist: [
      'Company Identification Number (CIN) or LLP Identification Number (LLPIN)',
      'Authorized and Paid-up share capital figures as per current MCA Master Data',
      'Exact overdue form name (AOC-4, MGT-7, Form 11, Form 8, DIR-3 KYC, etc.)',
      'Original statutory due date and actual date of planned filing for day-count penalty tiering',
      'Prior condonation orders or Regional Director approvals (if filing past 300 days)'
    ]
  },
  {
    file: 'ai-document-generator.html',
    title: 'Statutory Resolution & Instrument Generation SLA & Checklist',
    sla: 'Instant AI Generation • 24-Hour PCS Quality Scrutiny & Seal',
    checklist: [
      'Exact corporate name, CIN/LLPIN, and registered office address as per MCA portal',
      'Date, time, and venue (or VC details) of the Board / Committee / General Meeting',
      'Chairman and authorized director names who will sign and execute the resolution',
      'Specific statutory subject matter (borrowing power u/s 179, loan u/s 185/186, bank mandate)',
      'Supporting commercial terms, contract values, or counterparty identifiers to be cited'
    ]
  }
];

function generateDeskTrustHtml(item) {
  const checklistItems = item.checklist.map(c => `
              <li style="margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 0.5rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${c}</span>
              </li>
  `).join('');

  return `
    <!-- Standardized SLA Timelines & Document Preparation Checklist (Phase C Trust Architecture) -->
    <section class="desk-trust-framework" style="margin: 2.5rem 0; padding: 2rem; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px;">
      <div style="margin-bottom: 1.5rem; text-align: left;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--navy-800, #0B2545); text-transform: uppercase; letter-spacing: 0.06em; background: #E2E8F0; padding: 3px 8px; border-radius: 4px;">Verified Service Standards</span>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0.5rem 0 0.25rem;">
          ${item.title}
        </h2>
        <p style="font-size: 0.88rem; color: var(--text-muted, #64748B); margin: 0;">
          Transparent professional response guarantees, tiered milestone execution, and mandatory document readiness criteria.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        <!-- Left Box: Verified SLA Timelines -->
        <div style="background: #FFFFFF; border: 1.5px solid #10B981; border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #065F46; text-transform: uppercase; letter-spacing: 0.05em; background: #D1FAE5; padding: 2px 7px; border-radius: 4px;">Institutional Guarantee</span>
            <span style="font-size: 0.78rem; color: #059669; font-weight: 700;">⏱️ ${item.sla}</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0 0 1rem;">
            Turnaround &amp; Response SLA:
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.85rem; line-height: 1.5; color: var(--text-main, #334155);">
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-weight: 700; color: #10B981; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem;">1</span>
              <div>
                <strong>2-Hour Intake Triage:</strong> Immediate acknowledgment, conflicts check, and jurisdictional verification by Principal Corporate Secretarial Lead.
              </div>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-weight: 700; color: #10B981; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem;">2</span>
              <div>
                <strong>24-Hour Dossier Review:</strong> Senior PCS or Corporate Counsel examines uploaded instruments, performs statutory risk audit, and issues fixed-fee quotation memo.
              </div>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-weight: 700; color: #10B981; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem;">3</span>
              <div>
                <strong>Milestone Execution (2–5 Days):</strong> Drafting of statutory instruments, digital signature pre-scrutiny, and official government portal submission with instant SRN challan receipt.
              </div>
            </div>
          </div>
          <div style="margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px dashed #CBD5E1; font-size: 0.75rem; color: #64748B;">
            🛡️ <em>All statutory disbursements held in client escrow under Rule 33 of CGST Rules 2017 with 100% receipt pass-through.</em>
          </div>
        </div>

        <!-- Right Box: Document Preparation Checklist -->
        <div style="background: #FFFFFF; border: 1.5px solid #3B82F6; border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #1D4ED8; text-transform: uppercase; letter-spacing: 0.05em; background: #DBEAFE; padding: 2px 7px; border-radius: 4px;">Preparation Guide</span>
            <span style="font-size: 0.78rem; color: #2563EB; font-weight: 700;">📋 Keep These Ready</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-900, #0B2545); margin: 0 0 0.85rem;">
            Pre-Consultation Document Checklist:
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 1.5; color: var(--text-main, #334155); flex: 1;">
            ${checklistItems}
          </ul>
          <div style="margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px dashed #CBD5E1; font-size: 0.75rem; color: #64748B;">
            🔒 <em>Encrypted upload pipeline. Confidential client records protected under ICSI &amp; ICAI statutory non-disclosure standards.</em>
          </div>
        </div>
      </div>
    </section>
`;
}

let modifiedCount = 0;

desks.forEach(item => {
  const filePath = path.join(rootDir, 'conversion', item.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File does not exist: ${filePath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('desk-trust-framework')) {
    console.log(`Already contains desk trust: ${item.file}`);
    return;
  }

  const trustHtml = generateDeskTrustHtml(item);

  // Injection strategy:
  // 1. Immediately after desk-security-notice or form container, before </main>
  let injected = false;

  const securityNoticeIdx = html.indexOf('desk-security-notice');
  if (securityNoticeIdx !== -1) {
    const closeDivIdx = html.indexOf('</div>', securityNoticeIdx);
    if (closeDivIdx !== -1) {
      const insertAt = closeDivIdx + 6;
      html = html.slice(0, insertAt) + '\n' + trustHtml + '\n' + html.slice(insertAt);
      injected = true;
    }
  }

  if (!injected) {
    const mainCloseIdx = html.lastIndexOf('</main>');
    if (mainCloseIdx !== -1) {
      html = html.slice(0, mainCloseIdx) + '\n' + trustHtml + '\n' + html.slice(mainCloseIdx);
      injected = true;
    }
  }

  if (injected) {
    fs.writeFileSync(filePath, html, 'utf8');
    modifiedCount++;
    console.log(`[UPDATED] conversion/${item.file}`);
  } else {
    console.warn(`[FAILED TO INJECT] conversion/${item.file}`);
  }
});

console.log(`\nSuccessfully enhanced ${modifiedCount} conversion desks with verified SLAs and preparation checklists.`);
