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
            if (typeof toggleFullscreen === 'function') {
                toggleFullscreen('panel-workstation');
            }
        });
    }
});

// Helper to rework checked workstation card from the library
window.reworkCheckedWsCard = async function() {
    const checkedBoxes = document.querySelectorAll('.ws-library-checkbox:checked');
    if (checkedBoxes.length === 0) {
        alert("Please check a card in the library using the checkbox [✓] before clicking REWORK CARD.");
        return;
    }
    const firstId = checkedBoxes[0].value;
    window.loadWorkstationCard(firstId);
};

// Helper to send checked workstation cards to the Intel Vault
window.sendCheckedWsCardsToVault = async function() {
    const checkedBoxes = document.querySelectorAll('.ws-library-checkbox:checked');
    if (checkedBoxes.length === 0) {
        alert("Please check at least one card in the library using the checkbox [✓] before clicking SEND TO INTEL VAULT.");
        return;
    }
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
    let count = 0;
    if (window.TRC_IDB) {
        try {
            const cards = await window.TRC_IDB.getAll('workstationLibrary');
            for (const card of Object.values(cards)) {
                if (selectedIds.includes(card.id.toString())) {
                    let vaultMetadata = {
                        id: card.id,
                        timestamp: card.timestamp,
                        image: card.image || '',
                        label: `WORKSTATION: ${card.title || card.type}`,
                        type: 'workstation',
                        workstationData: card
                    };
                    await window.TRC_IDB.set('intelVault', card.id.toString(), vaultMetadata);
                    if (window.vaultCache) {
                        window.vaultCache = window.vaultCache.filter(v => v.id.toString() !== card.id.toString());
                        window.vaultCache.unshift(vaultMetadata);
                    }
                    count++;
                }
            }
        } catch(e) {
            console.error("Error saving workstation cards to vault:", e);
        }
    }
    checkedBoxes.forEach(cb => cb.checked = false);
    if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
    if (window.pushTacLog) window.pushTacLog(`SENT ${count} WORKSTATION CARD(S) TO INTEL VAULT`, "SUCCESS");
    alert(`${count} Workstation Card(s) successfully sent to Intel Vault!`);
};

// Main menu renderer
window.renderWorkstationMenu = async function() {
    const container = document.getElementById('workstation-container');
    if (!container) return;

    // Fetch existing workstation intel to show in the library at the bottom
    let savedCardsHtml = '';
    if (window.TRC_IDB) {
        try {
            const cards = await window.TRC_IDB.getAll('workstationLibrary');
            const cardArray = Object.values(cards).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            if (cardArray.length > 0) {
                savedCardsHtml = `
                    <div class="w-full border-t-2 border-slate-800 pt-2 mt-2 flex flex-col">
                        <div class="flex items-center justify-between mb-2 shrink-0 flex-wrap gap-1">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="archive" class="w-4 h-4 text-cyan-400"></i> Saved Operations Intel Library (${cardArray.length})</h3>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <button id="ws-rework-btn" onclick="window.reworkCheckedWsCard()" class="bg-cyan-900/90 hover:bg-cyan-800 text-cyan-200 text-[9px] font-black px-2.5 py-1 rounded border border-cyan-500/60 uppercase flex items-center gap-1 cursor-pointer shadow">
                                    <i data-lucide="refresh-cw" class="w-3 h-3 text-cyan-300"></i> 🔄 REWORK CARD
                                </button>
                                <button id="ws-to-vault-btn" onclick="window.sendCheckedWsCardsToVault()" class="bg-purple-900/90 hover:bg-purple-800 text-purple-200 text-[9px] font-black px-2.5 py-1 rounded border border-purple-500/60 uppercase flex items-center gap-1 cursor-pointer shadow">
                                    <i data-lucide="folder-plus" class="w-3 h-3 text-purple-300"></i> 📁 SEND TO INTEL VAULT
                                </button>
                                <button id="ws-brag-btn" onclick="openBragBoardStudio()" class="hidden bg-purple-600 text-white text-[9px] font-black px-2.5 py-1 rounded hover:bg-purple-500 transition-all shadow-[0_0_10px_rgba(147,51,234,0.5)] items-center gap-1">
                                    <i data-lucide="camera" class="w-3 h-3"></i> BRAG BOARD (<span id="ws-brag-count">0</span>)
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-1 pb-4 ">`;
                
                cardArray.forEach(card => {
                    let icon = 'monitor';
                    let color = 'text-blue-500';
                    if (card.type === 'medevac') { icon = 'activity'; color = 'text-red-500'; }
                    else if (card.type === 'scorecard') { icon = 'crosshair'; color = 'text-yellow-500'; }
                    else if (card.type === 'logistics') { icon = 'clipboard-list'; color = 'text-emerald-500'; }
                    else if (card.type === 'roster') { icon = 'users'; color = 'text-blue-500'; }
                    else if (card.type === 'bragboard') { icon = 'camera'; color = 'text-purple-500'; }
                    else if (card.type === 'officer') { icon = 'shield-alert'; color = 'text-cyan-400'; }

                    const thumbHtml = card.image 
                        ? `<img src="${card.image}" class="w-10 h-10 object-cover rounded border border-slate-700 shrink-0">`
                        : `<div class="w-10 h-10 rounded border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center"><i data-lucide="${icon}" class="w-4 h-4 ${color} opacity-80"></i></div>`;

                    savedCardsHtml += `
                        <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2 flex flex-row items-center gap-2.5 hover:border-cyan-500/50 transition-colors group relative shadow-sm shrink-0">
                            <input type="checkbox" class="ws-library-checkbox w-4 h-4 rounded bg-slate-900 border-slate-600 text-purple-600 focus:ring-purple-600 cursor-pointer shrink-0" value="${card.id}" onchange="window.checkWsCheckboxes()">
                            ${thumbHtml}
                            <div class="flex-1 min-w-0 cursor-pointer" onclick="loadWorkstationCard('${card.id}')">
                                <div class="flex items-center gap-1 mb-0.5">
                                    <i data-lucide="${icon}" class="w-3 h-3 ${color} shrink-0"></i>
                                    <span class="text-[10px] font-black ${color} truncate uppercase tracking-widest">${card.title || card.type}</span>
                                </div>
                                <div class="text-[8px] text-slate-400 font-mono">${new Date(card.timestamp).toLocaleString()}</div>
                            </div>
                            <button onclick="window.deleteWorkstationCard('${card.id}')" class="p-1.5 rounded bg-slate-900 hover:bg-red-900/80 transition-all border border-slate-800 hover:border-red-500 shrink-0" title="Delete Saved Card">
                                <i data-lucide="trash-2" class="w-3 h-3 text-red-400"></i>
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

    container.innerHTML = `
        <div class="w-full flex flex-col max-w-4xl mx-auto p-1 pb-16">
            <!-- STATIONARY TOP ACTION AREA -->
            <div id="ws-top-action-area" class="w-full shrink-0">
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 w-full mt-1">
                    <!-- 1. MEDEVAC / INCIDENT -->
                    <button onclick="openWorkstationForm('medevac')" class="bg-slate-900/90 border border-red-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 hover:border-red-500 transition-all group">
                        <i data-lucide="activity" class="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-white uppercase leading-tight">9-Line MEDEVAC</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Incident Report</div>
                        </div>
                    </button>

                    <!-- 2. SCORECARD -->
                    <button onclick="openWorkstationForm('scorecard')" class="bg-slate-900/90 border border-yellow-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 hover:border-yellow-500 transition-all group">
                        <i data-lucide="crosshair" class="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-white uppercase leading-tight">Scorecard</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Match & Drill Log</div>
                        </div>
                    </button>

                    <!-- 3. LOGISTICS -->
                    <button onclick="openWorkstationForm('logistics')" class="bg-slate-900/90 border border-emerald-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 hover:border-emerald-500 transition-all group">
                        <i data-lucide="clipboard-list" class="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-white uppercase leading-tight">Logistics</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Expense Wrap-up</div>
                        </div>
                    </button>

                    <!-- 4. ACCOUNTABILITY -->
                    <button onclick="openWorkstationForm('roster')" class="bg-slate-900/90 border border-blue-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 hover:border-blue-500 transition-all group">
                        <i data-lucide="users" class="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-white uppercase leading-tight">Accountability</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Squad Status</div>
                        </div>
                    </button>

                    <!-- 5. BRAG BOARD -->
                    <button onclick="openWorkstationForm('bragboard')" class="bg-slate-900/90 border border-purple-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 hover:border-purple-500 transition-all group">
                        <i data-lucide="camera" class="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-white uppercase leading-tight">Media Summary</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Brag Board</div>
                        </div>
                    </button>

                    <!-- 6. OFFICER SITREP (FIRST RESPONDER) -->
                    <button onclick="openWorkstationForm('officer')" class="bg-blue-950/80 border-2 border-cyan-400 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-blue-900/90 hover:border-cyan-300 transition-all group shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                        <i data-lucide="shield-alert" class="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-cyan-300 uppercase leading-tight">OFFICER SITREP</div>
                            <div class="text-[6.5px] font-bold text-cyan-400/80 uppercase tracking-wider mt-0.5">First Responder</div>
                        </div>
                    </button>

                    <!-- 7. TACTICAL JOURNAL -->
                    <button onclick="openWorkstationForm('journal')" style="border-color: var(--accent-color, #6366f1); box-shadow: 0 0 15px rgba(0,0,0,0.3);" onmouseover="this.style.boxShadow='0 0 15px var(--accent-color, #6366f1)';" onmouseout="this.style.boxShadow='0 0 15px rgba(0,0,0,0.3)';" class="bg-slate-900/90 border-2 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 transition-all group">
                        <i data-lucide="book-open" style="color: var(--accent-color, #6366f1);" class="w-5 h-5 group-hover:scale-110 transition-transform"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black uppercase leading-tight" style="color: var(--accent-color, #6366f1);">TACTICAL JOURNAL</div>
                            <div class="text-[6.5px] text-slate-400 uppercase mt-0.5">Daily / Weekly Log</div>
                        </div>
                    </button>

                    <!-- 8. MASTER OP-PLAN -->
                    <button onclick="window.openMasterOpForm ? window.openMasterOpForm() : alert('Master Op-Plan module not loaded.')" class="bg-amber-950/80 border-2 border-amber-500 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:bg-amber-900/90 hover:border-amber-400 transition-all group shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <i data-lucide="map" class="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform animate-pulse"></i>
                        <div class="text-center">
                            <div class="text-[9px] font-black text-amber-400 uppercase leading-tight">OP-PLAN</div>
                            <div class="text-[6.5px] font-bold text-amber-500/80 uppercase tracking-wider mt-0.5">Mission Command</div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- UNRESTRICTED SCROLLABLE BOTTOM LIBRARY AREA -->
            <div id="ws-bottom-library-area" class="w-full flex-1 flex flex-col mt-2">
                ${savedCardsHtml}
            </div>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
};

window.openWorkstationForm = function(type, rawCardData = null) {
    const container = document.getElementById('ws-top-action-area') || document.getElementById('workstation-container');
    if (!container) return;

    // Normalize cardData unwrapping if passed from vaultCache / intelVault wrapper
    const cardData = (rawCardData && rawCardData.workstationData) ? rawCardData.workstationData : rawCardData;

    if (type === 'officer' || type === 'first_responder' || type === 'sitrep') {
        if (typeof window.renderOfficerForm === 'function') {
            window.renderOfficerForm(cardData);
            return;
        }
    }
    if (type === 'master_op' || type === 'master_op_card' || type === 'op_plan') {
        if (typeof window.openMasterOpForm === 'function') {
            window.openMasterOpForm(cardData);
            return;
        }
    }
    if (type === 'blog' || type === 'intel_report' || type === 'contact') {
        if (typeof window.reworkBusinessCard === 'function') {
            window.reworkBusinessCard(cardData);
            return;
        }
    }

    let headerIcon, headerColor, headerTitle;
    let formFields = '';

    const id = cardData ? cardData.id : Date.now();
    const existingImage = cardData ? cardData.image : '';

    if (type === 'medevac') {
        headerIcon = 'activity'; headerColor = 'text-red-500'; headerTitle = '9-LINE MEDEVAC / INCIDENT REPORT';
        formFields = `
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] text-gray-500">Location</label><input type="text" id="ws-loc" value="${cardData?.data?.loc || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Frequency/Callsign</label><input type="text" id="ws-freq" value="${cardData?.data?.freq || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Patients by Precedence</label><input type="text" id="ws-prec" value="${cardData?.data?.prec || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div><label class="text-[10px] text-gray-500">Special Equipment</label><input type="text" id="ws-equip" value="${cardData?.data?.equip || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
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
    } else if (type === 'journal') {
        headerIcon = 'book-open'; headerColor = 'text-indigo-500'; headerTitle = 'TACTICAL JOURNAL';
        const dNow = new Date().toLocaleString();
        formFields = `
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] text-gray-500">Date & Time</label><input type="text" id="ws-j-date" value="${cardData?.data?.date || dNow}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div>
                    <label class="text-[10px] text-gray-500">Entry Type</label>
                    <select id="ws-j-type" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded">
                        <option value="DAILY" ${cardData?.data?.type === 'DAILY' ? 'selected' : ''}>DAILY LOG</option>
                        <option value="WEEKLY" ${cardData?.data?.type === 'WEEKLY' ? 'selected' : ''}>WEEKLY WRAP-UP</option>
                        <option value="MONTHLY" ${cardData?.data?.type === 'MONTHLY' ? 'selected' : ''}>MONTHLY REPORT</option>
                        <option value="AD-HOC" ${cardData?.data?.type === 'AD-HOC' ? 'selected' : ''}>AD-HOC ENTRY</option>
                    </select>
                </div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Subject / Title</label><input type="text" id="ws-j-subject" value="${cardData?.data?.subject || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Summary (Short)</label><input type="text" id="ws-j-summary" value="${cardData?.data?.summary || ''}" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded"></div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Full Entry</label><textarea id="ws-j-entry" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-32">${cardData?.data?.entry || ''}</textarea></div>
                <div class="col-span-2"><label class="text-[10px] text-gray-500">Action Items / Follow-ups</label><textarea id="ws-j-action" class="w-full bg-black border border-gray-700 text-white text-xs p-2 rounded h-16">${cardData?.data?.action || ''}</textarea></div>
            </div>`;
    }

    container.innerHTML = `
        <div class="h-full flex flex-col w-full max-w-4xl mx-auto relative overflow-hidden">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-800 shrink-0 flex-wrap gap-1 bg-slate-950/95 sticky top-0 z-30 pt-1">
                <button onclick="renderWorkstationMenu()" style="color: var(--accent-color, #38bdf8);" class="hover:brightness-150 flex items-center gap-1 text-[10px] uppercase font-bold transition-all">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i> BACK
                </button>
                <div class="flex items-center gap-1.5">
                    <i data-lucide="${headerIcon}" class="w-4 h-4 ${headerColor}"></i>
                    <h2 class="text-[10px] md:text-xs font-black text-white uppercase tracking-widest truncate">${headerTitle}</h2>
                </div>
                <div class="w-12"></div> <!-- spacer for centering -->
            </div>

            <!-- FORM SCROLL AREA -->
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-16">
                <div class="space-y-4">
                    ${formFields}

                    ${type === 'bragboard' ? `
                    <!-- 4-SLOT DUAL-SOURCE BRAG BOARD GRID -->
                    <div class="mt-4 pt-4 border-t border-purple-900/60">
                        <label class="text-[10px] text-purple-400 block mb-2 font-black uppercase tracking-wider flex items-center gap-1.5">
                            <i data-lucide="grid" class="w-4 h-4 text-purple-400"></i> BRAG BOARD COMPOSITE SLOTS (UP TO 4 CARDS / PHOTOS)
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${[1, 2, 3, 4].map(num => {
                                const slotVal = cardData?.data?.[`slot${num}`] || (num === 1 ? existingImage : '');
                                return `
                                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2.5 flex flex-col justify-between items-center relative shadow">
                                    <span class="text-[9px] font-black text-purple-300 uppercase tracking-widest self-start mb-1">SLOT ${num}</span>
                                    <div id="brag-slot-${num}-preview" class="w-full h-24 bg-black rounded border border-slate-800 overflow-hidden flex items-center justify-center mb-2">
                                        ${slotVal ? `<img src="${slotVal}" class="w-full h-full object-contain">` : `<span class="text-[9px] text-slate-600 font-mono">EMPTY SLOT ${num}</span>`}
                                    </div>
                                    <div class="flex items-center gap-1 w-full flex-wrap">
                                        <button type="button" onclick="window.pickBragVaultCard(${num})" class="flex-1 bg-purple-950 hover:bg-purple-900 border border-purple-600/60 text-purple-200 text-[8px] font-black py-1 px-1.5 rounded uppercase flex items-center justify-center gap-1 cursor-pointer">
                                            <i data-lucide="folder" class="w-3 h-3 text-purple-400"></i> VAULT
                                        </button>
                                        <label class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[8px] font-black py-1 px-1.5 rounded uppercase flex items-center justify-center gap-1 cursor-pointer">
                                            <i data-lucide="camera" class="w-3 h-3 text-slate-300"></i> UPLOAD
                                            <input type="file" accept="image/*" class="hidden" onchange="window.handleBragFileUpload(${num}, event)">
                                        </label>
                                        <button type="button" onclick="window.clearBragSlot(${num})" class="bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 text-[8px] font-black p-1 rounded cursor-pointer" title="Clear Slot ${num}">
                                            <i data-lucide="x" class="w-3 h-3"></i>
                                        </button>
                                    </div>
                                    <input type="hidden" id="brag-slot-${num}-data" value="${slotVal}">
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    ` : `
                    <!-- Standard Image Attachment UI for non-bragboard forms -->
                    <div class="mt-4 pt-4 border-t border-gray-800">
                        <label class="text-[10px] text-gray-500 block mb-2 font-bold uppercase tracking-wider">Attach Intel Photo</label>
                        <div class="flex items-center gap-4">
                            <label class="cursor-pointer bg-gray-900 border border-gray-700 px-4 py-2 rounded text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2 shadow">
                                <i data-lucide="camera" class="w-4 h-4"></i> BROWSE
                                <input type="file" accept="image/*" class="hidden" id="ws-image-upload">
                            </label>
                            <div id="ws-image-preview-container" class="${existingImage ? 'block' : 'hidden'} relative w-24 h-24 border border-gray-700 rounded overflow-hidden shadow">
                                <img id="ws-image-preview" src="${existingImage}" class="w-full h-full object-cover">
                                <button onclick="clearWsImage()" class="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-500"><i data-lucide="x" class="w-3 h-3 text-white"></i></button>
                            </div>
                        </div>
                        <input type="hidden" id="ws-image-data" value="${existingImage}">
                    </div>
                    `}
                </div>
            </div>

            <!-- STICKY ALWAYS-VISIBLE BOTTOM ACTION BAR -->
            <div class="pt-3 pb-3 border-t border-gray-800 flex justify-between items-center shrink-0 flex-wrap gap-2 bg-slate-950/95 sticky bottom-0 z-30 px-1">
                <button onclick="window.clearWorkstationForm()" class="bg-red-950/80 hover:bg-red-900 text-red-400 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded transition-all border border-red-800 flex items-center gap-1.5 cursor-pointer shadow">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> CLEAR FORM
                </button>
                <button onclick="saveWorkstationCard('${type}', ${id})" class="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5 cursor-pointer">
                    <i data-lucide="save" class="w-3.5 h-3.5"></i> 💾 SAVE CARD
                </button>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

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
    const dataInput = document.getElementById('ws-image-data');
    const prevImg = document.getElementById('ws-image-preview');
    const container = document.getElementById('ws-image-preview-container');
    const uploadInput = document.getElementById('ws-image-upload');
    if (dataInput) dataInput.value = '';
    if (prevImg) prevImg.src = '';
    if (container) container.classList.add('hidden');
    if (uploadInput) uploadInput.value = '';
};

// Brag Board Dual-Source Slot Handlers (Vault Picker & Device Upload)
window.pickBragVaultCard = async function(slotNum) {
    // 1. Synchronously launch modal overlay ON TOP of everything (z-index: 2147483647)
    let modalOverlay = document.getElementById('brag-vault-picker-modal');
    if (modalOverlay) modalOverlay.remove();

    modalOverlay = document.createElement('div');
    modalOverlay.id = 'brag-vault-picker-modal';
    modalOverlay.setAttribute('style', 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; background: rgba(2, 6, 23, 0.95) !important; backdrop-filter: blur(12px) !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 1rem !important; pointer-events: auto !important;');
    
    modalOverlay.innerHTML = `
        <div class="bg-slate-950 border-2 border-purple-500 rounded-xl p-4 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative" style="z-index: 2147483647;">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
                <h3 class="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                    <i data-lucide="folder" class="w-4 h-4 text-purple-400"></i> SELECT CARD FOR BRAG SLOT ${slotNum}
                </h3>
                <button onclick="document.getElementById('brag-vault-picker-modal').remove()" class="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 text-[10px] font-black px-2.5 py-1 rounded uppercase flex items-center gap-1 cursor-pointer">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> CLOSE
                </button>
            </div>
            <div id="brag-vault-grid-content" class="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-mono text-xs">
                <div class="animate-pulse flex flex-col items-center gap-2">
                    <i data-lucide="loader" class="w-8 h-8 text-purple-400 animate-spin"></i>
                    <span>SCANNING INTEL VAULT & WORKSTATION LIBRARIES...</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);
    if (window.lucide) window.lucide.createIcons();

    // 2. Gather items safely across all sources
    let vaultItems = [];

    if (window.vaultCache && Array.isArray(window.vaultCache)) {
        vaultItems = [...window.vaultCache];
    }

    const db = window.TRC_IDB || window.idb;
    if (db && typeof db.getAll === 'function') {
        const storesToQuery = ['intelVault', 'workstationLibrary', 'boloLibrary', 'rangeCardProfiles', 'gameTagLibrary', 'licenseLibrary'];
        for (const storeName of storesToQuery) {
            try {
                const storePromise = db.getAll(storeName);
                const timeoutPromise = new Promise(res => setTimeout(() => res(null), 800));
                const storeData = await Promise.race([storePromise, timeoutPromise]);
                if (storeData) {
                    const items = Object.values(storeData);
                    items.forEach(c => {
                        if (c && (c.image || c.imageUrl || c.cardImageUrl || c.workstationData)) {
                            if (!vaultItems.some(v => (v.id && c.id && v.id.toString() === c.id.toString()))) {
                                vaultItems.push(c);
                            }
                        }
                    });
                }
            } catch(e1) {}
        }
    }

    if (typeof getBriefingInventory === 'function') {
        try {
            const briefs = getBriefingInventory();
            if (briefs) {
                Object.values(briefs).forEach(b => {
                    if (b && b.image && !vaultItems.some(v => v.id && b.id && v.id.toString() === b.id.toString())) {
                        vaultItems.push(b);
                    }
                });
            }
        } catch(e2) {}
    }

    const gridContentEl = document.getElementById('brag-vault-grid-content');
    if (!gridContentEl) return;

    if (!vaultItems || vaultItems.length === 0) {
        gridContentEl.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono text-xs uppercase space-y-2">
                <i data-lucide="alert-triangle" class="w-8 h-8 text-amber-500 opacity-60"></i>
                <div class="text-white font-bold text-sm">NO SAVED CARDS FOUND IN VAULT</div>
                <div class="text-[10px] text-slate-400 max-w-xs">Save or export cards from Window #6 forms (MEDEVAC, Scorecard, Roster) or Intel Vault first to pick them here!</div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    window.tempBragVaultItems = vaultItems;

    const itemsGridHtml = vaultItems.map((v, idx) => {
        const thumb = v.image || v.imageUrl || v.cardImageUrl || (v.workstationData ? v.workstationData.image : '');
        const label = v.label || v.title || v.name || v.missionName || (v.workstationData ? v.workstationData.title : 'INTEL CARD');
        return `
            <div onclick="window.selectBragVaultCardByIndex(${slotNum}, ${idx})" class="bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-lg p-2 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all group shadow shrink-0">
                <div class="w-full h-24 bg-black rounded overflow-hidden flex items-center justify-center border border-slate-800 pointer-events-none">
                    ${thumb ? `<img src="${thumb}" class="w-full h-full object-contain">` : `<div class="flex flex-col items-center justify-center text-purple-400 p-1"><i data-lucide="image" class="w-6 h-6 mb-1 opacity-60"></i><span class="text-[8px] font-mono text-slate-400">NO PREVIEW</span></div>`}
                </div>
                <span class="text-[9px] font-black text-purple-300 truncate w-full text-center uppercase tracking-wider pointer-events-none">${label}</span>
            </div>
        `;
    }).join('');

    gridContentEl.className = "grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar p-1 flex-1";
    gridContentEl.innerHTML = itemsGridHtml;
    if (window.lucide) window.lucide.createIcons();
};

window.selectBragVaultCardByIndex = function(slotNum, idx) {
    const item = window.tempBragVaultItems ? window.tempBragVaultItems[idx] : null;
    if (!item) return;

    const imgSrc = item.image || item.imageUrl || item.cardImageUrl || (item.workstationData ? item.workstationData.image : '');
    if (!imgSrc) {
        alert("Selected item has no visual image snapshot.");
        return;
    }

    const inputData = document.getElementById(`brag-slot-${slotNum}-data`);
    const previewContainer = document.getElementById(`brag-slot-${slotNum}-preview`);

    if (inputData) inputData.value = imgSrc;
    if (previewContainer) {
        previewContainer.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain">`;
    }

    const modal = document.getElementById('brag-vault-picker-modal');
    if (modal) modal.remove();

    if (window.pushTacLog) window.pushTacLog(`LOADED INTEL TO BRAG SLOT ${slotNum}`, "SUCCESS");
};

window.selectBragVaultCard = window.selectBragVaultCardByIndex;

window.selectBragVaultCard = window.selectBragVaultCardByIndex;

window.handleBragFileUpload = function(slotNum, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const imgSrc = ev.target.result;
            const inputData = document.getElementById(`brag-slot-${slotNum}-data`);
            const previewContainer = document.getElementById(`brag-slot-${slotNum}-preview`);

            if (inputData) inputData.value = imgSrc;
            if (previewContainer) {
                previewContainer.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain">`;
            }
        };
        reader.readAsDataURL(file);
    }
};

window.clearBragSlot = function(slotNum) {
    const inputData = document.getElementById(`brag-slot-${slotNum}-data`);
    const previewContainer = document.getElementById(`brag-slot-${slotNum}-preview`);

    if (inputData) inputData.value = '';
    if (previewContainer) {
        previewContainer.innerHTML = `<span class="text-[9px] text-slate-600 font-mono">EMPTY SLOT ${slotNum}</span>`;
    }
};

// Canvas 2D Composite Visual Range Card Generator (Bakes form text fields + attached photo into 1 complete snapshot)
window.generateWorkstationCompositeCard = async function(type, title, data, attachedPhotoUrl) {
    return new Promise(async (resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');

            let accentColor = '#3b82f6';
            if (type === 'medevac') accentColor = '#ef4444';
            else if (type === 'scorecard') accentColor = '#eab308';
            else if (type === 'logistics') accentColor = '#10b981';
            else if (type === 'roster') accentColor = '#3b82f6';
            else if (type === 'bragboard') accentColor = '#a855f7';
            else if (type === 'journal') accentColor = '#6366f1';

            // Background & Border
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

            // Header Banner
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(6, 6, canvas.width - 12, 50);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(6, 56); ctx.lineTo(canvas.width - 6, 56); ctx.stroke();

            ctx.fillStyle = accentColor;
            ctx.font = 'bold 20px monospace';
            ctx.fillText((title || type).toUpperCase(), 20, 38);

            const timestampStr = new Date().toLocaleString();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px monospace';
            ctx.fillText(timestampStr, canvas.width - 230, 36);

            // Check attached photo presence
            const hasPhoto = Boolean(attachedPhotoUrl && typeof attachedPhotoUrl === 'string' && attachedPhotoUrl.startsWith('data:image'));
            
            let y = 85;
            const drawField = (label, val) => {
                if (y > canvas.height - 30) return;
                ctx.fillStyle = accentColor;
                ctx.font = 'bold 12px monospace';
                ctx.fillText(label.toUpperCase(), 20, y);
                y += 18;

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 15px sans-serif';
                const lines = String(val || 'N/A').split('\n');
                lines.forEach(l => {
                    if (y > canvas.height - 20) return;
                    ctx.fillText(l.slice(0, hasPhoto ? 35 : 65), 20, y);
                    y += 22;
                });
                y += 10;
            };

            if (type === 'medevac') {
                drawField('Location', data.loc);
                drawField('Freq / Callsign', data.freq);
                drawField('Patients by Precedence', data.prec);
                drawField('Special Equipment', data.equip);
                drawField('Incident Details', data.details);
            } else if (type === 'scorecard') {
                drawField('Match / Stage Name', data.match);
                drawField('Total Time', data.time);
                drawField('Hits / Points', data.hits);
                drawField('Penalties', data.penalties);
                drawField('Stage Notes', data.notes);
            } else if (type === 'logistics') {
                drawField('Ammo Expended', data.ammo);
                drawField('Gear Damaged/Lost', data.gear);
                drawField('Total Cost Estimate', data.cost);
                drawField('Resupply Needed', data.resupply);
            } else if (type === 'roster') {
                drawField('Squad / Element Name', data.squad);
                drawField('Personnel Status', data.personnel);
            } else if (type === 'bragboard') {
                drawField('Event / Achievement', data.event);
                drawField('Trophy Summary', data.summary);
            } else if (type === 'journal') {
                drawField('Date & Time', data.date);
                drawField('Entry Type', data.type);
                drawField('Subject / Title', data.subject);
                drawField('Summary', data.summary);
                drawField('Full Entry', data.entry);
                drawField('Action Items', data.action);
            }

            if (type === 'bragboard') {
                const slotImgs = [
                    data.slot1, data.slot2, data.slot3, data.slot4
                ].filter(s => Boolean(s && typeof s === 'string' && s.startsWith('data:image')));

                if (slotImgs.length > 0) {
                    const loadedImages = await Promise.all(slotImgs.map(src => new Promise(res => {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => res(img);
                        img.onerror = () => res(null);
                        img.src = src;
                    })));

                    const validImgs = loadedImages.filter(Boolean);
                    if (validImgs.length > 0) {
                        const px = 430, py = 75, pw = 350, ph = 490;
                        ctx.fillStyle = '#020617';
                        ctx.fillRect(px, py, pw, ph);
                        ctx.strokeStyle = '#1e293b';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px, py, pw, ph);

                        ctx.fillStyle = '#c084fc';
                        ctx.font = 'bold 11px monospace';
                        ctx.fillText(`MEDIA BRAG BOARD (${validImgs.length} CARDS/PHOTOS)`, px + 15, py + 22);

                        if (validImgs.length === 1) {
                            const img = validImgs[0];
                            const ratio = Math.min((pw - 20) / img.width, (ph - 40) / img.height);
                            const nw = img.width * ratio, nh = img.height * ratio;
                            ctx.drawImage(img, px + 10 + ((pw - 20) - nw)/2, py + 30 + ((ph - 40) - nh)/2, nw, nh);
                        } else if (validImgs.length === 2) {
                            const subH = (ph - 45) / 2;
                            validImgs.forEach((img, idx) => {
                                const sy = py + 30 + idx * (subH + 5);
                                const ratio = Math.min((pw - 20) / img.width, subH / img.height);
                                const nw = img.width * ratio, nh = img.height * ratio;
                                ctx.drawImage(img, px + 10 + ((pw - 20) - nw)/2, sy + (subH - nh)/2, nw, nh);
                            });
                        } else {
                            const subW = (pw - 25) / 2;
                            const subH = (ph - 45) / 2;
                            validImgs.slice(0, 4).forEach((img, idx) => {
                                const col = idx % 2;
                                const row = Math.floor(idx / 2);
                                const sx = px + 10 + col * (subW + 5);
                                const sy = py + 30 + row * (subH + 5);
                                const ratio = Math.min(subW / img.width, subH / img.height);
                                const nw = img.width * ratio, nh = img.height * ratio;
                                ctx.drawImage(img, sx + (subW - nw)/2, sy + (subH - nh)/2, nw, nh);
                            });
                        }
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                        return;
                    }
                }
            }

            if (hasPhoto) {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    try {
                        const px = 450, py = 75, pw = 330, ph = 490;
                        ctx.fillStyle = '#020617';
                        ctx.fillRect(px, py, pw, ph);
                        ctx.strokeStyle = '#1e293b';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px, py, pw, ph);

                        ctx.fillStyle = '#64748b';
                        ctx.font = 'bold 11px monospace';
                        ctx.fillText('ATTACHED INTEL PHOTO', px + 15, py + 22);

                        let iw = img.width || 300, ih = img.height || 200;
                        const maxW = pw - 20, maxH = ph - 40;
                        const ratio = Math.min(maxW / iw, maxH / ih);
                        const nw = iw * ratio, nh = ih * ratio;
                        const nx = px + 10 + (maxW - nw) / 2;
                        const ny = py + 30 + (maxH - nh) / 2;

                        ctx.drawImage(img, nx, ny, nw, nh);
                    } catch(e) {}
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.85));
                img.src = attachedPhotoUrl;
            } else {
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            }
        } catch(e) {
            resolve(attachedPhotoUrl || '');
        }
    });
};

window.saveWorkstationCard = async function(type, id) {
    let data = {};
    let title = '';

    if (type === 'medevac') {
        data = {
            loc: document.getElementById('ws-loc')?.value || '',
            freq: document.getElementById('ws-freq')?.value || '',
            prec: document.getElementById('ws-prec')?.value || '',
            equip: document.getElementById('ws-equip')?.value || '',
            details: document.getElementById('ws-details')?.value || ''
        };
        title = "MEDEVAC: " + (data.loc || 'UNTITLED');
    } else if (type === 'scorecard') {
        data = {
            match: document.getElementById('ws-match')?.value || '',
            time: document.getElementById('ws-time')?.value || '',
            hits: document.getElementById('ws-hits')?.value || '',
            penalties: document.getElementById('ws-penalties')?.value || '',
            notes: document.getElementById('ws-notes')?.value || ''
        };
        title = "SCORECARD: " + (data.match || 'UNTITLED');
    } else if (type === 'logistics') {
        data = {
            ammo: document.getElementById('ws-ammo')?.value || '',
            gear: document.getElementById('ws-gear')?.value || '',
            cost: document.getElementById('ws-cost')?.value || '',
            resupply: document.getElementById('ws-resupply')?.value || ''
        };
        title = "LOGISTICS: " + new Date().toLocaleDateString();
    } else if (type === 'roster') {
        data = {
            squad: document.getElementById('ws-squad')?.value || '',
            personnel: document.getElementById('ws-personnel')?.value || ''
        };
        title = "ROSTER: " + (data.squad || 'UNTITLED');
    } else if (type === 'bragboard') {
        data = {
            event: document.getElementById('ws-event')?.value || '',
            summary: document.getElementById('ws-summary')?.value || '',
            slot1: document.getElementById('brag-slot-1-data')?.value || '',
            slot2: document.getElementById('brag-slot-2-data')?.value || '',
            slot3: document.getElementById('brag-slot-3-data')?.value || '',
            slot4: document.getElementById('brag-slot-4-data')?.value || ''
        };
        title = "BRAG BOARD: " + (data.event || 'UNTITLED');
    } else if (type === 'journal') {
        data = {
            date: document.getElementById('ws-j-date')?.value || '',
            type: document.getElementById('ws-j-type')?.value || 'DAILY',
            subject: document.getElementById('ws-j-subject')?.value || '',
            summary: document.getElementById('ws-j-summary')?.value || '',
            entry: document.getElementById('ws-j-entry')?.value || '',
            action: document.getElementById('ws-j-action')?.value || ''
        };
        title = "JOURNAL (" + data.type + "): " + (data.subject || 'UNTITLED');
    }

    // Generate full high-contrast composite visual Range Card snapshot combining text fields AND attached photo
    const attachedPhoto = document.getElementById('ws-image-data')?.value || '';
    const compositeImage = await window.generateWorkstationCompositeCard(type, title, data, attachedPhoto);

    const cardData = {
        id: id,
        type: type,
        title: title,
        timestamp: new Date().toISOString(),
        data: data,
        image: compositeImage
    };

    try {
        await window.TRC_IDB.set('workstationLibrary', cardData.id, cardData);
        window.pushTacLog("WORKSTATION CARD SAVED TO LIBRARY", "SUCCESS");
        renderWorkstationMenu();
    } catch (e) {
        console.error("Failed to save workstation card:", e);
        alert('Failed to save card. See console for details.');
    }
};

window.loadWorkstationCard = async function(id) {
    if (!id) return;
    try {
        let card = null;
        if (window.TRC_IDB) {
            const intId = parseInt(id);
            if (!isNaN(intId)) card = await window.TRC_IDB.get('workstationLibrary', intId);
            if (!card) card = await window.TRC_IDB.get('workstationLibrary', id.toString());
        }
        if (!card && window.vaultCache) {
            const vaultItem = window.vaultCache.find(v => v.id == id || v.id == parseInt(id) || v.id == id.toString());
            if (vaultItem) card = vaultItem.workstationData || vaultItem;
        }
        if (!card && window.TRC_IDB) {
            const vaultCard = await window.TRC_IDB.get('intelVault', id.toString());
            if (vaultCard) card = vaultCard.workstationData || vaultCard;
        }
        if (card) {
            const actualCard = card.workstationData || card;
            const cardType = actualCard.type || 'medevac';
            openWorkstationForm(cardType, actualCard);
        } else {
            console.warn("Card not found in workstationLibrary or intelVault for ID:", id);
        }
    } catch(e) {
        console.error("Failed to load card", e);
    }
};

window.loadWorkstationBackToEditorById = async function(id) {
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

    await window.loadWorkstationCard(id);
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
        // Try deleting as number AND string to cover all bases
        await window.TRC_IDB.delete('workstationLibrary', parseInt(id));
        await window.TRC_IDB.delete('workstationLibrary', id.toString());
        
        // Also remove from Vault if it exists
        if (typeof vaultCache !== 'undefined') {
            const vaultIdx = vaultCache.findIndex(v => v.type === 'workstation' && v.id == id);
            if (vaultIdx !== -1) {
                vaultCache.splice(vaultIdx, 1);
                await window.TRC_IDB.delete('intelVault', parseInt(id));
                await window.TRC_IDB.delete('intelVault', id.toString());
                if (typeof refreshVaultGrid === 'function') refreshVaultGrid();
            }
        }
        
        window.renderWorkstationMenu();
    }
};

window.checkWsCheckboxes = function() {
    const checked = document.querySelectorAll('.ws-library-checkbox:checked');
    const btn = document.getElementById('ws-brag-btn');
    const countSpan = document.getElementById('ws-brag-count');
    
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
    if (window.lucide) window.lucide.createIcons();
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
