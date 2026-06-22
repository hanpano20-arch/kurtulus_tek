const fs = require('fs');

let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

// 1. Inject top_freq_threshold
const anaDonguTarget = `        // ANA PUANLAMA DÖNGÜSÜ
        // === SEÇENEk 1+2: Normalize edilmiş taban puan iptal edildi, direkt çarpan ===
        let total_hist = 0;`;

const anaDonguReplacement = `        // ANA PUANLAMA DÖNGÜSÜ
        let sorted_freq = Object.values(genel_frekans).sort((a,b) => b-a);
        let top_freq_threshold = sorted_freq[Math.min(5, sorted_freq.length-1)] || 0;

        // === SEÇENEk 1+2: Normalize edilmiş taban puan iptal edildi, direkt çarpan ===
        let total_hist = 0;`;

content = content.replace(anaDonguTarget, anaDonguReplacement);

// 2. Replace Mutlak Izolasyon with new logic
const izolasyonTarget = `          // 🚨 Mutlak İzolasyon Kafesi (41, 50, 70 İnfazı) 🚨
          let my_komsu = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) + 
                         (typeof komsuSayaci_2 !== 'undefined' ? (komsuSayaci_2[i] || 0) : 0) + 
                         (typeof jokerKomsuSayaci !== 'undefined' ? (jokerKomsuSayaci[i] || 0) : 0);
          if (my_komsu === 0) {
              puanlar[i] -= 100; 
          }`;

const izolasyonReplacement = `          // 🚨 Katı 1. Derece Komşu İzolasyonu (41, 50, 60, 70 İnfazı) 🚨
          let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) > 0;
          if (!is_komsu_1) {
              puanlar[i] -= 100; // Sadece 1. derece değilse infaz!
          }

          // 🔥 Isınan Joker Uyanışı Bonusu (15'in Dirilişi) 🔥
          let is_joker_last_10 = joks && joks.slice(0, 10).includes(i);
          if (is_joker_last_10 && is_komsu_1) {
              puanlar[i] += 150;
          }

          // 🛡️ Son Çekiliş Tekrar Elemesi (28 vs 19, 20) 🛡️
          if (df.length > 0 && df[0] && Array.isArray(df[0]) && df[0].includes(i)) {
              if (genel_frekans[i] >= top_freq_threshold) {
                  puanlar[i] += 100; // Tarihsel olarak güçlü tekrar adayı (28)
              } else {
                  puanlar[i] -= 80; // Tarihsel olarak zayıf tekrar adayı (19, 20)
              }
          }`;

content = content.replace(izolasyonTarget, izolasyonReplacement);

if (content.includes("top_freq_threshold") && content.includes("Sadece 1. derece değilse infaz")) {
    fs.writeFileSync('PROMPT_BUILDER_v8_0.html', content, 'utf-8');
    console.log("Patch successfully applied!");
} else {
    console.log("Failed to find targets for patching.");
}
