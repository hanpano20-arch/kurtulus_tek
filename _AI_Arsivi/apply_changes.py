import sys
import re

with open("PROMPT_BUILDER_v8_0.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace puanlari_hesapla block
# Search from // ANA PUANLAMA DÖNGÜSÜ to puanlar[i] += Math.floor(gecmis_puani + yakin_puani);
pattern_puanlama = re.compile(
    r"// ANA PUANLAMA DÖNGÜSÜ.*?puanlar\[i\] \+= Math\.floor\(gecmis_puani \+ yakin_puani\);",
    re.DOTALL
)

new_puanlama = """// ANA PUANLAMA DÖNGÜSÜ
        // === SEÇENEk 1+2: Normalize edilmiş taban puan iptal edildi, direkt çarpan ===
        let total_hist = 0;
        for (let i = 1; i <= maxN; i++) total_hist += (genel_frekans[i] || 0);
        let avg_hist = total_hist / maxN;

        for (let i = 1; i <= maxN; i++) {
          let my_freq = genel_frekans[i] || 0;
          // Tarihsel puan: Ortalamanın ne kadar üzerindeyse/altındaysa slider çarpanı ile doğru orantılı
          let gecmis_puani = (my_freq - avg_hist) * (this.config.YUZDE_TUM_GECMIS / 10);
          
          let f15 = son_15_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f10 = son_10_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f5 = son_5_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);
          let f3 = son_3_donem.reduce((sum, d) => sum + (d && Array.isArray(d) && d.includes(i) ? 1 : 0), 0);

          // Güncel puan: Kendi kendine sıfırlamadan (normalizasyon olmadan) slider değeri ile net çarpım
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
              puanlar[i] -= 50; // Zayıf karakterli sayılara balyoz
          } else if (max_streak >= 5) {
              puanlar[i] += 80; // Rekortmen şampiyonlara (örn: 28) bonus
          }

          // 🚨 Mutlak İzolasyon Kafesi (41, 50, 70 İnfazı) 🚨
          let my_komsu = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) + 
                         (typeof komsuSayaci_2 !== 'undefined' ? (komsuSayaci_2[i] || 0) : 0) + 
                         (typeof jokerKomsuSayaci !== 'undefined' ? (jokerKomsuSayaci[i] || 0) : 0);
          if (my_komsu === 0) {
              puanlar[i] -= 100; // Komşusu hiç olmayanları yok et
          }"""

if pattern_puanlama.search(content):
    content = pattern_puanlama.sub(new_puanlama, content, count=1)
    print("puanlama patched.")
else:
    print("WARNING: Could not find puanlama pattern!")


pattern_akilli = re.compile(
    r"akilli_secim: function \(sirali, puanlar, poolSize\) \{.*?return Array\.from\(eklenecekler\);\n\s+\},",
    re.DOTALL
)

new_akilli = """akilli_secim: function (sirali, puanlar, poolSize) {
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
            // VIP'leri en yüksek puana göre sıralayalım
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
        // Eğer havuzda hiç sayısı olmayan 10'luk dilim varsa, onu o dilimin en güçlü sayısıyla doldur.
        for (let b = 0; b < blokSayisi && eklenecekler.size < poolSize; b++) {
            if (blok_sayaci[b] === 0) {
                // Bu blok boş kalmış. Bu bloğun en yüksek puanlı sayısını bul.
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

        // Eğer hala boşluk kaldıysa, puan sırasına göre doldur (limitleri esneterek)
        for (let i = 0; i < sirali.length && eklenecekler.size < poolSize; i++) {
            let num = parseInt(sirali[i][0]);
            if (!eklenecekler.has(num)) {
                eklenecek_sayi_ekle(num);
            }
        }

        return Array.from(eklenecekler);
      },"""

if pattern_akilli.search(content):
    content = pattern_akilli.sub(new_akilli, content, count=1)
    print("akilli patched.")
else:
    print("WARNING: Could not find akilli pattern!")


with open("PROMPT_BUILDER_v8_0.html", "w", encoding="utf-8") as f:
    f.write(content)
