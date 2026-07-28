const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Open tray
    await page.evaluate(() => document.getElementById('geo-icons-btn').click());
    await new Promise(r => setTimeout(r, 500));
    
    // Click the first stamp button
    await page.evaluate(() => {
        const stampBtn = document.querySelector('.tactical-stamp-btn');
        if (stampBtn) stampBtn.click();
    });
    
    // Click the map
    await page.mouse.click(200, 200);
    await new Promise(r => setTimeout(r, 500));
    
    // Check if tacticalIconLayers has a new layer
    const count = await page.evaluate(() => window.tacticalIconLayers ? window.tacticalIconLayers.length : -1);
    console.log('Number of markers after stamp:', count);
    
    await browser.close();
})();
