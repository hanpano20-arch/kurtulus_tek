import sys
import re

def patch_file(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()

    # 1. Update sliders HTML
    old_c4 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 4 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c4">-20</span>)</label>'
    new_c4 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 4 \xc3\x87ekili\xc5\x9fte 3 Kere (<span id="wlb-hm_c4">-20</span>)</label>'
    content = content.replace(old_c4, new_c4)
    
    old_c8 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 8 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c8">-20</span>)</label>'
    new_c8 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 8 \xc3\x87ekili\xc5\x9fte 4 Kere (<span id="wlb-hm_c8">-20</span>)</label>'
    content = content.replace(old_c8, new_c8)
    
    old_c12 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 12 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c12">-20</span>)</label>'
    new_c12 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 12 \xc3\x87ekili\xc5\x9fte 5 Kere (<span id="wlb-hm_c12">-20</span>)</label>'
    content = content.replace(old_c12, new_c12)
    
    old_c16 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 16 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c16">-20</span>)</label>'
    new_c16 = b'<div class="h-w-row"><label>\xf0\x9f\x93\x89 Son 16 \xc3\x87ekili\xc5\x9fte 6 Kere (<span id="wlb-hm_c16">-20</span>)</label>'
    content = content.replace(old_c16, new_c16)

    # 2. Fix max_ardisik <= 1 penalty
    content = re.sub(
        b'\\} else if \\(max_ardisik\\[i\\] <= 1\\) \\{\\s+puanlar\\[i\\] -= 50; // 30 gibi asla arka arkaya \xc3\xa7\xc4\xb1kamayanlar\\s+\\}',
        b'}',
        content
    )

    # 3. Saturation and VIP and isolation fix
    old_sat = b'''          // \xf0\x9f\x9a\xa8 YEN\xc4\xb0: A\xc5\x9eIRI DOYGUNLUK (T\xc3\x9cKENM\xc4\xb0\xc5\x9eL\xc4\xb0K) CEZALARIN \xf0\x9f\x9a\xa8
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
          }'''
          
    new_sat = b'''          // \xf0\x9f\x9a\xa8 YEN\xc4\xb0: A\xc5\x9eIRI DOYGUNLUK (T\xc3\x9cKENM\xc4\xb0\xc5\x9eL\xc4\xb0K) CEZALARIN \xf0\x9f\x9a\xa8
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
          }'''
    content = content.replace(old_sat, new_sat)
    
    # 3.5 Fix count_15 in isolation logic
    content = content.replace(b'count_15 >= 3', b'count_16 >= 3')

    # 4. Return metadata properly
    old_ret = b'''        Object.defineProperty(puanlar, '__komsular', { value: tum_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });

        return puanlar;'''
        
    new_ret = b'''        Object.defineProperty(puanlar, '__komsular', { value: tum_komsular, enumerable: false });
        Object.defineProperty(puanlar, '__kuraklik', { value: meta_kuraklik, enumerable: false });
        Object.defineProperty(puanlar, '__vip', { value: (typeof window.tum_vip !== 'undefined' ? window.tum_vip : new Set()), enumerable: false });
        window.tum_vip = new Set(); // Reset for next run

        return puanlar;'''
    content = content.replace(old_ret, new_ret)

    # 5. akilli_secim function update
    old_ak = b'''      akilli_secim: function (sirali, puanlar, poolSize) {
        let eklenecekler = new Set();
        // Puan\xc4\xb1 y\xc3\xbcksek olanlara havuzun %50'si (15 say\xc4\xb1)
        let topCount = Math.floor(poolSize * 0.50);
        // Kom\xc5\x9fulu\xc4\x9fu olan ama puan\xc4\xb1 yetmeyen gizli cevherlere %40 devasa kota (12 say\xc4\xb1)
        let komsuCount = Math.floor(poolSize * 0.40);

        // 1. Kategori: En Y\xc3\xbcksek Puanl\xc4\xb1lar (S\xc4\xb1cak/Genel Ba\xc5\x9far\xc4\xb1)
        for (let i = 0; i < sirali.length && eklenecekler.size < topCount; i++) {
            eklenecekler.add(parseInt(sirali[i][0]));
        }'''
        
    new_ak = b'''      akilli_secim: function (sirali, puanlar, poolSize) {
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

        // 1. Kategori: En Y\xc3\xbcksek Puanl\xc4\xb1lar (S\xc4\xb1cak/Genel Ba\xc5\x9far\xc4\xb1)
        for (let i = 0; i < sirali.length && topCount > 0; i++) {
            let n = parseInt(sirali[i][0]);
            if (!eklenecekler.has(n)) {
                eklenecekler.add(n);
                topCount--;
            }
        }'''
    content = content.replace(old_ak, new_ak)
    
    old_ak_komsu = b'''        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En \xc3\xa7ok kom\xc5\x9fulu\xc4\x9fu olan \xc3\x96NCE!
            return parseInt(a[1]) - parseInt(b[1]); // E\xc5\x9fit kom\xc5\x9fulukta en D\xc3\x9c\xc5\x9e\xc3\x9cK puanl\xc4\xb1 \xc3\x96NCE!
        });'''
    new_ak_komsu = b'''        komsu_adaylari.sort((a, b) => {
            let nA = parseInt(a[0]), nB = parseInt(b[0]);
            let kA = puanlar.__komsular ? puanlar.__komsular[nA] || 0 : 0;
            let kB = puanlar.__komsular ? puanlar.__komsular[nB] || 0 : 0;
            if (kB !== kA) return kB - kA; // En \xc3\xa7ok kom\xc5\x9fulu\xc4\x9fu olan \xc3\x96NCE!
            return parseInt(b[1]) - parseInt(a[1]); // E\xc5\x9fit kom\xc5\x9fulukta en Y\xc3\x9cKSEK puanl\xc4\xb1 \xc3\x96NCE!
        });'''
    content = content.replace(old_ak_komsu, new_ak_komsu)

    # 6. generatePool update
    old_gen = b'''      generatePool: function () {
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
      
    new_gen = b'''      generatePool: function () {
        const poolSize = parseInt(document.getElementById('hm-pool-size').value) || 25;
        const maxN = (typeof gameMax === 'function') ? gameMax() : 90;
        let p_arr = Object.entries(_sc).map(e => [e[0], e[1].final]).sort((a, b) => b[1] - a[1]);
        
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
        havuz.forEach(n => _sel.add(parseInt(n)));
        
        H.renderDB();
        H.renderScore();
      },'''
    content = content.replace(old_gen, new_gen)

    with open(filepath, 'wb') as f:
        f.write(content)

patch_file('PROMPT_BUILDER_v8_0.html')
