import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Patch the `th` CSS
    target_th_css = """    .dst-table th {
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
    
    replacement_th_css = """    .dst-table th {
      background: #161b22 !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      font-family: 'Inter', sans-serif !important;
      -webkit-font-smoothing: antialiased;
      text-shadow: 0 0 1px rgba(255,255,255,0.4);
      position: relative !important;
      font-size: 14px;
      height: 70px;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
      border-bottom: none;
      box-shadow: none;
      cursor: pointer;
    }"""
    
    if target_th_css in content:
        content = content.replace(target_th_css, replacement_th_css)
        print("Patched TH CSS successfully.")
    else:
        print("Failed to find target TH CSS.")

    # 2. Patch H.showTooltip
    # I'll use regex to match from H.showTooltip = function to the closing brace before H.updateConfigFromUI or similar.
    # Actually, we can just replace the whole block manually.
    
    pattern_tooltip = re.compile(r"H\.showTooltip = function.*?};", re.DOTALL)
    
    replacement_tooltip = """H.showTooltip = function (e, title, desc) {
        let modal = document.getElementById('dst-tooltip-modal');
        if (!modal) {
          let overlay = document.createElement('div');
          overlay.id = 'dst-tooltip-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100vw';
          overlay.style.height = '100vh';
          overlay.style.background = 'rgba(0,0,0,0.7)';
          overlay.style.zIndex = '9999998';
          overlay.style.backdropFilter = 'blur(2px)';
          overlay.onclick = function() { modal.style.display = 'none'; overlay.style.display = 'none'; };
          document.body.appendChild(overlay);

          modal = document.createElement('div');
          modal.id = 'dst-tooltip-modal';
          modal.style.position = 'fixed';
          modal.style.top = '50%';
          modal.style.left = '50%';
          modal.style.transform = 'translate(-50%, -50%)';
          modal.style.background = '#1a1f24';
          modal.style.border = '2px solid #39ff14';
          modal.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.4), 0 10px 40px rgba(0,0,0,0.8)';
          modal.style.borderRadius = '12px';
          modal.style.padding = '24px';
          modal.style.zIndex = '9999999';
          modal.style.minWidth = '320px';
          modal.style.maxWidth = '500px';
          modal.style.color = '#ffffff';
          modal.style.fontFamily = "'Inter', sans-serif";
          modal.style.fontWeight = 'bold';
          modal.style.webkitFontSmoothing = 'antialiased';
          modal.style.textShadow = '0px 0px 1px rgba(255,255,255,0.4)';
          document.body.appendChild(modal);
        }
        
        document.getElementById('dst-tooltip-overlay').style.display = 'block';
        modal.style.display = 'block';
        
        modal.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(57,255,20,0.5); padding-bottom:12px; margin-bottom:16px;">
            <div style="font-size:22px; color:#39ff14; font-weight:900; text-shadow:0 0 8px rgba(57,255,20,0.6);">${title}</div>
            <button onclick="document.getElementById('dst-tooltip-modal').style.display='none'; document.getElementById('dst-tooltip-overlay').style.display='none';" style="background:transparent; border:none; color:#ff4444; font-size:24px; cursor:pointer; font-weight:bold; outline:none; transition:0.2s; text-shadow:0 0 5px rgba(255,68,68,0.5);" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">&#10006;</button>
          </div>
          <div style="font-size:16px; line-height:1.6; color:#f0f6fc; font-weight:normal; letter-spacing:0.3px;">${desc}</div>
        `;
      };"""
      
    # Replace the FIRST occurrence of H.showTooltip
    match = pattern_tooltip.search(content)
    if match:
        content = content[:match.start()] + replacement_tooltip + content[match.end():]
        print("Patched H.showTooltip successfully.")
    else:
        print("Failed to find H.showTooltip.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
