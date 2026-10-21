const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.resolve('explore_fidelity_evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function runVerification() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {};

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // Step 1: Open /explore without query parameters
    console.log('[Step 1] Opening /explore without query parameters...');
    await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const step1Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step1Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    const step1SearchVal = await page.$eval('.explore-search-input', el => el.value);
    console.log(`[Step 1 Result] Discussions: ${step1Discussions}, Popular Topic Cards: ${step1Cards}, Search: "${step1SearchVal}"`);
    results.step1 = { discussions: step1Discussions, cards: step1Cards, searchVal: step1SearchVal };

    // Step 2: Select All Topics
    console.log('[Step 2] Selecting All Topics...');
    const allTab = page.getByRole('tab', { name: 'All Topics' });
    await allTab.click();
    await page.waitForTimeout(300);
    const step2Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step2Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    console.log(`[Step 2 Result] Discussions: ${step2Discussions}, Popular Topic Cards: ${step2Cards}`);
    results.step2 = { discussions: step2Discussions, cards: step2Cards };

    // Step 3: Select Relationships
    console.log('[Step 3] Selecting Relationships...');
    const relTab = page.getByRole('tab', { name: 'Relationships' });
    await relTab.click();
    await page.waitForTimeout(400);
    const step3Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step3Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    const step3CardTitles = await page.$$eval('.explore-topic-carousel-card .explore-topic-name', els => els.map(e => e.innerText));
    const step3EmptyText = await page.$eval('.trending-discussions-section', el => el.innerText);
    const hasLoveError = step3EmptyText.includes("No discussions matching '#LOVE'");
    console.log(`[Step 3 Result] Discussions: ${step3Discussions}, Topic Cards: ${step3Cards} (${step3CardTitles.join(', ')}), Has '#LOVE' error: ${hasLoveError}`);
    results.step3 = { discussions: step3Discussions, cards: step3Cards, titles: step3CardTitles, hasLoveError };

    // Step 4: Switch back to All Topics
    console.log('[Step 4] Switching back to All Topics...');
    await allTab.click();
    await page.waitForTimeout(400);
    const step4Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step4Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    console.log(`[Step 4 Result] Discussions: ${step4Discussions}, Topic Cards: ${step4Cards}`);
    results.step4 = { discussions: step4Discussions, cards: step4Cards };

    // Step 5: Search for Love
    console.log('[Step 5] Searching for Love...');
    const searchInput = page.locator('.explore-search-input');
    await searchInput.fill('Love');
    await page.waitForTimeout(400);
    const step5Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step5EmptyMsg = await page.$eval('.trending-discussions-section', el => el.innerText);
    console.log(`[Step 5 Result] Discussions: ${step5Discussions}, Notice: ${step5EmptyMsg.slice(0, 80)}...`);
    results.step5 = { discussions: step5Discussions };

    // Step 6: Clear the search
    console.log('[Step 6] Clearing the search...');
    const clearBtn = page.locator('.explore-search-clear');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    } else {
      await searchInput.fill('');
    }
    await page.waitForTimeout(400);
    const step6Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    console.log(`[Step 6 Result] Restored Discussions: ${step6Discussions}`);
    results.step6 = { restoredDiscussions: step6Discussions };

    // Step 7: Switch between Trending, Latest, and Most Commented
    console.log('[Step 7] Testing sorting tabs...');
    const latestBtn = page.locator('.discussions-tab-btn:has-text("Latest")');
    await latestBtn.click();
    await page.waitForTimeout(300);
    const latestCount = await page.$$eval('.trending-discussion-card', cards => cards.length);

    const mostCommentedBtn = page.locator('.discussions-tab-btn:has-text("Most Commented")');
    await mostCommentedBtn.click();
    await page.waitForTimeout(300);
    const mostCommentedCount = await page.$$eval('.trending-discussion-card', cards => cards.length);

    const trendingBtn = page.locator('.discussions-tab-btn:has-text("Trending")');
    await trendingBtn.click();
    await page.waitForTimeout(300);
    const trendingCount = await page.$$eval('.trending-discussion-card', cards => cards.length);
    console.log(`[Step 7 Result] Latest: ${latestCount}, Most Commented: ${mostCommentedCount}, Trending: ${trendingCount}`);
    results.step7 = { latestCount, mostCommentedCount, trendingCount };

    // Step 8: Refresh the page
    console.log('[Step 8] Refreshing the page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const step8Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step8Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    console.log(`[Step 8 Result] Discussions: ${step8Discussions}, Cards: ${step8Cards}`);
    results.step8 = { discussions: step8Discussions, cards: step8Cards };

    // Step 9: Navigate away and return
    console.log('[Step 9] Navigating away to /home and returning...');
    await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const step9Discussions = await page.$$eval('.trending-discussion-card', cards => cards.length);
    const step9Cards = await page.$$eval('.explore-topic-carousel-card', cards => cards.length);
    console.log(`[Step 9 Result] Discussions: ${step9Discussions}, Cards: ${step9Cards}`);
    results.step9 = { discussions: step9Discussions, cards: step9Cards };

    // Carousel Dimension & Navigation Verification across viewports
    const viewports = [
      { name: '1440x900', width: 1440, height: 900 },
      { name: '1366x768', width: 1366, height: 768 },
      { name: '1024x768', width: 1024, height: 768 },
      { name: '390px_mobile', width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Verify carousel navigation scroll
      const nextArrow = page.locator('.carousel-arrow-btn[aria-label="Next topics"]');
      const canScrollRight = await nextArrow.isEnabled();
      if (canScrollRight) {
        await nextArrow.click();
        await page.waitForTimeout(300);
      }

      // Check overflow
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const cardMetrics = await page.$$eval('.explore-topic-carousel-card', cards => {
        return cards.map(c => {
          const r = c.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        });
      });

      const shotPath = path.join(EVIDENCE_DIR, `explore_fixed_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      console.log(`[Viewport ${vp.name}] Overflow: ${overflow}, Cards visible: ${cardMetrics.length}, Sample card size: ${cardMetrics[0]?.w}x${cardMetrics[0]?.h}`);
      results[vp.name] = { overflow, cardMetrics: cardMetrics[0], screenshot: shotPath };
    }

    fs.writeFileSync(path.join(EVIDENCE_DIR, 'task_verification_report.json'), JSON.stringify(results, null, 2));
    console.log('[PASS] All verification tests executed and report written.');
  } finally {
    await browser.close();
  }
}

runVerification();
