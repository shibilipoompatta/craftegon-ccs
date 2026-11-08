# TASK-CCS-UX-010: Contact & Business Identity Implementation

**Project:** CraftEgon Corporate Services (CCS)  
**Document:** `docs/ux-010-controlled-website-transformation/10-contact-and-business-identity-implementation.md`  
**Target Files:** `contact.html`, `index.html`, `about.html`, `components/footer.html`  
**Execution Date:** November 8, 2026  

---

## 1. Authoritative Identity Governance Rules

Under Authoritative Owner Decisions established in TASK-CCS-UX-007, TASK-CCS-UX-009, and TASK-CCS-UX-010:
1. **Public Brand Name:** Strictly **"CraftEgon Corporate Services"** (abbreviated as **"CraftEgon CCS"**).
2. **Official Tagline:** Strictly **"Building Business Infrastructure"**.
3. **Core Brand Positioning Statement:**
   > *"Your Business Infrastructure Partner. From business formation to compliance, protection and growth — coordinated corporate services supported by professional expertise and technology."*
4. **Physical Location Nomenclature:**
   - Must be designated strictly as: **"Operational Service Desk, Alappuzha, Kerala"** (Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, 690501).
   - **Prohibited Terms:** Never describe this address as a *"Registered Office"*, *"Statutory Office"*, or *"Corporate Head Office"* until formal legal entity confirmation is provided by the owner.
5. **Approved Contact Channels:**
   - **Active Public Line (Voice & WhatsApp):** `+91 86069 18247` only.
   - **Suppressed Secondary Line:** `+91 97782 52932` is strictly suppressed from public customer-facing pages.
   - **Official Service Email:** `services@craftegon.com`.
   - **SLA Claims:** No false claims of "24/7 instant response" or "10-minute SLA"; stated SLA is 1 business day during standard operating hours (Mon–Sat, 9:30 AM – 6:30 PM IST).
6. **Statutory Entity Status:** The legal contracting entity (LLP vs. Private Limited) remains unconfirmed; statutory numbers (CIN / LLPIN) are withheld from public declarations.

---

## 2. Implementation of Dedicated `/contact.html`

A high-converting, professional, and transparent standalone contact page was authored and placed at the repository root (`contact.html`):

### 2.1 Four Direct Communication Channels:
1. **Direct Telephone:** `+91 86069 18247` (Immediate telephone connection during operational hours).
2. **Instant WhatsApp Desk:** `+91 86069 18247` (Direct WhatsApp consultation for quick checklists and intake).
3. **Official Email Desk:** `services@craftegon.com` (Document submission and formal scoping).
4. **Operational Service Desk:** Room No.2, NS Building, Kaanjippuzha, Alappuzha, Kerala, 690501.

### 2.2 Structured Intake Enquiry Form:
- **Minimal, Responsible Data Collection:** Collects only name, phone, email, entity structure, service category, and message description.
- **Client-Side Regex Validation:** Validates phone and email formatting in real time using `assets/js/forms.js`.
- **Clear Data Protection Notice:** Informs users that data is handled strictly under the Privacy Policy for service scoping and conflict checks, with zero third-party disclosure.

### 2.3 Operational Standards & Regulatory Boundary Sidebar:
- Clear business hours (Mon–Sat, 9:30 AM – 6:30 PM IST).
- Realistic response expectations (within 1 business day).
- Reaffirmation of Advocates Act, 1961 non-litigation boundaries.

---

## 3. Visual & Technical Verification

- **Mobile Viewport Screenshot (375×667):** `contact-375px-mobile.png` (69,724 bytes) — Confirms accessible 4-channel card stack and touch-friendly form fields.
- **Desktop Viewport Screenshot (1366×768):** `contact-1366px-desktop.png` (178,762 bytes) — Confirms clean two-column layout with sidebar standards.
- **Link & Orphan Verification:** Verified by `scripts/verify-links.js` (0 broken links) and `scripts/check-orphans.js` (0 orphans).
- **SEO Schema Validation:** Verified by `scripts/audit-seo.js` and `scripts/test-phase-6-schemas.js` (includes valid `ContactPage` and `Organization` JSON-LD schemas).
