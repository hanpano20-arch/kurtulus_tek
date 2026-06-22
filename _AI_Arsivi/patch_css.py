import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    css_replacements = {
        """    .dst-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 18px;""": 
        """    .dst-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 14px;""",

        """    .dst-table th,
    .dst-table td {
      padding: 10px 12px;""": 
        """    .dst-table th,
    .dst-table td {
      padding: 4px 6px;""",

        """    .dst-table th {
      background: #161b22;
      color: #f0f6fc;
      font-weight: 700;
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 2px solid #30363d;
    }""": 
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
    }""",

        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 26px;""": 
        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 18px;""",

        """    .dst-table td.penalty {
      color: #ff6b6b !important;
      font-weight: bold;
      font-size: 18px;
    }

    .dst-table td.bonus {
      color: #6bcb77 !important;
      font-size: 18px;
    }

    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 26px;""": 
        """    .dst-table td.penalty {
      color: #ff6b6b !important;
      font-weight: bold;
      font-size: 14px;
    }

    .dst-table td.bonus {
      color: #6bcb77 !important;
      font-size: 14px;
    }

    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 18px;""",

        """    .dst-table .dst-manual-input {
      width: 120px;
      background: #0d1117;
      color: #ffffff;
      border: 1px solid #30363d;
      border-radius: 6px;
      text-align: center;
      font-size: 20px;
      padding: 8px;""": 
        """    .dst-table .dst-manual-input {
      width: 70px;
      background: #0d1117;
      color: #ffffff;
      border: 1px solid #30363d;
      border-radius: 6px;
      text-align: center;
      font-size: 16px;
      padding: 4px;"""
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
