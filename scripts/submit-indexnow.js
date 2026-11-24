/**
 * CRAFTEGON CORPORATE SERVICES (CCS) - INDEXNOW SUBMISSION UTILITY
 * Submits canonical URLs to the IndexNow protocol (Microsoft Bing, Yandex, Seznam, Naver)
 * for immediate crawl queue ingestion.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'ccs.craftegon.com';
const KEY = 'c7a4e8d21b9f4056a2e8c1d3f5b709a2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('Error: sitemap.xml not found at', SITEMAP_PATH);
  process.exit(1);
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urls = [...sitemapContent.matchAll(/<loc>(https:\/\/ccs\.craftegon\.com\/[^<]*)<\/loc>/g)]
  .map(m => m[1])
  .filter(u => !u.includes('/admin/') && !u.includes('/portal/'));

// Ensure homepage is present
if (!urls.includes(`https://${HOST}/`)) {
  urls.unshift(`https://${HOST}/`);
}

console.log(`[IndexNow] Extracted ${urls.length} canonical URLs for submission to Bing & IndexNow.`);

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`[IndexNow] Response Status: ${res.statusCode} (${res.statusMessage})`);
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('✅ [IndexNow] URLs submitted successfully to Bing & IndexNow network!');
    } else {
      console.log('[IndexNow] Response body:', body || '(empty)');
      console.log('ℹ️ Note: If key verification is pending edge deployment, re-run after push.');
    }
  });
});

req.on('error', (err) => {
  console.error('[IndexNow] Request failed:', err.message);
});

req.write(payload);
req.end();
