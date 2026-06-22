const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let start = content.indexOf('puanlari_hesapla: function');
if (start !== -1) {
    let end = content.indexOf('akilli_secim: function', start);
    console.log("----- PUAN LOGIC -----");
    console.log(content.substring(start, end > -1 ? end : start + 5000));
} else {
    console.log("NOT FOUND puanlari_hesapla");
}

let komsu_start = content.indexOf('komsu_katsayilarini_hesapla: function');
if (komsu_start !== -1) {
    let end = content.indexOf('puanlari_hesapla: function', komsu_start);
    console.log("----- KOMSU LOGIC -----");
    console.log(content.substring(komsu_start, end > -1 ? end : komsu_start + 3000));
}
