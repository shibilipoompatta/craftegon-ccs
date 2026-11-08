# Exact Git Change & Staging Plan (Owner Approval Checkpoint)

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-015  
**Date:** 2026-11-08  
**Evaluator:** Senior DevOps Engineer, Release Manager & Web Security Auditor  
**Approval Status:** **PENDING EXPLICIT OWNER APPROVAL** (Zero Git operations executed)  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Executive Summary

This document establishes the precise, file-by-file staging and Git execution plan for creating a controlled preview deployment on Cloudflare Pages.

In accordance with Section 6, the broad staging command (`git add dist-public/ docs/ scripts/ assets/`) is strictly prohibited. Instead, a minimal, safe, and verifiable file-by-file staging plan has been formulated. 

Only the files necessary for Cloudflare Pages to build the public distribution artifact (`dist-public/`) from source are proposed for staging. Internal documentation, test artifacts, scratch scripts, local configuration, and unvetted modules are strictly excluded.

**NO GIT STAGING, COMMIT, BRANCH CREATION, OR REMOTE PUSH HAS OCCURRED.** All Git operations are held at this mandatory approval checkpoint pending explicit authorization by the business owner.

---

## 2. File-by-File Staging Proposal (Exactly 25 Files)

The following 25 files constitute the complete, minimal changeset required to build and verify the public website:

| # | File / Path | Current Status | Why Required | Public / Private | Proposed Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `.gitignore` | Modified | Adds `dist-public/` to ignore list to prevent tracking built artifacts. | Public Config | **Stage** |
| **2** | `404.html` | Modified | Branded custom error page with valid navigation fallbacks. | Public Source | **Stage** |
| **3** | `about.html` | Modified | Corporate about page with official phone and location disclosures. | Public Source | **Stage** |
| **4** | `contact.html` | Untracked (New) | Public contact intake desk with static WhatsApp/phone fallbacks. | Public Source | **Stage** |
| **5** | `index.html` | Modified | Rationalized homepage (TASK-010/011/012) with canonical structure. | Public Source | **Stage** |
| **6** | `services.html` | Modified | Universal service directory page with search and filtering. | Public Source | **Stage** |
| **7** | `services/index.html` | Modified | Directory mirror for clean URL routing (`/services/`). | Public Source | **Stage** |
| **8** | `search/index.html` | Modified | Site-wide search and service discovery interface. | Public Source | **Stage** |
| **9** | `conversion/index.html` | Modified | Conversion hub index page. | Public Source | **Stage** |
| **10** | `conversion/tax-intake.html` | Modified | Tax intake consultation form with client-side fallback. | Public Source | **Stage** |
| **11** | `legal/privacy.html` | Modified | Privacy policy adhering strictly to DPDP Act 2023 principles. | Public Source | **Stage** |
| **12** | `assets/css/home-unique.css` | Modified | Homepage-specific responsive styles, cards, and animations. | Public Asset | **Stage** |
| **13** | `assets/js/config.js` | Modified | Sanitized configuration (sets `legalEntity: null`, `operationalDesk`). | Public Script | **Stage** |
| **14** | `assets/js/chat-widget.js` | Modified | Chat assistant widget with sanitized public contact links. | Public Script | **Stage** |
| **15** | `assets/js/entity-intelligence.js` | Modified | Entity intelligence search engine and sanitized actions. | Public Script | **Stage** |
| **16** | `assets/js/navigation.js` | Modified | Mobile navigation drawer, mega-menus, and accessible toggles. | Public Script | **Stage** |
| **17** | `assets/js/search-engine.js` | Modified | Service catalog search indexer and query resolver. | Public Script | **Stage** |
| **18** | `components/footer.html` | Modified | Master footer component with phone `+91 86069 18247` and desk location. | Public Component | **Stage** |
| **19** | `package.json` | Modified | Defines `build:public` and `verify:public` npm scripts. | Public Config | **Stage** |
| **20** | `sitemap.xml` | Modified | Hardened XML sitemap with 100% exclusion of `/portal/` and `/admin/`. | Public Meta | **Stage** |
| **21** | `scripts/build-public.js` | Untracked (New) | Public artifact compiler that copies vetted files into `dist-public/`. | Build Tool | **Stage** |
| **22** | `scripts/verify-public-build.js` | Untracked (New) | 51-assertion automated verification test for `dist-public/`. | Build Tool | **Stage** |
| **23** | `scripts/audit-seo.js` | Modified | Technical SEO automated audit tool. | Build Tool | **Stage** |
| **24** | `scripts/check-orphans.js` | Modified | Page orphan detection automated audit tool. | Build Tool | **Stage** |
| **25** | `scripts/verify-links.js` | Modified | Link mesh integrity automated audit tool. | Build Tool | **Stage** |

---

## 3. Excluded Files & Directories (Strict Non-Staging List)

The following files and directories exist in the local workspace but are **STRICTLY EXCLUDED** from staging and will NOT be committed to the preview branch:

| Excluded Resource | Reason for Exclusion | Security Posture |
| :--- | :--- | :--- |
| `dist-public/` | Ephemeral build artifact; ignored in `.gitignore`. Generated during CI build. | Excluded by `.gitignore` |
| `docs/ux-009-*/` | Internal audit & intelligence blueprint documentation. | Excluded from branch |
| `docs/ux-010-*/` | Internal transformation execution reports. | Excluded from branch |
| `docs/ux-011-*/` | Internal verification & stabilisation reports. | Excluded from branch |
| `docs/ux-012-*/` | Internal build & release preparation reports & 80 screenshots. | Excluded from branch |
| `docs/ux-013-*/` | Internal final public build verification reports. | Excluded from branch |
| `docs/ux-014-*/` | Internal preview gate & reconciliation reports. | Excluded from branch |
| `docs/ux-015-*/` | Current task release management reports. | Excluded from branch |
| `scratch/` | Temporary scratch scripts, logs, and capture files; ignored in `.gitignore`. | Excluded by `.gitignore` |
| `.vault/` | Internal credential and key management storage (if any). | Excluded by `.gitignore` |
| `node_modules/` | Local npm dependencies. | Excluded by `.gitignore` |
| `.antigravity-ide/`, `.gemini/` | IDE and agent system metadata. | Excluded by `.gitignore` |

---

## 4. Diff Summary of Proposed Changes

- **Total Files Proposed for Staging:** Exactly 25 files.
- **Lines Changed:** +1,142 insertions, -1,188 deletions in 22 tracked files; +3 new files (`contact.html`, `scripts/build-public.js`, `scripts/verify-public-build.js`).
- **Core Modifications:**
  - Removal of unfinished prototype markup from `index.html`.
  - Harmonization of public phone (`+91 86069 18247`) and location ("Operational Service Desk, Alappuzha, Kerala").
  - Elimination of `headquarters` and unconfirmed `legalEntity` claims from `assets/js/config.js`.
  - Addition of deterministic build and verification tooling in `scripts/`.
  - Addition of `dist-public/` to `.gitignore`.

---

## 5. Security Assessment of Proposed Changes

1. **Secrets & Credentials:** An automated scan across all 25 proposed files confirmed ZERO API keys, private keys, database passwords, or operational secrets are present (**VERIFIED FACT**).
2. **Internal Code Isolation:** Neither `/portal/` nor `/admin/` are included in the changes. `scripts/build-public.js` strictly excludes them from the generated public artifact.
3. **Legal Compliance:** No unconfirmed corporate registration numbers (CIN/LLPIN), unconfirmed legal entity names, or false claims of a corporate headquarters are introduced.
4. **Third-Party Trackers:** Zero third-party ad pixels or trackers are introduced. External dependencies are limited to Google Fonts and Cloudflare Turnstile bot verification (`challenges.cloudflare.com`).

---

## 6. Proposed Git Execution Plan (Subject to Owner Approval)

Upon receipt of explicit owner authorization, the exact commands to be executed are:

```bash
# 1. Create and switch to an isolated preview branch (leaving main untouched)
git checkout -b preview/ccs-task-015

# 2. Stage only the 25 approved files individually
git add .gitignore 404.html about.html contact.html index.html services.html services/index.html search/index.html conversion/index.html conversion/tax-intake.html legal/privacy.html assets/css/home-unique.css assets/js/config.js assets/js/chat-widget.js assets/js/entity-intelligence.js assets/js/navigation.js assets/js/search-engine.js components/footer.html package.json sitemap.xml scripts/build-public.js scripts/verify-public-build.js scripts/audit-seo.js scripts/check-orphans.js scripts/verify-links.js

# 3. Verify staged files match exact 25-file list
git diff --cached --name-only

# 4. Commit with clear, descriptive commit message
git commit -m "build(preview): prepare isolated public website source for TASK-015 Cloudflare preview"

# 5. Push ONLY the preview branch to remote origin (main is NOT pushed)
git push -u origin preview/ccs-task-015
```

---

## 7. Rollback & Recovery Considerations

- **Branch Isolation:** Because the changes will be committed to a new branch (`preview/ccs-task-015`), `main` remains untouched at commit `7d02d17cfdd74a8594e4bec66b883e4b9232929f`.
- **Immediate Reversal:** If the owner desires to abort or remove the preview branch at any time:
  ```bash
  # Delete remote preview branch
  git push origin --delete preview/ccs-task-015
  # Switch back to main locally
  git checkout main
  # Delete local preview branch
  git branch -D preview/ccs-task-015
  ```
- **Zero Impact on Production:** The live website at `https://ccs.craftegon.com` is connected to `main` and will experience zero disruptions or updates.
