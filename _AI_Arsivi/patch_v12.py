import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target_slider = """        for (let i = 1; i <= maxN; i++) {
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

    replacement_slider = """        for (let i = 1; i <= maxN; i++) {
          // A. Tarihsel Puan (Dinamik Slider Değerine Göre)
          // Slider 0 ile 100 arasında bir değer veriyor (Tarihsel Ağırlığı). Güncel ağırlık 100 - bu değer.
          let w_hist = this.config.YUZDE_SON_15_DONEM || 20; 
          let w_rec = 100 - w_hist;                   
          
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
        print("COULD NOT FIND target_slider")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
