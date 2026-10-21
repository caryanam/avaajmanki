const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Niraj Ghube/.gemini/antigravity/brain/f97076a3-2cd1-4afa-b0d2-15727d6e523b');

async function verify() {
  console.log('--- Launching Playwright Chromium ---');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // Test 1: Explore Page Loading & Sport Car in Carousel
  console.log('1. Loading http://localhost:5173/explore...');
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const carouselCardTitles = await page.locator('.explore-topic-name').allInnerTexts();
  console.log('Carousel topics found:', carouselCardTitles);

  const sportCarInCarousel = carouselCardTitles.some((t) => t.toLowerCase().includes('sport car'));
  console.log('Is "Sport Car" present in Explore carousel?', sportCarInCarousel);

  // Take screenshot of Explore Page
  const exploreScreenshot = path.join(ARTIFACT_DIR, 'explore_with_sport_car.png');
  await page.screenshot({ path: exploreScreenshot, fullPage: false });
  console.log('Saved screenshot:', exploreScreenshot);

  // Test 2: Explore Search for "Sport"
  console.log('2. Testing Explore Search for "Sport"...');
  const searchInput = page.locator('.explore-search-input');
  await searchInput.fill('Sport');
  await page.waitForTimeout(600);

  const filteredTitles = await page.locator('.explore-topic-name').allInnerTexts();
  console.log('Topics after searching "Sport":', filteredTitles);

  const searchHasSport = filteredTitles.some((t) => t.toLowerCase().includes('sport'));
  console.log('Search matches Sport Car:', searchHasSport);

  // Clear search
  await searchInput.fill('');
  await page.waitForTimeout(400);

  // Test 3: Click "View all" next to Popular Topics
  console.log('3. Clicking Popular Topics -> View all...');
  const viewAllBtn = page.locator('.carousel-view-all-btn');
  await viewAllBtn.waitFor({ state: 'visible', timeout: 5000 });
  await viewAllBtn.click();
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  console.log('Current URL after clicking View all:', currentUrl);

  const directoryHeading = await page.locator('h1.explore-page-title').innerText();
  console.log('Directory Page Title:', directoryHeading);

  // Take screenshot of Topic Directory
  const directoryScreenshot = path.join(ARTIFACT_DIR, 'topic_directory_view_all.png');
  await page.screenshot({ path: directoryScreenshot, fullPage: false });
  console.log('Saved screenshot:', directoryScreenshot);

  // Test 4: Search on Topic Directory Page
  console.log('4. Searching "Sport Car" inside Topic Directory...');
  const dirSearch = page.locator('.explore-search-input');
  await dirSearch.fill('Sport Car');
  await page.waitForTimeout(500);

  const matchedCards = await page.locator('#topic-directory-stream h3').allInnerTexts();
  console.log('Matched cards in Directory:', matchedCards);

  // Test 5: Click Sport Car card to navigate to /topic/14
  console.log('5. Clicking Sport Car topic card...');
  const sportCarCard = page.locator('#topic-directory-stream h3', { hasText: /Sport Car/i }).first();
  await sportCarCard.click();
  await page.waitForTimeout(1200);

  const topicPageUrl = page.url();
  console.log('Current URL after clicking Sport Car:', topicPageUrl);

  const topicHeading = await page.locator('.community-header-title').innerText().catch(() => 'Not found');
  console.log('Topic Community Heading:', topicHeading);

  // Verify discussion feed contains the initial opinion "sport car"
  const discussionContents = await page.locator('.infeed-post-content, .original-post-content, .infeed-post-card').allInnerTexts().catch(() => []);
  console.log('Discussion snippets found on page:', discussionContents.map(s => s.slice(0, 60)));

  // Take screenshot of Topic Community Page
  const topicScreenshot = path.join(ARTIFACT_DIR, 'sport_car_topic_community_14.png');
  await page.screenshot({ path: topicScreenshot, fullPage: false });
  console.log('Saved screenshot:', topicScreenshot);

  await browser.close();
  console.log('--- Verification Complete ---');
}

verify().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
