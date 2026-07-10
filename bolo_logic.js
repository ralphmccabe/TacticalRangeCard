// --- BOLO / MOST WANTED LOGIC ---
const boloModal = document.getElementById('bolo-modal');
const openBoloBtns = document.querySelectorAll('#openBoloBtn, #openBoloBtnHud');
const boloImageUpload = document.getElementById('bolo-image-upload');
const boloRenderImg = document.getElementById('bolo-render-img');
const boloImagePlaceholder = document.getElementById('bolo-render-img-placeholder');

const boloClearBtn = document.getElementById('bolo-clear-btn');
const boloSaveInventoryBtn = document.getElementById('bolo-save-inventory-btn');
const reworkBoloBtn = document.getElementById('rework-bolo-btn');
const boloToVaultBtnTop = document.getElementById('bolo-to-vault-btn-top');

let currentBoloImage = null;
let activeBoloId = null;
let currentBoloThreatLevel = 'poi';   // 'poi' | 'fugitive' | 'armed'
let currentBoloType = 'person';        // 'person' | 'animal'
let currentBoloSex = 'unknown';        // 'male' | 'female' | 'unknown'
let currentAnimalThreat = 'nuisance'; // 'nuisance' | 'dangerous' | 'trophy'

// ============================================================
// BOLO TYPE TOGGLE  (Person vs Animal)
// ============================================================
window.setBoloType = function(type) {
    currentBoloType = type;

    const personForm   = document.getElementById('bolo-person-fields');
    const animalForm   = document.getElementById('bolo-animal-fields');
    const btnPerson    = document.getElementById('bolo-type-btn-person');
    const btnAnimal    = document.getElementById('bolo-type-btn-animal');
    const photoLabel   = document.getElementById('bolo-photo-label');

    if (type === 'person') {
        if (personForm) personForm.style.display = '';
        if (animalForm) animalForm.style.display = 'none';
        if (btnPerson)  { btnPerson.style.background='#7f1d1d'; btnPerson.style.color='#fca5a5'; btnPerson.style.borderColor='#ef4444'; }
        if (btnAnimal)  { btnAnimal.style.background=''; btnAnimal.style.color='#6b7280'; btnAnimal.style.borderColor='#374151'; }
        if (photoLabel) photoLabel.innerText = 'Suspect Photo';
    } else {
        if (personForm) personForm.style.display = 'none';
        if (animalForm) animalForm.style.display = '';
        if (btnAnimal)  { btnAnimal.style.background='#374151'; btnAnimal.style.color='#d1d5db'; btnAnimal.style.borderColor='#9ca3af'; }
        if (btnPerson)  { btnPerson.style.background=''; btnPerson.style.color='#6b7280'; btnPerson.style.borderColor='#374151'; }
        if (photoLabel) photoLabel.innerText = 'Animal Photo';
    }
};

// ============================================================
// SEX TOGGLE (Person)
// ============================================================
window.setBoloSex = function(sex) {
    currentBoloSex = sex;
    ['male','female','unknown'].forEach(s => {
        const btn = document.getElementById(`bolo-sex-btn-${s}`);
        if (!btn) return;
        if (s === sex) {
            btn.style.background   = sex === 'male' ? '#1e3a5f' : sex === 'female' ? '#5f1e3a' : '#374151';
            btn.style.color        = sex === 'male' ? '#93c5fd' : sex === 'female' ? '#f9a8d4' : '#d1d5db';
            btn.style.borderColor  = sex === 'male' ? '#3b82f6' : sex === 'female' ? '#ec4899' : '#9ca3af';
        } else {
            btn.style.background  = '';
            btn.style.color       = '#6b7280';
            btn.style.borderColor = '#374151';
        }
    });
};

// ============================================================
// ANIMAL THREAT LEVEL
// ============================================================
window.setAnimalThreat = function(level) {
    currentAnimalThreat = level;
    const configs = {
        nuisance:  { bg: 'rgba(180,83,9,0.35)',  color: '#fbbf24', border: '#b45309' },
        dangerous: { bg: 'rgba(127,29,29,0.45)', color: '#f87171', border: '#dc2626' },
        trophy:    { bg: 'rgba(6,78,59,0.35)',   color: '#6ee7b7', border: '#059669' }
    };
    const off = { bg: '', color: '#6b7280', border: '#374151' };
    ['nuisance','dangerous','trophy'].forEach(lvl => {
        const btn = document.getElementById(`bolo-animal-threat-${lvl}`);
        if (!btn) return;
        const s = lvl === level ? configs[level] : off;
        btn.style.background  = s.bg;
        btn.style.color       = s.color;
        btn.style.borderColor = s.border;
    });
};

// ============================================================
// THREAT LEVEL (Person)
// ============================================================
window.setBoloThreatLevel = function(level) {
    currentBoloThreatLevel = level;
    const hiddenInput = document.getElementById('bolo-input-threat');
    if (hiddenInput) hiddenInput.value = level;

    const configs = {
        poi:      { border: '#3b82f6', bg: 'rgba(29,78,216,0.4)',  color: '#93c5fd', shadow: '0 0 10px rgba(59,130,246,0.6)'  },
        fugitive: { border: '#f97316', bg: 'rgba(194,65,12,0.4)',  color: '#fb923c', shadow: '0 0 10px rgba(249,115,22,0.6)'  },
        armed:    { border: '#dc2626', bg: 'rgba(127,29,29,0.5)',  color: '#f87171', shadow: '0 0 12px rgba(220,38,38,0.6)'  }
    };
    const off = { border: '#374151', bg: '#111827', color: '#6b7280', shadow: 'none' };

    ['poi','fugitive','armed'].forEach(lvl => {
        const btn = document.getElementById(`bolo-threat-btn-${lvl}`);
        if (!btn) return;
        const s = lvl === level ? configs[level] : off;
        btn.style.borderColor     = s.border;
        btn.style.backgroundColor = s.bg;
        btn.style.color           = s.color;
        btn.style.boxShadow       = s.shadow;
    });
};

// ============================================================
// OPEN / CLOSE
// ============================================================
window.closeBoloModal = function() {
    if (boloModal) {
        boloModal.classList.add('hidden');
        boloModal.classList.remove('flex');
    }
};

window.openBoloModal = function() {
    boloModal.classList.remove('hidden');
    boloModal.classList.add('flex');
    clearBoloForm();
    renderBoloLibrary();
};

openBoloBtns.forEach(btn => {
    btn.addEventListener('click', window.openBoloModal);
});

// ============================================================
// CLEAR FORM
// ============================================================
function clearBoloForm() {
    // Person fields
    const personInputs = [
        'bolo-input-name','bolo-input-reason','bolo-input-agency','bolo-input-case',
        'bolo-input-dob','bolo-input-build','bolo-input-height','bolo-input-weight',
        'bolo-input-hair','bolo-input-eye','bolo-input-features',
        'bolo-input-lastseen','bolo-input-reward','bolo-input-warning','bolo-input-contact'
    ];
    personInputs.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });

    // Animal fields
    const animalInputs = [
        'bolo-input-species','bolo-input-animal-weight','bolo-input-animal-marks',
        'bolo-input-animal-territory','bolo-input-animal-reward','bolo-input-animal-contact'
    ];
    animalInputs.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });

    // Image
    currentBoloImage = null;
    if(boloRenderImg) { boloRenderImg.src = ''; boloRenderImg.style.display = 'none'; }
    if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'block';
    const formPreviewImg  = document.getElementById('bolo-form-preview-img');
    const formPreviewIcon = document.getElementById('bolo-form-preview-icon');
    if(formPreviewImg)  { formPreviewImg.src = ''; formPreviewImg.classList.add('hidden'); }
    if(formPreviewIcon) formPreviewIcon.style.opacity = '1';
    if(boloImageUpload) boloImageUpload.value = '';
    const label = document.getElementById('bolo-image-label');
    if(label) { label.innerText = 'TAP TO UPLOAD PHOTO'; label.classList.remove('text-neon-green'); label.classList.add('text-gray-400'); }

    // State resets
    activeBoloId = null;
    if(reworkBoloBtn)    reworkBoloBtn.classList.add('hidden');
    if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');

    currentBoloThreatLevel = 'poi';
    window.setBoloThreatLevel('poi');
    window.setBoloSex('unknown');
    window.setAnimalThreat('nuisance');
    // Keep type — don't reset it, preserve user's last mode

    const notesInput   = document.getElementById('bolo-input-notes');
    const notesCounter = document.getElementById('bolo-notes-counter');
    if(notesInput)   notesInput.value = '';
    if(notesCounter) notesCounter.innerText = '0 / 1000';

    renderBoloLibrary();
}

if(boloClearBtn) boloClearBtn.addEventListener('click', clearBoloForm);

// ============================================================
// IMAGE UPLOAD
// ============================================================
if (boloImageUpload) {
    boloImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            currentBoloImage = event.target.result;
            if(boloRenderImg) { boloRenderImg.src = event.target.result; boloRenderImg.style.display = 'block'; }
            if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'none';
            const previewImg  = document.getElementById('bolo-form-preview-img');
            const previewIcon = document.getElementById('bolo-form-preview-icon');
            if(previewImg)  { previewImg.src = event.target.result; previewImg.classList.remove('hidden'); }
            if(previewIcon) previewIcon.style.opacity = '0.3';
            const lbl = document.getElementById('bolo-image-label');
            if(lbl) { lbl.innerText = 'IMAGE UPLOADED'; lbl.classList.remove('text-gray-400'); lbl.classList.add('text-neon-green'); }
        };
        reader.readAsDataURL(file);
    });
}

// ============================================================
// SAVE TO INVENTORY
// ============================================================
if(boloSaveInventoryBtn) {
    boloSaveInventoryBtn.addEventListener('click', async () => {
        if(!window.TRC_IDB) { alert('Database not ready.'); return; }

        const isPerson = currentBoloType === 'person';
        const data = {
            bolo_type:   currentBoloType,
            timestamp:   new Date().toISOString(),
            image:       currentBoloImage,
            notes:       (document.getElementById('bolo-input-notes') || {}).value || '',
            threat_level: currentBoloThreatLevel,
        };

        if (isPerson) {
            data.name         = document.getElementById('bolo-input-name').value    || '';
            data.reason       = document.getElementById('bolo-input-reason').value  || '';
            data.agency       = document.getElementById('bolo-input-agency').value  || '';
            data.case_num     = document.getElementById('bolo-input-case').value    || '';
            data.sex          = currentBoloSex;
            data.dob          = document.getElementById('bolo-input-dob').value     || '';
            data.build        = document.getElementById('bolo-input-build').value   || '';
            data.height       = document.getElementById('bolo-input-height').value  || '';
            data.weight       = document.getElementById('bolo-input-weight').value  || '';
            data.hair         = document.getElementById('bolo-input-hair').value    || '';
            data.eye          = document.getElementById('bolo-input-eye').value     || '';
            data.features     = document.getElementById('bolo-input-features').value|| '';
            data.lastseen     = document.getElementById('bolo-input-lastseen').value|| '';
            data.reward       = document.getElementById('bolo-input-reward').value  || '';
            data.warning      = document.getElementById('bolo-input-warning').value || '';
            data.contact      = document.getElementById('bolo-input-contact').value || '';
            if (!data.name && !data.reason && !data.image) { alert('Fill out at least a Name or Charges.'); return; }
        } else {
            data.agency          = document.getElementById('bolo-input-agency').value           || '';
            data.case_num        = document.getElementById('bolo-input-case').value             || '';
            data.species         = document.getElementById('bolo-input-species').value          || '';
            data.animal_sex      = currentBoloSex;
            data.animal_weight   = document.getElementById('bolo-input-animal-weight').value    || '';
            data.animal_marks    = document.getElementById('bolo-input-animal-marks').value     || '';
            data.animal_territory= document.getElementById('bolo-input-animal-territory').value || '';
            data.animal_reward   = document.getElementById('bolo-input-animal-reward').value    || '';
            data.animal_contact  = document.getElementById('bolo-input-animal-contact').value   || '';
            data.animal_threat   = currentAnimalThreat;
            if (!data.species && !data.image) { alert('Fill out at least a Species.'); return; }
        }

        const id = Date.now().toString();
        data.id = id;
        await window.TRC_IDB.set('boloLibrary', id, data);
        if (window.showToast) window.showToast('BOLO Saved to Inventory');
        clearBoloForm();
        renderBoloLibrary();
    });
}

// ============================================================
// RENDER LIBRARY
// ============================================================
async function renderBoloLibrary() {
    const listEl = document.getElementById('boloLibraryList');
    if(!listEl || !window.TRC_IDB) return;
    try {
        const boloObj  = await window.TRC_IDB.getAll('boloLibrary');
        const allBolos = Object.values(boloObj || {});
        listEl.innerHTML = '';
        if(allBolos.length === 0) {
            listEl.innerHTML = '<div class="col-span-full text-center text-gray-600 text-xs py-10 font-bold tracking-widest border border-dashed border-gray-800 rounded-lg">INVENTORY EMPTY</div>';
            return;
        }
        allBolos.sort((a,b) => Number(b.id) - Number(a.id));
        allBolos.forEach(bolo => {
            const isPerson    = (bolo.bolo_type || 'person') === 'person';
            const isActive    = activeBoloId === bolo.id;
            const dateStr     = new Date(bolo.timestamp).toLocaleString();
            const displayName = isPerson ? (bolo.name || 'UNKNOWN') : (bolo.species || 'UNKNOWN ANIMAL');
            const displaySub  = isPerson ? (bolo.reason || 'WANTED') : (bolo.animal_territory || bolo.animal_threat || 'NUISANCE ANIMAL');
            const accentColor = isPerson ? '#ef4444' : '#9ca3af';
            const cardBorder  = isActive ? (isPerson ? 'border-red-500' : 'border-gray-400') : 'border-gray-800';
            const cardBg      = isActive ? (isPerson ? 'bg-red-900/30' : 'bg-gray-700/30') : 'bg-gray-900/50';
            const typeLabel   = isPerson ? '👤 PERSON' : '🐗 ANIMAL';

            const card = document.createElement('div');
            card.className = `p-3 rounded-lg border-2 cursor-pointer transition-all ${cardBg} ${cardBorder} hover:border-gray-600`;
            card.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <div class="font-black text-[10px] uppercase tracking-widest truncate max-w-[150px]" style="color:${accentColor}">${displayName}</div>
                    <div class="flex gap-1 items-center shrink-0">
                        <span class="text-[8px] font-bold px-1 py-0.5 rounded" style="background:rgba(255,255,255,0.07);color:${accentColor}">${typeLabel}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <div class="w-12 h-12 bg-black border border-gray-700 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        ${bolo.image ? `<img src="${bolo.image}" class="w-full h-full object-cover">` : `<i data-lucide="${isPerson ? 'user' : 'paw-print'}" class="w-4 h-4 text-gray-600"></i>`}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[9px] text-gray-300 truncate">${displaySub}</div>
                        <div class="text-[8px] text-gray-500 truncate mt-1">${dateStr}</div>
                    </div>
                    <button class="text-gray-600 hover:text-red-500 p-1 bg-black rounded self-center" onclick="event.stopPropagation(); deleteBolo('${bolo.id}')" title="Delete">
                        <i data-lucide="trash" class="w-3 h-3"></i>
                    </button>
                </div>
            `;
            card.onclick = () => selectBolo(bolo);
            listEl.appendChild(card);
        });
        if(window.lucide) window.lucide.createIcons();
    } catch(e) { console.error('Failed to render bolo library', e); }
}

window.deleteBolo = async function(id) {
    if(confirm('Delete this BOLO card?')) {
        await window.TRC_IDB.delete('boloLibrary', id);
        if(activeBoloId === id) {
            activeBoloId = null;
            if(reworkBoloBtn)    reworkBoloBtn.classList.add('hidden');
            if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');
        }
        renderBoloLibrary();
    }
};

function selectBolo(bolo) {
    activeBoloId = bolo.id;
    renderBoloLibrary();
    if(reworkBoloBtn)    reworkBoloBtn.classList.remove('hidden');
    if(boloToVaultBtnTop) boloToVaultBtnTop.classList.remove('hidden');
}

// ============================================================
// LOAD BACK TO EDITOR
// ============================================================
window.loadBoloBackToEditor = function(bolo) {
    if(!bolo) return;
    const isPerson = (bolo.bolo_type || 'person') === 'person';

    // Set type first (shows/hides correct form sections)
    window.setBoloType(bolo.bolo_type || 'person');

    if (isPerson) {
        const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
        set('bolo-input-name',     bolo.name);
        set('bolo-input-reason',   bolo.reason);
        set('bolo-input-agency',   bolo.agency);
        set('bolo-input-case',     bolo.case_num);
        set('bolo-input-dob',      bolo.dob);
        set('bolo-input-build',    bolo.build);
        set('bolo-input-height',   bolo.height);
        set('bolo-input-weight',   bolo.weight);
        set('bolo-input-hair',     bolo.hair);
        set('bolo-input-eye',      bolo.eye);
        set('bolo-input-features', bolo.features);
        set('bolo-input-lastseen', bolo.lastseen);
        set('bolo-input-reward',   bolo.reward);
        set('bolo-input-warning',  bolo.warning);
        set('bolo-input-contact',  bolo.contact);
        window.setBoloThreatLevel(bolo.threat_level || 'poi');
        window.setBoloSex(bolo.sex || 'unknown');
    } else {
        const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
        set('bolo-input-agency',           bolo.agency);
        set('bolo-input-case',             bolo.case_num);
        set('bolo-input-species',          bolo.species);
        set('bolo-input-animal-weight',    bolo.animal_weight);
        set('bolo-input-animal-marks',     bolo.animal_marks);
        set('bolo-input-animal-territory', bolo.animal_territory);
        set('bolo-input-animal-reward',    bolo.animal_reward);
        set('bolo-input-animal-contact',   bolo.animal_contact);
        window.setAnimalThreat(bolo.animal_threat || 'nuisance');
        window.setBoloSex(bolo.animal_sex || 'unknown');
    }

    // Notes
    const notesInput   = document.getElementById('bolo-input-notes');
    const notesCounter = document.getElementById('bolo-notes-counter');
    if(notesInput)   { notesInput.value = bolo.notes || ''; }
    if(notesCounter) { notesCounter.innerText = (bolo.notes || '').length + ' / 1000'; }

    // Image
    currentBoloImage = bolo.image || null;
    const formPreviewImg  = document.getElementById('bolo-form-preview-img');
    const formPreviewIcon = document.getElementById('bolo-form-preview-icon');
    const lbl = document.getElementById('bolo-image-label');
    if(bolo.image) {
        if(formPreviewImg)  { formPreviewImg.src = bolo.image; formPreviewImg.classList.remove('hidden'); }
        if(formPreviewIcon) formPreviewIcon.style.opacity = '0.3';
        if(boloRenderImg)   { boloRenderImg.src = bolo.image; boloRenderImg.style.display = 'block'; }
        if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'none';
        if(lbl) { lbl.innerText = 'CHANGE PHOTO'; lbl.classList.remove('text-gray-400'); lbl.classList.add('text-neon-green'); }
    } else {
        if(formPreviewImg)  { formPreviewImg.src = ''; formPreviewImg.classList.add('hidden'); }
        if(formPreviewIcon) formPreviewIcon.style.opacity = '1';
        if(boloRenderImg)   boloRenderImg.style.display = 'none';
        if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'block';
        if(lbl) { lbl.innerText = 'TAP TO UPLOAD PHOTO'; lbl.classList.remove('text-neon-green'); lbl.classList.add('text-gray-400'); }
    }

    if(boloModal) { boloModal.classList.remove('hidden'); boloModal.classList.add('flex'); }
    const vaultPanel = document.getElementById('panel-vault');
    if(vaultPanel) {
        if(vaultPanel.classList.contains('is-maximized') && window.toggleFullscreen) window.toggleFullscreen('panel-vault');
        vaultPanel.classList.add('hidden');
    }
    if(window.pushTacLog) window.pushTacLog(`BOLO LOADED: ${bolo.name || bolo.species || 'UNKNOWN'}`, 'INFO');
};

if(reworkBoloBtn) {
    reworkBoloBtn.addEventListener('click', async () => {
        if(!activeBoloId) return;
        const bolo = await window.TRC_IDB.get('boloLibrary', activeBoloId);
        if(!bolo) return;
        window.loadBoloBackToEditor(bolo);
        if(window.showToast) window.showToast('BOLO loaded for rework.');
        activeBoloId = null;
        if(reworkBoloBtn)    reworkBoloBtn.classList.add('hidden');
        if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');
        renderBoloLibrary();
    });
}

window.loadPhotoToBolo = function(imgSrc) {
    clearBoloForm();
    currentBoloImage = imgSrc;
    if(boloRenderImg) { boloRenderImg.src = imgSrc; boloRenderImg.style.display = 'block'; }
    if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'none';
    const previewImg  = document.getElementById('bolo-form-preview-img');
    const previewIcon = document.getElementById('bolo-form-preview-icon');
    if(previewImg)  { previewImg.src = imgSrc; previewImg.classList.remove('hidden'); }
    if(previewIcon) previewIcon.style.opacity = '0.3';
    const lbl = document.getElementById('bolo-image-label');
    if(lbl) { lbl.innerText = 'CHANGE PHOTO'; lbl.classList.remove('text-gray-400'); lbl.classList.add('text-neon-green'); }
    window.openBoloModal();
};

// ============================================================
// INTEL VAULT EXPORT
// ============================================================
if (boloToVaultBtnTop) {
    boloToVaultBtnTop.addEventListener('click', async () => {
        if(!activeBoloId) return;
        const bolo = await window.TRC_IDB.get('boloLibrary', activeBoloId);
        if(!bolo) return;

        const originalHtml = boloToVaultBtnTop.innerHTML;
        boloToVaultBtnTop.disabled = true;
        boloToVaultBtnTop.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin inline-block mr-1"></i> PROCESSING...';
        if(window.lucide) window.lucide.createIcons();

        const isPerson = (bolo.bolo_type || 'person') === 'person';
        const renderZoneId = isPerson ? 'bolo-poster-render-zone' : 'bolo-animal-render-zone';
        const renderZone   = document.getElementById(renderZoneId);
        if(!renderZone) {
            alert('Render zone not found.');
            boloToVaultBtnTop.disabled = false;
            boloToVaultBtnTop.innerHTML = originalHtml;
            return;
        }

        // ── Populate Person poster ──
        if (isPerson) {
            const el = id => document.getElementById(id);
            el('bolo-render-agency').innerText  = bolo.agency   || 'TACTICAL RANGE CARD';
            el('bolo-render-case').innerText    = bolo.case_num || 'N/A';
            el('bolo-render-name').innerText    = bolo.name     || 'UNKNOWN SUSPECT';
            el('bolo-render-reason').innerText  = bolo.reason   || 'WANTED FOR QUESTIONING';
            el('bolo-render-sex').innerText     = bolo.sex === 'male' ? '♂ MALE' : bolo.sex === 'female' ? '♀ FEMALE' : '— UNKNOWN';
            el('bolo-render-dob').innerText     = bolo.dob      || 'N/A';
            el('bolo-render-build').innerText   = bolo.build    || 'N/A';
            el('bolo-render-height').innerText  = bolo.height   || 'N/A';
            el('bolo-render-weight').innerText  = bolo.weight   || 'N/A';
            el('bolo-render-hair').innerText    = bolo.hair     || 'N/A';
            el('bolo-render-eye').innerText     = bolo.eye      || 'N/A';
            el('bolo-render-features').innerText= bolo.features || 'None noted.';
            el('bolo-render-lastseen').innerText= bolo.lastseen || 'Unknown location.';
            el('bolo-render-reward').innerText  = bolo.reward   || 'No reward offered.';
            el('bolo-render-warning').innerText = bolo.warning  || 'Approach with caution.';
            el('bolo-render-contact').innerText = bolo.contact  || 'CONTACT LOCAL AUTHORITIES';

            const threatConfig = {
                poi:      { bg: '#1d4ed8', text: '\u26A0  PERSON OF INTEREST  \u2014  APPROACH WITH CAUTION  \u26A0' },
                fugitive: { bg: '#ea580c', text: '\u26A0  FUGITIVE / AT LARGE  \u2014  DO NOT APPROACH  \u26A0' },
                armed:    { bg: '#cc0000', text: '\u26A0  ARMED & DANGEROUS  \u2014  EXERCISE EXTREME CAUTION  \u26A0' }
            };
            const tCfg = threatConfig[bolo.threat_level || 'poi'];
            const bannerEl  = el('bolo-render-threat-banner');
            const bannerTxt = el('bolo-render-threat-text');
            if(bannerEl)  bannerEl.style.background = tCfg.bg;
            if(bannerTxt) bannerTxt.innerText = tCfg.text;

            const notesSec = el('bolo-render-notes-section');
            const notesEl  = el('bolo-render-notes');
            if(bolo.notes && bolo.notes.trim()) {
                if(notesSec) notesSec.style.display = 'block';
                if(notesEl)  notesEl.innerText = bolo.notes;
            } else {
                if(notesSec) notesSec.style.display = 'none';
            }
            if(boloRenderImg) { boloRenderImg.src = bolo.image || ''; boloRenderImg.style.display = bolo.image ? 'block' : 'none'; }
            if(boloImagePlaceholder) boloImagePlaceholder.style.display = bolo.image ? 'none' : 'block';

        } else {
            // ── Populate Animal poster ──
            const el = id => document.getElementById(id);
            el('bolo-animal-render-agency').innerText  = bolo.agency   || 'TACTICAL RANGE CARD';
            el('bolo-animal-render-case').innerText    = bolo.case_num || 'N/A';
            const threatLabels = { nuisance: 'NUISANCE ANIMAL', dangerous: 'DANGEROUS / AT LARGE', trophy: 'TROPHY ANIMAL' };
            const threatBannerCfg = {
                nuisance:  { bg: '#92400e', text: '\u26A0  NUISANCE ANIMAL  \u2014  REPORT TO RANCH OWNER  \u26A0' },
                dangerous: { bg: '#7f1d1d', text: '\u26A0  DANGEROUS ANIMAL  \u2014  DO NOT APPROACH  \u26A0' },
                trophy:    { bg: '#064e3b', text: '\u2605  TROPHY ANIMAL  \u2014  CONTACT RANCH OWNER  \u2605' }
            };
            const aCfg = threatBannerCfg[bolo.animal_threat || 'nuisance'];
            const sexLabel = bolo.animal_sex === 'male' ? '♂ MALE' : bolo.animal_sex === 'female' ? '♀ FEMALE' : '— UNKNOWN';

            const setTxt = (id, val) => { const e = el(id); if(e) e.innerText = val; };
            setTxt('bolo-animal-render-species',   (bolo.species || 'UNKNOWN SPECIES').toUpperCase());
            setTxt('bolo-animal-render-sex',       sexLabel);
            setTxt('bolo-animal-render-weight',    bolo.animal_weight   || 'Est. Unknown');
            setTxt('bolo-animal-render-marks',     bolo.animal_marks    || 'None noted.');
            setTxt('bolo-animal-render-territory', bolo.animal_territory|| 'Unknown area.');
            setTxt('bolo-animal-render-reward',    bolo.animal_reward   || 'No reward posted.');
            setTxt('bolo-animal-render-contact',   bolo.animal_contact  || 'CONTACT RANCH / WILDLIFE OFFICER');
            setTxt('bolo-animal-render-type-label',threatLabels[bolo.animal_threat || 'nuisance']);

            const bannerEl  = el('bolo-animal-render-banner');
            const bannerTxt = el('bolo-animal-render-banner-text');
            if(bannerEl)  bannerEl.style.background = aCfg.bg;
            if(bannerTxt) bannerTxt.innerText = aCfg.text;

            const notesEl = el('bolo-animal-render-notes');
            const notesSec = el('bolo-animal-render-notes-section');
            if(bolo.notes && bolo.notes.trim()) {
                if(notesSec) notesSec.style.display = 'block';
                if(notesEl)  notesEl.innerText = bolo.notes;
            } else {
                if(notesSec) notesSec.style.display = 'none';
            }

            const animalImg = el('bolo-animal-render-img');
            const animalPh  = el('bolo-animal-render-placeholder');
            if(bolo.image) {
                if(animalImg) { animalImg.src = bolo.image; animalImg.style.display = 'block'; }
                if(animalPh)  animalPh.style.display = 'none';
            } else {
                if(animalImg) animalImg.style.display = 'none';
                if(animalPh)  animalPh.style.display = 'block';
            }
        }

        const originalParent      = renderZone.parentNode;
        const originalNextSibling = renderZone.nextSibling;
        document.body.appendChild(renderZone);
        renderZone.style.position = 'fixed';
        renderZone.style.left = '0';
        renderZone.style.top  = '0';
        renderZone.style.zIndex = '-9999';

        try {
            await new Promise(r => setTimeout(r, 600));
            const bgColor = isPerson ? '#080808' : '#1a1a1a';
            const canvas = await html2canvas(renderZone, {
                backgroundColor: bgColor,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            if(window.saveIntelSnapshot) {
                const label = isPerson ? 'BOLO: ' + (bolo.name || 'UNKNOWN SUSPECT')
                                       : 'ANIMAL BOLO: ' + (bolo.species || 'UNKNOWN').toUpperCase();
                await window.saveIntelSnapshot(label, dataUrl, { type: 'bolo-card', isAmmo: false, boloData: bolo });
                if(window.showToast) window.showToast('✅ BOLO Saved to Intel Vault!');
            }
        } catch(err) {
            console.error('BOLO Capture failed:', err);
            alert('Capture failed: ' + err.message);
        } finally {
            if(originalParent) originalParent.insertBefore(renderZone, originalNextSibling);
            renderZone.style.position = 'fixed';
            renderZone.style.top      = '-9999px';
            renderZone.style.left     = '-9999px';
            renderZone.style.zIndex   = '-9999';
            boloToVaultBtnTop.disabled  = false;
            boloToVaultBtnTop.innerHTML = originalHtml;
            if(window.lucide) window.lucide.createIcons();
        }
    });
}
