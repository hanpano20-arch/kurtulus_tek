import re

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_18 (5).html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()
    m = re.search(r'const SD90=\{.*?\}', content, re.DOTALL)
    if m:
        snippet = m.group(0)[:500]
        print(snippet)
    else:
        print("not found")
