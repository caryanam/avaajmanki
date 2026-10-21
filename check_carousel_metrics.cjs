const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Look at current implementation at 1440x900
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
  const carouselBox = await page.$eval('.popular-topics-section', el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  console.log('Current implementation carousel box:', carouselBox);

  const cardsBoxes = await page.$$eval('.explore-topic-carousel-card', cards => cards.map(c => {
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }));
  console.log('Current cards count:', cardsBoxes.length, 'Cards metrics:', cardsBoxes);

  const trackBox = await page.$eval('.popular-topics-track', el => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      gap: window.getComputedStyle(el).gap,
    };
  });
  console.log('Track metrics:', trackBox);

  await browser.close();
})();
