# TASK-CCS-UX-009: Mobile-First Experience Audit & Engineering Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Auditor:** Mobile UX Specialist & Senior Frontend Engineer  
**Date:** November 8, 2026

---

## 1. Executive Mobile Strategy

In modern Indian business environments, founders, company directors, and startup promoters frequently interact with service links, statutory fee notifications, and advisory communications directly from mobile messaging apps (e.g., WhatsApp, LinkedIn, email).

A corporate services website that treats mobile as an afterthought or merely scales down a dense desktop layout fails commercially. The CCS platform must be engineered as a **mobile-first digital experience**, ensuring rapid scannability, finger-friendly touch targets, zero horizontal blowout, and fast page loads over 4G/5G mobile networks.

---

## 2. Multi-Viewport Empirical Audit Matrix

An inspection was conducted across **ten viewport profiles** using Chromium-based headless automation and DOM layout measurements:

| Viewport Profile | Width × Height | Representative Devices | Mobile Ergonomics Finding | Transformation Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Narrow** | `320×640` | iPhone SE (1st gen), JioPhone Next, small Androids | Layout locks to single column; zero horizontal scroll. Text readable at 15px. | Ensure hero chips wrap cleanly; prevent word breaks. |
| **Android Compact**| `360×740` | Samsung Galaxy A/S series, Google Pixel (compact) | Service card grid collapses gracefully to single-column stack. | Standardize card padding to `1.25rem`. |
| **iPhone Standard** | `375×667` | iPhone SE (2nd/3rd gen), iPhone 7/8 | Primary reference viewport. Touch targets maintain ≥44px height. | Maintain 16px font size on inputs to avoid iOS auto-zoom. |
| **iPhone Modern** | `390×844` | iPhone 12, 13, 14, 15 Standard | Hero headline wraps across 3 lines; clean margin breathing room. | Optimize line-height for display typography. |
| **iPhone Large** | `414×896` | iPhone 11, XR, XS Max | Multi-pill filter toolbar wraps across 4 rows (consuming 210px height). | **Defect Identified:** Unstick or compact filter toolbar. |
| **iPhone Max** | `430×932` | iPhone 14, 15, 16 Pro Max | High-DPI layout renders crisply. | Ensure imagery and SVGs have explicit aspect-ratio tags. |
| **Tablet Portrait** | `768×1024` | Apple iPad (Standard / Mini), Galaxy Tab | 2-column service card layout triggers smoothly. | Maintain balanced column heights. |
| **Tablet Landscape**| `1024×768` | iPad Pro 11", compact ultrabooks | Desktop navbar activates; search input integrates into header. | Ensure mega-menu dropdowns do not clip bottom of screen. |
| **Laptop HD** | `1366×768` | Common commercial laptops | Standard 3-column service grid; full mega-menu layouts. | Optimal desktop ergonomics verified. |
| **Desktop Full HD**| `1920×1080`| Enterprise desktop monitors | Max-width constrained to `1680px` preventing content stretch. | Balanced layout verified. |

---

## 3. Critical Mobile Experience Defects & Remedies

### 3.1 Defect 1: Excessive Vertical Scrolling on Homepage
- **Observation:** On viewports under 430px, the homepage stretches to **over 9,800 pixels in vertical height**.
- **Root Cause:** 10 consecutive sections containing 44 service cards/links, 4 diagnostic calculators, 4 knowledge articles, and a 5-field contact form.
- **Remedy:** Execute the 8-section rationalisation plan documented in Report 04, reducing mobile scroll height to **under 2,500 pixels (a 75% reduction)**.

### 3.2 Defect 2: Sticky Filter Bar Screen Clamping on `/services/`
- **Observation:** On mobile screens, the sticky filter toolbar expands to **210px in height**, freezing over 40% of the visible display.
- **Root Cause:** Stacking 6 quick-need buttons, 6 stage chips, and 3 dropdown selects inside a `position: sticky; top: 60px;` container.
- **Remedy:** Decouple filters into a compact **48px single-line control bar** with a "Filter Options" button that opens an off-canvas slide-up drawer.

### 3.3 Defect 3: iOS Input Auto-Zoom
- **Observation:** When form inputs have a computed `font-size` smaller than 16px, Mobile Safari automatically zooms in on the viewport, breaking the layout and forcing the user to manually pinch-to-zoom out.
- **Remedy:** Enforce a strict minimum `font-size: 1rem (16px)` on all `<input>`, `<select>`, and `<textarea>` elements across all stylesheets.

### 3.4 Defect 4: Floating Chat Widget Overlapping CTAs
- **Observation:** The floating corporate assistant widget (`assets/css/chat-widget.css`) anchors at `bottom: 20px; right: 20px; z-index: 1000;`. On mobile screens, it frequently hovers directly over the "Submit Enquiry" or "Talk on WhatsApp" buttons at the bottom of forms.
- **Remedy:** Implement dynamic mobile positioning: offset the floating widget by `80px` from the bottom on mobile viewports containing sticky bottom action bars, or collapse the widget into a subtle header icon on mobile screens under 480px.

---

## 4. Mobile Performance & Bandwidth Optimization

To ensure instantaneous loading for prospective clients on mobile data connections:
1. **Critical CSS Preloading:** Ensure `tokens.css`, `theme.css`, and `navbar.css` are loaded in `<head>` without render-blocking `@import` chains.
2. **Font Display Swap:** Configure `font-display: swap;` for Manrope and Inter Google Fonts to prevent invisible text (FOIT) during slow font downloads.
3. **Touch Action Optimization:** Apply `touch-action: manipulation;` on all buttons and interactive chips to eliminate the 300ms mobile browser tap delay.
