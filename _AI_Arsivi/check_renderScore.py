import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_idx = -1
    for i, line in enumerate(lines):
        if 'H.renderScore =' in line or 'renderScore: function' in line:
            start_idx = i
            break

    if start_idx != -1:
        for i in range(start_idx, start_idx+100):
            print(f"{i}: {lines[i].strip()}".encode('ascii', 'ignore').decode('ascii'))

except Exception as e:
    print("Error:", e)
