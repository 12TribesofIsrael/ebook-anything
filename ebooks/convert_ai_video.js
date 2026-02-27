const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const htmlFile = path.resolve(__dirname, '../courses/ai-video-creation/ai-video-creation-ebook.html');
  const pdfFile = path.resolve(__dirname, '../courses/ai-video-creation/ai-video-creation-ebook.pdf');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + htmlFile.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfFile,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await browser.close();
  console.log('✅ Created: ai-video-creation-ebook.pdf');
})();
