import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the (Son 8) labels
html = html.replace('doygunlukLabel = " (Son 4)";', 'doygunlukLabel = "";')
html = html.replace('doygunlukLabel = " (Son 8)";', 'doygunlukLabel = "";')
html = html.replace('doygunlukLabel = " (Son 12)";', 'doygunlukLabel = "";')
html = html.replace('doygunlukLabel = " (Son 16)";', 'doygunlukLabel = "";')

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Applied fixes for Doygunluk labels.')
