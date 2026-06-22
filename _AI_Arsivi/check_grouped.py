import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'Paketli üretim stratejisi' in line:
            print(f"{i}: {line.strip()}")
            for j in range(max(0, i-5), i+5):
                print(f"  {j}: {lines[j].strip()}")
except Exception as e:
    pass
