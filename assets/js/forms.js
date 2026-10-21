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
  llpin: /^[A-Z]{3}-?[0-9]{4}$/i,
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
  const name = String(input.dataset.validate || input.name || input.id).toLowerCase().replace(/[\s_-]/g, "");
  const value = input.value.trim();
  
  if (!value && !input.required) return true;
  
  let isValid = true;
  let message = "";
  
  switch (name) {
    case "pan":
    case "companypan":
      isValid = VALIDATORS.pan.test(value);
      message = isValid ? "" : "Invalid PAN format. Expected: AAAAA0000A";
      break;
    case "gstin":
    case "gstinnumber":
      isValid = VALIDATORS.gstin.test(value.toUpperCase());
      message = isValid ? "" : "Invalid GSTIN format. Expected: 29AAACA1234A1Z5";
      break;
    case "cin":
      isValid = VALIDATORS.cin.test(value.toUpperCase());
      message = isValid ? "" : "Invalid CIN format. Expected: U72900KA2021PTC148562";
      break;
    case "llpin":
      isValid = VALIDATORS.llpin.test(value.toUpperCase());
      message = isValid ? "" : "Invalid LLPIN format. Expected 3 letters followed by 4 digits (hyphen optional).";
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

function preliminaryAuditItems(form) {
  const items = [];
  const identifierFields = [
    { label: 'PAN', regex: VALIDATORS.pan, name: /pan/i },
    { label: 'GSTIN', regex: VALIDATORS.gstin, name: /gstin/i },
    { label: 'CIN', regex: VALIDATORS.cin, name: /cin/i },
    { label: 'LLPIN', regex: VALIDATORS.llpin, name: /llpin/i },
    { label: 'DIN', regex: VALIDATORS.din, name: /din/i }
  ];

  identifierFields.forEach(field => {
    const input = Array.from(form.querySelectorAll('input')).find(candidate => field.name.test(`${candidate.name} ${candidate.id}`));
    if (!input || !input.value.trim()) return;
    const valid = field.regex.test(input.value.trim().toUpperCase());
    items.push({
      check: `${field.label} format`,
      status: valid ? 'passed' : 'review',
      detail: valid ? 'Matches the expected character pattern.' : 'Does not match the expected character pattern; verify before submitting.'
    });
  });

  const invalidFields = form.querySelectorAll('[aria-invalid="true"]').length;
  items.push({
    check: 'Required form fields',
    status: invalidFields ? 'review' : 'passed',
    detail: invalidFields ? `${invalidFields} field(s) need correction.` : 'Required fields passed browser-side validation.'
  });
  items.push({
    check: 'Official records and legal applicability',
    status: 'manual',
    detail: 'No registry, tax record, document, or legal position was independently verified by this checklist.'
  });
  return items;
}

function generateAIPreliminaryAudit(form) {
  const items = preliminaryAuditItems(form);
  const statusPresentation = {
    passed: { label: 'FORMAT CHECK PASSED', color: '#065F46', background: '#D1FAE5' },
    review: { label: 'REVIEW INPUT', color: '#92400E', background: '#FEF3C7' },
    manual: { label: 'HUMAN REVIEW', color: '#991B1B', background: '#FEE2E2' }
  };
  const rows = items.map(item => {
    const status = statusPresentation[item.status];
    return `<div style="background:${status.background};border:1px solid ${status.color}33;border-radius:6px;padding:.75rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.25rem">
        <strong>${escapeHtml(item.check)}</strong><span style="font-family:var(--font-mono);font-size:.7rem;color:${status.color}">${status.label}</span>
      </div><div style="font-size:.78rem;color:${status.color}">${escapeHtml(item.detail)}</div>
    </div>`;
  }).join('');

  return `<section class="preliminary-audit" aria-live="polite" style="background:var(--bg-ivory);border:1px solid var(--brand-gold-border);border-radius:var(--radius-md);padding:1.25rem;margin-top:1rem">
    <h4 style="font-family:var(--font-heading);font-size:1rem;color:var(--charcoal);margin:0 0 .5rem">Instant preliminary intake checklist</h4>
    <p style="font-size:.8rem;color:var(--text-muted);margin:0 0 1rem">Rules-based format checks only. This is not AI analysis, legal advice, or confirmation that a filing is compliant.</p>
    <div style="display:flex;flex-direction:column;gap:.5rem">${rows}</div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem">
      <button type="button" class="if-btn-secondary" data-download-checklist>Download checklist</button>
      <a href="/conversion/retainer-desk.html" class="if-btn-primary">Request human review</a>
    </div>
  </section>`;
}

function renderPreliminaryAudit(form, data) {
  let container = form.querySelector('.ai-audit-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ai-audit-container';
    form.appendChild(container);
  }
  container.innerHTML = generateAIPreliminaryAudit(form, data);
  container.style.display = 'block';
  container.querySelector('[data-download-checklist]')?.addEventListener('click', () => downloadPreliminaryChecklist(form));
  return container;
}

function downloadPreliminaryChecklist(form) {
  const lines = [
    'Craftegon CCS - Preliminary Intake Checklist',
    `Generated: ${new Date().toISOString()}`,
    `Page: ${window.location.pathname}`,
    '',
    'Rules-based format checks only. No registry, tax record, or legal position was independently verified.'
  ];
  preliminaryAuditItems(form).forEach(item => lines.push(`- ${item.check}: ${item.status.toUpperCase()} - ${item.detail}`));
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'craftegon-preliminary-intake-checklist.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
    auditContainer.className = "ai-audit-container";
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
        renderPreliminaryAudit(form, Object.fromEntries(new FormData(form).entries()));
        // Focus first invalid field
        const firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      clearFormErrors(form);
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const auditContainer = renderPreliminaryAudit(form, data);
      auditContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const endpoint = form.dataset.endpoint || window.CRAFTEGON_CONFIG?.apiEndpoint || "/api/v1/enquiries";

      // If form explicitly requests static fallback notice
      if (form.dataset.staticFallback === "true") {
        showFormFallbackNotice(form, data);
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
        
        showFormSuccess(
          form,
          `Your compliance enquiry was accepted.${leadRef} CraftEgon will follow up using the contact details provided.`
        );
        
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
  const marketplaceTypes = {
    amazon: "marketplace-amazon",
    flipkart: "marketplace-flipkart",
    swiggy: "marketplace-swiggy",
    blinkit: "marketplace-blinkit",
    zepto: "marketplace-zepto",
    bigbasket: "marketplace-bigbasket"
  };

  document.addEventListener("click", event => {
    const bankButton = event.target.closest("[data-bank-onboard]");
    const marketplaceButton = event.target.closest("[data-marketplace-onboard]");
    if (!bankButton && !marketplaceButton) return;
    event.preventDefault();

    const isBank = Boolean(bankButton);
    const provider = isBank
      ? bankButton.dataset.bankName || bankButton.dataset.bankOnboard
      : marketplaceButton.dataset.marketplaceName || marketplaceButton.dataset.marketplaceOnboard;
    const type = isBank ? "board-resolution-bank" : marketplaceTypes[marketplaceButton.dataset.marketplaceOnboard];
    if (!provider || !type) return;

    const params = new URLSearchParams({
      type,
      bank: provider,
      purpose: isBank ? "Corporate current account opening" : "Marketplace seller onboarding",
      auto_generate: "true"
    });
    const company = localStorage.getItem("craftegon_client_company");
    const cin = localStorage.getItem("craftegon_client_cin");
    if (company) params.set("company", company);
    if (cin) params.set("cin", cin);
    window.location.assign(`/conversion/ai-document-generator.html?${params.toString()}`);
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
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