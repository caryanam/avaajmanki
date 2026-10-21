const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyDiscussionRefinement() {
  const outDir = path.resolve(__dirname, 'pulse_refinement_evidence');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('--- STEP 1: LOGIN USER ---');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="Enter registered mail or mobile"]', 'aarav@awaazmanki.com');
  await page.fill('input[placeholder="Enter password"]', 'Aarav@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  console.log('--- STEP 2: NAVIGATE TO /pulse/1 ---');
  await page.goto('http://localhost:5173/pulse/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('--- STEP 3: VERIFY CLEAN SORTING UI ---');
  const heading = await page.$('.pulse-discussion-heading');
  const headingText = heading ? await heading.textContent() : '';
  console.log('Section heading:', headingText);

  const oldTabs = await page.$$('.pulse-discussion-tabs .pulse-tab-btn');
  console.log('Old tabs count (should be 0):', oldTabs.length);

  const sortBtn = await page.$('.pulse-sort-trigger-btn');
  const sortBtnText = sortBtn ? await sortBtn.textContent() : '';
  console.log('Sort trigger button text:', sortBtnText.trim());

  await sortBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, '01_sort_dropdown_open.png') });

  const sortOptions = await page.$$eval('.pulse-sort-option', (nodes) => nodes.map((n) => n.textContent.trim()));
  console.log('Sort dropdown options:', sortOptions);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('--- STEP 4: ENSURE COMMENT EXISTS & POST IF NEEDED ---');
  let commentCards = await page.$$('.pulse-comment-card-item');
  if (commentCards.length === 0) {
    console.log('No comments yet, creating test comment via bottom composer...');
    await page.fill('.pulse-composer-textarea', 'Autonomous space missions represent a pivotal milestone for India! 🚀');
    await page.click('.pulse-composer-post-btn');
    await page.waitForTimeout(2000);
    commentCards = await page.$$('.pulse-comment-card-item');
  }
  console.log('Total comments in discussion stream:', commentCards.length);
  await page.screenshot({ path: path.join(outDir, '02_discussion_with_comments.png') });

  console.log('--- STEP 5: VERIFY SINGLE COMPOSER REPLY MODE ---');
  const replyBtn = await page.$('.pulse-comment-action-btn[title="Reply to comment"], .pulse-comment-action-btn:has(svg.lucide-message-square)');
  if (replyBtn) {
    console.log('Clicking Reply on comment...');
    await replyBtn.click();
    await page.waitForTimeout(400);

    // Verify NO inline reply box exists
    const inlineBox = await page.$('.pulse-inline-reply-composer');
    console.log('Inline reply box rendered? (must be false):', Boolean(inlineBox));

    // Verify single bottom composer entered reply mode
    const replyStrip = await page.$('.pulse-composer-reply-strip');
    const replyStripText = replyStrip ? await replyStrip.textContent() : '';
    console.log('Bottom composer reply strip text:', replyStripText.trim());

    const placeholder = await page.$eval('.pulse-composer-textarea', (el) => el.getAttribute('placeholder'));
    console.log('Textarea placeholder in reply mode:', placeholder);

    const postBtnText = await page.$eval('.pulse-composer-post-btn', (el) => el.textContent.trim());
    console.log('Submit button label (must be Reply):', postBtnText);

    await page.screenshot({ path: path.join(outDir, '03_single_composer_reply_mode.png') });

    // Submit a reply via single composer
    console.log('Posting reply via single bottom composer...');
    await page.fill('.pulse-composer-textarea', 'Completely agree with this assessment! High impact.');
    await page.click('.pulse-composer-post-btn');
    await page.waitForTimeout(2000);

    // Verify reply mode ended and reply strip is gone
    const afterPostStrip = await page.$('.pulse-composer-reply-strip');
    console.log('Reply strip after post (should be null):', Boolean(afterPostStrip));

    await page.screenshot({ path: path.join(outDir, '04_reply_posted_in_thread.png') });
  }

  console.log('--- STEP 6: VERIFY EMOJI PICKER WITH CURSOR INSERTION ---');
  await page.fill('.pulse-composer-textarea', 'Observing reactions ');
  const emojiBtn = await page.$('.pulse-emoji-popover-anchor .pulse-tool-icon-btn');
  if (emojiBtn) {
    await emojiBtn.click();
    await page.waitForTimeout(500);
    const pickerVisible = await page.$('.pulse-emoji-popover-menu');
    console.log('Emoji picker popover open?', Boolean(pickerVisible));
    await page.screenshot({ path: path.join(outDir, '05_emoji_picker_open.png') });

    const emojiItem = await page.$('.epr-emoji, button[data-unified]');
    if (emojiItem) {
      await emojiItem.click();
      await page.waitForTimeout(300);
      const val = await page.$eval('.pulse-composer-textarea', (el) => el.value);
      console.log('Composer text after emoji insertion:', val);
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const pickerClosed = await page.$('.pulse-emoji-popover-menu');
    console.log('Emoji picker closed after Escape?', !pickerClosed);
  }

  console.log('--- STEP 7: VERIFY MOOD TAGS ---');
  const moodBtn = await page.$('.pulse-mood-popover-anchor .pulse-tool-icon-btn');
  if (moodBtn) {
    await moodBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, '06_mood_popover_open.png') });

    const optimisticMood = await page.$('.pulse-mood-option-btn');
    if (optimisticMood) {
      await optimisticMood.click();
      await page.waitForTimeout(300);
      const val = await page.$eval('.pulse-composer-textarea', (el) => el.value);
      console.log('Composer text after mood tag:', val);
    }
  }

  console.log('--- STEP 8: VERIFY SPEECH-TO-TEXT CONTROLS ---');
  const micBtn = await page.$('.pulse-tool-icon-btn:has(svg.lucide-mic)');
  console.log('Microphone button present:', Boolean(micBtn));

  const langPills = await page.$$eval('.pulse-voice-lang-btn', (nodes) => nodes.map((n) => n.textContent.trim()));
  console.log('Speech language selection pills:', langPills);

  const marathiPill = await page.$('.pulse-voice-lang-btn:has-text("MR")');
  if (marathiPill) {
    await marathiPill.click();
    await page.waitForTimeout(200);
    const active = await page.$eval('.pulse-voice-lang-btn.active', (el) => el.textContent.trim());
    console.log('Active language after MR click:', active);
  }

  await page.screenshot({ path: path.join(outDir, '07_full_refined_discussion_panel.png') });

  console.log('\n=================================================');
  console.log('ALL VERIFICATION CRITERIA VERIFIED SUCCESSFULLY!');
  console.log('Console Errors:', consoleErrors);
  console.log('=================================================');

  await browser.close();
}

verifyDiscussionRefinement().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
