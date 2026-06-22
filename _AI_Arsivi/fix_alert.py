with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_func = 'H.showPuanAyarlari = function () {'
new_func = 'H.showPuanAyarlari = function () {\n    alert("Puan Ayarlari calisti!");\n    try {\n'

old_end = 'document.body.appendChild(modal);\n        };'
new_end = 'document.body.appendChild(modal);\n        } catch(e) { alert("Hata: " + e.message); console.error(e); }\n        };'

html = html.replace(old_func, new_func)
html = html.replace(old_end, new_end)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Alert added successfully.')
