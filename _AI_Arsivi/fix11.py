import os

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

show_pa_new = '''H.showPuanAyarlari = function () {
        let oldModal = document.getElementById('dst-settings-modal');
        let oldOverlay = document.getElementById('dst-settings-overlay');
        if (oldModal) oldModal.remove();
        if (oldOverlay) oldOverlay.remove();

        let overlay = document.createElement('div');
        overlay.id = 'dst-settings-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2147483646; display:flex !important; justify-content:center; align-items:center;';
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

        let modalHTML = `
          <div id="dst-settings-modal" style="background:#0d1117; border:2px solid #30363d; border-radius:12px; width:95%; max-width:1000px; padding:30px; box-shadow:0 0 50px rgba(0,0,0,0.8); z-index:2147483647;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #30363d; padding-bottom:15px; margin-bottom:20px;">
              <div style="font-size:26px; color:#0a84ff; font-weight:900; text-shadow:0 0 10px rgba(10,132,255,0.5);">⚙️ Puan Ayarları</div>
              <button onclick="if(window._puanAyarlariUnsaved){if(confirm('Kaydedilmemiş değişiklikler var! Çıkmak istiyor musunuz?')){window._puanAyarlariUnsaved=false; document.getElementById('dst-settings-modal').remove(); document.getElementById('dst-settings-overlay').remove();}}else{document.getElementById('dst-settings-modal').remove(); document.getElementById('dst-settings-overlay').remove();}" style="background:transparent; border:none; color:#ff6b6b; font-size:30px; cursor:pointer; font-weight:bold;">&times;</button>
            </div>
            <div style="font-size:14px; color:#8b949e; margin-bottom:20px;">Sistemin tüm hesaplama ağırlıklarını buradan ince ayar yapabilirsiniz. Değişiklikler anında yansır.</div>
            <div style="max-height:60vh; overflow-y:auto; padding-right:15px;">
              <h3 style="color:#ffc107; margin-bottom:10px;">Taban Puanlar ve Çarpanlar</h3>
              <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">
                <tr style="background:#16a89b; color:#fff;">
                  <th style="padding:8px;text-align:left;">Parametre</th>
                  <th style="padding:8px;text-align:center;">Taban Puan (Base)</th>
                  <th style="padding:8px;text-align:center;">Mevcut Çarpan (Multiplier)</th>
                </tr>
`;

        baseMultItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let baseVal = bc[item.id] !== undefined ? bc[item.id] : 0;
           let multVal = mc[item.id] !== undefined ? mc[item.id] : 1;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="base_${item.id}" value="${baseVal}" step="0.5" oninput="window._puanAyarlariUnsaved=true;" style="width:70px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:center;">
               <input type="number" id="mult_${item.id}" value="${multVal}" step="0.1" oninput="window._puanAyarlariUnsaved=true;" style="width:70px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;text-align:center;">
             </td>
           </tr>`;
        });
        modalHTML += `</table>
              <h3 style="color:#ffc107; margin-bottom:10px;">Sabit Ayarlar</h3>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">`;

        absItems.forEach((item, i) => {
           let bg = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
           let val = c[item.id] !== undefined ? c[item.id] : 0;
           modalHTML += `<tr style="background:${bg};">
             <td style="padding:8px; border-bottom:1px solid #444; color:#fff;">${item.label}</td>
             <td style="padding:8px; border-bottom:1px solid #444; text-align:right;">
               <input type="number" id="pset_${item.id}" value="${val}" step="0.05" oninput="window._puanAyarlariUnsaved=true;" style="width:80px;padding:6px;border-radius:4px;background:#222;color:#fff;border:1px solid #555;">
             </td>
           </tr>`;
        });
        modalHTML += `</table>
            </div>
            <div style="text-align:center; margin-top:20px; padding-top:15px; border-top:1px solid #30363d;">
              <button onclick="H.savePuanAyarlari(this); window._puanAyarlariUnsaved=false;" style="background:#238636; color:#ffffff; font-weight:bold; font-size:18px; padding:15px 40px; border-radius:8px; border:1px solid #2ea44f; cursor:pointer; box-shadow:0 0 15px rgba(35,134,54,0.5);">💾 Değişiklikleri Kaydet</button>
            </div>
          </div>`;
        
        overlay.innerHTML = modalHTML;
        document.body.appendChild(overlay);
      };'''

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

html = safe_replace_function(html, "H.showPuanAyarlari = function", show_pa_new)

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fix11 applied")
