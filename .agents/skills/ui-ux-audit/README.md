# UI/UX Audit — a skill for AI coding agents

> Point an AI agent at any website and get back a prioritized, fixable UI/UX report — misalignments, low contrast, tiny tap targets, off-grid spacing, janky motion, broken responsive layout — each finding tied to a **location**, the **design principle it breaks**, and a **concrete numeric fix**.

Ship a site, run the audit, get a punch-list. It works on **hosted sites** (`https://yourapp.com`) and **local dev servers** (`http://localhost:3000`, `file://…`) alike, so you can catch problems before or after you deploy.

Every threshold in this skill is sourced from primary references — **WCAG 2.2, Nielsen Norman Group, Material Design, web.dev** — not opinion. Rules that failed verification (e.g. a fixed header:body type ratio) are deliberately **excluded**.

---

## Table of contents

- [What it does](#what-it-does)
- [What it checks](#what-it-checks)
- [Example report](#example-report)
- [Install](#install)
  - [Claude Code — `/plugin` (recommended)](#a-claude-code--plugin-recommended)
  - [Claude Code — manual](#b-claude-code--manual)
  - [npm / npx](#c-npm--npx-any-agent-with-a-skills-folder)
  - [OpenAI Codex CLI, Cursor, Windsurf, Cline, Aider & other agents](#d-other-agents--codex-cli-cursor-windsurf-cline-aider)
  - [Standalone — no agent, just a browser](#e-standalone--no-agent-just-a-browser)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Sources](#sources)
- [License](#license)

---

## What it does

Given a URL, the skill:

1. **Drives a real browser** to the page at **desktop (1440×900)** and **mobile (390×844)** viewports.
2. **Screenshots every section**, scrolling top-to-bottom so lazy content mounts.
3. **Injects a measurement script** (`audit.js`) into the live page to measure the things eyes miss — contrast ratios, tap-target pixels, spacing off the 8pt grid, edges 1–6px out of alignment, layout-triggering animations, missing focus/reduced-motion handling, horizontal overflow, and style sprawl.
4. **Judges the rest from the screenshots** — visual hierarchy, whitespace/crowding, CTA prominence, consistency across sections, "cheap-looking" tells, empty/error states, and flow.
5. **Emits a prioritized report** — `🔴 Blocker / 🟠 Major / 🟡 Minor`, each with a location, the violated principle (with the measured number), and a specific fix.

It's two portable pieces: a **Markdown playbook** (`SKILL.md`) any agent can follow, and a **self-contained browser script** (`audit.js`) that runs in any Chromium context — via a browser-automation tool or pasted straight into DevTools.

---

## What it checks

### Measured (hard numbers from `audit.js`)

| Check | Rule | Threshold | Source |
|---|---|---|---|
| **Text contrast** | text vs its background | ≥ **4.5:1**; large text (≥24px / ≥18.66px bold) ≥ **3:1** | WCAG 2.2 §1.4.3 |
| **Tap targets** | links, buttons, inputs | ≥ **24×24px** (AA); ≥ **44×44px** mobile/AAA | WCAG 2.2 §2.5.8 / §2.5.5 |
| **Spacing grid** | padding, margins, gaps | multiples of **8** (4 tolerated); flags off-grid values | Material 8dp grid |
| **Misalignment** | sibling edges vs a shared line | edges **1–6px** off = a near-miss defect | alignment = perceived order |
| **Animation perf** | transitions / animations | animate **only `transform`/`opacity`**; width/height/top/left/margin trigger layout jank (<60fps) | web.dev, MDN |
| **Easing** | non-trivial motion | not `linear`; enter decelerates, exit accelerates | Material M3 |
| **Focus** | `:focus { outline:none }` | must pair with a visible `:focus-visible` | WCAG 2.2 §2.4.7 |
| **Reduced motion** | page has motion | should ship `@media (prefers-reduced-motion)` | WCAG 2.2 §2.3.3 |
| **Overflow** | horizontal scroll | `scrollWidth > innerWidth` = broken responsive | — |
| **Consistency** | distinct fonts/sizes/colors/radii/shadows | flags sprawl (>3 fonts, >12 sizes, >10 colors…) | consistency heuristic |
| **Images** | rendered vs natural size, `alt` | >1.35× natural = blurry upscale; missing `alt` = a11y gap | — |

### Judged (from the screenshots)

Visual hierarchy · whitespace & crowding · one clear primary CTA · consistency across sections · cheap-looking tells (muddy gradients, harsh shadows, stretched images, too many fonts) · empty / loading / error states · form design (single-column, labels above fields, multi-cue errors) · overall flow (Nielsen's heuristics as a lens).

### Deliberately NOT enforced

Rules that were tested and **refuted** during research are excluded so the audit doesn't invent fake problems: no fixed header:body type ratio, no device-scaled animation durations, and the `internal ≤ external` spacing rule is treated as guidance, not a hard check.

---

## Example report

```
# UI/UX Audit — https://example.com
Verdict: Solid structure, let down by contrast + a mobile overflow. 2 blocker · 3 major · 4 minor.

## 🔴 Blockers
- Hero CTA "Get started" — text contrast 2.9:1 on the gradient (WCAG AA needs 4.5:1).
  fix: darken button bg to #1A56DB (→ 5.1:1) or set text to #FFFFFF.
- Mobile (390px): content overflows 34px → horizontal scroll.
  fix: `.pricing table` has a fixed 420px width; set `max-width:100%; overflow-x:auto`.

## 🟠 Major
- Feature cards misaligned: card 3's left edge is 5px off the shared 96px grid line.
  fix: remove the stray `margin-left:5px` on `.card:nth-child(3)`.
- Signup form is two columns on desktop.
  fix: single-column, one field per row (NN/g: ~78% vs 42% first-try success).

## 🟡 Minor
- Spacing uses off-grid 13px / 27px / 5px (rest of the page is on an 8pt grid).
  fix: round to 16 / 24 / 8.
- Card hover animates `width` (triggers layout). fix: animate `transform: scale()`, ~150ms ease-out.
```

---

## Install

Pick the path that matches your agent. The skill is the same either way — a `SKILL.md` playbook plus `audit.js`.

### A. Claude Code — `/plugin` (recommended)

Add this repo as a marketplace, then install the plugin:

```
/plugin marketplace add imYChaudhary22/ui-ux-audit
/plugin install ui-ux-audit@ui-ux-audit
```

Verify and use:

```
/plugin list          # confirm it's enabled
/ui-ux-audit https://yourapp.com
```

> `imYChaudhary22/ui-ux-audit` is the GitHub repo; `ui-ux-audit@ui-ux-audit` is `plugin-name@marketplace-name` (both happen to be `ui-ux-audit`). Update later with `/plugin marketplace update ui-ux-audit`.

### B. Claude Code — manual

No plugin system needed — skills auto-load from a folder:

```bash
# Personal (all projects):
git clone https://github.com/imYChaudhary22/ui-ux-audit.git
mkdir -p ~/.claude/skills
cp -r ui-ux-audit/skills/ui-ux-audit ~/.claude/skills/

# — or project-scoped (this repo only):
cp -r ui-ux-audit/skills/ui-ux-audit .claude/skills/
```

Restart Claude Code (or run `/doctor`), then `/ui-ux-audit <url>`.

### C. npm / npx (any agent with a skills folder)

**Quick install with the bundled copier** — works straight from GitHub, no publish required:

```bash
npx github:imYChaudhary22/ui-ux-audit              # → ~/.claude/skills/ui-ux-audit
npx github:imYChaudhary22/ui-ux-audit --project    # → ./.claude/skills/ui-ux-audit
npx github:imYChaudhary22/ui-ux-audit --dir <path> # → <path>/ui-ux-audit  (point at any agent's rules/skills dir)
```

**Once published to npm** (maintainer runs `npm publish`):

```bash
npx ui-ux-audit-skill            # personal
npx ui-ux-audit-skill --project  # this repo
```

**As a Claude Code plugin sourced from npm** — a marketplace can reference the npm package directly (see [Claude Code plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)):

```jsonc
// in some marketplace.json
{ "name": "ui-ux-audit",
  "source": { "source": "npm", "package": "ui-ux-audit-skill", "version": "^1.0.0" } }
```

> Note: there is no official npm command that auto-installs into `~/.claude/skills`. The `npx …` copier above is a convenience; the *native* Claude Code paths are **A** and **B**.

### D. Other agents — Codex CLI, Cursor, Windsurf, Cline, Aider

These agents don't share Claude Code's skill format, but the audit is portable: **give the agent `SKILL.md` as instructions, and let it run `audit.js` with whatever browser tooling it has** (a Playwright/Browser MCP server, or DevTools). Concrete wiring:

| Agent | How to load the playbook |
|---|---|
| **OpenAI Codex CLI** | Append `skills/ui-ux-audit/SKILL.md` into your `AGENTS.md` (repo root or `~/.codex/`), or paste it as a prompt. Give Codex a browser MCP (e.g. Playwright MCP) to drive the page. |
| **Cursor** | Save `SKILL.md` as `.cursor/rules/ui-ux-audit.mdc`. Use Cursor's browser tools or a Playwright MCP to run `audit.js`. |
| **Windsurf** | Add `SKILL.md` to `.windsurf/rules/`. Drive the page with a Browser MCP server. |
| **Cline / Roo Code** | Point a custom instruction / `.clinerules` at `SKILL.md`; attach a Playwright/Browser MCP. |
| **Aider** | Add `SKILL.md` to the chat context (`/read SKILL.md`); run `audit.js` yourself in DevTools and paste the JSON + screenshots. |
| **Any MCP-capable agent** | Wire up a browser-automation MCP (Playwright, Puppeteer, or Chrome), then feed it `SKILL.md` + `audit.js`. |

The only hard requirements are: (1) the agent can read the playbook, and (2) *something* can run `audit.js` in a Chromium page and hand back the JSON + screenshots. That "something" can be an MCP browser tool or you, manually (path **E**).

### E. Standalone — no agent, just a browser

You don't need an AI agent to get the measurements:

1. Open your site in Chrome (hosted **or** `localhost`).
2. Open DevTools → Console.
3. Paste the entire contents of [`skills/ui-ux-audit/audit.js`](skills/ui-ux-audit/audit.js) and press Enter.
4. You get a JSON blob: contrast fails, tiny tap targets, off-grid spacing, misalignments, and more — with a `where` locator for each.

Run it once at a desktop width and once with the device toolbar set to a phone. Hand the JSON to any LLM with `SKILL.md` for a written, prioritized report.

---

## Usage

```
/ui-ux-audit <url>                 # full audit: desktop + mobile
/ui-ux-audit <url> --desktop-only  # skip mobile
/ui-ux-audit <url> --mobile-only   # mobile only
/ui-ux-audit <url> --full          # also add tablet (768) + record a motion GIF of one interaction
/ui-ux-audit <url> --out <dir>     # where to save screenshots (default: /tmp/ui-ux-audit)
```

Auditing something behind a login? Sign in first in the browser the agent controls, then run the audit against the authenticated page.

---

## How it works

```
URL ─┬─ desktop 1440×900 ─┐
     └─ mobile  390×844  ─┤
                          ├─ screenshot every section  ─────────► judged findings (hierarchy, polish, flow)
                          └─ inject audit.js ─► JSON metrics ────► measured findings (contrast, px, grid…)
                                                                          │
                                                     merge · dedupe · rank by severity
                                                                          ▼
                                          🔴 Blocker · 🟠 Major · 🟡 Minor  report with fixes
```

`audit.js` is defensive by design: every check is sandboxed, so one failure (e.g. a cross-origin stylesheet it can't read) never aborts the run — it just notes the gap and continues.

---

## Sources

Thresholds are drawn from primary references and were fact-checked before inclusion:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — contrast (§1.4.3), non-text contrast (§1.4.11), target size (§2.5.8 / §2.5.5), use of color (§1.4.1), focus visible (§2.4.7)
- [NN/g — Website Forms Usability](https://www.nngroup.com/articles/web-form-design/)
- [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [NN/g — Animation Duration](https://www.nngroup.com/articles/animation-duration/)
- [Material Design 3 — Motion](https://m3.material.io/styles/motion/easing-and-duration)
- [web.dev — Animations and performance](https://web.dev/articles/animations-and-performance)
- Material 8dp grid / Android density buckets

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
