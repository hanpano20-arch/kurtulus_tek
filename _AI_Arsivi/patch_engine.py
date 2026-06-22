import sys
import re

file_path = r'D:\GitHub\kurtulus_tek\v8_hist_engine.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace hm_details assignment
text = text.replace(
    '_sc[i] = { n: i, final: baseScore + mVal, base: baseScore, hm_details: {} };',
    '_sc[i] = { n: i, final: baseScore + mVal, base: baseScore, hm_details: hm_sc.__details ? hm_sc.__details[i] : {} };'
)

# Replace extractDetailsForUI usage
text = text.replace(
    'let details = window.HavuzMotoru.extractDetailsForUI(x.n, draws, joks);',
    'let details = _sc[x.n] ? _sc[x.n].hm_details : {};'
)

# Replace details.historical to details.tarihsel
text = text.replace('fmt(details.historical)', 'fmt(details.tarihsel)')
text = text.replace('fmt(details.recent)', 'fmt(details.guncel)')

# Fix the H.sliderSync to trigger an immediate update
slider_sync_old = """H.sliderSync = function (id) {
        if (!window.HavuzMotoru) return;
        const configMapping = {
            'hm_komsu': 'K6_PUAN',
            'hm_komsu2': 'K7_PUAN',
            'hm_kurak': 'K4_PUAN',
            'hm_joker': 'K5_PUAN',
            'hm_onluk': 'K8_PUAN',
            'hm_ivme': 'K9_PUAN',
            'hm_gecik': 'K10_PUAN',
            'hm_olu': 'K12_PUAN',
            'hm_kurak_sinir': 'OLUM_CEZASI_SINIRI',
            'hm_cifte': 'K13_PUAN',
            'hm_c4': 'K14_PUAN_4',
            'hm_c8': 'K14_PUAN_8',
            'hm_c12': 'K14_PUAN_12',
            'hm_c16': 'K14_PUAN_16',
            'hm_izolasyon': 'K16_PUAN',
            'hm_tarihsel': 'TARIHSEL_CARPAN',
            'hm_guncel': 'GUNCEL_CARPAN'
        };

        const configKey = configMapping[id];
        if (configKey) {
            let el = document.getElementById('ws-' + id);
            let valLabel1 = document.getElementById('wv-' + id);
            let valLabel2 = document.getElementById('wlb-' + id);
            let value = parseFloat(el.value);
            
            if (valLabel1) valLabel1.textContent = value;
            if (valLabel2) valLabel2.textContent = value;

            window.HavuzMotoru.mult_config[configKey] = value;
            localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
            
            // Re-render table dynamically
            if (window._sc && Object.keys(window._sc).length > 0) {
                // If the user drags the slider, we want to update the scores immediately
                H.computeAll();
            }
        }
    };"""

slider_sync_new = """H.sliderSync = function (id) {
        if (!window.HavuzMotoru) return;
        const configMapping = {
            'hm_komsu': 'K6_PUAN',
            'hm_komsu2': 'K7_PUAN',
            'hm_kurak': 'K4_PUAN',
            'hm_joker': 'K5_PUAN',
            'hm_onluk': 'K8_PUAN',
            'hm_ivme': 'K9_PUAN',
            'hm_gecik': 'K10_PUAN',
            'hm_olu': 'K12_PUAN',
            'hm_kurak_sinir': 'OLUM_CEZASI_SINIRI',
            'hm_cifte': 'K13_PUAN',
            'hm_c4': 'K14_PUAN_4',
            'hm_c8': 'K14_PUAN_8',
            'hm_c12': 'K14_PUAN_12',
            'hm_c16': 'K14_PUAN_16',
            'hm_izolasyon': 'K16_PUAN',
            'hm_tarihsel': 'TARIHSEL_CARPAN',
            'hm_guncel': 'GUNCEL_CARPAN'
        };

        const configKey = configMapping[id];
        if (configKey) {
            let el = document.getElementById('ws-' + id);
            let valLabel1 = document.getElementById('wv-' + id);
            let valLabel2 = document.getElementById('wlb-' + id);
            let value = parseFloat(el.value);
            
            if (valLabel1) valLabel1.textContent = value;
            if (valLabel2) valLabel2.textContent = value;

            window.HavuzMotoru.mult_config[configKey] = value;
            localStorage.setItem('hm_mult_config', JSON.stringify(window.HavuzMotoru.mult_config));
            window.HavuzMotoru.updateConfigFromUI();
            
            // Re-render table dynamically without erasing ephemeral manual scores
            _sc = {};
            H.renderScore();
            H.renderList();
        }
    };"""

text = text.replace(slider_sync_old, slider_sync_new)
# In case the exact old string didn't match, let's do a regex replacement for sliderSync
import re
text = re.sub(
    r'H\.sliderSync\s*=\s*function\s*\([^)]*\)\s*\{.*?(?=H\.\w+\s*=)',
    slider_sync_new + '\n\n      ',
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("v8_hist_engine.js patched!")
