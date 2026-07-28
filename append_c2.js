const fs = require('fs');
let code = fs.readFileSync('trc_core.js', 'utf8');

const appendCode = `\n// ============================================================================
// C2 COMMAND INTEGRATION
// ============================================================================
window.myDutyStatus = null;
document.addEventListener('DOMContentLoaded', () => {
    const c2DutyStatus = document.getElementById('c2-duty-status');
    if (c2DutyStatus) {
        c2DutyStatus.addEventListener('change', (e) => {
            window.myDutyStatus = e.target.value;
            // Force immediate track update
            if (typeof commsChannel !== 'undefined' && commsChannel && typeof commsUser !== 'undefined') {
                commsChannel.track({
                    online_at: new Date().toISOString(),
                    location: window.myLatestCoords || null,
                    user: commsUser,
                    distress: window.isDistressActive || false,
                    dutyStatus: window.myDutyStatus
                }).catch(err => console.warn("C2 status track update failed:", err));
                if (window.pushTacLog) {
                    window.pushTacLog(\`DUTY STATUS UPDATED\`, 'SUCCESS');
                }
            }
        });
    }

    const c2CopyBtn = document.getElementById('c2-copy-coords-btn');
    if (c2CopyBtn) {
        c2CopyBtn.addEventListener('click', () => {
            if (window.myLatestCoords) {
                const coordStr = \`\${window.myLatestCoords.lat.toFixed(6)}, \${window.myLatestCoords.lng.toFixed(6)}\`;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(coordStr).then(() => {
                        if (window.pushTacLog) window.pushTacLog(\`GPS COORDS COPIED TO CLIPBOARD\`, 'SUCCESS');
                    }).catch(err => {
                        console.error('Clipboard error:', err);
                        window.prompt("Copy to clipboard: Ctrl+C, Enter", coordStr);
                    });
                } else {
                    window.prompt("Copy to clipboard: Ctrl+C, Enter", coordStr);
                }
            } else {
                if (window.pushTacLog) window.pushTacLog(\`NO GPS SIGNAL LOCK YET\`, 'ERROR');
                alert("Cannot copy coordinates: GPS signal not acquired yet.");
            }
        });
    }
});
`;

if (!code.includes('C2 COMMAND INTEGRATION')) {
    fs.appendFileSync('trc_core.js', appendCode);
}
