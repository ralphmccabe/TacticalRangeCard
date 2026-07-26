// blog_logic.js - Logic for The Global Wire (Supabase Blog)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Background Image Upload ---
    const bgUpload = document.getElementById('wire-bg-upload');
    const bgContainer = document.getElementById('wire-bg-container');
    
    // Load saved background on startup
    const savedBg = localStorage.getItem('globalWireBg');
    if (savedBg) {
        bgContainer.style.backgroundImage = `url('${savedBg}')`;
    }

    bgUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Str = event.target.result;
            // Compress and save (if it's too big, localStorage might choke, 
            // but for a background, it's usually okay if under 5MB. 
            // For production, we'd scale it down first.)
            try {
                localStorage.setItem('globalWireBg', base64Str);
                bgContainer.style.backgroundImage = `url('${base64Str}')`;
            } catch (err) {
                alert("Image too large to save locally. Try a smaller photo.");
            }
        };
        reader.readAsDataURL(file);
    });

    // --- 2. Initialize Supabase on Modal Open ---
    const openBtn = document.getElementById('openGlobalBlogBtn');
    
    openBtn.addEventListener('click', async () => {
        const modal = document.getElementById('panel-global-wire');
        modal.classList.remove('hidden');
        
        await fetchWirePosts(); // Fetch immediately when opening
    });

});

// --- 3. Fetching and Rendering Posts ---
async function fetchWirePosts() {
    const feedContainer = document.getElementById('wire-feed-container');
    
    // Ensure Supabase JS is loaded
    if (!window.supabase) {
        if (window.ensureSupabase) {
            try {
                await window.ensureSupabase();
            } catch (e) {
                console.error("Failed to load Supabase SDK", e);
                feedContainer.innerHTML = `<div class="text-black bg-red-200 p-4 font-bold border-2 border-red-700">SYSTEM ERROR: FAILED TO LOAD CLOUD DRIVERS.</div>`;
                return;
            }
        }
    }

    // Ensure client is initialized
    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    }

    // Show loading state
    feedContainer.innerHTML = `<div class="w-full text-center mt-12 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3">
        <i data-lucide="loader" class="w-6 h-6 animate-spin"></i> INTERROGATING SATELLITE...
    </div>`;
    if (window.lucide) window.lucide.createIcons();

    // Fetch from Supabase
    try {
        const { data: posts, error } = await window.supabaseClient
            .from('global_wire')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        feedContainer.innerHTML = ''; // clear loading

        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = `<div class="w-full text-center mt-12 text-gray-500 font-bold uppercase tracking-widest border-4 border-dashed border-gray-400 p-12">
                NO TRANSMISSIONS INTERCEPTED.
            </div>`;
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = "w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col";
            
            // Format date loosely
            const dateObj = new Date(post.created_at);
            const timeAgo = Math.floor((new Date() - dateObj) / 60000); // minutes
            let timeStr = timeAgo < 60 ? `${timeAgo} MINS AGO` : `${Math.floor(timeAgo/60)} HOURS AGO`;
            if (timeAgo > 1440) timeStr = `${Math.floor(timeAgo/1440)} DAYS AGO`;

            // Color code categories
            let catColor = "bg-blue-500 text-white";
            if (post.category.toUpperCase() === 'HOTSPOT') catColor = "bg-orange-500 text-black";
            if (post.category.toUpperCase() === 'TROPHY') catColor = "bg-green-500 text-black";
            if (post.category.toUpperCase() === 'WARNING') catColor = "bg-red-500 text-white";

            card.innerHTML = `
                <div class="p-3 border-b-2 border-black bg-gray-100 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <i data-lucide="user" class="w-4 h-4 text-gray-500"></i>
                        <span class="font-bold text-black uppercase tracking-wider text-sm truncate max-w-[120px] md:max-w-[200px]">${post.author}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <span class="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase">${timeStr}</span>
                        <span class="${catColor} text-[9px] md:text-[10px] font-black px-2 py-0.5 border border-black rounded uppercase">${post.category}</span>
                    </div>
                </div>
                ${post.image_url ? `
                <div class="w-full h-48 md:h-64 bg-black border-b-2 border-black relative overflow-hidden flex items-center justify-center">
                    <img src="${post.image_url}" class="w-full h-full object-cover">
                </div>
                ` : ''}
                <div class="p-4 bg-white text-black">
                    <p class="font-medium text-sm leading-relaxed mb-4 whitespace-pre-wrap">${post.content}</p>
                    <div class="flex gap-2 border-t-2 border-gray-200 pt-3">
                        <button class="flex-1 bg-blue-100 text-blue-700 font-bold text-xs py-2 border-2 border-blue-700 rounded flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors uppercase">
                            <i data-lucide="shield-check" class="w-4 h-4"></i> VERIFY (${post.upvotes})
                        </button>
                    </div>
                </div>
            `;
            feedContainer.appendChild(card);
        });
        
        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error("Supabase Fetch Error:", error);
        feedContainer.innerHTML = `<div class="text-black bg-red-200 p-4 font-bold border-2 border-red-700 w-full max-w-2xl text-center">
            ERROR FETCHING INTEL: ${error.message}
        </div>`;
    }
}
