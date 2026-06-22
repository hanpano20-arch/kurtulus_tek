with open('PROMPT_BUILDER_v8_0_backup.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('<div id="h-sliders">')
end = html.find('<div id="h-prompt-box">')

if start != -1 and end != -1:
    print('Extraction length:', end - start)
    with open('temp_sliders_backup.html', 'w', encoding='utf-8') as f:
        f.write(html[start:end])
else:
    print('Not found')
