import re

file_path = r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix double oninput in all range inputs
def fix_oninput(match):
    tag = match.group(0)
    sync_match = re.search(r'oninput="(H\.sliderSync\([^)]+\))"', tag)
    if sync_match:
        sync_code = sync_match.group(1)
        tag = tag.replace(' ' + sync_match.group(0), "")
        tag = tag.replace('oninput="window.updateTip(this)"', f'oninput="window.updateTip(this); {sync_code}"')
    return tag

html = re.sub(r'<input\s+[^>]*type="range"[^>]*>', fix_oninput, html)

# Fix penalty sliders to be negative
penalty_sliders = [
    ('ws-hm_izolasyon', -200, 0, -100),
    ('ws-hm_olu', -200, 0, -100),
    ('ws-hm_cifte', -500, 0, -50),
    ('ws-hm_c4', -500, 0, -20),
    ('ws-hm_c8', -500, 0, -15),
    ('ws-hm_c12', -500, 0, -10),
    ('ws-hm_c16', -500, 0, -5)
]

for slider_id, s_min, s_max, s_val in penalty_sliders:
    # Find the input tag for this slider
    pattern = rf'(<input[^>]*id="{slider_id}"[^>]*min=")[^"]+("[^>]*max=")[^"]+("[^>]*value=")[^"]+("[^>]*>)'
    
    def replace_penalty(m):
        return f'{m.group(1)}{s_min}{m.group(2)}{s_max}{m.group(3)}{s_val}{m.group(4)}'
    
    html = re.sub(pattern, replace_penalty, html)

# Fix max/min for bonuses according to new mult_config defaults
bonus_sliders = [
    ('ws-hm_komsu', 0, 50, 5),
    ('ws-hm_komsu2', 0, 20, 2),
    ('ws-hm_kurak', 0, 20, 1),
    ('ws-hm_onluk', 0, 50, 10),
    ('ws-hm_ivme', 0, 100, 25),
    ('ws-hm_gecik', 0, 50, 15),
    ('ws-hm_joker', 0, 20, 2.0),
    ('ws-hm_kurak_sinir', 10, 100, 40)
]

for slider_id, s_min, s_max, s_val in bonus_sliders:
    pattern = rf'(<input[^>]*id="{slider_id}"[^>]*min=")[^"]+("[^>]*max=")[^"]+("[^>]*value=")[^"]+("[^>]*>)'
    
    def replace_bonus(m):
        return f'{m.group(1)}{s_min}{m.group(2)}{s_max}{m.group(3)}{s_val}{m.group(4)}'
    
    html = re.sub(pattern, replace_bonus, html)

# Save
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("PROMPT_BUILDER_v8_1.html sliders fully patched.")
