const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/crop_topics_1027.png');
  const refAnalysis = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's find card borders by looking for vertical border lines
    // Background of page is #F8FAFC or similar, card border is #E2E8F0
    // Let's check pixel colors horizontally across the middle of the cards (y = 80 in this 160px crop)
    const y = 80;
    const row = [];
    for (let x = 0; x < canvas.width; x += 10) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      row.push({ x, r: p[0], g: p[1], b: p[2] });
    }
    return row;
  });
  console.log('1027 sample points:', refAnalysis.slice(0, 20));

  await browser.close();
})();
