// --- HUD OPS COMMAND MODE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const btnIntel = document.getElementById('hud-mode-intel');
    const btnOps = document.getElementById('hud-mode-ops');
    const viewIntel = document.getElementById('hud-view-intel');
    const viewOps = document.getElementById('hud-view-ops');

    if (btnIntel && btnOps && viewIntel && viewOps) {
        btnIntel.addEventListener('click', () => {
            btnIntel.classList.replace('bg-transparent', 'bg-orange-500/20');
            btnIntel.classList.replace('text-gray-500', 'text-orange-400');
            btnOps.classList.replace('bg-indigo-500/20', 'bg-transparent');
            btnOps.classList.replace('text-indigo-400', 'text-gray-500');
            
            viewIntel.classList.remove('hidden');
            viewOps.classList.add('hidden');
        });

        btnOps.addEventListener('click', () => {
            btnOps.classList.replace('bg-transparent', 'bg-indigo-500/20');
            btnOps.classList.replace('text-gray-500', 'text-indigo-400');
            btnIntel.classList.replace('bg-orange-500/20', 'bg-transparent');
            btnIntel.classList.replace('text-orange-400', 'text-gray-500');
            
            viewOps.classList.remove('hidden');
            viewIntel.classList.add('hidden');
        });
    }

    // Attach Intel Button
    const attachIntelBtn = document.getElementById('hud-attach-intel-btn');
    if (attachIntelBtn) {
        attachIntelBtn.addEventListener('click', () => {
            window.attachedHudIntelData = window.currentAarPayload || { snapshot: "NO_IMAGE_DATA" };
            const preview = document.getElementById('hud-attached-intel-preview');
            if (preview) preview.classList.remove('hidden');
            attachIntelBtn.classList.add('hidden');
        });
    }

    // Transmit WARNO
    const transmitWarnoBtn = document.getElementById('transmit-hud-warno-btn');
    if (transmitWarnoBtn) {
        transmitWarnoBtn.addEventListener('click', () => {
            if(!window.commsChannel || !window.commsChannel.send) {
                alert("COMMS OFFLINE. Cannot transmit.");
                return;
            }
            const situation = document.getElementById('hud-warno-situation').value;
            const mission = document.getElementById('hud-warno-mission').value;
            const execution = document.getElementById('hud-warno-execution').value;
            const admin = document.getElementById('hud-warno-admin').value;
            const command = document.getElementById('hud-warno-command').value;
            
            const payload = {
                user: window.commsUser,
                situation, mission, execution, admin, command,
                timestamp: Date.now()
            };
            
            window.commsChannel.send({ type: 'broadcast', event: 'warno', payload });
            if(window.pushTacLog) window.pushTacLog("WARNO TRANSMITTED", "SUCCESS");
            
            const orig = transmitWarnoBtn.innerHTML;
            transmitWarnoBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> SENT`;
            if(window.lucide) window.lucide.createIcons();
            setTimeout(() => { transmitWarnoBtn.innerHTML = orig; if(window.lucide) window.lucide.createIcons(); }, 2000);
        });
    }

    // Transmit Canvas
    const transmitCanvasBtn = document.getElementById('transmit-hud-canvas-btn');
    if (transmitCanvasBtn) {
        transmitCanvasBtn.addEventListener('click', () => {
            if(!window.commsChannel || !window.commsChannel.send) {
                alert("COMMS OFFLINE. Cannot transmit.");
                return;
            }
            const narrative = document.getElementById('hud-canvas-narrative').value;
            const payload = {
                user: window.commsUser,
                narrative,
                intel: window.attachedHudIntelData || null,
                timestamp: Date.now()
            };
            
            window.commsChannel.send({ type: 'broadcast', event: 'exec_log', payload });
            if(window.pushTacLog) window.pushTacLog("EXEC LOG UPLINKED", "SUCCESS");
            
            const orig = transmitCanvasBtn.innerHTML;
            transmitCanvasBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> SENT`;
            if(window.lucide) window.lucide.createIcons();
            setTimeout(() => { transmitCanvasBtn.innerHTML = orig; if(window.lucide) window.lucide.createIcons(); }, 2000);
            
            window.attachedHudIntelData = null;
            const preview = document.getElementById('hud-attached-intel-preview');
            if(preview) preview.classList.add('hidden');
            if(attachIntelBtn) attachIntelBtn.classList.remove('hidden');
        });
    }
});

// Expose open methods
window.openHudWarno = (cacheId) => {
    const data = window.chatWarnoCache[cacheId];
    if (!data) return;
    
    // Switch to Dual HUD OPS mode
    const hudModal = document.getElementById('dual-hud-modal'); // Oh wait, ID is actually dual-hud ? Wait, I will use both to be safe
    const actualModal = document.getElementById('dual-hud') || document.getElementById('dual-hud-modal');
    if(actualModal) {
        actualModal.classList.remove('hidden');
        actualModal.classList.add('flex');
    }
    
    const btnOps = document.getElementById('hud-mode-ops');
    if(btnOps) btnOps.click();

    document.getElementById('hud-warno-situation').value = data.situation || '';
    document.getElementById('hud-warno-mission').value = data.mission || '';
    document.getElementById('hud-warno-execution').value = data.execution || '';
    document.getElementById('hud-warno-admin').value = data.admin || '';
    document.getElementById('hud-warno-command').value = data.command || '';
};

window.openHudExecLog = (cacheId) => {
    const data = window.chatExecCache[cacheId];
    if (!data) return;
    
    // Switch to Dual HUD OPS mode
    const actualModal = document.getElementById('dual-hud') || document.getElementById('dual-hud-modal');
    if(actualModal) {
        actualModal.classList.remove('hidden');
        actualModal.classList.add('flex');
    }
    
    const btnOps = document.getElementById('hud-mode-ops');
    if(btnOps) btnOps.click();

    document.getElementById('hud-canvas-narrative').value = data.narrative || '';
    
    if (data.intel && data.intel.snapshot) {
        // Just note it, or handle it depending on implementation. 
        // A simple alert or a preview popup could work, but for now we'll notify.
        if(window.pushTacLog) window.pushTacLog("EXEC LOG INTEL LOADED", "SYS");
    }
};
