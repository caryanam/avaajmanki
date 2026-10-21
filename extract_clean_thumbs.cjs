const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function extractThumbs() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 682 } });
  const refPath = 'file:///' + 'C:/Users/Niraj Ghube/.gemini/antigravity/brain/277148e6-835c-4a0f-a7d7-8d882831d11b/approved_reference.jpg'.replace(/\\/g, '/');
  
  await page.goto(refPath);

  // In approved_reference.jpg (1024x682):
  // Let's find the exact bounding boxes of the 4 thumbnails in Explore More Topics
  // In the image, right sidebar is around x = 750 to 980
  // Explore More Topics is at the bottom right.
  // Let's sample and crop each of the 4 thumbnails:
  // Mental Health: approx x: 762, y: 474, w: 36, h: 36
  // Personal Growth: approx x: 762, y: 528, w: 36, h: 36
  // Friendship: approx x: 762, y: 580, w: 36, h: 36
  // Education: approx x: 762, y: 632, w: 36, h: 36

  const clips = [
    { name: 'topic-mental-health.jpg', clip: { x: 760, y: 472, width: 38, height: 38 } },
    { name: 'topic-personal-growth.jpg', clip: { x: 760, y: 524, width: 38, height: 38 } },
    { name: 'topic-friendship.jpg', clip: { x: 760, y: 576, width: 38, height: 38 } },
    { name: 'topic-education.jpg', clip: { x: 760, y: 628, width: 38, height: 38 } },
  ];

  for (const c of clips) {
    const dest = path.join(__dirname, 'src', 'assets', 'home', c.name);
    await page.screenshot({ path: dest, clip: c.clip });
    console.log('Saved clean thumb:', c.name);
  }

  await browser.close();
}

extractThumbs().catch(console.error);
