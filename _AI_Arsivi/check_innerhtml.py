import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'innerHTML' in line and ('row' in line or 'dst-table' in line or 'td' in line):
            print(f"Match at line {i}: {line.strip()}")

except Exception as e:
    print("Error:", e)
