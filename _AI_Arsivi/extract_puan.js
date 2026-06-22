const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let start = content.indexOf('puanlari_hesapla: function');
if (start !== -1) {
    let end = content.indexOf('akilli_secim: function', start);
    console.log(content.substring(start, end > -1 ? end : start + 3000));
} else {
    console.log("NOT FOUND");
}
