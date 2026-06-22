import sys
import re

file_path = r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Tarihsel/Güncel ratio section with two independent sliders
old_ratio = """          <div style="font-size:11px;font-weight:700;margin-bottom:6px;color:var(--color-accent,#53f0db)">⚖️ Tarihsel /
            Güncel Oran (Toplam: 100%)</div>
          <div class="h-ratio-row">
            <label style="width:130px;font-size:11px">📚 Tarihsel</label>
            <button class="h-arrow" onclick="H.adjSlider('hm_hist',-5)">◀</button>
            <input type="range" oninput="window.updateTip(this)" onmousedown="window.showTip(this)"
              onmouseup="window.hideTip()" onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)"
              ontouchend="window.hideTip()" id="ws-hm_hist" min="10" max="90" step="5" value="35"
              oninput="H.sliderSync('hm_hist',this.value)">
            <button class="h-arrow" onclick="H.adjSlider('hm_hist',5)">▶</button>
            <span class="h-ratio-val"><span id="wv-hm_hist">35</span>%</span>
          </div>
          <div class="h-ratio-row" style="margin-top:4px">
            <label style="width:130px;font-size:11px">🔥 Güncel</label>
            <div style="flex:1;text-align:center;font-size:11px;color:var(--color-text-secondary)">otomatik</div>
            <span class="h-ratio-val"><span id="wv-hm_rec">60</span>%</span>
          </div>"""

new_ratio = """          <div style="font-size:11px;font-weight:700;margin-bottom:6px;color:var(--color-accent,#53f0db)">⚖️ Ana Çarpanlar</div>
          <div class="h-w-row" style="margin-bottom: 4px;">
            <label style="width:130px;font-size:11px">📚 Tarihsel (×<span id="wlb-hm_tarihsel">1.0</span>)</label>
            <button class="h-arrow" onclick="H.adjSlider('hm_tarihsel',-0.1)">◀</button>
            <input type="range" oninput="window.updateTip(this)" onmousedown="window.showTip(this)"
              onmouseup="window.hideTip()" onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)"
              ontouchend="window.hideTip()" id="ws-hm_tarihsel" min="0" max="10" step="0.1" value="1.0"
              oninput="H.sliderSync('hm_tarihsel',this.value)">
            <button class="h-arrow" onclick="H.adjSlider('hm_tarihsel',0.1)">▶</button>
            <span class="h-w-val" id="wv-hm_tarihsel">1.0</span>
          </div>
          <div class="h-w-row" style="margin-bottom: 4px;">
            <label style="width:130px;font-size:11px">🔥 Güncel (×<span id="wlb-hm_guncel">1.0</span>)</label>
            <button class="h-arrow" onclick="H.adjSlider('hm_guncel',-0.1)">◀</button>
            <input type="range" oninput="window.updateTip(this)" onmousedown="window.showTip(this)"
              onmouseup="window.hideTip()" onmouseleave="window.hideTip()" ontouchstart="window.showTip(this)"
              ontouchend="window.hideTip()" id="ws-hm_guncel" min="0" max="10" step="0.1" value="1.0"
              oninput="H.sliderSync('hm_guncel',this.value)">
            <button class="h-arrow" onclick="H.adjSlider('hm_guncel',0.1)">▶</button>
            <span class="h-w-val" id="wv-hm_guncel">1.0</span>
          </div>"""

if old_ratio in content:
    content = content.replace(old_ratio, new_ratio)
    print("Replaced ratio successfully.")
else:
    print("Could not find old_ratio")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("PROMPT_BUILDER_v8_1.html updated successfully.")
