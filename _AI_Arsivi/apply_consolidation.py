import re

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Helper to find function blocks
def remove_function(text, fn_name):
    # This regex is tricky, let's just use a balanced bracket extractor to delete them
    matches = list(re.finditer(r'function\s+' + fn_name + r'\s*\([^)]*\)\s*\{', text))
    for m in reversed(matches):
        start = m.start()
        stack = 0
        in_string = False
        str_char = ''
        end = -1
        # find the opening brace
        brace_start = text.find('{', start)
        for i in range(brace_start, len(text)):
            char = text[i]
            if not in_string:
                if char in "\"'`":
                    in_string = True
                    str_char = char
                elif char == '{':
                    stack += 1
                elif char == '}':
                    stack -= 1
                    if stack == 0:
                        end = i + 1
                        break
            else:
                if char == '\\':
                    continue
                if char == str_char:
                    # check if the quote isn't escaped
                    prev_slash_count = 0
                    j = i - 1
                    while text[j] == '\\':
                        prev_slash_count += 1
                        j -= 1
                    if prev_slash_count % 2 == 0:
                        in_string = False
        
        if end != -1:
            text = text[:start] + f"/* removed {fn_name} */" + text[end:]
    return text

html = remove_function(html, 'getParams')
html = remove_function(html, 'checkCombo')
html = remove_function(html, 'buildPrompt')

# Remove monkey patching variables for these functions
html = re.sub(r'const\s+oldGetParams\s*=\s*.*?;', '/* removed oldGetParams */', html)
html = re.sub(r'const\s+oldCheckCombo\s*=\s*.*?;', '/* removed oldCheckCombo */', html)
html = re.sub(r'const\s+oldBuildPrompt\s*=\s*.*?;', '/* removed oldBuildPrompt */', html)
html = re.sub(r'const\s+oldBuild\s*=\s*.*?;', '/* removed oldBuild */', html)
html = re.sub(r'let\s+oldBuild\s*=\s*.*?;', '/* removed oldBuild */', html)

# Read consolidated
with open('d:/GitHub/kurtulus_tek/v8_core_consolidated.js', 'r', encoding='utf-8') as f:
    consolidated = f.read()

# Insert consolidated into script
html = html.replace('<script>', '<script>\n' + consolidated + '\n')

# Now fix the oldBuild calls that were inside other functions!
# For example, in v70RiskPromptBlock there's `let s = oldBuild ? oldBuild() : '';`
# We can just change it to call buildPrompt directly!
html = html.replace('oldBuild()', 'buildPrompt()')
html = html.replace('oldBuild ? oldBuild() : \'\'', 'buildPrompt()')
html = html.replace('oldBuild ? oldBuild() : ""', 'buildPrompt()')

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Consolidation applied!')
