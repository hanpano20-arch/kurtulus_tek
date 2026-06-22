import sys

def fix_chip_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # In H.renderList chips() function:
    # <small style="font-size:9px;line-height:1;opacity:0.8;">
    old_small = "<small style=\"font-size:9px;line-height:1;opacity:0.8;\">"
    new_small = "<small style=\"font-size:11px;font-weight:bold;line-height:1;opacity:1;\">"
    
    if old_small in content:
        content = content.replace(old_small, new_small)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_chip_css('PROMPT_BUILDER_v8_0.html')
print("Chip readability fixed.")
