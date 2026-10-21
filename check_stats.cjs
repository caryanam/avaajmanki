const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/scratch_3500_carousel.png');
  // Check the image
  const stats = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Look for cards
    // In this crop (520x180):
    // Let's find card background areas
    return { w: canvas.width, h: canvas.height };
  });
  console.log('3500 stats:', stats);
  await browser.close();
})();
