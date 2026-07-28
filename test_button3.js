const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Inject a console log into the global toggle function
    await page.evaluate(() => {
        const orig = window.toggleTacticalTray;
        window.toggleTacticalTray = function(e) {
            console.log("toggleTacticalTray EXECUTED!");
            if (orig) orig(e);
        };
    });

    const btn = await page.$('#geo-icons-btn');
    if (btn) {
        console.log('Forcing click...');
        await page.evaluate(b => b.click(), btn);
        await new Promise(r => setTimeout(r, 500));
        const tray = await page.$('#tactical-icon-tray');
        if (tray) {
            const isHidden = await page.evaluate(t => t.classList.contains('hidden'), tray);
            console.log('Tray hidden class:', isHidden);
        }
    }
    await browser.close();
})();
