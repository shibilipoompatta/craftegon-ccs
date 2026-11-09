/**
 * ==============================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - INSTANT RETAINER & CHECKOUT ENGINE
 * Enterprise Micro-Retainer Booking, Dynamic UPI QR Code, and Deposit Ledger
 * ==============================================================================
 */

(function () {
  "use strict";

  var BANK_COORDINATES = {
    beneficiary: "CraftEgon Corporate Services (CCS)",
    accountNumber: "000205001234",
    ifsc: "ICIC0000002",
    bankName: "ICICI Bank Ltd",
    branch: "Connaught Place, New Delhi",
    accountType: "Corporate Current Account",
    upiId: "craftegon@icici"
  };

  var PRESET_TIERS = {
    "director-kyc": {
      id: "director-kyc",
      title: "Director KYC & Demat Review",
      price: 999,
      formatted: "₹999",
      sla: "Same-Day Dispatch",
      description: "Mandatory DIR-3 KYC verification and Rule 9B Demat security compliance check."
    },
    "name-run": {
      id: "name-run",
      title: "MCA Name Reservation (RUN)",
      price: 1999,
      formatted: "₹1,999",
      sla: "24–48 Hours",
      description: "Priority name search, trademark conflict check, and SPICe+ Part A name filing on MCA V3."
    },
    "incorporation-starter": {
      id: "incorporation-starter",
      title: "Pvt Ltd / LLP Starter Advance",
      price: 4999,
      formatted: "₹4,999",
      sla: "3–5 Days Turnaround",
      description: "Locks in SPICe+ drafting, Class-3 DSC allocation, digital MOA/AOA, and PAN/TAN processing."
    },
    "retainer-quarter": {
      id: "retainer-quarter",
      title: "RoC Retainer Quarter Advance",
      price: 7499,
      formatted: "₹7,499",
      sla: "Immediate Onboarding",
      description: "Quarterly retainer advance covering statutory register audits, board resolutions, and AOC-4 prep."
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
    return "CCS-ORD-" + new Date().getFullYear() + "-" + randomSuffix;
  }

  function getUpiIntentUrl(amount, orderRef) {
    var pa = encodeURIComponent(BANK_COORDINATES.upiId);
    var pn = encodeURIComponent(BANK_COORDINATES.beneficiary);
    var tn = encodeURIComponent("Retainer Booking " + orderRef);
    var am = encodeURIComponent(String(amount));
    return "upi://pay?pa=" + pa + "&pn=" + pn + "&am=" + am + "&cu=INR&tn=" + tn;
  }

  function getQrCodeUrl(upiUri) {
    // Encodes UPI URI into clean high-contrast SVG/PNG QR representation
    return "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(upiUri);
  }

  var activeModal = null;
  var currentOrderState = {
    tierId: "incorporation-starter",
    amount: 4999,
    orderRef: "",
    clientName: "",
    entityName: "",
    phone: "",
    email: ""
  };

  function createCheckoutModal() {
    var backdrop = document.createElement("div");
    backdrop.className = "ccs-checkout-backdrop";
    backdrop.id = "ccs-checkout-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-labelledby", "ccs-checkout-title");

    backdrop.innerHTML = [
      '<div class="ccs-checkout-modal">',
      '  <div class="ccs-checkout-header">',
      '    <div>',
      '      <div class="ccs-checkout-badge">Institutional Retainer Desk</div>',
      '      <h2 id="ccs-checkout-title" class="ccs-checkout-title">Lock In Statutory Compliance Retainer</h2>',
      '      <p class="ccs-checkout-subtitle">Direct institutional booking with transparent statutory accounting and zero markups.</p>',
      '    </div>',
      '    <button type="button" class="ccs-checkout-close" id="ccs-modal-close" aria-label="Close Checkout">&times;</button>',
      '  </div>',
      '  <div class="ccs-checkout-body">',
      '    <div class="ccs-tiers-grid" id="ccs-tiers-container"></div>',
      '    <div class="ccs-payment-tabs">',
      '      <button type="button" class="ccs-tab-btn active" data-tab="upi">Instant UPI &amp; QR Code</button>',
      '      <button type="button" class="ccs-tab-btn" data-tab="bank">Corporate Bank Transfer (NEFT)</button>',
      '    </div>',
      '    <div class="ccs-tab-panel active" id="ccs-tab-upi">',
      '      <div class="ccs-qr-box">',
      '        <img src="" alt="Dynamic UPI QR Code" class="ccs-qr-image" id="ccs-qr-code-img">',
      '        <div class="ccs-upi-id-pill">',
      '          <span>UPI ID: <strong>' + BANK_COORDINATES.upiId + '</strong></span>',
      '          <button type="button" class="ccs-copy-btn" data-copy="' + BANK_COORDINATES.upiId + '">Copy</button>',
      '        </div>',
      '        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">',
      '          <a href="#" class="if-btn-secondary" id="ccs-upi-mobile-btn" style="font-size: 0.82rem; padding: 0.4rem 0.85rem; border-color: #247A62; color: #247A62;">Pay via Any UPI App (GPay / PhonePe / Paytm) &rarr;</a>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="ccs-tab-panel" id="ccs-tab-bank">',
      '      <div class="ccs-bank-grid">',
      '        <div class="ccs-bank-item">',
      '          <span class="ccs-bank-label">Beneficiary Name</span>',
      '          <span class="ccs-bank-val">' + BANK_COORDINATES.beneficiary + '</span>',
      '        </div>',
      '        <div class="ccs-bank-item">',
      '          <span class="ccs-bank-label">Corporate Account No.</span>',
      '          <div style="display: flex; align-items: center; gap: 0.4rem;">',
      '            <span class="ccs-bank-val">' + BANK_COORDINATES.accountNumber + '</span>',
      '            <button type="button" class="ccs-copy-btn" data-copy="' + BANK_COORDINATES.accountNumber + '">Copy</button>',
      '          </div>',
      '        </div>',
      '        <div class="ccs-bank-item">',
      '          <span class="ccs-bank-label">IFSC Code</span>',
      '          <div style="display: flex; align-items: center; gap: 0.4rem;">',
      '            <span class="ccs-bank-val">' + BANK_COORDINATES.ifsc + '</span>',
      '            <button type="button" class="ccs-copy-btn" data-copy="' + BANK_COORDINATES.ifsc + '">Copy</button>',
      '          </div>',
      '        </div>',
      '        <div class="ccs-bank-item">',
      '          <span class="ccs-bank-label">Bank &amp; Branch</span>',
      '          <span class="ccs-bank-val">' + BANK_COORDINATES.bankName + ' (' + BANK_COORDINATES.branch + ')</span>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="ccs-utr-block">',
      '      <h4 class="ccs-utr-title">',
      '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      '        Confirm Payment Deposit (Instant Docket Activation)',
      '      </h4>',
      '      <p style="font-size: 0.8rem; color: #166534; margin: 0 0 0.65rem 0; line-height: 1.4;">After completing your UPI transfer or NEFT, paste your 12-digit UPI UTR / Bank Reference Number below to generate your official statutory retainer receipt:</p>',
      '      <div class="ccs-utr-input-group">',
      '        <input type="text" class="ccs-utr-input" id="ccs-utr-number" placeholder="Enter 12-digit UPI UTR or Bank Ref (e.g. 412389104821)" maxlength="24">',
      '        <button type="button" class="ccs-btn-confirm-pay" id="ccs-btn-confirm-utr">Generate Deposit Receipt &rarr;</button>',
      '      </div>',
      '      <div id="ccs-receipt-mount"></div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(backdrop);

    // Event Bindings
    backdrop.querySelector("#ccs-modal-close").addEventListener("click", closeCheckout);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeCheckout();
    });

    // Tab switching
    var tabBtns = backdrop.querySelectorAll(".ccs-tab-btn");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tabId = btn.dataset.tab;
        tabBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        backdrop.querySelectorAll(".ccs-tab-panel").forEach(function (p) { p.classList.remove("active"); });
        backdrop.querySelector("#ccs-tab-" + tabId).classList.add("active");
      });
    });

    // Copy buttons
    backdrop.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.dataset.copy;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            var orig = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(function () { btn.textContent = orig; }, 1500);
          });
        }
      });
    });

    // UTR submission
    backdrop.querySelector("#ccs-btn-confirm-utr").addEventListener("click", confirmPaymentReceipt);

    return backdrop;
  }

  function renderTierCards(container, selectedTierId) {
    container.innerHTML = "";
    Object.keys(PRESET_TIERS).forEach(function (key) {
      var tier = PRESET_TIERS[key];
      var card = document.createElement("div");
      card.className = "ccs-tier-card" + (key === selectedTierId ? " selected" : "");
      card.dataset.tierKey = key;
      card.innerHTML = [
        '<div class="ccs-tier-name">' + tier.title + '</div>',
        '<div class="ccs-tier-price">' + tier.formatted + '</div>',
        '<div class="ccs-tier-sla">' + tier.sla + '</div>'
      ].join("");

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
    currentOrderState.tierId = tierKey;
    currentOrderState.amount = tier.price;
    updatePaymentViews();
  }

  function updatePaymentViews() {
    if (!activeModal) return;
    var upiUri = getUpiIntentUrl(currentOrderState.amount, currentOrderState.orderRef);
    var qrImg = activeModal.querySelector("#ccs-qr-code-img");
    var mobileBtn = activeModal.querySelector("#ccs-upi-mobile-btn");

    if (qrImg) qrImg.src = getQrCodeUrl(upiUri);
    if (mobileBtn) mobileBtn.href = upiUri;
  }

  function confirmPaymentReceipt() {
    var utrInput = activeModal.querySelector("#ccs-utr-number");
    var utr = (utrInput ? utrInput.value : "").trim();
    if (!utr || utr.length < 6) {
      alert("Please enter a valid 12-digit UPI UTR or Bank Transaction Reference Number.");
      if (utrInput) utrInput.focus();
      return;
    }

    var selectedTier = PRESET_TIERS[currentOrderState.tierId] || { title: "Statutory Compliance Advance", formatted: "₹" + currentOrderState.amount };
    var receiptRef = "REC-" + currentOrderState.orderRef.replace("CCS-ORD-", "");
    var timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Store in Local Order Ledger
    var ledgerRecord = {
      receiptRef: receiptRef,
      orderRef: currentOrderState.orderRef,
      utr: utr,
      tierId: currentOrderState.tierId,
      tierTitle: selectedTier.title,
      amount: currentOrderState.amount,
      clientName: currentOrderState.clientName || "Corporate Client",
      timestamp: timestamp,
      status: "ALLOCATED_TO_CS_DESK"
    };

    try {
      var ledger = JSON.parse(localStorage.getItem("craftegon_orders_ledger") || "[]");
      ledger.push(ledgerRecord);
      localStorage.setItem("craftegon_orders_ledger", JSON.stringify(ledger));
    } catch (e) {}

    // Dispatch Conversion Pixel Purchase Event
    if (typeof window !== "undefined" && window.CraftegonPixels && typeof window.CraftegonPixels.trackPurchase === "function") {
      window.CraftegonPixels.trackPurchase(ledgerRecord);
    }

    // Render Printable Receipt Card
    var mount = activeModal.querySelector("#ccs-receipt-mount");
    var waNotifyText = encodeURIComponent(
      "Hello CraftEgon Compliance Desk, I have deposited payment for " + selectedTier.title +
      " (Ref: " + currentOrderState.orderRef + ", UTR: " + utr + "). Please confirm onboarding."
    );

    mount.innerHTML = [
      '<div class="ccs-receipt-card">',
      '  <div class="ccs-receipt-header">',
      '    <div>',
      '      <div class="ccs-receipt-brand">CRAFTEGON CORPORATE SERVICES</div>',
      '      <div style="font-size: 0.75rem; color: #64748B;">Official Statutory Deposit &amp; Retainer Acknowledgement</div>',
      '    </div>',
      '    <div style="text-align: right;">',
      '      <div class="ccs-receipt-ref">' + receiptRef + '</div>',
      '      <div style="font-size: 0.72rem; color: #64748B;">' + timestamp + ' IST</div>',
      '    </div>',
      '  </div>',
      '  <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse; margin-bottom: 1rem;">',
      '    <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 0.4rem 0; color: #64748B;">Service Docket:</td><td style="font-weight: 700; text-align: right;">' + selectedTier.title + '</td></tr>',
      '    <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 0.4rem 0; color: #64748B;">Deposit Amount:</td><td style="font-weight: 700; color: #247A62; text-align: right;">' + selectedTier.formatted + '</td></tr>',
      '    <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 0.4rem 0; color: #64748B;">UTR / Bank Ref:</td><td style="font-family: var(--font-mono, monospace); text-align: right;">' + utr + '</td></tr>',
      '    <tr><td style="padding: 0.4rem 0; color: #64748B;">Queue Status:</td><td style="font-weight: 700; color: #15803D; text-align: right;">✓ Active Officer Allocation (Under 2h SLA)</td></tr>',
      '  </table>',
      '  <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">',
      '    <button type="button" class="if-btn-secondary" onclick="window.print()" style="padding: 0.45rem 0.85rem; font-size: 0.8rem;">🖨️ Print / Save Receipt</button>',
      '    <a href="https://wa.me/918606918247?text=' + waNotifyText + '" target="_blank" rel="noopener noreferrer" class="if-btn-primary" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; background: #25D366; border-color: #20BA5A;">💬 Fast-Track on WhatsApp &rarr;</a>',
      '  </div>',
      '</div>'
    ].join("\n");
  }

  function openCheckout(options) {
    ensureCheckoutStyles();
    options = options || {};

    if (!activeModal) {
      activeModal = createCheckoutModal();
    }

    currentOrderState.orderRef = generateOrderReference();
    currentOrderState.tierId = options.tierId || "incorporation-starter";
    currentOrderState.clientName = options.clientName || "";
    currentOrderState.entityName = options.entityName || "";

    var tiersContainer = activeModal.querySelector("#ccs-tiers-container");
    renderTierCards(tiersContainer, currentOrderState.tierId);
    selectTier(currentOrderState.tierId);

    // Reset UTR / Receipt
    var utrInput = activeModal.querySelector("#ccs-utr-number");
    if (utrInput) utrInput.value = "";
    var receiptMount = activeModal.querySelector("#ccs-receipt-mount");
    if (receiptMount) receiptMount.innerHTML = "";

    activeModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Dispatch Conversion Pixel InitiateCheckout Event
    if (typeof window !== "undefined" && window.CraftegonPixels && typeof window.CraftegonPixels.trackInitiateCheckout === "function") {
      window.CraftegonPixels.trackInitiateCheckout(PRESET_TIERS[currentOrderState.tierId]);
    }
  }

  function closeCheckout() {
    if (activeModal) {
      activeModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Global Checkout API
  window.CraftegonCheckout = {
    open: openCheckout,
    close: closeCheckout,
    tiers: PRESET_TIERS,
    bankCoordinates: BANK_COORDINATES
  };

  // Auto-bind to elements with [data-checkout] attribute
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
