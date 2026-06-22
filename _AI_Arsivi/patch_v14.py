import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = """        let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));
        let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[n] || 0) : 0) > 0;
        let is_joker_komsu = (typeof jokerKomsuSayaci !== 'undefined' ? (jokerKomsuSayaci[n] || 0) : 0) > 0;"""

    replacement = """        let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));
        let is_komsu_1 = (typeof uygulananKomsular !== 'undefined') ? uygulananKomsular.has(n) : false;
        
        let is_joker_komsu = false;
        if (typeof joks !== 'undefined') {
            joks.slice(0, 15).forEach(j => {
                if (j >= 1 && j <= maxN) {
                    const komsular = [j - 1, j + 1, j - 10, j + 10, j - 11, j - 9, j + 9, j + 11];
                    if (komsular.includes(n)) is_joker_komsu = true;
                }
            });
        }"""

    if target in content:
        content = content.replace(target, replacement)
        print("Patched UI logic")
    else:
        print("FAILED to patch UI logic")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
