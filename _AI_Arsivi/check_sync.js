const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

// I will look for Son 10 Taban Puanı in extractDetailsForUI
if (!content.includes('taban_puan = this.config.PUAN_SON_10_TABAN') && !content.includes('taban_puan = config.PUAN_SON_10_TABAN')) {
    console.log("Taban puani is NOT completely synced.");
}
