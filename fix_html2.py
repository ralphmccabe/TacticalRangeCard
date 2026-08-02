import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace css with minified versions
content = re.sub(r'href="tailwind\.css\?[^"]+"', r'href="tailwind.min.css?v=1.1"', content)
content = re.sub(r'href="style\.css\?[^"]+"', r'href="style.min.css?v=117"', content)

# Add loading="lazy" to imgs that don't have it
def add_lazy(match):
    tag = match.group(0)
    if 'loading=' not in tag and 'hidden' in tag: # mostly hidden/background imgs
        return tag.replace('<img ', '<img loading="lazy" ')
    return tag

content = re.sub(r'<img[^>]+>', add_lazy, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced CSS with minified versions and added lazy loading.")
