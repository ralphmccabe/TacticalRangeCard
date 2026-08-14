import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all input, select, textarea tags
tags = re.findall(r'<(input|select|textarea)\s+[^>]*>', content)

count = 0
for tag in set(tags):
    full_tags = re.findall(r'<%s\s+[^>]*>' % tag, content)
    for full_tag in full_tags:
        if 'aria-label' not in full_tag and 'type="hidden"' not in full_tag:
            # extract id or placeholder for label
            id_match = re.search(r'id="([^"]+)"', full_tag)
            ph_match = re.search(r'placeholder="([^"]+)"', full_tag)
            
            label = ""
            if ph_match:
                label = ph_match.group(1)
            elif id_match:
                label = id_match.group(1).replace('-', ' ').title()
            else:
                label = "Input field"
                
            # add aria-label right after the tag name
            new_tag = full_tag.replace('<%s ' % tag, '<%s aria-label="%s" ' % (tag, label))
            content = content.replace(full_tag, new_tag)
            count += 1

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Added aria-label to {count} form fields.")
