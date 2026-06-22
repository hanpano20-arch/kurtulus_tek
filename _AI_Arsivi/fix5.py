import re
import json

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Initial length:", len(html))

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


# 2. Base + Multiplier Architecture

# 2.1 Puan Ayarları HTML
pa_html_orig = '''function savePuanAyarlari() {
        const uiMapping = {'YUZDE_TUM_GECMIS':'hm_hist','PUAN_1_HALKA_KOMSU':'hm_komsu','PUAN_2_HALKA_KOMSU':'hm_komsu2','CARPAN_KURAKLIK':'hm_kurak','CARPAN_JOKER':'hm_joker','PUAN_ONLUK_KURAKLIK_BONUSU':'hm_onluk','PUAN_KINETIK_IVME_BONUSU':'hm_ivme','PUAN_GECIKMELI_TEKRAR':'hm_gecik','CEZA_OLU_SAYI_4':'hm_olu','OLUM_CEZASI_SINIRI':'hm_kurak_sinir','CEZA_CIFTE_TEKRAR':'hm_cifte','CEZA_DOYGUN_4':'hm_c4','CEZA_DOYGUN_8':'hm_c8','CEZA_DOYGUN_12':'hm_c12','CEZA_DOYGUN_16':'hm_c16','CEZA_IZOLASYON':'hm_izolasyon'};'''

pa_html_new = '''function savePuanAyarlari() {
        const idMap = [
          {id:'PUAN_1_HALKA_KOMSU'},{id:'PUAN_2_HALKA_KOMSU'},{id:'CARPAN_KURAKLIK'},{id:'CARPAN_JOKER'},
          {id:'PUAN_ONLUK_KURAKLIK_BONUSU'},{id:'PUAN_KINETIK_IVME_BONUSU'},{id:'PUAN_GECIKMELI_TEKRAR'},
          {id:'CEZA_OLU_SAYI_4'},{id:'CEZA_CIFTE_TEKRAR'},{id:'CEZA_DOYGUN_4'},{id:'CEZA_DOYGUN_8'},
          {id:'CEZA_DOYGUN_12'},{id:'CEZA_DOYGUN_16'},{id:'CEZA_IZOLASYON'}
        ];
        
        idMap.forEach(item => {
            const baseInput = document.getElementById('base-' + item.id);
            if (baseInput) window.HavuzMotoru.base_config[item.id] = parseFloat(baseInput.value);
            const multInput = document.getElementById('mult-' + item.id);
            if (multInput) window.HavuzMotoru.mult_config[item.id] = parseFloat(multInput.value);
        });

        // Absolutes
        const histInput = document.getElementById('base-YUZDE_TUM_GECMIS');
        if (histInput) {
            window.HavuzMotoru.config.YUZDE_TUM_GECMIS = parseFloat(histInput.value);
            window.HavuzMotoru.config.YUZDE_SON_15_DONEM = 100 - window.HavuzMotoru.config.YUZDE_TUM_GECMIS;
        }
        const sinirInput = document.getElementById('base-OLUM_CEZASI_SINIRI');
        if (sinirInput) window.HavuzMotoru.config.OLUM_CEZASI_SINIRI = parseFloat(sinirInput.value);

        try {
            localStorage.setItem('hm_base_config', JSON.stringify(window.HavuzMotoru.base_config));
            localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
            localStorage.setItem('hm_config', JSON.stringify(window.HavuzMotoru.config));
        } catch(e) {}
        
        window.HavuzMotoru.updateConfigFromUI(); // Sync sliders back
        H.closeModal('puan-modal');
        alert("Puan Ayarları (Taban Puanlar ve Çarpanlar) kaydedildi!");
      }
      
      // We will define a dummy variable so the rest of the original code replacing doesn't break
      const uiMapping = {'YUZDE_TUM_GECMIS':'hm_hist','PUAN_1_HALKA_KOMSU':'hm_komsu','PUAN_2_HALKA_KOMSU':'hm_komsu2','CARPAN_KURAKLIK':'hm_kurak','CARPAN_JOKER':'hm_joker','PUAN_ONLUK_KURAKLIK_BONUSU':'hm_onluk','PUAN_KINETIK_IVME_BONUSU':'hm_ivme','PUAN_GECIKMELI_TEKRAR':'hm_gecik','CEZA_OLU_SAYI_4':'hm_olu','OLUM_CEZASI_SINIRI':'hm_kurak_sinir','CEZA_CIFTE_TEKRAR':'hm_cifte','CEZA_DOYGUN_4':'hm_c4','CEZA_DOYGUN_8':'hm_c8','CEZA_DOYGUN_12':'hm_c12','CEZA_DOYGUN_16':'hm_c16','CEZA_IZOLASYON':'hm_izolasyon'};'''

if pa_html_orig in html:
    html = html.replace(pa_html_orig, pa_html_new)
    print("savePuanAyarlari replaced")

render_pa_orig = '''H.openPuanAyarlari = function () {
        const c = this.config;
        const configItems = [
          {id:'YUZDE_TUM_GECMIS', label:'Geçmiş Data Ağırlığı (%)', desc:'Geçmişin modele etkisi.', val:c.YUZDE_TUM_GECMIS!==undefined?c.YUZDE_TUM_GECMIS:35},
          {id:'PUAN_1_HALKA_KOMSU', label:'K6 - 1. Halka Komşu Puanı', desc:'Bitişik komşular için verilen birim puan.', val:c.PUAN_1_HALKA_KOMSU!==undefined?c.PUAN_1_HALKA_KOMSU:5},
          {id:'PUAN_2_HALKA_KOMSU', label:'K7 - 2. Halka Komşu Puanı', desc:'2. halka komşular için verilen birim puan.', val:c.PUAN_2_HALKA_KOMSU!==undefined?c.PUAN_2_HALKA_KOMSU:2},
          {id:'CARPAN_KURAKLIK', label:'K5 - Derin Kuraklık Çarpanı', desc:'Uzun süre çıkmayan sayıların çıkma ihtimali için çarpan.', val:c.CARPAN_KURAKLIK!==undefined?c.CARPAN_KURAKLIK:2.0},
          {id:'CARPAN_JOKER', label:'K13 - Joker Çarpanı', desc:'Joker sayılarının komşuluk etkisi.', val:c.CARPAN_JOKER!==undefined?c.CARPAN_JOKER:5.0},
          {id:'PUAN_ONLUK_KURAKLIK_BONUSU', label:'K10 - Bölgesel Boşluk Puanı', desc:'Boş kalan onluk dilimlere verilen bonus.', val:c.PUAN_ONLUK_KURAKLIK_BONUSU!==undefined?c.PUAN_ONLUK_KURAKLIK_BONUSU:20},
          {id:'PUAN_KINETIK_IVME_BONUSU', label:'K8 - Kinetik İvme Bonusu', desc:'Hızla çıkmaya başlayan sayılara ivme bonusu.', val:c.PUAN_KINETIK_IVME_BONUSU!==undefined?c.PUAN_KINETIK_IVME_BONUSU:25},
          {id:'PUAN_GECIKMELI_TEKRAR', label:'K12 - Gecikmeli Tekrar Puanı', desc:'Ara verip tekrar çıkan sayılara bonus.', val:c.PUAN_GECIKMELI_TEKRAR!==undefined?c.PUAN_GECIKMELI_TEKRAR:15},
          {id:'CEZA_OLU_SAYI_4', label:'K11 - Düşük Frekans Cezası', desc:'Son 25 çekilişte az çıkanlara ceza.', val:c.CEZA_OLU_SAYI_4!==undefined?c.CEZA_OLU_SAYI_4:-100},
          {id:'OLUM_CEZASI_SINIRI', label:'K14 - Ölüm Cezası Sınırı', desc:'Cezanın uygulanacağı max hafta sayısı.', val:c.OLUM_CEZASI_SINIRI!==undefined?c.OLUM_CEZASI_SINIRI:22},
          {id:'CEZA_CIFTE_TEKRAR', label:'K3 - Çifte Tekrar Cezası', desc:'Çok kısa sürede tekrar edenlere ceza.', val:c.CEZA_CIFTE_TEKRAR!==undefined?c.CEZA_CIFTE_TEKRAR:-100},
          {id:'CEZA_DOYGUN_4', label:'K15 - Aşırı Doygunluk (4) Cezası', desc:'Kısa sürede 4 kez çıkanlara ceza.', val:c.CEZA_DOYGUN_4!==undefined?c.CEZA_DOYGUN_4:-20},
          {id:'CEZA_DOYGUN_8', label:'K15 - Aşırı Doygunluk (8) Cezası', desc:'Kısa sürede 8 kez çıkanlara ceza.', val:c.CEZA_DOYGUN_8!==undefined?c.CEZA_DOYGUN_8:-40},
          {id:'CEZA_DOYGUN_12', label:'K15 - Aşırı Doygunluk (12) Cezası', desc:'Kısa sürede 12 kez çıkanlara ceza.', val:c.CEZA_DOYGUN_12!==undefined?c.CEZA_DOYGUN_12:-80},
          {id:'CEZA_DOYGUN_16', label:'K15 - Aşırı Doygunluk (16) Cezası', desc:'Kısa sürede 16 kez çıkanlara ceza.', val:c.CEZA_DOYGUN_16!==undefined?c.CEZA_DOYGUN_16:-120},
          {id:'CEZA_IZOLASYON', label:'K16 - İzolasyon Cezası', desc:'Etrafında hiç komşu olmayan sayılara ceza.', val:c.CEZA_IZOLASYON!==undefined?c.CEZA_IZOLASYON:100}
        ];
        
        let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
        configItems.forEach(item => {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px; border:1px solid #444;">
              <div style="flex:1;">
                <div style="font-weight:bold; color:#53f0db; font-size:13px;">${item.label}</div>
                <div style="font-size:10px; color:#aaa;">${item.desc}</div>
              </div>
              <input type="number" id="pa-${item.id}" value="${item.val}" style="width:70px; padding:4px; border-radius:4px; border:1px solid #53f0db; background:#111; color:#fff; text-align:right;" />
            </div>`;
        });
        html += '</div>';
        
        document.getElementById('pa-content').innerHTML = html;
        H.openModal('puan-modal');
      };'''

render_pa_new = '''H.openPuanAyarlari = function () {
        const bc = this.base_config;
        const mc = this.mult_config;
        const c = this.config;
        
        const configItems = [
          {id:'PUAN_1_HALKA_KOMSU', label:'K6 - 1. Halka Komşu Puanı', desc:'Bitişik komşular için verilen birim puan.'},
          {id:'PUAN_2_HALKA_KOMSU', label:'K7 - 2. Halka Komşu Puanı', desc:'2. halka komşular için verilen birim puan.'},
          {id:'CARPAN_KURAKLIK', label:'K5 - Derin Kuraklık Puanı', desc:'Uzun süre çıkmayan sayıların çıkma ihtimali için puan.'},
          {id:'CARPAN_JOKER', label:'K13 - Joker Komşu Puanı', desc:'Joker sayılarının komşuluk etkisi.'},
          {id:'PUAN_ONLUK_KURAKLIK_BONUSU', label:'K10 - Bölgesel Boşluk Puanı', desc:'Boş kalan onluk dilimlere verilen bonus.'},
          {id:'PUAN_KINETIK_IVME_BONUSU', label:'K8 - Kinetik İvme Bonusu', desc:'Hızla çıkmaya başlayan sayılara ivme bonusu.'},
          {id:'PUAN_GECIKMELI_TEKRAR', label:'K12 - Gecikmeli Tekrar Puanı', desc:'Ara verip tekrar çıkan sayılara bonus.'},
          {id:'CEZA_OLU_SAYI_4', label:'K11 - Düşük Frekans Cezası', desc:'Son 25 çekilişte az çıkanlara ceza.'},
          {id:'CEZA_CIFTE_TEKRAR', label:'K3 - Çifte Tekrar Cezası', desc:'Çok kısa sürede tekrar edenlere ceza.'},
          {id:'CEZA_DOYGUN_4', label:'K15 - Aşırı Doygunluk (4) Cezası', desc:'Kısa sürede 4 kez çıkanlara ceza.'},
          {id:'CEZA_DOYGUN_8', label:'K15 - Aşırı Doygunluk (8) Cezası', desc:'Kısa sürede 8 kez çıkanlara ceza.'},
          {id:'CEZA_DOYGUN_12', label:'K15 - Aşırı Doygunluk (12) Cezası', desc:'Kısa sürede 12 kez çıkanlara ceza.'},
          {id:'CEZA_DOYGUN_16', label:'K15 - Aşırı Doygunluk (16) Cezası', desc:'Kısa sürede 16 kez çıkanlara ceza.'},
          {id:'CEZA_IZOLASYON', label:'K16 - İzolasyon Cezası', desc:'Etrafında hiç komşu olmayan sayılara ceza.'}
        ];
        
        let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
        
        // Absolutes
        html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px; border:1px solid #444;">
              <div style="flex:1;">
                <div style="font-weight:bold; color:#ffc107; font-size:13px;">Geçmiş Data Ağırlığı (%)</div>
                <div style="font-size:10px; color:#aaa;">Geçmişin modele etkisi. (Sabit Değer)</div>
              </div>
              <input type="number" id="base-YUZDE_TUM_GECMIS" value="${c.YUZDE_TUM_GECMIS!==undefined?c.YUZDE_TUM_GECMIS:35}" style="width:70px; padding:4px; border-radius:4px; border:1px solid #ffc107; background:#111; color:#fff; text-align:right;" />
            </div>`;
        html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px; border:1px solid #444;">
              <div style="flex:1;">
                <div style="font-weight:bold; color:#ffc107; font-size:13px;">K14 - Ölüm Cezası Sınırı</div>
                <div style="font-size:10px; color:#aaa;">Cezanın uygulanacağı max hafta. (Sabit Değer)</div>
              </div>
              <input type="number" id="base-OLUM_CEZASI_SINIRI" value="${c.OLUM_CEZASI_SINIRI!==undefined?c.OLUM_CEZASI_SINIRI:22}" style="width:70px; padding:4px; border-radius:4px; border:1px solid #ffc107; background:#111; color:#fff; text-align:right;" />
            </div>`;
        
        // Base + Mults
        html += '<div style="display:flex; justify-content:flex-end; gap:10px; padding-right:5px;"><span style="font-size:10px; color:#53f0db; width:70px; text-align:center; font-weight:bold;">Taban Puan</span><span style="font-size:10px; color:#ff416c; width:70px; text-align:center; font-weight:bold;">Çarpan</span></div>';
        
        configItems.forEach(item => {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px; border:1px solid #444;">
              <div style="flex:1;">
                <div style="font-weight:bold; color:#53f0db; font-size:13px;">${item.label}</div>
                <div style="font-size:10px; color:#aaa;">${item.desc}</div>
              </div>
              <div style="display:flex; gap:10px;">
                  <input type="number" id="base-${item.id}" value="${bc[item.id]!==undefined?bc[item.id]:0}" style="width:70px; padding:4px; border-radius:4px; border:1px solid #53f0db; background:#111; color:#fff; text-align:right;" />
                  <input type="number" step="0.1" id="mult-${item.id}" value="${mc[item.id]!==undefined?mc[item.id]:1.0}" style="width:70px; padding:4px; border-radius:4px; border:1px solid #ff416c; background:#111; color:#fff; text-align:right;" />
              </div>
            </div>`;
        });
        html += '</div>';
        
        document.getElementById('pa-content').innerHTML = html;
        H.openModal('puan-modal');
      };'''

if render_pa_orig in html:
    html = html.replace(render_pa_orig, render_pa_new)
    print("openPuanAyarlari replaced")


update_config_orig = '''updateConfigFromUI: function () {
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

update_config_new = '''updateConfigFromUI: function () {
        try {
            const bc = localStorage.getItem('hm_base_config');
            if (bc) Object.assign(this.base_config, JSON.parse(bc));
            const mc = localStorage.getItem('hm_mult_config');
            if (mc) Object.assign(this.mult_config, JSON.parse(mc));
            const pc = localStorage.getItem('hm_config');
            if (pc) Object.assign(this.config, JSON.parse(pc));
        } catch(e) {}
        
        const val = (id) => {
            const el = document.getElementById('ws-' + id);
            return el ? parseFloat(el.value) : undefined;
        };
        
        // Let sliders override the loaded mult_config (so moving sliders works)
        if(val('hm_hist') !== undefined) this.config.YUZDE_TUM_GECMIS = val('hm_hist');
        this.config.YUZDE_SON_15_DONEM = 100 - this.config.YUZDE_TUM_GECMIS;
        if(val('hm_kurak_sinir') !== undefined) this.config.OLUM_CEZASI_SINIRI = val('hm_kurak_sinir');
        
        if(val('hm_komsu') !== undefined) this.mult_config.PUAN_1_HALKA_KOMSU = val('hm_komsu');
        if(val('hm_komsu2') !== undefined) this.mult_config.PUAN_2_HALKA_KOMSU = val('hm_komsu2');
        if(val('hm_kurak') !== undefined) this.mult_config.CARPAN_KURAKLIK = val('hm_kurak');
        if(val('hm_joker') !== undefined) this.mult_config.CARPAN_JOKER = val('hm_joker');
        if(val('hm_onluk') !== undefined) this.mult_config.PUAN_ONLUK_KURAKLIK_BONUSU = val('hm_onluk');
        if(val('hm_ivme') !== undefined) this.mult_config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme');
        if(val('hm_gecik') !== undefined) this.mult_config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik');
        if(val('hm_olu') !== undefined) this.mult_config.CEZA_OLU_SAYI_4 = val('hm_olu');
        if(val('hm_cifte') !== undefined) this.mult_config.CEZA_CIFTE_TEKRAR = val('hm_cifte');
        if(val('hm_c4') !== undefined) this.mult_config.CEZA_DOYGUN_4 = val('hm_c4');
        if(val('hm_c8') !== undefined) this.mult_config.CEZA_DOYGUN_8 = val('hm_c8');
        if(val('hm_c12') !== undefined) this.mult_config.CEZA_DOYGUN_12 = val('hm_c12');
        if(val('hm_c16') !== undefined) this.mult_config.CEZA_DOYGUN_16 = val('hm_c16');
        if(val('hm_izolasyon') !== undefined) this.mult_config.CEZA_IZOLASYON = val('hm_izolasyon');
        
        // Keep localStorage updated with the slider states
        try {
            localStorage.setItem('hm_base_config', JSON.stringify(this.base_config));
            localStorage.setItem('hm_mult_config', JSON.stringify(this.mult_config));
            localStorage.setItem('hm_config', JSON.stringify(this.config));
        } catch(e) {}
      },'''

if update_config_orig in html:
    html = html.replace(update_config_orig, update_config_new)
    print("updateConfigFromUI replaced")

# Now inject `base_config` and `mult_config` into `HavuzMotoru`
config_orig = '''config: {
        YUZDE_SON_15_DONEM: 65,
        YUZDE_TUM_GECMIS: 35,
        CARPAN_15: 2.0,
        CARPAN_10: 3.5,
        CARPAN_5: 5.0,
        CARPAN_KURAKLIK: 0,
        CARPAN_JOKER: 0, // <-- YENI EKLENEN JOKER CARPANI
        PUAN_1_HALKA_KOMSU: 0, // Eski ajanin hatasiyla 0 idi, boyle birakildi
        PUAN_GECIKMELI_TEKRAR: 0,
        PUAN_BOLGE_GECISI: 0,
        CEZA_OLU_SAYI_4: 0,
        CEZA_CIFTE_TEKRAR: 0,
        CEZA_DOYGUN_4: 0,
        CEZA_DOYGUN_8: 0,
        CEZA_DOYGUN_12: 0,
        CEZA_DOYGUN_16: 0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 0,
        PUAN_KINETIK_IVME_BONUSU: 0,
        CEZA_IZOLASYON: 100,
        // Seçenek 1+2: Normalizasyon limitleri
        // Toplam 250 puanlık sisteme göre: Tarihsel max 100p, Güncel max 150p
        // Kuraklık tavanı: 100p
        NORM_TARIHSEL_CAP: 100,
        NORM_GUNCELL_CAP: 80,
        NORM_KURAKLIK_CAP: 100
      },'''

config_new = '''base_config: {
        PUAN_1_HALKA_KOMSU: 5,
        PUAN_2_HALKA_KOMSU: 2,
        CARPAN_KURAKLIK: 2.0,
        CARPAN_JOKER: 5.0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 20,
        PUAN_KINETIK_IVME_BONUSU: 25,
        PUAN_GECIKMELI_TEKRAR: 15,
        CEZA_OLU_SAYI_4: -100,
        CEZA_CIFTE_TEKRAR: -100,
        CEZA_DOYGUN_4: -20,
        CEZA_DOYGUN_8: -40,
        CEZA_DOYGUN_12: -80,
        CEZA_DOYGUN_16: -120,
        CEZA_IZOLASYON: -100
      },
      mult_config: {
        PUAN_1_HALKA_KOMSU: 1.0,
        PUAN_2_HALKA_KOMSU: 1.0,
        CARPAN_KURAKLIK: 1.0,
        CARPAN_JOKER: 1.0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 1.0,
        PUAN_KINETIK_IVME_BONUSU: 1.0,
        PUAN_GECIKMELI_TEKRAR: 1.0,
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
        OLUM_CEZASI_SINIRI: 22,
        NORM_TARIHSEL_CAP: 100,
        NORM_GUNCELL_CAP: 80,
        NORM_KURAKLIK_CAP: 100,
        PUAN_BOLGE_GECISI: 0,
        CARPAN_15: 2.0,
        CARPAN_10: 3.5,
        CARPAN_5: 5.0
      },'''

if config_orig in html:
    html = html.replace(config_orig, config_new)
    print("config objects replaced")

# 3. Replace all "this.config.X" in puanlari_hesapla with "this.base_config.X * this.mult_config.X"
def get_val_replacer(base_name):
    # E.g. replaces this.config.PUAN_1_HALKA_KOMSU || 5
    # or just this.config.PUAN_1_HALKA_KOMSU
    return f"(this.base_config.{base_name} * this.mult_config.{base_name})"

reps = [
    (r"\(this\.config\.PUAN_1_HALKA_KOMSU\s*\|\|\s*5\)", get_val_replacer("PUAN_1_HALKA_KOMSU")),
    (r"\(this\.config\.PUAN_2_HALKA_KOMSU\s*\|\|\s*2\)", get_val_replacer("PUAN_2_HALKA_KOMSU")),
    (r"this\.config\.CARPAN_KURAKLIK", get_val_replacer("CARPAN_KURAKLIK")),
    (r"\(this\.config\.PUAN_ONLUK_KURAKLIK_BONUSU\s*\|\|\s*20\)", get_val_replacer("PUAN_ONLUK_KURAKLIK_BONUSU")),
    (r"this\.config\.PUAN_ONLUK_KURAKLIK_BONUSU", get_val_replacer("PUAN_ONLUK_KURAKLIK_BONUSU")),
    (r"\(this\.config\.PUAN_KINETIK_IVME_BONUSU\s*\|\|\s*25\)", get_val_replacer("PUAN_KINETIK_IVME_BONUSU")),
    (r"this\.config\.PUAN_KINETIK_IVME_BONUSU", get_val_replacer("PUAN_KINETIK_IVME_BONUSU")),
    (r"this\.config\.PUAN_GECIKMELI_TEKRAR", get_val_replacer("PUAN_GECIKMELI_TEKRAR")),
    (r"this\.config\.CEZA_OLU_SAYI_4", get_val_replacer("CEZA_OLU_SAYI_4")),
    (r"this\.config\.CEZA_CIFTE_TEKRAR", get_val_replacer("CEZA_CIFTE_TEKRAR")),
    (r"this\.config\.CEZA_DOYGUN_4", get_val_replacer("CEZA_DOYGUN_4")),
    (r"this\.config\.CEZA_DOYGUN_8", get_val_replacer("CEZA_DOYGUN_8")),
    (r"this\.config\.CEZA_DOYGUN_12", get_val_replacer("CEZA_DOYGUN_12")),
    (r"this\.config\.CEZA_DOYGUN_16", get_val_replacer("CEZA_DOYGUN_16")),
    (r"-\(this\.config\.CEZA_IZOLASYON\s*\|\|\s*100\)", get_val_replacer("CEZA_IZOLASYON"))
]

for pat, repl in reps:
    html = re.sub(pat, repl, html)

# Joker Carpan is local variable inside the loop
html = re.sub(r"let joker_carpani\s*=\s*this\.config\.CARPAN_JOKER\s*\|\|\s*5\.0;", f"let joker_carpani = {get_val_replacer('CARPAN_JOKER')};", html)

print("Puanlari_hesapla rules updated.")

# 4. Change backtest autoTune UI
html = html.replace("font-size:10px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;\"", "font-size:15px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;\"")
html = html.replace("<b style=\"font-size:14px;\">${k} Bilen</b> Sayısı:", "<b style=\"font-size:18px;\">${k} Bilen</b> Sayısı:")
html = html.replace("let hedef_tarih = rawDraws[i].date || `Geçmiş -${i + 1}`;", "let rawD = rawDraws[i].date || `Geçmiş -${i + 1}`; let dps = rawD.split('-'); let hedef_tarih = dps.length === 3 ? dps[2]+'-'+dps[1]+'-'+dps[0] : rawD;")


# 5. Add UI to `hc-settings`
# Wait, let's just insert it before `<div class="card">` inside `<div id="hc-settings"`
tm_ui = '''
        <!-- ZAMAN MAKİNESİ -->
        <div class="card" style="background:rgba(255, 65, 108, 0.1); border-color:#ff416c;">
          <div class="card-head" style="background:linear-gradient(90deg, #ff416c, #ff4b2b) !important; border:none !important;">
            <div class="card-title">⏳ Zaman Makinesi (Geçmişe Git)</div>
          </div>
          <div class="card-note">Analizi geçmişteki bir tarihteymişsiniz gibi yapın. O tarihten sonraki tüm çekilişler yok sayılır.</div>
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
            for(let i=1; i<Math.min(150, rawDB.entries.length); i++) {
                let dParts = rawDB.entries[i].date.split('-');
                let df = dParts.length === 3 ? dParts[2] + '-' + dParts[1] + '-' + dParts[0] : rawDB.entries[i].date;
                html += '<option value="'+i+'">Geçmiş ' + i + ' (' + df + ')</option>';
            }
            sel.innerHTML = html;
            if(window.__timeMachineOffset) sel.value = window.__timeMachineOffset;
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

html = html.replace('<div class="h-ratio-row">', tm_ui + '\n        <div class="h-ratio-row">')

# Wait, the tooltips in the detailed scores also reference the config directly:
# e.g. `k6 += config.PUAN_1_HALKA_KOMSU;`
# This is inside `H.renderDetailedTable`. We should update those too.
# But those are just visual. Let's do it anyway.
for base_name in ["PUAN_1_HALKA_KOMSU", "PUAN_2_HALKA_KOMSU", "CARPAN_KURAKLIK", "PUAN_KINETIK_IVME_BONUSU", "PUAN_GECIKMELI_TEKRAR", "CEZA_OLU_SAYI_4", "CEZA_CIFTE_TEKRAR", "CEZA_DOYGUN_4", "CEZA_DOYGUN_8", "CEZA_DOYGUN_12", "CEZA_DOYGUN_16"]:
    html = re.sub(rf"config\.{base_name}", f"(window.HavuzMotoru.base_config.{base_name} * window.HavuzMotoru.mult_config.{base_name})", html)


with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("All done!")
