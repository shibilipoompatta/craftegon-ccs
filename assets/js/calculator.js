/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - FEE & RETAINER CALCULATOR ENGINE
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  const calculatorRoot = document.getElementById("if-fee-calculator");
  if (!calculatorRoot) return;

  // DOM Elements
  const verticalSelect = document.getElementById("calc-vertical");
  const serviceSelect = document.getElementById("calc-service");
  const capitalInputContainer = document.getElementById("calc-capital-container");
  const capitalInput = document.getElementById("calc-capital");
  const classCountInput = document.getElementById("calc-trademark-classes");
  const addOnCheckboxes = document.querySelectorAll(".calc-addon-checkbox");
  
  const totalAmountDisplay = document.getElementById("calc-total-amount");
  const breakdownList = document.getElementById("calc-breakdown-list");

  // Master Pricing Database
  const pricingData = {
    "entity-formation": {
      name: "Entity Formation & Registration",
      services: [
        { id: "pvt-ltd", name: "Private Limited Company (SPICe+)", baseFee: 7499 },
        { id: "llp", name: "Limited Liability Partnership (FiLLiP)", baseFee: 5999 },
        { id: "opc", name: "One Person Company (OPC)", baseFee: 6999 },
        { id: "section-8", name: "Section 8 NGO / Non-Profit", baseFee: 11999 },
        { id: "charitable-trust", name: "Charitable Trust Registration", baseFee: 8999 }
      ]
    },
    "roc-compliance": {
      name: "RoC Annual Compliance & Retainers",
      requiresCapital: true,
      services: [
        { id: "roc-standard-retainer", name: "Annual Secretarial & RoC Retainer", baseFee: 14999 }
      ]
    },
    "ipr-protection": {
      name: "IPR & Trademark Services",
      requiresClasses: true,
      services: [
        { id: "trademark-filing", name: "Trademark Registration (Startup/MSME/Individual)", baseFee: 4500 },
        { id: "trademark-corporate", name: "Trademark Registration (Large Enterprise)", baseFee: 9000 },
        { id: "copyright-filing", name: "Copyright Registration", baseFee: 5999 }
      ]
    }
  };

  function populateServices() {
    const selectedVertical = verticalSelect.value;
    const verticalInfo = pricingData[selectedVertical];
    
    serviceSelect.innerHTML = "";
    verticalInfo.services.forEach(service => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = `${service.name} (₹${service.baseFee.toLocaleString("en-IN")})`;
      option.dataset.fee = service.baseFee;
      serviceSelect.appendChild(option);
    });

    // Toggle conditional inputs
    if (capitalInputContainer) {
      capitalInputContainer.style.display = verticalInfo.requiresCapital ? "block" : "none";
    }
    
    const trademarkClassesContainer = document.getElementById("calc-classes-container");
    if (trademarkClassesContainer) {
      trademarkClassesContainer.style.display = verticalInfo.requiresClasses ? "block" : "none";
    }

    calculateTotal();
  }

  function calculateTotal() {
    const selectedVertical = verticalSelect.value;
    const verticalInfo = pricingData[selectedVertical];
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    
    if (!selectedOption) return;

    let baseFee = parseFloat(selectedOption.dataset.fee) || 0;
    let breakdown = [{ label: selectedOption.text.split(" (")[0], amount: baseFee }];

    // Handle Capital-based RoC Retainer Adjustments
    if (verticalInfo.requiresCapital && capitalInput) {
      const capitalLakhs = parseFloat(capitalInput.value) || 1;
      if (capitalLakhs > 10 && capitalLakhs <= 50) {
        const extra = 5000;
        baseFee += extra;
        breakdown.push({ label: "Authorized Capital Surcharge (10L - 50L)", amount: extra });
      } else if (capitalLakhs > 50) {
        const extra = 12000;
        baseFee += extra;
        breakdown.push({ label: "Authorized Capital Surcharge (> 50L)", amount: extra });
      }
    }

    // Handle Multi-class Trademark Fees
    if (verticalInfo.requiresClasses && classCountInput) {
      const classes = parseInt(classCountInput.value) || 1;
      if (classes > 1) {
        const additionalFee = (classes - 1) * 4500;
        baseFee += additionalFee;
        breakdown.push({ label: `${classes - 1} Additional Trademark Class(es)`, amount: additionalFee });
      }
    }

    // Add-ons Calculation
    addOnCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const addonFee = parseFloat(checkbox.dataset.fee) || 0;
        baseFee += addonFee;
        breakdown.push({ label: checkbox.dataset.label, amount: addonFee });
      }
    });

    // Update UI
    totalAmountDisplay.textContent = `₹${baseFee.toLocaleString("en-IN")}`;
    
    if (breakdownList) {
      breakdownList.innerHTML = breakdown.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: var(--text-sm); margin-bottom: 0.5rem; color: var(--text-muted);">
          <span>${item.label}</span>
          <span style="font-weight: 600; color: var(--text-main);">₹${item.amount.toLocaleString("en-IN")}</span>
        </div>
      `).join("");
    }
  }

  // Event Listeners
  if (verticalSelect) verticalSelect.addEventListener("change", populateServices);
  if (serviceSelect) serviceSelect.addEventListener("change", calculateTotal);
  if (capitalInput) capitalInput.addEventListener("input", calculateTotal);
  if (classCountInput) classCountInput.addEventListener("input", calculateTotal);
  addOnCheckboxes.forEach(cb => cb.addEventListener("change", calculateTotal));

  // Initial population
  populateServices();
});
