const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
let lines = content.split('\n');
let puanlari_hesapla_start = -1;
let puanlari_hesapla_end = -1;

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('puanlari_hesapla: function')) {
        puanlari_hesapla_start = i;
    }
    if (puanlari_hesapla_start !== -1 && lines[i].includes('akilli_secim: function')) {
        puanlari_hesapla_end = i;
        break;
    }
}

console.log("puanlari_hesapla_start:", puanlari_hesapla_start);
console.log("Signature:", lines[puanlari_hesapla_start]);

for(let i=puanlari_hesapla_start; i<=puanlari_hesapla_start + 5; i++) {
    console.log(i + ": " + lines[i]);
}

for(let i=puanlari_hesapla_start; i<puanlari_hesapla_end; i++) {
    if (lines[i].includes('komsu_katsayilarini_hesapla')) {
        console.log("Found komsu_katsayilarini_hesapla at line " + i);
    }
}
