import re
import subprocess

html = open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8').read()
js_matches = re.findall(r'<script.*?>([\s\S]*?)</script>', html)
js_code = '\n'.join(js_matches)
open('test.js', 'w', encoding='utf-8').write(js_code)

result = subprocess.run(['node', '-c', 'test.js'], capture_output=True, text=True)
if result.returncode != 0:
    print("Syntax Error:")
    print(result.stderr)
else:
    print("Syntax OK")
