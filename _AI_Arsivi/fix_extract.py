import sys

def fix_extractDetailsForUI(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Define son_3_hafta_sayilari in extractDetailsForUI
    target_block = "        // MATRİS KURALLARI (K19, K20, K21)"
    if target_block in content:
        definition_code = """
        let son_3_hafta_sayilari = new Set();
        son_3_donem.forEach(draw => {
            if (draw && Array.isArray(draw)) draw.forEach(num => son_3_hafta_sayilari.add(num));
        });
        """
        # To avoid adding it twice
        if "let son_3_hafta_sayilari = new Set();" not in content[content.find("extractDetailsForUI"):content.find(target_block)]:
            content = content.replace(target_block, definition_code + "\n" + target_block)

    # 2. Return k19, k20, k21
    old_return = """          k18,
          doygunlukLabel
        };"""
    new_return = """          k18,
          k19,
          k20,
          k21,
          doygunlukLabel
        };"""
    if old_return in content:
        content = content.replace(old_return, new_return)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_extractDetailsForUI('PROMPT_BUILDER_v8_0.html')
print("extractDetailsForUI bug fixed.")
