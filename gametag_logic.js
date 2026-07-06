// --- FIELD HARVEST / GAME TAG LOGIC ---
const gameTagModal = document.getElementById('gametag-modal');
const openGameTagBtns = document.querySelectorAll('#openGameTagBtn, #openGameTagBtnHud');
const gametagImageUpload = document.getElementById('gametag-image-upload');
const gametagRenderImg = document.getElementById('gametag-render-img');
const gametagImagePlaceholder = document.getElementById('gametag-render-img-placeholder');

const gametagClearBtn = document.getElementById('gametag-clear-btn');
const gametagSaveInventoryBtn = document.getElementById('gametag-save-inventory-btn');
const reworkGametagBtn = document.getElementById('rework-gametag-btn');
const gametagToVaultBtnTop = document.getElementById('gametag-to-vault-btn-top');

let currentGametagImage = null;
let activeGametagId = null;
let currentGametagType = 'game'; // 'game' or 'fish'

window.closeGameTagModal = function() {
    if (gameTagModal) {
        gameTagModal.classList.add('hidden');
        gameTagModal.classList.remove('flex');
    }
};

window.openGameTagModal = function() {
    gameTagModal.classList.remove('hidden');
    gameTagModal.classList.add('flex');
    clearGametagForm();
    renderGametagLibrary();
    
    // Auto-fill date
    document.getElementById('gametag-input-date').value = new Date().toLocaleString();
    
    // Attempt to auto-fill GPS if allowed
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude.toFixed(5);
            const lon = position.coords.longitude.toFixed(5);
            document.getElementById('gametag-input-gps').value = `${lat}, ${lon}`;
        }, () => {});
    }
};

openGameTagBtns.forEach(btn => {
    btn.addEventListener('click', window.openGameTagModal);
});

window.setGameTagType = function(type) {
    currentGametagType = type;
    const btnGame = document.getElementById('gametag-type-game');
    const btnFish = document.getElementById('gametag-type-fish');
    const fieldsGame = document.getElementById('gametag-fields-game');
    const fieldsFish = document.getElementById('gametag-fields-fish');
    
    if (type === 'game') {
        btnGame.className = 'flex-1 py-2 text-xs font-black uppercase tracking-widest bg-amber-600 text-white rounded transition-all';
        btnFish.className = 'flex-1 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white rounded transition-all';
        fieldsGame.classList.remove('hidden');
        fieldsFish.classList.add('hidden');
        document.getElementById('gametag-render-type-label').innerText = 'FIELD HARVEST TAG';
    } else {
        btnFish.className = 'flex-1 py-2 text-xs font-black uppercase tracking-widest bg-blue-600 text-white rounded transition-all';
        btnGame.className = 'flex-1 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white rounded transition-all';
        fieldsFish.classList.remove('hidden');
        fieldsGame.classList.add('hidden');
        document.getElementById('gametag-render-type-label').innerText = 'FISHING RECORD TAG';
    }
}

if (gametagImageUpload) {
    gametagImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            currentGametagImage = event.target.result;
            const previewImg = document.getElementById('gametag-form-preview-img');
            const previewIcon = document.getElementById('gametag-form-preview-icon');
            const previewLabel = document.getElementById('gametag-image-label');
            
            if (previewImg) {
                previewImg.src = currentGametagImage;
                previewImg.classList.remove('hidden');
            }
            if (previewIcon) previewIcon.style.opacity = '0.3';
            if (previewLabel) previewLabel.innerText = 'CHANGE PHOTO';
        };
        reader.readAsDataURL(file);
    });
}

function clearGametagForm() {
    currentGametagImage = null;
    activeGametagId = null;
    gametagImageUpload.value = '';
    
    const previewImg = document.getElementById('gametag-form-preview-img');
    const previewIcon = document.getElementById('gametag-form-preview-icon');
    const previewLabel = document.getElementById('gametag-image-label');
    
    if (previewImg) {
        previewImg.src = '';
        previewImg.classList.add('hidden');
    }
    if (previewIcon) previewIcon.style.opacity = '1';
    if (previewLabel) previewLabel.innerText = 'TAP TO UPLOAD PHOTO';
    
    document.getElementById('gametag-input-date').value = new Date().toLocaleString();
    document.getElementById('gametag-input-gps').value = '';
    document.getElementById('gametag-input-game-species').value = '';
    document.getElementById('gametag-input-game-sex').value = '';
    document.getElementById('gametag-input-game-weapon').value = '';
    document.getElementById('gametag-input-game-license').value = '';
    document.getElementById('gametag-input-game-points').value = '';
    document.getElementById('gametag-input-game-spread').value = '';
    
    document.getElementById('gametag-input-fish-species').value = '';
    document.getElementById('gametag-input-fish-water').value = '';
    document.getElementById('gametag-input-fish-length').value = '';
    document.getElementById('gametag-input-fish-weight').value = '';
    document.getElementById('gametag-input-fish-bait').value = '';
    
    document.getElementById('gametag-input-notes').value = '';
    
    if(reworkGametagBtn) reworkGametagBtn.classList.add('hidden');
    if(gametagToVaultBtnTop) gametagToVaultBtnTop.classList.add('hidden');
    
    renderGametagLibrary();
}

if (gametagClearBtn) {
    gametagClearBtn.addEventListener('click', clearGametagForm);
}

if (gametagSaveInventoryBtn) {
    gametagSaveInventoryBtn.addEventListener('click', async () => {
        if(!window.TRC_IDB) {
            alert("Database not ready.");
            return;
        }
        
        const data = {
            id: activeGametagId || Date.now().toString(),
            type: currentGametagType,
            timestamp: Date.now(),
            image: currentGametagImage,
            date: document.getElementById('gametag-input-date').value,
            gps: document.getElementById('gametag-input-gps').value,
            notes: document.getElementById('gametag-input-notes').value,
            // Game fields
            game_species: document.getElementById('gametag-input-game-species').value,
            game_sex: document.getElementById('gametag-input-game-sex').value,
            game_weapon: document.getElementById('gametag-input-game-weapon').value,
            game_license: document.getElementById('gametag-input-game-license').value,
            game_points: document.getElementById('gametag-input-game-points').value,
            game_spread: document.getElementById('gametag-input-game-spread').value,
            // Fish fields
            fish_species: document.getElementById('gametag-input-fish-species').value,
            fish_water: document.getElementById('gametag-input-fish-water').value,
            fish_length: document.getElementById('gametag-input-fish-length').value,
            fish_weight: document.getElementById('gametag-input-fish-weight').value,
            fish_bait: document.getElementById('gametag-input-fish-bait').value
        };
        
        try {
            await window.TRC_IDB.set('gameTagLibrary', data.id, data);
            if (window.showToast) window.showToast("Tag Saved to Inventory");
            clearGametagForm();
            renderGametagLibrary();
        } catch(err) {
            console.error("Save Tag failed:", err);
            alert("Database error: Could not save Tag.");
        }
    });
}

async function renderGametagLibrary() {
    const listEl = document.getElementById('gametagLibraryList');
    if(!listEl || !window.TRC_IDB) return;
    
    try {
        const tagObj = await window.TRC_IDB.getAll('gameTagLibrary');
        const allTags = Object.values(tagObj || {});
        listEl.innerHTML = '';
        
        if(allTags.length === 0) {
            listEl.innerHTML = '<div class="col-span-full text-center text-gray-600 text-xs py-10 font-bold tracking-widest border border-dashed border-gray-800 rounded-lg">INVENTORY EMPTY</div>';
            return;
        }
        
        allTags.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        
        allTags.forEach(tag => {
            const dateStr = tag.date || new Date(tag.timestamp).toLocaleString();
            const displayName = tag.type === 'game' ? (tag.game_species || 'UNKNOWN GAME') : (tag.fish_species || 'UNKNOWN FISH');
            const isActive = activeGametagId === tag.id;
            
            const card = document.createElement('div');
            card.className = `relative p-3 rounded-lg border-2 cursor-pointer transition-all ${isActive ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'}`;
            
            card.innerHTML = `
                <div class="absolute top-2 left-2 z-30 bg-black/60 p-1 rounded pointer-events-auto">
                    <input type="checkbox" class="w-4 h-4 cursor-pointer bg-black/50 border border-gray-500 rounded text-amber-500 focus:ring-amber-500/50" ${isActive ? 'checked' : ''} onclick="event.stopPropagation(); window.selectGametag('${tag.id}')">
                </div>
                <div class="flex items-start justify-between mb-2 pointer-events-none">
                    <div style="padding-left: 32px;" class="font-black ${tag.type === 'game' ? 'text-amber-500' : 'text-blue-500'} text-[10px] uppercase tracking-widest truncate max-w-[150px]">${displayName}</div>
                    <div class="text-[8px] text-gray-500 shrink-0">${dateStr}</div>
                </div>
                <div class="flex gap-2 pointer-events-none pl-8">
                    <div class="w-12 h-12 bg-black border border-gray-700 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        ${tag.image ? `<img src="${tag.image}" class="w-full h-full object-cover">` : `<i data-lucide="image" class="w-4 h-4 text-gray-600"></i>`}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[9px] text-gray-300 truncate">${tag.type === 'game' ? (tag.game_sex || '') : (tag.fish_water || '')}</div>
                        <div class="text-[8px] text-gray-500 truncate mt-1">Loc: ${tag.gps || 'N/A'}</div>
                    </div>
                    <div class="flex flex-col gap-1 items-end pointer-events-auto">
                        <button onclick="event.stopPropagation(); window.deleteGametag('${tag.id}')" class="text-gray-600 hover:text-red-500 p-1 bg-black rounded" title="Delete">
                            <i data-lucide="trash" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Allow clicking the card body to select as well
            card.onclick = (e) => {
                if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'button') {
                    window.selectGametag(tag.id);
                }
            };
            
            listEl.appendChild(card);
        });
        
        if (window.lucide) window.lucide.createIcons({root: listEl});
        
    } catch(err) {
        console.error("Load Tags failed:", err);
    }
}

window.deleteGametag = async function(id) {
    if(confirm("Delete this tag permanently?")) {
        await window.TRC_IDB.delete('gameTagLibrary', id);
        if(activeGametagId === id) {
            activeGametagId = null;
            if(reworkGametagBtn) reworkGametagBtn.classList.add('hidden');
            if(gametagToVaultBtnTop) gametagToVaultBtnTop.classList.add('hidden');
        }
        renderGametagLibrary();
    }
};

window.selectGametag = async function(tagId) {
    tagId = String(tagId);
    
    if (activeGametagId === tagId) {
        // Toggle off
        activeGametagId = null;
        renderGametagLibrary();
        if(reworkGametagBtn) reworkGametagBtn.classList.add('hidden');
        if(gametagToVaultBtnTop) gametagToVaultBtnTop.classList.add('hidden');
        return;
    }

    const tag = await window.TRC_IDB.get('gameTagLibrary', tagId);
    if (!tag) return;
    
    activeGametagId = tag.id;
    renderGametagLibrary();
    
    if(reworkGametagBtn) reworkGametagBtn.classList.remove('hidden');
    if(gametagToVaultBtnTop) gametagToVaultBtnTop.classList.remove('hidden');
}

window.loadGametagBackToEditor = function(tag) {
    if(!tag) return;
    
    setGameTagType(tag.type || 'game');
    
    document.getElementById('gametag-input-date').value = tag.date || '';
    document.getElementById('gametag-input-gps').value = tag.gps || '';
    document.getElementById('gametag-input-notes').value = tag.notes || '';
    
    document.getElementById('gametag-input-game-species').value = tag.game_species || '';
    document.getElementById('gametag-input-game-sex').value = tag.game_sex || '';
    document.getElementById('gametag-input-game-weapon').value = tag.game_weapon || '';
    document.getElementById('gametag-input-game-license').value = tag.game_license || '';
    document.getElementById('gametag-input-game-points').value = tag.game_points || '';
    document.getElementById('gametag-input-game-spread').value = tag.game_spread || '';
    
    document.getElementById('gametag-input-fish-species').value = tag.fish_species || '';
    document.getElementById('gametag-input-fish-water').value = tag.fish_water || '';
    document.getElementById('gametag-input-fish-length').value = tag.fish_length || '';
    document.getElementById('gametag-input-fish-weight').value = tag.fish_weight || '';
    document.getElementById('gametag-input-fish-bait').value = tag.fish_bait || '';
    
    currentGametagImage = tag.image || null;
    const previewImg = document.getElementById('gametag-form-preview-img');
    const previewIcon = document.getElementById('gametag-form-preview-icon');
    const previewLabel = document.getElementById('gametag-image-label');
    
    if(currentGametagImage) {
        if(previewImg) {
            previewImg.src = currentGametagImage;
            previewImg.classList.remove('hidden');
        }
        if(previewIcon) previewIcon.style.opacity = '0.3';
        if(previewLabel) {
            previewLabel.innerText = 'IMAGE UPLOADED';
            previewLabel.classList.remove('text-gray-400');
            previewLabel.classList.add('text-neon-green');
        }
    } else {
        if(previewImg) {
            previewImg.src = '';
            previewImg.classList.add('hidden');
        }
        if(previewIcon) previewIcon.style.opacity = '1';
        if(previewLabel) {
            previewLabel.innerText = 'TAP TO UPLOAD PHOTO';
            previewLabel.classList.remove('text-neon-green');
            previewLabel.classList.add('text-gray-400');
        }
    }
    
    if (typeof openGameTagModal === 'function') openGameTagModal();
};

if(reworkGametagBtn) {
    reworkGametagBtn.addEventListener('click', async () => {
        if(!activeGametagId) return;
        const tag = await window.TRC_IDB.get('gameTagLibrary', activeGametagId);
        if(!tag) return;
        
        window.loadGametagBackToEditor(tag);
        
        activeGametagId = null;
    });
}

if (gametagToVaultBtnTop) {
    gametagToVaultBtnTop.addEventListener('click', async () => {
        if(!activeGametagId) return;
        const tag = await window.TRC_IDB.get('gameTagLibrary', activeGametagId);
        if(!tag) return;
        
        const originalBtnHtml = gametagToVaultBtnTop.innerHTML;
        gametagToVaultBtnTop.disabled = true;
        gametagToVaultBtnTop.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ENCRYPTING...';
        if (window.lucide) window.lucide.createIcons();
        
        document.getElementById('gametag-render-date').innerText = tag.date || 'YYYY-MM-DD';
        document.getElementById('gametag-render-gps').innerText = tag.gps || 'N/A';
        document.getElementById('gametag-render-notes').innerText = tag.notes || 'No notes provided.';
        
        const stat1Lbl = document.getElementById('gametag-render-stat1-label');
        const stat1Val = document.getElementById('gametag-render-stat1');
        const stat2Lbl = document.getElementById('gametag-render-stat2-label');
        const stat2Val = document.getElementById('gametag-render-stat2');
        const sexLbl = document.getElementById('gametag-render-sex-label');
        const sexVal = document.getElementById('gametag-render-sex');
        const speciesVal = document.getElementById('gametag-render-species');
        const licenseLbl = document.getElementById('gametag-render-license-label');
        const licenseVal = document.getElementById('gametag-render-license');
        
        const borderBg = document.getElementById('gametag-render-border-bg');
        const headerBg = document.getElementById('gametag-render-header-bg');
        const holeBg = document.getElementById('gametag-render-hole-bg');
        const typeLbl = document.getElementById('gametag-render-type-label');
        const contentBg = document.getElementById('gametag-render-content-bg');
        const titleLbl = document.getElementById('gametag-render-title');

        if (tag.type === 'game') {
            if (borderBg) borderBg.style.backgroundColor = '#3E4A35';
            if (headerBg) { headerBg.classList.remove('bg-[#64748b]'); headerBg.classList.add('bg-[#b59e72]'); }
            if (holeBg) { holeBg.classList.remove('bg-[#1e293b]'); holeBg.classList.add('bg-[#3E4A35]'); }
            if (typeLbl) typeLbl.innerText = 'FIELD HARVEST TAG';
            if (contentBg) { contentBg.classList.remove('bg-[#334155]'); contentBg.classList.add('bg-[#5A684C]'); }
            if (titleLbl) titleLbl.innerText = 'OFFICIAL HARVEST RECORD';

            speciesVal.innerText = tag.game_species || 'UNKNOWN';
            sexLbl.innerText = 'SEX / CLASS';
            sexVal.innerText = tag.game_sex || 'N/A';
            stat1Lbl.innerText = 'ANTLER POINTS (L/R)';
            stat1Val.innerText = tag.game_points || 'N/A';
            stat2Lbl.innerText = 'INSIDE SPREAD';
            stat2Val.innerText = tag.game_spread || 'N/A';
            licenseLbl.innerText = 'LICENSE / TAG #';
            licenseVal.innerText = tag.game_license || 'N/A';
        } else {
            if (borderBg) borderBg.style.backgroundColor = '#1e293b';
            if (headerBg) { headerBg.classList.remove('bg-[#b59e72]'); headerBg.classList.add('bg-[#64748b]'); }
            if (holeBg) { holeBg.classList.remove('bg-[#3E4A35]'); holeBg.classList.add('bg-[#1e293b]'); }
            if (typeLbl) typeLbl.innerText = 'FISHING RECORD TAG';
            if (contentBg) { contentBg.classList.remove('bg-[#5A684C]'); contentBg.classList.add('bg-[#334155]'); }
            if (titleLbl) titleLbl.innerText = 'OFFICIAL CATCH RECORD';

            speciesVal.innerText = tag.fish_species || 'UNKNOWN';
            sexLbl.innerText = 'WATER BODY';
            sexVal.innerText = tag.fish_water || 'N/A';
            stat1Lbl.innerText = 'LENGTH (IN)';
            stat1Val.innerText = tag.fish_length || 'N/A';
            stat2Lbl.innerText = 'WEIGHT (LBS)';
            stat2Val.innerText = tag.fish_weight || 'N/A';
            licenseLbl.innerText = 'LURE / BAIT';
            licenseVal.innerText = tag.fish_bait || 'N/A';
        }

        if(tag.image) {
            if(gametagRenderImg) {
                gametagRenderImg.src = tag.image;
                gametagRenderImg.style.display = 'block';
                gametagRenderImg.classList.remove('hidden');
            }
            if(gametagImagePlaceholder) gametagImagePlaceholder.style.display = 'none';
        } else {
            if(gametagRenderImg) {
                gametagRenderImg.style.display = 'none';
                gametagRenderImg.classList.add('hidden');
            }
            if(gametagImagePlaceholder) gametagImagePlaceholder.style.display = 'block';
        }

        const renderZone = document.getElementById('gametag-poster-render-zone');
        const originalParent = renderZone.parentNode;
        const originalNextSibling = renderZone.nextSibling;
        const originalPosition = renderZone.style.position;
        const originalLeft = renderZone.style.left;
        const originalTop = renderZone.style.top;
        const originalZIndex = renderZone.style.zIndex;
        
        document.body.appendChild(renderZone);
        renderZone.style.position = 'fixed';
        renderZone.style.left = '0';
        renderZone.style.top = '0';
        renderZone.style.zIndex = '-9999';

        try {
            await new Promise(r => setTimeout(r, 600)); // Increase wait time for image paint
            
            const canvas = await html2canvas(renderZone, {
                backgroundColor: '#3E4A35',
                scale: 2, 
                logging: false,
                useCORS: true,
                allowTaint: false
            });
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            if (window.saveIntelSnapshot) {
                await window.saveIntelSnapshot('HARVEST: ' + speciesVal.innerText, dataUrl, {
                    type: 'gametag-card',
                    isAmmo: false,
                    gametagData: tag
                });
                
                if (window.showToast) window.showToast("Field Tag Sent to Intel Vault!");
                else alert("Field Tag Sent to Intel Vault!");
                
                // Close modals and open Vault
                const gametagModal = document.getElementById('gametag-modal');
                if (gametagModal) gametagModal.classList.add('hidden');
                
                const boloModal = document.getElementById('bolo-modal');
                if (boloModal) boloModal.classList.add('hidden');
                
                if (typeof window.toggleFullscreen === 'function') {
                    const vaultPanel = document.getElementById('panel-vault');
                    if (vaultPanel && !vaultPanel.classList.contains('is-maximized')) {
                        window.toggleFullscreen('panel-vault');
                    }
                }
            }
        } catch (error) {
            console.error("Tag Capture failed: ", error);
            alert("Capture failed.");
        } finally {
            if (originalParent) {
                originalParent.insertBefore(renderZone, originalNextSibling);
            }
            renderZone.style.position = originalPosition;
            renderZone.style.left = originalLeft;
            renderZone.style.top = originalTop;
            renderZone.style.zIndex = originalZIndex;
            
            gametagToVaultBtnTop.disabled = false;
            gametagToVaultBtnTop.innerHTML = originalBtnHtml;
            if (window.lucide) window.lucide.createIcons();
        }
    });
}

window.loadPhotoToGametag = function(imageUri) {
    document.getElementById('gametag-input-date').value = '';
    document.getElementById('gametag-input-gps').value = '';
    document.getElementById('gametag-input-notes').value = '';
    document.getElementById('gametag-input-game-species').value = '';
    document.getElementById('gametag-input-game-sex').value = '';
    document.getElementById('gametag-input-game-weapon').value = '';
    document.getElementById('gametag-input-game-license').value = '';
    document.getElementById('gametag-input-game-points').value = '';
    document.getElementById('gametag-input-game-spread').value = '';
    document.getElementById('gametag-input-fish-species').value = '';
    document.getElementById('gametag-input-fish-water').value = '';
    document.getElementById('gametag-input-fish-length').value = '';
    document.getElementById('gametag-input-fish-weight').value = '';
    document.getElementById('gametag-input-fish-bait').value = '';
    currentGametagImage = imageUri;
    const previewImg = document.getElementById('gametag-form-preview-img');
    const previewIcon = document.getElementById('gametag-form-preview-icon');
    const previewLabel = document.getElementById('gametag-image-label');
    if(previewImg) {
        previewImg.src = imageUri;
        previewImg.classList.remove('hidden');
    }
    if(previewIcon) previewIcon.style.opacity = '0.3';
    if(previewLabel) previewLabel.innerText = 'CHANGE PHOTO';
    activeGametagId = null;
    renderGametagLibrary();
    if (typeof openGameTagModal === 'function') openGameTagModal();
};
const vaultToGametagBtn = document.getElementById('vault-to-gametag-btn');
if (vaultToGametagBtn) {
    vaultToGametagBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const checkedBoxes = document.querySelectorAll('.vault-export-checkbox:checked');
        if (checkedBoxes.length === 0) {
            if (typeof openGameTagModal === 'function') openGameTagModal();
            return;
        }
        if (checkedBoxes.length > 1) {
            alert('Please select only ONE snapshot to send to Field Tag.');
            return;
        }
        const id = checkedBoxes[0].dataset.vaultId;
        const item = window.vaultCache.find(i => i.id == id);
        if (!item) return;
        
        if (item.type === 'gametag-card' && item.gametagData) {
            if (window.loadGametagBackToEditor) {
                window.loadGametagBackToEditor(item.gametagData);
            }
            const panel = document.getElementById('panel-vault');
            if (panel && panel.classList.contains('is-maximized')) {
                window.toggleFullscreen('panel-vault');
            }
            if (panel) panel.classList.add('hidden');
            return;
        }
        
        if (item.type && item.type !== 'photo') {
            alert('This is not a standard photo. Please select an imported photo or chat image to create a Field Tag.');
            return;
        }
        window.loadPhotoToGametag(item.image);
        
        const panel = document.getElementById('panel-vault');
        if (panel && panel.classList.contains('is-maximized')) {
            if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen('panel-vault');
        }
        if (panel) panel.classList.add('hidden');
    });
}
