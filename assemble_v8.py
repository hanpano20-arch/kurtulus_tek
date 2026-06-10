import re
import ast
import json

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

v17 = read_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html')
v19 = read_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_19 (1).html')
v8_body = read_file('d:/GitHub/kurtulus_tek/v8_body.html')

html = ['<!DOCTYPE html>\n<html lang="tr" data-theme="red">\n<head>\n<meta charset="UTF-8">\n<title>Kolon Prompt Builder v8.0 - Birleşik SPA</title>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">']

v17_css = re.search(r'<style>.*?</style>', v17, re.DOTALL).group(0)
html.append(v17_css)

v19_css_blocks = re.findall(r'<style[^>]*>.*?</style>', v19, re.DOTALL)
for block in v19_css_blocks:
    if 'v68-final-merge-patch' not in block and any(x in block for x in ['v719', 'v74', 'v76', 'v712', 'v571']):
        html.append(block)

custom_css = '''
<style id="v80-custom-styles">
.progress-wrap { margin-top: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--color-border-secondary); border-radius: 8px; overflow: hidden; position: relative; height: 24px; }
.progress-bar { background: linear-gradient(90deg, #ff1028, #ff5b6d); height: 100%; width: 0%; transition: width 0.1s linear; }
.progress-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
.pool-size-ctrl { display: flex; gap: 4px; align-items: center; }
.pool-size-ctrl button { background: var(--color-background-secondary); border: 1px solid var(--color-border-secondary); color: var(--color-text-primary); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-weight: 800; }
.pool-size-ctrl button:hover { background: var(--color-border-secondary); }
.pool-size-ctrl input { width: 60px; text-align: center; }
</style>
'''
html.append(custom_css)
html.append('</head>\n<body>')

html.append(v8_body)

# Parse JS script from v19 and clean SD database in the process
scripts = re.findall(r'<script[^>]*>(.*?)</script>', v19, re.DOTALL)
js = '\n'.join(scripts)

# Fix the SD data
match = re.search(r'const SD=(\{.*?\});', js, re.DOTALL)
if match:
    sd_json_str = match.group(1)
    try:
        js_str = sd_json_str.replace("null", "None").replace("undefined", "None").replace("true", "True").replace("false", "False")
        sd = ast.literal_eval(js_str)
        
        # fix 90
        d90 = sd['90']['d']
        t90 = sd['90']['t']
        j90 = sd.get('90', {}).get('j', [])
        for i, draw in enumerate(d90):
            if 96 in draw: d90[i] = [90 if x == 96 else x for x in draw]
        for i, dt in enumerate(t90):
            if dt == '2023-02-03' and i > 0 and t90[i-1] == '2024-01-01': t90[i] = '2023-12-30'
            elif dt == '2024-10-11' and i > 0 and t90[i-1] == '2024-11-13': t90[i] = '2024-11-11'
        if len(j90) < len(d90): j90.extend([None] * (len(d90) - len(j90)))
        sd['90']['j'] = j90

        # fix 60
        d60 = sd['60']['d']
        t60 = sd['60']['t']
        j60 = sd.get('60', {}).get('j', [])
        if len(j60) < len(d60): j60.extend([None] * (len(d60) - len(j60)))
        sd['60']['j'] = j60
        
        new_sd_str = "const SD=" + json.dumps(sd, separators=(',', ':')) + ";"
        js = js[:match.start()] + new_sd_str + js[match.end():]
        print("SD clean successful!")
    except Exception as e:
        print("SD clean failed:", e)
else:
    print("SD block not found!")

# Remove the monkey-patches that just injected the UI since we inserted them in HTML
js = re.sub(r'const basic=document\.getElementById\(\'v74-general-card\'\);.*?\}\)\(\);', '', js, flags=re.DOTALL)
js = re.sub(r'const poolCard=document\.getElementById\(\'v719-pool-card\'\);.*?\}\)\(\);', '', js, flags=re.DOTALL)
js = re.sub(r'const jcard=document\.getElementById\(\'jaccard-report-card\'\);.*?\}\)\(\);', '', js, flags=re.DOTALL)
js = re.sub(r'card\.className=\'card\';\s*card\.id=\'v712-start-end-card\';.*?\}\)\(\);', '', js, flags=re.DOTALL)
js = re.sub(r'card\.id=\'v76-final-selection-card\';.*?\}\)\(\);', '', js, flags=re.DOTALL)


html.append('<script>')
html.append(js)
html.append('</script>\n</body>\n</html>')

write_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', '\n'.join(html))
print('Created PROMPT_BUILDER_v8_0.html')
