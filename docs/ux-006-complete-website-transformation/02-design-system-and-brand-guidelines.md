# 02. DESIGN SYSTEM AND BRAND GUIDELINES

**Brand Identity:** CraftEgon Corporate Services (CCS)  
**Positioning:** *"Building Business Infrastructure — Your Business Infrastructure Partner. From business formation to compliance, protection and growth — coordinated corporate services supported by professional expertise and technology."*  
**Visual Aesthetic:** Modern, Futuristic, Elegant, Calm, High-Legibility.

---

## 1. Master Color System

The CCS visual design system is built upon **Light Mint Green** and **Light Sky Blue**, balanced with soft neutral surfaces and high-contrast deep teal typography.

```
+-----------------------------------------------------------------------------+
|                               PRIMARY PALETTE                               |
|   #BCEBD5 (Brand Mint Green)            #B8E3F7 (Brand Light Sky Blue)       |
+-----------------------------------------------------------------------------+
|                                SOFT SURFACES                                |
|   #DDF5EA (Mint Soft Tint)              #DDF2FC (Sky Soft Tint)             |
|   #F4FAF7 (Mint White Surface)          #F3F9FD (Blue White Surface)        |
|   #FFFFFF (Pure White Canvas)                                               |
+-----------------------------------------------------------------------------+
|                           INTERACTIVE ACCENTS                               |
|   #247A62 (Primary Green Accent)        #287DA8 (Secondary Blue Accent)     |
|   #75CDA9 (Mid Mint Vibrant Accent)     #79C5E8 (Mid Sky Vibrant Accent)    |
+-----------------------------------------------------------------------------+
|                         HIGH-CONTRAST TYPOGRAPHY                            |
|   #193B46 (Deep Teal Charcoal Headings) #243746 (Dark Slate Body Text)      |
|   #52717A (Slate Teal Sub-labels)       #708A93 (Placeholder / Muted)      |
+-----------------------------------------------------------------------------+
|                               BORDERS & CARDS                               |
|   #DCE8E5 (Standard Clean Mint Border)  #B5CDC7 (Border Hover State)        |
+-----------------------------------------------------------------------------+
```

### A. Color Token Specifications
```css
:root {
  /* Brand Master Colors */
  --brand-mint: #BCEBD5;
  --brand-sky: #B8E3F7;

  /* Soft Surfaces */
  --surface-mint-soft: #DDF5EA;
  --surface-sky-soft: #DDF2FC;
  --surface-mint-white: #F4FAF7;
  --surface-sky-white: #F3F9FD;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F4FAF7;

  /* Interactive Accents (High Contrast WCAG AA) */
  --accent-green-primary: #247A62;   /* 5.38:1 on #FFFFFF */
  --accent-blue-secondary: #287DA8;  /* 4.75:1 on #FFFFFF */
  --accent-mint-vibrant: #75CDA9;
  --accent-sky-vibrant: #79C5E8;

  /* Deep Corporate Typography */
  --text-dark: #193B46;              /* 11.23:1 on #FFFFFF */
  --text-main: #243746;              /* 10.15:1 on #FFFFFF */
  --text-secondary: #52717A;         /* 5.08:1 on #FFFFFF */
  --text-muted: #52717A;
  --text-light: #708A93;

  /* Structural Dividers */
  --border-color: #DCE8E5;
  --border-hover: #B5CDC7;
}
```

---

## 2. Accessibility & Contrast Verification (WCAG 2.2 AA)

Under WCAG 2.2 Level AA, normal text requires a minimum contrast ratio of **4.5:1**, and large text (18pt / 24px or 14pt / 18.5px bold) requires **3.0:1**.

| Element | Foreground | Background | Contrast Ratio | WCAG 2.2 Status |
| :--- | :--- | :--- | :---: | :---: |
| **Headings (H1-H6)** | `#193B46` (Deep Teal) | `#FFFFFF` (White) | **11.23 : 1** | **PASS (AAA)** |
| **Headings (H1-H6)** | `#193B46` (Deep Teal) | `#F4FAF7` (Mint White) | **10.61 : 1** | **PASS (AAA)** |
| **Headings (H1-H6)** | `#193B46` (Deep Teal) | `#DDF5EA` (Mint Soft) | **9.42 : 1** | **PASS (AAA)** |
| **Headings (H1-H6)** | `#193B46` (Deep Teal) | `#BCEBD5` (Brand Mint) | **8.16 : 1** | **PASS (AAA)** |
| **Headings (H1-H6)** | `#193B46` (Deep Teal) | `#B8E3F7` (Brand Sky) | **8.52 : 1** | **PASS (AAA)** |
| **Body Text** | `#243746` (Dark Slate) | `#FFFFFF` (White) | **10.15 : 1** | **PASS (AAA)** |
| **Body Text** | `#243746` (Dark Slate) | `#F4FAF7` (Mint White) | **9.60 : 1** | **PASS (AAA)** |
| **Body Text** | `#243746` (Dark Slate) | `#DDF5EA` (Mint Soft) | **8.52 : 1** | **PASS (AAA)** |
| **Secondary Sub-labels** | `#52717A` (Slate Teal) | `#FFFFFF` (White) | **5.08 : 1** | **PASS (AA)** |
| **Secondary Sub-labels** | `#52717A` (Slate Teal) | `#F4FAF7` (Mint White) | **4.81 : 1** | **PASS (AA)** |
| **Primary Button Text** | `#FFFFFF` (White) | `#247A62` (Forest Emerald) | **5.38 : 1** | **PASS (AA)** |
| **Secondary Button Text** | `#FFFFFF` (White) | `#287DA8` (Ocean Blue) | **4.75 : 1** | **PASS (AA)** |
| **Pill Badges** | `#247A62` (Emerald) | `#DDF5EA` (Mint Soft) | **4.51 : 1** | **PASS (AA)** |

> [!IMPORTANT]
> **Strict Contrast Policy:** Pale text is NEVER placed on pale backgrounds. White text is ONLY placed on dark accent surfaces (`#247A62`, `#287DA8`, `#193B46`). Dark readable text is always used on light surfaces.

---

## 3. Typography Guidelines

- **Primary Headings (`font-family: var(--font-heading)`):**  
  `'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`  
  Weights: 700 (Bold), 600 (Semi-bold). Letter-spacing: `-0.02em`.
- **Interface & Body Text (`font-family: var(--font-body)`):**  
  `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`  
  Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold). Line-height: 1.65.
- **Monospace (`font-family: var(--font-mono)`):**  
  `'DM Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace`  
  Weights: 400, 500. Used for statutory form numbers (AOC-4, MGT-7), CINs, dates, and fees.

---

## 4. Component Styling & Visual Language

1. **Buttons:**
   - Primary: Solid Forest Emerald (`#247A62`) with white text and 8px border-radius.
   - Secondary: White background with crisp 1.5px border (`#B5CDC7`) and deep teal typography (`#193B46`).
   - Accent: Solid Ocean Blue (`#287DA8`) with white text.
2. **Cards:**
   - Background: Pure White (`#FFFFFF`) or Mint White (`#F4FAF7`).
   - Borders: 1px solid `#DCE8E5`.
   - Radius: 10px-14px.
   - Shadows: Soft ambient shadows (`0 1px 3px rgba(25, 59, 70, 0.05), 0 2px 8px rgba(25, 59, 70, 0.03)`).
3. **Hero Sections:**
   - Clean gradients blending from Mint White (`#F4FAF7`) through Soft Mint (`#DDF5EA`) to Soft Sky (`#DDF2FC`).
   - High-contrast deep teal headings.
