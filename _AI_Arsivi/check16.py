import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find K16 logic
start = content.find('K16-İzolasyon')
print("Found K16 definition:", start != -1)

# print lines around K16 calculations
for i, line in enumerate(content.split('\n')):
    if 'k16' in line.lower() and ('if' in line or '=' in line or 'let ' in line):
        if 'K16' not in line: # skip comments
            print(f"{i}: {line}")
