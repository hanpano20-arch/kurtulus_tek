import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i in range(10005, 10025):
        print(f"{i}: {lines[i].strip()}")

    # Search for Gizle inside the file
    for i, line in enumerate(lines):
        if 'Gizle' in line or 'Aç' in line or 'gizle' in line or 'aç' in line:
            if 'v717-hist-card' not in line and 'Gizle' in line:
                print(f"Found Gizle at {i}: {line.strip()}")
                
except Exception as e:
    pass
