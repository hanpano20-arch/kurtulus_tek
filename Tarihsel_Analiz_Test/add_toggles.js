const fs = require('fs');
let content = fs.readFileSync('Motor_Test_Paneli.html', 'utf8');

// Insert CSS
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
content = content.replace('.slider-val-box {', css + '        .slider-val-box {');

// Add toggleRule function
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
content = content.replace('function syncSlider(sliderId, inputId) {', js + '        function syncSlider(sliderId, inputId) {');

// Insert toggle buttons
content = content.replace(/<input type="number" class="slider-val-box manual-ctrl-ignore" id="(k[0-9]+)_val"/g, 
    '<button class="rule-toggle-btn manual-ctrl-ignore" id="$1_toggle" onclick="toggleRule(\'$1\')">AÇIK</button>\n                    <input type="number" class="slider-val-box manual-ctrl-ignore" id="$1_val"');

// Update ayarlar creation to use getCarpan in testCalistir
content = content.replace(/K([0-9]+)_CARPAN:\s*parseInt\(document\.getElementById\('k[0-9]+_weight'\)\s*\?\s*document\.getElementById\('k[0-9]+_weight'\)\.value\s*:\s*100,\s*10\)/g, 'K$1_CARPAN: getCarpan(\'k$1\')');
content = content.replace(/K([0-9]+)_CARPAN:\s*parseInt\(document\.getElementById\('k[0-9]+_weight'\)\.value,\s*10\)/g, 'K$1_CARPAN: getCarpan(\'k$1\')');

fs.writeFileSync('Motor_Test_Paneli.html', content);
console.log('Modified HTML');
