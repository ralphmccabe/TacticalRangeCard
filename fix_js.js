const fs = require('fs');
let js = fs.readFileSync('trc_core.js', 'utf8');

// Wrap tacticalFlavorIndex localStorage
js = js.replace(
    /let currentFlavorIndex = parseInt\(localStorage\.getItem\('tacticalFlavorIndex'\)\) \|\| 0;/g,
    "let currentFlavorIndex = 0; try { currentFlavorIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0; } catch(e) {}"
);
js = js.replace(
    /const savedIndex = parseInt\(localStorage\.getItem\('tacticalFlavorIndex'\)\) \|\| 0;/g,
    "let savedIndex = 0; try { savedIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0; } catch(e) {}"
);

// We need to change 'const savedIndex' to 'let savedIndex' in the next line if there is one
js = js.replace('const savedIndex = 0; try', 'let savedIndex = 0; try');

fs.writeFileSync('trc_core.js', js, 'utf8');
