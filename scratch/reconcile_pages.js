const fs = require('fs');
const path = require('path');

const csvContent = fs.readFileSync('review-output/phase-1-foundations/phase-1-service-ownership-review.csv', 'utf8');
const lines = csvContent.trim().split('\n').slice(1);

const verticalFileMap = {
  'V01': '/verticals/01-entity-formation.html',
  'V02': '/verticals/02-roc-compliance.html',
  'V03': '/verticals/03-tax-compliance.html',
  'V04': '/verticals/04-statutory-licenses.html',
  'V05': '/verticals/05-contracts-legal.html',
  'V06': '/verticals/06-ipr-protection.html',
  'V07': '/verticals/07-labour-hr.html',
  'V08': '/verticals/08-fundraising-investment.html',
  'V09': '/verticals/09-ma-restructuring.html',
  'V10': '/verticals/10-litigation-dispute.html',
  'V11': '/verticals/11-governance-audit.html',
  'V12': '/verticals/12-esg-csr.html',
  'V13': '/verticals/13-cross-border-fema.html',
  'V14': '/verticals/14-exit-insolvency.html',
  'V15': '/verticals/15-it-digital.html'
};

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const rows = [];
for (const line of lines) {
  if (!line.trim()) continue;
  const cols = parseCsvLine(line);
  const [provId, status, route, label, vCode, vName] = cols;
  rows.push({ provId, status, route, label, vCode, vName });
}

console.log('Total parsed rows:', rows.length);

const results = [];
for (const r of rows) {
  const relPath = r.route.replace(/^\//, '');
  if (!fs.existsSync(relPath)) {
    results.push({ route: r.route, error: 'File does not exist' });
    continue;
  }
  const content = fs.readFileSync(relPath, 'utf8');
  const hasProvId = r.provId ? content.includes(r.provId) : false;
  const expectedVerticalHref = r.vCode ? verticalFileMap[r.vCode] : null;
  const breadcrumbMatch = content.match(/<nav class="if-breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
  const breadcrumb = breadcrumbMatch ? breadcrumbMatch[1] : '';
  const breadcrumbHref = (breadcrumb.match(/href="([^"]+)"/g) || []).map(h => h.replace(/href="|"$/g, ''));
  const hasExpectedVerticalInBreadcrumb = expectedVerticalHref ? breadcrumb.includes(expectedVerticalHref) : true;
  
  results.push({
    route: r.route,
    provId: r.provId,
    vCode: r.vCode,
    hasProvId,
    expectedVerticalHref,
    breadcrumbHref,
    hasExpectedVerticalInBreadcrumb
  });
}

const missingIds = results.filter(r => r.provId && !r.hasProvId);
const breadcrumbMismatches = results.filter(r => r.expectedVerticalHref && !r.hasExpectedVerticalInBreadcrumb);
console.log('Missing IDs count:', missingIds.length);
if (missingIds.length > 0) {
  console.log('Missing IDs:', JSON.stringify(missingIds, null, 2));
}

console.log('Breadcrumb Mismatches count:', breadcrumbMismatches.length);
if (breadcrumbMismatches.length > 0) {
  console.log('Breadcrumb Mismatches:', JSON.stringify(breadcrumbMismatches, null, 2));
}
