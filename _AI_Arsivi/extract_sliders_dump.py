with open('PROMPT_BUILDER_v8_2.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('<div id="h-sliders">')

if start != -1:
    with open('temp_sliders_dump.html', 'w', encoding='utf-8') as f:
        f.write(html[start:start+15000])
    print('Dumped 15000 chars from start to temp_sliders_dump.html')
else:
    print('Not found')
