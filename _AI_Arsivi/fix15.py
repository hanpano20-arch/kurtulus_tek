with open('temp_sliders_dump.html', 'r', encoding='utf-8') as f:
    dump_html = f.read()

# Extract from h-ratio-box up to hm-backtest-results (inclusive)
# This includes the sliders, buttons, and ratio box
start = dump_html.find('<div class="h-ratio-box">')
end = dump_html.find('</div>\n    </div> <!-- CLOSED NESTING BUG HERE -->')
if end == -1:
    end = dump_html.find('    </div> <!-- CLOSED NESTING BUG HERE -->')

sliders_content = dump_html[start:end]

# Read the broken v8_1 html
with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# In the broken file, the h-sliders div starts at:
start_h_sliders = html.find('<div id="h-sliders">')
end_h_sliders = html.find('<!-- SAYI LİSTESİ -->')

current_h_sliders = html[start_h_sliders:end_h_sliders]

# We need to extract the good top bar from current_h_sliders
top_bar_start = current_h_sliders.find('<div style="margin-bottom:12px;')
top_bar_end = current_h_sliders.find('<div class="h-ratio-box">')

if top_bar_start != -1 and top_bar_end != -1:
    top_bar_html = current_h_sliders[top_bar_start:top_bar_end]
else:
    print("Could not find top bar in current file")
    exit(1)

# Now assemble the new h-sliders content
new_h_sliders_html = f'<div id="h-sliders">\n        {top_bar_html}\n        {sliders_content}\n      </div>\n    </div>\n\n    '

# Replace it in the main html
new_html = html[:start_h_sliders] + new_h_sliders_html + html[end_h_sliders:]

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Restored h-sliders!")
