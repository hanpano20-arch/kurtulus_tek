import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# FIX 1: Restore K15 (Tam Isınma) logic to what it was before I broke it.
# In puanlari_hesapla:
old_k15_ph = """          let is_joker_in_last_10 = (joks && joks.slice(0, 10).includes(i));
          if (is_joker_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {"""
new_k15_ph = """          let is_in_last_10 = (df.slice(0, 10).some(draw => draw && Array.isArray(draw) && draw.includes(i))) || (joks && joks.slice(0, 10).includes(i));
          if (is_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {"""
content = content.replace(old_k15_ph, new_k15_ph)

# In extractDetailsForUI:
old_k15_ui = """        let is_joker_in_last_10 = (joks && joks.slice(0, 10).includes(n));
        let is_komsu_1 = k6 > 0;
        
        let is_joker_komsu = false;
        if (typeof joks !== 'undefined') {
            joks.slice(0, 15).forEach(j => {
                j = parseInt(j, 10);
                if (!isNaN(j) && j >= 1 && j <= maxN) {
                    const komsular = [j - 1, j + 1, j - 10, j + 10, j - 11, j - 9, j + 9, j + 11];
                    if (komsular.includes(n)) is_joker_komsu = true;
                }
            });
        }
        let k15 = 0;
        if (is_joker_in_last_10 && (is_komsu_1 || is_joker_komsu)) {"""
new_k15_ui = """        let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));
        let is_komsu_1 = k6 > 0;
        
        let is_joker_komsu = false;
        if (typeof joks !== 'undefined') {
            joks.slice(0, 15).forEach(j => {
                j = parseInt(j, 10);
                if (!isNaN(j) && j >= 1 && j <= maxN) {
                    const komsular = [j - 1, j + 1, j - 10, j + 10, j - 11, j - 9, j + 9, j + 11];
                    if (komsular.includes(n)) is_joker_komsu = true;
                }
            });
        }
        let k15 = 0;
        if (is_in_last_10 && (is_komsu_1 || is_joker_komsu)) {"""
content = content.replace(old_k15_ui, new_k15_ui)

# FIX 2: Fix decimals in extractDetailsForUI
# Find the line where currentSum is computed and insert Math.floor for all config-based variables
old_sum = """        let brainPuanlar = window.HavuzMotoru.puanlari_hesapla(df, maxN, joks);
        let realScore = brainPuanlar[n] || 0;
        let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18 + k19 + k20 + k21;
        let missingDifference = realScore - currentSum;
        historical += missingDifference; // Hide the tiny difference here so math is perfect"""

new_sum = """        // Fix decimals caused by AI Optimizer floats
        historical = Math.floor(historical);
        k2 = Math.floor(k2);
        k4 = Math.floor(k4);
        k6 = Math.floor(k6);
        k11 = Math.floor(k11);
        k12 = Math.floor(k12);
        k19 = Math.floor(k19);
        k20 = Math.floor(k20);
        k21 = Math.floor(k21);

        let brainPuanlar = window.HavuzMotoru.puanlari_hesapla(df, maxN, joks);
        let realScore = brainPuanlar[n] || 0;
        let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18 + k19 + k20 + k21;
        
        let missingDifference = Math.round(realScore - currentSum);
        historical += missingDifference; // Hide the tiny difference here so math is perfect"""

content = content.replace(old_sum, new_sum)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied.")
