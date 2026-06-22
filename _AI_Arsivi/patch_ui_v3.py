import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    css_replacements = {
        # 1. Header (th) height and font size increase
        """    .dst-table th {
      background: #161b22;
      color: #f0f6fc;
      font-weight: 700;
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 2px solid #30363d;
      font-size: 12px;
      max-width: 60px;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.1;
    }""": 
        """    .dst-table th {
      background: #161b22;
      color: #f0f6fc;
      font-weight: 700;
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 2px solid #30363d;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
    }""",

        # 2. Base table font size (non-specific cells)
        """    .dst-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 16px;""": 
        """    .dst-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 20px;
      font-weight: bold;""",

        # 3. Fix penalty and bonus font sizes so ALL cells are equal
        """    .dst-table td.penalty {
      color: #ff6b6b !important;
      font-weight: bold;
      font-size: 14px;
    }

    .dst-table td.bonus {
      color: #6bcb77 !important;
      font-size: 14px;
    }""": 
        """    .dst-table td.penalty {
      color: #ff6b6b !important;
      font-weight: bold;
      font-size: 20px;
    }

    .dst-table td.bonus {
      color: #6bcb77 !important;
      font-weight: bold;
      font-size: 20px;
    }""",

        # 4. Make dst-num and final-score 20px to match everything else
        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 22px;
      color: #ffffff;
      background: #161b22;
    }""": 
        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      background: #161b22;
    }""",

        """    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 22px;
      text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
    }""": 
        """    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 20px;
      text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
    }"""
    }

    for target, replacement in css_replacements.items():
        if target in content:
            content = content.replace(target, replacement)
            print("Patched:", target.split('\\n')[0])
        else:
            print("Failed to patch:", target.split('\\n')[0])

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
