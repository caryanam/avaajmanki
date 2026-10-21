const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Niraj Ghube\\.gemini\\antigravity\\brain\\83764469-c439-4efc-be12-3b17bdbd9e95';
const BASE_URL = 'http://localhost:5173';

async function run() {
  console.log('Launching browser to test complete Explore -> Community -> Post Discussion journey...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    // Provide auth user in localStorage
    await context.addInitScript(() => {
      const mockUser = {
        id: 1,
        userId: 1,
        username: '@shubham_test',
        fullName: 'Shubham',
        avatarUrl: null,
        role: 'USER',
        status: 'ACTIVE',
        hasProfile: true,
      };
      localStorage.setItem('mka_current_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('user_profile', JSON.stringify({ userId: 1, username: 'shubham_test' }));
    });

    const page = await context.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    // ── STEP 1: Navigate to /explore ──
    console.log('Step 1: Navigating to /explore');
    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });

    // Set authenticated user on localhost:5173 origin
    await page.evaluate(() => {
      const mockUser = {
        id: 1,
        userId: 1,
        username: '@shubham_test',
        fullName: 'Shubham',
        avatarUrl: null,
        role: 'USER',
        status: 'ACTIVE',
        hasProfile: true,
      };
      localStorage.setItem('mka_current_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('user_profile', JSON.stringify({ userId: 1, username: 'shubham_test' }));
    });

    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_1_explore_1440x900.png') });
    console.log('Saved journey_1_explore_1440x900.png');

    // ── STEP 2: Click on Mental Health Popular Topic Card ──
    console.log('Step 2: Clicking Mental Health card to navigate to Topic Community');
    const mentalHealthCard = page.locator('.explore-topic-carousel-card:has-text("Mental Health")').first();
    await mentalHealthCard.waitFor({ state: 'visible', timeout: 5000 });
    await mentalHealthCard.click();
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`Current URL after clicking topic card: ${currentUrl}`);

    // Verify Topic Community Page
    await page.waitForSelector('.community-hero-banner', { timeout: 5000 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_2_community_mental_health_1440x900.png') });
    console.log('Saved journey_2_community_mental_health_1440x900.png');

    // Test Join Topic button
    const joinBtn = page.locator('.community-join-btn');
    console.log('Testing Join Topic toggle');
    await joinBtn.click();
    await page.waitForTimeout(500);
    console.log('Join state toggled');

    // ── STEP 3: Click "View Discussion" to open Post Discussion Page ──
    console.log('Step 3: Navigating to Post Discussion');
    const viewDiscussionBtn = page.locator('.community-view-discussion-btn').first();
    if (await viewDiscussionBtn.isVisible()) {
      await viewDiscussionBtn.click();
    } else {
      // Direct navigation fallback
      await page.goto(`${BASE_URL}/post/1`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(1000);
    console.log('URL at Step 3:', page.url());
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'debug_step3.png') });

    // Verify Post Discussion Page layout (center post + right discussion panel)
    await page.waitForSelector('.post-disc-right-panel', { timeout: 5000 });
    console.log('Post Discussion Page loaded successfully!');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_3_post_discussion_1440x900.png') });
    console.log('Saved journey_3_post_discussion_1440x900.png');

    // ── STEP 4: Post a new anonymous comment in discussion composer ──
    console.log('Step 4: Submitting comment via anchored bottom composer');
    await page.evaluate(() => {
      const mockUser = {
        id: 1,
        userId: 1,
        username: '@shubham_test',
        fullName: 'Shubham',
        avatarUrl: null,
        role: 'USER',
        status: 'ACTIVE',
        hasProfile: true,
      };
      localStorage.setItem('mka_current_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('user_profile', JSON.stringify({ userId: 1, username: 'shubham_test' }));
    });
    const commentInput = page.locator('.post-disc-composer-textarea');
    await commentInput.waitFor({ state: 'visible', timeout: 5000 });
    await commentInput.fill('Practicing mindfulness and writing down 3 things before bed changed everything for me. Highly recommended!');
    await page.waitForTimeout(300);

    const postBtn = page.locator('.post-disc-send-btn');
    await postBtn.click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_4_comment_posted_1440x900.png') });
    console.log('Saved journey_4_comment_posted_1440x900.png');

    // ── STEP 5: Capture Responsive Viewports ──
    console.log('Step 5: Capturing viewports at 1366x768, 1024x768, 390x844');
    
    // 1366x768
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_post_discussion_1366x768.png') });

    // 1024x768
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_post_discussion_1024x768.png') });

    // 390x844 (Mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_post_discussion_390x844.png') });

    // Also capture Community page at mobile
    await page.goto(`${BASE_URL}/topic/mental_health`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_community_390x844.png') });

    console.log('All journey screenshots captured successfully!');
  } catch (err) {
    console.error('Playwright execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
