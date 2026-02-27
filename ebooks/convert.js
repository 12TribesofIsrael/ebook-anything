const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function htmlToPdf(htmlFile, outputFile) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const htmlPath = 'file://' + path.resolve(htmlFile).replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputFile,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await browser.close();
  console.log(`✅ Created: ${outputFile}`);
}

(async () => {
  const files = [
    ['ebook1-howto.html', 'Claude-Code-The-Playbook.pdf'],
    ['ebook2-master.html', 'Claude-Code-Mastery-Guide.pdf']
  ];
  for (const [html, pdf] of files) {
    if (fs.existsSync(html)) {
      await htmlToPdf(html, pdf);
    } else {
      console.log(`⚠️  Skipping ${html} — file not found`);
    }
  }
})();
