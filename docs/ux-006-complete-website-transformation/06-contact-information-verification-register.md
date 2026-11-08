# 06. CONTACT INFORMATION VERIFICATION REGISTER

**Project:** CraftEgon Corporate Services (CCS)  
**Status:** DUAL-TELEPHONE NUMBER DEPENDENCY DOCUMENTED  
**Operating Principle:** Preserve verified working links; do not alter live contact routing without owner confirmation.

---

## 1. Contact Information Inventory

The CraftEgon CCS codebase references official communication channels across forms, headers, footers, and direct engagement scripts:

| Channel | Recorded Value | Locations in Codebase | Verification Status |
| :--- | :--- | :--- | :--- |
| **Primary Telephone** | `+91 86069 18247` | `components/footer.html`<br>`assets/js/forms.js`<br>`services/*.html`<br>`scripts/test-phase-1-form-fallback.js` | **ACTIVE & VERIFIED IN CODE**<br>Used for all live `tel:` links and WhatsApp API endpoints. |
| **Alternative Telephone** | `+91 97782 52932` | Predecessor audit briefs<br>`docs/critical-risk-remediation/` | **HISTORICAL / SECONDARY CHANNEL**<br>Identified in prior audit reports as alternative line. |
| **Official Email** | `admin@craftegon.com` | All footers, forms, and mailto URLs | **ACTIVE & VERIFIED** |
| **Direct WhatsApp Desk** | `https://wa.me/918606918247` | Floating chat, service pages, fallbacks | **ACTIVE & VERIFIED** |
| **Physical Office** | Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala - 690501 | Footers, about page, legal policies | **ACTIVE & VERIFIED** |

---

## 2. Technical Impact Analysis

- **Automated Test Dependency:**  
  Automated tests (`scripts/test-phase-1-form-fallback.js:46,97` and `scripts/test-phase-1-remediation.js:343`) strictly assert that `assets/js/forms.js` provides verified WhatsApp and phone contact `+91 86069 18247`. Arbitrary replacement would break automated regression tests.
- **Customer Journey:**  
  All live customer-facing consultation buttons (e.g., in `services/pvt-ltd-registration.html`, `services/roc-annual-compliance.html`, etc.) consistently route to `+91 86069 18247`.

---

## 3. Recommendation for Owner

Maintain `+91 86069 18247` as the active primary client hotline and WhatsApp gateway. If `+91 97782 52932` is intended as a dedicated partner or executive line, document its intended routing before updating automated test fixtures.
