import re
import sys

file_path = r'D:\GitHub\kurtulus_tek\v8_havuz_motoru.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix updateConfigFromUI
new_updateConfigFromUI = """      updateConfigFromUI: function () {
        try {
            const b = localStorage.getItem('hm_base_config');
            if (b) {
                const parsed = JSON.parse(b);
                for(let k in parsed) {
                    this.base_config[k] = parsed[k];
                }
            }
            const m = localStorage.getItem('hm_mult_config');
            if (m) {
                const parsed = JSON.parse(m);
                for(let k in parsed) {
                    this.mult_config[k] = parseFloat(parsed[k]);
                }
            }
        } catch(e) {}

        // Initialize config from base_config
        for(let k in this.base_config) {
            this.config[k] = this.base_config[k];
        }

        // Apply slider overrides from mult_config directly
        for(let k in this.mult_config) {
            if (!isNaN(this.mult_config[k])) {
                if (k.endsWith('_PUAN') || k.endsWith('_SINIRI')) {
                    this.config[k] = this.mult_config[k];
                }
            }
        }
      },"""

text = re.sub(
    r'updateConfigFromUI:\s*function\s*\(\)\s*\{.*?(?=base_config: \{)',
    new_updateConfigFromUI + '\n      ',
    text,
    flags=re.DOTALL
)

# Fix NaN in carpan
text = text.replace(
    "let t_carpan = this.mult_config['TARIHSEL_CARPAN'] !== undefined ? this.mult_config['TARIHSEL_CARPAN'] : 1.0;",
    "let t_carpan = (this.mult_config['TARIHSEL_CARPAN'] !== undefined && !isNaN(this.mult_config['TARIHSEL_CARPAN'])) ? this.mult_config['TARIHSEL_CARPAN'] : 1.0;"
)
text = text.replace(
    "let g_carpan = this.mult_config['GUNCEL_CARPAN'] !== undefined ? this.mult_config['GUNCEL_CARPAN'] : 1.0;",
    "let g_carpan = (this.mult_config['GUNCEL_CARPAN'] !== undefined && !isNaN(this.mult_config['GUNCEL_CARPAN'])) ? this.mult_config['GUNCEL_CARPAN'] : 1.0;"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("v8_havuz_motoru.js config logic fixed!")

# Now fix HTML slider labels
html_path = r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace labels directly based on the IDs
label_replacements = {
    'wlb-hm_tarihsel': 'Tarihsel Çarpan',
    'wlb-hm_guncel': 'Güncel Çarpan',
    'wlb-hm_komsu': 'K6-2.Halka Puanı',
    'wlb-hm_komsu2': 'K7-Onluk Blok Puanı',
    'wlb-hm_kurak': 'K4-Joker Puanı',
    'wlb-hm_joker': 'K5-1.Halka Puanı',
    'wlb-hm_onluk': 'K8-Bölge Geçiş Puanı',
    'wlb-hm_ivme': 'K9-Kinetik İvme Puanı',
    'wlb-hm_gecik': 'K10-Gecikmeli Tekrar Puanı',
    'wlb-hm_olu': 'K12-Tam Isınma Puanı',
    'wlb-hm_kurak_sinir': 'K18-Ölüm Cezası Sınırı',
    'wlb-hm_cifte': 'K13-Aşırı Isınma Cezası',
    'wlb-hm_c4': 'K14-Çifte Tekrar Cezası (4)',
    'wlb-hm_c8': 'K14-Çifte Tekrar Cezası (8)',
    'wlb-hm_c12': 'K14-Çifte Tekrar Cezası (12)',
    'wlb-hm_c16': 'K14-Çifte Tekrar Cezası (16)',
    'wlb-hm_izolasyon': 'K16-İzolasyon Cezası'
}

for id_str, new_label in label_replacements.items():
    html = re.sub(
        f'<label id="{id_str}"[^>]*>.*?</label>',
        f'<label id="{id_str}" style="font-size:16px; font-weight:600; color:#c9d1d9;">{new_label}</label>',
        html
    )

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("PROMPT_BUILDER_v8_1.html slider labels fixed!")
