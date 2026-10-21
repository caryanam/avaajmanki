const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  
  // Let's examine the text in media_1792128090521_3500ed76.png and media_1792128076809_8be5115d.png
  // by rendering them in an HTML page with an image viewer
  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png');
  const imgInfo3500 = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log('3500 img:', imgInfo3500);

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128076809_8be5115d.png');
  const imgInfo8be5 = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log('8be5 img:', imgInfo8be5);

  await browser.close();
})();
