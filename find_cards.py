import re

v17 = open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_17 (3).html', 'r', encoding='utf-8').read()
v19 = open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v7_19 (1).html', 'r', encoding='utf-8').read()

cards17 = re.findall(r'<div[^>]*id=\"([^\"]+)\"[^>]*class=\"[^\"]*card[^\"]*\"', v17) + re.findall(r'<div[^>]*class=\"[^\"]*card[^\"]*\"[^>]*id=\"([^\"]+)\"', v17)
cards19 = re.findall(r'<div[^>]*id=\"([^\"]+)\"[^>]*class=\"[^\"]*card[^\"]*\"', v19) + re.findall(r'<div[^>]*class=\"[^\"]*card[^\"]*\"[^>]*id=\"([^\"]+)\"', v19)

s17 = set(cards17)
s19 = set(cards19)

print('Cards only in 17:', s17 - s19)
print('Cards only in 19:', s19 - s17)
