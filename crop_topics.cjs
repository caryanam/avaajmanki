const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });

  const tasks = [
    {
      source: 'C:/Users/Niraj Ghube/Downloads/Mental Health Sunrise Meditation Card.png',
      output: path.join(__dirname, 'src/assets/explore/mental-health-cover.jpg'),
      outputMed: path.join(__dirname, 'src/assets/explore/topic-meditation.jpg'),
      outputMH: path.join(__dirname, 'src/assets/explore/topic-mental-health.jpg'),
    },
    {
      source: 'C:/Users/Niraj Ghube/Downloads/Education at Golden Hour.png',
      output: path.join(__dirname, 'src/assets/explore/education-cover.jpg'),
      outputEdu: path.join(__dirname, 'src/assets/explore/topic-education.jpg'),
    }
  ];

  for (const t of tasks) {
    if (!fs.existsSync(t.source)) {
      console.log('Source does not exist:', t.source);
      continue;
    }
    const fileUrl = 'file:///' + t.source.replace(/\\/g, '/');
    await page.goto(fileUrl);

    // The image is displayed in browser. Let's find the photo area.
    const crop = await page.evaluate(() => {
      const img = document.querySelector('img');
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const midX = Math.floor(img.naturalWidth / 2);
      let photoBottom = 0;
      for (let y = 100; y < img.naturalHeight; y++) {
        const p = ctx.getImageData(midX, y, 1, 1).data;
        if (p[0] > 250 && p[1] > 250 && p[2] > 250) {
          photoBottom = y;
          break;
        }
      }

      const testY = 250;
      let photoLeft = 0;
      for (let x = 0; x < img.naturalWidth; x++) {
        const p = ctx.getImageData(x, testY, 1, 1).data;
        if (!(p[0] > 240 && p[1] > 240 && p[2] > 240)) {
          photoLeft = x;
          break;
        }
      }

      let photoRight = img.naturalWidth;
      for (let x = img.naturalWidth - 1; x >= 0; x--) {
        const p = ctx.getImageData(x, testY, 1, 1).data;
        if (!(p[0] > 240 && p[1] > 240 && p[2] > 240)) {
          photoRight = x;
          break;
        }
      }

      let photoTop = 0;
      for (let y = 0; y < img.naturalHeight; y++) {
        const p = ctx.getImageData(midX, y, 1, 1).data;
        if (!(p[0] > 240 && p[1] > 240 && p[2] > 240)) {
          photoTop = y;
          break;
        }
      }

      return {
        x: photoLeft,
        y: photoTop,
        width: photoRight - photoLeft,
        height: photoBottom - photoTop
      };
    });

    console.log(path.basename(t.source), 'detected crop:', crop);

    // Now extract clean photography to a canvas and save as jpeg
    await page.evaluate((c) => {
      const img = document.querySelector('img');
      const cvs = document.createElement('canvas');
      cvs.id = 'crop-canvas';
      cvs.width = c.width;
      cvs.height = c.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
      document.body.appendChild(cvs);
    }, crop);

    const canvasEl = await page.$('#crop-canvas');
    const buf = await canvasEl.screenshot({ type: 'jpeg', quality: 90 });
    fs.writeFileSync(t.output, buf);
    if (t.outputMed) fs.writeFileSync(t.outputMed, buf);
    if (t.outputMH) fs.writeFileSync(t.outputMH, buf);
    if (t.outputEdu) fs.writeFileSync(t.outputEdu, buf);
    console.log('Saved cropped pure photography for:', path.basename(t.source));

    await page.evaluate(() => {
      const el = document.getElementById('crop-canvas');
      if (el) el.remove();
    });
  }

  await browser.close();
}

main().catch(console.error);
