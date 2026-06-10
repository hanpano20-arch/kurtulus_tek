import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if 'p-oe-' in line or 'p-hl-' in line:
            print(line.strip())
