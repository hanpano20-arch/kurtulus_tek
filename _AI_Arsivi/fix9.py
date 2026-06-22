import os

with open('PROMPT_BUILDER_v8_2.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. fix5.py changes (updateConfigFromUI, base_config, mult_config, loadDB, Time Machine UI, scale up)

# A. HavuzMotoru configs
config_old = '''config: {
        YUZDE_SON_15_DONEM: 65,
        YUZDE_TUM_GECMIS: 35,
        PUAN_1_HALKA_KOMSU: 5,
        PUAN_2_HALKA_KOMSU: 3,
        PUAN_ONLUK_KURAKLIK_BONUSU: 8,
        PUAN_KINETIK_IVME_BONUSU: 6,
        PUAN_GECIKMELI_TEKRAR: 7,
        PUAN_BOLGE_GECISI: 5,
        CEZA_OLU_SAYI_4: -10,
        CEZA_CIFTE_TEKRAR: -15,
        CEZA_DOYGUN_4: -5,
        CEZA_DOYGUN_8: -8,
        CEZA_DOYGUN_12: -12,
        CEZA_DOYGUN_16: -16,
        CEZA_IZOLASYON: -100,
        OLUM_CEZASI_SINIRI: 15,
        NORM_TARIHSEL_CAP: 0.10,
        NORM_GUNCELL_CAP: 0.20,
        NORM_KURAKLIK_CAP: 0.15,
        CARPAN_KURAKLIK: 1.5,
        CARPAN_JOKER: 1.2,
        CARPAN_15: 15.0,
        CARPAN_10: 10.0,
        CARPAN_5: 5.0
      },'''

config_new = '''base_config: {
        PUAN_1_HALKA_KOMSU: 5,
        PUAN_2_HALKA_KOMSU: 3,
        PUAN_ONLUK_KURAKLIK_BONUSU: 8,
        PUAN_KINETIK_IVME_BONUSU: 6,
        PUAN_GECIKMELI_TEKRAR: 7,
        CEZA_OLU_SAYI_4: -10,
        CEZA_CIFTE_TEKRAR: -15,
        CEZA_DOYGUN_4: -5,
        CEZA_DOYGUN_8: -8,
        CEZA_DOYGUN_12: -12,
        CEZA_DOYGUN_16: -16,
        CEZA_IZOLASYON: -100
      },
      mult_config: {
        PUAN_1_HALKA_KOMSU: 1.0,
        PUAN_2_HALKA_KOMSU: 1.0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 1.0,
        PUAN_KINETIK_IVME_BONUSU: 1.0,
        PUAN_GECIKMELI_TEKRAR: 1.0,
        CARPAN_KURAKLIK: 1.0,
        CARPAN_JOKER: 1.0,
        CEZA_OLU_SAYI_4: 1.0,
        CEZA_CIFTE_TEKRAR: 1.0,
        CEZA_DOYGUN_4: 1.0,
        CEZA_DOYGUN_8: 1.0,
        CEZA_DOYGUN_12: 1.0,
        CEZA_DOYGUN_16: 1.0,
        CEZA_IZOLASYON: 1.0
      },
      config: {
        YUZDE_SON_15_DONEM: 65,
        YUZDE_TUM_GECMIS: 35,
        PUAN_BOLGE_GECISI: 5,
        OLUM_CEZASI_SINIRI: 15,
        NORM_TARIHSEL_CAP: 0.10,
        NORM_GUNCELL_CAP: 0.20,
        NORM_KURAKLIK_CAP: 0.15,
        CARPAN_15: 15.0,
        CARPAN_10: 10.0,
        CARPAN_5: 5.0
      },'''
if config_old in html:
    html = html.replace(config_old, config_new)

# B. updateConfigFromUI
ucf_old = '''updateConfigFromUI: function () {
        try {
            const pc = localStorage.getItem('hm_puan_ayarlari');
            if (pc) Object.assign(this.config, JSON.parse(pc));
        } catch(e) {}'''

ucf_new = '''updateConfigFromUI: function () {
        try {
            const bc = localStorage.getItem('hm_base_config');
            if (bc) Object.assign(this.base_config, JSON.parse(bc));
            const mc = localStorage.getItem('hm_mult_config');
            if (mc) Object.assign(this.mult_config, JSON.parse(mc));
            const pc = localStorage.getItem('hm_config');
            if (pc) Object.assign(this.config, JSON.parse(pc));
        } catch(e) {}'''
html = html.replace(ucf_old, ucf_new)

# C. calculate rule scores inside puanlari_hesapla
score_old = '''let k1 = (tum_komsular[n] || 0) * conf.PUAN_1_HALKA_KOMSU;
        let k2 = (meta_komsular[n] || 0) * conf.PUAN_2_HALKA_KOMSU;
        let kurakBonus = (meta_kuraklik[n] > 0) ? (conf.PUAN_ONLUK_KURAKLIK_BONUSU * conf.CARPAN_KURAKLIK) : 0;
        let ivmeBonus = (n % 3 === 0) ? conf.PUAN_KINETIK_IVME_BONUSU : 0;
        let gecikmeBonus = (tum_komsular[n] === 0 && meta_komsular[n] === 0) ? conf.PUAN_GECIKMELI_TEKRAR : 0;
        let jokerBonus = (jokerKomsuSayaci[n] || 0) * 12 * conf.CARPAN_JOKER;

        let cezaOlu = (n > 10 && n < 80 && (tum_komsular[n] || 0) === 0) ? conf.CEZA_OLU_SAYI_4 : 0;
        let cezaCifte = (k_hafta[n] && k_hafta[n].length >= 2) ? conf.CEZA_CIFTE_TEKRAR : 0;
        let cezaDoygun = 0;
        let recCount = raw_rec[n] || 0;
        if (recCount >= 4) cezaDoygun += conf.CEZA_DOYGUN_4;
        if (recCount >= 8) cezaDoygun += conf.CEZA_DOYGUN_8;
        if (recCount >= 12) cezaDoygun += conf.CEZA_DOYGUN_12;
        if (recCount >= 16) cezaDoygun += conf.CEZA_DOYGUN_16;

        let cezaIzolasyon = 0;
        let diffToP1 = Math.abs(n - (tum_komsular[n] || n));
        if (diffToP1 > 10 && (tum_komsular[n] || 0) === 0) {
            cezaIzolasyon = conf.CEZA_IZOLASYON;
        }

        let rawScore = k1 + k2 + kurakBonus + ivmeBonus + gecikmeBonus + jokerBonus + cezaOlu + cezaCifte + cezaDoygun + cezaIzolasyon;'''

score_new = '''let bc = this.base_config;
        let mc = this.mult_config;
        
        let k1 = (tum_komsular[n] || 0) * (bc.PUAN_1_HALKA_KOMSU * mc.PUAN_1_HALKA_KOMSU);
        let k2 = (meta_komsular[n] || 0) * (bc.PUAN_2_HALKA_KOMSU * mc.PUAN_2_HALKA_KOMSU);
        let kurakBonus = (meta_kuraklik[n] > 0) ? ((bc.PUAN_ONLUK_KURAKLIK_BONUSU * mc.PUAN_ONLUK_KURAKLIK_BONUSU) * mc.CARPAN_KURAKLIK) : 0;
        let ivmeBonus = (n % 3 === 0) ? (bc.PUAN_KINETIK_IVME_BONUSU * mc.PUAN_KINETIK_IVME_BONUSU) : 0;
        let gecikmeBonus = (tum_komsular[n] === 0 && meta_komsular[n] === 0) ? (bc.PUAN_GECIKMELI_TEKRAR * mc.PUAN_GECIKMELI_TEKRAR) : 0;
        let jokerBonus = (jokerKomsuSayaci[n] || 0) * 12 * mc.CARPAN_JOKER;

        let cezaOlu = (n > 10 && n < 80 && (tum_komsular[n] || 0) === 0) ? (bc.CEZA_OLU_SAYI_4 * mc.CEZA_OLU_SAYI_4) : 0;
        let cezaCifte = (k_hafta[n] && k_hafta[n].length >= 2) ? (bc.CEZA_CIFTE_TEKRAR * mc.CEZA_CIFTE_TEKRAR) : 0;
        let cezaDoygun = 0;
        let recCount = raw_rec[n] || 0;
        if (recCount >= 4) cezaDoygun += (bc.CEZA_DOYGUN_4 * mc.CEZA_DOYGUN_4);
        if (recCount >= 8) cezaDoygun += (bc.CEZA_DOYGUN_8 * mc.CEZA_DOYGUN_8);
        if (recCount >= 12) cezaDoygun += (bc.CEZA_DOYGUN_12 * mc.CEZA_DOYGUN_12);
        if (recCount >= 16) cezaDoygun += (bc.CEZA_DOYGUN_16 * mc.CEZA_DOYGUN_16);

        let cezaIzolasyon = 0;
        let diffToP1 = Math.abs(n - (tum_komsular[n] || n));
        if (diffToP1 > 10 && (tum_komsular[n] || 0) === 0) {
            cezaIzolasyon = (bc.CEZA_IZOLASYON * mc.CEZA_IZOLASYON);
        }

        let rawScore = k1 + k2 + kurakBonus + ivmeBonus + gecikmeBonus + jokerBonus + cezaOlu + cezaCifte + cezaDoygun + cezaIzolasyon;'''
html = html.replace(score_old, score_new)

# D. Slider multiplier logic in updateConfigFromUI
ucf_slider_old = '''const ids = [
            { el: 'hm_hist', key: 'YUZDE_TUM_GECMIS' },
            { el: 'hm_komsu', key: 'PUAN_1_HALKA_KOMSU' },
            { el: 'hm_komsu2', key: 'PUAN_2_HALKA_KOMSU' },
            { el: 'hm_kurak', key: 'CARPAN_KURAKLIK' },
            { el: 'hm_joker', key: 'CARPAN_JOKER' },
            { el: 'hm_onluk', key: 'PUAN_ONLUK_KURAKLIK_BONUSU' },
            { el: 'hm_ivme', key: 'PUAN_KINETIK_IVME_BONUSU' },
            { el: 'hm_gecik', key: 'PUAN_GECIKMELI_TEKRAR' },
            { el: 'hm_olu', key: 'CEZA_OLU_SAYI_4' },
            { el: 'hm_kurak_sinir', key: 'OLUM_CEZASI_SINIRI' },
            { el: 'hm_cifte', key: 'CEZA_CIFTE_TEKRAR' },
            { el: 'hm_c4', key: 'CEZA_DOYGUN_4' },
            { el: 'hm_c8', key: 'CEZA_DOYGUN_8' },
            { el: 'hm_c12', key: 'CEZA_DOYGUN_12' },
            { el: 'hm_c16', key: 'CEZA_DOYGUN_16' },
            { el: 'hm_izolasyon', key: 'CEZA_IZOLASYON' }
        ];

        ids.forEach(item => {
            let el = document.getElementById(item.el);
            if (!el) el = document.getElementById('ws-' + item.el);
            if (el) {
                let val = parseFloat(el.value);
                if (!isNaN(val)) this.config[item.key] = val;
            }
        });'''

ucf_slider_new = '''const ids = [
            { el: 'hm_hist', key: 'YUZDE_TUM_GECMIS', type: 'config' },
            { el: 'hm_komsu', key: 'PUAN_1_HALKA_KOMSU', type: 'mult' },
            { el: 'hm_komsu2', key: 'PUAN_2_HALKA_KOMSU', type: 'mult' },
            { el: 'hm_kurak', key: 'CARPAN_KURAKLIK', type: 'mult' },
            { el: 'hm_joker', key: 'CARPAN_JOKER', type: 'mult' },
            { el: 'hm_onluk', key: 'PUAN_ONLUK_KURAKLIK_BONUSU', type: 'mult' },
            { el: 'hm_ivme', key: 'PUAN_KINETIK_IVME_BONUSU', type: 'mult' },
            { el: 'hm_gecik', key: 'PUAN_GECIKMELI_TEKRAR', type: 'mult' },
            { el: 'hm_olu', key: 'CEZA_OLU_SAYI_4', type: 'mult' },
            { el: 'hm_kurak_sinir', key: 'OLUM_CEZASI_SINIRI', type: 'config' },
            { el: 'hm_cifte', key: 'CEZA_CIFTE_TEKRAR', type: 'mult' },
            { el: 'hm_c4', key: 'CEZA_DOYGUN_4', type: 'mult' },
            { el: 'hm_c8', key: 'CEZA_DOYGUN_8', type: 'mult' },
            { el: 'hm_c12', key: 'CEZA_DOYGUN_12', type: 'mult' },
            { el: 'hm_c16', key: 'CEZA_DOYGUN_16', type: 'mult' },
            { el: 'hm_izolasyon', key: 'CEZA_IZOLASYON', type: 'mult' }
        ];

        ids.forEach(item => {
            let el = document.getElementById(item.el);
            if (!el) el = document.getElementById('ws-' + item.el);
            if (el) {
                let val = parseFloat(el.value);
                if (!isNaN(val)) {
                    if (item.type === 'mult') this.mult_config[item.key] = val;
                    else this.config[item.key] = val;
                }
            }
        });'''
html = html.replace(ucf_slider_old, ucf_slider_new)

# E. loadDB with Time Machine logic
loaddb_old = '''function loadDB() {
      try {
        const v = JSON.parse(localStorage.getItem(dk()) || 'null');
        if (v && Array.isArray(v.entries)) return { entries: v.entries };
      } catch (e) { }
      return { entries: [] };
    }'''

loaddb_new = '''
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
          banner.innerHTML = '<span>⏳ ZAMAN MAKİNESİ AKTİF: ' + window.__timeMachineDate + ' tarihindesiniz. Sonraki çekilişler sistemden gizlendi!</span>' +
                             '<button onclick="setTimeMachine(0, \'\'); if(typeof renderDrawMap===\\'function\\') renderDrawMap();" style="background:#fff;color:#ff4b2b;border:none;padding:5px 15px;border-radius:20px;font-weight:bold;cursor:pointer;">Kapat & Bugüne Dön</button>';
        } else {
          banner.style.display = 'none';
        }
      }

      function loadDB() {
      try {
        const v = JSON.parse(localStorage.getItem(dk()) || 'null');
        if (v && Array.isArray(v.entries)) {
            if (window.__timeMachineOffset > 0 && window.__timeMachineOffset < v.entries.length) {
                return { entries: v.entries.slice(window.__timeMachineOffset) };
            }
            return { entries: v.entries };
        }
      } catch (e) { }
      return { entries: [] };
    }'''
html = html.replace(loaddb_old, loaddb_new)

# F. Time Machine UI block injection
tm_ui = '''
      <!-- ZAMAN MAKİNESİ -->
      <div style="background:rgba(255,193,7,0.1); border:1px solid rgba(255,193,7,0.3); border-radius:8px; padding:10px; margin-bottom:10px; display:flex; align-items:center; gap:10px;">
        <span style="font-size:20px;">⏳</span>
        <div style="flex:1;">
          <h4 style="margin:0 0 5px 0;color:#ffc107;font-size:14px;">Zaman Makinesi (Geçmişe Git)</h4>
          <div style="display:flex; gap:10px; align-items:center;">
            <select id="tm-select" style="padding:6px; border-radius:4px; background:#10373a; color:#fff; border:1px solid #2dbfae; width:200px;">
              <option value="0">Bugündeyim (Kesinti Yok)</option>
            </select>
            <button onclick="let sel = document.getElementById('tm-select'); setTimeMachine(sel.value, sel.options[sel.selectedIndex].text); if(typeof renderDrawMap==='function') renderDrawMap();" class="btn">Uygula</button>
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
          }
          document.addEventListener("DOMContentLoaded", populateTimeMachine);
        </script>
      </div>
'''
html = html.replace('<div class="h-ratio-row">', tm_ui + '\n        <div class="h-ratio-row">')

# G. UI Scaling and formatting (AutoTune UI)
html = html.replace("width:18px;height:18px;", "width:27px;height:27px;")
html = html.replace("line-height:18px;", "line-height:27px;")
html = html.replace("font-size:10px;", "font-size:15px;")
html = html.replace("font-size:13px;", "font-size:19px;")

# Fix date formatting specifically in buildToggleRows or wherever `entry[0]` was rendered raw
# Instead of replacing generically, we'll replace the text in fix9.


# 2. fix7.py changes (openPuanAyarlari, savePuanAyarlari) without regex truncation!

# We'll use split to safely replace `H.openPuanAyarlari` and `H.savePuanAyarlari`.
# For H.openPuanAyarlari, find the start and the first `};` that matches the function block closing.
import re

open_pa_new = '''H.openPuanAyarlari = function () {
        if (!window.HavuzMotoru) return;
        const bc = window.HavuzMotoru.base_config;
        const mc = window.HavuzMotoru.mult_config;
        const c = window.HavuzMotoru.config;

        const baseMultItems = [
          { id: 'PUAN_1_HALKA_KOMSU', label: '1. Halka Komşu Puanı' },
          { id: 'PUAN_2_HALKA_KOMSU', label: '2. Halka Komşu Puanı' },
          { id: 'CARPAN_KURAKLIK', label: 'Kuraklık Çarpanı' },
          { id: 'CARPAN_JOKER', label: 'Joker Çarpanı' },
          { id: 'PUAN_ONLUK_KURAKLIK_BONUSU', label: 'Onluk Kuraklık Bonusu' },
          { id: 'PUAN_KINETIK_IVME_BONUSU', label: 'Kinetik İvme Bonusu' },
          { id: 'PUAN_GECIKMELI_TEKRAR', label: 'Gecikmeli Tekrar Bonusu' },
          { id: 'CEZA_OLU_SAYI_4', label: 'Ölü Sayı Cezası' },
          { id: 'CEZA_CIFTE_TEKRAR', label: 'Çifte Tekrar Cezası' },
          { id: 'CEZA_DOYGUN_4', label: 'Doygun 4 Cezası' },
          { id: 'CEZA_DOYGUN_8', label: 'Doygun 8 Cezası' },
          { id: 'CEZA_DOYGUN_12', label: 'Doygun 12 Cezası' },
          { id: 'CEZA_DOYGUN_16', label: 'Doygun 16 Cezası' },
          { id: 'CEZA_IZOLASYON', label: 'İzolasyon Cezası' }
        ];
        const absItems = [
          { id: 'YUZDE_SON_15_DONEM', label: 'Son 15 Dönem Yüzdesi' },
          { id: 'YUZDE_TUM_GECMIS', label: 'Tüm Geçmiş Yüzdesi' },
          { id: 'PUAN_BOLGE_GECISI', label: 'Bölge Geçişi Puanı' },
          { id: 'OLUM_CEZASI_SINIRI', label: 'Ölüm Cezası Sınırı' },
          { id: 'CARPAN_15', label: 'Çarpan (15)' },
          { id: 'CARPAN_10', label: 'Çarpan (10)' },
          { id: 'CARPAN_5', label: 'Çarpan (5)' },
          { id: 'NORM_TARIHSEL_CAP', label: 'Tarihsel Norm Cap' },
          { id: 'NORM_GUNCELL_CAP', label: 'Güncel Norm Cap' },
          { id: 'NORM_KURAKLIK_CAP', label: 'Kuraklık Norm Cap' }
        ];

        let html = '<div style="max-height:600px;overflow-y:auto;padding-right:10px;">';
        
        html += '<h3 style="color:#ffc107;margin-bottom:10px;">Taban Puanlar ve Çarpanlar</h3>';
        html += '<table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">';
        html += '<tr style="background:#16a89b; color:#fff;">';
        html += '<th style="padding:8px;text-align:left;">Parametre</th>';
        html += '<th style="padding:8px;text-align:center;">Taban Puan</th>';
        html += '<th style="padding:8px;text-align:center;">Mevcut Çarpan</th>';
        html += '</tr>';

        baseMultItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = bc[item.id] !== undefined ? bc[item.id] : 0;
           let multVal = mc[item.id] !== undefined ? mc[item.id] : 1;
           html += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="0.5" style="width:60px;padding:4px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="mult_${item.id}" value="${multVal}" step="0.1" style="width:60px;padding:4px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        html += '</table>';

        html += '<h3 style="color:#ffc107;margin-bottom:10px;">Sabit Ayarlar</h3>';
        html += '<table style="width:100%; border-collapse:collapse; font-size:14px;">';
        absItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let val = c[item.id] !== undefined ? c[item.id] : 0;
           html += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:right;">
               <input type="number" id="pset_${item.id}" value="${val}" step="0.05" style="width:80px;padding:4px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;">
             </td>
           </tr>`;
        });
        html += '</table>';

        html += '</div>';
        
        document.getElementById('pa-content').innerHTML = html;
        H.openModal('puan-modal');
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
        const absIds = [
          'YUZDE_SON_15_DONEM', 'YUZDE_TUM_GECMIS', 'CARPAN_15', 'CARPAN_10', 'CARPAN_5',
          'PUAN_BOLGE_GECISI', 'OLUM_CEZASI_SINIRI', 'NORM_TARIHSEL_CAP', 'NORM_GUNCELL_CAP', 'NORM_KURAKLIK_CAP'
        ];
        absIds.forEach(id => {
          let el = document.getElementById('pset_' + id);
          if (el && !isNaN(parseFloat(el.value))) {
             window.HavuzMotoru.config[id] = parseFloat(el.value);
          }
        });
        
        try {
            localStorage.setItem('hm_base_config', JSON.stringify(window.HavuzMotoru.base_config));
            localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
            localStorage.setItem('hm_config', JSON.stringify(window.HavuzMotoru.config));
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
            
            if (el) {
                let v;
                if (window.HavuzMotoru.mult_config[cfgKey] !== undefined) v = window.HavuzMotoru.mult_config[cfgKey];
                else if (window.HavuzMotoru.config[cfgKey] !== undefined) v = window.HavuzMotoru.config[cfgKey];
                
                if (v !== undefined) {
                    el.value = v;
                    if (valLabel1) valLabel1.textContent = v;
                    if (valLabel2) valLabel2.textContent = v;
                }
            }
        }
        
        H.closeModal('puan-modal');
        
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

# Custom safe replacement function that finds the full bounds of the function block
def safe_replace_function(html, func_prefix, new_code):
    start = html.find(func_prefix)
    if start == -1:
        return html
    
    bracket_count = 0
    in_function = False
    end = -1
    for i in range(start, len(html)):
        if html[i] == '{':
            bracket_count += 1
            in_function = True
        elif html[i] == '}':
            bracket_count -= 1
            if in_function and bracket_count == 0:
                end = i
                break
    
    if end != -1:
        # Check if there's a semicolon right after the bracket
        if end + 1 < len(html) and html[end + 1] == ';':
            end += 1
        return html[:start] + new_code + html[end + 1:]
    return html

html = safe_replace_function(html, "H.openPuanAyarlari = function", open_pa_new)
html = safe_replace_function(html, "H.savePuanAyarlari = function", save_pa_new)

# Date format in `autoTune` HTML building (from buildToggleRows roughly)
html = html.replace('<b>${entry[0]}</b>', '<b>${entry[0].split("-").reverse().join("-")}</b>')

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fix9 applied successfully")
