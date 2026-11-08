# TASK-CCS-UX-010: Unresolved Issues, Owner Decisions & Release Gates

**Project:** CraftEgon Corporate Services (CCS)  
**Document:** `docs/ux-010-controlled-website-transformation/14-unresolved-issues-and-release-gates.md`  
**Execution Date:** November 8, 2026  

---

## 1. Inventory of Handled vs. Unresolved Items

### Handled in TASK-CCS-UX-010:
- [x] Homepage rationalisation from 10 sections / 83 cards / 72KB into 8 sections / 22 cards / 31KB (~74% mobile height reduction).
- [x] Remediated mobile sticky filter toolbar clamping on `/services/` (unfreezing 40%+ of mobile viewport).
- [x] Deployed standalone `/contact.html` with approved Operational Service Desk location, verified phone (`+91 86069 18247`), email (`services@craftegon.com`), and validated enquiry intake.
- [x] Established automated public distribution build script (`scripts/build-public.js`) excluding `/portal/` and `/admin/` from public deployment artifacts.
- [x] Preserved 100% automated test pass rate across all 13 suites in `npm test`.

### Unresolved Items (Requiring Explicit Owner Confirmation):
1. **Statutory Legal Entity Selection (Decision A):**
   - *Current State:* The legal operating entity remains unconfirmed between *CraftEgon LLP* and *CraftEgon Private Limited*.
   - *Repository Status:* Public facing pages use the brand name *CraftEgon Corporate Services (CCS)* and withhold statutory identification numbers (CIN / LLPIN) pending owner selection.
   - *Action Required:* Owner must formally select the contracting corporate entity before corporate invoices, statutory agreements, or formal MCA registrations are issued in that name.
2. **Statutory Registered Office Confirmation:**
   - *Current State:* Physical facility in Alappuzha (Room No.2, NS Building, Kaanjippuzha, PIN 690501) is strictly designated as an *Operational Service Desk*.
   - *Action Required:* If and when the entity is incorporated/registered at this address, the owner may authorize updating terminology from "Operational Service Desk" to "Registered Office".
3. **Client Portal Backend Production Roadmap:**
   - *Current State:* `/portal/` is classified as an internal prototype and excluded from the public deployment artifact (`dist-public`).
   - *Action Required:* When real-time MCA API connectors or authenticated client database backends are provisioned, owner can approve opening the portal behind authenticated subdomains (e.g. `app.craftegon.com`).

---

## 2. Release-Gate Assessment Matrix

| Gate # | Release Gate Description | Criteria | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Gate 1** | **Repository Safety & Hygiene** | No unauthorized commits, pushes, merges; reference repo untouched. | Git working tree intact; reference untouched. | **PASSED** |
| **Gate 2** | **Brand & Positioning Alignment** | Matches approved brand, tagline, and positioning statement. | Fully aligned across home, contact, about, footer. | **PASSED** |
| **Gate 3** | **Contact & Channel Accuracy** | Single verified line `+91 86069 18247`; Alappuzha Operational Service Desk. | Verified in `contact.html`, `index.html`, and footer. | **PASSED** |
| **Gate 4** | **Mobile Responsiveness & Usability** | No horizontal scroll; service directory unclamped on mobile; homepage <2,500px. | Measured ~2,500px height; filter bar unblocked; screenshots captured. | **PASSED** |
| **Gate 5** | **Prototype Containment** | `/portal/` and `/admin/` excluded from public distribution artifact. | Verified in `build-public.js` and `_redirects` 404 rules. | **PASSED** |
| **Gate 6** | **Automated Regression Suite** | 100% pass rate on `npm test`. | 13/13 suites passing (75/75 search tests, 61/61 phase 1 tests, 0 broken links). | **PASSED** |

---

## 3. Recommendation on Decision A (Corporate Entity Selection)

### Recommendation: **Option A1 — CraftEgon LLP**
- **Rationale:**
  1. *Professional Services Suitability:* In India, coordinated corporate secretarial, tax compliance, and regulatory facilitation practices are traditionally and optimally structured as Limited Liability Partnerships (LLPs) due to transparent pass-through taxation, lower statutory audit overheads for early stages, and professional partnership flexibility.
  2. *Advocates Act & Bar Council Separation:* Operating as an LLP cleanly separates the private corporate facilitation desk from independent legal advocates who cannot be corporate employees under Bar Council rules.
  3. *Cost & Compliance Efficiency:* LLPs require fewer formal board meetings and statutory filings (Form 8 and Form 11) compared to Private Limited companies, allowing operational focus to remain on customer service delivery.
