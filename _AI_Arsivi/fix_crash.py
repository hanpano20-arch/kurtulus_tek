import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing variable in extractDetailsForUI
old_line = "let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));"
new_line = "let is_joker_in_last_10 = (joks && joks.slice(0, 10).includes(n));"

content = content.replace(old_line, new_line)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed missing variable in extractDetailsForUI")
