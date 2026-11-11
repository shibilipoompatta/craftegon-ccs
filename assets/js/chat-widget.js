/**
 * ==============================================================================
 * CRAFTEGON CCS - AI COMPLIANCE ASSISTANT & CO-PILOT
 * Dual-Mode Engine: Google Gemini API (gemini-2.5-flash) with
 * Hardened Business Guardrails ("Veils & Brakes") and Zero-Downtime Deterministic Fallback
 * ==============================================================================
 */
(function(){'use strict';
if(window.__CRAFTEGON_CHAT_INITIALIZED__)return;
window.__CRAFTEGON_CHAT_INITIALIZED__=true;

// --- 1. SOVEREIGN REGULATORY GROUNDING & BUSINESS GUARDRAIL INSTRUCTIONS ("VEILS & BRAKES") ---
const CRAFTEGON_SYSTEM_INSTRUCTION = `You are Jinu, the AI Corporate Compliance Co-Pilot and senior regulatory advisor representing CraftEgon Corporate Services (CCS) and CraftEgon LLP.
Your identity and name is Jinu.
CRITICAL IDENTITY & ADDRESSING RULES:
- The person chatting with you is a business owner, founder, director, CFO, or client. They are NOT named Jinu.
- NEVER address the user as "Jinu" or "Hello Jinu".
- Address the visitor naturally: "Hello! 👋 I am Jinu, your AI corporate compliance co-pilot at CraftEgon LLP. How can I assist you today?"
- If asked who you are or what your name is, clearly state: "I am Jinu, the AI Corporate Compliance Co-Pilot for CraftEgon LLP."
Your role is to assist corporate leaders, founders, CFOs, and clients with authoritative, realistic, concise, and practical corporate secretarial, RoC filing, and statutory compliance guidance under Indian corporate law.

CORE INSTITUTIONAL FACTS:
- Organization: CraftEgon Corporate Services (CCS), a division of CraftEgon LLP.
- Identity: Digital corporate secretarial, statutory documentation, and RoC regulatory infrastructure partner.
- Professional Model: All statutory e-forms (SPICe+, AOC-4, MGT-7, PAS-6, Form 3CD, TM-A) are reviewed, scrutinized, and digitally signed using Class-3 DSC directly by Empanelled Practicing Company Secretaries (PCS) and Chartered Accountants (CA in practice) holding valid Certificates of Practice (CoP).
- Desks: Operational Service Desk, Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, India - PIN 690501. Operational desk also in Connaught Place, New Delhi. Pan-India filing capacity across all 24 RoC Offices, NCLT Benches & RBI Regional Offices.
- Direct Helpdesk: WhatsApp & Phone: +91 86069 18247 | Email: admin@craftegon.com.
- Instant Retainer Intake: Micro-retainer deposits available (Rs 999 discovery / Rs 1,999 priority fast-track) via dynamic UPI QR code.

REGULATORY GROUNDING:
1. Companies Act 2013 & MCA V3:
   - Pvt Ltd Incorporation: SPICe+ (INC-32) with Part A (name reservation) and Part B (incorporation, DIN, PAN, TAN, EPFO, ESIC, Professional Tax, Bank Account). Minimum 2 directors (at least 1 Indian resident) and 2 shareholders. Post-incorporation mandatory Form INC-20A (Commencement of Business) within 180 days.
   - LLP: FiLLiP form under LLP Act 2008. Min. 2 Designated Partners (at least 1 Indian resident). RUN-LLP for name reservation. Mandatory execution and filing of LLP Agreement in Form 3 within 30 days of incorporation.
   - OPC: Sec 2(62), single resident member with mandatory Nominee Director (written consent in Form INC-3).
   - Section 8: Non-profit INC-12 license with zero dividend distribution.
   - Annual RoC Filings: Form AOC-4 (Financials) within 30 days of AGM (typically Oct 30 under Sec 137); Form MGT-7 (Annual Return) within 60 days of AGM (typically Nov 29 under Sec 92); Form DIR-3 KYC (Director KYC) due annually by Sept 30 (penalty Rs 5,000 for delay); Form DPT-3 (Return of deposits/loans) due annually by June 30; Form MGT-14 for special resolutions within 30 days.
   - Share Dematerialization: Rule 9B of Companies (Prospectus and Allotment of Securities) Rules mandates private companies (except small companies) to dematerialize securities. Form PAS-6 filed half-yearly for reconciliation.
   - Significant Beneficial Ownership: Section 90 and Form BEN-2 for beneficial ownership exceeding 10%.
   - Overdue Penalties: Under Section 403, AOC-4 and MGT-7 incur a flat Rs 100/day per form without ceiling from due date expiry.
   - CCFS-2026: The historical Companies Fresh Start Scheme deadline was 15 Sep 2026 and has expired. Do not represent concessions as currently active.

2. FEMA 1999 & Cross-Border Compliance:
   - RBI FLA Return: Mandatory annual return on RBI FLAIR portal by July 15 for entities with Foreign Direct Investment (FDI) or Overseas Direct Investment (ODI).
   - Form FC-GPR: Filed on RBI FIRMS portal within 30 days of equity allotment to non-resident investors.
   - Form FC-TRS: Filed within 60 days of transfer of shares between residents and non-residents.
   - Foreign Branch/Liaison Office: Annual Activity Certificate via Form FC-3/FC-4.

3. Corporate Tax & GST Compliance:
   - Form 3CEB: Transfer Pricing audit report under Section 92E due October 31.
   - GST Annual Return: GSTR-9 and reconciliation GSTR-9C due by December 31.
   - Section 43B(h) / MSMED Act 2006: Mandatory payment to registered Micro & Small enterprises within 15 days (default) or agreed terms up to 45 days. Delayed payments are disallowed as business deductions in the financial year.

4. IPR & Trademarks:
   - Trademark Registration (Form TM-A) across 45 NICE classification classes. Fast-track startup filing fee concessions.

5. Strike-Off & Dormancy:
   - Form STK-2: Voluntary strike-off under Section 248 for inactive entities with zero assets/liabilities.
   - Form MSC-1: Application for obtaining Dormant Company status under Section 455.

COMMUNICATION PRINCIPLES & GUARDRAILS:
- CONVERSATIONAL TONE & IDENTITY: You are Jinu. Speak naturally, realistically, politely, and authoritatively like an experienced corporate compliance co-pilot at CraftEgon LLP. Be normal, helpful, and direct—zero promotional sycophancy or robotic formulas.
- DO NOT REPEAT BOILERPLATE DISCLAIMERS: Do NOT append or prepend long legal disclaimers, statutory notices, or 'brakes' to every conversational message. The permanent statutory notice is already clearly visible in the UI footer and modal.
- STATUTORY BOUNDARIES (BRING UP ONLY WHEN RELEVANT):
  * Advocates Act 1961: If asked for courtroom advocacy or NCLT litigation representation, state that court pleadings are handled by independent practicing advocates on separate vakalatnama.
  * No Guarantees: Give factual procedures and statutory rules without falsely promising 100% RoC approval.
  * Professional Scrutiny: Remind that formal filings are executed under separate professional engagement with empanelled PCS/CAs.
- COMPETITORS: Do not review or validate aggregator portals. Focus on CraftEgon's empanelled CA/CS model and transparent pricing.
- SPEED & CONCISENESS: Keep answers fast, crisp, well-structured with bullet points, and directly actionable. Avoid fluff.`;

// --- 2. DETERMINISTIC RULES ENGINE (LOCAL ZERO-DOWNTIME FALLBACK & TEST VERIFICATION) ---
const KB=[
  {k:['is ai working','isaiis working','whether ai is working','is it working','are you working','working or not','ai working','system status','status check','are you active','are you online','can you hear me','ping','diagnostics'],
  r:`Yes, I am online and operating normally! ⚡<br><br>I am <b>Jinu</b>, your AI Corporate Compliance Co-Pilot representing <b>CraftEgon LLP</b>. I am active and ready to assist you with Indian corporate law compliances, including:<br>• <b>Company Incorporation:</b> Pvt Ltd, LLP, OPC, Section 8 on MCA V3<br>• <b>Annual Governance:</b> Form AOC-4, MGT-7, DIR-3 KYC, Form DPT-3<br>• <b>Statutory Calculators:</b> MCA delay penalties, RoC filing fees, MSME 43B(h)<br>• <b>Direct Advisory:</b> Micro-retainers and dedicated compliance desk<br><br>How can I assist your business today?`,
  a:[['Explore 57 Services','/services.html'],['Calculate Filing Fees','/conversion/calculator.html'],['Corporate Retainer Desk','/conversion/retainer-desk.html']]},

  {k:['how are you','how r u','hello','hi','hey','good morning','good afternoon','good evening','who are you','what is your name','your name','who r u','what can you do','jinu','who is jinu','are you jinu','introduce yourself'],
  r:`Hello! 👋 I am <b>Jinu</b>, your AI Corporate Compliance Co-Pilot at <b>CraftEgon LLP</b>.<br><br>I can assist you directly with:<br>• <b>Company Formation:</b> Private Limited, LLP, OPC, Section 8 on MCA V3<br>• <b>Annual RoC Governance:</b> Form AOC-4, MGT-7, DIR-3 KYC, Form DPT-3<br>• <b>Corporate Tax &amp; GST:</b> Form 3CEB, GSTR-9/9C, MSME 43B(h) compliance<br>• <b>Cross-Border FDI:</b> RBI FLA Return, FC-GPR filing<br>• <b>Corporate Retainer Desk:</b> Year-round secretarial support<br><br>How can I assist you with your business today?`,
  a:[['Explore 57 Services','/services.html'],['Calculate Filing Fees','/conversion/calculator.html'],['Corporate Retainer Desk','/conversion/retainer-desk.html']]},

  {k:['llp','limited liability partnership','fillip','form 3','run-llp','dpin','incorporate llp','llp formation','register llp','start llp'],
  r:`Incorporating a <b>Limited Liability Partnership (LLP)</b> under the <b>LLP Act, 2008</b> &amp; MCA V3:<br>
  * <b>Step 1 — Name Reservation:</b> File web-form <b>RUN-LLP</b> (Reserve Unique Name - LLP) or apply directly in FiLLiP.<br>
  * <b>Step 2 — Digital Signatures:</b> Class-3 DSC for all proposed Designated Partners (min. 2; at least 1 resident in India).<br>
  * <b>Step 3 — Form FiLLiP:</b> File integrated Form for Incorporation of LLP with subscriber sheets, partner consent (Form 9), and registered office proof.<br>
  * <b>Step 4 — DPIN Allocation:</b> Designated Partner Identification Numbers (DPIN) are allotted directly via FiLLiP.<br>
  * <b>Step 5 — Certificate of Incorporation:</b> Issued by the Central Registration Centre (CRC) with unique LLPIN.<br>
  * <b>Step 6 — Form 3 (Mandatory Agreement):</b> Draft and execute the LLP Agreement on required state stamp paper and file in <b>Form 3 within 30 days</b> of incorporation (late filing incurs daily statutory additional fees).`,
  a:[['LLP Registration Service','/services/llp-registration.html'],['Calculate Filing Fees','/conversion/calculator.html'],['Corporate Retainer Desk','/conversion/retainer-desk.html']]},

  {k:['incorporat','pvt ltd','private limited','spice+','spice plus','inc-32','inc-33','inc-34','agile-pro-s','inc-20a','incorporate pvt','company registration','register company','form company','formation','director','shareholder','din','dsc','pan','tan'],
  r:`Incorporating a <b>Private Limited Company</b> under <b>Companies Act 2013</b> via MCA V3:<br>
  * <b>Requirements:</b> Minimum 2 Directors (at least 1 Indian resident) and 2 Shareholders.<br>
  * <b>SPICe+ Part A:</b> Reserve company name (up to 2 proposed names).<br>
  * <b>SPICe+ Part B:</b> Integrated single-window application for:<br>
    &nbsp;&bull; Incorporation &amp; DIN allotment (up to 3 directors)<br>
    &nbsp;&bull; PAN &amp; TAN allocation from Income Tax Department<br>
    &nbsp;&bull; EPFO &amp; ESIC registration<br>
    &nbsp;&bull; Mandatory Corporate Bank Account opening &amp; Professional Tax (state-specific)<br>
  * <b>Linked E-Forms:</b> Electronic MoA (INC-33), AoA (INC-34), and AGILE-PRO-S (INC-35).<br>
  * <b>Post-Incorporation Crucial Step:</b> Mandatory filing of <b>Form INC-20A</b> (Commencement of Business) within 180 days after capital deposit.<br>
  * <b>CCFS-2026:</b> The scheme deadline was <b>15 Sep 2026</b> and has passed; standard MCA fees apply.`,
  a:[['Pvt Ltd Formation Service','/services/pvt-ltd-registration.html'],['Post-Incorporation Portal','/conversion/post-incorporation-checkout.html'],['SPICe+ MCA V3 Blueprint','/knowledge/spice-plus-mca-v3-blueprint.html']]},

  {k:['opc','one person company','single director','solo founder company','inc-3','nominee director'],
  r:`Incorporating a <b>One Person Company (OPC)</b> under <b>Section 2(62) of Companies Act 2013</b>:<br>
  * <b>Structure:</b> Single member/shareholder (must be an Indian citizen) and minimum 1 director (member can be director).<br>
  * <b>Nominee Requirement:</b> Mandatory nomination of a Nominee Director with prior written consent in <b>Form INC-3</b> to take over in case of death or incapacity.<br>
  * <b>MCA V3 Filing:</b> Integrated web-form <b>SPICe+ (INC-32)</b> with SPICe+ Part A and Part B.<br>
  * <b>Statutory Privileges:</b> Exempt from holding Annual General Meetings (AGMs) under Sec 96 and preparing Cash Flow Statements.<br>
  * <b>Post-Incorporation:</b> Mandatory <b>Form INC-20A</b> within 180 days prior to commencing business.`,
  a:[['OPC Registration Service','/services/opc-registration.html'],['Calculate Filing Fees','/conversion/calculator.html'],['Corporate Retainer Desk','/conversion/retainer-desk.html']]},

  {k:['section 8','non profit','ngo company','inc-12','charitable company'],
  r:`Incorporating a <b>Section 8 (Non-Profit) Company</b> under <b>Companies Act 2013</b>:<br>
  * <b>Objective:</b> Promotion of commerce, art, science, sports, education, research, social welfare, charity, or environmental protection.<br>
  * <b>Zero Dividend Distribution:</b> All profits and income must be strictly applied towards the promotion of objects; no dividends to members.<br>
  * <b>Prior License (Form INC-12):</b> Requires Central Government / RoC license approval via Form INC-12 before incorporation.<br>
  * <b>SPICe+ Filing:</b> Incorporated via SPICe+ with specialized non-profit MoA and AoA without adding "Private Limited" or "Limited" to its corporate name.<br>
  * <b>Tax Exemptions:</b> Requires post-incorporation 12AB and 80G registrations with the Income Tax Department.`,
  a:[['Section 8 Registration','/services/section-8-registration.html'],['Explore 57 Services','/services.html'],['Contact Compliance Desk','/conversion/retainer-desk.html']]},

  {k:['aoc-4','aoc4','mgt-7','mgt7','mgt-14','mgt14','annual filing','roc compliance','agm','financial statement','annual return','dir-3 kyc','dir3 kyc','dpt-3','dpt3','msme-1','msme1','due date','deadline','ccfs','ccfs-2026'],
  r:`Annual RoC filings under Companies Act 2013:<br>
  * <b>Form AOC-4:</b> Financials within 30 days of AGM (typically Oct 30) under Sec 137.<br>
  * <b>Form MGT-7:</b> Annual return within 60 days of AGM (typically Nov 29) under Sec 92.<br>
  * <b>Form DIR-3 KYC:</b> Annual DIN KYC by Sept 30 (Delay fee: 5,000).<br>
  * <b>Form DPT-3:</b> Return of deposits/loans due annually by June 30.<br>
  * <b>Form MSME-1:</b> Verify current form scope, supplier conditions, and filing dates against the latest MCA circulars.<br>
  * <b>Form MGT-14:</b> Special resolutions filed within 30 days.<br>
  * <b>CCFS-2026:</b> Closed on <b>15 Sep 2026</b>; do not assume the historical fee concession applies to a current filing.<br>
  Late fees depend on the form, entity, current MCA rules, and any later notification.`,
  a:[['MCA V3 Filing Guide','/knowledge/mca-v3-filing-guide.html'],['RoC Annual Retainer Plan','/services/roc-annual-compliance.html'],['Calculate RoC Late Fees','/conversion/calculator.html']]},

  {k:['portal','client portal','dashboard','compliance calendar','subscription','pricing','retainer plan','starter','growth','enterprise','tier','plan','retainer plans'],
  r:`CraftEgon CCS Corporate Retainer & Service Desk:<br>
  * <b>Annual Retainer:</b> Structured corporate governance, regular statutory filings, and priority professional support.<br>
  * <b>Entity Coverage:</b> Private Limited Companies, LLPs, One Person Companies, and cross-border subsidiaries.<br>
  * <b>Service Desk:</b> Connect with our operational desk in Alappuzha for scoped fee proposals.`,
  a:[['Corporate Retainer Desk','/conversion/retainer-desk.html'],['Explore All Services','/services/index.html'],['Fee Calculator','/conversion/calculator.html']]},

  {k:['late fee','delay','penalty','calculate fee','fine','cost of filing','overdue','fees calculator','mca penalty','403','ccfs'],
  r:`Under MCA Fee Rules 2014 & Companies Act 2013 Sec 403:<br>
  * <b>AOC-4 & MGT-7:</b> Flat 100/day per form from due date expiry without cap.<br>
  * <b>Normal Filings:</b> Additional fee multipliers from 2x (up to 30 days) to 12x/18x (>180 days).<br>
  * <b>DIR-3 KYC:</b> Direct statutory penalty of 5,000 post-Sept 30.<br>
  * <b>CCFS-2026:</b> Closed on <b>15 Sep 2026</b>; the historical 10% concession is not available for current filings.<br>
  Compute your exact liabilities instantly:`,
  a:[['Open Fee & Late Fee Calculator','/conversion/calculator.html'],['Annual Retainer Desk','/conversion/retainer-desk.html']]},

  {k:['fema','fla','fla return','foreign','inbound','fdi','odi','fc-gpr','fcgpr','fc-trs','fctrs','rbi','firms','cross border','non-resident','ecb','foreign branch','liaison office'],
  r:`Under FEMA 1999 & RBI Master Directions:<br>
  * <b>RBI FLA Return:</b> Mandatory annual filing on RBI FLAIR by <b>July 15</b> for entities with FDI or ODI.<br>
  * <b>Form FC-GPR:</b> Submit on FIRMS within 30 days of equity allotment to non-residents.<br>
  * <b>Form FC-TRS:</b> Resident/non-resident share transfer within 60 days.<br>
  * <b>Form FC-3/FC-4:</b> Foreign Branch/Liaison Office annual compliance.<br>
  Non-compliance triggers compounding under Section 13 of FEMA.`,
  a:[['RBI FLA Return Service','/services/rbi-fla-return.html'],['Cross-Border Retainer Desk','/conversion/cross-border-retainer.html'],['FEMA Consultation Booking','/conversion/fema-consultation.html']]},

  {k:['dpdp','data privacy','data protection','privacy act','cert-in','cyber','data fiduciary','consent','dpo','breach','gdpr india','significant fiduciary'],
  r:`DPDP Act 2023 data compliance standards:<br>
  * <b>Data Fiduciary:</b> Itemised, unbundled notice & consent with withdrawal rights.<br>
  * <b>Significant Fiduciaries:</b> Mandatory resident DPO, audits & DPIAs.<br>
  * <b>Penalties:</b> Up to 250 Crores for personal data breaches.<br>
  * <b>CERT-In:</b> Cybersecurity breaches must be reported within 6 hours.`,
  a:[['DPDP Compliance Audit','/services/dpdp-compliance-audit.html'],['Request DPDP Gap Assessment','/conversion/dpdp-audit-request.html'],['Cyber Incident Reporting Desk','/services/cyber-incident-reporting.html']]},

  {k:['tax','gst','transfer pricing','3ceb','gstr-9','gstr9','itr-7','itr7','10b','corporate tax','gstr-2b','itc','blocked credit','17(5)'],
  r:`Corporate tax & audit milestones:<br>
  * <b>Form 3CEB:</b> Transfer Pricing report under Sec 92E due <b>Oct 31</b>.<br>
  * <b>GST Annual Return (GSTR-9/9C):</b> Annual return & reconciliation due by <b>Dec 31</b>.<br>
  * <b>Form 10B & ITR-7:</b> Statutory audit for Sec 8 entities & charitable trusts.<br>
  * <b>GSTR-2B Reconciliation:</b> Compare your purchase register with the statement downloaded from GSTN; this site does not automatically match or fetch returns.`,
  a:[['Transfer Pricing Filing','/services/form-3ceb.html'],['Corporate Tax Intake Portal','/conversion/tax-intake.html'],['Transfer Pricing Blueprint','/knowledge/transfer-pricing-guide.html']]},

  {k:['nclt','dispute','litigation','oppression','mismanagement','insolvency','cirp','ibc','disqualif','din restoration','section 241','section 242','section 7','section 9','writ'],
  r:`Dispute Avoidance & External Legal Referral:<br>
  * <b>Oppression & Mismanagement (Sec 241/242):</b> Statutory guidance and independent advocate referral for shareholder deadlocks.<br>
  * <b>IBC Insolvency (Sec 7/9):</b> Creditor notice response advisory & independent counsel referral.<br>
  * <b>DIN Restoration:</b> Sec 164(2) relief via High Court Art 226 Writs or RoC compounding.<br>
  <i>Note: Court and tribunal appearances require an independent advocate enrolled under the Advocates Act, 1961.</i>`,
  a:[['Priority Incident Intake Desk','/conversion/dispute-consultation.html'],['NCLT Insolvency Defense','/services/nclt-insolvency-defense.html'],['DIN Restoration Guide','/knowledge/director-disqualification-guide.html']]},

  {k:['contract','agreement','draft','nda','sha','employment','trademark','trademark search','ipr','copyright','patent','tm-a','nice class'],
  r:`Contract drafting & IP protection:<br>
  * <b>Document Drafter:</b> Standard NDAs, Founder Agreements, SaaS MSAs & Employment Handbooks.<br>
  * <b>Trademark Search:</b> Clearance search across all 45 NICE classes to avoid opposition.<br>
  * <b>Contract Review:</b> Comprehensive legal redlining within 24 business hours.`,
  a:[['Document Drafter','/conversion/ai-document-generator.html'],['Trademark Clearance Search','/conversion/trademark-search.html'],['Upload Contract for Legal Review','/conversion/contract-intake.html']]},

  {k:['strike off','stk-2','stk2','close company','shut down','dormant','msc-1','exit','winding up'],
  r:`Under Section 248 of Companies Act 2013:<br>
  * <b>Form STK-2:</b> Fast-track closure for entities inactive for 2 financial years with zero assets/liabilities.<br>
  * <b>Form MSC-1:</b> Retain corporate name with minimal compliance via Dormant Status.`,
  a:[['STK-2 Eligibility Checker','/conversion/strike-off-checker.html'],['Form STK-2 Strike-Off Service','/services/form-stk2-strike-off.html'],['Dormant Status (MSC-1) Filing','/services/form-msc1-dormant.html']]},

  {k:['msme','43bh','45 day','vendor payment','msme-1','udyam','priority lending'],
  r:`MSME 43B(h) Payment Compliance:<br>
  * <b>Payment period:</b> MSMED Act Section 15 generally sets a 15-day default without an agreement; agreed terms may not exceed 45 days, subject to acceptance/deemed-acceptance rules.<br>
  * <b>Tax treatment:</b> Section 43B(h) timing depends on supplier classification, payment date, and applicable tax year; seek professional review.<br>
  * <b>Tracker:</b> The calculator stores user-entered supplier data locally; it does not verify Udyam status or submit returns.`,
  a:[['MSME 43B(h) Tracker','/conversion/calculator.html'],['MSME Form MSME-1 Service','/services/form-msme1.html'],['Udyam Registration','/services/msme-udyam.html']]},

  {k:['contact','phone','whatsapp','email','call','office','address','location','reach out','support','admin@craftegon.com'],
  r:`CraftEgon Corporate Services (CCS) - Official Corporate Desk:<br>
  * <b>WhatsApp & Phone:</b> +91 86069 18247 (Direct Compliance Advisory)<br>
  * <b>Email:</b> admin@craftegon.com<br>
  * <b>Operational Service Desk:</b> CraftEgon Corporate Services, Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, India - PIN: 690501<br>
  * <b>Jurisdiction:</b> Pan-India coverage across all 24 RoC Offices, NCLT Benches & RBI Regional Offices.`,
  a:[['Chat Live on WhatsApp','https://wa.me/918606918247'],['Email Legal Desk','mailto:admin@craftegon.com'],['Annual Retainer Desk','/conversion/retainer-desk.html']]}
];

const PILLS=[
  ['Retainer Desk','What is the Annual Corporate Retainer Desk?'],
  ['Incorporate Pvt Ltd','How do I incorporate a Pvt Ltd company in India?'],
  ['Incorporate LLP','How do I incorporate a Limited Liability Partnership (LLP)?'],
  ['MCA Due Dates','What are annual RoC compliance filing due dates?'],
  ['RoC Late Fees','How much are late fees for Form AOC-4 and MGT-7?'],
  ['RBI FLA Return','What is the deadline and requirement for RBI FLA return?'],
  ['Rule 9B Demat','What is mandatory Rule 9B share dematerialization for private companies?'],
  ['DPDP Act Audit','What are our fiduciary obligations under DPDP Act 2023?'],
  ['MSME 43B(h)','What is the 45-day MSME payment rule and Form MSME-1?'],
  ['DIR-3 KYC','What is the annual Director KYC deadline?'],
  ['Contact Desk','How do I contact CraftEgon CCS via WhatsApp or phone?']
];

// Rolling conversation history (up to 6 turns)
let conversationHistory = [];

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

// Get configured Gemini API key
function getGeminiApiKey() {
  if (typeof window === 'undefined') return '';
  // 1. Global window override
  if (window.CRAFTEGON_GEMINI_KEY) return window.CRAFTEGON_GEMINI_KEY.trim();
  // 2. Central config override
  if (window.CRAFTEGON_CONFIG && window.CRAFTEGON_CONFIG.aiAssistant && window.CRAFTEGON_CONFIG.aiAssistant.apiKey) {
    return window.CRAFTEGON_CONFIG.aiAssistant.apiKey.trim();
  }
  // 3. LocalStorage persistence
  try {
    const saved = localStorage.getItem('craftegon_gemini_api_key');
    if (saved) return saved.trim();
  } catch(e) {}
  // 4. URL query param testing (?gemini_key=...)
  try {
    if (window.location && window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      const k = sp.get('gemini_key');
      if (k) return k.trim();
    }
  } catch(e) {}
  return '';
}

function getGeminiModel() {
  try {
    const saved = localStorage.getItem('craftegon_gemini_model');
    if (saved) return saved.trim();
  } catch(e) {}
  if (typeof window !== 'undefined' && window.CRAFTEGON_CONFIG && window.CRAFTEGON_CONFIG.aiAssistant && window.CRAFTEGON_CONFIG.aiAssistant.model) {
    const cfgModel = window.CRAFTEGON_CONFIG.aiAssistant.model;
    if (cfgModel) return cfgModel;
  }
  return 'gemini-2.0-flash';
}

function getReferenceLinks(query){
  const qNorm = (query || '').toLowerCase();
  const references=[
    {terms:['aoc','mgt','roc','dir-3','annual filing','mca','pas-6','demat'],link:['MCA V3 Filing Guide','/knowledge/mca-v3-filing-guide.html']},
    {terms:['ccfs','late fee','section 403','penalty','fine'],link:['Statutory Fee Calculator','/conversion/calculator.html']},
    {terms:['gst','gstr','itc','tax','3ceb'],link:['GST Compliance Guide','/knowledge/gst-einvoicing-compliance-mandate.html']},
    {terms:['fema','fla','rbi','fdi','fc-gpr'],link:['RBI FLA Return Blueprint','/knowledge/rbi-fla-return-blueprint.html']},
    {terms:['msme','43b','vendor payment'],link:['MSME Payment Tracker','/conversion/calculator.html#calc-tab-3']},
    {terms:['dpdp','privacy','cyber'],link:['DPDP Compliance Audit','/services/dpdp-compliance-audit.html']},
    {terms:['trademark','tm-a','nice class','ipr'],link:['Trademark Clearance Intake','/conversion/trademark-search.html']},
    {terms:['llp','limited liability partnership','fillip','form 3','run-llp'],link:['LLP Registration Service','/services/llp-registration.html']},
    {terms:['opc','one person company','inc-3'],link:['OPC Registration Service','/services/opc-registration.html']},
    {terms:['section 8','non profit','ngo company','inc-12'],link:['Section 8 Registration','/services/section-8-registration.html']},
    {terms:['incorporat','pvt ltd','private limited','spice+'],link:['Pvt Ltd Formation Service','/services/pvt-ltd-registration.html']}
  ];
  const matches=references.filter(reference=>reference.terms.some(term=>qNorm.includes(term))).map(reference=>reference.link);
  return matches.length?matches.slice(0,3):[['All 57 Canonical Services','/services.html'],['Compliance Desk','/conversion/retainer-desk.html']];
}

// Convert markdown text to clean sanitized HTML
function formatMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bullet lists
  html = html.replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Line breaks
  html = html.replace(/\n\n+/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Extract canonical CTA action pills based on query context
function inferActionPills(query, botText) {
  const combined = ((query || '') + ' ' + (botText || '')).toLowerCase();
  const pills = [];

  if (combined.includes('llp') || combined.includes('fillip') || combined.includes('form 3') || combined.includes('run-llp')) {
    pills.push(['LLP Registration', '/services/llp-registration.html']);
    pills.push(['Calculate Filing Fees', '/conversion/calculator.html']);
  } else if (combined.includes('opc') || combined.includes('one person')) {
    pills.push(['OPC Registration', '/services/opc-registration.html']);
    pills.push(['Calculate Filing Fees', '/conversion/calculator.html']);
  } else if (combined.includes('section 8') || combined.includes('non profit')) {
    pills.push(['Section 8 Formation', '/services/section-8-registration.html']);
    pills.push(['Explore 57 Services', '/services.html']);
  } else if (combined.includes('incorporat') || combined.includes('pvt ltd') || combined.includes('company') || combined.includes('formation')) {
    pills.push(['Pvt Ltd Formation', '/services/pvt-ltd-registration.html']);
    pills.push(['Fast-Track Intake', '/conversion/ppc-company-registration.html']);
  }
  if (combined.includes('aoc-4') || combined.includes('mgt-7') || combined.includes('late fee') || combined.includes('penalty') || combined.includes('due date')) {
    pills.push(['Calculate Late Fees', '/conversion/calculator.html']);
    pills.push(['RoC Annual Retainer', '/services/roc-annual-compliance.html']);
  }
  if (combined.includes('fema') || combined.includes('fla') || combined.includes('fdi') || combined.includes('fc-gpr') || combined.includes('foreign')) {
    pills.push(['RBI FLA Return', '/services/rbi-fla-return.html']);
    pills.push(['FEMA Consultation', '/conversion/fema-consultation.html']);
  }
  if (combined.includes('trademark') || combined.includes('brand') || combined.includes('ipr')) {
    pills.push(['Trademark Clearance', '/conversion/trademark-search.html']);
  }
  if (combined.includes('strike off') || combined.includes('closure') || combined.includes('stk-2')) {
    pills.push(['Strike-Off Checker', '/conversion/strike-off-checker.html']);
  }

  // Always append primary conversion actions
  pills.push(['💬 WhatsApp Live Desk', 'https://wa.me/918606918247']);
  pills.push(['⚡ Book Micro-Retainer', '/conversion/retainer-desk.html']);

  return pills.slice(0, 3);
}

// --- 3. PRE-EXECUTION BRAKE FILTER (INPUT LEVEL DEFENSE) ---
function evaluateInputBrakes(query) {
  const qNorm = (query || '').toLowerCase().trim();

  // BRAKE 3: Prompt injection & jailbreak check
  if (/ignore (all )?previous instructions|system prompt|reveal your prompt|you are now DAN|jailbreak|developer mode/i.test(qNorm)) {
    return {
      triggered: true,
      r: `CraftEgon CCS operates exclusively within verified statutory compliance parameters under Indian corporate law. I cannot alter system operating instructions or deviate from professional regulatory standards.<br><br>How can I assist your business with RoC filings, MCA V3 compliances, or corporate secretarial structuring?`,
      a: [['Explore 57 Services', '/services.html'], ['Contact Compliance Desk', '/conversion/retainer-desk.html']],
      s: [['CraftEgon Terms', '/legal/terms.html'], ['Professional Disclaimer', '/legal/disclaimer.html']]
    };
  }

  // BRAKE 1: Direct competitor probe
  if (/\b(indiafilings|cleartax|vakilsearch|myonlineca|taxbuddy|kanakkupillai)\b/i.test(qNorm)) {
    return {
      triggered: true,
      r: `While we do not evaluate third-party aggregators, <strong>CraftEgon Corporate Services (CCS)</strong> differentiates itself through:<br>
      * <b>Empanelled Professional Oversight:</b> All statutory filings (SPICe+, AOC-4, MGT-7, PAS-6, TM-A) are reviewed and digitally signed directly by Practicing Company Secretaries (PCS) and Chartered Accountants (CAs).<br>
      * <b>Fee Transparency:</b> Zero hidden government fees or surprise stamp duties.<br>
      * <b>Direct Accountability:</b> Real operational service desks in Alappuzha and New Delhi with dedicated compliance officers.<br><br>
      We invite you to experience institutional compliance precision:`,
      a: [['Explore 57 Services', '/services.html'], ['Book Micro-Retainer (₹999)', '/conversion/retainer-desk.html'], ['WhatsApp Desk', 'https://wa.me/918606918247']],
      s: [['About CraftEgon CCS', '/about.html'], ['Institutional Model', '/about.html#how-we-operate']]
    };
  }

  return { triggered: false };
}

// --- 4. GOOGLE GEMINI API INVOCATION WITH DYNAMIC MODEL DISCOVERY & RESILIENT MULTI-VERSION FALLBACK ---

// Dynamic model discovery via Google AI Studio ModelService.ListModels
async function fetchAvailableGeminiModels(apiKey) {
  if (!apiKey) return [];
  const versions = ['v1beta', 'v1'];
  for (const ver of versions) {
    const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(apiKey)}`;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          const compatible = data.models
            .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace(/^models\//, ''));
          
          if (compatible.length) {
            const PREF = [
              'gemini-2.0-flash',
              'gemini-1.5-flash',
              'gemini-1.5-flash-latest',
              'gemini-1.5-flash-002',
              'gemini-2.5-flash',
              'gemini-1.5-pro'
            ];
            compatible.sort((a, b) => {
              const ia = PREF.indexOf(a);
              const ib = PREF.indexOf(b);
              if (ia !== -1 && ib !== -1) return ia - ib;
              if (ia !== -1) return -1;
              if (ib !== -1) return 1;
              return a.localeCompare(b);
            });
            window.__CRAFTEGON_AVAILABLE_MODELS__ = compatible;
            window.__CRAFTEGON_WORKING_VERSION__ = ver;
            return compatible;
          }
        }
      }
    } catch(e) {
      console.warn(`Model discovery on ${ver} failed:`, e.message);
    }
  }
  return [];
}

async function callGeminiApi(userQuery) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const configuredModel = getGeminiModel();
  const cachedModel = window.__CRAFTEGON_WORKING_MODEL__;
  let modelsToTry = [
    cachedModel,
    configuredModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-2.5-flash',
    'gemini-1.5-pro'
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  if (Array.isArray(window.__CRAFTEGON_AVAILABLE_MODELS__) && window.__CRAFTEGON_AVAILABLE_MODELS__.length) {
    window.__CRAFTEGON_AVAILABLE_MODELS__.forEach(m => {
      if (!modelsToTry.includes(m)) modelsToTry.push(m);
    });
  }

  // Construct rolling history
  const contents = [];
  conversationHistory.slice(-6).forEach(turn => {
    contents.push({
      role: turn.role,
      parts: [{ text: turn.text }]
    });
  });
  contents.push({
    role: "user",
    parts: [{ text: userQuery }]
  });

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: CRAFTEGON_SYSTEM_INSTRUCTION }]
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 750
    }
  };

  let lastError = null;
  const versionsToTry = window.__CRAFTEGON_WORKING_VERSION__ ? [window.__CRAFTEGON_WORKING_VERSION__, 'v1beta', 'v1'] : ['v1beta', 'v1'];
  const uniqueVersions = versionsToTry.filter((v, i, a) => a.indexOf(v) === i);

  for (const model of modelsToTry) {
    for (const ver of uniqueVersions) {
      const endpoint = `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      try {
        let response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        // If HTTP 400 (which may occur if systemInstruction proto is rejected), retry with instruction prepended to contents
        if (response.status === 400) {
          const fallbackContents = JSON.parse(JSON.stringify(contents));
          fallbackContents[0].parts[0].text = `[SYSTEM INSTRUCTION: ${CRAFTEGON_SYSTEM_INSTRUCTION}]\n\nUser Question:\n${fallbackContents[0].parts[0].text}`;
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: fallbackContents,
              generationConfig: { temperature: 0.3, maxOutputTokens: 750 }
            }),
            signal: controller.signal
          });
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404 || response.status === 429) {
            lastError = new Error(`HTTP ${response.status} for model ${model} on ${ver}`);
            continue;
          }
          const errText = await response.text();
          let parsedErrMsg = `HTTP ${response.status} (${model})`;
          try {
            const errJson = JSON.parse(errText);
            if (errJson && errJson.error && errJson.error.message) {
              parsedErrMsg += `: ${errJson.error.message}`;
            }
          } catch(e) {
            parsedErrMsg += `: ${errText.substring(0, 100)}`;
          }
          throw new Error(parsedErrMsg);
        }

        const data = await response.json();
        const candidate = data.candidates && data.candidates[0];
        const replyText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

        if (!replyText) {
          throw new Error(`Empty Gemini response payload from ${model}`);
        }

        // Cache working model & version
        window.__CRAFTEGON_WORKING_MODEL__ = model;
        window.__CRAFTEGON_WORKING_VERSION__ = ver;

        // Update conversation history
        conversationHistory.push({ role: "user", text: userQuery });
        conversationHistory.push({ role: "model", text: replyText });
        if (conversationHistory.length > 8) {
          conversationHistory = conversationHistory.slice(-8);
        }

        const html = formatMarkdown(replyText);
        const actions = inferActionPills(userQuery, replyText);
        const sources = getReferenceLinks(userQuery);

        return { r: html, a: actions, s: sources };
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        if (err.name === 'AbortError') {
          continue;
        }
        if (err.message && err.message.includes('404')) {
          continue;
        }
        throw err;
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models failed');
}

// High-level co-pilot orchestrator: checks server-side proxy gateway first, then client-side Gemini
async function callCoPilotEngine(userQuery) {
  // 1. Try server-side secure ModelGateway (/api/chat) if available
  const proxyEndpoint = (window.CRAFTEGON_CONFIG && window.CRAFTEGON_CONFIG.aiAssistant && window.CRAFTEGON_CONFIG.aiAssistant.proxyEndpoint) || '/api/chat';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const proxyRes = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userQuery, message: userQuery }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      const rawText = data.reply || data.answer || data.content;
      if (rawText && typeof rawText === 'string') {
        const html = formatMarkdown(rawText);
        const actions = inferActionPills(userQuery, rawText);
        const sources = (Array.isArray(data.citations) && data.citations.length)
          ? data.citations.map(c => [c.section || c.statute || 'Statutory Authority', c.url || '/services.html'])
          : getReferenceLinks(userQuery);
        return { r: html, a: actions, s: sources, isProxy: true };
      }
    }
  } catch (proxyErr) {
    // Server proxy not available (static showcase host or offline) — proceed to client Gemini
  }

  // 2. Direct Gemini API invocation (requires configured key)
  return await callGeminiApi(userQuery);
}

// Live diagnostics helper to verify API key connectivity & auto-heal to working models
async function testGeminiConnection(key, model) {
  if (!key) throw new Error('API key is required.');
  const targetModel = model || getGeminiModel() || 'gemini-2.0-flash';
  const startTime = Date.now();

  const modelsToProbe = [
    targetModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-2.5-flash'
  ].filter((m, i, a) => m && a.indexOf(m) === i);

  let lastErr = null;
  for (const m of modelsToProbe) {
    for (const ver of ['v1beta', 'v1']) {
      const endpoint = `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with the single word: OK' }] }],
            generationConfig: { maxOutputTokens: 5 }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const latency = Date.now() - startTime;
          window.__CRAFTEGON_WORKING_MODEL__ = m;
          window.__CRAFTEGON_WORKING_VERSION__ = ver;
          localStorage.setItem('craftegon_gemini_model', m);
          return {
            ok: true,
            latency: latency,
            model: m,
            version: ver,
            autoSwitched: m !== targetModel
          };
        } else {
          const errText = await res.text();
          let msg = `HTTP ${res.status}`;
          try {
            const j = JSON.parse(errText);
            if (j.error && j.error.message) msg = j.error.message;
          } catch(e) {
            msg += `: ${errText.substring(0, 100)}`;
          }
          lastErr = new Error(msg);
          if (res.status === 404) continue;
        }
      } catch(fetchErr) {
        clearTimeout(timeoutId);
        lastErr = fetchErr;
        if (fetchErr.name === 'AbortError') continue;
      }
    }
  }

  // If standard models failed with 404, probe ModelService.ListModels
  try {
    const discovered = await fetchAvailableGeminiModels(key);
    if (discovered && discovered.length) {
      const firstModel = discovered[0];
      const ver = window.__CRAFTEGON_WORKING_VERSION__ || 'v1beta';
      const endpoint = `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(firstModel)}:generateContent?key=${encodeURIComponent(key)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
          generationConfig: { maxOutputTokens: 5 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const latency = Date.now() - startTime;
        window.__CRAFTEGON_WORKING_MODEL__ = firstModel;
        localStorage.setItem('craftegon_gemini_model', firstModel);
        return {
          ok: true,
          latency: latency,
          model: firstModel,
          version: ver,
          autoSwitched: true,
          discoveredList: discovered
        };
      }
    }
  } catch(e) {}

  throw lastErr || new Error('Connection failed across all candidate Gemini models and endpoints.');
}

function normalizeQuery(text) {
  if (!text) return '';
  let s = text.toLowerCase().trim();
  s = s.replace(/isaiis/g, 'is ai is')
       .replace(/isai/g, 'is ai')
       .replace(/copoilat/g, 'copilot')
       .replace(/copilet/g, 'copilot')
       .replace(/inprove/g, 'improve');
  return s;
}

function keywordMatches(text, kw) {
  if (!text || !kw) return false;
  const kwTrim = kw.trim();
  if (kwTrim.length <= 3) {
    const re = new RegExp('\\b' + kwTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(text);
  }
  return text.includes(kwTrim);
}

// --- 5. SYNCHRONOUS DETERMINISTIC FALLBACK (PRESERVED FOR TEST SUITES & OFFLINE) ---
function matchQuery(q){
  const n = normalizeQuery(q);

  // Status & Health Check Intent: "is ai working?", "are you online?", "status"
  if ((n.includes('ai') || n.includes('jinu') || n.includes('bot') || n.includes('system') || n.includes('copilot')) && 
      (n.includes('work') || n.includes('active') || n.includes('online') || n.includes('live') || n.includes('status') || n.includes('running') || n.includes('operational'))) {
    return {
      r: `Yes, I am online and operating normally! ⚡<br><br>I am <b>Jinu</b>, your AI Corporate Compliance Co-Pilot representing <b>CraftEgon LLP</b>. I am active and ready to assist you with Indian corporate law compliances, including:<br>• <b>Company Incorporation:</b> Pvt Ltd, LLP, OPC, Section 8 on MCA V3<br>• <b>Annual Governance:</b> Form AOC-4, MGT-7, DIR-3 KYC, Form DPT-3<br>• <b>Statutory Calculators:</b> MCA delay penalties, RoC filing fees, MSME 43B(h)<br>• <b>Direct Advisory:</b> Micro-retainers and dedicated compliance desk<br><br>How can I assist your business today?`,
      a: [['Explore 57 Services', '/services.html'], ['Calculate Filing Fees', '/conversion/calculator.html'], ['Corporate Retainer Desk', '/conversion/retainer-desk.html']],
      s: getReferenceLinks(n)
    };
  }

  let best=null,maxScore=0;
  for(const item of KB){
    let score=0;
    for(const kw of item.k){
      if(keywordMatches(n, kw)){
        score+=(kw.length>5?3:2);
      }
    }
    if(score>maxScore){maxScore=score;best=item;}
  }
  if(maxScore>=2&&best)return{r:best.r,a:best.a,s:getReferenceLinks(n)};
  return{
    r:`I have noted your inquiry regarding <b>"${escapeHtml(q)}"</b>.<br><br>I am <b>Jinu</b>, your AI Corporate Compliance Co-Pilot at <b>CraftEgon LLP</b>. In statutory reference mode, I can provide exact procedures, MCA V3 filing rules, statutory due dates, and fee estimations under Indian corporate law (Companies Act 2013, LLP Act 2008, FEMA 1999, GST Act 2017).<br><br>Could you clarify your entity structure (Pvt Ltd, LLP, OPC) or the specific compliance area you need help with? You can also explore our quick tools or connect directly with our compliance desk:`,
    a:[['Fee & Late Fee Calculator','/conversion/calculator.html'],['Contact Compliance Desk','/conversion/retainer-desk.html'],['Explore Practice Areas','/index.html#practice-areas']],
    s:getReferenceLinks(n)
  };
}

// --- 6. UI RENDERING & WIDGET LIFECYCLE ---
function ensureStyles(){
  if(!document.getElementById('craftegon-chat-css')){
    const l=document.createElement('link');
    l.id='craftegon-chat-css';
    l.rel='stylesheet';
    l.href='/assets/css/chat-widget.css';
    document.head.appendChild(l);
  }
}

function updateAssistantBadge() {
  const badgeText = document.getElementById('cchat-status-text');
  const dot = document.getElementById('cchat-status-dot');
  const hasKey = Boolean(getGeminiApiKey());
  if (badgeText) {
    badgeText.textContent = hasKey ? 'Jinu (AI Active)' : 'Jinu (Compliance Advisor)';
  }
  if (dot) {
    if (hasKey) {
      dot.classList.add('ai-active');
    } else {
      dot.classList.remove('ai-active');
    }
  }
}

function openSettingsModal() {
  const existing = document.getElementById('cchat-settings-modal');
  if (existing) {
    existing.style.display = 'flex';
    return;
  }

  const currentKey = getGeminiApiKey();
  const currentModel = getGeminiModel();
  const modal = document.createElement('div');
  modal.id = 'cchat-settings-modal';
  modal.className = 'cchat-modal-overlay';
  modal.innerHTML = `
    <div class="cchat-modal-card">
      <div class="cchat-modal-header">
        <h5>AI Co-Pilot Settings</h5>
        <button type="button" class="cchat-modal-close" id="cchat-modal-close">&times;</button>
      </div>
      <div class="cchat-modal-body">
        <p style="font-size: 0.82rem; color: var(--text-secondary, #52717A); margin-bottom: 1rem; line-height: 1.5;">
          Connect your <strong>Google Gemini API Key</strong> to activate automatic natural language communication grounded in CraftEgon's 57 corporate compliance services.
        </p>
        <label style="display:block; font-size: 0.78rem; font-weight: 700; color: var(--navy-800, #193B46); margin-bottom: 0.35rem;">
          Gemini Model:
        </label>
        <select id="cchat-gemini-model-select" class="cchat-modal-input" style="margin-bottom: 0.85rem; padding: 0.45rem; font-size: 0.82rem; width: 100%; border: 1px solid #CBD5E1; border-radius: 6px; background: #fff;">
          <option value="gemini-2.0-flash"${currentModel === 'gemini-2.0-flash' ? ' selected' : ''}>gemini-2.0-flash (Next-Gen Fast — Recommended)</option>
          <option value="gemini-1.5-flash"${currentModel === 'gemini-1.5-flash' ? ' selected' : ''}>gemini-1.5-flash (Fast &amp; Standard)</option>
          <option value="gemini-1.5-flash-latest"${currentModel === 'gemini-1.5-flash-latest' ? ' selected' : ''}>gemini-1.5-flash-latest (Dynamic Flash)</option>
          <option value="gemini-2.5-flash"${currentModel === 'gemini-2.5-flash' ? ' selected' : ''}>gemini-2.5-flash (High Reasoning Flash)</option>
          <option value="gemini-1.5-pro"${currentModel === 'gemini-1.5-pro' ? ' selected' : ''}>gemini-1.5-pro (High Reasoning Depth)</option>
        </select>
        <label style="display:block; font-size: 0.78rem; font-weight: 700; color: var(--navy-800, #193B46); margin-bottom: 0.35rem;">
          Gemini API Key:
        </label>
        <input type="password" id="cchat-gemini-key-input" class="cchat-modal-input" placeholder="AIzaSy..." value="${escapeHtml(currentKey)}" style="width: 100%;">
        <div style="font-size: 0.72rem; color: var(--text-muted, #708A93); margin-top: 0.4rem; margin-bottom: 0.85rem;">
          Keys are stored locally in your browser (localStorage). Never shared externally.
        </div>
        <div style="display:flex; gap:0.5rem; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <button type="button" class="btn btn-secondary" id="cchat-test-key-btn" style="padding:0.4rem 0.75rem; font-size:0.78rem; background: #F1F5F9; border: 1px solid #CBD5E1; color: var(--navy-800, #193B46); border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">🔍 Test Connection</button>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-secondary" id="cchat-clear-key-btn" style="padding:0.4rem 0.85rem; font-size:0.8rem;">Clear Key</button>
            <button type="button" class="btn btn-primary" id="cchat-save-key-btn" style="padding:0.4rem 0.85rem; font-size:0.8rem; background: var(--accent-green-primary, #247A62); color:#fff; border:none; border-radius:6px; cursor:pointer;">Save &amp; Activate</button>
          </div>
        </div>
        <div id="cchat-test-result-box" style="display:none; font-size: 0.76rem; border-radius: 6px; padding: 0.5rem 0.75rem; line-height: 1.4; margin-bottom: 0.5rem;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cchat-modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  const testBtn = document.getElementById('cchat-test-key-btn');
  const resultBox = document.getElementById('cchat-test-result-box');
  testBtn.addEventListener('click', async () => {
    const keyVal = document.getElementById('cchat-gemini-key-input').value.trim();
    const modelSelect = document.getElementById('cchat-gemini-model-select');
    const selectedModel = modelSelect ? modelSelect.value : 'gemini-2.0-flash';
    if (!keyVal) {
      resultBox.style.display = 'block';
      resultBox.style.background = '#FFFBEB';
      resultBox.style.color = '#B45309';
      resultBox.style.border = '1px solid #FDE68A';
      resultBox.innerHTML = '⚠️ Please enter an API key to test.';
      return;
    }
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    resultBox.style.display = 'block';
    resultBox.style.background = '#F8FAFC';
    resultBox.style.color = '#475569';
    resultBox.style.border = '1px solid #E2E8F0';
    resultBox.innerHTML = `Pinging Google Gemini (${escapeHtml(selectedModel)})...`;
    try {
      const res = await testGeminiConnection(keyVal, selectedModel);
      resultBox.style.background = '#ECFDF5';
      resultBox.style.color = '#065F46';
      resultBox.style.border = '1px solid #A7F3D0';
      if (res.autoSwitched && modelSelect) {
        let found = false;
        for (let i = 0; i < modelSelect.options.length; i++) {
          if (modelSelect.options[i].value === res.model) {
            modelSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const opt = document.createElement('option');
          opt.value = res.model;
          opt.textContent = `${res.model} (Auto-Discovered)`;
          opt.selected = true;
          modelSelect.appendChild(opt);
        }
        resultBox.innerHTML = `✅ <strong>Connected successfully!</strong><br>Auto-switched to active model: <strong>${escapeHtml(res.model)}</strong> (HTTP 200 on ${escapeHtml(res.version)} in ${res.latency}ms). Model is live and ready.`;
      } else {
        resultBox.innerHTML = `✅ <strong>Connected successfully!</strong><br>Gemini (${escapeHtml(res.model)}) responded in ${res.latency}ms on ${escapeHtml(res.version)}. Model is live and ready.`;
      }
    } catch (err) {
      resultBox.style.background = '#FEF2F2';
      resultBox.style.color = '#991B1B';
      resultBox.style.border = '1px solid #FECACA';
      resultBox.innerHTML = `❌ <strong>Connection failed:</strong><br>${escapeHtml(err.message)}<br><small style="color:#64748B;">Verify your key at https://aistudio.google.com and check quota/region access.</small>`;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '🔍 Test Connection';
    }
  });

  document.getElementById('cchat-clear-key-btn').addEventListener('click', () => {
    try {
      localStorage.removeItem('craftegon_gemini_api_key');
      localStorage.removeItem('craftegon_gemini_model');
      window.CRAFTEGON_GEMINI_KEY = '';
      document.getElementById('cchat-gemini-key-input').value = '';
      updateAssistantBadge();
      modal.style.display = 'none';
      appendBotMsg('Gemini API key removed. Returned to <b>Statutory Reference Mode</b>.');
    } catch(e) {}
  });

  document.getElementById('cchat-save-key-btn').addEventListener('click', () => {
    const keyVal = document.getElementById('cchat-gemini-key-input').value.trim();
    const modelSelect = document.getElementById('cchat-gemini-model-select');
    const selectedModel = modelSelect ? modelSelect.value : 'gemini-2.0-flash';
    try {
      localStorage.setItem('craftegon_gemini_model', selectedModel);
      if (keyVal) {
        localStorage.setItem('craftegon_gemini_api_key', keyVal);
        window.CRAFTEGON_GEMINI_KEY = keyVal;
        appendBotMsg(`⚡ <b>Google Gemini AI Co-Pilot Activated! (${escapeHtml(selectedModel)})</b><br>I am now operating in dynamic AI mode grounded in CraftEgon corporate services and statutory regulations.`);
      } else {
        localStorage.removeItem('craftegon_gemini_api_key');
        window.CRAFTEGON_GEMINI_KEY = '';
      }
      updateAssistantBadge();
      modal.style.display = 'none';
    } catch(e) {}
  });
}

function openBrakesModal() {
  const existing = document.getElementById('cchat-brakes-modal');
  if (existing) {
    existing.style.display = 'flex';
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'cchat-brakes-modal';
  modal.className = 'cchat-modal-overlay';
  modal.innerHTML = `
    <div class="cchat-modal-card">
      <div class="cchat-modal-header">
        <h5>Statutory Brakes &amp; Advisory Limits</h5>
        <button type="button" class="cchat-modal-close" id="cchat-brakes-close">&times;</button>
      </div>
      <div class="cchat-modal-body" style="font-size: 0.8rem; line-height: 1.6; color: var(--navy-900, #10262E);">
        <p style="margin-bottom: 0.75rem;">
          <strong>1. Information Only &bull; Non-Binding:</strong><br>
          All responses, guidance, calculations, and statutory references provided by this assistant are strictly for educational orientation and informational reference under Indian corporate laws.
        </p>
        <p style="margin-bottom: 0.75rem;">
          <strong>2. No Offer &bull; No Company Consent:</strong><br>
          All statements and outputs cannot be considered the consent or permission of CraftEgon Corporate Services, nor do they represent a contractual offer or invitation to offer. Formal corporate filings and engagements are executed solely through signed professional agreements.
        </p>
        <p style="margin-bottom: 0.75rem;">
          <strong>3. Professional Realism &bull; No Marketing Sycophancy:</strong><br>
          This assistant does not exist to flatter or please customers with unverified assurances. It provides candid, realistic facts regarding regulatory procedures, processing windows, and statutory penalties under Indian law with professional integrity and ethics.
        </p>
        <p style="margin-bottom: 0.75rem;">
          <strong>4. Advocates Act, 1961 Boundary:</strong><br>
          CraftEgon CCS provides corporate secretarial and documentation infrastructure. We do not provide court appearances or litigation advocacy; matters requiring courtroom representation must be handled by an independent enrolled advocate under a separate vakalatnama.
        </p>
        <p style="margin-bottom: 1.25rem;">
          <strong>5. Practicing Professional Review:</strong><br>
          All statutory e-forms (SPICe+, AOC-4, MGT-7, PAS-6, Form 3CD, TM-A) are reviewed and digitally signed directly by Empanelled Practicing Company Secretaries (PCS) and Chartered Accountants (CAs in practice) holding valid Certificates of Practice (CoP).
        </p>
        <div style="display:flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 0.85rem;">
          <a href="/legal/disclaimer.html" target="_blank" rel="noopener noreferrer" style="font-size: 0.78rem; color: var(--accent-green-primary, #247A62); font-weight: 700; text-decoration: underline;">Read Full Professional Disclaimer &rarr;</a>
          <button type="button" class="btn btn-primary" id="cchat-brakes-ack-btn" style="padding:0.4rem 0.85rem; font-size:0.8rem; background: var(--navy-800, #0B2545); color:#fff; border:none; border-radius:6px; cursor:pointer;">I Acknowledge</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cchat-brakes-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.getElementById('cchat-brakes-ack-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

function createWidget(){
  if(document.getElementById('craftegon-chat-window'))return;
  const t=document.createElement('button');
  t.id='craftegon-chat-trigger';
  t.setAttribute('type','button');
  t.setAttribute('aria-label','Open CraftEgon Compliance Assistant');
  t.innerHTML=`<div class="chat-pulse"></div><svg class="trigger-icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg><svg class="close-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  
  const b=document.createElement('div');
  b.id='craftegon-chat-badge';
  b.innerHTML=`<span class="badge-dot"></span> Ask Jinu &bull; AI Assistant`;
  
  const w=document.createElement('div');
  w.id='craftegon-chat-window';
  w.setAttribute('role','dialog');
  w.setAttribute('aria-label','Jinu - CraftEgon Corporate Compliance Assistant');
  w.innerHTML=`<div class="cchat-header">
  <div class="cchat-brand-wrap">
    <div class="cchat-avatar-wrap">
      <img src="/assets/images/craftegon-logo.jpg" alt="CraftEgon" class="cchat-avatar">
      <span class="cchat-status-dot ai-active" id="cchat-status-dot"></span>
    </div>
    <div class="cchat-brand-info">
      <h4>Jinu <span style="font-size:0.75rem; font-weight:500; opacity:0.85;">&bull; CraftEgon AI</span></h4>
      <span id="cchat-status-text">Compliance Advisor</span>
    </div>
  </div>
  <div class="cchat-header-actions">
    <button type="button" class="cchat-btn-icon" id="cchat-settings-btn" title="AI Model Settings"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
    <button type="button" class="cchat-btn-icon" id="cchat-clear-btn" title="New Chat"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.7L21 8M21 3v5h-5"/></svg></button>
    <button type="button" class="cchat-btn-icon" id="cchat-close-btn" title="Close"><svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
  </div>
  </div>
  <div class="cchat-body" id="cchat-messages-container"></div>
  <div class="cchat-pills-bar" id="cchat-pills-container">
  ${PILLS.map(([l,q])=>`<button type="button" class="cchat-pill" data-query="${escapeHtml(q)}">${l}</button>`).join('')}
  </div>
  <div class="cchat-footer">
  <form id="cchat-form" class="cchat-input-row" onsubmit="return false;">
    <input type="text" id="cchat-input-field" class="cchat-input" placeholder="Ask about compliance, MCA V3, due dates..." autocomplete="off">
    <button type="submit" id="cchat-send-btn" class="cchat-send-btn" aria-label="Send message"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg></button>
  </form>
  <div class="cchat-disclaimer"><span>Informational reference only &bull; Not company consent or offer</span> &bull; <button type="button" id="cchat-brakes-btn" class="cchat-disclaimer-btn">Statutory Brakes &amp; Limits</button></div>
  </div>`;
  document.body.appendChild(t);
  document.body.appendChild(b);
  document.body.appendChild(w);

  updateAssistantBadge();
}

function getTime(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}

function appendUserMsg(t){
  const b=document.getElementById('cchat-messages-container');
  if(!b)return;
  const e=document.createElement('div');
  e.className='cchat-msg user';
  e.innerHTML=`<div class="cchat-bubble">${escapeHtml(t)}</div><div class="cchat-timestamp">${getTime()}</div>`;
  b.appendChild(e);
  b.scrollTop=b.scrollHeight;
}

function appendBotMsg(h,acts=[],sources=[]){
  const b=document.getElementById('cchat-messages-container');
  if(!b)return;
  let aHtml=acts&&acts.length?`<div class="cchat-actions-grid">${acts.map(([l,u])=>{
    const safeU = (typeof u === 'string' && (u.startsWith('/') || u.startsWith('https://'))) ? escapeHtml(u) : '#';
    const isExternal = safeU.startsWith('https://wa.me');
    return `<a href="${safeU}" class="cchat-action-btn"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}><span>${escapeHtml(l)}</span><span>&rarr;</span></a>`;
  }).join('')}</div>`:'';
  const sourceHtml=sources.length?`<div class="cchat-sources"><strong>CCS References</strong>${sources.map(([label,url])=>`<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`).join('')}</div>`:'';
  const e=document.createElement('div');
  e.className='cchat-msg bot';
  e.innerHTML=`<div class="cchat-bubble">${h}${sourceHtml}${aHtml}</div><div class="cchat-timestamp">${getTime()} &bull; Jinu &bull; CraftEgon AI</div>`;
  b.appendChild(e);
  b.scrollTop=b.scrollHeight;
}

// Progressive streaming renderer for fast, natural response appearance
function streamBotMsg(h, acts = [], sources = [], extraNotice = '') {
  const b = document.getElementById('cchat-messages-container');
  if (!b) return;

  const e = document.createElement('div');
  e.className = 'cchat-msg bot';
  const bubble = document.createElement('div');
  bubble.className = 'cchat-bubble';

  if (extraNotice) {
    const noticeEl = document.createElement('div');
    noticeEl.innerHTML = extraNotice;
    bubble.appendChild(noticeEl);
  }

  const contentSpan = document.createElement('div');
  bubble.appendChild(contentSpan);
  e.appendChild(bubble);

  const timeDiv = document.createElement('div');
  timeDiv.className = 'cchat-timestamp';
  timeDiv.innerHTML = `${getTime()} &bull; Jinu &bull; CraftEgon AI`;
  e.appendChild(timeDiv);

  b.appendChild(e);
  b.scrollTop = b.scrollHeight;

  function attachFooter() {
    let aHtml = acts && acts.length ? `<div class="cchat-actions-grid" style="animation: cchatFadeIn 0.3s ease;">${acts.map(([l, u]) => {
      const safeU = (typeof u === 'string' && (u.startsWith('/') || u.startsWith('https://'))) ? escapeHtml(u) : '#';
      const isExternal = safeU.startsWith('https://wa.me');
      return `<a href="${safeU}" class="cchat-action-btn"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}><span>${escapeHtml(l)}</span><span>&rarr;</span></a>`;
    }).join('')}</div>` : '';
    const sourceHtml = sources.length ? `<div class="cchat-sources" style="animation: cchatFadeIn 0.3s ease;"><strong>CCS References</strong>${sources.map(([label, url]) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`).join('')}</div>` : '';
    if (sourceHtml || aHtml) {
      const footerWrap = document.createElement('div');
      footerWrap.innerHTML = sourceHtml + aHtml;
      bubble.appendChild(footerWrap);
    }
    b.scrollTop = b.scrollHeight;
  }

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || h.length < 50) {
    contentSpan.innerHTML = h;
    attachFooter();
    return;
  }

  const tokens = h.split(/(\s+|<[^>]+>)/g).filter(Boolean);
  let idx = 0;
  const tokensPerTick = 4;
  const interval = 20;

  function streamStep() {
    idx = Math.min(idx + tokensPerTick, tokens.length);
    contentSpan.innerHTML = tokens.slice(0, idx).join('');
    b.scrollTop = b.scrollHeight;

    if (idx < tokens.length) {
      setTimeout(streamStep, interval);
    } else {
      contentSpan.innerHTML = h;
      attachFooter();
    }
  }

  setTimeout(streamStep, 25);
}

function showTyping(label="Analyzing statutory rules..."){
  hideTyping();
  const b=document.getElementById('cchat-messages-container');
  if(!b)return;
  const e=document.createElement('div');
  e.id='cchat-active-typing';
  e.className='cchat-typing';
  e.innerHTML=`<span>${escapeHtml(label)}</span><div class="cchat-typing-dots"><span></span><span></span><span></span></div>`;
  b.appendChild(e);
  b.scrollTop=b.scrollHeight;
}

function hideTyping(){
  const els=document.querySelectorAll('.cchat-typing, #cchat-active-typing');
  els.forEach(el=>el.remove());
}

// --- 7. QUERY DISPATCHER (HYBRID AI + INPUT BRAKES + DETERMINISTIC FALLBACK) ---
async function handleQuery(q){
  if(!q||!q.trim())return;
  const userText = q.trim();
  appendUserMsg(userText);

  // Step 1: Evaluate Input Brakes (Prompt injection, competitor probes)
  const brakeResult = evaluateInputBrakes(userText);
  if (brakeResult.triggered) {
    showTyping("Applying compliance safeguards...");
    setTimeout(() => {
      hideTyping();
      streamBotMsg(brakeResult.r, brakeResult.a, brakeResult.s);
    }, 250);
    return;
  }

  // Step 2: Attempt Server-Side Model Gateway or Direct Google Gemini API
  showTyping("Consulting CraftEgon Co-Pilot (Jinu)...");
  try {
    const aiResponse = await callCoPilotEngine(userText);
    hideTyping();
    streamBotMsg(aiResponse.r, aiResponse.a, aiResponse.s);
    return;
  } catch(err) {
    console.warn('AI Co-Pilot invocation fallback to rules engine:', err.message);
    hideTyping();
    showTyping("Serving verified statutory compliance answer...");
    setTimeout(() => {
      hideTyping();
      const res = matchQuery(userText);
      streamBotMsg(res.r, res.a, res.s || []);
    }, 120);
  }
}

function initGreeting(){
  const b=document.getElementById('cchat-messages-container');
  if(!b||b.children.length>0)return;
  appendBotMsg(`Hello! 👋 I am <b>Jinu</b>, your AI Corporate Compliance Co-Pilot at <b>CraftEgon LLP</b>.<br><br>How can I assist you with your company registration, RoC filings, or statutory governance today?`);
}

function bind(){
  const trigger=document.getElementById('craftegon-chat-trigger');
  const badge=document.getElementById('craftegon-chat-badge');
  const win=document.getElementById('craftegon-chat-window');
  const closeBtn=document.getElementById('cchat-close-btn');
  const clearBtn=document.getElementById('cchat-clear-btn');
  const settingsBtn=document.getElementById('cchat-settings-btn');
  const brakesBtn=document.getElementById('cchat-brakes-btn');
  const form=document.getElementById('cchat-form');
  const input=document.getElementById('cchat-input-field');
  const pills=document.getElementById('cchat-pills-container');

  function toggle(open=null){
    const isOpen=win.classList.contains('open');
    const targetState=open!==null?open:!isOpen;
    if(targetState){
      win.classList.add('open');
      trigger.classList.add('active');
      trigger.style.display = 'none';
      if(badge)badge.style.opacity='0';
      initGreeting();
      setTimeout(()=>input&&input.focus(),150);
    }else{
      win.classList.remove('open');
      trigger.classList.remove('active');
      trigger.style.display = 'flex';
      if(badge)badge.style.opacity='1';
    }
  }

  if(trigger)trigger.addEventListener('click',()=>toggle());
  if(closeBtn)closeBtn.addEventListener('click',()=>toggle(false));
  if(settingsBtn)settingsBtn.addEventListener('click', openSettingsModal);
  if(brakesBtn)brakesBtn.addEventListener('click', openBrakesModal);
  if(clearBtn)clearBtn.addEventListener('click',()=>{
    const b=document.getElementById('cchat-messages-container');
    if(b)b.innerHTML='';
    conversationHistory = [];
    initGreeting();
  });

  if(form)form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const v=input.value.trim();
    if(v){handleQuery(v);input.value='';}
  });

  if(pills)pills.addEventListener('click',(e)=>{
    const btn=e.target.closest('.cchat-pill');
    if(btn){
      const q=btn.getAttribute('data-query');
      if(q)handleQuery(q);
    }
  });

  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'&&win.classList.contains('open'))toggle(false);
  });

  setTimeout(()=>{
    if(badge&&!win.classList.contains('open')){
      badge.style.opacity='0';
      setTimeout(()=>badge.remove(),400);
    }
  },8000);
}

function start(){
  ensureStyles();
  createWidget();
  bind();
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',start);}else{start();}
})();
