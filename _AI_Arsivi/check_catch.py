with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('catch(err) { alert(')
if idx != -1:
    print(html[max(0, idx-200):idx+200])
