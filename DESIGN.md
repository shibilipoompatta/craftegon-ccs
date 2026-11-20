# CRAFTEGON CORPORATE SERVICES (CCS) — DESIGN SYSTEM & VISUAL DIRECTION
Path: `DESIGN.md`  
Status: Authoritative Brand & UI Direction  
Governing Standard: Antislop Design Standard (Craftsmanship Principles C-1 to C-5)

---

## 1. Identity & Institutional Character

CraftEgon Corporate Services (CCS) is an institutional business infrastructure partner providing statutory corporate secretarial filings, tax compliance, entity structuring, and regulatory intelligence across India.

- **Primary Persona:** Authoritative, disciplined, transparent, and legally grounded.
- **Visual Feel:** Clean institutional desk with editorial clarity. High-contrast typography, crisp surfaces, and calm backgrounds.
- **Tone of Voice:** Factual, direct, and statutory. We cite the relevant sections of the Companies Act, 2013, LLP Act, 2008, and Income Tax Act, 1961. We avoid hype, artificial urgency, and generic Silicon Valley SaaS buzzwords.
- **Statutory Boundary:** We operate strictly as a corporate secretarial and regulatory documentation infrastructure partner. In adherence to the Advocates Act, 1961 and Bar Council of India guidelines, we explicitly disclaim courtroom advocacy or tribunal representation.

---

## 2. Antislop Dials

Every screen, layout, and component across the platform must adhere to these three dials:

| Dial | Level | Setting | Justification |
| :--- | :---: | :--- | :--- |
| **ENERGY** | **1** | **Calm (Institutional)** | Corporate governance and legal compliance require stability, trust, and absolute legibility over loud marketing theatrics. |
| **RHYTHM** | **2** | **Consistent with Structured Breaks** | Predictable, readable content grids interspersed with high-density statutory fee cards and clear document checklists. |
| **MOTION** | **1** | **Hover & State Feedback Only** | Essential micro-interactions only (`:hover`, `:focus-visible`, disclosure toggles). Zero looping ambient animations, pulsing glows, or auto-scroll carousels. |

---

## 3. Color System & Contrast Standards

In compliance with Rule R-29, the active palette is strictly disciplined to 2 core brand colors, 1 functional accent color, and neutral foundation surfaces.

### Core Brand Palette
- **Deep Corporate Teal (`--navy-800: #193B46`):** Primary brand anchor. Used for primary headings, brand logos, active tab markers, and dark structural containers. Contrast ratio on white: **11.2:1** (exceeds WCAG AAA).
- **Soft Mint Surface (`--surface-mint-white: #F4FAF7`):** Core background tint. Provides a calm, low-glare canvas for alternating sections and cards.

### Functional Accent
- **Emerald Accent (`--accent-green-primary: #247A62`):** Primary action color for conversion buttons, active links, and positive verification badges. Contrast ratio on white: **5.4:1** (meets WCAG AA).
- **Emerald Hover (`--accent-green-hover: #185343`):** Focused and hovered state for primary buttons. Contrast ratio on white: **7.8:1**.
- **Secondary Ocean Accent (`--accent-blue-secondary: #287DA8`):** Informational callouts and auxiliary navigation. Contrast ratio on white: **4.8:1**.

### Neutral Canvas & Text Foundation
- **Canvas White (`--bg-primary: #FFFFFF`):** Base canvas for document cards and forms.
- **Deep Charcoal Text (`--text-main: #243746`):** Standard body text. Contrast ratio on white: **10.1:1**.
- **Slate Sub-labels (`--text-secondary: #52717A`):** Captions, table column headers, and secondary meta. Contrast ratio on white: **5.1:1**.
- **Subtle Slate (`--text-light: #4A636B`):** Form placeholder text and secondary indicators. Recalibrated to guarantee at least **4.5:1** against `#FFFFFF`.

### Semantic Indicators (Non-Text Contrast >= 3:1)
- **Success:** `#059669` (Forest Emerald)
- **Warning:** `#D97706` (Amber Ochre)
- **Danger / Mandatory:** `#DC2626` (Crimson)
- **Structural Border:** `#DCE8E5` (Clean Mint-Slate border)

### Palette Hygiene Rules
- **No Generic Rainbow or Blue-Purple Gradients (R-01):** Banned as primary visual treatments. Gradients may only appear as subtle top-to-bottom surface fades (e.g. `linear-gradient(180deg, #F4FAF7 0%, #FFFFFF 100%)`).
- **No Background Dot Grids or Blueprint Lines (R-07):** Banned. Flat, high-contrast surfaces convey serious institutional execution.
- **One Deliberate Accent (R-29):** The emerald green accent is reserved for primary CTAs and active states. It must not be plastered across every border, icon, and background simultaneously.

---

## 4. Typography System

### Typeface Hierarchy
1. **Headings (`--font-heading`):** `'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`  
   *Reason:* Clean geometric sans-serif that balances modern legibility with institutional authority.
2. **Body Text (`--font-body`):** `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`  
   *Reason:* Highly legible, open aperture, superior rendering across mobile viewports and forced-colors modes.
3. **Tabular & Statutory Codes (`--font-mono`):** `'DM Mono', SFMono-Regular, Menlo, Monaco, monospace`  
   *Reason:* Used strictly for statutory Act sections (e.g. `Sec 135(5)`), CIN (`U74999KL2026PTC...`), LLPIN, GSTIN, fee tables, and filing deadlines. Never used as decorative headline body copy.

### Fluid Typographic Scale
All type uses CSS `clamp()` to scale smoothly between 360px mobile viewports and 1440px desktop displays:
- **Display Hero H1:** `clamp(2.15rem, 3.8vw, 3.25rem)` (Line-height: 1.15)
- **Section Title H2:** `clamp(1.5rem, 2.5vw, 2.15rem)` (Line-height: 1.25)
- **Card Heading H3:** `clamp(1.2rem, 1.8vw, 1.45rem)` (Line-height: 1.3)
- **Lead Paragraph:** `clamp(1.05rem, 1.2vw, 1.18rem)` (Line-height: 1.6)
- **Body Text:** `1rem` (16px base, Line-height: 1.65)
- **Small / Meta Tag:** `0.875rem` (14px, Line-height: 1.5)
- **Caption / Tiny Tag:** `0.75rem` (12px, Line-height: 1.4)

---

## 5. Layout & Spatial Architecture

### Breakpoints & Container Widths
- **Max Content Container:** `1240px` (`padding: 0 1.5rem`)
- **Reading / Form Container:** `880px` (`padding: 0 1.25rem`)
- **Narrow Intake / Policy Column:** `720px` (`padding: 0 1rem`)
- **Breakpoints:**
  - Mobile: `< 768px` (Single column reflow, stacked cards, full-width buttons)
  - Tablet: `768px - 1024px` (Two-column balanced grids)
  - Desktop: `> 1024px` (Multi-column service directories, sticky side summaries)

### Spacing Scale
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `80px`
- Section padding on Desktop: `4.5rem 1.5rem`
- Section padding on Mobile: `2.5rem 1rem` (reduces vertical scrolling fatigue per R-03)

### Layout Anti-Patterns Banned
- **No Bento Grids as AI Defaults (R-05):** Data and services are arranged logically by statutory lifecycle (Formation, Compliance, Advisory, Exit).
- **No Copied 3-Step "How It Works" (R-05):** Compliance workflows represent actual procedural steps (e.g. DSC -> Name Approval -> SPICe+ Part B -> Certificate of Incorporation -> Bank Account).
- **No Rigid Hardcoded Widths (R-03):** Every card, table container, and form uses `width: 100%; max-width: ...px; box-sizing: border-box;`.

---

## 6. Components & Interaction Affordances

### Buttons & Interactive Controls (R-26, R-39)
- **Base Cursor:** All interactive elements (`a[href]`, `button`, `summary`, `select`, `label[for]`, `[role="button"]`) must declare `cursor: pointer` in the base CSS layer. Disabled controls declare `cursor: not-allowed`.
- **Minimum Tap Target:** Mobile interactive elements must provide a minimum tap target of `44px x 44px` (R-03).
- **Primary CTA:** Solid Emerald background (`#247A62`), white text (`#FFFFFF`), border radius `6px` or `8px` (never full pill for functional buttons), padding `0.75rem 1.5rem`.
- **Secondary CTA:** Clean border (`1.5px solid #DCE8E5`), dark text (`#193B46`), white background. Hover shifts border to `#247A62`.
- **No Small Decorative Arrows (`→ / ↗`) on Every Button (R-08):** Arrows are reserved strictly for external links or multi-step checkout progression.
- **Focus Indicator (R-32):** Every focusable element shows `:focus-visible { outline: 2px solid #247A62; outline-offset: 2px; }`.

### Badges, Dots & Status Indicators (R-09, R-13)
- **Functional Badges Only:** Badges may only display legitimate status information: `Statutory Due Date: 30 Sept`, `Active Retainer`, `Optional Add-on`, `MCA Form MGT-7`.
- **No Pill Eyebrow Badges above Headlines (R-09):** Headlines stand on their own authority. Category labels must be woven naturally into page titles or breadcrumbs.
- **No Decorative Status Dots with Infinite Pulses (R-13, R-19):** Flashing green or amber dots that do not reflect a real server or live socket state are strictly forbidden.

### Forms & Input Fields (WCAG 3.3.2 & R-39)
- Every input has a visible, programmatic `<label for="...">`.
- Placeholders must represent honest format examples (e.g. `LLPIN (e.g., AAB-1234)` or `name@company.com`), never replace the label, and never contain fake personal identity data like `John Doe` (R-23, R-38).
- Inputs must scroll smoothly into view above the mobile software keyboard without clipping.

### Mobile Sticky Action Dock (R-03, Layoutmobile)
- The mobile sticky action dock (`#mobile-sticky-dock`) must reserve clearance at the bottom of the document:
  ```css
  @media (max-width: 768px) {
    body {
      padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
    }
  }
  ```
- This prevents the floating bar from covering submit buttons, legal disclaimers, or form inputs.

---

## 7. Tone, Copywriting & Content Standards

### Absolute Rules (Hard Gate)
1. **Zero Em Dashes in Output (R-02):** The em dash character (`—`) is completely banned in UI text, headings, button labels, and footer disclaimers. Use a period, a comma, a colon, or clean parentheses instead.
2. **Zero Fabricated Claims or Social Proof (R-17, R-18, R-36):**
   - No fake statistics (`"10,000+ Happy Companies"`, `"99.9% Faster"`).
   - No stock photo client testimonials with fictitious names or roles (`"Sarah Chen, VP at Acme"`).
   - Show verifiable regulatory deliverables, statutory timelines, government portal integrations, and transparent pricing.
3. **Zero AI Marketing Buzzwords (R-16):**
   - Banned words: *seamless, cutting-edge, revolutionary, elevate, game-changer, next-generation, unlock the power, command center, autonomous OS, supercharge*.
   - Replace with precise legal verbs: *prepare, draft, file, verify, reconcile, audit, register, incorporate*.
4. **Zero Decorative Emoji in UI Copy (antislop-ui / antislop-copywriting):**
   - Emojis like `🚀`, `✅`, `🔥`, `🏢`, `🏛️`, `📊`, `💬`, `📞`, `✉️`, `⚡` must not be placed inside headings, buttons, accordion titles, or table headers.
   - Use crisp, accessible inline SVGs or clean typography.

---

## 8. Code Comment & Documentation Hygiene (antislop-code)

- **No Decorative ASCII Banner Separators:** Banned: `/* ========================================================================== */` or `// -------- WORKFLOW --------`. Replace with a single, clean comment line.
- **No Restating the Obvious:** Banned: `// Initialize the variable` above `let count = 0`.
- **No Step-by-Step Workflow Narration:** Code structure and functions should be self-documenting.
- **Explain "Why", Not "What":** Preserve and write comments that explain statutory constraints, browser workarounds, edge-case routing, and security policies. Keep comments concise (1-2 lines maximum).
