import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS classes for scores
    css_injection = """
  <style>
    .score-pos { color: #39d353 !important; font-weight: bold !important; font-size: 18px !important; }
    .score-neg { color: #ff4444 !important; font-weight: bold !important; font-size: 18px !important; }
    .score-zero { color: #7d8590 !important; font-size: 16px !important; }
  </style>
</head>"""
    if "</head>" in content and ".score-pos" not in content:
        content = content.replace("</head>", css_injection)

    # 2. Update fmt function
    target_fmt = """            let fmt = function(v, label) {
                let vStr = (v !== undefined && v !== null) ? v.toString() : '0';
                let stripped = vStr.replace(/<[^>]+>/g, '');
                let n = parseFloat(stripped) || 0;
                let txt = stripped + (label ? label : '');
                if (n > 0) return '<td style="color:#39d353; font-weight:bold; font-size:18px;">' + txt + '</td>';
                if (n < 0) return '<td style="color:#ff4444; font-weight:bold; font-size:18px;">' + txt + '</td>';
                return '<td style="color:#7d8590; font-size:16px;">' + txt + '</td>';
            };"""
            
    replacement_fmt = """            let fmt = function(v, label) {
                let vStr = (v !== undefined && v !== null) ? v.toString() : '0';
                let stripped = vStr.replace(/<[^>]+>/g, '');
                let n = parseFloat(stripped) || 0;
                let txt = stripped + (label ? label : '');
                if (n > 0) return '<td class="score-pos">' + txt + '</td>';
                if (n < 0) return '<td class="score-neg">' + txt + '</td>';
                return '<td class="score-zero">' + txt + '</td>';
            };"""
            
    if target_fmt in content:
        content = content.replace(target_fmt, replacement_fmt)
        print("Patched fmt to use CSS classes")
    else:
        print("Failed to patch fmt to CSS classes (maybe already patched?)")

    # 3. Widen buttons in the Manual column
    target_manual = """            res += '<td style="position:relative; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:4px; border-bottom:none;">';
            res += '<button onclick="let i=this.nextElementSibling; i.value=parseFloat(i.value||0)-1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#ff4444; color:#fff; border:none; border-radius:4px; width:26px; height:28px; cursor:pointer; font-weight:bold; font-size:16px;">-</button>';
            res += '<input type="number" step="0.1" class="dst-manual-input" data-n="' + x.n + '" value="' + man + '" ';
            res += 'oninput="if(this.nextElementSibling.nextElementSibling) this.nextElementSibling.nextElementSibling.style.display=\\\'inline-block\\\';" ';
            res += 'onchange="H.updateEphemeralManual(' + x.n + ', this.value); document.getElementById(\\\'dst-final-\\\' + ' + x.n + ').innerHTML = \\\'<b>\\\' + (' + rawFinal + ' + parseFloat(this.value || 0)) + \\\'</b>\\\';">';
            res += '<button onclick="let i=this.previousElementSibling; i.value=parseFloat(i.value||0)+1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#39d353; color:#fff; border:none; border-radius:4px; width:26px; height:28px; cursor:pointer; font-weight:bold; font-size:16px;">+</button>';
            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';"""
            
    replacement_manual = """            res += '<td style="position:relative; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:8px; border-bottom:none;">';
            res += '<button onclick="let i=this.nextElementSibling; i.value=parseFloat(i.value||0)-1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#ff4444; color:#fff; border:none; border-radius:4px; width:38px; height:34px; cursor:pointer; font-weight:bold; font-size:22px; display:flex; align-items:center; justify-content:center; transition:0.2s; box-shadow:0 0 5px rgba(255,68,68,0.5);">-</button>';
            res += '<input type="number" step="0.1" class="dst-manual-input" data-n="' + x.n + '" value="' + man + '" ';
            res += 'oninput="if(this.nextElementSibling.nextElementSibling) this.nextElementSibling.nextElementSibling.style.display=\\\'inline-block\\\';" ';
            res += 'onchange="H.updateEphemeralManual(' + x.n + ', this.value); document.getElementById(\\\'dst-final-\\\' + ' + x.n + ').innerHTML = \\\'<b>\\\' + (' + rawFinal + ' + parseFloat(this.value || 0)) + \\\'</b>\\\';" style="width:55px; text-align:center; padding:4px; font-size:18px; font-weight:bold; border-radius:4px; border:1px solid #555; background:#111; color:#fff;">';
            res += '<button onclick="let i=this.previousElementSibling; i.value=parseFloat(i.value||0)+1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#39d353; color:#fff; border:none; border-radius:4px; width:38px; height:34px; cursor:pointer; font-weight:bold; font-size:22px; display:flex; align-items:center; justify-content:center; transition:0.2s; box-shadow:0 0 5px rgba(57,211,83,0.5);">+</button>';
            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';"""
            
    if target_manual in content:
        content = content.replace(target_manual, replacement_manual)
        print("Patched manual buttons size")
    else:
        print("Failed to patch manual buttons size")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
