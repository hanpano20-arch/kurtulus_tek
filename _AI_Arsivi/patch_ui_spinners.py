import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update `fmt` function to strip HTML tags
    target_fmt = """            let fmt = function(v, label) {
                let n = parseFloat(v) || 0;
                let txt = v + (label ? label : '');
                if (n > 0) return '<td style="color:#39d353; font-weight:bold;">' + txt + '</td>';
                if (n < 0) return '<td style="color:#ff4444; font-weight:bold;">' + txt + '</td>';
                return '<td style="color:#7d8590;">' + txt + '</td>';
            };"""
    
    replacement_fmt = """            let fmt = function(v, label) {
                let vStr = (v !== undefined && v !== null) ? v.toString() : '0';
                let stripped = vStr.replace(/<[^>]+>/g, '');
                let n = parseFloat(stripped) || 0;
                let txt = stripped + (label ? label : '');
                if (n > 0) return '<td style="color:#39d353; font-weight:bold; font-size:18px;">' + txt + '</td>';
                if (n < 0) return '<td style="color:#ff4444; font-weight:bold; font-size:18px;">' + txt + '</td>';
                return '<td style="color:#7d8590; font-size:16px;">' + txt + '</td>';
            };"""
    
    if target_fmt in content:
        content = content.replace(target_fmt, replacement_fmt)
        print("Patched fmt function")
    else:
        print("Failed to patch fmt function")


    # 2. Add global CSS to hide webkit spin buttons
    target_global_css = """    .dst-table td.dst-num {"""
    replacement_global_css = """    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    .dst-table td.dst-num {"""
    
    if target_global_css in content:
        content = content.replace(target_global_css, replacement_global_css)
        print("Patched CSS spin buttons")
    else:
        print("Failed to patch CSS spin buttons")

    # 3. Update Manuel cell to add external buttons
    target_manual = """            res += '<td style="position:relative; white-space:nowrap;">';
            res += '<input type="number" step="0.1" class="dst-manual-input" data-n="' + x.n + '" value="' + man + '" ';
            res += 'oninput="if(this.nextElementSibling) this.nextElementSibling.style.display=\\\'inline-block\\\';" ';
            res += 'onchange="H.updateEphemeralManual(' + x.n + ', this.value); document.getElementById(\\\'dst-final-\\\' + ' + x.n + ').innerHTML = \\\'<b>\\\' + (' + rawFinal + ' + parseFloat(this.value || 0)) + \\\'</b>\\\';">';
            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';"""
    
    replacement_manual = """            res += '<td style="position:relative; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:4px; border-bottom:none;">';
            res += '<button onclick="let i=this.nextElementSibling; i.value=parseFloat(i.value||0)-1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#ff4444; color:#fff; border:none; border-radius:4px; width:26px; height:28px; cursor:pointer; font-weight:bold; font-size:16px;">-</button>';
            res += '<input type="number" step="0.1" class="dst-manual-input" data-n="' + x.n + '" value="' + man + '" ';
            res += 'oninput="if(this.nextElementSibling.nextElementSibling) this.nextElementSibling.nextElementSibling.style.display=\\\'inline-block\\\';" ';
            res += 'onchange="H.updateEphemeralManual(' + x.n + ', this.value); document.getElementById(\\\'dst-final-\\\' + ' + x.n + ').innerHTML = \\\'<b>\\\' + (' + rawFinal + ' + parseFloat(this.value || 0)) + \\\'</b>\\\';">';
            res += '<button onclick="let i=this.previousElementSibling; i.value=parseFloat(i.value||0)+1; i.dispatchEvent(new Event(\\\'change\\\'));" style="background:#39d353; color:#fff; border:none; border-radius:4px; width:26px; height:28px; cursor:pointer; font-weight:bold; font-size:16px;">+</button>';
            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';"""
            
    if target_manual in content:
        content = content.replace(target_manual, replacement_manual)
        print("Patched manual buttons")
    else:
        print("Failed to patch manual buttons")

    # 4. Modify input style width (reduce from 60px/80px to 50px)
    target_input_style = """width:60px; text-align:center;"""
    replacement_input_style = """width:45px; text-align:center; padding:2px;"""
    content = content.replace(target_input_style, replacement_input_style)
    
    target_input_style2 = """width:80px; text-align:center;"""
    content = content.replace(target_input_style2, replacement_input_style)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
