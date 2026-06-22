html = open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8').read()
lines = html.split('\n')
for i, line in enumerate(lines):
    if 'id="ws-' in line:
        for j in range(max(0, i-5), i+2):
            print(lines[j].strip())
        break
