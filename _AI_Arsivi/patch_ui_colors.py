import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the rendering of all individual columns (lines 10892 to 10914)
    # I'll use regex to replace everything from "res += '<td>' + details.historical" up to "res += '<td style=\"position:relative"
    
    pattern = re.compile(r"res \+= '<td>' \+ details\.historical \+ '</td>';.*?res \+= '<td style=\"position:relative", re.DOTALL)
    
    replacement_code = """            let fmt = function(v, label) {
                let n = parseFloat(v) || 0;
                let txt = v + (label ? label : '');
                if (n > 0) return '<td style="color:#39d353; font-weight:bold;">' + txt + '</td>';
                if (n < 0) return '<td style="color:#ff4444; font-weight:bold;">' + txt + '</td>';
                return '<td style="color:#7d8590;">' + txt + '</td>';
            };

            res += fmt(details.historical);
            res += fmt(details.recent);
            res += fmt(details.k1);
            res += fmt(details.k2);
            res += fmt(details.k3);
            res += fmt(details.k4);
            res += fmt(details.k5);
            res += fmt(details.k6);
            res += fmt(details.k7);
            res += fmt(details.k8);
            res += fmt(details.k9);
            res += fmt(details.k10);
            res += fmt(details.k11);
            res += fmt(details.k12);
            res += fmt(details.k13);
            res += fmt(details.k14, details.doygunlukLabel);
            res += fmt(details.k15);
            res += fmt(details.k16);
            res += fmt(details.k17);
            res += fmt(details.k18);

            res += '<td style="position:relative"""
    
    if pattern.search(content):
        content = pattern.sub(replacement_code, content)
        print("Patched column values formatting")
    else:
        print("Failed to patch column values formatting")

    # 2. Patch Sayı color to Mavi
    target_num = """            res += '<td class="dst-num">' + x.n + '</td>';"""
    replacement_num = """            res += '<td class="dst-num" style="color:#58a6ff !important; font-weight:bold; font-size:22px;">' + x.n + '</td>';"""
    if target_num in content:
        content = content.replace(target_num, replacement_num)
        print("Patched Sayi color")
    else:
        print("Failed to patch Sayi color")

    # 3. Patch Final color to Yeşilin Tonu (Emerald / Lime)
    target_final = """            res += '<td class="final-score" id="dst-final-' + x.n + '"><b>' + finalScore + '</b></td>';"""
    replacement_final = """            res += '<td class="final-score" id="dst-final-' + x.n + '" style="color:#00ff88 !important; text-shadow:0 0 10px rgba(0,255,136,0.6); font-size:22px;"><b>' + finalScore + '</b></td>';"""
    if target_final in content:
        content = content.replace(target_final, replacement_final)
        print("Patched Final color")
    else:
        print("Failed to patch Final color")
        
    # 4. Patch Manuel button radius (20px to 4px)
    # We replace "border-radius:20px;" with "border-radius:4px;" ONLY inside the input generation of renderRows
    
    target_input = """border-radius:20px;"""
    replacement_input = """border-radius:4px;"""
    
    # Wait, instead of blind replace, let's find the exact line
    pattern_input = re.compile(r"border-radius: ?20px;")
    content = pattern_input.sub("border-radius: 4px;", content)
    print("Patched border radius")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
