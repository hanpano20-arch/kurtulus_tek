import re

with open('PROMPT_BUILDER_v8_2.html', 'r', encoding='utf-8') as f:
    html = f.read()
    
start = html.find('<div class="h-ratio-box">')
end = html.find('<!-- ZAMAN MAKİNESİ -->')

with open('temp_sliders.html', 'w', encoding='utf-8') as f:
    f.write(html[start:end])
    
print('Extraction length:', end - start)
