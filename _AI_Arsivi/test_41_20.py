import json
import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('let db = {') + 9
end = content.find(';\n', start)
db_str = content[start:end]
db_str = re.sub(r'([a-zA-Z0-9_]+):', r'"\1":', db_str)
# Handle arrays with unquoted keys if necessary
db_str = db_str.replace('\'', '"')
db_str = db_str.replace('""', '"')

try:
    db = json.loads(db_str)
    entries = db['entries']
    
    # Check 41
    last_20 = [e.get('nums', []) for e in entries[:20]]
    in_last_20_41 = any(41 in d for d in last_20)
    print(f"Is 41 in last 20 draws? {in_last_20_41}")
    for i, d in enumerate(last_20):
        if 41 in d:
            print(f"41 found at index {i}")

    # Check 20 streaks
    streak_events = 0
    current_streak = 0
    draws = [e.get('nums', []) for e in reversed(entries)]
    for d in draws:
        if 20 in d:
            current_streak += 1
        else:
            if current_streak >= 2:
                streak_events += 1
            current_streak = 0
    if current_streak >= 2:
        streak_events += 1
    print(f"Streak events for 20: {streak_events}")

except Exception as e:
    print(f"JSON Error: {e}")
