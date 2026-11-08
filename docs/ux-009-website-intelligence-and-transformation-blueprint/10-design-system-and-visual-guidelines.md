# TASK-CCS-UX-009: Design System & Visual Guidelines Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Auditor:** Principal UI/UX Architect & Design Systems Lead  
**Date:** November 8, 2026

---

## 1. Design Philosophy & Strategic Positioning

The visual identity for CraftEgon Corporate Services communicates **calm authority, statutory precision, and modern technology-enabled coordination**.

It completely replaces the legacy heavy navy-and-gold aesthetic with a refined, airy, and trustworthy design system anchored by **light mint green** (`#BCEBD5`) and **soft sky blue** (`#B8E3F7`), paired with crisp white surfaces and **deep, high-contrast slate-teal typography** (`#193B46`, `#243746`).

### Core Aesthetic Principles:
- **Calm & Uncluttered:** Generous whitespace (macro-spacing) replacing stacked, cramped card containers.
- **Strict Readability:** Dark, sharp typography exceeding WCAG 2.2 AAA contrast standards. Zero low-contrast grey-on-grey text.
- **Subtle Surface Geometry:** Soft card radii (`8px` to `16px`), delicate 1px silver borders (`#E2E8F0`), and minimal ambient shadows.
- **Zero Gratuitous Decoration:** No unnecessary 3D elements, pulsating animations, or generic decorative stock graphics. Every visual element serves a navigational or explanatory purpose.

---

## 2. Approved Color Token Hierarchy

```css
:root {
  /* --- Primary Brand Surfaces & Accents --- */
  --brand-mint: #BCEBD5;             /* Primary Mint Green */
  --brand-sky: #B8E3F7;              /* Primary Sky Blue */

  /* --- Supporting Soft Canvas & Background Tints --- */
  --surface-mint-soft: #DDF5EA;      /* Delicate Mint Background Tint */
  --surface-sky-soft: #DDF2FC;       /* Delicate Sky Background Tint */
  --surface-mint-white: #F4FAF7;     /* Off-White Mint Canvas */
  --surface-sky-white: #F3F9FD;      /* Off-White Sky Canvas */
  --surface-white: #FFFFFF;          /* Pure Card White */

  /* --- Interactive & Status Accents --- */
  --accent-green-primary: #247A62;   /* Deep Mint / Pine Accent (Primary CTAs) */
  --accent-green-hover: #1D624E;     /* Darker Pine Hover State */
  --accent-blue-secondary: #287DA8;  /* Deep Sky Accent (Secondary CTAs) */
  --accent-blue-hover: #1E6386;      /* Darker Sky Hover State */

  /* --- Typography & Text Contrast Tokens --- */
  --text-primary-heading: #193B46;   /* Deep Slate Teal (Headings & Major Titles) */
  --text-body: #243746;              /* Balanced Slate Teal (Body Text & Paragraphs) */
  --text-secondary: #52717A;         /* Medium Slate (Captions, Subtitles & Metadata) */

  /* --- Structural Borders & Dividers --- */
  --border-subtle: #E2E8F0;          /* Clean Card & Divider Border */
  --border-focus: #247A62;           /* Accessible Form Focus Border */

  /* --- Soft Ambient Elevation Shadows --- */
  --shadow-card: 0 4px 16px rgba(25, 59, 70, 0.05);
  --shadow-elevated: 0 12px 32px rgba(25, 59, 70, 0.08);
  --shadow-dropdown: 0 16px 40px rgba(15, 23, 42, 0.12);
}
```

---

## 3. Typography Stack & Hierarchy

The typography system pairs **Manrope** for geometric, authoritative headlines with **Inter** for neutral, legible body copy and tabular data:

```css
:root {
  --font-heading: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Typographic Scale:
- **Hero Display H1:** `2.5rem` (Desktop: `3.25rem`), font-weight `800`, line-height `1.15`, letter-spacing `-0.02em`. Color: `--text-primary-heading`.
- **Section Heading H2:** `1.85rem` (Desktop: `2.25rem`), font-weight `700`, line-height `1.25`, letter-spacing `-0.01em`.
- **Card Title H3:** `1.25rem`, font-weight `700`, line-height `1.35`.
- **Subheading H4:** `1.05rem`, font-weight `600`, line-height `1.4`.
- **Body Text:** `1rem` (16px), font-weight `400`, line-height `1.65`. Color: `--text-body`.
- **Small Body / Footnotes:** `0.85rem` (13.6px), font-weight `400`, line-height `1.5`. Color: `--text-secondary`.

---

## 4. UI Component Design Specifications

### 4.1 Buttons & Interactive Actions
- **Primary CTA (`.btn-primary`):**
  - Background: `--accent-green-primary` (`#247A62`); Text: `#FFFFFF`.
  - Padding: `0.85rem 1.75rem`; Border Radius: `8px`; Font Weight: `700`.
  - Hover: Background `--accent-green-hover` (`#1D624E`), `transform: translateY(-1px)`.
- **Secondary Action (`.btn-secondary`):**
  - Background: `--surface-white`; Text: `--accent-green-primary`; Border: `1.5px solid --accent-green-primary`.
  - Hover: Background `--surface-mint-soft` (`#DDF5EA`).
- **Touch Target Requirement:** All buttons, link pills, and menu toggles must maintain a minimum bounding box of **44×44px** (WCAG 2.2 SC 2.5.8).

### 4.2 Card Geometry & Elevation
- **Cards (`.card`, `.service-card`):**
  - Background: `--surface-white`; Border: `1px solid --border-subtle`; Border Radius: `12px`.
  - Padding: `1.75rem` (Mobile: `1.25rem`); Box Shadow: `--shadow-card`.
  - Hover: Subtle border shift to `--accent-green-primary` at 40% opacity; elevation `0 8px 24px rgba(25, 59, 70, 0.08)`.

### 4.3 Form Inputs & Focus Indicators
- **Form Controls (`input`, `select`, `textarea`):**
  - Background: `--surface-white`; Border: `1.5px solid --border-subtle`; Border Radius: `8px`.
  - Height: `48px` (Inputs & Selects); Padding: `0.75rem 1rem`; Font Size: `1rem`.
  - Focus Ring: `border-color: #247A62; box-shadow: 0 0 0 3px rgba(36, 122, 98, 0.18); outline: none;`.

### 4.4 Pill Badges & Chips
- **Category & Status Chips (`.filter-chip`, `.status-badge`):**
  - Background: `--surface-mint-soft`; Text: `--accent-green-primary`; Font Weight: `600`; Font Size: `0.8rem`.
  - Padding: `0.35rem 0.85rem`; Border Radius: `50px`; Border: `1px solid rgba(36, 122, 98, 0.2)`.
  - Active State: Background `--accent-green-primary`; Text: `#FFFFFF`.
