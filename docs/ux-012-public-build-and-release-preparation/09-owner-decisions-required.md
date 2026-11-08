# TASK-CCS-UX-012: Owner Decisions & Actions Required
## Critical Release Pre-Requisites, Commercial Selections & Operational Verifications

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  

---

### 1. Executive Summary of Required Actions

While the public website codebase and compiled release artifact (`dist-public/`) are 100% verified, tested, and structurally hardened, several external and corporate governance decisions reside exclusively with the business owner.

The table below outlines these items, categorized by urgency and impact:

| Priority | Item | Owner Action Required | Impact if Unresolved |
| :--- | :--- | :--- | :--- |
| **P0 — BLOCKING** | **Cloudflare Pages Build Config** | Set Build Command to `node scripts/build-public.js` and Output Directory to `dist-public`. | Cloudflare will continue publishing the repository root, keeping `/portal` and `/admin` exposed. |
| **P1 — OPERATIONAL** | **Email Mailbox Verification** | Verify that `admin@craftegon.com` is actively provisioned with MX records and receiving inbound mail. | Prospective client inquiries sent via email fallback might bounce. |
| **P1 — OPERATIONAL** | **WhatsApp Business Number** | Verify that `+91 86069 18247` is active on WhatsApp Business and staffed during operational hours. | Inbound direct WhatsApp clicks may experience delayed response. |
| **P2 — CORPORATE** | **Contracting Legal Entity** | Select between CraftEgon LLP, CraftEgon Technologies Pvt Ltd, or dedicated entity when formalizing retainer contracts. | Public website remains safely unbranded by legal entity suffix (non-blocking for marketing). |
| **P2 — STATUTORY** | **Registered Office Confirmation** | Confirm official MCA registered address if/when formal statutory filings are published. | Current location "Operational Service Desk, Alappuzha, Kerala" remains in place. |
| **P3 — ENHANCEMENT** | **Automated Form Ingestion** | (Optional) Configure a backend webhook or Cloudflare Worker for automated form submissions. | Site currently uses transparent client-side WhatsApp/Email fallback pathways. |

---

### 2. Detailed Breakdown of Action Items

#### Item 1: Cloudflare Pages Dashboard Configuration (P0 — Immediate)
- **Why Required:** The local repository builds `dist-public/`, but Cloudflare Pages connects directly to the GitHub remote. Cloudflare must be instructed to run the build script and publish from `dist-public/`.
- **How to Execute:** Follow the exact walkthrough in [05-cloudflare-owner-configuration-guide.md](file:///c:/Users/shibi/OneDrive/Desktop/craftegon-ccs-clean/docs/ux-012-public-build-and-release-preparation/05-cloudflare-owner-configuration-guide.md):
  1. Open Cloudflare Pages → Project Settings → Builds & deployments.
  2. Set **Build command** = `node scripts/build-public.js`.
  3. Set **Build output directory** = `dist-public`.
  4. Save and trigger deployment.
- **Estimated Effort:** 2 minutes.

#### Item 2: Operational Mailbox Verification (P1)
- **Why Required:** All public contact pages and footers display `admin@craftegon.com` as the primary corporate contact email.
- **Owner Verification Steps:**
  1. Send a test email from an external account (e.g., personal Gmail) to `admin@craftegon.com`.
  2. Confirm receipt in the designated inbox.
  3. Ensure inbound spam filters do not block inquiries containing words like "LLP", "RoC", or "Filing".
- **Estimated Effort:** 5 minutes.

#### Item 3: Operational Service Desk WhatsApp Verification (P1)
- **Why Required:** `+91 86069 18247` is the authoritative phone number wired to all click-to-call and WhatsApp quick-inquiry buttons.
- **Owner Verification Steps:**
  1. Confirm that WhatsApp Business is active on `+91 86069 18247`.
  2. Configure quick automated greeting / business hours reply if desired.
- **Estimated Effort:** 5 minutes.

#### Item 4: Legal Entity & Registered Office Determinations (P2)
- **Background:** Historical audits noted conflicting references between CraftEgon LLP and CraftEgon Technologies Pvt Ltd in unreleased prototype files.
- **Current Hardened State:** The public website has been stripped of conflicting claims and refers solely to the service brand "CraftEgon Corporate Services". No legal entity suffix is stated, protecting the business from misrepresentation.
- **Future Action:** When the owner formalizes customer retainer agreements, client engagement letters, or MCA filings, the contracting legal entity and its registered office address must be determined by counsel and inserted into legal terms documents.

#### Item 5: Form Ingestion Endpoint (P3 — Optional Technical Enhancement)
- **Current State:** The contact form currently validates user inputs and transparently generates direct WhatsApp and Email draft messages, ensuring zero data loss and zero misleading "success" messages.
- **Optional Enhancement:** If the owner desires an automated webhook that delivers inquiries into a Slack channel, CRM, or Google Sheet, a Cloudflare Pages Function (e.g., `functions/api/contact.js`) or third-party service (Formspree, Web3Forms, Resend) can be enabled by setting `window.CCS_API_ENDPOINT` in `assets/js/config.js`.

---

### 3. Sign-Off Checklist for Business Owner

- [ ] Cloudflare Pages Build Command configured: `node scripts/build-public.js`
- [ ] Cloudflare Pages Output Directory configured: `dist-public`
- [ ] Deployment triggered and confirmed green in Cloudflare dashboard
- [ ] Verified that `https://ccs.craftegon.com/portal/dashboard.html` returns HTTP 404
- [ ] Confirmed receipt of test email at `admin@craftegon.com`
- [ ] Confirmed WhatsApp responsiveness at `+91 86069 18247`
