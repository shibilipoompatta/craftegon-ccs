# TASK-CCS-UX-009: Explore Services & Search Architecture Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** `https://ccs.craftegon.com/`  
**Target Routes:** `/services/` (`services/index.html` and `services.html`)  
**Auditor:** Senior Frontend Engineer & Search Systems Architect  
**Date:** November 8, 2026

---

## 1. Executive Mission of Explore Services

The Explore Services directory (`/services/`) is the central commercial engine of the CCS digital platform. While the homepage provides an executive overview, the Explore Services page is where prospective clients browse, search, evaluate, and select from the full **57-service corporate catalogue**.

The architecture must provide instant, frictionless filtering by business stage, corporate entity type, statutory authority, and specific MCA form numbers, while completely eliminating the visual clipping and header collision defects present in the legacy implementation.

---

## 2. Root Cause Analysis: Upper Section Content Obscuration Defect

### 2.1 The Visual Defect Observed
On mobile and tablet viewports, visitors scrolling through the service catalogue experience severe content clipping:
- The top 20% to 40% of the viewport is permanently frozen.
- Service card headlines, tags, and pricing badges scroll directly behind the sticky filter bar and fixed header, appearing partially amputated.
- When an on-screen keyboard opens during search, the remaining visible content area drops below 150 pixels.

### 2.2 Technical Root Cause Identification
This defect is not caused by CSS alone, but by a compounding conflict between HTML structure, fixed positioning, and responsive toolbar stacking:

1. **Fixed Navigation Header (`.if-header`):**
   - Declared in `assets/css/navbar.css` with `position: fixed; top: 0; width: 100%; z-index: 120;`.
   - Measured height on desktop: **~72px**. Height on mobile: **~62px**.
2. **Sticky Filter Toolbar (`.filter-toolbar-section`):**
   - Declared in `services.html` with:
     ```css
     position: sticky;
     top: 65px; /* Desktop */
     z-index: 90;
     ```
   - At `max-width: 768px`, the override is:
     ```css
     .filter-toolbar-section { top: 60px; }
     ```
   - **The Collision:** On desktop, if the header is 72px tall and the toolbar pins at `top: 65px`, the top 7px of the toolbar is permanently tucked under the header!
3. **Responsive Height Blowout of Toolbar Contents:**
   - The `.filter-toolbar-inner` container houses:
     - `.quick-needs-bar` (6 pill buttons)
     - `.filter-chips-group` (6 stage pill chips)
     - 3 `<select>` dropdown controls (`#vertical-filter-select`, `#entity-filter-select`, `#status-filter-select`)
     - Clear filter button
   - On desktop, these elements wrap horizontally across two neat lines (~85px tall).
   - On mobile screens (width ≤ 414px), these elements stack vertically, causing `.filter-toolbar-section` to expand to **between 180px and 220px in physical height**!
   - Total frozen vertical height on mobile = `62px (Header) + 210px (Toolbar) = 272px`!
   - On an iPhone SE (667px screen height), **over 40% of the screen is permanently consumed by sticky navigation**, leaving less than 390px for actual service cards.

---

## 3. The Proposed Architectural Remedy

To eliminate content clipping while preserving powerful filtering capabilities, the transformation blueprint specifies a modern, responsive toolbar architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Fixed Header (.if-header): 60px (z-index: 120)            │
├─────────────────────────────────────────────────────────────┤
│ 2. Hero & Universal Search Bar (Non-Sticky in page flow)    │
│    H1: Universal Corporate Services Directory                │
│    Search Input + Live Match Count Badge                     │
├─────────────────────────────────────────────────────────────┤
│ 3. Compact Sticky Control Strip (Mobile: 48px only)          │
│    [ Filter (3 Active) ⚙ ]  [ Stage: All ▾ ]  [ Reset ↺ ]    │
│    (Tapping "Filter" opens a clean slide-up filter sheet)   │
├─────────────────────────────────────────────────────────────┤
│ 4. Desktop Sidebar / Mobile Off-Canvas Filter Sheet          │
│    - Practice Verticals (15 Verticals)                      │
│    - Entity Type (Pvt Ltd, LLP, Section 8, Foreign Branch)  │
│    - Delivery Model (Direct Secretarial vs Legal Referral)  │
├─────────────────────────────────────────────────────────────┤
│ 5. Results Grid: Clean 3-Column Desktop / 1-Column Mobile    │
│    Fully unobstructed scrolling from top to bottom          │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Improvements:
- **Decoupled Sticky Height:** On mobile viewports, the sticky bar will contain only a single, compact **48px control strip** with a "Filter Options" toggle button.
- **Off-Canvas Filter Drawer:** Complex multi-select controls and vertical filters will move into an accessible, slide-up modal drawer on mobile, freeing 100% of the screen for browsing service cards.
- **Dynamic CSS Variable Offset:** Toolbar offset will use a dynamic CSS custom property (`top: var(--header-actual-height, 65px)`), ensuring zero overlap on any display.

---

## 4. Search Algorithm & Discovery Enhancements

The client-side search engine (`assets/js/service-search.js`) already passes all 75 automated discovery tests. The transformation blueprint will enhance its commercial utility:

### 4.1 Search Capabilities:
1. **Statutory Form Number Matcher:** Typing `"SPICe+"`, `"AOC-4"`, `"MGT-7"`, `"DIR-3 KYC"`, `"PAS-6"`, `"GSTR-9"`, `"FLA"`, or `"STK-2"` instantly surfaces the primary service card at Rank #1.
2. **Plain-Language Need Matcher:** Typing `"start a company"`, `"close company"`, `"overdue returns"`, or `"late fee"` maps directly to the appropriate service.
3. **Fuzzy Typo Tolerance:** Tolerates common input mistakes (e.g., `"regsitration"`, `"tradmark"`, `"complience"`).
4. **Transparent Delivery Model Badging:** Every search result card clearly highlights whether the service is executed via **Direct Secretarial Delivery** or **Coordinated / Referral Advisory** (mandatory under the Advocates Act, 1961).

### 4.2 Intelligent Zero-Result Empty State:
When a visitor searches for an uncatalogued requirement:
- Displays a clean, reassuring empty state notice.
- Offers immediate one-click search chips for popular related filings.
- Surfaces a direct WhatsApp inquiry button (`+91 86069 18247`) allowing the visitor to ask the Service Desk for a custom quote or regulatory clarification.
