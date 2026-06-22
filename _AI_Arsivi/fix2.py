with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('currentGameMax()', '(parseInt(document.getElementById("p-game")?.value) || 90)')

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Fixed currentGameMax')
