import json
import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('let db = ')
end = content.find(';\n', start)
db_json = content[start+9:end]
db_json = re.sub(r'([a-zA-Z0-9_]+):', r'"\1":', db_json)

try:
    db = json.loads(db_json)
except Exception as e:
    print("JSON load failed:", e)
    # Manual fallback for checking numbers
    print("Trying regex fallback")

if 'db' in locals():
    entries = db['entries']
    print(f"Total entries: {len(entries)}")
    for i, e in enumerate(entries[:30]):
        print(f"Draw -{i}: num={e['num']}, joker={e.get('joker', -1)}")
