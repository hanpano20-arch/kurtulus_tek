import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change modal max-width and layout to CSS Grid
html = html.replace('max-width:800px;', 'max-width:95vw;')

# Find renderSection and modify it to use CSS Grid
old_render = '''const renderSection = (title, params) => {
          let h = `<h3 style="color:#ffffff; margin-top:25px; margin-bottom:15px; border-bottom:1px solid #30363d; padding-bottom:5px;">${title}</h3>`;
          params.forEach(p => {
             h += renderRow(p.id, p.label, p.desc, p.val);
          });
          return h;
        };'''

new_render = '''const renderSection = (title, params) => {
          let h = `<h3 style="color:#ffffff; margin-top:20px; margin-bottom:10px; border-bottom:1px solid #30363d; padding-bottom:5px;">${title}</h3>`;
          h += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 10px;">`;
          params.forEach(p => {
             h += renderRow(p.id, p.label, p.desc, p.val);
          });
          h += `</div>`;
          return h;
        };'''

if old_render in html:
    html = html.replace(old_render, new_render)
    print('Grid layout applied to renderSection.')
else:
    print('old_render not found. Trying regex...')
    html = re.sub(r'const renderSection = \(title, params\) => \{[\s\S]*?return h;\s*\};', new_render, html)
    print('Grid layout applied via regex.')

# Modify the save function so it doesn't close immediately, and alerts clearly
save_old = '''window._savePuanAyarlari = function() {
          let config = window.HavuzMotoru && window.HavuzMotoru.config ? window.HavuzMotoru.config : {};
          config.KATSAYI_S15 = parseFloat(document.getElementById('pset_KATSAYI_S15').value) || 0;
          config.KATSAYI_ALL = parseFloat(document.getElementById('pset_KATSAYI_ALL').value) || 0;
          config.CARPAN_K1 = parseFloat(document.getElementById('pset_CARPAN_K1').value) || 0;
          config.CARPAN_K2 = parseFloat(document.getElementById('pset_CARPAN_K2').value) || 0;
          config.CARPAN_K3 = parseFloat(document.getElementById('pset_CARPAN_K3').value) || 0;
          config.PUAN_1_HALKA = parseFloat(document.getElementById('pset_PUAN_1_HALKA').value) || 0;
          config.PUAN_2_HALKA = parseFloat(document.getElementById('pset_PUAN_2_HALKA').value) || 0;
          config.CARPAN_KURAKLIK = parseFloat(document.getElementById('pset_CARPAN_KURAKLIK').value) || 0;
          config.PUAN_ONLUK_KURAKLIK_BONUSU = parseFloat(document.getElementById('pset_PUAN_ONLUK_KURAKLIK_BONUSU').value) || 0;
          config.PUAN_KINETIK_IVME_BONUSU = parseFloat(document.getElementById('pset_PUAN_KINETIK_IVME_BONUSU').value) || 0;
          config.PUAN_GECIKMELI_TEKRAR = parseFloat(document.getElementById('pset_PUAN_GECIKMELI_TEKRAR').value) || 0;
          config.CARPAN_JOKER = parseFloat(document.getElementById('pset_CARPAN_JOKER').value) || 0;
          config.CEZA_OLU_SAYI_4 = parseFloat(document.getElementById('pset_CEZA_OLU_SAYI_4').value) || 0;
          config.OLUM_CEZASI_SINIRI = parseFloat(document.getElementById('pset_OLUM_CEZASI_SINIRI').value) || 0;
          config.CEZA_CIFTE_TEKRAR = parseFloat(document.getElementById('pset_CEZA_CIFTE_TEKRAR').value) || 0;
          config.CEZA_DOYGUN_4 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_4').value) || 0;
          config.CEZA_DOYGUN_8 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_8').value) || 0;
          config.CEZA_DOYGUN_12 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_12').value) || 0;
          config.CEZA_DOYGUN_16 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_16').value) || 0;

          localStorage.setItem('hm_puan_ayarlari', JSON.stringify(config));
          window._puanAyarlariUnsaved = false;
          document.getElementById('dst-settings-overlay').remove();
          alert("Puan ayarları başarıyla kaydedildi! Etkilerini görmek için listeyi yeniden oluşturmalısınız.");
        };'''

save_new = '''window._savePuanAyarlari = function(btn) {
          let config = window.HavuzMotoru && window.HavuzMotoru.config ? window.HavuzMotoru.config : {};
          config.KATSAYI_S15 = parseFloat(document.getElementById('pset_KATSAYI_S15').value) || 0;
          config.KATSAYI_ALL = parseFloat(document.getElementById('pset_KATSAYI_ALL').value) || 0;
          config.CARPAN_K1 = parseFloat(document.getElementById('pset_CARPAN_K1').value) || 0;
          config.CARPAN_K2 = parseFloat(document.getElementById('pset_CARPAN_K2').value) || 0;
          config.CARPAN_K3 = parseFloat(document.getElementById('pset_CARPAN_K3').value) || 0;
          config.PUAN_1_HALKA = parseFloat(document.getElementById('pset_PUAN_1_HALKA').value) || 0;
          config.PUAN_2_HALKA = parseFloat(document.getElementById('pset_PUAN_2_HALKA').value) || 0;
          config.CARPAN_KURAKLIK = parseFloat(document.getElementById('pset_CARPAN_KURAKLIK').value) || 0;
          config.PUAN_ONLUK_KURAKLIK_BONUSU = parseFloat(document.getElementById('pset_PUAN_ONLUK_KURAKLIK_BONUSU').value) || 0;
          config.PUAN_KINETIK_IVME_BONUSU = parseFloat(document.getElementById('pset_PUAN_KINETIK_IVME_BONUSU').value) || 0;
          config.PUAN_GECIKMELI_TEKRAR = parseFloat(document.getElementById('pset_PUAN_GECIKMELI_TEKRAR').value) || 0;
          config.CARPAN_JOKER = parseFloat(document.getElementById('pset_CARPAN_JOKER').value) || 0;
          config.CEZA_OLU_SAYI_4 = parseFloat(document.getElementById('pset_CEZA_OLU_SAYI_4').value) || 0;
          config.OLUM_CEZASI_SINIRI = parseFloat(document.getElementById('pset_OLUM_CEZASI_SINIRI').value) || 0;
          config.CEZA_CIFTE_TEKRAR = parseFloat(document.getElementById('pset_CEZA_CIFTE_TEKRAR').value) || 0;
          config.CEZA_DOYGUN_4 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_4').value) || 0;
          config.CEZA_DOYGUN_8 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_8').value) || 0;
          config.CEZA_DOYGUN_12 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_12').value) || 0;
          config.CEZA_DOYGUN_16 = parseFloat(document.getElementById('pset_CEZA_DOYGUN_16').value) || 0;

          localStorage.setItem('hm_puan_ayarlari', JSON.stringify(config));
          window._puanAyarlariUnsaved = false;
          
          if(btn) {
            let orgText = btn.innerHTML;
            btn.innerHTML = "✅ KAYDEDİLDİ!";
            btn.style.backgroundColor = "#2ea043";
            
            setTimeout(() => {
                btn.innerHTML = orgText;
                btn.style.backgroundColor = "#238636";
            }, 2000);
          }
          
          // Try to trigger a recalculation automatically
          if (window.HavuzMotoru && typeof window.HavuzMotoru.runBacktest === 'function') {
              window.HavuzMotoru.runBacktest();
          } else if (typeof H.runBacktest === 'function') {
              H.runBacktest();
          } else {
              let analizBtn = document.querySelector('button[onclick*="runBacktest"]') || document.querySelector('button[onclick*="Analiz"]');
              if(analizBtn) analizBtn.click();
          }
        };'''

if save_old in html:
    html = html.replace(save_old, save_new)
    print('Save function modified.')
else:
    print('save_old not found. Trying regex...')
    html = re.sub(r'window\._savePuanAyarlari = function\(\) \{[\s\S]*?alert\("Puan ayarları başarıyla kaydedildi![^"]+"\);\s*\};', save_new, html)
    print('Save function modified via regex.')

# Fix the button onClick to pass 'this'
btn_old = '<button onclick="window._savePuanAyarlari()"'
btn_new = '<button onclick="window._savePuanAyarlari(this)"'
html = html.replace(btn_old, btn_new)

with open('PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
