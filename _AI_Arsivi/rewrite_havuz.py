import sys
import re

file_path = r'D:\GitHub\kurtulus_tek\v8_havuz_motoru.js'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('puanlari_hesapla: function')
end_idx = text.find('akilli_secim: function')

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    sys.exit(1)

new_func = """puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        const config = this.config;
        let puanlar = {};
        let genel_frekans = {};
        let meta_komsular = {};
        let meta_kuraklik = {};
        let meta_details = {};

        // Tarihsel / Guncel multiplier fallback
        let t_carpan = this.mult_config['TARIHSEL_CARPAN'] !== undefined ? this.mult_config['TARIHSEL_CARPAN'] : 1.0;
        let g_carpan = this.mult_config['GUNCEL_CARPAN'] !== undefined ? this.mult_config['GUNCEL_CARPAN'] : 1.0;

        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = 0;
          genel_frekans[i] = 0;
          meta_details[i] = {
             tarihsel: 0, guncel: 0,
             k1:0, k2:0, k3:0, k4:0, k5:0, k6:0, k7:0, k8:0, k9:0, k10:0, k11:0, k12:0,
             k13:0, k14:0, k15:0, k16:0, k17:0, k18:0
          };
        }

        df.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(num => {
              if (num >= 1 && num <= maxN) genel_frekans[num]++;
            });
          }
        });

        const son_15 = df.slice(0, 15);
        const son_10 = df.slice(0, 10);
        const son_5 = df.slice(0, 5);
        const son_3 = df.slice(0, 3);
        const son_15_joks = joks.slice(0, 15);

        let k1_raw = {};
        let max_k1_raw = 0;
        let total_hist = 0;
        for (let i = 1; i <= maxN; i++) {
          total_hist += genel_frekans[i];
          let f15 = son_15.reduce((s, d) => s + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let j15 = son_15_joks.filter(j => j === i).length;
          let total_hits_15 = f15 + j15; 
          k1_raw[i] = total_hits_15;
          if (total_hits_15 > max_k1_raw) max_k1_raw = total_hits_15;
        }
        let avg_hist = total_hist / maxN;
        let max_hist = Math.max(...Object.values(genel_frekans));
        let min_hist = Math.min(...Object.values(genel_frekans));

        let joker_komsu_count = {};
        son_15_joks.forEach((joker_sayisi, index) => {
          let j = parseInt(joker_sayisi, 10);
          if (j >= 1 && j <= maxN) {
             let baseK4 = config.K4_PUAN !== undefined ? config.K4_PUAN : (this.base_config.K4_PUAN * (this.mult_config['K4_CARPAN']||1.0));
             meta_details[j].k4 += Math.floor(baseK4 * ((15 - index)/15)); 
             const sutun = ((j - 1) % 10) + 1;
             const jk = [];
             if (sutun > 1)  jk.push(j - 1);
             if (sutun < 10) jk.push(j + 1);
             if (j - 10 >= 1)    jk.push(j - 10);
             if (j + 10 <= maxN) jk.push(j + 10);
             if (j - 11 >= 1    && sutun > 1)  jk.push(j - 11);
             if (j -  9 >= 1    && sutun < 10) jk.push(j -  9);
             if (j +  9 <= maxN && sutun > 1)  jk.push(j +  9);
             if (j + 11 <= maxN && sutun < 10) jk.push(j + 11);
             jk.forEach(komsu => {
                let count = joker_komsu_count[komsu] || 0;
                if (count < 2) { 
                   meta_details[komsu].k4 += Math.floor((baseK4 * 0.5) * ((15 - index)/15)); 
                   joker_komsu_count[komsu] = count + 1;
                }
             });
          }
        });

        let komsuSayaci_1 = {}, komsuSayaci_2 = {};
        for(let i=1; i<=maxN; i++) { komsuSayaci_1[i] = 0; komsuSayaci_2[i] = 0; }
        
        son_3.forEach(cekilis => {
          if (cekilis && Array.isArray(cekilis)) {
             cekilis.forEach(sayi => {
                const sutun = ((sayi - 1) % 10) + 1;
                if (sutun > 1)  komsuSayaci_1[sayi - 1]++;
                if (sutun < 10) komsuSayaci_1[sayi + 1]++;
                if (sayi - 10 >= 1)    komsuSayaci_1[sayi - 10]++;
                if (sayi + 10 <= maxN) komsuSayaci_1[sayi + 10]++;
                if (sayi - 11 >= 1    && sutun > 1)  komsuSayaci_1[sayi - 11]++;
                if (sayi -  9 >= 1    && sutun < 10) komsuSayaci_1[sayi -  9]++;
                if (sayi +  9 <= maxN && sutun > 1)  komsuSayaci_1[sayi +  9]++;
                if (sayi + 11 <= maxN && sutun < 10) komsuSayaci_1[sayi + 11]++;

                if (sutun > 2)  komsuSayaci_2[sayi - 2]++;
                if (sutun < 9)  komsuSayaci_2[sayi + 2]++;
                if (sayi - 20 >= 1)    komsuSayaci_2[sayi - 20]++;
                if (sayi + 20 <= maxN) komsuSayaci_2[sayi + 20]++;
                if (sayi - 22 >= 1    && sutun > 2)  komsuSayaci_2[sayi - 22]++;
                if (sayi - 18 >= 1    && sutun < 9)  komsuSayaci_2[sayi - 18]++;
                if (sayi + 18 <= maxN && sutun > 2)  komsuSayaci_2[sayi + 18]++;
                if (sayi + 22 <= maxN && sutun < 9)  komsuSayaci_2[sayi + 22]++;
             });
          }
        });
        
        let son_2_sayilari = new Set();
        df.slice(0, 2).forEach(d => {
            if(d && Array.isArray(d)) d.forEach(num => son_2_sayilari.add(num));
        });

        for (let i = 1; i <= maxN; i++) {
           // K1 (Guncel taban -> Tarihsel kategorisine gecti)
           let k1_val = 0;
           if (max_k1_raw > 0) k1_val = (k1_raw[i] / max_k1_raw) * (config.K1_PUAN || 0);
           meta_details[i].k1 = Math.floor(k1_val);

           // K2 (Tarihsel Genel Frekans)
           let k2_val = 0;
           let my_freq = genel_frekans[i];
           if (my_freq >= avg_hist) {
             let ratio = (my_freq - avg_hist) / (max_hist - avg_hist || 1);
             k2_val = ratio * (config.K2_PUAN || 0);
           } else {
             let ratio = (avg_hist - my_freq) / (avg_hist - min_hist || 1);
             k2_val = -ratio * (config.K2_PUAN || 0);
           }
           meta_details[i].k2 = Math.floor(k2_val);

           // K3 (Kuraklik)
           let kuraklik = 0;
           for (let idx = 0; idx < df.length; idx++) {
             if (df[idx] && Array.isArray(df[idx]) && df[idx].includes(i)) break;
             kuraklik++;
           }
           meta_kuraklik[i] = kuraklik;
           meta_details[i].k3 = kuraklik * (config.K3_PUAN || 0);

           // K5, K6 (Komsuluk)
           if (komsuSayaci_1[i] > 0) meta_details[i].k5 = komsuSayaci_1[i] * (config.K5_PUAN || 0);
           if (komsuSayaci_2[i] > 0) meta_details[i].k6 = komsuSayaci_2[i] * (config.K6_PUAN || 0);
           meta_komsular[i] = komsuSayaci_1[i] + komsuSayaci_2[i] + (joker_komsu_count[i] || 0);

           // K7 (Blok)
           let blok = Math.floor((i - 1) / 10);
           let bas = blok * 10 + 1;
           let bit = Math.min(bas + 9, maxN);
           let cikti = false;
           for(let n=bas; n<=bit; n++) { if (son_2_sayilari.has(n)) { cikti = true; break; } }
           if (!cikti) meta_details[i].k7 = (config.K7_PUAN || 0);

           let hits_15 = son_15.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + son_15_joks.filter(j=>j===i).length;
           let hits_10 = son_10.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,10).filter(j=>j===i).length;
           let hits_5 = son_5.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,5).filter(j=>j===i).length;
           let hits_3 = son_3.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,3).filter(j=>j===i).length;
           let komsuluk = meta_komsular[i] > 0;

           if (hits_15 >= 1 && hits_15 <= 2 && hits_3 >= 1 && !komsuluk) meta_details[i].k8 = (config.K8_PUAN || 0);
           if (hits_3 >= 2 && hits_15 <= 3) meta_details[i].k9 = (config.K9_PUAN || 0);
           if (hits_15 === 2 && hits_5 === 0) meta_details[i].k10 = (config.K10_PUAN || 0);
           if (kuraklik >= 5 && kuraklik <= 15 && hits_15 >= 2 && komsuluk) meta_details[i].k11 = (config.K11_PUAN || 0);
           if (hits_10 > 0 && komsuluk) meta_details[i].k12 = (config.K12_PUAN || 0);
           
           if (hits_15 >= 4) meta_details[i].k13 = (config.K13_PUAN || 0);

           if (df.length >= 2 && 
               ((df[0] && df[0].includes(i)) || joks[0]===i) && 
               ((df[1] && df[1].includes(i)) || joks[1]===i)) {
               meta_details[i].k14 = (config.K14_PUAN || 0); // Need to use K14 logic correctly but for now use K14_PUAN
           }

           let doygun = false;
           if (hits_3 >= 2) doygun = true;
           else {
               let h7 = df.slice(0,7).reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,7).filter(j=>j===i).length;
               if (h7 >= 3) doygun = true;
               else {
                  let h11 = df.slice(0,11).reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,11).filter(j=>j===i).length;
                  if (h11 >= 4) doygun = true;
               }
           }
           if (doygun) meta_details[i].k15 = (config.K15_PUAN || 0);

           let is_in_last = ((df[0] && df[0].includes(i)) || joks[0]===i);
           if (!komsuluk && !is_in_last) {
              // Fix for K16 Isolated Penalty being hardcoded to -100
              meta_details[i].k16 = config.K16_PUAN !== undefined ? config.K16_PUAN : -100;
           }

           if (is_in_last) {
               let streak_events = 0;
               let current_streak = 0;
               for (let c = df.length - 1; c >= 0; c--) {
                   let hit = (df[c] && df[c].includes(i)) || joks[c]===i;
                   if (hit) current_streak++;
                   else {
                       if (current_streak >= 2) streak_events++;
                       current_streak = 0;
                   }
               }
               if (current_streak >= 2) streak_events++;
               if (streak_events <= 1) meta_details[i].k17 = (config.K17_PUAN || 0);
           }

           if (kuraklik >= (config.OLUM_CEZASI_SINIRI || 30)) meta_details[i].k18 = (config.K18_PUAN || 0);

           // TARIHSEL TOPLAM
           let t_toplam = meta_details[i].k1 + meta_details[i].k2 + meta_details[i].k3;
           meta_details[i].tarihsel = t_toplam * t_carpan;

           // GUNCEL TOPLAM
           let g_toplam = meta_details[i].k4 + meta_details[i].k5 + meta_details[i].k6 + meta_details[i].k7 + 
                          meta_details[i].k8 + meta_details[i].k9 + meta_details[i].k10 + meta_details[i].k11 + meta_details[i].k12;
           meta_details[i].guncel = g_toplam * g_carpan;

           // CEZALAR TOPLAM
           let c_toplam = meta_details[i].k13 + meta_details[i].k14 + meta_details[i].k15 + 
                          meta_details[i].k16 + meta_details[i].k17 + meta_details[i].k18;

           let final_val = meta_details[i].tarihsel + meta_details[i].guncel + c_toplam;
           puanlar[i] = Math.floor(final_val || 0);
        }

        Object.defineProperty(puanlar, '__komsular', { value: meta_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });
        Object.defineProperty(puanlar, '__details', { value: meta_details, enumerable: false });
        return puanlar;
      },
"""

new_text = text[:start_idx] + new_func + text[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("v8_havuz_motoru.js updated with detailed puanlari_hesapla!")
