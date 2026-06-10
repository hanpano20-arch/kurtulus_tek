import re
import sys

def extract_section(filename, section_id):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        # Find the div with id="v717-hist-card" and extract a chunk
        idx = content.find('id="v717-hist-card"')
        if idx != -1:
            start = max(0, idx - 50)
            return content[start:start+3000]
        return 'Not found'

print('--- v17 hist card ---')
sys.stdout.buffer.write(extract_section('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html', 'v717-hist-card').encode('utf-8'))

print('\n\n--- v18 hist card ---')
sys.stdout.buffer.write(extract_section('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_18 (5).html', 'v717-hist-card').encode('utf-8'))
