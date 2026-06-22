import sys
import re

file_path = r'D:\GitHub\kurtulus_tek\v8_hist_engine.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_sync = """      H.sliderSync = function (k, v) {
        const s = $$('ws-' + k);
        if (s) {
          s.value = v;
          s.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };"""

new_sync = """      H.sliderSync = function (k, v) {
        const s = $$('ws-' + k);
        if (s) {
          s.value = v;
          let valLabel1 = document.getElementById('wv-' + k);
          let valLabel2 = document.getElementById('wlb-' + k);
          if (valLabel1) valLabel1.textContent = v;
          if (valLabel2) valLabel2.textContent = v;
        }

        if (window.HavuzMotoru) {
            const reverseMap = {
                'hm_komsu':'K6_PUAN', 'hm_komsu2':'K7_PUAN', 'hm_kurak':'K4_PUAN',
                'hm_joker':'K5_PUAN', 'hm_onluk':'K8_PUAN', 'hm_ivme':'K9_PUAN',
                'hm_gecik':'K10_PUAN', 'hm_olu':'K12_PUAN', 'hm_kurak_sinir':'OLUM_CEZASI_SINIRI',
                'hm_cifte':'K13_PUAN', 'hm_c4':'K14_PUAN_4', 'hm_c8':'K14_PUAN_8',
                'hm_c12':'K14_PUAN_12', 'hm_c16':'K14_PUAN_16', 'hm_izolasyon':'K16_PUAN',
                'hm_tarihsel':'TARIHSEL_CARPAN', 'hm_guncel':'GUNCEL_CARPAN'
            };
            let configKey = reverseMap[k];
            if (configKey) {
                window.HavuzMotoru.mult_config[configKey] = parseFloat(v);
                try {
                  localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
                } catch(e) {}
            }
        }
      };"""

if old_sync in content:
    content = content.replace(old_sync, new_sync)
    print("Replaced sliderSync successfully.")
else:
    print("old_sync not found.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
