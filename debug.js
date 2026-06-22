const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => console.log('PAGE RESPONSE:', response.status(), response.url()));
  page.on('requestfailed', request => console.log('PAGE REQUEST FAILED:', request.failure().errorText, request.url()));

  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/PROMPT_BUILDER_v8_0.html');
  
  console.log("Page loaded. Triggering runBacktest...");
  
  await page.evaluate(() => {
    if(window.HavuzMotoru && window.HavuzMotoru.runBacktest) {
       window.HavuzMotoru.runBacktest();
    } else {
       console.log("HavuzMotoru not found!");
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Triggering autoTune...");
  await page.evaluate(() => {
    if(window.HavuzMotoru && window.HavuzMotoru.autoTune) {
       window.HavuzMotoru.autoTune();
    }
  });

  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
