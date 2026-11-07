# CRAFTEGON CORPORATE SERVICES (CCS)
## Approved Customer-Centric Design System & Visual Specification
### Document Identifier: `DOC-CCS-UX-DS-001`
**Classification:** Approved Engineering & Design Standard  
**Date:** 2026-11-07  
**Status:** AUTHORITATIVE BASELINE  
**Brand Positioning:** *CraftEgon Corporate Services — Your Business Infrastructure Partner.*

---

## 1. Executive Summary & Design Principles

CraftEgon Corporate Services (CCS) adopts a **restrained, premium corporate visual identity** tailored for founders, finance leaders, corporate counsel, and enterprise compliance officers.

The design system is governed by five non-negotiable principles:
1. **Institutional Clarity Over Novelty:** Every visual element must convey institutional reliability, legal gravitas, and procedural certainty.
2. **Strict Accessibility (WCAG 2.2 AA Compliant):** All interactive controls and text must achieve verified contrast ratios ($\ge 4.5:1$ for body text; $\ge 3:1$ for large headings and UI borders).
3. **Harmonized Cool Palette:** Elimination of clashing warm ivory (`#FCFBF7`) in favor of uniform cool slate (`#F8FAFC`) and crisp white (`#FFFFFF`).
4. **Restrained, Purposeful Accents:** Gold is reserved for status badges, borders, and subtle focus states. Gold text on white canvas strictly uses accessible dark gold (`#8C6D14`, 4.8:1 contrast).
5. **Responsive Predictability:** All layouts, tables, forms, and cards must render cleanly across devices from 360px mobile viewports to 1440px desktop displays.

---

## 2. Color Palette & Contrast Tokens

### 2.1 Primary Brand Palette: Corporate Navy & Cool Slate
```
┌─────────────────────┬───────────┬────────────────┬──────────────────────┐
│ Token Variable      │ Hex Value │ Contrast (W)   │ WCAG 2.2 AA Role     │
├─────────────────────┼───────────┼────────────────┼──────────────────────┤
│ --navy-900          │ #071527   │ 17.2 : 1       │ Deep Canvas / Footers│
│ --navy-800          │ #0B2545   │ 13.8 : 1       │ Primary Brand / Head │
│ --navy-700          │ #133965   │ 9.8 : 1        │ Accent Navy / Hover  │
│ --navy-600          │ #1C4D82   │ 7.2 : 1        │ Secondary Links      │
│ --navy-100          │ #E6EEF7   │ 1.2 : 1 (bg)   │ Subtle Pill Tint     │
│ --navy-50           │ #F0F5FA   │ 1.1 : 1 (bg)   │ Background Fill      │
└─────────────────────┴───────────┴────────────────┴──────────────────────┘
```

### 2.2 Neutral Canvas & Surface System
```
┌─────────────────────┬───────────┬────────────────┬──────────────────────┐
│ Token Variable      │ Hex Value │ Contrast (B)   │ Functional Usage     │
├─────────────────────┼───────────┼────────────────┼──────────────────────┤
│ --bg-primary        │ #FFFFFF   │ 1.0 : 1        │ Clean White Canvas   │
│ --bg-secondary      │ #F8FAFC   │ 1.05 : 1       │ Section Alternation  │
│ --surface-light     │ #F1F5F9   │ 1.15 : 1       │ Input / Inset Box    │
│ --border-color      │ #E2E8F0   │ 1.25 : 1       │ Subtle Card Borders  │
│ --border-hover      │ #CBD5E1   │ 1.6 : 1        │ Card Hover Borders   │
└─────────────────────┴───────────┴────────────────┴──────────────────────┘
```
> [!NOTE]
> Warm ivory (`#FCFBF7`) is formally deprecated. All page bodies and alternate sections standardize on `--bg-secondary: #F8FAFC` to eliminate palette discordance.

### 2.3 Restrained Gold Accent System
```
┌─────────────────────┬───────────┬────────────────┬──────────────────────┐
│ Token Variable      │ Hex Value │ Contrast (W)   │ Permitted Usage      │
├─────────────────────┼───────────┼────────────────┼──────────────────────┤
│ --text-dark-gold    │ #8C6D14   │ 4.8 : 1 (PASS) │ Gold text on white   │
│ --brand-gold        │ #C59B27   │ 2.5 : 1 (FAIL) │ Borders & Icons ONLY │
│ --brand-gold-hover  │ #A37F1D   │ 3.5 : 1        │ Darker Gold Accent   │
│ --brand-gold-border │ rgba(...) │ N/A            │ rgba(197,155,39,0.25)│
│ --brand-gold-subtle │ rgba(...) │ N/A            │ rgba(197,155,39,0.08)│
└─────────────────────┴───────────┴────────────────┴──────────────────────┘
```
> [!IMPORTANT]
> **Gold Contrast Guardrail:** `#C59B27` must NEVER be applied to body text or hyperlinks on light backgrounds. All gold text on light canvases must use `--text-dark-gold: #8C6D14` or `--text-gold: #8C6D14` which achieves verified 4.8:1 contrast.

### 2.4 Typography Color Scale
- `--text-dark`: `#0B2545` (13.8:1) — Page titles, major headings, key figures.
- `--text-main`: `#334155` (7.3:1) — High-legibility slate body copy.
- `--text-muted`: `#64748B` (4.6:1) — Sub-labels, dates, metadata, footnotes.
- `--text-light`: `#94A3B8` — Disabled text, decorative icons.

---

## 3. Typography Scale & Font Hierarchy

The platform uses two primary web typefaces loaded via Google Fonts:
- **Headings & Body:** `Manrope` (Geometric sans-serif with high x-height and corporate legibility).
- **Statutory Codes & Data:** `DM Mono` (Clean monospace for DIN, CIN, form codes, section references, and prices).

```
┌─────────────────┬───────────┬────────────┬─────────────┬────────────────┐
│ Element         │ Size (rem)│ Size (px)  │ Line-Height │ Weight         │
├─────────────────┼───────────┼────────────┼─────────────┼────────────────┤
│ Display Hero H1 │ 2.50 rem  │ 40 px      │ 1.20        │ 800 (ExtraBold)│
│ Page Title H1   │ 2.15 rem  │ 34 px      │ 1.25        │ 700 (Bold)     │
│ Section Title H2│ 1.50 rem  │ 24 px      │ 1.30        │ 700 (Bold)     │
│ Card Heading H3 │ 1.18 rem  │ 19 px      │ 1.35        │ 600 (SemiBold) │
│ Sub-heading H4  │ 1.00 rem  │ 16 px      │ 1.40        │ 600 (SemiBold) │
│ Body Text (p)   │ 0.95 rem  │ 15.2 px    │ 1.65        │ 400 (Regular)  │
│ Small / Meta    │ 0.82 rem  │ 13 px      │ 1.50        │ 500 (Medium)   │
│ Code / Tag      │ 0.74 rem  │ 11.8 px    │ 1.40        │ 500 (DM Mono)  │
└─────────────────┴───────────┴────────────┴─────────────┴────────────────┘
```

---

## 4. Spacing, Layout & Container Geometry

A consistent 8-point spatial grid governs all margins and paddings:
- `--space-1`: `4px` (`0.25rem`) — Micro icon-to-label gaps
- `--space-2`: `8px` (`0.50rem`) — Chip paddings, badge gaps
- `--space-3`: `12px` (`0.75rem`) — Dense list margins
- `--space-4`: `16px` (`1.00rem`) — Standard component margin, card internal padding
- `--space-6`: `24px` (`1.50rem`) — Card padding, grid gap
- `--space-8`: `32px` (`2.00rem`) — Section internal padding
- `--space-12`: `48px` (`3.00rem`) — Section vertical rhythm
- `--space-16`: `64px` (`4.00rem`) — Hero section vertical padding

### Predictable Containers
- `--container-max`: `1200px` (Main responsive content boundary)
- `--container-narrow`: `900px` (Readability optimized for legal text and articles)

---

## 5. Standardized Component Library

### 5.1 Buttons & Interactive Controls
```
┌──────────────────┬──────────────────────┬──────────────────────┬────────┐
│ Button Variant   │ Background           │ Text / Border        │ State  │
├──────────────────┼──────────────────────┼──────────────────────┼────────┤
│ .btn-primary     │ #0B2545 (Corp Navy)  │ #FFFFFF / #0B2545    │ Main   │
│ .btn-primary:hov │ #071527 (Deep Navy)  │ #FFFFFF / #071527    │ Hover  │
│ .btn-secondary   │ #FFFFFF (Crisp White)│ #0B2545 / #CBD5E1    │ Alt    │
│ .btn-secondary:h │ #F8FAFC (Cool Slate) │ #0B2545 / #0B2545    │ Hover  │
│ .btn-accent      │ #8C6D14 (Dark Gold)  │ #FFFFFF / #8C6D14    │ Accent │
│ .btn:disabled    │ Opacity 0.55         │ Cursor not-allowed   │ Disabl.│
└──────────────────┴──────────────────────┴──────────────────────┴────────┘
```
- **Tap Targets:** All buttons enforce `min-height: 44px` on mobile viewports for touch ergonomics.
- **Focus Rings:** Interactive elements feature `:focus-visible { outline: 2px solid var(--navy-800); outline-offset: 2px; }`.

### 5.2 Cards & Surface Containers
- **Standard Card (`.card`, `.service-card`):**
  - Background: `#FFFFFF`
  - Border: `1px solid #E2E8F0`
  - Border Radius: `8px` (`--radius-md`)
  - Padding: `1.5rem` (`24px`)
  - Shadow: `0 1px 3px rgba(11, 37, 69, 0.04)`
  - Hover: `border-color: #CBD5E1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(11, 37, 69, 0.06);`

### 5.3 Badges, Chips & Status Indicators
- **Category Badge:** Background `#F0F5FA`, Border `#E6EEF7`, Text `#0B2545` (Navy).
- **Service Status Badge (Direct):** Background `rgba(16, 185, 129, 0.1)`, Border `rgba(16, 185, 129, 0.25)`, Text `#065F46` (Emerald).
- **Service Status Badge (Referral):** Background `rgba(245, 158, 11, 0.1)`, Border `rgba(245, 158, 11, 0.25)`, Text `#92400E` (Amber).
- **Gold Accent Badge:** Background `rgba(197, 155, 39, 0.08)`, Border `rgba(197, 155, 39, 0.25)`, Text `#8C6D14` (Dark Gold).

### 5.4 Statutory Disclosure & Notice Panels
- **Statutory Notice (`.statutory-notice-box`):**
  - Background: `#F8FAFC`
  - Border: `1px solid #E2E8F0` with a `4px solid #C59B27` left accent bar
  - Border Radius: `6px`
  - Font Size: `0.82rem`
  - Text Color: `#64748B` (with `<strong>` in `#0B2545`)

### 5.5 Responsive Statutory Tables
- **Table Container (`.table-responsive`):**
  - All multi-column tables are wrapped in `<div class="table-responsive">` with `width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;`.
  - Table headers use background `#F8FAFC`, text `#0B2545`, padding `0.75rem 1rem`, font weight `700`.
  - Borders: `1px solid #E2E8F0`.

---

## 6. Purposeful Gradients (The Approved 4)

Of the 18 gradients previously scanned across the codebase, 14 muddy, low-contrast, or redundant gradients are deprecated. Only 4 purposeful gradients are approved:

1. **G-01: Hero Radial Atmosphere**
   `radial-gradient(circle at 50% 10%, rgba(197, 155, 39, 0.06) 0%, transparent 60%), #FFFFFF`
   *Purpose:* Subtle top atmosphere on hero sections without muddying readability.
2. **G-02: Dark Footer / Header Fade**
   `linear-gradient(180deg, #0B2545 0%, #071527 100%)`
   *Purpose:* Deep, authoritative foundation for footers and dark brand blocks.
3. **G-03: Primary Button Depth**
   `linear-gradient(135deg, #0B2545 0%, #133965 100%)`
   *Purpose:* Subtle sheen on primary interactive controls.
4. **G-04: Section Divider Fade**
   `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)`
   *Purpose:* Seamless boundary transition between white cards and slate sections.

---

## 7. Responsive Breakpoints & Device Targets

```
┌──────────────────┬──────────────┬───────────────────────────────────────┐
│ Breakpoint Class │ Width Range  │ Layout Adaptation                     │
├──────────────────┼──────────────┼───────────────────────────────────────┤
│ Desktop Large    │ > 1200px     │ Full 3-column / 4-column card grid    │
│ Standard Laptop  │ 992px–1199px │ 3-column card grid, standard nav      │
│ Tablet Portrait  │ 768px–991px  │ 2-column grid, compact table layout   │
│ Mobile Modern    │ 390px–767px  │ 1-column grid, drawer nav, 44px tap   │
│ Small Mobile     │ 320px–389px  │ 1-column, horizontal table scroll     │
└──────────────────┴──────────────┴───────────────────────────────────────┘
```

---

## 8. Summary of File Targets for Token Remediation

- `assets/css/tokens.css` — Standardize `--text-dark-gold`, eliminate warm ivory tokens.
- `assets/css/theme.css` — Ensure table responsiveness, accessible focus rings, and card consistency.
- `assets/css/navbar.css` — Update mobile drawer and search styling.
- `assets/css/service-page.css` — Standardize the 13-section service page template.
- `assets/css/home-unique.css` — Clean up redundant styles and ensure uniform slate backgrounds.
