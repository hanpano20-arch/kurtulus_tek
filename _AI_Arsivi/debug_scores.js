const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

setTimeout(() => {
    try {
        const hm = window.HavuzMotoru;
        const rawDraws = hm.getRawData();
        const testCount = 15;
        const i = 0; // We test at index 0
        let gercek_cekilis_df = rawDraws.slice(i + 1).map(d => d.nums);
        let gercek_joks = rawDraws.slice(i + 1).map(d => d.joker || null);
        
        hm.updateConfigFromUI(); // Default configs
        
        // I need to intercept the scoring to see the breakdown.
        // Let's monkey-patch hm.puanlari_hesapla to just print the variables for 70 and 15
        const orig = hm.puanlari_hesapla.toString();
        
        let modified = orig.replace('puanlar[i] += Math.floor(gecmis_puani + yakin_puani);', 
        `
        puanlar[i] += Math.floor(gecmis_puani + yakin_puani);
        if ([15, 20, 22, 70].includes(i)) {
             console.log("NUM:", i);
             console.log("  Gecmis Puan:", gecmis_puani);
             console.log("  Yakin Puan:", yakin_puani);
             console.log("  Frekanslar:", f15, f10, f5, f3);
             console.log("  Kuraklik:", kuraklik_haftasi);
        }
        `);
        
        modified = modified.replace('puanlar[komsu] += Math.floor((this.config.PUAN_1_HALKA_KOMSU || 50) * carpan);',
        `
        let puan = Math.floor((this.config.PUAN_1_HALKA_KOMSU || 50) * carpan);
        if ([15, 20, 22, 70].includes(komsu)) {
            console.log("  1. HALKA KOMSU BONUS:", komsu, puan);
        }
        puanlar[komsu] += puan;
        `);
        
        modified = modified.replace('puanlar[komsu] += Math.floor((this.config.PUAN_2_HALKA_KOMSU || 20) * carpan);',
        `
        let puan2 = Math.floor((this.config.PUAN_2_HALKA_KOMSU || 20) * carpan);
        if ([15, 20, 22, 70].includes(komsu)) {
            console.log("  2. HALKA KOMSU BONUS:", komsu, puan2);
        }
        puanlar[komsu] += puan2;
        `);
        
        eval("hm.puanlari_hesapla = " + modified);
        
        let puanlar = hm.puanlari_hesapla(gercek_cekilis_df, 90, gercek_joks);
        console.log("FINAL SCORES:");
        console.log("70:", puanlar[70]);
        console.log("20:", puanlar[20]);
        console.log("22:", puanlar[22]);
        console.log("15:", puanlar[15]);
        
    } catch(e) {
        console.error(e);
    }
}, 1000);
