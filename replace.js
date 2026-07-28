const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<i data-lucide="message-square" class="w-4 h-4"></i> COMM-LINK', '<i data-lucide="message-square" class="w-4 h-4"></i> LIVE COMMENTS');
fs.writeFileSync('index.html', html);
