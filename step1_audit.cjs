const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const viewports = [
  { width: 1536, height: 1024, name: '1536x1024' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1366, height: 768, name: '1366x768' },
];

const evidenceDir = path.join(__dirname, 'docs', 'audit_evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {};

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(evidenceDir, `initial_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const measurements = await page.evaluate(() => {
      const getRect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          selector,
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          top: Math.round(r.top),
          right: Math.round(r.right),
          bottom: Math.round(r.bottom),
          left: Math.round(r.left),
        };
      };

      const getComputed = (selector, props) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        const res = {};
        for (const p of props) {
          res[p] = style.getPropertyValue(p);
        }
        return res;
      };

      return {
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        },
        rects: {
          appHeader: getRect('.app-header'),
          appHeaderInner: getRect('.app-header-inner'),
          mainDesktopGrid: getRect('.home-desktop-grid'),
          leftSidebar: getRect('.desktop-left-sidebar'),
          leftNav: getRect('.sidebar-nav-list'),
          promoCard: getRect('.sidebar-promo-card'),
          rightSidebar: getRect('.desktop-right-sidebar'),
          trendingPulse: getRect('.desktop-right-sidebar .sidebar-widget-card:nth-of-type(1)'),
          popularTopics: getRect('.desktop-right-sidebar .sidebar-widget-card:nth-of-type(2)'),
          exploreTopics: getRect('.desktop-right-sidebar .sidebar-widget-card:nth-of-type(3)'),
          heroCarousel: getRect('.hero-carousel-card'),
          feedNavigation: getRect('.feed-tabs-row'),
          postComposer: getRect('.post-composer-card'),
        },
        styles: {
          gridTemplate: getComputed('.home-desktop-grid', ['display', 'grid-template-columns', 'gap', 'max-width', 'padding']),
          headerInner: getComputed('.app-header-inner', ['display', 'grid-template-columns', 'gap', 'max-width', 'padding']),
          leftSidebar: getComputed('.desktop-left-sidebar', ['position', 'top', 'width', 'gap']),
          rightSidebar: getComputed('.desktop-right-sidebar', ['position', 'top', 'width', 'gap']),
        }
      };
    });

    results[vp.name] = measurements;
  }

  await browser.close();

  fs.writeFileSync(path.join(evidenceDir, 'audit_initial_measurements.json'), JSON.stringify(results, null, 2));
  console.log('AUDIT_COMPLETE');
  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
