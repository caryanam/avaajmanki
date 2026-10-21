const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const artifactDir = path.resolve(
    'C:/Users/Niraj Ghube/.gemini/antigravity/brain/83764469-c439-4efc-be12-3b17bdbd9e95'
  );

  console.log('Navigating to http://localhost:5173/explore...');
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'mock_token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 'user_demo', username: '@anonymous', avatarInitials: 'AN' })
    );
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Click Love topic card
  console.log('Clicking Love topic card...');
  const loveCard = page.locator('text=Love').first();
  await loveCard.click();
  await page.waitForTimeout(1200);

  console.log('Current URL:', page.url());

  // 2. Capture Topic Community Feed at 1440x900
  console.log('Capturing Topic Community Feed at 1440x900...');
  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_feed_1440x900.png'),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_feed_1440x900_full.png'),
    fullPage: true,
  });

  // 3. Test In-Feed Comment interaction
  console.log('Testing in-feed comment interactions...');
  // Post 1 comments should be expanded
  const post1Comments = page.locator('.infeed-comments-container').first();
  const isPost1Visible = await post1Comments.isVisible();
  console.log('Post 1 in-feed comments visible:', isPost1Visible);

  // Type a comment in the in-feed composer of Post 1
  const commentInput = page.locator('.infeed-composer-input').first();
  await commentInput.fill('This advice brought me so much clarity today. Truly grateful.');
  await page.waitForTimeout(300);

  const postBtn = page.locator('.infeed-post-btn').first();
  await postBtn.click();
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_comment_posted.png'),
    fullPage: false,
  });

  // 4. Test Single Expansion - Toggle Post 2 comments (Post 1 collapses)
  console.log('Testing single-expansion accordion: clicking Post 2 comments...');
  const post2CommentBtn = page.locator('.community-feed-post-card').nth(1).locator('.post-action-btn').nth(1);
  await post2CommentBtn.click();
  await page.waitForTimeout(600);

  const post2Comments = page.locator('.community-feed-post-card').nth(1).locator('.infeed-comments-container');
  const isPost2Visible = await post2Comments.isVisible();
  const isPost1StillVisible = await page.locator('.community-feed-post-card').first().locator('.infeed-comments-container').isVisible();
  console.log('Post 2 comments visible:', isPost2Visible, '| Post 1 comments visible:', isPost1StillVisible);

  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_post2_expanded.png'),
    fullPage: false,
  });

  // 5. Test Creating a new post from top composer
  console.log('Testing creating a new post from top composer...');
  const quickTextPill = page.locator('.quick-action-pill.text-pill').first();
  if (await quickTextPill.isVisible()) {
    await quickTextPill.click();
    await page.waitForTimeout(400);

    const headlineInput = page.locator('.prominent-headline-input');
    await headlineInput.fill('Finding peace in the little moments');

    const bodyTextarea = page.locator('.prominent-body-textarea');
    await bodyTextarea.fill('Love is not about grand gestures all the time; it is about feeling safe and heard.');

    const submitPostBtn = page.locator('.prominent-submit-btn').first();
    await submitPostBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_new_post_published.png'),
    fullPage: false,
  });

  // 6. Responsive Viewports
  console.log('Testing 1366x768...');
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_feed_1366x768.png'),
    fullPage: true,
  });

  console.log('Testing 1024x768...');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_feed_1024x768.png'),
    fullPage: true,
  });

  console.log('Testing 390x844 mobile...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(artifactDir, 'topic_community_feed_390x844.png'),
    fullPage: true,
  });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
