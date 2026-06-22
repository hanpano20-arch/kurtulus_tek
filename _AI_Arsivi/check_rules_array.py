import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'const rules = [' in line:
            for j in range(i, i+30):
                print(f"{j}: {lines[j].strip()}")
            break

except Exception as e:
    print("Error:", e)
