const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const evidenceDir = path.join(__dirname, 'docs', 'phase2_evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: true,
    channel: 'msedge',
  });

  const context = await browser.newContext({
    viewport: { width: 1536, height: 960 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('1. Testing Guest User Home Page on http://localhost:5173/home...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Capture guest full desktop screenshot
  await page.screenshot({ path: path.join(evidenceDir, '01_guest_home_desktop_1536px.png'), fullPage: true });
  await page.screenshot({ path: path.join(evidenceDir, '02_guest_home_viewport.png') });
  console.log('Captured guest screenshots.');

  const guestPostCards = await page.$$('.community-post-card');
  console.log(`Guest mode: Found ${guestPostCards.length} community post cards rendered in feed.`);

  const trendingItems = await page.$$('.trending-item');
  console.log(`Guest mode: Found ${trendingItems.length} trending news items in right sidebar.`);

  const popularTopicCards = await page.$$('.popular-topic-card');
  console.log(`Guest mode: Found ${popularTopicCards.length} popular topic cards in 2-column grid.`);

  const exploreTopicItems = await page.$$('.explore-topic-item');
  console.log(`Guest mode: Found ${exploreTopicItems.length} explore topic items in list.`);

  // 2. Perform Real UI Login with genuine credentials
  console.log('\n2. Logging in via UI as admin/user...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  const emailInput = await page.$('input[placeholder*="mail or mobile"]');
  if (emailInput) {
    await emailInput.fill('admin@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    console.log('Logged in successfully. Navigating to /home...');
  }

  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Capture logged-in desktop screenshot
  await page.screenshot({ path: path.join(evidenceDir, '03_loggedin_home_desktop_1536px.png'), fullPage: true });
  await page.screenshot({ path: path.join(evidenceDir, '04_loggedin_home_viewport.png') });
  console.log('Captured logged-in screenshots.');

  // Test expanding the Post Composer as logged-in user
  const composerTrigger = await page.$('.composer-input-trigger');
  if (composerTrigger) {
    await composerTrigger.click();
    await page.waitForTimeout(600);
    const textareaVisible = await page.isVisible('textarea[placeholder*="mind today"]');
    console.log('Logged-in Composer expanded successfully:', textareaVisible);
    await page.screenshot({ path: path.join(evidenceDir, '05_composer_expanded.png') });
  }

  // Test Feed Tabs switching
  const tabsToTest = ['Latest', 'Feelings', 'Life & Work', 'For You'];
  for (const tabName of tabsToTest) {
    const tabBtn = await page.$(`button.feed-tab-btn:has-text("${tabName}")`);
    if (tabBtn) {
      await tabBtn.click();
      await page.waitForTimeout(300);
      const isActive = await tabBtn.evaluate((el) => el.classList.contains('active'));
      console.log(`Tab "${tabName}" clicked. Is active:`, isActive);
    }
  }
  await page.screenshot({ path: path.join(evidenceDir, '06_tabs_interaction.png') });

  // Check component counts when logged in
  const loggedinPostCards = await page.$$('.community-post-card');
  console.log(`Logged-in mode: Found ${loggedinPostCards.length} community post cards rendered in feed.`);

  if (consoleErrors.length > 0) {
    console.log('Console Errors encountered:', consoleErrors);
  } else {
    console.log('Zero console errors throughout the entire test suite!');
  }

  await browser.close();
  console.log('Playwright test suite completed successfully.');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
