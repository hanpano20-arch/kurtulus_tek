import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Isınmış Joker Uyanışı
    target_joker = """          // 🔥 YENİ: KOMBİNE ISINMA (TAM ISINMA) BONUSU 🔥
          // 28, 15, 40, 42, 81 gibi hem son 10'da (veya Jokerde) olup hem de komşuluk/joker etkisi alan sayılar fırlasın!
          let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(i));
          if (is_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {
            // Kinetik İvme bonusu tamamen paneldeki parametreye bağlı olsun (gizli +150 dayatmasını kaldırdık)
            puanlar[i] += (this.config.PUAN_KINETIK_IVME_BONUSU || 50);
          }"""

    replacement_joker = """          // 🔥 YENİ: KOMBİNE ISINMA (TAM ISINMA) BONUSU 🔥
          let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(i));
          if (is_in_last_10 && ((typeof komsuSayaci_1 !== 'undefined' && komsuSayaci_1[i] > 0) || (typeof jokerKomsuSayaci !== 'undefined' && jokerKomsuSayaci[i] > 0))) {
            puanlar[i] += 150; // Isınmış Joker/Komşu Uyanışı (15 ve 40'ın kurtuluşu)
          }
          
          // 🚨 KURAL 1: Mutlak Komşu İzolasyonu (41, 50, 60, 70 İnfazı) 🚨
          let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) > 0;
          if (!is_komsu_1) {
              puanlar[i] -= 250; // 1. Derece komşusu olmayanlar doğrudan elenir!
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
          }"""

    if target_joker in content:
        content = content.replace(target_joker, replacement_joker)
        print("Replaced Joker / Kinetik / Izolasyon / Dinamik Seri rules.")
    else:
        print("COULD NOT FIND target_joker")

    # 2. Remove Çifte Tekrar Cezası
    target_cifte = """          // Çifte Tekrar Cezası
          if (df.length >= 2 && df[0] && df[1] && Array.isArray(df[0]) && Array.isArray(df[1]) && df[0].includes(i) && df[1].includes(i)) {
            puanlar[i] += this.config.CEZA_CIFTE_TEKRAR;
          }"""

    replacement_cifte = """          // Çifte Tekrar Cezası KALDIRILDI (Dinamik Seri Analizörü ile yönetiliyor)"""

    if target_cifte in content:
        content = content.replace(target_cifte, replacement_cifte)
        print("Removed Çifte Tekrar Cezası.")
    else:
        print("COULD NOT FIND target_cifte")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Patch applied successfully.")

except Exception as e:
    print("Error:", e)
