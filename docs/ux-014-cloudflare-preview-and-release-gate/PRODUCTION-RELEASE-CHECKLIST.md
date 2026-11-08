# Production Release Checklist & Operational Rollback Runbook

**Project:** CraftEgon Corporate Services (CCS)  
**Task Identifier:** TASK-CCS-UX-014  
**Date:** 2026-11-08  
**Evaluator:** Senior DevOps Engineer & Release Manager  
**Classification Standard:** VERIFIED FACT | REPORT CLAIM | INFERENCE | OWNER CONFIRMATION REQUIRED | EXTERNAL CONFIGURATION REQUIRED | NOT TESTED  

---

## 1. Release Governance & Sign-Off Gate

Production deployment to `https://ccs.craftegon.com` is governed by strict release controls.

### Mandatory Pre-Release Sign-Offs
- [ ] **Technical Lead Sign-Off:** Automated build passes 51/51 assertions; full test suite passes 75/75 suites. (**COMPLETED — TASK-014**)
- [ ] **Security & Disclosure Sign-Off:** Internal `/portal/` and `/admin/` modules excluded from `dist-public/`; zero false legal entity or headquarters claims. (**COMPLETED — TASK-014**)
- [ ] **Owner Operational Email Sign-Off:** Verification that inbound emails sent to `admin@craftegon.com` are received and monitored. (**PENDING OWNER CONFIRMATION**)
- [ ] **Owner Production Release Authorization:** Explicit approval from business owner to deploy to live production. (**PENDING OWNER CONFIRMATION**)

---

## 2. Step-by-Step Production Deployment Workflow

Once the mandatory sign-offs above are secured, execute the following sequential steps:

### Phase 1: Local Verification
```bash
# 1. Clean workspace check
git status

# 2. Build production public artifact
node scripts/build-public.js

# 3. Verify public artifact integrity (must pass 51/51)
node scripts/verify-public-build.js

# 4. Run full test regression (must pass 75/75)
npm test
```

### Phase 2: Git Release Tagging & Push (Owner Authorized)
```bash
# 1. Stage changes
git add .

# 2. Commit verified release state
git commit -m "chore(release): deploy CraftEgon CCS public site v1.0.0 (TASK-014 validated)"

# 3. Create release tag
git tag -a v1.0.0 -m "Production release v1.0.0 with isolated dist-public build"

# 4. Push to remote
git push origin main --tags
```

### Phase 3: Cloudflare Pages Deployment
1. Log into Cloudflare Dashboard -> **Workers & Pages** -> **craftegon-ccs**.
2. Verify **Build configurations**:
   - Build command: `node scripts/build-public.js`
   - Build output directory: `dist-public` (**CRITICAL: DO NOT LEAVE BLANK**)
   - Environment variables: `NODE_VERSION=20`
3. Trigger deployment from `main` branch.
4. Monitor build logs to ensure `dist-public/` compilation succeeds and deployment succeeds.

---

## 3. Post-Deployment Production Smoke Tests

Immediately upon completion of the Cloudflare production deployment, execute the following smoke tests against `https://ccs.craftegon.com`:

### 3.1 Public Page Availability
- [ ] `https://ccs.craftegon.com/` returns HTTP 200 with complete CSS styling.
- [ ] `https://ccs.craftegon.com/services.html` (and `/services`) loads service catalog.
- [ ] `https://ccs.craftegon.com/about.html` renders about page.
- [ ] `https://ccs.craftegon.com/contact.html` renders contact form and desk details.
- [ ] `https://ccs.craftegon.com/conversion/calculator.html` computes fees accurately.

### 3.2 Security & Isolation Verification (Critical Gate)
- [ ] `https://ccs.craftegon.com/portal/` returns **HTTP 404 Not Found**.
- [ ] `https://ccs.craftegon.com/portal/dashboard.html` returns **HTTP 404 Not Found**.
- [ ] `https://ccs.craftegon.com/admin/` returns **HTTP 404 Not Found**.
- [ ] `https://ccs.craftegon.com/admin/index.html` returns **HTTP 404 Not Found**.
- [ ] Inspect response headers via `curl -I https://ccs.craftegon.com/`:
  - `X-Frame-Options: DENY` is present.
  - `X-Content-Type-Options: nosniff` is present.
  - `Content-Security-Policy` is present.

### 3.3 Contact & Enquiry Flow Verification
- [ ] Submit a test enquiry via `contact.html` with valid inputs; verify confirmation notice.
- [ ] Verify phone link triggers `tel:+918606918247`.
- [ ] Verify WhatsApp link opens `https://wa.me/918606918247`.

---

## 4. Emergency Rollback Runbook

If any critical defect or unintended exposure is detected in production:

### Instant Cloudflare Rollback (Under 60 Seconds)
1. Navigate to Cloudflare Dashboard -> **Workers & Pages** -> **craftegon-ccs** -> **Deployments**.
2. Locate the previous known-good deployment (or initial placeholder deployment).
3. Click the three dots menu `(...)` next to that deployment and select **Rollback to this deployment**.
4. Confirm rollback. Cloudflare edge points instantly to the prior deployment without triggering a new build.

### Git Rollback (If needed)
```bash
# Revert the release commit
git revert HEAD --no-edit
git push origin main
```
