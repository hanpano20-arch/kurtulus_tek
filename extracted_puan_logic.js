      puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        let puanlar = {};
        let genel_frekans = {};
        let meta_komsular = {};
        let meta_kuraklik = {};
        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = 0;
          genel_frekans[i] = 0;
          meta_komsular[i] = 0;
          meta_kuraklik[i] = 0;
        }

        // Toplam frekans hesapla
        df.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(num => {
              if (num >= 1 && num <= maxN) genel_frekans[num]++;
            });
          }
        });

        const son_15_donem = df.slice(0, 15);
        const son_10_donem = df.slice(0, 10);
        const son_5_donem = df.slice(0, 5);
        const son_3_donem = df.slice(0, 3);
        const toplam_cekilis = df.length;

        // YENİ KURAL: Joker Etkisi (Jokerin kendisi yerine komşularını ısıt)
        let isinmis_sayilar = new Set();

        // 🔥 SON 10 ÇEKİLİŞ DİNAMİZMİ 🔥
        // Sistemin en güçlü yanı olan son 10 çekiliş sayıları ve jokerleri asla "Düşük Frekans" veya "Ölü" cezası almamalı!
        son_10_donem.forEach(cekilis => {
          if (cekilis && Array.isArray(cekilis)) cekilis.forEach(s => isinmis_sayilar.add(s));
        });
        joks.slice(0, 10).forEach(j => {
          if (j && j >= 1 && j <= maxN) isinmis_sayilar.add(j);
        });

        const son_15_joks = joks.slice(0, 15);
        let joker_carpani = this.config.CARPAN_JOKER || 5.0;
        let jokerKomsuSayaci = {};
        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi && joker_sayisi >= 1 && joker_sayisi <= maxN) {
            let agirlik = (15 - index) / 15;
            let j_puan = Math.floor(joker_carpani * agirlik * 10);
            puanlar[joker_sayisi] += j_puan; // Jokerin kendisine tam puan
            const komsular = [joker_sayisi - 1, joker_sayisi + 1, joker_sayisi - 10, joker_sayisi + 10, joker_sayisi - 11, joker_sayisi - 9, joker_sayisi + 9, joker_sayisi + 11];
            komsular.forEach(k => {
              if (k >= 1 && k <= maxN) {
                let count = jokerKomsuSayaci[k] || 0;
                if (count < 2) {
                  let carpan = count === 0 ? 1 : 0.5;
                  puanlar[k] += Math.floor(j_puan * 0.2 * carpan); // Komşulara sadece %20'si yansısın
                  jokerKomsuSayaci[k] = count + 1;
                  isinmis_sayilar.add(k); // ISI KALKANI AKTİF
                }
              }
            });
          }
        });

        // YENİ: Genişletilmiş Komşuluk Radarı (Son 3 Çekiliş) - SINIRLANDIRILMIŞ (Yankı Odası Önlemi)
        let komsuSayaci_1 = {};
        let komsuSayaci_2 = {};
        son_3_donem.forEach(cekilis => {
          if (cekilis && Array.isArray(cekilis)) {
            cekilis.forEach(sayi => {
              const komsular = [sayi - 1, sayi + 1, sayi - 10, sayi + 10, sayi - 11, sayi - 9, sayi + 9, sayi + 11];
              komsular.forEach(komsu => {
                if (komsu >= 1 && komsu <= maxN) {
                  let count = komsuSayaci_1[komsu] || 0;
                  if (count < 2) { // Maksimum 2 kez puan alabilir
                    let carpan = count === 0 ? 1 : 0.5; // İkinci komşulukta yarı puan
                    puanlar[komsu] += Math.floor((this.config.PUAN_1_HALKA_KOMSU || 50) * carpan);
                    komsuSayaci_1[komsu] = count + 1;
                    isinmis_sayilar.add(komsu); // ISI KALKANI AKTİF
                  }
                }
              });
              // 2. Halka Komşular: -2, +2, -20, +20
              const komsular2 = [sayi - 2, sayi + 2, sayi - 20, sayi + 20];
              komsular2.forEach(komsu => {
                if (komsu >= 1 && komsu <= maxN) {
                  let count = komsuSayaci_2[komsu] || 0;
                  if (count < 2) {
                    let carpan = count === 0 ? 1 : 0.5;
                    puanlar[komsu] += Math.floor((this.config.PUAN_2_HALKA_KOMSU || 20) * carpan);
                    komsuSayaci_2[komsu] = count + 1;
                    isinmis_sayilar.add(komsu); // ISI KALKANI AKTİF
                  }
                }
              });
            });
          }
        });


        // YENİ FİLTRE 1: ONLUK BLOK KURAKLIK ANALİZİ VE ARDIŞIK ÇEKİM YASASI
        let ardisik_puan = this.config.PUAN_ARDISIK_CEKIM || 15.0;
        if (son_10_donem.length > 0 && son_10_donem[0] && Array.isArray(son_10_donem[0])) {
          let son_cekilis = son_10_donem[0];
          son_cekilis.forEach(n => {
            if (n > 1) puanlar[n - 1] += ardisik_puan; // Alt komşu bonusu
            if (n < maxN) puanlar[n + 1] += ardisik_puan; // Üst komşu bonusu
          });
        }

        // YENİ FİLTRE 2: KUYRUK (SON RAKAM) KURAKLIĞI ANALİZİ
        let kuyruk_puani = this.config.PUAN_KUYRUK_KURAKLIGI || 25.0;
        let kuyruk_frekans = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
        son_5_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(n => {
              kuyruk_frekans[n % 10]++;
            });
          }
        });
        // Hiç çıkmamış kuyrukları bul ve o rakamla biten sayılara bonus ver
        for (let i = 0; i <= 9; i++) {
          if (kuyruk_frekans[i] === 0) {
            for (let n = 1; n <= maxN; n++) {
              if (n % 10 === i) {
                puanlar[n] += kuyruk_puani;
              }
            }
          }
        }

        // YENİ FİLTRE 3: SARKAÇ (PENDULUM) REGRESYON DENGESİ
        let sarkac_puani = this.config.PUAN_SARKAC_DENGESI || 20.0;
        if (son_10_donem.length > 0 && son_10_donem[0] && Array.isArray(son_10_donem[0])) {
          let son_cekilis = son_10_donem[0];
          let toplam = son_cekilis.reduce((a, b) => a + b, 0);
          let ortalama = toplam / son_cekilis.length;
          let beklenen_ortalama = maxN / 2; // 90 ise 45, 49 ise 24.5 vs.

          if (ortalama > beklenen_ortalama + (maxN * 0.1)) {
            // Son çekiliş çok büyük sayılardan oluşmuş, küçük sayılara bonus ver
            for (let n = 1; n <= Math.floor(maxN / 2); n++) {
              puanlar[n] += sarkac_puani;
            }
          } else if (ortalama < beklenen_ortalama - (maxN * 0.1)) {
            // Son çekiliş çok küçük sayılardan oluşmuş, büyük sayılara bonus ver
            for (let n = Math.ceil(maxN / 2); n <= maxN; n++) {
              puanlar[n] += sarkac_puani;
            }
          }
        }

        let son_3_hafta_sayilari = new Set();
        son_3_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(n => son_3_hafta_sayilari.add(n));
          }
        });

        // YENİ FİLTRE 4: SON 10 ÇEKİLİŞ GÜVENLİ LİMAN TABAN PUANI
        let taban_puan = this.config.PUAN_SON_10_TABAN || 50.0;
        let son_10_sayilari = new Set();
        son_10_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(n => son_10_sayilari.add(n));
          }
        });
        son_10_sayilari.forEach(n => {
          puanlar[n] += taban_puan;
        });

        // YENİ FİLTRE 5: TARİHSEL FREKANS ELEMESİ (Zayıf Sayı Cezası)
        let ceza_frekans = this.config.CEZA_DUSUK_FREKANS || -50.0;
        let frekanslar = {};
        for (let n = 1; n <= maxN; n++) frekanslar[n] = 0;
        df.forEach(draw => {
          if (draw && Array.isArray(draw)) draw.forEach(n => { if (n <= maxN) frekanslar[n]++; });
        });
        let frek_arr = Object.values(frekanslar).sort((a, b) => a - b);
        let baraj_index = Math.floor(maxN * 0.25);
        let baraj_degeri = frek_arr[baraj_index];
        for (let n = 1; n <= maxN; n++) {
          if (frekanslar[n] <= baraj_degeri && !isinmis_sayilar.has(n)) {
            puanlar[n] += ceza_frekans;
          }
        }

        // YENİ FİLTRE 6: YALANCI SICAK İNFAZI (Ardışık Tekrar Etmeme Cezası)
        let ceza_tekrarsiz = this.config.CEZA_TEKRAR_ETMEYEN_SICAK || -100.0;
        let tekrar_oranlari = {};
        for (let n = 1; n <= maxN; n++) tekrar_oranlari[n] = 0;
        for (let i = 0; i < df.length - 1; i++) {
          let guncel = df[i];
          let onceki = df[i + 1];
          if (guncel && onceki && Array.isArray(guncel) && Array.isArray(onceki)) {
            guncel.forEach(n => {
              if (onceki.includes(n)) tekrar_oranlari[n]++;
            });
          }
        }
        let tekrar_arr = Object.values(tekrar_oranlari).sort((a, b) => a - b);
        let tekrar_baraj = tekrar_arr[Math.floor(maxN * 0.20)];
        son_3_hafta_sayilari.forEach(n => {
          if (tekrar_oranlari[n] <= tekrar_baraj && !isinmis_sayilar.has(n)) {
            puanlar[n] += ceza_tekrarsiz;
          }
        });
        son_3_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(n => son_3_hafta_sayilari.add(n));
          }
        });

        const onlukBlokSayisi = Math.ceil(maxN / 10);
        for (let blok = 0; blok < onlukBlokSayisi; blok++) {
          let baslangic = blok * 10 + 1;
          let bitis = Math.min(baslangic + 9, maxN);
          let bloktan_cikan_var_mi = false;
          for (let n = baslangic; n <= bitis; n++) {
            if (son_3_hafta_sayilari.has(n)) {
              bloktan_cikan_var_mi = true;
              break;
            }
          }
          if (!bloktan_cikan_var_mi) {
            for (let n = baslangic; n <= bitis; n++) {
              puanlar[n] += this.config.PUAN_ONLUK_KURAKLIK_BONUSU;
            }
          }
        }

        // ANA PUANLAMA DÖNGÜSÜ
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
          // A. Tarihsel Puan (Dinamik Slider Değerine Göre)
          // Slider 0 ile 100 arasında bir değer veriyor (Tarihsel Ağırlığı). Güncel ağırlık 100 - bu değer.
          let w_hist = this.config.YUZDE_SON_15_DONEM || 20; 
          let w_rec = 100 - w_hist;                   
          
          let gecmis_puani = 0;
          let my_freq = raw_hist[i];
          if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * w_hist);
          } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -w_hist);
          }

          // Güncel puanı 0 - w_rec aralığına normalize et
          let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * w_rec) : 0;

          let f15 = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);

          puanlar[i] += Math.floor(gecmis_puani + yakin_puani);

          // Altın Aralık Kuraklık Kuralı
          let kuraklik_haftasi = 0;
          for (let idx = 0; idx < df.length; idx++) {
            if (df[idx] && Array.isArray(df[idx]) && df[idx].includes(i)) break;
            kuraklik_haftasi++;
          }
          meta_kuraklik[i] = kuraklik_haftasi;
          let kuraklik_puani = 0;
          if (kuraklik_haftasi >= 2 && kuraklik_haftasi <= 4) {
            kuraklik_puani = 10; // Mikro Kuraklık
          } else if (kuraklik_haftasi >= 5 && kuraklik_haftasi <= 8) {
            kuraklik_puani = 15;
          } else if (kuraklik_haftasi >= 9 && kuraklik_haftasi <= 16) {
            kuraklik_puani = 40; // Altın Aralık
          } else if (kuraklik_haftasi >= 17 && kuraklik_haftasi < this.config.OLUM_CEZASI_SINIRI) {
            kuraklik_puani = 20;
          }
          puanlar[i] += kuraklik_puani;

          // Derin Kuraklık Ölüm Cezası (Buz Çözücü)
          if (kuraklik_haftasi >= this.config.OLUM_CEZASI_SINIRI && !isinmis_sayilar.has(i)) {
            puanlar[i] += -10;
          }

          // Standart Filtreler (Doygunlukta Kalkan Yok)
          if (f5 >= 3) puanlar[i] += this.config.CEZA_OLU_SAYI_4;
          if (f15 === 2 && f5 === 0) puanlar[i] += this.config.PUAN_GECIKMELI_TEKRAR;

          // 🔥 YENİ: KOMBİNE ISINMA (TAM ISINMA) BONUSU 🔥
          let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(i));
          if (is_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {
            puanlar[i] += 150; // Isınmış Joker/Komşu Uyanışı (15 ve 40'ın kurtuluşu)
          }
          
          // 🚨 KURAL 1: Mutlak Komşu İzolasyonu (41, 50, 60, 70 İnfazı) 🚨
          let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) > 0;
          let temp_is_in_last = (df.length > 0 && df[0] && Array.isArray(df[0]) && df[0].includes(i));
          
          if (!is_komsu_1 && !temp_is_in_last) {
              puanlar[i] -= 250; // 1. Derece komşusu olmayan (ve tekrar adayı olmayan) sahte sıcaklar elenir!
          }

          // 🔥 KURAL 4: Çapraz Komşu ve Derin Kuraklık Sinerjisi (42'nin Kurtuluşu) 🔥
          if (is_komsu_1 && kuraklik_haftasi >= 15) {
              puanlar[i] += 120; // 19 haftadır çıkmayan çapraz komşulara (42) devasa patlama bonusu!
          }
          
          // 🔥 KURAL 2: Dinamik Seri Analizörü (28'i Şampiyon Yapma, 19/20'yi Ezme) 🔥
          let is_in_last_draw = (df.length > 0 && df[0] && Array.isArray(df[0]) && df[0].includes(i));
          if (is_in_last_draw) {
              let max_streak = 0;
              let current_streak = 0;
              for (let c = df.length - 1; c >= 0; c--) {
                  if (df[c] && Array.isArray(df[c]) && df[c].includes(i)) {
                      current_streak++;
                      if (current_streak > max_streak) max_streak = current_streak;
                  } else {
                      current_streak = 0;
                  }
              }
              
              if (max_streak >= 3) {
                  puanlar[i] += 150; // Patlamaya hazır bomba (28)
              } else if (max_streak <= 2) {
                  puanlar[i] -= 100; // Zayıf tekrar kapasitesi (19, 20)
              }
          }


          // 🚨 YENİ: AŞIRI DOYGUNLUK (TÜKENMİŞLİK) CEZALARIN 🚨
          let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;

          for (let c = 0; c < Math.min(15, df.length); c++) {
            let hit = (df[c] && Array.isArray(df[c]) && df[c].includes(i)) || (joks[c] === i);
            if (hit) {
              if (c < 3) count_3++;
              if (c < 7) count_7++;
              if (c < 11) count_11++;
              if (c < 15) count_15++;
            }
          }

          if (count_3 >= 2) {
            puanlar[i] += this.config.CEZA_DOYGUN_4;
          } else if (count_7 >= 3) {
            puanlar[i] += this.config.CEZA_DOYGUN_8;
          } else if (count_11 >= 4) {
            puanlar[i] += this.config.CEZA_DOYGUN_12;
          } else if (count_15 >= 5) {
            puanlar[i] += this.config.CEZA_DOYGUN_16;
          }

          // Çifte Tekrar Cezası KALDIRILDI (Dinamik Seri Analizörü ile yönetiliyor)
        }


        // Bölge Geçiş Bonusu (Sadece Son Çekiliş)
        if (son_15_donem.length > 0 && son_15_donem[0] && Array.isArray(son_15_donem[0])) {
          let son_cekilis = son_15_donem[0];
          let limit = Math.floor(maxN / 2);
          son_cekilis.forEach(sayi => {
            if (sayi <= limit) {
              for (let n = limit + 1; n <= maxN; n++) puanlar[n] += Math.floor(this.config.PUAN_BOLGE_GECISI / limit);
            } else {
              for (let n = 1; n <= limit; n++) puanlar[n] += Math.floor(this.config.PUAN_BOLGE_GECISI / limit);
            }
          });
        }

        // YENİ: Bölgesel Boşluk (Cluster Vacuum) - Son 2 çekilişte boş kalan 10'luk dilimlere +20 puan
        let son_2_donem = df.slice(0, 2);
        let son_2_hafta_sayilari = new Set();
        son_2_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) {
            draw.forEach(n => son_2_hafta_sayilari.add(n));
          }
        });
        const onlukSayisi = Math.ceil(maxN / 10);
        for (let blok = 0; blok < onlukSayisi; blok++) {
          let bas = blok * 10 + 1;
          let bit = Math.min(bas + 9, maxN);
          let ciktiMi = false;
          for (let n = bas; n <= bit; n++) {
            if (son_2_hafta_sayilari.has(n)) {
              ciktiMi = true;
              break;
            }
          }
          if (!ciktiMi) {
            for (let n = bas; n <= bit; n++) {
              puanlar[n] += 20; // Bölge Boşluk Bonusu
            }
          }
        }

        // Tamsayıya yuvarlama
        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = Math.floor(puanlar[i] || 0);
        }


        // Metadata'ları puanlar objesine gizli property olarak ekle
        let tum_komsular = {};
        if (typeof komsuSayaci_1 !== 'undefined') { for(let k in komsuSayaci_1) tum_komsular[k] = (tum_komsular[k] || 0) + komsuSayaci_1[k]; }
        if (typeof komsuSayaci_2 !== 'undefined') { for(let k in komsuSayaci_2) tum_komsular[k] = (tum_komsular[k] || 0) + komsuSayaci_2[k]; }
        if (typeof jokerKomsuSayaci !== 'undefined') { for(let k in jokerKomsuSayaci) tum_komsular[k] = (tum_komsular[k] || 0) + jokerKomsuSayaci[k]; }
        // Ayrıca son 10 Jokerleri de "Komşu" kotasından faydalanabilmesi için katalım
        if (typeof joks !== 'undefined') { joks.slice(0, 10).forEach(j => { if(j) tum_komsular[j] = (tum_komsular[j] || 0) + 1; }); }

        Object.defineProperty(puanlar, '__komsular', { value: tum_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });

        return puanlar;
      },
