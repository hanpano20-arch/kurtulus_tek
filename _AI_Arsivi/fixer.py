import re
with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. k15, k17, k18 limits in extractDetailsForUI and puanlari_hesapla
# extractDetailsForUI:
content = content.replace('k15 = 150;', 'k15 = 75;')
content = content.replace('k17 = 120;', 'k17 = 60;')
content = content.replace('k18 = 150;', 'k18 = 75;')
content = content.replace('k15 = 75;', 'k15 = 75;') # just in case
content = content.replace('k17 = 60;', 'k17 = 60;')
content = content.replace('k18 = 75;', 'k18 = 75;')

# 2. 40 number getting K16 penalty because 30 was a joker 3 draws ago
# The K16 (izolasyon) rule:
# If not isolated, k16 = 0.
# The user wants to FIX 40 getting K16 penalty.
# Let's read K16 rule.
