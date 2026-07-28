const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    await page.evaluate(() => document.getElementById('geo-icons-btn').click());
    await new Promise(r => setTimeout(r, 100));
    
    // Check if tray is visible
    const isHidden = await page.evaluate(() => document.getElementById('tactical-icon-tray').classList.contains('hidden'));
    console.log('Tray hidden:', isHidden);
    
    // Click the first stamp button
    await page.evaluate(() => {
        const stampBtn = document.querySelector('.tactical-stamp-btn');
        if (stampBtn) stampBtn.click();
    });
    
    // Check activeIconStamp
    const activeStamp = await page.evaluate(() => window.activeIconStamp);
    console.log('Active stamp:', activeStamp);
    
    // Try to trigger leaflet map click
    await page.evaluate(() => {
        window.orbitalMap.fire('click', { latlng: { lat: 0, lng: 0 } });
    });
    
    const count = await page.evaluate(() => window.tacticalIconLayers ? window.tacticalIconLayers.length : -1);
    console.log('Number of markers after fire click:', count);
    
    await browser.close();
})();
