const fs = require('fs');

const path = 'C:\\Users\\RalphMccabe\\.gemini\\antigravity\\scratch\\TacticalRangeCard-Sandbox\\index.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ðŸ — ANIMAL/g, '🐾 ANIMAL');
content = content.replace(/ðŸª ID/g, '🪪 ID');
content = content.replace(/e\.g\. \$500 â€“ Dead or Alive/g, 'e.g. $500 – Dead or Alive');
content = content.replace(/â€“ Unknown/g, '– Unknown');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed characters in index.html');
