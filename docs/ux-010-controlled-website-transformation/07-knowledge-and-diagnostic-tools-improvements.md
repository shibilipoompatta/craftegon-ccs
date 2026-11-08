# TASK-CCS-UX-010: Knowledge Centre & Diagnostic Tools Implementation

**Project:** CraftEgon Corporate Services (CCS)  
**Document:** `docs/ux-010-controlled-website-transformation/07-knowledge-and-diagnostic-tools-improvements.md`  
**Page Inventory:** 12 Knowledge Base Articles (`knowledge/*.html`) & 20 Conversion/Diagnostic Tools (`conversion/*.html`)  
**Execution Date:** November 8, 2026  

---

## 1. Diagnostic Tools Inventory & Role

The CraftEgon CCS conversion architecture features specialized client intake and diagnostic calculation tools designed to assist business founders and finance heads prior to formal engagement:
1. **RoC Late Fee & Additional Fee Calculator (`conversion/calculator.html`):** Computes statutory additional fees under Section 403 of Companies Act 2013 for overdue Form AOC-4 and Form MGT-7.
2. **NICE Trademark Classification Screener (`conversion/trademark-search.html`):** Assesses prospective brand marks across Nice Classification Classes 1 to 45 with client-side pattern matching and preliminary screening.
3. **Diagnostic Tools & Checkers Hub (`conversion/index.html`):** Central entry point indexing entity health assessments, MSME 43B(h) payment trackers, and strike-off eligibility checkers.
4. **Corporate Retainer Desk (`conversion/retainer-desk.html`):** Specialized intake desk for monthly and quarterly corporate secretarial retainers.

---

## 2. Risk Mitigation & Prototype Containment

During previous audits (TASK-003 through TASK-007), several diagnostic tools contained simulated real-time API integrations or external database queries that could mislead users. Under TASK-010:
- **Client-Side Format Validation:** Validates PAN, GSTIN, CIN, LLPIN, DIN, and Udyam numbers locally using regex patterns in `assets/js/forms.js` without making unauthorized external network calls.
- **Transparent Fallback Notice:** Where automated backend processing is inactive, forms display an explicit message informing users that data is not transmitted to external servers and providing direct contact details (`+91 86069 18247` Voice & WhatsApp, `services@craftegon.com`).
- **No Expired Circular References:** All references to expired amnesty schemes (such as legacy CCFS-2026 or outdated MCA COVID relaxations) have been replaced with current Companies Act 2013 statutory schedules.

---

## 3. Compliance Knowledge Centre (`knowledge/`)

The Knowledge Centre provides deep technical guidance across 12 core statutory compliance domains:
- SPICe+ MCA V3 incorporation architecture
- Annual RoC filing calendar and board report disclosures
- Demat mandatory compliance for private companies (Form PAS-6)
- Significant Beneficial Ownership reporting (Form BEN-2)
- RBI FLA Return filing protocols under FEMA 1999
- Director disqualification remediation and DIN deactivation relief
- Transfer Pricing documentation thresholds (Form 3CEB)

All 12 articles have been validated for canonical tags, structured data (`Article` / `TechArticle` schema), and accurate internal linking to corresponding service detail pages.
