import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find where <style> Focus Mode is
    for i, line in enumerate(lines):
        if 'Focus Mode for Tarihsel Analiz' in line:
            for j in range(i, i+15):
                print(f"{j}: {lines[j].strip()}")
            break
except Exception as e:
    pass
