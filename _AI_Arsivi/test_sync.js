
    const window = {};
    const HavuzMotoru = {
      updateConfigFromUI: function () {
        const val = (id) => parseFloat(document.getElementById('ws-' + id) ? document.getElementById('ws-' + id).value : 0);
        this.config.YUZDE_TUM_GECMIS = val('hm_hist') || 20;
        this.config.YUZDE_SON_15_DONEM = 100 - this.config.YUZDE_TUM_GECMIS;
        this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu') !== undefined ? val('hm_komsu') : 25.0;
        this.config.PUAN_2_HALKA_KOMSU = val('hm_komsu2') !== undefined ? val('hm_komsu2') : 2.0;
        this.config.CARPAN_KURAKLIK = val('hm_kurak') !== undefined ? val('hm_kurak') : 1.0;
        this.config.CARPAN_JOKER = val('hm_joker') !== undefined ? val('hm_joker') : 5.0; // YENI JOKER
        this.config.PUAN_ONLUK_KURAKLIK_BONUSU = val('hm_onluk') !== undefined ? val('hm_onluk') : 10.0;
        this.config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme') !== undefined ? val('hm_ivme') : 50.0;
        this.config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik') !== undefined ? val('hm_gecik') : 15.0;
        this.config.CEZA_OLU_SAYI_4 = val('hm_olu') !== undefined ? val('hm_olu') : 0.0;
        this.config.OLUM_CEZASI_SINIRI = val('hm_kurak_sinir') || 30;
        this.config.CEZA_CIFTE_TEKRAR = val('hm_cifte') || -30;
        this.config.CEZA_DOYGUN_4 = val('hm_c4') !== undefined ? val('hm_c4') : -20;
        this.config.CEZA_DOYGUN_8 = val('hm_c8') !== undefined ? val('hm_c8') : -20;
        this.config.CEZA_DOYGUN_12 = val('hm_c12') !== undefined ? val('hm_c12') : -20;
        this.config.CEZA_DOYGUN_16 = val('hm_c16') !== undefined ? val('hm_c16') : -20;
      },
      config: {
        YUZDE_SON_15_DONEM: 60,
        YUZDE_TUM_GECMIS: 40,
        CARPAN_15: 2.0,
        CARPAN_10: 3.0,
        CARPAN_5: 4.0,
        CARPAN_KURAKLIK: 1.50,
        CARPAN_JOKER: 5.0, // <-- YENI EKLENEN JOKER CARPANI
        PUAN_1_HALKA_KOMSU: 15,
        PUAN_GECIKMELI_TEKRAR: 15,
        PUAN_BOLGE_GECISI: 10,
        CEZA_OLU_SAYI_4: -15,
        CEZA_CIFTE_TEKRAR: -30,
        CEZA_DOYGUN_4: -300,
        CEZA_DOYGUN_8: -300,
        CEZA_DOYGUN_12: -300,
        CEZA_DOYGUN_16: -300,
        PUAN_ONLUK_KURAKLIK_BONUSU: 10,
        PUAN_KINETIK_IVME_BONUSU: 50,
        // Seçenek 1+2: Normalizasyon limitleri
        // Toplam 250 puanlık sisteme göre: Tarihsel max 100p, Güncel max 150p
        // Kuraklık tavanı: 100p
        NORM_TARIHSEL_CAP: 100,
        NORM_GUNCELL_CAP: 80,
        NORM_KURAKLIK_CAP: 100
      },
      puanlari_hesapla: function (df, maxN, joks = []) {
        if (!df || df.length === 0) return {};
    
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
    