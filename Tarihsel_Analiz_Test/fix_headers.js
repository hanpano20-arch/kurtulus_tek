const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /(<th class="clickable-th" style="padding: 4px; font-size: 0\.85em; color:#00bcd4;" onclick="showKInfo\('k13'\)"[^>]*>[^<]*<\/th>)/;
const h14_15_1 = `\n                                <th class="clickable-th" style="padding: 4px; font-size: 0.85em; color:#f44336;" onclick="showKInfo('k14')" title="Bilgi i&#231;in t&#305;kla">K14 (Eleme)</th>
                                <th class="clickable-th" style="padding: 4px; font-size: 0.85em; color:#00bcd4;" onclick="showKInfo('k15')" title="Bilgi i&#231;in t&#305;kla">K15 (Yank&#305;)</th>`;

if (regex1.test(content) && !content.includes("K14 (Eleme)</th>")) {
    content = content.replace(regex1, '$1' + h14_15_1);
    console.log('Added table headers 1');
}

const regex2 = /(<th class="clickable-th" style="padding: 4px; font-size: 0\.85em; writing-mode: vertical-rl; transform: rotate\(180deg\); color:#00bcd4;" onclick="showKInfo\('k13'\)"[^>]*>[^<]*<\/th>)/;
const h14_15_2 = `\n                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#f44336;" onclick="showKInfo('k14')" title="Bilgi i&#231;in t&#305;kla">K14 (Eleme)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#00bcd4;" onclick="showKInfo('k15')" title="Bilgi i&#231;in t&#305;kla">K15 (Yank&#305;)</th>`;

if (regex2.test(content) && !content.includes("K15 (Yank&#305;)</th>")) {
    content = content.replace(regex2, '$1' + h14_15_2);
    console.log('Added table headers 2');
}

fs.writeFileSync(file, content);
console.log('Done Headers!');
