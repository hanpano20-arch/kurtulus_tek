import re
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'Havuz alan' in line or 'Havuz alanı' in line:
            print(f"Line {i}: {line.strip()}")
            print(f"Previous 2 lines:\n{lines[i-2].strip()}\n{lines[i-1].strip()}")
            print(f"Next 2 lines:\n{lines[i+1].strip()}\n{lines[i+2].strip()}")
