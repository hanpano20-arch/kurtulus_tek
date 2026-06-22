import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the string concatenation bug in puanlari_hesapla
old_joker_komsu = """        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi && joker_sayisi >= 1 && joker_sayisi <= maxN) {"""

new_joker_komsu = """        son_15_joks.forEach((joker_sayisi, index) => {
          joker_sayisi = parseInt(joker_sayisi, 10);
          if (joker_sayisi && !isNaN(joker_sayisi) && joker_sayisi >= 1 && joker_sayisi <= maxN) {"""

content = content.replace(old_joker_komsu, new_joker_komsu)

# And make sure k15, k16, k17, k18 limits in puanlari_hesapla are also 75, -250, 60, 75
old_puan_k15 = "puanlar[i] += 150; // Isınmış Joker/Komşu Uyanışı"
new_puan_k15 = "puanlar[i] += 75; // Isınmış Joker/Komşu Uyanışı"
content = content.replace(old_puan_k15, new_puan_k15)
content = content.replace("puanlar[i] += 120; // 19 haftadır", "puanlar[i] += 60; // 19 haftadır")
content = content.replace("puanlar[i] += 150; // Patlamaya hazır", "puanlar[i] += 75; // Patlamaya hazır")

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed puanlari_hesapla string concatenation and limits!")
