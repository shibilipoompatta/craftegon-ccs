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

The palette builds upon the institutional mint green / ocean blue heritage, elevating **Sovereign Deep Navy** as the primary anchor and **Forest Emerald** as the action accent.

### Core Brand Palette
- **Sovereign Navy (`--navy-900: #10262E`):** Deepest anchor. Hero titles, dark structural containers, footer canvas. Contrast ratio on white: **14.2:1** (WCAG AAA).
- **Corporate Deep Teal (`--navy-800: #193B46`):** Master headings, primary navigation, active tab markers. Contrast ratio on white: **11.2:1** (WCAG AAA).
- **Pure White Canvas (`--bg-primary: #FFFFFF`):** Base canvas for document cards, data tables, and input forms.
- **Mint Soft Surface (`--surface-mint-white: #F4FAF7` / `--surface-canvas`):** Calm, low-glare canvas for alternating sections and table shading. Contrast ratio with body text: **9.6:1** (WCAG AAA).

### Functional Accents & Controls
- **Forest Emerald (`--accent-green-primary: #247A62` / `--accent-emerald`):** Primary action color for conversion buttons, active links, and positive verification badges. Contrast ratio on white: **5.4:1** (WCAG AA).
- **Emerald Hover (`--brand-gold-hover: #1B5E4B` / `--accent-emerald-hover`):** Hover and focus state for primary buttons. Contrast ratio on white: **7.8:1** (WCAG AAA).
- **Secondary Ocean Accent (`--accent-blue-secondary: #287DA8` / `--accent-ocean`):** Informational badges, auxiliary navigation, and subtle highlights. Contrast ratio on white: **4.8:1** (WCAG AA).

### Neutral Text & Divider Foundations
- **High-Legibility Body Text (`--text-main: #243746`):** Standard reading body text. Contrast ratio on white: **10.1:1** (WCAG AAA).
- **Slate Sub-labels (`--text-secondary: #52717A`):** Captions, table column headers, and secondary metadata. Contrast ratio on white: **5.1:1** (WCAG AA).
- **Hairline Architectural Border (`--border-color: #DCE8E5` / `--border-hairline`):** Clean, crisp boundary lines for table cells, cards, and section dividers.

### Semantic Indicators
- **Verified / Success:** `#059669` (Forest Emerald)
- **Statutory Due Date / Warning:** `#D97706` (Amber Ochre)
- **Late Fee / Penalty / Danger:** `#DC2626` (Crimson)

---

## 4. Typography Hierarchy & Fluid Scale

The typography pairs geometric clarity with institutional legibility:
1. **Headings (`--font-heading`):** `'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
2. **Body Text (`--font-body`):** `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
3. **Tabular & Statutory Codes (`--font-mono`):** `'DM Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Fluid Scale (CSS `clamp()`)
- **Display Hero H1:** `clamp(2.15rem, 3.8vw, 3.25rem)` (Line-height: 1.15)
- **Section Title H2:** `clamp(1.5rem, 2.5vw, 2.15rem)` (Line-height: 1.25)
- **Card Heading H3:** `clamp(1.2rem, 1.8vw, 1.45rem)` (Line-height: 1.3)
- **Lead Paragraph:** `clamp(1.05rem, 1.2vw, 1.18rem)` (Line-height: 1.6)
- **Body Text:** `1rem` (16px base, Line-height: 1.65)
- **Small / Meta Tag:** `0.875rem` (14px, Line-height: 1.5)
- **Caption / Tiny Tag:** `0.75rem` (12px, Line-height: 1.4)

### Measure Constraint Rule
Paragraphs must never stretch across 1200px wide screens. All prose must be constrained to `max-width: var(--measure-prose, 68ch)` (approx. 680px) to prevent eye fatigue.

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
