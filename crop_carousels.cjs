const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  
  await page.setContent(`
    <style>body { margin: 0; background: #000; }</style>
    <img id="img" src="file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128090521_3500ed76.png" style="display:block; width:1024px; height:526px;" />
  `);
  
  // Crop the carousel region from media_1792128090521_3500ed76.png
  // Typically carousel is at y: 150..350, x: 180..750
  const buffer = await page.screenshot({ clip: { x: 180, y: 140, width: 600, height: 220 } });
  fs.writeFileSync('scratch_carousel_3500.png', buffer);

  // Now do the same for 8be5
  await page.setContent(`
    <style>body { margin: 0; background: #000; }</style>
    <img id="img" src="file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128076809_8be5115d.png" style="display:block; width:1024px; height:535px;" />
  `);
  const buffer8be5 = await page.screenshot({ clip: { x: 180, y: 140, width: 600, height: 220 } });
  fs.writeFileSync('scratch_carousel_8be5.png', buffer8be5);

  // And for 1027d7c6.jpg (the approved reference)
  await page.setContent(`
    <style>body { margin: 0; background: #000; }</style>
    <img id="img" src="file:///C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95/.user_uploaded/media_1792128112672_1027d7c6.jpg" style="display:block; width:1024px; height:682px;" />
  `);
  const buffer1027 = await page.screenshot({ clip: { x: 180, y: 140, width: 600, height: 220 } });
  fs.writeFileSync('scratch_carousel_1027.png', buffer1027);

  console.log('Saved crops for 3500, 8be5, 1027');
  await browser.close();
})();
