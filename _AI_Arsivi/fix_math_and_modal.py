import re

file_path = r'D:\GitHub\kurtulus_tek\v8_havuz_motoru.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the math so t_carpan and g_carpan are applied to the individual rules
new_math = """           // TARIHSEL TOPLAM
           meta_details[i].k1 = Math.floor(meta_details[i].k1 * t_carpan);
           meta_details[i].k2 = Math.floor(meta_details[i].k2 * t_carpan);
           meta_details[i].k3 = Math.floor(meta_details[i].k3 * t_carpan);
           let t_toplam = meta_details[i].k1 + meta_details[i].k2 + meta_details[i].k3;
           meta_details[i].tarihsel = t_toplam;

           // GUNCEL TOPLAM
           meta_details[i].k4 = Math.floor(meta_details[i].k4 * g_carpan);
           meta_details[i].k5 = Math.floor(meta_details[i].k5 * g_carpan);
           meta_details[i].k6 = Math.floor(meta_details[i].k6 * g_carpan);
           meta_details[i].k7 = Math.floor(meta_details[i].k7 * g_carpan);
           meta_details[i].k8 = Math.floor(meta_details[i].k8 * g_carpan);
           meta_details[i].k9 = Math.floor(meta_details[i].k9 * g_carpan);
           meta_details[i].k10 = Math.floor(meta_details[i].k10 * g_carpan);
           meta_details[i].k11 = Math.floor(meta_details[i].k11 * g_carpan);
           meta_details[i].k12 = Math.floor(meta_details[i].k12 * g_carpan);
           let g_toplam = meta_details[i].k4 + meta_details[i].k5 + meta_details[i].k6 + meta_details[i].k7 + 
                          meta_details[i].k8 + meta_details[i].k9 + meta_details[i].k10 + meta_details[i].k11 + meta_details[i].k12;
           meta_details[i].guncel = g_toplam;

           // CEZALAR TOPLAM"""

text = re.sub(
    r'// TARIHSEL TOPLAM.*?// CEZALAR TOPLAM',
    new_math,
    text,
    flags=re.DOTALL
)

# 2. Fix the alert after akilli_secim finishes so it ALSO closes the modal
new_alert = """        let m = document.getElementById('pa-modal');
        if (m) m.style.display = 'none';
        let b = document.getElementById('pa-overlay');
        if (b) b.style.display = 'none';
        setTimeout(() => alert(`Akıllı Motor hesaplamayı tamamladı.\\nSeçilen ${size} sayı Havuza Eklendi. Puanları ana tablodan inceleyebilirsiniz.`), 100);"""

text = re.sub(
    r'setTimeout\(\(\) => alert\(`Akıllı Motor hesaplamayı.*?100\);',
    new_alert,
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("v8_havuz_motoru.js math and modal fix applied!")
