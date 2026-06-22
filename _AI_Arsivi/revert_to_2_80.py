import sys
import re

def patch_file(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()

    # 1. Revert sliders HTML to original state
    content = re.sub(b'<label>&#128201; Son 4 Cekiliste 3 Kere \\(<span id="wlb-hm_c4">', b'<label>\xf0\x9f\x93\x89 Son 4 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c4">', content)
    content = re.sub(b'<label>&#128201; Son 8 Cekiliste 4 Kere \\(<span id="wlb-hm_c8">', b'<label>\xf0\x9f\x93\x89 Son 8 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c8">', content)
    content = re.sub(b'<label>&#128201; Son 12 Cekiliste 5 Kere \\(<span id="wlb-hm_c12">', b'<label>\xf0\x9f\x93\x89 Son 12 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c12">', content)
    content = re.sub(b'<label>&#128201; Son 16 Cekiliste 6 Kere \\(<span id="wlb-hm_c16">', b'<label>\xf0\x9f\x93\x89 Son 16 \xc3\x87ekili\xc5\x9f Cezas\xc4\xb1 (<span id="wlb-hm_c16">', content)

    # 2. Revert Saturation Logic
    old_sat = b'''let count_4 = 0, count_8 = 0, count_12 = 0, count_16 = 0;

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
          
    new_sat = b'''let count_3 = 0, count_7 = 0, count_11 = 0, count_15 = 0;

          for (let c = 0; c < Math.min(15, df.length); c++) {
            let hit = (df[c] && Array.isArray(df[c]) && df[c].includes(i)) || (joks && joks[c] === i);
            if (hit) {
              if (c < 3) count_3++;
              if (c < 7) count_7++;
              if (c < 11) count_11++;
              if (c < 15) count_15++;
            }
          }

          let doygun = false;
          if (count_3 >= 2) {
            puanlar[i] += this.config.CEZA_DOYGUN_4;
            doygun = true;
          } else if (count_7 >= 3) {
            puanlar[i] += this.config.CEZA_DOYGUN_8;
            doygun = true;
          } else if (count_11 >= 4) {
            puanlar[i] += this.config.CEZA_DOYGUN_12;
            doygun = true;
          } else if (count_15 >= 5) {
            puanlar[i] += this.config.CEZA_DOYGUN_16;
            doygun = true;
          }

          if (f10 >= 2 && !doygun) {
            if (typeof window.tum_vip === 'undefined') { window.tum_vip = new Set(); }
            window.tum_vip.add(i);
          }'''
    content = content.replace(old_sat, new_sat)
    
    # Revert isolation logic count_16 to count_15
    content = content.replace(b'count_16 >= 3', b'count_15 >= 3')

    with open(filepath, 'wb') as f:
        f.write(content)
    print("Reverted doygunluk successfully!")

patch_file('PROMPT_BUILDER_v8_0.html')
