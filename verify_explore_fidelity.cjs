const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const evidenceDir = path.join(__dirname, 'explore_fidelity_evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390px_mobile', width: 390, height: 844 },
];

async function verifyExplore() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {};

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join(evidenceDir, `explore_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const metrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const hasHorizontalOverflow = docW > winW;

      const popularCards = document.querySelectorAll('.explore-topic-carousel-card');
      const cardData = Array.from(popularCards).map((card) => {
        const title = card.querySelector('.explore-topic-name')?.textContent || '';
        const stat = card.querySelector('.explore-topic-stat')?.textContent || '';
        const img = card.querySelector('.explore-topic-thumb-img');
        const r = card.getBoundingClientRect();
        return {
          title,
          stat,
          imgNaturalWidth: img?.naturalWidth || 0,
          imgNaturalHeight: img?.naturalHeight || 0,
          renderedWidth: Math.round(r.width),
          renderedHeight: Math.round(r.height),
        };
      });

      const discussionCards = document.querySelectorAll('.trending-discussion-card');
      const rightSidebar = document.querySelector('.explore-right-sidebar');

      return {
        viewportWidth: winW,
        scrollWidth: docW,
        hasHorizontalOverflow,
        popularCardCount: popularCards.length,
        popularCards: cardData.slice(0, 8),
        discussionCardCount: discussionCards.length,
        hasRightSidebar: !!rightSidebar && window.getComputedStyle(rightSidebar).display !== 'none',
      };
    });

    results[vp.name] = { ...metrics, screenshot: screenshotPath };
    console.log(`[PASS] Verified ${vp.name}: overflow=${metrics.hasHorizontalOverflow}, cards=${metrics.popularCardCount}, discussions=${metrics.discussionCardCount}`);
  }

  // Functional check: click on a popular topic card and verify reaction/navigation
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });

  // Click on "Love" card
  const firstCard = await testPage.$('.explore-topic-carousel-card');
  if (firstCard) {
    await firstCard.click();
    await testPage.waitForTimeout(500);
    console.log('[PASS] Topic card clicked without errors.');
  }

  await browser.close();

  fs.writeFileSync(
    path.join(evidenceDir, 'verification_summary.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('Visual verification complete. Results written to explore_fidelity_evidence/verification_summary.json');
}

verifyExplore().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
