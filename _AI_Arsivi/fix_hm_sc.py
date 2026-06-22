import os

filepath = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_str = "_sc[i] = { n: i, final: hm_sc[i] || 0 };"
new_str = "_sc[i] = { n: i, final: hm_sc[i] ? hm_sc[i].total : 0, hm_details: hm_sc[i] ? hm_sc[i].details : {} };"

content = content.replace(old_str, new_str)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("FIXED")
