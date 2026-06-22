const fs = require('fs');

let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

// 1. Puanlama Fix
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

        const recCap = this.config.YUZDE_SON_15_DONEM;

        for (let i = 1; i <= maxN; i++) {
          let gecmis_puani = 0;
          let my_freq = raw_hist[i];
          if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * this.config.YUZDE_TUM_GECMIS);
          } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -this.config.YUZDE_TUM_GECMIS);
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

// Normalize line endings for replacement to work across CRLF/LF
function normalize(str) {
    return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

let nContent = normalize(content);
let nTarget = normalize(puanlamaTarget);
let nNew = normalize(puanlamaNew);

if (nContent.includes(nTarget)) {
    nContent = nContent.replace(nTarget, nNew);
    console.log("Puanlama block replaced successfully.");
} else {
    console.log("FAILED to find Puanlama block.");
}

// 2. Akilli secim Fix
const akilliTarget = `      akilli_secim: function (sirali, puanlar, poolSize) {
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
      },`;

const akilliNew = `      akilli_secim: function (sirali, puanlar, poolSize) {
        let eklenecekler = new Set();
        
        // --- ALAN SAVUNMASI LİMİTLERİ ---
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        const blokSayisi = Math.ceil(maxN / 10);
        const maxPerBlok = Math.ceil(poolSize / blokSayisi) + 1; 

        const blok_sayaci = {};
        for (let b = 0; b < blokSayisi; b++) blok_sayaci[b] = 0;

        const blok_dolu_mu = (sayi) => {
            let b_idx = Math.floor((sayi - 1) / 10);
            return blok_sayaci[b_idx] >= maxPerBlok;
        };
        const eklenecek_sayi_ekle = (sayi) => {
            eklenecekler.add(sayi);
            let b_idx = Math.floor((sayi - 1) / 10);
            blok_sayaci[b_idx]++;
        };

        // 0. VIP Kategori (Limitsiz Geçiş)
        if (puanlar.__vip) {
            let vip_arr = Array.from(puanlar.__vip);
            vip_arr.sort((a,b) => (puanlar[b]||0) - (puanlar[a]||0));
            for (let i=0; i<vip_arr.length && eklenecekler.size < poolSize; i++) {
                eklenecek_sayi_ekle(parseInt(vip_arr[i]));
            }
        }
        
        let topCount = Math.floor(poolSize * 0.65);
        let komsuCount = Math.floor(poolSize * 0.20); // KOTA 20% OLARAK KORUNDU

        // 1. Kategori: En Yüksek Puanlılar (Sıcak/Genel Başarı)
        for (let i = 0; i < sirali.length && eklenecekler.size < topCount; i++) {
            let num = parseInt(sirali[i][0]);
            if (!eklenecekler.has(num) && !blok_dolu_mu(num)) {
                eklenecek_sayi_ekle(num);
            }
        }

        // 2. Kategori: Puanı Düşük Ama Komşuluğu Olanlar
        let komsu_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return !eklenecekler.has(n) && (puanlar.__komsular && puanlar.__komsular[n] > 0);
        });

        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En çok komşuluğu olan ÖNCE!
            return parseInt(a[1]) - parseInt(b[1]); // Eşit komşulukta en DÜŞÜK puanlı ÖNCE!
        });

        for (let i = 0; i < komsu_adaylari.length && komsuCount > 0 && eklenecekler.size < poolSize; i++) {
            let num = parseInt(komsu_adaylari[i][0]);
            if (!eklenecekler.has(num) && !blok_dolu_mu(num)) {
                eklenecek_sayi_ekle(num);
                komsuCount--;
            }
        }

        // --- ALAN SAVUNMASI: GARANTİ BOŞLUK DOLDURMA (Vacuum Filling) ---
        for (let b = 0; b < blokSayisi && eklenecekler.size < poolSize; b++) {
            if (blok_sayaci[b] === 0) {
                let bas = b * 10 + 1;
                let bit = Math.min(bas + 9, maxN);
                let blok_sayilari = sirali.filter(x => {
                    let n = parseInt(x[0]);
                    return n >= bas && n <= bit && !eklenecekler.has(n);
                });
                if (blok_sayilari.length > 0) {
                    eklenecek_sayi_ekle(parseInt(blok_sayilari[0][0]));
                }
            }
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

        for (let i = 0; i < kurak_adaylari.length && kalan_kota > 0 && eklenecekler.size < poolSize; i++) {
            let num = parseInt(kurak_adaylari[i][0]);
            if (!eklenecekler.has(num) && !blok_dolu_mu(num)) {
                eklenecek_sayi_ekle(num);
                kalan_kota--;
            }
        }

        // Eğer hala boşluk kaldıysa, puan sırasına göre doldur
        for (let i = 0; i < sirali.length && eklenecekler.size < poolSize; i++) {
            let num = parseInt(sirali[i][0]);
            if (!eklenecekler.has(num)) {
                eklenecek_sayi_ekle(num);
            }
        }

        return Array.from(eklenecekler);
      },`;

let nAkilliTarget = normalize(akilliTarget);
let nAkilliNew = normalize(akilliNew);

if (nContent.includes(nAkilliTarget)) {
    nContent = nContent.replace(nAkilliTarget, nAkilliNew);
    console.log("Akilli secim block replaced successfully.");
} else {
    console.log("FAILED to find Akilli secim block.");
}

fs.writeFileSync('PROMPT_BUILDER_v8_0.html', nContent, 'utf-8');
console.log("DONE.");
