import sys

with open(r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix mapping in uiMapping definition
text = text.replace("'PUAN_1_HALKA_KOMSU':'hm_komsu'", "'K5_PUAN':'hm_komsu'")
text = text.replace("'PUAN_2_HALKA_KOMSU':'hm_komsu2'", "'K6_PUAN':'hm_komsu2'")

# Fix manual config updates
text = text.replace("this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu');", "if(this.config) this.config.K5_PUAN = val('hm_komsu');\n        if(this.mult_config) this.mult_config.K5_PUAN = val('hm_komsu');")
text = text.replace("this.config.PUAN_2_HALKA_KOMSU = val('hm_komsu2');", "if(this.config) this.config.K6_PUAN = val('hm_komsu2');\n        if(this.mult_config) this.mult_config.K6_PUAN = val('hm_komsu2');")

with open(r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed PROMPT_BUILDER_v8_1.html')
