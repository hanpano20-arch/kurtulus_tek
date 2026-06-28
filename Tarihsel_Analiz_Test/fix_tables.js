const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix slider HTML to match card style
const badSliderStyleRegex = /<div class="setting-row">\s*<span class="setting-label">K14 Çarpanı <br><span/g;
if (badSliderStyleRegex.test(content)) {
    content = content.replace(/<div class="setting-row">\s*<span class="setting-label">K14 Çarpanı <br><span/g, `<div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K14 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 3 Eleme)</div>
                    </div><span style="display:none">`);
    content = content.replace(/<div class="setting-row">\s*<span class="setting-label">K15 Çarpanı <br><span/g, `<div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K15 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 10 Yankı)</div>
                    </div><span style="display:none">`);
    console.log('Fixed slider styles');
}

// 2. Add variable definitions in renderTable
if (!content.includes('let p14 = sonuc.puanlar.k14')) {
    content = content.replace(/let p13 = sonuc\.puanlar\.k13 \? \(sonuc\.puanlar\.k13\[i\] \|\| 0\) : 0;/g, 
        `let p13 = sonuc.puanlar.k13 ? (sonuc.puanlar.k13[i] || 0) : 0;\n                let p14 = sonuc.puanlar.k14 ? (sonuc.puanlar.k14[i] || 0) : 0;\n                let p15 = sonuc.puanlar.k15 ? (sonuc.puanlar.k15[i] || 0) : 0;`);
    console.log('Added p14 and p15 variables');
}

// 3. Add to toplam
if (!content.includes('p14 + p15 + man;')) {
    content = content.replace(/let toplam = p1 \+ p2 \+ p3 \+ p4 \+ p5 \+ p6 \+ p7 \+ p8 \+ p9 \+ p10 \+ p11 \+ p12 \+ p13 \+ man;/g, 
        `let toplam = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13 + p14 + p15 + man;`);
    content = content.replace(/tp: p1 \+ p2 \+ p3 \+ p4 \+ p5 \+ p6 \+ p7 \+ p8 \+ p9 \+ p10 \+ p11 \+ p12 \+ p13 \+ man/g, 
        `tp: p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 + p10 + p11 + p12 + p13 + p14 + p15 + man`);
    console.log('Added to toplam calculations');
}

// 4. Add to siralama.push
if (!content.includes('p14, p15, uyku, man, toplam')) {
    content = content.replace(/p12, p13, uyku, man, toplam \}\);/g, 
        `p12, p13, p14, p15, uyku, man, toplam });`);
    console.log('Added to siralama.push');
}

// 5. Add to table rows (Detaylı Puan Tablosu)
if (!content.includes('<td style="color:${item.p14')) {
    content = content.replace(/<td style="color:\$\{item\.p13 > 0 \? '#00bcd4' : '#888'\}; font-weight:bold;">\$\{item\.p13\}<\/td>/g, 
        `<td style="color:\${item.p13 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">\${item.p13}</td>\n                                <td style="color:\${item.p14 !== 0 ? '#f44336' : '#888'}; font-weight:bold;">\${item.p14}</td>\n                                <td style="color:\${item.p15 > 0 ? '#00bcd4' : '#888'}; font-weight:bold;">\${item.p15}</td>`);
    console.log('Added to table rows');
}

// 6. Add headers for both tables
if (!content.includes('K14 (Eleme)')) {
    const h13_1 = `<th class="clickable-th" style="padding: 4px; font-size: 0.85em; color:#00bcd4;" onclick="showKInfo('k13')" title="Bilgi için tıkla">K13 (Diriltme)</th>`;
    const h14_15_1 = `\n                                <th class="clickable-th" style="padding: 4px; font-size: 0.85em; color:#f44336;" onclick="showKInfo('k14')" title="Bilgi için tıkla">K14 (Eleme)</th>
                                <th class="clickable-th" style="padding: 4px; font-size: 0.85em; color:#00bcd4;" onclick="showKInfo('k15')" title="Bilgi için tıkla">K15 (Yankı)</th>`;
    content = content.replace(h13_1, h13_1 + h14_15_1);

    const h13_2 = `<th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#00bcd4;" onclick="showKInfo('k13')" title="Bilgi için tıkla">K13 (Diriltme)</th>`;
    const h14_15_2 = `\n                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#f44336;" onclick="showKInfo('k14')" title="Bilgi için tıkla">K14 (Eleme)</th>
                    <th class="clickable-th" style="padding: 4px; font-size: 0.85em; writing-mode: vertical-rl; transform: rotate(180deg); color:#00bcd4;" onclick="showKInfo('k15')" title="Bilgi için tıkla">K15 (Yankı)</th>`;
    content = content.replace(h13_2, h13_2 + h14_15_2);

    console.log('Added table headers');
}

fs.writeFileSync(file, content);
console.log('Done!');
