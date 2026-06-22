import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update updateConfigFromUI
new_update = '''updateConfigFromUI: function () {
        try {
            const pa = localStorage.getItem('hm_puan_ayarlari');
            if (pa) {
                const parsed = JSON.parse(pa);
                for (let k in parsed) {
                    this.config[k] = parsed[k];
                }
            }
        } catch(e) {}
        
        const val = (id) => {
            const el = document.getElementById('ws-' + id);
            return el ? parseFloat(el.value) : undefined;
        };
        
        // Let sliders override the loaded config (so moving sliders works)
        if(val('hm_hist') !== undefined) this.config.YUZDE_TUM_GECMIS = val('hm_hist');
        this.config.YUZDE_SON_15_DONEM = 100 - this.config.YUZDE_TUM_GECMIS;
        if(val('hm_komsu') !== undefined) this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu');
        if(val('hm_komsu2') !== undefined) this.config.PUAN_2_HALKA_KOMSU = val('hm_komsu2');
        if(val('hm_kurak') !== undefined) this.config.CARPAN_KURAKLIK = val('hm_kurak');
        if(val('hm_joker') !== undefined) this.config.CARPAN_JOKER = val('hm_joker');
        if(val('hm_onluk') !== undefined) this.config.PUAN_ONLUK_KURAKLIK_BONUSU = val('hm_onluk');
        if(val('hm_ivme') !== undefined) this.config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme');
        if(val('hm_gecik') !== undefined) this.config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik');
        if(val('hm_olu') !== undefined) this.config.CEZA_OLU_SAYI_4 = val('hm_olu');
        if(val('hm_kurak_sinir') !== undefined) this.config.OLUM_CEZASI_SINIRI = val('hm_kurak_sinir');
        if(val('hm_cifte') !== undefined) this.config.CEZA_CIFTE_TEKRAR = val('hm_cifte');
        if(val('hm_c4') !== undefined) this.config.CEZA_DOYGUN_4 = val('hm_c4');
        if(val('hm_c8') !== undefined) this.config.CEZA_DOYGUN_8 = val('hm_c8');
        if(val('hm_c12') !== undefined) this.config.CEZA_DOYGUN_12 = val('hm_c12');
        if(val('hm_c16') !== undefined) this.config.CEZA_DOYGUN_16 = val('hm_c16');
        if(val('hm_izolasyon') !== undefined) this.config.CEZA_IZOLASYON = val('hm_izolasyon');
        
        // Keep localStorage updated with the slider states
        try {
            localStorage.setItem('hm_puan_ayarlari', JSON.stringify(this.config));
        } catch(e) {}
      },'''

old_update = re.search(r'updateConfigFromUI: function \(\) \{.*?(?:catch\(e\) \{\}\s*\},)', html, re.DOTALL)
if old_update:
    html = html.replace(old_update.group(0), new_update)
else:
    print('ERROR: old_update not found')

# 2. Modify H.savePuanAyarlari
new_save_injection = '''
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
        // ---------------------------------------
'''

html = html.replace('''try {
            localStorage.setItem('hm_puan_ayarlari', JSON.stringify(window.HavuzMotoru.config));
        } catch(e) {}''', new_save_injection)


# 3. Modify init()
old_init_load = '''window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla'''
new_init_load = '''
        // Sync sliders on initial load from localStorage
        try {
            const pa = localStorage.getItem('hm_puan_ayarlari');
            if (pa) {
                const parsed = JSON.parse(pa);
                const uiMapping = {'YUZDE_TUM_GECMIS':'hm_hist','PUAN_1_HALKA_KOMSU':'hm_komsu','PUAN_2_HALKA_KOMSU':'hm_komsu2','CARPAN_KURAKLIK':'hm_kurak','CARPAN_JOKER':'hm_joker','PUAN_ONLUK_KURAKLIK_BONUSU':'hm_onluk','PUAN_KINETIK_IVME_BONUSU':'hm_ivme','PUAN_GECIKMELI_TEKRAR':'hm_gecik','CEZA_OLU_SAYI_4':'hm_olu','OLUM_CEZASI_SINIRI':'hm_kurak_sinir','CEZA_CIFTE_TEKRAR':'hm_cifte','CEZA_DOYGUN_4':'hm_c4','CEZA_DOYGUN_8':'hm_c8','CEZA_DOYGUN_12':'hm_c12','CEZA_DOYGUN_16':'hm_c16','CEZA_IZOLASYON':'hm_izolasyon'};
                for (let cfgKey in uiMapping) {
                    let sliderId = uiMapping[cfgKey];
                    let el = document.getElementById('ws-' + sliderId);
                    if (el && parsed[cfgKey] !== undefined) {
                        el.value = parsed[cfgKey];
                        let valLabel1 = document.getElementById('wv-' + sliderId);
                        let valLabel2 = document.getElementById('wlb-' + sliderId);
                        if (valLabel1) valLabel1.textContent = parsed[cfgKey];
                        if (valLabel2) valLabel2.textContent = parsed[cfgKey];
                    }
                }
            }
        } catch(e) {}

        window.HavuzMotoru.updateConfigFromUI(); const hm_sc = window.HavuzMotoru.puanlari_hesapla'''

if old_init_load in html:
    html = html.replace(old_init_load, new_init_load)
else:
    print('ERROR: old_init_load not found')

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
