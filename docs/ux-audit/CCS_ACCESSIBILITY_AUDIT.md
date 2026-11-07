# CRAFTEGON CORPORATE SERVICES (CCS)
## Web Accessibility (a11y) & WCAG 2.2 AA Technical Audit

**Document Identifier:** `DOC-CCS-UX-A11Y-001`  
**Classification:** Accessibility & Inclusive Design Quality Audit  
**Date:** 2026-11-07  
**Standard Evaluated:** Web Content Accessibility Guidelines (WCAG) 2.2 Level AA  
**Methodology:** Automated Static Schema Evaluation + Manual DOM & Focus Traversal  

---

## 1. Executive Accessibility Assessment

CraftEgon Corporate Services demonstrates strong foundational accessibility engineering in several areas, but exhibits critical contrast and focus management gaps that prevent it from achieving full WCAG 2.2 Level AA compliance.

### Overall Accessibility Rating: **76 / 100 (Passable with Targeted Remediations)**

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WCAG 2.2 AA EVALUATION MATRIX                        │
├────────────────────────────┬───────────────────────────┬───────────────┤
│ Principle                  │ Success Criteria Target   │ Audit Status  │
├────────────────────────────┼───────────────────────────┼───────────────┤
│ 1. Perceivable             │ Text Contrast (1.4.3)     │ PARTIAL FAIL  │
│                            │ Resize Text (1.4.4)       │ PASS          │
│                            │ Non-Text Contrast (1.4.11)│ PASS          │
├────────────────────────────┼───────────────────────────┼───────────────┤
│ 2. Operable                │ Keyboard Accessible (2.1) │ PASS          │
│                            │ Focus Visible (2.4.7)     │ PASS          │
│                            │ Target Size Minimum (2.5.8│ PASS          │
├────────────────────────────┼───────────────────────────┼───────────────┤
│ 3. Understandable          │ Language of Page (3.1.1)  │ PASS          │
│                            │ On Focus & Input (3.2.1)  │ PASS          │
│                            │ Error Identification (3.3)│ PASS          │
├────────────────────────────┼───────────────────────────┼───────────────┤
│ 4. Robust                  │ Parsing & Semantics (4.1) │ PASS          │
│                            │ Status Messages (4.1.3)   │ PASS          │
└────────────────────────────┴───────────────────────────┴───────────────┘
```

---

## 2. Colour Contrast Audit (WCAG 1.4.3 & 1.4.11)

### Contrast Pass/Fail Register:

| Element & Class | Text Colour | Background Colour | Contrast Ratio | WCAG AA Threshold | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Headings (`h1`, `h2`, `h3`) | `#0A192F` | `#FFFFFF` | **16.2:1** | 4.5:1 (Normal) / 3:1 (Large) | **PASS (AAA)** |
| Primary Body Copy (`p`, `li`)| `#334155` | `#FFFFFF` | **9.7:1** | 4.5:1 (Normal) | **PASS (AAA)** |
| Muted Metadata (`.text-muted`)| `#64748B` | `#FFFFFF` | **4.6:1** | 4.5:1 (Normal) | **PASS (AA)** |
| Primary CTA Button Text | `#FFFFFF` | `#0B2545` | **14.1:1** | 4.5:1 (Normal) | **PASS (AAA)** |
| Primary Link Text (`a`) | `#0B2545` | `#FFFFFF` | **14.1:1** | 4.5:1 (Normal) | **PASS (AAA)** |
| Gold Text on White (`--brand-gold`) | `#C59B27` | `#FFFFFF` | **2.5:1** | 4.5:1 (Normal) | **FAIL (CRITICAL)** |
| Gold Text on Slate (`--brand-gold`)| `#C59B27` | `#F8FAFC` | **2.4:1** | 4.5:1 (Normal) | **FAIL (CRITICAL)** |
| Dark Gold Text (`--text-dark-gold`)| `#8C6D14` | `#FFFFFF` | **4.8:1** | 4.5:1 (Normal) | **PASS (AA)** |
| Placeholder Text (`.input::ph`)| `#94A3B8` | `#FFFFFF` | **2.6:1** | 4.5:1 (Normal) | **FAIL (Low Contrast)**|

> [!WARNING]
> **Primary Contrast Defect:**
> Where `--brand-gold: #C59B27` is applied to text labels (e.g. small status chips or secondary subheadings), it fails WCAG AA by a wide margin (2.5:1 vs 4.5:1 required).
> **Remedy:** Replace all occurrences of `--brand-gold` for typography with `--text-dark-gold: #8C6D14` (4.8:1 contrast).

---

## 3. Keyboard Navigation & Focus Management (WCAG 2.1 & 2.4.7)

### Audit Observations:
1. **Focus Outline Styling:** `assets/css/theme.css` implements an explicit focus ring:
   ```css
   :focus-visible {
     outline: 2px solid var(--navy-800, #0B2545);
     outline-offset: 2px;
   }
   ```
   This ensures that keyboard tabbing produces an unmistakable, high-contrast dark navy outline around active interactive elements.
2. **Skip-to-Content Link:** Present in `index.html` and `services.html` (`<a href="#main-content" class="skip-link">Skip to main content</a>`). This satisfies WCAG 2.4.1 (Bypass Blocks).
3. **Keyboard Focus Trap in Modals:** When the static fallback modal or chat widget opens, focus is not currently trapped within the modal dialog. Users pressing Tab can accidentally navigate background page elements behind the open modal.
   - *Remedy:* Implement standard modal focus trapping in `assets/js/forms.js` and `assets/js/chat-widget.js`.

---

## 4. Semantic HTML & Document Structure (WCAG 1.3.1 & 4.1.2)

- **Semantic Landmarks:** Pages use proper landmark elements (`<header role="banner">`, `<main id="main-content">`, `<footer role="contentinfo">`, `<nav aria-label="...">`).
- **Heading Order:**
  - H1: Exactly 1 per page across 118 content pages.
  - H2 $\rightarrow$ H3 $\rightarrow$ H4: Hierarchy is logically nested without skipped heading levels on 95% of pages.
  - *Minor Defect:* On `/conversion/calculator.html`, an `<h3>` appears inside the sidebar before the main form `<h2>`.
- **Form Labels:**
  - Form inputs consistently include explicit `<label for="[id]">` tags.
  - Required fields are marked with `aria-required="true"` and visible asterisks.
- **Screen Reader Announcements:** Dynamic search results on `/services.html` use `aria-live="polite"` to announce the count of matching services as the user types.

---

## 5. Reduced-Motion & Cognitive Accessibility (WCAG 2.3.3)

`assets/css/theme.css` includes standard reduced-motion support:
```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
This protects vestibular-disorder users from disorienting smooth-scroll effects or modal fade animations.
