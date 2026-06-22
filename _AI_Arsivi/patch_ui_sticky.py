import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix the Header Layout and Buttons
    target_header = """        let html = '<div class="dst-container" id="dst-table-wrapper">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:15px;">';
        html += '<div style="font-size:20px; color:#53f0db; font-weight:bold;">📊 Detaylı Puan Tablosu</div>';

        // Search Box and buttons
        html += '<div class="dst-search-box" style="margin-bottom:0; display:flex; align-items:center; gap:10px;">';
        html += '<button onclick="document.getElementById(\\\'dst-table-wrapper\\\').classList.add(\\\'fullscreen-modal\\\'); document.body.style.overflow=\\\'hidden\\\';" style="background:#ff6b6b; color:#fff; font-weight:bold; font-size:16px; padding:10px 20px; border-radius:8px; box-shadow:0 0 10px rgba(255,107,107,0.5); cursor:pointer;">📌 Tabloyu Ekrana Sabitle (Kapat diyene kadar)</button>';
        html += '<button onclick="document.getElementById(\\\'dst-table-wrapper\\\').classList.remove(\\\'fullscreen-modal\\\'); document.body.style.overflow=\\\'auto\\\';" style="background:#30363d; color:#fff; font-weight:bold; font-size:16px; padding:10px 20px; border-radius:8px; cursor:pointer;">✖ Sabitlemeyi Kapat</button>';
        html += '<input type="number" id="dst-search-input" placeholder="Sayı Ara (Örn: 19)" style="margin-left:15px;">';
        html += '<button onclick="H.searchAndHighlight()">Bul</button>';
        html += '<button onclick="H.saveAndSortDetailedTable()" style="background:#53f0db; color:#0b0f14;">💾 Kaydet ve Sırala</button>';
        html += '</div>';

        html += '</div>';"""

    replacement_header = """        let html = '<div class="dst-container" id="dst-table-wrapper">';
        html += '<div style="display:flex; flex-direction: column; align-items:center; gap:15px; margin-bottom:20px;">';
        html += '<div style="font-size:24px; color:#53f0db; font-weight:bold; width: 100%; text-align: center;">📊 Detaylı Puan Tablosu</div>';

        // Centered Buttons Area
        html += '<div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:15px; width: 100%;">';
        html += '<button onclick="document.getElementById(\\\'dst-table-wrapper\\\').classList.add(\\\'fullscreen-modal\\\'); document.body.style.overflow=\\\'hidden\\\';" style="background:#ff6b6b; color:#fff; font-weight:bold; font-size:16px; padding:10px 20px; border-radius:8px; box-shadow:0 0 10px rgba(255,107,107,0.5); cursor:pointer;">📌 Tabloyu Ekrana Sabitle (Kapat diyene kadar)</button>';
        html += '<button onclick="document.getElementById(\\\'dst-table-wrapper\\\').classList.remove(\\\'fullscreen-modal\\\'); document.body.style.overflow=\\\'auto\\\';" style="background:#30363d; color:#fff; font-weight:bold; font-size:16px; padding:10px 20px; border-radius:8px; cursor:pointer; border:1px solid #555;">✖ Sabitlemeyi Kapat</button>';
        
        html += '<div class="dst-search-box" style="margin-bottom:0; display:flex; align-items:center; gap:10px;">';
        html += '<input type="number" id="dst-search-input" placeholder="Sayı Ara (Örn: 19)" style="padding:10px; font-size:16px; width:150px;">';
        html += '<button onclick="H.searchAndHighlight()" style="font-size:16px; padding:10px 20px;">Bul</button>';
        html += '</div>';
        
        html += '<button onclick="H.saveAndSortDetailedTable()" style="background:#238636; color:#ffffff; font-weight:bold; font-size:16px; padding:10px 20px; border-radius:8px; border:1px solid #2ea44f; cursor:pointer;">💾 Kaydet ve Sırala</button>';
        html += '</div>';

        html += '</div>';"""

    if target_header in content:
        content = content.replace(target_header, replacement_header)
        print("Patched header buttons layout")
    else:
        print("Failed to patch header buttons layout")


    # 2. Fix the Thead Sticky bug
    target_thead = """        html += '<thead style="position: sticky; top: 0; z-index: 20; background: #161b22; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"><tr><th>Sayı</th><th>FİNAL</th>';"""
    replacement_thead = """        html += '<thead><tr><th>Sayı</th><th>FİNAL</th>';"""

    if target_thead in content:
        content = content.replace(target_thead, replacement_thead)
        print("Patched thead style")
    else:
        print("Failed to patch thead style")

    # 3. Ensure th has the sticky properties and a background so it blocks rows behind it
    target_css_th = """    .dst-table th {
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
    
    replacement_css_th = """    .dst-table th {
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
    }
    .dst-table th::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 100%;
      height: 3px;
      background: #53f0db;
      z-index: 51;
    }"""

    if target_css_th in content:
        content = content.replace(target_css_th, replacement_css_th)
        print("Patched CSS th sticky")
    else:
        print("Failed to patch CSS th sticky")


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
