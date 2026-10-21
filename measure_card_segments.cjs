const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Measure card sizes in the reference image: media_1792128112672_1027d7c6.jpg
  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128112672_1027d7c6.jpg');
  const refCards = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample along horizontal line y = 180 to find card edges (cards have white background #ffffff or light border)
    // The image is 1024x682.
    // In 1024x682, the Popular Topics section is roughly y: 140 to 260.
    // Let's find card borders along y = 230 (the bottom bar of the card)
    const y = 230;
    const lineData = ctx.getImageData(0, y, canvas.width, 1).data;
    const segments = [];
    let inCard = false;
    let startX = 0;
    for (let x = 150; x < 750; x++) {
      const idx = x * 4;
      const r = lineData[idx];
      const g = lineData[idx + 1];
      const b = lineData[idx + 2];
      // Card bottom bar is mostly white (r > 240, g > 240, b > 240)
      const isWhite = r > 240 && g > 240 && b > 240;
      if (isWhite && !inCard) {
        inCard = true;
        startX = x;
      } else if (!isWhite && inCard) {
        inCard = false;
        if (x - startX > 30) {
          segments.push({ startX, endX: x, width: x - startX });
        }
      }
    }
    return { segments, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
  });

  console.log('Reference card segments:', refCards);

  // Now measure in media_1792128090521_3500ed76.png
  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png');
  const img3500Cards = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const y = 230;
    const lineData = ctx.getImageData(0, y, canvas.width, 1).data;
    const segments = [];
    let inCard = false;
    let startX = 0;
    for (let x = 150; x < 750; x++) {
      const idx = x * 4;
      const r = lineData[idx];
      const g = lineData[idx + 1];
      const b = lineData[idx + 2];
      const isWhite = r > 240 && g > 240 && b > 240;
      if (isWhite && !inCard) {
        inCard = true;
        startX = x;
      } else if (!isWhite && inCard) {
        inCard = false;
        if (x - startX > 30) {
          segments.push({ startX, endX: x, width: x - startX });
        }
      }
    }
    return { segments, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
  });

  console.log('3500 card segments:', img3500Cards);

  await browser.close();
})();
