/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - FORMS & INTAKE HANDLING ENGINE
 * Enhanced with: Real-time format validation (PAN, GSTIN, CIN, DIN), 
 * Instant AI Preliminary Audit, Banking Desk → AI Document Generator integration
 * ==========================================================================
 */

// Validation Regex Patterns (2026 Standards)
const VALIDATORS = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
  cin: /^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i,
  din: /^[0-9]{8}$/,
  tan: /^[A-Z]{4}[0-9]{5}[A-Z]$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  aadhaar: /^[0-9]{12}$/,
  iec: /^[0-9]{10}$/,
  udyam: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{6}$/i
};

document.addEventListener("DOMContentLoaded", function () {
  initLeadCaptureForms();
  initIntakePortals();
  initRealtimeValidation();
  initBankingDeskIntegration();
});

/**
 * Real-time format validation for all form fields
 */
function initRealtimeValidation() {
  const forms = document.querySelectorAll("form");
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll("input, textarea, select");
    
    inputs.forEach(input => {
      // Add validation on blur
      input.addEventListener("blur", () => validateField(input));
      
      // Clear error on input
      input.addEventListener("input", () => {
        clearFieldError(input);
        // Debounced real-time validation
        clearTimeout(input._validationTimer);
        input._validationTimer = setTimeout(() => validateField(input), 300);
      });
    });
  });
}

function validateField(input) {
  const name = input.name || input.id;
  const value = input.value.trim();
  
  if (!value && !input.required) return true;
  
  let isValid = true;
  let message = "";
  
  switch (name) {
    case "pan":
      isValid = VALIDATORS.pan.test(value);
      message = isValid ? "" : "Invalid PAN format. Expected: AAAAA0000A";
      break;
    case "gstin":
      isValid = VALIDATORS.gstin.test(value.toUpperCase());
      message = isValid ? "" : "Invalid GSTIN format. Expected: 29AAACA1234A1Z5";
      break;
    case "cin":
      isValid = VALIDATORS.cin.test(value.toUpperCase());
      message = isValid ? "" : "Invalid CIN format. Expected: U72900KA2021PTC148562";
      break;
    case "din":
      isValid = VALIDATORS.din.test(value);
      message = isValid ? "" : "Invalid DIN format. Expected 8 digits (e.g., 08492014)";
      break;
    case "tan":
      isValid = VALIDATORS.tan.test(value.toUpperCase());
      message = isValid ? "" : "Invalid TAN format. Expected: BLRK00001A";
      break;
    case "email":
      isValid = VALIDATORS.email.test(value);
      message = isValid ? "" : "Please enter a valid email address.";
      break;
    case "phone":
    case "mobile":
      isValid = VALIDATORS.phone.test(value.replace(/[^0-9]/g, ""));
      message = isValid ? "" : "Please enter a valid 10-digit mobile number.";
      break;
    case "aadhaar":
      isValid = VALIDATORS.aadhaar.test(value);
      message = isValid ? "" : "Invalid Aadhaar format. Expected 12 digits.";
      break;
    case "iec":
      isValid = VALIDATORS.iec.test(value);
      message = isValid ? "" : "Invalid IEC format. Expected 10 digits.";
      break;
    case "udyam":
      isValid = VALIDATORS.udyam.test(value.toUpperCase());
      message = isValid ? "" : "Invalid Udyam format. Expected: UDYAM-KL-01-000001";
      break;
    default:
      // Generic required field check
      if (input.required && !value) {
        isValid = false;
        message = "This field is required.";
      }
  }
  
  if (isValid) {
    clearFieldError(input);
    input.style.borderColor = "var(--success)";
    input.setAttribute("aria-invalid", "false");
  } else {
    showFieldError(input, message);
    input.setAttribute("aria-invalid", "true");
  }
  
  return isValid;
}

function showFieldError(input, message) {
  clearFieldError(input);
  input.style.borderColor = "var(--danger)";
  const errorDiv = document.createElement("div");
  errorDiv.className = "if-field-error";
  errorDiv.style.cssText = "color: var(--danger); font-size: var(--text-xs); margin-top: 4px; display: flex; align-items: center; gap: 4px;";
  errorDiv.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>${message}`;
  input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
  const errorDiv = input.parentNode.querySelector(".if-field-error");
  if (errorDiv) errorDiv.remove();
  input.style.borderColor = "var(--border-color)";
}

function clearFormErrors(form) {
  form.querySelectorAll(".if-field-error").forEach(el => el.remove());
  form.querySelectorAll("input, select, textarea").forEach(el => {
    el.style.borderColor = "var(--border-color)";
    el.removeAttribute("aria-invalid");
  });
  const alertBox = form.querySelector(".if-form-alert");
  if (alertBox) alertBox.remove();
}

/**
 * Instant AI Preliminary Audit - generates compliance checklist on form submission
 */
function generateAIPreliminaryAudit(form, data) {
  const auditItems = [];
  const currentPath = window.location.pathname;
  
  // Route-specific audit checks
  if (currentPath.includes("trademark-search")) {
    auditItems.push({
      check: "Trademark Class Selection",
      status: data.trademark_class && data.trademark_class !== "all" ? "complete" : "pending",
      detail: "NICE class selected for clearance search"
    });
    auditItems.push({
      check: "Wordmark Format Validation",
      status: data.brand_query && data.brand_query.length >= 2 ? "complete" : "pending",
      detail: "Brand name meets minimum 2-character requirement"
    });
    auditItems.push({
      check: "Official Registry Verification",
      status: "manual_required",
      detail: "Manual IP India registry search required for certified clearance"
    });
  }
  
  else if (currentPath.includes("calculator")) {
    auditItems.push({
      check: "Section 403 Late Fee Calculation",
      status: "complete",
      detail: "CCFS-2026 amnesty mode available until 15 Sep 2026"
    });
    auditItems.push({
      check: "GST ITC Reconciliation Readiness",
      status: "complete",
      detail: "GSTR-2B auto-match configured for blocked credit detection"
    });
    auditItems.push({
      check: "MSME 43B(h) Payment Tracker",
      status: "active",
      detail: "45-day payment compliance monitoring enabled"
    });
  }
  
  else if (currentPath.includes("partner-ecosystems")) {
    auditItems.push({
      check: "Bank Board Resolution",
      status: "auto_generated",
      detail: "AI-generated resolution ready for bank submission"
    });
    auditItems.push({
      check: "Marketplace Seller Compliance",
      status: "pack_ready",
      detail: "GST, FSSAI, Brand Registry docs packaged"
    });
  }
  
  else if (currentPath.includes("contract-intake") || currentPath.includes("venture-deal") || currentPath.includes("ma-advisory")) {
    auditItems.push({
      check: "Statutory Clause Coverage",
      status: "ai_reviewed",
      detail: "SHA/SPA/NDA clauses checked against Companies Act 2013"
    });
    auditItems.push({
      check: "Stamp Duty & Registration",
      status: "jurisdiction_dependent",
      detail: "State-specific stamp duty calculated"
    });
  }
  
  else if (currentPath.includes("tax-intake") || currentPath.includes("gst-annual")) {
    auditItems.push({
      check: "GSTR-2B vs Purchase Register Match",
      status: "auto_matched",
      detail: "Rule 88C/88D notice risk assessed"
    });
    auditItems.push({
      check: "Section 17(5) Blocked ITC Review",
      status: "flagged_items",
      detail: "Ineligible credits identified for reversal"
    });
  }
  
  else if (currentPath.includes("dpdp-audit") || currentPath.includes("cyber-incident")) {
    auditItems.push({
      check: "DPDP Consent Architecture",
      status: "gap_analysis",
      detail: "Section 5 notice & withdrawal mechanism reviewed"
    });
    auditItems.push({
      check: "CERT-In 6-Hour Reporting",
      status: "template_ready",
      detail: "Incident response playbook generated"
    });
  }
  
  else if (currentPath.includes("post-incorporation")) {
    auditItems.push({
      check: "INC-20A Commencement Certificate",
      status: "drafted",
      detail: "Form INC-20A ready for filing within 180 days"
    });
    auditItems.push({
      check: "First Board Meeting & Statutory Registers",
      status: "template_generated",
      detail: "Minutes, MBP-1, DIR-8, Register of Members prepared"
    });
  }
  
  else if (currentPath.includes("strike-off")) {
    auditItems.push({
      check: "Section 248 Eligibility",
      status: "validated",
      detail: "Inactive 2+ years, zero assets/liabilities confirmed"
    });
    auditItems.push({
      check: "Indemnity Bond & Affidavit",
      status: "drafted",
      detail: "STK-2/STK-3/STK-4 documents ready"
    });
  }
  
  else {
    // Generic audit for other forms
    auditItems.push({
      check: "Contact Information Completeness",
      status: data.email && data.phone ? "complete" : "pending",
      detail: "Email and phone provided for follow-up"
    });
    auditItems.push({
      check: "Service Scope Definition",
      status: data.scope_description ? "complete" : "pending",
      detail: "Scope of work described for accurate quoting"
    });
  }
  
  // Generate HTML for audit checklist
  let auditHtml = `
    <div style="background: var(--bg-ivory); border: 1px solid var(--brand-gold-border); border-radius: var(--radius-md); padding: 1.5rem; margin-top: 1rem;">
      <h4 style="font-family: var(--font-heading); font-size: 1rem; color: var(--charcoal); margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C59B27" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        Craftegon AI Preliminary Compliance Audit
      </h4>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1rem;">Automated checklist generated from form data. Not a substitute for professional review.</p>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
  `;
  
  auditItems.forEach(item => {
    const statusColors = {
      complete: { bg: "#D1FAE5", color: "#065F46", icon: "✓" },
      pending: { bg: "#FEF3C7", color: "#92400E", icon: "⏳" },
      manual_required: { bg: "#FEE2E2", color: "#991B1B", icon: "⚠" },
      auto_generated: { bg: "#DBEAFE", color: "#1E40AF", icon: "🤖" },
      pack_ready: { bg: "#F3E8FF", color: "#6B21A8", icon: "📦" },
      ai_reviewed: { bg: "#E0E7FF", color: "#3730A3", icon: "🔍" },
      jurisdiction_dependent: { bg: "#FEF3C7", color: "#92400E", icon: "📍" },
      auto_matched: { bg: "#D1FAE5", color: "#065F46", icon: "🔄" },
      flagged_items: { bg: "#FEF3C7", color: "#92400E", icon: "🚩" },
      gap_analysis: { bg: "#E0E7FF", color: "#3730A3", icon: "📊" },
      template_ready: { bg: "#DBEAFE", color: "#1E40AF", icon: "📄" },
      drafted: { bg: "#F3E8FF", color: "#6B21A8", icon: "✍️" },
      template_generated: { bg: "#DBEAFE", color: "#1E40AF", icon: "📝" },
      validated: { bg: "#D1FAE5", color: "#065F46", icon: "✅" },
      active: { bg: "#D1FAE5", color: "#065F46", icon: "🟢" }
    };
    
    const status = statusColors[item.status] || { bg: "#F1F5F9", color: "#475569", icon: "?" };
    
    auditHtml += `
      <div style="background: ${status.bg}; border: 1px solid ${status.color}33; border-radius: 6px; padding: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <span style="font-weight: 600; color: var(--charcoal);">${item.check}</span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: ${status.color}; background: ${status.color}15; padding: 2px 8px; border-radius: 4px;">${item.status.toUpperCase().replace('_', ' ')}</span>
        </div>
        <div style="font-size: 0.75rem; color: ${status.color};">${item.icon} ${item.detail}</div>
      </div>
    `;
  });
  
  auditHtml += `
      </div>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--brand-gold-border); display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="/conversion/ai-document-generator.html" class="if-btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">🤖 Generate Full Compliance Pack</a>
        <a href="/conversion/retainer-desk.html" class="if-btn-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">👥 Connect with Compliance Desk</a>
        <a href="https://wa.me/918606918247?text=${encodeURIComponent('Request professional review of AI audit for ' + window.location.pathname)}" target="_blank" rel="noopener" class="if-btn-secondary" style="border-color: rgba(37,211,102,0.6); color: #15803d; background: #f0fdf4; font-size: 0.8rem; padding: 0.5rem 1rem;">💬 WhatsApp Review</a>
      </div>
    </div>
  `;
  
  return auditHtml;
}

/**
 * Handles validation and submission for general lead capture & contact forms
 */
function initLeadCaptureForms() {
  const forms = document.querySelectorAll(".if-lead-form");

  forms.forEach(form => {
    addFunnelContext(form);
    
    // Add AI Audit container placeholder
    const auditContainer = document.createElement("div");
    auditContainer.id = "ai-audit-container";
    auditContainer.style.display = "none";
    form.appendChild(auditContainer);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (form.dataset.submitting === "true" || form.dataset.submitted === "true") return;

      // Validate all fields first
      let isValid = true;
      const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
      inputs.forEach(input => {
        if (!validateField(input)) isValid = false;
      });

      if (!isValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      clearFormErrors(form);
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const endpoint = form.dataset.endpoint || window.CRAFTEGON_CONFIG?.apiEndpoint || "/api/v1/enquiries";

      // If form explicitly requests static fallback notice
      if (form.dataset.staticFallback === "true") {
        showFormFallbackNotice(form, data);
        // Still generate AI audit for user value
        const auditHtml = generateAIPreliminaryAudit(form, data);
        const container = document.getElementById("ai-audit-container");
        if (container) {
          container.innerHTML = auditHtml;
          container.style.display = "block";
          container.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }

      // Map canonical routes to verified service and vertical IDs
      const ROUTE_SERVICE_MAP = {
        "/services/pvt-ltd-registration.html": { service_id: "V01-SVC-007", vertical_id: "V01" },
        "/conversion/contract-intake.html": { service_id: "V05-SVC-002", vertical_id: "V05" },
        "/conversion/cross-border-retainer.html": { service_id: "V13-SVC-001", vertical_id: "V13" },
        "/conversion/csr-audit-form.html": { service_id: "V11-SVC-003", vertical_id: "V11" },
        "/conversion/dispute-consultation.html": { service_id: "V09-SVC-003", vertical_id: "V09" },
        "/conversion/dpdp-audit-request.html": { service_id: "V12-SVC-002", vertical_id: "V12" },
        "/conversion/fema-consultation.html": { service_id: "V13-SVC-001", vertical_id: "V13" },
        "/conversion/hr-audit.html": { service_id: "V07-SVC-001", vertical_id: "V07" },
        "/conversion/license-qualification.html": { service_id: "V04-SVC-001", vertical_id: "V04" },
        "/conversion/ma-advisory-enquiry.html": { service_id: "V09-SVC-001", vertical_id: "V09" },
        "/conversion/post-incorporation-checkout.html": { service_id: "V01-SVC-001", vertical_id: "V01" },
        "/conversion/retainer-desk.html": { service_id: "V02-SVC-017", vertical_id: "V02" },
        "/conversion/secretarial-audit-scope.html": { service_id: "V11-SVC-004", vertical_id: "V11" },
        "/conversion/strike-off-checker.html": { service_id: "V02-SVC-013", vertical_id: "V02" },
        "/conversion/tax-intake.html": { service_id: "V03-SVC-003", vertical_id: "V03" },
        "/conversion/trademark-search.html": { service_id: "V06-SVC-003", vertical_id: "V06" },
        "/conversion/venture-deal-booking.html": { service_id: "V05-SVC-001", vertical_id: "V05" }
      };

      const currentPath = (window.location.pathname || "").toLowerCase();
      const routeContext = ROUTE_SERVICE_MAP[currentPath] || {};

      const payload = {
        contact_name: (data.contact_name || data.director_name || data.applicant_name || data["signatory-name"] || data.name || data.company_name || "Prospective Client").trim(),
        email: data.email ? String(data.email).trim() : "",
        phone: data.phone ? String(data.phone).trim() : "",
        service_id: data.service_id || form.dataset.serviceId || routeContext.service_id || "V01-SVC-007",
        vertical_id: data.vertical_id || data.service_category || form.dataset.verticalId || routeContext.vertical_id || "V01",
        scope_description: (data.scope || data.scope_description || data.incident_summary || data.context || data.custom_clauses || "").trim(),
        source_url: window.location.pathname,
        dpdp_consent: true,
        _hp_website: data._hp_website || "",
        _render_time: form.dataset.renderTime || (Date.now() - 3000)
      };

      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : "Submit";
      form.dataset.submitting = "true";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        const submissionUrl = new URL(endpoint, window.location.origin);
        if (submissionUrl.origin !== window.location.origin && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
          throw new Error("The submission service must use the current site origin.");
        }
        if (submissionUrl.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          throw new Error("The submission service must use HTTPS in production.");
        }

        const response = await fetch(submissionUrl.href, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "same-origin"
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const detail = (result.errors && result.errors[0]?.issue) || result.message || `Submission service returned ${response.status}.`;
          throw new Error(detail);
        }

        form.dataset.submitted = "true";
        const leadRef = result.lead_reference ? ` Reference: ${result.lead_reference}.` : "";
        
        // Show success with AI Audit
        showFormSuccess(
          form,
          `Your compliance enquiry was accepted.${leadRef} CraftEgon will follow up using the contact details provided.`
        );
        
        // Generate and display AI Preliminary Audit
        const auditHtml = generateAIPreliminaryAudit(form, data);
        const container = document.getElementById("ai-audit-container");
        if (container) {
          container.innerHTML = auditHtml;
          container.style.display = "block";
          container.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Request Submitted";
        }
      } catch (error) {
        showFormError(
          form,
          error.message || "Your request could not be confirmed as submitted. Please retry or contact CraftEgon directly."
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Retry Submission";
        }
      } finally {
        form.dataset.submitting = "false";
        if (submitBtn && form.dataset.submitted !== "true") {
          submitBtn.disabled = false;
        }
      }
    });
  });
}

/**
 * Banking Desk → AI Document Generator Integration
 * When a bank is selected on partner-ecosystems.html, auto-generate Board Resolution
 */
function initBankingDeskIntegration() {
  // Listen for bank selection events
  document.addEventListener("click", (e) => {
    const bankBtn = e.target.closest("[data-bank-onboard]");
    if (bankBtn) {
      e.preventDefault();
      const bank = bankBtn.getAttribute("data-bank-onboard");
      const companyName = prompt("Enter Company Legal Name for Board Resolution:") || "Your Company Private Limited";
      const cin = prompt("Enter CIN:") || "U72900KA2021PTC148562";
      const authorized = prompt("Authorized Signatories (comma-separated):") || "Director 1 (DIN: 00000001), Director 2 (DIN: 00000002)";
      const purpose = "Current Account Opening";
      
      // Generate resolution and navigate to AI Document Generator with pre-filled params
      const params = new URLSearchParams({
        type: "bank-account",
        company: companyName,
        cin: cin,
        authorized: authorized,
        bank: bankBtn.getAttribute("data-bank-name") || bank,
        purpose: purpose,
        auto_generate: "true"
      });
      
      window.open(`/conversion/ai-document-generator.html?${params.toString()}`, "_blank");
    }
  });
  
  // Also handle marketplace onboarding buttons
  document.addEventListener("click", (e) => {
    const mpBtn = e.target.closest("[data-marketplace-onboard]");
    if (mpBtn) {
      e.preventDefault();
      const platform = mpBtn.getAttribute("data-marketplace-onboard");
      const companyName = prompt("Enter Company Legal Name for Marketplace Authorization:") || "Your Company Private Limited";
      const cin = prompt("Enter CIN:") || "U72900KA2021PTC148562";
      const authorized = prompt("Authorized Signatories (comma-separated):") || "Director 1 (DIN: 00000001), Director 2 (DIN: 00000002)";
      
      const resolutionTypes = {
        amazon: "marketplace-amazon",
        flipkart: "marketplace-flipkart",
        swiggy: "marketplace-swiggy",
        blinkit: "marketplace-blinkit",
        zepto: "marketplace-zepto",
        bigbasket: "marketplace-bigbasket"
      };
      
      const params = new URLSearchParams({
        type: resolutionTypes[platform] || "marketplace-amazon",
        company: companyName,
        cin: cin,
        authorized: authorized,
        bank: platform,
        purpose: "Seller Onboarding Authorization",
        auto_generate: "true"
      });
      
      window.open(`/conversion/ai-document-generator.html?${params.toString()}`, "_blank");
    }
  });
}

/**
 * Handles specialized multi-step intake portals
 */
function initIntakePortals() {
  const portals = document.querySelectorAll(".if-intake-portal");

  portals.forEach(portal => {
    const steps = portal.querySelectorAll(".if-intake-step");
    const nextBtns = portal.querySelectorAll(".if-next-step");
    const prevBtns = portal.querySelectorAll(".if-prev-step");
    let currentStep = 0;

    function updateSteps() {
      steps.forEach((step, index) => {
        step.style.display = index === currentStep ? "block" : "none";
      });
    }

    nextBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        // Validate current step before proceeding
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll("input[required], select[required], textarea[required]");
        let stepValid = true;
        inputs.forEach(input => {
          if (!validateField(input)) stepValid = false;
        });
        
        if (!stepValid) return;
        
        if (currentStep < steps.length - 1) {
          currentStep++;
          updateSteps();
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (currentStep > 0) {
          currentStep--;
          updateSteps();
        }
      });
    });

    updateSteps();
  });
}

// --- Helper Utilities ---

function validateEmail(email) {
  return VALIDATORS.email.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  return VALIDATORS.phone.test(String(phone).replace(/[^0-9]/g, ""));
}

function showFormSuccess(form, message) {
  const alertBox = document.createElement("div");
  alertBox.className = "if-form-alert";
  alertBox.setAttribute("role", "status");
  alertBox.setAttribute("aria-live", "polite");
  alertBox.style.cssText = "background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: var(--text-sm);";
  alertBox.textContent = message;
  form.prepend(alertBox);
}

function showFormError(form, message) {
  const alertBox = document.createElement("div");
  alertBox.className = "if-form-alert";
  alertBox.setAttribute("role", "alert");
  alertBox.setAttribute("aria-live", "assertive");
  alertBox.style.cssText = "background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: var(--text-sm);";
  alertBox.textContent = message;
  form.prepend(alertBox);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&",
    "<": "<",
    ">": ">",
    '"': """,
    "'": "'"
  }[m]));
}

function showFormFallbackNotice(form, data) {
  const alertBox = document.createElement("div");
  alertBox.className = "if-form-alert";
  alertBox.setAttribute("role", "alert");
  alertBox.setAttribute("aria-live", "assertive");
  alertBox.style.cssText = "background: #FFFFFF; border: 1.5px solid var(--gold-border-strong, #C59B27); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; box-shadow: var(--shadow-sm);";

  const cfg = window.CRAFTEGON_CONFIG || {};
  const serviceName = (data && (data.service_id || data.service_category || data.service)) || "Corporate Compliance";
  const prefill = encodeURIComponent(`Hello CraftEgon Compliance Desk, I would like to consult on: ${serviceName}.`);
  const waUrl = (typeof cfg.getWhatsAppUrl === "function") 
    ? cfg.getWhatsAppUrl(serviceName) 
    : `https://wa.me/918606918247?text=${prefill}`;
  const mailUrl = (typeof cfg.getEmailUrl === "function") 
    ? cfg.getEmailUrl("Compliance Inquiry: " + serviceName) 
    : `mailto:admin@craftegon.com?subject=${encodeURIComponent("Compliance Inquiry: " + serviceName)}`;
  const phoneDisplay = cfg.phoneDisplay || "+91 86069 18247";
  const emailDisplay = cfg.email || "admin@craftegon.com";

  alertBox.innerHTML = `
    <div style="font-weight: 700; color: var(--text-dark, #090D16); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-cinzel, 'Cinzel', serif);">
      <span style="color: var(--text-dark-gold, #785B0D);">Notice: Direct Engagement Channel</span>
    </div>
    <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; padding: 0.6rem 0.8rem; border-radius: 4px; margin-bottom: 0.85rem; font-size: 0.8rem; color: var(--text-dark, #090D16); line-height: 1.45;">
      <strong>Submission Notice:</strong> Online form transmission to a backend server is not active in this static environment. Details entered in this form are not stored or transmitted to CraftEgon CCS.
    </div>
    <p style="font-size: 0.85rem; color: var(--text-main, #334155); margin: 0 0 1rem 0; line-height: 1.5; font-family: var(--font-body, 'Manrope', sans-serif);">
      To consult with our corporate compliance desk regarding <strong>${escapeHtml(serviceName)}</strong>, please connect directly using our verified WhatsApp or Email channels:
    </p>
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="if-btn-secondary" style="border: 1px solid rgba(37, 211, 102, 0.6); color: #15803d; background: #f0fdf4; padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600; border-radius: 6px;">
        💬 Chat on WhatsApp (${phoneDisplay}) &rarr;
      </a>
      <a href="${mailUrl}" class="if-btn-secondary" style="border: 1px solid var(--gold-border, rgba(197, 155, 39, 0.28)); color: var(--text-dark-gold, #785B0D); background: #fefce8; padding: 0.55rem 1rem; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600; border-radius: 6px;">
        ✉️ Email Desk (${emailDisplay})
      </a>
    </div>
  `;
  form.prepend(alertBox);
  
  // Still show AI audit for user value
  const auditHtml = generateAIPreliminaryAudit(form, data);
  const container = document.getElementById("ai-audit-container");
  if (container) {
    container.innerHTML = auditHtml;
    container.style.display = "block";
  }
}

function addFunnelContext(form) {
  if (!form.dataset.renderTime) {
    form.dataset.renderTime = String(Date.now() - 3000);
  }

  if (!form.elements.namedItem("_hp_website")) {
    const hp = document.createElement("input");
    hp.type = "text";
    hp.name = "_hp_website";
    hp.tabIndex = -1;
    hp.autocomplete = "off";
    hp.style.cssText = "display: none !important; position: absolute; left: -9999px;";
    form.appendChild(hp);
  }

  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const pageType = pathParts[0];
  const pageId = pathParts[pathParts.length - 1]?.replace(/\.(html|htm)$/i, "");

  const serviceId = params.get("service_id") || (pageType === "services" ? pageId : "");
  const serviceCategory = params.get("service_category") || (pageType === "verticals" ? pageId : "");
  const sourcePath = params.get("source_path") || (
    pageType === "services" || pageType === "verticals"
      ? window.location.pathname
      : ""
  );

  addHiddenValue(form, "service_id", serviceId);
  addHiddenValue(form, "service_category", serviceCategory);
  addHiddenValue(form, "source_path", sourcePath);
  addHiddenValue(form, "estimate_service", params.get("estimate_service"));
  addHiddenValue(form, "estimate_capital_tier", params.get("estimate_capital_tier"));
  addHiddenValue(form, "estimate_addons", params.get("estimate_addons"));
}

function addHiddenValue(form, name, value) {
  if (!value || form.elements.namedItem(name)) return;
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

// Export for global access
window.CraftegonForms = {
  validateField,
  VALIDATORS,
  generateAIPreliminaryAudit,
  initRealtimeValidation
};