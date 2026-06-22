import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update .h-grp-title font size and sharpness
    pattern_title = re.compile(r"\.h-grp-title\s*\{[^}]*\}", re.MULTILINE)
    replacement_title = """.h-grp-title {
      font-size: 15px;
      font-weight: 900;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      -webkit-font-smoothing: antialiased;
      text-shadow: 0 0 4px rgba(255,255,255,0.3);
    }"""
    if pattern_title.search(content):
        content = pattern_title.sub(replacement_title, content)
        print("Patched .h-grp-title")
    else:
        print("Could not find .h-grp-title")

    # 2. Update .chip-hot, .chip-warm, .chip-cold, .chip-out
    # We will replace them one by one.
    
    # HOT
    pattern_hot = re.compile(r"\.chip-hot\s*\{\s*background:[^}]*\}", re.MULTILINE)
    replacement_hot = """.chip-hot {
      background: rgba(255,51,51,0.15) !important;
      color: #ff4444 !important;
      border: 1px solid #ff3333 !important;
      box-shadow: inset 0 0 8px rgba(255,51,51,0.2);
    }"""
    content = pattern_hot.sub(replacement_hot, content)
    
    # WARM
    pattern_warm = re.compile(r"\.chip-warm\s*\{\s*background:[^}]*\}", re.MULTILINE)
    replacement_warm = """.chip-warm {
      background: rgba(255,153,51,0.15) !important;
      color: #ffaa33 !important;
      border: 1px solid #ff9933 !important;
      box-shadow: inset 0 0 8px rgba(255,153,51,0.2);
    }"""
    content = pattern_warm.sub(replacement_warm, content)
    
    # COLD
    pattern_cold = re.compile(r"\.chip-cold\s*\{\s*background:[^}]*\}", re.MULTILINE)
    replacement_cold = """.chip-cold {
      background: rgba(51,204,255,0.15) !important;
      color: #33ccff !important;
      border: 1px solid #33ccff !important;
      box-shadow: inset 0 0 8px rgba(51,204,255,0.2);
    }"""
    content = pattern_cold.sub(replacement_cold, content)
    
    # OUT
    pattern_out = re.compile(r"\.chip-out\s*\{\s*background:[^}]*\}", re.MULTILINE)
    replacement_out = """.chip-out {
      background: rgba(153,102,255,0.15) !important;
      color: #cc99ff !important;
      border: 1px solid #9966ff !important;
      box-shadow: inset 0 0 8px rgba(153,102,255,0.2);
    }"""
    if pattern_out.search(content):
        content = pattern_out.sub(replacement_out, content)
    else:
        # Sometimes .chip-out has font-size too.
        content = content.replace("background: #21262d !important;\n      color: #8b949e !important;", "background: rgba(153,102,255,0.15) !important;\n      color: #cc99ff !important;")

    # 3. Update .h-chip.sel
    pattern_sel = re.compile(r"\.h-chip\.sel\s*\{[^}]*\}", re.MULTILINE)
    replacement_sel = """.h-chip.sel {
      outline: 2px solid #39ff14 !important;
      box-shadow: 0 0 20px rgba(57,255,20,0.8), inset 0 0 10px rgba(57,255,20,0.5) !important;
      background: #39ff14 !important;
      color: #000000 !important;
      border: 1px solid #ffffff !important;
    }"""
    if pattern_sel.search(content):
        content = pattern_sel.sub(replacement_sel, content)
        print("Patched .h-chip.sel")
    else:
        print("Could not find .h-chip.sel")

    # 4. Make sure h-chip color can be overridden by making it NOT !important OR ensuring our classes have !important
    # We already put !important in our classes, so it should be fine. But just to be sure, we can also add a rule for the small text inside.
    # Currently small score text is `<small style="font-size:9px;line-height:1;opacity:0.8;">' + scoreText + 'p</small>`
    # We can inject a CSS rule for the small text to inherit color so it matches the neon glow.
    css_injection = """
    .h-chip small {
       color: inherit !important;
       font-weight: bold;
    }
    .h-chip span {
       color: inherit !important;
    }
"""
    content = content.replace(".h-chip.sel {", css_injection + "\n    .h-chip.sel {")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

except Exception as e:
    print("Error:", e)
