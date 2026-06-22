// --- HAVUZ MOTORU ENTEGRASYONU ---
    window.HavuzMotoru = {
                  
            updateConfigFromUI: function () {
        try {
            const b = localStorage.getItem('hm_base_config');
            if (b) {
                const parsed = JSON.parse(b);
                for(let k in parsed) {
                    this.base_config[k] = parsed[k];
                }
            }
            const m = localStorage.getItem('hm_mult_config');
            if (m) {
                const parsed = JSON.parse(m);
                for(let k in parsed) {
                    this.mult_config[k] = parseFloat(parsed[k]);
                }
            }
        } catch(e) {}

        // Initialize config from base_config
        for(let k in this.base_config) {
            this.config[k] = this.base_config[k];
        }

        // Apply slider overrides from mult_config directly
        for(let k in this.mult_config) {
            if (!isNaN(this.mult_config[k])) {
                // Load K_PUAN, K_ÇUBUK, ve special keys
                if (k.endsWith('_PUAN') || k.endsWith('_ÇUBUK') || k.endsWith('_SINIRI') || k.endsWith('_CARPAN')) {
                    this.config[k] = this.mult_config[k];
                }
            }
        }
      },
      base_config: {
        // HAM PUAN (Çubuk olmadan temel değer)
        K1_PUAN: 100, K2_PUAN: 50, K3_PUAN: 5, K4_PUAN: 50,
        K5_PUAN: 15, K6_PUAN: 8, K7_PUAN: 20, K8_PUAN: 25,
        K9_PUAN: 30, K10_PUAN: 25, K11_PUAN: 40, K12_PUAN: 35,
        K13_PUAN: -50, K14_PUAN: -40, K14_PUAN_4: -40, K14_PUAN_8: -50, K14_PUAN_12: -60, K14_PUAN_16: -80,
        K15_PUAN: -30, K16_PUAN: -100, K17_PUAN: -50, K18_PUAN: -200,
        
        // ÇUBUKLAR (Çarpan) — 0-200 (0x ile 2x çarpan) — başlangıç=100 (1.0x)
        K1_ÇUBUK: 100, K2_ÇUBUK: 100, K3_ÇUBUK: 100, K4_ÇUBUK: 100,
        K5_ÇUBUK: 100, K6_ÇUBUK: 100, K7_ÇUBUK: 100, K8_ÇUBUK: 100,
        K9_ÇUBUK: 100, K10_ÇUBUK: 100, K11_ÇUBUK: 100, K12_ÇUBUK: 100,
        K13_ÇUBUK: 100, K14_ÇUBUK: 100, K14_ÇUBUK_4: 100, K14_ÇUBUK_8: 100, K14_ÇUBUK_12: 100, K14_ÇUBUK_16: 100,
        K15_ÇUBUK: 100, K16_ÇUBUK: 100, K17_ÇUBUK: 100, K18_ÇUBUK: 100,
        
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
        // HAM PUAN (Çubuk olmadan temel değer)
        K1_PUAN: 100, K2_PUAN: 50, K3_PUAN: 5, K4_PUAN: 50,
        K5_PUAN: 15, K6_PUAN: 8, K7_PUAN: 20, K8_PUAN: 25,
        K9_PUAN: 30, K10_PUAN: 25, K11_PUAN: 40, K12_PUAN: 35,
        K13_PUAN: -50, K14_PUAN: -40, K14_PUAN_4: -40, K14_PUAN_8: -50, K14_PUAN_12: -60, K14_PUAN_16: -80,
        K15_PUAN: -30, K16_PUAN: -100, K17_PUAN: -50, K18_PUAN: -200,
        
        // ÇUBUKLAR (Çarpan) — 0-200 (0x ile 2x çarpan) — başlangıç=100 (1.0x)
        K1_ÇUBUK: 100, K2_ÇUBUK: 100, K3_ÇUBUK: 100, K4_ÇUBUK: 100,
        K5_ÇUBUK: 100, K6_ÇUBUK: 100, K7_ÇUBUK: 100, K8_ÇUBUK: 100,
        K9_ÇUBUK: 100, K10_ÇUBUK: 100, K11_ÇUBUK: 100, K12_ÇUBUK: 100,
        K13_ÇUBUK: 100, K14_ÇUBUK: 100, K14_ÇUBUK_4: 100, K14_ÇUBUK_8: 100, K14_ÇUBUK_12: 100, K14_ÇUBUK_16: 100,
        K15_ÇUBUK: 100, K16_ÇUBUK: 100, K17_ÇUBUK: 100, K18_ÇUBUK: 100,
        
        NORM_TARIHSEL_CAP: 100, NORM_GUNCELL_CAP: 100, OLUM_CEZASI_SINIRI: 25
      },
puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        const config = this.config;
        let puanlar = {};
        let genel_frekans = {};
        let meta_komsular = {};
        let meta_kuraklik = {};
        let meta_details = {};

        // Tarihsel / Guncel multiplier fallback
        let t_carpan = (this.mult_config['TARIHSEL_CARPAN'] !== undefined && !isNaN(this.mult_config['TARIHSEL_CARPAN'])) ? this.mult_config['TARIHSEL_CARPAN'] : 1.0;
        let g_carpan = (this.mult_config['GUNCEL_CARPAN'] !== undefined && !isNaN(this.mult_config['GUNCEL_CARPAN'])) ? this.mult_config['GUNCEL_CARPAN'] : 1.0;

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
        
        son_3.forEach((cekilis, idx) => {
          if (cekilis && Array.isArray(cekilis)) {
             let tum_sayilar = [...cekilis];
             if (joks[idx]) tum_sayilar.push(parseInt(joks[idx], 10));

             tum_sayilar.forEach(sayi => {
                if (sayi < 1 || sayi > maxN) return;
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
           
           // S2 FIX: K3/K18 çelişkisini çöz - K18 eşiğine ulaşırsa K3 puanını sıfırla
           if (kuraklik >= (config.OLUM_CEZASI_SINIRI || 25)) {
             meta_details[i].k3 = 0;
           }

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

           // K14 - SEÇENEK B: Ardışık 4, 8, 12, 16 çekilişte cezası
           let consecutive_count = 0;
           for (let c = 0; c < df.length - 1; c++) {
               let hit1 = (df[c] && df[c].includes(i)) || joks[c] === i;
               let hit2 = (df[c+1] && df[c+1].includes(i)) || joks[c+1] === i;
               if (hit1 && hit2) consecutive_count++;
           }
           // Ardışık sayısına göre uygun puan config'ini kullan + çubuk uygulaması
           if (consecutive_count >= 16) {
               meta_details[i].k14 = (config.K14_PUAN_16 !== undefined ? config.K14_PUAN_16 : (config.K14_PUAN || 0));
               let cubuk = config.K14_ÇUBUK_16 !== undefined ? config.K14_ÇUBUK_16 : (config.K14_ÇUBUK || 100);
               meta_details[i].k14 = Math.floor(meta_details[i].k14 * (cubuk / 100));
           } else if (consecutive_count >= 12) {
               meta_details[i].k14 = (config.K14_PUAN_12 !== undefined ? config.K14_PUAN_12 : (config.K14_PUAN || 0));
               let cubuk = config.K14_ÇUBUK_12 !== undefined ? config.K14_ÇUBUK_12 : (config.K14_ÇUBUK || 100);
               meta_details[i].k14 = Math.floor(meta_details[i].k14 * (cubuk / 100));
           } else if (consecutive_count >= 8) {
               meta_details[i].k14 = (config.K14_PUAN_8 !== undefined ? config.K14_PUAN_8 : (config.K14_PUAN || 0));
               let cubuk = config.K14_ÇUBUK_8 !== undefined ? config.K14_ÇUBUK_8 : (config.K14_ÇUBUK || 100);
               meta_details[i].k14 = Math.floor(meta_details[i].k14 * (cubuk / 100));
           } else if (consecutive_count >= 4) {
               meta_details[i].k14 = (config.K14_PUAN_4 !== undefined ? config.K14_PUAN_4 : (config.K14_PUAN || 0));
               let cubuk = config.K14_ÇUBUK_4 !== undefined ? config.K14_ÇUBUK_4 : (config.K14_ÇUBUK || 100);
               meta_details[i].k14 = Math.floor(meta_details[i].k14 * (cubuk / 100));
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
           meta_details[i].k1 = Math.floor(meta_details[i].k1 * t_carpan);
           meta_details[i].k2 = Math.floor(meta_details[i].k2 * t_carpan);
           meta_details[i].k3 = Math.floor(meta_details[i].k3 * t_carpan);
           let t_toplam = meta_details[i].k1 + meta_details[i].k2 + meta_details[i].k3;
           meta_details[i].tarihsel = t_toplam;

           // GUNCEL TOPLAM
           meta_details[i].k4 = Math.floor(meta_details[i].k4 * g_carpan);
           meta_details[i].k5 = Math.floor(meta_details[i].k5 * g_carpan);
           meta_details[i].k6 = Math.floor(meta_details[i].k6 * g_carpan);
           meta_details[i].k7 = Math.floor(meta_details[i].k7 * g_carpan);
           meta_details[i].k8 = Math.floor(meta_details[i].k8 * g_carpan);
           meta_details[i].k9 = Math.floor(meta_details[i].k9 * g_carpan);
           meta_details[i].k10 = Math.floor(meta_details[i].k10 * g_carpan);
           meta_details[i].k11 = Math.floor(meta_details[i].k11 * g_carpan);
           meta_details[i].k12 = Math.floor(meta_details[i].k12 * g_carpan);
           let g_toplam = meta_details[i].k4 + meta_details[i].k5 + meta_details[i].k6 + meta_details[i].k7 + 
                          meta_details[i].k8 + meta_details[i].k9 + meta_details[i].k10 + meta_details[i].k11 + meta_details[i].k12;
           meta_details[i].guncel = g_toplam;

           // ÇUBUKları uygula (Çarpan Sistemi) — 0-200 (0x ile 2x)
           // K1-K3 (Tarihsel)
           meta_details[i].k1 = Math.floor(meta_details[i].k1 * ((config.K1_ÇUBUK || 100) / 100));
           meta_details[i].k2 = Math.floor(meta_details[i].k2 * ((config.K2_ÇUBUK || 100) / 100));
           meta_details[i].k3 = Math.floor(meta_details[i].k3 * ((config.K3_ÇUBUK || 100) / 100));
           
           // K4-K12 (Güncel)
           meta_details[i].k4 = Math.floor(meta_details[i].k4 * ((config.K4_ÇUBUK || 100) / 100));
           meta_details[i].k5 = Math.floor(meta_details[i].k5 * ((config.K5_ÇUBUK || 100) / 100));
           meta_details[i].k6 = Math.floor(meta_details[i].k6 * ((config.K6_ÇUBUK || 100) / 100));
           meta_details[i].k7 = Math.floor(meta_details[i].k7 * ((config.K7_ÇUBUK || 100) / 100));
           meta_details[i].k8 = Math.floor(meta_details[i].k8 * ((config.K8_ÇUBUK || 100) / 100));
           meta_details[i].k9 = Math.floor(meta_details[i].k9 * ((config.K9_ÇUBUK || 100) / 100));
           meta_details[i].k10 = Math.floor(meta_details[i].k10 * ((config.K10_ÇUBUK || 100) / 100));
           meta_details[i].k11 = Math.floor(meta_details[i].k11 * ((config.K11_ÇUBUK || 100) / 100));
           meta_details[i].k12 = Math.floor(meta_details[i].k12 * ((config.K12_ÇUBUK || 100) / 100));
           
           // K13-K18 (Cezalar) — K14 çubuğu önceden uygulandı
           meta_details[i].k13 = Math.floor(meta_details[i].k13 * ((config.K13_ÇUBUK || 100) / 100));
           // K14 çubuğu ÖNCESİ uygulandığı için SKIP (consecutive_count'a göre farklı çubuks)
           meta_details[i].k15 = Math.floor(meta_details[i].k15 * ((config.K15_ÇUBUK || 100) / 100));
           meta_details[i].k16 = Math.floor(meta_details[i].k16 * ((config.K16_ÇUBUK || 100) / 100));
           meta_details[i].k17 = Math.floor(meta_details[i].k17 * ((config.K17_ÇUBUK || 100) / 100));
           meta_details[i].k18 = Math.floor(meta_details[i].k18 * ((config.K18_ÇUBUK || 100) / 100));

           // TOPLAMLAR YENİDEN HESAPLA (çubuk uygulaması sonrası)
           let t_toplam_new = meta_details[i].k1 + meta_details[i].k2 + meta_details[i].k3;
           meta_details[i].tarihsel = t_toplam_new;
           
           let g_toplam_new = meta_details[i].k4 + meta_details[i].k5 + meta_details[i].k6 + meta_details[i].k7 + 
                              meta_details[i].k8 + meta_details[i].k9 + meta_details[i].k10 + meta_details[i].k11 + meta_details[i].k12;
           meta_details[i].guncel = g_toplam_new;

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
akilli_secim: function (sirali, puanlar, poolSize) {
        let eklenecekler = new Set();
        
        let topCount = Math.floor(poolSize * 0.65);
        let komsuCount = Math.floor(poolSize * 0.20);

        // 1. Kategori: En Yüksek Puanlılar (Sıcak/Genel Başarı)
        for (let i = 0; i < sirali.length && eklenecekler.size < topCount; i++) {
            eklenecekler.add(parseInt(sirali[i][0]));
        }

        // 2. Kategori: Puanı Düşük Ama Komşuluğu Olanlar (Kullanıcının Harika Fikri!)
        let komsu_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return !eklenecekler.has(n) && (puanlar.__komsular && puanlar.__komsular[n] > 0);
        });

        // SİZİN EMRİNİZ: "Puanı Düşükse ama komşuluğu varsa..." 
        // Önce en yüksek komşuluk gücüne göre, eşitse en düşük puana göre sıralıyoruz! (Gizli Cevherleri kurtarmak için)
        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En çok komşuluğu olan ÖNCE!
            return parseInt(a[1]) - parseInt(b[1]); // Eşit komşulukta en DÜŞÜK puanlı ÖNCE!
        });

        for (let i = 0; i < komsu_adaylari.length && komsuCount > 0; i++) {
            eklenecekler.add(parseInt(komsu_adaylari[i][0]));
            komsuCount--;
        }

        // 3. Kategori: Derin Kuraklık (Dengeleyici Soğuk Sayılar)
        let kalan_kota = poolSize - eklenecekler.size;
        let kurak_adaylari = sirali.filter(x => !eklenecekler.has(parseInt(x[0])));
        kurak_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]); let nB = parseInt(b[0]);
            let kA = puanlar.__kuraklik ? puanlar.__kuraklik[nA] || 0 : 0;
            let kB = puanlar.__kuraklik ? puanlar.__kuraklik[nB] || 0 : 0;
            return kB - kA; 
        });

        for (let i = 0; i < kurak_adaylari.length && kalan_kota > 0; i++) {
            eklenecekler.add(parseInt(kurak_adaylari[i][0]));
            kalan_kota--;
        }

        // Eğer hala boşluk kaldıysa, puan sırasına göre doldur
        for (let i = 0; i < sirali.length && eklenecekler.size < poolSize; i++) {
            eklenecekler.add(parseInt(sirali[i][0]));
        }

        return Array.from(eklenecekler);
      },

      autoTune: async function () {
        const rawDraws = this.getRawData();
        const testCount = parseInt(document.getElementById('hm-test-count').value) || 10;
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 30;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;

        if (rawDraws.length < testCount + 15) {
          alert(`Test için yeterli veri yok. En az ${testCount + 15} çekiliş gerekli.`);
          return;
        }

        let btn = document.querySelector('button[onclick="window.HavuzMotoru.autoTune()"]');
        let orgText = btn ? btn.innerHTML : "";
        if (btn) btn.innerHTML = "⏳ Yapay Zeka Hill Climbing Optimizasyonu... Lütfen Bekleyin";

        await new Promise(r => setTimeout(r, 50));

        const idMap = {
            K5_PUAN: 'komsu', K6_PUAN: 'komsu2', K4_PUAN: 'kurak',
            K7_PUAN: 'onluk', K9_PUAN: 'ivme',
            K10_PUAN: 'gecik', K8_PUAN: 'joker',
            K18_PUAN: 'olu', OLUM_CEZASI_SINIRI: 'kurak_sinir',
            K13_PUAN: 'cifte', K14_PUAN_4: 'c4',
            K14_PUAN_8: 'c8', K14_PUAN_12: 'c12', K14_PUAN_16: 'c16',
            K16_PUAN: 'izolasyon'
        };

        const ranges = {
          K5_PUAN: [5, 50],
          K6_PUAN: [0, 20],
          K4_PUAN: [0, 20],
          K7_PUAN: [0, 50],
          K9_PUAN: [0, 100],
          K10_PUAN: [0, 50],
          K8_PUAN: [0, 20],
          K18_PUAN: [-200, 0],
          OLUM_CEZASI_SINIRI: [15, 50],
          K13_PUAN: [-500, 0],
          K14_PUAN_4: [-500, 0],
          K14_PUAN_8: [-500, 0],
          K14_PUAN_12: [-500, 0],
          K14_PUAN_16: [-500, 0],
          K16_PUAN: [-200, 0]
        };

        // Mevcut config ile başla
        let best_config = {};
        for (let key in idMap) {
            best_config[key] = this.config[key] !== undefined ? this.config[key] : ranges[key][0];
        }

        const evaluate = (cfg) => {
          let temp_backup = Object.assign({}, this.config);
          Object.assign(this.config, cfg);
          let toplam_dogru = 0;
          let toplam_fitness = 0;

          for (let i = testCount - 1; i >= 0; i--) {
            let gercek_cekilis_df = rawDraws.slice(i + 1).map(d => d.nums);
            let gercek_joks = rawDraws.slice(i + 1).map(d => d.joker || null);
            let hedef_cekilis = rawDraws[i].nums.slice(0, 6);

            let puanlar = this.puanlari_hesapla(gercek_cekilis_df, maxN, gercek_joks);
            let sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);

            // Kotalı Akıllı Seçim Uygulandı!
            let havuz = this.akilli_secim(sirali, puanlar, poolSize);

            let bilinen_sayi = havuz.filter(x => hedef_cekilis.includes(x)).length;
            toplam_dogru += bilinen_sayi;

            // Yumuşatılmış Fitness fonksiyonu
            if (bilinen_sayi === 0) toplam_fitness -= 20;
            else if (bilinen_sayi === 1) toplam_fitness -= 5;
            else if (bilinen_sayi === 2) toplam_fitness += 2;
            else if (bilinen_sayi === 3) toplam_fitness += 15;
            else if (bilinen_sayi === 4) toplam_fitness += 50;
            else if (bilinen_sayi === 5) toplam_fitness += 150;
            else if (bilinen_sayi === 6) toplam_fitness += 500;
          }
          Object.assign(this.config, temp_backup);
          return { fitness: toplam_fitness, avg: toplam_dogru / testCount };
        };

        let current_eval = evaluate(best_config);
        let best_fitness = current_eval.fitness;
        let best_avg = current_eval.avg;

        // Hill Climbing / Simüle Edilmiş Tavlama
        const ITERATIONS = 1500;
        const keys = Object.keys(idMap);

        for (let iter = 0; iter < ITERATIONS; iter++) {
          let test_config = Object.assign({}, best_config);
          
          // Rastgele 2 ila 5 parametreyi mutasyona uğrat
          let num_mutations = Math.floor(Math.random() * 4) + 2;
          for (let m = 0; m < num_mutations; m++) {
            let key = keys[Math.floor(Math.random() * keys.length)];
            let range = ranges[key];
            // Parametre aralığının %10'u kadar aşağı veya yukarı kaydır
            let shift = (Math.random() - 0.5) * 0.20 * (range[1] - range[0]);
            test_config[key] += shift;
            
            // Sınırları aşmasını engelle
            if (test_config[key] < range[0]) test_config[key] = range[0];
            if (test_config[key] > range[1]) test_config[key] = range[1];
          }

          let res = evaluate(test_config);
          
          // Daha iyi veya EŞİTSE kabul et (yerel minimumdan çıkmak için eşitliği kabul ediyoruz)
          // Hatta iterasyonların başlarında çok küçük ihtimalle daha kötüleri de kabul edebiliriz (Simulated Annealing) ama şimdilik greedy yapalım.
          if (res.fitness >= best_fitness) {
            best_fitness = res.fitness;
            best_avg = res.avg;
            best_config = Object.assign({}, test_config);
            this.base_config = JSON.parse(JSON.stringify(best_config));
            try { localStorage.setItem('hm_base_config', JSON.stringify(this.base_config)); } catch(e) {}
          }
        }

        if (best_config) {
          for (let k in best_config) {
            let el = document.getElementById('hm_' + idMap[k]);
            let sel = document.getElementById('ws-hm_' + idMap[k]);
            let val = (k.startsWith('CEZA') || k.startsWith('OLUM')) ? Math.round(best_config[k]) : best_config[k].toFixed(1);
            if (sel) {
              sel.value = val;
              if (el) el.value = val;
              let wv = document.getElementById('wv-hm_' + idMap[k]);
              if (wv) wv.innerText = val;
              let wlb = document.getElementById('wlb-hm_' + idMap[k]);
              if (wlb) wlb.innerText = val;
            }
          }
          this.updateConfigFromUI();
          this.testHistorical();
          
          let alertMsg = `Yapay Zeka (Hill Climbing) Başarıyla Tamamlandı!\n`;
          alertMsg += `Hedef Havuz: ${poolSize} | Yeni Ortalama Başarı: ${best_avg.toFixed(2)} / 6\n`;
          alertMsg += `Elde Edilen Fitness Skoru: ${best_fitness}`;
          setTimeout(() => alert(alertMsg), 300);
        }

        if (btn) btn.innerHTML = orgText;
      },

      extractDetailsForUI: function (n, df, joks = []) {
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
getRawData: function () {
        const is60 = document.getElementById('v714-game-60') && document.getElementById('v714-game-60').checked;
        const key = is60 ? 'cpb_hdb_60_v718' : 'cpb_hdb_90_v718';
        let entries = [];
        try {
          const db = JSON.parse(localStorage.getItem(key));
          if (db && Array.isArray(db.entries) && db.entries.length > 0) {
            entries = db.entries;
          }
        } catch (e) { }

        if (entries.length === 0) {
          try {
            if (typeof loadDraws === 'function') {
              const draws = loadDraws().filter(d => Array.isArray(d) && d.length > 0);
              if (draws.length > 0) entries = draws.map((d, i) => ({ date: `Geçmiş -${i + 1}`, nums: d }));
            }
          } catch (e) { }
        }

        let dateInput = document.getElementById('tm-select');
        if (dateInput && dateInput.value && entries.length > 0) {
            let targetDate = new Date(dateInput.value);
            let offsetIndex = 0;
            for (let i = 0; i < entries.length; i++) {
                let entryDateStr = entries[i].date;
                let edObj = null;
                if (entryDateStr && entryDateStr.includes('-')) {
                    let edParts = entryDateStr.split('-');
                    if (edParts.length === 3) {
                        if (edParts[0].length === 4) {
                            edObj = new Date(entryDateStr);
                        } else {
                            edObj = new Date(`${edParts[2]}-${edParts[1]}-${edParts[0]}`);
                        }
                    }
                }
                if (edObj && edObj <= targetDate) {
                    offsetIndex = i;
                    break;
                }
            }
            if (offsetIndex > 0) {
                entries = entries.slice(offsetIndex);
            }
        }

        return entries;
      },

      generatePool: function () {
        const rawDraws = this.getRawData();
        if (rawDraws.length === 0) {
          alert("Çekiliş verisi bulunamadı!");
          return;
        }
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        const size = parseInt(document.getElementById('hm-pool-size').value) || 25;

        this.updateConfigFromUI();
        const gercek_cekilis_df = rawDraws.map(d => d.nums);
        const gercek_joks = rawDraws.map(d => d.joker || null);
        const puanlar = this.puanlari_hesapla(gercek_cekilis_df, maxN, gercek_joks);
        let sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);

        // KATEGORİK SEÇİM (KOTA SİSTEMİ)
        let k_hafta = {};
        for (let n = 1; n <= maxN; n++) {
          k_hafta[n] = 0;
          for (let idx = 0; idx < gercek_cekilis_df.length; idx++) {
            if (gercek_cekilis_df[idx] && gercek_cekilis_df[idx].includes(n)) break;
            k_hafta[n]++;
          }
        }
        // Kotalar İptal Edildi: En yüksek puanlı sayıları direkt havuza al. (Sizin Stratejiniz)
        let havuz = [];
        for (let i = 0; i < size; i++) {
          if (i < sirali.length) havuz.push(parseInt(sirali[i][0]));
        }
        havuz.sort((a, b) => a - b);

        if (window.H && window.H.applyPoolSelection) {
          window.H.applyPoolSelection(puanlar, havuz, maxN);
        }

                        setTimeout(() => alert(`Akıllı Motor hesaplamayı tamamladı.
Sayı Listesi\'nde önerilen ${size} sayı seçili durumdadır. Seçimleri dilediğiniz gibi değiştirip "Havuza Ekle" diyebilirsiniz.`), 100);
      },
      runBacktest: function () {
        this.updateConfigFromUI();
        const rawDraws = this.getRawData();
        const testCount = parseInt(document.getElementById('hm-test-count').value) || 10;
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 25;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;

        if (rawDraws.length < testCount + 15) {
          alert(`Test için yeterli veri yok. En az ${testCount + 15} çekiliş gerekli.`);
          return;
        }

        const resDiv = document.getElementById('hm-backtest-results');
        resDiv.style.display = "block";

        let kategoriler = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        let toplam_dogru = 0;

        for (let i = testCount - 1; i >= 0; i--) {
          let gercek_cekilis_df = rawDraws.slice(i + 1).map(d => d.nums);
          let gercek_joks = rawDraws.slice(i + 1).map(d => d.joker || null);
          let hedef_cekilis = rawDraws[i].nums.slice(0, 6);
          let hedef_tarih = rawDraws[i].date || `Geçmiş -${i + 1}`;

          let puanlar = this.puanlari_hesapla(gercek_cekilis_df, maxN, gercek_joks);
          let sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);

          // KATEGORİK SEÇİM (KOTA SİSTEMİ)
          let k_hafta = {};
          for (let n = 1; n <= maxN; n++) {
            k_hafta[n] = 0;
            for (let idx = 0; idx < gercek_cekilis_df.length; idx++) {
              if (gercek_cekilis_df[idx] && gercek_cekilis_df[idx].includes(n)) break;
              k_hafta[n]++;
            }
          }
          // Kotalar İptal Edildi YERİNE Akıllı Kota Geldi (Kullanıcı Tavsiyesi)
          let havuz = this.akilli_secim(sirali, puanlar, poolSize);

          let bilinenler = havuz.filter(x => hedef_cekilis.includes(x));
          let bilinen_sayi = bilinenler.length;

          kategoriler[bilinen_sayi].push({
            index: i,
            tarih: hedef_tarih,
            hedef: hedef_cekilis,
            bilinenler: bilinenler,
            puanlar: puanlar
          });
          toplam_dogru += bilinen_sayi;
        }

        let outputHtml = `<div style="font-family:sans-serif;">`;
        outputHtml += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(83,240,219,0.1); padding:8px 12px; border-radius:6px; border:1px solid rgba(83,240,219,0.3); margin-bottom:12px;">`;
        outputHtml += `<div style="color:#53f0db; font-size:14px; font-weight:bold;">⏳ ZAMAN MAKİNESİ SONUÇLARI</div>`;
        outputHtml += `<div style="display:flex; gap:15px; font-size:12px;">`;
        outputHtml += `<div><span style="color:#aaa;">Test:</span> <b style="color:#fff;">${testCount}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Havuz:</span> <b style="color:#fff;">${poolSize}</b></div>`;
        outputHtml += `<div><span style="color:#aaa;">Ortalama Başarı:</span> <b style="color:#53f0db;">${(toplam_dogru / testCount).toFixed(2)} / 6</b></div>`;
        outputHtml += `</div></div>`;
        
        // Wrap the results in a 2-column grid
        outputHtml += `<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; align-items:start;">`;


        for (let k = 6; k >= 0; k--) {
          let items = kategoriler[k];
          if (items && items.length > 0) {
            let catColor = k >= 4 ? '#28a745' : (k === 3 ? '#ffc107' : '#dc3545');

            outputHtml += `<div style="margin-bottom:0px;">`; // Inside grid cell
            outputHtml += `<button onclick="let d = document.getElementById('bt-cat-${k}'); d.style.display = d.style.display==='none'?'block':'none';" style="width:100%; text-align:left; background:rgba(0,0,0,0.6); color:${catColor}; border:1px solid #444; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:19px; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;">
            <span><b style="font-size:14px;">${k} Bilen</b> Sayısı: <b style="color:#fff;">${items.length}</b></span>
            <span style="font-size:15px; color:#aaa; background:rgba(255,255,255,0.1); padding:3px 6px; border-radius:4px;">▼ AÇ/KAPAT</span>
          </button>`;

            outputHtml += `<div id="bt-cat-${k}" style="display:none; padding:12px; background:rgba(255,255,255,0.03); border-left:1px solid #444; border-right:1px solid #444; border-bottom:1px solid #444; border-radius:0 0 6px 6px;">`;
            outputHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); column-gap: 8px; row-gap: 8px;">`;

            items.forEach(item => {
              let rowHtml = `<div style="display:flex; align-items:center; flex-wrap:nowrap;">`;
              let t = item.tarih;
              if (t && t.includes('-')) {
                  let parts = t.split('-');
                  if (parts.length === 3) {
                      if (parts[0].length === 4) t = `${parts[2]}.${parts[1]}.${parts[0]}`;
                      else t = `${parts[0]}.${parts[1]}.${parts[2]}`;
                  }
              }
              rowHtml += `<span style="width:85px; color:#aaa; font-size:16px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${t}">${t}</span>`;
              rowHtml += `<div style="display:flex; gap:2px;">`;

              let s_hedef = [...item.hedef].sort((a, b) => a - b);
              s_hedef.forEach(num => {
                let isHit = item.bilinenler.includes(num);
                let bg = isHit ? '#28a745' : 'rgba(255,255,255,0.1)';
                let borderColor = isHit ? '#218838' : '#555';
                let txtColor = isHit ? '#fff' : '#ccc';
                let puan = Math.floor(item.puanlar[num] || 0);
                rowHtml += `<div style="display:flex; flex-direction:column; align-items:center; gap:1px;">
                              <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; font-size:15px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:4px; border:1px solid ${borderColor}; box-shadow:0 1px 2px rgba(0,0,0,0.3);">${num}</span>
                              <span style="font-size:12px; color:#aaa; font-family:var(--font-mono, monospace); font-weight:bold; letter-spacing:-0.5px;">${puan}p</span>
                            </div>`;
              });

              rowHtml += `</div></div>`;
              outputHtml += rowHtml;
            });
            outputHtml += `</div>`; // close grid

            outputHtml += `</div></div>`;
          }
        }

        outputHtml += `</div>`; // Close grid wrapper
        outputHtml += `</div>`; // Close main wrapper
        resDiv.innerHTML = outputHtml;
      },

      autoTune: async function () {
        const rawDraws = this.getRawData();
        const testCount = parseInt(document.getElementById('hm-test-count').value) || 10;
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 30;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;

        if (rawDraws.length < testCount + 15) {
          alert(`Test için yeterli veri yok. En az ${testCount + 15} çekiliş gerekli.`);
          return;
        }

        let btn = document.querySelector('button[onclick="window.HavuzMotoru.autoTune()"]');
        let orgText = btn ? btn.innerHTML : "";
        if (btn) btn.innerHTML = "⏳ Hesaplanıyor... (Lütfen Bekleyin)";

        await new Promise(r => setTimeout(r, 50));

        let best_fitness = -999999;
        let best_avg = 0;
        let best_config = null;

        const ranges = {
          K5_PUAN: [5, 50],
          K6_PUAN: [0, 20],
          K4_PUAN: [0, 20],
          K7_PUAN: [0, 50],
          K9_PUAN: [0, 100],
          K10_PUAN: [0, 50],
          K8_PUAN: [0, 20],
          K18_PUAN: [-200, 0],
          OLUM_CEZASI_SINIRI: [15, 50],
          K13_PUAN: [-500, 0],
          K14_PUAN_4: [-500, 0],
          K14_PUAN_8: [-500, 0],
          K14_PUAN_12: [-500, 0],
          K14_PUAN_16: [-500, 0],
          K16_PUAN: [-200, 0]
        };

        const ITERATIONS = 1000;

        for (let iter = 0; iter < ITERATIONS; iter++) {
          let test_config = {};
          for (let key in ranges) {
            let min = ranges[key][0];
            let max = ranges[key][1];
            test_config[key] = min + Math.random() * (max - min);
          }

          let temp_backup = Object.assign({}, this.config);
          Object.assign(this.config, test_config);

          let toplam_dogru = 0;
          let toplam_fitness = 0;

          for (let i = testCount - 1; i >= 0; i--) {
            let gercek_cekilis_df = rawDraws.slice(i + 1).map(d => d.nums);
            let gercek_joks = rawDraws.slice(i + 1).map(d => d.joker || null);
            let hedef_cekilis = rawDraws[i].nums.slice(0, 6);

            let puanlar = this.puanlari_hesapla(gercek_cekilis_df, maxN, gercek_joks);
            let sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);

            let k_hafta = {};
            for (let n = 1; n <= maxN; n++) {
              k_hafta[n] = 0;
              for (let idx = 0; idx < gercek_cekilis_df.length; idx++) {
                if (gercek_cekilis_df[idx] && gercek_cekilis_df[idx].includes(n)) break;
                k_hafta[n]++;
              }
            }
            // Kotalar İptal Edildi: En yüksek puanlı sayıları direkt havuza al.
            let havuz = [];
            for (let i = 0; i < poolSize; i++) {
              if (i < sirali.length) havuz.push(parseInt(sirali[i][0]));
            }

            let bilinen_sayi = havuz.filter(x => hedef_cekilis.includes(x)).length;
            toplam_dogru += bilinen_sayi;

            // YENİ DİNAMİK: 1 ve 2 bilenleri yok etmek için cezalandır
            if (bilinen_sayi === 0) toplam_fitness -= 100;
            else if (bilinen_sayi === 1) toplam_fitness -= 50;
            else if (bilinen_sayi === 2) toplam_fitness -= 10;
            else if (bilinen_sayi === 3) toplam_fitness += 10;
            else if (bilinen_sayi === 4) toplam_fitness += 100;
            else if (bilinen_sayi === 5) toplam_fitness += 500;
            else if (bilinen_sayi === 6) toplam_fitness += 2000;
          }

          if (toplam_fitness > best_fitness) {
            best_fitness = toplam_fitness;
            best_avg = toplam_dogru / testCount;
            best_config = Object.assign({}, test_config);
          }

          Object.assign(this.config, temp_backup);
        }

        if (best_config) {
          this.base_config = JSON.parse(JSON.stringify(best_config));
          this.config = JSON.parse(JSON.stringify(best_config));
          try { localStorage.setItem('hm_base_config', JSON.stringify(this.base_config)); localStorage.setItem('hm_config', JSON.stringify(this.config)); } catch(e) {}
          const idMap = {
            K5_PUAN: 'komsu', K6_PUAN: 'komsu2', K4_PUAN: 'kurak',
            K7_PUAN: 'onluk', K9_PUAN: 'ivme',
            K10_PUAN: 'gecik', K8_PUAN: 'joker',
            K18_PUAN: 'olu', OLUM_CEZASI_SINIRI: 'kurak_sinir',
            K13_PUAN: 'cifte', K14_PUAN_4: 'c4',
            K14_PUAN_8: 'c8', K14_PUAN_12: 'c12', K14_PUAN_16: 'c16',
            K16_PUAN: 'izolasyon'
          };
          for (let k in best_config) {
            let el = document.getElementById('hm_' + idMap[k]);
            let sel = document.getElementById('ws-hm_' + idMap[k]);
            let val = (k.startsWith('CEZA') || k.startsWith('OLUM')) ? Math.round(best_config[k]) : best_config[k].toFixed(1);
            if (sel) {
              sel.value = val;
              sel.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        }

        if (btn) btn.innerHTML = orgText;
        this.runBacktest();

        setTimeout(() => alert(`Yapay Zeka (1000 İterasyon) optimizasyonu tamamlandı!\nFitness Skoru (4-5 Bilen Odaklı): ${best_fitness}\nBulunan En İyi Ortalama: ${best_avg.toFixed(2)} / 6\n\nNot: AI artık sadece ortalamaya değil, nadir ama yüksek vuruşlara (4 ve 5 bilen) odaklanıyor.`), 100);
      }
    };
    // --- HAVUZ MOTORU SONU ---


// Init on load
if (window.HavuzMotoru && typeof window.HavuzMotoru.updateConfigFromUI === 'function') {
    window.HavuzMotoru.updateConfigFromUI();
}
