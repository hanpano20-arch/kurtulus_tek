const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Toggles CSS
let css = `
        .rule-toggle-btn {
            width: 50px;
            padding: 2px 4px;
            border: 1px solid #4caf50;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
            margin-right: 10px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            background: #4caf50;
            color: white;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
            flex-shrink: 0;
        }
        .rule-toggle-btn.inactive {
            background: #f44336;
            border-color: #f44336;
            box-shadow: 0 0 5px rgba(244, 67, 54, 0.5);
        }
`;
if (!content.includes('.rule-toggle-btn {')) {
    content = content.replace('.slider-val-box {', css + '        .slider-val-box {');
}

// 2. Add toggleRule and getCarpan JS
let js = `
        function toggleRule(kId) {
            let btn = document.getElementById(kId + '_toggle');
            if (btn.classList.contains('inactive')) {
                btn.classList.remove('inactive');
                btn.innerText = 'AÇIK';
            } else {
                btn.classList.add('inactive');
                btn.innerText = 'KAPALI';
            }
            if (typeof testCalistir === 'function') testCalistir();
        }

        function getCarpan(kId) {
            let toggle = document.getElementById(kId + '_toggle');
            if (toggle && toggle.classList.contains('inactive')) return 0;
            let weight = document.getElementById(kId + '_weight');
            return weight ? parseInt(weight.value, 10) : 100;
        }
`;
if (!content.includes('function toggleRule(kId)')) {
    content = content.replace('function syncSlider(sliderId, valId) {', js + '        function syncSlider(sliderId, valId) {');
}

// 3. Add toggle buttons
if (!content.includes('id="k1_toggle"')) {
    content = content.replace(/<input type="number" class="slider-val-box manual-ctrl-ignore" id="(k[0-9]+)_val"/g, 
        '<button class="rule-toggle-btn manual-ctrl-ignore" id="$1_toggle" onclick="toggleRule(\'$1\')">AÇIK</button>\n                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="$1_val"');
}

// 4. Update testCalistir to use getCarpan
content = content.replace(/K([0-9]+)_CARPAN:\s*parseInt\(document\.getElementById\('k[0-9]+_weight'\)\s*\?\s*document\.getElementById\('k[0-9]+_weight'\)\.value\s*:\s*100,\s*10\)/g, 'K$1_CARPAN: getCarpan(\'k$1\')');
content = content.replace(/K([0-9]+)_CARPAN:\s*parseInt\(document\.getElementById\('k[0-9]+_weight'\)\.value,\s*10\)/g, 'K$1_CARPAN: getCarpan(\'k$1\')');

// 5. Replace settings header
const targetHeader = `<div class="modal-header">
                <h3>⚙️ Kuralların Taban Puanları</h3>
                <button type="button" class="close-btn" onclick="closeSettings(event)">&times;</button>
            </div>`;

const newHeader = `<div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px;">
                <h3 style="font-size: 1.5em; margin: 0;">⚙️ Kuralların Taban Puanları</h3>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn" onclick="closeSettings(event)" style="background: #f44336; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">SAYFAYI KAPAT</button>
                    <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)" style="background: #00bcd4; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">AYARLARI KAYDET</button>
                </div>
            </div>`;
content = content.replace(targetHeader, newHeader);

// 6. Remove bottom save button
const targetFooter = `<div style="text-align: right; margin-top: 15px;">
                <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)">AYARLARI KAYDET</button>
            </div>`;
content = content.replace(targetFooter, "<!-- Butonlar yukarı taşındı -->");

fs.writeFileSync(file, content);
console.log('Fixed everything');
