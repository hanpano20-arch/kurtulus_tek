const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

let start = -1;
let end = -1;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('puanlari_hesapla: function')) {
        start = i;
    }
    if (start !== -1 && lines[i].includes('akilli_secim: function')) {
        end = i;
        break;
    }
}

if (start !== -1 && end !== -1) {
    fs.writeFileSync('extracted_puan_logic.js', lines.slice(start, end).join('\n'));
    console.log("Extracted to extracted_puan_logic.js");
}
