const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let match = content.match(/window\.HavuzMotoru\s*=\s*(\{[\s\S]*?\}\s*);/);
if (match) {
    let code = match[1];
    let script = `
    const window = {};
    const HavuzMotoru = ${code};
    
    HavuzMotoru.config = {
      CARPAN_15: 1, CARPAN_10: 2, CARPAN_5: 3,
      YUZDE_SON_15_DONEM: 20, NORM_GUNCELL_CAP: 80,
      CARPAN_JOKER: 5, PUAN_1_HALKA_KOMSU: 50, PUAN_2_HALKA_KOMSU: 20,
      PUAN_ARDISIK_CEKIM: 15, PUAN_KUYRUK_KURAKLIGI: 25, PUAN_SARKAC_DENGESI: 20,
      PUAN_SON_10_TABAN: 50, CEZA_DUSUK_FREKANS: -50, CEZA_TEKRAR_ETMEYEN_SICAK: -100,
      PUAN_ONLUK_KURAKLIK_BONUSU: 20, OLUM_CEZASI_SINIRI: 20, CEZA_OLU_SAYI_4: -30,
      PUAN_GECIKMELI_TEKRAR: 20, PUAN_BOLGE_GECISI: 10,
      CEZA_DOYGUN_4: -10, CEZA_DOYGUN_8: -20, CEZA_DOYGUN_12: -30, CEZA_DOYGUN_16: -40
    };
    
    let my_df = [
      [67, 21, 61, 20, 30, 10],
      [2, 3, 4, 5, 6, 7],
      [67, 10, 11, 12, 13, 14]
    ];
    let my_joks = [15, 40, 90];
    
    let puanlar = HavuzMotoru.puanlari_hesapla(my_df, 90, my_joks);
    
    let n = 67;
    let final_score = puanlar[n];
    let details = HavuzMotoru.extractDetailsForUI(n, my_df, my_joks);
    
    console.log("FINAL SCORE:", final_score);
    console.log("DETAILS:", details);
    `;
    fs.writeFileSync('test_sync.js', script);
}
