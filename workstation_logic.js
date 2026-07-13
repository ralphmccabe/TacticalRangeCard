// ==========================================
// OPERATORS WORKSTATION LOGIC (v1.0)
// ==========================================

// STORES is defined globally in idb_helper.js

document.addEventListener('DOMContentLoaded', () => {
    // Inject the main menu when panel is loaded
    setTimeout(() => {
        if (document.getElementById('workstation-container')) {
            renderWorkstationMenu();
        }
    }, 500);

    const vaultToWorkstationBtn = document.getElementById('vault-to-workstation-btn');
    if (vaultToWorkstationBtn) {
        vaultToWorkstationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const checkedBoxes = document.querySelectorAll('.vault-export-checkbox:checked');
            if (checkedBoxes.length !== 1) {
                if (typeof toggleFullscreen === 'function') toggleFullscreen('panel-workstation');
                return;
            }
            
            const vaultId = checkedBoxes[0].dataset.vaultId;
            let item = null;
            if (typeof vaultCache !== 'undefined') {
                item = vaultCache.find(v => v.id.toString() === vaultId.toString());
            }
            
            if (item) {
                if (item.type === 'workstation' && item.workstationData) {
                    // Directly rework existing workstation card
                    if (typeof toggleFullscreen === 'function') toggleFullscreen('panel-workstation');
                    // Sync it to local library just in case
                    if (window.TRC_IDB) {
                        window.TRC_IDB.set('workstationLibrary', item.workstationData.id, item.workstationData).then(() => {
                            window.loadWorkstationCard(item.workstationData.id);
                        });
                    } else {
                        window.loadWorkstationCard(item.workstationData.id);
                    }
                } else if (item.image) {
                    // Send raw image to Workstation for a new card
                    window.pendingWorkstationVaultImage = item.image;
                    if (typeof toggleFullscreen === 'function') toggleFullscreen('panel-workstation');
                    window.renderWorkstationMenu(); // Go to menu to choose form type
                    if (typeof pushTacLog === 'function') pushTacLog('IMAGE ROUTING ACTIVE. SELECT A FORM.', 'SUCCESS');
                }
                
                // Uncheck the box in the vault
                checkedBoxes[0].checked = false;
            }
        });
    }
});

window.generateWorkstationLibraryHtml = async function() {
    let savedCardsHtml = '';
    if (window.TRC_IDB) {
        try {
            const cards = await window.TRC_IDB.getAll('workstationLibrary');
            const cardArray = Object.values(cards).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            if (cardArray.length > 0) {
                savedCardsHtml = `
                    <div class="mt-8 w-full border-t border-gray-800 pt-6 relative">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest"><i data-lucide="archive" class="w-4 h-4 inline-block mr-1"></i> Saved Operations Intel</h3>
                            <div class="flex items-center gap-2">
                                <button id="ws-rework-btn" onclick="reworkSelectedWsCard()" class="hidden bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded hover:bg-emerald-500 transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)] items-center gap-1">
                                    <i data-lucide="monitor" class="w-3 h-3"></i> REWORK
                                </button>
                                <button id="ws-brag-btn" onclick="openBragBoardStudio()" class="hidden bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded hover:bg-purple-500 transition-all shadow-[0_0_10px_rgba(147,51,234,0.5)] items-center gap-1">
                                    <i data-lucide="camera" class="w-3 h-3"></i> GENERATE BRAG BOARD (<span id="ws-brag-count">0</span>)
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">`;
                
                cardArray.forEach(card => {
                    let icon = 'monitor';
                    let color = 'text-blue-500';
                    if (card.type === 'medevac') { icon = 'activity'; color = 'text-red-500'; }
                    else if (card.type === 'scorecard') { icon = 'crosshair'; color = 'text-yellow-500'; }
                    else if (card.type === 'logistics') { icon = 'clipboard-list'; color = 'text-emerald-500'; }
                    else if (card.type === 'roster') { icon = 'users'; color = 'text-blue-500'; }
                    else if (card.type === 'bragboard') { icon = 'camera'; color = 'text-purple-500'; }

                    const thumbImg = card.compositeImage || card.image;
                    const thumbHtml = thumbImg 
                        ? `<img src="${thumbImg}" class="w-10 h-10 object-cover rounded border border-gray-700 shrink-0">`
                        : `<div class="w-10 h-10 rounded border border-gray-700 bg-gray-900 shrink-0 flex items-center justify-center"><i data-lucide="${icon}" class="w-4 h-4 ${color} opacity-50"></i></div>`;

                    savedCardsHtml += `
                        <div class="bg-black/80 border border-gray-700 rounded-lg p-2 flex flex-row items-center gap-3 hover:border-gray-500 transition-colors group relative">
                            <!-- Checkbox for brag board -->
                            <input type="checkbox" class="ws-library-checkbox w-4 h-4 rounded bg-gray-900 border-gray-600 text-purple-600 focus:ring-purple-600 cursor-pointer" value="${card.id}" onchange="window.checkWsCheckboxes()">
                            
                            <!-- Thumbnail -->
                            ${thumbHtml}
                            
                            <!-- Info (Clickable to open) -->
                            <div class="flex-1 min-w-0 cursor-pointer" onclick="loadWorkstationCard('${card.id}')">
                                <div class="flex items-center gap-1 mb-0.5">
                                    <i data-lucide="${icon}" class="w-3 h-3 ${color}"></i>
                                    <span class="text-[10px] font-black ${color} truncate uppercase tracking-widest">${card.title || card.type}</span>
                                </div>
                                <div class="text-[8px] text-gray-500">${new Date(card.timestamp).toLocaleString()}</div>
                            </div>
                            
                            <!-- Delete Button -->
                            <button onclick="window.deleteWorkstationCard('${card.id}')" class="p-1.5 rounded bg-black/50 hover:bg-red-900/80 transition-all border border-transparent hover:border-red-900">
                                <i data-lucide="trash-2" class="w-3 h-3 text-red-500"></i>
                            </button>
                        </div>
                    `;
                });
                
                savedCardsHtml += `</div></div>`;
            }
        } catch(e) {
            console.error("Failed to load workstation library", e);
        }
    }
    return savedCardsHtml;
};

window.refreshWorkstationLibrary = async function() {
    const libContainer = document.getElementById('ws-form-library');
    if (libContainer) {
        libContainer.innerHTML = await window.generateWorkstationLibraryHtml();
        if (window.lucide) lucide.createIcons();
    } else {
        window.renderWorkstationMenu();
    }
};

// Main menu renderer
window.renderWorkstationMenu = async function() {
    const container = document.getElementById('workstation-container');
    if (!container) return;

    const savedCardsHtml = await window.generateWorkstationLibraryHtml();
    
    let pendingBannerHtml = '';
    if (window.pendingWorkstationVaultImage) {
        pendingBannerHtml = `
            <div class="w-full bg-purple-900/40 border border-purple-500 rounded p-3 mb-2 flex items-center justify-between animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <div class="flex items-center gap-3">
                    <img src="${window.pendingWorkstationVaultImage}" class="w-12 h-12 object-cover rounded border border-purple-400">
                    <div>
                        <div class="text-purple-300 text-[10px] md:text-xs font-black uppercase tracking-widest">Image Routing Active</div>
                        <div class="text-purple-400/80 text-[8px] md:text-[10px] uppercase">Select any form below to attach this photo</div>
                    </div>
                </div>
                <button onclick="window.pendingWorkstationVaultImage = null; window.renderWorkstationMenu();" class="text-purple-400 hover:text-white px-2 py-1 bg-black/50 rounded border border-purple-500/50 hover:bg-red-900 hover:border-red-500 transition-all text-[8px] font-bold uppercase"><i data-lucide="x" class="w-3 h-3 inline"></i> CANCEL</button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-start space-y-4 max-w-4xl mx-auto w-full">
            ${pendingBannerHtml}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full mt-2">
                <!-- 1. MEDEVAC / INCIDENT -->
                <button onclick="openWorkstationForm('medevac')" class="bg-gray-900 border border-red-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-red-500 transition-all group">
                    <i data-lucide="activity" class="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform"></i>
                    <div class="text-center">
                        <div class="text-[9px] font-black text-white uppercase leading-tight">9-Line MEDEVAC</div>
                        <div class="text-[6px] text-gray-500 uppercase mt-0.5">Incident Report</div>
                    </div>
                </button>

                <!-- 2. SCORECARD -->
                <button onclick="openWorkstationForm('scorecard')" class="bg-gray-900 border border-yellow-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-yellow-500 transition-all group">
                    <i data-lucide="crosshair" class="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform"></i>
                    <div class="text-center">
                        <div class="text-[9px] font-black text-white uppercase leading-tight">Scorecard</div>
                        <div class="text-[6px] text-gray-500 uppercase mt-0.5">Match & Drill Log</div>
                    </div>
                </button>

                <!-- 3. LOGISTICS -->
                <button onclick="openWorkstationForm('logistics')" class="bg-gray-900 border border-emerald-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-emerald-500 transition-all group">
                    <i data-lucide="clipboard-list" class="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform"></i>
                    <div class="text-center">
                        <div class="text-[9px] font-black text-white uppercase leading-tight">Logistics</div>
                        <div class="text-[6px] text-gray-500 uppercase mt-0.5">Expense Wrap-up</div>
                    </div>
                </button>

                <!-- 4. ACCOUNTABILITY -->
                <button onclick="openWorkstationForm('roster')" class="bg-gray-900 border border-blue-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-blue-500 transition-all group">
                    <i data-lucide="users" class="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform"></i>
                    <div class="text-center">
                        <div class="text-[9px] font-black text-white uppercase leading-tight">Accountability</div>
                        <div class="text-[6px] text-gray-500 uppercase mt-0.5">Squad Status</div>
                    </div>
                </button>

                <!-- 5. BRAG BOARD -->
                <button onclick="openWorkstationForm('bragboard')" class="bg-gray-900 border border-purple-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-purple-500 transition-all group col-span-2 sm:col-span-1 md:col-span-1">
                    <i data-lucide="camera" class="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform"></i>
                    <div class="text-center">
                        <div class="text-[9px] font-black text-white uppercase leading-tight">Media Summary</div>
                        <div class="text-[6px] text-gray-500 uppercase mt-0.5">Brag Board</div>
                    </div>
                </button>
            </div>
            ${savedCardsHtml}
        </div>
    `;
    if (window.lucide) lucide.createIcons();
};

window.openWorkstationForm = async function(type, cardData = null) {
    const container = document.getElementById('workstation-container');
    if (!container) return;

    let headerIcon, headerColor, headerTitle;
    let formFields = '';

    const id = cardData ? cardData.id : Date.now();
    let existingImage = cardData ? (cardData.image || '') : '';
    
    // Auto-load pending vault image if it's a new card
    if (!cardData && window.pendingWorkstationVaultImage) {
        existingImage = window.pendingWorkstationVaultImage;
        window.pendingWorkstationVaultImage = null; // Clear it after consuming
    }

    if (type === 'medevac') {
        headerIcon = 'activity'; headerColor = 'text-red-500'; headerTitle = '9-LINE MEDEVAC / INCIDENT REPORT';
        formFields = `
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] text-gray-500">LINE 1: Location</label><input type="text" id="ws-loc" value="${cardData?.data?.loc || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">LINE 2: Frequency/Callsign</label><input type="text" id="ws-freq" value="${cardData?.data?.freq || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">LINE 3: Patients by Precedence</label><input type="text" id="ws-prec" value="${cardData?.data?.prec || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">LINE 4: Special Equipment</label><input type="text" id="ws-equip" value="${cardData?.data?.equip || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Incident Details</label><textarea id="ws-details" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-20">${cardData?.data?.details || ''}</textarea></div>
            </div>`;
    } else if (type === 'scorecard') {
        headerIcon = 'crosshair'; headerColor = 'text-yellow-500'; headerTitle = 'COMPETITION SCORECARD';
        formFields = `
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] text-gray-500">Match/Stage Name</label><input type="text" id="ws-match" value="${cardData?.data?.match || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Total Time</label><input type="text" id="ws-time" value="${cardData?.data?.time || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Hits / Points</label><input type="text" id="ws-hits" value="${cardData?.data?.hits || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Penalties</label><input type="text" id="ws-penalties" value="${cardData?.data?.penalties || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Stage Notes / Takeaways</label><textarea id="ws-notes" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-20">${cardData?.data?.notes || ''}</textarea></div>
            </div>`;
    } else if (type === 'logistics') {
        headerIcon = 'clipboard-list'; headerColor = 'text-emerald-500'; headerTitle = 'LOGISTICS & EXPENSES';
        formFields = `
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] text-gray-500">Ammo Expended</label><input type="text" id="ws-ammo" value="${cardData?.data?.ammo || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Gear Damaged/Lost</label><input type="text" id="ws-gear" value="${cardData?.data?.gear || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Total Cost Estimate</label><input type="text" id="ws-cost" value="${cardData?.data?.cost || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Resupply Needed</label><input type="text" id="ws-resupply" value="${cardData?.data?.resupply || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
            </div>`;
    } else if (type === 'roster') {
        headerIcon = 'users'; headerColor = 'text-blue-500'; headerTitle = 'SQUAD ACCOUNTABILITY ROSTER';
        formFields = `
            <div class="grid grid-cols-1 gap-4">
                <div><label class="text-[10px] text-gray-500">Squad / Element Name</label><input type="text" id="ws-squad" value="${cardData?.data?.squad || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Personnel Status (Present, Missing, WIA)</label><textarea id="ws-personnel" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-24 placeholder-gray-700" placeholder="Alpha 1: Green&#10;Bravo 2: Green">${cardData?.data?.personnel || ''}</textarea></div>
            </div>`;
    } else if (type === 'bragboard') {
        headerIcon = 'camera'; headerColor = 'text-purple-500'; headerTitle = 'MEDIA / BRAG BOARD';
        formFields = `
            <div class="grid grid-cols-1 gap-4">
                <div><label class="text-[10px] text-gray-500">Event / Achievement</label><input type="text" id="ws-event" value="${cardData?.data?.event || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Trophy / Summary</label><textarea id="ws-summary" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-24 placeholder-gray-700" placeholder="1000 yard impact on first round cold bore...">${cardData?.data?.summary || ''}</textarea></div>
            </div>`;
    }

    container.innerHTML = `
        <div class="h-full flex flex-col w-full max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-800 shrink-0">
                <button onclick="renderWorkstationMenu()" class="text-gray-500 hover:text-white flex items-center gap-1 text-[10px] uppercase font-bold transition-colors">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i> BACK
                </button>
                <div class="flex items-center gap-2">
                    <i data-lucide="${headerIcon}" class="w-5 h-5 ${headerColor}"></i>
                    <h2 class="text-[10px] md:text-sm font-black text-white uppercase tracking-widest">${headerTitle}</h2>
                </div>
                <div class="w-16"></div> <!-- spacer for centering -->
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div class="space-y-4">
                    ${formFields}

                    <!-- Image Attachment UI -->
                    <div class="mt-4 pt-4 border-t border-gray-800">
                        <label class="text-[10px] text-gray-500 block mb-2">Attach Intel Photo</label>
                        <div class="flex items-center gap-4">
                            <label class="cursor-pointer bg-gray-900 border border-gray-700 px-4 py-2 rounded text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2">
                                <i data-lucide="camera" class="w-4 h-4"></i> BROWSE
                                <input type="file" accept="image/*" class="hidden" id="ws-image-upload">
                            </label>
                            <div id="ws-image-preview-container" class="${existingImage ? 'block' : 'hidden'} relative w-24 h-24 border border-gray-700 rounded overflow-hidden">
                                <img id="ws-image-preview" src="${existingImage}" class="w-full h-full object-cover">
                                <button onclick="clearWsImage()" class="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-500"><i data-lucide="x" class="w-3 h-3 text-white"></i></button>
                            </div>
                        </div>
                        <input type="hidden" id="ws-image-data" value="${existingImage}">
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-800 flex justify-end shrink-0 gap-3">
                <button onclick="window.clearWorkstationForm()" class="bg-red-950 hover:bg-red-900 text-red-500 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded transition-all border border-red-900 flex items-center gap-2">
                    <i data-lucide="trash" class="w-4 h-4"></i> CLEAR FORM
                </button>
                <button onclick="saveWorkstationCard('${type}', ${id}, this)" class="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all flex items-center gap-2">
                    <i data-lucide="save" class="w-4 h-4"></i> SAVE TO VAULT
                </button>
            </div>
            
            <div id="ws-form-library"></div>
        </div>
    `;

    const libHtml = await window.generateWorkstationLibraryHtml();
    const libContainer = document.getElementById('ws-form-library');
    if (libContainer) libContainer.innerHTML = libHtml;

    if (window.lucide) lucide.createIcons();

    // Attach image upload listener
    const fileInput = document.getElementById('ws-image-upload');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.getElementById('ws-image-data').value = ev.target.result;
                    document.getElementById('ws-image-preview').src = ev.target.result;
                    document.getElementById('ws-image-preview-container').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
};

window.clearWsImage = function() {
    document.getElementById('ws-image-data').value = '';
    document.getElementById('ws-image-preview').src = '';
    document.getElementById('ws-image-preview-container').classList.add('hidden');
    document.getElementById('ws-image-upload').value = '';
};

window.generateWorkstationCompositeImage = async function(cardData) {
    if (typeof html2canvas === 'undefined') return cardData.image || '';
    
    // Create container
    const renderZone = document.createElement('div');
    renderZone.style.position = 'fixed';
    renderZone.style.left = '-9999px';
    renderZone.style.top = '0';
    renderZone.style.zIndex = '-9999';
    
    // Build the HTML
    let fieldsHtml = '';
    for (const [key, val] of Object.entries(cardData.data)) {
        const spanTwo = (val && val.length > 50) ? 'grid-column: span 2;' : '';
        fieldsHtml += `
            <div style="${spanTwo} margin-bottom: 8px;">
                <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">${key.toUpperCase()}</div>
                <div style="font-size: 14px; color: #E5E7EB; background: #1F2937; padding: 6px; border-radius: 4px; border: 1px solid #374151; word-wrap: break-word; min-height: 20px;">${val || 'N/A'}</div>
            </div>
        `;
    }

    renderZone.innerHTML = `
        <div style="width: 800px; height: 400px; background-color: #111827; display: flex; color: white; font-family: sans-serif; padding: 20px; box-sizing: border-box; border: 2px solid #374151; border-radius: 12px;">
            <!-- LEFT: Image -->
            <div style="width: 360px; height: 100%; border-radius: 8px; overflow: hidden; background-color: #000; display: flex; align-items: center; justify-content: center; border: 1px solid #4B5563; flex-shrink: 0;">
                ${cardData.image ? `<img src="${cardData.image}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="color: #6B7280; font-weight: bold;">NO IMAGE</span>`}
            </div>
            
            <!-- RIGHT: Info -->
            <div style="flex: 1; padding-left: 20px; display: flex; flex-direction: column;">
                <div style="border-bottom: 2px solid #374151; padding-bottom: 10px; margin-bottom: 15px;">
                    <div style="font-size: 14px; font-weight: 900; color: #9CA3AF; letter-spacing: 2px; text-transform: uppercase;">WORKSTATION INTEL: ${cardData.type.toUpperCase()}</div>
                    <div style="font-size: 24px; font-weight: 900; color: #FFF; text-transform: uppercase; margin-top: 5px;">${cardData.title.split(': ')[1] || cardData.title}</div>
                    <div style="font-size: 12px; color: #6B7280; margin-top: 5px;">${new Date(cardData.timestamp).toLocaleString()}</div>
                </div>
                
                <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-content: start;">
                    ${fieldsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(renderZone);
    
    try {
        await new Promise(r => setTimeout(r, 100)); // wait for image load
        const canvas = await html2canvas(renderZone.children[0], {
            backgroundColor: '#111827',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: false
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        document.body.removeChild(renderZone);
        return dataUrl;
    } catch(e) {
        console.error("html2canvas failed", e);
        document.body.removeChild(renderZone);
        return cardData.image || '';
    }
};

window.saveWorkstationCard = async function(type, id, btn) {
    let data = {};
    let title = '';

    if (type === 'medevac') {
        data = {
            loc: document.getElementById('ws-loc').value,
            freq: document.getElementById('ws-freq').value,
            prec: document.getElementById('ws-prec').value,
            equip: document.getElementById('ws-equip').value,
            details: document.getElementById('ws-details').value
        };
        title = "MEDEVAC: " + (data.loc || 'UNTITLED');
    } else if (type === 'scorecard') {
        data = {
            match: document.getElementById('ws-match').value,
            time: document.getElementById('ws-time').value,
            hits: document.getElementById('ws-hits').value,
            penalties: document.getElementById('ws-penalties').value,
            notes: document.getElementById('ws-notes').value
        };
        title = "SCORECARD: " + (data.match || 'UNTITLED');
    } else if (type === 'logistics') {
        data = {
            ammo: document.getElementById('ws-ammo').value,
            gear: document.getElementById('ws-gear').value,
            cost: document.getElementById('ws-cost').value,
            resupply: document.getElementById('ws-resupply').value
        };
        title = "LOGISTICS: " + new Date().toLocaleDateString();
    } else if (type === 'roster') {
        data = {
            squad: document.getElementById('ws-squad').value,
            personnel: document.getElementById('ws-personnel').value
        };
        title = "ROSTER: " + (data.squad || 'UNTITLED');
    } else if (type === 'bragboard') {
        data = {
            event: document.getElementById('ws-event').value,
            summary: document.getElementById('ws-summary').value
        };
        title = "BRAG BOARD: " + (data.event || 'UNTITLED');
    }

    const cardData = {
        id: id,
        type: type,
        title: title,
        timestamp: new Date().toISOString(),
        data: data,
        image: document.getElementById('ws-image-data').value || ''
    };

    let originalHtml = '';
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> GENERATING GRAPHIC...';
        if (window.lucide) lucide.createIcons();
    }

    try {
        const compositeImage = await window.generateWorkstationCompositeImage(cardData);
        cardData.compositeImage = compositeImage;

        await window.TRC_IDB.set('workstationLibrary', cardData.id, cardData);
        
        let vaultMetadata = {
            id: cardData.id,
            timestamp: cardData.timestamp,
            image: compositeImage || cardData.image || '',
            label: `WORKSTATION: ${cardData.title}`,
            type: 'workstation',
            workstationData: cardData
        };
        await window.TRC_IDB.set('intelVault', cardData.id.toString(), vaultMetadata);
        
        if (window.vaultCache) {
            window.vaultCache = window.vaultCache.filter(v => v.id.toString() !== cardData.id.toString());
            window.vaultCache.unshift(vaultMetadata);
        }

        window.pushTacLog("WORKSTATION INTEL SAVED TO VAULT", "SUCCESS");
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> SAVED TO VAULT!`;
            btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
            btn.classList.add('bg-green-600', 'hover:bg-green-500');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
                btn.classList.remove('bg-green-600', 'hover:bg-green-500');
                if (window.lucide) lucide.createIcons();
            }, 2000);
        }
        
        window.refreshWorkstationLibrary();
        if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
    } catch (e) {
        console.error("Failed to save workstation card:", e);
        alert('Failed to save card. See console for details.');
    }
};

window.loadWorkstationCard = async function(id) {
    if (!window.TRC_IDB) return;
    try {
        const card = await window.TRC_IDB.get('workstationLibrary', parseInt(id));
        if (card) {
            openWorkstationForm(card.type, card);
        }
    } catch(e) {
        console.error("Failed to load card", e);
    }
};

window.loadWorkstationBackToEditorById = function(id) {
    if (typeof window.toggleFullscreen === 'function') {
        const panel = document.getElementById('panel-workstation');
        if (panel && !panel.classList.contains('is-maximized')) {
            window.toggleFullscreen('panel-workstation');
        }
    }
    const vaultModal = document.getElementById('vault-modal-overlay');
    if (vaultModal) vaultModal.classList.add('hidden');
    
    const checkedBoxes = document.querySelectorAll('.vault-export-checkbox:checked');
    checkedBoxes.forEach(cb => cb.checked = false);

    window.loadWorkstationCard(id);
};

window.clearWorkstationForm = function() {
    const container = document.getElementById('workstation-container');
    if (!container) return;
    const inputs = container.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => input.value = '');
    if (typeof window.clearWsImage === 'function') window.clearWsImage();
};

window.deleteWorkstationCard = async function(id) {
    if (!confirm('Are you sure you want to permanently delete this card?')) return;
    
    if (window.TRC_IDB) {
        await window.TRC_IDB.delete('workstationLibrary', parseInt(id));
        
        // Also remove from Vault if it exists
        if (typeof vaultCache !== 'undefined') {
            const vaultIdx = vaultCache.findIndex(v => v.type === 'workstation' && v.id == id);
            if (vaultIdx !== -1) {
                vaultCache.splice(vaultIdx, 1);
                await window.TRC_IDB.delete('intelVault', id.toString());
                if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
            }
        }
        
        window.refreshWorkstationLibrary();
    }
};

window.checkWsCheckboxes = function() {
    const checked = document.querySelectorAll('.ws-library-checkbox:checked');
    const btn = document.getElementById('ws-brag-btn');
    const countSpan = document.getElementById('ws-brag-count');
    const reworkBtn = document.getElementById('ws-rework-btn');
    
    if (checked.length > 0) {
        if(btn) {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
        }
        if (countSpan) countSpan.textContent = checked.length;
    } else {
        if(btn) {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        }
    }
    
    if (checked.length === 1) {
        if (reworkBtn) {
            reworkBtn.classList.remove('hidden');
            reworkBtn.classList.add('flex');
        }
    } else {
        if (reworkBtn) {
            reworkBtn.classList.add('hidden');
            reworkBtn.classList.remove('flex');
        }
    }
};

window.reworkSelectedWsCard = async function() {
    const checked = document.querySelectorAll('.ws-library-checkbox:checked');
    if (checked.length === 1) {
        const id = checked[0].value;
        if (window.TRC_IDB) {
            const card = await window.TRC_IDB.get('workstationLibrary', parseInt(id));
            if (card && card.type === 'bragboard') {
                alert("Brag Boards are compiled, flattened snapshots and cannot be reworked. To change the layout or text, please select your original cards and generate a new Brag Board.");
                return;
            }
        }
        window.loadWorkstationCard(id);
    }
};

window.openBragBoardStudio = async function() {
    const checked = document.querySelectorAll('.ws-library-checkbox:checked');
    if (checked.length === 0) return;
    if (checked.length > 4) {
        alert("Maximum 4 cards allowed for Brag Board collage.");
        return;
    }
    
    const selectedIds = Array.from(checked).map(cb => parseInt(cb.value));
    
    let selectedCards = [];
    if (window.TRC_IDB) {
        for (const id of selectedIds) {
            const card = await window.TRC_IDB.get('workstationLibrary', id);
            if (card) selectedCards.push(card);
        }
    }
    
    checked.forEach(cb => cb.checked = false);
    window.checkWsCheckboxes();
    
    const container = document.getElementById('workstation-container');
    if (!container) return;
    
    let collageHtml = '';
    const count = selectedCards.length;
    
    if (count === 1) {
        collageHtml = `<div class="w-full h-[300px] bg-black rounded overflow-hidden">${selectedCards[0].image ? `<img src="${selectedCards[0].image}" class="w-full h-full object-contain">` : `<div class="w-full h-full flex items-center justify-center text-gray-700 font-bold">${selectedCards[0].title || 'NO IMAGE'}</div>`}</div>`;
    } else if (count === 2) {
        collageHtml = `
            <div class="grid grid-cols-2 gap-1 w-full h-[300px] bg-black p-1 rounded overflow-hidden">
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[0].image ? `<img src="${selectedCards[0].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[1].image ? `<img src="${selectedCards[1].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
            </div>`;
    } else if (count === 3) {
        collageHtml = `
            <div class="grid grid-rows-2 gap-1 w-full h-[350px] bg-black p-1 rounded overflow-hidden">
                <div class="bg-gray-900 w-full h-full flex items-center justify-center">${selectedCards[0].image ? `<img src="${selectedCards[0].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                <div class="grid grid-cols-2 gap-1 w-full h-full">
                    <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[1].image ? `<img src="${selectedCards[1].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                    <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[2].image ? `<img src="${selectedCards[2].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                </div>
            </div>`;
    } else if (count === 4) {
        collageHtml = `
            <div class="grid grid-cols-2 grid-rows-2 gap-1 w-full h-[400px] bg-black p-1 rounded overflow-hidden">
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[0].image ? `<img src="${selectedCards[0].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[1].image ? `<img src="${selectedCards[1].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[2].image ? `<img src="${selectedCards[2].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
                <div class="bg-gray-900 h-full flex items-center justify-center">${selectedCards[3].image ? `<img src="${selectedCards[3].image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-600 font-bold">NO IMAGE</span>'}</div>
            </div>`;
    }

    container.innerHTML = `
        <div class="h-full flex flex-col w-full max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-800 shrink-0">
                <button onclick="renderWorkstationMenu()" class="text-gray-500 hover:text-white flex items-center gap-1 text-[10px] uppercase font-bold transition-colors">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i> BACK
                </button>
                <div class="flex items-center gap-2">
                    <i data-lucide="camera" class="w-5 h-5 text-purple-500"></i>
                    <h2 class="text-[10px] md:text-sm font-black text-white uppercase tracking-widest">BRAG BOARD COMPILER</h2>
                </div>
                <div class="w-16"></div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col items-center">
                <div id="brag-board-preview-container" class="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
                    <div class="absolute top-0 right-0 p-2 opacity-50"><i data-lucide="crosshair" class="w-10 h-10 text-white"></i></div>
                    
                    <!-- Header -->
                    <div class="flex items-end justify-between mb-3 pb-2 border-b border-gray-700">
                        <div>
                            <div class="text-[10px] text-gray-500 font-bold tracking-[0.2em] mb-1">TACTICAL BRAG BOARD</div>
                            <div class="text-sm font-black text-purple-400 uppercase"><i data-lucide="user" class="w-4 h-4 inline pb-0.5"></i> ${window.userObj?.callsign || 'OPERATOR'}</div>
                        </div>
                        <div class="text-[10px] text-gray-500 text-right">${new Date().toLocaleString()}</div>
                    </div>
                    
                    <!-- Dynamic Collage -->
                    ${collageHtml}

                    <!-- User Summary Input Overlay -->
                    <div class="mt-3">
                        <textarea id="brag-board-summary-input" class="w-full bg-black/50 border border-gray-800 rounded text-xs text-gray-300 p-3 h-24 focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-700" placeholder="Type your AAR, notes, or master summary here..."></textarea>
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-800 flex justify-end shrink-0 gap-3">
                <button onclick="window.saveBragBoardToVault()" id="btn-save-bragboard" class="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all flex items-center gap-2">
                    <i data-lucide="save" class="w-4 h-4"></i> SNAPSHOT TO VAULT
                </button>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
};

window.saveBragBoardToVault = async function() {
    const summary = document.getElementById('brag-board-summary-input').value;
    const container = document.getElementById('brag-board-preview-container');
    const btn = document.getElementById('btn-save-bragboard');
    
    if (typeof html2canvas !== 'undefined' && container) {
        if(btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> SAVING...'; }
        try {
            // Need to momentarily un-focus the textarea so cursor doesn't capture
            document.activeElement.blur();
            // Optional: style textarea to look like flat text for the screenshot
            const ta = document.getElementById('brag-board-summary-input');
            if (ta) {
                ta.style.border = 'none';
                ta.style.backgroundColor = 'transparent';
                ta.style.resize = 'none';
            }

            const canvas = await html2canvas(container, {
                backgroundColor: '#111827',
                scale: 1.5,
                logging: false,
                useCORS: true
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            const cardData = {
                id: Date.now(),
                timestamp: Date.now(),
                type: 'bragboard',
                title: 'BRAG BOARD',
                image: dataUrl,
                data: {
                    event: 'Brag Board Compilation',
                    summary: summary
                }
            };
            
            // Save to Workstation Library
            if (window.TRC_IDB) {
                await window.TRC_IDB.set('workstationLibrary', cardData.id, cardData);
            }
            
            // Save to Vault
            let vaultMetadata = {
                id: cardData.id,
                timestamp: cardData.timestamp,
                image: cardData.image || '',
                label: `WORKSTATION: ${cardData.title}`,
                type: 'workstation',
                workstationData: cardData
            };
            
            if (typeof vaultCache !== 'undefined') {
                vaultCache.unshift(vaultMetadata);
                if (window.TRC_IDB) await window.TRC_IDB.set('intelVault', vaultMetadata.id.toString(), vaultMetadata);
                if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
            }
            
            if (typeof pushTacLog === 'function') pushTacLog(`BRAG BOARD SECURED IN VAULT`, 'SUCCESS');
            window.renderWorkstationMenu();
            
        } catch (e) {
            console.error("Html2Canvas failed for brag board", e);
            if (typeof pushTacLog === 'function') pushTacLog(`BRAG BOARD SNAPSHOT FAILED`, 'ERROR');
            if(btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> SNAPSHOT TO VAULT'; }
        }
    } else {
        alert("Html2canvas is not loaded. Cannot snapshot Brag Board.");
    }
};
