const puppeteer = require('puppeteer');

(async () => {
  console.log('Downloading Chromium...');
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('982053');
  console.log(`Chromium downloaded to ${revisionInfo.folderPath}`);
})();