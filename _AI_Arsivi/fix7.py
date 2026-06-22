import re

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('\\r\\n', '\\n')

save_pa_orig = '''H.savePuanAyarlari = function (btn) {
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

        // --- SYNC CONFIG TO MAIN PAGE SLIDERS ---
        const uiMapping = {
            'YUZDE_TUM_GECMIS': 'hm_hist',
            'PUAN_1_HALKA_KOMSU': 'hm_komsu',
            'PUAN_2_HALKA_KOMSU': 'hm_komsu2',
            'CARPAN_KURAKLIK': 'hm_kurak',
            'CARPAN_JOKER': 'hm_joker',
            'PUAN_ONLUK_KURAKLIK_BONUSU': 'hm_onluk',
            'PUAN_KINETIK_IVME_BONUSU': 'hm_ivme',
            'PUAN_GECIKMELI_TEKRAR': 'hm_gecik',
            'CEZA_OLU_SAYI_4': 'hm_olu',
            'OLUM_CEZASI_SINIRI': 'hm_kurak_sinir',
            'CEZA_CIFTE_TEKRAR': 'hm_cifte',
            'CEZA_DOYGUN_4': 'hm_c4',
            'CEZA_DOYGUN_8': 'hm_c8',
            'CEZA_DOYGUN_12': 'hm_c12',
            'CEZA_DOYGUN_16': 'hm_c16',
            'CEZA_IZOLASYON': 'hm_izolasyon'
        };
        for (let cfgKey in uiMapping) {
            let sliderId = uiMapping[cfgKey];
            let el = document.getElementById('ws-' + sliderId);
            let valLabel1 = document.getElementById('wv-' + sliderId);
            let valLabel2 = document.getElementById('wlb-' + sliderId);
            
            if (el && window.HavuzMotoru.config[cfgKey] !== undefined) {
                let v = window.HavuzMotoru.config[cfgKey];
                el.value = v;
                if (valLabel1) valLabel1.textContent = v;
                if (valLabel2) valLabel2.textContent = v;
            }
        }
        
        const b = btn;
        if(b) {
            b.innerText = "Kaydedildi!";
            b.style.background = "#28a745";
            setTimeout(()=>{
                b.innerText = "Değişiklikleri Kaydet";
                b.style.background = "";
            }, 1500);
        }
    };'''

save_pa_new = '''H.savePuanAyarlari = function (btn) {
        if (!window.HavuzMotoru) return;
        
        const baseMultIds = [
          'PUAN_1_HALKA_KOMSU', 'PUAN_2_HALKA_KOMSU', 'CARPAN_KURAKLIK', 'CARPAN_JOKER',
          'PUAN_ONLUK_KURAKLIK_BONUSU', 'PUAN_KINETIK_IVME_BONUSU', 'PUAN_GECIKMELI_TEKRAR',
          'CEZA_OLU_SAYI_4', 'CEZA_CIFTE_TEKRAR', 'CEZA_DOYGUN_4', 'CEZA_DOYGUN_8',
          'CEZA_DOYGUN_12', 'CEZA_DOYGUN_16', 'CEZA_IZOLASYON'
        ];
        
        baseMultIds.forEach(id => {
          let baseEl = document.getElementById('base_' + id);
          if (baseEl && !isNaN(parseFloat(baseEl.value))) {
             window.HavuzMotoru.base_config[id] = parseFloat(baseEl.value);
          }
          let multEl = document.getElementById('mult_' + id);
          if (multEl && !isNaN(parseFloat(multEl.value))) {
             window.HavuzMotoru.mult_config[id] = parseFloat(multEl.value);
          }
        });

        // Absolutes
        const absIds = ['YUZDE_TUM_GECMIS', 'OLUM_CEZASI_SINIRI'];
        absIds.forEach(id => {
          let el = document.getElementById('base_' + id);
          if (el && !isNaN(parseFloat(el.value))) {
             window.HavuzMotoru.config[id] = parseFloat(el.value);
          }
        });
        window.HavuzMotoru.config.YUZDE_SON_15_DONEM = 100 - window.HavuzMotoru.config.YUZDE_TUM_GECMIS;
        
        try {
            localStorage.setItem('hm_base_config', JSON.stringify(window.HavuzMotoru.base_config));
            localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
            localStorage.setItem('hm_config', JSON.stringify(window.HavuzMotoru.config));
        } catch(e) {}

        // --- SYNC MULT_CONFIG TO MAIN PAGE SLIDERS ---
        const uiMapping = {
            'YUZDE_TUM_GECMIS': 'hm_hist',
            'OLUM_CEZASI_SINIRI': 'hm_kurak_sinir'
        };
        for (let cfgKey in uiMapping) {
            let sliderId = uiMapping[cfgKey];
            let el = document.getElementById('ws-' + sliderId);
            let valLabel1 = document.getElementById('wv-' + sliderId);
            let valLabel2 = document.getElementById('wlb-' + sliderId);
            if (el && window.HavuzMotoru.config[cfgKey] !== undefined) {
                let v = window.HavuzMotoru.config[cfgKey];
                el.value = v;
                if (valLabel1) valLabel1.textContent = v;
                if (valLabel2) valLabel2.textContent = v;
            }
        }

        const multMapping = {
            'PUAN_1_HALKA_KOMSU': 'hm_komsu',
            'PUAN_2_HALKA_KOMSU': 'hm_komsu2',
            'CARPAN_KURAKLIK': 'hm_kurak',
            'CARPAN_JOKER': 'hm_joker',
            'PUAN_ONLUK_KURAKLIK_BONUSU': 'hm_onluk',
            'PUAN_KINETIK_IVME_BONUSU': 'hm_ivme',
            'PUAN_GECIKMELI_TEKRAR': 'hm_gecik',
            'CEZA_OLU_SAYI_4': 'hm_olu',
            'CEZA_CIFTE_TEKRAR': 'hm_cifte',
            'CEZA_DOYGUN_4': 'hm_c4',
            'CEZA_DOYGUN_8': 'hm_c8',
            'CEZA_DOYGUN_12': 'hm_c12',
            'CEZA_DOYGUN_16': 'hm_c16',
            'CEZA_IZOLASYON': 'hm_izolasyon'
        };
        for (let cfgKey in multMapping) {
            let sliderId = multMapping[cfgKey];
            let el = document.getElementById('ws-' + sliderId);
            let valLabel1 = document.getElementById('wv-' + sliderId);
            let valLabel2 = document.getElementById('wlb-' + sliderId);
            if (el && window.HavuzMotoru.mult_config[cfgKey] !== undefined) {
                let v = window.HavuzMotoru.mult_config[cfgKey];
                el.value = v;
                if (valLabel1) valLabel1.textContent = v;
                if (valLabel2) valLabel2.textContent = v;
            }
        }
        
        const b = btn;
        if(b) {
            b.innerText = "Kaydedildi!";
            b.style.background = "#28a745";
            setTimeout(()=>{
                b.innerText = "Değişiklikleri Kaydet";
                b.style.background = "";
            }, 1500);
        }
    };'''

save_pa_orig = save_pa_orig.replace('\\r\\n', '\\n')

if save_pa_orig in html:
    html = html.replace(save_pa_orig, save_pa_new)
    print("H.savePuanAyarlari replaced")
else:
    print("Could not find H.savePuanAyarlari, using regex...")
    # Use regex
    html = re.sub(r"H\.savePuanAyarlari\s*=\s*function\s*\(btn\)\s*\{.*?\};", save_pa_new, html, flags=re.DOTALL)
    print("Used regex for savePuanAyarlari")


with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
