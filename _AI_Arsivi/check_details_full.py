import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_idx = -1
    for i, line in enumerate(lines):
        if 'window.HavuzMotoru = {' in line or 'extractDetailsForUI:' in line or 'extractDetailsForUI = function' in line:
            start_idx = i
            break
            
    if start_idx == -1:
        # Search the whole file
        for i, line in enumerate(lines):
            if 'extractDetails' in line:
                start_idx = i - 5
                break

    if start_idx != -1:
        for i in range(max(0, start_idx), min(len(lines), start_idx+100)):
            print(f"{i}: {lines[i].strip()}")

except Exception as e:
    print("Error:", e)
