/**
 * CraftEgon CCS - Autonomous AI Counsel Widget (<20KB)
 * Ivory/White/Gold Design System - Vanilla JS - RAG-Lite Statutory Engine
 * 2026 Rules: Companies Act 2013 (Sec 403, 43B(h), CCFS-2026), MCA V3, FEMA 1999, GST Act 2017, DPDP Act 2023, MSMED Act 2006
 */
(function(){'use strict';
if(window.__CRAFTEGON_CHAT_INITIALIZED__)return;
window.__CRAFTEGON_CHAT_INITIALIZED__=true;

const KB=[
  {k:['incorporat','pvt ltd','private limited','llp','opc','one person','section 8','formation','spice+','director','shareholder','din','dsc','pan','tan','run'],
  r:`Entity incorporation on MCA V3 via SPICe+ (INC-32):<br>
  * <b>Pvt Ltd:</b> Min. 2 Directors (1 resident) & 2 Shareholders. Bundles PAN, TAN, EPFO, ESIC & Bank A/c.<br>
  * <b>LLP:</b> Min. 2 Designated Partners under LLP Act 2008.<br>
  * <b>OPC:</b> Sec 2(62), single resident member with nominee director.<br>
  * <b>Section 8:</b> Non-profit INC-12 license with zero dividend distribution.<br>
  * <b>CCFS-2026:</b> Amnesty scheme for overdue filings until <b>15 Sep 2026</b> (10% additional fee).`,
  a:[['Pvt Ltd Formation Service','/services/pvt-ltd-registration.html'],['Post-Incorporation Portal','/conversion/post-incorporation-checkout.html'],['SPICe+ MCA V3 Blueprint','/knowledge/spice-plus-mca-v3-blueprint.html']]},

  {k:['aoc-4','aoc4','mgt-7','mgt7','mgt-14','mgt14','annual filing','roc compliance','agm','financial statement','annual return','dir-3 kyc','dir3 kyc','dpt-3','dpt3','msme-1','msme1','due date','deadline','ccfs','ccfs-2026'],
  r:`Annual RoC filings under Companies Act 2013:<br>
  * <b>Form AOC-4:</b> Financials within 30 days of AGM (typically Oct 30) under Sec 137.<br>
  * <b>Form MGT-7:</b> Annual return within 60 days of AGM (typically Nov 29) under Sec 92.<br>
  * <b>Form DIR-3 KYC:</b> Annual DIN KYC by Sept 30 (Delay fee: 5,000).<br>
  * <b>Form DPT-3:</b> Return of deposits/loans due annually by June 30.<br>
  * <b>Form MSME-1:</b> Vendor dues >45 days (due April 30 & Oct 31).<br>
  * <b>Form MGT-14:</b> Special resolutions filed within 30 days.<br>
  * <b>CCFS-2026 Amnesty:</b> 10% additional fee for overdue filings until <b>15 Sep 2026</b>.<br>
  Late filing penalty: 100/day per form without monetary ceiling.`,
  a:[['Compliance Calendar','/portal/dashboard.html'],['RoC Annual Retainer Plan','/services/roc-annual-compliance.html'],['Calculate RoC Late Fees','/conversion/calculator.html']]},

  {k:['portal','client portal','dashboard','compliance calendar','subscription','pricing','retainer plan','starter','growth','enterprise','tier','plan','retainer plans'],
  r:`CraftEgon CCS Client Portal & Compliance Calendar:<br>
  * <b>Regulatory Calendar:</b> Real-time countdown clocks calibrated for your CIN/LLPIN with automated WhatsApp/Email/SMS alerts.<br>
  * <b>Starter Plan (1,499/mo):</b> LLPs & micro-enterprises - deadline alerts & drafting credits.<br>
  * <b>Growth Plan (4,999/mo):</b> Pvt Ltd Startups - automated AOC-4/MGT-7 staging & priority CS review.<br>
  * <b>Enterprise Plan (14,999/mo):</b> Dedicated secretarial desk, Form MR-3 audit & cross-border FEMA advisory.<br>
  Annual billing includes 2 Months Free (Save 17%).`,
  a:[['Launch Compliance Calendar','/portal/dashboard.html'],['View Subscription Tiers & Checkout','/portal/subscription.html'],['Client Portal Gateway','/portal/index.html']]},

  {k:['late fee','delay','penalty','calculate fee','fine','cost of filing','overdue','fees calculator','mca penalty','403','ccfs'],
  r:`Under MCA Fee Rules 2014 & Companies Act 2013 Sec 403:<br>
  * <b>AOC-4 & MGT-7:</b> Flat 100/day per form from due date expiry without cap.<br>
  * <b>Normal Filings:</b> Additional fee multipliers from 2x (up to 30 days) to 12x/18x (>180 days).<br>
  * <b>DIR-3 KYC:</b> Direct statutory penalty of 5,000 post-Sept 30.<br>
  * <b>CCFS-2026:</b> 10% additional fee for overdue filings until <b>15 Sep 2026</b>.<br>
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
  * <b>GSTR-2B Reconciliation:</b> Auto-match purchase register before 11th monthly to secure valid ITC & avoid Rule 88C/88D notices.`,
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
  * <b>45-Day Rule:</b> Payment to MSME vendors within 45 days of written contract (Sec 43B(h) IT Act).<br>
  * <b>Default Consequence:</b> 100% expense disallowance under Sec 43B read with Sec 40(a)(ia).<br>
  * <b>Form MSME-1:</b> Half-yearly return due 31 Oct (Apr-Sep) & 30 Apr (Oct-Mar).<br>
  * <b>Tracker:</b> Use Craftegon MSME 43B(h) Tracker to auto-sync vendor Udyam status & payment aging.`,
  a:[['MSME 43B(h) Tracker','/conversion/calculator.html'],['MSME Form MSME-1 Service','/services/form-msme1.html'],['Udyam Registration','/services/msme-udyam.html']]},

  {k:['contact','phone','whatsapp','email','call','office','address','location','reach out','support','admin@craftegon.com'],
  r:`CraftEgon Corporate Services (CCS) - Official Corporate Desk:<br>
  * <b>WhatsApp & Phone:</b> +91 86069 18247 (Direct Compliance Advisory)<br>
  * <b>Email:</b> admin@craftegon.com<br>
  * <b>Registered HQ:</b> CraftEgon LLP, Kozhikode, Kerala, India - PIN: 673001<br>
  * <b>Jurisdiction:</b> Pan-India coverage across all 24 RoC Offices, NCLT Benches & RBI Regional Offices.`,
  a:[['Chat Live on WhatsApp','https://wa.me/918606918247'],['Email Legal Desk','mailto:admin@craftegon.com'],['Annual Retainer Desk','/conversion/retainer-desk.html']]}
];

const PILLS=[
  ['Compliance Calendar','Open the Compliance Calendar'],
  ['Contact Desk','How do I contact CraftEgon CCS via WhatsApp or email?'],
  ['Subscription Plans','What are the SaaS subscription retainer tiers and pricing?'],
  ['Incorporate Pvt Ltd','How do I incorporate a Pvt Ltd company in India?'],
  ['MCA Due Dates','What are annual RoC compliance filing due dates?'],
  ['RoC Late Fees','How much are late fees for Form AOC-4 and MGT-7?'],
  ['RBI FLA Return','What is the deadline and requirement for RBI FLA return?'],
  ['DPDP Act Audit','What are our fiduciary obligations under DPDP Act 2023?'],
  ['Doc Drafter','Can you generate a founder or NDA agreement?'],
  ['MSME 43B(h)','What is the 45-day MSME payment rule and Form MSME-1?'],
  ['CCFS-2026','What is the CCFS-2026 amnesty scheme deadline?']
];

function ensureStyles(){
  if(!document.getElementById('craftegon-chat-css')){
    const l=document.createElement('link');
    l.id='craftegon-chat-css';
    l.rel='stylesheet';
    l.href='/assets/css/chat-widget.css';
    document.head.appendChild(l);
  }
}

function createWidget(){
  if(document.getElementById('craftegon-chat-window'))return;
  const t=document.createElement('button');
  t.id='craftegon-chat-trigger';
  t.setAttribute('aria-label','Open CraftEgon AI Counsel');
  t.innerHTML=`<div class="chat-pulse"></div><svg class="trigger-icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg><svg class="close-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const b=document.createElement('div');
  b.id='craftegon-chat-badge';
  b.innerHTML=`<span class="badge-dot"></span> AI Counsel`;
  const w=document.createElement('div');
  w.id='craftegon-chat-window';
  w.setAttribute('role','dialog');
  w.setAttribute('aria-label','CraftEgon AI Counsel');
  w.innerHTML=`<div class="cchat-header">
  <div class="cchat-brand-wrap">
    <img src="/assets/images/craftegon-logo.jpg" alt="Craftegon CCS Logo" class="cchat-avatar">
    <div class="cchat-brand-info">
      <h4>Craftegon AI Counsel</h4>
      <span><span class="cchat-status-dot"></span> Autonomous Statutory Intelligence</span>
    </div>
  </div>
  <div class="cchat-header-actions">
    <button class="cchat-btn-icon" id="cchat-clear-btn" title="Reset Conversation"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.7L21 8M21 3v5h-5"/></svg></button>
    <button class="cchat-btn-icon" id="cchat-close-btn" title="Minimize Counsel"><svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
  </div>
  </div>
  <div class="cchat-body" id="cchat-messages-container"></div>
  <div class="cchat-pills-bar" id="cchat-pills-container">
  ${PILLS.map(([l,q])=>`<button class="cchat-pill" data-query="${escapeHtml(q)}">${l}</button>`).join('')}
  </div>
  <div class="cchat-footer">
  <form id="cchat-form" class="cchat-input-row" onsubmit="return false;">
    <input type="text" id="cchat-input-field" class="cchat-input" placeholder="Ask: 'AOC-4 due date', 'CCFS-2026 amnesty', 'MSME 45-day rule', 'RBI FLA filing'..." autocomplete="off">
    <button type="submit" id="cchat-send-btn" class="cchat-send-btn" aria-label="Send message"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg></button>
  </form>
  <div class="cchat-disclaimer">Autonomous informational guide for statutory reference. Not legal advice. <a href="/legal/disclaimer.html" target="_blank">Full Disclaimer</a></div>
  </div>`;
  document.body.appendChild(t);
  document.body.appendChild(b);
  document.body.appendChild(w);
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

function appendBotMsg(h,acts=[]){
  const b=document.getElementById('cchat-messages-container');
  if(!b)return;
  let aHtml=acts&&acts.length?`<div class="cchat-actions-grid">${acts.map(([l,u])=>{
    const safeU = (typeof u === 'string' && (u.startsWith('/') || u.startsWith('https://'))) ? escapeHtml(u) : '#';
    return `<a href="${safeU}" class="cchat-action-btn"><span>${escapeHtml(l)}</span><span>&rarr;</span></a>`;
  }).join('')}</div>`:'';
  const e=document.createElement('div');
  e.className='cchat-msg bot';
  e.innerHTML=`<div class="cchat-bubble">${h}${aHtml}</div><div class="cchat-timestamp">${getTime()} - Craftegon AI Counsel</div>`;
  b.appendChild(e);
  b.scrollTop=b.scrollHeight;
}

function showTyping(){
  const b=document.getElementById('cchat-messages-container');
  if(!b)return;
  const e=document.createElement('div');
  e.id='cchat-active-typing';
  e.className='cchat-typing';
  e.innerHTML=`<span>Analyzing statutory rules...</span><div class="cchat-typing-dots"><span></span><span></span><span></span></div>`;
  b.appendChild(e);
  b.scrollTop=b.scrollHeight;
}

function hideTyping(){const e=document.getElementById('cchat-active-typing');if(e)e.remove();}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&','<':'<','>':'>','"':'"',"'":'}[m]));}

function matchQuery(q){
  const n=q.toLowerCase().trim();
  let best=null,maxScore=0;
  for(const item of KB){
    let score=0;
    for(const kw of item.k){if(n.includes(kw))score+=(kw.length>5?3:2);}
    if(score>maxScore){maxScore=score;best=item;}
  }
  if(maxScore>=2&&best)return{r:best.r,a:best.a};
  return{
    r:`I have noted your inquiry regarding <em>"${escapeHtml(q)}"</em>.<br>
    CraftEgon CCS provides autonomous corporate secretarial and statutory compliance intelligence under the <b>Companies Act, 2013</b>, <b>FEMA 1999</b>, <b>GST Act 2017</b>, <b>DPDP Act, 2023</b>, and <b>MSMED Act 2006</b>.<br>
    You can calculate statutory fees, review compliance requirements, or connect with our corporate advisory desk:`,
    a:[['Fee & Late Fee Calculator','/conversion/calculator.html'],['Contact Compliance Desk','/conversion/retainer-desk.html'],['Explore Practice Areas','/index.html#practice-areas']]
  };
}

function handleQuery(q){
  if(!q||!q.trim())return;
  appendUserMsg(q);
  showTyping();
  setTimeout(()=>{
    hideTyping();
    const res=matchQuery(q);
    appendBotMsg(res.r,res.a);
  },400);
}

function initGreeting(){
  const b=document.getElementById('cchat-messages-container');
  if(!b||b.children.length>0)return;
  appendBotMsg(`Welcome to <b>Craftegon AI Counsel</b> - Autonomous Statutory Intelligence for Indian Corporate Compliance.<br>
  I provide real-time guidance on <b>Companies Act 2013</b> (Sec 403, 43B(h), CCFS-2026), <b>MCA V3</b>, <b>FEMA 1999</b>, <b>GST Act 2017</b>, <b>DPDP Act 2023</b>, and <b>MSMED Act 2006</b>.<br>
  <i>Note: This assistant provides procedural information only and does not constitute formal legal advice or representation.</i><br>
  Select a prompt below or type your inquiry (e.g., "CCFS-2026 deadline", "MSME 45-day payment rule", "GSTR-2B reconciliation").`);
}

function bind(){
  const trigger=document.getElementById('craftegon-chat-trigger');
  const badge=document.getElementById('craftegon-chat-badge');
  const win=document.getElementById('craftegon-chat-window');
  const closeBtn=document.getElementById('cchat-close-btn');
  const clearBtn=document.getElementById('cchat-clear-btn');
  const form=document.getElementById('cchat-form');
  const input=document.getElementById('cchat-input-field');
  const pills=document.getElementById('cchat-pills-container');
  function toggle(open=null){
    const isOpen=win.classList.contains('open');
    const targetState=open!==null?open:!isOpen;
    if(targetState){
      win.classList.add('open');
      trigger.classList.add('active');
      if(badge)badge.style.opacity='0';
      initGreeting();
      setTimeout(()=>input&&input.focus(),150);
    }else{
      win.classList.remove('open');
      trigger.classList.remove('active');
      if(badge)badge.style.opacity='1';
    }
  }
  if(trigger)trigger.addEventListener('click',()=>toggle());
  if(closeBtn)closeBtn.addEventListener('click',()=>toggle(false));
  if(clearBtn)clearBtn.addEventListener('click',()=>{
    const b=document.getElementById('cchat-messages-container');
    if(b)b.innerHTML='';
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