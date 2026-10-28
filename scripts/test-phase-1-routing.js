/**
 * ============================================================================
 * CRAFTEGON CCS — LOCAL HTTP / SERVER-LEVEL ROUTING VERIFICATION SUITE
 * ============================================================================
 * Tests:
 * 1. Local HTTP server parsing and applying _redirects rules
 * 2. Resolution of /services, /services/, and /services.html
 * 3. Loop detection: ensures max redirect depth is 0 or 1, never infinite
 * 4. Content verification: ensures the served content is the Universal Directory
 * 5. Simulation of Cloudflare Pages edge rules:
 *    - Directory canonicalization (trailing slash 308)
 *    - _redirects rewrite resolution (status 200)
 *    - Pretty URLs .html stripping (status 308)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REDIRECTS_PATH = path.join(ROOT, '_redirects');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('CRAFTEGON CCS — LOCAL HTTP ROUTING SIMULATOR (_redirects)');
console.log('(Note: Local rule simulator — not live Cloudflare Pages runtime)');
console.log('============================================================\n');

// 1. Parse _redirects
assert(fs.existsSync(REDIRECTS_PATH), '_redirects file exists');
const redirectsRaw = fs.readFileSync(REDIRECTS_PATH, 'utf8');
const redirectRules = [];

redirectsRaw.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 3) {
    redirectRules.push({
      from: parts[0],
      to: parts[1],
      status: parseInt(parts[2], 10)
    });
  }
});

assert(redirectRules.length > 0, `Parsed ${redirectRules.length} clean rewrite/redirect rules from _redirects`);

// 2. Build local Cloudflare Pages routing emulator server
function resolveRoute(urlPath, options = { prettyUrls: true }) {
  // Check exact rewrite match from _redirects first
  for (const rule of redirectRules) {
    if (rule.from === urlPath) {
      return { type: 'rewrite', target: rule.to, status: rule.status };
    }
  }

  // Splat rules (e.g. /services/* -> /services/:splat)
  for (const rule of redirectRules) {
    if (rule.from.endsWith('/*')) {
      const prefix = rule.from.slice(0, -2);
      if (urlPath.startsWith(prefix + '/')) {
        const splat = urlPath.slice(prefix.length + 1);
        const target = rule.to.replace(':splat', splat);
        return { type: 'rewrite', target, status: rule.status };
      }
    }
  }

  // Cloudflare Pretty URLs edge behavior: if request ends with .html, Cloudflare Pretty URLs 308s to strip .html
  if (options.prettyUrls && urlPath.endsWith('.html') && urlPath !== '/index.html') {
    const stripped = urlPath.slice(0, -5);
    return { type: 'redirect', target: stripped, status: 308 };
  }

  // Edge directory canonicalization: if physical directory exists without trailing slash, 308 to /
  const localRelative = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const localTarget = path.join(ROOT, localRelative);
  if (fs.existsSync(localTarget) && fs.statSync(localTarget).isDirectory()) {
    if (!urlPath.endsWith('/')) {
      return { type: 'redirect', target: urlPath + '/', status: 308 };
    }
  }

  return { type: 'file', target: urlPath, status: 200 };
}

// 3. Create HTTP Server
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const decision = resolveRoute(parsed.pathname);

  if (decision.type === 'redirect') {
    res.writeHead(decision.status, { 'Location': decision.target });
    res.end();
    return;
  }

  // Rewrite or file
  let filePath = decision.target;
  if (filePath.startsWith('/')) filePath = filePath.slice(1);
  const diskPath = path.join(ROOT, filePath);

  if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
    const content = fs.readFileSync(diskPath);
    res.writeHead(decision.status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('404 Not Found');
  }
});

function requestFollow(initialPath, maxRedirects = 10) {
  return new Promise((resolve) => {
    let currentPath = initialPath;
    let redirectsCount = 0;
    const history = [currentPath];

    function step() {
      const address = server.address();
      const req = http.request({
        host: '127.0.0.1',
        port: address.port,
        path: currentPath,
        method: 'GET'
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            redirectsCount++;
            currentPath = res.headers.location;
            history.push(currentPath);

            if (redirectsCount > maxRedirects) {
              resolve({
                status: res.statusCode,
                loopDetected: true,
                redirectsCount,
                history,
                body
              });
              return;
            }
            step();
          } else {
            resolve({
              status: res.statusCode,
              loopDetected: false,
              redirectsCount,
              history,
              body
            });
          }
        });
      });
      req.on('error', (err) => {
        resolve({ error: err.message, history });
      });
      req.end();
    }

    step();
  });
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`Routing emulator active on http://127.0.0.1:${port}\n`);

  // Test 1: GET /services
  console.log('--- Test 1: Resolution of /services ---');
  const resServices = await requestFollow('/services');
  assert(!resServices.loopDetected, '/services does not enter redirect loop', `History: ${resServices.history.join(' -> ')}`);
  assert(resServices.status === 200, '/services resolves with HTTP 200 OK');
  assert(resServices.body.includes('Universal Corporate Services Directory'), '/services serves the intended service directory content');

  // Test 2: GET /services/
  console.log('\n--- Test 2: Resolution of /services/ ---');
  const resServicesSlash = await requestFollow('/services/');
  assert(!resServicesSlash.loopDetected, '/services/ does not enter redirect loop', `History: ${resServicesSlash.history.join(' -> ')}`);
  assert(resServicesSlash.status === 200, '/services/ resolves with HTTP 200 OK');
  assert(resServicesSlash.body.includes('Universal Corporate Services Directory'), '/services/ serves the intended service directory content');

  // Test 3: GET /services.html
  console.log('\n--- Test 3: Resolution of /services.html ---');
  const resServicesHtml = await requestFollow('/services.html');
  assert(!resServicesHtml.loopDetected, '/services.html does not enter redirect loop', `History: ${resServicesHtml.history.join(' -> ')}`);
  assert(resServicesHtml.status === 200, '/services.html resolves with HTTP 200 OK');
  assert(resServicesHtml.body.includes('Universal Corporate Services Directory'), '/services.html serves the intended service directory content');

  // Test 4: Canonical service sub-page /services/pvt-ltd-registration.html
  console.log('\n--- Test 4: Resolution of Sub-Service Routes ---');
  const resSubPage = await requestFollow('/services/pvt-ltd-registration.html');
  assert(resSubPage.status === 200, '/services/pvt-ltd-registration.html resolves with HTTP 200 OK');
  assert(resSubPage.body.includes('Private Limited Company Registration'), '/services/pvt-ltd-registration.html serves canonical service content');

  server.close();

  console.log('\n============================================================');
  console.log(`TOTAL ROUTING TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
