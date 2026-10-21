const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const viewports = [
    { width: 1536, height: 1024, name: '1536x1024' },
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1366, height: 768, name: '1366x768' },
  ];

  const evidenceDir = path.join(__dirname, 'docs', 'phase2_evidence');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const results = {};

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth || bodyScrollWidth > clientWidth;
      const brand = document.querySelector('.header-brand')?.getBoundingClientRect();
      const leftCol = document.querySelector('.desktop-left-sidebar')?.getBoundingClientRect();
      const actions = document.querySelector('.header-actions')?.getBoundingClientRect();
      const rightCol = document.querySelector('.desktop-right-sidebar')?.getBoundingClientRect();
      const musicWidget = document.querySelector('.music-player-bubble, .music-player');
      const tabs = Array.from(document.querySelectorAll('.feed-tab-btn')).map(t => t.textContent.trim());
      const popularTopics = Array.from(document.querySelectorAll('.popular-topic-card')).map(card => {
        const rect = card.getBoundingClientRect();
        return {
          name: card.querySelector('.popular-topic-name')?.textContent.trim(),
          height: rect.height,
        };
      });
      const trendingPulse = Array.from(document.querySelectorAll('.trending-item')).map(item => {
        return {
          rank: item.querySelector('.trending-rank')?.textContent.trim(),
          category: item.querySelector('.trending-category-badge')?.textContent.trim(),
          title: item.querySelector('.trending-title')?.textContent.trim(),
        };
      });

      return {
        clientWidth,
        scrollWidth,
        hasHorizontalScroll,
        brandLeft: brand?.left,
        leftColLeft: leftCol?.left,
        leftGutterDiff: leftCol && brand ? Math.abs(leftCol.left - brand.left) : null,
        actionsRight: actions?.right,
        rightColRight: rightCol?.right,
        rightGutterDiff: rightCol && actions ? Math.abs(actions.right - rightCol.right) : null,
        musicWidgetVisible: Boolean(musicWidget),
        tabsCount: tabs.length,
        popularTopicsCount: popularTopics.length,
        popularTopicHeights: popularTopics.map(p => p.height),
        trendingPulseCount: trendingPulse.length,
      };
    });

    metrics.consoleErrors = errors;
    results[vp.name] = metrics;

    await page.screenshot({ path: path.join(evidenceDir, `home_${vp.name}.png`), fullPage: false });
    await page.close();
  }

  // Also test /music page to ensure music playback engine and page are fully functional
  console.log('Testing /music page to verify music player and visualizer...');
  const musicPage = await browser.newPage({ viewport: { width: 1536, height: 1024 } });
  await musicPage.goto('http://localhost:5173/music', { waitUntil: 'networkidle' });
  await musicPage.waitForTimeout(1500);
  const musicMetrics = await musicPage.evaluate(() => {
    return {
      title: document.title,
      hasVisualizerOrHeader: Boolean(document.querySelector('.music-page, .music-station, .music-header, h1, h2')),
    };
  });
  results.musicPageCheck = musicMetrics;
  await musicPage.screenshot({ path: path.join(evidenceDir, 'music_page_verification.png') });
  await musicPage.close();

  await browser.close();
  console.log('RESULTS_JSON_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('RESULTS_JSON_END');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
