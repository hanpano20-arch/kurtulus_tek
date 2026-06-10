import pandas as pd
import json
import re

# Read Excel
df60 = pd.read_excel('d:/GitHub/kurtulus_tek/SÜPER LOTO tüm çekiliş sonuçları.xlsx')
df90 = pd.read_excel('d:/GitHub/kurtulus_tek/ÇILGIN SAYISAL  tüm çekiliş sonuçları.xlsx')

# Parse 60
d60 = []
t60 = []
cols60 = [c for c in df60.columns if 'say' in c.lower() or 'sayı' in c.lower() or 'say' in c.lower()]
date_col60 = [c for c in df60.columns if 'tarih' in c.lower()][0]

for _, row in df60.iterrows():
    nums = [int(row[c]) for c in cols60[:6] if pd.notna(row[c])]
    if len(nums) == 6:
        d60.append(nums)
        # Format date as YYYY-MM-DD
        dt = row[date_col60]
        if pd.isna(dt):
            t60.append("")
        elif isinstance(dt, pd.Timestamp) or hasattr(dt, 'strftime'):
            t60.append(dt.strftime('%Y-%m-%d'))
        else:
            t60.append(str(dt).split()[0])

# Parse 90
d90 = []
t90 = []
j90 = []
cols90 = [c for c in df90.columns if 'say' in c.lower() or 'sayı' in c.lower() or 'say' in c.lower()]
date_col90 = [c for c in df90.columns if 'tarih' in c.lower()][0]
joker_col90 = [c for c in df90.columns if 'joker' in c.lower()][0]

for _, row in df90.iterrows():
    nums = [int(row[c]) for c in cols90[:6] if pd.notna(row[c])]
    if len(nums) == 6:
        # Sanity check for 96
        nums = [90 if x == 96 else x for x in nums]
        d90.append(nums)
        
        j_val = row[joker_col90]
        j90.append(int(j_val) if pd.notna(j_val) else None)
        
        dt = row[date_col90]
        if pd.isna(dt):
            t90.append("")
        elif isinstance(dt, pd.Timestamp) or hasattr(dt, 'strftime'):
            t90.append(dt.strftime('%Y-%m-%d'))
        else:
            t90.append(str(dt).split()[0])

sd_obj = {
    "90": {
        "d": d90,
        "j": j90,
        "t": t90
    },
    "60": {
        "d": d60,
        "t": t60
    }
}

new_sd_str = "const SD=" + json.dumps(sd_obj, separators=(',', ':')) + ";"

# Inject into v8_0
with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find where const SD is
html = re.sub(r'const SD=\{.*?\};', new_sd_str, html, flags=re.DOTALL)

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"SD updated! 60: {len(d60)} draws. 90: {len(d90)} draws.")
