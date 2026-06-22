import sys

def fix_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    old_pos = ".score-pos { color: #39d353 !important; font-weight: bold !important; font-size: 18px !important; }"
    new_pos = ".score-pos { color: #50fa7b !important; font-weight: 900 !important; font-size: 20px !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(80,250,123,0.3) !important; }"
    
    old_neg = ".score-neg { color: #ff4444 !important; font-weight: bold !important; font-size: 18px !important; }"
    new_neg = ".score-neg { color: #ff5555 !important; font-weight: 900 !important; font-size: 20px !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(255,85,85,0.3) !important; }"

    old_zero = ".score-zero { color: #8b949e !important; font-size: 18px !important; }"
    new_zero = ".score-zero { color: #a9b2bc !important; font-size: 19px !important; font-weight: bold !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important; }"

    content = content.replace(old_pos, new_pos)
    content = content.replace(old_neg, new_neg)
    content = content.replace(old_zero, new_zero)

    # Make the Akilli Motor output more readable too
    # If there are specific CSS for #prompt-output
    if "#prompt-output {" in content:
        content = content.replace("font-size: 14px;", "font-size: 16px; font-weight: 500;")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_css('PROMPT_BUILDER_v8_0.html')
print("CSS updated for readability.")
