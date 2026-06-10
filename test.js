const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching headless Chromium...");
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                '--disable-web-security'
            ]
        });

        console.log("Opening Page 1...");
        const page1 = await browser.newPage();
        page1.on('console', msg => console.log('PAGE 1:', msg.text()));
        
        // Assume npx http-server is running on 8080? If not, we can just use file:// path.
        const path = require('path');
        const indexUrl = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
        
        console.log("Navigating to: " + indexUrl);
        await page1.goto(indexUrl);

        await page1.type('#comms-team', 'ALPHA');
        await page1.type('#comms-callsign', 'TEST1');
        await page1.type('#comms-role', 'ADMIN');
        await page1.type('#comms-passcode', 'MissionCode!1234');
        await page1.waitForSelector('#launchToolsDashboardBtn', { visible: true, timeout: 5000 });
        await page1.click('#launchToolsDashboardBtn');
        // Open comms panel first
        await page1.waitForSelector('#comms-connect-btn', { visible: true, timeout: 5000 });
        await page1.click('#comms-connect-btn');
        console.log("Clicked connect. Waiting for dashboard...");
        await page1.waitForSelector('#comms-dashboard', { visible: true, timeout: 10000 });
        
        // Try to send a chat message
        console.log("Sending chat message...");
        await page1.type('#chat-input', 'HELLO WORLD');
        await page1.click('#chat-send-btn');
        await new Promise(r => setTimeout(r, 2000));

        const logs1 = await page1.evaluate(() => {
            const audit = document.getElementById('tac-logs');
            return audit ? audit.innerText : "No logs found";
        });
        console.log("PAGE 1 AUDIT LOGS:\\n" + logs1);

        console.log("Opening Page 2...");
        const page2 = await browser.newPage();
        page2.on('console', msg => console.log('PAGE 2:', msg.text()));
        await page2.goto(indexUrl);
        await page2.waitForSelector('#launchToolsDashboardBtn', { visible: true, timeout: 5000 });
        await page2.click('#launchToolsDashboardBtn');
        console.log("Typing login info on Page 2...");
        await page2.waitForSelector('#comms-connect-btn', { visible: true, timeout: 5000 });
        await page2.type('#comms-team', 'ALPHA');
        await page2.type('#comms-callsign', 'TEST2');
        await page2.type('#comms-role', 'ASSAULT');
        await page2.type('#comms-passcode', 'MissionCode!1234');
        
        await page2.click('#comms-connect-btn');
        console.log("Clicked connect. Waiting for dashboard...");
        await page2.waitForSelector('#comms-dashboard', { visible: true, timeout: 10000 });
        
        // Wait for WebRTC negotiation
        await new Promise(r => setTimeout(r, 5000));

        const logs2 = await page2.evaluate(() => {
            const audit = document.getElementById('tac-logs');
            return audit ? audit.innerText : "No logs found";
        });
        console.log("PAGE 2 AUDIT LOGS:\\n" + logs2);

        await browser.close();
        console.log("Test finished.");
    } catch(e) {
        console.error("Test failed", e);
    }
})();
