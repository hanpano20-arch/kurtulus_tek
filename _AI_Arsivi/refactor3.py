import sys
import re

def patch_file(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()

    # 1. Update sliders HTML
    # We want to change the labels of hm_c4, hm_c8, hm_c12, hm_c16
    content = re.sub(b'<label>[^<]*?(Son 4)[^<]*?(<span id="wlb-hm_c4">)', b'<label>\\1 Cekiliste 3 Kere \\2', content)
    content = re.sub(b'<label>[^<]*?(Son 8)[^<]*?(<span id="wlb-hm_c8">)', b'<label>\\1 Cekiliste 4 Kere \\2', content)
    content = re.sub(b'<label>[^<]*?(Son 12)[^<]*?(<span id="wlb-hm_c12">)', b'<label>\\1 Cekiliste 5 Kere \\2', content)
    content = re.sub(b'<label>[^<]*?(Son 16)[^<]*?(<span id="wlb-hm_c16">)', b'<label>\\1 Cekiliste 6 Kere \\2', content)

    # 2. Fix max_ardisik <= 1 penalty
    content = re.sub(
        b'\\} else if \\(max_ardisik\\[i\\] <= 1\\) \\{[\\s\\S]*?\\}',
        b'}',
        content
    )

    # 3. Saturation and VIP and isolation fix in puanlari_hesapla
    # Look for the block starting with "let count_3 = 0, count_7"
    sat_pattern = b'let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;[\\s\\S]*?count_15 >= 5\\) \\{[\\s\\S]*?\\}'
    
    new_sat = b'''let count_4 = 0, count_8 = 0, count_12 = 0, count_16 = 0;

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
          }'''
    content = re.sub(sat_pattern, new_sat, content, count=1)
    
    # 3.5 Fix count_15 in isolation logic
    content = content.replace(b'count_15 >= 3', b'count_16 >= 3')

    # 4. Return metadata properly
    old_ret = b'''Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });'''
        
    new_ret = b'''Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });
        Object.defineProperty(puanlar, '__vip', { value: (typeof window.tum_vip !== 'undefined' ? window.tum_vip : new Set()), enumerable: false });
        window.tum_vip = new Set(); // Reset for next run'''
    content = content.replace(old_ret, new_ret, 1)

    # 5. akilli_secim function update
    # We replace the whole akilli_secim function
    akilli_pattern = b'akilli_secim: function \\(sirali, puanlar, poolSize\\) \\{[\\s\\S]*?return Array\\.from\\(eklenecekler\\);\\n\\s*\\},'
        
    new_ak = b'''akilli_secim: function (sirali, puanlar, poolSize) {
        poolSize = parseInt(poolSize);
        let eklenecekler = new Set();
        
        let vip_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return puanlar.__vip && puanlar.__vip.has(n);
        });
        
        vip_adaylari.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        for (let i = 0; i < vip_adaylari.length && eklenecekler.size < poolSize; i++) {
            eklenecekler.add(parseInt(vip_adaylari[i][0]));
        }

        let kalan = poolSize - eklenecekler.size;
        let topCount = Math.floor(kalan * 0.50);
        let komsuCount = Math.floor(kalan * 0.40);

        // 1. Kategori: En Yuksek Puanlilar
        for (let i = 0; i < sirali.length && topCount > 0; i++) {
            let n = parseInt(sirali[i][0]);
            if (!eklenecekler.has(n)) {
                eklenecekler.add(n);
                topCount--;
            }
        }

        // 2. Kategori: Puan Dusuk Ama Komsulugu Olanlar
        let komsu_adaylari = sirali.filter(x => {
            let n = parseInt(x[0]);
            return !eklenecekler.has(n) && (puanlar.__komsular && puanlar.__komsular[n] > 0);
        });

        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En cok komsulugu olan ONCE!
            return parseInt(b[1]) - parseInt(a[1]); // Esit komsulukta en YUKSEK puanli ONCE!
        });

        for (let i = 0; i < komsu_adaylari.length && komsuCount > 0; i++) {
            eklenecekler.add(parseInt(komsu_adaylari[i][0]));
            komsuCount--;
        }

        // 3. Kategori: Derin Kuraklik
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

        for (let i = 0; i < sirali.length && eklenecekler.size < poolSize; i++) {
            eklenecekler.add(parseInt(sirali[i][0]));
        }

        return Array.from(eklenecekler);
      },'''
    content = re.sub(akilli_pattern, new_ak, content, count=1)

    # 6. generatePool update
    gen_pattern = b'let p_arr = Object\\.entries\\(_sc\\)\\.sort\\(\\(a, b\\) => b\\[1\\]\\.final - a\\[1\\]\\.final\\);[\\s\\S]*?_sel\\.add\\(parseInt\\(p_arr\\[i\\]\\[0\\]\\)\\);\\n\\s*\\}'
      
    new_gen = b'''let p_arr = Object.entries(_sc).map(e => [e[0], e[1].final]).sort((a, b) => b[1] - a[1]);
        
        let puanlarMap = {};
        for (let k in _sc) puanlarMap[k] = _sc[k].final;
        
        if (_sc[1] && _sc[1].hm_details && typeof window.tum_vip !== 'undefined') {
            Object.defineProperty(puanlarMap, '__vip', { value: window.tum_vip, enumerable: false });
        }
        let tum_komsular = {};
        for(let k in _sc) {
            let dt = _sc[k].hm_details;
            let kg = (dt.k1||0) + (dt.k2||0) + (dt.jk||0);
            if (kg > 0) tum_komsular[k] = kg;
        }
        Object.defineProperty(puanlarMap, '__komsular', { value: tum_komsular, enumerable: false });

        let havuz = this.akilli_secim(p_arr, puanlarMap, poolSize);
        _sel.clear();
        havuz.forEach(n => _sel.add(parseInt(n)));'''
    content = re.sub(gen_pattern, new_gen, content, count=1)

    with open(filepath, 'wb') as f:
        f.write(content)
    print("Done")

patch_file('PROMPT_BUILDER_v8_0.html')
