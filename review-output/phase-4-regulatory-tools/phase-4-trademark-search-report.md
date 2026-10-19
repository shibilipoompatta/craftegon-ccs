# CraftEgon CCS — Phase 4 Trademark Search & Status Transparency Report

**Document Reference:** CRAFTEGON-DOC-P4-006  
**Audit Date:** 2026-10-20  
**Status:** TRADEMARK SEARCH & TRANSPARENCY REPORT  
**Module:** `src/backend/regulatory/adapters/ipindia-adapter.js` & `conversion/trademark-search.html`  

---

## 1. Executive Summary & Ground Truth Inspection

In Phase 4, the CraftEgon CCS trademark clearance workflow was subjected to rigorous reality-checking.

### The Real-World Reality of IP India Registry Access
The official Trade Marks Registry of India (under CGPDTM / DPIIT) operates public search portals at:
- `https://ipindiaonline.gov.in/`
- `https://ipindiaservices.gov.in/tmrpublicsearch/`

These government servers employ:
1. Dynamic ASP.NET session state management and encrypted `__VIEWSTATE` payloads.
2. Mandatory interactive visual alphanumeric CAPTCHAs on every search request.
3. Strict anti-bot protection and Terms of Service explicitly prohibiting automated programmatic scraping, harvesting, or backend headless browser crawling.

**Integrity Decision:** CraftEgon CCS does NOT deploy fragile, Terms-violating scraping bots, nor does it fake live IP India search results. Instead, it provides a transparent, dual-mode system:
1. **Verified Clearance Benchmarks:** Programmatically evaluates marks against internal verified benchmark datasets (including prominent marks like `CRAFTEGON`, `TATA`, `INFOSYS`).
2. **Transparent Manual Lookup Guidance (`MANUAL_LOOKUP_REQUIRED`):** When no benchmark match is found, it transparently explains the government CAPTCHA constraint, links directly to the official portal, and provides class-specific manual instructions.
3. **Strict Non-Availability Disclaimer:** Explicitly warns that absence of a match does NOT indicate mark availability.

---

## 2. Technical Capabilities of `IpIndiaSourceAdapter`

### 2.1 Input Validation
- **Wordmark Query:** Must be non-empty and at least 2 characters in length. Malformed queries are rejected with HTTP 400 Bad Request.
- **Nice Classification:** Must be an integer between 1 and 45 (or all classes). Out-of-bounds classes (e.g. Class 99) are rejected with HTTP 400 Bad Request.
- **Nice Description Mapping:** Returns formal Nice Classification descriptions (e.g., Class 35: Business Administration; Class 42: Software & IT).

### 2.2 Execution Status Outcomes
- `VERIFIED_BENCHMARK_MATCH`: Returns mark name, class, application number, registration status (`REGISTERED`), filing date, and proprietor.
- `MANUAL_LOOKUP_REQUIRED`: Triggered when zero benchmark matches exist. Output includes official portal URL (`https://ipindiaservices.gov.in/tmrpublicsearch/`), explanation of access restrictions, recommended manual search steps, and statutory disclaimers.

---

## 3. Statutory Legal Disclaimer & Rejection of False Availability

CraftEgon CCS enforces the following mandatory legal disclaimer across all trademark responses and UI renderings:

> **CRITICAL LEGAL NOTICE:** Zero benchmark records found does NOT signify mark availability, lack of conflicting prior registrations, or legal registrability under the Trade Marks Act, 1999. Definitive legal clearance requires interactive searching of the full Trade Marks Registry database and examination under Sections 9 and 11 by a certified Trade Marks Attorney.

Under no circumstances does CraftEgon CCS assert that a mark is:
- "Free to use"
- "Guaranteed available for registration"
- "Free of conflicting third-party rights"

---

## 4. Client-Side Integration in `conversion/trademark-search.html`

The public trademark search page was upgraded:
- Direct asynchronous integration with `/api/v1/regulatory/trademark/search?query=...&class=...`.
- Safe DOM construction using `document.createElement`, `textContent`, and safe DOM nodes (zero `innerHTML` interpolation of user input, preventing DOM-XSS).
- Visibly displays the amber `MANUAL_LOOKUP_REQUIRED` badge or red `PRIOR_REGISTERED_MARK_FOUND` badge.
- Provides one-click access to the official IP India Trade Marks Registry public portal.
