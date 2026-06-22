const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if(!response.ok()) console.log('PAGE RESPONSE ERROR:', response.status(), response.url());
  });
  
  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/PROMPT_BUILDER_v8_1.html', { waitUntil: 'networkidle0' });
  
  console.log("Done evaluating page.");
  await browser.close();
})();
