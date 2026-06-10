import re
import json
import pandas as pd

def clean_date(val):
    if pd.isna(val): return ""
    return str(val).split()[0]

def clean_nums(val):
    if pd.isna(val): return 0
    try: return int(float(val))
    except: return 0

# 1. Parse SD90
print("Parsing SD90...")
df90 = pd.read_excel('d:/GitHub/kurtulus_tek/ÇILGIN SAYISAL  tüm çekiliş sonuçları.xlsx')
df90 = df90.dropna(subset=[df90.columns[1], df90.columns[2], df90.columns[3]])
sd90_d = []
sd90_j = []
sd90_t = []
for _, row in df90.iterrows():
    nums = [clean_nums(row.iloc[1]), clean_nums(row.iloc[2]), clean_nums(row.iloc[3]), clean_nums(row.iloc[4]), clean_nums(row.iloc[5]), clean_nums(row.iloc[6])]
    nums.sort()
    sd90_d.append(nums)
    sd90_j.append(clean_nums(row.iloc[7]))
    sd90_t.append(clean_date(row.iloc[8]))

SD90_json = 'const SD90={"d":' + json.dumps(sd90_d, separators=(',', ':')) + ',"j":' + json.dumps(sd90_j, separators=(',', ':')) + ',"t":' + json.dumps(sd90_t, separators=(',', ':')) + '};'

# 2. Parse SD60
print("Parsing SD60...")
df60 = pd.read_excel('d:/GitHub/kurtulus_tek/SÜPER LOTO tüm çekiliş sonuçları.xlsx')
df60 = df60.dropna(subset=[df60.columns[1], df60.columns[2], df60.columns[3]])
sd60_d = []
sd60_t = []
for _, row in df60.iterrows():
    nums = [clean_nums(row.iloc[1]), clean_nums(row.iloc[2]), clean_nums(row.iloc[3]), clean_nums(row.iloc[4]), clean_nums(row.iloc[5]), clean_nums(row.iloc[6])]
    nums.sort()
    sd60_d.append(nums)
    sd60_t.append(clean_date(row.iloc[7]))

SD60_json = 'const SD60={"d":' + json.dumps(sd60_d, separators=(',', ':')) + ',"t":' + json.dumps(sd60_t, separators=(',', ':')) + '};'

# 3. Load v18 base
print("Loading v18 base...")
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_18 (5).html', 'r', encoding='utf-8', errors='ignore') as f:
    v18 = f.read()

# 4. Inject SD data
v18 = re.sub(r'const SD90=\{.*?\};', SD90_json, v18, flags=re.DOTALL)
v18 = re.sub(r'const SD60=\{.*?\};', SD60_json, v18, flags=re.DOTALL)

# 5. Inject Yeni Cekilis Ekle form
new_entry_form = """<div class="h-entry-row" id="h-entry-form" style="display:flex; gap:6px; margin-bottom:12px; align-items:center;">
      <input type="date" id="h-new-date" class="h-date-in" style="flex:1;">
      <input type="text" id="h-new-nums" class="h-nums-in" placeholder="6 sayı (örn: 2 24 35 74 82 89)" style="flex:2;">
      <input type="text" id="h-new-joker" class="h-joker-in" placeholder="Joker" title="Joker (sadece 6/90)" style="flex:1; max-width:60px;">
      <button class="btn primary" onclick="H.saveNew()">+ Kaydet</button>
    </div>"""

if 'id="h-entry-form"' not in v18:
    v18 = v18.replace('<div id="hc-db" style="display:block">', f'<div id="hc-db" style="display:block">\n    {new_entry_form}')

# 6. Add Pool Size selector to UI
pool_size_html = """
    <div style="margin-bottom:8px; display:flex; align-items:center; gap:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--color-accent,#53f0db);">📊 Hedef Havuz Boyutu:</span>
      <input type="number" id="h-pool-size" value="25" min="15" max="90" style="width:60px; padding:2px 6px; font-size:11px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.3); color:#fff; border-radius:4px;">
    </div>
"""

# Insert right above the <div class="h-ratio-box">
v18 = v18.replace('<div class="h-ratio-box">', f'{pool_size_html}\n    <div class="h-ratio-box">')

# 7. Modify JS to use dynamic pool size
# It was: const top25=new Set(Object.values(sc).sort((a,b)=>b.final-a.final).slice(0,25).map(x=>x.n));
v18 = re.sub(r'\.slice\(0,\s*25\)', r'.slice(0, parseInt(document.getElementById("h-pool-size") ? document.getElementById("h-pool-size").value : 25, 10))', v18)

# In case there's any other hardcoded "25" logic in H.runAll or render methods that set poolInput value:
# It was: $('poolInput').value = [...top25].join(' '); 
# It's fine since top25 is already dynamically sliced.

print("Saving v8.0...")
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(v18)

print("Done!")
