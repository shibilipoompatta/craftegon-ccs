/**
 * ==============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - SCOPED PROPOSAL & RETAINER DESK MODAL
 * Note: CraftEgon LLP has zero third-party banking collaborations and does not
 * process unverified direct UPI checkouts in static mode. Triggers direct scope
 * intake via /contact.html or WhatsApp Desk.
 * ==============================================================================
 */

(function () {
  "use strict";

  var PRESET_TIERS = {
    "director-kyc": {
      id: "director-kyc",
      title: "Director KYC & Demat Review",
      sla: "Scoped Filing",
      description: "DIR-3 KYC (Rule 12A) verification and Rule 9B Demat security compliance check."
    },
    "name-run": {
      id: "name-run",
      title: "MCA Name Reservation (RUN)",
      sla: "24–48 Hours Draft",
      description: "Name availability check, trademark conflict review, and SPICe+ Part A filing."
    },
    "incorporation-starter": {
      id: "incorporation-starter",
      title: "Pvt Ltd / LLP Incorporation Scope",
      sla: "Scoped Mandate",
      description: "SPICe+ / FiLLiP drafting, DIN allocation, digital MOA/AOA, and PAN/TAN coordination."
    },
    "retainer-annual-small": {
      id: "retainer-annual-small",
      title: "Year-1 Corporate Governance Retainer",
      sla: "Scoped Retainer",
      description: "Annual RoC secretarial calendar, AOC-4/MGT-7A prep, tax/GST coordination, and register maintenance."
    }
  };

  function ensureCheckoutStyles() {
    if (!document.getElementById("ccs-checkout-styles")) {
      var link = document.createElement("link");
      link.id = "ccs-checkout-styles";
      link.rel = "stylesheet";
      link.href = "/assets/css/checkout.css";
      document.head.appendChild(link);
    }
  }

  function generateOrderReference() {
    var randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return "CCS-REQ-" + new Date().getFullYear() + "-" + randomSuffix;
  }

  var activeModal = null;
  var currentOrderState = {
    tierId: "incorporation-starter",
    orderRef: "",
    clientName: ""
  };

  function createCheckoutModal() {
    var backdrop = document.createElement("div");
    backdrop.className = "ccs-checkout-backdrop";
    backdrop.id = "ccs-checkout-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-labelledby", "ccs-checkout-title");

    backdrop.innerHTML = [ /* sanitized */
      '<div class="ccs-checkout-modal">',
      '  <div class="ccs-checkout-header">',
      '    <div>',
      '      <div class="ccs-checkout-badge">CraftEgon LLP (LLPIN: ACO-0239)</div>',
      '      <h2 id="ccs-checkout-title" class="ccs-checkout-title">Request Itemised Scope &amp; Official Challan Split</h2>',
      '      <p class="ccs-checkout-subtitle">Advisory fees are scoped after entity review and billed strictly against formal CraftEgon LLP engagement terms. No automatic online payments or third-party bank ties apply.</p>',
      '    </div>',
      '    <button type="button" class="ccs-checkout-close" id="ccs-modal-close" aria-label="Close Scope Modal">&times;</button>',
      '  </div>',
      '  <div class="ccs-checkout-body">',
      '    <div class="ccs-tiers-grid" id="ccs-tiers-container"></div>',
      '    <div class="ccs-utr-block" style="margin-top:1rem;">',
      '      <h4 class="ccs-utr-title">Next Step: Confirm Scope with Commercial Desk (Alappuzha)</h4>',
      '      <p style="font-size:0.84rem;color:#334155;margin:0 0 0.85rem;line-height:1.5;">Reference: <strong id="ccs-scope-ref"></strong>. Choose your preferred intake path below to receive a written fee split (CCS professional fee vs. actual statutory challans/stamp duty).</p>',
      '      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">',
      '        <a href="/contact.html" id="ccs-modal-contact-link" class="if-btn-primary" style="text-decoration:none;padding:0.65rem 1.15rem;border-radius:6px;font-weight:700;">Open Formal Scope Form &rarr;</a>',
      '        <a href="https://wa.me/918606918247" id="ccs-modal-wa-link" target="_blank" rel="noopener noreferrer" class="if-btn-secondary" style="text-decoration:none;padding:0.65rem 1.15rem;border-radius:6px;font-weight:700;">WhatsApp Desk (+91 86069 18247) &rarr;</a>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(backdrop);
    backdrop.querySelector("#ccs-modal-close").addEventListener("click", closeCheckout);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeCheckout();
    });
    return backdrop;
  }

  function renderTierCards(container, selectedTierId) {
    container.replaceChildren(); /* sanitized */
    Object.keys(PRESET_TIERS).forEach(function (key) {
      var tier = PRESET_TIERS[key];
      var card = document.createElement("div");
      card.className = "ccs-tier-card" + (key === selectedTierId ? " selected" : "");
      card.dataset.tierKey = key;

      var nameEl = document.createElement("div");
      nameEl.className = "ccs-tier-name";
      nameEl.textContent = tier.title;

      var priceEl = document.createElement("div");
      priceEl.className = "ccs-tier-price";
      priceEl.style.fontSize = "0.92rem";
      priceEl.textContent = "Scoped Proposal";

      var slaEl = document.createElement("div");
      slaEl.className = "ccs-tier-sla";
      slaEl.textContent = tier.sla;

      card.append(nameEl, priceEl, slaEl);
      card.addEventListener("click", function () {
        container.querySelectorAll(".ccs-tier-card").forEach(function (c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        selectTier(key);
      });
      container.appendChild(card);
    });
  }

  function selectTier(tierKey) {
    var tier = PRESET_TIERS[tierKey] || PRESET_TIERS["incorporation-starter"];
    currentOrderState.tierId = tier.id;
    if (!activeModal) return;

    var refEl = activeModal.querySelector("#ccs-scope-ref");
    var contactLink = activeModal.querySelector("#ccs-modal-contact-link");
    var waLink = activeModal.querySelector("#ccs-modal-wa-link");
    var scopeMsg = "Scope Request (" + currentOrderState.orderRef + "): " + tier.title + (currentOrderState.clientName ? " for " + currentOrderState.clientName : "") + ". Please share itemised professional fee and statutory challan breakdown.";

    if (refEl) refEl.textContent = currentOrderState.orderRef;
    if (contactLink) contactLink.href = "/contact.html?scope=" + encodeURIComponent(scopeMsg);
    if (waLink) waLink.href = "https://wa.me/918606918247?text=" + encodeURIComponent("Hello CraftEgon CCS, " + scopeMsg);
  }

  function openCheckout(options) {
    ensureCheckoutStyles();
    options = options || {};
    if (!activeModal) activeModal = createCheckoutModal();

    currentOrderState.orderRef = generateOrderReference();
    currentOrderState.tierId = options.tierId || "incorporation-starter";
    currentOrderState.clientName = options.clientName || "";

    var tiersContainer = activeModal.querySelector("#ccs-tiers-container");
    renderTierCards(tiersContainer, currentOrderState.tierId);
    selectTier(currentOrderState.tierId);

    activeModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    if (activeModal) {
      activeModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  window.CraftegonCheckout = {
    open: openCheckout,
    close: closeCheckout,
    tiers: PRESET_TIERS
  };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-checkout]");
    if (trigger) {
      e.preventDefault();
      var tier = trigger.dataset.checkoutTier || "incorporation-starter";
      var name = trigger.dataset.clientName || "";
      openCheckout({ tierId: tier, clientName: name });
    }
  });
})();
