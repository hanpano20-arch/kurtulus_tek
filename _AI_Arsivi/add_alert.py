with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_func = 'H.showPuanAyarlari = function () {'
new_func = 'H.showPuanAyarlari = function () {\n    try {\n'

html = html.replace(old_func, new_func)

old_end = 'document.body.appendChild(modal);\n        };'
new_end = 'document.body.appendChild(modal);\n        } catch(err) { alert("Hata: " + err.message); console.error(err); }\n        };'

html = html.replace(old_end, new_end)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Added try/catch alert')
