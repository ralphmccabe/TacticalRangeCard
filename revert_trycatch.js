const fs = require('fs');
let code = fs.readFileSync('trc_core.js', 'utf8');

code = code.replace(/try \{ window\.loadedProfilesCache = JSON\.parse\(localStorage\.getItem\('rangeCardProfiles'\) \|\| '\{\}'\); \} catch\(e\) \{ window\.loadedProfilesCache = \{\}; \}/g, 
    "window.loadedProfilesCache = JSON.parse(localStorage.getItem('rangeCardProfiles') || '{}');");

code = code.replace(/let currentFlavorIndex = 0; try \{ currentFlavorIndex = parseInt\(localStorage\.getItem\('tacticalFlavorIndex'\)\) \|\| 0; \} catch\(e\) \{\}/g, 
    "let currentFlavorIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0;");

code = code.replace(/let savedIndex = 0; try \{ savedIndex = parseInt\(localStorage\.getItem\('tacticalFlavorIndex'\)\) \|\| 0; \} catch\(e\) \{\}/g, 
    "const savedIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0;");

fs.writeFileSync('trc_core.js', code, 'utf8');
console.log('Reverted try/catch');
