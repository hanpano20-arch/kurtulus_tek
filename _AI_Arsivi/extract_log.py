import json

with open(r'C:\Users\Lenovo\.gemini\antigravity-ide\brain\add134a5-61f2-4b0c-9038-b82f567e764b\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip(): continue
        data = json.loads(line)
        if data['source'] not in ('USER_EXPLICIT', 'MODEL'): continue
        content = data.get('content', '')
        if ' 15 ' in content or ' 40 ' in content or ' 28 ' in content or 'Tarihsel /' in content:
            print(f"[{data['created_at']}] {data['source']}: {content[:300]}")
