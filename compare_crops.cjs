const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Let's load the two images and compare their text content visually
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/crop_3500_header_carousel.png');
  const d3500 = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });

  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/crop_8be5_header_carousel.png');
  const d8be5 = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });

  console.log('3500:', d3500, '8be5:', d8be5);
  await browser.close();
})();
