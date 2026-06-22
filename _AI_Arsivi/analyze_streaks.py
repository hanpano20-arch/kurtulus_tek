import json

def analyze_streaks():
    with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    start = content.find('let db = ')
    end = content.find(';\n', start)
    db_json = content[start+9:end]
    
    # db_json might be tricky if it has unquoted keys, let's see
    try:
        db = json.loads(db_json)
    except:
        import re
        db_json = re.sub(r'([a-zA-Z0-9_]+):', r'"\1":', db_json)
        db = json.loads(db_json)

    entries = db['entries']
    
    for num in [20, 28, 19, 15, 81]:
        max_streak = 0
        current_streak = 0
        streak_2_count = 0
        streak_3_count = 0
        
        for e in reversed(entries):
            draw = e['num'] + [e.get('joker', -1)]
            if num in draw:
                current_streak += 1
                if current_streak > max_streak:
                    max_streak = current_streak
            else:
                if current_streak >= 2:
                    streak_2_count += 1
                if current_streak >= 3:
                    streak_3_count += 1
                current_streak = 0
                
        print(f"Num {num}: max={max_streak}, >=2 streaks={streak_2_count}, >=3 streaks={streak_3_count}")

analyze_streaks()
