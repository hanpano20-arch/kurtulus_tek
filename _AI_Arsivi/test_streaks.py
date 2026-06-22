import json
import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('let db = {') + 9
end = content.find(';\n', start)
db_str = content[start:end]
db_str = re.sub(r'([a-zA-Z0-9_]+):', r'"\1":', db_str)
db = json.loads(db_str)
df = db['entries']

def get_streak_events(i):
    streak_events = 0
    current_streak = 0
    for d in reversed(df):
        if d and isinstance(d, list) and i in d:
            current_streak += 1
        else:
            if current_streak >= 2:
                streak_events += 1
            current_streak = 0
    if current_streak >= 2:
        streak_events += 1
    return streak_events

print(f"streak_events for 20: {get_streak_events(20)}")
print(f"streak_events for 28: {get_streak_events(28)}")
