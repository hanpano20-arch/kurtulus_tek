with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if 'id="pool' in line or "id='pool" in line or 'id="p-pool' in line:
            print(line.strip())
