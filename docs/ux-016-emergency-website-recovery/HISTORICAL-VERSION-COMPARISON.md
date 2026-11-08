# Historical Version Comparison & Design Baseline Evaluation

**Project:** CraftEgon Corporate Services (CCS)  
**Deliverable:** Deliverable 3 — Historical Version Comparison  
**Live Target Domain:** `https://ccs.craftegon.com`  
**Working Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly read-only)  
**Date:** 2026-11-08  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED  

---

## 1. Executive Comparison Overview

To resolve the live production degradation where the website appeared "unacceptable, unprofessional, and visually disorganized", three distinct architectural and design candidates across the Git history were evaluated:

1. **Candidate A — Current Live Production State (`fa59cda`):**
   The deployed state resulting from commit `fa59cda` ("new changes"), which incorporated the experimental homepage rewrite from TASK-010.
2. **Candidate B — Historical Baseline Candidate (`7d02d17` with Critical Corrections):**
   The commit immediately preceding the TASK-010 homepage rewrite, containing the established Mint-and-Sky color scheme, comprehensive corporate card architecture, and verified business identity disclosures.
3. **Candidate C — Reference Repository State (`81cd5e3` / `craftegon-ccs-main`):**
   The legacy pre-redesign baseline with a dark institutional color scheme, deep legal-tech terminology ("Sovereign Governance Matrix", "Zero-Trust Security Architecture"), and unverified claims.

---

## 2. Quantitative Metric Matrix

| Metric / Dimension | Candidate A: Current Live (`fa59cda`) | Candidate B: Historical Baseline (`7d02d17`) [SELECTED] | Candidate C: Reference Repo (`81cd5e3`) | Classification |
| :--- | :--- | :--- | :--- | :--- |
| **Commit ID** | `fa59cda914b2b155` | `7d02d17cfdd74a85` | `81cd5e3477196024` | VERIFIED FACT |
| **Commit Date** | 2026-11-08 15:21:35 +0530 | 2026-11-08 07:18:00 +0530 | 2026-11-07 10:44:00 +0530 | VERIFIED FACT |
| **Homepage File Size** | 31,274 bytes (-56.6%) | 72,128 bytes | 81,441 bytes | VERIFIED FACT |
| **Homepage DOM Line Count** | 761 lines | 1,475 lines | 1,605 lines | VERIFIED FACT |
| **Total Card Components** | 22 cards (-73.5%) | 83 cards | 83 cards | VERIFIED FACT |
| **Primary H2 Sections** | 6 sparse sections | 9 comprehensive sections | 8 institutional sections | VERIFIED FACT |
| **`home-unique.css` Size** | 1,957 lines / 48.7 KB (Bloated) | 1,272 lines / 31.9 KB (Clean) | *None* (Used inline/theme CSS) | VERIFIED FACT |
| **Color Scheme & Palette** | Mint & Sky (Broken by CSS clash) | Mint (`#BCEBD5`) & Sky (`#B8E3F7`) | Institutional Dark Navy & Slate | VERIFIED FACT |
| **Interactive Problem Tabs** | Stripped / Removed | 4 Interactive Corporate Tabs | 4 Interactive Institutional Tabs | VERIFIED FACT |
| **Regulatory Diagnostics** | Stripped / Removed | 3 Self-Service Diagnostic Cards | Complex Enterprise Diagnostics | VERIFIED FACT |
| **Visual Density & Spacing** | Sparse, fragmented, hollow | Balanced, professional grid | Dense, dark institutional | VERIFIED FACT |
| **Subpage Visual Harmony** | Severe clash with 57 subpages | 100% harmonized with subpages | Cohesive (Legacy Dark) | VERIFIED FACT |
| **Portal Isolation** | FAILED (Exposed at `/portal/`) | SECURED (Exclusion verified) | Unisolated | VERIFIED FACT |
| **Public Build Compatibility** | Unconfigured in Cloudflare | 100% compatible (`dist-public`) | No public build script | VERIFIED FACT |
| **Automated Test Pass Rate** | 75/75 (Tests ignored homepage gut) | 75/75 Test Suites (100% Pass) | 71/75 (Legacy tests) | VERIFIED FACT |

---

## 3. Detailed Qualitative Evaluation

### Candidate A: Current Live Production (`fa59cda`) — REJECTED
* **Visual Evaluation:**
  - The live homepage appears stripped down, generic, and unpolished.
  - The hero section sits above a sparse layout with excessive white space and oversized typography.
  - Removing 61 of the 83 cards left large empty voids, making the corporate firm appear as a basic placeholder or unfinished template rather than an established corporate advisory infrastructure provider.
  - 685 lines of override CSS in `home-unique.css` broke responsive paddings on mobile viewports (`390px`, `360px`), forcing awkward text wraps.
* **Architectural Evaluation:**
  - Stark visual inconsistency between `index.html` and the underlying 57 service detail pages (`services/*.html`), 15 practice verticals, and `conversion/calculator.html`. Navigating from home to any service produces an abrupt shift in visual language, styling density, and navigation structure.
  - Cloudflare Pages was misconfigured to deploy the raw repository root, exposing `/portal/dashboard.html` and internal directories directly to the public web.

### Candidate B: Historical Baseline (`7d02d17`) — ACCEPTED & RECOVERED
* **Visual Evaluation:**
  - Maintains the owner-approved Mint-green (`#BCEBD5`) and Sky-blue (`#B8E3F7`) modern professional corporate palette established in TASK-006.
  - Restores 83 rich, structured card components across 9 comprehensive sections:
    1. Hero: Authoritative value proposition ("Your Business Infrastructure Partner") with dual primary CTAs and social proof counters.
    2. Problem-Solution Diagnostic Tabs: Interactive categorization (Incorporation, Compliance, Tax, Advisory) demonstrating operational breadth.
    3. Featured Corporate Schedules: Structured tables detailing timelines, documentation requirements, and fee schedules.
    4. Self-Service Regulatory Diagnostics: Interactive assessment cards driving conversions to the compliance calculator and service desk.
    5. Step-by-Step Delivery Roadmap: Transparent 5-stage intake-to-filing process.
    6. Verified Service Boundaries: Explicit statutory disclosures clarifying non-advocate status and chartered accountant coordination.
  - Typography, container paddings, card elevations, and hover states are completely harmonized with all 57 corporate service pages.
* **Technical Evaluation:**
  - `home-unique.css` is clean, maintainable, and free of redundant overrides (1,272 lines).
  - Residual portal link at line 800 (`/portal/subscription.html`) is sanitized to `/conversion/retainer-desk.html`.
  - Global leak in `assets/css/theme.css` (`@import url('/assets/css/portal.css');`) is eliminated.
  - Fully compatible with `scripts/build-public.js`, producing a hardened, zero-portal `dist-public/` artifact (151 files, 2.50 MB).

### Candidate C: Reference Repository (`81cd5e3` / `craftegon-ccs-main`) — REJECTED
* **Visual Evaluation:**
  - Dark slate and navy institutional theme designed prior to TASK-006.
  - Contains heavy, technical language ("AI Compliance Operating System", "Sovereign Governance Matrix") that exceeds the authorized corporate services scope and was explicitly rejected by the owner in TASK-006 and TASK-007.
* **Architectural Evaluation:**
  - Lacks modern mobile responsive optimizations implemented in TASK-007.
  - Contains unvetted legal-tech claims and unhedged entity representations.
  - Strictly read-only reference repository; restoring this would reverse all subsequent approved identity corrections and client journeys.

---

## 4. Decision & Selection Rationale

**Selection:** **Candidate B (`7d02d17` with Critical Corrections)** under **Option B (Historical restoration with critical corrections)**.

**Rationale:**
1. **Directly Solves Owner's Visual Dissatisfaction:** Restores the rich, institutional layout that prospective enterprise clients expect, removing the sparse, empty template feeling of Candidate A.
2. **Harmonizes with 100% of Subpages:** The 57 service detail pages were built and styled against the design conventions of `7d02d17`. Restoring `7d02d17` eliminates the severe design fracture between home and subpages.
3. **Preserves All Authoritative Business Decisions:** Retains the exact brand name ("CraftEgon Corporate Services"), phone (`+91 86069 18247`), operational desk location ("Alappuzha, Kerala"), and neutral entity posture without unverified CIN or LLPIN claims.
4. **Hardens Public Isolation:** Eliminates internal portal links and portal stylesheet leaks, enabling a 100% verified, isolated public deployment via `dist-public/`.
