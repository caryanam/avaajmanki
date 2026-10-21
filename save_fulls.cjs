const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Let's inspect the entire media_1792128090521_3500ed76.png
  // By analyzing its columns:
  // Is it 3 columns? What are the titles?
  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png');
  // Take full screenshot
  await page.screenshot({ path: 'full_3500.png' });

  await page.goto('file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128076809_8be5115d.png');
  await page.screenshot({ path: 'full_8be5.png' });

  console.log('Saved full_3500.png and full_8be5.png');
  await browser.close();
})();
