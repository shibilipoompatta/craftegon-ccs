# CraftEgon CCS — Phased Technical Implementation Roadmap

**Platform**: CraftEgon Corporate Compliance Services (CCS)  
**Parent Firm**: CraftEgon LLP  
**Repository**: `shibilipoompatta/craftegon-ccs`  
**Execution Lead**: Principal Full-Stack Architect & Technical Lead  
**Document Version**: 1.0 (Audit-Grounded)  
**Date**: 2026-10-15  

---

## 1. Overview & Non-Negotiable Engineering Rules

This implementation roadmap outlines the concrete, traceable, and reversible engineering batches required to bring the CraftEgon CCS website to international-quality standards.

### Non-Negotiable Operational Guardrails
1. **Source of Truth**: The existing GitHub repository (`shibilipoompatta/craftegon-ccs`) is the absolute source of truth.
2. **Taxonomy Preservation**: Retain all 15 compliance practice verticals and their established `/verticals/*.html` and `/services/*.html` routes without deletion or renumbering.
3. **No Fake Backends**: Never pretend a form was submitted to a server if no real endpoint exists; always provide a functional, truthful alternative (WhatsApp or Email).
4. **No Speculative Dependencies**: Maintain a pure, zero-dependency Vanilla JS and CSS architecture for maximum speed, security, and edge hosting reliability.
5. **Reversible Batches**: Work in small, isolated batches with continuous link verification, syntax checks, and git commit checkpoints.

---

## 2. Phased Implementation Batches

```
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 1: Contact Centralization (WhatsApp, Phone, Email)               │
│ - Standardize +91 86069 18247 & admin@craftegon.com in navbar & footer │
│ - Add WhatsApp floating CTA & prefilled enquiry links                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ BATCH 2: Technical SEO Remediation (Meta Descriptions)                 │
│ - Inject verified <meta name="description"> tags across 101 pages      │
│ - Maintain 100% unique, search-engine compliant snippet tags           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ BATCH 3: Dedicated 404 Error Page & Edge Routing                       │
│ - Build Royal Noble 404.html with search & practice recovery links     │
│ - Update _redirects to map /portal/* and /* /404.html 404             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ BATCH 4: Forms & Intake Truthful Fallback Enhancement                  │
│ - Enhance assets/js/forms.js with one-click WhatsApp & email actions   │
│ - Ensure contextual prefilled parameters for legal inquiries          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ BATCH 5: Accessibility, Performance & Automated QA                     │
│ - Verify WCAG 2.2 AA contrast, keyboard focus, and mobile tap targets  │
│ - Run verify_links.js and check_orphans.js test suites                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Batch Specifications

### Batch 1: Centralize Business Contact Information (P0 — Critical)
- **Approved Contact Parameters**:
  - Display Number: `+91 86069 18247`
  - WhatsApp URL: `https://wa.me/918606918247`
  - Business Email: `admin@craftegon.com`
  - Email Action URL: `mailto:admin@craftegon.com`
- **Implementation Targets**:
  1. `components/footer.html`: Add an institutional contact block in Column 1 under the headquarters address containing direct telephone, WhatsApp chat link, and email address.
  2. `components/navbar.html`: Add a direct WhatsApp consultation icon / CTA in `.if-header-actions` and mobile drawer.
  3. `assets/js/navigation.js`: Mirror contact updates in fallback header and footer templates.
  4. Contextual WhatsApp Prefilled URLs: Add URL-encoded inquiry parameter (`?text=...`) for high-intent conversion pages (e.g., Late Fee disputes, STK-2 strike-off, Form 3CEB).

### Batch 2: Technical SEO Description Injection (P1 — High)
- **Problem**: 101 pages contain `og:description` but lack `<meta name="description">`.
- **Implementation Targets**:
  - Extract and refine existing, verified descriptions to inject compliant `<meta name="description" content="...">` immediately beneath `<title>` across all affected files in `verticals/`, `services/`, `conversion/`, `knowledge/`, and `legal/`.
  - Ensure zero layout shifts or tag corruption.
  - Re-verify with `audit_details.js` to ensure 100% (110/110) coverage.

### Batch 3: Dedicated 404 Error Architecture & Edge Rewrites (P2 — Medium)
- **Problem**: `_redirects` currently points `/* /index.html 404`. Users hitting a dead link see the full homepage under a 404 status.
- **Implementation Targets**:
  - Build `404.html` in the root directory embodying the Royal Noble Obsidian and Champagne Gold design system.
  - Provide quick navigation recovery links to:
    - Homepage (`/index.html`)
    - Practice Areas (`/index.html#practice-areas`)
    - Client Portal & Compliance Calendar (`/portal/dashboard.html`)
    - Late Fee Calculator (`/conversion/calculator.html`)
    - Direct WhatsApp Desk (`https://wa.me/918606918247`)
  - Update `_redirects` to include:
    ```
    /portal         /portal/index.html      200
    /portal/*       /portal/:splat          200
    /*              /404.html               404
    ```

### Batch 4: Forms & Intake Truthful Fallback Enhancement (P3 — Medium)
- **Problem**: When users submit an intake form without a configured backend endpoint, `forms.js` blocks submission (truthful) but does not provide an immediate action to proceed via WhatsApp or Email.
- **Implementation Targets**:
  - Update `assets/js/forms.js` in `showFormError`:
    - Display clear message explaining the form is currently an intake preview.
    - Render a prominent action button: `Chat Directly on WhatsApp (+91 86069 18247)` pre-filled with the client's selected service name and parameters.
    - Render a secondary link: `Email Enquiry to admin@craftegon.com`.

### Batch 5: Accessibility, Performance & Automated Testing (P4 — Low)
- **Implementation Targets**:
  - Validate WCAG 2.2 AA color contrast on buttons, borders, and input placeholders.
  - Ensure all form fields have explicit `<label>` or `aria-label` associations.
  - Ensure all anchor links have valid hrefs and descriptive screen-reader text.
  - Run continuous automated link verification (`verify_links.js`) and orphan checking (`check_orphans.js`).

---

## 4. Acceptance Criteria & Verification Protocol

Each batch must satisfy the following verifiable criteria before moving to the next:
1. **0 Broken Links**: Verified via local crawl script across all 112 HTML files.
2. **0 Orphan Pages**: Verified via reverse reference crawler.
3. **0 Hardcoded Secrets**: Scanned via ripgrep across all branches.
4. **Syntax Validity**: Node syntax checks on all 4 JS files.
5. **Git Traceability**: Clean commits with descriptive conventional commit messages.
