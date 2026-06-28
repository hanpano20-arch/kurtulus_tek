const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const regex2 = /(<th[^>]*onclick="showKInfo\('k13'\)"[^>]*>[^<]*<\/th>)/g;
const matches = content.match(regex2);

if (matches && matches.length > 1) {
    const target = matches[1]; // The second one is the Sayı Listesi table
    const h14_15_2 = `\n                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#f44336;" onclick="showKInfo('k14')" title="Bilgi i&#231;in t&#305;kla">K14 (Eleme)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#00bcd4;" onclick="showKInfo('k15')" title="Bilgi i&#231;in t&#305;kla">K15 (Yank&#305;)</th>`;
    
    if (!content.includes('K14 (Eleme)</th>', content.indexOf(target))) {
        content = content.replace(target, target + h14_15_2);
        console.log('Added table headers 2');
        fs.writeFileSync(file, content);
    }
} else {
    console.log("Could not find second match");
}

