const fs = require('fs');
const vm = require('vm');

let veriCode = fs.readFileSync('d:\\GitHub\\kurtulus_tek\\Tarihsel_Analiz_Test\\veri.js', 'utf8');
veriCode = veriCode.replace(/let global/g, 'var global');
let motorCode = fs.readFileSync('d:\\GitHub\\kurtulus_tek\\Tarihsel_Analiz_Test\\test_motor_v3.js', 'utf8');
motorCode = motorCode.replace(/function motorAtesle/g, 'var motorAtesle = function motorAtesle');

let ayarlar = {
    K8_UYKU_SINIRI: 50, K8_ADIM_CEZASI: 5,
    K9_SINIR: 50, K10_SINIR: 50, K11_SINIR: 50, K12_SINIR: 50,
    K13_ESIK_1: 15, K13_ESIK_2: 30, K13_UYKU_SINIRI: 50,
    K16_PENCERE: 10, K17_DERINLIK: 15, K18_PENCERE: 15, K19_PENCERE: 15,
    K15_SON_X: 15
};
for(let i=1; i<=21; i++) {
    ayarlar['K'+i+'_TABAN'] = 10;
    ayarlar['K'+i+'_CARPAN'] = 100; // MUST BE 100 FOR 100%
}

const context = { console: console };
vm.createContext(context);
vm.runInContext(veriCode, context);
vm.runInContext(motorCode, context);

let globalCekilisler = context.globalCekilisler;
let globalJokerler = context.globalJokerler;
let motorAtesle = context.motorAtesle;

let kazananJokerler = [];
let kaybedenJokerler = [];

for (let i = 0; i < 50; i++) {
    let hedefCekilisler = globalCekilisler.slice(i + 1);
    let hedefJokerler = globalJokerler.slice(i + 1);
    if (hedefCekilisler.length < 50) break;
    
    let gercekSayilar = globalCekilisler[i]; 
    let jokerSayi = globalJokerler[i];
    
    let motorSonucu = motorAtesle(hedefCekilisler, hedefJokerler, ayarlar);
    
    let toplamPuanlar = {};
    for (let num = 1; num <= 90; num++) {
        let toplam = 0;
        for (let k = 1; k <= 21; k++) {
            let pts = motorSonucu.puanlar['k'+k];
            if(pts && pts[num]) toplam += pts[num];
        }
        toplamPuanlar[num] = toplam;
    }

    let sorted = Object.keys(toplamPuanlar)
        .map(n => ({ num: parseInt(n), pts: toplamPuanlar[n] }))
        .sort((a, b) => b.pts - a.pts);
    let top30 = sorted.slice(0, 30).map(x => x.num);
    
    let son15Jokerler = hedefJokerler.slice(0, 15);
    
    for (let num of top30) {
        if (son15Jokerler.includes(num)) {
            let profile = {
                num: num,
                cekilisIndex: i,
                k1: motorSonucu.puanlar.k1[num] || 0,
                k2: motorSonucu.puanlar.k2[num] || 0,
                k3: motorSonucu.puanlar.k3[num] || 0,
                k4: motorSonucu.puanlar.k4[num] || 0,
                k5: motorSonucu.puanlar.k5[num] || 0,
                k6: motorSonucu.puanlar.k6[num] || 0,
                k7: motorSonucu.puanlar.k7[num] || 0,
                k8: motorSonucu.puanlar.k8 ? motorSonucu.puanlar.k8[num] || 0 : 0,
                k9: motorSonucu.puanlar.k9 ? motorSonucu.puanlar.k9[num] || 0 : 0,
                k10: motorSonucu.puanlar.k10 ? motorSonucu.puanlar.k10[num] || 0 : 0,
                k11: motorSonucu.puanlar.k11 ? motorSonucu.puanlar.k11[num] || 0 : 0,
                k12: motorSonucu.puanlar.k12 ? motorSonucu.puanlar.k12[num] || 0 : 0,
                k13: motorSonucu.puanlar.k13 ? motorSonucu.puanlar.k13[num] || 0 : 0,
                k14: motorSonucu.puanlar.k14 ? motorSonucu.puanlar.k14[num] || 0 : 0,
                k15: motorSonucu.puanlar.k15 ? motorSonucu.puanlar.k15[num] || 0 : 0,
                k16: motorSonucu.puanlar.k16 ? motorSonucu.puanlar.k16[num] || 0 : 0,
                k17: motorSonucu.puanlar.k17 ? motorSonucu.puanlar.k17[num] || 0 : 0,
                k18: motorSonucu.puanlar.k18 ? motorSonucu.puanlar.k18[num] || 0 : 0,
                k19: motorSonucu.puanlar.k19 ? motorSonucu.puanlar.k19[num] || 0 : 0,
                k20: motorSonucu.puanlar.k20 ? motorSonucu.puanlar.k20[num] || 0 : 0,
                k21: motorSonucu.puanlar.k21 ? motorSonucu.puanlar.k21[num] || 0 : 0,
                uyku: motorSonucu.uykuSureleri ? motorSonucu.uykuSureleri[num] || 0 : 0
            };
            
            if (gercekSayilar.includes(num) || jokerSayi === num) {
                kazananJokerler.push(profile);
            } else {
                kaybedenJokerler.push(profile);
            }
        }
    }
}

let avg = (arr, key) => arr.length ? arr.reduce((s, j) => s + j[key], 0) / arr.length : 0;
let keys = ['k1','k2','k3','k4','k5','k6','k7','k8','k9','k10','k11','k12','k13','k14','k15','k16','k17','k18','k19','k20','k21','uyku'];

let report = '# Joker Havuz Röntgen Analiz Raporu\n\n';
report += `Toplam Havuza Giren Joker (50 Test): ${kazananJokerler.length + kaybedenJokerler.length}\n`;
report += `**KAZANAN (Gerçekten Çıkan) Havuz Jokerleri:** ${kazananJokerler.length}\n`;
report += `**KAYBEDEN (Boşa Havuzu Meşgul Edenler):** ${kaybedenJokerler.length}\n\n`;

report += '## Ortalama Karşılaştırması (Kazanan Joker ile Kaybeden Joker Arasındaki Karakter Farkı)\n\n';
report += '| Kural | Kazanan Ort. | Kaybeden Ort. | Fark |\n';
report += '|---|---|---|---|\n';
for(let k of keys) {
    let winAvg = avg(kazananJokerler, k);
    let loseAvg = avg(kaybedenJokerler, k);
    let diff = winAvg - loseAvg;
    let isSignificant = Math.abs(diff) >= Math.abs(winAvg * 0.1) && Math.abs(diff) >= 0.5;
    report += `| **${k.toUpperCase()}** | ${winAvg.toFixed(2)} | ${loseAvg.toFixed(2)} | ${isSignificant ? '**' : ''}${diff.toFixed(2)}${isSignificant ? '**' : ''} |\n`;
}

fs.writeFileSync('C:\\\\Users\\\\Lenovo\\\\.gemini\\\\antigravity-ide\\\\brain\\\\810323f8-69ed-4832-ae46-12cfe5f03d7d\\\\joker_rontgeni.md', report);
console.log('Rapor hazirlandi.');
