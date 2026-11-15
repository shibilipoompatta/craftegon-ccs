const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.resolve('.');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9599;
const httpPort = 3533;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(rootDir, reqPath.replace(/^\/+/, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const buf = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/html',
      'Content-Length': buf.length
    });
    res.end(buf);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const list = await httpGet(`http://127.0.0.1:${debugPort}/json/list`);
      if (list && list[0] && list[0].webSocketDebuggerUrl) return list[0].webSocketDebuggerUrl;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chrome WS not available');
}

const testPages = [
  '/',
  '/services.html',
  '/verticals/01-entity-formation.html',
  '/services/pvt-ltd-registration.html',
  '/conversion/calculator.html',
  '/conversion/retainer-desk.html',
  '/contact.html',
  '/about.html'
];

const viewports = [
  { name: 'Large Desktop', w: 1920, h: 1080 },
  { name: 'Standard Desktop', w: 1440, h: 900 },
  { name: 'Small Laptop', w: 1024, h: 768 },
  { name: 'Tablet Portrait', w: 768, h: 1024 },
  { name: 'Large Mobile', w: 430, h: 932, isMobile: true },
  { name: 'Standard Mobile', w: 390, h: 844, isMobile: true },
  { name: 'Small Mobile', w: 360, h: 800, isMobile: true },
  { name: 'Extra Small Mobile', w: 320, h: 568, isMobile: true }
];

server.listen(httpPort, async () => {
  console.log(`Diagnostic server listening on port ${httpPort}`);
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-diag-'));
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tmpProfile}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900'
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new globalThis.WebSocket(wsUrl);
    let id = 1;
    const callbacks = new Map();
    let onLoadFired;

    ws.onmessage = msg => {
      const p = JSON.parse(msg.data);
      if (p.method === 'Page.loadEventFired' && onLoadFired) onLoadFired();
      if (p.id && callbacks.has(p.id)) callbacks.get(p.id)(p.result, p.error);
    };

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      callbacks.set(curId, (res, err) => err ? reject(err) : resolve(res));
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('\n======================================================');
    console.log('CRAFTEGON CCS — FORENSIC CROSS-DEVICE RESPONSIVE AUDIT');
    console.log('======================================================\n');

    let totalOverflows = 0;
    let overflowDetails = [];

    for (const pageUrl of testPages) {
      console.log(`\n--- Auditing: ${pageUrl} ---`);

      for (const vp of viewports) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.w,
          height: vp.h,
          deviceScaleFactor: 1,
          mobile: !!vp.isMobile
        });

        let loadPromise = new Promise(resolve => { onLoadFired = resolve; });
        await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}${pageUrl}` });
        await loadPromise;
        await new Promise(r => setTimeout(r, 350));

        // Evaluate scrollWidth and check against target viewport width
        const evalRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const targetW = ${vp.w};
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              const hasHorizontalScroll = docWidth > targetW + 1;
              
              const overflowingElements = [];
              if (hasHorizontalScroll) {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                  if (el.closest('#mobile-drawer')) continue;
                  const cs = window.getComputedStyle(el);
                  if (cs.position === 'fixed' || cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
                  const rect = el.getBoundingClientRect();
                  if (rect.right > targetW + 1) {
                    let sel = el.tagName.toLowerCase();
                    if (el.id) sel += '#' + el.id;
                    else if (el.className && typeof el.className === 'string') sel += '.' + el.className.trim().split(/\\s+/).join('.');
                    overflowingElements.push({
                      selector: sel.slice(0, 70),
                      right: Math.round(rect.right),
                      overflowBy: Math.round(rect.right - targetW)
                    });
                    if (overflowingElements.length >= 5) break;
                  }
                }
              }

              return {
                targetW,
                docWidth,
                winWidth,
                hasHorizontalScroll,
                overflowingElements
              };
            })()
          `,
          returnByValue: true
        });

        const data = evalRes.result.value;
        if (data.hasHorizontalScroll) {
          totalOverflows++;
          const overflowMsg = `[FAIL] ${pageUrl} @ ${vp.name} (${vp.w}px): docWidth=${data.docWidth}px > target=${vp.w}px (+${data.docWidth - vp.w}px overflow)`;
          console.log(`  ❌ ${overflowMsg}`);
          data.overflowingElements.forEach(item => {
            console.log(`     ↳ Culprit: <${item.selector}> overflows by ${item.overflowBy}px`);
          });
          overflowDetails.push({ pageUrl, vp: vp.name, width: vp.w, culprits: data.overflowingElements });
        } else {
          console.log(`  ✅ [PASS] ${vp.name} (${vp.w}px) — No overflow (docWidth=${data.docWidth}px <= ${vp.w}px)`);
        }
      }
    }

    console.log('\n======================================================');
    console.log(`AUDIT COMPLETE: ${totalOverflows} overflow issues detected across ${testPages.length * viewports.length} page/device combinations.`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    chromeProc.kill();
    server.close();
    process.exit(0);
  }
});
