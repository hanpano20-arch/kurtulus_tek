import sys

def fix_joks_bug(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Line 10810: H.renderScore
    old_10810 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), maxN);"
    new_10810 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), maxN, db.entries.map(e => e.joker));"
    content = content.replace(old_10810, new_10810)

    # 2. Line 10858: recalculate (maybe in filter or something)
    old_10858 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), mx()); _sc = {}; _ephemeral_ms = {}; for (let i = 1; i <= mx(); i++) _sc[i] = { n: i, final: hm_sc[i] ? hm_sc[i] : 0, hm_details: {} };"
    new_10858 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), mx(), db.entries.map(e => e.joker)); _sc = {}; _ephemeral_ms = {}; for (let i = 1; i <= mx(); i++) _sc[i] = { n: i, final: hm_sc[i] ? hm_sc[i] : 0, hm_details: {} };"
    content = content.replace(old_10858, new_10858)

    # 3. Line 11302: selGrp
    old_11302 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), mx()); _sc = {}; _ephemeral_ms = {}; for (let i = 1; i <= mx(); i++) _sc[i] = { n: i, final: hm_sc[i] !== undefined ? hm_sc[i] : 0, hm_details: {} };"
    new_11302 = "window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla(db.entries.map(e => e.nums), mx(), db.entries.map(e => e.joker)); _sc = {}; _ephemeral_ms = {}; for (let i = 1; i <= mx(); i++) _sc[i] = { n: i, final: hm_sc[i] !== undefined ? hm_sc[i] : 0, hm_details: {} };"
    content = content.replace(old_11302, new_11302)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_joks_bug('PROMPT_BUILDER_v8_0.html')
print("Joks bug fixed.")
