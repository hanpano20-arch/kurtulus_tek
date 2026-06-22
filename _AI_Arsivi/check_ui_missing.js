const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

function check(rule) {
    let parts = content.split('extractDetailsForUI:');
    if (parts.length > 1 && parts[1].includes(rule)) {
        console.log("FOUND in UI: " + rule);
    } else {
        console.log("MISSING in UI: " + rule);
    }
}

check('PUAN_ARDISIK_CEKIM');
check('PUAN_KUYRUK_KURAKLIGI');
check('PUAN_SARKAC_DENGESI');
check('PUAN_SON_10_TABAN');
check('CEZA_DUSUK_FREKANS');
check('CEZA_TEKRAR_ETMEYEN_SICAK');
check('PUAN_BOLGE_GECISI');
check('Bölge Boşluk Bonusu');
