import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix K15 logic in puanlari_hesapla
old_k15_calc = """          // 🔥 YENİ: KOMBİNE ISINMA (TAM ISINMA) BONUSU 🔥
          let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(i));
          if (is_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {"""

new_k15_calc = """          // 🔥 YENİ: KOMBİNE ISINMA (TAM ISINMA) BONUSU 🔥
          let is_joker_in_last_10 = (joks && joks.slice(0, 10).includes(i));
          if (is_joker_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {"""

content = content.replace(old_k15_calc, new_k15_calc)

# Fix K15 logic in extractDetailsForUI
old_k15_ui = """        // K15- Tam Isınma (Sinerji)
        let k15 = 0;
        let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));"""

new_k15_ui = """        // K15- Tam Isınma (Sinerji)
        let k15 = 0;
        let is_joker_in_last_10 = (joks && joks.slice(0, 10).includes(n));"""

old_k15_ui_cond = """        if (is_in_last_10 && (is_komsu_1 || is_joker_komsu)) {
            k15 = 75;
        }"""

new_k15_ui_cond = """        if (is_joker_in_last_10 && (is_komsu_1 || is_joker_komsu)) {
            k15 = 75;
        }"""

content = content.replace(old_k15_ui, new_k15_ui)
content = content.replace(old_k15_ui_cond, new_k15_ui_cond)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed K15 logic")
