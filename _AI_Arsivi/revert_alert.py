import re

file_path = r'D:\GitHub\kurtulus_tek\v8_havuz_motoru.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Revert the modal close because user needs to interact with Zaman Makinesi layout
new_alert = """        setTimeout(() => alert(`Akıllı Motor hesaplamayı tamamladı.\\nSayı Listesi\\'nde önerilen ${size} sayı seçili durumdadır. Seçimleri dilediğiniz gibi değiştirip "Havuza Ekle" diyebilirsiniz.`), 100);"""

text = re.sub(
    r'let m = document\.getElementById.*?setTimeout\(\(\) => alert\(`Akıllı Motor.*?100\);',
    new_alert,
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("v8_havuz_motoru.js alert reverted!")
