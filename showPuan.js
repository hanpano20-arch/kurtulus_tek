H.showPuanAyarlari = function () {
        let oldModal = document.getElementById('dst-settings-modal');
        let oldOverlay = document.getElementById('dst-settings-overlay');
        if (oldModal) oldModal.remove();
        if (oldOverlay) oldOverlay.remove();

        let overlay = document.createElement('div');
        overlay.id = 'dst-settings-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2147483646;';
        overlay.onclick = function(e) {
           if(e.target !== overlay) return;
           if (window._puanAyarlariUnsaved) {
             if(confirm("Kaydedilmemiş değişiklikler var! Yine de kapatmak istiyor musunuz?")) {
               window._puanAyarlariUnsaved = false;
               overlay.remove();
               document.getElementById('dst-settings-modal').remove();
             }
           } else {
             overlay.remove();
             document.getElementById('dst-settings-modal').remove();
           }
        };

        let modal = document.createElement('div');
        modal.id = 'dst-settings-modal';
        modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#0d1117; border:4px solid #0a84ff; box-shadow:0 0 30px rgba(10,132,255,0.5), 0 10px 50px rgba(0,0,0,0.9); border-radius:16px; padding:30px; z-index:2147483647; width:90%; max-width:800px; max-height:85vh; overflow-y:auto; color:#ffffff; font-family:"Inter",sans-serif; text-align:left;';
        
        let c = window.HavuzMotoru && window.HavuzMotoru.config ? window.HavuzMotoru.config : {};
        
        const renderRow = (id, label, desc, val) => {
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
        };

        const renderSection = (title, params) => {
          let h = `<h3 style="color:#ffffff; margin-top:25px; margin-bottom:15px; border-bottom:1px solid #30363d; padding-bottom:5px;">${title}</h3>`;
          params.forEach(p => {
             h += renderRow(p.id, p.label, p.desc, p.val);
          });
          return h;
        };

        let html = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #30363d; padding-bottom:15px; margin-bottom:20px;">
            <div style="font-size:26px; color:#0a84ff; font-weight:900; text-shadow:0 0 10px rgba(10,132,255,0.5);">⚙️ Puan Ayarları</div>
            <button onclick="if(window._puanAyarlariUnsaved){if(confirm('Kaydedilmemiş değişiklikler var! Çıkmak istiyor musunuz?')){window._puanAyarlariUnsaved=false; document.getElementById('dst-settings-modal').remove(); document.getElementById('dst-settings-overlay').remove();}}else{document.getElementById('dst-settings-modal').remove(); document.getElementById('dst-settings-overlay').remove();}" style="background:transparent; border:none; color:#ff6b6b; font-size:30px; cursor:pointer; font-weight:bold;">&times;</button>
          </div>
          <div style="font-size:14px; color:#8b949e; margin-bottom:20px;">
            Sistemin tüm hesaplama ağırlıklarını buradan ince ayar yapabilirsiniz. Değişiklikler anında yansır.
          </div>
        `;

        html += renderSection('Genel Ağırlıklar', [
          {id:'YUZDE_SON_15_DONEM', label:'Son 15 Çekiliş Ağırlığı (%)', desc:'Güncel formun final skora etkisi.', val:c.YUZDE_SON_15_DONEM!==undefined?c.YUZDE_SON_15_DONEM:65},
          {id:'YUZDE_TUM_GECMIS', label:'Tüm Geçmiş Ağırlığı (%)', desc:'Tarihsel başarı tabanının final skora etkisi.', val:c.YUZDE_TUM_GECMIS!==undefined?c.YUZDE_TUM_GECMIS:35}
        ]);

        html += renderSection('Çarpanlar (K1, K2, K3)', [
          {id:'CARPAN_15', label:'K1 - Son 15 Çekiliş Çarpanı', desc:'Son 15 çekilişte çıkmanın temel çarpanı.', val:c.CARPAN_15!==undefined?c.CARPAN_15:2.0},
          {id:'CARPAN_10', label:'K2 - Son 10 Çekiliş Çarpanı', desc:'Sıcak bölge ekstra çarpanı.', val:c.CARPAN_10!==undefined?c.CARPAN_10:3.5},
          {id:'CARPAN_5', label:'K3 - Son 5 Çekiliş Çarpanı', desc:'Ateş topu bölgesi çarpanı (En güçlüsü).', val:c.CARPAN_5!==undefined?c.CARPAN_5:5.0}
        ]);

        html += renderSection('Komşuluk (K6, K7)', [
          {id:'PUAN_1_HALKA_KOMSU', label:'K6 - 1. Halka Komşu Puanı', desc:'Bitişik komşular için verilen birim puan.', val:c.PUAN_1_HALKA_KOMSU!==undefined?c.PUAN_1_HALKA_KOMSU:5},
          {id:'PUAN_2_HALKA_KOMSU', label:'K7 - 2. Halka Komşu Puanı', desc:'İki adım ötedeki komşular için birim puan.', val:c.PUAN_2_HALKA_KOMSU!==undefined?c.PUAN_2_HALKA_KOMSU:2}
        ]);

        html += renderSection('Bonuslar (K4, K5, vb.)', [
          {id:'CARPAN_KURAKLIK', label:'Kuraklık Çarpanı', desc:'Altın Aralıkta (5-16 çekiliş) olan sayılara verilen bonus çarpanı.', val:c.CARPAN_KURAKLIK!==undefined?c.CARPAN_KURAKLIK:2.5},
          {id:'CARPAN_JOKER', label:'K5 - Joker Çarpanı', desc:'Joker olarak çıkan sayılara verilen devasa çarpan.', val:c.CARPAN_JOKER!==undefined?c.CARPAN_JOKER:5.0},
          {id:'PUAN_ONLUK_KURAKLIK_BONUSU', label:'K8 - Onluk Blok Bonusu', desc:'Hiç sayı çıkmayan 10lu gruba verilen bonus.', val:c.PUAN_ONLUK_KURAKLIK_BONUSU!==undefined?c.PUAN_ONLUK_KURAKLIK_BONUSU:10},
          {id:'PUAN_KINETIK_IVME_BONUSU', label:'K9 - Kinetik İvme Bonusu', desc:'Sık çıkıp tekrar edenlere verilen rüzgar bonusu.', val:c.PUAN_KINETIK_IVME_BONUSU!==undefined?c.PUAN_KINETIK_IVME_BONUSU:50},
          {id:'PUAN_GECIKMELI_TEKRAR', label:'K10 - Gecikmeli Tekrar Bonusu', desc:'Eskiden çok çıkıp son zamanlarda susan sayılara verilen bonus.', val:c.PUAN_GECIKMELI_TEKRAR!==undefined?c.PUAN_GECIKMELI_TEKRAR:18},
          {id:'PUAN_BOLGE_GECISI', label:'K11 - Bölge Geçiş Puanı', desc:'Sarkaç etkisiyle diğer bölgeye kayan sayılara verilen bonus.', val:c.PUAN_BOLGE_GECISI!==undefined?c.PUAN_BOLGE_GECISI:12}
        ]);

        html += renderSection('Cezalar (K12, K13, K14, K16)', [
          {id:'CEZA_OLU_SAYI_4', label:'K12 - Aşırı Isınma Cezası', desc:'Yalancı sıcak sayılara kesilen ceza.', val:c.CEZA_OLU_SAYI_4!==undefined?c.CEZA_OLU_SAYI_4:-45},
          {id:'CEZA_CIFTE_TEKRAR', label:'K13 - Çifte Tekrar Cezası', desc:'Son 2 çekilişte de çıkan sayıya kesilen ceza.', val:c.CEZA_CIFTE_TEKRAR!==undefined?c.CEZA_CIFTE_TEKRAR:-30},
          {id:'CEZA_DOYGUN_4', label:'K14 - Doygunluk 4 Cezası', desc:'Kısa sürede 4 kez çıkan sayıya verilen ceza.', val:c.CEZA_DOYGUN_4!==undefined?c.CEZA_DOYGUN_4:-150},
          {id:'CEZA_DOYGUN_8', label:'K14 - Doygunluk 8 Cezası', desc:'Kısa sürede 8 kez çıkan sayıya verilen ceza.', val:c.CEZA_DOYGUN_8!==undefined?c.CEZA_DOYGUN_8:-250},
          {id:'CEZA_DOYGUN_12', label:'K14 - Doygunluk 12 Cezası', desc:'Kısa sürede 12 kez çıkan sayıya verilen ceza.', val:c.CEZA_DOYGUN_12!==undefined?c.CEZA_DOYGUN_12:-375},
          {id:'CEZA_DOYGUN_16', label:'K14 - Doygunluk 16 Cezası', desc:'Kısa sürede 16 kez çıkan sayıya verilen ceza.', val:c.CEZA_DOYGUN_16!==undefined?c.CEZA_DOYGUN_16:-500},
          {id:'CEZA_IZOLASYON', label:'K16 - İzolasyon Cezası', desc:'Hiçbir komşusu olmayan sahte sıcaklara verilen ceza.', val:c.CEZA_IZOLASYON!==undefined?c.CEZA_IZOLASYON:-100},
          {id:'OLUM_CEZASI_SINIRI', label:'Ölüm Cezası Sınırı', desc:'Bir sayı bu kadar çekiliş çıkmazsa ceza yemeye başlar.', val:c.OLUM_CEZASI_SINIRI!==undefined?c.OLUM_CEZASI_SINIRI:40}
        ]);

        html += renderSection('Normalizasyon Tavanları', [
          {id:'NORM_TARIHSEL_CAP', label:'Tarihsel Tavan', desc:'Tarihsel puanın maksimum değeri.', val:c.NORM_TARIHSEL_CAP!==undefined?c.NORM_TARIHSEL_CAP:100},
          {id:'NORM_GUNCELL_CAP', label:'Güncel Tavan', desc:'Güncel formun maksimum değeri.', val:c.NORM_GUNCELL_CAP!==undefined?c.NORM_GUNCELL_CAP:80},
          {id:'NORM_KURAKLIK_CAP', label:'Kuraklık Tavanı', desc:'Kuraklık puanının maksimum değeri.', val:c.NORM_KURAKLIK_CAP!==undefined?c.NORM_KURAKLIK_CAP:100}
        ]);

        html += `
          <div style="margin-top:30px; text-align:center;">
            <button onclick="H.savePuanAyarlari()" style="background:#238636; color:#ffffff; font-weight:bold; font-size:18px; padding:15px 40px; border-radius:8px; border:1px solid #2ea44f; cursor:pointer; box-shadow:0 0 15px rgba(35,134,54,0.5);">💾 Değişiklikleri Kaydet</button>
          </div>
        `;

        modal.innerHTML = html;
        document.body.appendChild(overlay);
        document.body.appendChild(modal);}