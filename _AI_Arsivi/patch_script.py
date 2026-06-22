import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix UI sliders
    content = content.replace('id=\"ws-hm_hist\" min=\"10\" max=\"90\" step=\"5\" value=\"40\"', 'id=\"ws-hm_hist\" min=\"10\" max=\"90\" step=\"5\" value=\"35\"')
    content = content.replace('<span id=\"wv-hm_hist\">40</span>%', '<span id=\"wv-hm_hist\">35</span>%')
    
    content = content.replace('1. Halka Komşu Çarpanı (×<span id=\"wlb-hm_komsu\">25.0</span>)', '1. Halka Komşu Çarpanı (×<span id=\"wlb-hm_komsu\">5.0</span>)')
    content = content.replace('id=\"ws-hm_komsu\" min=\"0\" max=\"30\" step=\"0.5\" value=\"25.0\"', 'id=\"ws-hm_komsu\" min=\"0\" max=\"30\" step=\"0.5\" value=\"5.0\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_komsu\">25.0</span>', '<span class=\"h-w-val\" id=\"wv-hm_komsu\">5.0</span>')

    content = content.replace('Kinetik İvme Bonusu (×<span id=\"wlb-hm_ivme\">50.0</span>)', 'Kinetik İvme Bonusu (×<span id=\"wlb-hm_ivme\">25.0</span>)')
    content = content.replace('id=\"ws-hm_ivme\" min=\"0\" max=\"60\" step=\"1\" value=\"50.0\"', 'id=\"ws-hm_ivme\" min=\"0\" max=\"60\" step=\"1\" value=\"25.0\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_ivme\">50.0</span>', '<span class=\"h-w-val\" id=\"wv-hm_ivme\">25.0</span>')

    content = content.replace('Gecikmeli Tekrar (×<span id=\"wlb-hm_gecik\">15.0</span>)', 'Gecikmeli Tekrar (×<span id=\"wlb-hm_gecik\">18.0</span>)')
    content = content.replace('id=\"ws-hm_gecik\" min=\"0\" max=\"30\" step=\"1\" value=\"15.0\"', 'id=\"ws-hm_gecik\" min=\"0\" max=\"30\" step=\"1\" value=\"18.0\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_gecik\">15.0</span>', '<span class=\"h-w-val\" id=\"wv-hm_gecik\">18.0</span>')

    content = content.replace('Ölü Sayı Cezası (<span id=\"wlb-hm_olu\">-15</span>)', 'Ölü Sayı Cezası (<span id=\"wlb-hm_olu\">-45</span>)')
    content = content.replace('id=\"ws-hm_olu\" min=\"-50\" max=\"0\" step=\"1\" value=\"-15\"', 'id=\"ws-hm_olu\" min=\"-100\" max=\"0\" step=\"1\" value=\"-45\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_olu\">-15</span>', '<span class=\"h-w-val\" id=\"wv-hm_olu\">-45</span>')

    content = content.replace('Ölüm Cezası Sınırı (<span id=\"wlb-hm_kurak_sinir\">30</span>)', 'Ölüm Cezası Sınırı (<span id=\"wlb-hm_kurak_sinir\">40</span>)')
    content = content.replace('id=\"ws-hm_kurak_sinir\" min=\"10\" max=\"50\" step=\"1\" value=\"30\"', 'id=\"ws-hm_kurak_sinir\" min=\"10\" max=\"50\" step=\"1\" value=\"40\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_kurak_sinir\">30</span>', '<span class=\"h-w-val\" id=\"wv-hm_kurak_sinir\">40</span>')

    content = content.replace('Son 4 Çekiliş Cezası (<span id=\"wlb-hm_c4\">-20</span>)', 'Son 4 Çekiliş Cezası (<span id=\"wlb-hm_c4\">-150</span>)')
    content = content.replace('id=\"ws-hm_c4\" min=\"-100\" max=\"0\" step=\"10\" value=\"-20\"', 'id=\"ws-hm_c4\" min=\"-500\" max=\"0\" step=\"10\" value=\"-150\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_c4\">-20</span>', '<span class=\"h-w-val\" id=\"wv-hm_c4\">-150</span>')

    content = content.replace('Son 8 Çekiliş Cezası (<span id=\"wlb-hm_c8\">-20</span>)', 'Son 8 Çekiliş Cezası (<span id=\"wlb-hm_c8\">-250</span>)')
    content = content.replace('id=\"ws-hm_c8\" min=\"-100\" max=\"0\" step=\"10\" value=\"-20\"', 'id=\"ws-hm_c8\" min=\"-500\" max=\"0\" step=\"10\" value=\"-250\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_c8\">-20</span>', '<span class=\"h-w-val\" id=\"wv-hm_c8\">-250</span>')

    content = content.replace('Son 12 Çekiliş Cezası (<span id=\"wlb-hm_c12\">-20</span>)', 'Son 12 Çekiliş Cezası (<span id=\"wlb-hm_c12\">-375</span>)')
    content = content.replace('id=\"ws-hm_c12\" min=\"-100\" max=\"0\" step=\"10\" value=\"-20\"', 'id=\"ws-hm_c12\" min=\"-500\" max=\"0\" step=\"10\" value=\"-375\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_c12\">-20</span>', '<span class=\"h-w-val\" id=\"wv-hm_c12\">-375</span>')

    content = content.replace('Son 16 Çekiliş Cezası (<span id=\"wlb-hm_c16\">-20</span>)', 'Son 16 Çekiliş Cezası (<span id=\"wlb-hm_c16\">-500</span>)')
    content = content.replace('id=\"ws-hm_c16\" min=\"-100\" max=\"0\" step=\"10\" value=\"-20\"', 'id=\"ws-hm_c16\" min=\"-500\" max=\"0\" step=\"10\" value=\"-500\"')
    content = content.replace('<span class=\"h-w-val\" id=\"wv-hm_c16\">-20</span>', '<span class=\"h-w-val\" id=\"wv-hm_c16\">-500</span>')

    # Config defaults
    content = content.replace("this.config.YUZDE_TUM_GECMIS = val('hm_hist') || 20;", "this.config.YUZDE_TUM_GECMIS = val('hm_hist') || 35;")
    content = content.replace("this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu') !== undefined ? val('hm_komsu') : 25.0;", "this.config.PUAN_1_HALKA_KOMSU = val('hm_komsu') !== undefined ? val('hm_komsu') : 5.0;")
    content = content.replace("this.config.CARPAN_KURAKLIK = val('hm_kurak') !== undefined ? val('hm_kurak') : 1.0;", "this.config.CARPAN_KURAKLIK = val('hm_kurak') !== undefined ? val('hm_kurak') : 2.5;")
    content = content.replace("this.config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme') !== undefined ? val('hm_ivme') : 50.0;", "this.config.PUAN_KINETIK_IVME_BONUSU = val('hm_ivme') !== undefined ? val('hm_ivme') : 25.0;")
    content = content.replace("this.config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik') !== undefined ? val('hm_gecik') : 15.0;", "this.config.PUAN_GECIKMELI_TEKRAR = val('hm_gecik') !== undefined ? val('hm_gecik') : 18.0;")
    content = content.replace("this.config.CEZA_OLU_SAYI_4 = val('hm_olu') !== undefined ? val('hm_olu') : 0.0;", "this.config.CEZA_OLU_SAYI_4 = val('hm_olu') !== undefined ? val('hm_olu') : -45.0;")
    content = content.replace("this.config.OLUM_CEZASI_SINIRI = val('hm_kurak_sinir') || 30;", "this.config.OLUM_CEZASI_SINIRI = val('hm_kurak_sinir') || 40;")
    content = content.replace("this.config.CEZA_DOYGUN_4 = val('hm_c4') !== undefined ? val('hm_c4') : -20;", "this.config.CEZA_DOYGUN_4 = val('hm_c4') !== undefined ? val('hm_c4') : -150;")
    content = content.replace("this.config.CEZA_DOYGUN_8 = val('hm_c8') !== undefined ? val('hm_c8') : -20;", "this.config.CEZA_DOYGUN_8 = val('hm_c8') !== undefined ? val('hm_c8') : -250;")
    content = content.replace("this.config.CEZA_DOYGUN_12 = val('hm_c12') !== undefined ? val('hm_c12') : -20;", "this.config.CEZA_DOYGUN_12 = val('hm_c12') !== undefined ? val('hm_c12') : -375;")
    content = content.replace("this.config.CEZA_DOYGUN_16 = val('hm_c16') !== undefined ? val('hm_c16') : -20;", "this.config.CEZA_DOYGUN_16 = val('hm_c16') !== undefined ? val('hm_c16') : -500;")

    content = content.replace("YUZDE_SON_15_DONEM: 60,", "YUZDE_SON_15_DONEM: 65,")
    content = content.replace("YUZDE_TUM_GECMIS: 40,", "YUZDE_TUM_GECMIS: 35,")
    content = content.replace("CARPAN_10: 3.0,", "CARPAN_10: 3.5,")
    content = content.replace("CARPAN_5: 4.0,", "CARPAN_5: 5.0,")
    content = content.replace("CARPAN_KURAKLIK: 1.50,", "CARPAN_KURAKLIK: 2.5,")
    content = content.replace("PUAN_1_HALKA_KOMSU: 15,", "PUAN_1_HALKA_KOMSU: 5,")
    content = content.replace("PUAN_GECIKMELI_TEKRAR: 15,", "PUAN_GECIKMELI_TEKRAR: 18,")
    content = content.replace("PUAN_BOLGE_GECISI: 10,", "PUAN_BOLGE_GECISI: 12,")
    content = content.replace("CEZA_OLU_SAYI_4: -15,", "CEZA_OLU_SAYI_4: -45,")
    content = content.replace("CEZA_DOYGUN_4: -300,", "CEZA_DOYGUN_4: -150,")
    content = content.replace("CEZA_DOYGUN_8: -300,", "CEZA_DOYGUN_8: -250,")
    content = content.replace("CEZA_DOYGUN_12: -300,", "CEZA_DOYGUN_12: -375,")
    content = content.replace("CEZA_DOYGUN_16: -300,", "CEZA_DOYGUN_16: -500,")

    # Add Matrix config
    content = content.replace("CEZA_DOYGUN_16: -500,", "CEZA_DOYGUN_16: -500,\n        PUAN_DIKEY_PRES: 20,\n        PUAN_DIKEY_KOMSU: 5,\n        PUAN_CAPRAZ_KOMSU: 5,")
    
    # Bug fixes
    content = content.replace("k11 += Math.floor(config.PUAN_BOLGE_GECISI / limit);", "k11 += config.PUAN_BOLGE_GECISI;")
    content = content.replace("if (count_3 < 2 && count_7 < 3 && f15 <= 1 && f3 >= 2) {", "if (count_3 < 2 && count_7 < 3 && f15 <= 1 && f3 >= 1) {")

    # Matrix Rules string
    old_rules = "          { id: 'k18', name: 'K18-Din.Seri', desc: `<b>Dinamik Seri Kapasitesi:</b><br>Eğer sayı en son çekilişte çıktıysa, tekrar etme ihtimali incelenir. Bu sayının geçmişte \"Seri yapma\" (üst üste çıkma) kapasitesi yüksekse, bir kez daha gelme potansiyeline karşılık ufak bir tekrar bonusu alır.` }\n        ];\n        window.dstRules = rules;"
    new_rules = "          { id: 'k18', name: 'K18-Din.Seri', desc: `<b>Dinamik Seri Kapasitesi:</b><br>Eğer sayı en son çekilişte çıktıysa, tekrar etme ihtimali incelenir. Bu sayının geçmişte \"Seri yapma\" (üst üste çıkma) kapasitesi yüksekse, bir kez daha gelme potansiyeline karşılık ufak bir tekrar bonusu alır.` },\n          { id: 'k19', name: 'K19-DikeyPres', desc: `<b>Dikey Sıkıştırma (Pres):</b><br>Bir sayının matris tablosunda hem altındaki (n+10) hem üstündeki (n-10) sayı son 3 çekilişte çıkmışsa, o sayı ortada sıkışmıştır ve büyük bir \"Pres\" puanı alır.` },\n          { id: 'k20', name: 'K20-DikeyKomşu', desc: `<b>Dikey Komşuluk (N±10):</b><br>Bir sayının matris tablosunda altındaki veya üstündeki komşusu son 3 çekilişte çıkmışsa, dikey etkileşim puanı alır.` },\n          { id: 'k21', name: 'K21-ÇaprazKomşu', desc: `<b>Çapraz Komşuluk (N±9, N±11):</b><br>Bir sayının matris tablosunda sağ-üst, sol-üst, sağ-alt veya sol-alt çaprazındaki sayılardan biri son 3 çekilişte çıkmışsa, çapraz etkileşim puanı alır.` }\n        ];\n        window.dstRules = rules;"
    content = content.replace(old_rules, new_rules)

    old_res = "res += fmt(details.k18);"
    new_res = "res += fmt(details.k18);\n            res += fmt(details.k19);\n            res += fmt(details.k20);\n            res += fmt(details.k21);"
    content = content.replace(old_res, new_res)

    # Matrix Calculate Logic
    # Let's insert k19, k20, k21 after k18
    # old: let k18 = 0; \n        if (temp_is_in_last) { ... }
    # Let's just find the end of K18 logic which is:
    #             } else if (max_streak <= 2) {
    #                 k18 = -100;
    #             }
    #         }
    # Then we add k19, k20, k21
    k18_end = "            } else if (max_streak <= 2) {\n                k18 = -100;\n            }\n        }"
    matrix_logic = """
        // MATRİS KURALLARI (K19, K20, K21)
        let k19 = 0;
        let k20 = 0;
        let k21 = 0;
        
        let dikey_ust_cikti = (n - 10 >= 1) && son_3_hafta_sayilari.has(n - 10);
        let dikey_alt_cikti = (n + 10 <= maxN) && son_3_hafta_sayilari.has(n + 10);
        
        // K19 Dikey Pres
        if (dikey_ust_cikti && dikey_alt_cikti) {
            k19 = config.PUAN_DIKEY_PRES;
        }
        // K20 Dikey Komşu
        if (dikey_ust_cikti || dikey_alt_cikti) {
            k20 = config.PUAN_DIKEY_KOMSU;
        }
        // K21 Çapraz Komşu
        let caprazlar = [n-9, n-11, n+9, n+11];
        caprazlar.forEach(c => {
            if (c >= 1 && c <= maxN && son_3_hafta_sayilari.has(c)) {
                k21 += config.PUAN_CAPRAZ_KOMSU;
            }
        });
    """
    content = content.replace(k18_end, k18_end + "\n" + matrix_logic)

    # Add to sum
    content = content.replace("let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18;", "let currentSum = historical + recent + k1 + k2 + k3 + k4 + k5 + k6 + k7 + k8 + k9 + k10 + k11 + k12 + k13 + k14 + k15 + k16 + k17 + k18 + k19 + k20 + k21;")
    content = content.replace("          k18\n        };", "          k18,\n          k19,\n          k20,\n          k21\n        };")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('PROMPT_BUILDER_v8_0.html')
print('Patch applied')
