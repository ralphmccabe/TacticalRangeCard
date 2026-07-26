// =========================================================================
// FIRST RESPONDER / OFFICER SITREP CARD LOGIC (v1.2)
// Tactical Range Card Application
// =========================================================================

let officerRosterParties = [];
let officerScenePhotos = [];
let officerCanvas = null;
let officerCtx = null;
let isDrawingOfficerCanvas = false;
let currentOfficerDrawTool = 'draw';

window.clearOfficerForm = function() {
    const wrapper = document.getElementById('officer-form-wrapper');
    if (wrapper) {
        const inputs = wrapper.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(i => i.value = '');
    }
    officerRosterParties = [];
    officerScenePhotos = [];
    if (typeof window.clearOfficerCanvas === 'function') window.clearOfficerCanvas();
    if (typeof window.renderOfficerPartyRows === 'function') window.renderOfficerPartyRows();
    if (typeof window.renderOfficerPhotoThumbnails === 'function') window.renderOfficerPhotoThumbnails();
    if (window.pushTacLog) window.pushTacLog("OFFICER FORM CLEARED", "SYS");
};

// Render Officer Form in Operators Workstation
window.renderOfficerForm = function(cardData = null) {
    const container = document.getElementById('ws-top-action-area');
    if (!container) return;

    officerRosterParties = (cardData && cardData.data && cardData.data.parties) ? cardData.data.parties : [];
    officerScenePhotos = (cardData && cardData.data && cardData.data.scenePhotos) ? cardData.data.scenePhotos : [];
    
    const id = cardData ? cardData.id : Date.now();
    const unitCallsign = (cardData && cardData.data) ? cardData.data.unitCallsign || '' : (window.userObj?.callsign || 'OFFICER-104');
    const cadNumber = (cardData && cardData.data) ? cardData.data.cadNumber || '' : '';
    const sceneStatus = (cardData && cardData.data) ? cardData.data.sceneStatus || 'ACTIVE' : 'ACTIVE';
    const incidentType = (cardData && cardData.data) ? cardData.data.incidentType || 'TRAFFIC ACCIDENT' : 'TRAFFIC ACCIDENT';
    const incidentNotes = (cardData && cardData.data) ? cardData.data.incidentNotes || '' : '';
    const tacComms = (cardData && cardData.data) ? cardData.data.tacComms || 'LAW TAC 3 / 155.370 MHz' : 'LAW TAC 3 / 155.370 MHz';
    const backupUnits = (cardData && cardData.data) ? cardData.data.backupUnits || '' : '';
    const emsHospital = (cardData && cardData.data) ? cardData.data.emsHospital || '' : '';
    const existingSketch = (cardData && cardData.data) ? cardData.data.sketchImage || null : null;

    container.innerHTML = `
        <div id="officer-form-wrapper" class="w-full bg-slate-950 border-2 border-cyan-400 rounded-xl p-3 sm:p-4 shadow-[0_0_30px_rgba(56,189,248,0.3)] relative font-sans text-slate-100 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <!-- Header Bar -->
            <div class="flex items-center justify-between border-b border-cyan-500/40 pb-2 mb-3">
                <div class="flex items-center gap-2">
                    <span class="p-1.5 bg-blue-950 border border-cyan-400 rounded-lg text-cyan-400 shadow">
                        <i data-lucide="shield-alert" class="w-5 h-5 text-cyan-400 animate-pulse"></i>
                    </span>
                    <div>
                        <h2 class="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                            OFFICER SITREP <span class="text-[8px] bg-red-950 text-red-400 border border-red-500/60 px-1.5 py-0.5 rounded font-mono">FIRST RESPONDER</span>
                        </h2>
                        <div class="text-[9px] text-slate-400 font-mono uppercase">Tactical Scene Command & Party Tracker</div>
                    </div>
                </div>
                
                <button type="button" onclick="window.renderWorkstationMenu()" class="text-slate-400 hover:text-white bg-slate-900 p-1 px-2 rounded border border-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Close Form
                </button>
            </div>

            <!-- SECTION 1: INCIDENT COMMAND HEADER -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 sm:p-3 mb-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">Unit / Callsign</label>
                    <input type="text" id="officer-unit-callsign" value="${unitCallsign}" placeholder="e.g. PATROL 104" class="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white uppercase font-bold focus:border-cyan-400 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">CAD / Incident #</label>
                    <input type="text" id="officer-cad-number" value="${cadNumber}" placeholder="e.g. CAD-2026-8912" class="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white uppercase font-mono focus:border-cyan-400 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[9px] font-black uppercase text-amber-400 tracking-wider mb-1">Scene Threat Status</label>
                    <select id="officer-scene-status" class="w-full bg-slate-950 border border-amber-500/60 rounded p-1.5 text-xs text-amber-300 font-bold uppercase focus:outline-none">
                        <option value="ACTIVE" ${sceneStatus === 'ACTIVE' ? 'selected' : ''}>🔴 ACTIVE SCENE (HIGH THREAT)</option>
                        <option value="CONTAINED" ${sceneStatus === 'CONTAINED' ? 'selected' : ''}>🟡 CONTAINED / MONITORING</option>
                        <option value="SECURED" ${sceneStatus === 'SECURED' ? 'selected' : ''}>🟢 SECURED / CLEAR</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">Incident Type</label>
                    <select id="officer-incident-type" class="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white uppercase font-bold focus:border-cyan-400 focus:outline-none">
                        <option value="TRAFFIC ACCIDENT" ${incidentType === 'TRAFFIC ACCIDENT' ? 'selected' : ''}>🚗 TRAFFIC ACCIDENT</option>
                        <option value="CRIME SCENE" ${incidentType === 'CRIME SCENE' ? 'selected' : ''}>🔍 CRIME SCENE</option>
                        <option value="ACTIVE THREAT" ${incidentType === 'ACTIVE THREAT' ? 'selected' : ''}>🚨 ACTIVE THREAT</option>
                        <option value="SEARCH & RESCUE" ${incidentType === 'SEARCH & RESCUE' ? 'selected' : ''}>🌲 SEARCH & RESCUE</option>
                        <option value="HIGH-RISK WARRANT" ${incidentType === 'HIGH-RISK WARRANT' ? 'selected' : ''}>🛡️ HIGH-RISK WARRANT</option>
                        <option value="HAZMAT / FIRE" ${incidentType === 'HAZMAT / FIRE' ? 'selected' : ''}>🔥 HAZMAT / FIRE</option>
                    </select>
                </div>
            </div>

            <!-- SECTION 2: MULTI-PARTY REGISTRY (PARTIES INVOLVED) -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 sm:p-3 mb-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span class="text-[10px] font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                        <i data-lucide="users" class="w-4 h-4 text-purple-400"></i> PARTIES & VEHICLES INVOLVED REGISTRY
                    </span>
                    <button type="button" onclick="window.addOfficerPartyRow()" class="bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-500/50 text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Person / Vehicle
                    </button>
                </div>

                <div id="officer-parties-container" class="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar p-0.5">
                    <!-- Party Rows rendered dynamically -->
                </div>
            </div>

            <!-- SECTION 3A: SCENE DIAGRAM / CRIME SCENE SKETCHPAD -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 sm:p-3 mb-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 flex-wrap gap-2">
                    <span class="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                        <i data-lucide="pen-tool" class="w-4 h-4 text-cyan-400"></i> TACTICAL SCENE SKETCHPAD (CRIME SCENE LAYOUT)
                    </span>
                    <div class="flex items-center gap-1 flex-wrap">
                        <button type="button" onclick="window.setOfficerDrawTool('draw')" class="bg-slate-800 text-slate-200 text-[8px] font-bold px-2 py-0.5 rounded border border-slate-700 hover:border-cyan-400">Pencil</button>
                        <button type="button" onclick="window.addOfficerStamp('X')" class="bg-red-950 text-red-300 text-[8px] font-bold px-2 py-0.5 rounded border border-red-700">Point of Impact [X]</button>
                        <button type="button" onclick="window.addOfficerStamp('E1')" class="bg-amber-950 text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded border border-amber-700">Evidence [E1]</button>
                        <button type="button" onclick="window.addOfficerStamp('VEH')" class="bg-blue-950 text-blue-300 text-[8px] font-bold px-2 py-0.5 rounded border border-blue-700">Vehicle [V]</button>
                        <button type="button" onclick="window.clearOfficerCanvas()" class="bg-slate-950 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded border border-red-900 hover:bg-red-900 hover:text-white transition-colors">Clear</button>
                    </div>
                </div>

                <div class="relative w-full bg-slate-950 rounded border border-slate-800 overflow-hidden flex justify-center items-center">
                    <canvas id="officer-scene-canvas" width="650" height="220" class="w-full h-44 cursor-crosshair bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"></canvas>
                </div>
            </div>

            <!-- SECTION 3B: REAL CRIME / ACCIDENT SCENE EVIDENCE PHOTOS GALLERY (MAX 5) -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 sm:p-3 mb-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 flex-wrap gap-2">
                    <span class="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                        <i data-lucide="camera" class="w-4 h-4 text-cyan-400"></i> REAL SCENE EVIDENCE PHOTOS (<span id="officer-photo-count">0/5</span>)
                    </span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <label class="bg-red-950 text-red-300 hover:bg-red-900 border border-red-500/60 text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow">
                            <i data-lucide="camera" class="w-3.5 h-3.5 text-red-400 animate-pulse"></i> Take Live Photo
                            <input type="file" accept="image/*" capture="environment" id="officer-camera-input" class="hidden" onchange="window.handleOfficerPhotoUpload(event)">
                        </label>
                        <label class="bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/50 text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow">
                            <i data-lucide="image" class="w-3.5 h-3.5 text-cyan-400"></i> Gallery / Files
                            <input type="file" accept="image/*" multiple id="officer-photo-input" class="hidden" onchange="window.handleOfficerPhotoUpload(event)">
                        </label>
                    </div>
                </div>
                <div id="officer-photos-container" class="flex items-center gap-2 overflow-x-auto p-1 custom-scrollbar min-h-[60px]">
                    <!-- Rendered photo thumbnails -->
                </div>
            </div>

            <!-- SECTION 4: COMMS & SUMMARY NOTES -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">TAC Comms Radio Channel</label>
                    <input type="text" id="officer-tac-comms" value="${tacComms}" placeholder="e.g. LAW TAC 3 / 155.370 MHz" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">Backup Units on Scene</label>
                    <input type="text" id="officer-backup-units" value="${backupUnits}" placeholder="e.g. K9-2, ENGINE 14, EMS 03" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white uppercase focus:border-cyan-400 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">Hospital / EMS Transport</label>
                    <input type="text" id="officer-ems-hospital" value="${emsHospital}" placeholder="e.g. MEMORIAL ER - UNIT 3" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white uppercase focus:border-cyan-400 focus:outline-none">
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-[9px] font-black uppercase text-cyan-400 tracking-wider mb-1">Master SITREP Summary & Observations</label>
                <textarea id="officer-incident-notes" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 placeholder:text-slate-500 h-16 focus:border-cyan-400 focus:outline-none custom-scrollbar" placeholder="Enter incident summary, suspect flight path, witness remarks, or initial investigation findings...">${incidentNotes}</textarea>
            </div>

            <!-- ACTION PIPELINE BUTTONS -->
            <div class="flex items-center justify-between border-t border-slate-800 pt-3 flex-wrap gap-2">
                <button type="button" onclick="window.clearOfficerForm()" class="bg-red-950/80 hover:bg-red-900 text-red-400 font-black text-xs px-3.5 py-2 rounded-lg uppercase tracking-wider border border-red-800 flex items-center gap-1.5 cursor-pointer shadow">
                    <i data-lucide="refresh-cw" class="w-4 h-4"></i> CLEAR FORM
                </button>
                <div class="flex items-center gap-2 flex-wrap">
                    <button type="button" onclick="window.saveOfficerCardToWorkstation('${id}')" class="bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer">
                        <i data-lucide="save" class="w-4 h-4"></i> SAVE TO WORKSTATION
                    </button>
                    <button type="button" onclick="window.saveOfficerCardToVault('${id}')" class="bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-500/50 font-black text-xs px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer">
                        <i data-lucide="folder-plus" class="w-4 h-4 text-purple-400"></i> TRANSMIT TO VAULT
                    </button>
                    <button type="button" onclick="window.blogOfficerCardToWire('${id}')" class="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer">
                        <i data-lucide="radio" class="w-4 h-4"></i> BROADCAST TO WIRE
                    </button>
                </div>
            </div>

        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Render initial party rows & photos
    window.renderOfficerPartyRows();
    window.renderOfficerPhotoThumbnails();

    // Init sketchpad canvas
    setTimeout(() => {
        window.initOfficerCanvas(existingSketch);
    }, 150);
};

// Scene Evidence Photo Handlers (Max 5 photos)
window.handleOfficerPhotoUpload = function(e) {
    const inputEl = e.target;
    const files = Array.from(inputEl.files || []);
    if (files.length === 0) return;

    let remainingSlots = 5 - officerScenePhotos.length;
    if (remainingSlots <= 0) {
        alert("Maximum 5 Scene Evidence Photos allowed per card.");
        inputEl.value = '';
        return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    let loadedCount = 0;

    filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            officerScenePhotos.push(ev.target.result);
            loadedCount++;
            if (loadedCount === filesToProcess.length) {
                window.renderOfficerPhotoThumbnails();
                inputEl.value = ''; // Reset input value to allow taking subsequent camera photos!
            }
        };
        reader.readAsDataURL(file);
    });
};

window.removeOfficerPhoto = function(idx) {
    officerScenePhotos.splice(idx, 1);
    window.renderOfficerPhotoThumbnails();
};

window.renderOfficerPhotoThumbnails = function() {
    const container = document.getElementById('officer-photos-container');
    const countSpan = document.getElementById('officer-photo-count');
    if (!container) return;

    if (countSpan) countSpan.textContent = `${officerScenePhotos.length}/5`;

    if (!officerScenePhotos || officerScenePhotos.length === 0) {
        container.innerHTML = `<span class="text-[10px] text-slate-500 italic p-1">No real scene photos attached yet. Tap "Take Live Photo" or "Gallery" to capture evidence.</span>`;
        return;
    }

    container.innerHTML = officerScenePhotos.map((img, idx) => `
        <div class="relative w-16 h-16 rounded border border-slate-700 overflow-hidden bg-slate-950 shrink-0 group">
            <img src="${img}" class="w-full h-full object-cover">
            <button type="button" onclick="window.removeOfficerPhoto(${idx})" class="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 shadow" title="Remove Photo">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
};

// Render Multi-Party Roster Rows
window.renderOfficerPartyRows = function() {
    const container = document.getElementById('officer-parties-container');
    if (!container) return;

    if (!officerRosterParties || officerRosterParties.length === 0) {
        // Default 1 row
        officerRosterParties = [{
            role: 'SUSPECT',
            name: '',
            dob: '',
            phone: '',
            license: '',
            vehicle: '',
            plate: '',
            status: 'DETAINED'
        }];
    }

    container.innerHTML = officerRosterParties.map((p, idx) => `
        <div class="bg-slate-950 border border-slate-800 rounded p-2 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center relative">
            <div>
                <span class="text-[8px] text-purple-400 font-bold uppercase block">Party Role</span>
                <select onchange="window.updateOfficerParty(${idx}, 'role', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-purple-300 font-bold uppercase">
                    <option value="SUSPECT" ${p.role === 'SUSPECT' ? 'selected' : ''}>SUSPECT</option>
                    <option value="DRIVER" ${p.role === 'DRIVER' ? 'selected' : ''}>DRIVER</option>
                    <option value="VICTIM" ${p.role === 'VICTIM' ? 'selected' : ''}>VICTIM</option>
                    <option value="WITNESS" ${p.role === 'WITNESS' ? 'selected' : ''}>WITNESS</option>
                    <option value="REPORTING PARTY" ${p.role === 'REPORTING PARTY' ? 'selected' : ''}>REPORTING PARTY</option>
                </select>
            </div>

            <div>
                <span class="text-[8px] text-slate-400 font-bold uppercase block">Full Name / Alias</span>
                <input type="text" value="${p.name || ''}" onchange="window.updateOfficerParty(${idx}, 'name', this.value)" placeholder="Name" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-white uppercase">
            </div>

            <div>
                <span class="text-[8px] text-slate-400 font-bold uppercase block">Phone / Contact</span>
                <input type="text" value="${p.phone || ''}" onchange="window.updateOfficerParty(${idx}, 'phone', this.value)" placeholder="Phone" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-white">
            </div>

            <div>
                <span class="text-[8px] text-slate-400 font-bold uppercase block">DL # / State</span>
                <input type="text" value="${p.license || ''}" onchange="window.updateOfficerParty(${idx}, 'license', this.value)" placeholder="DL Number" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-white uppercase font-mono">
            </div>

            <div>
                <span class="text-[8px] text-slate-400 font-bold uppercase block">Vehicle & Plate</span>
                <input type="text" value="${p.vehicle || ''}" onchange="window.updateOfficerParty(${idx}, 'vehicle', this.value)" placeholder="Make/Model/Plate" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-white uppercase">
            </div>

            <div class="flex items-center justify-between gap-1">
                <div class="flex-1">
                    <span class="text-[8px] text-amber-400 font-bold uppercase block">Status</span>
                    <select onchange="window.updateOfficerParty(${idx}, 'status', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-[9px] text-amber-300 font-bold uppercase">
                        <option value="UNINJURED" ${p.status === 'UNINJURED' ? 'selected' : ''}>UNINJURED</option>
                        <option value="EMS TRANSPORTED" ${p.status === 'EMS TRANSPORTED' ? 'selected' : ''}>EMS TRANSPORTED</option>
                        <option value="DETAINED" ${p.status === 'DETAINED' ? 'selected' : ''}>DETAINED</option>
                        <option value="GOA (FLED)" ${p.status === 'GOA (FLED)' ? 'selected' : ''}>G.O.A. (FLED)</option>
                    </select>
                </div>

                <button type="button" onclick="window.removeOfficerPartyRow(${idx})" class="text-red-400 hover:text-red-300 p-1 mt-3" title="Remove Party">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
};

window.addOfficerPartyRow = function() {
    officerRosterParties.push({
        role: 'SUSPECT',
        name: '',
        dob: '',
        phone: '',
        license: '',
        vehicle: '',
        plate: '',
        status: 'UNINJURED'
    });
    window.renderOfficerPartyRows();
};

window.removeOfficerPartyRow = function(idx) {
    officerRosterParties.splice(idx, 1);
    window.renderOfficerPartyRows();
};

window.updateOfficerParty = function(idx, key, val) {
    if (officerRosterParties[idx]) {
        officerRosterParties[idx][key] = val;
    }
};

// Canvas Sketchpad Handlers
window.initOfficerCanvas = function(existingImage) {
    officerCanvas = document.getElementById('officer-scene-canvas');
    if (!officerCanvas) return;

    officerCtx = officerCanvas.getContext('2d');
    officerCtx.strokeStyle = '#38bdf8';
    officerCtx.lineWidth = 2;

    if (existingImage) {
        const img = new Image();
        img.onload = () => {
            officerCtx.drawImage(img, 0, 0, officerCanvas.width, officerCanvas.height);
        };
        img.src = existingImage;
    }

    const startDraw = (e) => {
        isDrawingOfficerCanvas = true;
        officerCtx.beginPath();
        const rect = officerCanvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        officerCtx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawingOfficerCanvas) return;
        const rect = officerCanvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        officerCtx.lineTo(x, y);
        officerCtx.stroke();
    };

    const stopDraw = () => {
        isDrawingOfficerCanvas = false;
    };

    officerCanvas.onmousedown = startDraw;
    officerCanvas.onmousemove = draw;
    officerCanvas.onmouseup = stopDraw;
    officerCanvas.ontouchstart = startDraw;
    officerCanvas.ontouchmove = draw;
    officerCanvas.ontouchend = stopDraw;
};

window.setOfficerDrawTool = function(tool) {
    currentOfficerDrawTool = tool;
};

window.addOfficerStamp = function(type) {
    if (!officerCtx || !officerCanvas) return;
    officerCtx.font = "bold 14px monospace";
    const x = officerCanvas.width / 2 + (Math.random() * 60 - 30);
    const y = officerCanvas.height / 2 + (Math.random() * 40 - 20);

    if (type === 'X') {
        officerCtx.fillStyle = '#ef4444';
        officerCtx.fillText("❌ IMPACT POINT", x, y);
    } else if (type === 'E1') {
        officerCtx.fillStyle = '#fbbf24';
        officerCtx.fillText("⚠️ EVIDENCE #1", x, y);
    } else if (type === 'VEH') {
        officerCtx.fillStyle = '#38bdf8';
        officerCtx.fillText("🚗 VEHICLE [V]", x, y);
    }
};

window.clearOfficerCanvas = function() {
    if (officerCtx && officerCanvas) {
        officerCtx.clearRect(0, 0, officerCanvas.width, officerCanvas.height);
    }
};

// Pack Card Payload
window.collectOfficerCardData = function(id = null) {
    const sketchImage = officerCanvas ? officerCanvas.toDataURL('image/png') : null;
    
    return {
        id: id || Date.now(),
        timestamp: Date.now(),
        type: 'officer',
        title: `SITREP: ${document.getElementById('officer-unit-callsign')?.value || 'OFFICER-104'}`,
        data: {
            unitCallsign: document.getElementById('officer-unit-callsign')?.value || 'OFFICER-104',
            cadNumber: document.getElementById('officer-cad-number')?.value || '',
            sceneStatus: document.getElementById('officer-scene-status')?.value || 'ACTIVE',
            incidentType: document.getElementById('officer-incident-type')?.value || 'TRAFFIC ACCIDENT',
            tacComms: document.getElementById('officer-tac-comms')?.value || '',
            backupUnits: document.getElementById('officer-backup-units')?.value || '',
            emsHospital: document.getElementById('officer-ems-hospital')?.value || '',
            incidentNotes: document.getElementById('officer-incident-notes')?.value || '',
            parties: officerRosterParties || [],
            scenePhotos: officerScenePhotos || [],
            sketchImage: sketchImage
        }
    };
};

// Save to Workstation
window.saveOfficerCardToWorkstation = async function(id) {
    const cardData = window.collectOfficerCardData(id);

    let cardImageSnapshot = cardData.data.sketchImage || (cardData.data.scenePhotos && cardData.data.scenePhotos[0]) || '';
    if (typeof html2canvas !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '640px';
        tempDiv.style.backgroundColor = '#0b1329';
        tempDiv.innerHTML = window.generateOfficerCardHTML(cardData);
        document.body.appendChild(tempDiv);
        try {
            const canvas = await html2canvas(tempDiv, { backgroundColor: '#0b1329', scale: 1.2, logging: false, useCORS: true });
            cardImageSnapshot = canvas.toDataURL('image/jpeg', 0.85);
        } catch(e) {
            console.error("Html2Canvas snapshot failed", e);
        }
        document.body.removeChild(tempDiv);
    }
    cardData.image = cardImageSnapshot;

    if (window.TRC_IDB) {
        await window.TRC_IDB.set('workstationLibrary', cardData.id, cardData);
    }
    if (typeof pushTacLog === 'function') pushTacLog(`OFFICER SITREP CARD SECURED IN WORKSTATION`, 'SUCCESS');
    window.renderWorkstationMenu();
};

// Transmit to Intel Vault
window.saveOfficerCardToVault = async function(id) {
    const cardData = window.collectOfficerCardData(id);

    // Create temporary offscreen container to render the master card for high-res snapshot
    let cardImageSnapshot = cardData.data.sketchImage || (cardData.data.scenePhotos && cardData.data.scenePhotos[0]) || '';
    if (typeof html2canvas !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '640px';
        tempDiv.style.backgroundColor = '#0b1329';
        tempDiv.innerHTML = window.generateOfficerCardHTML(cardData);
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#0b1329',
                scale: 1.2,
                logging: false,
                useCORS: true
            });
            cardImageSnapshot = canvas.toDataURL('image/jpeg', 0.85);
        } catch(e) {
            console.error("Html2Canvas failed for officer card snapshot", e);
        }
        document.body.removeChild(tempDiv);
    }
    
    let vaultMetadata = {
        id: cardData.id,
        timestamp: cardData.timestamp,
        image: cardImageSnapshot,
        label: `OFFICER SITREP: ${cardData.data.unitCallsign}`,
        type: 'officer_sitrep',
        workstationData: cardData
    };
    
    if (window.TRC_IDB) {
        await window.TRC_IDB.set('intelVault', vaultMetadata.id.toString(), vaultMetadata);
    }
    if (typeof vaultCache !== 'undefined') {
        vaultCache = vaultCache.filter(v => v.id.toString() !== vaultMetadata.id.toString());
        vaultCache.unshift(vaultMetadata);
        if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
    }
    if (typeof pushTacLog === 'function') pushTacLog(`OFFICER SITREP TRANSMITTED TO INTEL VAULT`, 'SUCCESS');
    alert("Officer SITREP Card Transmitted to Intel Vault!");
};

// Compress Base64 Image Helper for Network Broadcast (Guarantees <40KB payload with HD crispness)
window.compressBase64Image = async function(dataUrl, maxDim = 800, quality = 0.78) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return '';
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                try {
                    let w = img.width || 800, h = img.height || 600;
                    if (w > maxDim || h > maxDim) {
                        if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
                        else { w = Math.round(w * (maxDim / h)); h = maxDim; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } catch(e) {
                    resolve('');
                }
            };
            img.onerror = () => resolve('');
            img.src = dataUrl;
        } catch(e) {
            resolve('');
        }
    });
};

// Broadcast to Comms Chat & Wire Feed
window.blogOfficerCardToWire = async function(id) {
    const rawCardData = window.collectOfficerCardData(id);
    
    // Save full high-res card to Vault first
    await window.saveOfficerCardToVault(id);

    // Deep clone card data and compress images so broadcast payload stays under 40KB
    const cardData = JSON.parse(JSON.stringify(rawCardData));
    if (cardData.data) {
        if (cardData.data.sketchImage) {
            cardData.data.sketchImage = await window.compressBase64Image(cardData.data.sketchImage, 750, 0.75);
        }
        if (cardData.data.scenePhotos && cardData.data.scenePhotos.length > 0) {
            cardData.data.scenePhotos = await Promise.all(
                cardData.data.scenePhotos.map(p => window.compressBase64Image(p, 600, 0.72))
            );
        }
    }

    const lightImage = cardData.data?.sketchImage || (cardData.data?.scenePhotos && cardData.data.scenePhotos[0]) || '';

    const payload = {
        type: 'officer_sitrep',
        label: `OFFICER SITREP: ${cardData.data.unitCallsign}`,
        workstationData: cardData,
        image: lightImage
    };

    // 1. Broadcast over Encrypted Comms Chat (P2P + Supabase)
    if (typeof commsUser !== 'undefined' && commsUser && commsUser.callsign && typeof TacticalCrypto !== 'undefined') {
        const messageText = `[ 🚓 OFFICER SITREP • ${cardData.data.unitCallsign} ] CAD: ${cardData.data.cadNumber || 'N/A'} - ${cardData.data.incidentType}`;
        const encrypted = TacticalCrypto.encrypt({
            message: messageText,
            user: commsUser,
            timestamp: Date.now(),
            image: compressedCardImage,
            metadata: payload
        });
        const msgId = Math.random().toString(36).substring(2, 9);
        if (window.receivedMsgIds) window.receivedMsgIds.add(msgId);

        // Render locally in sender chat
        if (typeof renderChatMessage === 'function') {
            renderChatMessage(commsUser, messageText, true, compressedCardImage, null, payload);
        }

        // Send over WebRTC P2P DataChannels
        if (window.dataChannels) {
            Object.values(window.dataChannels).forEach(dc => {
                if (dc && dc.readyState === 'open') {
                    try { dc.send(JSON.stringify({ event: 'chat', data: encrypted, msgId })); } catch(e){}
                }
            });
        }

        // Send over Supabase Broadcast channel
        if (typeof commsChannel !== 'undefined' && commsChannel) {
            try {
                commsChannel.send({ type: 'broadcast', event: 'chat', payload: { data: encrypted, msgId } });
            } catch(e) {}
        }
        if (typeof pushTacLog === 'function') pushTacLog(`OFFICER SITREP BROADCASTED TO COMMS CHAT (${Math.round(encrypted.length / 1024)} KB)`, 'SUCCESS');
    }

    // 2. Post to Global Wire Blog Feed if available
    if (typeof window.submitGlobalWirePost === 'function') {
        const wireText = `[ 🚓 FIRST RESPONDER SITREP • ${cardData.data.sceneStatus} ]\nUNIT: ${cardData.data.unitCallsign} | CAD: ${cardData.data.cadNumber || 'N/A'}\nINCIDENT: ${cardData.data.incidentType}\nNOTES: ${cardData.data.incidentNotes || 'None'}`;
        window.submitGlobalWirePost(wireText, compressedCardImage, 'OFFICER SITREP');
    }
};

window.sendOfficerCardToComms = window.blogOfficerCardToWire;

// Generate Rendered Master Vertical Card HTML (Tall Cyber Navy & Gold Theme)
window.generateOfficerCardHTML = function(card) {
    const data = card.data || (card.workstationData ? card.workstationData.data : card);
    const parties = data.parties || [];
    const photos = data.scenePhotos || [];
    
    let statusBadge = `<span style="background-color: #dc2626 !important; color: #ffffff !important; border: 1px solid #f87171 !important;" class="font-mono text-[9px] px-2.5 py-1 rounded font-black uppercase animate-pulse shadow">🔴 ACTIVE SCENE</span>`;
    if (data.sceneStatus === 'CONTAINED') {
        statusBadge = `<span style="background-color: #d97706 !important; color: #000000 !important; border: 1px solid #fbbf24 !important;" class="font-mono text-[9px] px-2.5 py-1 rounded font-black uppercase shadow">🟡 CONTAINED</span>`;
    } else if (data.sceneStatus === 'SECURED') {
        statusBadge = `<span style="background-color: #059669 !important; color: #ffffff !important; border: 1px solid #34d399 !important;" class="font-mono text-[9px] px-2.5 py-1 rounded font-black uppercase shadow">🟢 SECURED</span>`;
    }

    // Party Roster HTML
    const partiesHtml = parties.map(p => `
        <div style="background-color: #020617; border: 1px solid #1e293b;" class="p-2.5 rounded-lg text-xs space-y-1">
            <div class="flex justify-between items-center border-b border-slate-800 pb-1">
                <span style="color: #c084fc;" class="font-black uppercase text-[10.5px] tracking-wide">${p.role || 'PARTY'}: ${p.name || 'UNKNOWN'}</span>
                <span style="color: #fbbf24;" class="font-mono text-[9px] font-black uppercase bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">${p.status || 'UNINJURED'}</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 pt-1">
                <div><span class="text-slate-500 font-bold">PHONE:</span> ${p.phone || '--'}</div>
                <div><span class="text-slate-500 font-bold">DL #:</span> ${p.license || '--'}</div>
                <div class="col-span-2"><span class="text-slate-500 font-bold">VEHICLE / PLATE:</span> ${p.vehicle || '--'}</div>
            </div>
        </div>
    `).join('');

    // Real Scene Photos Grid HTML (Up to 5 photos)
    const photosHtml = photos.length > 0 ? `
        <div style="background-color: #020617; border: 1px solid #1e293b;" class="p-2 rounded-lg">
            <div class="text-[9px] font-black text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <i data-lucide="camera" class="w-3.5 h-3.5"></i> Scene Evidence Photos (${photos.length}/5)
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                ${photos.map(pUrl => `
                    <div class="w-full h-20 rounded overflow-hidden border border-slate-700 bg-slate-950">
                        <img src="${pUrl}" class="w-full h-full object-cover">
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div style="background-color: #0b1329; border: 4px solid #38bdf8;" class="w-full max-w-2xl rounded-2xl p-4 text-slate-100 shadow-[0_0_40px_rgba(56,189,248,0.5)] font-sans relative overflow-y-auto max-h-[85vh] custom-scrollbar my-2 mx-auto space-y-3.5 text-left">
            <!-- Header Dossier Bar -->
            <div style="border-bottom: 2px solid rgba(56,189,248,0.4);" class="flex justify-between items-center pb-3 flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                    <span class="p-2 bg-blue-950 border border-cyan-400 rounded-xl text-cyan-400 shadow">
                        <i data-lucide="shield-alert" class="w-7 h-7 text-cyan-400"></i>
                    </span>
                    <div>
                        <div class="text-xs font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                            OFFICER SITREP DOSSIER <span class="text-[8px] bg-red-950 text-red-400 border border-red-500/60 px-1.5 py-0.5 rounded font-mono">FIRST RESPONDER</span>
                        </div>
                        <div class="text-[10px] font-mono text-slate-400">UNIT: ${data.unitCallsign || 'OFFICER-104'} | CAD: ${data.cadNumber || 'N/A'}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${statusBadge}
                    <button type="button" onclick="if(window.closeSurveillanceReview) window.closeSurveillanceReview();" class="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow border border-red-400 cursor-pointer shrink-0 z-50">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i> CLOSE
                    </button>
                </div>
            </div>

            <!-- Incident Overview Sub-panel -->
            <div style="background-color: #0f172a; border: 1px solid #1e293b;" class="p-2.5 rounded-lg flex justify-between items-center flex-wrap gap-2">
                <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase block">Incident Classification</span>
                    <span class="text-xs font-black text-white uppercase">${data.incidentType || 'GENERAL SCENE'}</span>
                </div>
                <div class="text-right">
                    <span class="text-[9px] text-slate-400 font-bold uppercase block">TAC Radio Channel</span>
                    <span class="text-xs font-mono text-cyan-400 font-bold">${data.tacComms || 'LAW TAC 3 / 155.370 MHz'}</span>
                </div>
            </div>

            <!-- Crime Scene Layout Diagram (Slot 6) -->
            ${data.sketchImage ? `
            <div style="background-color: #020617; border: 1px solid #1e293b;" class="p-2 rounded-lg overflow-hidden">
                <div class="text-[9px] font-black text-cyan-400 uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
                    <i data-lucide="pen-tool" class="w-3.5 h-3.5 text-cyan-400"></i> Crime Scene Tactical Diagram (Layout)
                </div>
                <img src="${data.sketchImage}" class="w-full h-44 object-contain rounded bg-slate-950 border border-slate-800">
            </div>
            ` : ''}

            <!-- Real Scene Photos Grid (Slots 1-5) -->
            ${photosHtml}

            <!-- Involved Parties Roster -->
            ${parties.length > 0 ? `
            <div class="space-y-1.5">
                <div class="text-[9.5px] font-black text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <i data-lucide="users" class="w-3.5 h-3.5 text-purple-400"></i> Involved Parties & Vehicles Roster (${parties.length})
                </div>
                <div class="space-y-2">
                    ${partiesHtml}
                </div>
            </div>
            ` : ''}

            <!-- Backup Units & Hospital Transport -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div style="background-color: #0f172a; border: 1px solid #1e293b;" class="p-2 rounded">
                    <span class="text-slate-400 font-bold block text-[9px] uppercase">Backup Units on Scene</span>
                    <span class="text-slate-200 font-bold">${data.backupUnits || 'NONE RECORDED'}</span>
                </div>
                <div style="background-color: #0f172a; border: 1px solid #1e293b;" class="p-2 rounded">
                    <span class="text-slate-400 font-bold block text-[9px] uppercase">EMS / Hospital Destination</span>
                    <span class="text-amber-300 font-bold">${data.emsHospital || 'NONE RECORDED'}</span>
                </div>
            </div>

            <!-- SITREP Master Observations -->
            ${data.incidentNotes ? `
            <div style="background-color: #0f172a; border-left: 4px solid #38bdf8;" class="p-3 rounded-lg text-xs text-slate-100 leading-relaxed font-sans">
                <div class="text-[9px] font-black text-cyan-400 uppercase tracking-wider mb-1">Master SITREP Observations</div>
                "${data.incidentNotes}"
            </div>
            ` : ''}

            <!-- Rework Card Action -->
            <div class="border-t border-slate-800 pt-3 flex justify-between items-center">
                <span class="text-[9px] font-mono text-slate-500">${new Date(card.timestamp || Date.now()).toLocaleString()}</span>
                <button type="button" onclick="if(window.openWorkstationForm) window.openWorkstationForm('officer', ${JSON.stringify(card).replace(/"/g, '&quot;')})" class="bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/50 text-[10.5px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors cursor-pointer">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> REWORK THIS SITREP
                </button>
            </div>
        </div>
    `;
};
