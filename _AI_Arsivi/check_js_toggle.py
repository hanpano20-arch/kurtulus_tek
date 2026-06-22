import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for i, line in enumerate(content.split('\n')):
        if 'Gizle' in line or 'Aç' in line:
            if 'GİZLE' not in line and 'Gizle' in line:
                print(f"{i}: {line}")
except Exception as e:
    pass
