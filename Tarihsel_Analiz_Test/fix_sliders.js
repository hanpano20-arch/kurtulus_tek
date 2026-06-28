const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const k14_k15_html = `                <div class="setting-row">
                    <span class="setting-label">K14 Çarpanı <br><span
                            style="font-size: 0.85em; color: #bbb;">(Son 3 Eleme)</span></span>
                    <button class="rule-toggle-btn manual-ctrl-ignore" id="k14_toggle" onclick="toggleRule('k14')">AÇIK</button>
                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="k14_val" value="100"
                        onchange="syncInputToSlider('k14_val', 'k14_weight')">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k14_weight', -1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="range" id="k14_weight" class="slider-input manual-ctrl-ignore" min="-200" max="200"
                        step="1" value="100" oninput="syncSlider('k14_weight', 'k14_val')" onchange="testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k14_weight', 1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset manual-ctrl-ignore" onclick="resetSlider('k14_weight', 100)"
                        title="Sıfırla">↺</button>
                </div>

                <div class="setting-row">
                    <span class="setting-label">K15 Çarpanı <br><span
                            style="font-size: 0.85em; color: #bbb;">(Son 10 Yankı)</span></span>
                    <button class="rule-toggle-btn manual-ctrl-ignore" id="k15_toggle" onclick="toggleRule('k15')">AÇIK</button>
                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="k15_val" value="100"
                        onchange="syncInputToSlider('k15_val', 'k15_weight')">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k15_weight', -1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="range" id="k15_weight" class="slider-input manual-ctrl-ignore" min="-200" max="200"
                        step="1" value="100" oninput="syncSlider('k15_weight', 'k15_val')" onchange="testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k15_weight', 1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset manual-ctrl-ignore" onclick="resetSlider('k15_weight', 100)"
                        title="Sıfırla">↺</button>
                </div>`;

const targetRegex = /(<button class="btn-reset manual-ctrl-ignore" onclick="resetSlider\('k13_weight', 100\)"\s*title="Sıfırla">[^<]*<\/button>\s*<\/div>)/;

if (targetRegex.test(content) && !content.includes('id="k14_weight"')) {
    content = content.replace(targetRegex, '$1\n' + k14_k15_html);
    fs.writeFileSync(file, content);
    console.log("Injected K14 and K15 sliders successfully.");
} else {
    console.log("Target not found or already injected.");
}

