import re
import json

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update loadDB
loadDB_orig = '''function loadDB() {
        try {
          const v = JSON.parse(localStorage.getItem(dk()) || 'null');
          if (v && Array.isArray(v.entries)) return v;
        } catch (e) { }
        const s = sd();
        const entries = s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null }));
        return { entries };
      }'''

loadDB_new = '''
      // Global Time Machine State
      window.__timeMachineOffset = 0;
      window.__timeMachineDate = '';
      
      function setTimeMachine(offset, dateStr) {
        window.__timeMachineOffset = parseInt(offset) || 0;
        window.__timeMachineDate = dateStr || '';
        
        let banner = document.getElementById('tm-banner');
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'tm-banner';
          banner.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:linear-gradient(90deg, #ff416c, #ff4b2b);color:#fff;text-align:center;padding:10px;font-weight:900;z-index:999999;box-shadow:0 4px 15px rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;gap:20px;';
          document.body.prepend(banner);
        }
        
        if (window.__timeMachineOffset > 0) {
          banner.style.display = 'flex';
          banner.innerHTML = '<span>⏳ ZAMAN MAKİNESİ AKTİF: Sistemin şu anki tarihi <b>' + window.__timeMachineDate + '</b> olarak ayarlandı! (Son ' + window.__timeMachineOffset + ' çekiliş yok sayılıyor)</span>' +
                             '<button onclick="setTimeMachine(0, \\\'\\\'); if(typeof renderDrawMap===\\\'function\\\') renderDrawMap();" style="background:#fff;color:#ff4b2b;border:none;padding:5px 15px;border-radius:20px;font-weight:bold;cursor:pointer;">Kapat & Bugüne Dön</button>';
        } else {
          banner.style.display = 'none';
        }
        
        // Refresh UI if functions exist
        if(typeof window.HavuzMotoru !== 'undefined') window.HavuzMotoru.init();
      }

      function loadDB() {
        let db = null;
        try {
          const v = JSON.parse(localStorage.getItem(dk()) || 'null');
          if (v && Array.isArray(v.entries)) db = v;
        } catch (e) { }
        
        if (!db) {
            const s = sd();
            const entries = s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null }));
            db = { entries };
        }
        
        // Zaman Makinesi Kesintisi
        if (window.__timeMachineOffset > 0) {
           return { entries: db.entries.slice(window.__timeMachineOffset) };
        }
        return db;
      }
'''
if loadDB_orig in html:
    html = html.replace(loadDB_orig, loadDB_new)
    print("loadDB replaced")
else:
    print("loadDB NOT found!")


# 2. Add Time Machine UI to Havuz Panel
h_panel_orig = '''<div class="h-panel">
      <!-- SOL: AYARLAR -->
      <div id="hc-settings" style="display:flex; flex-direction:column; gap:15px;">'''

h_panel_new = '''<div class="h-panel">
      <!-- SOL: AYARLAR -->
      <div id="hc-settings" style="display:flex; flex-direction:column; gap:15px;">
        
        <!-- ZAMAN MAKİNESİ -->
        <div class="card" style="background:rgba(255, 65, 108, 0.1); border-color:#ff416c;">
          <div class="card-head" style="background:linear-gradient(90deg, #ff416c, #ff4b2b) !important; border:none !important;">
            <div class="card-title">⏳ Zaman Makinesi (Geçmişe Git)</div>
          </div>
          <div class="card-note">Analizi geçmişteki bir tarihteymişsiniz gibi yapın. Seçtiğiniz tarihten sonraki tüm çekilişler yok sayılır.</div>
          <div style="display:flex; gap:10px; margin-top:10px; align-items:center;">
            <select id="tm-select" style="flex:1; padding:8px; border-radius:6px; background:#0d2326; color:#fff; border:1px solid #ff416c;">
              <option value="0">Bugün (Normal Mod)</option>
            </select>
            <button class="btn primary" onclick="applyTimeMachine()" style="background:linear-gradient(135deg, #ff416c, #ff4b2b) !important; color:#fff !important;">Uygula</button>
          </div>
        </div>
        <script>
          function populateTimeMachine() {
            let sel = document.getElementById('tm-select');
            if(!sel) return;
            // Get raw db without offset
            let rawDB = null;
            try {
              const v = JSON.parse(localStorage.getItem(dk()) || 'null');
              if (v && Array.isArray(v.entries)) rawDB = v;
            } catch (e) { }
            if (!rawDB) {
                const s = sd();
                const entries = s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null }));
                rawDB = { entries };
            }
            
            let html = '<option value="0">Bugün (Normal Mod)</option>';
            for(let i=1; i<Math.min(100, rawDB.entries.length); i++) {
                let dParts = rawDB.entries[i].date.split('-');
                let df = dParts.length === 3 ? dParts[2] + '-' + dParts[1] + '-' + dParts[0] : rawDB.entries[i].date;
                html += '<option value="'+i+'">Geçmiş ' + i + ' (' + df + ')</option>';
            }
            sel.innerHTML = html;
            sel.value = window.__timeMachineOffset || "0";
          }
          function applyTimeMachine() {
            let sel = document.getElementById('tm-select');
            let offset = parseInt(sel.value);
            let dateStr = sel.options[sel.selectedIndex].text;
            setTimeMachine(offset, dateStr);
          }
          document.addEventListener("DOMContentLoaded", populateTimeMachine);
        </script>
'''
if h_panel_orig in html:
    html = html.replace(h_panel_orig, h_panel_new)
    print("Time machine UI added")
else:
    print("h_panel NOT found")


with open('PROMPT_BUILDER_v8_2.html', 'w', encoding='utf-8') as f:
    f.write(html)
