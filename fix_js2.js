const fs = require('fs');
let js = fs.readFileSync('trc_core.js', 'utf8');

js = js.replace(
    /window\.loadedProfilesCache = JSON\.parse\(localStorage\.getItem\('rangeCardProfiles'\) \|\| '\{\}'\);/g,
    "try { window.loadedProfilesCache = JSON.parse(localStorage.getItem('rangeCardProfiles') || '{}'); } catch(e) { window.loadedProfilesCache = {}; }"
);

fs.writeFileSync('trc_core.js', js, 'utf8');
