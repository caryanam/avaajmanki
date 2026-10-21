const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/full_3500.png');
  const textInfo = await page.evaluate(() => {
    // Check pixel at x=500, y=250..400
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample a box around center
    // Check if there is an empty state message
    return { w: canvas.width, h: canvas.height };
  });
  console.log('full_3500 dims:', textInfo);
  await browser.close();
})();
