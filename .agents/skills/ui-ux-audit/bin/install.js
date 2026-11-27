#!/usr/bin/env node
/*
 * Convenience installer for the ui-ux-audit skill.
 *   npx ui-ux-audit-skill            → installs to ~/.claude/skills/ui-ux-audit  (Claude Code, personal)
 *   npx ui-ux-audit-skill --project  → installs to ./.claude/skills/ui-ux-audit  (Claude Code, this repo)
 *   npx ui-ux-audit-skill --dir DIR  → installs to DIR/ui-ux-audit  (any agent that reads a skills/rules folder)
 *
 * This just copies SKILL.md + audit.js into place. For Claude Code you can instead use the
 * native /plugin flow (see README) — this script exists for quick, agent-agnostic setup.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log('Usage: npx ui-ux-audit-skill [--project | --dir <path>]');
  process.exit(0);
}

const src = path.join(__dirname, '..', 'skills', 'ui-ux-audit');
const files = ['SKILL.md', 'audit.js'];

let target;
const dirFlag = argv.indexOf('--dir');
if (dirFlag !== -1 && argv[dirFlag + 1]) {
  target = path.resolve(argv[dirFlag + 1], 'ui-ux-audit');
} else if (argv.includes('--project')) {
  target = path.join(process.cwd(), '.claude', 'skills', 'ui-ux-audit');
} else {
  target = path.join(os.homedir(), '.claude', 'skills', 'ui-ux-audit');
}

try {
  for (const f of files) {
    if (!fs.existsSync(path.join(src, f))) throw new Error(`missing source file: ${f}`);
  }
  fs.mkdirSync(target, { recursive: true });
  for (const f of files) fs.copyFileSync(path.join(src, f), path.join(target, f));
  console.log(`✓ ui-ux-audit installed to ${target}`);
  console.log('  Restart your agent (or run /doctor in Claude Code), then: /ui-ux-audit <url>');
} catch (e) {
  console.error(`✗ install failed: ${e.message}`);
  process.exit(1);
}
