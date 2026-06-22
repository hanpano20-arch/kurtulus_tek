import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print("Checking for top section IDs:")
    
    # 1. controls-card
    if 'id="controls-card"' in content:
        print("- controls-card FOUND")
    else:
        print("- controls-card NOT FOUND")
        
    # 2. v75-super-group
    if 'id="v75-super-group"' in content:
        print("- v75-super-group FOUND")
    else:
        print("- v75-super-group NOT FOUND. Checking 'Paketli üretim stratejisi'")
        match = re.search(r'<div[^>]*>.*?Paketli üretim stratejisi.*?</div', content, re.IGNORECASE)
        if match:
            print(f"   Found 'Paketli üretim stratejisi': {match.group(0)}")
            
    # 3. prompt-output-card
    if 'id="prompt-output-card"' in content:
        print("- prompt-output-card FOUND")
    else:
        print("- prompt-output-card NOT FOUND")

except Exception as e:
    print("Error:", e)
