// --- BOLO / MOST WANTED LOGIC ---
const boloModal = document.getElementById('bolo-modal');
const openBoloBtns = document.querySelectorAll('#openBoloBtn, #openBoloBtnHud');
const boloImageUpload = document.getElementById('bolo-image-upload');
const boloRenderImg = document.getElementById('bolo-render-img');
const boloImagePlaceholder = document.getElementById('bolo-render-img-placeholder');

// NEW BUTTONS
const boloClearBtn = document.getElementById('bolo-clear-btn');
const boloSaveInventoryBtn = document.getElementById('bolo-save-inventory-btn');
const reworkBoloBtn = document.getElementById('rework-bolo-btn');
const boloToVaultBtnTop = document.getElementById('bolo-to-vault-btn-top');

let currentBoloImage = null; // Store base64 image data for the form
let activeBoloId = null;     // ID of the currently selected BOLO in the library list

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
    renderBoloLibrary(); // Refresh library when opened
};

openBoloBtns.forEach(btn => {
    btn.addEventListener('click', window.openBoloModal);
});

function clearBoloForm() {
    // Clear inputs
    const inputs = ['bolo-input-name', 'bolo-input-reason', 'bolo-input-height', 'bolo-input-weight', 'bolo-input-hair', 'bolo-input-eye', 'bolo-input-features', 'bolo-input-lastseen', 'bolo-input-reward', 'bolo-input-warning', 'bolo-input-contact'];
    inputs.forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = '';
    });
    
    // Clear image
    currentBoloImage = null;
    if(boloRenderImg) {
        boloRenderImg.src = '';
        boloRenderImg.style.display = 'none';
    }
    if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'block';
    
    const label = document.getElementById('bolo-image-label');
    if(label) {
        label.innerText = 'TAP TO UPLOAD IMAGE';
        label.classList.remove('text-neon-green');
        label.classList.add('text-gray-400');
    }
    
    // Deselect active
    activeBoloId = null;
    if(reworkBoloBtn) reworkBoloBtn.classList.add('hidden');
    if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');
    
    renderBoloLibrary(); // clear highlights
}

if(boloClearBtn) {
    boloClearBtn.addEventListener('click', clearBoloForm);
}

if (boloImageUpload) {
    boloImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentBoloImage = event.target.result;
                boloRenderImg.src = event.target.result;
                boloRenderImg.style.display = 'block';
                boloImagePlaceholder.style.display = 'none';
                
                const previewImg = document.getElementById('bolo-form-preview-img');
                const previewIcon = document.getElementById('bolo-form-preview-icon');
                if(previewImg) {
                    previewImg.src = event.target.result;
                    previewImg.classList.remove('hidden');
                }
                if(previewIcon) previewIcon.style.opacity = '0.3';
                
                document.getElementById('bolo-image-label').innerText = 'IMAGE UPLOADED';
                document.getElementById('bolo-image-label').classList.remove('text-gray-400');
                document.getElementById('bolo-image-label').classList.add('text-neon-green');
            };
            reader.readAsDataURL(file);
        }
    });
}

// SAVE TO INVENTORY
if(boloSaveInventoryBtn) {
    boloSaveInventoryBtn.addEventListener('click', async () => {
        if(!window.TRC_IDB) {
            alert("Database not ready.");
            return;
        }
        
        const data = {
            name: document.getElementById('bolo-input-name').value || '',
            reason: document.getElementById('bolo-input-reason').value || '',
            height: document.getElementById('bolo-input-height').value || '',
            weight: document.getElementById('bolo-input-weight').value || '',
            hair: document.getElementById('bolo-input-hair').value || '',
            eye: document.getElementById('bolo-input-eye').value || '',
            features: document.getElementById('bolo-input-features').value || '',
            lastseen: document.getElementById('bolo-input-lastseen').value || '',
            reward: document.getElementById('bolo-input-reward').value || '',
            warning: document.getElementById('bolo-input-warning').value || '',
            contact: document.getElementById('bolo-input-contact').value || '',
            image: currentBoloImage,
            timestamp: new Date().toISOString()
        };
        
        // Prevent empty save
        if(!data.name && !data.reason && !data.image) {
            alert("Fill out some details first.");
            return;
        }

        const id = Date.now().toString();
        data.id = id;
        await window.TRC_IDB.set('boloLibrary', id, data);
        
        if (window.showToast) window.showToast("BOLO Saved to Inventory");
        clearBoloForm();
        renderBoloLibrary();
    });
}

// RENDER LIBRARY
async function renderBoloLibrary() {
    const listEl = document.getElementById('boloLibraryList');
    if(!listEl || !window.TRC_IDB) return;
    
    try {
        const boloObj = await window.TRC_IDB.getAll('boloLibrary');
        const allBolos = Object.values(boloObj || {});
        listEl.innerHTML = '';
        
        if(allBolos.length === 0) {
            listEl.innerHTML = '<div class="col-span-full text-center text-gray-600 text-xs py-10 font-bold tracking-widest border border-dashed border-gray-800 rounded-lg">INVENTORY EMPTY</div>';
            return;
        }
        
        allBolos.sort((a, b) => Number(b.id) - Number(a.id));
        
        allBolos.forEach(bolo => {
            const dateStr = new Date(bolo.timestamp).toLocaleString();
            const displayName = bolo.name || 'UNKNOWN';
            const displayReason = bolo.reason || 'WANTED';
            const isActive = activeBoloId === bolo.id;
            
            const card = document.createElement('div');
            card.className = `p-3 rounded-lg border-2 cursor-pointer transition-all ${isActive ? 'bg-red-900/30 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'}`;
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <div class="font-black text-red-500 text-[10px] uppercase tracking-widest truncate max-w-[150px]">${displayName}</div>
                    <div class="text-[8px] text-gray-500 shrink-0">${dateStr}</div>
                </div>
                <div class="text-[9px] text-gray-400 truncate mb-3">${displayReason}</div>
                
                <div class="flex justify-between items-center border-t border-gray-800 pt-2 mt-auto">
                     <span class="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                        <i data-lucide="${bolo.image ? 'image' : 'file-text'}" class="w-3 h-3"></i>
                        ${bolo.image ? 'WITH MUGSHOT' : 'TEXT ONLY'}
                     </span>
                     <button class="text-gray-500 hover:text-red-500 p-1" onclick="event.stopPropagation(); deleteBolo('${bolo.id}')"><i data-lucide="trash" class="w-3 h-3"></i></button>
                </div>
            `;
            
            card.onclick = () => selectBolo(bolo);
            
            listEl.appendChild(card);
        });
        
        if(window.lucide) window.lucide.createIcons();
        
    } catch(e) {
        console.error("Failed to render bolo library", e);
    }
}

window.deleteBolo = async function(id) {
    if(confirm("Delete this BOLO card?")) {
        await window.TRC_IDB.delete('boloLibrary', id);
        if(activeBoloId === id) {
            activeBoloId = null;
            if(reworkBoloBtn) reworkBoloBtn.classList.add('hidden');
            if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');
        }
        renderBoloLibrary();
    }
};

function selectBolo(bolo) {
    activeBoloId = bolo.id;
    renderBoloLibrary(); // highlight
    
    // Show top action buttons
    if(reworkBoloBtn) reworkBoloBtn.classList.remove('hidden');
    if(boloToVaultBtnTop) boloToVaultBtnTop.classList.remove('hidden');
}

window.loadBoloBackToEditor = function(bolo) {
      if(!bolo) return;
      document.getElementById('bolo-input-name').value = bolo.name || '';
      document.getElementById('bolo-input-reason').value = bolo.reason || '';
      document.getElementById('bolo-input-height').value = bolo.height || '';
      document.getElementById('bolo-input-weight').value = bolo.weight || '';
      document.getElementById('bolo-input-hair').value = bolo.hair || '';
      document.getElementById('bolo-input-eye').value = bolo.eye || '';
      document.getElementById('bolo-input-features').value = bolo.features || '';
      document.getElementById('bolo-input-lastseen').value = bolo.lastseen || '';
      document.getElementById('bolo-input-reward').value = bolo.reward || '';
      document.getElementById('bolo-input-warning').value = bolo.warning || '';
      document.getElementById('bolo-input-contact').value = bolo.contact || '';
      
      currentBoloImage = bolo.image || null;
      const previewImg = document.getElementById('bolo-form-preview-img');
      const previewIcon = document.getElementById('bolo-form-preview-icon');
      const label = document.getElementById('bolo-image-label');
      
      if(bolo.image) {
          if(boloRenderImg) {
              boloRenderImg.src = bolo.image;
              boloRenderImg.style.display = 'block';
          }
          if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'none';
          if(previewImg) {
              previewImg.src = bolo.image;
              previewImg.classList.remove('hidden');
          }
          if(previewIcon) previewIcon.style.opacity = '0.3';
          if(label) label.innerText = 'CHANGE PHOTO';
      } else {
          if(boloRenderImg) boloRenderImg.style.display = 'none';
          if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'block';
          if(previewImg) previewImg.classList.add('hidden');
          if(previewIcon) previewIcon.style.opacity = '1';
          if(label) label.innerText = 'TAP TO UPLOAD PHOTO';
      }
      
      if (typeof openBoloModal === 'function') openBoloModal();
};

if(reworkBoloBtn) {
    reworkBoloBtn.addEventListener('click', async () => {
        if(!activeBoloId) return;
        const bolo = await window.TRC_IDB.get('boloLibrary', activeBoloId);
        if(!bolo) return;
        
        window.loadBoloBackToEditor(bolo);
        
        if (window.showToast) window.showToast("BOLO loaded for rework.");
        
        // Deselect so they don't accidentally click Export to Vault thinking it has new edits
        activeBoloId = null;
        if(reworkBoloBtn) reworkBoloBtn.classList.add('hidden');
        if(boloToVaultBtnTop) boloToVaultBtnTop.classList.add('hidden');
        renderBoloLibrary();
    });
}

window.loadPhotoToBolo = function(imgSrc) {
    clearBoloForm();
    currentBoloImage = imgSrc;
    const previewImg = document.getElementById('bolo-form-preview-img');
    const previewIcon = document.getElementById('bolo-form-preview-icon');
    
    if(boloRenderImg) {
        boloRenderImg.src = imgSrc;
        boloRenderImg.style.display = 'block';
    }
    if(boloImagePlaceholder) boloImagePlaceholder.style.display = 'none';
    if(previewImg) {
        previewImg.src = imgSrc;
        previewImg.classList.remove('hidden');
    }
    if(previewIcon) previewIcon.style.opacity = '0.3';
    const label = document.getElementById('bolo-image-label');
    if(label) {
        label.innerText = 'CHANGE PHOTO';
        label.classList.remove('text-gray-400');
        label.classList.add('text-neon-green');
    }
    window.openBoloModal();
};

// INTEL VAULT EXPORT
if (boloToVaultBtnTop) {
    boloToVaultBtnTop.addEventListener('click', async () => {
        if(!activeBoloId) return;
        const bolo = await window.TRC_IDB.get('boloLibrary', activeBoloId);
        if(!bolo) return;
        
        // Transfer data to hidden template
        document.getElementById('bolo-render-name').innerText = bolo.name || 'UNKNOWN SUSPECT';
        document.getElementById('bolo-render-reason').innerText = bolo.reason || 'WANTED FOR QUESTIONING';
        document.getElementById('bolo-render-height').innerText = bolo.height || 'N/A';
        document.getElementById('bolo-render-weight').innerText = bolo.weight || 'N/A';
        document.getElementById('bolo-render-hair').innerText = bolo.hair || 'N/A';
        document.getElementById('bolo-render-eye').innerText = bolo.eye || 'N/A';
        document.getElementById('bolo-render-features').innerText = bolo.features || 'None noted.';
        document.getElementById('bolo-render-lastseen').innerText = bolo.lastseen || 'Unknown location.';
        document.getElementById('bolo-render-reward').innerText = bolo.reward || 'No reward offered.';
        document.getElementById('bolo-render-warning').innerText = bolo.warning || 'Approach with caution.';
        document.getElementById('bolo-render-contact').innerText = bolo.contact || 'CONTACT LOCAL AUTHORITIES';

        const posterPhoto = document.getElementById('bolo-render-photo');
        const posterNoPhoto = document.getElementById('bolo-render-nophoto');

        if(bolo.image) {
            if (posterPhoto) {
                posterPhoto.src = bolo.image;
                posterPhoto.style.display = 'block';
            }
            if (posterNoPhoto) posterNoPhoto.style.display = 'none';
        } else {
            if (posterPhoto) posterPhoto.style.display = 'none';
            if (posterNoPhoto) posterNoPhoto.style.display = 'block';
        }

        // Prepare the render zone
        const renderZone = document.getElementById('bolo-poster-render-zone');
        const originalLeft = renderZone.style.left;
        const originalTop = renderZone.style.top;
        const originalZIndex = renderZone.style.zIndex;
        renderZone.style.left = '0';
        renderZone.style.top = '0';
        renderZone.style.zIndex = '-9999';

        try {
            await new Promise(r => setTimeout(r, 100));
            
            const canvas = await html2canvas(renderZone, {
                backgroundColor: '#23252a',
                scale: 2, 
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            if (window.TRC_IDB) {
                const entry = {
                    id: Date.now(),
                    type: 'bolo-card',
                    title: 'BOLO: ' + (bolo.name || 'UNKNOWN SUSPECT'),
                    timestamp: new Date().toISOString(),
                    image: dataUrl,
                    isAmmo: false,
                    boloData: bolo // Save original form data
                };
                
                await window.TRC_IDB.set('intelVault', entry.id.toString(), entry);
                
                if (window.showToast) window.showToast("BOLO Poster Sent to Intel Vault!");
                else alert("BOLO Poster Sent to Intel Vault!");
                
                closeBoloModal();
                
                if (window.initVaultFromDB) window.initVaultFromDB();
            }
        } catch (error) {
            console.error("BOLO Capture failed: ", error);
            alert("Capture failed.");
        } finally {
            renderZone.style.left = originalLeft;
            renderZone.style.top = originalTop;
            renderZone.style.zIndex = originalZIndex;
        }
    });
}
