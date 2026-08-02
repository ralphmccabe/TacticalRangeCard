import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Revert supabase.min.js defer
content = re.sub(r'<script src="lib/supabase\.min\.js" defer></script>', r'<script src="lib/supabase.min.js"></script>', content)

# Revert lazy loading
content = content.replace('loading="lazy" ', '')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Reverted defer and lazy loading.")
