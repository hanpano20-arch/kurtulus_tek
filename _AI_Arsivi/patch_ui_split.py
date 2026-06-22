import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the HTML to split the table into two separate tables
    target_html = """        html += '<div class="dst-table-scroll-area" style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" onscroll="let h = this.querySelector(\\\'thead\\\'); if(h) h.style.transform = \\\'translateY(\\\' + this.scrollTop + \\\'px)\\\';">';
        html += '<table class="dst-table">';

        // Header
        html += '<thead><tr><th>Sayı</th><th>FİNAL</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th></tr></thead><tbody>';"""

    replacement_html = """        // STATIC HEADER (No scroll, zero jitter)
        html += '<div style="background:#161b22; border:1px solid #30363d; border-bottom:3px solid #53f0db; border-radius:8px 8px 0 0; padding-right:17px;">';
        html += '<table class="dst-table" style="margin:0;">';
        html += '<thead><tr><th>Sayı</th><th>FİNAL</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th></tr></thead></table></div>';

        // SCROLLABLE BODY
        html += '<div class="dst-table-scroll-area" style="overflow-y:scroll; max-height:65vh; border:1px solid #30363d; border-top:none; border-radius:0 0 8px 8px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">';
        html += '<table class="dst-table" style="margin:0;"><tbody>';"""

    if target_html in content:
        content = content.replace(target_html, replacement_html)
        print("Patched table split")
    else:
        print("Failed to patch table split")


    # 2. Update the CSS for th, remove the border-bottom since it's now on the container
    target_css = """    .dst-table th {
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

    replacement_css = """    .dst-table th {
      background: #161b22 !important;
      color: #f0f6fc;
      font-weight: 700;
      position: relative !important;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
      border-bottom: none;
      box-shadow: none;
    }"""

    if target_css in content:
        content = content.replace(target_css, replacement_css)
        print("Patched th CSS")
    else:
        print("Failed to patch th CSS")


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
