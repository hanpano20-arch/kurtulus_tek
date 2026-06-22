with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the fixed positioning with absolute positioning using window.scrollY
old_overlay = "overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2147483646;';"
new_overlay = "overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2147483646; display:flex; justify-content:center; align-items:center;';"

old_modal = 'modal.style.cssText = \'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#0d1117; border:4px solid #0a84ff; box-shadow:0 0 30px rgba(10,132,255,0.5), 0 10px 50px rgba(0,0,0,0.9); border-radius:16px; padding:30px; z-index:2147483647; width:90%; max-width:800px; max-height:85vh; overflow-y:auto; color:#ffffff; font-family:"Inter",sans-serif; text-align:left;\';'
new_modal = 'modal.style.cssText = \'position:relative; background:#0d1117; border:4px solid #0a84ff; box-shadow:0 0 30px rgba(10,132,255,0.5), 0 10px 50px rgba(0,0,0,0.9); border-radius:16px; padding:30px; z-index:2147483647; width:90%; max-width:800px; max-height:85vh; overflow-y:auto; color:#ffffff; font-family:"Inter",sans-serif; text-align:left;\';'

html = html.replace(old_overlay, new_overlay)
html = html.replace(old_modal, new_modal)

old_append = 'document.body.appendChild(overlay);\n        document.body.appendChild(modal);'
new_append = 'overlay.appendChild(modal);\n        document.body.appendChild(overlay);'
html = html.replace(old_append, new_append)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Flexbox modal approach applied.')
