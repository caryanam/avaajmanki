const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Niraj Ghube/.gemini/antigravity/brain/f97076a3-2cd1-4afa-b0d2-15727d6e523b');

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/explore...');
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Locate and click Create Topic button
  console.log('Clicking Create Topic button...');
  const createTopicBtn = page.locator('.explore-create-topic-btn');
  await createTopicBtn.waitFor({ state: 'visible', timeout: 10000 });
  await createTopicBtn.click();

  // 2. Wait for modal to appear and animate
  console.log('Waiting for Create Topic Modal...');
  const modal = page.locator('.ct-modal-card');
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(400); // allow enter animation to complete

  // Verify body overflow locked
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  console.log('Body overflow after modal open:', bodyOverflow);

  // 3. Select a category (e.g. Mental Health)
  console.log('Selecting Mental Health category...');
  const mentalHealthTile = page.locator('.ct-category-tile', { hasText: 'Mental Health' });
  await mentalHealthTile.click();
  await page.waitForTimeout(150);

  // 4. Fill in Topic Name
  console.log('Typing topic name...');
  const nameInput = page.locator('#ct-topic-name');
  await nameInput.fill('Mindfulness & Daily Peace');
  await page.waitForTimeout(100);

  // 5. Fill in Topic Description
  console.log('Typing topic description...');
  const descTextarea = page.locator('#ct-topic-desc');
  await descTextarea.fill('A safe and comforting space to share mindfulness techniques, daily reflection routines, breathing exercises, and emotional grounding tips.');
  await page.waitForTimeout(100);

  // Take Desktop Screenshot
  const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'create_topic_modal_desktop_1440x900.png');
  await page.screenshot({ path: desktopScreenshotPath });
  console.log('Saved desktop screenshot to:', desktopScreenshotPath);

  // 6. Test Mobile Viewport (390 x 844)
  console.log('Testing Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);

  const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'create_topic_modal_mobile_390x844.png');
  await page.screenshot({ path: mobileScreenshotPath });
  console.log('Saved mobile screenshot to:', mobileScreenshotPath);

  // 7. Test closing behavior (Press Escape key)
  console.log('Testing ESC key close...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const isModalVisibleAfterEsc = await modal.isVisible();
  console.log('Modal visible after ESC:', isModalVisibleAfterEsc);

  const restoredBodyOverflow = await page.evaluate(() => document.body.style.overflow);
  console.log('Restored body overflow:', restoredBodyOverflow);

  // 8. Re-open and test Cancel button
  await page.setViewportSize({ width: 1440, height: 900 });
  await createTopicBtn.click();
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  const cancelBtn = page.locator('.ct-btn-cancel');
  const cancelBtnText = await cancelBtn.textContent();
  console.log('Cancel button text:', cancelBtnText.trim());
  await cancelBtn.click();
  await page.waitForTimeout(300);
  const isModalVisibleAfterCancel = await modal.isVisible();
  console.log('Modal visible after Cancel button:', isModalVisibleAfterCancel);

  await browser.close();
  console.log('E2E Verification completed successfully!');
}

run().catch((err) => {
  console.error('Error during E2E test:', err);
  process.exit(1);
});
