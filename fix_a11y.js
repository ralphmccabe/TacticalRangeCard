const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix QR code alt attribute
html = html.replace('<img id="gametag-render-qr"', '<img id="gametag-render-qr" alt="QR Code"');

// Function to add aria-label to form elements
function addAriaLabels(tagName) {
    const regex = new RegExp('<' + tagName + '\\s+([^>]+)>', 'gi');
    html = html.replace(regex, (match, attributes) => {
        if (attributes.includes('aria-label=')) return match;
        
        let label = 'Form input';
        const placeholderMatch = attributes.match(/placeholder=["']([^"']+)["']/i);
        if (placeholderMatch && placeholderMatch[1]) {
            label = placeholderMatch[1];
        } else {
            const idMatch = attributes.match(/id=["']([^"']+)["']/i);
            if (idMatch && idMatch[1]) {
                label = idMatch[1].replace(/-/g, ' ');
            } else {
                const nameMatch = attributes.match(/name=["']([^"']+)["']/i);
                if (nameMatch && nameMatch[1]) {
                    label = nameMatch[1].replace(/-/g, ' ');
                } else if (tagName === 'button') {
                    label = 'Action Button';
                }
            }
        }
        
        return '<' + tagName + ' aria-label="' + label + '" ' + attributes + '>';
    });
}

addAriaLabels('input');
addAriaLabels('select');
addAriaLabels('textarea');
addAriaLabels('button');

fs.writeFileSync('index.html', html);
console.log('Fixed accessibility issues in index.html');
