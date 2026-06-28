const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add definitions in showSayiListesiModal around line 2039 and 2128
content = content.replace(/let p13 = currentSonuc\.puanlar\.k13 \? \(currentSonuc\.puanlar\.k13\[num\] \|\| 0\) : 0;/g, 
    `let p13 = currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[num] || 0) : 0;\n                let p14 = currentSonuc.puanlar.k14 ? (currentSonuc.puanlar.k14[num] || 0) : 0;\n                let p15 = currentSonuc.puanlar.k15 ? (currentSonuc.puanlar.k15[num] || 0) : 0;`);

content = content.replace(/let p13 = currentSonuc\.puanlar\.k13 \? \(currentSonuc\.puanlar\.k13\[item\.num\] \|\| 0\) : 0;/g, 
    `let p13 = currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[item.num] || 0) : 0;\n                let p14 = currentSonuc.puanlar.k14 ? (currentSonuc.puanlar.k14[item.num] || 0) : 0;\n                let p15 = currentSonuc.puanlar.k15 ? (currentSonuc.puanlar.k15[item.num] || 0) : 0;`);

// 2. Add td columns for p14 and p15 around line 2153
content = content.replace(/<td style="color:\$\{p13 > 0 \? '#00bcd4' : '#888'\}; font-weight:bold;">\$\{p13\}<\/td>/g, 
    `<td style="color:\${p13 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">\${p13}</td>\n                <td style="color:\${p14 !== 0 ? '#f44336' : '#888'}; font-weight:bold;">\${p14}</td>\n                <td style="color:\${p15 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">\${p15}</td>`);

fs.writeFileSync(file, content);
console.log('Fixed second table columns!');
