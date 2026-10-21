const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.setContent(`
    <style>body { margin: 0; background: #fff; }</style>
    <img id="img1027" src="file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128112672_1027d7c6.jpg" style="position:absolute; top:0; left:0; width:1024px; height:682px;" />
  `);
  const crop1027 = await page.screenshot({ clip: { x: 170, y: 170, width: 560, height: 160 } });
  fs.writeFileSync('crop_topics_1027.png', crop1027);

  await page.setContent(`
    <style>body { margin: 0; background: #fff; }</style>
    <img id="img3500" src="file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png" style="position:absolute; top:0; left:0; width:1024px; height:526px;" />
  `);
  const crop3500 = await page.screenshot({ clip: { x: 140, y: 100, width: 620, height: 180 } });
  fs.writeFileSync('crop_topics_3500.png', crop3500);

  console.log('Saved crop_topics_1027.png and crop_topics_3500.png');
  await browser.close();
})();
