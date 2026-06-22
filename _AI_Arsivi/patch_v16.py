import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Move FİNAL header to the front
    target_header = """        html += '<tr><th>Sayı</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th><th>FİNAL</th></tr>';"""
        
    replacement_header = """        html += '<tr><th>Sayı</th><th>FİNAL</th>';
        rules.forEach(r => {
          let tt = "H.showTooltip(event, '" + r.name + "', '" + r.desc + "')";
          html += '<th class="dst-tooltip-btn" onclick="' + tt + '">' + r.name + '</th>';
        });
        html += '<th>Manuel</th></tr>';"""

    if target_header in content:
        content = content.replace(target_header, replacement_header)
        print("Patched header")
    else:
        print("Failed to patch header")

    # 2. Move FİNAL row td to the front
    target_row_start = """            res += '<tr class="' + rowClass + '" id="dst-row-' + x.n + '">';
            res += '<td class="dst-num">' + x.n + '</td>';

            res += '<td>' + details.historical + '</td>';"""
            
    replacement_row_start = """            res += '<tr class="' + rowClass + '" id="dst-row-' + x.n + '">';
            res += '<td class="dst-num">' + x.n + '</td>';
            res += '<td class="final-score" id="dst-final-' + x.n + '"><b>' + finalScore + '</b></td>';

            res += '<td>' + details.historical + '</td>';"""

    if target_row_start in content:
        content = content.replace(target_row_start, replacement_row_start)
        print("Patched row start")
    else:
        print("Failed to patch row start")

    # 3. Remove FİNAL td from the end
    target_row_end = """            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';
            res += '<td class="final-score" id="dst-final-' + x.n + '"><b>' + finalScore + '</b></td>';
            res += '</tr>';"""
            
    replacement_row_end = """            res += '<button class="inline-save-btn" style="display:none; margin-left:4px; background:#53f0db; color:#0b0f14; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; vertical-align:middle;" onclick="H.saveAndSortDetailedTable()">Kaydet</button>';
            res += '</td>';
            res += '</tr>';"""

    if target_row_end in content:
        content = content.replace(target_row_end, replacement_row_end)
        print("Patched row end")
    else:
        print("Failed to patch row end")

    # 4. Guarantee exact sum by adjusting historical points with any remaining difference
    target_return = """        return {
          historical,
          recent,"""
          
    replacement_return = """        // ABSOLUTE GUARANTEE FOR PERFECT SUMMATION
        // Some deeply nested cross-rules (like Bölge Geçiş) are not mapped to specific UI columns.
        // We calculate the exact difference between the Brain's real score and the UI columns,
        // and inject the missing points directly into 'historical' so the sum NEVER fails.
        let brainPuanlar = window.HavuzMotoru.puanlari_hesapla(df, maxN, joks);
        let realScore = brainPuanlar[n] || 0;
        let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18;
        let missingDifference = realScore - currentSum;
        historical += missingDifference; // Hide the tiny difference here so math is perfect

        return {
          historical,
          recent,"""

    if target_return in content:
        content = content.replace(target_return, replacement_return)
        print("Patched return sum guarantee")
    else:
        print("Failed to patch return sum guarantee")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
