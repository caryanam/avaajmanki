const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capturePulseScreenshots() {
  const outDir = path.join(__dirname, 'pulse_verification_evidence');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const viewports = [
    { name: 'desktop_1920px', width: 1920, height: 1080 },
    { name: 'desktop_1536px', width: 1536, height: 960 },
    { name: 'desktop_1440px', width: 1440, height: 960 },
    { name: 'desktop_1366px', width: 1366, height: 850 },
    { name: 'tablet_1024px', width: 1024, height: 768 },
    { name: 'tablet_768px', width: 768, height: 1024 },
    { name: 'mobile_390px', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error @ ${vp.name}]:`, msg.text());
      }
    });

    try {
      await page.goto('http://localhost:5173/pulse', { waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      console.warn(`Navigation timeout or notice at ${vp.name}, proceeding with load:`, e.message);
    }

    // Wait 1.5s for fonts, hero images, and queries to stabilize
    await page.waitForTimeout(1500);

    const shotPath = path.join(outDir, `pulse_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);

    if (vp.name.startsWith('desktop')) {
      const fullShotPath = path.join(outDir, `pulse_${vp.name}_full.png`);
      await page.screenshot({ path: fullShotPath, fullPage: true });
      console.log(`Saved fullpage screenshot: ${fullShotPath}`);
    }

    const telemetry = await page.evaluate(() => {
      const leftCol = document.querySelector('.desktop-left-sidebar');
      const centerCol = document.querySelector('.pulse-center-stream');
      const rightCol = document.querySelector('.pulse-right-sidebar');

      const rectL = leftCol ? leftCol.getBoundingClientRect() : null;
      const rectC = centerCol ? centerCol.getBoundingClientRect() : null;
      const rectR = rightCol ? rightCol.getBoundingClientRect() : null;

      return {
        leftTop: rectL?.top,
        centerTop: rectC?.top,
        rightTop: rectR?.top,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    console.log(`[Viewport ${vp.name} Telemetry]:`, telemetry);

    await context.close();
  }

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

capturePulseScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
