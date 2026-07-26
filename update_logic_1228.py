import re

def update_js():
    with open('blog_logic.js', 'r') as f:
        content = f.read()

    # 1. Add toggle logic for contact form
    toggle_logic = """
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
                contactChevron.classList.add('rotate-180');
            } else {
                contactContainer.classList.add('hidden');
                contactContainer.classList.remove('flex');
                contactChevron.classList.remove('rotate-180');
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

            rcardImageLabel.textContent = 'Compressing...';
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
                    rcardImageLabel.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-500"></i> Photo Ready';
                    if(window.lucide) window.lucide.createIcons();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Submit Post
"""
    content = content.replace("    // Submit Post\n", toggle_logic)

    # 2. Update Submit Logic
    # We replace the body of submitBtn.addEventListener('click', async () => { ... })
    submit_start = content.find("submitBtn.addEventListener('click', async () => {")
    submit_end = content.find("    });\n\n    // --- 3. Fetching and Rendering Posts ---")
    
    old_submit = content[submit_start:submit_end]
    
    new_submit = """submitBtn.addEventListener('click', async () => {
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
                // 1. Upload Main Image to Storage (Native or Vault)
                let fileToUpload = imageUpload ? imageUpload.files[0] : null;
                let fileName = null;

                if (fileToUpload) {
                    const fileExt = fileToUpload.name.split('.').pop();
                    fileName = `wire_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                } else if (pendingVaultImageBase64) {
                    const mimeMatch = pendingVaultImageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
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
                let finalContent = intelText; // default to just text

                // Grab contact fields
                const rcardCategory = document.getElementById('rcard-category') ? document.getElementById('rcard-category').value : '';
                const rcardComms = document.getElementById('rcard-comms') ? document.getElementById('rcard-comms').value.trim() : '';
                const rcardWeb = document.getElementById('rcard-web') ? document.getElementById('rcard-web').value.trim() : '';
                const rcardDesc = document.getElementById('rcard-desc') ? document.getElementById('rcard-desc').value.trim() : '';
                
                const isAttachingContact = isContactFormOpen && (rcardComms || rcardWeb || rcardDesc || pendingRCardBase64);

                if (isAttachingContact) {
                    // Upload RCard image if exists
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

                    // Pack into JSON payload
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
                    .insert([
                        {
                            author: author,
                            category: category,
                            content: finalContent,
                            image_url: publicImageUrl
                        }
                    ]);

                if (insertError) throw new Error("Database Insert Failed: " + insertError.message);

                // Success!
                document.getElementById('post-author').value = '';
                contentInput.value = '';
                imageUpload.value = '';
                if (imageLabel) {
                    imageLabel.textContent = "Photo";
                    imageLabel.classList.remove("text-blue-600");
                }
                charCount.textContent = '0/500';
                
                // Reset Contact form
                if (document.getElementById('rcard-comms')) document.getElementById('rcard-comms').value = '';
                if (document.getElementById('rcard-web')) document.getElementById('rcard-web').value = '';
                if (document.getElementById('rcard-desc')) document.getElementById('rcard-desc').value = '';
                pendingRCardBase64 = null;
                if (rcardImageLabel) rcardImageLabel.innerHTML = 'Snap / Upload Photo';
                isContactFormOpen = false;
                if (contactContainer) {
                    contactContainer.classList.add('hidden');
                    contactContainer.classList.remove('flex');
                    contactChevron.classList.remove('rotate-180');
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
        """
    content = content.replace(old_submit, new_submit)

    # 3. Update Ribbon click handlers to handle "CONTACTS" filter
    ribbon_start = content.find("document.querySelectorAll('.p-2.flex.gap-2 > button').forEach(btn => {")
    ribbon_end = content.find("    });", ribbon_start) + 7
    old_ribbon = content[ribbon_start:ribbon_end]
    
    new_ribbon = """
    let currentWireFilter = 'ALL';
    // Use the actual container to grab just the filter buttons
    const filterContainer = document.querySelector('.p-2.flex.gap-2.overflow-x-auto');
    if (filterContainer) {
        const filterBtns = filterContainer.querySelectorAll('button');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active styling from all (make them outline essentially, wait the UI has specific colors. We'll just handle active state visually by opacity or border, but since we didn't add active classes in HTML, we'll just let the fetchWirePosts handle it)
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
"""
    content = content.replace(old_ribbon, new_ribbon)

    # Modify fetchWirePosts definition to take a parameter
    content = content.replace("async function fetchWirePosts() {", "async function fetchWirePosts(filter = currentWireFilter) {")
    content = content.replace("let query = window.supabaseClient.from('global_wire').select('*').order('created_at', { ascending: false }).limit(50);", 
                              "let query = window.supabaseClient.from('global_wire').select('*').order('created_at', { ascending: false }).limit(100);")

    # 4. Modify fetchWirePosts rendering logic inside the forEach(post => ...) loop
    render_start = content.find("            posts.forEach(post => {")
    render_end = content.find("            });\n\n            feedContainer.appendChild(fragment);", render_start)
    old_render = content[render_start:render_end]

    new_render = """            posts.forEach(post => {
                
                // Parse Content
                let intelText = post.content;
                let isContact = false;
                let payload = null;
                
                if (post.content && post.content.startsWith('{')) {
                    try {
                        payload = JSON.parse(post.content);
                        if (payload.intelText !== undefined) {
                            intelText = payload.intelText;
                            isContact = true;
                        } else {
                            // old RCard format
                            intelText = payload.desc || '';
                            isContact = true;
                        }
                    } catch(e) {}
                }
                
                // Check if this post is purely an old RCARD
                if (post.category && post.category.startsWith('RCARD_')) {
                    isContact = true;
                    // convert old category
                    payload = payload || {};
                    payload.rcardCategory = post.category.replace('RCARD_', '');
                }

                // If filter is CONTACTS, ONLY show posts with contacts attached
                if (filter === 'CONTACTS' && !isContact) {
                    return; // Skip this post
                }
                // If filter is something else, filter by category
                if (filter !== 'ALL' && filter !== 'CONTACTS') {
                    if (post.category !== filter) return; // Skip
                }

                const postDiv = document.createElement('div');
                postDiv.className = 'w-full bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col mb-6';
                
                // Main Header
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

                let html = `
                    <div class="p-3 border-b-4 border-black bg-gray-900 text-white flex justify-between items-center z-10 relative">
                        <div class="flex items-center gap-2">
                            <i data-lucide="user" class="w-4 h-4 text-gray-400"></i>
                            <span class="font-black uppercase tracking-wider text-sm truncate max-w-[150px]">${post.author || 'ANONYMOUS'}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${timeStr}</span>
                            <span class="${catColor} text-[10px] font-black px-2 py-0.5 border border-black rounded uppercase">${post.category || 'GENERAL'}</span>
                        </div>
                    </div>
                `;

                // Main Image
                if (post.image_url) {
                    html += `
                        <div class="w-full bg-gray-200 border-b-4 border-black flex flex-col items-center justify-center cursor-pointer">
                            <img src="${post.image_url}" class="w-full max-h-[60vh] object-contain bg-black" onclick="window.open('${post.image_url}', '_blank')">
                        </div>
                    `;
                }

                // Intel Text
                let displayHtml = intelText;
                
                // Parse coordinates to add quick-plot button
                const coordRegex = /\\[(?:COORD|MGRS):\s*([^,]+),\s*([^\\]]+)\\]/g;
                let hasCoords = false;
                
                displayHtml = displayHtml.replace(coordRegex, (match, lat, lon) => {
                    hasCoords = true;
                    return `
                        <button onclick="plotOnMap(${lat}, ${lon}, this)" class="inline-flex items-center gap-1 bg-black/40 hover:bg-yellow-500 hover:text-black border border-white/20 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-colors ml-1 mt-1 align-middle">
                            <i data-lucide="crosshair" class="w-3 h-3"></i> PLOT
                        </button>
                    `;
                });

                if (displayHtml) {
                    html += `<div class="p-4 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap ${post.image_url ? '' : 'min-h-[100px] flex items-center justify-center text-center italic text-gray-600'}">${displayHtml}</div>`;
                }

                // Attached Contact Card
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
                        // Digital Card Visual
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
                        <div class="mt-2 mx-4 mb-4 border-2 border-yellow-500 rounded bg-gray-100 overflow-hidden shadow-[4px_4px_0_rgba(234,179,8,1)]">
                            <div class="bg-yellow-500 p-2 flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-widest border-b-2 border-black">
                                <i data-lucide="book-user" class="w-4 h-4"></i> ATTACHED FIELD CONTACT
                            </div>
                            ${cardVisual}
                            ${rDesc ? `<div class="p-3 text-xs italic font-medium text-gray-700 bg-white">"${rDesc}"</div>` : ''}
                        </div>
                    `;
                }

                postDiv.innerHTML = html;
                fragment.appendChild(postDiv);
"""
    content = content.replace(old_render, new_render)
    
    with open('blog_logic.js', 'w') as f:
        f.write(content)

update_js()
