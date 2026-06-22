import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # check line 8470 to 8500
    for i in range(8470, 8500):
        print(f"{i}: {lines[i].strip()}")

except Exception as e:
    pass
