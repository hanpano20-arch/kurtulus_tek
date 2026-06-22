import re

c = open('d:/GitHub/kurtulus_tek/v8_core.js', 'r', encoding='utf-8').read()

# List of functions that are redefined
functions = [
    'getParams',
    'checkCombo',
    'getRuleWarnings',
    'jaccardFeasibilityCheck',
    'renderJaccardReport',
    'buildPrompt',
    'buildAndSend',
    'copyPrompt',
    'checkComboDetailed'
]

for fn in functions:
    # Find all occurrences of "function fn(" or "function fn ("
    pattern = r'function\s+' + fn + r'\s*\([^)]*\)\s*\{'
    matches = list(re.finditer(pattern, c))
    if len(matches) > 1:
        print(f"Cleaning {fn}: found {len(matches)} definitions.")
        # We want to keep ONLY the LAST definition.
        # But wait, each definition has a body. We need a bracket matcher.
        def get_body_end(text, start_idx):
            stack = 0
            in_string = False
            str_char = ''
            for i in range(start_idx, len(text)):
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
                            return i + 1
                else:
                    if char == '\\':
                        continue # skip escaped
                    if char == str_char:
                        in_string = False
            return -1

        # We will keep the last match, and remove all previous ones
        # We do this from end to start to not mess up indices
        for m in reversed(matches[:-1]):
            start = m.start()
            # find first '{'
            bracket_start = c.find('{', start)
            end = get_body_end(c, bracket_start)
            if end != -1:
                # Remove this function definition
                c = c[:start] + f"/* REMOVED OLD {fn} */" + c[end:]

# Now remove the monkey patching variable assignments
c = re.sub(r'const\s+old[A-Z]\w+\s*=\s*\w+;', '', c)
c = re.sub(r'let\s+old[A-Z]\w+\s*=\s*\w+;', '', c)

with open('d:/GitHub/kurtulus_tek/v8_core_cleaned.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("Cleaned JS saved to v8_core_cleaned.js")
