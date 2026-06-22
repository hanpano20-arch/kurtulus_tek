import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the rules array to export window.dstRules
    if "window.dstRules = rules;" not in content:
        content = content.replace("];\n\n        let html = '<div class=\"dst-container\"", "];\n        window.dstRules = rules;\n\n        let html = '<div class=\"dst-container\"")
        
    # 2. Update the `forEach` loop that generates the `<th>`
    target_foreach = """        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });"""
        
    replacement_foreach = """        rules.forEach(r => {
          html += '<th class="dst-tooltip-btn" onclick="H.showTooltip(event, \\'' + r.id + '\\')">' + r.name + '</th>';
        });"""
        
    if target_foreach in content:
        content = content.replace(target_foreach, replacement_foreach)
        print("Patched TH generation loop.")
    else:
        # Maybe it has different spacing or quotes
        # Let's use regex
        pattern_foreach = re.compile(r"rules\.forEach\(r => \{\s*let tt = .*?;\s*html \+= '<th.*?<\/th>';\s*\}\);", re.DOTALL)
        if pattern_foreach.search(content):
            content = pattern_foreach.sub(replacement_foreach, content)
            print("Patched TH generation loop via regex.")
        else:
            print("Could not find TH generation loop.")

    # 3. Update H.showTooltip function signature and logic
    # We will search for H.showTooltip = function (e, title, desc)
    target_tooltip = """H.showTooltip = function (e, title, desc) {"""
    replacement_tooltip = """H.showTooltip = function (e, ruleId) {
        let rule = (window.dstRules || []).find(r => r.id === ruleId);
        if (!rule) return;
        let title = rule.name;
        let desc = rule.desc;"""
        
    if target_tooltip in content:
        content = content.replace(target_tooltip, replacement_tooltip)
        print("Patched H.showTooltip logic.")
    else:
        print("Could not find H.showTooltip target string.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
