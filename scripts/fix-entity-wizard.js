/**
 * Fix entity wizard bugs in index.html:
 * 1. Remove inline onchange="updateEntityWizard()" from all radio inputs
 * 2. Remove duplicate click listener (use only change events)
 * 3. Fix corrupted UTF-8 / mojibake characters in JS strings
 * 4. Fix corrupted chars in HTML static content (badge, price spans, etc.)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');
const original = content;

// ── 1. Remove inline onchange="updateEntityWizard()" from radio inputs ────────
content = content.replace(/\s+onchange="updateEntityWizard\(\)"/g, '');

// ── 2. Fix mojibake sequences in the inline <script> block and static HTML ────
// These are UTF-8 bytes read as Latin-1, then displayed in the source.
// Map: broken sequence -> correct UTF-8 string

const replacements = [
  // Currency: rupee sign ₹
  [/â‚¹/g, '₹'],
  // Em dash –
  [/â€"/g, '\u2013'],
  // Bullet •
  [/â€¢/g, '\u2022'],
  // Right arrow →
  [/â†'/g, '\u2192'],
  // Left arrow ←
  [/â†/g, '\u2190'],
  // Smart quote "
  [/â€œ/g, '\u201C'],
  // Smart quote "
  [/â€\x9D/g, '\u201D'],
  // Ellipsis …
  [/â€¦/g, '\u2026'],
  // Checkmark ✓
  [/âœ"/g, '\u2713'],
  // Rocket emoji 🚀 (ðŸš€)
  [/ðŸš€/g, '🚀'],
  // Target/dart emoji 🎯 (ðŸŽ¯)
  [/ðŸŽ¯/g, '🎯'],
  // Briefcase emoji 💼 (ðŸ'¼)
  [/ðŸ'¼/g, '💼'],
  // Person/silhouette emoji 👤 (ðŸ'¤)
  [/ðŸ'¤/g, '👤'],
  // Seedling/plant emoji 🌱 (ðŸŒ±)
  [/ðŸŒ±/g, '🌱'],
  // Speech bubble emoji 💬 (ðŸ'¬)
  [/ðŸ'¬/g, '💬'],
  // Trophy emoji 🏆
  [/ðŸ†/g, '🏆'],
  // Star emoji ⭐
  [/â­/g, '⭐'],
  // Circular arrow (commonly used)
  [/ðŸ"„/g, '🔄'],
  // Warning sign
  [/â ¡/g, '⚡'],
];

for (const [pattern, replacement] of replacements) {
  content = content.replace(pattern, replacement);
}

// ── 3. Fix duplicate click listener - remove the radio.addEventListener('click'...) ──
// Replace the DOMContentLoaded block that has BOTH change+click listeners
content = content.replace(
  /\/\/ Attach event listeners immediately on load\s*\n\s*document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*\n\s*document\.querySelectorAll\('\.wizard-chip input\[type="radio"\]'\)\.forEach\(function\(radio\) \{\s*\n\s*radio\.addEventListener\('change', updateEntityWizard\);\s*\n\s*radio\.addEventListener\('click', updateEntityWizard\);\s*\n\s*\}\);\s*\n\s*updateEntityWizard\(\);\s*\n\s*\}\);/,
  `// Attach event listeners on DOM ready
      document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.wizard-chip input[type="radio"]').forEach(function(radio) {
          radio.addEventListener('change', updateEntityWizard);
        });
        updateEntityWizard();
      });`
);

// ── 4. Also remove inline onchange from any chip label fallback that may remain ─
// (belt-and-suspenders in case step 1 didn't catch all patterns)
content = content.replace(/\sonchange="updateEntityWizard\(\)"/g, '');

// ── 5. Verify changes ─────────────────────────────────────────────────────────
const removed = (original.match(/onchange="updateEntityWizard\(\)"/g) || []).length;
const remaining = (content.match(/onchange="updateEntityWizard\(\)"/g) || []).length;
const clickRemoved = !content.includes("radio.addEventListener('click', updateEntityWizard)");

console.log(`Inline onchange handlers: ${removed} found, ${remaining} remaining`);
console.log(`Click listener removed: ${clickRemoved}`);
console.log(`Mojibake ₹ fixed: ${!content.includes('â‚¹')}`);
console.log('Mojibake arrow fixed: ' + !content.includes('\u00e2\u0086\u2019'));
console.log(`Mojibake – fixed: ${!content.includes('â€"')}`);
console.log(`Mojibake • fixed: ${!content.includes('â€¢')}`);

if (remaining > 0) {
  console.error('ERROR: Some inline onchange handlers were not removed!');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nindex.html patched successfully.');
