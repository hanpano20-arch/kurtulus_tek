import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # --- 1. Slider Hatası (Hardcoded 20 yerine HIST_WEIGHT kullanma) ---
    target_slider = """        // A. Tarihsel Puan (-20 .. +20)
        let gecmis_puani = 0;
        let my_freq = raw_hist[i];
        if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * 20);
        } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -20);
        }

        // Güncel puanı 0-recCap aralığına normalize et
        let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * recCap) : 0;"""

    replacement_slider = """        // A. Tarihsel Puan (Dinamik Slider Değerine Göre)
        let w_hist = this.config.HIST_WEIGHT || 20; // Slider'dan gelen % (örn: 40)
        let w_rec = 100 - w_hist;                   // Güncel yüzdesi (örn: 60)
        
        let gecmis_puani = 0;
        let my_freq = raw_hist[i];
        if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * w_hist);
        } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -w_hist);
        }

        // Güncel puanı 0 - w_rec aralığına normalize et
        let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * w_rec) : 0;"""

    if target_slider in content:
        content = content.replace(target_slider, replacement_slider)
        print("Replaced Slider Logic.")
    else:
        # Let's try alternative target format if indentation was slightly different
        target_slider_2 = """        let gecmis_puani = 0;
        let my_freq = raw_hist[i];
        if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * 20);
        } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -20);
        }

        // Güncel puanı 0-recCap aralığına normalize et
        let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * recCap) : 0;"""
        
        replacement_slider_2 = """        // A. Tarihsel Puan (Dinamik Slider Değerine Göre)
        let w_hist = this.config.HIST_WEIGHT || 20; // Slider'dan gelen % (örn: 40)
        let w_rec = 100 - w_hist;                   // Güncel yüzdesi (örn: 60)
        
        let gecmis_puani = 0;
        let my_freq = raw_hist[i];
        if (my_freq >= avg_hist) {
            let ratio = (my_freq - avg_hist) / (max_freq - avg_hist || 1);
            gecmis_puani = Math.floor(ratio * w_hist);
        } else {
            let ratio = (avg_hist - my_freq) / (avg_hist - min_freq || 1);
            gecmis_puani = Math.floor(ratio * -w_hist);
        }

        // Güncel puanı 0 - w_rec aralığına normalize et
        let yakin_puani = max_rec > 0 ? Math.floor((raw_rec[i] / max_rec) * w_rec) : 0;"""
        
        if target_slider_2 in content:
            content = content.replace(target_slider_2, replacement_slider_2)
            print("Replaced Slider Logic (Fallback Match).")
        else:
            print("COULD NOT FIND target_slider")

    # --- 2. Katliam Hatası (İzolasyon Kalkanı) ---
    target_kalkan = """          // 🚨 KURAL 1: Mutlak Komşu İzolasyonu (41, 50, 60, 70 İnfazı) 🚨
          let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) > 0;
          if (!is_komsu_1) {
              puanlar[i] -= 250; // 1. Derece komşusu olmayanlar doğrudan elenir!
          }"""

    replacement_kalkan = """          // 🚨 KURAL 1: Mutlak Komşu İzolasyonu (41, 50, 60, 70 İnfazı) 🚨
          let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[i] || 0) : 0) > 0;
          let temp_is_in_last = (df.length > 0 && df[0] && Array.isArray(df[0]) && df[0].includes(i));
          
          if (!is_komsu_1 && !temp_is_in_last) {
              puanlar[i] -= 250; // 1. Derece komşusu olmayan (ve tekrar adayı olmayan) sahte sıcaklar elenir!
          }"""

    if target_kalkan in content:
        content = content.replace(target_kalkan, replacement_kalkan)
        print("Replaced Izolasyon Logic.")
    else:
        print("COULD NOT FIND target_kalkan")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Patch applied successfully.")

except Exception as e:
    print("Error:", e)
