# Production Approval Checklist & Multi-Stage Release Governance

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-015  
**Date:** 2026-11-08  
**Evaluator:** Senior DevOps Engineer & Release Manager  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Multi-Stage Approval Governance Framework

Publishing CraftEgon Corporate Services to production involves two sequential, independent approval gates:

```
[Local Artifact Verified (TASK-014)]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ GATE 1: PREVIEW DEPLOYMENT APPROVAL (CURRENT GATE)     │
│   • Approval to create branch: preview/ccs-task-015   │
│   • Approval to stage exactly 25 approved files       │
│   • Approval to push preview branch to GitHub         │
│   • Production domain remains 100% untouched           │
└────────────────────────────────────────────────────────┘
                 │ (Owner Authorizes & Preview Tests Pass)
                 ▼
[Live Preview Validation (Acceptance Tests on *.pages.dev)]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ GATE 2: PRODUCTION CUTOVER APPROVAL (FUTURE GATE)      │
│   • Owner verifies admin@craftegon.com mailbox receipt│
│   • Owner verifies Cloudflare build settings           │
│   • Explicit separate owner authorization to merge/push│
│     to main and update https://ccs.craftegon.com       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Gate 1: Preview Deployment Approval Matrix (CURRENT)

The following items are presented for immediate owner approval under TASK-015:

| Approval Item | Scope | Action to be Taken Upon Approval |
| :--- | :--- | :--- |
| **Branch Creation** | Local Git | Create isolated branch: `git checkout -b preview/ccs-task-015`. |
| **File Staging** | Local Git | Stage exactly 25 vetted source files (no internal docs, no scratch files). |
| **Local Commit** | Local Git | Commit with message: `build(preview): prepare isolated public website source for TASK-015 Cloudflare preview`. |
| **Preview Push** | Remote GitHub | Push strictly to `origin/preview/ccs-task-015`. `main` is untouched. |
| **Cloudflare Build Trigger** | Cloudflare Pages | Cloudflare CI/CD compiles `dist-public/` and serves ephemeral preview URL. |

---

## 3. Gate 2: Pre-Production Prerequisite Checklist (FUTURE)

Before authorising the final production release to `https://ccs.craftegon.com`, the owner must complete the following items:

- [ ] **Operational Email Receipt:** Send an external test email to `admin@craftegon.com` and confirm receipt in the official inbox (`OWNER CONFIRMATION REQUIRED`).
- [ ] **Cloudflare Pages Output Setting:** Verify that Cloudflare Pages "Build output directory" is set to `dist-public` and NOT left blank or `/` (`EXTERNAL CONFIGURATION REQUIRED`).
- [ ] **Cloudflare Environment Variable:** Verify `NODE_VERSION=20` is set in the Cloudflare Pages project environment (`EXTERNAL CONFIGURATION REQUIRED`).
- [ ] **Preview Acceptance Sign-Off:** Review the live preview deployment URL and confirm that all public pages render correctly and `/portal/*` returns 404.
- [ ] **Final Production Authorization:** Provide explicit written instruction to merge/push to `main`.

---

## 4. Post-Release Smoke Test Plan (Production)

Immediately following any future production cutover:
1. Verify `https://ccs.craftegon.com` renders the approved homepage.
2. Verify `https://ccs.craftegon.com/portal/` returns **HTTP 404**.
3. Verify `https://ccs.craftegon.com/admin/` returns **HTTP 404**.
4. Verify phone link triggers `tel:+918606918247` and WhatsApp triggers `https://wa.me/918606918247`.
5. Check response headers for `X-Frame-Options: DENY` and `CSP`.

---

## 5. Instant Rollback Runbook (Under 60 Seconds)

If any critical anomaly is detected post-deployment:
1. Log into Cloudflare Dashboard -> **Workers & Pages** -> **craftegon-ccs** -> **Deployments**.
2. Find the prior known-good deployment.
3. Click `...` -> **Rollback to this deployment**.
4. Confirm rollback. Cloudflare instantly redirects edge traffic to the previous deployment.
