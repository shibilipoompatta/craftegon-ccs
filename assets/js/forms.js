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
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      
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

      // Submission State
      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : "Submit";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        // Simulate secure API dispatch to CRM / backend endpoint
        await simulateApiSubmission(data);
        
        showFormSuccess(form, "Thank you! Your request has been securely submitted. Our corporate advisory desk will contact you within 60 minutes.");
        form.reset();
      } catch (error) {
        showFormError(form, "Submission failed. Please check your network connection or try again later.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  });
}

/**
 * Handles specialized multi-step intake portals and diagnostic tools (e.g., Tax Audit, Contract Upload)
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
  alertBox.style.cssText = "background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: var(--text-sm);";
  alertBox.textContent = message;
  form.prepend(alertBox);
}

function showFormError(form, message) {
  const alertBox = document.createElement("div");
  alertBox.className = "if-form-alert";
  alertBox.style.cssText = "background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: var(--text-sm);";
  alertBox.textContent = message;
  form.prepend(alertBox);
}

function simulateApiSubmission(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock successful server response
      console.log("Form payload transmitted successfully:", data);
      resolve({ status: "success", timestamp: new Date().toISOString() });
    }, 1000);
  });
}
