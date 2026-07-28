const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const replacement = \<div class="flex-1 flex flex-col items-center justify-start pt-4 space-y-3 relative">
    <div id="ptt-active-speaker" class="text-[9px] font-mono text-gray-600 uppercase tracking-tighter h-4">STANDBY</div>
    <button id="ptt-btn" oncontextmenu="return false;" style="-webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: none;" aria-label="Push to Talk" class="w-16 h-16 rounded-full border-4 border-gray-800 bg-gray-900 flex items-center justify-center text-gray-600 transition-all active:scale-95 hover:border-emerald-500/50 group select-none">
        <i data-lucide="mic" class="w-6 h-6 group-active:text-emerald-400 pointer-events-none"></i>
    </button>
    <span class="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Push To Talk</span>
    <!-- C2 COMMAND PANEL -->
    <div class="w-full mt-4 border-t border-gray-800/50 pt-3 px-1">
        <div class="flex items-center justify-between mb-2">
            <span class="text-[8px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1"><i data-lucide="crosshair" class="w-2.5 h-2.5"></i> C2 COMMAND</span>
        </div>
        <div class="flex flex-col gap-1">
            <label class="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Duty Status</label>
            <select id="c2-duty-status" class="w-full bg-gray-950 border border-gray-700 text-gray-300 text-[10px] p-1.5 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors appearance-none cursor-pointer">
                <option value="">-- NO STATUS --</option>
                <option value="🏃">🏃 Walking</option>
                <option value="🛑">🛑 Stopped</option>
                <option value="⚙️">⚙️ Busy</option>
                <option value="🎒">🎒 Packing</option>
                <option value="🔭">🔭 Scouting</option>
                <option value="🏕️">🏕️ Resting</option>
                <option value="🚚">🚚 En Route</option>
                <option value="✅">✅ Arrived</option>
                <option value="🥷">🥷 Hideout</option>
                <option value="🔒">🔒 Private</option>
                <option value="🎯">🎯 On Mission</option>
            </select>
        </div>
    </div>
</div>\;

const pattern = /<div class="flex-1 flex flex-col items-center justify-center space-y-3">\s*<div id="ptt-active-speaker" class="text-\[9px\] font-mono text-gray-600 uppercase tracking-tighter h-4">STANDBY<\/div>\s*<button id="ptt-btn"[\s\S]*?<i data-lucide="mic" class="w-10 h-10[\s\S]*?<\/i>\s*<\/button>\s*<span class="text-\[7px\][\s\S]*?Push To Talk<\/span>\s*<\/div>/g;

content = content.replace(pattern, replacement);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Replaced');
