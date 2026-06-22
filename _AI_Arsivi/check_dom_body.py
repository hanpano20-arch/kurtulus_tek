import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("Finding <body> wrapper:")
    match = re.search(r'<body[^>]*>\s*(<div[^>]*>)?\s*(<div[^>]*>)?', content)
    if match:
        print(match.group(0))

except Exception as e:
    print("Error:", e)
