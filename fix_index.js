const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract the ICONS button block
const btnStart = html.indexOf('<button id="geo-icons-btn"');
const btnEnd = html.indexOf('</button>', btnStart) + 9;
const iconBtnHtml = html.substring(btnStart, btnEnd);
console.log("Extracted button length:", iconBtnHtml.length);

// 2. Remove the button from its current position
html = html.substring(0, btnStart) + html.substring(btnEnd);

// 3. Fix the malformed button tag
html = html.replace('<button \r\n                                      <button id="geo-states-btn"', '<button id="geo-states-btn"');
html = html.replace('<button \n                                      <button id="geo-states-btn"', '<button id="geo-states-btn"');
html = html.replace(/<button\s+<button id="geo-states-btn"/g, '<button id="geo-states-btn"');

// 4. Insert the ICONS button AFTER the COUNTY LINES button
const countyLinesBtnMarker = 'id="geo-counties-btn"';
const countyEnd = html.indexOf('</button>', html.indexOf(countyLinesBtnMarker)) + 9;
html = html.substring(0, countyEnd) + '\n                                        ' + iconBtnHtml + html.substring(countyEnd);

fs.writeFileSync('index.html', html, 'utf8');
