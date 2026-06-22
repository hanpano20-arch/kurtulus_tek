import sys

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: K15, K17, K18 limits to 50%
content = content.replace('k15 = 150;', 'k15 = 75;')
content = content.replace('k17 = 120;', 'k17 = 60;')
content = content.replace('k18 = 150;', 'k18 = 75;')

# Fix 2: 40 number getting K16 penalty because 30 was a joker 3 draws ago
# The bug is j + 1 string concatenation instead of int addition.
# In PROMPT_BUILDER_v8_0.html, find `joks.slice(0, 15).forEach(j => {` and `if (j >= 1 && j <= maxN) {`
# We need to replace it.
old_k16_logic = """        let is_joker_komsu = false;
        if (typeof joks !== 'undefined') {
            joks.slice(0, 15).forEach(j => {
                if (j >= 1 && j <= maxN) {
                    const komsular = [j - 1, j + 1, j - 10, j + 10, j - 11, j - 9, j + 9, j + 11];
                    if (komsular.includes(n)) is_joker_komsu = true;
                }
            });
        }"""
new_k16_logic = """        let is_joker_komsu = false;
        if (typeof joks !== 'undefined') {
            joks.slice(0, 15).forEach(j => {
                j = parseInt(j, 10);
                if (!isNaN(j) && j >= 1 && j <= maxN) {
                    const komsular = [j - 1, j + 1, j - 10, j + 10, j - 11, j - 9, j + 9, j + 11];
                    if (komsular.includes(n)) is_joker_komsu = true;
                }
            });
        }"""
content = content.replace(old_k16_logic, new_k16_logic)


# Fix 3: 41 getting K2 points. The K2 logic is:
# let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(i));
# in puanlari_hesapla. AND inside extractDetailsForUI:
# let in_son_10 = son_10_donem.some(draw => draw && Array.isArray(draw) && draw.includes(n));
# However, if 41 gets K2 points, it means in_son_10 is true.
# BUT why would it be true?
# Is there a bug where `includes(n)` matches incorrectly? No, it's exact match.
# Wait! In extractDetailsForUI, could there be a K2 logic flaw?
# Let's check `k2 = Math.floor(raw_k2 * scale_rec);`
# `if (in_son_10) k2 += (config.PUAN_SON_10_TABAN || 50.0);`
# What if K2-Son 10 actually means K2 AND K1 is something else?
# Let's see how extractDetailsForUI computes f10:
# `let f10 = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(n) ? 1 : 0), 0);`
# This is fully correct!

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fixes successfully.")
