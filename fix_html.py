import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Add defer to supabase.min.js
content = re.sub(r'<script src="lib/supabase\.min\.js"></script>', r'<script src="lib/supabase.min.js" defer></script>', content)

# Add aria-labels to common buttons missing them based on title or context
patterns = [
    (r'(<button\s+id="close-icon-tray"\s+class="[^"]*?")(>)', r'\1 aria-label="Close Tray"\2'),
    (r'(<button\s+onclick="document\.getElementById\(\'modal-vault-picker\'\)\.classList\.add\(\'hidden\'\)"\s+type="button"\s+class="text-white hover:text-red-400")(>)', r'\1 aria-label="Close"\2'),
    (r'(<button[^>]*?id="clear-post-image-btn"[^>]*?title="Remove Photo"[^>]*?)(>)', r'\1 aria-label="Remove Photo"\2'),
    (r'(<button[^>]*?id="clear-bizcard-photo-btn"[^>]*?title="Remove Card Photo"[^>]*?)(>)', r'\1 aria-label="Remove Card Photo"\2'),
    (r'(<button\s+id="openCommLinkBtn"[^>]*?)(>)', r'\1 aria-label="Open Communication Link"\2'),
    (r'(<button\s+id="openNewPostBtn"[^>]*?)(>)', r'\1 aria-label="Create New Post"\2'),
    (r'(<button[^>]*?onclick="if\(window\.toggleCommLink\) window\.toggleCommLink\(\)"\s+class="text-slate-400 hover:text-red-400 transition-colors")(>)', r'\1 aria-label="Toggle Communication Link"\2'),
    (r'(<button[^>]*?id="clear-tactical-icons-btn"[^>]*?)(>)', r'\1 aria-label="Clear all tactical icons"\2'),
]

for p, repl in patterns:
    content = re.sub(p, repl, content, flags=re.IGNORECASE)

# The title attributes in some buttons can just be copied to aria-label if aria-label is missing.
def add_aria_label_from_title(match):
    tag = match.group(0)
    if 'aria-label' not in tag:
        m_title = re.search(r'title="([^"]+)"', tag)
        if m_title:
            return tag.replace('title="', f'aria-label="{m_title.group(1)}" title="')
    return tag

content = re.sub(r'<button[^>]+title="[^"]+"[^>]*>', add_aria_label_from_title, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated index.html")
