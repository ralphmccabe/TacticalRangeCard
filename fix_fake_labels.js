const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find all <label> tags
const labelRegex = /<label([^>]*)>(.*?)<\/label>/gis;
let count = 0;
let newHtml = html.replace(labelRegex, (match, attrs, content) => {
    if (attrs.includes('for=')) {
        return match; // Leave it alone if it has a for attribute
    } else {
        // It's a fake label without a for attribute. Convert to a div.
        count++;
        return '<div' + attrs + '>' + content + '</div>';
    }
});

fs.writeFileSync('index.html', newHtml);
console.log('Fixed ' + count + ' pseudo-labels');
