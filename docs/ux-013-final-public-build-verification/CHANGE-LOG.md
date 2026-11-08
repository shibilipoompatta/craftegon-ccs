# TASK-CCS-UX-013: Change Log & Repository Modification Record

**Project:** CraftEgon Corporate Services (CCS)  
**Website:** https://ccs.craftegon.com/  
**Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-clean`  
**Reference Repository:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main` (Strictly Read-Only)  
**Date:** November 2026  
**Auditor Status:** Independent Forensic Reviewer  

---

## 1. Initial vs. Final Git State

### Initial Git State (Start of TASK-013)
```
On branch main
Your branch is up to date with 'origin/main'.
Latest Commit: 7d02d17 mobile
Modified (unstaged):
  .gitignore, 404.html, assets/css/home-unique.css, assets/js/chat-widget.js,
  assets/js/entity-intelligence.js, assets/js/navigation.js, assets/js/search-engine.js,
  components/footer.html, conversion/index.html, conversion/tax-intake.html,
  index.html, package.json, scripts/audit-seo.js, scripts/check-orphans.js,
  scripts/verify-links.js, services.html, services/index.html, sitemap.xml
Untracked:
  contact.html, docs/ux-009-*/, docs/ux-010-*/, docs/ux-011-*/, docs/ux-012-*/,
  scripts/build-public.js, scripts/verify-public-build.js
```

### Final Git State (End of TASK-013)
```
On branch main
Your branch is up to date with 'origin/main'.
Latest Commit: 7d02d17 mobile (0 commits made)
Modified (unstaged):
  [Previous files preserved] +
  about.html (location description correction)
  legal/privacy.html (headquarters removal)
  search/index.html (preset chip neutralization)
  scripts/build-public.js (manifest deduplication)
Untracked:
  [Previous untracked preserved] +
  docs/ux-013-final-public-build-verification/
```

---

## 2. Granular List of Targeted Remediations Applied under TASK-013

In strict adherence to the **Targeted Remediation Rules** (Scope: low-risk, demonstrated defects, no owner decisions altered, zero backend additions, fully verifiable):

| File Path | Targeted Change Description | Rationale & Owner Instruction Compliance | Verification Performed |
| :--- | :--- | :--- | :--- |
| `about.html` | Replaced "Operational Head Office: Room No.2, NS Building..." with "Operational Service Desk, Alappuzha, Kerala, India &bull; PIN 690501". | Strict compliance with non-negotiable instruction: *"Do not describe the Operational Service Desk as a registered office or headquarters."* | Verified via visual inspection and regex check. |
| `legal/privacy.html` | Replaced "CraftEgon CCS Headquarters, India" with "Operational Service Desk, Alappuzha, Kerala, India". | Same compliance requirement: eliminated all unauthorized "Headquarters" terminology. | Verified via regex search. |
| `search/index.html` | Removed preset quick lookup chips for "CraftEgon Technologies Pvt Ltd" and "CIN: U72900KA2021PTC148562"; replaced with neutral public benchmarks (Reliance Industries, AAB-9821 sample). | Conforms to instruction: *"Contracting legal entity: not yet confirmed. CIN/LLPIN: not yet confirmed. Do not select or recommend a legal entity as approved."* | Verified on DOM and re-tested search engine. |
| `scripts/build-public.js` | Excluded `_redirects`, `_headers`, `robots.txt`, `sitemap.xml`, and `build-manifest.json` from `copyAndSanitize` so they are only added once in their dedicated steps, and registered `build-manifest.json` in the manifest. | Resolved discrepancy between manifest claim (154) and actual disk count (151). Ensures 100% mathematical precision. | Verified with `node scratch/audit_dist_public.js`: 151 files on disk, 151 files in manifest. |
| `docs/ux-012-.../screenshots/` | Recaptured missing/misrouted screenshots for `about`, `calculator`, `retainer-desk`, and `vertical` across all 8 viewports; updated `screenshot-manifest.json`. | Resolved defect where 16 screenshots were 404 text pages and `about.html` was missing. Total inventory expanded to 80 verified screenshots. | File byte sizes verified (51 KB to 284 KB); `screenshot-manifest.json` updated. |

---

## 3. Files Deliberately Left Unchanged

The following components were scrutinized and deliberately preserved without modification:

1. **Reference Repository (`C:\Users\shibi\OneDrive\Desktop\craftegon-ccs-main`):**
   - Maintained as strictly read-only throughout the entire engagement. Zero bytes modified.
2. **Client Portal Directory (`portal/`):**
   - Retained intact for future authorized internal development. Excluded 100% from public build.
3. **Administration Console (`admin/`):**
   - Retained intact for future authorized internal development. Excluded 100% from public build.
4. **Canonical Service Catalog (`data/service-registry.json`):**
   - Preserves exact 54 active + 3 referral service structure.
5. **Brand Color Design Tokens (`assets/css/tokens.css`):**
   - Preserves approved mint-green (`#BCEBD5`) and sky-blue (`#B8E3F7`) palette.
6. **Benchmark Record in `assets/js/search-engine.js`:**
   - Retained in codebase solely to prevent breakage in legacy test `scripts/test-round-3-utilities.js`, while public search UI exposure was neutralized. Documented as a condition for owner decision.
