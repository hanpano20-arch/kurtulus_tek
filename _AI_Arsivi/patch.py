import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update sliders HTML
    old_sliders = '''<div class="h-w-row"><label>⛔ Ölü Sayı Cezası (<span id="wlb-hm_olu">-15</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_olu',-1)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_olu" min="-50" max="0" step="1" value="-15"
                oninput="H.sliderSync('hm_olu',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_olu',1)">▶</button><span class="h-w-val" id="wv-hm_olu">-15</span></div>
            <div class="h-w-row"><label>💀 Ölüm Cezası Sınırı (<span id="wlb-hm_kurak_sinir">30</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_kurak_sinir',-1)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_kurak_sinir" min="10" max="50" step="1" value="30"
                oninput="H.sliderSync('hm_kurak_sinir',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_kurak_sinir',1)">▶</button><span class="h-w-val"
                id="wv-hm_kurak_sinir">30</span></div>
            <div class="h-w-row"><label>💀 Çifte Tekrar Cezası (<span id="wlb-hm_cifte">-100</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_cifte',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_cifte" min="-500" max="0" step="10" value="-100"
                oninput="H.sliderSync('hm_cifte',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_cifte',10)">▶</button><span class="h-w-val" id="wv-hm_cifte">-100</span></div>

            <!-- YENİ 4 CEZA KURALI -->
            <div class="h-w-row"><label>📉 Son 4 Çekiliş Cezası (<span id="wlb-hm_c4">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c4',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c4" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c4',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c4',10)">▶</button><span class="h-w-val" id="wv-hm_c4">-20</span></div>
            <div class="h-w-row"><label>📉 Son 8 Çekiliş Cezası (<span id="wlb-hm_c8">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c8',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c8" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c8',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c8',10)">▶</button><span class="h-w-val" id="wv-hm_c8">-20</span></div>
            <div class="h-w-row"><label>📉 Son 12 Çekiliş Cezası (<span id="wlb-hm_c12">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c12',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c12" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c12',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c12',10)">▶</button><span class="h-w-val" id="wv-hm_c12">-20</span></div>
            <div class="h-w-row"><label>📉 Son 16 Çekiliş Cezası (<span id="wlb-hm_c16">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c16',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c16" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c16',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c16',10)">▶</button><span class="h-w-val" id="wv-hm_c16">-20</span></div>'''
                
    new_sliders = '''<!-- YENİ 4 CEZA KURALI -->
            <div class="h-w-row"><label>📉 Son 4 Çekilişte 3 Kere (<span id="wlb-hm_c4">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c4',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c4" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c4',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c4',10)">▶</button><span class="h-w-val" id="wv-hm_c4">-20</span></div>
            <div class="h-w-row"><label>📉 Son 8 Çekilişte 4 Kere (<span id="wlb-hm_c8">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c8',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c8" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c8',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c8',10)">▶</button><span class="h-w-val" id="wv-hm_c8">-20</span></div>
            <div class="h-w-row"><label>📉 Son 12 Çekilişte 5 Kere (<span id="wlb-hm_c12">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c12',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c12" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c12',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c12',10)">▶</button><span class="h-w-val" id="wv-hm_c12">-20</span></div>
            <div class="h-w-row"><label>📉 Son 16 Çekilişte 6 Kere (<span id="wlb-hm_c16">-20</span>)</label><button
                class="h-arrow" onclick="H.adjSlider('hm_c16',-10)">◀</button><input type="range"
                oninput="window.updateTip(this)" onmousedown="window.showTip(this)" onmouseup="window.hideTip()"
                onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)" ontouchend="window.hideTip()"
                id="ws-hm_c16" min="-100" max="0" step="10" value="-20"
                oninput="H.sliderSync('hm_c16',this.value)"><button class="h-arrow"
                onclick="H.adjSlider('hm_c16',10)">▶</button><span class="h-w-val" id="wv-hm_c16">-20</span></div>'''
    content = content.replace(old_sliders, new_sliders)

    # 2. Fix max_ardisik <= 1 penalty
    old_streak = '''          // MAX STREAK (TARİHSEL SERİ) BONUSU
          if (max_ardisik[i] >= 4) {
            puanlar[i] += 80; // 28 gibi üst üste çıkanlar
          } else if (max_ardisik[i] === 3) {
            puanlar[i] += 30; // 20 gibi sayılar
          } else if (max_ardisik[i] <= 1) {
            puanlar[i] -= 50; // 30 gibi asla arka arkaya çıkamayanlar
          }'''
    new_streak = '''          // MAX STREAK (TARİHSEL SERİ) BONUSU
          if (max_ardisik[i] >= 4) {
            puanlar[i] += 80; // 28 gibi üst üste çıkanlar
          } else if (max_ardisik[i] === 3) {
            puanlar[i] += 30; // 20 gibi sayılar
          }'''
    content = content.replace(old_streak, new_streak)

    # 3. Saturation and VIP and isolation fix
    old_saturation = '''          // Standart Filtreler (Doygunlukta Kalkan Yok)
          if (f5 >= 3) puanlar[i] += this.config.CEZA_OLU_SAYI_4;
          if (f15 === 2 && f5 === 0) puanlar[i] += this.config.PUAN_GECIKMELI_TEKRAR;

          // 🚨 YENİ: AŞIRI DOYGUNLUK (TÜKENMİŞLİK) CEZALARIN 🚨
          let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;

          for (let c = 0; c < Math.min(15, df.length); c++) {
            let hit = (df[c] && Array.isArray(df[c]) && df[c].includes(i)) || (joks && joks[c] === i);
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

          // 🔥 İLERİ SEVİYE ISINMA VE İZOLASYON KURALLARI 🔥
          let total_komsu_gucu = (komsuSayaci_1[i] || 0) + (komsuSayaci_2[i] || 0) + (jokerKomsuSayaci[i] || 0);

          if (total_komsu_gucu === 0 && count_15 >= 3) {
            puanlar[i] -= 100; // Etrafı boş ve sık çıkmışsa izolasyon cezası
          }'''
          
    new_saturation = '''          // Standart Filtreler (Doygunlukta Kalkan Yok)
          if (f15 === 2 && f5 === 0) puanlar[i] += this.config.PUAN_GECIKMELI_TEKRAR;

          // 🚨 YENİ: AŞIRI DOYGUNLUK (TÜKENMİŞLİK) CEZALARI 🚨
          let count_4 = 0, count_8 = 0, count_12 = 0, count_16 = 0;

          for (let c = 0; c < Math.min(16, df.length); c++) {
            let hit = (df[c] && Array.isArray(df[c]) && df[c].includes(i)) || (joks && joks[c] === i);
            if (hit) {
              if (c < 4) count_4++;
              if (c < 8) count_8++;
              if (c < 12) count_12++;
              if (c < 16) count_16++;
            }
          }

          let doygun = false;
          if (count_4 >= 3) {
            puanlar[i] += this.config.CEZA_DOYGUN_4;
            doygun = true;
          } else if (count_8 >= 4) {
            puanlar[i] += this.config.CEZA_DOYGUN_8;
            doygun = true;
          } else if (count_12 >= 5) {
            puanlar[i] += this.config.CEZA_DOYGUN_12;
            doygun = true;
          } else if (count_16 >= 6) {
            puanlar[i] += this.config.CEZA_DOYGUN_16;
            doygun = true;
          }

          if (f10 >= 2 && !doygun) {
            if (typeof window.tum_vip === 'undefined') { window.tum_vip = new Set(); }
            window.tum_vip.add(i);
          }

          // 🔥 İLERİ SEVİYE ISINMA VE İZOLASYON KURALLARI 🔥
          let total_komsu_gucu = (komsuSayaci_1[i] || 0) + (komsuSayaci_2[i] || 0) + (jokerKomsuSayaci[i] || 0);

          if (total_komsu_gucu === 0 && count_16 >= 3) {
            puanlar[i] -= 100; // Etrafı boş ve sık çıkmışsa izolasyon cezası
          }'''
    content = content.replace(old_saturation, new_saturation)

    # 4. Return metadata properly
    old_return = '''        Object.defineProperty(puanlar, '__komsular', { value: tum_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });

        return puanlar;'''
    new_return = '''        Object.defineProperty(puanlar, '__komsular', { value: tum_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });
        Object.defineProperty(puanlar, '__vip', { value: (typeof window.tum_vip !== 'undefined' ? window.tum_vip : new Set()), enumerable: false });
        window.tum_vip = new Set(); // Reset for next run

        return puanlar;'''
    content = content.replace(old_return, new_return)

    # 5. akilli_secim function update
    old_akilli = '''      akilli_secim: function (sirali, puanlar, poolSize) {
        let eklenecekler = new Set();
        // Puanı yüksek olanlara havuzun %50'si (15 sayı)
        let topCount = Math.floor(poolSize * 0.50);
        // Komşuluğu olan ama puanı yetmeyen gizli cevherlere %40 devasa kota (12 sayı)
        let komsuCount = Math.floor(poolSize * 0.40);

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
      },'''
      
    new_akilli = '''      akilli_secim: function (sirali, puanlar, poolSize) {
        poolSize = parseInt(poolSize);
        let eklenecekler = new Set();
        
        // 0. Kategori: VIP YILDIZLAR (Son 10'da en az 2 kere çıkan, ama aşırı doygun olmayanlar)
        let vip_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return puanlar.__vip && puanlar.__vip.has(n);
        });
        
        // VIP'leri puanlarına göre sıralayıp direkt ekle (Kotaya bakmaksızın, ama max poolSize'ı aşmadan)
        vip_adaylari.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        for (let i = 0; i < vip_adaylari.length && eklenecekler.size < poolSize; i++) {
            eklenecekler.add(parseInt(vip_adaylari[i][0]));
        }

        let kalan = poolSize - eklenecekler.size;
        // Puanı yüksek olanlara kalan yerin %50'si
        let topCount = Math.floor(kalan * 0.50);
        // Komşuluğu olan gizli cevherlere kalan yerin %40'ı
        let komsuCount = Math.floor(kalan * 0.40);

        // 1. Kategori: En Yüksek Puanlılar (Sıcak/Genel Başarı)
        for (let i = 0; i < sirali.length && topCount > 0; i++) {
            let n = parseInt(sirali[i][0]);
            if (!eklenecekler.has(n)) {
                eklenecekler.add(n);
                topCount--;
            }
        }

        // 2. Kategori: Puanı Düşük Ama Komşuluğu Olanlar (Kullanıcının Harika Fikri!)
        let komsu_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return !eklenecekler.has(n) && (puanlar.__komsular && puanlar.__komsular[n] > 0);
        });

        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En çok komşuluğu olan ÖNCE!
            return parseInt(b[1]) - parseInt(a[1]); // Eşit komşulukta PUANI YÜKSEK olan ÖNCE! (Daha güvenli)
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
      },'''
    content = content.replace(old_akilli, new_akilli)

    # 6. generatePool update
    old_gen = '''      generatePool: function () {
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 25;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        let p_arr = Object.entries(_sc).sort((a, b) => b[1].final - a[1].final);
        
        _sel.clear();
        for (let i = 0; i < poolSize && i < p_arr.length; i++) {
          _sel.add(parseInt(p_arr[i][0]));
        }
        
        H.renderDB();
        H.renderScore();
      },'''
      
    new_gen = '''      generatePool: function () {
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 25;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        let p_arr = Object.entries(_sc).map(e => [e[0], e[1].final]).sort((a, b) => b[1] - a[1]);
        
        let puanlarMap = {};
        for (let k in _sc) puanlarMap[k] = _sc[k].final;
        // Puanlar map'ine metadata ekle (akilli_secim kullanabilmesi icin)
        if (_sc[1] && _sc[1].hm_details && typeof window.tum_vip !== 'undefined') {
            Object.defineProperty(puanlarMap, '__vip', { value: window.tum_vip, enumerable: false });
        }
        // Komşulukları _sc'den alıp puanlarMap'e aktar
        let tum_komsular = {};
        for(let k in _sc) {
            let dt = _sc[k].hm_details;
            let kg = (dt.k1||0) + (dt.k2||0) + (dt.jk||0);
            if (kg > 0) tum_komsular[k] = kg;
        }
        Object.defineProperty(puanlarMap, '__komsular', { value: tum_komsular, enumerable: false });

        let havuz = this.akilli_secim(p_arr, puanlarMap, poolSize);
        _sel.clear();
        havuz.forEach(n => _sel.add(parseInt(n)));
        
        H.renderDB();
        H.renderScore();
      },'''
    content = content.replace(old_gen, new_gen)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('PROMPT_BUILDER_v8_0.html')
