$index = Get-Content -Raw -Path .\index.html

# Inject Bolo Modal and Game Tag Modal before AMMO LIBRARY MODAL
$bolo = Get-Content -Raw -Path .\bolo.html
$gametag = Get-Content -Raw -Path .\gametag.html

$index = $index -replace "(?s)    <!-- AMMO LIBRARY MODAL -->", "$bolo`r`n$gametag`r`n    <!-- AMMO LIBRARY MODAL -->"

# Inject top toolbar buttons
$mainToolbarBtn = @"
                        <button class="remarks-toggle-btn text-yellow-500 hover:text-yellow-400 p-1 flex items-center justify-center transition-colors shrink-0" title="ReMarks Jotter" aria-label="ReMarks Jotter">
                            <i data-lucide="edit-3" class="w-6 h-6"></i>
                        </button>
                        <button id="openBoloBtn" class="text-red-500 hover:text-white hover:bg-red-900 p-1 px-2 flex items-center justify-center transition-all shrink-0 font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-red-500/50 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="MOST WANTED / BOLO Card" aria-label="BOLO Card">
                            MOST WANTED
                        </button>
                        <button id="openGameTagBtn" class="text-amber-500 hover:text-white hover:bg-amber-900 p-1 px-2 flex items-center justify-center transition-all shrink-0 font-black uppercase text-[9px] md:text-[10px] tracking-widest border border-amber-500/50 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="FIELD HARVEST TAG" aria-label="Game Tag">
                            <i data-lucide="tag" class="w-3 h-3 mr-1"></i> FIELD TAG
                        </button>
"@

$index = $index -replace "(?s)                        <button class=`"remarks-toggle-btn text-yellow-500 hover:text-yellow-400 p-1 flex items-center justify-center transition-colors shrink-0`" title=`"ReMarks Jotter`" aria-label=`"ReMarks Jotter`">.*?<i data-lucide=`"edit-3`" class=`"w-6 h-6`"></i>.*?<\/button>", $mainToolbarBtn


$hudToolbarBtn = @"
                                    <button class="remarks-toggle-btn bg-gray-900 border border-yellow-700 text-yellow-500 p-2 rounded hover:bg-yellow-600 hover:text-black transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center" title="ReMarks Jotter" aria-label="ReMarks Jotter">
                                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                                    </button>
                                    <button id="openBoloBtnHud" class="bg-gray-900 border border-red-700 text-red-500 p-2 rounded hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center justify-center font-black uppercase text-[10px]" title="MOST WANTED / BOLO Card" aria-label="BOLO Card">
                                        MOST WANTED
                                    </button>
                                    <button id="openGameTagBtnHud" class="bg-gray-900 border border-amber-700 text-amber-500 p-2 rounded hover:bg-amber-600 hover:text-black transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center justify-center font-black uppercase text-[10px]" title="FIELD HARVEST TAG" aria-label="Game Tag">
                                        <i data-lucide="tag" class="w-4 h-4 mr-1"></i> FIELD TAG
                                    </button>
"@

$index = $index -replace "(?s)                                    <button class=`"remarks-toggle-btn bg-gray-900 border border-yellow-700 text-yellow-500 p-2 rounded hover:bg-yellow-600 hover:text-black transition-all shadow-\[0_0_10px_rgba\(234,179,8,0\.2\)\] flex items-center justify-center`" title=`"ReMarks Jotter`" aria-label=`"ReMarks Jotter`">.*?<i data-lucide=`"edit-3`" class=`"w-5 h-5`"></i>.*?<\/button>", $hudToolbarBtn


# Add the disclaimer
$disclaimer = @"
        <div class="border border-red-900/50 bg-red-950/20 p-4 rounded mb-6">
            <h3 class="text-red-500 font-bold mb-2">!!! CRITICAL SAFETY WARNING !!!</h3>
            <p class="text-red-400/80 text-sm mb-4">Ballistic software is for reference and training purposes only. Numerical outputs are theoretical. The user is solely responsible for firearm safety, target identification, and background awareness. Never rely on an application as your sole safety check.</p>
            
            <h3 class="text-amber-500 font-bold mb-2">HARVEST TAG DISCLAIMER</h3>
            <p class="text-amber-400/80 text-sm mb-4">The "Field Harvest Tag" feature is for personal logging purposes only. It is NOT an official state-issued E-Tag and does NOT satisfy legal requirements for tagging harvested game in your state. You are solely responsible for following all local and federal hunting/fishing laws.</p>
            
            <h3 class="text-red-500 font-bold mb-2">BOLO CARD DISCLAIMER</h3>
            <p class="text-red-400/80 text-sm">The BOLO / Most Wanted feature is for training and entertainment purposes only.</p>
        </div>
"@

$index = $index -replace "(?s)        <div class=`"border border-red-900/50 bg-red-950/20 p-4 rounded mb-6`">.*?<\/div>", $disclaimer

Set-Content -Path .\index.html -Value $index
