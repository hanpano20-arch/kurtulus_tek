import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    css_replacements = {
        # 1. Table equal width
        """    .dst-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 14px;""": 
        """    .dst-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 10px;
      font-size: 16px;""",

        # 2. Table Zebra styling
        """    .dst-table tr:hover {
      background: #161b22;
    }""": 
        """    .dst-table tr:nth-child(even) {
      background: #11161d;
    }
    .dst-table tr:nth-child(odd) {
      background: #080c10;
    }
    .dst-table tr:hover {
      background: #1f2937 !important;
    }""",

        # 3. Manuel Input "elipsin dışına çıkar"
        """    .dst-table .dst-manual-input {
      width: 70px;
      background: #0d1117;
      color: #ffffff;
      border: 1px solid #30363d;
      border-radius: 6px;
      text-align: center;
      font-size: 16px;
      padding: 4px;
      box-sizing: border-box;
    }""": 
        """    .dst-table .dst-manual-input {
      width: 80px;
      background: transparent;
      color: #39ff14;
      border: none;
      border-bottom: 2px solid #58a6ff;
      border-radius: 0;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      padding: 4px;
      box-sizing: border-box;
    }""",

        # 4. Center Number Grid
        """    .h-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }""": 
        """    .h-chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }""",
        
        # 5. İhtimal Dışı CSS
        """    .chip-hot {
      background: #238636 !important;""":
        """    .chip-out {
      font-size: 18px !important;
      min-width: 75px !important;
      min-height: 50px !important;
    }
    .chip-hot {
      background: #238636 !important;""",
        
        # 6. Tab Buttons to look like main buttons
        """    .h-tab-btn {
      padding: 8px 16px;
      border-radius: var(--border-radius-md, 10px);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 0.5px solid var(--color-border-primary, rgba(255, 255, 255, 0.15));
      background: var(--color-background-secondary, rgba(255, 255, 255, 0.08));
      color: var(--color-text-secondary, #ccc);
      transition: all 0.15s ease-in-out;
    }""":
        """    .h-tab-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(180deg, #2ea44f 0%, #238636 100%);
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: all 0.15s ease-in-out;
    }""",

        # 7. Modify the JS to make the grid boxes 50% larger
        """min-width:32px;""": """min-width:60px; min-height:40px;""",
        
        # 8. Increase table font sizes slightly
        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 18px;""":
        """    .dst-table td.dst-num {
      font-weight: bold;
      font-size: 22px;""",
        
        """    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 18px;""":
        """    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 22px;"""
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
