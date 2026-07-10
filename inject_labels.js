const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Function to add <label for="id"> right before the element
function addLabels(tagName) {
    const regex = new RegExp('<' + tagName + '\\s+([^>]+)>', 'gi');
    let offset = 0;
    
    // We can't just replace because we need to check if a label already exists
    // Let's use string manipulation to inject labels.
    
    let newHtml = html;
    let match;
    
    // Reset regex index
    let matches = [];
    while ((match = regex.exec(html)) !== null) {
        matches.push(match);
    }
    
    // Process backwards to not mess up offsets
    for (let i = matches.length - 1; i >= 0; i--) {
        match = matches[i];
        const attributes = match[1];
        
        // Skip hidden inputs
        if (attributes.includes('type="hidden"') || attributes.includes("type='hidden'")) continue;
        
        const idMatch = attributes.match(/id=["']([^"']+)["']/i);
        if (idMatch) {
            const id = idMatch[1];
            // Check if there's already a label for this id anywhere in the HTML
            if (!html.includes('for="' + id + '"') && !html.includes("for='" + id + "'")) {
                let labelText = id.replace(/-/g, ' ');
                const placeholderMatch = attributes.match(/placeholder=["']([^"']+)["']/i);
                if (placeholderMatch) {
                    labelText = placeholderMatch[1];
                } else {
                     const nameMatch = attributes.match(/name=["']([^"']+)["']/i);
                     if (nameMatch) labelText = nameMatch[1];
                }
                
                // Inject the label right before the match
                const labelElement = `<label for="${id}" class="sr-only">${labelText}</label>`;
                newHtml = newHtml.substring(0, match.index) + labelElement + newHtml.substring(match.index);
            }
        } else {
            // No ID. We must add an ID to add a label for it!
            const newId = tagName + '-' + Math.random().toString(36).substring(2, 9);
            
            // Reconstruct the element with the ID
            const newElement = `<label for="${newId}" class="sr-only">Form Input</label><${tagName} id="${newId}" ${attributes}>`;
            newHtml = newHtml.substring(0, match.index) + newElement + newHtml.substring(match.index + match[0].length);
        }
    }
    html = newHtml;
}

addLabels('input');
addLabels('select');
addLabels('textarea');

fs.writeFileSync('index.html', html);
console.log('Injected missing <label> tags.');
