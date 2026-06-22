with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

new_c = c.replace("document.getElementById('p-pool')", "document.getElementById('poolInput')")

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(new_c)
print('Replaced p-pool with poolInput successfully.')
