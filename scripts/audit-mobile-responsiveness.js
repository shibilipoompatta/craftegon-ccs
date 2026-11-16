const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Collect all HTML files
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.vault', 'dist', 'dist-public', 'scratch'].includes(file)) {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(ROOT);
console.log(`Inspecting ${htmlFiles.length} HTML files for mobile responsiveness flaws...\n`);

const issues = {
  missingViewport: [],
  badViewport: [],
  fixedPixelWidthContainers: [],
  tablesWithoutScrollWrapper: [],
  unresponsiveGridMinMax: [],
  unresponsiveImages: [],
  inlineFixedFlexBasis: [],
  longUnbrokenWords: [],
  formInputsWithoutBoxSizing: []
};

htmlFiles.forEach(filePath => {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Viewport meta check
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!viewportMatch) {
    issues.missingViewport.push(rel);
  } else {
    const content = viewportMatch[1];
    if (!content.includes('width=device-width') || !content.includes('initial-scale=1')) {
      issues.badViewport.push({ file: rel, content });
    }
  }

  // 2. Fixed pixel widths (> 300px) in inline styles that don't have max-width
  const inlineStyles = html.match(/style=["'][^"']*width:\s*([4-9]\d{2,}|[1-9]\d{3,})px[^"']*["']/gi) || [];
  inlineStyles.forEach(style => {
    if (!style.includes('max-width') && !style.includes('max-width: 100%')) {
      issues.fixedPixelWidthContainers.push({ file: rel, style });
    }
  });

  // 3. Tables without overflow-x auto wrapper
  const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  tableMatches.forEach(table => {
    // Check if table is preceded by an overflow-x: auto wrapper
    const tableIndex = html.indexOf(table);
    const precedingChunk = html.substring(Math.max(0, tableIndex - 250), tableIndex);
    const isWrapped = precedingChunk.includes('overflow-x') || 
                      precedingChunk.includes('table-responsive') || 
                      precedingChunk.includes('data-table-wrapper') ||
                      precedingChunk.includes('if-table-wrapper') ||
                      precedingChunk.includes('admin-table-wrapper') ||
                      precedingChunk.includes('table-scroll-container');
    if (!isWrapped) {
      issues.tablesWithoutScrollWrapper.push({ file: rel, preview: table.substring(0, 100) });
    }
  });

  // 4. CSS Grid with minmax >= 320px
  const gridMatches = html.match(/grid-template-columns:[^;"]*minmax\(\s*([3-9]\d{2,}|[1-9]\d{3,})px/gi) || [];
  gridMatches.forEach(grid => {
    issues.unresponsiveGridMinMax.push({ file: rel, grid });
  });

  // 5. Images with hardcoded width attribute > 300 without responsive style
  const imgMatches = html.match(/<img[^>]*width=["']([3-9]\d{2,}|[1-9]\d{3,})["'][^>]*>/gi) || [];
  imgMatches.forEach(img => {
    if (!img.includes('max-width') && !img.includes('width: 100%') && !img.includes('style=')) {
      issues.unresponsiveImages.push({ file: rel, img: img.substring(0, 80) });
    }
  });
});

console.log('=== MOBILE RESPONSIVENESS AUDIT RESULTS ===');
console.log(`Missing Viewport Meta (${issues.missingViewport.length}):`, issues.missingViewport);
console.log(`Suboptimal Viewport Meta: ${issues.badViewport.length}`);
console.log(`Fixed Pixel Width Elements (>300px without max-width): ${issues.fixedPixelWidthContainers.length}`);
console.log(`Tables Without Scroll Wrapper: ${issues.tablesWithoutScrollWrapper.length}`);
console.log(`Grid minmax >= 320px (causes overflow on small phones): ${issues.unresponsiveGridMinMax.length}`);
console.log(`Unresponsive Fixed Images: ${issues.unresponsiveImages.length}`);

if (issues.fixedPixelWidthContainers.length > 0) {
  console.log('\nSample Fixed Pixel Width Elements:');
  issues.fixedPixelWidthContainers.slice(0, 10).forEach(i => console.log(`  - ${i.file}: ${i.style}`));
}

if (issues.tablesWithoutScrollWrapper.length > 0) {
  console.log('\nSample Tables Without Scroll Wrapper:');
  issues.tablesWithoutScrollWrapper.slice(0, 10).forEach(i => console.log(`  - ${i.file}`));
}

if (issues.unresponsiveGridMinMax.length > 0) {
  console.log('\nSample Grid minmax >= 320px:');
  issues.unresponsiveGridMinMax.slice(0, 10).forEach(i => console.log(`  - ${i.file}: ${i.grid}`));
}
