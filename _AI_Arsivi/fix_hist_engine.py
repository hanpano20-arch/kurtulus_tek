import sys
import re

file_path = r'D:\GitHub\kurtulus_tek\v8_hist_engine.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update savePuanAyarlari
old_save_puan = """      H.savePuanAyarlari = function (btn) {
        if (!window.HavuzMotoru) return;
        
        const allIds = [
          'CARPAN_KURAKLIK', 'CARPAN_JOKER', 'PUAN_1_HALKA_KOMSU', 'PUAN_2_HALKA_KOMSU',
          'PUAN_ONLUK_KURAKLIK_BONUSU', 'PUAN_KINETIK_IVME_BONUSU', 'PUAN_GECIKMELI_TEKRAR',
          'PUAN_BOLGE_GECISI', 'PUAN_KOMBINE_ISINMA', 'PUAN_CAPRAZ_KURAKLIK', 'PUAN_PATLAMAYA_HAZIR',
          'CEZA_OLU_SAYI_4', 'CEZA_CIFTE_TEKRAR', 'CEZA_DOYGUN_4', 'CEZA_DOYGUN_8',
          'CEZA_DOYGUN_12', 'CEZA_DOYGUN_16', 'CEZA_IZOLASYON', 'CEZA_PATLAMAYA_HAZIR',
          'OLUM_CEZASI_SINIRI', 'YUZDE_SON_15_DONEM', 'YUZDE_TUM_GECMIS',
          'CARPAN_15', 'CARPAN_10', 'CARPAN_5'
        ];
        
        allIds.forEach(id => {
          let baseEl = document.getElementById('base_' + id);
          if (baseEl && !isNaN(parseFloat(baseEl.value))) {
             window.HavuzMotoru.base_config[id] = parseFloat(baseEl.value);
             window.HavuzMotoru.config[id] = parseFloat(baseEl.value);
          }
        });

        try {
          localStorage.setItem('hm_base_config', JSON.stringify(window.HavuzMotoru.base_config));
          localStorage.setItem('hm_config', JSON.stringify(window.HavuzMotoru.config));
        } catch (e) { }"""

new_save_puan = """      H.savePuanAyarlari = function (btn) {
        if (!window.HavuzMotoru) return;
        
        const allIds = [
          'TARIHSEL_CARPAN', 'GUNCEL_CARPAN',
          'K1_PUAN', 'K2_PUAN', 'K3_PUAN', 'K4_PUAN', 'K5_PUAN',
          'K6_PUAN', 'K7_PUAN', 'K8_PUAN', 'K9_PUAN', 'K10_PUAN',
          'K11_PUAN', 'K12_PUAN', 'K13_PUAN', 'K14_PUAN_4', 'K14_PUAN_8',
          'K14_PUAN_12', 'K14_PUAN_16', 'K15_PUAN', 'K16_PUAN', 'K17_PUAN', 'K18_PUAN',
          'OLUM_CEZASI_SINIRI'
        ];
        
        allIds.forEach(id => {
          let baseEl = document.getElementById('base_' + id);
          if (baseEl && !isNaN(parseFloat(baseEl.value))) {
             window.HavuzMotoru.mult_config[id] = parseFloat(baseEl.value);
          }
        });

        try {
          localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
        } catch (e) { }"""
content = content.replace(old_save_puan, new_save_puan)

# 2. Update UI sliders safely map
old_id_map = """        // Update UI sliders safely
        const idMap = {
            PUAN_1_HALKA_KOMSU: 'hm_komsu', PUAN_2_HALKA_KOMSU: 'hm_komsu2', CARPAN_KURAKLIK: 'hm_kurak',
            PUAN_ONLUK_KURAKLIK_BONUSU: 'hm_onluk', PUAN_KINETIK_IVME_BONUSU: 'hm_ivme',
            PUAN_GECIKMELI_TEKRAR: 'hm_gecik', CARPAN_JOKER: 'hm_joker',
            CEZA_OLU_SAYI_4: 'hm_olu', OLUM_CEZASI_SINIRI: 'hm_kurak_sinir',
            CEZA_CIFTE_TEKRAR: 'hm_cifte', CEZA_DOYGUN_4: 'hm_c4',
            CEZA_DOYGUN_8: 'hm_c8', CEZA_DOYGUN_12: 'hm_c12', CEZA_DOYGUN_16: 'hm_c16',
            CEZA_IZOLASYON: 'hm_izolasyon'
        };
        
        for (let k in idMap) {
            let sel = document.getElementById('ws-' + idMap[k]);
            if (sel) {
                let val = (k.startsWith('CEZA') || k.startsWith('OLUM')) ? Math.round(window.HavuzMotoru.config[k]) : window.HavuzMotoru.config[k];
                sel.value = val;
            }
        }"""

new_id_map = """        // Update UI sliders safely
        const idMap = {
            K6_PUAN: 'hm_komsu', K7_PUAN: 'hm_komsu2', K4_PUAN: 'hm_kurak',
            K8_PUAN: 'hm_onluk', K9_PUAN: 'hm_ivme',
            K10_PUAN: 'hm_gecik', K5_PUAN: 'hm_joker',
            K12_PUAN: 'hm_olu', OLUM_CEZASI_SINIRI: 'hm_kurak_sinir',
            K13_PUAN: 'hm_cifte', K14_PUAN_4: 'hm_c4',
            K14_PUAN_8: 'hm_c8', K14_PUAN_12: 'hm_c12', K14_PUAN_16: 'hm_c16',
            K16_PUAN: 'hm_izolasyon',
            TARIHSEL_CARPAN: 'hm_tarihsel', GUNCEL_CARPAN: 'hm_guncel'
        };
        
        for (let k in idMap) {
            let sel = document.getElementById('ws-' + idMap[k]);
            if (sel) {
                let val = window.HavuzMotoru.mult_config[k];
                sel.value = val;
                
                // Update label if exists
                let valLabel1 = document.getElementById('wv-' + idMap[k]);
                let valLabel2 = document.getElementById('wlb-' + idMap[k]);
                if (valLabel1) valLabel1.textContent = val;
                if (valLabel2) valLabel2.textContent = val;
            }
        }"""
content = content.replace(old_id_map, new_id_map)

# 3. Update modal structure (showPuanAyarlari)
old_show_puan = """        if (!window.HavuzMotoru) return;
        const bc = window.HavuzMotoru.base_config;
        const c = window.HavuzMotoru.config;

        const bonusItems = [
          { id: 'CARPAN_KURAKLIK', label: 'K4 - Kuraklık Çarpanı' },
          { id: 'CARPAN_JOKER', label: 'K5 - Joker Çarpanı' },
          { id: 'PUAN_1_HALKA_KOMSU', label: 'K6 - 1. Halka Komşu' },
          { id: 'PUAN_2_HALKA_KOMSU', label: 'K7 - 2. Halka Komşu' },
          { id: 'PUAN_ONLUK_KURAKLIK_BONUSU', label: 'K8 - Onluk Blok Bonusu' },
          { id: 'PUAN_KINETIK_IVME_BONUSU', label: 'K9 - Kinetik İvme Bonusu' },
          { id: 'PUAN_GECIKMELI_TEKRAR', label: 'K10 - Gecikmeli Tekrar' },
          { id: 'PUAN_BOLGE_GECISI', label: 'K11 - Bölge Geçişi Puanı' },
          { id: 'PUAN_KOMBINE_ISINMA', label: 'K15 - Tam Isınma (Bonus)' },
          { id: 'PUAN_CAPRAZ_KURAKLIK', label: 'K17 - Çapraz Kuraklık (Bonus)' },
          { id: 'PUAN_PATLAMAYA_HAZIR', label: 'K18 - Patlamaya Hazır (Bonus)' }
        ];

        const cezaItems = [
          { id: 'CEZA_OLU_SAYI_4', label: 'K12 - Aşırı Isınma (Ölü Sayı)' },
          { id: 'CEZA_CIFTE_TEKRAR', label: 'K13 - Çifte Tekrar Cezası' },
          { id: 'CEZA_DOYGUN_4', label: 'K14 - Doygunluk (Son 4)' },
          { id: 'CEZA_DOYGUN_8', label: 'K14 - Doygunluk (Son 8)' },
          { id: 'CEZA_DOYGUN_12', label: 'K14 - Doygunluk (Son 12)' },
          { id: 'CEZA_DOYGUN_16', label: 'K14 - Doygunluk (Son 16)' },
          { id: 'CEZA_IZOLASYON', label: 'K16 - İzolasyon Cezası' },
          { id: 'CEZA_PATLAMAYA_HAZIR', label: 'K18 - Dinamik Seri Kesintisi (Ceza)' },
          { id: 'OLUM_CEZASI_SINIRI', label: 'Ölüm Cezası Sınırı (Genel)' }
        ];

        const generalItems = [
          { id: 'YUZDE_SON_15_DONEM', label: 'G1 - Son 15 Dönem Yüzdesi' },
          { id: 'YUZDE_TUM_GECMIS', label: 'G2 - Tüm Geçmiş Yüzdesi' },
          { id: 'CARPAN_15', label: 'Çarpan (Son 15)' },
          { id: 'CARPAN_10', label: 'Çarpan (Son 10)' },
          { id: 'CARPAN_5', label: 'Çarpan (Son 5)' }
        ];"""

new_show_puan = """        if (!window.HavuzMotoru) return;
        const mc = window.HavuzMotoru.mult_config;

        const mainItems = [
          { id: 'TARIHSEL_CARPAN', label: 'Tarihsel Çarpan', min: 0, max: 10, step: 0.1 },
          { id: 'GUNCEL_CARPAN', label: 'Güncel Çarpan', min: 0, max: 10, step: 0.1 },
          { id: 'K1_PUAN', label: 'K1 - Son 15 Çarpanı', min: 0, max: 10, step: 0.1 },
          { id: 'K2_PUAN', label: 'K2 - Son 10 Çarpanı', min: 0, max: 10, step: 0.1 },
          { id: 'K3_PUAN', label: 'K3 - Son 5 Çarpanı', min: 0, max: 10, step: 0.1 },
          { id: 'K4_PUAN', label: 'K4 - Kuraklık Çarpanı', min: 0, max: 20, step: 0.5 },
          { id: 'K5_PUAN', label: 'K5 - Joker Çarpanı', min: 0, max: 20, step: 0.5 },
          { id: 'K6_PUAN', label: 'K6 - 1. Halka Komşu', min: 0, max: 50, step: 1 },
          { id: 'K7_PUAN', label: 'K7 - 2. Halka Komşu', min: 0, max: 20, step: 1 },
          { id: 'K8_PUAN', label: 'K8 - Onluk Blok Bonusu', min: 0, max: 50, step: 1 },
          { id: 'K9_PUAN', label: 'K9 - Kinetik İvme', min: 0, max: 100, step: 1 },
          { id: 'K10_PUAN', label: 'K10 - Gecikmeli Tekrar', min: 0, max: 50, step: 1 },
          { id: 'K11_PUAN', label: 'K11 - Bölge Geçişi', min: 0, max: 50, step: 1 },
          { id: 'K12_PUAN', label: 'K12 - Aşırı Isınma Cezası', min: -200, max: 0, step: 5 },
          { id: 'K13_PUAN', label: 'K13 - Çifte Tekrar Cezası', min: -500, max: 0, step: 10 },
          { id: 'K14_PUAN_4', label: 'K14 - Doygunluk (Son 4)', min: -500, max: 0, step: 10 },
          { id: 'K14_PUAN_8', label: 'K14 - Doygunluk (Son 8)', min: -500, max: 0, step: 10 },
          { id: 'K14_PUAN_12', label: 'K14 - Doygunluk (Son 12)', min: -500, max: 0, step: 10 },
          { id: 'K14_PUAN_16', label: 'K14 - Doygunluk (Son 16)', min: -500, max: 0, step: 10 },
          { id: 'K15_PUAN', label: 'K15 - Tam Isınma (Bonus)', min: 0, max: 100, step: 1 },
          { id: 'K16_PUAN', label: 'K16 - İzolasyon Cezası', min: -200, max: 0, step: 5 },
          { id: 'K17_PUAN', label: 'K17 - Çapraz Kuraklık', min: 0, max: 50, step: 1 },
          { id: 'K18_PUAN', label: 'K18 - Dinamik Seri', min: -100, max: 50, step: 1 },
          { id: 'OLUM_CEZASI_SINIRI', label: 'Ölüm Cezası Sınırı (K4 için)', min: 10, max: 100, step: 1 }
        ];"""
content = content.replace(old_show_puan, new_show_puan)

# Now we need to update the modalHTML generation string
modalHTML_old = """              <!-- BONUSLAR -->
              <div>
                <h3 style="color:#39ff14; margin-bottom:10px; border-bottom:1px solid #39ff14; padding-bottom:5px;">Bonuslar (K1 - K11, K15, K17, K18)</h3>
                <table style="width:100%; border-collapse:collapse; font-size:14px;">
                  <tr style="background:#16a89b; color:#fff;">
                    <th style="padding:8px;text-align:left;">Parametre</th>
                    <th style="padding:8px;text-align:center;">Puan (Base)</th>
                  </tr>`;
        bonusItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = bc[item.id] !== undefined ? bc[item.id] : 0;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="0.5" oninput="window._puanAyarlariUnsaved=true;" style="width:70px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        modalHTML += `</table></div>

              <!-- CEZALAR -->
              <div>
                <h3 style="color:#ff4444; margin-bottom:10px; border-bottom:1px solid #ff4444; padding-bottom:5px;">Cezalar (K12 - K14, K16, K18)</h3>
                <table style="width:100%; border-collapse:collapse; font-size:14px;">
                  <tr style="background:#8b0000; color:#fff;">
                    <th style="padding:8px;text-align:left;">Parametre</th>
                    <th style="padding:8px;text-align:center;">Puan (Base)</th>
                  </tr>`;
        cezaItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = bc[item.id] !== undefined ? bc[item.id] : 0;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="0.5" oninput="window._puanAyarlariUnsaved=true;" style="width:70px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        modalHTML += `</table></div>

              <!-- GENEL AYARLAR -->
              <div>
                <h3 style="color:#ffc107; margin-bottom:10px; border-bottom:1px solid #ffc107; padding-bottom:5px;">Genel Çarpanlar ve Yüzdeler</h3>
                <table style="width:100%; border-collapse:collapse; font-size:14px;">
                  <tr style="background:#a67c00; color:#fff;">
                    <th style="padding:8px;text-align:left;">Parametre</th>
                    <th style="padding:8px;text-align:center;">Değer</th>
                  </tr>`;
        generalItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = bc[item.id] !== undefined ? bc[item.id] : 0;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="0.5" oninput="window._puanAyarlariUnsaved=true;" style="width:70px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        modalHTML += `</table></div>"""

modalHTML_new = """              <!-- KURAL LİSTESİ -->
              <div>
                <table style="width:100%; border-collapse:collapse; font-size:14px;">
                  <tr style="background:#16a89b; color:#fff;">
                    <th style="padding:8px;text-align:left;">Kural / Çarpan Adı</th>
                    <th style="padding:8px;text-align:center;">Değer (Çarpan/Puan)</th>
                  </tr>`;
        mainItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = mc[item.id] !== undefined ? mc[item.id] : 0;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="${item.step}" min="${item.min}" max="${item.max}" oninput="window._puanAyarlariUnsaved=true;" style="width:90px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        modalHTML += `</table></div>"""

content = content.replace(modalHTML_old, modalHTML_new)

# Update resetManual to map correctly
reset_old = """        try {
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
        } catch(e) {}"""

reset_new = """        try {
            const pa = localStorage.getItem('hm_mult_config');
            if (pa) {
                const parsed = JSON.parse(pa);
                const uiMapping = {
                    'K6_PUAN':'hm_komsu','K7_PUAN':'hm_komsu2','K4_PUAN':'hm_kurak',
                    'K5_PUAN':'hm_joker','K8_PUAN':'hm_onluk','K9_PUAN':'hm_ivme',
                    'K10_PUAN':'hm_gecik','K12_PUAN':'hm_olu','OLUM_CEZASI_SINIRI':'hm_kurak_sinir',
                    'K13_PUAN':'hm_cifte','K14_PUAN_4':'hm_c4','K14_PUAN_8':'hm_c8',
                    'K14_PUAN_12':'hm_c12','K14_PUAN_16':'hm_c16','K16_PUAN':'hm_izolasyon',
                    'TARIHSEL_CARPAN':'hm_tarihsel', 'GUNCEL_CARPAN':'hm_guncel'
                };
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
        } catch(e) {}"""
content = content.replace(reset_old, reset_new)

# Remove k19, k20, k21 from rules array in renderDetailedTable
rules_old = """          { id: 'k19', name: 'K19-DikeyPres', desc: `
            <div style="text-align:left">
              <div style="color:#39ff14; font-size:15px; font-weight:bold; margin-bottom:8px;">📌 Ne İşe Yarar?</div>
              <p>Bir sayının matris tablosunda hem altındaki hem üstündeki sayı çıkmışsa ortada sıkışmıştır.</p>
              <div style="color:#ffd93d; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">⚙️ Nasıl Çalışır?</div>
              <p>(Bu kural K6 Grid-Aware sistemi içine entegre edilmiştir. K6 üzerinden sayılır.)</p>
              <div style="color:#6bcb77; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">💡 Örnek</div>
              <p>n-10 ve n+10 çıkmışsa aradaki n sayısı yüksek baskı altındadır.</p>
              <div style="color:#53f0db; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">📊 Etki</div>
              <p>K6 puanı olarak yansır.</p>
            </div>` },
          { id: 'k20', name: 'K20-DikeyKomşu', desc: `
            <div style="text-align:left">
              <div style="color:#39ff14; font-size:15px; font-weight:bold; margin-bottom:8px;">📌 Ne İşe Yarar?</div>
              <p>Altındaki veya üstündeki komşusu son 3 çekilişte çıkmışsa dikey etkileşim puanı alır.</p>
              <div style="color:#ffd93d; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">⚙️ Nasıl Çalışır?</div>
              <p>(Bu kural K6 Grid-Aware sistemi içine entegre edilmiştir. K6 üzerinden sayılır.)</p>
              <div style="color:#6bcb77; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">💡 Örnek</div>
              <p>45'in altındaki 55 çıktıysa 45 dikey komşuluk kazanır.</p>
              <div style="color:#53f0db; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">📊 Etki</div>
              <p>K6 puanı olarak yansır.</p>
            </div>` },
          { id: 'k21', name: 'K21-ÇaprazKomşu', desc: `
            <div style="text-align:left">
              <div style="color:#39ff14; font-size:15px; font-weight:bold; margin-bottom:8px;">📌 Ne İşe Yarar?</div>
              <p>Çaprazındaki sayılardan biri son 3 çekilişte çıkmışsa çapraz etkileşim puanı alır.</p>
              <div style="color:#ffd93d; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">⚙️ Nasıl Çalışır?</div>
              <p>(Bu kural K6 Grid-Aware sistemi içine entegre edilmiştir. K6 üzerinden sayılır.)</p>
              <div style="color:#6bcb77; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">💡 Örnek</div>
              <p>45'in çaprazındaki 34 çıktıysa 45 çapraz komşuluk kazanır.</p>
              <div style="color:#53f0db; font-size:15px; font-weight:bold; margin-bottom:8px; margin-top:15px;">📊 Etki</div>
              <p>K6 puanı olarak yansır.</p>
            </div>` }"""

content = content.replace(rules_old, "")
content = content.replace("            res += fmt(details.k19);\n", "")
content = content.replace("            res += fmt(details.k20);\n", "")
content = content.replace("            res += fmt(details.k21);\n", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("v8_hist_engine.js updated successfully.")
