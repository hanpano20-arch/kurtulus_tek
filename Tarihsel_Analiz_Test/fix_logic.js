const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix inFinalPool
if (content.includes('currentSonuc.puanlar.k13') && !content.includes('currentSonuc.puanlar.k14[n]')) {
    content = content.replace(/\(currentSonuc\.puanlar\.k13 \? \(currentSonuc\.puanlar\.k13\[n\] \|\| 0\) : 0\) \+\s*\(manualScores\[n\] \|\| 0\)/,
        `(currentSonuc.puanlar.k13 ? (currentSonuc.puanlar.k13[n] || 0) : 0) +
                    (currentSonuc.puanlar.k14 ? (currentSonuc.puanlar.k14[n] || 0) : 0) +
                    (currentSonuc.puanlar.k15 ? (currentSonuc.puanlar.k15[n] || 0) : 0) +
                    (manualScores[n] || 0)`);
    console.log("Fixed inFinalPool");
}

// 2. Fix testCalistir ayarlar
const k14_k15_ayarlar = `\n                K14_TABAN: baseSettings.K14_TABAN,
                K15_TABAN: baseSettings.K15_TABAN,
                K15_SON_X: baseSettings.K15_SON_X,
                K14_CARPAN: getCarpan('k14'),
                K15_CARPAN: getCarpan('k15')`;

const k13_carpan_regex1 = /K13_CARPAN: getCarpan\('k13'\)\s*\};\s*currentSonuc = motorAtesle/g;
if (k13_carpan_regex1.test(content)) {
    content = content.replace(/K13_CARPAN: getCarpan\('k13'\)\s*\};/,
        `K13_CARPAN: getCarpan('k13'),${k14_k15_ayarlar}\n            };`);
    console.log("Fixed testCalistir ayarlar");
}

// 3. Fix akilliHavuzOlustur ayarlar (line 2376)
const k13_carpan_regex2 = /K13_CARPAN: getCarpan\('k13'\)\s*\};\s*\/\/\s*Zaman Makinesini altr/g;
const k13_carpan_regex2_fallback = /K13_CARPAN: getCarpan\('k13'\)\s*\};\s*\/\/\s*Zaman Makinesini/g;

if (k13_carpan_regex2_fallback.test(content)) {
    content = content.replace(/K13_CARPAN: getCarpan\('k13'\)\s*\};\s*(\/\/\s*Zaman Makinesini)/g,
        `K13_CARPAN: getCarpan('k13'),${k14_k15_ayarlar}\n            };\n\n            $1`);
    console.log("Fixed akilliHavuzOlustur ayarlar");
}


fs.writeFileSync(file, content);
console.log('Done fixes!');
