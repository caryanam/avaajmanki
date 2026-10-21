const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/full_3500.png');
  // Crop 4 slices vertically across the center stream (x: 200..750)
  for (let i = 0; i < 4; i++) {
    const slice = await page.screenshot({ clip: { x: 200, y: i * 130, width: 550, height: 130 } });
    require('fs').writeFileSync(`slice_3500_${i}.png`, slice);
  }
  console.log('Saved 4 slices of 3500');
  await browser.close();
})();
