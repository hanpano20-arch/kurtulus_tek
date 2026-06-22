import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find setCollapsed definitions
    matches = re.finditer(r"function setCollapsed\(.*?\)", content)
    for match in matches:
        start = max(0, match.start() - 50)
        end = min(len(content), match.end() + 250)
        print("---")
        print(content[start:end])

except Exception as e:
    pass
