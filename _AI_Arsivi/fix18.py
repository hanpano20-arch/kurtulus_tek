with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add call to populateTimeMachine
html = html.replace('function populateTimeMachine() {', 'setTimeout(populateTimeMachine, 100);\n          function populateTimeMachine() {')

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
