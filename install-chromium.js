const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  console.log('Chromium installed successfully');
  await browser.close();
})();