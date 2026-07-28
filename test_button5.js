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
    
    const tray = await page.$('#tactical-icon-tray');
    if (tray) {
        const isHidden = await page.evaluate(t => t.classList.contains('hidden'), tray);
        console.log('Tray hidden class after click:', isHidden);
    } else {
        console.log('Tray not found');
    }
    
    await browser.close();
})();
