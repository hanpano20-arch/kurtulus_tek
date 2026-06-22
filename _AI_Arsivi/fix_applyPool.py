import os

filepath = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_str = "_sc[n] = { n: n, final: puanlar[n] || 0 };"
new_str = "_sc[n] = { n: n, final: puanlar[n] ? puanlar[n].total : 0, hm_details: puanlar[n] ? puanlar[n].details : {}, hm_ceza: puanlar[n] ? puanlar[n].ceza : 0 };"

content = content.replace(old_str, new_str)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("FIXED")
