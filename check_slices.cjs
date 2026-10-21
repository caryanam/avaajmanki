const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  for (let i = 0; i < 4; i++) {
    await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + `/slice_3500_${i}.png`);
    const colors = await page.evaluate(() => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Check average brightness and text presence
      let darkCount = 0;
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const p = ctx.getImageData(x, y, 1, 1).data;
          const brightness = (p[0] + p[1] + p[2]) / 3;
          if (brightness < 60) darkCount++;
        }
      }
      return { darkCount };
    });
    console.log(`Slice ${i}:`, colors);
  }
  await browser.close();
})();
