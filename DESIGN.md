# CRAFTEGON CORPORATE SERVICES (CCS) — DESIGN SYSTEM & ARCHITECTURAL SPECIFICATION
Path: `DESIGN.md`  
Status: Authoritative Brand & UI Direction  
Governing Paradigm: Hybrid Modern Institutional & Sovereign Advisory (Direction B + C)  
Standard: Antislop Design Standard (Principles C-1 to C-5, R-01 to R-39)

---

## 1. Identity & Institutional Character

CraftEgon Corporate Services (CCS) is an institutional corporate services and business infrastructure platform providing statutory corporate secretarial filings, tax compliance, entity structuring, regulatory intelligence, and contract architecture across India.

- **Primary Persona:** Authoritative, disciplined, transparent, and legally grounded.
- **Visual Personality:** Modern Institutional & Sovereign Advisory. Clean architectural grid precision paired with authoritative consultative gravitas. Grounded surfaces, hairline dividers, high-contrast typography, and generous whitespace.
- **Tone of Voice:** Factual, direct, and statutory. We cite official sections of the Companies Act, 2013, LLP Act, 2008, Income Tax Act, 1961, and CGST Act, 2017. Zero hype, zero artificial urgency, and zero generic SaaS buzzwords.
- **Statutory Boundary:** We operate strictly as a corporate secretarial, tax compliance, and regulatory documentation infrastructure partner. In adherence to the Advocates Act, 1961, Chartered Accountants Act, 1949, and Bar Council of India regulations, we explicitly disclaim courtroom advocacy, contentious litigation, or tribunal pleadings (which are handled by independent advocates on direct vakalatnama).

---

## 2. Antislop Dials

Every screen, layout, and component across the platform must adhere to these three dials:

| Dial | Level | Setting | Justification |
| :--- | :---: | :--- | :--- |
| **ENERGY** | **1** | **Calm (Institutional)** | Corporate governance, corporate secretarial work, and tax filings demand stability, trust, and absolute legibility over loud marketing theatrics. |
| **RHYTHM** | **2** | **Consistent with Structured Breaks** | Predictable, readable content grids interspersed with structured data comparison tables, statutory fee schedules, and clear document checklists. Zero card prisons. |
| **MOTION** | **1** | **Hover & State Feedback Only** | Essential micro-interactions only (`:hover`, `:focus-visible`, disclosure toggles). Zero looping ambient animations, pulsing glows, floating cards, or auto-scroll carousels. |

---

## 3. Color System & Accessibility Ratios

The editorial CCS visual identity harmonizes **Deep Slate-Navy (`#0F1F24`)** and **Forest Emerald (`#165B44`)** across **White (`#FFFFFF`)**, **Warm Archival Off-White (`#F7F8F5`)**, and **Sage Tint (`#EBF1ED`)** surfaces, with **Antique Brass (`#8F6A28` / accessible text `#6E501A`)** reserved sparingly for statutory callout accents.

### Core Brand Palette
- **Forest Emerald (`--accent-primary: #165B44`):** Primary action color (`7.9:1` with white). Hover: `#104533`.
- **Deep Slate-Navy (`--ink-primary: #0F1F24`):** Master headings and structural anchors (`16.4:1` on white).
- **Primary Prose (`--ink-body: #24353A`):** Body copy (`12.1:1` on white).
- **Muted Metadata (`--ink-muted: #526468`):** Secondary descriptions and captions (`6.1:1` on white).
- **Warm Archival Off-White (`--bg-warm: #F7F8F5`) & Sage Tint (`--bg-tint: #EBF1ED`):** Low-glare alternating section canvases and active control fills.
- **Architectural Border (`--border-subtle: #DCE3DD`):** 1px dividers across cards, tables, and form containers.
- **Inverse Footer Tokens:** `--footer-bg: #112227`, `--footer-text: #E8EFEA` (`14.2:1`), `--footer-muted: #B9C8C3` (`9.6:1`), `--footer-link-accent: #7ED4B0` (`9.8:1`).

---

## 4. Typography Hierarchy & Strict 6-Level Scale

Typography aligns directly with the parent brand (`craftegon.com`):
1. **Headings & UI (`--font-heading`):** `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
2. **Body Prose (`--font-body`):** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
3. **Tabular & Statutory Codes (`--font-mono`):** `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`

### Strict 6-Level Type Scale & 4 Breakpoints
- `--type-display`: `clamp(2.125rem, 3.6vw, 3.125rem)` (Hero H1, lh `1.18`)
- `--type-h2`: `clamp(1.625rem, 2.4vw, 2.125rem)` (Section H2, lh `1.18`)
- `--type-h3`: `1.25rem` (Card/Panel H3, lh `1.35`)
- `--type-lead`: `1.125rem` (Section Intro, lh `1.5`)
- `--type-body`: `1rem` (Standard Prose, lh `1.6`, max measure `66ch`)
- `--type-caption`: `0.8125rem` (Eyebrows/Legal/Meta, lh `1.35`)
- **Breakpoints (4 canonical widths):** `640px`, `768px`, `1024px`, `1280px`.

---

## 5. Information Architecture & Navigation

The CRAFTEGON service ecosystem is organized into a dual-layer taxonomy:

### Layer 1: The 6 Core Category Pillars (Client-Centric Discovery)
Primary navigation, mega-menus, and homepage gateways present services through these 6 intuitive business needs:
1. **Business Setup & Structuring (`/categories/business-setup.html`)** — Pvt Ltd, LLP, OPC, Section 8, Partnerships, DPIIT.
2. **Corporate Compliance & Secretarial (`/categories/corporate-compliance.html`)** — RoC Annual Retainers, AOC-4, MGT-7, DIR-3 KYC, Strike-off.
3. **Tax & Regulatory Compliance (`/categories/tax-compliance.html`)** — GST Returns, Corporate ITR, Form 3CEB Transfer Pricing.
4. **Licences & Statutory Registrations (`/categories/licences-registrations.html`)** — FSSAI, MSME / Udyam, Import-Export Code (IEC).
5. **Contracts & Intellectual Property (`/categories/legal-contracts-ip.html`)** — Trademark TM-A, Founders' Pacts, MSAs, IP Assignment.
6. **Workforce, POSH & Governance (`/categories/workforce-operations.html`)** — POSH Policy, PF/ESIC, Labour Code Audits, DPDP 2023 Readiness.

### Layer 2: The 15 Practice Verticals (Technical & Regulatory Classification)
Specialist deep dives, statutory compliance matrices, and jurisdictional filings retain the 15 formal practice areas in the Verticals Directory (`/verticals/index.html`):
- `01-entity-formation.html`
- `02-roc-compliance.html`
- `03-tax-compliance.html`
- `04-statutory-registrations.html`
- `05-contracts-legal.html`
- `06-ipr-protection.html`
- `07-labour-hr.html`
- `08-fundraising-investment.html`
- `09-ma-restructuring.html`
- `10-litigation-dispute.html`
- `11-governance-audit.html`
- `12-esg-csr.html` (Data Privacy & Tech Law)
- `13-cross-border-fema.html`
- `14-retainer-desk.html`
- `15-it-digital.html`

---

## 6. Button Component System

All 79 fragmented button classes are consolidated into exactly **4 Canonical Variants**:

| Variant | Class | Visual Treatment | Role |
| :--- | :--- | :--- | :--- |
| **Primary** | `.btn-primary` | Solid Forest Emerald (`#247A62`), text `#FFFFFF`, radius `6px`, padding `0.75rem 1.5rem`. Hover: `#1B5E4B`. | Main conversion CTA (Start Filing, Book Consultation). |
| **Secondary** | `.btn-secondary` | Pure White (`#FFFFFF`), text `#193B46`, border `1.5px solid #DCE8E5`, radius `6px`. Hover: border `#247A62`. | Auxiliary actions (Explore Directory, View Checklist). |
| **Outline** | `.btn-outline` | Transparent background, border `1.5px solid #193B46` or `#247A62`, text `#193B46`. Hover: tint `#F4FAF7`. | Secondary actions on colored canvases or sidebars. |
| **Text Link** | `.btn-text` | Transparent background, no border, text `#247A62`, underline on hover. | Tertiary inline actions (View statutory source, Read circular). |

### Button Sizes
- `.btn-sm`: `padding: 0.45rem 0.9rem; font-size: 0.85rem;`
- `.btn-md` (default): `padding: 0.75rem 1.5rem; font-size: 0.95rem;`
- `.btn-lg`: `padding: 0.95rem 2rem; font-size: 1.05rem;`

---

## 7. Data Tables & Process Timelines (Anti-Card-Prison Standard)

To deconstruct the generic "card prison" look, complex service offerings and compliance deliverables are presented as:
1. **Architectural Data Tables (`.data-table`, `.table-responsive`):**
   - Clean hairline borders (`1px solid #DCE8E5`).
   - Sticky uppercase column headers (`#52717A`, font-size `0.75rem`, letter-spacing `0.05em`).
   - Numbers and statutory codes set in tabular monospace (`DM Mono`).
   - Row hover state (`#F4FAF7`).
2. **Stepped Horizontal Process Timelines (`.stepped-timeline`):**
   - True sequential procedure: 1. DSC -> 2. Name Approval -> 3. SPICe+ Part B -> 4. Certificate of Incorporation -> 5. Bank Account Setup.
3. **Split Feature Rows (`.split-feature-row`):**
   - 2-column editorial layouts pairing explanatory narrative on the left with a structured deliverable checklist on the right.

---

## 8. Anti-Slop Hygiene Rules (Strict Enforcement)

1. **Zero Decorative Emojis in Headings & Cards:** Emojis (`🚀`, `✅`, `🔥`, `🏢`, `🏛️`, `⚡`) are strictly banned from UI titles, badges, and button labels. Use clean inline SVGs or precise typography.
2. **Zero Em Dashes in UI Text (R-02):** The em dash character (`—`) is completely banned in headings, button labels, and body text. Use commas, colons, or parentheses.
3. **Zero Fabricated Social Proof (R-17, R-18):** No fake counters (`10,000+ Happy Clients`), no stock photo portraits with made-up testimonials. Show verifiable regulatory deliverables and transparent pricing.
4. **Zero AI Marketing Buzzwords (R-16):** Banned: *seamless, cutting-edge, revolutionary, elevate, unlock the power, command center, supercharge*. Use statutory verbs: *draft, file, verify, reconcile, audit, register, incorporate*.
5. **Zero Floating Bento Grids as Defaults (R-05):** Organize data by statutory lifecycle and procedural order, not random decorative mosaic boxes.
6. **Accessible Tap Targets (R-03, WCAG 2.5.5):** All interactive elements provide at least `44px x 44px` touch targets on mobile viewports.
7. **Mobile Sticky Dock Clearance:** The mobile action dock (`#mobile-sticky-dock`) must reserve bottom clearance on `body` (`padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px))`).
