import codecs
import re

file_path = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# 1. Add tab button
tab_bar_str = """    <div class="h-tab-bar">
      <button class="h-tab-btn active" id="htab-db" onclick="H.tab('db')">📋 Çekiliş DB</button>
      <button class="h-tab-btn" id="htab-score" onclick="H.tab('score')">🤖 Akıllı Motor</button>
      <button class="h-tab-btn" id="htab-list" onclick="H.tab('list')">📊 Sayı Listesi</button>"""
new_tab_bar_str = """    <div class="h-tab-bar">
      <button class="h-tab-btn active" id="htab-db" onclick="H.tab('db')">📋 Çekiliş DB</button>
      <button class="h-tab-btn" id="htab-score" onclick="H.tab('score')">🤖 Akıllı Motor</button>
      <button class="h-tab-btn" id="htab-list" onclick="H.tab('list')">📊 Sayı Listesi</button>
      <button class="h-tab-btn" id="htab-test" onclick="H.tab('test')">⏳ Tarih Aralığına Göre Test</button>"""
content = content.replace(tab_bar_str, new_tab_bar_str)

# 2. Add hc-test container after hc-list
hc_list_end = """      <div id="h-group-box"></div>
    </div>"""
    
hc_test_str = """      <div id="h-group-box"></div>
    </div>

    <!-- KÖR TEST (TARİH ARALIĞINA GÖRE TEST) -->
    <div id="hc-test" style="display:none; padding-bottom:20px;">
      <div class="section-note purple" style="font-size:11px;margin-bottom:12px;">
        Belirlediğiniz geçmiş bir tarihte motoru durdurur, sadece o tarihe kadar olan çekilişlerle ağırlıkları hesaplar. 
        Sonrasında o tarihteki gerçek çekilişle tahminleri karşılaştırır. Puanlamada seçilen geçmiş analiz sayısı kullanılır.
      </div>
      
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px; padding:12px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(83,240,219,0.2);">
        <label style="font-size:13px; font-weight:700; color:#fff;">📅 Test Başlama Tarihi:</label>
        <select id="h-test-date" style="padding:6px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-family:monospace; outline:none; min-width: 140px;"></select>
        
        <label style="font-size:13px; font-weight:700; color:#fff; margin-left:10px;">📉 Geçmiş Analiz Sayısı:</label>
        <input type="number" id="h-test-count" value="15" min="5" max="100" style="width:60px; padding:6px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-family:monospace; text-align:center; outline:none;">
        
        <button class="btn primary" onclick="H.runTest()" style="margin-left:auto;">🚀 Testi Başlat</button>
      </div>

      <div id="h-test-summary" style="margin-bottom:16px; display:none; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px; border-left:4px solid #39ff14;">
      </div>
      
      <div id="h-test-results">
      </div>
    </div>"""
content = content.replace(hc_list_end, hc_test_str)

# 3. Update H.tab
h_tab_str = """      H.tab = function (t) {
        ['db', 'score', 'list'].forEach(id => {
          const btn = $$('htab-' + id);
          const ct = document.getElementById('hc-' + id);
          if (btn) btn.classList.toggle('active', id === t);
          if (ct) ct.style.display = id === t ? 'block' : 'none';
        });
        if (t === 'db') H.renderDB();
        else if (t === 'score') {
          if (!Object.keys(_sc).length) { const w = getW(); _ephemeral_ms = {}; _sc = computeAll(loadDB().entries, w, w.wh / 100, 1 - w.wh / 100, mx()); }
          H.renderScore();
        }
        else if (t === 'list') H.renderList();
      };"""

new_h_tab_str = """      H.tab = function (t) {
        ['db', 'score', 'list', 'test'].forEach(id => {
          const btn = $$('htab-' + id);
          const ct = document.getElementById('hc-' + id);
          if (btn) btn.classList.toggle('active', id === t);
          if (ct) ct.style.display = id === t ? 'block' : 'none';
        });
        if (t === 'db') H.renderDB();
        else if (t === 'score') {
          if (!Object.keys(_sc).length) { const w = getW(); _ephemeral_ms = {}; _sc = computeAll(loadDB().entries, w, w.wh / 100, 1 - w.wh / 100, mx()); }
          H.renderScore();
        }
        else if (t === 'list') H.renderList();
        else if (t === 'test') { H.initTestTab(); }
      };"""
content = content.replace(h_tab_str, new_h_tab_str)

# 4. Add JS methods
js_methods = """      H.initTestTab = function() {
        const sel = document.getElementById('h-test-date');
        const db = loadDB();
        if (sel && db && db.entries) {
          sel.innerHTML = '';
          const validEntries = db.entries;
          validEntries.forEach((e, idx) => {
            if (idx < validEntries.length - 15) {
              let opt = document.createElement('option');
              opt.value = idx;
              opt.textContent = e.date + ' (Sıra: ' + (validEntries.length - idx) + ')';
              sel.appendChild(opt);
            }
          });
        }
      };

      H.runTest = function() {
        const sel = document.getElementById('h-test-date');
        const countInput = document.getElementById('h-test-count');
        const summary = document.getElementById('h-test-summary');
        const results = document.getElementById('h-test-results');
        if (!sel || !sel.value) { alert('Lütfen geçerli bir tarih seçin.'); return; }
        
        const targetIdx = parseInt(sel.value, 10);
        const analysisCount = parseInt(countInput.value, 10) || 15;
        const db = loadDB();
        
        if (targetIdx + 1 >= db.entries.length) { alert('Bu tarihten önce yeterli veri yok!'); return; }
        
        let trainingEntries = db.entries.slice(targetIdx + 1, targetIdx + 1 + analysisCount);
        
        const targetDraw = db.entries[targetIdx];
        const actualNums = new Set(targetDraw.nums);
        const actualJoker = targetDraw.joker;
        
        const maxN = mx();
        const w = getW(); 
        const wh = w.wh / 100;
        
        if (window.HavuzMotoru && window.HavuzMotoru.updateConfigFromUI) {
          window.HavuzMotoru.updateConfigFromUI();
        }
        
        let test_sc = {};
        if (window.HavuzMotoru && window.HavuzMotoru.puanlari_hesapla) {
           const hm_sc = window.HavuzMotoru.puanlari_hesapla(
             trainingEntries.map(e => e.nums),
             maxN,
             trainingEntries.map(e => e.joker)
           );
           for(let i=1; i<=maxN; i++) {
             test_sc[i] = { n: i, final: hm_sc[i] || 0, base: hm_sc[i] || 0, hm_details: {} };
           }
        }
        
        const grp = mkGroups(test_sc, maxN);
        const is90 = ((typeof gameMax === 'function' ? gameMax() : 90) == 90);
        const jSet = new Set(is90 ? trainingEntries.slice(0, 10).map(e => e.joker).filter(Boolean) : []);
        
        let foundHot = 0; let foundWarm = 0; let foundCold = 0; let foundOut = 0;
        targetDraw.nums.forEach(n => {
           if (grp.hot.find(x => x.n === n)) foundHot++;
           else if (grp.warm.find(x => x.n === n)) foundWarm++;
           else if (grp.cold.find(x => x.n === n)) foundCold++;
           else if (grp.out.find(x => x.n === n)) foundOut++;
        });
        
        const totFound = foundHot + foundWarm;
        let pColor = totFound >= 4 ? '#39ff14' : (totFound >= 3 ? '#ffd93d' : '#ff6b6b');
        
        summary.style.display = 'block';
        summary.style.borderLeftColor = pColor;
        summary.innerHTML = `
          <div style="font-size:15px;font-weight:bold;margin-bottom:8px;color:${pColor}">🎯 Kesişim Başarısı: ${totFound} / 6 sayı Sıcak+Ilık havuzda bilindi!</div>
          <div style="font-size:13px;color:#ccc;margin-bottom:8px;">
            <b>Test Edilen Tarih:</b> ${targetDraw.date} <br/>
            <b>O Gün Çıkan Sayılar:</b> <span style="color:#fff;letter-spacing:1px;font-weight:bold;">${targetDraw.nums.join(' - ')}${is90 && actualJoker ? (' | J:' + actualJoker) : ''}</span>
          </div>
          <div style="display:flex;gap:12px;font-size:12px;">
            <div>🔴 Sıcaklardan bilinen: <b style="color:#ff6b6b">${foundHot}</b></div>
            <div>🟡 Ilıklardan bilinen: <b style="color:#ffd93d">${foundWarm}</b></div>
            <div>🟢 Soğuklardan bilinen: <b style="color:#6bcb77">${foundCold}</b></div>
            <div>⚫ İhtimal Dışı: <b style="color:#888">${foundOut}</b></div>
          </div>
        `;
        
        function testChips(arr, cls) {
          if (!arr || !arr.length) return '';
          return arr.map(x => {
            const isJ = jSet.has(x.n);
            const isActual = actualNums.has(x.n);
            const actualCls = isActual ? ' box-shadow:0 0 10px #39ff14, inset 0 0 8px rgba(57,255,20,0.5); border:1px solid #39ff14 !important;' : '';
            const jCls = isJ ? ' chip-joker' : '';
            const jBadge = isJ ? '<span class="joker-pill-badge">J</span>' : '';
            const scoreText = (x.score !== undefined && x.score !== null && !isNaN(x.score)) ? Number(x.score).toFixed(0) : '0';
            const star = isActual ? '<span style="position:absolute;top:-5px;right:-5px;font-size:12px;">⭐</span>' : '';
            return '<span class="h-chip ' + cls + jCls + '" data-n="' + x.n + '" style="position:relative;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;gap:2px;min-width:60px; min-height:40px;' + actualCls + '">' +
              star +
              '<span style="font-size:14px;font-weight:bold;line-height:1;display:flex;align-items:center;gap:2px;' + (isActual?'color:#fff':'') + '">' + x.n + jBadge + '</span>' +
              '<small style="font-size:9px;line-height:1;opacity:0.8;' + (isActual?'color:#39ff14':'') + '">' + scoreText + 'p</small></span>';
          }).join('');
        }

        results.innerHTML =
          '<div class="h-grp-box"><div class="h-grp-title" style="color:#ff6b6b">🔴 SICAK (' + (grp.hot ? grp.hot.length : 0) + ') &gt;' + (grp.th.q1 || 0) + '</div><div class="h-chips">' + testChips(grp.hot, 'chip-hot') + '</div></div>' +
          '<div class="h-grp-box" style="margin-top:6px"><div class="h-grp-title" style="color:#ffd93d">🟡 ILIK (' + (grp.warm ? grp.warm.length : 0) + ') &gt;' + (grp.th.q2 || 0) + '</div><div class="h-chips">' + testChips(grp.warm, 'chip-warm') + '</div></div>' +
          '<div class="h-grp-box" style="margin-top:6px"><div class="h-grp-title" style="color:#6bcb77">🟢 SOĞUK (' + (grp.cold ? grp.cold.length : 0) + ')</div><div class="h-chips">' + testChips(grp.cold, 'chip-cold') + '</div></div>' +
          '<div class="h-grp-box" style="margin-top:6px"><div class="h-grp-title" style="color:#888">⚫ İHTİMAL DIŞI (' + (grp.out ? grp.out.length : 0) + ')</div><div class="h-chips">' + testChips(grp.out, 'chip-out') + '</div></div>' +
          '<div style="margin-top:8px;font-size:11px;color:var(--color-text-secondary)">⭐ = O gün çıkan sayılar &nbsp;&nbsp;&nbsp;&nbsp; 🃏 = eğitimde joker olarak çıkanlar</div>';
      };

      function updateBadge() {"""

content = content.replace("      function updateBadge() {", js_methods)

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)

print("Patch applied.")
