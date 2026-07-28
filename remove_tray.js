const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startStr = '<!-- TACTICAL ICON TRAY (GLOBAL) -->';
const endStr = '<!-- END TACTICAL ICON TRAY -->';

const startIndex = html.indexOf(startStr);
let endIndex = html.indexOf(endStr);
if (startIndex !== -1) {
    if (endIndex === -1) {
        // Find next comment instead
        endIndex = html.indexOf('<!--', startIndex + startStr.length);
    } else {
        endIndex += endStr.length;
    }
    
    html = html.substring(0, startIndex) + html.substring(endIndex);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Removed tray');
}
