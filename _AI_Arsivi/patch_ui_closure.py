import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = "html += '</table></div>';"
    replacement = "html += '</tbody></table></div>';"

    if target in content:
        content = content.replace(target, replacement)
        print("Patched closure logic")
    else:
        print("Failed to patch closure logic")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
