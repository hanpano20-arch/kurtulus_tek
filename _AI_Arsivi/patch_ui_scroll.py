import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    css_replacements = {
        # Modify the wrapper to be vertically scrollable
        """        html += '<div style="overflow-x:auto;">';""": 
        """        html += '<div style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">';""",
        
        # Ensure the th sticks properly
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
    }""": 
        """    .dst-table th {
      background: #161b22;
      color: #f0f6fc;
      font-weight: 700;
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 3px solid #53f0db;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
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
