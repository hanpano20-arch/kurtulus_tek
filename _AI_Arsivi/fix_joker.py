import sys

def fix_joker(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = "if (k6 > 0 || is_joker_komsu) isinmis_sayilar.add(n);"
    if target in content:
        definition = """
        let is_joker_komsu = false;
        if (joks && joks.length > 0 && joks[0] >= 1 && joks[0] <= maxN) {
            let js = joks[0];
            if (n === js - 1 || n === js + 1 || n === js - 10 || n === js + 10) {
                is_joker_komsu = true;
            }
        }
        """
        # Inject right above target
        content = content.replace(target, definition + target)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_joker('PROMPT_BUILDER_v8_0.html')
print("joker fixed")
