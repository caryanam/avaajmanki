const { chromium } = require('playwright');
const path = require('path');

async function measureRef() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 682 } });
  const refPath = 'file:///' + 'C:/Users/Niraj Ghube/.gemini/antigravity/brain/277148e6-835c-4a0f-a7d7-8d882831d11b/approved_reference.jpg'.replace(/\\/g, '/');
  
  await page.goto(refPath);
  
  const metrics = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample along columns to find card boundaries
    // Top header is at y = 0..35
    // Left column is around x = 20..160
    // Center column is around x = 170..730
    // Right column is around x = 740..980
    return {
      w: img.naturalWidth,
      h: img.naturalHeight
    };
  });

  console.log('Metrics:', metrics);
  await browser.close();
}

measureRef();
