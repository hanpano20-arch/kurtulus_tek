import re

# Read v7_17
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html', 'r', encoding='utf-8') as f:
    v17 = f.read()

# Extract styles from v7_17
m_style = re.search(r'(<style>.*?</style>)', v17, re.DOTALL)
if m_style:
    style_v17 = m_style.group(1)
else:
    print('Style not found in v17')
    exit(1)

# Read v8_0
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    v8 = f.read()

# Replace style in v8_0
v8_new = re.sub(r'<style>.*?</style>', style_v17, v8, flags=re.DOTALL)

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(v8_new)
print('Styles successfully copied from v7_17 (3) to v8_0!')
