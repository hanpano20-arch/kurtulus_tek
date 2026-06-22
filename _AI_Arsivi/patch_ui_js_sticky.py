import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS: Remove sticky, use relative
    target_css_th = """    .dst-table th {
      background: #161b22 !important;
      color: #f0f6fc;
      font-weight: 700;
      position: sticky !important;
      top: 0 !important;
      z-index: 50 !important;
      border-bottom: 3px solid #53f0db;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
      box-shadow: 0 4px 10px rgba(0,0,0,0.8);
    }"""
    
    replacement_css_th = """    .dst-table thead {
      position: relative;
      z-index: 60;
      background: #161b22;
    }
    .dst-table th {
      background: #161b22 !important;
      color: #f0f6fc;
      font-weight: 700;
      position: relative !important;
      z-index: 50 !important;
      border-bottom: 3px solid #53f0db;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
      box-shadow: 0 4px 10px rgba(0,0,0,0.8);
    }"""

    if target_css_th in content:
        content = content.replace(target_css_th, replacement_css_th)
        print("Patched CSS th")
    else:
        print("Failed to patch CSS th")

    # 2. Add onscroll event to the wrapper
    target_wrapper = """        html += '<div class="dst-table-scroll-area" style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">';"""
    replacement_wrapper = """        html += '<div class="dst-table-scroll-area" style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" onscroll="let h = this.querySelector(\\\'thead\\\'); if(h) h.style.transform = \\\'translateY(\\\' + this.scrollTop + \\\'px)\\\';">';"""

    if target_wrapper in content:
        content = content.replace(target_wrapper, replacement_wrapper)
        print("Patched wrapper onscroll")
    else:
        print("Failed to patch wrapper onscroll")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
