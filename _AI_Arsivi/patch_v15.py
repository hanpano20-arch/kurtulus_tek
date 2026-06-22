import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix Joker Komşusu (Add to k5)
    target_k5 = """        // K5- Joker Çarpanı
        let k5 = 0;
        const son_15_joks = joks.slice(0, 15);
        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi === n) {
            let joker_agirligi = (15 - index) / 15;
            k5 += Math.floor((config.CARPAN_JOKER || 5.0) * joker_agirligi * 10);
          }
        });"""
    replacement_k5 = """        // K5- Joker Çarpanı ve Joker Komşusu
        let k5 = 0;
        let jokerKomsuSayaci = {};
        const son_15_joks = joks.slice(0, 15);
        son_15_joks.forEach((joker_sayisi, index) => {
          if (joker_sayisi && joker_sayisi >= 1 && joker_sayisi <= maxN) {
            let agirlik = (15 - index) / 15;
            let j_puan = Math.floor((config.CARPAN_JOKER || 5.0) * agirlik * 10);
            if (joker_sayisi === n) k5 += j_puan;
            
            const komsular = [joker_sayisi - 1, joker_sayisi + 1, joker_sayisi - 10, joker_sayisi + 10, joker_sayisi - 11, joker_sayisi - 9, joker_sayisi + 9, joker_sayisi + 11];
            if (komsular.includes(n)) {
                let count = jokerKomsuSayaci[n] || 0;
                if (count < 2) {
                    let carpan = count === 0 ? 1 : 0.5;
                    k5 += Math.floor(j_puan * 0.2 * carpan);
                    jokerKomsuSayaci[n] = count + 1;
                }
            }
          }
        });"""
    if target_k5 in content:
        content = content.replace(target_k5, replacement_k5)
        print("Patched k5")
    else:
        print("Failed to patch k5")

    # 2. Inject missing globals right before return
    target_return = """        return {
          historical,"""
          
    replacement_return = """        // MISSING RULES INJECTED TO UI
        // 1. Ardışık Çekim (k6'ya ekle)
        if (son_10_donem.length > 0 && son_10_donem[0] && Array.isArray(son_10_donem[0])) {
          if (son_10_donem[0].includes(n - 1) || son_10_donem[0].includes(n + 1)) {
              k6 += (config.PUAN_ARDISIK_CEKIM || 15.0);
          }
        }
        
        // 2. Kuyruk Kuraklığı (k4'e ekle)
        let kuyruk_frekans = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
        son_5_donem.forEach(draw => {
          if (draw && Array.isArray(draw)) draw.forEach(num => kuyruk_frekans[num % 10]++);
        });
        if (kuyruk_frekans[n % 10] === 0) {
            k4 += (config.PUAN_KUYRUK_KURAKLIGI || 25.0);
        }
        
        // 3. Sarkaç Dengesi (k11'e ekle)
        if (son_10_donem.length > 0 && son_10_donem[0] && Array.isArray(son_10_donem[0])) {
          let s_cekilis = son_10_donem[0];
          let toplam = s_cekilis.reduce((a, b) => a + b, 0);
          let ortalama = toplam / s_cekilis.length;
          let beklenen = maxN / 2;
          if (ortalama > beklenen + (maxN * 0.1) && n <= Math.floor(maxN / 2)) k11 += (config.PUAN_SARKAC_DENGESI || 20.0);
          else if (ortalama < beklenen - (maxN * 0.1) && n >= Math.ceil(maxN / 2)) k11 += (config.PUAN_SARKAC_DENGESI || 20.0);
        }
        
        // 4. Son 10 Taban Puanı (k2'ye ekle)
        let in_son_10 = son_10_donem.some(draw => draw && Array.isArray(draw) && draw.includes(n));
        if (in_son_10) k2 += (config.PUAN_SON_10_TABAN || 50.0);
        
        // 5. Tarihsel Zayıf Sayı Cezası (historical'a ekle)
        let isinmis_sayilar = new Set();
        son_10_donem.forEach(d => { if(d && Array.isArray(d)) d.forEach(s => isinmis_sayilar.add(s)); });
        joks.slice(0, 10).forEach(j => { if(j >= 1 && j <= maxN) isinmis_sayilar.add(j); });
        // (Simplified Isinmis check, sufficient for UI representation)
        if (k6 > 0 || is_joker_komsu) isinmis_sayilar.add(n);
        
        let frek_arr = Object.values(raw_hist).sort((a,b)=>a-b);
        let baraj_degeri = frek_arr[Math.floor(maxN * 0.25)];
        if (raw_hist[n] <= baraj_degeri && !isinmis_sayilar.has(n)) {
            historical += (config.CEZA_DUSUK_FREKANS || -50.0);
        }
        
        // 6. Yalancı Sıcak İnfazı (k12'ye ekle)
        let tekrar_oranlari = {};
        for(let i=1; i<=maxN; i++) tekrar_oranlari[i] = 0;
        for (let i = 0; i < df.length - 1; i++) {
          let g = df[i], o = df[i+1];
          if (g && o && Array.isArray(g) && Array.isArray(o)) {
            g.forEach(x => { if (o.includes(x)) tekrar_oranlari[x]++; });
          }
        }
        let tekrar_arr = Object.values(tekrar_oranlari).sort((a,b)=>a-b);
        let tekrar_baraj = tekrar_arr[Math.floor(maxN * 0.20)];
        let in_son_3 = son_3_donem.some(draw => draw && Array.isArray(draw) && draw.includes(n));
        if (in_son_3 && tekrar_oranlari[n] <= tekrar_baraj && !isinmis_sayilar.has(n)) {
            k12 += (config.CEZA_TEKRAR_ETMEYEN_SICAK || -100.0);
        }
        
        // 7. Bölgesel Boşluk (k11'e ekle)
        let in_son_2 = df.slice(0, 2).some(draw => draw && Array.isArray(draw) && draw.includes(n));
        let onluk_bas = Math.floor((n-1)/10)*10 + 1;
        let onluk_bit = Math.min(onluk_bas + 9, maxN);
        let ciktigoren = false;
        df.slice(0, 2).forEach(draw => {
            if (draw && Array.isArray(draw)) {
                for(let x=onluk_bas; x<=onluk_bit; x++) {
                    if (draw.includes(x)) ciktigoren = true;
                }
            }
        });
        if (!ciktigoren) k11 += 20;

        return {
          historical,"""
          
    if target_return in content:
        content = content.replace(target_return, replacement_return)
        print("Patched return")
    else:
        print("Failed to patch return")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
