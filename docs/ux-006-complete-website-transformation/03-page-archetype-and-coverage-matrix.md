# 03. PAGE ARCHETYPE AND COVERAGE MATRIX

**Project:** CraftEgon Corporate Services (CCS)  
**Total Validated HTML Pages:** 123  
**Design System Coverage:** 100%

---

## 1. Page Archetypes Definition

The CCS web property spans 10 distinct architectural page types:

```
+-----------------------------------------------------------------------------+
|                             10 PAGE ARCHETYPES                              |
+-----------------------------------------------------------------------------+
|  1. Homepage (index.html)             2. Practice Verticals (verticals/*.html)|
|  3. Service Detail (services/*.html)  4. Conversion & Tools (conversion/*.html)
|  5. Knowledge Blueprints (knowledge/) 6. Client Portal (portal/*.html)       |
|  7. Admin Console (admin/*.html)      8. Legal Policies (legal/*.html)       |
|  9. Directory Search (search/)        10. Institutional Profile (about.html) |
+-----------------------------------------------------------------------------+
```

---

## 2. Coverage Matrix Across All 10 Archetypes

| Archetype | File Count | Responsive Header | Institutional Footer | New Palette Tokens | Dark Headings (#193B46) | Contrast Verified |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Homepage** | 1 | YES | YES | YES | YES | PASS (11.2:1) |
| **Practice Verticals** | 15 | YES | YES | YES | YES | PASS (11.2:1) |
| **Service Records** | 58 | YES | YES | YES | YES | PASS (11.2:1) |
| **Conversion Tools** | 20 | YES | YES | YES | YES | PASS (10.6:1) |
| **Knowledge Centre** | 12 | YES | YES | YES | YES | PASS (11.2:1) |
| **Client Portal** | 4 | YES | YES | YES | YES | PASS (10.6:1) |
| **Admin Console** | 2 | Isolated Admin Bar | Isolated Admin Footer | YES | YES | PASS (11.2:1) |
| **Legal & Policies** | 5 | YES | YES | YES | YES | PASS (11.2:1) |
| **Directory Search** | 1 | YES | YES | YES | YES | PASS (11.2:1) |
| **About & Support** | 5 | YES | YES | YES | YES | PASS (11.2:1) |
| **TOTAL** | **123** | **100%** | **100%** | **100%** | **100%** | **PASS** |

---

## 3. Archetype Detail Specifications

### A. Homepage (`index.html`)
- Features hero section with soft mint-to-sky gradient background (`--mint-sky-hero`).
- Deep teal geometric heading (`#193B46`) with dark charcoal body copy (`#243746`).
- Primary Forest Emerald CTA (`#247A62`) and secondary outline button.
- Practice area grid with 15 cards styled with soft 10px radii and mint hover states.
- Floating AI Counsel chat trigger in soft mint circle with emerald badge.

### B. Practice Verticals (`verticals/*.html`)
- Category heroes displaying practice scope, regulatory authority (MCA, RBI, GSTN, DPIIT), and statutory form references.
- Universal service search integration and adjacent vertical reciprocal discovery.

### C. Service Detail Pages (`services/*.html`)
- 57 individual service records with statutory timelines, penalty structures, and required document checklists.
- Standardized pricing cards with primary action buttons linking to conversion intakes.

### D. Conversion & Diagnostic Tools (`conversion/*.html`)
- Interactive calculators (RoC Late Fee Calculator, MSME 43B(h) Tracker, Strike-Off Checker).
- Multi-step intake portals with real-time format validation and preliminary intake checklists.
- Data minimisation enforced: PAN and GSTIN optional on preliminary consultations.

### E. Knowledge Centre (`knowledge/*.html`)
- In-depth statutory blueprints (SPICe+ MCA V3, Transfer Pricing, FEMA FLA, POSH, DPDP).
- High readability typography, structured tables, and related service action links.

### F. Client Portal (`portal/*.html`)
- Interactive Compliance Calendar OS with persistent prototype demonstration disclosure banner across all screens.
- Sample entity profiles and statutory countdown clocks calibrated to verified timelines.

### G. Executive Admin Console (`admin/*.html`)
- Internal management console with strict `noindex, nofollow` search engine exclusion.
- Prominent demonstration/offline alert banner indicating disconnected static environment.

### H. Legal Policies (`legal/*.html`)
- Formal terms, privacy (DPDP Act aligned), refund, and Advocates Act 1961 professional disclaimer.
