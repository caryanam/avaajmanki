const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/crop_topics_1027.png');
  const cardData = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample along y = 130
    // Cards have white bottoms with a small border
    const y = 130;
    const row = ctx.getImageData(0, y, canvas.width, 1).data;
    // Find transitions
    return { w: canvas.width, h: canvas.height };
  });

  console.log('1027 crop dimensions:', cardData);
  await browser.close();
})();
