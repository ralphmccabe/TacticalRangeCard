import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Revert minified css
content = re.sub(r'href="tailwind\.min\.css\?[^"]+"', r'href="tailwind.css?v=1.1"', content)
content = re.sub(r'href="style\.min\.css\?[^"]+"', r'href="style.css?v=117"', content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Reverted CSS to unminified versions.")
