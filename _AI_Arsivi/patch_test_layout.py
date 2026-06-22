import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Hiding Prompt Output area
    if "/* Hiding Prompt output area as requested */" not in content:
        css_injection = """
<style>
/* Hiding Prompt output area as requested */
#prompt-output-card,
button[onclick="buildAndSend()"],
button[onclick="copyPrompt()"],
button[onclick="buildAndSend()"] + button,
.btn-row:has(button[onclick="buildAndSend()"]) {
   display: none !important;
}
</style>
</head>
"""
        content = content.replace("</head>", css_injection)
        print("Injected CSS to hide prompt builder.")

    # 2. Update Zaman Makinesi Header
    target_header = """        outputHtml += `<h3 style="margin-top:0; margin-bottom:15px; color:#53f0db; font-size:16px; border-bottom:1px solid rgba(83,240,219,0.3); padding-bottom:8px;">⏳ ZAMAN MAKİNESİ (BACKTEST) SONUÇLARI</h3>`;
        outputHtml += `<div style="font-size:13px; margin-bottom:15px; background:rgba(83,240,219,0.1); padding:12px; border-radius:6px; border:1px solid rgba(83,240,219,0.3); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">`;
        outputHtml += `<div><span style="color:#aaa;">Toplam Test Edilen:</span> <b style="color:#fff; font-size:14px;">${testCount}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Hedef Havuz:</span> <b style="color:#fff; font-size:14px;">${poolSize}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Ortalama Başarı:</span> <b style="color:#53f0db; font-size:14px;">${(toplam_dogru / testCount).toFixed(2)} / 6</b></div>`;
        outputHtml += `</div>`;"""
    
    new_header = """        outputHtml += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(83,240,219,0.1); padding:8px 12px; border-radius:6px; border:1px solid rgba(83,240,219,0.3); margin-bottom:12px;">`;
        outputHtml += `<div style="color:#53f0db; font-size:14px; font-weight:bold;">⏳ ZAMAN MAKİNESİ SONUÇLARI</div>`;
        outputHtml += `<div style="display:flex; gap:15px; font-size:12px;">`;
        outputHtml += `<div><span style="color:#aaa;">Test:</span> <b style="color:#fff;">${testCount}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Havuz:</span> <b style="color:#fff;">${poolSize}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Ortalama Başarı:</span> <b style="color:#53f0db;">${(toplam_dogru / testCount).toFixed(2)} / 6</b></div>`;
        outputHtml += `</div></div>`;
        
        // Wrap the results in a 2-column grid
        outputHtml += `<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; align-items:start;">`;
"""
    if target_header in content:
        content = content.replace(target_header, new_header)
        print("Replaced Header.")
    else:
        print("Could not find target_header.")

    # 3. Add closing </div> for the grid after the loop
    target_loop_end = """        }

        outputHtml += `</div>`;
        resDiv.innerHTML = outputHtml;"""
    new_loop_end = """        }

        outputHtml += `</div>`; // Close grid wrapper
        outputHtml += `</div>`; // Close main wrapper
        resDiv.innerHTML = outputHtml;"""
    if target_loop_end in content:
        content = content.replace(target_loop_end, new_loop_end)
        print("Added grid closer.")
    else:
        print("Could not find target_loop_end.")
        
    # 4. Wrap each category in a grid cell and reduce padding of buttons
    target_cat_button = """            outputHtml += `<div style="margin-bottom:8px;">`;
            outputHtml += `<button onclick="let d = document.getElementById('bt-cat-${k}'); d.style.display = d.style.display==='none'?'block':'none';" style="width:100%; text-align:left; background:rgba(0,0,0,0.6); color:${catColor}; border:1px solid #444; padding:10px 14px; border-radius:6px; cursor:pointer; font-size:14px; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;">
            <span><b style="font-size:16px;">${k} Bilen</b> Çekiliş Sayısı: <b style="color:#fff;">${items.length}</b></span>
            <span style="font-size:12px; color:#aaa; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px;">▼ GÖSTER / GİZLE</span>
          </button>`;"""
    new_cat_button = """            outputHtml += `<div style="margin-bottom:0px;">`; // Inside grid cell
            outputHtml += `<button onclick="let d = document.getElementById('bt-cat-${k}'); d.style.display = d.style.display==='none'?'block':'none';" style="width:100%; text-align:left; background:rgba(0,0,0,0.6); color:${catColor}; border:1px solid #444; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:13px; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;">
            <span><b style="font-size:14px;">${k} Bilen</b> Sayısı: <b style="color:#fff;">${items.length}</b></span>
            <span style="font-size:10px; color:#aaa; background:rgba(255,255,255,0.1); padding:3px 6px; border-radius:4px;">▼ AÇ/KAPAT</span>
          </button>`;"""
    if target_cat_button in content:
        content = content.replace(target_cat_button, new_cat_button)
        print("Replaced Category button.")
    else:
        print("Could not find target_cat_button.")

    # 5. Shrink numbers by ~50%
    target_num = """                rowHtml += `<div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                              <span style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; font-size:26px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:10px; border:2px solid ${borderColor}; box-shadow:0 3px 6px rgba(0,0,0,0.4);">${num}</span>
                              <span style="font-size:16px; color:#ddd; font-family:var(--font-mono, monospace); font-weight:bold;">${puan} p</span>
                            </div>`;"""
    new_num = """                rowHtml += `<div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                              <span style="display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; font-size:15px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:6px; border:1px solid ${borderColor}; box-shadow:0 1px 3px rgba(0,0,0,0.4);">${num}</span>
                              <span style="font-size:11px; color:#aaa; font-family:var(--font-mono, monospace); font-weight:bold; letter-spacing:-0.5px;">${puan}p</span>
                            </div>`;"""
    if target_num in content:
        content = content.replace(target_num, new_num)
        print("Replaced Number rendering.")
    else:
        print("Could not find target_num.")
        
    # Shrink row margin & gap
    target_row = """              let rowHtml = `<div style="display:flex; align-items:center; margin-bottom:8px; flex-wrap:wrap;">`;
              rowHtml += `<span style="width:100px; color:#aaa; font-size:12px; font-weight:bold;">${item.tarih}</span>`;
              rowHtml += `<div style="display:flex; gap:6px;">`;"""
    new_row = """              let rowHtml = `<div style="display:flex; align-items:center; margin-bottom:6px; flex-wrap:wrap;">`;
              rowHtml += `<span style="width:80px; color:#aaa; font-size:11px; font-weight:bold;">${item.tarih}</span>`;
              rowHtml += `<div style="display:flex; gap:3px;">`;"""
    if target_row in content:
        content = content.replace(target_row, new_row)
        print("Replaced Row rendering.")
    else:
        print("Could not find target_row.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

except Exception as e:
    print("Error:", e)
