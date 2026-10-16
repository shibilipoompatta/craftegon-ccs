/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - FORMS & INTAKE HANDLING ENGINE
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  initLeadCaptureForms();
  initIntakePortals();
});

/**
 * Handles validation and submission for general lead capture & contact forms
 */
function initLeadCaptureForms() {
  const forms = document.querySelectorAll(".if-lead-form");

  forms.forEach(form => {
    addFunnelContext(form);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (form.dataset.submitting === "true" || form.dataset.submitted === "true") return;

      clearFormErrors(form);
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic Validation
      let isValid = true;
      if (data.email && !validateEmail(data.email)) {
        showFieldError(form, "email", "Please enter a valid email address.");
        isValid = false;
      }
      if (data.phone && !validatePhone(data.phone)) {
        showFieldError(form, "phone", "Please enter a valid 10-digit mobile number.");
        isValid = false;
      }

      if (!isValid) return;

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        showFormFallbackNotice(form, data);
        return;
      }

      // Submission State
      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : "Submit";
      form.dataset.submitting = "true";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        const submissionUrl = new URL(endpoint, window.location.origin);
        if (submissionUrl.origin !== window.location.origin) {
          throw new Error("The submission service must use the current site origin.");
        }
        if (submissionUrl.protocol !== "https:" && window.location.hostname !== "localhost") {
          throw new Error("The submission service must use HTTPS.");
        }

        const response = await fetch(submissionUrl.href, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "same-origin"
        });

        if (!response.ok) throw new Error(`Submission service returned ${response.status}.`);

        form.dataset.submitted = "true";
        showFormSuccess(
          form,
          "Your request was accepted by the submission service. CraftEgon can follow up using the contact details you provided."
        );
        if (submitBtn) submitBtn.textContent = "Request submitted";
      } catch (error) {
        showFormError(
          form,
          "Your request could not be confirmed as submitted. Your information remains in this form; please try again or contact CraftEgon directly."
        );
        if (submitBtn) submitBtn.disabled = false;
      } finally {
        form.dataset.submitting = "false";
        if (submitBtn && form.dataset.submitted !== "true") {
          submitBtn.textContent = originalText;
        }
      }
    });
  });
}

function addFunnelContext(form) {
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

/**
 * Handles specialized multi-step intake portals (e.g., Tax Audit, Contract Upload)
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
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(String(phone).replace(/[^0-9]/g, ""));
}

function showFieldError(form, fieldName, message) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (field) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "if-field-error";
    errorDiv.style.cssText = "color: var(--danger); font-size: var(--text-xs); margin-top: 4px;";
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = "var(--danger)";
  }
}

function clearFormErrors(form) {
  form.querySelectorAll(".if-field-error").forEach(el => el.remove());
  form.querySelectorAll("input, select, textarea").forEach(el => {
    el.style.borderColor = "var(--border-color)";
  });
  const alertBox = form.querySelector(".if-form-alert");
  if (alertBox) alertBox.remove();
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
