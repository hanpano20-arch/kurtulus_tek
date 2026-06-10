import re

# 1. Load the original v7_17 HTML to ensure perfect UI matching
v17 = open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html', 'r', encoding='utf-8').read()

# 2. Extract the new card from v19
v19 = open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_19 (1).html', 'r', encoding='utf-8').read()
m_19_card = re.search(r'(<div class="card" id="v719-pool-card">.*?</select>\s*</div>\s*</div>\s*</div>)', v19, re.DOTALL)
new_card_html = m_19_card.group(1) if m_19_card else ""

# 3. Replace the old history card in v17 with the new pool card
# Find v717-hist-card bounds
m_17_card = re.search(r'(<div class="card" id="v717-hist-card">.*?</div>\s*</div>\s*</div>)', v17, re.DOTALL)
if m_17_card:
    v17 = v17.replace(m_17_card.group(1), new_card_html)
else:
    # If not found exactly, just prepend the new card after the first card
    first_card_end = v17.find('</div>\n    <div class="card"')
    v17 = v17[:first_card_end] + '</div>\n' + new_card_html + '\n' + v17[first_card_end:]

# 4. Strip ALL script tags from the v17 HTML body to make it pure HTML/CSS
# We will find the index of the first <script> tag and everything after it usually is script.
# Actually, v17 has multiple script tags. Let's just remove them properly.
def remove_tags(text, tag):
    pattern = r'<' + tag + r'[^>]*>.*?</' + tag + r'>'
    return re.sub(pattern, '', text, flags=re.DOTALL)

pure_html = remove_tags(v17, 'script')

# 5. Load the CLEANED JS Engine
with open('d:/GitHub/kurtulus_tek/v8_core_cleaned.js', 'r', encoding='utf-8') as f:
    js_engine = f.read()

# 6. Apply the consolidated functions
with open('d:/GitHub/kurtulus_tek/v8_core_consolidated.js', 'r', encoding='utf-8') as f:
    consolidated_js = f.read()

# Remove the old unmerged functions from js_engine using the same bracket matcher logic
def remove_function(text, fn_name):
    matches = list(re.finditer(r'function\s+' + fn_name + r'\s*\([^)]*\)\s*\{', text))
    for m in reversed(matches):
        start = m.start()
        stack = 0; in_string = False; str_char = ''; end = -1
        brace_start = text.find('{', start)
        for i in range(brace_start, len(text)):
            char = text[i]
            if not in_string:
                if char in "\"'`": in_string=True; str_char=char
                elif char=='{': stack+=1
                elif char=='}':
                    stack-=1
                    if stack==0: end=i+1; break
            else:
                if char=='\\': continue
                if char==str_char:
                    prev=0; j=i-1
                    while text[j]=='\\': prev+=1; j-=1
                    if prev%2==0: in_string=False
        if end!=-1: text = text[:start] + text[end:]
    return text

for fn in ['getParams', 'checkCombo', 'buildPrompt']:
    js_engine = remove_function(js_engine, fn)

# Fix oldBuild calls
js_engine = js_engine.replace('oldBuild()', 'buildPrompt()')
js_engine = js_engine.replace('oldBuild ? oldBuild() : \'\'', 'buildPrompt()')

# 7. Merge the JS
final_js = consolidated_js + '\n' + js_engine

# 8. Re-apply the SD Database with 842 draws
# We read the SD from the current v8_0.html that we just successfully updated
current_v8 = open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8').read()
m_sd = re.search(r'const SD=\{.*?\};', current_v8, re.DOTALL)
sd_str = m_sd.group(0) if m_sd else "const SD={};"
final_js = re.sub(r'const SD=\{.*?\};', sd_str, final_js, flags=re.DOTALL)

# Also copy the adaptive outlierScore we just added!
m_outlier = re.search(r'function outlierScore.*?\n\}', current_v8, re.DOTALL)
if m_outlier:
    final_js = remove_function(final_js, 'outlierScore')
    final_js += '\n' + m_outlier.group(0)

# 9. Assemble final HTML
final_html = pure_html.replace('</body>', f'<script>\n{final_js}\n</script>\n</body>')

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0_fixed.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print("Perfect v8.0 created!")
