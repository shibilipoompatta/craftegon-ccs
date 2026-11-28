/**
 * CraftEgon Corporate Services - 60-Second Entity Selector Wizard
 * Dynamically computes optimal corporate vehicle recommendation based on:
 * 1. Capital & Funding Strategy (VC vs Bootstrapped vs Solo vs Non-Profit)
 * 2. Founding Team Size (Solo vs Multiple)
 * 3. Governance / Audit Preference (Institutional vs Lightweight)
 */
(function() {
  'use strict';

  function updateEntityWizard() {
    // 1. Visually sync active states on all chips
    var chips = document.querySelectorAll('.wizard-chip');
    chips.forEach(function(chip) {
      var input = chip.querySelector('input[type="radio"]');
      if (input && input.checked) {
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });

    // 2. Read selected preferences
    var goalInput = document.querySelector('input[name="w-goal"]:checked');
    var teamInput = document.querySelector('input[name="w-team"]:checked');
    var auditInput = document.querySelector('input[name="w-audit"]:checked');

    var goal = goalInput ? goalInput.value : 'vc';
    var team = teamInput ? teamInput.value : 'multiple';
    var audit = auditInput ? auditInput.value : 'institutional';

    // 3. Locate output elements
    var titleEl = document.getElementById('rec-title');
    var tagEl = document.getElementById('rec-tag');
    var badgeEl = document.getElementById('rec-badge');
    var descEl = document.getElementById('rec-desc');
    var priceEl = document.getElementById('rec-price');
    var subEl = document.getElementById('rec-sub');
    var h1El = document.getElementById('rec-h1');
    var h2El = document.getElementById('rec-h2');
    var h3El = document.getElementById('rec-h3');
    var ctaEl = document.getElementById('rec-cta');
    var waEl = document.getElementById('rec-wa-btn');

    if (!titleEl) return;

    // 4. Default recommendation: Private Limited Company
    var rec = {
      title: "Private Limited Company (SPICe+)",
      tag: "Companies Act 2013",
      badge: "100% STATUTORY FIT • EQUITY FINANCING READY",
      desc: "India's standard corporate vehicle for high-growth ventures. Required by institutional angels and venture capital funds to issue preference shares, convertible debt, and employee stock option pools (ESOPs).",
      price: "From ₹7,500",
      sub: "+ Applicable GST, Govt Fees & Stamp Duty",
      h1: "Complete limited liability protection ring-fencing personal assets",
      h2: "Zero MCA government filing fee for authorized capital up to ₹15 Lakhs",
      h3: "3–5 working days turnaround supervised by practicing CS & CA",
      url: "/services/pvt-ltd-registration.html",
      ctaText: "Incorporate Company →",
      waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended a Private Limited Company. I want to proceed with incorporation."
    };

    // 5. Decision Matrix
    if (goal === 'nonprofit') {
      rec = {
        title: "Section 8 Non-Profit Company",
        tag: "Companies Act 2013",
        badge: "100% STATUTORY FIT • NON-PROFIT ENTITY",
        desc: "The gold standard for charitable foundations, NGOs, and CSR implementation agencies. Unlocks Central Govt Section 8 License, Section 12AB tax exemption, and Section 80G donor deductions.",
        price: "From ₹15,000",
        sub: "+ Applicable GST, Govt Fees & Stamp Duty",
        h1: "Eligible for Section 12AB income tax exemption & 80G donor deductions",
        h2: "Central Government Section 8 License issued by CRC/MCA",
        h3: "Complete statutory MOA/AOA drafting with mandatory non-profit clauses",
        url: "/services/section-8-registration.html",
        ctaText: "Register Section 8 Company →",
        waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended a Section 8 Non-Profit Company. I want to discuss registration."
      };
    } else if (goal === 'vc') {
      rec = {
        title: "Private Limited Company (SPICe+)",
        tag: "Companies Act 2013",
        badge: "100% STATUTORY FIT • EQUITY FINANCING READY",
        desc: "India's standard corporate vehicle for high-growth ventures. Required by institutional angels and venture capital funds to issue preference shares, convertible debt, and employee stock option pools (ESOPs).",
        price: "From ₹7,500",
        sub: "+ Applicable GST, Govt Fees & Stamp Duty",
        h1: "Complete limited liability protection ring-fencing personal assets",
        h2: "Zero MCA government filing fee for authorized capital up to ₹15 Lakhs",
        h3: "3–5 working days turnaround supervised by practicing CS & CA",
        url: "/services/pvt-ltd-registration.html",
        ctaText: "Incorporate Company →",
        waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended a Private Limited Company. I want to proceed with incorporation."
      };
    } else if (team === 'solo' || goal === 'solo') {
      // Under Indian Law, an LLP requires minimum 2 partners (LLP Act 2008 Sec 6).
      // A solo founder can form an OPC (corporate) or Sole Proprietorship (unincorporated).
      if (audit === 'institutional') {
        rec = {
          title: "One Person Company (OPC)",
          tag: "Section 2(62) Companies Act",
          badge: "100% STATUTORY FIT • 100% SOLO CONTROL",
          desc: "Full corporate veil and limited liability ring-fencing with 100% single-member equity control. Exempt from holding mandatory annual general meetings (AGMs).",
          price: "From ₹6,500",
          sub: "+ Applicable GST, Govt Fees & Stamp Duty",
          h1: "100% solo equity ownership with corporate limited liability",
          h2: "Nominee director documentation (Form INC-3) included",
          h3: "Statutory exemption from holding formal AGMs under Section 96",
          url: "/services/opc-registration.html",
          ctaText: "Incorporate OPC →",
          waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended an OPC. I want to discuss formation."
        };
      } else {
        rec = {
          title: "Sole Proprietorship Registration",
          tag: "MSMED Act & GSTN Network",
          badge: "100% STATUTORY FIT • ZERO-COMPLIANCE FAST LAUNCH",
          desc: "The fastest, most cost-effective path to launch a solo consultancy, agency, or retail operation. Zero MCA compliance, instant current account readiness, and MSME Udyam protection.",
          price: "From ₹2,500",
          sub: "+ Applicable GST & Govt Fees at actuals",
          h1: "Bank-ready current account kit with MSME Udyam URN certificate",
          h2: "Zero MCA RoC annual filings & zero statutory audit requirements",
          h3: "Section 43B(h) 45-day statutory payment protection under MSMED Act",
          url: "/services/proprietorship-registration.html",
          ctaText: "Start Sole Proprietorship →",
          waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended a Sole Proprietorship. I want to discuss registration."
        };
      }
    } else {
      // Multiple founders (2+ Partners)
      if (goal === 'bootstrapped' || audit === 'lightweight') {
        rec = {
          title: "Limited Liability Partnership (LLP)",
          tag: "LLP Act 2008",
          badge: "100% STATUTORY FIT • AUDIT-EXEMPT PARTNERSHIP",
          desc: "The optimal hybrid structure for professional firms, consultancies, and profitable joint ventures. Partners enjoy limited liability without mandatory statutory audits up to ₹40 Lakhs turnover.",
          price: "From ₹6,000",
          sub: "+ Applicable GST, Stamp Duty & Govt Fees",
          h1: "Audit exemption under ₹40 Lakhs turnover / ₹25 Lakhs partner capital",
          h2: "Flexible profit distribution without corporate dividend distribution taxes",
          h3: "Customized LLP Agreement drafting and Form 3 e-filing with RoC",
          url: "/services/llp-registration.html",
          ctaText: "Incorporate LLP →",
          waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended an LLP. I want to discuss registration."
        };
      } else {
        // Institutional + Bootstrapped / Services + Multiple Founders -> Private Limited Company
        rec = {
          title: "Private Limited Company (SPICe+)",
          tag: "Companies Act 2013",
          badge: "100% STATUTORY FIT • CORPORATE ENTERPRISE",
          desc: "India's standard corporate vehicle for institutional credibility, multi-founder equity split, and structured board governance with statutory audits.",
          price: "From ₹7,500",
          sub: "+ Applicable GST, Govt Fees & Stamp Duty",
          h1: "Complete limited liability protection ring-fencing personal assets",
          h2: "Zero MCA government filing fee for authorized capital up to ₹15 Lakhs",
          h3: "3–5 working days turnaround supervised by practicing CS & CA",
          url: "/services/pvt-ltd-registration.html",
          ctaText: "Incorporate Company →",
          waMsg: "Hello CraftEgon Corporate Services (CCS), I used the Entity Selector and was recommended a Private Limited Company. I want to proceed with incorporation."
        };
      }
    }

    // 6. Update the Output Card DOM safely
    if (titleEl) titleEl.textContent = rec.title;
    if (tagEl) tagEl.textContent = rec.tag;
    if (badgeEl) badgeEl.textContent = rec.badge;
    if (descEl) descEl.textContent = rec.desc;
    if (priceEl) priceEl.textContent = rec.price;
    if (subEl) subEl.textContent = rec.sub;
    if (h1El) h1El.textContent = rec.h1;
    if (h2El) h2El.textContent = rec.h2;
    if (h3El) h3El.textContent = rec.h3;
    if (ctaEl) {
      ctaEl.href = rec.url;
      while (ctaEl.firstChild) ctaEl.removeChild(ctaEl.firstChild);
      var span = document.createElement('span');
      span.textContent = rec.ctaText;
      ctaEl.appendChild(span);
    }
    if (waEl) {
      waEl.href = "https://wa.me/918606918247?text=" + encodeURIComponent(rec.waMsg);
    }

    // 7. Micro-interaction card highlight
    var card = document.getElementById('wizard-output-card');
    if (card) {
      card.style.transition = 'box-shadow 0.25s ease, border-color 0.25s ease';
      card.style.borderColor = 'var(--accent-emerald, #247A62)';
      card.style.boxShadow = '0 0 0 3px rgba(36, 122, 98, 0.15), 0 8px 24px rgba(36, 122, 98, 0.12)';
      setTimeout(function() {
        card.style.borderColor = 'var(--accent-mint-vibrant, #75CDA9)';
        card.style.boxShadow = '0 6px 24px rgba(36, 122, 98, 0.1)';
      }, 400);
    }
  }

  // Bind click & change listeners across chips and radios
  function initEntityWizard() {
    var radios = document.querySelectorAll('.wizard-chip input[type="radio"]');
    radios.forEach(function(radio) {
      radio.addEventListener('change', updateEntityWizard);
      radio.addEventListener('click', function() {
        setTimeout(updateEntityWizard, 10);
      });
    });

    var chips = document.querySelectorAll('.wizard-chip');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        var radio = chip.querySelector('input[type="radio"]');
        if (radio && !radio.checked) {
          radio.checked = true;
          // Trigger change event to ensure any listener catches it
          var changeEvt = new Event('change', { bubbles: true });
          radio.dispatchEvent(changeEvt);
        }
        setTimeout(updateEntityWizard, 10);
      });
      // Accessible keyboard control
      chip.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          var radio = chip.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            var changeEvt = new Event('change', { bubbles: true });
            radio.dispatchEvent(changeEvt);
            updateEntityWizard();
          }
        }
      });
    });

    // Run initial calculation
    updateEntityWizard();
  }

  // Delegated document level listeners (fail-safe for dynamic changes)
  document.addEventListener('change', function(e) {
    if (e.target && e.target.name && e.target.name.indexOf('w-') === 0) {
      updateEntityWizard();
    }
  });

  document.addEventListener('click', function(e) {
    if (e.target && e.target.closest && e.target.closest('.wizard-chip')) {
      setTimeout(updateEntityWizard, 10);
    }
  });

  // Execute on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEntityWizard);
  } else {
    initEntityWizard();
  }

  // Backup trigger after full window load
  window.addEventListener('load', updateEntityWizard);

  // Expose globally for testing / verification
  window.updateEntityWizard = updateEntityWizard;
})();
