import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for line in content.splitlines():
        if 'class="card"' in line or 'class="card ' in line:
            print(line.strip())
            
except Exception as e:
    pass
