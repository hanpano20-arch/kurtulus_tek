import sys

with open('PROMPT_BUILDER_v8_0_fixed.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX K11 Bölge Geçişi in extractDetailsForUI
old_k11_ui = """              if (n > limit) {
                k11 += config.PUAN_BOLGE_GECISI;
              }
            } else {
              if (n <= limit) {
                k11 += config.PUAN_BOLGE_GECISI;
              }"""
new_k11_ui = """              if (n > limit) {
                k11 += Math.floor((config.PUAN_BOLGE_GECISI || 0) / limit);
              }
            } else {
              if (n <= limit) {
                k11 += Math.floor((config.PUAN_BOLGE_GECISI || 0) / limit);
              }"""
content = content.replace(old_k11_ui, new_k11_ui)

# 2. FIX Guncel (Recent) and K1, K2, K3 normalization in extractDetailsForUI
old_recent_ui = """        let raw_recent_total = raw_k1 + raw_k2 + raw_k3;
        let recent_normalized = Math.floor(Math.min((raw_recent_total / ref_max_rec) * recCap, recCap));
        // K1, K2, K3 değerleri de oransal olarak normalize edilir (tablo gösterimi için)
        let scale_rec = ref_max_rec > 0 ? (recCap / ref_max_rec) : 1;
        let k1 = Math.floor(raw_k1 * scale_rec);
        let k2 = Math.floor(raw_k2 * scale_rec);
        let k3 = Math.floor(raw_k3 * scale_rec);
        let recent = recent_normalized;"""

new_recent_ui = """        // Doğru max_rec hesaplaması (puanlari_hesapla ile aynı)
        let max_rec = 0;
        for (let i = 1; i <= maxN; i++) {
          let f15r = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10r = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5r = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let r = ((f15r * (config.CARPAN_15 || 0)) + (f10r * (config.CARPAN_10 || 0)) + (f5r * (config.CARPAN_5 || 0))) * ((config.YUZDE_SON_15_DONEM || 20) / 100);
          if (r > max_rec) max_rec = r;
        }
        let w_hist = config.YUZDE_SON_15_DONEM || 20; 
        let w_rec = 100 - w_hist;                   
        
        let scale_rec = max_rec > 0 ? (w_rec / max_rec) : 0;
        let k1 = Math.floor(raw_k1 * scale_rec);
        let k2 = Math.floor(raw_k2 * scale_rec);
        let k3 = Math.floor(raw_k3 * scale_rec);
        let recent = k1 + k2 + k3;"""
content = content.replace(old_recent_ui, new_recent_ui)


# 3. FIX Double Counting in currentSum
old_currentSum = """        let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18 + k19 + k20 + k21;"""
new_currentSum = """        let currentSum = historical + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18 + k19 + k20 + k21;"""
content = content.replace(old_currentSum, new_currentSum)


# 4. FIX K12 Yalancı Sıcak İnfazı (Remove isinmis_sayilar protection)
# In puanlari_hesapla:
old_k12_ph = """        son_3_hafta_sayilari.forEach(n => {
          if (tekrar_oranlari[n] <= tekrar_baraj && !isinmis_sayilar.has(n)) {
            puanlar[n] += ceza_tekrarsiz;
          }
        });"""
new_k12_ph = """        son_3_hafta_sayilari.forEach(n => {
          if (tekrar_oranlari[n] <= tekrar_baraj) { // Kalkan Yalancı Sıcak kuralı için kaldırıldı
            puanlar[n] += ceza_tekrarsiz;
          }
        });"""
content = content.replace(old_k12_ph, new_k12_ph)

# In extractDetailsForUI:
old_k12_ui = """        let in_son_3 = son_3_donem.some(draw => draw && Array.isArray(draw) && draw.includes(n));
        if (in_son_3 && tekrar_oranlari[n] <= tekrar_baraj && !isinmis_sayilar.has(n)) {
            k12 += (config.CEZA_TEKRAR_ETMEYEN_SICAK || -100.0);
        }"""
new_k12_ui = """        let in_son_3 = son_3_donem.some(draw => draw && Array.isArray(draw) && draw.includes(n));
        if (in_son_3 && tekrar_oranlari[n] <= tekrar_baraj) {
            k12 += (config.CEZA_TEKRAR_ETMEYEN_SICAK || -100.0);
        }"""
content = content.replace(old_k12_ui, new_k12_ui)

# Change column header in UI from K12- Ölü Sayı to K12- Aşırı Isınma/Yalancı Sıcak
content = content.replace("<th>K12-<br>Ölü Sayı</th>", "<th>K12-<br>Aşırı Isınma/<br>Yalancı Sıcak</th>")

with open('PROMPT_BUILDER_v8_0_fixed.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI Logic and K11/K12 bugs fixed.")
