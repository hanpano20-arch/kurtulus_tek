import re
import json
import ast

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_block(content, start_marker, end_marker=None):
    start_idx = content.find(start_marker)
    if start_idx == -1: return ""
    if end_marker:
        end_idx = content.find(end_marker, start_idx)
        if end_idx == -1: return ""
        return content[start_idx:end_idx + len(end_marker)]
    return content[start_idx:]

v17_content = read_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html')
v19_content = read_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_19 (1).html')

# Extracting SD object
match = re.search(r'const SD=(\{.*?\});\n', v19_content, re.DOTALL)
sd_json_str = match.group(1)

# we will clean the SD data in python using ast since it's valid JS object
try:
    js_str = sd_json_str.replace("null", "None").replace("undefined", "None").replace("true", "True").replace("false", "False")
    sd = ast.literal_eval(js_str)
    
    # fix 90 game
    d90 = sd['90']['d']
    t90 = sd['90']['t']
    j90 = sd.get('90', {}).get('j', [])
    for i, draw in enumerate(d90):
        if 96 in draw:
            d90[i] = [90 if x == 96 else x for x in draw]
    for i, dt in enumerate(t90):
        if dt == '2023-02-03' and i > 0 and t90[i-1] == '2024-01-01':
            t90[i] = '2023-12-30'
        elif dt == '2024-10-11' and i > 0 and t90[i-1] == '2024-11-13':
            t90[i] = '2024-11-11'
    if len(j90) < len(d90):
        j90.extend([None] * (len(d90) - len(j90)))
    sd['90']['j'] = j90

    # fix 60 game
    d60 = sd['60']['d']
    t60 = sd['60']['t']
    j60 = sd.get('60', {}).get('j', [])
    if len(j60) < len(d60):
        j60.extend([None] * (len(d60) - len(j60)))
    sd['60']['j'] = j60

    new_sd_str = "const SD=" + json.dumps(sd, separators=(',', ':')) + ";"
except Exception as e:
    print("Error parsing SD:", e)
    new_sd_str = "const SD=" + sd_json_str + ";"

# Start building v8.0 HTML
html_parts = []

html_parts.append('<!DOCTYPE html>\n<html lang="tr" data-theme="red">\n<head>\n<meta charset="UTF-8">\n<title>Kolon Prompt Builder v8.0 - Birleşik SPA</title>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">\n')

# CSS extraction
v17_css = extract_block(v17_content, '<style>', '</style>')
# V19 has multiple style blocks (v571, v719, v74, v76, v712)
v19_css_blocks = re.findall(r'<style[^>]*>.*?</style>', v19_content, re.DOTALL)

html_parts.append(v17_css)
for block in v19_css_blocks:
    if "v68-final-merge-patch" not in block and "v719" in block or "v74" in block or "v76" in block or "v712" in block or "v571" in block:
        html_parts.append(block)

# Add custom progress bar css and pool size buttons
custom_css = """
<style id="v80-custom-styles">
.progress-wrap { margin-top: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--color-border-secondary); border-radius: 8px; overflow: hidden; position: relative; height: 24px; }
.progress-bar { background: linear-gradient(90deg, #ff1028, #ff5b6d); height: 100%; width: 0%; transition: width 0.1s linear; }
.progress-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
.pool-size-ctrl { display: flex; gap: 4px; align-items: center; }
.pool-size-ctrl button { background: var(--color-background-secondary); border: 1px solid var(--color-border-secondary); color: var(--color-text-primary); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-weight: 800; }
.pool-size-ctrl button:hover { background: var(--color-border-secondary); }
.pool-size-ctrl input { width: 60px; text-align: center; }
</style>
"""
html_parts.append(custom_css)
html_parts.append('\n</head>\n<body>\n')

# Body structure
body_v17 = extract_block(v17_content, '<div class="app">', '<script>')
if not body_v17: body_v17 = "ERROR EXTRACTING BODY"

# We need to insert v19 UI elements into the body.
# v19 UI elements:
# - Draw Map Card (v7.14)
# - v7.19 Pool Analysis Card
# - General Settings Card (v7.4)
# - Score Band Card (v7.3.1)
# - Start-End Quota Card (v7.12)
# - Final Selection Card (v7.6)
# - Control Column Card (v7.3.1)

# We will let the Javascript handle the insertion, or we can statically insert them.
# Given the size, maybe we just include the entire v19 script section and let it build the cards via JS?
# v19 uses JS to inject cards into the DOM dynamically (e.g., `buildGeneralCard()`, `buildCards()` for v7.3.1, etc.)
# If we just put the v19 JS blocks at the end, they will run and inject the cards!
# However, we want zero-duplication, meaning we should NOT have multiple monkey-patches.
# We need to statically build the final JS.

# Since writing an AST parser in Python to merge JS functions is too hard,
# I will write the JS manually into a separate file using another write_to_file tool call,
# or we can stitch the HTML here and leave an empty script tag that we fill later.

html_parts.append(body_v17)
html_parts.append('\n\n<!-- JAVASCRIPT CORE -->\n<script>\n')
html_parts.append(new_sd_str)
html_parts.append('\n// MORE JS TO BE INJECTED\n</script>\n</body>\n</html>')

write_file('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', ''.join(html_parts))
print("Created PROMPT_BUILDER_v8_0.html base.")
