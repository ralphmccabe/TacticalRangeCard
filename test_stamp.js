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
    
    // Click an emoji stamp
    await page.evaluate(() => {
        const btn = document.querySelector('.tactical-stamp-btn');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    
    // Check if cursor is crosshair
    const cursor = await page.evaluate(() => window.orbitalMap.getContainer().style.cursor);
    console.log("Cursor after stamp selection:", cursor);
    
    // Check if activeIconStamp is set
    const active = await page.evaluate(() => window.activeIconStamp);
    console.log("Active stamp:", active);
    
    // Click the map
    await page.evaluate(() => {
        window.orbitalMap.fire('click', { latlng: { lat: 40, lng: -105 } });
    });
    
    // Check if marker was added
    const markerCount = await page.evaluate(() => window.tacticalIconLayers.length);
    console.log("Marker count after map click:", markerCount);
    
    await browser.close();
})();
