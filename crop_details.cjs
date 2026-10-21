const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png');
  // Crop the entire header and carousel region of media_1792128090521_3500ed76.png
  const crop = await page.screenshot({ clip: { x: 0, y: 0, width: 1024, height: 350 } });
  fs.writeFileSync('crop_3500_header_carousel.png', crop);

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128076809_8be5115d.png');
  const crop8be5 = await page.screenshot({ clip: { x: 0, y: 0, width: 1024, height: 350 } });
  fs.writeFileSync('crop_8be5_header_carousel.png', crop8be5);

  console.log('Saved header/carousel crops');
  await browser.close();
})();
