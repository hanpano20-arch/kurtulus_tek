import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if 'Bilen Çekiliş Sayısı:' in line or 'bilen_cekilis_sayisi' in line or 'Bilen' in line and 'Sayısı' in line:
            for j in range(max(0, i-20), i+20):
                print(f"{j}: {lines[j].strip()}")
            break

except Exception as e:
    pass
