import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. CSS for the new column neon colors
    target_css = """    .dst-table th {
      background: #161b22 !important;"""
    replacement_css = """    .rank-sicak { color: #ff3333; text-shadow: 0 0 8px rgba(255,51,51,0.8); font-weight: bold; }
    .rank-ilik { color: #ff9933; text-shadow: 0 0 8px rgba(255,153,51,0.8); font-weight: bold; }
    .rank-soguk { color: #33ccff; text-shadow: 0 0 8px rgba(51,204,255,0.8); font-weight: bold; }
    .rank-disi { color: #cc66ff; text-shadow: 0 0 8px rgba(204,102,255,0.8); font-weight: bold; }

    .dst-table th {
      background: #161b22 !important;"""

    if target_css in content:
        content = content.replace(target_css, replacement_css)
        print("Patched CSS")
    else:
        print("Failed to patch CSS")

    # 2. Add 'Durum' header to STATIC HEADER
    target_th_static = """        // STATIC HEADER (No scroll, zero jitter)
        html += '<div style="background:#161b22; border:1px solid #30363d; border-bottom:3px solid #53f0db; border-radius:8px 8px 0 0; padding-right:17px;">';
        html += '<table class="dst-table" style="margin:0;">';
        html += '<thead><tr><th>Sayı</th><th>FİNAL</th>';"""
    replacement_th_static = """        // STATIC HEADER (No scroll, zero jitter)
        html += '<div style="background:#161b22; border:1px solid #30363d; border-bottom:3px solid #53f0db; border-radius:8px 8px 0 0; padding-right:17px;">';
        html += '<table class="dst-table" style="margin:0;">';
        html += '<thead><tr><th>Sayı</th><th>FİNAL</th><th>Durum</th>';"""

    if target_th_static in content:
        content = content.replace(target_th_static, replacement_th_static)
        print("Patched TH Static")
    else:
        print("Failed to patch TH Static")

    # 3. Add 'Durum' header to SCROLLABLE BODY (though it's hidden, we need it for alignment!)
    # Wait, the body does NOT have a header anymore! The body just has <tbody>
    # Wait, if the body doesn't have <thead>, the columns won't align perfectly if we don't have exactly the same number of <td>s!
    # Yes, we just need to add a <td> in the renderRows function.

    # 4. Modify renderRows function
    target_renderRows = """        function renderRows(arr, rowClass) {
          if (!arr) return '';
          let res = '';
          const db = loadDB();
          const draws = db.entries.map(e => e.nums);
          const joks = db.entries.map(e => e.joker);
          arr.forEach(x => {"""
    replacement_renderRows = """        function renderRows(arr, rowClass, groupName, groupCss, startIndex) {
          if (!arr) return '';
          let res = '';
          const db = loadDB();
          const draws = db.entries.map(e => e.nums);
          const joks = db.entries.map(e => e.joker);
          arr.forEach((x, idx) => {
            let rank = startIndex + idx;"""

    if target_renderRows in content:
        content = content.replace(target_renderRows, replacement_renderRows)
        print("Patched renderRows signature")
    else:
        print("Failed to patch renderRows signature")

    # 5. Insert the new td inside the loop
    target_td = """            res += '<tr class="' + rowClass + '" id="dst-row-' + x.n + '">';
            res += '<td class="dst-num">' + x.n + '</td>';
            res += '<td class="final-score" id="dst-final-' + x.n + '"><b>' + finalScore + '</b></td>';

            res += '<td>' + details.historical + '</td>';"""
    replacement_td = """            res += '<tr class="' + rowClass + '" id="dst-row-' + x.n + '">';
            res += '<td class="dst-num">' + x.n + '</td>';
            res += '<td class="final-score" id="dst-final-' + x.n + '"><b>' + finalScore + '</b></td>';
            res += '<td class="' + groupCss + '" style="font-size:16px;">#' + rank + '<br><span style="font-size:13px;">' + groupName + '</span></td>';

            res += '<td>' + details.historical + '</td>';"""

    if target_td in content:
        content = content.replace(target_td, replacement_td)
        print("Patched renderRows td")
    else:
        print("Failed to patch renderRows td")

    # 6. Update the calls to renderRows
    target_calls = """        html += renderRows(grp.hot, 'dst-hot');
        html += renderRows(grp.warm, 'dst-warm');
        html += renderRows(grp.cold, 'dst-cold');
        html += renderRows(grp.out, 'dst-out');"""
    replacement_calls = """        let c_hot = grp.hot ? grp.hot.length : 0;
        let c_warm = grp.warm ? grp.warm.length : 0;
        let c_cold = grp.cold ? grp.cold.length : 0;

        html += renderRows(grp.hot, 'dst-hot', 'SICAK', 'rank-sicak', 1);
        html += renderRows(grp.warm, 'dst-warm', 'ILIK', 'rank-ilik', 1 + c_hot);
        html += renderRows(grp.cold, 'dst-cold', 'SOĞUK', 'rank-soguk', 1 + c_hot + c_warm);
        html += renderRows(grp.out, 'dst-out', 'DIŞI', 'rank-disi', 1 + c_hot + c_warm + c_cold);"""

    if target_calls in content:
        content = content.replace(target_calls, replacement_calls)
        print("Patched renderRows calls")
    else:
        print("Failed to patch renderRows calls")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
