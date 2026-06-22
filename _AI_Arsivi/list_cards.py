import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    cards = re.findall(r'<div[^>]*class=["\']([^"\']*card[^"\']*)["\'][^>]*>(.*?)</div>', content, re.DOTALL | re.IGNORECASE)
    
    print("Found cards:")
    for match in re.finditer(r'<div\s+([^>]*class=["\'][^"\']*card\b[^"\']*["\'][^>]*)>', content):
        attrs = match.group(1)
        id_match = re.search(r'id=["\']([^"\']+)["\']', attrs)
        card_id = id_match.group(1) if id_match else "NO_ID"
        
        # Get next few lines to find the title
        start_idx = match.end()
        snippet = content[start_idx:start_idx+200]
        title_match = re.search(r'<span class="card-title">(.*?)</span>', snippet)
        title = title_match.group(1) if title_match else "NO_TITLE"
        
        print(f"ID: {card_id:20} | Title: {title}")

except Exception as e:
    print("Error:", e)
