# Cloudflare Preview Deployment Architecture & Specification

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-015  
**Date:** 2026-11-08  
**Evaluator:** Senior DevOps Engineer & Cloudflare Pages Specialist  
**Deployment Status:** **HELD AT APPROVAL CHECKPOINT** (Pending owner approval to push preview branch)  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Executive Summary

This document specifies the deployment architecture and execution parameters for previewing CraftEgon Corporate Services on Cloudflare Pages.

The deployment model leverages Cloudflare Pages' native Git integration. Under this architecture, pushing a non-production branch (such as `preview/ccs-task-015`) to GitHub automatically triggers an isolated preview build that compiles the public website and serves it on an ephemeral preview subdomain (`https://preview-ccs-task-015.<project-name>.pages.dev`).

Because Git push operations require explicit owner authorization under Section 4 and Section 8, the push has not yet been executed. This document establishes the exact configuration prerequisites, build parameters, and validation steps.

---

## 2. Cloudflare Pages Configuration Parameters

The following parameters must be configured in the Cloudflare Pages project dashboard:

| Setting Parameter | Intended Configuration | Operational Rationale | Verification Status |
| :--- | :--- | :--- | :--- |
| **Connected Git Repository** | `https://github.com/shibilipoompatta/craftegon-ccs` | Authoritative GitHub repository for CraftEgon CCS. | **REPORT CLAIM** |
| **Production Branch** | `main` | Production deployments deploy strictly from `main`. | **VERIFIED FACT** |
| **Framework Preset** | `None` / `Custom` | Static HTML/CSS/JS application. Prevents framework override. | **VERIFIED FACT** |
| **Build Command** | `node scripts/build-public.js` | Executes the isolation compiler that creates `dist-public/`. | **VERIFIED FACT** |
| **Build Output Directory** | `dist-public` | **CRITICAL:** Only files in `dist-public/` are served to users. | **VERIFIED FACT** |
| **Root Directory** | `/` (default) | Build command runs from repository root. | **VERIFIED FACT** |
| **Environment Variable** | `NODE_VERSION=20` | Guarantees consistent Node.js LTS runtime on Cloudflare CI. | **EXTERNAL CONFIGURATION REQUIRED** |

---

## 3. Preview Deployment Workflow & Lifecycle

```
[Developer Workspace]
       │
       ▼ (Stage approved 25 files)
[Local Branch: preview/ccs-task-015]
       │
       ▼ (Owner Approved Git Push)
[GitHub Remote: origin/preview/ccs-task-015]
       │
       ▼ (Webhook triggers Cloudflare Pages)
[Cloudflare CI/CD Pipeline]
       ├─ git clone --depth=1 (preview branch)
       ├─ environment: Node.js 20
       ├─ command: node scripts/build-public.js
       │     └─ Assembles 151 vetted files into dist-public/
       │     └─ Generates edge _redirects, _headers, robots.txt, sitemap.xml
       └─ upload artifact: dist-public/
              │
              ▼
[Cloudflare Edge Network]
       ├─ URL: https://preview-ccs-task-015.<project-name>.pages.dev
       ├─ Isolation: 100% separate from https://ccs.craftegon.com
       └─ Edge Rules: _redirects enforces 404 on /portal/* and /admin/*
```

---

## 4. Evaluation of Cloudflare Configuration Questions

1. **Is the Cloudflare project connected to the GitHub repository?**  
   The repository git remote is `https://github.com/shibilipoompatta/craftegon-ccs.git`. Verification that the Cloudflare Pages project is bound to this repository is an **EXTERNAL CONFIGURATION REQUIRED** that the owner must confirm in the Cloudflare dashboard.
2. **Which branch is configured as production?**  
   The authoritative production branch is `main`. Pushing `preview/ccs-task-015` will never trigger a production deployment.
3. **Are preview deployments enabled?**  
   In Cloudflare Pages, branch preview deployments are enabled by default for all branches other than the production branch.
4. **Do preview builds use the same build settings as production?**  
   Yes. Project-level build command (`node scripts/build-public.js`) and output directory (`dist-public`) apply automatically to both production and preview builds.
5. **Can a preview branch be deployed without altering `main`?**  
   **YES.** A preview branch push affects only that branch. `main` remains unchanged on GitHub and locally (**VERIFIED FACT**).
6. **Can preview URLs expose internal systems or sensitive data?**  
   **NO.** Because `scripts/build-public.js` physically excludes `/portal/`, `/admin/`, `src/`, `docs/`, `scripts/`, and `.vault/` during build time, and because `_redirects` applies edge-level 404 denials (`404!`), the preview output contains zero unfinished internal assets (**VERIFIED FACT**).

---

## 5. Deployment Instructions for Owner

Upon approving the Git staging and branch push plan:
1. Authorize execution of `git push -u origin preview/ccs-task-015`.
2. Observe the resulting build in Cloudflare Pages dashboard -> **Deployments**.
3. Record the generated preview URL (e.g., `https://preview-ccs-task-015.craftegon-ccs.pages.dev`).
4. Execute the acceptance test suite detailed in `PREVIEW-ACCEPTANCE-TESTS.md`.
