import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Search for toggleBody or anything like that
    for i, line in enumerate(lines):
        if 'function toggleBody' in line or 'function toggleCard' in line:
            for j in range(i, i+15):
                print(f"{j}: {lines[j].strip()}")
            break
            
except Exception as e:
    pass
