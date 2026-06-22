import re

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix populateTimeMachine logic
old_populate = '''          function populateTimeMachine() {
            let sel = document.getElementById('tm-select');
            if(!sel) return;
            // Get raw db without offset
            let rawDB = null;
            try {
              const v = JSON.parse(localStorage.getItem(dk()) || 'null');
              if (v && Array.isArray(v.entries)) rawDB = v;
            } catch (e) { }
            if (!rawDB) {
                if (typeof sd === 'function') rawDB = { entries: sd() };
            }
            if (rawDB && rawDB.entries) {
                sel.innerHTML = '<option value="0">Bugündeyim (Kesinti Yok)</option>';
                rawDB.entries.slice(0, 50).forEach((entry, idx) => {
                    if(idx === 0) return;
                    let opt = document.createElement('option');
                    opt.value = idx;
                    opt.textContent = entry[0] + " (Çekiliş: " + entry[1].join(',') + ")";
                    sel.appendChild(opt);
                });
            }
          }'''

new_populate = '''          function populateTimeMachine() {
            let sel = document.getElementById('tm-select');
            if(!sel) return;
            // Get raw db without offset
            let rawDB = null;
            try {
              const v = JSON.parse(localStorage.getItem(dk()) || 'null');
              if (v && Array.isArray(v.entries)) rawDB = v;
            } catch (e) { }
            if (!rawDB) {
                if (typeof sd === 'function') {
                    const s = sd();
                    rawDB = { entries: s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null })) };
                }
            }
            if (rawDB && rawDB.entries) {
                sel.innerHTML = '<option value="0">Bugündeyim (Kesinti Yok)</option>';
                rawDB.entries.slice(0, 50).forEach((entry, idx) => {
                    if(idx === 0) return;
                    let opt = document.createElement('option');
                    opt.value = idx;
                    let dateStr = entry.date ? entry.date.split("-").reverse().join("-") : "Bilinmeyen";
                    let numsStr = entry.nums ? entry.nums.join(',') : "";
                    opt.textContent = dateStr + " (Çekiliş: " + numsStr + ")";
                    sel.appendChild(opt);
                });
            }
          }'''

html = html.replace(old_populate, new_populate)

# Also fix setTimeMachine to re-run the simulation if window.HavuzMotoru and window.App exist
# Currently, it calls: setTimeMachine(...); if(typeof renderDrawMap==='function') renderDrawMap();
# But just re-rendering the map isn't enough, we need to restart the App and motor!
old_btn = '''onclick="let sel = document.getElementById('tm-select'); setTimeMachine(sel.value, sel.options[sel.selectedIndex].text); if(typeof renderDrawMap==='function') renderDrawMap();" class="btn">Uygula'''
new_btn = '''onclick="let sel = document.getElementById('tm-select'); setTimeMachine(sel.value, sel.options[sel.selectedIndex].text); if(window.HavuzMotoru) { window.HavuzMotoru.init(true); window.HavuzMotoru.reset(); } if(typeof renderDrawMap==='function') renderDrawMap(); if(window.H && typeof H.bildirim==='function') H.bildirim('Zaman makinesi uygulandı, tablo güncelleniyor.', 'success');" class="btn">Uygula'''
html = html.replace(old_btn, new_btn)

# Also update the banner button to do the same
old_banner_btn = '''<button onclick="setTimeMachine(0, ''); if(typeof renderDrawMap==='function') renderDrawMap();"'''
new_banner_btn = '''<button onclick="setTimeMachine(0, ''); if(window.HavuzMotoru) { window.HavuzMotoru.init(true); window.HavuzMotoru.reset(); } if(typeof renderDrawMap==='function') renderDrawMap(); if(window.H && typeof H.bildirim==='function') H.bildirim('Bugüne dönüldü.', 'success');"'''
html = html.replace(old_banner_btn, new_banner_btn)

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fix10 applied")
