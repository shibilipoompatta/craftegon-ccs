const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.resolve('.');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9598;
const httpPort = 3535;

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
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-strike-off-'));
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
      callbacks.set(curId, (res, err) => {
        if (err) reject(err);
        else resolve(res);
      });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('\n--- 1. Testing Horizontal Overflow Across All 8 Viewports ---');
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: !!vp.isMobile
      });

      const loadPromise = new Promise(r => onLoadFired = r);
      await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/conversion/strike-off-checker.html` });
      await loadPromise;
      await new Promise(r => setTimeout(r, 400));

      const overflowEval = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            let overflowEl = null;
            if (scrollWidth > docWidth) {
              const all = document.querySelectorAll('*');
              for (const el of all) {
                const r = el.getBoundingClientRect();
                if (r.right > docWidth + 1) {
                  overflowEl = { tag: el.tagName, id: el.id, class: el.className, right: r.right, docWidth };
                  break;
                }
              }
            }
            return { docWidth, scrollWidth, overflow: scrollWidth > docWidth, overflowEl };
          })()
        `,
        returnByValue: true
      });

      const res = overflowEval.result.value;
      if (res.overflow) {
        console.error(`  ❌ OVERFLOW on ${vp.name} (${vp.w}px): scrollWidth=${res.scrollWidth}, clientWidth=${res.docWidth}`, res.overflowEl);
      } else {
        console.log(`  ✅ PASS: ${vp.name} (${vp.w}px) — 0 overflow (clientWidth=${res.docWidth}, scrollWidth=${res.scrollWidth})`);
      }
    }

    console.log('\n--- 2. Testing Interactive Controls & Diagnostic Engine ---');
    // Set desktop viewport for interactive test
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const loadPromise = new Promise(r => onLoadFired = r);
    await send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/conversion/strike-off-checker.html` });
    await loadPromise;
    await new Promise(r => setTimeout(r, 400));

    // Test Demo Fill Button
    const demoTest = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('demo-fill-btn');
          if (btn) btn.click();
          const card = document.getElementById('verified-entity-card');
          const cinInput = document.getElementById('so-cin-input');
          const nameInput = document.getElementById('so-entity-name-input');
          return {
            clicked: !!btn,
            cardVisible: card ? window.getComputedStyle(card).display !== 'none' : false,
            cin: cinInput ? cinInput.value : '',
            name: nameInput ? nameInput.value : ''
          };
        })()
      `,
      returnByValue: true
    });
    console.log('  Demo fill test:', demoTest.result.value);

    // Test Segmented Switches: switch ops to 'yes'
    const switchTest1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const yesOpsBtn = document.getElementById('ops-opt-yes');
          if (yesOpsBtn) yesOpsBtn.click();
          const badge = document.getElementById('strike-score-badge');
          const blockers = document.getElementById('strike-blockers-container');
          return {
            score: badge ? badge.textContent : '',
            blockersVisible: blockers ? window.getComputedStyle(blockers).display !== 'none' : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('  Pillar 1 switch to Active Ops (expect 75%):', switchTest1.result.value);

    // Switch liabilities to 'yes' (expect 50%)
    const switchTest2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const yesLiabBtn = document.getElementById('liab-opt-yes');
          if (yesLiabBtn) yesLiabBtn.click();
          const badge = document.getElementById('strike-score-badge');
          return {
            score: badge ? badge.textContent : ''
          };
        })()
      `,
      returnByValue: true
    });
    console.log('  Pillar 2 switch to Open Dues (expect 50%):', switchTest2.result.value);

    // Switch both back to eligible
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.getElementById('ops-opt-no').click();
          document.getElementById('liab-opt-no').click();
        })()
      `
    });

    // Capture desktop screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const artifactPath = path.join(
      'C:\\Users\\shibi\\.gemini\\antigravity\\brain\\1acf7afd-9935-40c0-b541-16571d62db3c',
      'strike-off-checker-upgraded-desktop.png'
    );
    fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
    console.log(`  📸 Desktop screenshot saved to ${artifactPath}`);

    // Set mobile viewport and capture mobile screenshot
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 400));
    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    const mobileArtifactPath = path.join(
      'C:\\Users\\shibi\\.gemini\\antigravity\\brain\\1acf7afd-9935-40c0-b541-16571d62db3c',
      'strike-off-checker-upgraded-mobile.png'
    );
    fs.writeFileSync(mobileArtifactPath, Buffer.from(mobileShot.data, 'base64'));
    console.log(`  📸 Mobile screenshot saved to ${mobileArtifactPath}`);

    ws.close();
  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    chromeProc.kill();
    server.close();
    process.exit(0);
  }
});
