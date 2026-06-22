import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_save_match = re.search(r'H\.savePuanAyarlari = function \(btn\) \{.*?\};\s*', html, re.DOTALL)
if old_save_match:
    old_save = old_save_match.group(0)
    new_save = '''H.savePuanAyarlari = function (btn) {
        if (!window.HavuzMotoru) return;
        
        const ids = [
          'YUZDE_SON_15_DONEM', 'YUZDE_TUM_GECMIS', 'CARPAN_15', 'CARPAN_10', 'CARPAN_5',
          'PUAN_1_HALKA_KOMSU', 'PUAN_2_HALKA_KOMSU', 'CARPAN_KURAKLIK', 'CARPAN_JOKER',
          'PUAN_ONLUK_KURAKLIK_BONUSU', 'PUAN_KINETIK_IVME_BONUSU', 'PUAN_GECIKMELI_TEKRAR',
          'PUAN_BOLGE_GECISI', 'CEZA_OLU_SAYI_4', 'CEZA_CIFTE_TEKRAR', 'CEZA_DOYGUN_4',
          'CEZA_DOYGUN_8', 'CEZA_DOYGUN_12', 'CEZA_DOYGUN_16', 'CEZA_IZOLASYON',
          'OLUM_CEZASI_SINIRI', 'NORM_TARIHSEL_CAP', 'NORM_GUNCELL_CAP', 'NORM_KURAKLIK_CAP'
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
           if (!uiEl) uiEl = document.getElementById(id); // fallback
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
            if (typeof H.runAll === 'function') {
                H.runAll();
            } else {
                if (typeof H.compute === 'function') H.compute();
                if (typeof H.renderScore === 'function') H.renderScore();
                if (typeof H.renderList === 'function') H.renderList();
            }
        } catch(e) {
            console.error(e);
        }
      };
'''
    
    html = html.replace(old_save, new_save)
    print('H.savePuanAyarlari fixed with CORRECT IDs and H.runAll().')
else:
    print('ERROR: H.savePuanAyarlari not found!')

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
