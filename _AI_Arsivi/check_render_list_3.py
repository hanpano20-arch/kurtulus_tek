import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    with open('output.txt', 'w', encoding='utf-8') as out:
        for i in range(11111, 11130):
            out.write(f"{i}: {lines[i].strip()}\n")

except Exception as e:
    print("Error:", e)
