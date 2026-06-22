import re

with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Layout for Pool Size, Test Count and Time Machine
old_layout_pattern = re.compile(
    r'<div style="margin-bottom:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">.*?<div class="h-ratio-box">.*?<!-- ZAMAN MAKİNESİ -->.*?</div>\s*</div>', 
    re.DOTALL
)

new_layout = """<div style="margin-bottom:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; background:rgba(255,193,7,0.1); border:1px solid rgba(255,193,7,0.3); border-radius:8px; padding:10px;">
          <span style="font-size:16px; font-weight:700; color:var(--color-accent,#53f0db);">📊 Hedef Havuz Boyutu:</span>
          <input type="number" id="hm-pool-size" value="25" min="6" max="90" style="width:60px; padding:6px; font-size:14px; font-weight:bold; border:1.5px solid rgba(83,240,219,0.3); background:rgba(0,0,0,0.4); color:#fff; border-radius:8px; text-align:center; outline:none;">
          <span style="font-size:16px; font-weight:700; color:var(--color-accent,#53f0db);">⏱️ Test Çekiliş Sayısı:</span>
          <input type="number" id="hm-test-count" value="10" min="1" max="100" style="width:60px; padding:6px; font-size:14px; font-weight:bold; border:1.5px solid rgba(83,240,219,0.3); background:rgba(0,0,0,0.4); color:#fff; border-radius:8px; text-align:center; outline:none;">
          <span style="font-size:16px; font-weight:700; color:#ffc107;">⏳ Geçmişi Test Et:</span>
          <select id="tm-select" style="padding:6px; border-radius:4px; background:#10373a; color:#fff; border:1px solid #2dbfae; width:150px;">
            <option value="0">Bugündeyim (Kesinti Yok)</option>
          </select>
          <button onclick="let sel = document.getElementById('tm-select'); setTimeMachine(sel.value, sel.options[sel.selectedIndex].text); if(window.HavuzMotoru) { H.runAll(); } if(typeof renderDrawMap==='function') renderDrawMap(); if(window.H && typeof H.bildirim==='function') H.bildirim('Zaman makinesi uygulandı, tablo güncelleniyor.', 'success');" class="hm-btn hm-btn-blue" style="padding:6px 12px; font-size:13px; margin:0;">Uygula</button>
        </div>

        <div class="h-ratio-box">
          <div style="font-size:11px;font-weight:700;margin-bottom:6px;color:var(--color-accent,#53f0db)">⚖️ Tarihsel /
            Güncel Oran (Toplam: 100%)</div>"""

if '<!-- ZAMAN MAKİNESİ -->' in html:
    html = old_layout_pattern.sub(new_layout, html, count=1)


# 2. Fix the names in showPuanAyarlari
old_base_mult_items = """const baseMultItems = [
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
        ];"""

new_base_mult_items = """const baseMultItems = [
          { id: 'PUAN_1_HALKA_KOMSU', label: '1. Halka Komşu Çarpanı' },
          { id: 'PUAN_2_HALKA_KOMSU', label: '2. Halka Komşu Çarpanı' },
          { id: 'CEZA_IZOLASYON', label: 'İzolasyon Cezası' },
          { id: 'CARPAN_KURAKLIK', label: 'Kuraklık Çarpanı' },
          { id: 'PUAN_ONLUK_KURAKLIK_BONUSU', label: 'Onluk Blok Bonusu' },
          { id: 'PUAN_KINETIK_IVME_BONUSU', label: 'Kinetik İvme Bonusu' },
          { id: 'PUAN_GECIKMELI_TEKRAR', label: 'Gecikmeli Tekrar' },
          { id: 'CARPAN_JOKER', label: 'Joker Çarpanı' },
          { id: 'CEZA_OLU_SAYI_4', label: 'Ölü Sayı Cezası' },
          { id: 'CEZA_CIFTE_TEKRAR', label: 'Çifte Tekrar Cezası' },
          { id: 'CEZA_DOYGUN_4', label: 'Son 4 Çekiliş Cezası' },
          { id: 'CEZA_DOYGUN_8', label: 'Son 8 Çekiliş Cezası' },
          { id: 'CEZA_DOYGUN_12', label: 'Son 12 Çekiliş Cezası' },
          { id: 'CEZA_DOYGUN_16', label: 'Son 16 Çekiliş Cezası' }
        ];"""

html = html.replace(old_base_mult_items, new_base_mult_items)

# Fix savePuanAyarlari closeModal error and the remove() code
old_save_end = """        H.closeModal('puan-modal');
        
        const b = btn;"""

new_save_end = """        let m = document.getElementById('dst-settings-modal');
        let o = document.getElementById('dst-settings-overlay');
        if(m) m.remove();
        if(o) o.remove();
        window._puanAyarlariUnsaved = false;
        const b = btn;"""

html = html.replace(old_save_end, new_save_end)

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("fix14 applied")
