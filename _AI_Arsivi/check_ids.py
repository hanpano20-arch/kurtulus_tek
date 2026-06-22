import re
import sys

def analyze_file(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        ids = re.findall(r'id=["\']([^"\']+)["\']', content)
        
        output = f"\n--- Analysis for {filename} ---\n"
        output += "Important IDs related to 'manuel', 'joker', 'tarih', 'havuz', 'w_hist', 'w_rec':\n"
        for i in set(ids):
            if any(k in i.lower() for k in ['man', 'jok', 'tar', 'havuz', 'pool', 'new', 'recent', 'hist', 'w_']):
                output += f"ID: {i}\n"
        
        sys.stdout.buffer.write(output.encode('utf-8'))

analyze_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_18 (5).html')
