import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i in range(10005, 10025):
        print(f"{i}: {lines[i].strip()}")

except Exception as e:
    pass
