import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'H.renderList =' in line:
            for j in range(i, i+50):
                print(f"{j}: {lines[j].strip()}")
            break
            
except Exception as e:
    print("Error:", e)
