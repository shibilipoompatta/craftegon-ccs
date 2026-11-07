# CRAFTEGON CORPORATE SERVICES (CCS)
## UX Remediation Roadmap & Phased Implementation Strategy

**Document Identifier:** `DOC-CCS-UX-ROADMAP-001`  
**Classification:** Product & Engineering Implementation Roadmap  
**Date:** 2026-11-07  
**Governance Notice:** This roadmap specifies proposed improvements for future execution; no code modifications are executed during this audit assignment.  

---

## 1. Executive Implementation Phasing

To systematically resolve the usability, content, and conversion vulnerabilities identified across the 122 pages, recommendations are partitioned into four strategic waves:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   UX REMEDIATION ROADMAP (4 WAVES)                     │
├────────────────────┬───────────────────────────────────────────────────┤
│ Wave 1: Immediate  │ Critical Trust & Conversion Blockers              │
│ (Days 1–7)         │ • Redact Angel Tax • Fix Form Fallback Alert      │
│                    │ • Add Physical Address • Contrast Token Fix       │
├────────────────────┼───────────────────────────────────────────────────┤
│ Wave 2: Structure  │ Navigation, Funnel & Core Content                 │
│ (Days 8–21)        │ • Core 5 Shelf on Directory • Direct Inquiry Form │
│                    │ • About/Leadership Page • Knowledge CTAs          │
├────────────────────┼───────────────────────────────────────────────────┤
│ Wave 3: Consistency│ Visual Design & Template Modernization            │
│ (Days 22–35)       │ • Standardize Gradients • Mobile Table Wrappers   │
│                    │ • Eliminate Ivory/Slate background clashes        │
├────────────────────┼───────────────────────────────────────────────────┤
│ Wave 4: Refinement │ Micro-interactions, a11y & Performance            │
│ (Days 36–50)       │ • Focus trap in modals • Webhook status callbacks │
│                    │ • Image lazy-loading & font-display swap          │
└────────────────────┴───────────────────────────────────────────────────┘
```

---

## 2. Global vs. Page-Specific Fixes Architecture

To maximize engineering efficiency:
- **70% of issues** can be resolved globally by updating 4 shared files:
  1. `assets/css/tokens.css` (Colors, contrast, font-scaling, dark-gold text token).
  2. `assets/css/theme.css` (Background gradient unifications, responsive table classes).
  3. `assets/js/forms.js` (Serverless lead capture, modal copy softening, focus trap).
  4. `components/footer.html` (Physical address, CIN/LLPIN, plain-English links).
- **30% of issues** require individual page treatment (e.g. redacting Angel Tax on `/services/dpiit-startup-india.html`, embedding direct forms on Core 5 service pages).

---

## 3. Wave 1: Critical Trust & Usability Blockers (Priority: Critical)

### Action 1.1: Redact Outdated Angel Tax Reference (Section 56(2)(viib))
- **Target File:** `services/dpiit-startup-india.html` and related conversion links.
- **Observed Problem:** Claims DPIIT provides exemption from Section 56(2)(viib) Angel Tax, which was legislatively abolished by the Finance Act 2024.
- **Customer Impact:** Tech founders and investors perceive the firm as legally incompetent or operating on outdated rules.
- **Recommended Correction:** Remove all mentions of Section 56(2)(viib). Reframe around Section 80-IAC tax holiday (3 consecutive years out of 10) and IP fee rebates.
- **Estimated Complexity:** Low (Content edit).
- **Acceptance Criteria:** Zero occurrences of "56(2)(viib)" or "Angel Tax exemption" across all HTML files.

### Action 1.2: Soften the Static Form Fallback Alert & Deploy Serverless Ingestion
- **Target File:** `assets/js/forms.js` and modal templates.
- **Observed Problem:** Submitting a form triggers a stark alert: *"Notice: Online form transmission to a backend server is not active in this static environment."*
- **Customer Impact:** Triggers immediate customer anxiety ("Is this site fake? Did my data disappear?").
- **Recommended Correction:** Configure a lightweight Cloudflare Worker webhook to ingest form entries directly to email/CRM while gracefully prompting WhatsApp as an optional instant chat fast-track.
- **Estimated Complexity:** Medium (Serverless webhook configuration).
- **Acceptance Criteria:** Forms submit without alarming failure notices; team receives lead notification within 60 seconds.

### Action 1.3: Publish Registered Corporate Office Address & Legal Entity Details
- **Target File:** `components/footer.html`, `index.html`, and `legal/*.html`.
- **Observed Problem:** Footer displays only an email address and phone number, with zero physical location.
- **Customer Impact:** High skepticism from first-time visitors fearing a shell operation.
- **Recommended Correction:** Add physical office address, registered city, state, PIN code, and MCA registration details to the universal footer.
- **Estimated Complexity:** Low (HTML footer edit).
- **Acceptance Criteria:** Physical address and legal entity name visible on all 122 pages.

### Action 1.4: Resolve Gold Text WCAG Contrast Failure
- **Target File:** `assets/css/tokens.css` and `assets/css/theme.css`.
- **Observed Problem:** `--brand-gold: #C59B27` used as text on white backgrounds fails WCAG AA (contrast ratio 2.5:1).
- **Customer Impact:** Low legibility for visually impaired users.
- **Recommended Correction:** Enforce `--text-dark-gold: #8C6D14` (contrast ratio 4.8:1) for all text classes.
- **Estimated Complexity:** Low (CSS variable update).
- **Acceptance Criteria:** 100% of gold text elements pass WCAG 2.1 AA 4.5:1 contrast check.

---

## 4. Wave 2: Navigation, Funnel & Core Content (Priority: High)

### Action 2.1: Promote the Core 5 Launch Portfolio on Directory & Homepage
- **Target Files:** `services.html`, `services/index.html`, `index.html`.
- **Observed Problem:** Directory displays 57 services in a single flat grid, overwhelming visitors with complex M&A and secretarial forms.
- **Recommended Correction:** Introduce a prominent **"Core Business Launch Services"** top shelf featuring the Core 5 (Pvt Ltd, LLP, MSME, DIR-3 KYC, Trademark) with explicit turnaround chips (e.g. *"3–5 Days"*).
- **Estimated Complexity:** Medium (HTML & CSS layout update).
- **Acceptance Criteria:** Core 5 services accessible within 1 click from hero.

### Action 2.2: Embed Direct 3-Field Inquiry Form on Core Service Pages
- **Target Files:** `services/pvt-ltd-registration.html`, `services/llp-registration.html`, `services/trademark-registration.html`, `services/msme-udyam.html`, `services/dir3-kyc.html`.
- **Observed Problem:** Core service pages redirect visitors to `/conversion/calculator.html` instead of capturing the lead directly.
- **Recommended Correction:** Embed a clean, 3-field contact card (`[Name] [Phone / WhatsApp] [City] [Request Scoping Call]`) directly on the service page.
- **Estimated Complexity:** Medium.
- **Acceptance Criteria:** Visitor can initiate an inquiry directly from the service page in under 30 seconds.

### Action 2.3: Author an Authoritative "About Us & Leadership" Page
- **Target File:** Create `about.html`.
- **Observed Problem:** Total absence of an organization/team page.
- **Recommended Correction:** Create `/about.html` detailing CraftEgon LLP's institutional mission, operating model, partner accreditation standards, and leadership principles.
- **Estimated Complexity:** Medium (Content drafting & layout).
- **Acceptance Criteria:** Accessible from main navigation bar and footer.

---

## 5. Wave 3: Visual Design Consistency & Responsive Hardening (Priority: Medium)

### Action 3.1: Standardize Section Alternation Backgrounds
- **Target Files:** `assets/css/tokens.css`, `assets/css/theme.css`.
- **Observed Problem:** Pages alternate inconsistently between cool slate (`#F8FAFC`) and warm ivory (`#FCFBF7`).
- **Recommended Correction:** Standardize all alternate section backgrounds to `#F8FAFC`.
- **Estimated Complexity:** Low (CSS token cleanup).

### Action 3.2: Wrap Statutory Tables in Responsive Containers
- **Target Files:** All service pages containing statutory fee and comparison tables.
- **Observed Problem:** Tables overflow horizontally on mobile screens < 400px.
- **Recommended Correction:** Add `.table-responsive` wrapping `<div>` with `-webkit-overflow-scrolling: touch;`.
- **Estimated Complexity:** Medium.

---

## 6. Wave 4: Fine Visual Refinement & Accessibility Polish (Priority: Low)

- **Modal Focus Trap:** Enforce focus trapping in `assets/js/forms.js` so keyboard navigation stays within open dialogs.
- **Image Optimization:** Ensure all SVG and PNG brand assets include explicit `width` and `height` attributes to eliminate Cumulative Layout Shift (CLS).
- **Article Sidebar CTAs:** Add contextual callouts in all 12 knowledge guides to convert educational readers into consultation leads.
