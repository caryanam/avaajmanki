const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

  await page.setContent(`
    <html>
      <body style="background: #1e1e1e; color: #fff; font-family: sans-serif; padding: 20px;">
        <h2>Reference: 1027d7c6 (Approved Option A)</h2>
        <img id="img1" src="file:///${process.cwd().replace(/\\/g, '/')}/crop_topics_1027.png" style="border: 2px solid green;" />
        <h2>Implementation: 3500ed76</h2>
        <img id="img2" src="file:///${process.cwd().replace(/\\/g, '/')}/crop_topics_3500.png" style="border: 2px solid red;" />
      </body>
    </html>
  `);

  await page.screenshot({ path: 'scratch_side_by_side_carousels.png' });
  console.log('Saved scratch_side_by_side_carousels.png');
  await browser.close();
})();
