import os

def generate_blog_logic():
    content = """// Tactical Range Card - Global Wire Logic
let currentWireFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. UI Elements ---
    const postModal = document.getElementById('modal-new-post');
    const openPostBtn = document.getElementById('openNewPostBtn');
    const closePostBtn = document.getElementById('closePostModalBtn');
    const submitBtn = document.getElementById('submitPostBtn');
    const charCount = document.getElementById('post-char-count');
    const contentInput = document.getElementById('post-content');
    const imageUpload = document.getElementById('post-image-upload');
    const imageLabel = document.getElementById('post-image-label');
    const coordBtn = document.getElementById('post-coord-btn');

    // UI Toggles
    if (openPostBtn) openPostBtn.addEventListener('click', () => postModal.classList.remove('hidden'));
    if (closePostBtn) closePostBtn.addEventListener('click', () => postModal.classList.add('hidden'));

    if (contentInput && charCount) {
        contentInput.addEventListener('input', () => {
            charCount.textContent = `${contentInput.value.length}/500`;
        });
    }

    if (imageUpload && imageLabel) {
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                imageLabel.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Photo`;
                imageLabel.classList.add("text-blue-600");
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    // Filter Buttons
    const filterContainer = document.querySelector('.p-2.flex.gap-2.overflow-x-auto');
    if (filterContainer) {
        const filterBtns = filterContainer.querySelectorAll('button');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterText = e.target.textContent.trim();
                let cat = 'ALL';
                if (filterText.includes('HOTSPOTS')) cat = 'HOTSPOT';
                if (filterText.includes('TROPHIES')) cat = 'TROPHY';
                if (filterText.includes('WARNINGS')) cat = 'WARNING';
                if (filterText.includes('GENERAL')) cat = 'GENERAL';
                if (filterText.includes('CONTACTS')) cat = 'CONTACTS';
                
                currentWireFilter = cat;
                fetchWirePosts(cat);
            });
        });
    }

    // Vault Image Picker
    const vaultBtn = document.getElementById('post-vault-btn');
    const vaultModal = document.getElementById('modal-vault-picker');
    const closeVaultBtn = document.getElementById('closeVaultPickerBtn');
    const vaultGrid = document.getElementById('vault-picker-grid');
    const vaultLabel = document.getElementById('post-vault-label');
    let pendingVaultImageBase64 = null;

    if (closeVaultBtn && vaultModal) closeVaultBtn.addEventListener('click', () => vaultModal.classList.add('hidden'));

    if (vaultBtn && vaultModal && vaultGrid) {
        vaultBtn.addEventListener('click', () => {
            vaultGrid.innerHTML = '';
            if (!window.vaultCache || window.vaultCache.length === 0) {
                vaultGrid.innerHTML = `<div class="col-span-2 text-gray-500 font-bold text-center text-xs py-10 uppercase tracking-widest">Vault Empty</div>`;
            } else {
                const images = window.vaultCache.filter(item => item.data || item.image);
                images.forEach((item) => {
                    const imgData = item.data || item.image;
                    const itemName = item.name || item.label || 'UNKNOWN INTEL';
                    const itemDate = item.date || item.timestamp || '';
                    const lat = item.targetLat || item.centerLat;
                    const lon = item.targetLon || item.centerLng;
                    
                    const el = document.createElement('div');
                    el.className = "bg-black border-2 border-gray-700 rounded overflow-hidden cursor-pointer hover:border-green-400 transition-colors flex flex-col";
                    el.innerHTML = `
                        <div class="h-24 bg-gray-900 relative overflow-hidden flex items-center justify-center border-b-2 border-gray-700">
                            <img src="${imgData}" class="w-full h-full object-contain">
                        </div>
                        <div class="p-2">
                            <div class="text-[9px] font-black text-white truncate uppercase">${itemName}</div>
                            <div class="text-[8px] font-black text-gray-500 uppercase mt-1">${itemDate}</div>
                        </div>
                    `;
                    el.addEventListener('click', () => {
                        pendingVaultImageBase64 = imgData;
                        if (vaultLabel) {
                            vaultLabel.textContent = "VAULT (1)";
                            vaultLabel.classList.add("text-green-400");
                        }
                        
                        if (imageUpload) imageUpload.value = '';
                        if (imageLabel) {
                            imageLabel.textContent = 'Photo';
                            imageLabel.classList.remove('text-blue-600');
                        }
                        
                        if (lat && lon && contentInput) {
                            contentInput.value = contentInput.value.replace(/\\n\\n\\[(?:COORD|MGRS):[^\\]]+\\]/g, '');
                            const coordString = `\\n\\n[COORD: ${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}]`;
                            contentInput.value += coordString;
                            if (charCount) charCount.textContent = `${contentInput.value.length}/500`;
                        }
                        
                        vaultModal.classList.add('hidden');
                    });
                    vaultGrid.appendChild(el);
                });
                
                if (images.length === 0) {
                    vaultGrid.innerHTML = `<div class="col-span-2 text-gray-500 font-bold text-center text-xs py-10 uppercase tracking-widest">No Images in Vault</div>`;
                }
            }
            vaultModal.classList.remove('hidden');
        });
    }

    // Grab Coordinates (GPS / MGRS)
    if (coordBtn) {
        coordBtn.addEventListener('click', () => {
            const originalText = document.getElementById('post-coord-label').textContent;
            document.getElementById('post-coord-label').textContent = "ACQUIRING...";
            
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    let locationString = `COORD: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                    
                    if (window.geodesy_mgrs_LatLon && window.geodesy_mgrs_Mgrs) {
                        try {
                            const p = new window.geodesy_mgrs_LatLon(lat, lon);
                            const mgrsStr = p.toUtm().toMgrs().toString();
                            locationString = `MGRS: ${mgrsStr}`;
                        } catch(e) { console.warn("MGRS Conversion Failed", e); }
                    }

                    const currentText = contentInput.value;
                    contentInput.value = currentText + (currentText ? '\\n\\n' : '') + `[${locationString}]`;
                    if (charCount) charCount.textContent = `${contentInput.value.length}/500`;
                    
                    document.getElementById('post-coord-label').textContent = "CAPTURED";
                    coordBtn.classList.add('bg-green-100', 'text-green-700', 'border-green-700');
                    setTimeout(() => {
                        document.getElementById('post-coord-label').textContent = originalText;
                        coordBtn.classList.remove('bg-green-100', 'text-green-700', 'border-green-700');
                    }, 2000);
                }, (error) => {
                    alert("GPS Signal Lost or Denied.");
                    document.getElementById('post-coord-label').textContent = "FAILED";
                }, { enableHighAccuracy: true, timeout: 10000 });
            } else {
                alert("Geolocation not supported on this device.");
            }
        });
    }

    // Contact Form Toggle
    const toggleContactBtn = document.getElementById('toggle-contact-form-btn');
    const contactContainer = document.getElementById('contact-form-container');
    const contactChevron = document.getElementById('contact-chevron');
    let isContactFormOpen = false;

    if (toggleContactBtn && contactContainer) {
        toggleContactBtn.addEventListener('click', () => {
            isContactFormOpen = !isContactFormOpen;
            if (isContactFormOpen) {
                contactContainer.classList.remove('hidden');
                contactContainer.classList.add('flex');
                if (contactChevron) contactChevron.classList.add('rotate-180');
            } else {
                contactContainer.classList.add('hidden');
                contactContainer.classList.remove('flex');
                if (contactChevron) contactChevron.classList.remove('rotate-180');
            }
        });
    }

    // Contact Form Image Upload
    const rcardImageUpload = document.getElementById('rcard-image-upload');
    const rcardImageLabel = document.getElementById('rcard-image-label');
    let pendingRCardBase64 = null;

    if (rcardImageUpload) {
        rcardImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (rcardImageLabel) rcardImageLabel.textContent = 'Compressing...';
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    pendingRCardBase64 = canvas.toDataURL('image/jpeg', 0.6);
                    if (rcardImageLabel) rcardImageLabel.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-500"></i> Photo Ready';
                    if (window.lucide) window.lucide.createIcons();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Submit Post
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const author = document.getElementById('post-author').value.trim() || 'ANONYMOUS';
            const category = document.getElementById('post-category').value;
            let intelText = contentInput.value.trim();

            if (!intelText) {
                alert("Intel Report cannot be empty.");
                return;
            }

            submitBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> TRANSMITTING...`;
            submitBtn.disabled = true;
            if (window.lucide) window.lucide.createIcons();

            let publicImageUrl = null;
            let rcardImageUrl = null;

            try {
                // 1. Upload Main Image
                let fileToUpload = imageUpload ? imageUpload.files[0] : null;
                let fileName = null;

                if (fileToUpload) {
                    const fileExt = fileToUpload.name.split('.').pop();
                    fileName = `wire_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                } else if (pendingVaultImageBase64) {
                    const mimeMatch = pendingVaultImageBase64.match(/data:([a-zA-Z0-9]+\\/[a-zA-Z0-9-.+]+).*,/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    const base64Data = pendingVaultImageBase64.includes(',') ? pendingVaultImageBase64.split(',')[1] : pendingVaultImageBase64;
                    const byteString = atob(base64Data);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    fileToUpload = new Blob([ab], { type: mimeType });
                    fileName = `wire_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
                }

                if (fileToUpload && fileName) {
                    const { data, error } = await window.supabaseClient.storage
                        .from('Tactical-media')
                        .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: false });

                    if (error) throw new Error("Image Upload Failed: " + error.message);
                    
                    const { data: pubData } = window.supabaseClient.storage
                        .from('Tactical-media')
                        .getPublicUrl(fileName);
                        
                    publicImageUrl = pubData.publicUrl;
                }

                // 2. Check if a Contact Card is being attached
                let finalContent = intelText;

                const rcardCategory = document.getElementById('rcard-category') ? document.getElementById('rcard-category').value : '';
                const rcardComms = document.getElementById('rcard-comms') ? document.getElementById('rcard-comms').value.trim() : '';
                const rcardWeb = document.getElementById('rcard-web') ? document.getElementById('rcard-web').value.trim() : '';
                const rcardDesc = document.getElementById('rcard-desc') ? document.getElementById('rcard-desc').value.trim() : '';
                
                const isAttachingContact = isContactFormOpen && (rcardComms || rcardWeb || rcardDesc || pendingRCardBase64);

                if (isAttachingContact) {
                    if (pendingRCardBase64) {
                        const rfileName = 'rcard_' + Date.now() + '_' + Math.random().toString(36).substring(7) + '.jpg';
                        let base64Data = pendingRCardBase64.includes(',') ? pendingRCardBase64.split(',')[1] : pendingRCardBase64;
                        
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], {type: 'image/jpeg'});

                        const { error: uploadError } = await window.supabaseClient.storage
                            .from('Tactical-media')
                            .upload(rfileName, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });

                        if (uploadError) throw new Error("Contact Card Image Upload Failed: " + uploadError.message);

                        const { data: rpubData } = window.supabaseClient.storage
                            .from('Tactical-media')
                            .getPublicUrl(rfileName);
                            
                        rcardImageUrl = rpubData.publicUrl;
                    }

                    const payload = {
                        intelText: intelText,
                        rcardCategory: rcardCategory,
                        rcardComms: rcardComms,
                        rcardWeb: rcardWeb,
                        rcardDesc: rcardDesc,
                        rcardImageUrl: rcardImageUrl
                    };
                    finalContent = JSON.stringify(payload);
                }

                // 3. Insert into Database
                const { error: insertError } = await window.supabaseClient
                    .from('global_wire')
                    .insert([{
                        author: author,
                        category: category,
                        content: finalContent,
                        image_url: publicImageUrl
                    }]);

                if (insertError) throw new Error("Database Insert Failed: " + insertError.message);

                // Success! Reset everything
                document.getElementById('post-author').value = '';
                contentInput.value = '';
                if (imageUpload) imageUpload.value = '';
                if (imageLabel) {
                    imageLabel.textContent = "Photo";
                    imageLabel.classList.remove("text-blue-600");
                }
                charCount.textContent = '0/500';
                
                if (document.getElementById('rcard-comms')) document.getElementById('rcard-comms').value = '';
                if (document.getElementById('rcard-web')) document.getElementById('rcard-web').value = '';
                if (document.getElementById('rcard-desc')) document.getElementById('rcard-desc').value = '';
                pendingRCardBase64 = null;
                if (rcardImageLabel) rcardImageLabel.innerHTML = 'Snap / Upload Photo';
                isContactFormOpen = false;
                if (contactContainer) {
                    contactContainer.classList.add('hidden');
                    contactContainer.classList.remove('flex');
                    if (contactChevron) contactChevron.classList.remove('rotate-180');
                }
                
                postModal.classList.add('hidden');
                await fetchWirePosts();

            } catch (err) {
                console.error(err);
                alert("Transmission Error: " + err.message);
            } finally {
                submitBtn.innerHTML = `<i data-lucide="radio" class="w-4 h-4"></i> BROADCAST INTEL`;
                submitBtn.disabled = false;
                pendingVaultImageBase64 = null;
                if (vaultLabel) {
                    vaultLabel.textContent = 'Vault';
                    vaultLabel.classList.remove('text-green-400');
                }
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

});

// --- 3. Fetching and Rendering Posts ---
async function fetchWirePosts(filter = (typeof currentWireFilter !== 'undefined' ? currentWireFilter : 'ALL')) {
    const feedContainer = document.getElementById('wire-feed-container');
    if (!feedContainer) return;
    
    if (!window.supabaseClient) {
        if (window.ensureSupabase) {
            try {
                await window.ensureSupabase();
                if (!window.supabaseClient && window.supabase) {
                    const supabaseUrl = window.SUPABASE_URL || 'https://nvnwqcfgpwzheekninle.supabase.co'; 
                    const supabaseKey = window.SUPABASE_KEY || 'sb_publishable_si9fg-bURw3K5yprgAgifw_Eez79zU0'; 
                    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
                }
            } catch (e) {
                feedContainer.innerHTML = '<div class="text-red-500 font-bold w-full text-center p-8 uppercase">CLOUD DRIVERS OFFLINE.</div>';
                return;
            }
        }
    }

    try {
        let query = window.supabaseClient.from('global_wire').select('*').order('created_at', { ascending: false }).limit(100);
        const { data: posts, error } = await query;
        if (error) throw error;

        feedContainer.innerHTML = '';
        if (posts.length === 0) {
            feedContainer.innerHTML = `<div class="w-full text-center py-12 text-gray-500 font-bold text-sm tracking-widest uppercase">No intel on the wire.</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        posts.forEach(post => {
            let intelText = post.content || '';
            let isContact = false;
            let payload = null;
            
            if (post.content && post.content.startsWith('{')) {
                try {
                    payload = JSON.parse(post.content);
                    if (payload.intelText !== undefined) {
                        intelText = payload.intelText;
                        isContact = true;
                    } else {
                        intelText = payload.desc || '';
                        isContact = true;
                    }
                } catch(e) {}
            }
            
            if (post.category && post.category.startsWith('RCARD_')) {
                isContact = true;
                payload = payload || {};
                payload.rcardCategory = post.category.replace('RCARD_', '');
            }

            if (filter === 'CONTACTS' && !isContact) return;
            if (filter !== 'ALL' && filter !== 'CONTACTS' && post.category !== filter) return;

            const postDiv = document.createElement('div');
            // BRUTALIST CARD STYLING (matching the requested dummy cards)
            postDiv.className = 'w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col mb-6';
            
            let catColor = 'bg-blue-500 text-white';
            if (post.category === 'HOTSPOT') catColor = 'bg-orange-500 text-black';
            if (post.category === 'TROPHY') catColor = 'bg-green-500 text-black';
            if (post.category === 'WARNING') catColor = 'bg-red-500 text-white';

            const date = new Date(post.created_at);
            const diffMs = Date.now() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            let timeStr = diffMins < 60 ? `${diffMins} MINS AGO` : 
                            (diffMins < 1440 ? `${Math.floor(diffMins/60)} HOURS AGO` : `${Math.floor(diffMins/1440)} DAYS AGO`);
            if (diffMins === 0) timeStr = 'JUST NOW';

            // BRUTALIST HEADER (bg-gray-100, text-black)
            let html = `
                <div class="p-3 border-b-2 border-black bg-gray-100 flex justify-between items-center z-10 relative">
                    <div class="flex items-center gap-2">
                        <i data-lucide="user" class="w-4 h-4 text-gray-500"></i>
                        <span class="font-bold text-black uppercase tracking-wider text-sm truncate max-w-[150px]">${post.author || 'ANONYMOUS'}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${timeStr}</span>
                        <span class="${catColor} text-[10px] font-black px-2 py-0.5 border border-black rounded uppercase">${post.category || 'GENERAL'}</span>
                    </div>
                </div>
            `;

            if (post.image_url) {
                html += `
                    <div class="w-full bg-gray-200 border-b-2 border-black flex flex-col items-center justify-center cursor-pointer">
                        <img src="${post.image_url}" class="w-full max-h-[60vh] object-contain bg-black" onclick="window.open('${post.image_url}', '_blank')">
                    </div>
                `;
            }

            let displayHtml = intelText;
            const coordRegex = /\\[(?:COORD|MGRS):\\s*([^,]+),\\s*([^\\]]+)\\]/g;
            let hasCoords = false;
            
            // Fix regex for coord button
            displayHtml = displayHtml.replace(/\[(?:COORD|MGRS):\s*([^,]+),\s*([^\]]+)\]/g, (match, lat, lon) => {
                hasCoords = true;
                return `
                    <button onclick="plotOnMap(${lat}, ${lon}, this)" class="inline-flex items-center gap-1 bg-black text-white hover:bg-yellow-500 hover:text-black border border-white/20 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-colors ml-1 mt-1 align-middle shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_rgba(0,0,0,1)] hover:translate-y-[1px]">
                        <i data-lucide="crosshair" class="w-3 h-3"></i> PLOT MAP
                    </button>
                `;
            });

            // Prevent blank bodies from breaking layout structure
            if (!displayHtml && !post.image_url) {
                displayHtml = "EMPTY TRANSMISSION.";
            }

            if (displayHtml) {
                // BRUTALIST BODY (bg-white, text-black)
                html += `<div class="p-4 bg-white text-black font-medium text-sm md:text-base leading-relaxed whitespace-pre-wrap ${post.image_url ? '' : 'min-h-[60px]'}">${displayHtml}</div>`;
            }

            if (isContact && payload) {
                const rComms = payload.rcardComms || payload.comms || '';
                const rWeb = payload.rcardWeb || payload.web || '';
                const rDesc = payload.rcardDesc || payload.desc || '';
                const rCat = payload.rcardCategory || 'SERVICE';
                const rImg = payload.rcardImageUrl || null;
                
                let cardVisual = '';
                if (rImg) {
                    cardVisual = `
                        <div class="w-full bg-black flex justify-center border-y-2 border-black">
                            <img src="${rImg}" class="max-h-48 object-contain">
                        </div>
                    `;
                } else {
                    cardVisual = `
                        <div class="w-full bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex flex-col justify-center items-center text-center p-4 py-6 border-y-2 border-black">
                            <div class="text-yellow-500 font-black text-xl tracking-widest uppercase mb-1 drop-shadow-md leading-tight">${post.author}</div>
                            <div class="text-gray-400 font-bold text-[9px] tracking-widest uppercase border-b border-gray-600 pb-2 w-full max-w-[200px] mb-3">${rCat}</div>
                            ${rComms ? `<div class="text-white font-bold text-xs mb-1 flex items-center justify-center gap-1 w-full"><i data-lucide="phone" class="w-3 h-3 text-yellow-500"></i> ${rComms}</div>` : ''}
                            ${rWeb ? `<div class="text-blue-400 font-bold text-[10px] mb-2 flex items-center justify-center gap-1 w-full"><i data-lucide="globe" class="w-3 h-3 text-yellow-500"></i> ${rWeb}</div>` : ''}
                        </div>
                    `;
                }

                html += `
                    <div class="m-4 mt-0 border-2 border-yellow-500 rounded bg-gray-100 overflow-hidden shadow-[4px_4px_0_rgba(234,179,8,1)]">
                        <div class="bg-yellow-500 p-2 flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-widest border-b-2 border-black">
                            <i data-lucide="book-user" class="w-4 h-4"></i> ATTACHED FIELD CONTACT
                        </div>
                        ${cardVisual}
                        ${rDesc ? `<div class="p-3 text-xs italic font-medium text-gray-700 bg-white border-b-2 border-black">"${rDesc}"</div>` : ''}
                    </div>
                `;
            }

            postDiv.innerHTML = html;
            fragment.appendChild(postDiv);
        });

        feedContainer.appendChild(fragment);
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('Wire fetch error:', err);
        feedContainer.innerHTML = `<div class="text-red-500 font-bold w-full text-center p-8 uppercase">ERROR: ${err.message || err}</div>`;
    }
}

// Global exposure for plot map
window.plotOnMap = function(lat, lon, btnEl) {
    if (window.workstation_plot_temp) {
        window.workstation_plot_temp(lat, lon, "INTEL", "Global Wire Plot");
        if (btnEl) {
            btnEl.classList.add('bg-green-500', 'text-black');
            btnEl.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> PLOTTED';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                btnEl.classList.remove('bg-green-500', 'text-black');
                btnEl.innerHTML = '<i data-lucide="crosshair" class="w-3 h-3"></i> PLOT MAP';
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        }
    } else {
        alert("Plotter offline. Please refresh.");
    }
};

if (document.readyState === 'complete') {
    fetchWirePosts();
} else {
    window.addEventListener('load', () => fetchWirePosts());
}
"""
    with open(r'C:\Users\RalphMccabe\.gemini\antigravity\scratch\TacticalRangeCard-Sandbox\blog_logic.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Regenerated blog_logic.js successfully.")

if __name__ == '__main__':
    generate_blog_logic()
