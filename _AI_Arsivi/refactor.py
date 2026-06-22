import os

filepath = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the puanlari_hesapla definition
old_puanlari_hesapla = """      puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        let puanlar = {};
        let genel_frekans = {};
        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = 0;
          genel_frekans[i] = 0;
        }

        // Toplam frekans hesapla
        df.forEach(draw => {
          draw.forEach(num => {
            if (num >= 1 && num <= maxN) genel_frekans[num]++;
          });
        });

        const son_15_donem = df.slice(0, 15);
        const son_10_donem = df.slice(0, 10);
        const son_5_donem = df.slice(0, 5);
        const son_3_donem = df.slice(0, 3);
        const toplam_cekilis = df.length;

        // 🃏 YENİ KURAL: Joker Etkisi
        // Son 15 çekilişte joker olan sayıları ödüllendir
        const son_15_joks = joks.slice(0, 15);
        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi && joker_sayisi >= 1 && joker_sayisi <= maxN) {
            // Ne kadar yakınsa o kadar çok etki etsin: son çekiliş (index 0) çarpan*10, 15. çekiliş (index 14) çarpan*0.6 filan.
            let joker_agirligi = (15 - index) / 15;
            puanlar[joker_sayisi] += (this.config.CARPAN_JOKER || 5.0) * joker_agirligi * 10;
          }
        });

        // YENİ FİLTRE 1: ONLUK BLOK KURAKLIK ANALİZİ
        let son_3_hafta_sayilari = new Set();
        son_3_donem.forEach(draw => draw.forEach(n => son_3_hafta_sayilari.add(n)));

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
        for (let i = 1; i <= maxN; i++) {
          let gecmis_puani = ((genel_frekans[i] / (toplam_cekilis * 6)) * 1000) * this.config.YUZDE_TUM_GECMIS;

          let f15 = son_15_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);

          let yakin_puani = (f15 * this.config.CARPAN_15) + (f10 * this.config.CARPAN_10) + (f5 * this.config.CARPAN_5);
          yakin_puani = yakin_puani * this.config.YUZDE_SON_15_DONEM;

          puanlar[i] += Math.floor(gecmis_puani + yakin_puani);

          // Kuraklık Çarpanı
          let kuraklik_haftasi = 0;
          for (let idx = 0; idx < df.length; idx++) {
            if (df[idx].includes(i)) break;
            kuraklik_haftasi++;
          }
          puanlar[i] += Math.floor(kuraklik_haftasi * this.config.CARPAN_KURAKLIK);

          // YENİ: Derin Kuraklık Ölüm Cezası
          if (kuraklik_haftasi >= this.config.OLUM_CEZASI_SINIRI) {
            puanlar[i] += -150;
          }

          // Standart Filtreler
          if (f5 >= 3) puanlar[i] += this.config.CEZA_OLU_SAYI_4;
          if (f15 === 2 && f5 === 0) puanlar[i] += this.config.PUAN_GECIKMELI_TEKRAR;

          // 🚨 YENİ: AŞIRI DOYGUNLUK (TÜKENMİŞLİK) CEZALARI 🚨
          // Joker sayıları da sıklığa (frekansa) dahil edilir, bu yüzden df.includes veya joks kontrolü birleştirilir
          let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;

          for (let c = 0; c < Math.min(15, df.length); c++) {
            let hit = df[c].includes(i) || (joks[c] === i);
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

          // Çifte Tekrar Cezası (Eski kural, silinmemesi gerekiyordu)
          if (df.length >= 2 && df[0].includes(i) && df[1].includes(i)) {
            puanlar[i] += this.config.CEZA_CIFTE_TEKRAR;
          }

          // Kinetik İvme Bonusu (Frenlendi: Eğer tükenmişliğe takılmadıysa çalışır)
          if (count_3 < 2 && count_7 < 3 && f15 <= 1 && f3 >= 2) puanlar[i] += this.config.PUAN_KINETIK_IVME_BONUSU;
        }

        // YENİ: Genişletilmiş Komşuluk Radarı (Son 3 Çekiliş)
        let uygulananKomsular = new Set();
        let uygulananKomsular2 = new Set();
        son_3_donem.forEach(cekilis => {
          cekilis.forEach(sayi => {
            // -1, +1, -10, +10, -11, -9, +9, +11
            const komsular = [sayi - 1, sayi + 1, sayi - 10, sayi + 10, sayi - 11, sayi - 9, sayi + 9, sayi + 11];
            komsular.forEach(komsu => {
              if (komsu >= 1 && komsu <= maxN) {
                let key = `${sayi}_${komsu}`;
                if (!uygulananKomsular.has(key)) {
                  puanlar[komsu] += this.config.PUAN_1_HALKA_KOMSU;
                  uygulananKomsular.add(key);
                }
              }
            });
            // 2. Halka Komşular: -2, +2, -20, +20
            const komsular2 = [sayi - 2, sayi + 2, sayi - 20, sayi + 20];
            komsular2.forEach(komsu => {
              if (komsu >= 1 && komsu <= maxN) {
                let key = `${sayi}_${komsu}`;
                if (!uygulananKomsular2.has(key)) {
                  puanlar[komsu] += this.config.PUAN_2_HALKA_KOMSU;
                  uygulananKomsular2.add(key);
                }
              }
            });
          });
        });

        // Bölge Geçiş Bonusu (Sadece Son Çekiliş)
        if (son_15_donem.length > 0) {
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

        return puanlar;
      }"""

new_puanlari_hesapla = """      puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
        let puanlar = {};
        let genel_frekans = {};
        for (let i = 1; i <= maxN; i++) {
          puanlar[i] = {
            total: 0,
            ceza: 0,
            details: {
              k1_joker: 0,
              k2_onluk_kuraklik: 0,
              k3_gecmis: 0,
              k4_yakin: 0,
              k5_kuraklik: 0,
              k6_olum: 0,
              k7_olu_sayi: 0,
              k8_gecikmeli: 0,
              k9_doygunluk: 0,
              k10_cifte_tekrar: 0,
              k11_kinetik: 0,
              k12_komsu1: 0,
              k13_komsu2: 0,
              k14_bolge_gecisi: 0
            }
          };
          genel_frekans[i] = 0;
        }

        // Add helper
        function addPuan(n, key, val) {
          if(!puanlar[n]) return;
          puanlar[n].details[key] += val;
          puanlar[n].total += val;
          if (val < 0) {
             puanlar[n].ceza += val;
          }
        }

        // Toplam frekans hesapla
        df.forEach(draw => {
          draw.forEach(num => {
            if (num >= 1 && num <= maxN) genel_frekans[num]++;
          });
        });

        const son_15_donem = df.slice(0, 15);
        const son_10_donem = df.slice(0, 10);
        const son_5_donem = df.slice(0, 5);
        const son_3_donem = df.slice(0, 3);
        const toplam_cekilis = df.length;

        // 🃏 YENİ KURAL: Joker Etkisi
        // Son 15 çekilişte joker olan sayıları ödüllendir
        const son_15_joks = joks.slice(0, 15);
        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi && joker_sayisi >= 1 && joker_sayisi <= maxN) {
            let joker_agirligi = (15 - index) / 15;
            let val = (this.config.CARPAN_JOKER || 5.0) * joker_agirligi * 10;
            addPuan(joker_sayisi, 'k1_joker', val);
          }
        });

        // YENİ FİLTRE 1: ONLUK BLOK KURAKLIK ANALİZİ
        let son_3_hafta_sayilari = new Set();
        son_3_donem.forEach(draw => draw.forEach(n => son_3_hafta_sayilari.add(n)));

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
              addPuan(n, 'k2_onluk_kuraklik', this.config.PUAN_ONLUK_KURAKLIK_BONUSU);
            }
          }
        }

        // ANA PUANLAMA DÖNGÜSÜ
        for (let i = 1; i <= maxN; i++) {
          let gecmis_puani = ((genel_frekans[i] / (toplam_cekilis * 6)) * 1000) * this.config.YUZDE_TUM_GECMIS;

          let f15 = son_15_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d.includes(i) ? 1 : 0), 0);

          let yakin_puani = (f15 * this.config.CARPAN_15) + (f10 * this.config.CARPAN_10) + (f5 * this.config.CARPAN_5);
          yakin_puani = yakin_puani * this.config.YUZDE_SON_15_DONEM;

          let total_gy = Math.floor(gecmis_puani + yakin_puani);
          let g_val = Math.floor(gecmis_puani);
          let y_val = total_gy - g_val; // to ensure exact sum matches

          addPuan(i, 'k3_gecmis', g_val);
          addPuan(i, 'k4_yakin', y_val);

          // Kuraklık Çarpanı
          let kuraklik_haftasi = 0;
          for (let idx = 0; idx < df.length; idx++) {
            if (df[idx].includes(i)) break;
            kuraklik_haftasi++;
          }
          addPuan(i, 'k5_kuraklik', Math.floor(kuraklik_haftasi * this.config.CARPAN_KURAKLIK));

          // YENİ: Derin Kuraklık Ölüm Cezası
          if (kuraklik_haftasi >= this.config.OLUM_CEZASI_SINIRI) {
            addPuan(i, 'k6_olum', -150);
          }

          // Standart Filtreler
          if (f5 >= 3) addPuan(i, 'k7_olu_sayi', this.config.CEZA_OLU_SAYI_4);
          if (f15 === 2 && f5 === 0) addPuan(i, 'k8_gecikmeli', this.config.PUAN_GECIKMELI_TEKRAR);

          // 🚨 YENİ: AŞIRI DOYGUNLUK (TÜKENMİŞLİK) CEZALARI 🚨
          let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;

          for (let c = 0; c < Math.min(15, df.length); c++) {
            let hit = df[c].includes(i) || (joks[c] === i);
            if (hit) {
              if (c < 3) count_3++;
              if (c < 7) count_7++;
              if (c < 11) count_11++;
              if (c < 15) count_15++;
            }
          }

          if (count_3 >= 2) {
            addPuan(i, 'k9_doygunluk', this.config.CEZA_DOYGUN_4);
          } else if (count_7 >= 3) {
            addPuan(i, 'k9_doygunluk', this.config.CEZA_DOYGUN_8);
          } else if (count_11 >= 4) {
            addPuan(i, 'k9_doygunluk', this.config.CEZA_DOYGUN_12);
          } else if (count_15 >= 5) {
            addPuan(i, 'k9_doygunluk', this.config.CEZA_DOYGUN_16);
          }

          // Çifte Tekrar Cezası
          if (df.length >= 2 && df[0].includes(i) && df[1].includes(i)) {
            addPuan(i, 'k10_cifte_tekrar', this.config.CEZA_CIFTE_TEKRAR);
          }

          // Kinetik İvme Bonusu
          if (count_3 < 2 && count_7 < 3 && f15 <= 1 && f3 >= 2) {
            addPuan(i, 'k11_kinetik', this.config.PUAN_KINETIK_IVME_BONUSU);
          }
        }

        // YENİ: Genişletilmiş Komşuluk Radarı (Son 3 Çekiliş)
        let uygulananKomsular = new Set();
        let uygulananKomsular2 = new Set();
        son_3_donem.forEach(cekilis => {
          cekilis.forEach(sayi => {
            const komsular = [sayi - 1, sayi + 1, sayi - 10, sayi + 10, sayi - 11, sayi - 9, sayi + 9, sayi + 11];
            komsular.forEach(komsu => {
              if (komsu >= 1 && komsu <= maxN) {
                let key = `${sayi}_${komsu}`;
                if (!uygulananKomsular.has(key)) {
                  addPuan(komsu, 'k12_komsu1', this.config.PUAN_1_HALKA_KOMSU);
                  uygulananKomsular.add(key);
                }
              }
            });
            const komsular2 = [sayi - 2, sayi + 2, sayi - 20, sayi + 20];
            komsular2.forEach(komsu => {
              if (komsu >= 1 && komsu <= maxN) {
                let key = `${sayi}_${komsu}`;
                if (!uygulananKomsular2.has(key)) {
                  addPuan(komsu, 'k13_komsu2', this.config.PUAN_2_HALKA_KOMSU);
                  uygulananKomsular2.add(key);
                }
              }
            });
          });
        });

        // Bölge Geçiş Bonusu (Sadece Son Çekiliş)
        if (son_15_donem.length > 0) {
          let son_cekilis = son_15_donem[0];
          let limit = Math.floor(maxN / 2);
          son_cekilis.forEach(sayi => {
            if (sayi <= limit) {
              for (let n = limit + 1; n <= maxN; n++) addPuan(n, 'k14_bolge_gecisi', Math.floor(this.config.PUAN_BOLGE_GECISI / limit));
            } else {
              for (let n = 1; n <= limit; n++) addPuan(n, 'k14_bolge_gecisi', Math.floor(this.config.PUAN_BOLGE_GECISI / limit));
            }
          });
        }

        // Tamsayıya yuvarlama (görsellik için ondalık bırakmıyoruz totalde, zaten config tam sayı ama emin olmak için)
        for (let i = 1; i <= maxN; i++) {
           puanlar[i].total = Math.floor(puanlar[i].total);
        }

        return puanlar;
      }"""

content = content.replace(old_puanlari_hesapla, new_puanlari_hesapla)

# NOW fix the references to `hm_sc[n]` to `hm_sc[n].total` where needed!
content = content.replace("res[n].final = hm_sc[n] || 0;", "res[n].final = hm_sc[n] ? hm_sc[n].total : 0; res[n].hm_details = hm_sc[n] ? hm_sc[n].details : {}; res[n].hm_ceza = hm_sc[n] ? hm_sc[n].ceza : 0;")

content = content.replace("let sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);", "let sirali = Object.entries(puanlar).sort((a, b) => b[1].total - a[1].total);")

content = content.replace("let sirali = Object.entries(puanlar).sort((a,b)=>b[1]-a[1]);", "let sirali = Object.entries(puanlar).sort((a,b)=>b[1].total-a[1].total);")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
