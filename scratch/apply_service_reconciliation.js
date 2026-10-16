const fs = require('fs');
const path = require('path');

const csvContent = fs.readFileSync('review-output/phase-1-foundations/phase-1-service-ownership-review.csv', 'utf8');
const lines = csvContent.trim().split('\n').slice(1);

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

const verticalDetails = {
  'V01': { href: '/verticals/01-entity-formation.html', label: 'Entity Formation & Structuring' },
  'V02': { href: '/verticals/02-roc-compliance.html', label: 'RoC Annual Compliance' },
  'V03': { href: '/verticals/03-tax-compliance.html', label: 'Corporate Tax & GST' },
  'V04': { href: '/verticals/04-statutory-licenses.html', label: 'Statutory Licenses' },
  'V05': { href: '/verticals/05-contracts-legal.html', label: 'Contracts & Commercial' },
  'V06': { href: '/verticals/06-ipr-protection.html', label: 'IPR & Trademarks' },
  'V07': { href: '/verticals/07-labour-hr.html', label: 'Labour Codes & HR' },
  'V08': { href: '/verticals/08-fundraising-investment.html', label: 'Fundraising & Cap Table' },
  'V09': { href: '/verticals/09-ma-restructuring.html', label: 'M&A & Restructuring' },
  'V10': { href: '/verticals/10-litigation-dispute.html', label: 'Dispute Avoidance (Non-Litigation)' },
  'V11': { href: '/verticals/11-governance-audit.html', label: 'Governance, Audit & Risk' },
  'V12': { href: '/verticals/12-esg-csr.html', label: 'Data Privacy & Tech Law' },
  'V13': { href: '/verticals/13-cross-border-fema.html', label: 'Cross-Border & FEMA' },
  'V14': { href: '/verticals/14-exit-insolvency.html', label: 'Corporate Retainers & Legal Desk' },
  'V15': { href: '/verticals/15-it-digital.html', label: 'IT & Digital Infrastructure' }
};

const rows = [];
for (const line of lines) {
  if (!line.trim()) continue;
  const cols = parseCsvLine(line);
  const [provId, status, route, label, vCode, vName, relCode, relBasis, scope] = cols;
  rows.push({ provId, status, route, label, vCode, vName, relCode, scope });
}

console.log('Processing rows:', rows.length);

let updatedCount = 0;

for (const r of rows) {
  const filePath = r.route.replace(/^\//, '');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  let originalHtml = html;
  
  // 1. Referral-only routes
  if (!r.provId || r.status.includes('EXTERNAL REFERRAL')) {
    // Update breadcrumb to Dispute Avoidance (Non-Litigation)
    html = html.replace(
      /<a href="\/verticals\/10-litigation-dispute\.html">[^<]*<\/a>/g,
      '<a href="/verticals/10-litigation-dispute.html">Dispute Avoidance (Non-Litigation)</a>'
    );
    html = html.replace(
      /"name": "Litigation & Dispute Knowledge"/g,
      '"name": "Dispute Avoidance (Non-Litigation)"'
    );
  } else {
    // 2. Active service routes
    const vInfo = verticalDetails[r.vCode];
    if (vInfo) {
      // Fix breadcrumb link to primary vertical
      // Find breadcrumb <nav class="if-breadcrumb" aria-label="Breadcrumb"> ... </nav>
      const breadcrumbRegex = /(<nav class="if-breadcrumb"[^>]*>[\s\S]*?<a href="\/index\.html">Home<\/a>\s*\/\s*)<a href="[^"]*">([^<]*)<\/a>(\s*\/\s*<span>)/i;
      if (breadcrumbRegex.test(html)) {
        html = html.replace(breadcrumbRegex, `$1<a href="${vInfo.href}">${vInfo.label}</a>$3`);
      }
      
      // Also update schema breadcrumb ListItem position 2 if present
      const schemaBreadcrumbRegex = /({\s*"@type":\s*"ListItem",\s*"position":\s*2,\s*"name":\s*")[^"]*(",\s*"item":\s*")[^"]*("\s*})/g;
      // We only update if item points to a vertical
      html = html.replace(schemaBreadcrumbRegex, (match, p1, p2, p3) => {
        return `${p1}${vInfo.label}${p2}https://ccs.craftegon.com${vInfo.href}${p3}`;
      });
      
      // Inject Service ID badge into if-service-hero if not already present
      if (!html.includes(r.provId)) {
        const heroRegex = /(<div class="if-service-hero">\s*)/i;
        if (heroRegex.test(html)) {
          const badgeHtml = `<span class="noble-badge" style="font-size: 0.72rem; margin-bottom: 0.6rem; display: inline-block;">Service ID: ${r.provId}</span>\n      `;
          html = html.replace(heroRegex, `$1${badgeHtml}`);
        }
      }
    }
  }
  
  if (html !== originalHtml) {
    fs.writeFileSync(filePath, html, 'utf8');
    updatedCount++;
    console.log(`Updated: ${filePath} (ID: ${r.provId || 'REFERRAL'})`);
  }
}

console.log(`Total files updated: ${updatedCount}`);
