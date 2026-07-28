const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    console.log('Loading', filePath);
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    const btn = await page.$('#geo-icons-btn');
    if (btn) {
        console.log('Button #geo-icons-btn found!');
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        const tray = await page.$('#tactical-icon-tray');
        if (tray) {
            const isHidden = await page.evaluate(t => t.classList.contains('hidden'), tray);
            console.log('Tray hidden class:', isHidden);
            const display = await page.evaluate(t => window.getComputedStyle(t).display, tray);
            console.log('Tray display computed style:', display);
        } else { console.log('Tray not found in DOM!'); }
    } else { console.log('Button #geo-icons-btn NOT FOUND!'); }
    await browser.close();
})();
