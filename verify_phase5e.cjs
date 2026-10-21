const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runVerification() {
  console.log('--- Starting Awaaj Pulse Phase 5E Verification ---');
  const evidenceDir = path.resolve('../phase5e_evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseUrl = 'http://localhost:5174';

  try {
    // ----------------------------------------------------
    // STEP 0: Log in first (Protected routes require user session)
    // ----------------------------------------------------
    console.log('\n[Step 0] Logging in as user/admin...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.waitForSelector('input[placeholder*="mail or mobile"]', { timeout: 10000 });
    await page.fill('input[placeholder*="mail or mobile"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // ----------------------------------------------------
    // TEST 1: Short RSS Summary Story (ID: 3)
    // ----------------------------------------------------
    console.log('\n[Test 1] Testing Short RSS Summary Story (/pulse/3)...');
    await page.goto(`${baseUrl}/pulse/3`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 10000 });

    // Verify title and source
    const title = await page.locator('article h1').textContent();
    console.log(`  Title: "${title.trim()}"`);

    // Verify Read Original Article link
    const originalLink = page.locator('a:has-text("Read Original Article")');
    const hasOriginalLink = (await originalLink.count()) > 0;
    console.log(`  Has "Read Original Article" link: ${hasOriginalLink}`);
    if (!hasOriginalLink) throw new Error('Expected "Read Original Article" link');

    // Verify NO "Read More" button is rendered
    const readMoreBtnCount = await page.locator('button:has-text("Read More")').count();
    console.log(`  "Read More" button count (expected 0): ${readMoreBtnCount}`);
    if (readMoreBtnCount !== 0) {
      throw new Error(`Expected 0 "Read More" buttons for short RSS summary, found ${readMoreBtnCount}`);
    }

    await page.screenshot({ path: path.join(evidenceDir, '01_short_rss_summary_no_read_more.png'), fullPage: true });
    console.log('  Saved screenshot: 01_short_rss_summary_no_read_more.png');

    // ----------------------------------------------------
    // TEST 2: Long Editorial Content Story (ID: 4) - Collapsed State
    // ----------------------------------------------------
    console.log('\n[Test 2] Testing Long Editorial Story Collapsed (/pulse/4)...');
    await page.goto(`${baseUrl}/pulse/4`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 10000 });

    const title4 = await page.locator('article h1').textContent();
    console.log(`  Title: "${title4.trim()}"`);

    // Verify "Read More" button IS rendered
    const readMoreBtn = page.locator('button:has-text("Read More")');
    const hasReadMore = (await readMoreBtn.count()) > 0;
    console.log(`  Has "Read More" button: ${hasReadMore}`);
    if (!hasReadMore) throw new Error('Expected "Read More" button for rich editorial story');

    // Verify aria-expanded is false
    const ariaExpandedCollapsed = await readMoreBtn.getAttribute('aria-expanded');
    console.log(`  aria-expanded before click: ${ariaExpandedCollapsed}`);
    if (ariaExpandedCollapsed !== 'false') throw new Error('Expected aria-expanded="false" when collapsed');

    // Verify detailed section text is NOT visible yet
    const pageTextBefore = await page.locator('article').innerText();
    const hasSectionBefore = pageTextBefore.includes('WHAT HAPPENED');
    console.log(`  Detailed section visible before click (expected false): ${hasSectionBefore}`);
    if (hasSectionBefore) throw new Error('Detailed sections should be collapsed initially');

    await page.screenshot({ path: path.join(evidenceDir, '02_long_editorial_collapsed.png'), fullPage: true });
    console.log('  Saved screenshot: 02_long_editorial_collapsed.png');

    // ----------------------------------------------------
    // TEST 3: Long Editorial Content Story (ID: 4) - Inline Expansion
    // ----------------------------------------------------
    console.log('\n[Test 3] Clicking "Read More" for Inline Expansion...');
    await readMoreBtn.click();
    await page.waitForTimeout(300);

    // Verify detailed section text is NOW visible
    const pageTextAfter = await page.locator('article').innerText();
    const hasWhatHappened = pageTextAfter.includes('WHAT HAPPENED');
    const hasBackground = pageTextAfter.includes('BACKGROUND');
    const hasWhyMatters = pageTextAfter.includes('WHY IT MATTERS');
    const hasDiscussionQs = pageTextAfter.includes('QUESTIONS FOR DISCUSSION');

    console.log(`  "WHAT HAPPENED" visible: ${hasWhatHappened}`);
    console.log(`  "BACKGROUND" visible: ${hasBackground}`);
    console.log(`  "WHY IT MATTERS" visible: ${hasWhyMatters}`);
    console.log(`  "QUESTIONS FOR DISCUSSION" visible: ${hasDiscussionQs}`);

    if (!hasWhatHappened || !hasBackground || !hasWhyMatters || !hasDiscussionQs) {
      throw new Error('Expected all structured editorial sections to be visible after expanding');
    }

    // Verify "Show Less" button is now visible
    const showLessBtn = page.locator('button:has-text("Show Less")');
    const hasShowLess = (await showLessBtn.count()) > 0;
    console.log(`  Has "Show Less" button: ${hasShowLess}`);
    if (!hasShowLess) throw new Error('Expected "Show Less" button after expanding');

    const ariaExpandedExpanded = await showLessBtn.getAttribute('aria-expanded');
    console.log(`  aria-expanded after click: ${ariaExpandedExpanded}`);
    if (ariaExpandedExpanded !== 'true') throw new Error('Expected aria-expanded="true" when expanded');

    // Verify duplicate summary text is NOT present
    const summaryMatchCount = (pageTextAfter.match(/Polish authorities have detained a suspect in connection with a planned assassination attempt/g) || []).length;
    console.log(`  Summary text repetition count (expected 1): ${summaryMatchCount}`);
    if (summaryMatchCount > 1) {
      throw new Error(`Summary repeated ${summaryMatchCount} times! Duplicate summary detected.`);
    }

    await page.screenshot({ path: path.join(evidenceDir, '03_long_editorial_expanded.png'), fullPage: true });
    console.log('  Saved screenshot: 03_long_editorial_expanded.png');

    // ----------------------------------------------------
    // TEST 4: Collapse Back with "Show Less"
    // ----------------------------------------------------
    console.log('\n[Test 4] Clicking "Show Less" to Collapse...');
    await showLessBtn.click();
    await page.waitForTimeout(300);

    const hasReadMoreAgain = (await page.locator('button:has-text("Read More")').count()) > 0;
    const pageTextCollapsedAgain = await page.locator('article').innerText();
    const hasSectionCollapsedAgain = pageTextCollapsedAgain.includes('WHAT HAPPENED');

    console.log(`  "Read More" returned: ${hasReadMoreAgain}`);
    console.log(`  Detailed sections collapsed: ${!hasSectionCollapsedAgain}`);

    if (!hasReadMoreAgain || hasSectionCollapsedAgain) {
      throw new Error('Failed to collapse back properly after clicking Show Less');
    }

    await page.screenshot({ path: path.join(evidenceDir, '04_long_editorial_collapsed_again.png'), fullPage: true });
    console.log('  Saved screenshot: 04_long_editorial_collapsed_again.png');

    // ----------------------------------------------------
    // TEST 5: Mobile Viewport Responsiveness
    // ----------------------------------------------------
    console.log('\n[Test 5] Testing Mobile Viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/pulse/4`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 10000 });

    const mobileReadMore = page.locator('button:has-text("Read More")');
    await mobileReadMore.click();
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(evidenceDir, '05_mobile_expanded.png'), fullPage: true });
    console.log('  Saved screenshot: 05_mobile_expanded.png');

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // ----------------------------------------------------
    // TEST 6: Admin Editorial Review Modal & Templates
    // ----------------------------------------------------
    console.log('\n[Test 6] Testing Admin Candidate Review Modal with Templates...');
    await page.goto(`${baseUrl}/admin/pulse/candidates`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Go to admin candidates
    await page.goto(`${baseUrl}/admin/pulse/candidates`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find candidate action button in table
    const reviewBtn = page.locator('button:has-text("Review & Curate")').first();
    const reviewCount = await reviewBtn.count();
    console.log(`  Found "Review & Curate" buttons: ${reviewCount}`);

    if (reviewCount > 0) {
      await reviewBtn.click();
      await page.waitForSelector('textarea', { timeout: 5000 });

      // Verify template buttons
      const fullTemplateBtn = page.locator('button:has-text("+ Full Template")');
      const hasFullTemplateBtn = (await fullTemplateBtn.count()) > 0;
      console.log(`  Modal has "+ Full Template" button: ${hasFullTemplateBtn}`);

      if (hasFullTemplateBtn) {
        await fullTemplateBtn.click();
        await page.waitForTimeout(300);
      }

      await page.screenshot({ path: path.join(evidenceDir, '06_admin_review_modal_with_template.png') });
      console.log('  Saved screenshot: 06_admin_review_modal_with_template.png');
    }

    console.log('\n✅ All automated verification tests completed successfully!');

  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runVerification();
