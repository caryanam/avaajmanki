const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/crop_topics_3500.png');
  const details = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample colors across the width at y = 50, 80, 110, 140
    // to find where card boxes are located
    const cards = [];
    return {
      w: canvas.width,
      h: canvas.height
    };
  });
  console.log('crop_topics_3500 size:', details);
  await browser.close();
})();
