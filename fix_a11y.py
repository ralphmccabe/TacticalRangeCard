import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('id="closeHudSelectorBtn" class=', 'id="closeHudSelectorBtn" aria-label="Close HUD" class=')
content = content.replace('id="prevProfileBtn" class=', 'id="prevProfileBtn" aria-label="Previous Profile" class=')
content = content.replace('id="nextProfileBtn" class=', 'id="nextProfileBtn" aria-label="Next Profile" class=')
content = content.replace('id="deleteSelectedBtn" class=', 'id="deleteSelectedBtn" aria-label="Delete Profile" class=')
content = content.replace('onclick="event.stopPropagation(); toggleMatrixGenerator()" class="text-gray-400 hover:text-white p-4"', 'onclick="event.stopPropagation(); toggleMatrixGenerator()" aria-label="Close Matrix" class="text-gray-400 hover:text-white p-4"')
content = content.replace('id="comms-close-map-btn" class=', 'id="comms-close-map-btn" aria-label="Close Map" class=')
content = content.replace('onclick="event.stopPropagation(); toggleTacticalHints()" class="text-gray-400 hover:text-white p-4"', 'onclick="event.stopPropagation(); toggleTacticalHints()" aria-label="Close Tactical Hints" class="text-gray-400 hover:text-white p-4"')
content = re.sub(r'(id="dist-(\d+)")( class=)', r'\1 aria-label="Distance \2"\3', content)
content = content.replace('id="map-bg-upload" class=', 'id="map-bg-upload" aria-label="Upload Map Background" class=')
content = content.replace('id="vault-import-input" class=', 'id="vault-import-input" aria-label="Import to Vault" class=')
content = content.replace('id="chat-image-upload" accept=', 'id="chat-image-upload" aria-label="Upload Chat Image" accept=')
content = content.replace('id="profileSelect" class="hidden" aria-hidden="true"', 'id="profileSelect" class="hidden" tabindex="-1"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("A11y fixes applied")
