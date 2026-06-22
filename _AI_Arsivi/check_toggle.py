import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'function toggleSection' in line or 'Tarihsel Çekiliş Analizi' in line:
            for j in range(max(0, i-5), i+20):
                print(f"{j}: {lines[j].strip()}")
            break

except Exception as e:
    pass
