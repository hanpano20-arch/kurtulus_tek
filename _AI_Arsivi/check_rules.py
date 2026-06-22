import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'rules.forEach' in line:
            print(f"{i}: {line.strip()}")
            for j in range(i+1, i+10):
                if '}' in lines[j] or 'res +=' in lines[j]:
                    print(f"{j}: {lines[j].strip()}")

except Exception as e:
    print("Error:", e)
