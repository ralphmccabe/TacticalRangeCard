const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const polyfill = "<!-- LOCALSTORAGE POLYFILL -->\n<script>\ntry {\n  localStorage.getItem('x');\n} catch(e) {\n  let mem = {};\n  Object.defineProperty(window, 'localStorage', {\n    value: { getItem: k => mem[k]||null, setItem: (k,v) => mem[k]=String(v), removeItem: k => delete mem[k], clear: () => mem={} },\n    writable: false, configurable: true, enumerable: true\n  });\n}\n</script>\n";

if (!html.includes('LOCALSTORAGE POLYFILL')) {
    html = html.replace('<head>', '<head>\n' + polyfill);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Polyfill injected');
} else {
    console.log('Polyfill already exists');
}
