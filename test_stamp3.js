const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Explicitly drop icon
    await page.evaluate(() => {
        if (window.dropTacticalIcon) {
            window.dropTacticalIcon(30, -90, '??');
        }
    });
    
    const count = await page.evaluate(() => window.tacticalIconLayers ? window.tacticalIconLayers.length : -1);
    console.log('Number of markers after manual drop:', count);
    
    await browser.close();
})();
