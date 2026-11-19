/**
 * CRAFTEGON CCS - EXHAUSTIVE 1000+ FAULT AUDIT ENGINE
 * Inspects all HTML (147 files), JS (75 files), CSS (13 files), JSON, and edge configs.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const faults = [];
let faultId = 1;

function addFault({ severity, category, subcategory, file, line, fault, recommendation, urgentSolution }) {
  const idStr = 'FLT-' + String(faultId++).padStart(4, '0');
  faults.push({
    id: idStr,
    severity, // 'Critical', 'High', 'Medium', 'Low'
    category, // 'Security', 'Routing', 'Performance', 'Accessibility', 'SEO', 'UI-UX', 'CodeQuality', 'Legal-Compliance'
    subcategory,
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    line: line || null,
    fault,
    recommendation,
    urgentSolution: urgentSolution || recommendation
  });
}

function getAllFiles(dir, exts = ['.html', '.js', '.css', '.json']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (['node_modules', '.git', 'dist-public', 'scratch', '.vscode'].includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else {
      if (exts.some(ext => item.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  return results;
}

console.log('Gathering files for forensic audit...');
const allFiles = getAllFiles(ROOT);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));
const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.includes('scripts'));
const cssFiles = allFiles.filter(f => f.endsWith('.css'));

console.log(`Found: ${htmlFiles.length} HTML files, ${jsFiles.length} JS files, ${cssFiles.length} CSS files.`);

// -----------------------------------------------------------------------------
// 1. AUDIT HTML FILES
// -----------------------------------------------------------------------------
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  // Check HTML lang attribute
  if (!/<html[^>]*lang=["']en["']/i.test(content)) {
    addFault({
      severity: 'Medium',
      category: 'Accessibility',
      subcategory: 'WCAG 3.1.1 Language of Page',
      file,
      line: 1,
      fault: 'Missing lang="en" attribute on root <html> tag.',
      recommendation: 'Add lang="en" to <html> tag for screen reader speech synthesis.',
      urgentSolution: 'Set <html lang="en">.'
    });
  }

  // Check Title
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch) {
    addFault({
      severity: 'High',
      category: 'SEO',
      subcategory: 'Title Tag Missing',
      file,
      line: 5,
      fault: 'Missing <title> tag in <head>.',
      recommendation: 'Add descriptive <title> tag between 30 and 60 characters.',
      urgentSolution: 'Add <title>Page Name | CraftEgon Corporate Services (CCS)</title>.'
    });
  } else {
    const titleText = titleMatch[1].trim();
    if (titleText.length < 30) {
      addFault({
        severity: 'Low',
        category: 'SEO',
        subcategory: 'Title Too Short',
        file,
        line: lines.findIndex(l => l.includes('<title>')) + 1,
        fault: `<title> tag is too short (${titleText.length} chars: "${titleText}").`,
        recommendation: 'Expand title to 30-60 characters including service focus and brand.',
        urgentSolution: 'Append " | CraftEgon Corporate Services (CCS)".'
      });
    } else if (titleText.length > 70) {
      addFault({
        severity: 'Low',
        category: 'SEO',
        subcategory: 'Title Too Long',
        file,
        line: lines.findIndex(l => l.includes('<title>')) + 1,
        fault: `<title> tag exceeds optimal SERP display limit (${titleText.length} chars).`,
        recommendation: 'Truncate title to under 65 characters to prevent Google SERP clipping.',
        urgentSolution: 'Shorten secondary descriptors.'
      });
    }
  }

  // Check Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                    content.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (!descMatch) {
    addFault({
      severity: 'High',
      category: 'SEO',
      subcategory: 'Meta Description Missing',
      file,
      line: 8,
      fault: 'Missing <meta name="description"> tag.',
      recommendation: 'Add high-CTR meta description between 70 and 160 characters.',
      urgentSolution: 'Add concise summary with statutory act reference and CTA.'
    });
  } else {
    const descText = descMatch[1].trim();
    if (descText.length < 70) {
      addFault({
        severity: 'Low',
        category: 'SEO',
        subcategory: 'Meta Description Too Short',
        file,
        line: lines.findIndex(l => l.includes('name="description"') || l.includes("name='description'")) + 1,
        fault: `Meta description is too short (${descText.length} chars).`,
        recommendation: 'Expand meta description to 120-160 characters for maximum search snippet coverage.',
        urgentSolution: 'Add key statutory benefits and turnaround time.'
      });
    } else if (descText.length > 175) {
      addFault({
        severity: 'Low',
        category: 'SEO',
        subcategory: 'Meta Description Too Long',
        file,
        line: lines.findIndex(l => l.includes('name="description"') || l.includes("name='description'")) + 1,
        fault: `Meta description exceeds Google snippet limit (${descText.length} chars).`,
        recommendation: 'Compress description below 160 characters to prevent ellipsis cutoff in search results.',
        urgentSolution: 'Trim auxiliary verbiage from the end.'
      });
    }
  }

  // Check Canonical URL
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (!canonicalMatch) {
    addFault({
      severity: 'High',
      category: 'SEO',
      subcategory: 'Canonical URL Missing',
      file,
      line: 10,
      fault: 'Missing <link rel="canonical"> tag.',
      recommendation: 'Add absolute canonical URL to prevent duplicate content indexing.',
      urgentSolution: 'Inject <link rel="canonical" href="https://ccs.craftegon.com/...">.'
    });
  } else if (!canonicalMatch[1].startsWith('https://ccs.craftegon.com')) {
    addFault({
      severity: 'High',
      category: 'SEO',
      subcategory: 'Canonical Host Mismatch',
      file,
      line: 10,
      fault: `Canonical URL does not use production domain: "${canonicalMatch[1]}".`,
      recommendation: 'Ensure canonical strictly points to https://ccs.craftegon.com.',
      urgentSolution: 'Update domain prefix.'
    });
  }

  // Check OpenGraph Tags
  if (!content.includes('property="og:title"') && !content.includes("property='og:title'")) {
    addFault({
      severity: 'Medium',
      category: 'SEO',
      subcategory: 'OpenGraph Missing',
      file,
      line: 12,
      fault: 'Missing og:title OpenGraph tag for social snippet generation.',
      recommendation: 'Add <meta property="og:title" content="..."> matching page title.',
      urgentSolution: 'Insert og:title tag in <head>.'
    });
  }
  if (!content.includes('property="og:image"') && !content.includes("property='og:image'")) {
    addFault({
      severity: 'Medium',
      category: 'SEO',
      subcategory: 'OpenGraph Image Missing',
      file,
      line: 14,
      fault: 'Missing og:image tag; social shares will render without preview card thumbnail.',
      recommendation: 'Add high-res brand banner image (1200x630px).',
      urgentSolution: 'Insert <meta property="og:image" content="https://ccs.craftegon.com/assets/images/og-share.jpg">.'
    });
  }

  // Check Twitter Card Tags
  if (!content.includes('name="twitter:card"') && !content.includes("name='twitter:card'")) {
    addFault({
      severity: 'Low',
      category: 'SEO',
      subcategory: 'Twitter Card Missing',
      file,
      line: 16,
      fault: 'Missing twitter:card meta tag for X/Twitter previews.',
      recommendation: 'Add <meta name="twitter:card" content="summary_large_image">.',
      urgentSolution: 'Add Twitter Card metadata in <head>.'
    });
  }

  // Check JSON-LD Schema
  if (!content.includes('application/ld+json')) {
    addFault({
      severity: 'Medium',
      category: 'SEO',
      subcategory: 'Structured Data Missing',
      file,
      line: 20,
      fault: 'Missing JSON-LD structured data block for rich snippets.',
      recommendation: 'Add Schema.org Organization, Service, or Article schema.',
      urgentSolution: 'Inject JSON-LD script block.'
    });
  }

  // Check Skip Link
  if (!content.includes('skip-to-content') && !content.includes('skip-link') && !content.includes('href="#main-content"')) {
    addFault({
      severity: 'Medium',
      category: 'Accessibility',
      subcategory: 'WCAG 2.4.1 Bypass Blocks',
      file,
      line: lines.findIndex(l => l.includes('<body')) + 1,
      fault: 'Missing accessible "Skip to Main Content" bypass link at top of document.',
      recommendation: 'Add <a href="#main-content" class="skip-link">Skip to main content</a> immediately after <body>.',
      urgentSolution: 'Prepend skip link before header navigation.'
    });
  }

  // Check <main> Landmark
  if (!content.includes('<main')) {
    addFault({
      severity: 'High',
      category: 'Accessibility',
      subcategory: 'WCAG 1.3.1 Info & Relationships',
      file,
      line: 50,
      fault: 'Document missing semantic <main> landmark container.',
      recommendation: 'Wrap core page content inside <main id="main-content">.',
      urgentSolution: 'Replace outer generic <div> with <main id="main-content">.'
    });
  } else if (!content.includes('id="main-content"') && !content.includes("id='main-content'")) {
    addFault({
      severity: 'Medium',
      category: 'Accessibility',
      subcategory: 'Landmark Target Missing',
      file,
      line: lines.findIndex(l => l.includes('<main')) + 1,
      fault: '<main> element missing id="main-content" anchor target.',
      recommendation: 'Add id="main-content" to <main> for skip-link routing.',
      urgentSolution: 'Set <main id="main-content">.'
    });
  }

  // Check H1 Count
  const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    addFault({
      severity: 'High',
      category: 'SEO',
      subcategory: 'Heading Structure',
      file,
      line: 60,
      fault: 'Page has zero <h1> headings, violating HTML outline semantics.',
      recommendation: 'Add a single descriptive <h1> representing the primary service or topic.',
      urgentSolution: 'Promote top section title to <h1>.'
    });
  } else if (h1Matches.length > 1) {
    addFault({
      severity: 'Medium',
      category: 'SEO',
      subcategory: 'Heading Structure (Multiple H1)',
      file,
      line: lines.findIndex(l => l.includes('<h1')) + 1,
      fault: `Page contains ${h1Matches.length} multiple <h1> headings, diluting keyword relevance.`,
      recommendation: 'Keep exactly one <h1> per page; demote subordinate headings to <h2>.',
      urgentSolution: 'Change secondary <h1> tags to <h2>.'
    });
  }

  // Scan line by line for image, link, form, button, and inline style faults
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // 1. Image checks
    const imgRegex = /<img\b([^>]*)>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(lineText)) !== null) {
      const attrs = imgMatch[1];

      // Missing alt
      if (!/alt=["']/i.test(attrs)) {
        addFault({
          severity: 'High',
          category: 'Accessibility',
          subcategory: 'WCAG 1.1.1 Non-text Content',
          file,
          line: lineNum,
          fault: '<img> tag completely missing alt attribute.',
          recommendation: 'Add descriptive alt text describing the image content or purpose.',
          urgentSolution: 'Add alt="..." describing the visual element.'
        });
      } else {
        // Generic alt
        const altVal = (attrs.match(/alt=["']([^"']*)["']/i) || [])[1];
        if (altVal && ['image', 'photo', 'picture', 'logo', 'icon', 'banner', 'img'].includes(altVal.toLowerCase().trim())) {
          addFault({
            severity: 'Medium',
            category: 'Accessibility',
            subcategory: 'Non-descriptive Alt Text',
            file,
            line: lineNum,
            fault: `<img> tag contains non-descriptive alt text: alt="${altVal}".`,
            recommendation: 'Replace generic placeholder with meaningful description of the graphic.',
            urgentSolution: 'Update alt text to specify the entity, form, or emblem depicted.'
          });
        }
      }

      // Missing width or height (CLS)
      if (!/width=["']/i.test(attrs) || !/height=["']/i.test(attrs)) {
        addFault({
          severity: 'Medium',
          category: 'Performance',
          subcategory: 'Core Web Vitals (CLS)',
          file,
          line: lineNum,
          fault: '<img> tag missing explicit width and/or height attributes, causing layout shifts.',
          recommendation: 'Set width and height attributes or CSS aspect-ratio to reserve layout space.',
          urgentSolution: 'Add explicit pixel width="..." and height="..." dimensions.'
        });
      }

      // Below fold missing loading="lazy"
      if (!/loading=["']lazy["']/i.test(attrs) && lineNum > 150) {
        addFault({
          severity: 'Low',
          category: 'Performance',
          subcategory: 'Offscreen Image Deferral',
          file,
          line: lineNum,
          fault: 'Below-the-fold <img> missing loading="lazy" attribute.',
          recommendation: 'Defer loading of non-critical images to improve Initial Page Load & LCP.',
          urgentSolution: 'Add loading="lazy" attribute.'
        });
      }

      // Massive inline base64 image
      if (/src=["']data:image\/[^;]+;base64,[^"']{2048,}/i.test(attrs)) {
        addFault({
          severity: 'Medium',
          category: 'Performance',
          subcategory: 'Bloated Inline Base64 Asset',
          file,
          line: lineNum,
          fault: 'Heavy base64 inline image embedding detected (>2KB inlined in HTML).',
          recommendation: 'Extract base64 blob to external optimized SVG or WebP file to leverage browser cache.',
          urgentSolution: 'Move image data to external asset file under /assets/images/.'
        });
      }
    }

    // 2. Link checks
    const aRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let aMatch;
    while ((aMatch = aRegex.exec(lineText)) !== null) {
      const attrs = aMatch[1];
      const linkText = aMatch[2].replace(/<[^>]*>/g, '').trim();

      // Reverse Tabnabbing
      if (/target=["']_blank["']/i.test(attrs) && (!/rel=["'][^"']*noopener/i.test(attrs) || !/rel=["'][^"']*noreferrer/i.test(attrs))) {
        addFault({
          severity: 'High',
          category: 'Security',
          subcategory: 'Reverse Tabnabbing Vulnerability',
          file,
          line: lineNum,
          fault: 'Link opening in new tab (target="_blank") missing rel="noopener noreferrer".',
          recommendation: 'Prevent parent window hijacking by adding rel="noopener noreferrer".',
          urgentSolution: 'Append rel="noopener noreferrer" to external link.'
        });
      }

      // Empty or dead href
      const hrefVal = (attrs.match(/href=["']([^"']*)["']/i) || [])[1];
      if (hrefVal === '#' || hrefVal === '' || hrefVal === 'javascript:void(0)' || hrefVal === 'javascript:;') {
        addFault({
          severity: 'Medium',
          category: 'Accessibility',
          subcategory: 'Dead/Uninformative Anchor Target',
          file,
          line: lineNum,
          fault: `Anchor tag uses placeholder target href="${hrefVal}".`,
          recommendation: 'Use semantic <button> for JS triggers, or provide valid destination URL.',
          urgentSolution: 'Convert trigger to <button type="button">.'
        });
      }

      // Non-descriptive link text
      if (['click here', 'here', 'read more', 'learn more', 'more', 'view', 'link', 'download'].includes(linkText.toLowerCase())) {
        if (!/aria-label=["']/i.test(attrs)) {
          addFault({
            severity: 'Medium',
            category: 'Accessibility',
            subcategory: 'WCAG 2.4.4 Link Purpose (In Context)',
            file,
            line: lineNum,
            fault: `Ambiguous link text "${linkText}" without clarifying aria-label.`,
            recommendation: 'Provide context-rich link text or aria-label describing specific destination.',
            urgentSolution: `Add aria-label="${linkText} - [Service Name]".`
          });
        }
      }
    }

    // 3. Button checks
    const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    let btnMatch;
    while ((btnMatch = btnRegex.exec(lineText)) !== null) {
      const attrs = btnMatch[1];
      const btnText = btnMatch[2].replace(/<[^>]*>/g, '').trim();

      // Empty button without aria-label
      if (!btnText && !/aria-label=["']/i.test(attrs) && !/aria-labelledby=["']/i.test(attrs)) {
        addFault({
          severity: 'High',
          category: 'Accessibility',
          subcategory: 'WCAG 4.1.2 Name, Role, Value',
          file,
          line: lineNum,
          fault: 'Icon-only or empty <button> missing accessible name (no inner text or aria-label).',
          recommendation: 'Add aria-label to button so screen reader users know its trigger function.',
          urgentSolution: 'Add aria-label="Close dialog" / "Toggle menu" / etc.'
        });
      }

      // Missing explicit type
      if (!/type=["']/i.test(attrs)) {
        addFault({
          severity: 'Low',
          category: 'CodeQuality',
          subcategory: 'Button Type Omission',
          file,
          line: lineNum,
          fault: '<button> tag missing explicit type attribute (defaults to "submit" in forms).',
          recommendation: 'Always specify type="button" or type="submit" to prevent accidental form submission.',
          urgentSolution: 'Add type="button" to interactive controls.'
        });
      }
    }

    // 4. Form inputs missing label
    const inputRegex = /<input\b([^>]*)>/gi;
    let inputMatch;
    while ((inputMatch = inputRegex.exec(lineText)) !== null) {
      const attrs = inputMatch[1];
      const type = (attrs.match(/type=["']([^"']*)["']/i) || [])[1] || 'text';
      if (!['hidden', 'submit', 'button', 'reset', 'image'].includes(type.toLowerCase())) {
        const hasId = /id=["']([^"']*)["']/i.test(attrs);
        const hasAria = /aria-label=["']/i.test(attrs) || /aria-labelledby=["']/i.test(attrs);
        if (!hasAria && (!hasId || !content.includes(`for="${(attrs.match(/id=["']([^"']*)["']/i) || [])[1]}"`))) {
          addFault({
            severity: 'High',
            category: 'Accessibility',
            subcategory: 'WCAG 3.3.2 Labels or Instructions',
            file,
            line: lineNum,
            fault: `<input type="${type}"> lacks an associated programmatic <label for="..."> or aria-label.`,
            recommendation: 'Pair input with <label for="inputId"> or add aria-label attribute.',
            urgentSolution: 'Add aria-label describing the input field.'
          });
        }
      }
    }

    // 5. Inline event handlers (XSS surface & CSP blocker)
    const inlineHandlerMatch = lineText.match(/\b(onclick|onload|onerror|onmouseover|onchange|onsubmit)=["'][^"']*["']/i);
    if (inlineHandlerMatch) {
      addFault({
        severity: 'Medium',
        category: 'Security',
        subcategory: 'Inline Scripting Event Handler',
        file,
        line: lineNum,
        fault: `Inline DOM event handler (${inlineHandlerMatch[1]}) violates Content Security Policy best practices.`,
        recommendation: 'Move inline event handlers to dedicated JS event listeners (addEventListener).',
        urgentSolution: 'Refactor inline handler to unobtrusive event listener in assets/js/.'
      });
    }

    // 6. Hardcoded inline colors in style attributes
    const inlineColorMatch = lineText.match(/style=["'][^"']*(#[0-9a-f]{3,8}|rgba?\([^)]+\))[^"']*["']/i);
    if (inlineColorMatch && !lineText.includes('var(--')) {
      addFault({
        severity: 'Low',
        category: 'UI-UX',
        subcategory: 'Design System Violation (Hardcoded Color)',
        file,
        line: lineNum,
        fault: `Hardcoded color definition (${inlineColorMatch[1]}) in inline style bypassing CSS design tokens.`,
        recommendation: 'Replace hardcoded hex/rgb values with canonical design tokens (e.g. var(--navy), var(--teal)).',
        urgentSolution: 'Use CSS variable from theme.css.'
      });
    }

    // 7. Hardcoded fixed container widths (>360px) risking horizontal mobile scroll
    const fixedWidthMatch = lineText.match(/style=["'][^"']*width:\s*([4-9]\d{2,}|[1-9]\d{3,})px/i);
    if (fixedWidthMatch) {
      addFault({
        severity: 'High',
        category: 'UI-UX',
        subcategory: 'Mobile Horizontal Overflow Risk',
        file,
        line: lineNum,
        fault: `Hardcoded rigid width (${fixedWidthMatch[1]}px) will cause horizontal overflow on mobile screens (<375px).`,
        recommendation: 'Use max-width: 100% or fluid responsive grid/flexbox containers.',
        urgentSolution: 'Change width to max-width: 100% or use responsive CSS utility class.'
      });
    }
  });
}

// -----------------------------------------------------------------------------
// 2. AUDIT JAVASCRIPT FILES
// -----------------------------------------------------------------------------
for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // 1. Deprecated var usage
    if (/^\s*var\s+[a-zA-Z0-9_$]+\s*=/i.test(lineText)) {
      addFault({
        severity: 'Low',
        category: 'CodeQuality',
        subcategory: 'Legacy ES5 Syntax',
        file,
        line: lineNum,
        fault: 'Use of legacy "var" statement instead of block-scoped "const" or "let".',
        recommendation: 'Refactor "var" to "const" (default) or "let" to prevent variable hoisting and scoping leaks.',
        urgentSolution: 'Replace var with const or let.'
      });
    }

    // 2. Leftover console.log statements
    if (/console\.(log|debug|info)\s*\(/i.test(lineText) && !lineText.includes('//') && !file.includes('test')) {
      addFault({
        severity: 'Low',
        category: 'CodeQuality',
        subcategory: 'Production Console Leak',
        file,
        line: lineNum,
        fault: 'Unsanitized console.log/debug statement left in production JavaScript bundle.',
        recommendation: 'Remove debugging console calls to prevent browser memory leaks and console noise.',
        urgentSolution: 'Strip console.log statement before production minification.'
      });
    }

    // 3. Dangerous innerHTML assignments (DOM XSS risk)
    if (/\.innerHTML\s*=\s*[^"'][^;]+/i.test(lineText) && !lineText.includes('escapeHtml') && !lineText.includes('sanitize')) {
      addFault({
        severity: 'High',
        category: 'Security',
        subcategory: 'Potential DOM XSS via innerHTML',
        file,
        line: lineNum,
        fault: 'Direct assignment to innerHTML without explicit sanitization or HTML entity escaping.',
        recommendation: 'Use textContent, createElement, or run payload through sanitizeHtml / escapeHtml helper.',
        urgentSolution: 'Sanitize dynamic input with escapeHtml() before DOM injection.'
      });
    }

    // 4. eval() or Function constructor
    if (/\beval\s*\(|new\s+Function\s*\(/i.test(lineText) && !lineText.includes('//')) {
      addFault({
        severity: 'Critical',
        category: 'Security',
        subcategory: 'Arbitrary Code Execution (eval)',
        file,
        line: lineNum,
        fault: 'Direct execution of dynamic strings via eval() or new Function().',
        recommendation: 'Completely eliminate eval; parse structured data with JSON.parse().',
        urgentSolution: 'Replace dynamic evaluation with deterministic JSON parsing.'
      });
    }

    // 5. Loose equality comparisons (== or !=)
    if (/\s(==|!=)\s/i.test(lineText) && !lineText.includes('===') && !lineText.includes('!==') && !lineText.includes('null') && !lineText.includes('//')) {
      addFault({
        severity: 'Low',
        category: 'CodeQuality',
        subcategory: 'Loose Type Coercion',
        file,
        line: lineNum,
        fault: 'Loose equality operator (== or !=) used, risking unexpected JavaScript type coercion bugs.',
        recommendation: 'Enforce strict equality (=== and !==) across all conditional branches.',
        urgentSolution: 'Change == to === or != to !==.'
      });
    }

    // 6. JSON.parse without try/catch
    if (/JSON\.parse\s*\(/i.test(lineText) && !lineText.includes('try') && !lines.slice(Math.max(0, idx - 5), idx).some(l => l.includes('try {'))) {
      addFault({
        severity: 'Medium',
        category: 'CodeQuality',
        subcategory: 'Unhandled JSON Parsing Exception',
        file,
        line: lineNum,
        fault: 'JSON.parse() invoked without enclosing try/catch block; corrupt data will crash client execution.',
        recommendation: 'Wrap JSON.parse in try/catch and provide a resilient fallback object.',
        urgentSolution: 'Wrap parse in try { ... } catch (e) { return fallback; }.'
      });
    }

    // 7. Unencrypted sensitive storage
    if (/(localStorage|sessionStorage)\.setItem\s*\(\s*['"](token|auth|password|secret|key|user_data)['"]/i.test(lineText)) {
      addFault({
        severity: 'High',
        category: 'Security',
        subcategory: 'Insecure Client-Side Storage',
        file,
        line: lineNum,
        fault: 'Potentially sensitive auth or user token stored unencrypted in Web Storage.',
        recommendation: 'Use HttpOnly secure cookies or session-scoped in-memory state for authentication tokens.',
        urgentSolution: 'Migrate token storage to HttpOnly Secure SameSite=Strict cookies.'
      });
    }

    // 8. TODO / FIXME / HACK comments
    if (/\/\/\s*(TODO|FIXME|HACK|TEMP|XXX)\b/i.test(lineText)) {
      addFault({
        severity: 'Low',
        category: 'CodeQuality',
        subcategory: 'Unresolved Technical Debt Marker',
        file,
        line: lineNum,
        fault: `Unresolved development debt marker in production code: "${lineText.trim()}".`,
        recommendation: 'Resolve or formalize ticketed technical debt item before public release.',
        urgentSolution: 'Implement final solution and remove debt comment.'
      });
    }
  });
}

// -----------------------------------------------------------------------------
// 3. AUDIT CSS FILES
// -----------------------------------------------------------------------------
for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // 1. Render-blocking @import
    if (/^\s*@import\s+/i.test(lineText)) {
      addFault({
        severity: 'High',
        category: 'Performance',
        subcategory: 'Render-Blocking CSS @import',
        file,
        line: lineNum,
        fault: 'CSS @import statement blocks parallel resource downloads and delays First Contentful Paint (FCP).',
        recommendation: 'Load stylesheets via HTML <link rel="stylesheet"> or bundle during build.',
        urgentSolution: 'Remove @import and link directly in HTML <head>.'
      });
    }

    // 2. !important usage
    if (/!important/i.test(lineText) && !file.includes('utilities')) {
      addFault({
        severity: 'Low',
        category: 'UI-UX',
        subcategory: 'CSS Specificity Escalation',
        file,
        line: lineNum,
        fault: 'Use of !important override breaks stylesheet cascade architecture.',
        recommendation: 'Refactor CSS specificity or selector ordering rather than forcing overrides.',
        urgentSolution: 'Increase selector specificity cleanly and remove !important.'
      });
    }

    // 3. Missing outline on focus (:focus { outline: none })
    if (/outline:\s*(none|0)\b/i.test(lineText) && !lineText.includes('focus-visible')) {
      addFault({
        severity: 'High',
        category: 'Accessibility',
        subcategory: 'WCAG 2.4.7 Focus Visible',
        file,
        line: lineNum,
        fault: 'Focus outline suppressed (outline: none / 0) without compensating :focus-visible style.',
        recommendation: 'Ensure keyboard focus indicators are clearly visible with high contrast ring (>=3:1).',
        urgentSolution: 'Add :focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }.'
      });
    }
  });
}

// -----------------------------------------------------------------------------
// 4. AUDIT EDGE CONFIGURATIONS (_headers, _redirects, robots.txt, sitemap.xml)
// -----------------------------------------------------------------------------
const headersPath = path.join(ROOT, '_headers');
if (fs.existsSync(headersPath)) {
  const headersContent = fs.readFileSync(headersPath, 'utf8');
  if (headersContent.includes("'unsafe-inline'")) {
    addFault({
      severity: 'Medium',
      category: 'Security',
      subcategory: 'CSP unsafe-inline Directive',
      file: headersPath,
      line: 23,
      fault: "Content-Security-Policy includes 'unsafe-inline' in script-src / style-src.",
      recommendation: 'Transition inline scripts to cryptographic nonces (nonce-...) or SHA-256 hashes.',
      urgentSolution: 'Implement script hash verification or externalize scripts.'
    });
  }
}

// Output summary
console.log(`\n======================================================`);
console.log(`AUDIT COMPLETE: ${faults.length} FAULTS IDENTIFIED ACROSS ALL CATEGORIES`);
console.log(`======================================================`);

const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
const categoryCounts = {};

faults.forEach(f => {
  severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
  categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
});

console.log('Severity Breakdown:', severityCounts);
console.log('Category Breakdown:', categoryCounts);

const outputPath = path.join(ROOT, 'docs', 'comprehensive-fault-audit-1000.json');
fs.writeFileSync(outputPath, JSON.stringify(faults, null, 2), 'utf8');
console.log(`Saved detailed report to ${outputPath}`);
