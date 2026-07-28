const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const trayStart = '<!-- TACTICAL ICON TRAY (GLOBAL) -->';
const trayEnd = '<!-- END TACTICAL ICON TRAY -->';

const startIndex = html.indexOf(trayStart);
if (startIndex !== -1) {
    let endIndex = html.indexOf(trayEnd);
    if (endIndex !== -1) {
        endIndex += trayEnd.length;
        html = html.substring(0, startIndex) + html.substring(endIndex);
    } else {
        // Fallback: search for next script tag, which is the start of the error handler
        endIndex = html.indexOf('<script>', startIndex);
        if (endIndex !== -1) {
            html = html.substring(0, startIndex) + html.substring(endIndex);
        }
    }
}

// Remove button
const btnStart = html.indexOf('<button id="geo-icons-btn"');
if (btnStart !== -1) {
    const btnEnd = html.indexOf('</button>', btnStart) + 9;
    html = html.substring(0, btnStart) + html.substring(btnEnd);
}

fs.writeFileSync('index.html', html, 'utf8');
