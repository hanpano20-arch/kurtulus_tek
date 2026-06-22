const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let idx = content.indexOf('// ANA PUANLAMA DÖNGÜSÜ');
if (idx !== -1) {
    console.log(content.substring(idx, idx + 2500));
} else {
    console.log('Not found!');
}
