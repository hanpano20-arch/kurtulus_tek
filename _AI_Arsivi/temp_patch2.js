const fs = require('fs');

let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

const puanlamaTarget = `        // ANA PUANLAMA DÖNGÜSÜ
        // === SEÇENEk 1+2: Normalize edilmiş taban puan ===
        // Tüm sayılarda tarihsel ve güncel puanların ham değerlerini hesapla
        let raw_hist = {}, raw_rec = {};
        let max_rec = 0;
        for (let i = 1; i <= maxN; i++) {
          raw_hist[i] = genel_frekans[i] || 0;
          let f15r = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10r = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5r = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          raw_rec[i] = ((f15r * this.config.CARPAN_15) + (f10r * this.config.CARPAN_10) + (f5r * this.config.CARPAN_5)) * (this.config.YUZDE_SON_15_DONEM / 100);
          if (raw_rec[i] > max_rec) max_rec = raw_rec[i];
        }

        // Tarihsel Puan Z-Score (Yumuşatılmış Çan Eğrisi)
        let total_hist = Object.values(raw_hist).reduce((a, b) => a + b, 0);
        let avg_hist = total_hist / maxN;
        let max_freq = Math.max(...Object.values(raw_hist));
        let min_freq = Math.min(...Object.values(raw_hist));

        const recCap = this.config.NORM_GUNCELL_CAP || 80;

        for (let i = 1; i <= maxN; i++) {
          let gecmis_puani = 0;
          let my_freq = raw_hist[i];
          if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * 20);
          } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -20);
          }

          // Güncel puanı 0-recCap aralığına normalize et
          let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * recCap) : 0;

          let f15 = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);

          puanlar[i] += Math.floor(gecmis_puani + yakin_puani);`;

const puanlamaNew = `        // ANA PUANLAMA DÖNGÜSÜ
        // === SEÇENEk 1+2: Normalize edilmiş taban puan iptal edildi, direkt çarpan ===
        let total_hist = 0;
        for (let i = 1; i <= maxN; i++) total_hist += (genel_frekans[i] || 0);
        let avg_hist = total_hist / maxN;

        for (let i = 1; i <= maxN; i++) {
          let my_freq = genel_frekans[i] || 0;
          let gecmis_puani = (my_freq - avg_hist) * (this.config.YUZDE_TUM_GECMIS / 10);
          
          let f15 = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);

          let yakin_puani = ((f15 * this.config.CARPAN_15) + (f10 * this.config.CARPAN_10) + (f5 * this.config.CARPAN_5)) * (this.config.YUZDE_SON_15_DONEM / 100);

          puanlar[i] += Math.floor(gecmis_puani + yakin_puani);

          // 🔥 Maksimum Seri Rekoru (28'i Kurtaran Kural) 🔥
          let max_streak = 0;
          let current_streak = 0;
          for (let c = 0; c < df.length; c++) {
              if (df[c] && Array.isArray(df[c]) && df[c].includes(i)) {
                  current_streak++;
                  if (current_streak > max_streak) max_streak = current_streak;
              } else {
                  current_streak = 0;
              }
          }
          if (max_streak <= 2) {
              puanlar[i] -= 50; 
          } else if (max_streak >= 5) {
              puanlar[i] += 80; 
          }

          // 🚨 Mutlak İzolasyon Kafesi (41, 50, 70 İnfazı) 🚨
          let my_komsu = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) + 
                         (typeof komsuSayaci_2 !== 'undefined' ? (komsuSayaci_2[i] || 0) : 0) + 
                         (typeof jokerKomsuSayaci !== 'undefined' ? (jokerKomsuSayaci[i] || 0) : 0);
          if (my_komsu === 0) {
              puanlar[i] -= 100; 
          }`;

function normalize(str) {
    return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

let nContent = normalize(content);
let nTarget = normalize(puanlamaTarget);
let nNew = normalize(puanlamaNew);

if (nContent.includes(nTarget)) {
    nContent = nContent.replace(nTarget, nNew);
    console.log("Puanlama block replaced successfully.");
    fs.writeFileSync('PROMPT_BUILDER_v8_0.html', nContent, 'utf-8');
} else {
    console.log("FAILED to find Puanlama block.");
}
