import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if '.chip-hot' in line or '.h-row-lbl' in line:
            for j in range(max(0, i-5), i+30):
                print(f"{j}: {lines[j].strip()}")
            break

except Exception as e:
    print("Error:", e)
