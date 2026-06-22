import re

with open('temp_motoru.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. ADD base_config and mult_config just before config: {
config_pattern = re.compile(r'(\s*)(config\s*:\s*\{)')
base_and_mult_config = r'''\1base_config: {
        PUAN_1_HALKA_KOMSU: 5,
        PUAN_2_HALKA_KOMSU: 3,
        CARPAN_KURAKLIK: 2,
        CARPAN_JOKER: 3,
        PUAN_ONLUK_KURAKLIK_BONUSU: 8,
        PUAN_KINETIK_IVME_BONUSU: 6,
        PUAN_GECIKMELI_TEKRAR: 7,
        CEZA_OLU_SAYI_4: -5,
        CEZA_CIFTE_TEKRAR: -10,
        CEZA_DOYGUN_4: -8,
        CEZA_DOYGUN_8: -15,
        CEZA_DOYGUN_12: -20,
        CEZA_DOYGUN_16: -30,
        CEZA_IZOLASYON: -4
      },
      mult_config: {
        PUAN_1_HALKA_KOMSU: 1.0,
        PUAN_2_HALKA_KOMSU: 1.0,
        CARPAN_KURAKLIK: 1.0,
        CARPAN_JOKER: 1.0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 1.0,
        PUAN_KINETIK_IVME_BONUSU: 1.0,
        PUAN_GECIKMELI_TEKRAR: 1.0,
        CEZA_OLU_SAYI_4: 1.0,
        CEZA_CIFTE_TEKRAR: 1.0,
        CEZA_DOYGUN_4: 1.0,
        CEZA_DOYGUN_8: 1.0,
        CEZA_DOYGUN_12: 1.0,
        CEZA_DOYGUN_16: 1.0,
        CEZA_IZOLASYON: 1.0
      },
\1\2'''

if 'base_config:' not in js_code:
    js_code = config_pattern.sub(base_and_mult_config, js_code, count=1)


# 2. UPDATE updateConfigFromUI to just load from localStorage
def replace_block(text, start_str, new_code):
    start = text.find(start_str)
    if start == -1: return text
    bracket = 0
    in_obj = False
    end = -1
    for i in range(start, len(text)):
        if text[i] == '{':
            bracket += 1
            in_obj = True
        elif text[i] == '}':
            bracket -= 1
            if in_obj and bracket == 0:
                end = i
                break
    if end != -1:
        return text[:start] + new_code + text[end + 1:]
    return text

new_update_config = '''updateConfigFromUI: function () {
        try {
            const pa = localStorage.getItem('hm_puan_ayarlari');
            if (pa) {
                const parsed = JSON.parse(pa);
                for (let k in parsed) {
                    if (this.config[k] !== undefined) this.config[k] = parsed[k];
                    if (this.base_config[k] !== undefined) this.base_config[k] = parsed[k];
                    if (this.mult_config[k] !== undefined) this.mult_config[k] = parsed[k];
                }
            }
        } catch(e) {}
      }'''

js_code = replace_block(js_code, 'updateConfigFromUI: function', new_update_config)

# 3. Patch the Uygula button in HTML
with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Uygula button onclick
old_uygula = "window.HavuzMotoru.init(true); window.HavuzMotoru.reset();"
new_uygula = "H.runAll();"
html = html.replace(old_uygula, new_uygula)

# 4. REPLACE the whole window.HavuzMotoru
motoru_start = html.find('window.HavuzMotoru = {')
bracket = 0
in_obj = False
end = -1
for i in range(motoru_start, len(html)):
    if html[i] == '{':
        bracket += 1
        in_obj = True
    elif html[i] == '}':
        bracket -= 1
        if in_obj and bracket == 0:
            end = i
            break

if end != -1:
    html = html[:motoru_start] + js_code + html[end + 1:]

# 5. Patch puanlari_hesapla to use base_config * mult_config
def replace_in_puanlari(old_str, new_str):
    global html
    html = html.replace(old_str, new_str)

replace_in_puanlari(
    "let rawScore = (komsuSayaci_1[n] || 0) * this.config.PUAN_1_HALKA_KOMSU",
    "let rawScore = (komsuSayaci_1[n] || 0) * (this.base_config.PUAN_1_HALKA_KOMSU * this.mult_config.PUAN_1_HALKA_KOMSU)"
)
replace_in_puanlari(
    "+ (komsuSayaci_2[n] || 0) * this.config.PUAN_2_HALKA_KOMSU",
    "+ (komsuSayaci_2[n] || 0) * (this.base_config.PUAN_2_HALKA_KOMSU * this.mult_config.PUAN_2_HALKA_KOMSU)"
)
replace_in_puanlari(
    "+ (jokerKomsuSayaci[n] || 0) * this.config.CARPAN_JOKER",
    "+ (jokerKomsuSayaci[n] || 0) * (this.base_config.CARPAN_JOKER * this.mult_config.CARPAN_JOKER)"
)
replace_in_puanlari(
    "+ (onlukBlockCount[Math.floor((n - 1) / 10)] > 3 ? this.config.PUAN_ONLUK_KURAKLIK_BONUSU : 0)",
    "+ (onlukBlockCount[Math.floor((n - 1) / 10)] > 3 ? (this.base_config.PUAN_ONLUK_KURAKLIK_BONUSU * this.mult_config.PUAN_ONLUK_KURAKLIK_BONUSU) : 0)"
)
replace_in_puanlari(
    "+ (guncel_cikis_hizi[n] > tarihsel_cikis_hizi[n] * 1.5 ? this.config.PUAN_KINETIK_IVME_BONUSU : 0)",
    "+ (guncel_cikis_hizi[n] > tarihsel_cikis_hizi[n] * 1.5 ? (this.base_config.PUAN_KINETIK_IVME_BONUSU * this.mult_config.PUAN_KINETIK_IVME_BONUSU) : 0)"
)
replace_in_puanlari(
    "+ (bekleme_suresi[n] > 10 && bekleme_suresi[n] < 20 ? this.config.PUAN_GECIKMELI_TEKRAR : 0)",
    "+ (bekleme_suresi[n] > 10 && bekleme_suresi[n] < 20 ? (this.base_config.PUAN_GECIKMELI_TEKRAR * this.mult_config.PUAN_GECIKMELI_TEKRAR) : 0)"
)

# And the penalties which are inside the loops
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_OLU_SAYI_4;",
    "puanlar[n] += (this.base_config.CEZA_OLU_SAYI_4 * this.mult_config.CEZA_OLU_SAYI_4);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_CIFTE_TEKRAR;",
    "puanlar[n] += (this.base_config.CEZA_CIFTE_TEKRAR * this.mult_config.CEZA_CIFTE_TEKRAR);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_DOYGUN_4;",
    "puanlar[n] += (this.base_config.CEZA_DOYGUN_4 * this.mult_config.CEZA_DOYGUN_4);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_DOYGUN_8;",
    "puanlar[n] += (this.base_config.CEZA_DOYGUN_8 * this.mult_config.CEZA_DOYGUN_8);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_DOYGUN_12;",
    "puanlar[n] += (this.base_config.CEZA_DOYGUN_12 * this.mult_config.CEZA_DOYGUN_12);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_DOYGUN_16;",
    "puanlar[n] += (this.base_config.CEZA_DOYGUN_16 * this.mult_config.CEZA_DOYGUN_16);"
)
replace_in_puanlari(
    "puanlar[n] += this.config.CEZA_IZOLASYON;",
    "puanlar[n] += (this.base_config.CEZA_IZOLASYON * this.mult_config.CEZA_IZOLASYON);"
)


with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Fix13 applied")
