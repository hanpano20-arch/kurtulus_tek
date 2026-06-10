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

# Extract injected cards from v19 JS
def extract_inner_html(marker):
    m = re.search(r'card\.id=\'' + marker + r'\';\s*card\.innerHTML=`(.*?)`;', v19, re.DOTALL)
    if m: return m.group(1)
    
    m2 = re.search(r'card\.className=\'card\';\s*card\.id=\'' + marker + r'\';\s*card\.innerHTML=`(.*?)`;', v19, re.DOTALL)
    if m2: return m2.group(1)
    
    return ""

draw_map_html = re.search(r'card\.innerHTML=`(.*?)`;\s*poolCard\.parentNode\.insertBefore', v19, re.DOTALL).group(1)
general_card_html = extract_inner_html('v74-general-card')
control_card_html = extract_inner_html('v73-control-card')
band_card_html = extract_inner_html('v73-band-card')
start_end_card_html = extract_inner_html('v712-start-end-card')
final_selection_card_html = extract_inner_html('v76-final-selection-card')
mode_card_html = extract_inner_html('v72-mode-card')

# Extract v719 pool card (hardcoded in v19)
m = re.search(r'(<div class="card" id="v719-pool-card">.*?</div>)\s*<!-- KURAL TEST PANELİ', v19, re.DOTALL)
if m:
    v719_pool_card_html = m.group(1)
else:
    v719_pool_card_html = "<!-- v719 pool card not found -->"

# Base body from v17
body = re.search(r'(<div class="app">.*?</div>\s*)<script>', v17, re.DOTALL).group(1)

# Now, we insert the pieces into the v17 body sequentially.

# 1. Mode Card after quick-guide
mode_card = f'<div class="card" id="v72-mode-card">{mode_card_html}</div>'
body = body.replace('</div>\n  <div class="persist-panel">', f'</div>\n  {mode_card}\n  <div class="persist-panel">')

# 2. Draw Map & v719 Pool Card before Pool Input (which contains "Sayı Havuzu")
draw_map_card = f'<div class="card" id="draw-map-card">{draw_map_html}</div>'
body = re.sub(r'(<div class="card">\s*<div class="card-head">\s*<div class="step-dot">1</div>\s*<span class="card-title">Sayı Havuzu)', f'{draw_map_card}\n  {v719_pool_card_html}\n  \\1', body)

# 3. General Card after Basic Parameters
general_card = f'<div class="card" id="v74-general-card">{general_card_html}</div>'
body = re.sub(r'(<span class="card-title">Temel parametreler</span>.*?</div>\s*</div>)', f'\\1\n  {general_card}', body, flags=re.DOTALL)

# 4. Diagonal card replaces Aritmetik
diag_html = """<div class="card-head"><div class="step-dot">5</div><span class="card-title">Çapraz zincir kuralı</span><span class="card-note">9x10 kupon geometrisi</span></div>
<div class="section-note purple">Bu bölüm genel +9/+11 farkını değil, 9x10 loto kuponundaki gerçek çapraz zincirleri kontrol eder. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz sayılmaz.</div>
<div class="row"><div class="row-lbl">+9 çapraz zincir<div class="row-sub">Örnek: 15-24-33-42-51</div></div><select class="num-in" id="p-diag9-min" style="width:190px"><option value="0">Kapalı</option><option value="2" selected>2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>
<div class="row"><div class="row-lbl">+11 çapraz zincir<div class="row-sub">Örnek: 14-25-36-47-58</div></div><select class="num-in" id="p-diag11-min" style="width:190px"><option value="0">Kapalı</option><option value="2" selected>2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>"""
body = re.sub(r'<div class="card">\s*<div class="card-head">\s*<div class="step-dot">5</div>\s*<span class="card-title">Aritmetik.*?</label>\s*</div>\s*</div>\s*</div>\s*</div>', f'<div class="card" id="v68-diag-card">{diag_html}</div>', body, flags=re.DOTALL)

# 5. Start-End Card before Jaccard
start_end_card = f'<div class="card" id="v712-start-end-card">{start_end_card_html}</div>'
body = re.sub(r'(<div class="card" id="jaccard-report-card">)', f'{start_end_card}\n  \\1', body)

# 6. Band Card after Jaccard
band_card = f'<div class="card" id="v73-band-card">{band_card_html}</div>'
body = re.sub(r'(<div class="card" id="jaccard-report-card">.*?</div>\s*</div>)', f'\\1\n  {band_card}', body, flags=re.DOTALL)

# 7. Final Selection Card after Band Card
final_selection_card = f'<div class="card" id="v76-final-selection-card">{final_selection_card_html}</div>'
body = body.replace(f'{band_card}', f'{band_card}\n  {final_selection_card}')

# 8. Control Card after Score Panel
control_card = f'<div class="card" id="v73-control-card">{control_card_html}</div>'
body = re.sub(r'(<div class="score-panel">.*?</div>)', f'\\1\n  {control_card}', body, flags=re.DOTALL)

# Modify the Export Size input (p-cols) to include +/- buttons
pool_size_ctrl = """<div class="pool-size-ctrl">
  <button type="button" onclick="adjustCols(-5)">−5</button>
  <button type="button" onclick="adjustCols(-1)">−1</button>
  <input class="num-in" id="p-cols" value="60" style="text-align:center;">
  <button type="button" onclick="adjustCols(+1)">+1</button>
  <button type="button" onclick="adjustCols(+5)">+5</button>
</div>"""
body = re.sub(r'<input class="num-in" id="p-cols" value="60" style="width:70px;text-align:center;">', pool_size_ctrl, body)

# Save the assembled HTML body
write_file('d:/GitHub/kurtulus_tek/v8_body.html', body)
print("v8_body.html generated successfully")
