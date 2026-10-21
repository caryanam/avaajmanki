const { chromium } = require('playwright');
const fs = require('fs');

const dir = 'C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  
  await page.goto('file:///' + dir + 'media_1792128090521_3500ed76.png');
  const buffer3500 = await page.screenshot();
  fs.writeFileSync('scratch_media_3500.png', buffer3500);

  await page.goto('file:///' + dir + 'media_1792128076809_8be5115d.png');
  const buffer8be5 = await page.screenshot();
  fs.writeFileSync('scratch_media_8be5.png', buffer8be5);

  await page.goto('file:///' + dir + 'media_1792128112672_1027d7c6.jpg');
  const buffer1027 = await page.screenshot();
  fs.writeFileSync('scratch_media_1027.png', buffer1027);

  console.log('Saved all 3 media files as screenshots');
  await browser.close();
})();
