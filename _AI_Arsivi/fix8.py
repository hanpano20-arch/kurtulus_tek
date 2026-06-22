import re

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(r"onclick=\"setTimeMachine(0, \'\'); if(typeof renderDrawMap===\'function\') renderDrawMap();\"", "onclick=\"setTimeMachine(0, ''); if(typeof renderDrawMap==='function') renderDrawMap();\"")

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Button syntax fixed")
