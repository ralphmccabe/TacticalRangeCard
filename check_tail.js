const fs = require('fs'); const lines = fs.readFileSync('sandbox_tail.txt', 'utf8').split('\n'); lines.forEach((l,i) => { if (l.match(/[^\x00-\x7F]/)) console.log(i + ': ' + l); });
