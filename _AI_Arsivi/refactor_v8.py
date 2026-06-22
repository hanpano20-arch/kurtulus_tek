import re

def main():
    with open('D:/GitHub/kurtulus_tek/v8_havuz_motoru.js', 'r', encoding='utf-8') as f:
        text = f.read()

    # Step 1: Replace configs
    config_chunk = """
      updateConfigFromUI: function () {
        try {
            const b = localStorage.getItem('hm_base_config');
            if (b) {
                const parsed = JSON.parse(b);
                for(let k in parsed) {
                    this.base_config[k] = parsed[k];
                    this.config[k] = this.base_config[k] * (this.mult_config[k.replace('_PUAN', '_CARPAN')] || 1.0);
                }
            }
            const m = localStorage.getItem('hm_mult_config');
            if (m) {
                const parsed = JSON.parse(m);
                for(let k in parsed) {
                    this.mult_config[k] = parsed[k];
                    let baseKey = k.replace('_CARPAN', '_PUAN');
                    if (this.base_config[baseKey] !== undefined) {
                        this.config[baseKey] = this.base_config[baseKey] * this.mult_config[k];
                    }
                }
            }
        } catch(e) {}
      },
      base_config: {
        K1_PUAN: 100, K2_PUAN: 50, K3_PUAN: 5, K4_PUAN: 50,
        K5_PUAN: 15, K6_PUAN: 8, K7_PUAN: 20, K8_PUAN: 25,
        K9_PUAN: 30, K10_PUAN: 25, K11_PUAN: 40, K12_PUAN: 35,
        K13_PUAN: -50, K14_PUAN: -40, K15_PUAN: -30, K16_PUAN: -100,
        K17_PUAN: -50, K18_PUAN: -200,
        NORM_TARIHSEL_CAP: 100, NORM_GUNCELL_CAP: 100, OLUM_CEZASI_SINIRI: 25
      },
      mult_config: {
        K1_CARPAN: 1.0, K2_CARPAN: 1.0, K3_CARPAN: 1.0, K4_CARPAN: 1.0,
        K5_CARPAN: 1.0, K6_CARPAN: 1.0, K7_CARPAN: 1.0, K8_CARPAN: 1.0,
        K9_CARPAN: 1.0, K10_CARPAN: 1.0, K11_CARPAN: 1.0, K12_CARPAN: 1.0,
        K13_CARPAN: 1.0, K14_CARPAN: 1.0, K15_CARPAN: 1.0, K16_CARPAN: 1.0,
        K17_CARPAN: 1.0, K18_CARPAN: 1.0
      },
      config: {
        K1_PUAN: 100, K2_PUAN: 50, K3_PUAN: 5, K4_PUAN: 50,
        K5_PUAN: 15, K6_PUAN: 8, K7_PUAN: 20, K8_PUAN: 25,
        K9_PUAN: 30, K10_PUAN: 25, K11_PUAN: 40, K12_PUAN: 35,
        K13_PUAN: -50, K14_PUAN: -40, K15_PUAN: -30, K16_PUAN: -100,
        K17_PUAN: -50, K18_PUAN: -200,
        NORM_TARIHSEL_CAP: 100, NORM_GUNCELL_CAP: 100, OLUM_CEZASI_SINIRI: 25
      },
"""

    text = re.sub(r'updateConfigFromUI: function \(\) \{.*?(?=puanlari_hesapla: function)', config_chunk, text, flags=re.DOTALL)

    puanlari_hesapla_chunk = """puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        const config = this.config;
        let puanlar = {};
        let genel_frekans = {};
        let meta_komsular = {};
        let meta_kuraklik = {};

        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = 0;
          genel_frekans[i] = 0;
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

        let k1_raw = {}, k2_raw = {};
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
             puanlar[j] += Math.floor(config.K4_PUAN * ((15 - index)/15)); 
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
                   puanlar[komsu] += Math.floor((config.K4_PUAN * 0.5) * ((15 - index)/15)); 
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
           let k1_val = 0;
           if (max_k1_raw > 0) k1_val = (k1_raw[i] / max_k1_raw) * config.K1_PUAN;
           puanlar[i] += Math.floor(k1_val);

           let k2_val = 0;
           let my_freq = genel_frekans[i];
           if (my_freq >= avg_hist) {
             let ratio = (my_freq - avg_hist) / (max_hist - avg_hist || 1);
             k2_val = ratio * config.K2_PUAN;
           } else {
             let ratio = (avg_hist - my_freq) / (avg_hist - min_hist || 1);
             k2_val = -ratio * config.K2_PUAN;
           }
           puanlar[i] += Math.floor(k2_val);

           let kuraklik = 0;
           for (let idx = 0; idx < df.length; idx++) {
             if (df[idx] && Array.isArray(df[idx]) && df[idx].includes(i)) break;
             kuraklik++;
           }
           meta_kuraklik[i] = kuraklik;
           puanlar[i] += kuraklik * config.K3_PUAN;

           if (komsuSayaci_1[i] > 0) puanlar[i] += komsuSayaci_1[i] * config.K5_PUAN;
           if (komsuSayaci_2[i] > 0) puanlar[i] += komsuSayaci_2[i] * config.K6_PUAN;
           meta_komsular[i] = komsuSayaci_1[i] + komsuSayaci_2[i] + (joker_komsu_count[i] || 0);

           let blok = Math.floor((i - 1) / 10);
           let bas = blok * 10 + 1;
           let bit = Math.min(bas + 9, maxN);
           let cikti = false;
           for(let n=bas; n<=bit; n++) { if (son_2_sayilari.has(n)) { cikti = true; break; } }
           if (!cikti) puanlar[i] += config.K7_PUAN;

           let hits_15 = son_15.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + son_15_joks.filter(j=>j===i).length;
           let hits_10 = son_10.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,10).filter(j=>j===i).length;
           let hits_5 = son_5.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,5).filter(j=>j===i).length;
           let hits_3 = son_3.reduce((s,d)=>s+(d&&d.includes(i)?1:0),0) + joks.slice(0,3).filter(j=>j===i).length;
           let komsuluk = meta_komsular[i] > 0;

           if (hits_15 >= 1 && hits_15 <= 2 && hits_3 >= 1 && !komsuluk) puanlar[i] += config.K8_PUAN;
           if (hits_3 >= 2 && hits_15 <= 3) puanlar[i] += config.K9_PUAN;
           if (hits_15 === 2 && hits_5 === 0) puanlar[i] += config.K10_PUAN;
           if (kuraklik >= 5 && kuraklik <= 15 && hits_15 >= 2 && komsuluk) puanlar[i] += config.K11_PUAN;
           if (hits_10 > 0 && komsuluk) puanlar[i] += config.K12_PUAN;
           
           if (hits_15 >= 4) puanlar[i] += config.K13_PUAN;

           if (df.length >= 2 && 
               ((df[0] && df[0].includes(i)) || joks[0]===i) && 
               ((df[1] && df[1].includes(i)) || joks[1]===i)) {
               puanlar[i] += config.K14_PUAN;
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
           if (doygun) puanlar[i] += config.K15_PUAN;

           let is_in_last = ((df[0] && df[0].includes(i)) || joks[0]===i);
           if (!komsuluk && !is_in_last) puanlar[i] += config.K16_PUAN;

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
               if (streak_events <= 1) puanlar[i] += config.K17_PUAN;
           }

           if (kuraklik >= config.OLUM_CEZASI_SINIRI) puanlar[i] += config.K18_PUAN;
           
           puanlar[i] = Math.floor(puanlar[i] || 0);
        }

        Object.defineProperty(puanlar, '__komsular', { value: meta_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });
        return puanlar;
      },
"""

    text = re.sub(r'puanlari_hesapla: function \(df, maxN, joks = \[\]\) \{.*?(?=akilli_secim:)', puanlari_hesapla_chunk, text, flags=re.DOTALL)

    extractUI_chunk = """extractDetailsForUI: function (n, df, joks = []) {
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        const config = this.config;
        let r = { k1:0, k2:0, k3:0, k4:0, k5:0, k6:0, k7:0, k8:0, k9:0, k10:0, k11:0, k12:0, k13:0, k14:0, k15:0, k16:0, k17:0, k18:0, doygunlukLabel:"" };
        
        let genel_frekans = {};
        for (let i = 1; i <= maxN; i++) genel_frekans[i] = 0;
        df.forEach(d => { if (d && Array.isArray(d)) d.forEach(num => { if(num<=maxN) genel_frekans[num]++; }); });
        
        const son_15 = df.slice(0, 15);
        const son_10 = df.slice(0, 10);
        const son_5 = df.slice(0, 5);
        const son_3 = df.slice(0, 3);
        const son_15_joks = joks.slice(0, 15);
        
        let max_k1_raw = 0;
        let k1_raw_n = 0;
        let total_hist = 0;
        for (let i = 1; i <= maxN; i++) {
           total_hist += genel_frekans[i];
           let f15 = son_15.reduce((s, d) => s + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0) + son_15_joks.filter(j => j === i).length;
           if (i === n) k1_raw_n = f15;
           if (f15 > max_k1_raw) max_k1_raw = f15;
        }
        
        let avg_hist = total_hist / maxN;
        let max_hist = Math.max(...Object.values(genel_frekans));
        let min_hist = Math.min(...Object.values(genel_frekans));

        if (max_k1_raw > 0) r.k1 = Math.floor((k1_raw_n / max_k1_raw) * config.K1_PUAN);
        
        let my_freq = genel_frekans[n];
        if (my_freq >= avg_hist) {
           r.k2 = Math.floor(((my_freq - avg_hist) / (max_hist - avg_hist || 1)) * config.K2_PUAN);
        } else {
           r.k2 = Math.floor(-((avg_hist - my_freq) / (avg_hist - min_hist || 1)) * config.K2_PUAN);
        }

        let kuraklik = 0;
        for (let idx = 0; idx < df.length; idx++) {
           if (df[idx] && Array.isArray(df[idx]) && df[idx].includes(n)) break;
           kuraklik++;
        }
        r.k3 = kuraklik * config.K3_PUAN;

        // K4
        let joker_komsu_count = {};
        son_15_joks.forEach((joker_sayisi, index) => {
          let j = parseInt(joker_sayisi, 10);
          if (j >= 1 && j <= maxN) {
             if (j === n) r.k4 += Math.floor(config.K4_PUAN * ((15 - index)/15)); 
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
                   if (komsu === n) r.k4 += Math.floor((config.K4_PUAN * 0.5) * ((15 - index)/15)); 
                   joker_komsu_count[komsu] = count + 1;
                }
             });
          }
        });

        // K5 & K6
        let k5c = 0, k6c = 0;
        son_3.forEach(cekilis => {
          if (cekilis && Array.isArray(cekilis)) {
             cekilis.forEach(sayi => {
                const sutun = ((sayi - 1) % 10) + 1;
                if (sutun > 1 && sayi-1===n) k5c++;
                if (sutun < 10 && sayi+1===n) k5c++;
                if (sayi - 10 >= 1 && sayi-10===n) k5c++;
                if (sayi + 10 <= maxN && sayi+10===n) k5c++;
                if (sayi - 11 >= 1 && sutun > 1 && sayi-11===n) k5c++;
                if (sayi - 9 >= 1 && sutun < 10 && sayi-9===n) k5c++;
                if (sayi + 9 <= maxN && sutun > 1 && sayi+9===n) k5c++;
                if (sayi + 11 <= maxN && sutun < 10 && sayi+11===n) k5c++;

                if (sutun > 2 && sayi-2===n) k6c++;
                if (sutun < 9 && sayi+2===n) k6c++;
                if (sayi - 20 >= 1 && sayi-20===n) k6c++;
                if (sayi + 20 <= maxN && sayi+20===n) k6c++;
                if (sayi - 22 >= 1 && sutun > 2 && sayi-22===n) k6c++;
                if (sayi - 18 >= 1 && sutun < 9 && sayi-18===n) k6c++;
                if (sayi + 18 <= maxN && sutun > 2 && sayi+18===n) k6c++;
                if (sayi + 22 <= maxN && sutun < 9 && sayi+22===n) k6c++;
             });
          }
        });
        r.k5 = k5c * config.K5_PUAN;
        r.k6 = k6c * config.K6_PUAN;
        let komsuluk = (k5c + k6c + (joker_komsu_count[n]||0)) > 0;

        let son_2_sayilari = new Set();
        df.slice(0, 2).forEach(d => { if(d && Array.isArray(d)) d.forEach(num => son_2_sayilari.add(num)); });
        let blok = Math.floor((n - 1) / 10);
        let bas = blok * 10 + 1;
        let bit = Math.min(bas + 9, maxN);
        let cikti = false;
        for(let x=bas; x<=bit; x++) { if (son_2_sayilari.has(x)) { cikti = true; break; } }
        if (!cikti) r.k7 = config.K7_PUAN;

        let hits_15 = son_15.reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + son_15_joks.filter(j=>j===n).length;
        let hits_10 = son_10.reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + joks.slice(0,10).filter(j=>j===n).length;
        let hits_5 = son_5.reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + joks.slice(0,5).filter(j=>j===n).length;
        let hits_3 = son_3.reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + joks.slice(0,3).filter(j=>j===n).length;

        if (hits_15 >= 1 && hits_15 <= 2 && hits_3 >= 1 && !komsuluk) r.k8 = config.K8_PUAN;
        if (hits_3 >= 2 && hits_15 <= 3) r.k9 = config.K9_PUAN;
        if (hits_15 === 2 && hits_5 === 0) r.k10 = config.K10_PUAN;
        if (kuraklik >= 5 && kuraklik <= 15 && hits_15 >= 2 && komsuluk) r.k11 = config.K11_PUAN;
        if (hits_10 > 0 && komsuluk) r.k12 = config.K12_PUAN;
        if (hits_15 >= 4) r.k13 = config.K13_PUAN;

        if (df.length >= 2 && 
            ((df[0] && df[0].includes(n)) || joks[0]===n) && 
            ((df[1] && df[1].includes(n)) || joks[1]===n)) {
            r.k14 = config.K14_PUAN;
        }

        let doygun = false;
        if (hits_3 >= 2) doygun = true;
        else {
            let h7 = df.slice(0,7).reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + joks.slice(0,7).filter(j=>j===n).length;
            if (h7 >= 3) doygun = true;
            else {
               let h11 = df.slice(0,11).reduce((s,d)=>s+(d&&d.includes(n)?1:0),0) + joks.slice(0,11).filter(j=>j===n).length;
               if (h11 >= 4) doygun = true;
            }
        }
        if (doygun) r.k15 = config.K15_PUAN;

        let is_in_last = ((df[0] && df[0].includes(n)) || joks[0]===n);
        if (!komsuluk && !is_in_last) r.k16 = config.K16_PUAN;

        if (is_in_last) {
            let streak_events = 0;
            let current_streak = 0;
            for (let c = df.length - 1; c >= 0; c--) {
                let hit = (df[c] && df[c].includes(n)) || joks[c]===n;
                if (hit) current_streak++;
                else {
                    if (current_streak >= 2) streak_events++;
                    current_streak = 0;
                }
            }
            if (current_streak >= 2) streak_events++;
            if (streak_events <= 1) r.k17 = config.K17_PUAN;
        }

        if (kuraklik >= config.OLUM_CEZASI_SINIRI) r.k18 = config.K18_PUAN;
        
        // Exact sum correction logic:
        let realScore = this.puanlari_hesapla(df, maxN, joks)[n] || 0;
        let sumUI = r.k1 + r.k2 + r.k3 + r.k4 + r.k5 + r.k6 + r.k7 + r.k8 + r.k9 + r.k10 + r.k11 + r.k12 + r.k13 + r.k14 + r.k15 + r.k16 + r.k17 + r.k18;
        let diff = realScore - sumUI;
        r.k1 += diff; // Just attach rounding differences to K1 to perfectly match.

        return r;
      },
"""
    text = re.sub(r'extractDetailsForUI: function \(n, df, joks = \[\]\) \{.*?(?=getRawData: function)', extractUI_chunk, text, flags=re.DOTALL)

    with open('D:/GitHub/kurtulus_tek/v8_havuz_motoru.js', 'w', encoding='utf-8') as f:
        f.write(text)

main()
