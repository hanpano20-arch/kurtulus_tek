const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add sliders to main screen
const k13_slider = `<div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K13 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Diriltme: Son 3)</div>
                    </div>
                    <button class="rule-toggle-btn manual-ctrl-ignore" id="k13_toggle" onclick="toggleRule('k13')">AÇIK</button>
                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="k13_val" min="-200" max="200" value="100"
                        onchange="syncInputToSlider('k13_val', 'k13_weight'); testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k13_weight', -1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="range" id="k13_weight" class="slider-input manual-ctrl-ignore" min="-200" max="200"
                        step="1" value="100" oninput="syncSlider('k13_weight', 'k13_val')" onchange="testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k13_weight', 1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset manual-ctrl-ignore" onclick="resetSlider('k13_weight', 100)"
                        title="Sıfırla">↺</button>
                </div>`;

const k14_k15_sliders = `                <div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K14 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 3 Eleme)</div>
                    </div>
                    <button class="rule-toggle-btn manual-ctrl-ignore" id="k14_toggle" onclick="toggleRule('k14')">AÇIK</button>
                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="k14_val" min="-200" max="200" value="100"
                        onchange="syncInputToSlider('k14_val', 'k14_weight'); testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k14_weight', -1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="range" id="k14_weight" class="slider-input manual-ctrl-ignore" min="-200" max="200"
                        step="1" value="100" oninput="syncSlider('k14_weight', 'k14_val')" onchange="testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k14_weight', 1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset manual-ctrl-ignore" onclick="resetSlider('k14_weight', 100)"
                        title="Sıfırla">↺</button>
                </div>

                <div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K15 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 10 Yankı)</div>
                    </div>
                    <button class="rule-toggle-btn manual-ctrl-ignore" id="k15_toggle" onclick="toggleRule('k15')">AÇIK</button>
                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="k15_val" min="-200" max="200" value="100"
                        onchange="syncInputToSlider('k15_val', 'k15_weight'); testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k15_weight', -1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                    <input type="range" id="k15_weight" class="slider-input manual-ctrl-ignore" min="-200" max="200"
                        step="1" value="100" oninput="syncSlider('k15_weight', 'k15_val')" onchange="testCalistir()">
                    <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSlider, 'k15_weight', 1)"
                        onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                    <button class="btn-reset manual-ctrl-ignore" onclick="resetSlider('k15_weight', 100)"
                        title="Sıfırla">↺</button>
                </div>`;

if (!content.includes('k14_weight')) {
    content = content.replace(k13_slider, k13_slider + '\n' + k14_k15_sliders);
    console.log("Added k14 and k15 sliders.");
}

// 2. DEFAULTS
if (!content.includes('K14_TABAN')) {
    content = content.replace(/K13_TABAN: 100, K13_ESIK_1: 2, K13_ESIK_2: 3, K13_UYKU_SINIRI: 10\r?\n\s*\};/,
        `K13_TABAN: 100, K13_ESIK_1: 2, K13_ESIK_2: 3, K13_UYKU_SINIRI: 10,
            K14_TABAN: 100,
            K15_TABAN: 100, K15_SON_X: 10
        };`);
    console.log("Updated DEFAULTS");
}

// 3. renderSettings
const k14_k15_settings_html = `
            // K14 Özel Satır
            html += \`
            <div class="setting-row" style="align-items: center;">
                <label style="min-width: 150px; flex-shrink: 0;">K14 (Eleme)</label>
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Taban:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K14_TABAN', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K14_TABAN" value="\${baseSettings.K14_TABAN || 100}" style="width: 60px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K14_TABAN', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K14_TABAN').value = 100; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                </div>
            </div>\`;

            // K15 Özel Satır
            html += \`
            <div class="setting-row" style="align-items: center;">
                <label style="min-width: 150px; flex-shrink: 0;">K15 (Son X Yankı)</label>
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Son X:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K15_SON_X', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K15_SON_X" value="\${baseSettings.K15_SON_X || 10}" style="width: 55px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K15_SON_X', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K15_SON_X').value = 10; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="font-size: 0.8em; color: #aaa;">Taban:</label>
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K15_TABAN', -1)" onmouseup="stopHold()" onmouseleave="stopHold()">◀</button>
                        <input type="number" id="input_K15_TABAN" value="\${baseSettings.K15_TABAN || 100}" style="width: 60px;" oninput="unsavedSettings = true;">
                        <button class="h-arrow manual-ctrl-ignore" onmousedown="startHold(adjSetting, 'K15_TABAN', 1)" onmouseup="stopHold()" onmouseleave="stopHold()">▶</button>
                        <button class="btn-reset" onclick="document.getElementById('input_K15_TABAN').value = 100; unsavedSettings = true;" title="Sıfırla">↺</button>
                    </div>
                </div>
            </div>\`;
`;

if (!content.includes('K14 (Eleme)')) {
    const renderTarget = `document.getElementById('settingsContainer').innerHTML = html;`;
    content = content.replace(renderTarget, k14_k15_settings_html + '\n            ' + renderTarget);
    console.log("Updated renderSettings");
}

// 4. Update payload in testCalistir (2 places)
if (!content.includes('K14_CARPAN:')) {
    content = content.replace(/K13_UYKU_SINIRI: baseSettings\.K13_UYKU_SINIRI\r?\n\s*\}/g, 
        `K13_UYKU_SINIRI: baseSettings.K13_UYKU_SINIRI,\n                K14_CARPAN: getCarpan('k14'),\n                K15_CARPAN: getCarpan('k15'),\n                K14_TABAN: baseSettings.K14_TABAN || 100,\n                K15_TABAN: baseSettings.K15_TABAN || 100,\n                K15_SON_X: baseSettings.K15_SON_X || 10\n            }`);
    console.log("Updated testCalistir payload");
}

// 5. Update headers of point table
if (!content.includes('<th style="width:40px;">K14')) {
    content = content.replace('<th style="width:40px;" title="Diriltme">K13<br><span style="font-size:0.7em;font-weight:normal">(Diriltme)</span></th>',
        `<th style="width:40px;" title="Diriltme">K13<br><span style="font-size:0.7em;font-weight:normal">(Diriltme)</span></th>
                            <th style="width:40px;" title="Eleme">K14<br><span style="font-size:0.7em;font-weight:normal">(Eleme)</span></th>
                            <th style="width:40px;" title="Yankı">K15<br><span style="font-size:0.7em;font-weight:normal">(Yankı)</span></th>`);
    console.log("Updated table header");
}

// 6. Update rows of point table
if (!content.includes('<td>${p.k14Puan || 0}</td>')) {
    content = content.replace(/<td>\$\{p\.k13Puan \|\| 0\}<\/td>\r?\n\s*<\/tr>/g,
        `<td>\${p.k13Puan || 0}</td>
                                <td>\${p.k14Puan || 0}</td>
                                <td>\${p.k15Puan || 0}</td>
                            </tr>`);
    console.log("Updated table rows");
}

fs.writeFileSync(file, content);
console.log("Done");
