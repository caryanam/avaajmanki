const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Open slice_3500_0.png and inspect
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/slice_3500_0.png');
  // Take a clean screenshot
  await page.screenshot({ path: 'scratch_inspect_slice0.png' });

  // Also crop the carousel from full_3500.png specifically
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/full_3500.png');
  const carouselCrop = await page.screenshot({ clip: { x: 230, y: 140, width: 520, height: 180 } });
  fs.writeFileSync('scratch_3500_carousel.png', carouselCrop);

  // And from full_8be5.png
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/full_8be5.png');
  const carousel8be5 = await page.screenshot({ clip: { x: 230, y: 140, width: 520, height: 180 } });
  fs.writeFileSync('scratch_8be5_carousel.png', carousel8be5);

  console.log('Saved scratch_3500_carousel.png and scratch_8be5_carousel.png');
  await browser.close();
})();
