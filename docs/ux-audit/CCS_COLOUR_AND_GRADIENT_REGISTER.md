# CRAFTEGON CORPORATE SERVICES (CCS)
## Master Colour, Palette & Gradient Register

**Document Identifier:** `DOC-CCS-UX-COLOUR-001`  
**Classification:** Visual Identity & Design System Audit  
**Date:** 2026-11-07  
**Scope:** Complete extraction from `assets/css/*.css` and inline styles across all 122 HTML pages.  

---

## 1. Primary Brand & UI Colour Inventory

The table below documents every core colour token defined in `assets/css/tokens.css` and `assets/css/theme.css`, along with its exact HEX value, intended role, contrast against white background, and audit evaluation.

| Token Name | Exact HEX / Value | Role & Usage | Contrast Ratio (vs White #FFFFFF) | WCAG 2.1 AA Compliance | Visual & UX Evaluation |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `--navy-900` | `#071527` | Deepest Corporate Navy; Hero footer, primary CTA active state | 16.9:1 | **PASS (AAA)** | Authoritative, sovereign dark tone; provides high gravitas. |
| `--navy-800` | `#0B2545` | Master Brand Navy; Headings, primary buttons, active borders | 14.1:1 | **PASS (AAA)** | Strong institutional presence; excellent readability for headings. |
| `--navy-700` | `#133965` | Mid Navy; Hover states, secondary borders | 10.8:1 | **PASS (AAA)** | Clean corporate mid-tone. |
| `--navy-600` | `#1C4D82` | Active Navy Accent; Hyperlink hover states | 7.9:1 | **PASS (AAA)** | Clear interactive indicator without neon glare. |
| `--navy-100` | `#E6EEF7` | Light Navy Tint; Pill backgrounds, active badge fills | 1.2:1 | N/A (Surface) | Soft, pleasant background fill for tags. |
| `--navy-50` | `#F0F5FA` | Very Subtle Navy Tint; Card hover background | 1.1:1 | N/A (Surface) | Clean, near-white neutral. |
| `--bg-primary` | `#FFFFFF` | Canvas background; Main card background | 1:1 | N/A (Canvas) | Pure white, crisp and modern. |
| `--bg-secondary`| `#F8FAFC` | Section Alternation; Slate light background | 1.05:1 | N/A (Canvas) | Cool neutral grey; prevents visual fatigue. |
| `--bg-ivory` | `#FCFBF7` | Warm Ivory Background (Legacy token) | 1.03:1 | N/A (Canvas) | **Minor Inconsistency:** Warm yellowish tint clashes slightly with cool slate `#F8FAFC`. |
| `--surface-light`| `#F1F5F9` | Light Surface; Input backgrounds, code block surfaces | 1.15:1 | N/A (Surface) | High-utility slate grey. |
| `--brand-gold` | `#C59B27` | Restrained Muted Gold; Hero badge bullets, accent lines | 2.5:1 | **FAIL for Text** | Fine for decorative borders/badges; **unreadable if used for small body text**. |
| `--brand-gold-hover` | `#A37F1D` | Deep Gold Hover; Accent hover state | 3.5:1 | **Large Text Only** | Acceptable for graphical UI components. |
| `--text-dark-gold` | `#8C6D14` | High-contrast dark gold for typography | 4.8:1 | **PASS (AA)** | Legible on white; recommended for all gold text labels. |
| `--text-dark` | `#0A192F` | Sovereign Dark; Headings, H1-H3, titles | 16.2:1 | **PASS (AAA)** | Deepest contrast, excellent legibility. |
| `--text-main` | `#334155` | Slate Body Text; Paragraphs, list items | 9.7:1 | **PASS (AAA)** | Industry-standard high-legibility slate body text. |
| `--text-muted` | `#64748B` | Muted Text; Subtitles, metadata, timestamps | 4.6:1 | **PASS (AA)** | Meets minimum 4.5:1 AA contrast for body text. |
| `--text-light` | `#94A3B8` | Placeholder Text; Inactive icons | 2.6:1 | **FAIL for Text** | Acceptable ONLY for non-essential form placeholders. |
| `--border-color`| `#E2E8F0` | Structural Card & Divider Borders | 1.25:1 | N/A (Border) | Crisp, subtle separation without visual clutter. |
| `--success` | `#059669` | Forest Emerald; Verified status badges, checkmarks | 4.8:1 | **PASS (AA)** | Trustworthy green, avoids harsh neon tones. |
| `--warning` | `#D97706` | Amber; Pending status, advisory notes | 3.2:1 | **Large Text Only** | Use with dark text overlay on light amber background. |
| `--danger` | `#DC2626` | Crimson; Error states, mandatory disclaimers | 4.6:1 | **PASS (AA)** | Clear critical indicator. |

---

## 2. Gradient Inventory & Assessment

The audit identified **9 CSS gradients** in stylesheet rules and **9 inline gradients** in HTML files.

### A. Stylesheet Gradients (Global CSS):

| ID | CSS Syntax | Used In | Visual Effect & Mood | Contrast & UX Impact | Verdict |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **G-01** | `linear-gradient(135deg, #0B2545 0%, #071527 100%)` | Primary CTA buttons (`.btn-primary`, `--cta-gradient`) | Subtle deep navy diagonal sheen | Excellent white text contrast (15:1). Feels premium. | **RETAIN** |
| **G-02** | `linear-gradient(135deg, #0B2545 0%, #133965 100%)` | Secondary CTA buttons (`--accent-gradient`) | Navy to mid-blue gradient | Strong contrast, clear clickable affordance. | **RETAIN** |
| **G-03** | `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)` | Section transitions (`--royal-gradient`) | Very subtle vertical fade from pure white to cool slate | Seamless, zero text contrast penalty. Adds depth. | **RETAIN** |
| **G-04** | `linear-gradient(180deg, #FFFFFF 0%, #FAF9F5 100%)` | Legacy section transition | Fade to warm ivory | **INCONSISTENT:** Clashes with `#F8FAFC` cool slate sections. | **STANDARDIZE** |
| **G-05** | `linear-gradient(90deg, #FFFFFF 0%, #FCFBF7 100%)` | Horizontal card background | Subtle horizontal tint | Very subtle, but adds unnecessary warm tint variation. | **SIMPLIFY** |
| **G-06** | `linear-gradient(135deg, #090D16 0%, #1E293B 100%)` | Dark mode / Footer / Hero tag background | Dark charcoal to slate gradient | High contrast with white text. Clean. | **RETAIN** |
| **G-07** | `linear-gradient(90deg, transparent 0%, rgba(197, 155, 39, 0.45) 50%, transparent 100%)` | Divider rules (`.gold-divider`) | Subtle gold hairline shine | Decorative only. Elegant if used sparingly. | **RETAIN** |
| **G-08** | `linear-gradient(180deg, #FFFFFF 0%, #FCFBF7 60%, #F8FAFC 100%)` | Three-stop page header background | Triple stop fade | **OVERENGINEERED:** Three-color blend creates muddy band. | **SIMPLIFY** |

### B. HTML Inline Gradients (Hardcoded in Views):

| ID | Location | Inline Syntax | Visual Effect | UX Assessment & Defect |
| :---: | :--- | :--- | :--- | :--- |
| **G-09** | `index.html` (Hero ambient) | `radial-gradient(circle at 50% 10%, rgba(197, 155, 39, 0.08) 0%, transparent 60%)` | Subtle gold radial glow behind hero title | Adds subtle warm focus on desktop. Well-contained. |
| **G-10** | `services.html` (Hero banner) | `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` | Dark slate hero container | **DISCONNECTED:** Uses Tailwind slate `#0f172a` instead of `--navy-900` (`#071527`). |
| **G-11** | `conversion/calculator.html` | `linear-gradient(135deg, #C59B27, #E2C46D)` | Bright gold badge background | **LOW CONTRAST:** Yellowish `#E2C46D` creates poor contrast with white text. |
| **G-12** | `portal/dashboard.html` | `linear-gradient(135deg, #C59B27 0%, #966F12 100%)` | Dark bronze card gradient | Clashes with clean SaaS portal aesthetic. Feels ornate. |

---

## 3. Discrepancy & Visual Friction Analysis

1. **Warm Ivory (`#FCFBF7`) vs Cool Slate (`#F8FAFC`):**
   - Certain pages use `#FCFBF7` (warm ivory/cream) while others use `#F8FAFC` (cool blue-grey slate).
   - *Customer Impact:* When navigating between `/services.html` (cool slate) and `/knowledge/` (warm ivory), the background color shift feels like switching between two different websites.
   - *Recommendation:* Deprecate `#FCFBF7` in favor of uniform `#F8FAFC` across all section alternations.
2. **Tailwind Dark Slate (`#0f172a`) vs Corporate Navy (`#071527`):**
   - The directory header in `services.html` uses `#0f172a` / `#1e293b`, whereas the homepage hero and theme tokens define `--navy-900: #071527`.
   - *Recommendation:* Replace all instances of `#0f172a` with `var(--navy-900, #071527)`.
3. **Gold Text Readability Hazard:**
   - Where `--brand-gold` (`#C59B27`) is used directly for text on white backgrounds, the contrast ratio is only 2.5:1 (failing WCAG AA).
   - *Recommendation:* Strictly enforce `--text-dark-gold: #8C6D14` (4.8:1 contrast) for all gold text labels.

---

## 4. Design Token Modernization Spec (Draft for Future Wave)

```css
/* Recommended Standardized Token Palette */
:root {
  /* Brand Master: Institutional Navy */
  --brand-navy-950: #050E1A;
  --brand-navy-900: #071527;
  --brand-navy-800: #0B2545;
  --brand-navy-700: #133965;
  --brand-navy-100: #E6EEF7;
  --brand-navy-50:  #F4F7FB;

  /* Neutral Canvas: Clean Slate */
  --canvas-pure:    #FFFFFF;
  --canvas-neutral: #F8FAFC;
  --canvas-subtle:  #F1F5F9;
  --canvas-border:  #E2E8F0;

  /* Restrained Accent: Sovereign Brass */
  --accent-brass:   #B88E1F;
  --accent-brass-dark: #785B0D; /* 5.8:1 contrast on white */
  --accent-brass-subtle: rgba(184, 142, 31, 0.08);

  /* Typography */
  --text-heading:   #0A192F;
  --text-body:      #334155;
  --text-muted:     #64748B;
}
```
