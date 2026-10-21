const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Testing /topic/love...');
  await page.goto('http://localhost:5173/topic/love', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const middleScroll = await page.evaluate(() => {
    const el = document.querySelector('.topic-community-center-stream');
    return {
      scrollTop: el ? el.scrollTop : null,
      scrollHeight: el ? el.scrollHeight : null,
      clientHeight: el ? el.clientHeight : null,
    };
  });
  console.log('Love middleScroll:', middleScroll);

  const bannerBox = await page.locator('.community-hero-banner').boundingBox();
  console.log('Love bannerBox:', bannerBox);

  await page.screenshot({ path: 'scratch_love_test.png' });

  console.log('\nTesting /topic/family...');
  await page.goto('http://localhost:5173/topic/family', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const familyScroll = await page.evaluate(() => {
    const el = document.querySelector('.topic-community-center-stream');
    return {
      scrollTop: el ? el.scrollTop : null,
      scrollHeight: el ? el.scrollHeight : null,
      clientHeight: el ? el.clientHeight : null,
    };
  });
  console.log('Family middleScroll:', familyScroll);
  const familyBannerBox = await page.locator('.community-hero-banner').boundingBox();
  console.log('Family bannerBox:', familyBannerBox);

  await page.screenshot({ path: 'scratch_family_test.png' });

  await browser.close();
})();
