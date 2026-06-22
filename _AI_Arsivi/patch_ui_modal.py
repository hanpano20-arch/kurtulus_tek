import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Fullscreen CSS
    css_patch = """
    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 20px;
      text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
    }
    
    /* YENI TAM EKRAN (SABITLEME) MODU */
    .fullscreen-modal {
       position: fixed !important;
       top: 0 !important;
       left: 0 !important;
       width: 100vw !important;
       height: 100vh !important;
       max-height: 100vh !important;
       background: #080c10 !important;
       z-index: 999999 !important;
       padding: 20px !important;
       box-sizing: border-box !important;
       display: flex !important;
       flex-direction: column !important;
    }
    .fullscreen-modal .dst-table-scroll-area {
       flex: 1 !important;
       max-height: none !important;
    }
"""

    content = content.replace("""    .dst-table td.final-score {
      color: #39ff14 !important;
      font-weight: 800;
      font-size: 20px;
      text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
    }""", css_patch)

    # 2. Modify H.renderDetailedTable
    old_header_logic = """        let html = '<div class="dst-container">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:15px;">';
        html += '<div style="font-size:16px; color:#53f0db; font-weight:bold;">📊 Detaylı Puan Tablosu</div>';

        // Search Box and buttons
        html += '<div class="dst-search-box" style="margin-bottom:0;">';
        html += '<input type="number" id="dst-search-input" placeholder="Sayı Ara (Örn: 19)">';
        html += '<button onclick="H.searchAndHighlight()">Bul</button>';
        html += '<button onclick="H.saveAndSortDetailedTable()" style="background:#53f0db; color:#0b0f14; margin-left:15px;">💾 Kaydet ve Sırala</button>';
        html += '</div>';

        html += '</div>';
        html += '<div style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">';
        html += '<table class="dst-table">';

        // Header
        html += '<tr><th>Sayı</th><th>FİNAL</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th></tr>';"""

    new_header_logic = """        let html = '<div class="dst-container" id="dst-table-wrapper">';
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

        html += '</div>';
        html += '<div class="dst-table-scroll-area" style="overflow:auto; max-height: 65vh; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">';
        html += '<table class="dst-table">';

        // Header
        html += '<thead style="position: sticky; top: 0; z-index: 20; background: #161b22; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"><tr><th>Sayı</th><th>FİNAL</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th></tr></thead><tbody>';"""

    if old_header_logic in content:
        content = content.replace(old_header_logic, new_header_logic)
        print("Patched header logic")
    else:
        print("Failed to patch header logic")

    # 3. Add </tbody> closure
    old_closure = """            res += '</tr>';
          });
          return res;
        }

        html += renderRows(grp.hot, 'dst-hot');
        html += renderRows(grp.warm, 'dst-warm');
        html += renderRows(grp.cold, 'dst-cold');
        html += renderRows(grp.out, 'dst-out');

        html += '</table></div>';
        html += '</div>';"""

    new_closure = """            res += '</tr>';
          });
          return res;
        }

        html += renderRows(grp.hot, 'dst-hot');
        html += renderRows(grp.warm, 'dst-warm');
        html += renderRows(grp.cold, 'dst-cold');
        html += renderRows(grp.out, 'dst-out');

        html += '</tbody></table></div>';
        html += '</div>';"""

    if old_closure in content:
        content = content.replace(old_closure, new_closure)
        print("Patched closure logic")
    else:
        print("Failed to patch closure logic")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
