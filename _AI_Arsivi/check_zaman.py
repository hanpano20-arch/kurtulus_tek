import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'Zaman Makinesi' in line or 'Prompt' in line or 'Geçmişi Test Et' in line:
            print(f"{i}: {line.strip()}")

except Exception as e:
    print("Error:", e)
