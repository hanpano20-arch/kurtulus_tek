import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update renderRow to add +/- buttons
old_renderRow = '''const renderRow = (id, label, desc, val) => {
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#161b22; padding:12px; border-radius:8px; margin-bottom:8px; border:1px solid #30363d;">
              <div style="flex:1; padding-right:15px;">
                <div style="font-weight:bold; color:#58a6ff; font-size:16px; margin-bottom:4px;">${label}</div>
                <div style="font-size:12px; color:#8b949e;">${desc}</div>
              </div>
              <div style="width:100px;">
                <input type="number" id="pset_${id}" value="${val}" step="0.5" style="width:100%; padding:8px; background:#0d1117; border:1px solid #30363d; color:#ffffff; font-size:16px; font-weight:bold; border-radius:6px; text-align:center;" onchange="window._puanAyarlariUnsaved=true;">
              </div>
            </div>
          `;
        };'''

new_renderRow = '''const renderRow = (id, label, desc, val) => {
          let step = (id.startsWith('CEZA') || id.startsWith('OLUM') || id.startsWith('NORM') || id.startsWith('KATSAYI')) ? 5 : 0.5;
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#161b22; padding:12px; border-radius:8px; margin-bottom:8px; border:1px solid #30363d;">
              <div style="flex:1; padding-right:15px;">
                <div style="font-weight:bold; color:#58a6ff; font-size:16px; margin-bottom:4px;">${label}</div>
                <div style="font-size:12px; color:#8b949e;">${desc}</div>
              </div>
              <div style="display:flex; align-items:center; gap:5px; width:140px;">
                <button onclick="let i=document.getElementById('pset_${id}'); i.value=(parseFloat(i.value)-${step}).toFixed(1); i.dispatchEvent(new Event('change'));" style="background:#ff4444; color:white; border:none; border-radius:4px; width:30px; height:36px; font-size:18px; font-weight:bold; cursor:pointer;">-</button>
                <input type="number" id="pset_${id}" value="${val}" step="${step}" style="flex:1; width:0; padding:8px 2px; background:#0d1117; border:1px solid #30363d; color:#ffffff; font-size:16px; font-weight:bold; border-radius:6px; text-align:center;" onchange="window._puanAyarlariUnsaved=true;">
                <button onclick="let i=document.getElementById('pset_${id}'); i.value=(parseFloat(i.value)+${step}).toFixed(1); i.dispatchEvent(new Event('change'));" style="background:#2ea44f; color:white; border:none; border-radius:4px; width:30px; height:36px; font-size:18px; font-weight:bold; cursor:pointer;">+</button>
              </div>
            </div>
          `;
        };'''

if old_renderRow in html:
    html = html.replace(old_renderRow, new_renderRow)
    print('renderRow updated with buttons.')
else:
    print('ERROR: old_renderRow not found.')

# 2. Fix H.savePuanAyarlari
old_save_match = re.search(r'H\.savePuanAyarlari = function \(\) \{.*?(?:alert.*?\}|H\.renderList\(\);\s*alert.*?\});', html, re.DOTALL)

if old_save_match:
    old_save = old_save_match.group(0)
    
    new_save = '''H.savePuanAyarlari = function (btn) {
        if (!window.HavuzMotoru) return;
        
        const ids = [
          'KATSAYI_S15', 'KATSAYI_ALL', 'CARPAN_K1', 'CARPAN_K2', 'CARPAN_K3',
          'PUAN_1_HALKA', 'PUAN_2_HALKA', 'CARPAN_KURAKLIK', 'CARPAN_JOKER',
          'PUAN_ONLUK_KURAKLIK_BONUSU', 'PUAN_KINETIK_IVME_BONUSU', 'PUAN_GECIKMELI_TEKRAR',
          'PUAN_BOLGE_GECISI', 'CEZA_OLU_SAYI_4', 'OLUM_CEZASI_SINIRI', 'CEZA_CIFTE_TEKRAR',
          'CEZA_DOYGUN_4', 'CEZA_DOYGUN_8', 'CEZA_DOYGUN_12', 'CEZA_DOYGUN_16', 'CEZA_IZOLASYON',
          'NORM_TARIHSEL_CAP', 'NORM_GUNCELL_CAP', 'NORM_KURAKLIK_CAP'
        ];
        
        ids.forEach(id => {
          let el = document.getElementById('pset_' + id);
          if (el) {
             let val = parseFloat(el.value);
             if (!isNaN(val)) {
                window.HavuzMotoru.config[id] = val;
             }
          }
        });
        
        try {
            localStorage.setItem('hm_puan_ayarlari', JSON.stringify(window.HavuzMotoru.config));
        } catch(e) {}

        // update the actual inputs in the DOM if they exist
        ids.forEach(id => {
           let uiEl = document.getElementById('hm_' + id);
           if (uiEl) {
              uiEl.value = window.HavuzMotoru.config[id];
              let event = new Event('input');
              uiEl.dispatchEvent(event);
           }
        });

        window._puanAyarlariUnsaved = false;
        
        if(btn) {
            let orgText = btn.innerHTML;
            btn.innerHTML = "✅ KAYDEDİLDİ!";
            btn.style.backgroundColor = "#2ea043";
            
            setTimeout(() => {
                btn.innerHTML = orgText;
                btn.style.backgroundColor = "#238636";
            }, 2000);
        } else {
            // fallback if btn not passed
            let saveBtn = document.querySelector('button[onclick*="savePuanAyarlari"]');
            if(saveBtn) {
               let orgText = saveBtn.innerHTML;
               saveBtn.innerHTML = "✅ KAYDEDİLDİ!";
               saveBtn.style.backgroundColor = "#2ea043";
               setTimeout(() => {
                   saveBtn.innerHTML = orgText;
                   saveBtn.style.backgroundColor = "#238636";
               }, 2000);
            }
        }

        // Live update the table in the background!
        try {
            if (typeof _sc !== 'undefined') _sc = {};
            if (typeof H.renderScore === 'function') H.renderScore();
            if (typeof H.renderList === 'function') H.renderList();
        } catch(e) {
            console.error(e);
        }
      };'''
    
    html = html.replace(old_save, new_save)
    print('H.savePuanAyarlari fixed.')
else:
    print('ERROR: H.savePuanAyarlari not found with regex.')

# 3. Update the button onclick to pass 'this'
btn_old = '<button onclick="H.savePuanAyarlari()"'
btn_new = '<button onclick="H.savePuanAyarlari(this)"'
if btn_old in html:
    html = html.replace(btn_old, btn_new)
    print('Button onclick updated.')

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
