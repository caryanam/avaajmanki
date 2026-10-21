const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128112672_1027d7c6.jpg');
  const loc1027 = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's find red pixels (#E11D48: r > 200, g < 50, b < 100)
    const points = [];
    for (let y = 50; y < 400; y += 5) {
      for (let x = 150; x < 600; x += 5) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[0] > 200 && p[1] < 50 && p[2] < 100) {
          points.push({ x, y, r: p[0], g: p[1], b: p[2] });
        }
      }
    }
    return points.slice(0, 10);
  });
  console.log('1027 red points:', loc1027);

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png');
  const loc3500 = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const points = [];
    for (let y = 50; y < 400; y += 5) {
      for (let x = 150; x < 600; x += 5) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[0] > 200 && p[1] < 50 && p[2] < 100) {
          points.push({ x, y, r: p[0], g: p[1], b: p[2] });
        }
      }
    }
    return points.slice(0, 10);
  });
  console.log('3500 red points:', loc3500);

  await browser.close();
})();
